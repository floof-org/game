import { getPetalIcon, petalTooltip } from "./renders.js";
import { state, sendChatMessage, onChatMessage, captureChatMessage } from "./net.js";
import { formatAmount } from "./inventory.js";
import { SERVER_BOUND } from "./protocol.js";

const TAU = Math.PI * 2;

const decay = (x) => 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

class FrameClock {
  constructor() {
    this.last = null;
    this.dtMs = 0;
    this.frames = 0;
    this.elapsed = 0;
  }
  tick(now) {
    if (this.last === null) this.last = now;
    this.dtMs = Math.min(Math.max(now - this.last, 0), 1000);
    this.last = now;
    this.frames = this.dtMs / 16;
    this.elapsed += this.dtMs;
  }
  pause() {
    this.last = null;
    this.dtMs = 0;
    this.frames = 0;
  }
  smooth(rate) {
    return 1 - decay(rate * this.frames);
  }
}

function approach(current, target, factor) {
  const diff = target - current;
  return Math.abs(diff) < 1e-4 ? target : current + diff * factor;
}

function updateAndPrune(list) {
  for (let i = list.length - 1; i >= 0; i--) {
    const anim = list[i];
    if (!anim.done) anim.update();
    if (anim.done) list.splice(i, 1);
  }
}

class PopInTween {
  constructor(el, clock, spinTurns = 1.5) {
    this.el = el;
    this.clock = clock;
    this.spinTurns = spinTurns;
    this.progress = 0;
    this.done = false;
    this.apply();
  }
  apply() {
    this.el.style.transform =
      'scale(' + this.progress + ') rotate(' + ((1 - this.progress) * TAU * -this.spinTurns) + 'rad)';
  }
  update() {
    this.progress = approach(this.progress, 1, this.clock.smooth(0.2));
    this.apply();
    if (this.progress === 1 || !this.el.isConnected) this.done = true;
  }
}

const cellKey = (petalIdx, rarIdx) => petalIdx + '|' + rarIdx;

function applyPop(el, p) {
  el.style.transform = 'scale(' + p + ') rotate(' + ((1 - p) * TAU * -1.5) + 'rad)';
}

class CraftInventoryGrid {
  constructor({ clock, getIcon, formatAmount }) {
    this.clock = clock;
    this.getIcon = getIcon;
    this.formatAmount = formatAmount;
    this.pop = new Map();
    this.prev = null;
    this.els = new Map();
  }

  prime() { this.prev = null; this.pop.clear(); }

  diffInventory(keys) {
    if (this.prev) {
      for (const key of keys) if (!this.prev.has(key)) this.pop.set(key, 0);
    }
    this.prev = keys;
  }

  resetCells() { this.els = new Map(); }

  release(key) { this.els.delete(key); }

  cellCanvas(petalIdx, rarIdx, count, size) {
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    c.style.cssText = 'width:' + size + 'px;height:' + size + 'px;display:block;pointer-events:none;transition:none;';
    const ctx = c.getContext('2d');
    try {
      const src = this.getIcon(petalIdx, rarIdx, 'oneshot');
      if (src) ctx.drawImage(src, 0, 0, size, size);
    } catch (_) {}
    if (count > 1) {
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.font = 'bold ' + Math.round(size * 0.25) + 'px Ubuntu';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      const txt = 'x' + this.formatAmount(count);
      ctx.strokeText(txt, size - 4, 4);
      ctx.fillText(txt, size - 4, 4);
    }
    const key = cellKey(petalIdx, rarIdx);
    this.els.set(key, c);
    const p = this.pop.get(key);
    if (p !== undefined) applyPop(c, p);
    return c;
  }

  busy() { return this.pop.size > 0; }

  update() {
    const factor = this.clock.smooth(0.2);
    for (const [key, p] of this.pop) {
      const next = approach(p, 1, factor);
      const el = this.els.get(key);
      if (next === 1) {
        this.pop.delete(key);
        if (el) el.style.transform = '';
      } else {
        this.pop.set(key, next);
        if (el) applyPop(el, next);
      }
    }
  }
}

const BOARD = 150;
const CENTER = BOARD / 2;
const SLOT = 48;
const RESULT = 60;
const SLOT_COUNT = 5;
const SLOT_BG = 'rgba(0,0,0,.15)';
const OUTLINE = '1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000,0 1px 0 #000,0 -1px 0 #000,1px 0 0 #000,-1px 0 0 #000';

class CraftBoardView {
  constructor(craft, { state, clock, getIcon, formatAmount }) {
    this.craft = craft;
    this.state = state;
    this.clock = clock;
    this.getIcon = getIcon;
    this.formatAmount = formatAmount;
    this.animations = [];

    this.crafting = false;
    this.pendingResult = null;
    this.spinTarget = 0;
    this.spinPhase = 0;
    this.blend = 0;
    this.resultInfo = null;
    this.burstPending = false;
    this.failCounts = null;
    this._lastPhase = NaN;
    this._lastBlend = NaN;

    this.el = document.createElement('div');
    this.el.style.cssText =
      'display:flex;justify-content:center;align-items:center;height:' + (BOARD + 60) + 'px;' +
      'margin-bottom:8px;flex:0 0 auto;';
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:4px;';
    this.el.appendChild(row);

    this.ringEl = document.createElement('div');
    this.ringEl.style.cssText =
      'position:relative;width:' + BOARD + 'px;height:' + BOARD + 'px;margin:30px 50px 30px 30px;z-index:1;';
    row.appendChild(this.ringEl);

    this.slots = [];
    for (let i = 0; i < SLOT_COUNT; i++) {
      const el = document.createElement('div');
      el.style.cssText =
        'position:absolute;left:0;top:0;width:' + SLOT + 'px;height:' + SLOT + 'px;' +
        'transition:none;will-change:transform;';
      const box = document.createElement('div');
      box.style.cssText =
        'position:relative;width:' + SLOT + 'px;height:' + SLOT + 'px;border-radius:4px;background:' + SLOT_BG + ';';
      el.appendChild(box);
      const slot = { el, box, wrap: null, sig: '', petalIdx: null, rarity: null };
      el.addEventListener('click', () => {
        if (!slot.sig || this.craft.craftResult) return;
        this.craft.clearCraft();
        this.craft.refresh();
      });
      el.addEventListener('mouseenter', () => { if (slot.sig) this._hover(slot.petalIdx, slot.rarity, el); });
      el.addEventListener('mouseleave', () => { if (slot.sig) this._unhover(slot.petalIdx, slot.rarity); });
      this.ringEl.appendChild(el);
      this.slots.push(slot);
    }

    this.resultEl = document.createElement('div');
    this.resultEl.style.cssText =
      'position:absolute;left:0;top:0;display:none;cursor:pointer;z-index:1;transition:none;will-change:transform;' +
      'width:' + RESULT + 'px;height:' + RESULT + 'px;border-radius:4px;background:' + SLOT_BG + ';';
    this.resultEl.addEventListener('click', () => {
      this.craft.craftResult = null;
      this.craft.craftResultToken++;
      this.craft.clearCraft();
      this.craft.refresh();
    });
    this.resultEl.addEventListener('mouseenter', () => {
      if (this.resultInfo) this._hover(this.resultInfo.petalIdx, this.resultInfo.rarity, this.resultEl);
    });
    this.resultEl.addEventListener('mouseleave', () => {
      if (this.resultInfo) this._unhover(this.resultInfo.petalIdx, this.resultInfo.rarity);
    });
    this.ringEl.appendChild(this.resultEl);

    const side = document.createElement('div');
    side.style.cssText = 'position:relative;';
    row.appendChild(side);

    this.craftBtn = document.createElement('div');
    this.craftBtn.textContent = 'Craft';
    this.craftBtn.style.cssText =
      'cursor:pointer;display:grid;place-items:center;position:relative;overflow:hidden;' +
      'border:2px solid rgba(0,0,0,.2);border-radius:5px;background:#bbb;padding:6px 18px;white-space:nowrap;' +
      'font-family:Ubuntu,sans-serif;font-weight:bold;font-size:22px;color:#fff;text-shadow:' + OUTLINE + ';' +
      'user-select:none;transition:none;';
    this.craftBtn.addEventListener('click', () => { if (this._canCraft()) this.craft.doCraft(); });
    this.craftBtn.addEventListener('mouseenter', () => { if (this._canCraft()) this.craftBtn.style.filter = 'brightness(1.15)'; });
    this.craftBtn.addEventListener('mouseleave', () => { this.craftBtn.style.filter = ''; });
    side.appendChild(this.craftBtn);

    this.rateEl = document.createElement('div');
    this.rateEl.style.cssText =
      'position:absolute;top:100%;left:50%;transform:translate(-50%,2px);white-space:nowrap;' +
      'color:#fff;font-weight:bold;font-size:14px;font-family:Ubuntu,sans-serif;text-shadow:' + OUTLINE + ';';
    side.appendChild(this.rateEl);

    this.statusEl = document.createElement('div');
    this.statusEl.style.cssText =
      'position:absolute;left:calc(100% + 18px);top:50%;transform:translateY(-50%);white-space:nowrap;' +
      'font-weight:bold;font-size:20px;font-family:Ubuntu,sans-serif;text-shadow:' + OUTLINE + ';';
    side.appendChild(this.statusEl);

    this._layout();
    this.sync();
  }

  beginCraft() {
    this.crafting = true;
    this.pendingResult = null;
    this.spinTarget = 0;
    this.spinPhase = 0;
    this.burstPending = false;
    this.failCounts = null;
    this._clearResult();
    this.sync();
  }

  receiveResult(result) {
    if (this.crafting) this.pendingResult = result;
  }

  abort() {
    this.crafting = false;
    this.pendingResult = null;
    this.spinTarget = Math.round(this.spinPhase);
    this.sync();
  }

  busy() {
    const collapsed = this._collapsed();
    return (
      this.crafting || !!this.pendingResult || this.animations.length > 0 ||
      Math.abs(this.blend - (collapsed ? 1 : 0)) > 1e-4 || Math.abs(this.spinPhase - this.spinTarget) > 1e-4
    );
  }

  _collapsed() {
    const cr = this.craft.craftResult;
    return !!cr && cr.type === 'success';
  }

  sync() {
    const craft = this.craft;
    const cr = craft.craftResult;
    const pending = !!cr && cr.type === 'pending';
    if (this.crafting && !pending) this.abort();

    const snap = !!cr && Array.isArray(cr.slots);
    const petalIdx = snap ? cr.petalIdx : craft.craftPetalIdx;
    const rarity = snap ? cr.fromRarity : craft.craftRarity;
    if (!cr) this.failCounts = null;
    const counts = this.failCounts && cr && cr.type === 'fail' ? this.failCounts : (snap ? cr.slots : craft.craftSlots);

    for (let i = 0; i < SLOT_COUNT; i++) {
      const slot = this.slots[i];
      const count = petalIdx != null && rarity != null ? counts[i] : 0;
      const sig = count > 0 ? petalIdx + '|' + rarity + '|' + count : '';
      if (sig !== slot.sig) {
        const wasEmpty = slot.sig === '';
        if (slot.wrap) { slot.wrap.remove(); slot.wrap = null; }
        slot.sig = sig;
        slot.petalIdx = sig ? petalIdx : null;
        slot.rarity = sig ? rarity : null;
        if (sig) {
          slot.wrap = this._petalEl(petalIdx, rarity, count, SLOT);
          slot.box.appendChild(slot.wrap);
          if (wasEmpty) this.animations.push(new PopInTween(slot.wrap, this.clock, 1.5));
        }
      }
      const cursor = sig && !cr ? 'pointer' : 'default';
      if (slot.el.style.cursor !== cursor) slot.el.style.cursor = cursor;
    }

    const rate = craft.getCraftRateText() + '% success rate';
    if (this.rateEl.textContent !== rate) this.rateEl.textContent = rate;
    const can = this._canCraft();
    const tier = craft.craftRarity != null && this.state.tiers ? this.state.tiers[craft.craftRarity] : null;
    const bg = can && tier && tier.color ? tier.color : '#bbb';
    if (this.craftBtn.style.background !== bg) this.craftBtn.style.background = bg;
    const ptr = can ? 'pointer' : 'default';
    if (this.craftBtn.style.cursor !== ptr) this.craftBtn.style.cursor = ptr;

    let color = '#fff', text = '';
    if (cr) {
      if (cr.type === 'success') { color = '#4ade80'; text = 'Success. +' + cr.delta; }
      else if (cr.type === 'fail') { color = '#ff6b6b'; text = 'Failed after ' + cr.attempts + ' attempt(s).'; }
      else text = 'Crafting...';
    }
    if (this.statusEl.textContent !== text) this.statusEl.textContent = text;
    if (this.statusEl.style.color !== color) this.statusEl.style.color = color;
  }

  _petalEl(petalIdx, rarity, count, size) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:0;top:0;width:' + size + 'px;height:' + size + 'px;border-radius:4px;transition:none;';
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    c.style.cssText = 'width:' + size + 'px;height:' + size + 'px;display:block;pointer-events:none;';
    try { c.getContext('2d').drawImage(this.getIcon(petalIdx, rarity), 0, 0, size, size); } catch (_) {}
    wrap.appendChild(c);
    const badge = document.createElement('div');
    badge.textContent = 'x' + this.formatAmount(count);
    badge.style.cssText =
      'position:absolute;left:90%;bottom:80%;transform:translate(-50%,0) rotate(30deg);' +
      'font-size:14px;font-weight:bold;font-family:Ubuntu,sans-serif;color:#fff;white-space:nowrap;' +
      'pointer-events:none;text-shadow:' + OUTLINE + ';';
    wrap.appendChild(badge);
    return wrap;
  }

  _canCraft() {
    let staged = 0;
    for (let i = 0; i < SLOT_COUNT; i++) staged += this.craft.craftSlots[i] || 0;
    return !this.crafting && this.craft.craftPetalIdx != null && staged >= SLOT_COUNT;
  }

  _hover(petalIdx, rarity, el) {
    this.craft.hoverEntry = { index: petalIdx, rarity: rarity };
    this.craft.showTooltip(el);
  }
  _unhover(petalIdx, rarity) {
    const h = this.craft.hoverEntry;
    if (h && h.index === petalIdx && h.rarity === rarity) {
      this.craft.hoverEntry = null;
      this.craft.tip.style.display = 'none';
    }
  }

  _clearResult() {
    this.resultInfo = null;
    this.resultEl.style.display = 'none';
    this.resultEl.replaceChildren();
  }

  _showResult(res) {
    const rarity = res.fromRarity + 1;
    const tier = this.state && this.state.tiers && this.state.tiers[rarity];
    if (res.type !== 'success' || !tier || res.petalIdx == null) return;
    this.resultInfo = { petalIdx: res.petalIdx, rarity: rarity, count: res.delta };
    this.resultEl.replaceChildren(this._petalEl(res.petalIdx, rarity, res.delta, RESULT));
    this.resultEl.style.display = 'block';
    this.resultEl.style.transform = this._resultTransform(0);
    this.burstPending = true;
  }

  update() {
    this.sync();
    const clock = this.clock, craft = this.craft;

    if (this.crafting) {
      const fast = !!craft.FAST_CRAFT;
      const step = fast ? 1 : 2;
      const into = this.spinTarget % step;
      const advance = clock.dtMs / (fast ? 400 : 800);
      this.spinTarget += advance;
      if (into + advance > step && this.pendingResult) this._reveal(step);
    }

    this.spinPhase = approach(this.spinPhase, this.spinTarget, clock.smooth(0.1));
    this.blend = approach(this.blend, this._collapsed() ? 1 : 0, clock.smooth(0.2));

    if (this._lastPhase !== this.spinPhase || this._lastBlend !== this.blend) this._layout();
    if (this._lastBlend !== this.blend && this.resultInfo) {
      this.resultEl.style.transform = this._resultTransform(this.blend);
    }
    this._lastPhase = this.spinPhase;
    this._lastBlend = this.blend;

    if (this.burstPending && this.blend > 0.85) {
      this.burstPending = false;
      const tier = this.state.tiers[this.resultInfo.rarity];
      craft.spawnSuccessBurst(this.ringEl, CENTER, CENTER, (tier && tier.color) || '#ffd860');
    }
    if (this.resultInfo && !this._collapsed() && this.blend === 0) this._clearResult();

    updateAndPrune(this.animations);
  }

  _reveal(step) {
    const res = this.pendingResult;
    this.pendingResult = null;
    this.crafting = false;
    this.spinTarget = Math.floor(this.spinTarget / step) * step;
    if (res.type === 'fail') this.failCounts = this._failLayout(res);
    this._showResult(res);
    this.craft.setCraftResult(res);
  }

  _failLayout(res) {
    const slots = res.slots || [];
    let total = 0;
    for (let i = 0; i < SLOT_COUNT; i++) total += slots[i] || 0;
    const left = Math.max(0, total - SLOT_COUNT * (res.attempts || 0));
    const counts = new Array(SLOT_COUNT).fill(0);
    if (left < SLOT_COUNT) {
      const keep = [0, 1, 2, 3, 4];
      for (let n = SLOT_COUNT - left; n > 0; n--) keep.splice(Math.floor(Math.random() * keep.length), 1);
      for (const i of keep) counts[i] = 1;
    } else {
      const extra = left % SLOT_COUNT;
      const per = (left - extra) / SLOT_COUNT;
      for (let i = 0; i < SLOT_COUNT; i++) counts[i] = per + (i < extra ? 1 : 0);
    }
    return counts;
  }

  _layout() {
    const scale = 1 - this.blend;
    const e = (1 - 0.4 * (0.5 * Math.sin(this.spinPhase * TAU) + 0.5)) * scale;
    for (let i = 0; i < SLOT_COUNT; i++) {
      const angle = (i / SLOT_COUNT) * TAU + this.spinPhase * TAU;
      const x = (Math.cos(angle) * e * 0.5 + 0.5) * BOARD;
      const y = (Math.sin(angle) * e * 0.5 + 0.5) * BOARD;
      this.slots[i].el.style.transform = 'translate(-50%, -50%) translate(' + x + 'px, ' + y + 'px) scale(' + scale + ')';
    }
  }

  _resultTransform(p) {
    return 'translate(-50%, -50%) translate(' + CENTER + 'px, ' + CENTER + 'px) rotate(' + (p * TAU) + 'rad) scale(' + p + ')';
  }
}

var craftRef = null;

(function () {
  var craft = {};
  state.craftMenu = craft;

  /**
   * Whether or not to communicate using the standardized crafting protocol
   * instead of "/craft" chat messages.
   */
  craft.useCraftingProtocol = false;

  craft.btn = null;
  craft.panel = null;
  craft.tip = null;
  craft.tipCanvas = null;
  craft.fsBtn = null;

  craft.hoverEntry = null;
  craft.isFullscreen = false;
  craft._fsWidth = null;
  craft.searchQuery = '';

  craft.craftSlots = [0, 0, 0, 0, 0];
  craft.craftPetalIdx = null;
  craft.craftRarity = null;
  craft.craftResult = null;
  craft.craftResultToken = 0;

  craft.pityRates = {};
  craft.pityInitialized = false;
  craft._pendingBotPitySends = [];
  craft._pityCurrentTier = null;
  craft._pityCurrentSinglePetal = null;
  craft._pitySuppressingCurrent = false;
  craft._pityLastMessageAt = 0;
  craft.pityInterceptorStarted = false;

  craft._loginAt = 0;
  craft._lastUsername = null;
  craft._lastTiersSig = null;

  craft.injectAttempts = 0;

  craft.clock = new FrameClock();
  craft.isOpen = false;
  craft.panelT = 0;
  craft._panelLastT = -1;
  craft.board = null;
  craft.invGrid = null;
  craft._raf = null;

  craft._debugMode = false;
  craft._simNextOutcome = null;


  craft.CRAFT_RESULT_TTL_MS = 5000;
  craft.PITY_SEND_TIMEOUT_MS = 10000;
  craft.PITY_WINDOW_MS = 2500;
  craft.POST_LOGIN_PITY_DELAY_MS = 1500;
  craft.PITY_INIT_POLL_MS = 2500;
  craft.FAST_CRAFT = false;

  craft.DESERT_PITY_MIN_TIER_IDX = 3;

  craft.PITY_HEADER_RE = /^All\s+pity\s+for\s+(.+?):/i;
  craft.PITY_NONE_RE = /^No\s+active\s+pity\s+for\s+.+?\.?\s*$/i;
  craft.PITY_SINGLE_HEADER_RE = /^(.+?)\s+pity:\s*(?:([\d.]+)%\s*\(\+([\d.]+)\s*pity\))?\s*$/i;
  craft.PITY_RATE_ONLY_RE = /^([\d.]+)%\s*\(\+([\d.]+)\s*pity\)\s*$/i;
  craft.PITY_LINE_RE = /^([^:]+?):\s*([\d.]+)%\s*\(\+([\d.]+)\s*pity\)/i;

  craft.LOBBY_PRESETS = [
    {
      name: 'Line Maze',
      short: 'Line',
      tiers: [
        'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic',
        'Ultra', 'Super', 'Unique', 'Eternal',
      ],
      rates: {
        'Uncommon': 64,
        'Rare': 32,
        'Epic': 16,
        'Legendary': 8,
        'Mythic': 4,
        'Ultra': 2,
        'Super': 1,
        'Unique': 0.1,
        'Eternal': 0.1,
      },
      match: function (s) { return !!s.room && s.room.width !== s.room.height; },
    },
    {
      name: 'MMO',
      short: 'MMO',
      tiers: [
        'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic',
        'Ultra', 'Super', 'Unique', 'Eternal',
      ],
      rates: {
        'Uncommon': 64,
        'Rare': 32,
        'Epic': 16,
        'Legendary': 8,
        'Mythic': 4,
        'Ultra': 2,
        'Super': 1,
        'Unique': 0.1,
        'Eternal': 0.1,
      },
      match: function (s) { return !!s.room && s.room.width === s.room.height; },
    },
    {
      name: 'Desert Maze',
      short: 'Desert',
      tiers: [
        'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic',
        'Ultra', 'Super', 'Ancient', 'Omega', 'Eternal', 'Unique',
        'Hyper', 'Galaxium', 'Millom', 'Fictional', 'Transcestrial',
        'Chaos', 'Absiorcadinary', 'Absolute Fictional', 'Nullified',
        'Hyperfixation', 'Atlantical', 'Alpha', 'Finalist', 'Epsilation',
        'Improbable', 'Izolational', 'Chronodynamic', 'Multiversal',
      ],
      rates: {
        'Common': 100,
        'Uncommon': 64,
        'Rare': 32,
        'Epic': 16,
        'Legendary': 8,
        'Mythic': 4,
        'Ultra': 2,
        'Super': 1,
        'Ancient': 0.5,
        'Omega': 0.4,
        'Eternal': 0.3,
        'Unique': 0.2,
        'Hyper': 0.1,
        'Galaxium': 0.09,
        'Millom': 0.08,
        'Fictional': 0.07,
        'Transcestrial': 0.05,
        'Chaos': 0.01,
        'Absiorcadinary': 0.009,
        'Absolute Fictional': 0.008,
        'Nullified': 0.007,
        'Hyperfixation': 0.006,
        'Atlantical': 0.001,
        'Alpha': 0.0003,
        'Finalist': 0.0008,
        'Epsilation': 0.0007,
        'Improbable': 0.0006,
        'Izolational': 0.0005,
        'Chronodynamic': 0.0001,
        'Multiversal': 0.00001,
      },
    },
  ];

  craft.EXPAND_SVG =
    '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" ' +
    'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M9 7 L14 2 M10 2 L14 2 L14 6"/>' +
    '<path d="M7 9 L2 14 M2 10 L2 14 L6 14"/></svg>';
  craft.COLLAPSE_SVG =
    '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" ' +
    'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M14 2 L9 7 M9 3 L9 7 L13 7"/>' +
    '<path d="M2 14 L7 9 M3 9 L7 9 L7 13"/></svg>';

  craft.dlog = function () {
    if (craft._debugMode) console.log.apply(console, ['[CraftMenu]'].concat([].slice.call(arguments)));
  };
  craft.dwarn = function () {
    if (craft._debugMode) console.warn.apply(console, ['[CraftMenu]'].concat([].slice.call(arguments)));
  };
  craft.derror = function () {
    if (craft._debugMode) console.error.apply(console, ['[CraftMenu]'].concat([].slice.call(arguments)));
  };

  craft.getCraftPetalName = function (s, petalIdx) {
    return (s && s.petalConfigs && s.petalConfigs[petalIdx] && s.petalConfigs[petalIdx].name) || '';
  };

  craft.getCraftRate = function (tierName) {
    var preset = craft.detectLobby(state);
    if (preset && preset.rates && preset.rates[tierName] != null) return preset.rates[tierName];
    return undefined;
  };

  /**
   * Initializes this crafting menu with the given pity data. Also tells this
   * crafting menu that the server will support the crafting protocol.
   * 
   * @param {number[][]} pityData An array of crafting rates, organized by `[rarity][petalID]`.
   */
  craft.protocolInit = function (pityData) {
    craft.useCraftingProtocol = true;

    for (let i = 0; i < state.tiers.length - 1; i++) {
      const tierName = state.tiers[i + 1].name;
      craft.pityRates[tierName] ??= {};
      for (let j = 0; j < state.petalConfigs.length; j++) {
        const petalName = state.petalConfigs[j].name;
        // Multiply by 100 because it is displayed as a percentage
        craft.pityRates[tierName][petalName] = pityData[i][j] * 100;
      }
    }
  }

  craft.startPityInterceptor = function () {
    if (craft.pityInterceptorStarted) return;
    if (typeof captureChatMessage !== 'function') return;
    craft.pityInterceptorStarted = true;

    captureChatMessage(function (e) {
      var msg = String(e.message || '');
      var now = performance.now();

      while (craft._pendingBotPitySends.length > 0 &&
             now - craft._pendingBotPitySends[0] > craft.PITY_SEND_TIMEOUT_MS) {
        craft._pendingBotPitySends.shift();
      }

      if (craft._pityLastMessageAt > 0 && now - craft._pityLastMessageAt > craft.PITY_WINDOW_MS) {
        craft._pityCurrentTier = null;
        craft._pityCurrentSinglePetal = null;
        craft._pitySuppressingCurrent = false;
      }

      var headerMatch = craft.PITY_HEADER_RE.exec(msg);
      if (headerMatch) {
        craft._pityLastMessageAt = now;
        craft._pityCurrentTier = headerMatch[1].trim();
        craft._pityCurrentSinglePetal = null;
        if (!craft.pityRates[craft._pityCurrentTier]) craft.pityRates[craft._pityCurrentTier] = {};
        if (craft._pendingBotPitySends.length > 0) {
          craft._pendingBotPitySends.shift();
          craft._pitySuppressingCurrent = true;
          return true;
        }
        craft._pitySuppressingCurrent = false;
        return false;
      }

      if (craft.PITY_NONE_RE.test(msg)) {
        craft._pityLastMessageAt = now;
        craft._pityCurrentTier = null;
        craft._pityCurrentSinglePetal = null;
        if (craft._pendingBotPitySends.length > 0) {
          craft._pendingBotPitySends.shift();
          craft._pitySuppressingCurrent = false;
          return true;
        }
        craft._pitySuppressingCurrent = false;
        return false;
      }

      var singleHeader = craft.PITY_SINGLE_HEADER_RE.exec(msg);
      if (singleHeader) {
        craft._pityLastMessageAt = now;
        var headerPrefix = singleHeader[1].trim();
        var inlineRate = singleHeader[2] != null ? parseFloat(singleHeader[2]) : null;
        var sNow = state;
        var ttn = null, pn = null;
        if (sNow && sNow.tiers) {
          for (var ti = 0; ti < sNow.tiers.length; ti++) {
            var ttname = sNow.tiers[ti].name;
            if (headerPrefix.indexOf(ttname + ' ') === 0) {
              ttn = ttname;
              pn = headerPrefix.substring(ttname.length + 1).trim();
              break;
            }
          }
        }
        if (!ttn) {
          var sp = headerPrefix.split(/\s+/);
          ttn = sp[0];
          pn = sp.slice(1).join(' ');
        }
        if (ttn && pn) {
          if (!craft.pityRates[ttn]) craft.pityRates[ttn] = {};
          if (inlineRate != null) craft.pityRates[ttn][pn] = inlineRate;
          craft._pityCurrentTier = ttn;
          craft._pityCurrentSinglePetal = { tier: ttn, petal: pn };
        }
        if (craft._pendingBotPitySends.length > 0) {
          craft._pendingBotPitySends.shift();
          craft._pitySuppressingCurrent = true;
          return true;
        }
        craft._pitySuppressingCurrent = false;
        return false;
      }

      var rateOnly = craft.PITY_RATE_ONLY_RE.exec(msg);
      if (rateOnly && craft._pityCurrentSinglePetal) {
        craft._pityLastMessageAt = now;
        var splitRate = parseFloat(rateOnly[1]);
        craft.pityRates[craft._pityCurrentSinglePetal.tier][craft._pityCurrentSinglePetal.petal] = splitRate;
        return craft._pitySuppressingCurrent;
      }

      var lineMatch = craft.PITY_LINE_RE.exec(msg);
      if (lineMatch && craft._pityCurrentTier && !craft._pityCurrentSinglePetal) {
        craft._pityLastMessageAt = now;
        craft.pityRates[craft._pityCurrentTier][lineMatch[1].trim()] = parseFloat(lineMatch[2]);
        return craft._pitySuppressingCurrent;
      }

      if (/^(?:Current\s+Attempt|Attempts\s+for\s+PRNG|Total\s+attempts):/i.test(msg)) {
        craft._pityLastMessageAt = now;
        return craft._pitySuppressingCurrent;
      }
      return false;
    }, { count: 1000000000, idleMs: 1000000000, timeoutMs: 1000000000 });
    craft.dlog('pity interceptor active');
  };

  craft.fetchPityForTier = function (targetTier, petalName) {
    if (craft.useCraftingProtocol) return;
    if (typeof sendChatMessage !== 'function') return;
    var s = state;
    if (!s || !s.socket || s.socket.readyState !== WebSocket.OPEN) return;
    var lobby = craft.detectLobby(s);
    if (!lobby || lobby.name !== 'Desert Maze') return;
    craft.startPityInterceptor();
    var cmd = '/pity ' + targetTier + (petalName ? ' ' + petalName : '');
    craft._pendingBotPitySends.push(performance.now());
    if (!sendChatMessage(cmd)) {

      craft._pendingBotPitySends.pop();
    }
  };

  craft.fetchInitialPity = function () {
    if (craft.pityInitialized) return;

    if (craft._loginAt === 0) return;
    if (performance.now() - craft._loginAt < craft.POST_LOGIN_PITY_DELAY_MS) return;
    var s = state;
    if (!s || !s.inventory || !s.tiers) return;
    if (!s.socket || s.socket.readyState !== WebSocket.OPEN) return;
    var lobby = craft.detectLobby(s);
    if (!lobby || lobby.name !== 'Desert Maze') return;
    var highestIdx = -1;
    for (var i = s.tiers.length - 1; i >= 0; i--) {
      var tn = s.tiers[i].name;
      var inv = s.inventory[tn];
      if (!inv) continue;
      var hasAny = false;
      for (var k in inv) { if (inv[k] > 0) { hasAny = true; break; } }
      if (hasAny) { highestIdx = i; break; }
    }
    if (highestIdx < 0) return;

    if (highestIdx < craft.DESERT_PITY_MIN_TIER_IDX) {
      craft.dlog('highest owned tier: ' + s.tiers[highestIdx].name +
        ' (idx ' + highestIdx + ') — below Epic threshold, /pity skipped');
      return;
    }
    craft.pityInitialized = true;
    craft.dlog('highest owned tier: ' + s.tiers[highestIdx].name +
      ' (idx ' + highestIdx + '); fetching initial pity');
    craft.fetchPityForTier(s.tiers[highestIdx].name);
    if (highestIdx - 1 >= 0) craft.fetchPityForTier(s.tiers[highestIdx - 1].name);
  };

  craft.firePityRefresh = function (petalIdx, fromRarity) {
    if (petalIdx == null || fromRarity == null) {
      craft.dlog('firePityRefresh: missing petalIdx/fromRarity', petalIdx, fromRarity);
      return;
    }
    var s = state;
    if (!s || !s.tiers) return;
    var lobby = craft.detectLobby(s);
    if (!lobby || lobby.name !== 'Desert Maze') {
      craft.dlog('firePityRefresh skipped: not Desert Maze');
      return;
    }

    var materialTier = s.tiers[fromRarity];
    if (!materialTier) {
      craft.dlog('firePityRefresh: no materialTier for fromRarity', fromRarity);
      return;
    }
    var petalName = craft.getCraftPetalName(s, petalIdx);
    if (!petalName) {
      craft.dlog('firePityRefresh: no petalName for petalIdx', petalIdx);
      return;
    }
    craft.dlog('Pity Update: ' + materialTier.name + ' ' + petalName);
    craft.fetchPityForTier(materialTier.name, petalName);
  };

  /**
   * Updates this crafting menu's pity rates for a single petal type.
   */
  craft.updatePity = function (rarity, petalIdx, pity) {
    const tierName = state.tiers[rarity + 1]?.name;
    const petalName = state.petalConfigs[petalIdx]?.name;
    if (tierName && petalName) {
      // Multiply by 100 because it is displayed as a percentage
      craft.pityRates[tierName][petalName] = pity * 100;
    }
  }

  craft.detectLobby = function (s) {
    if (!s || !Array.isArray(s.tiers)) return null;
    var names = s.tiers.map(function (t) { return t && t.name; });
    for (var i = 0; i < craft.LOBBY_PRESETS.length; i++) {
      var preset = craft.LOBBY_PRESETS[i];
      if (preset.tiers.length !== names.length) continue;
      var ok = true;
      for (var j = 0; j < preset.tiers.length; j++) {
        if (preset.tiers[j] !== names[j]) { ok = false; break; }
      }
      if (!ok) continue;
      if (typeof preset.match === 'function' && !preset.match(s)) continue;
      return preset;
    }
    return null;
  };

  craft._tooltipCache = new Map();
  craft._tooltipCacheKeys = [];
  craft._TOOLTIP_CACHE_MAX = 200;
  craft.getTooltipBitmap = function (petalIdx, rarity) {
    var key = petalIdx + '|' + rarity;
    var hit = craft._tooltipCache.get(key);
    if (hit) return hit;
    if (typeof petalTooltip !== 'function') return null;
    var src = petalTooltip(petalIdx, rarity);
    if (!src || !src.width || !src.height) return null;
    var off = (typeof OffscreenCanvas !== 'undefined')
      ? new OffscreenCanvas(src.width, src.height)
      : document.createElement('canvas');
    off.width = src.width; off.height = src.height;
    try { off.getContext('2d').drawImage(src, 0, 0); } catch (_) { return null; }
    craft._tooltipCache.set(key, off);
    craft._tooltipCacheKeys.push(key);
    if (craft._tooltipCacheKeys.length > craft._TOOLTIP_CACHE_MAX) {
      craft._tooltipCache.delete(craft._tooltipCacheKeys.shift());
    }
    return off;
  };

  craft._searchDebounceTimer = null;
  craft._SEARCH_DEBOUNCE_MS = 80;

  craft.clearCellCaches = function () {
    craft._tooltipCache.clear();
    craft._tooltipCacheKeys.length = 0;
  };

  craft._pageActive = true;
  (function () {
    if (typeof document === 'undefined') return;
    function update() {
      craft._pageActive = !document.hidden &&
        (typeof document.hasFocus !== 'function' || document.hasFocus());
    }
    update();
    document.addEventListener('visibilitychange', update, { passive: true });
    window.addEventListener('focus', update, { passive: true });
    window.addEventListener('blur', update, { passive: true });
    window.addEventListener('pageshow', update, { passive: true });
  })();

  craft.injectStyles = function () {
    if (document.getElementById('craftMenuStyles')) return;
    var st = document.createElement('style');
    st.id = 'craftMenuStyles';
    st.textContent =
      '#craftMenuPanel ::-webkit-scrollbar{width:10px;height:10px;}' +
      '#craftMenuPanel ::-webkit-scrollbar-track{background:rgba(0,0,0,0.12);border-radius:4px;}' +
      '#craftMenuPanel ::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.35);border-radius:4px;}' +
      '#craftMenuPanel ::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,0.55);}' +
      '#craftMenuPanel ::-webkit-scrollbar-corner{background:transparent;}' +
      '#craftMenuSearch::placeholder{color:rgba(255,255,255,0.75);}' +
      '#craftMenuSearch::-webkit-input-placeholder{color:rgba(255,255,255,0.75);}' +

      '@keyframes craftMenuSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}' +
      '.craftMenuSpinning{animation:craftMenuSpin 0.5s linear infinite;transform-origin:center center;}';
    (document.head || document.documentElement).appendChild(st);
  };

  craft.applyPanelSize = function () {
    if (!craft.panel) return;
    if (craft.isFullscreen) {
      var fsW = craft._fsWidth != null ? craft._fsWidth : craft.computeFullscreenWidth();
      craft.panel.style.maxWidth = 'none';
      if (fsW != null) {
        craft.panel.style.width = fsW + 'px';
        craft.panel.style.left = ((window.innerWidth - fsW) / 2) + 'px';
      } else {
        craft.panel.style.width = '95vw';
        craft.panel.style.left = '2.5vw';
      }
      craft.panel.style.height = '95vh';
      craft.panel.style.maxHeight = '95vh';
      craft.panel.style.right = 'auto';
      craft.panel.style.bottom = 'auto';
      craft.panel.style.top = '2.5vh';
    } else {
      craft.panel.style.width = '632px';
      craft.panel.style.maxWidth = '632px';
      craft.panel.style.height = 'auto';
      craft.panel.style.maxHeight =
        window.innerHeight < 900 ? 'calc(100vh - 130px)' : '45vh';
      craft.panel.style.left = '5px';
      craft.panel.style.right = 'auto';
      craft.panel.style.bottom = '65px';
      craft.panel.style.top = 'auto';
    }
  };

  craft.computeIconSize = function (nRarities) {
    if (!craft.isFullscreen) return 50;
    var available = window.innerWidth * 0.95 - 32;
    var maxPerCol = Math.floor((available - (nRarities - 1) * 5) / nRarities);
    return Math.max(24, Math.min(50, maxPerCol));
  };

  craft.computeFullscreenWidth = function () {
    var s = state;
    var n = (s && Array.isArray(s.tiers)) ? s.tiers.length : 0;
    if (!n) return null;
    var SIZE = craft.computeIconSize(n);
    var gridWidth = n * SIZE + (n - 1) * 5;
    var desired = gridWidth + (8 * 2 + 4 * 2 + 12);
    if (desired < 632) desired = 632;
    var maxWidth = window.innerWidth * 0.95;
    if (desired > maxWidth) desired = maxWidth;
    return desired;
  };

  craft.toggleFullscreen = function () {
    craft.isFullscreen = !craft.isFullscreen;
    craft.applyPanelSize();
    craft.render();
  };

  craft.updateButtonVisibility = function () {
    if (!craft.btn) return;
    var s = state;

    var currentUsername = s && s.username;
    if (currentUsername && currentUsername !== craft._lastUsername) {
      craft._lastUsername = currentUsername;
      craft._loginAt = performance.now();
      craft.pityInitialized = false;
      craft.dlog('login detected (' + currentUsername +
        '); /pity init scheduled for ' + craft.POST_LOGIN_PITY_DELAY_MS + 'ms later');
    }
    var names = (s && Array.isArray(s.tiers)) ? s.tiers.map(function (t) { return t && t.name; }) : null;
    var sig = names ? names.join('|') : null;
    var lobby = craft.detectLobby(s);
    if (sig !== craft._lastTiersSig) {
      craft._lastTiersSig = sig;
      craft.dlog('tiers update; matched preset=' + (lobby && lobby.name) + '; tiers=', names);

      craft.pityInitialized = false;
      craft.clearCellCaches();
      craft._fsWidth = null;
    }
    var shouldShow = craft.useCraftingProtocol || !!lobby;
    var newDisplay = shouldShow ? '' : 'none';
    if (craft.btn.style.display !== newDisplay) {
      craft.btn.style.display = newDisplay;
      if (!shouldShow) {
        if (craft.panel) craft.setOpen(false, true);
        if (craft.tip) craft.tip.style.display = 'none';
        craft.hoverEntry = null;
      }
    }
  };

  craft.inject = function () {
    try {
      craft.injectStyles();
      var c = document.getElementById('bottomButtons');
      if (!c) {
        if (craft.injectAttempts++ < 100) setTimeout(craft.inject, 200);
        return;
      }
      if (document.getElementById('craftMenuButton')) return;

      craft.btn = document.createElement('button');
      craft.btn.id = 'craftMenuButton';
      craft.btn.tabIndex = -1;
      craft.btn.style.width = '40px';
      craft.btn.style.height = '40px';
      craft.btn.style.backgroundColor = '#db9d5a';
      craft.btn.style.border = '4px solid #a47040';
      craft.btn.style.display = 'none';

      craft.panel = document.createElement('div');
      craft.panel.id = 'craftMenuPanel';

      craft.panel.style.cssText =
        'position:fixed;display:none;flex-direction:column;' +
        'background:#db9d5a;border-radius:8px;border:4px solid #a47040;' +
        'padding:8px;z-index:9999;font-family:Ubuntu,sans-serif;color:#fff;' +
        'overflow:hidden;box-sizing:border-box;' +
        'transition:width .25s ease-in-out,height .25s ease-in-out,max-width .25s ease-in-out,' +
        'max-height .25s ease-in-out,left .25s ease-in-out,right .25s ease-in-out,' +
        'top .25s ease-in-out,bottom .25s ease-in-out;';
      craft.applyPanelSize();
      document.body.appendChild(craft.panel);

      craft.tip = document.createElement('div');
      craft.tip.id = 'craftMenuTooltip';
      craft.tip.style.cssText =
        'position:fixed;pointer-events:none;display:none;z-index:99999;' +
        'background:transparent;';
      craft.tipCanvas = document.createElement('canvas');
      craft.tip.appendChild(craft.tipCanvas);
      document.body.appendChild(craft.tip);
      craft.initBoard();

      craft.btn.addEventListener('click', craft.togglePanel);
      c.appendChild(craft.btn);

      document.addEventListener('keydown', function (e) {
        if (e.key !== 'c' && e.key !== 'C') return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        if (!craft.btn || craft.btn.style.display === 'none') return;
        var ae = document.activeElement;
        if (ae) {
          var tag = ae.tagName;
          if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || ae.isContentEditable) return;
        }
        e.preventDefault();
        craft.togglePanel();
      });

      craft.setupCraftChatLogger();

      craft.updateButtonVisibility();
      setInterval(craft.updateButtonVisibility, 500);

      setInterval(craft.fetchInitialPity, craft.PITY_INIT_POLL_MS);
    } catch (err) {
      craft.derror('inject failed', err);
    }
  };

  craft.scheduleResult = function (result) {
    if (!craft.craftResult || craft.craftResult.type !== 'pending') return;
    if (!craft.board) return;
    craft.board.receiveResult(result);
    craft.startLoop();
  }

  craft.setupCraftChatLogger = function () {
    craft.dlog('craft chat listener registered');
    onChatMessage(function (evt) {

      if (!evt) return;
      var msg = String(evt.message || '');

      var ok = /Crafted\s+(\d+)\b[^()]*\((\d+)\s*left/i.exec(msg);
      if (ok) {
        var gained = parseInt(ok[1], 10);
        craft.dlog('craft success (Desert), crafted ' + gained + ', ' + ok[2] + ' left');
        var prevS = craft.craftResult || {};
        craft.scheduleResult({
          type: 'success',
          delta: gained,
          petalIdx: prevS.petalIdx,
          fromRarity: prevS.fromRarity,
          slots: prevS.slots,
        });
        craft.firePityRefresh(prevS.petalIdx, prevS.fromRarity);
        return;
      }

      var lineMulti = /Mass\s*craft[^|]*?Success:\s*(\d+)\s*\|\s*(?:cosumed|consumed):\s*(\d+)/i.exec(msg);
      if (lineMulti) {
        var gained = parseInt(lineMulti[1], 10);
        var consumedMulti = parseInt(lineMulti[2], 10);
        if (gained > 0) {
          craft.dlog('craft success (Line multi), crafted ' + gained);
          var prevS = craft.craftResult || {};
          craft.scheduleResult({
            type: 'success',
            delta: gained,
            petalIdx: prevS.petalIdx,
            fromRarity: prevS.fromRarity,
            slots: prevS.slots,
          });
        } else {
          var attemptsMulti = Math.max(1, Math.round(consumedMulti / 5));
          craft.dlog('craft failed (Line multi, 0 gained), consumed ' + consumedMulti + ', ~' + attemptsMulti + ' attempts');
          var prevF = craft.craftResult || {};
          craft.scheduleResult({
            type: 'fail',
            attempts: attemptsMulti,
            petalIdx: prevF.petalIdx,
            fromRarity: prevF.fromRarity,
            slots: prevF.slots,
          });
        }
        return;
      }

      if (/^Crafted\s+[A-Za-z]/.test(msg) && !/\(/.test(msg) && !/Mass\s*craft/i.test(msg)) {
        craft.dlog('craft success (Line single), crafted 1');
        var prevS = craft.craftResult || {};
        craft.scheduleResult({
          type: 'success',
          delta: 1,
          petalIdx: prevS.petalIdx,
          fromRarity: prevS.fromRarity,
          slots: prevS.slots,
        });
        return;
      }

      var fail = /[Cc]raft[^()]*?fail[^()]*?(\d+)\s*attempt[^()]*\((\d+)\s*left/i.exec(msg);
      if (fail) {
        var attempts = parseInt(fail[1], 10);
        craft.dlog('craft failed (Desert), ' + fail[2] + ' left');

        var prevF = craft.craftResult || {};
        craft.scheduleResult({
          type: 'fail',
          attempts: attempts,
          petalIdx: prevF.petalIdx,
          fromRarity: prevF.fromRarity,
          slots: prevF.slots,
        });
        craft.firePityRefresh(prevF.petalIdx, prevF.fromRarity);
        return;
      }

      var lineFail = /Craft\s*failed!?\s*You\s+(?:cosumed|consumed)\s+(\d+)/i.exec(msg);
      if (lineFail) {
        var consumed = parseInt(lineFail[1], 10);

        var attempts = Math.max(1, Math.round(consumed / 5));
        craft.dlog('craft failed (Line), consumed ' + consumed + ', ~' + attempts + ' attempts');
        var prevF = craft.craftResult || {};
        craft.scheduleResult({
          type: 'fail',
          attempts: attempts,
          petalIdx: prevF.petalIdx,
          fromRarity: prevF.fromRarity,
          slots: prevF.slots,
        });
        return;
      }

    });
  };

  craft.togglePanel = function () {
    if (!craft.panel) return;
    craft.setOpen(!craft.isOpen);
  };

  craft.setOpen = function (open, instant) {
    if (!craft.panel) return;
    craft.isOpen = !!open;
    if (open) {
      if (craft.panel.style.display === 'none') {
        craft.panel.style.display = 'flex';
        craft.applyPanelSize();
        craft.invGrid && craft.invGrid.prime();
        craft.applyPanelTransform();
        craft.render();
      }
      if (instant) { craft.panelT = 1; craft.applyPanelTransform(); }
    } else {
      craft.hoverEntry = null;
      if (craft.tip) craft.tip.style.display = 'none';
      if (instant) {
        craft.panelT = 0;
        craft._panelLastT = 0;
        craft.panel.style.display = 'none';
      }
    }
    craft.startLoop();
  };

  craft.applyPanelTransform = function () {
    var offset = 130 * (1 - craft.panelT);
    craft.panel.style.transform = craft.panelT >= 1 ? '' : 'translate(0%, ' + offset + '%)';
    craft.panel.style.willChange = craft.panelT < 1 ? 'transform' : '';
  };

  craft.updatePanelAnim = function () {
    if (!craft.panel) return;
    craft.panelT = approach(craft.panelT, craft.isOpen ? 1 : 0, craft.clock.smooth(0.25));
    if (craft.panelT !== craft._panelLastT) {
      craft._panelLastT = craft.panelT;
      craft.applyPanelTransform();
    }
    if (!craft.isOpen && craft.panelT === 0 && craft.panel.style.display !== 'none') {
      craft.panel.style.display = 'none';
    }
  };

  craft.clearCraft = function () {
    craft.craftSlots = [0, 0, 0, 0, 0];
    craft.craftPetalIdx = null;
    craft.craftRarity = null;
  };

  craft.setCraftResult = function (result) {
    var t = ++craft.craftResultToken;
    craft.craftResult = result;
    if (result && result.type === 'pending' && craft.board) craft.board.beginCraft();
    craft.startLoop();
    craft.refresh();

    if (result && result.type === 'success') return;
    setTimeout(function () {
      if (craft.craftResultToken === t) {
        craft.craftResult = null;
        craft.refresh();
      }
    }, craft.CRAFT_RESULT_TTL_MS);
  };

  /**
   * Aborts the craft attempt by setting `craftResult` to `null`.
   */
  craft.abortCraft = function () {
    craft.craftResult = null;
    clearInterval(craft.poll);
    craft.clearCraft();
    if (craft.board) craft.board.abort();
    craft.refresh();
  }

  craft._streak = 0;
  craft._streakKey = null;
  craft._streakUntil = 0;

  craft.stagedTotal = function () {
    var t = 0;
    for (var i = 0; i < 5; i++) t += craft.craftSlots[i];
    return t;
  };

  craft.isPending = function () {
    return !!craft.craftResult && craft.craftResult.type === 'pending';
  };

  craft.canUseCell = function (petalIdx, rarIdx, displayed) {
    if (craft.isPending() || displayed <= 0) return false;
    if (!(state.tiers && state.tiers[rarIdx + 1])) return false;
    var selected = craft.craftPetalIdx === petalIdx && craft.craftRarity === rarIdx;
    return displayed >= 5 || (selected && craft.stagedTotal() >= 5);
  };

  craft.loadCraft = function (petalIdx, rarity, owned, shift) {
    if (craft.isPending()) return false;
    if (!(state.tiers && state.tiers[rarity + 1])) return false;

    var same = craft.craftPetalIdx === petalIdx && craft.craftRarity === rarity;
    var staged = same ? craft.stagedTotal() : 0;
    var available = owned - staged;
    if (available <= 0) return false;

    var key = petalIdx + '|' + rarity;
    var now = performance.now();
    craft._streak = (craft._streakKey === key && now < craft._streakUntil) ? craft._streak + 1 : 1;
    craft._streakKey = key;
    craft._streakUntil = now + 500;

    var amount = Math.min(shift ? available : 5 * craft._streak, available);

    if (craft.craftResult) {
      craft.craftResult = null;
      craft.craftResultToken++;
    }
    if (craft._simNextOutcome != null) {
      craft.dlog('re-stage cleared pending SimCraft outcome:', craft._simNextOutcome);
      craft._simNextOutcome = null;
    }

    craft.craftPetalIdx = petalIdx;
    craft.craftRarity = rarity;
    var total = staged + amount;
    var extra = total % 5;
    var per = (total - extra) / 5;
    var counts = [];
    for (var i = 0; i < 5; i++) counts.push(per + (i < extra ? 1 : 0));
    craft.craftSlots = counts;
    return true;
  };

  craft.computeRows = function (s) {
    var petalIdxSet = new Set();
    Object.keys(s.inventory).forEach(function (tn) {
      var petals = s.inventory[tn] || {};
      Object.keys(petals).forEach(function (pid) {
        if (petals[pid] > 0) petalIdxSet.add(Number(pid));
      });
    });
    var rows = Array.from(petalIdxSet);
    rows.sort(function (a, b) {
      var an = (s.petalConfigs[a] || {}).name || '';
      var bn = (s.petalConfigs[b] || {}).name || '';
      return an.localeCompare(bn);
    });
    var emptyInventory = !rows.length;
    if (craft.searchQuery) {
      var q = craft.searchQuery.toLowerCase();
      rows = rows.filter(function (idx) {
        var name = ((s.petalConfigs[idx] || {}).name || '').toLowerCase();
        return name.indexOf(q) !== -1;
      });
    }
    return { rows: rows, emptyInventory: emptyInventory };
  };

  craft.rowSignature = function (rows, nRarities, size) {
    return rows.join(',') + '|' + nRarities + '|' + size + '|' + craft.searchQuery;
  };

  craft.paintCell = function (cell) {
    var tier = state.tiers[cell.rarIdx];
    var owned = (state.inventory[tier.name] || {})[cell.petalIdx] || 0;
    var selected = cell.petalIdx === craft.craftPetalIdx && cell.rarIdx === craft.craftRarity;
    var displayed = owned - (selected ? craft.stagedTotal() : 0);
    var usable = craft.canUseCell(cell.petalIdx, cell.rarIdx, displayed);
    var el = cell.el;
    cell.owned = owned;
    cell.displayed = displayed;
    cell.usable = usable;
    if (displayed > 0) {
      if (cell.shownCount !== displayed) {
        el.replaceChildren(craft.invGrid.cellCanvas(cell.petalIdx, cell.rarIdx, displayed, cell.size));
        cell.shownCount = displayed;
      }
      el.style.cursor = usable ? 'pointer' : 'default';
      el.style.filter = usable ? '' : 'grayscale(1)';
      el.style.opacity = usable ? '' : '0.55';
    } else {
      if (cell.shownCount) {
        el.replaceChildren();
        craft.invGrid.release(cellKey(cell.petalIdx, cell.rarIdx));
        cell.shownCount = 0;
        var h = craft.hoverEntry;
        if (h && h.index === cell.petalIdx && h.rarity === cell.rarIdx) {
          craft.hoverEntry = null;
          craft.tip.style.display = 'none';
        }
      }
      el.style.cursor = 'default';
      el.style.filter = '';
      el.style.opacity = '';
    }
  };

  craft.refresh = function () {
    if (!craft.panel || craft.panel.style.display === 'none') return;
    var s = state;
    var intact = !!(craft._grid && craft._grid.isConnected && s && s.inventory && s.tiers && s.petalConfigs);
    if (intact) {
      var info = craft.computeRows(s);
      intact = info.rows.length > 0 &&
        craft.rowSignature(info.rows, s.tiers.length, craft.computeIconSize(s.tiers.length)) === craft._rowSig;
    }
    if (!intact) {
      craft.render();
      return;
    }
    craft.diffInventoryForPops(s);
    for (var i = 0; i < craft._cells.length; i++) craft.paintCell(craft._cells[i]);
    craft.board.sync();
  };

  craft.doCraft = function () {
    if (craft.craftPetalIdx == null || craft.craftRarity == null) return;
    var s = state;
    if (!s) return;
    var total = 0;
    for (var i = 0; i < 5; i++) total += craft.craftSlots[i];
    if (total === 0) return;

    if (craft._simNextOutcome != null) {
      var simOutcome = craft._simNextOutcome === 'roll' ? undefined : craft._simNextOutcome;
      craft._simNextOutcome = null;
      var sim = craft._runSimulation(craft.craftPetalIdx, craft.craftRarity, total, simOutcome);
      craft.dlog('Craft Simulation Results:', sim);
      return;
    }
    var tierName = (s.tiers[craft.craftRarity] || {}).name || '';
    var petalName = craft.getCraftPetalName(s, craft.craftPetalIdx);

    if (craft.useCraftingProtocol) {
      state.socket.talk(SERVER_BOUND.CRAFT_REQUEST, {
        rarity: craft.craftRarity,
        petalId: craft.craftPetalIdx,
        amount: total,
      });
    } else {
      sendChatMessage('/craft ' + tierName + ' ' + petalName + ' ' + total);
    }

    craft.setCraftResult({
      type: 'pending',
      delta: total,
      petalIdx: craft.craftPetalIdx,
      fromRarity: craft.craftRarity,
      slots: craft.craftSlots.slice(),
      startedAt: performance.now(),
    });

    var snapshot = JSON.stringify(s.inventory);
    var deadline = Date.now() + 3000;
    craft.poll = setInterval(function () {
      var st = state;
      var fresh = JSON.stringify(st && st.inventory);
      if (fresh !== snapshot || Date.now() > deadline) {
        clearInterval(craft.poll);
        craft.clearCraft();

        if (!craft.craftResult) craft.refresh();
      }
    }, 100);
  };

  craft.mixWithWhite = function (hex, amount) {
    var m = /^#?([\da-fA-F]{6})$/.exec(hex || '');
    if (!m) return '#ffffff';
    var n = parseInt(m[1], 16);
    var r = (n >> 16) & 0xff, g = (n >> 8) & 0xff, b = n & 0xff;
    r = Math.round(r + (255 - r) * amount);
    g = Math.round(g + (255 - g) * amount);
    b = Math.round(b + (255 - b) * amount);
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  };

  craft.spawnSuccessBurst = function (container, cx, cy, baseColor) {
    var N = 28;
    var c0 = baseColor || '#ffd860';
    var COLORS = [c0, craft.mixWithWhite(c0, 0.35), craft.mixWithWhite(c0, 0.65), '#ffffff'];
    var duration = 900;
    for (var i = 0; i < N; i++) {
      var size = 3 + Math.random() * 5;
      var angle = (i / N) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      var dist = 50 + Math.random() * 60;
      var dx = Math.cos(angle) * dist;
      var dy = Math.sin(angle) * dist;
      var color = COLORS[Math.floor(Math.random() * COLORS.length)];
      var p = document.createElement('div');
      p.style.cssText =
        'position:absolute;width:' + size + 'px;height:' + size + 'px;' +
        'background:' + color + ';border-radius:50%;pointer-events:none;' +
        'left:' + (cx - size / 2) + 'px;top:' + (cy - size / 2) + 'px;' +
        'opacity:1;will-change:transform,opacity;' +
        'transition:transform ' + duration + 'ms cubic-bezier(0.12,0.72,0.28,1),' +
                   'opacity ' + duration + 'ms ease-out;';
      container.appendChild(p);
      (function (particle, tx, ty) {
        requestAnimationFrame(function () {
          particle.style.transform = 'translate(' + tx + 'px,' + ty + 'px)';
          particle.style.opacity = '0';
        });
        setTimeout(function () {
          if (particle.parentNode) particle.parentNode.removeChild(particle);
        }, duration + 50);
      })(p, dx, dy);
    }
  };

  craft.getCraftRateText = function () {
    var rateText = '?';
    if (craft.craftRarity != null) {
      var st = state;
      var nextTier = st && st.tiers && st.tiers[craft.craftRarity + 1];
      var tn = nextTier && nextTier.name;
      if (tn) {
        var pname = craft.craftPetalIdx != null ? craft.getCraftPetalName(st, craft.craftPetalIdx) : null;
        var pityRate = pname && craft.pityRates[tn] && craft.pityRates[tn][pname];
        if (pityRate != null) {
          rateText = craft.formatRate(pityRate);
        } else {
          var rate = craft.getCraftRate(tn);
          if (rate != null) rateText = craft.formatRate(rate);
        }
      } else {
        // If next rarity doesn't exist, the craft chance is assumed to be zero
        rateText = "0";
      }
    }
    return rateText;
  };

  craft.initBoard = function () {
    if (craft.board) return;
    craft.invGrid = new CraftInventoryGrid({ clock: craft.clock, getIcon: getPetalIcon, formatAmount: formatAmount });
    craft.board = new CraftBoardView(craft, { state: state, clock: craft.clock, getIcon: getPetalIcon, formatAmount: formatAmount });
  };

  craft.diffInventoryForPops = function (s) {
    if (!craft.invGrid) return;
    var stagedTotal = 0;
    for (var i = 0; i < 5; i++) stagedTotal += craft.craftSlots[i];
    var keys = new Set();
    s.tiers.forEach(function (tier, rarIdx) {
      var inv = s.inventory[tier.name] || {};
      for (var pid in inv) {
        var staged = (+pid === craft.craftPetalIdx && rarIdx === craft.craftRarity) ? stagedTotal : 0;
        if (inv[pid] - staged > 0) keys.add(cellKey(+pid, rarIdx));
      }
    });
    craft.invGrid.diffInventory(keys);
  };

  craft.panelVisible = function () {
    return !!craft.panel && craft.panel.style.display !== 'none';
  };

  craft.startLoop = function () {
    if (craft._raf) return;
    craft._raf = requestAnimationFrame(craft.frame);
  };

  craft.frame = function (now) {
    craft._raf = null;
    craft.clock.tick(now);
    craft.updatePanelAnim();
    var visible = craft.panelVisible();
    if (craft.board) craft.board.update();
    if (craft.invGrid && visible) {
      craft.invGrid.update();
    }
    if (visible || (craft.board && craft.board.busy())) {
      craft._raf = requestAnimationFrame(craft.frame);
    } else {
      craft.clock.pause();
    }
  };

  craft.render = function () {
    try {
      var s = state;
      var getIcon = getPetalIcon;

      var oldWrap = document.getElementById('craftMenuGridWrapper');
      var savedScrollTop = oldWrap ? oldWrap.scrollTop : 0;
      var savedScrollLeft = oldWrap ? oldWrap.scrollLeft : 0;

      craft.panel.innerHTML = '';
      craft._grid = null;
      craft._cells = [];

      var headerBar = document.createElement('div');
      headerBar.style.cssText =
        'display:flex;align-items:center;gap:8px;' +
        'margin-bottom:6px;flex:0 0 auto;';

      var title = document.createElement('div');
      title.textContent = 'Crafting';
      title.style.cssText = 'font-weight:bold;font-size:14px;flex:0 0 auto;';
      headerBar.appendChild(title);

      var searchInput = document.createElement('input');
      searchInput.type = 'text';
      searchInput.placeholder = 'Search petals...';
      searchInput.value = craft.searchQuery;
      searchInput.id = 'craftMenuSearch';
      searchInput.style.cssText =
        'flex:1 1 auto;max-width:240px;background:#8a5e35;color:#fff;' +
        'border:1px solid rgba(0,0,0,0.25);border-radius:4px;padding:3px 6px;' +
        'font-family:Ubuntu,sans-serif;font-size:12px;outline:none;';
      searchInput.addEventListener('input', function () {
        craft.searchQuery = searchInput.value;

        var pos = searchInput.selectionStart;
        if (craft._searchDebounceTimer) clearTimeout(craft._searchDebounceTimer);
        craft._searchDebounceTimer = setTimeout(function () {
          craft._searchDebounceTimer = null;
          craft.render();
          var fresh = document.getElementById('craftMenuSearch');
          if (fresh) {
            fresh.focus();
            if (typeof pos === 'number') {
              try { fresh.setSelectionRange(pos, pos); } catch (_) {}
            }
          }
        }, craft._SEARCH_DEBOUNCE_MS);
      });

      searchInput.addEventListener('keydown', function (e) { e.stopPropagation(); });
      headerBar.appendChild(searchInput);

      var spacer = document.createElement('div');
      spacer.style.cssText = 'flex:1 1 auto;';
      headerBar.appendChild(spacer);

      craft.fsBtn = document.createElement('button');
      craft.fsBtn.innerHTML = craft.isFullscreen ? craft.COLLAPSE_SVG : craft.EXPAND_SVG;
      craft.fsBtn.title = craft.isFullscreen ? 'Return to compact view' : 'Show all rarities at once';
      craft.fsBtn.setAttribute('aria-label', craft.isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen');
      craft.fsBtn.style.cssText =
        'background:transparent;border:1px solid rgba(255,255,255,0.3);' +
        'color:#fff;cursor:pointer;border-radius:4px;padding:3px 5px;' +
        'display:inline-flex;align-items:center;justify-content:center;' +
        'line-height:0;';
      craft.fsBtn.addEventListener('click', craft.toggleFullscreen);
      headerBar.appendChild(craft.fsBtn);

      craft.panel.appendChild(headerBar);

      if (!s || !s.inventory || !s.tiers || !s.petalConfigs || typeof getIcon !== 'function') {
        var e = document.createElement('div');
        e.textContent = 'Inventory is empty.';
        e.style.cssText =
          'flex:1 1 auto;display:flex;align-items:center;justify-content:center;' +
          'color:#fff;font-size:16px;font-weight:bold;' +
          'text-shadow:1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000;';
        craft.panel.appendChild(e);
        return;
      }

      craft.board.sync();
      craft.panel.appendChild(craft.board.el);
      craft.startLoop();

      var rowInfo = craft.computeRows(s);
      var petalIndices = rowInfo.rows;
      var emptyInventory = rowInfo.emptyInventory;

      craft.diffInventoryForPops(s);

      if (!petalIndices.length) {
        var emp = document.createElement('div');
        emp.textContent = emptyInventory ? 'Inventory is empty.' : 'No petals match "' + craft.searchQuery + '".';
        emp.style.cssText =
          'flex:1 1 auto;display:flex;align-items:center;justify-content:center;' +
          'color:#fff;font-size:16px;font-weight:bold;' +
          'text-shadow:1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000;';
        craft.panel.appendChild(emp);
        return;
      }

      var nRarities = s.tiers.length;
      var SIZE = craft.computeIconSize(nRarities);

      var gridWrapper = document.createElement('div');
      gridWrapper.id = 'craftMenuGridWrapper';
      gridWrapper.style.cssText = 'flex:1 1 auto;overflow-x:scroll;overflow-y:auto;min-height:0;';
      craft.panel.appendChild(gridWrapper);

      var grid = document.createElement('div');
      grid.style.cssText =
        'display:grid;grid-template-columns:repeat(' + nRarities + ',' + SIZE + 'px);' +
        'gap:5px;align-items:center;width:max-content;';
      gridWrapper.appendChild(grid);

      s.tiers.forEach(function (tier) {
        var th = document.createElement('div');
        th.textContent = tier.name || '';
        th.style.cssText =
          'font-size:10px;color:' + (tier.color || '#fff') + ';' +
          'font-weight:bold;text-align:center;' +
          'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;' +
          'text-shadow:1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000;';
        grid.appendChild(th);
      });

      craft.invGrid.resetCells();
      craft._grid = grid;
      craft._rowSig = craft.rowSignature(petalIndices, nRarities, SIZE);

      petalIndices.forEach(function (petalIdx) {
        s.tiers.forEach(function (tier, rarIdx) {
          var host = document.createElement('div');
          host.style.cssText =
            'box-sizing:border-box;' +
            'width:' + SIZE + 'px;height:' + SIZE + 'px;' +
            'background:#a87545;border-radius:6px;';
          var cell = { el: host, petalIdx: petalIdx, rarIdx: rarIdx, size: SIZE, owned: 0, displayed: 0, usable: false, shownCount: 0 };
          host.addEventListener('mouseenter', function () {
            if (cell.displayed <= 0) return;
            craft.hoverEntry = { index: cell.petalIdx, rarity: cell.rarIdx };
            craft.showTooltip(host);
          });
          host.addEventListener('mouseleave', function () {
            if (craft.hoverEntry && craft.hoverEntry.index === cell.petalIdx && craft.hoverEntry.rarity === cell.rarIdx) {
              craft.hoverEntry = null;
              craft.tip.style.display = 'none';
            }
          });
          host.addEventListener('click', function (ev) {
            if (!cell.usable) return;
            if (craft.loadCraft(cell.petalIdx, cell.rarIdx, cell.owned, !!ev.shiftKey)) craft.refresh();
          });
          craft._cells.push(cell);
          craft.paintCell(cell);
          grid.appendChild(host);
        });
      });

      gridWrapper.scrollTop = savedScrollTop;
      gridWrapper.scrollLeft = savedScrollLeft;

      if (craft.isFullscreen) {
        var gridWidth = grid.offsetWidth;
        var panelChrome = 8 * 2 + 4 * 2 + 12;
        var desired = gridWidth + panelChrome;
        if (desired < 632) desired = 632;
        var maxWidth = window.innerWidth * 0.95;
        if (desired > maxWidth) desired = maxWidth;
        craft.panel.style.width = desired + 'px';
        craft.panel.style.left = ((window.innerWidth - desired) / 2) + 'px';
        craft._fsWidth = desired;
      }
    } catch (err) {
      craft.derror('render failed', err);
    }
  };

  /**
   * A helper function to convert the given success rate into a string rounded
   * to two significant figures.
   */
  craft.formatRate = function(rate) {
    if (rate >= 99.5) {
      return "100";
    } else if (rate <= 0) {
      return "0";
    } else {
      return rate.toPrecision(2);
    }
  }

  craft.showTooltip = function (target) {
    try {
      if (!craft.hoverEntry) return;
      var img = craft.getTooltipBitmap(craft.hoverEntry.index, craft.hoverEntry.rarity);
      if (!img) return;
      var bw = 350;
      var bh = 350 * img.height / img.width;
      craft.tipCanvas.width = bw;
      craft.tipCanvas.height = bh;
      var tctx = craft.tipCanvas.getContext('2d');
      tctx.clearRect(0, 0, bw, bh);
      tctx.imageSmoothingEnabled = true;
      tctx.imageSmoothingQuality = 'high';
      tctx.drawImage(img, 0, 0, bw, bh);
      craft.tipCanvas.style.width = bw + 'px';
      craft.tipCanvas.style.height = bh + 'px';
      craft.tip.style.display = 'block';

      var rect = null;
      if (target && target.getBoundingClientRect) {
        rect = target.getBoundingClientRect();
      } else {
        var wrapper = document.getElementById('craftMenuGridWrapper');
        if (wrapper) rect = wrapper.getBoundingClientRect();
      }
      if (rect) {
        var x = rect.left + rect.width / 2 - 150;
        var y = rect.top - bh - 10;
        x = Math.max(0, Math.min(x, window.innerWidth - bw));
        y = Math.max(0, Math.min(y, window.innerHeight - bh));
        craft.tip.style.left = x + 'px';
        craft.tip.style.top = y + 'px';
      }
    } catch (err) {
      craft.derror('tooltip show failed', err);
    }
  };

  craft._runSimulation = function (petalIdx, rarityIdx, count, outcome) {
    var s = state;
    var pname = (s && s.petalConfigs && s.petalConfigs[petalIdx]) ? s.petalConfigs[petalIdx].name : null;
    var targetTier = s.tiers[rarityIdx + 1];
    var targetTierName = targetTier ? targetTier.name : null;
    var forced = outcome === 'success' || outcome === 'fail';
    var attemptsCount = Math.max(1, Math.floor(count / 5));
    var pity = targetTierName && craft.pityRates[targetTierName] && craft.pityRates[targetTierName][pname];
    var rateUsed = pity != null ? pity : (targetTierName ? craft.getCraftRate(targetTierName) : null);
    if (rateUsed == null) rateUsed = 50;
    var p = rateUsed / 100;
    var successes = 0;
    if (forced) {
      if (outcome === 'success') successes = Math.max(1, Math.round(attemptsCount * p));
    } else {
      var pAnySuccess = p < 1e-10
        ? Math.min(1, attemptsCount * p)
        : 1 - Math.pow(1 - p, attemptsCount);
      if (Math.random() < pAnySuccess) {
        var expected = attemptsCount * p;
        successes = Math.max(1, Math.round(expected + (Math.random() - 0.5) * Math.sqrt(expected + 1)));
        if (successes > attemptsCount) successes = attemptsCount;
        outcome = 'success';
        craft.dlog('Simulated craft: succeeded.');
      } else {
        outcome = 'fail';
        craft.dlog('Simulated craft: failed in ' + attemptsCount + ' attempt(s).');
      }
    }
    var counts = craft.craftSlots.slice();
    craft.setCraftResult({
      type: 'pending',
      delta: count,
      petalIdx: petalIdx,
      fromRarity: rarityIdx,
      slots: counts,
      startedAt: performance.now(),
    });
    craft.clearCraft();
    craft.scheduleResult(outcome === 'fail'
      ? { type: 'fail', attempts: attemptsCount, petalIdx: petalIdx, fromRarity: rarityIdx, slots: counts }
      : { type: 'success', delta: successes, petalIdx: petalIdx, fromRarity: rarityIdx, slots: counts });
    return { outcome: outcome, forced: forced, rate: rateUsed, successes: successes, attempts: attemptsCount, targetTier: targetTierName };
  };

  craftRef = craft;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', craft.inject);
  } else {
    craft.inject();
  }
})();

function CraftDebug(on) {
  if (!craftRef) return null;
  craftRef._debugMode = !!on;
  if (craftRef._debugMode) {
    globalThis.SimCraft = SimCraft;
  } else {
    craftRef._simNextOutcome = null;
    try { delete globalThis.SimCraft; } catch (_) { globalThis.SimCraft = undefined; }
  }
  return craftRef._debugMode;
}

function SimCraft(petalName, rarityName, count) {
  if (!craftRef) return null;
  if (!craftRef._debugMode) {
    console.warn('[CraftMenu] SimCraft requires debug mode. Call CraftDebug(true) first.');
    return null;
  }
  var s = state;
  if (!s || !s.petalConfigs || !s.tiers) {
    console.warn('[CraftMenu] SimCraft: no game state'); return null;
  }
  count = +count || 5;

  var outcome = null;
  var doAutoCraft = true;
  for (var ai = 3; ai < arguments.length; ai++) {
    var v = arguments[ai];
    if (typeof v === 'boolean') {
      doAutoCraft = v;
    } else if (typeof v === 'string') {
      var low = v.toLowerCase();
      if (low === 'true') doAutoCraft = true;
      else if (low === 'false') doAutoCraft = false;
      else if (low === 'success' || low === 'fail') outcome = low;
    }
  }

  var petalIdx = -1;
  for (var i = 0; i < s.petalConfigs.length; i++) {
    if (s.petalConfigs[i] && s.petalConfigs[i].name === petalName) { petalIdx = i; break; }
  }
  if (petalIdx < 0) {
    console.warn('[CraftMenu] SimCraft: petal not found:', petalName); return null;
  }

  var rarityIdx = -1;
  for (var j = 0; j < s.tiers.length; j++) {
    if (s.tiers[j] && s.tiers[j].name === rarityName) { rarityIdx = j; break; }
  }
  if (rarityIdx < 0) {
    console.warn('[CraftMenu] SimCraft: rarity not found:', rarityName); return null;
  }

  var per = Math.floor(count / 5);
  var rem = count - per * 5;
  var counts = [per, per, per, per, per];
  for (var k = 0; k < rem; k++) counts[k]++;
  craftRef.craftSlots = counts.slice();
  craftRef.craftPetalIdx = petalIdx;
  craftRef.craftRarity = rarityIdx;

  if (!doAutoCraft) {

    craftRef._simNextOutcome = (outcome === 'success' || outcome === 'fail') ? outcome : 'roll';
    if (craftRef.panel && !craftRef.isOpen) craftRef.setOpen(true);
    craftRef.render();
    craftRef.dlog('SimCraft loaded (' + petalName + ', ' + rarityName + ', ' + count + ')');
    return {
      petalName: petalName,
      rarityName: rarityName,
      count: count,
      staged: true,
      autoCraft: false,
      pendingOutcome: craftRef._simNextOutcome,
    };
  }

  craftRef._simNextOutcome = null;
  var sim = craftRef._runSimulation(petalIdx, rarityIdx, count, outcome);
  if (craftRef.panel && !craftRef.isOpen) craftRef.setOpen(true);
  craftRef.render();
  craftRef.dlog('SimCraft started:', petalName, rarityName, 'count=' + count, 'outcome=' + sim.outcome);
  return {
    petalName: petalName,
    rarityName: rarityName,
    targetTier: sim.targetTier,
    count: count,
    outcome: sim.outcome,
    forced: sim.forced,
    rate: sim.rate,
    successes: sim.successes,
    attempts: sim.attempts,
    autoCraft: true,
  };
}

var _craftDebugExposed = false;
function _maybeExposeCraftDebug() {
  if (_craftDebugExposed) return;
  var s = state;
  if (!s) return;
  var perms = (typeof s.masterPermissions === 'number')
    ? s.masterPermissions
    : (s.player && typeof s.player.masterPermissions === 'number')
      ? s.player.masterPermissions
      : 0;
  if (perms >= 1) {
    globalThis.CraftDebug = CraftDebug;
    _craftDebugExposed = true;
  }
}
setInterval(_maybeExposeCraftDebug, 1000);
