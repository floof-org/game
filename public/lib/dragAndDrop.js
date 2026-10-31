import { ctx } from "./canvas.js";
import { mouse, state, IconItem } from "./net.js";
import { getPetalIcon } from "./renders.js";
import { lerp } from "./util.js";
import { SERVER_BOUND } from "./protocol.js";

export const DRAG_TYPE_MAINDOCKER = 0;
export const DRAG_TYPE_SECONDARYDOCKER = 1;
export const DRAG_TYPE_DESTROY = 2;

export const TAP_TO_SWAP = true;

const TAP_MS = 300;
const MOVE_PX = 5;
const LAND_PX = 1.5;
const MAX_LAND_MS = 700;
const SETTLE_MS = 500;
const HELD_SCALE = 0.2;
const HELD_WOBBLE = (10 * Math.PI) / 180;
const UNEQUIP_PX = 60;

let shiftDown = false;

if (typeof window !== "undefined") {
    window.addEventListener("keydown", (e) => {
        if (e.key === "Shift") shiftDown = true;
    });
    window.addEventListener("keyup", (e) => {
        if (e.key === "Shift") shiftDown = false;
    });
    window.addEventListener("blur", () => {
        shiftDown = false;
    });
}

export class DragAndDropItem {
    index = 0;
    rarity = 0;

    x = 0;
    y = 0;
    size = 0;
    ratio = 0;

    realX = 0;
    realY = 0;
    realSize = 0;
    stableSize = 0;

    startTime = 0;
    mouseX0 = null;
    mouseY0 = null;
    moved = false;
    held = 0;
}

export class DragAndDropInventoryItem extends DragAndDropItem {}

function createConfig() {
    return {
        item: null,
        enabled: false,
        isReleasing: false,
        dropped: false,
        releasedAt: 0,
        tap: false,
        snap: null,
        dropSnap: null,
        settle: null,
        unequip: false,
        removeTarget: null,
        type: -1,
        index: -1,
        onDrop: function() {}
    };
}

export const dragConfig = createConfig();

export const inventoryDragConfig = createConfig();

function begin(cfg, ItemClass, x, y, size, index, rarity) {
    const item = new ItemClass();

    item.x = x;
    item.y = y;
    item.size = size;

    item.realX = x;
    item.realY = y;
    item.realSize = size;
    item.stableSize = size;

    item.index = index;
    item.rarity = rarity;
    item.startTime = performance.now();

    cfg.item = item;
    cfg.enabled = true;
    cfg.isReleasing = false;
    cfg.dropped = false;
    cfg.tap = false;
    cfg.snap = null;
    cfg.dropSnap = null;
    cfg.settle = null;
    cfg.unequip = false;
}

export function beginDragDrop(x, y, size, index, rarity) {
    begin(dragConfig, DragAndDropItem, x, y, size, index, rarity);
}

export function beginInventoryDragDrop(x, y, size, index, rarity) {
    begin(inventoryDragConfig, DragAndDropInventoryItem, x, y, size, index, rarity);
}

function slotList(type) {
    return type === DRAG_TYPE_MAINDOCKER ? state.slots : state.secondarySlots;
}

function slotObj(type, index) {
    return slotList(type)?.[index];
}

export function slotUnderPoint(mX, mY) {
    for (const type of [DRAG_TYPE_MAINDOCKER, DRAG_TYPE_SECONDARYDOCKER]) {
        const list = slotList(type) ?? [];
        for (let i = 0; i < list.length; i++) {
            const r = list[i]?.rect;
            if (r && mX >= r.x && mX <= r.x + r.size && mY >= r.y && mY <= r.y + r.size) {
                return { type, index: i, rect: r };
            }
        }
    }
    return null;
}

function isValidTarget(cfg, inventory, hit) {
    if (inventory) return true;
    return !(hit.type === cfg.type && hit.index === cfg.index);
}

function snapFor(hit) {
    const r = hit.rect;
    return { type: hit.type, index: hit.index, x: r.x + r.size / 2, y: r.y + r.size / 2, size: r.size };
}

function findSnap(cfg, inventory, mX, mY) {
    const hit = slotUnderPoint(mX, mY);
    return hit && isValidTarget(cfg, inventory, hit) ? snapFor(hit) : null;
}

export function activeSnapTarget() {
    for (const cfg of [dragConfig, inventoryDragConfig]) {
        if (!cfg.enabled) continue;
        const s = cfg.isReleasing ? cfg.dropSnap : cfg.snap;
        if (s) return s;
    }
    return null;
}

function ensureIcon(slot) {
    if (!slot) return null;
    if (!slot.icon) {
        slot.icon = new IconItem();
        const r = slot.rect;
        if (r) {
            slot.icon.x = slot.icon.realX = r.x;
            slot.icon.y = slot.icon.realY = r.y;
            slot.icon.size = slot.icon.realSize = r.size;
        }
    }
    return slot.icon;
}

export function settleOnSlot(cfg, type, index) {
    const slot = slotObj(type, index);
    const index0 = slot?.index;
    const rarity0 = slot?.rarity;
    cfg.settle = {
        until: performance.now() + SETTLE_MS,
        done: () => {
            const now = slotObj(type, index);
            return !now || now.index !== index0 || now.rarity !== rarity0;
        }
    };
}

function flyPetals(from, to, ghost) {
    const a = ensureIcon(slotObj(from.type, from.index));
    const b = ensureIcon(slotObj(to.type, to.index));
    if (!a || !b) return;

    const bx = b.x;
    const by = b.y;
    const bs = b.size;

    b.x = ghost.x - ghost.size / 2;
    b.y = ghost.y - ghost.size / 2;
    b.size = ghost.size;

    a.x = bx;
    a.y = by;
    a.size = bs;
}

function sendRowSwap(i) {
    if (state.socket?.readyState !== WebSocket.OPEN || state.isInDestroy) return false;

    const main = state.slots[i];
    const secondary = state.secondarySlots[i];
    if (!main || !secondary || (!(main.index > -1) && !(secondary.index > -1))) return false;

    state.socket.talk(SERVER_BOUND.CHANGE_LOADOUT, {
        drag: { type: DRAG_TYPE_MAINDOCKER, index: i },
        drop: { type: DRAG_TYPE_SECONDARYDOCKER, index: i },
    });

    const a = ensureIcon(main);
    const b = ensureIcon(secondary);
    const ax = a.x, ay = a.y, as = a.size;
    a.x = b.x; a.y = b.y; a.size = b.size;
    b.x = ax; b.y = ay; b.size = as;

    return true;
}

export function handleSlotDrop(item, tap, processDrop) {
    const cfg = dragConfig;
    const origin = { type: cfg.type, index: cfg.index };

    if (cfg.unequip && processDrop()) {
        settleOnSlot(cfg, origin.type, origin.index);
        return;
    }

    if (tap && TAP_TO_SWAP && !cfg.unequip) {
        if (sendRowSwap(origin.index)) settleOnSlot(cfg, origin.type, origin.index);
        return;
    }

    const target = cfg.dropSnap;

    if (!cfg.unequip && processDrop()) {
        if (target) {
            flyPetals(origin, target, item);
            settleOnSlot(cfg, target.type, target.index);
        }
        return;
    }

    const icon = ensureIcon(slotObj(origin.type, origin.index));
    if (icon) {
        icon.x = item.x - item.size / 2;
        icon.y = item.y - item.size / 2;
        icon.size = item.size;
    }
}

function wantsUnequip(cfg, mouseX, mouseY) {
    if (state.isInDestroy || !slotObj(cfg.type, cfg.index)) return false;
    if (cfg.tap) return shiftDown;
    if (slotUnderPoint(mouseX, mouseY)) return false;
    const r = slotObj(cfg.type, cfg.index).rect;
    return !!r && Math.hypot(mouseX - (r.x + r.size / 2), mouseY - (r.y + r.size / 2)) > UNEQUIP_PX;
}

function finish(cfg) {
    cfg.enabled = false;
    cfg.isReleasing = false;
    cfg.dropped = false;
    cfg.tap = false;
    cfg.item = null;
    cfg.snap = null;
    cfg.dropSnap = null;
    cfg.settle = null;
    cfg.unequip = false;
}

function step(cfg, inventory, mouseX, mouseY) {
    if (!cfg.enabled) {
        cfg.item = null;
        cfg.snap = null;
        cfg.dropSnap = null;
        cfg.settle = null;
        cfg.dropped = false;
        return;
    }

    const item = cfg.item;
    const now = performance.now();

    if (!cfg.isReleasing && !mouse.left) {
        cfg.isReleasing = true;
        cfg.releasedAt = now;
        cfg.tap = !item.moved && now - item.startTime < TAP_MS;
        cfg.dropSnap = cfg.snap;
        cfg.unequip = !inventory && !cfg.snap && wantsUnequip(cfg, mouseX, mouseY);
    }

    if (!cfg.isReleasing) {
        if (item.mouseX0 === null) {
            item.mouseX0 = mouseX;
            item.mouseY0 = mouseY;
        } else if (Math.hypot(mouseX - item.mouseX0, mouseY - item.mouseY0) > MOVE_PX) {
            item.moved = true;
        }

        cfg.snap = findSnap(cfg, inventory, mouseX, mouseY);
        item.realX = mouseX;
        item.realY = mouseY;
        item.realSize = item.stableSize;
        if (cfg.snap) {
            item.realX = cfg.snap.x;
            item.realY = cfg.snap.y;
            item.realSize = cfg.snap.size;
        }
    } else if (!cfg.dropped && cfg.unequip) {
        const target = cfg.removeTarget?.();
        if (target) {
            item.realX = target.x;
            item.realY = target.y;
        }
        item.realSize = 0;
    } else if (!cfg.dropped && cfg.dropSnap) {
        const r = slotObj(cfg.dropSnap.type, cfg.dropSnap.index)?.rect;
        if (r) {
            cfg.dropSnap = snapFor({ type: cfg.dropSnap.type, index: cfg.dropSnap.index, rect: r });
        }
        item.realX = cfg.dropSnap.x;
        item.realY = cfg.dropSnap.y;
        item.realSize = cfg.dropSnap.size;
    }

    const rate = cfg.unequip ? .3 : .2;
    item.x = lerp(item.x, item.realX, rate);
    item.y = lerp(item.y, item.realY, rate);
    item.size = lerp(item.size, item.realSize, rate);

    const snapped = cfg.isReleasing ? !!cfg.dropSnap : !!cfg.snap;
    const dist = Math.hypot(item.x - item.realX, item.y - item.realY);
    const onTarget = dist < LAND_PX && Math.abs(item.size - item.realSize) < LAND_PX;
    item.held = lerp(item.held, !cfg.isReleasing && !(snapped && onTarget) ? 1 : 0, .2);

    if (cfg.isReleasing && !cfg.dropped) {
        const closeEnough = snapped || cfg.unequip ? onTarget : dist < item.size;
        if (closeEnough || now - cfg.releasedAt > MAX_LAND_MS) {
            cfg.dropped = true;
            try {
                cfg.onDrop(item, cfg.tap);
            } catch (e) {
                console.error(e);
            }
        }
    }

    if (cfg.dropped) {
        const settle = cfg.settle;
        if (!settle || now > settle.until || settle.done()) {
            finish(cfg);
            return;
        }
    }

    if (item.size < 0.5) return;

    ctx.save();
    ctx.textAlign = "center";
    ctx.translate(item.x, item.y);
    const scale = item.size * (1 + HELD_SCALE * item.held);
    ctx.scale(scale, scale);
    ctx.rotate(Math.sin(now / 100) * HELD_WOBBLE * item.held);
    ctx.drawImage(getPetalIcon(item.index, item.rarity), -.5, -.5, 1, 1);
    ctx.restore();
}

export function updateAndDrawDragDrop(mouseX, mouseY) {
    step(dragConfig, false, mouseX, mouseY);
}

export function updateAndDrawInventoryDragDrop(mouseX, mouseY) {
    step(inventoryDragConfig, true, mouseX, mouseY);
}
