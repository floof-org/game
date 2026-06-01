import { getPetalIcon, petalTooltip } from "./renders.js";
import { state, sendChatMessage, onChatMessage, captureChatMessage } from "./net.js";

var craftRef = null;

(function () {
  var craft = {};

  craft.btn = null;
  craft.panel = null;
  craft.tip = null;
  craft.tipCanvas = null;
  craft.fsBtn = null;

  craft.hoverEntry = null;
  craft.isFullscreen = false;
  craft.searchQuery = '';

  craft.craftSlots = [0, 0, 0, 0, 0];
  craft.craftPetalIdx = null;
  craft.craftRarity = null;
  craft.craftResult = null;
  craft.craftResultToken = 0;

  craft.fastCraft = false;
  try { craft.fastCraft = localStorage.getItem('craftMenuFastCraft') === 'true'; } catch (_) {}

  craft.liveCraftRates = null;
  craft.craftRatesFetching = false;

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

  craft.fastCraftInjectAttempts = 0;

  craft.orbitRAF = null;
  craft.orbitLastPositions = [];
  craft.orbitCurrentProgress = 0;
  craft.easeRAF = null;

  craft._debugMode = false;
  craft._simNextOutcome = null;


  craft.CRAFT_RESULT_TTL_MS = 5000;
  craft.PITY_SEND_TIMEOUT_MS = 10000;
  craft.PITY_WINDOW_MS = 2500;
  craft.POST_LOGIN_PITY_DELAY_MS = 1500;
  craft.PITY_INIT_POLL_MS = 2500;
  craft.ORBIT_DURATION_MS = 1800;
  craft.FALL_DURATION_MS = 333;
  craft.EASE_DURATION_MS = 333;

  craft.DESERT_PITY_MIN_TIER_IDX = 3;
  craft.SUCCESS_SPIRAL_SWEEP = Math.PI / 2;

  craft.PETAL_NAME_SHORTHAND = {
    'Third Eye': 'Teye',
    'Beetle Egg': 'Begg',
    'Ant Egg': 'Aegg',
    'Yin Yang': 'Yyang',
    'Magic Orb': 'Morb',
    'Golden Leaf': 'Gleaf',
    'Blood Stinger': 'Bstinger',
    'Venomous Stinger': 'Vstinger',
    'Hornet Egg': 'Hegg',
    'Leech Egg': 'Legg',
    'Lily Pad': 'Lpad',
    'Mecha Missile': 'Mmissile',
    'Tesla Coil': 'Tcoil',
    'Red Coral': 'Rcoral',
    'Blue Coral': 'Bcoral',
    'Cheese Moon': 'Cmoon',
  };

  craft.CRAFT_RATE_LINE_RE = /^([^:]+?):\s*([\d.]+)%(?:\s*$|\s*\|\s*PRNG\s+starts\s+at\s+attempt:\s*(\d+))/;
  craft.CRAFT_USAGE_LINE_RE = /^(?:Usage:\s*\/craft\b|To view pity:\s*\/pity\b)/i;
  craft.PITY_HEADER_RE = /^All\s+pity\s+for\s+(.+?):/i;
  craft.PITY_SINGLE_HEADER_RE = /^(.+?)\s+pity:\s*(?:([\d.]+)%\s*\(\+([\d.]+)\s*pity\))?\s*$/i;
  craft.PITY_RATE_ONLY_RE = /^([\d.]+)%\s*\(\+([\d.]+)\s*pity\)\s*$/i;
  craft.PITY_LINE_RE = /^([^:]+?):\s*([\d.]+)%\s*\(\+([\d.]+)\s*pity\)/i;

  craft.LOBBY_PRESETS = [
    {
      name: 'Line Maze',
      short: 'Line',
      tiers: [
        'Common', 'Unusual', 'Rare', 'Epic', 'Legendary', 'Mythic',
        'Ultra', 'Super', 'Unique', 'Eternal',
      ],
      rates: {
        'Unusual': 64,
        'Rare': 32,
        'Epic': 16,
        'Legendary': 8,
        'Mythic': 4,
        'Ultra': 2,
        'Super': 1,
        'Eternal': 0.1,
      },
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

  craft.STAR_CENTER = { x: 130, y: 100 };
  craft.STAR_OUTER = 65;
  craft.STAR_INNER = 48;
  craft.STAR_POINTS = [];
  for (var _sk = 0; _sk < 10; _sk++) {
    var _sa = (-Math.PI / 2) + _sk * (Math.PI / 5);
    var _sr = (_sk % 2 === 0) ? craft.STAR_OUTER : craft.STAR_INNER;
    craft.STAR_POINTS.push({
      x: craft.STAR_CENTER.x + _sr * Math.cos(_sa),
      y: craft.STAR_CENTER.y + _sr * Math.sin(_sa),
    });
  }

  craft.setFastCraft = function (val) {
    craft.fastCraft = !!val;
    try { localStorage.setItem('craftMenuFastCraft', String(craft.fastCraft)); } catch (_) {}
  };

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

  craft.fetchCraftRates = function () {
    if (craft.liveCraftRates || craft.craftRatesFetching) return;
    if (typeof captureChatMessage !== 'function') return;
    if (typeof sendChatMessage !== 'function') return;
    var s = state;
    if (!s || !s.socket || s.socket.readyState !== WebSocket.OPEN) return;

    var lobby = craft.detectLobby(s);
    if (!lobby || lobby.name !== 'Desert Maze') return;
    craft.craftRatesFetching = true;
    var p = captureChatMessage(
      function (e) {
        return e.type === 1 && (
          craft.CRAFT_RATE_LINE_RE.test(e.message) ||
          craft.CRAFT_USAGE_LINE_RE.test(e.message)
        );
      },

      { count: 34, idleMs: 800, timeoutMs: 20000 }
    );
    if (!sendChatMessage('/craft')) {
      craft.craftRatesFetching = false;
      return;
    }
    p.then(function (lines) {
      var rates = {};
      for (var i = 0; i < lines.length; i++) {
        var m = craft.CRAFT_RATE_LINE_RE.exec(lines[i].message);
        if (m) rates[m[1].trim()] = parseFloat(m[2]);
      }
      if (Object.keys(rates).length) {
        craft.liveCraftRates = rates;
        if (craft.panel && craft.panel.style.display !== 'none') craft.render();
      } else {
        craft.dwarn('/craft response empty; using hardcoded rates');
      }
    }).catch(function (err) {
      craft.derror('craft rate fetch failed', err);
    }).finally(function () {
      craft.craftRatesFetching = false;
    });
  };

  craft.getCraftRate = function (tierName) {
    if (craft.liveCraftRates && craft.liveCraftRates[tierName] != null) return craft.liveCraftRates[tierName];
    var preset = craft.detectLobby(state);
    if (preset && preset.rates && preset.rates[tierName] != null) return preset.rates[tierName];
    return undefined;
  };

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

      if (/^(?:Current\s+Attempt|Attempts\s+for\s+PRNG):/i.test(msg)) {
        craft._pityLastMessageAt = now;
        return craft._pitySuppressingCurrent;
      }
      return false;
    }, { count: 1000000000, idleMs: 1000000000, timeoutMs: 1000000000 });
    craft.dlog('pity interceptor active');
  };

  craft.fetchPityForTier = function (targetTier, petalName) {
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
      if (ok) return preset;
    }
    return null;
  };

  craft._cellCache = new Map();
  craft._cellCacheKeys = [];
  craft._CELL_CACHE_MAX = 2000;
  craft.getCellBitmap = function (petalIdx, rarIdx, displayed, SIZE) {
    var key = petalIdx + '|' + rarIdx + '|' + displayed + '|' + SIZE;
    var hit = craft._cellCache.get(key);
    if (hit) return hit;
    var off = (typeof OffscreenCanvas !== 'undefined')
      ? new OffscreenCanvas(SIZE, SIZE)
      : document.createElement('canvas');
    off.width = SIZE; off.height = SIZE;
    var octx = off.getContext('2d');
    try {
      var src = getPetalIcon(petalIdx, rarIdx);
      if (src) octx.drawImage(src, 0, 0, SIZE, SIZE);
    } catch (_) {}
    if (displayed > 1) {
      octx.fillStyle = '#fff';
      octx.strokeStyle = '#000';
      octx.lineWidth = 2;
      octx.font = 'bold ' + Math.round(SIZE * 0.25) + 'px Ubuntu';
      octx.textAlign = 'right';
      octx.textBaseline = 'top';
      var txt = displayed > 1000
        ? 'x' + (displayed / 1000).toFixed(1) + 'k'
        : 'x' + displayed;
      octx.strokeText(txt, SIZE - 4, 4);
      octx.fillText(txt, SIZE - 4, 4);
    }
    craft._cellCache.set(key, off);
    craft._cellCacheKeys.push(key);
    if (craft._cellCacheKeys.length > craft._CELL_CACHE_MAX) {
      craft._cellCache.delete(craft._cellCacheKeys.shift());
    }
    return off;
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

  craft._cellObserver = null;
  craft.makeCellObserver = function (root) {
    if (typeof IntersectionObserver === 'undefined') return null;
    var obs = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (!entry.isIntersecting) continue;
        var el = entry.target;
        if (el._craftInflated) { obs.unobserve(el); continue; }
        var ds = el.dataset;
        var pidx = +ds.fcPidx, ridx = +ds.fcRidx;
        var disp = +ds.fcDisp, sz = +ds.fcSize;
        var bitmap = craft.getCellBitmap(pidx, ridx, disp, sz);
        if (!bitmap) { obs.unobserve(el); continue; }
        var cv = document.createElement('canvas');
        cv.width = sz; cv.height = sz;
        cv.style.cssText =
          'width:' + sz + 'px;height:' + sz + 'px;display:block;pointer-events:none;';
        try { cv.getContext('2d').drawImage(bitmap, 0, 0); } catch (_) {}
        el.appendChild(cv);
        el._craftInflated = true;
        obs.unobserve(el);
      }
    }, { root: root, rootMargin: '400px 0px 400px 0px', threshold: 0 });
    return obs;
  };

  craft._searchDebounceTimer = null;
  craft._SEARCH_DEBOUNCE_MS = 80;

  craft.clearCellCaches = function () {
    craft._cellCache.clear();
    craft._cellCacheKeys.length = 0;
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
      craft.panel.style.width = '95vw';
      craft.panel.style.maxWidth = 'none';
      craft.panel.style.height = '95vh';
      craft.panel.style.maxHeight = '95vh';
      craft.panel.style.left = '2.5vw';
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
    }
    var shouldShow = !!lobby;
    var newDisplay = shouldShow ? '' : 'none';
    if (craft.btn.style.display !== newDisplay) {
      craft.btn.style.display = newDisplay;
      if (!shouldShow) {
        if (craft.panel) craft.panel.style.display = 'none';
        if (craft.tip) craft.tip.style.display = 'none';
        craft.hoverEntry = null;
      }
    }
  };

  craft.inject = function () {
    try {
      craft.injectStyles();
      var c = document.getElementById('bottomButtons');
      if (!c) return;
      if (document.getElementById('craftMenuButton')) return;

      craft.btn = document.createElement('button');
      craft.btn.id = 'craftMenuButton';
      craft.btn.tabIndex = -1;
      craft.btn.style.width = '40px';
      craft.btn.style.height = '40px';
      craft.btn.style.backgroundColor = 'rgba(219,157,90,0.5)';
      craft.btn.style.border = '3px solid #6e4924';
      craft.btn.style.display = 'none';

      craft.panel = document.createElement('div');
      craft.panel.id = 'craftMenuPanel';

      craft.panel.style.cssText =
        'position:fixed;display:none;flex-direction:column;' +
        'background:#db9d5a;border-radius:8px;border:4px solid #a47040;' +
        'padding:8px;z-index:9999;font-family:Ubuntu,sans-serif;color:#fff;' +
        'overflow:hidden;box-sizing:border-box;';
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
      craft.injectFastCraftToggle();

      craft.updateButtonVisibility();
      setInterval(craft.updateButtonVisibility, 500);

      setInterval(craft.fetchInitialPity, craft.PITY_INIT_POLL_MS);
    } catch (err) {
      craft.derror('inject failed', err);
    }
  };

  craft.injectFastCraftToggle = function () {
    if (document.getElementById('fastCraftCheckbox')) return;
    var menu = document.querySelector('#menus #optionsMenu');
    if (!menu) {
      if (craft.fastCraftInjectAttempts++ < 50) setTimeout(craft.injectFastCraftToggle, 200);
      return;
    }
    var label = document.createElement('label');
    label.setAttribute('for', 'fastCraftCheckbox');
    label.textContent = 'Fast Craft:';
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = 'fastCraftCheckbox';
    cb.name = 'fastCraftCheckbox';
    cb.checked = craft.fastCraft;
    cb.addEventListener('change', function () { craft.setFastCraft(cb.checked); });
    menu.appendChild(label);
    menu.appendChild(cb);
    menu.appendChild(document.createElement('br'));
  };

  craft.setupCraftChatLogger = function () {
    craft.dlog('craft chat listener registered');
    onChatMessage(function (evt) {

      if (!evt) return;
      var msg = String(evt.message || '');

      function scheduleResult(prev, build) {
        if (!craft.craftResult || craft.craftResult.type !== 'pending') return;
        var result = build();
        if (craft.fastCraft) {
          craft.setCraftResult(result);
          return;
        }
        var tokenAtSchedule = craft.craftResultToken;
        setTimeout(function () {
          if (craft.craftResultToken !== tokenAtSchedule) return;
          if (!craft.craftResult || craft.craftResult.type !== 'pending') return;
          craft.setCraftResult(result);
        }, craft.FALL_DURATION_MS);
      }

      var ok = /Crafted\s+(\d+)\b[^()]*\((\d+)\s*left/i.exec(msg);
      if (ok) {
        var gained = parseInt(ok[1], 10);
        craft.dlog('craft success (Desert), crafted ' + gained + ', ' + ok[2] + ' left');
        var prevS = craft.craftResult || {};
        scheduleResult(prevS, function () {
          return {
            type: 'success',
            delta: gained,
            petalIdx: prevS.petalIdx,
            fromRarity: prevS.fromRarity,
            slots: prevS.slots,
          };
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
          scheduleResult(prevS, function () {
            return {
              type: 'success',
              delta: gained,
              petalIdx: prevS.petalIdx,
              fromRarity: prevS.fromRarity,
              slots: prevS.slots,
            };
          });
        } else {
          var attemptsMulti = Math.max(1, Math.round(consumedMulti / 5));
          craft.dlog('craft failed (Line multi, 0 gained), consumed ' + consumedMulti + ', ~' + attemptsMulti + ' attempts');
          var prevF = craft.craftResult || {};
          scheduleResult(prevF, function () {
            return {
              type: 'fail',
              attempts: attemptsMulti,
              petalIdx: prevF.petalIdx,
              fromRarity: prevF.fromRarity,
              slots: prevF.slots,
            };
          });
        }
        return;
      }

      if (/^Crafted\s+[A-Za-z]/.test(msg) && !/\(/.test(msg) && !/Mass\s*craft/i.test(msg)) {
        craft.dlog('craft success (Line single), crafted 1');
        var prevS = craft.craftResult || {};
        scheduleResult(prevS, function () {
          return {
            type: 'success',
            delta: 1,
            petalIdx: prevS.petalIdx,
            fromRarity: prevS.fromRarity,
            slots: prevS.slots,
          };
        });
        return;
      }

      var fail = /[Cc]raft[^()]*?fail[^()]*?(\d+)\s*attempt[^()]*\((\d+)\s*left/i.exec(msg);
      if (fail) {
        var attempts = parseInt(fail[1], 10);
        craft.dlog('craft failed (Desert), ' + fail[2] + ' left');

        var prevF = craft.craftResult || {};
        scheduleResult(prevF, function () {
          return {
            type: 'fail',
            attempts: attempts,
            petalIdx: prevF.petalIdx,
            fromRarity: prevF.fromRarity,
            slots: prevF.slots,
          };
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
        scheduleResult(prevF, function () {
          return {
            type: 'fail',
            attempts: attempts,
            petalIdx: prevF.petalIdx,
            fromRarity: prevF.fromRarity,
            slots: prevF.slots,
          };
        });
        return;
      }

    });
  };

  craft.togglePanel = function () {
    if (!craft.panel) return;
    if (craft.panel.style.display === 'none') {
      craft.render();
      craft.panel.style.display = 'flex';
    } else {
      craft.panel.style.display = 'none';
      craft.hoverEntry = null;
      craft.tip.style.display = 'none';
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
    if (craft.panel && craft.panel.style.display !== 'none') craft.render();

    if (result && result.type === 'success') return;
    setTimeout(function () {
      if (craft.craftResultToken === t) {
        craft.craftResult = null;
        if (craft.panel && craft.panel.style.display !== 'none') craft.render();
      }
    }, craft.CRAFT_RESULT_TTL_MS);
  };

  craft.loadCraft = function (petalIdx, rarity, owned, shift) {

    if (craft.craftResult && craft.craftResult.type !== 'pending') {
      craft.craftResult = null;
      craft.craftResultToken++;
    }

    if (craft._simNextOutcome != null) {
      craft.dlog('re-stage cleared pending SimCraft outcome:', craft._simNextOutcome);
      craft._simNextOutcome = null;
    }
    if (shift) {
      craft.craftPetalIdx = petalIdx;
      craft.craftRarity = rarity;
      var per = Math.floor(owned / 5);
      var rem = owned - per * 5;
      var counts = [per, per, per, per, per];
      var idxs = [0, 1, 2, 3, 4];
      for (var i = idxs.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = idxs[i]; idxs[i] = idxs[j]; idxs[j] = t;
      }
      for (var k = 0; k < rem; k++) counts[idxs[k]]++;
      craft.craftSlots = counts;
      return;
    }

    var sameTarget = craft.craftPetalIdx === petalIdx && craft.craftRarity === rarity && craft.craftPetalIdx != null;
    if (sameTarget) {
      var staged = 0;
      for (var s = 0; s < 5; s++) staged += craft.craftSlots[s];
      if (owned - staged >= 5) {
        for (var ii = 0; ii < 5; ii++) craft.craftSlots[ii]++;
      }
    } else {
      craft.craftPetalIdx = petalIdx;
      craft.craftRarity = rarity;
      craft.craftSlots = [1, 1, 1, 1, 1];
    }
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

    var lobbyForCraft = craft.detectLobby(s);
    var craftPetalToken = petalName;
    if (lobbyForCraft && lobbyForCraft.name === 'Line Maze' &&
        craft.PETAL_NAME_SHORTHAND[petalName]) {
      craftPetalToken = craft.PETAL_NAME_SHORTHAND[petalName];
    }
    sendChatMessage('/craft ' + tierName + ' ' + craftPetalToken + ' ' + total);

    craft.orbitLastPositions = [];
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
    var poll = setInterval(function () {
      var st = state;
      var fresh = JSON.stringify(st && st.inventory);
      if (fresh !== snapshot || Date.now() > deadline) {
        clearInterval(poll);
        craft.clearCraft();

        if (craft.panel && craft.panel.style.display !== 'none' && !craft.craftResult) {
          craft.render();
        }
      }
    }, 100);
  };

  craft.starPoint = function (progress) {
    var t = (progress - Math.floor(progress)) * 10;
    var i0 = Math.floor(t) % 10;
    var localT = t - Math.floor(t);
    var p0 = craft.STAR_POINTS[(i0 + 9) % 10];
    var p1 = craft.STAR_POINTS[i0];
    var p2 = craft.STAR_POINTS[(i0 + 1) % 10];
    var p3 = craft.STAR_POINTS[(i0 + 2) % 10];
    var t2 = localT * localT;
    var t3 = t2 * localT;
    return {
      x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * localT + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
      y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * localT + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
    };
  };

  craft.stopOrbitAnimation = function () {
    if (craft.orbitRAF) cancelAnimationFrame(craft.orbitRAF);
    craft.orbitRAF = null;
  };
  craft.stopEaseAnimation = function () {
    if (craft.easeRAF) cancelAnimationFrame(craft.easeRAF);
    craft.easeRAF = null;
  };

  craft.startOrbitAnimation = function (container) {
    craft.stopOrbitAnimation();

    if (craft.fastCraft) { craft.orbitRAF = null; return; }

    var slots = container.querySelectorAll('[data-craft-orbit]');
    if (!slots.length) {
      craft.orbitRAF = null;
      return;
    }
    var start = performance.now();
    function tick(now) {
      if (!craft.craftResult || craft.craftResult.type !== 'pending') {
        craft.orbitRAF = null;
        return;
      }
      if (!craft._pageActive) {
        craft.orbitRAF = requestAnimationFrame(tick);
        return;
      }
      var progress = ((now - start) / craft.ORBIT_DURATION_MS) % 1;
      craft.orbitCurrentProgress = progress;
      for (var i = 0; i < slots.length; i++) {
        var p = (progress + i / 5) % 1;
        var pt = craft.starPoint(p);
        var tx = pt.x - 25, ty = pt.y - 25;
        slots[i].style.transform = 'translate(' + tx + 'px,' + ty + 'px)';

        craft.orbitLastPositions[i] = { x: tx, y: ty };
      }
      craft.orbitRAF = requestAnimationFrame(tick);
    }
    craft.orbitRAF = requestAnimationFrame(tick);
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

  craft.startEaseAnimation = function (container, type) {
    craft.stopEaseAnimation();
    if (!craft.craftResult || (craft.craftResult.type !== 'success' && craft.craftResult.type !== 'fail')) {
      return;
    }
    var slots = container.querySelectorAll('[data-craft-ease]');
    if (!slots.length) {

      craft.craftResult._easeComplete = true;
      return;
    }
    var startTime = craft.craftResult._easeStartTime;
    if (!startTime) {
      startTime = performance.now();
      craft.craftResult._easeStartTime = startTime;
    }

    var slotProgresses = [];
    for (var i = 0; i < 5; i++) {
      slotProgresses[i] = (craft.orbitCurrentProgress + i / 5) % 1;
    }
    var tokenAtSchedule = craft.craftResultToken;
    function tick(now) {
      if (craft.craftResultToken !== tokenAtSchedule) { craft.easeRAF = null; return; }
      if (!craft.craftResult || (craft.craftResult.type !== 'success' && craft.craftResult.type !== 'fail')) {
        craft.easeRAF = null;
        return;
      }
      var p = Math.min(1, (now - startTime) / craft.EASE_DURATION_MS);
      var inv = 1 - p;
      var eased = 1 - inv * inv;
      if (type === 'fail') {
        for (var i = 0; i < slots.length; i++) {
          var pStart = slotProgresses[i];
          var pCurrent = (pStart + 0.2 * eased) % 1;
          var pt = craft.starPoint(pCurrent);
          slots[i].style.transform = 'translate(' + (pt.x - 25) + 'px,' + (pt.y - 25) + 'px)';
        }
      } else {

        for (var i = 0; i < slots.length; i++) {
          var sp = craft.orbitLastPositions[i];
          if (!sp) continue;
          var rx = sp.x + 25 - craft.STAR_CENTER.x;
          var ry = sp.y + 25 - craft.STAR_CENTER.y;
          var startAngle = Math.atan2(ry, rx);
          var startRadius = Math.sqrt(rx * rx + ry * ry);
          var angle = startAngle + craft.SUCCESS_SPIRAL_SWEEP * eased;
          var radius = startRadius * (1 - eased);
          var x = craft.STAR_CENTER.x + radius * Math.cos(angle) - 25;
          var y = craft.STAR_CENTER.y + radius * Math.sin(angle) - 25;
          slots[i].style.transform = 'translate(' + x + 'px,' + y + 'px)';
        }
      }
      if (p < 1) {
        craft.easeRAF = requestAnimationFrame(tick);
      } else {
        craft.easeRAF = null;
        craft.craftResult._easeComplete = true;
        if (craft.panel && craft.panel.style.display !== 'none') craft.render();
      }
    }
    craft.easeRAF = requestAnimationFrame(tick);
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

  craft.renderCraftArea = function (getIcon) {
    var box = document.createElement('div');

    box.style.cssText =
      'position:relative;height:200px;background:transparent;' +
      'margin-bottom:8px;flex:0 0 auto;overflow:hidden;';

    var SLOT = 50;
    var slotPositions = [
      { left: 105, top: 10  },
      { left: 167, top: 55  },
      { left: 143, top: 128 },
      { left: 67,  top: 128 },
      { left: 43,  top: 55  },
    ];
    var EMPTY_BG = '#a06d3e';

    var hasSnap = craft.craftResult && Array.isArray(craft.craftResult.slots);
    var snapSlots = hasSnap ? craft.craftResult.slots : craft.craftSlots;
    var snapPetalIdx = hasSnap ? craft.craftResult.petalIdx : craft.craftPetalIdx;
    var snapRarity = hasSnap ? craft.craftResult.fromRarity : craft.craftRarity;

    var orbiting = craft.craftResult && craft.craftResult.type === 'pending';
    var merging = craft.craftResult && craft.craftResult.type === 'success';
    var failed = craft.craftResult && craft.craftResult.type === 'fail';

    var easeComplete = (merging || failed) && craft.craftResult._easeComplete;
    var easing = (merging || failed) && !easeComplete && !craft.fastCraft;
    if ((merging || failed) && craft.fastCraft && !craft.craftResult._easeComplete) {

      craft.craftResult._easeComplete = true;
      easeComplete = true;
      easing = false;
    }
    var firstFinalFrame = merging && easeComplete && !craft.craftResult._mergeStarted;
    if (firstFinalFrame) craft.craftResult._mergeStarted = true;

    if (!merging || easing) {
      for (var i = 0; i < 5; i++) {
        var slot = document.createElement('div');

        var filled = !failed && snapSlots[i] > 0 && snapPetalIdx != null && snapRarity != null;
        var clickable = filled && !craft.craftResult;

        var initLeft = slotPositions[i].left, initTop = slotPositions[i].top;
        if (easing && craft.orbitLastPositions[i]) {
          initLeft = craft.orbitLastPositions[i].x;
          initTop = craft.orbitLastPositions[i].y;
        }
        slot.style.cssText =
          'position:absolute;left:0;top:0;transition:none;' +
          'width:' + SLOT + 'px;height:' + SLOT + 'px;background:' + EMPTY_BG + ';' +
          'border-radius:8px;cursor:' + (clickable ? 'pointer' : 'default') + ';' +
          'transform:translate(' + initLeft + 'px,' + initTop + 'px);' +
          ((orbiting && filled) || easing ? 'will-change:transform;' : '');
        if (orbiting && filled) slot.setAttribute('data-craft-orbit', String(i));

        if (easing) slot.setAttribute('data-craft-ease', String(i));

        if (filled) {
          var sc = document.createElement('canvas');
          sc.width = SLOT; sc.height = SLOT;
          sc.style.cssText = 'width:' + SLOT + 'px;height:' + SLOT + 'px;display:block;';
          var sctx = sc.getContext('2d');
          try {
            sctx.drawImage(getIcon(snapPetalIdx, snapRarity), 0, 0, SLOT, SLOT);
          } catch (_) {}
          sctx.fillStyle = '#fff';
          sctx.strokeStyle = '#000';
          sctx.lineWidth = 2;
          sctx.font = 'bold 12px Ubuntu';
          sctx.textAlign = 'right';
          sctx.textBaseline = 'top';
          var t = snapSlots[i] >= 1e6 ? 'x' + (snapSlots[i] / 1e6).toFixed(1).replace(/\.0$/, '') + ' million' : 'x' + snapSlots[i];
          sctx.strokeText(t, SLOT - 4, 4);
          sctx.fillText(t, SLOT - 4, 4);
          slot.appendChild(sc);

          if (clickable) {
            slot.addEventListener('click', function () {

              craft.clearCraft();
              craft.render();
            });
          }

          (function (pi, ri, el) {
            el.addEventListener('mouseenter', function () {
              craft.hoverEntry = { index: pi, rarity: ri };
              craft.showTooltip(el);
            });
            el.addEventListener('mouseleave', function () {
              if (craft.hoverEntry && craft.hoverEntry.index === pi && craft.hoverEntry.rarity === ri) {
                craft.hoverEntry = null;
                craft.tip.style.display = 'none';
              }
            });
          })(snapPetalIdx, snapRarity, slot);
        }

        box.appendChild(slot);
      }
    }

    if (merging && easeComplete && snapPetalIdx != null && snapRarity != null) {
      var resultRarity = snapRarity + 1;
      var st = state;
      var resultTier = st && st.tiers && st.tiers[resultRarity];
      if (resultTier) {
        var centerSlot = document.createElement('div');
        centerSlot.style.cssText =
          'position:absolute;' +
          'left:' + (craft.STAR_CENTER.x - SLOT / 2) + 'px;' +
          'top:' + (craft.STAR_CENTER.y - SLOT / 2) + 'px;' +
          'width:' + SLOT + 'px;height:' + SLOT + 'px;background:' + EMPTY_BG + ';' +
          'border-radius:8px;cursor:pointer;';

        centerSlot.addEventListener('click', function () {
          craft.craftResult = null;
          craft.craftResultToken++;
          craft.clearCraft();
          craft.render();
        });
        var csc = document.createElement('canvas');
        csc.width = SLOT; csc.height = SLOT;
        csc.style.cssText = 'width:' + SLOT + 'px;height:' + SLOT + 'px;display:block;';
        var csctx = csc.getContext('2d');
        try {
          csctx.drawImage(getIcon(snapPetalIdx, resultRarity), 0, 0, SLOT, SLOT);
        } catch (_) {}
        csctx.fillStyle = '#fff';
        csctx.strokeStyle = '#000';
        csctx.lineWidth = 2;
        csctx.font = 'bold 12px Ubuntu';
        csctx.textAlign = 'right';
        csctx.textBaseline = 'top';
        var cct = 'x' + craft.craftResult.delta;
        csctx.strokeText(cct, SLOT - 4, 4);
        csctx.fillText(cct, SLOT - 4, 4);
        centerSlot.appendChild(csc);

        (function (pi, ri, el) {
          el.addEventListener('mouseenter', function () {
            craft.hoverEntry = { index: pi, rarity: ri };
            craft.showTooltip(el);
          });
          el.addEventListener('mouseleave', function () {
            if (craft.hoverEntry && craft.hoverEntry.index === pi && craft.hoverEntry.rarity === ri) {
              craft.hoverEntry = null;
              craft.tip.style.display = 'none';
            }
          });
        })(snapPetalIdx, resultRarity, centerSlot);
        box.appendChild(centerSlot);
      }
    }

    if (firstFinalFrame) {
      var burstStateRef = state;
      var burstTier = burstStateRef && burstStateRef.tiers && burstStateRef.tiers[snapRarity + 1];
      var burstColor = (burstTier && burstTier.color) || '#ffd860';
      craft.spawnSuccessBurst(box, craft.STAR_CENTER.x, craft.STAR_CENTER.y, burstColor);
    }

    if (orbiting) {
      craft.startOrbitAnimation(box);
      craft.stopEaseAnimation();
    } else if (easing) {
      craft.stopOrbitAnimation();
      craft.startEaseAnimation(box, merging ? 'success' : 'fail');
    } else {
      craft.stopOrbitAnimation();
      craft.stopEaseAnimation();
    }

    var craftBtn = document.createElement('button');
    craftBtn.textContent = 'Craft';
    craftBtn.style.cssText =
      'position:absolute;left:260px;top:80px;background:#cfcfcf;' +
      'border:2px solid #aaa;border-radius:6px;padding:4px 18px;' +
      'font-family:Ubuntu,sans-serif;font-weight:bold;font-size:14px;' +
      'cursor:pointer;color:#000;';
    craftBtn.addEventListener('click', craft.doCraft);
    box.appendChild(craftBtn);

    var rateText = '?';
    if (craft.craftRarity != null) {
      var st = state;

      var nextTier = st && st.tiers && st.tiers[craft.craftRarity + 1];
      var tn = nextTier && nextTier.name;
      if (tn) {
        var pname = craft.craftPetalIdx != null ? craft.getCraftPetalName(st, craft.craftPetalIdx) : null;
        var pityRate = pname && craft.pityRates[tn] && craft.pityRates[tn][pname];
        if (pityRate != null) {
          rateText = String(pityRate);
        } else {
          var rate = craft.getCraftRate(tn);
          if (rate != null) rateText = String(rate);
        }
      }
    }
    var sr = document.createElement('div');
    sr.textContent = rateText + '% success rate';
    sr.style.cssText =
      'position:absolute;left:245px;top:125px;color:#fff;font-weight:bold;' +
      'font-size:13px;font-family:Ubuntu,sans-serif;' +
      'text-shadow:1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000;';
    box.appendChild(sr);

    if (craft.craftResult) {
      var color, text;
      if (craft.craftResult.type === 'success') {
        color = '#4ade80';
        text = 'Success. +' + craft.craftResult.delta;
      } else if (craft.craftResult.type === 'fail') {
        color = '#ff6b6b';
        text = 'Failed after ' + craft.craftResult.attempts + ' attempt(s).';
      } else {
        color = '#fff';
        text = 'Crafting...';
      }
      var rDiv = document.createElement('div');
      rDiv.textContent = text;
      rDiv.style.cssText =
        'position:absolute;left:370px;top:90px;color:' + color + ';' +
        'font-weight:bold;font-size:20px;font-family:Ubuntu,sans-serif;' +
        'text-shadow:1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000;';
      box.appendChild(rDiv);
    }

    return box;
  };

  craft.render = function () {
    try {
      var s = state;
      var getIcon = getPetalIcon;

      var oldWrap = document.getElementById('craftMenuGridWrapper');
      var savedScrollTop = oldWrap ? oldWrap.scrollTop : 0;
      var savedScrollLeft = oldWrap ? oldWrap.scrollLeft : 0;

      craft.panel.innerHTML = '';

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

      craft.fetchCraftRates();

      craft.panel.appendChild(craft.renderCraftArea(getIcon));

      var petalIdxSet = new Set();
      Object.keys(s.inventory).forEach(function (tn) {
        var petals = s.inventory[tn] || {};
        Object.keys(petals).forEach(function (pid) {
          if (petals[pid] > 0) petalIdxSet.add(Number(pid));
        });
      });
      var petalIndices = Array.from(petalIdxSet);
      petalIndices.sort(function (a, b) {
        var an = (s.petalConfigs[a] || {}).name || '';
        var bn = (s.petalConfigs[b] || {}).name || '';
        return an.localeCompare(bn);
      });

      var emptyInventory = !petalIndices.length;

      if (craft.searchQuery) {
        var q = craft.searchQuery.toLowerCase();
        petalIndices = petalIndices.filter(function (idx) {
          var name = ((s.petalConfigs[idx] || {}).name || '').toLowerCase();
          return name.indexOf(q) !== -1;
        });
      }

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

      craft._cellObserver = craft.makeCellObserver(gridWrapper);

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

      var stagedTotal = 0;
      for (var st = 0; st < 5; st++) stagedTotal += craft.craftSlots[st];

      petalIndices.forEach(function (petalIdx) {
        s.tiers.forEach(function (tier, rarIdx) {
          var owned = (s.inventory[tier.name] || {})[petalIdx] || 0;
          var staged = (petalIdx === craft.craftPetalIdx && rarIdx === craft.craftRarity) ? stagedTotal : 0;
          var displayed = owned - staged;
          if (displayed > 0) {
            var canCraft = displayed >= 5;
            var host = document.createElement('div');
            host.style.cssText =
              'box-sizing:border-box;' +
              'width:' + SIZE + 'px;height:' + SIZE + 'px;' +
              'background:#a87545;border-radius:6px;' +
              'cursor:' + (canCraft ? 'pointer' : 'default') + ';' +
              (canCraft ? '' : 'filter:grayscale(1);opacity:0.55;');
            host.dataset.fcPidx = petalIdx;
            host.dataset.fcRidx = rarIdx;
            host.dataset.fcDisp = displayed;
            host.dataset.fcSize = SIZE;
            (function (pi, ri, ownedCount, canClick, el) {
              el.addEventListener('mouseenter', function () {
                craft.hoverEntry = { index: pi, rarity: ri };
                craft.showTooltip(el);
              });
              el.addEventListener('mouseleave', function () {
                if (craft.hoverEntry && craft.hoverEntry.index === pi && craft.hoverEntry.rarity === ri) {
                  craft.hoverEntry = null;
                  craft.tip.style.display = 'none';
                }
              });
              if (canClick) {
                el.addEventListener('click', function (ev) {
                  craft.loadCraft(pi, ri, ownedCount, !!ev.shiftKey);
                  craft.render();
                });
              }
            })(petalIdx, rarIdx, owned, canCraft, host);
            var _cellKey = petalIdx + '|' + rarIdx + '|' + displayed + '|' + SIZE;
            if (craft._cellCache.has(_cellKey)) {
              var _bm = craft._cellCache.get(_cellKey);
              var _cv = document.createElement('canvas');
              _cv.width = SIZE; _cv.height = SIZE;
              _cv.style.cssText = 'width:' + SIZE + 'px;height:' + SIZE + 'px;display:block;pointer-events:none;';
              try { _cv.getContext('2d').drawImage(_bm, 0, 0); } catch (_) {}
              host.appendChild(_cv);
              host._craftInflated = true;
            } else if (craft._cellObserver) {
              craft._cellObserver.observe(host);
            }
            grid.appendChild(host);
          } else {
            var ph = document.createElement('div');
            ph.style.cssText =
              'box-sizing:border-box;' +
              'width:' + SIZE + 'px;height:' + SIZE + 'px;' +
              'background:#a87545;border-radius:6px;';
            grid.appendChild(ph);
          }
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
      }
    } catch (err) {
      craft.derror('render failed', err);
    }
  };

  craft.showTooltip = function (target) {
    try {
      if (!craft.hoverEntry) return;
      var img = craft.getTooltipBitmap(craft.hoverEntry.index, craft.hoverEntry.rarity);
      if (!img) return;
      var bw = 320;
      var bh = Math.round(bw * img.height / img.width);
      craft.tipCanvas.width = img.width;
      craft.tipCanvas.height = img.height;
      var tctx = craft.tipCanvas.getContext('2d');
      tctx.clearRect(0, 0, img.width, img.height);
      tctx.drawImage(img, 0, 0);
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
        var tw = craft.tip.offsetWidth || bw;
        var th = craft.tip.offsetHeight || bh;
        var x = rect.right + 8;
        if (x + tw > window.innerWidth - 2) x = rect.left - tw - 8;
        if (x < 2) x = 2;
        var y = rect.top;
        if (y + th > window.innerHeight - 2) y = window.innerHeight - th - 2;
        if (y < 2) y = 2;
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
    craft.orbitLastPositions = [];
    craft.setCraftResult({
      type: 'pending',
      delta: count,
      petalIdx: petalIdx,
      fromRarity: rarityIdx,
      slots: counts,
      startedAt: performance.now(),
    });
    craft.clearCraft();
    var token = craft.craftResultToken;
    setTimeout(function () {
      if (craft.craftResultToken !== token) return;
      if (!craft.craftResult || craft.craftResult.type !== 'pending') return;
      if (outcome === 'fail') {
        craft.setCraftResult({ type: 'fail', attempts: attemptsCount, petalIdx: petalIdx, fromRarity: rarityIdx, slots: counts });
      } else {
        craft.setCraftResult({ type: 'success', delta: successes, petalIdx: petalIdx, fromRarity: rarityIdx, slots: counts });
      }
    }, craft.FALL_DURATION_MS);
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
    if (craftRef.panel && craftRef.panel.style.display === 'none') craftRef.panel.style.display = 'flex';
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
  if (craftRef.panel && craftRef.panel.style.display === 'none') craftRef.panel.style.display = 'flex';
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
