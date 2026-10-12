import * as net from "./net.js";
import { mouse } from "./net.js";
import { getPetalIcon, petalTooltip } from "./renders.js";
import { uiScale } from "./canvas.js";
import { SERVER_BOUND } from "./protocol.js";
import {
    beginInventoryDragDrop,
    inventoryDragConfig,
    dragConfig,
    DRAG_TYPE_MAINDOCKER,
    DRAG_TYPE_SECONDARYDOCKER,
} from "./dragAndDrop.js";

const SLOT_SIZE = 45;
const TOOLTIP_WIDTH = 280;
const TOOLTIP_GAP = 8;
const MAX_PANEL_HEIGHT = 430;
const DRAG_THRESHOLD = 5;
const TAP_MS = 300;
const TAP_TO_EQUIP = true;
const TOGGLE_KEY = "z";
const EAGER_SLOTS = 40;
const HIGHEST_RARITY_FIRST = true;
const STACK_GROUP = -1;

export function formatAmount(v) {
    if (Number.isNaN(v)) return "0";
    if (!Number.isFinite(v)) return "∞";

    const f = (num, div, suffix) => {
        const val = num / div;
        const str = val.toFixed(1);
        return str.endsWith(".0") ? Math.floor(val) + suffix : str + suffix;
    };

    if (v >= 1e18) return f(v, 1e18, "Qt");
    if (v >= 1e15) return f(v, 1e15, "Qd");
    if (v >= 1e12) return f(v, 1e12, "t");
    if (v >= 1e9) return f(v, 1e9, "b");
    if (v >= 1e6) return f(v, 1e6, "m");
    if (v >= 1e3) return f(v, 1e3, "k");

    return Math.floor(v).toString();
}

function loadPref(key, fallback) {
    try {
        const v = localStorage.getItem("floof.inventory." + key);
        return v === null ? fallback : v;
    } catch {
        return fallback;
    }
}

function savePref(key, value) {
    try {
        localStorage.setItem("floof.inventory." + key, String(value));
    } catch {}
}

let searchTerms = [];
let stackMode = loadPref("stack", "0") === "1";
let lastRenderedVersion = -1;
let refreshQueued = false;
let needsRetry = false;
let pendingAnimate = false;

const slots = new Map();
const sections = new Map();

const menu = document.querySelector("#menus2 #inventory");

if (!menu) {
    console.warn("[inventory] #menus2 #inventory not found, inventory UI disabled");
}

const style = document.createElement("style");
style.textContent = `
#menus2 #inventory {
    display: flex; flex-direction: column; width: 285px; height: auto; max-height: min(${MAX_PANEL_HEIGHT}px, 75vh);
    padding: 5px 0 12px; overflow: hidden; border-width: 5px; border-radius: 4px;
    background-color: #5a9fdb !important; border-color: #4981b1 !important;
    color: #fff; text-align: center; font-family: "Ubuntu", "Segoe UI", Arial, sans-serif; font-weight: 700;
}
.inv-root, .inv-root * { box-sizing: border-box; transition: none; }
.inv-root { display: flex; flex-direction: column; min-height: 0; flex: 1 1 auto; }
.inv-txt { -webkit-text-stroke: 3px #1b2a3a; paint-order: stroke fill; }
.inv-title { font-size: 18px; line-height: 24px; flex: 0 0 auto; }
.inv-close { position: absolute; top: 7px; right: 6px; width: 20px; height: 20px; background: #bb5555; border: 3px solid #974545; border-radius: 4px; cursor: pointer; }
.inv-close:hover { filter: brightness(1.1); }
.inv-close::before, .inv-close::after { content: ""; position: absolute; left: 50%; top: 50%; width: 10px; height: 3px; background: #e9c3c3; transform: translate(-50%, -50%) rotate(45deg); }
.inv-close::after { transform: translate(-50%, -50%) rotate(-45deg); }
.inv-sub { font-size: 11px; line-height: 14px; margin-top: 7px; flex: 0 0 auto; }
.inv-row { margin: 9px 11px 0 14px; height: 24px; display: flex; align-items: center; flex: 0 0 auto; }
.inv-box { width: 20px; height: 20px; background: #666; border: 3px solid #333; border-radius: 2px; cursor: pointer; flex: none; position: relative; }
.inv-box.on::after { content: ""; position: absolute; inset: 2px; background: #fff; opacity: 0.85; }
.inv-lbl { font-size: 12px; margin: 0 9px 0 7px; flex: none; cursor: pointer; }
.inv-search { flex: 1; min-width: 0; height: 24px; border: 2px solid #000; background: #eee; border-radius: 0; outline: none; padding: 0 4px; font: inherit; font-size: 12px; color: #222; user-select: text; -webkit-user-select: text; }
.inv-search::placeholder { color: #888; }
.inv-list { overflow-y: auto; margin-top: 4px; scrollbar-width: none; flex: 1 1 auto; min-height: 0; }
.inv-list::-webkit-scrollbar { display: none; }
.inv-rarity { margin-top: 12px; }
.inv-rarity.inv-flat { margin-top: 0; }
.inv-divider { position: relative; height: 12px; margin: 0 23px 0 12px; }
.inv-divider::before { content: ""; position: absolute; left: 0; right: 0; top: 5px; height: 3px; background: #4981b1; border-radius: 2px; }
.inv-divider span { position: absolute; left: 50%; top: 0; transform: translateX(-50%); background: #5a9fdb; padding: 0 6px; font-size: 10px; line-height: 12px; white-space: nowrap; -webkit-text-stroke-width: 2.5px; }
.inv-slots { display: flex; flex-wrap: wrap; justify-content: center; gap: 7px; padding: 7px 8px 0; min-height: 4px; }
.inv-slot { position: relative; width: ${SLOT_SIZE}px; height: ${SLOT_SIZE}px; cursor: grab; touch-action: none; }
.inv-slot:hover { filter: brightness(1.12); }
.inv-slot canvas { width: 100%; height: 100%; display: block; pointer-events: none; }
.inv-count { position: absolute; pointer-events: none; line-height: 1; -webkit-text-stroke: 2.5px #1b2a3a; paint-order: stroke fill; }
.inv-count { right: 3px; top: 3px; font-size: 11px; }
.inv-empty { padding: 18px 8px 6px; font-size: 12px; -webkit-text-stroke: 3px #1b2a3a; paint-order: stroke fill; }
.inv-tooltip-layer { position: fixed; left: 0; top: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 999999; display: none; }
.inv-tooltip-layer canvas { position: fixed; transition: none; }
`;
document.head.appendChild(style);

let root, boxEl, searchInput, listEl;
const emptyEl = document.createElement("div");
emptyEl.className = "inv-empty";

if (menu) {
    root = document.createElement("div");
    root.className = "inv-root";

    const title = document.createElement("div");
    title.className = "inv-title inv-txt";
    title.textContent = "Inventory";

    const sub = document.createElement("div");
    sub.className = "inv-sub inv-txt";
    sub.textContent = "Drag a petal to equip it";
    sub.title = "Click a petal to equip it into the first free slot, or drag it onto a slot";

    const row = document.createElement("div");
    row.className = "inv-row";

    boxEl = document.createElement("div");
    boxEl.className = "inv-box" + (stackMode ? " on" : "");
    boxEl.title = "One slot per petal type showing its highest rarity";

    const lbl = document.createElement("span");
    lbl.className = "inv-lbl inv-txt";
    lbl.textContent = "Stack";

    const toggleStack = () => {
        stackMode = !stackMode;
        boxEl.classList.toggle("on", stackMode);
        savePref("stack", stackMode ? "1" : "0");
        refreshInventory();
        listEl.scrollTop = 0;
    };
    boxEl.addEventListener("click", toggleStack);
    lbl.addEventListener("click", toggleStack);

    searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.className = "inv-search";
    searchInput.placeholder = "Search petals...";
    searchInput.setAttribute("aria-label", "Search petals");
    searchInput.tabIndex = -1;
    searchInput.autocomplete = "off";
    searchInput.spellcheck = false;

    searchInput.addEventListener("keydown", (e) => {
        e.stopPropagation();
        if (e.key === "Escape") searchInput.blur();
    });
    searchInput.addEventListener("keyup", (e) => e.stopPropagation());
    searchInput.addEventListener("input", () => {
        searchTerms = searchInput.value.trim().toLowerCase().replace(/_/g, " ").split(/\s+/).filter(Boolean);
        refreshInventory();
        listEl.scrollTop = 0;
    });

    row.append(boxEl, lbl, searchInput);

    listEl = document.createElement("div");
    listEl.className = "inv-list";

    root.append(title, sub, row, listEl);

    const closeBtn = document.createElement("div");
    closeBtn.className = "inv-close";
    closeBtn.setAttribute("role", "button");
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.addEventListener("click", () => setInventoryOpen(false));

    menu.replaceChildren(root, closeBtn);
}

const observer = menu
    ? new IntersectionObserver(
          (entries) => {
              for (const entry of entries) {
                  if (entry.isIntersecting) {
                      const rec = entry.target._rec;
                      if (rec) drawSlotIcon(rec);
                  }
              }
          },
          { root: listEl, rootMargin: "120px" }
      )
    : null;

function isOpen() {
    return !!menu && menu.classList.contains("active");
}

export function isInventoryOpen() {
    return isOpen();
}

export function setInventoryOpen(open) {
    if (!menu) return;
    menu.classList.toggle("active", open);
}

export function toggleInventory() {
    setInventoryOpen(!isOpen());
}

function petalName(petalId) {
    return net.state.petalConfigs?.[petalId]?.name ?? "Unknown";
}

function matchesSearch(haystack) {
    for (const term of searchTerms) {
        if (!haystack.includes(term)) return false;
    }
    return true;
}

function collectGroups() {
    const inventory = net.state.inventory;
    const tiers = net.state.tiers ?? [];
    const all = [];
    let total = 0;
    const rarityTotals = new Map();

    if (!inventory) return { groups: [], total, rarityTotals };

    for (const [tierName, petals] of Object.entries(inventory)) {
        const rarity = tiers.findIndex((t) => t.name === tierName);
        if (rarity === -1) continue;

        for (const [id, count] of Object.entries(petals)) {
            if (!(count > 0)) continue;
            const petalId = Number(id);

            total += count;
            rarityTotals.set(rarity, (rarityTotals.get(rarity) ?? 0) + count);
            all.push({ petalId, rarity, count, tierName, name: petalName(petalId) });
        }
    }

    if (stackMode) {
        const best = new Map();
        for (const e of all) {
            const cur = best.get(e.petalId);
            if (!cur || e.rarity > cur.rarity) best.set(e.petalId, e);
        }

        const entries = [...best.values()]
            .filter((e) => matchesSearch(e.name.toLowerCase()))
            .map((e) => ({ key: e.rarity + "_" + e.petalId, petalId: e.petalId, rarity: e.rarity, count: e.count, name: e.name }))
            .sort((x, y) => x.name.localeCompare(y.name));

        return { groups: entries.length ? [{ rarity: STACK_GROUP, entries }] : [], total, rarityTotals };
    }

    const byRarity = new Map();
    for (const s of all) {
        if (searchTerms.length && !matchesSearch((s.name + " " + s.tierName).toLowerCase())) continue;
        if (!byRarity.has(s.rarity)) byRarity.set(s.rarity, []);
        byRarity.get(s.rarity).push({ key: s.rarity + "_" + s.petalId, petalId: s.petalId, rarity: s.rarity, count: s.count, name: s.name });
    }

    const groups = [...byRarity.entries()]
        .sort((a, b) => (HIGHEST_RARITY_FIRST ? b[0] - a[0] : a[0] - b[0]))
        .map(([rarity, list]) => ({ rarity, entries: list.sort((a, b) => a.name.localeCompare(b.name)) }));

    return { groups, total, rarityTotals };
}

function tierColor(rarity) {
    return net.state.tiers?.[rarity]?.color ?? "#ffffff";
}

function popIn(el) {
    if (typeof el.animate !== "function") return;
    el.animate(
        [
            { transform: "scale(0) rotate(-540deg)" },
            { transform: "scale(1) rotate(0deg)" },
        ],
        { duration: 400, easing: "cubic-bezier(0.2, 0.8, 0.3, 1)" }
    );
}

function drawSlotIcon(rec) {
    if (rec.drawn) return;

    try {
        const source = getPetalIcon(rec.petalId, rec.rarity, "oneshot");
        const ratio = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        const px = Math.round(SLOT_SIZE * ratio);
        rec.canvas.width = px;
        rec.canvas.height = px;
        const c = rec.canvas.getContext("2d");
        c.imageSmoothingEnabled = true;
        c.imageSmoothingQuality = "high";
        c.clearRect(0, 0, px, px);
        c.drawImage(source, 0, 0, px, px);
        rec.drawn = true;
    } catch (e) {
        rec.drawn = false;
        needsRetry = true;
    }
}

function createSlot(entry) {
    const el = document.createElement("div");
    el.className = "inv-slot";

    const canvas = document.createElement("canvas");
    el.appendChild(canvas);

    const countEl = document.createElement("div");
    countEl.className = "inv-count";
    el.appendChild(countEl);

    const rec = {
        key: entry.key,
        petalId: entry.petalId,
        rarity: entry.rarity,
        count: -1,
        el,
        canvas,
        countEl,
        drawn: false,
    };

    el._rec = rec;
    attachSlotEvents(rec);
    observer.observe(el);

    return rec;
}

function createSection(rarity) {
    const el = document.createElement("div");
    el.className = "inv-rarity";

    const slotsEl = document.createElement("div");
    slotsEl.className = "inv-slots";

    if (rarity === STACK_GROUP) {
        el.classList.add("inv-flat");
        el.append(slotsEl);
        return { el, slotsEl, label: null, divider: null };
    }

    const divider = document.createElement("div");
    divider.className = "inv-divider";
    const label = document.createElement("span");
    label.className = "inv-txt";
    label.textContent = net.state.tiers?.[rarity]?.name ?? "?";
    label.style.color = tierColor(rarity);
    divider.appendChild(label);

    el.append(divider, slotsEl);

    return { el, slotsEl, label, divider };
}

export function refreshInventory() {
    if (!menu) return;

    refreshQueued = false;
    lastRenderedVersion = net.state._inventoryVersion || 0;

    const animateNew = pendingAnimate;
    pendingAnimate = false;

    const { groups, total, rarityTotals } = collectGroups();

    const wanted = new Set();
    for (const g of groups) for (const e of g.entries) wanted.add(e.key);
    for (const [key, rec] of slots) {
        if (!wanted.has(key)) {
            observer.unobserve(rec.el);
            rec.el.remove();
            slots.delete(key);
        }
    }

    const wantedRarities = new Set(groups.map((g) => g.rarity));
    for (const [rarity, section] of sections) {
        if (!wantedRarities.has(rarity)) {
            section.el.remove();
            sections.delete(rarity);
        }
    }

    let drawnCount = 0;
    let sectionPos = 0;
    for (const group of groups) {
        let section = sections.get(group.rarity);
        if (!section) {
            section = createSection(group.rarity);
            sections.set(group.rarity, section);
        }

        const tier = net.state.tiers?.[group.rarity];
        if (section.label) {
            if (tier && section.label.textContent !== tier.name) section.label.textContent = tier.name;
            section.divider.title = Math.floor(rarityTotals.get(group.rarity) ?? 0).toLocaleString("en-US") + " " + (tier?.name ?? "");
        }

        const currentSection = listEl.children[sectionPos];
        if (currentSection !== section.el) listEl.insertBefore(section.el, currentSection ?? null);
        sectionPos++;

        let slotPos = 0;
        for (const entry of group.entries) {
            let rec = slots.get(entry.key);
            if (!rec) {
                rec = createSlot(entry);
                rec.popIn = animateNew;
                slots.set(entry.key, rec);
            }

            if (rec.count !== entry.count) {
                rec.count = entry.count;
                rec.countEl.textContent = entry.count > 1 ? "x" + formatAmount(entry.count) : "";
            }

            if (!rec.drawn && drawnCount < EAGER_SLOTS) drawSlotIcon(rec);
            drawnCount++;

            const currentSlot = section.slotsEl.children[slotPos];
            if (currentSlot !== rec.el) section.slotsEl.insertBefore(rec.el, currentSlot ?? null);
            slotPos++;

            if (rec.popIn) {
                rec.popIn = false;
                popIn(rec.el);
            }
        }
    }

    if (groups.length === 0) {
        emptyEl.textContent = total > 0 ? "No petals match your search." : "Your inventory is empty :(";
        if (emptyEl.parentNode !== listEl) listEl.appendChild(emptyEl);
    } else if (emptyEl.parentNode === listEl) {
        emptyEl.remove();
    }

    requestAnimationFrame(drawVisibleUndrawn);
}

function drawVisibleUndrawn() {
    needsRetry = false;
    const g = listEl.getBoundingClientRect();
    for (const rec of slots.values()) {
        if (rec.drawn) continue;
        const r = rec.el.getBoundingClientRect();
        if (r.bottom >= g.top - 120 && r.top <= g.bottom + 120) drawSlotIcon(rec);
    }
}

function queueRefresh(animate = false) {
    if (animate) pendingAnimate = true;
    if (refreshQueued) return;
    refreshQueued = true;
    requestAnimationFrame(() => refreshInventory());
}

let tooltipLayer, tooltipCanvas, tooltipKey = null;

if (menu) {
    tooltipLayer = document.createElement("div");
    tooltipLayer.className = "inv-tooltip-layer";
    tooltipCanvas = document.createElement("canvas");
    tooltipLayer.appendChild(tooltipCanvas);
    document.body.appendChild(tooltipLayer);
}

function showTooltip(rec) {
    if (!tooltipLayer) return;

    let img;
    try {
        img = petalTooltip(rec.petalId, rec.rarity, 0, 0);
    } catch (e) {
        return;
    }
    if (!img || !img.width) return;

    const rect = rec.el.getBoundingClientRect();

    let bw = TOOLTIP_WIDTH;
    let bh = (bw * img.height) / img.width;
    const maxH = window.innerHeight * 0.7;
    if (bh > maxH) {
        bw = (bw * maxH) / bh;
        bh = maxH;
    }

    let x = rect.left + rect.width / 2 - bw / 2;
    let y = rect.top - bh - TOOLTIP_GAP;
    if (y < 0) y = rect.bottom + TOOLTIP_GAP;

    x = Math.max(0, Math.min(x, window.innerWidth - bw));
    y = Math.max(0, Math.min(y, window.innerHeight - bh));

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const key = rec.key + "|" + Math.round(bw) + "x" + Math.round(bh) + "@" + dpr;
    if (tooltipKey !== key) {
        tooltipKey = key;
        tooltipCanvas.width = Math.round(bw * dpr);
        tooltipCanvas.height = Math.round(bh * dpr);
        tooltipCanvas.style.width = bw + "px";
        tooltipCanvas.style.height = bh + "px";
        const c = tooltipCanvas.getContext("2d");
        c.imageSmoothingEnabled = true;
        c.imageSmoothingQuality = "high";
        c.clearRect(0, 0, tooltipCanvas.width, tooltipCanvas.height);
        c.drawImage(img, 0, 0, tooltipCanvas.width, tooltipCanvas.height);
    }

    tooltipCanvas.style.left = x + "px";
    tooltipCanvas.style.top = y + "px";
    tooltipLayer.style.display = "block";
}

function hideTooltip() {
    if (!tooltipLayer) return;
    tooltipLayer.style.display = "none";
    tooltipKey = null;
}

function socketReady() {
    return net.state.socket?.readyState === WebSocket.OPEN;
}

function sendEquip(drag, drop) {
    net.state.socket.talk(SERVER_BOUND.INVENTORY_CHANGE_LOADOUT, { drag, drop });
}

function pointInIcon(icon, mX, mY) {
    return !!icon && icon.x < mX && icon.x + icon.size > mX && icon.y < mY && icon.y + icon.size > mY;
}

function mainDrop(slot, i) {
    return { type: DRAG_TYPE_MAINDOCKER, index: i, rarity: slot.rarity, petalIndex: slot.index };
}

function secondaryDrop(slot, i) {
    return {
        type: DRAG_TYPE_SECONDARYDOCKER,
        index: i,
        rarity: slot.rarity ?? 255,
        petalIndex: slot.index === -1 ? 255 : slot.index,
    };
}

function processInventoryDrop() {
    if (!socketReady()) return false;

    const drag = {
        index: inventoryDragConfig.index,
        rarity: inventoryDragConfig.rarity,
    };

    const sc = uiScale();
    const mX = mouse.x / sc;
    const mY = mouse.y / sc;

    for (let i = 0; i < net.state.slots.length; i++) {
        const slot = net.state.slots[i];
        if (pointInIcon(slot.icon, mX, mY)) {
            sendEquip(drag, mainDrop(slot, i));
            return true;
        }
    }

    for (let i = 0; i < net.state.secondarySlots.length; i++) {
        const slot = net.state.secondarySlots[i];
        if (pointInIcon(slot.icon, mX, mY)) {
            sendEquip(drag, secondaryDrop(slot, i));
            return true;
        }
    }

    return false;
}

function quickEquip(rec) {
    if (!socketReady()) return;

    const drag = { index: rec.petalId, rarity: rec.rarity };

    const main = net.state.slots.findIndex((s) => s.index === -1);
    if (main !== -1) {
        sendEquip(drag, mainDrop(net.state.slots[main], main));
        return;
    }

    const secondary = net.state.secondarySlots.findIndex((s) => s.index === -1);
    if (secondary !== -1) {
        sendEquip(drag, secondaryDrop(net.state.secondarySlots[secondary], secondary));
    }
}

function beginDragFromSlot(rec, onDrop) {
    if (inventoryDragConfig.enabled || dragConfig.enabled) return false;

    const rect = rec.el.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const sc = uiScale();

    const x = ((rect.left + rect.width / 2) * dpr) / sc;
    const y = ((rect.top + rect.height / 2) * dpr) / sc;
    const size = (rect.width * dpr) / sc;

    hideTooltip();
    beginInventoryDragDrop(x, y, size, rec.petalId, rec.rarity);
    inventoryDragConfig.index = rec.petalId;
    inventoryDragConfig.rarity = rec.rarity;
    inventoryDragConfig.item.stableSize = size;
    inventoryDragConfig.onDrop = onDrop;

    setInventoryOpen(false);

    return true;
}

function attachSlotEvents(rec) {
    const el = rec.el;

    el.addEventListener("pointerenter", () => {
        if (!inventoryDragConfig.enabled) showTooltip(rec);
    });

    el.addEventListener("pointerleave", hideTooltip);

    el.addEventListener("pointerdown", (e) => {
        if (e.button !== 0) return;

        const startX = e.clientX;
        const startY = e.clientY;
        const isTouch = e.pointerType === "touch";
        const downTime = performance.now();
        let moved = false;
        let tap = false;

        if (isTouch) {
            mouse.x = e.clientX * (window.devicePixelRatio || 1);
            mouse.y = e.clientY * (window.devicePixelRatio || 1);
            mouse.left = true;
        }

        const picked = beginDragFromSlot(rec, () => {
            if (tap) quickEquip(rec);
            else processInventoryDrop();
            setInventoryOpen(true);
            queueRefresh();
        });
        if (!picked) return;

        const onMove = (ev) => {
            if (isTouch) {
                mouse.x = ev.clientX * (window.devicePixelRatio || 1);
                mouse.y = ev.clientY * (window.devicePixelRatio || 1);
            }
            if (!moved && Math.hypot(ev.clientX - startX, ev.clientY - startY) >= DRAG_THRESHOLD) moved = true;
        };

        const onUp = () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
            window.removeEventListener("pointercancel", onUp);

            tap = TAP_TO_EQUIP && !moved && performance.now() - downTime < TAP_MS;
            if (isTouch) mouse.left = false;
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        window.addEventListener("pointercancel", onUp);
    });
}

function typingInOtherField() {
    const ae = document.activeElement;
    if (!ae || ae === searchInput) return false;
    const tag = ae.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || ae.isContentEditable;
}

if (menu) {
    new MutationObserver(() => {
        if (isOpen()) {
            refreshInventory();
        } else {
            hideTooltip();
            if (document.activeElement === searchInput) searchInput.blur();
        }
    }).observe(menu, { attributes: true, attributeFilter: ["class"] });

    setInterval(() => {
        if (!isOpen()) return;
        if ((net.state._inventoryVersion || 0) !== lastRenderedVersion) queueRefresh(true);
        else if (needsRetry) requestAnimationFrame(drawVisibleUndrawn);
    }, 150);

    window.addEventListener("keydown", (e) => {
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        if (e.key === "Escape" && isOpen() && !inventoryDragConfig.enabled) {
            setInventoryOpen(false);
            return;
        }

        if (e.key.toLowerCase() !== TOGGLE_KEY) return;
        if (net.ChatMessage.showInput || document.activeElement === searchInput || typingInOtherField()) return;
        toggleInventory();
    });
}
