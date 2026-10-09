import * as net from "./net.js";
import { getPetalIcon } from "./renders.js";
import { options } from "./util.js";

const TAU = Math.PI * 2;
const SYNC_INTERVAL = 100;
const SUPERSAMPLE = 1.25;

function formatCount(value) {
    if (!isFinite(value)) return "\u221e";

    const f = (num, div, suffix) => {
        const val = num / div;
        const str = val.toFixed(1);
        return str.endsWith(".0") ? Math.floor(val) + suffix : str + suffix;
    };

    if (value >= 1e18) return f(value, 1e18, "Qt");
    if (value >= 1e15) return f(value, 1e15, "Qd");
    if (value >= 1e12) return f(value, 1e12, "t");
    if (value >= 1e9) return f(value, 1e9, "b");
    if (value >= 1e6) return f(value, 1e6, "m");
    if (value >= 1e3) return f(value, 1e3, "k");

    return String(Math.floor(value));
}

function isAnimated(rarity) {
    return !options.disableGradients && rarity >= options.minimumGradientRarity;
}

export class InventoryUI {
    constructor({ panel, list, search, stack }) {
        this.panel = panel;
        this.scroller = list;
        this.search = search;
        this.stack = stack;

        this.totalsEl = document.createElement("div");
        this.totalsEl.className = "inventory-rarities hidden";

        this.grid = document.createElement("div");
        this.grid.className = "inventory-petals";

        this.emptyEl = document.createElement("div");
        this.emptyEl.className = "inventory-empty";
        this.emptyEl.textContent = "Nothing to show...";

        this.canvas = document.createElement("canvas");
        this.canvas.className = "inventory-canvas";
        this.ctx = this.canvas.getContext("2d");

        this.scroller.replaceChildren(this.totalsEl, this.grid, this.emptyEl, this.canvas);

        this.items = new Map();
        this.sorted = [];
        this.shown = [];
        this.visible = [];
        this.popping = new Set();
        this.dividers = [];

        this.tokens = [];
        this.aid = [];
        this.configsRef = null;
        this.inventoryRef = null;
        this.version = NaN;
        this.totalsSignature = "";

        this.wasOpen = false;
        this.lastSync = 0;
        this.lastFrame = 0;
        this.layoutDirty = true;
        this.paintDirty = true;
        this.failed = false;

        stack.checked = net.state.inventoryStack === true;

        search.addEventListener("input", () => this.setQuery(search.value));
        stack.addEventListener("change", () => {
            net.state.inventoryStack = stack.checked;
            this.resort();
        });
        this.scroller.addEventListener("scroll", () => (this.layoutDirty = true), { passive: true });
        new ResizeObserver(() => (this.layoutDirty = true)).observe(this.scroller);
    }

    isOpen() {
        return this.panel.classList.contains("active");
    }

    refresh() {
        this.sync(false);
    }

    setQuery(value) {
        this.tokens = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
        this.applyFilters();
    }

    render(now = performance.now()) {
        try {
            this._render(now);
        } catch (err) {
            if (!this.failed) {
                this.failed = true;
                console.error("[inventory]", err);
            }
        }
    }

    hitTest(clientX, clientY) {
        if (!this.wasOpen) return null;

        const tile = document.elementFromPoint(clientX, clientY)?.closest?.(".petal2");
        const item = tile?._item;
        if (!item || item.el !== tile) return null;

        return { petal: item.petal, rarity: item.rarity, amount: item.amount, rect: tile.getBoundingClientRect() };
    }

    _render(now) {
        if (!this.isOpen()) {
            this.wasOpen = false;
            return;
        }

        const state = net.state;

        if (!this.wasOpen) {
            this.wasOpen = true;
            this.sync(false);
            this.lastSync = now;
            this.lastFrame = now;
            this.layoutDirty = this.paintDirty = true;
        } else if (now - this.lastSync >= SYNC_INTERVAL && (state._inventoryVersion !== this.version || state.inventory !== this.inventoryRef)) {
            this.sync(true);
            this.lastSync = now;
        }

        const dt = Math.min(0.1, Math.max(0, (now - this.lastFrame) / 1000));
        this.lastFrame = now;

        if (this.popping.size > 0) {
            const k = 1 - Math.pow(0.8, dt * 60);

            for (const item of this.popping) {
                item.pop += (1 - item.pop) * k;

                if (item.pop > 0.99) {
                    item.pop = 1;
                    this.popping.delete(item);
                }
            }

            this.paintDirty = true;
        }

        if (this.layoutDirty) this.computeVisible();

        if (!this.paintDirty && !this.visible.some((entry) => isAnimated(entry.item.rarity))) return;

        this.paint();
    }

    ensureOrder() {
        const configs = net.state.petalConfigs;
        if (configs === this.configsRef && configs.length === this.aid.length) return;

        const order = [];
        for (let i = 0; i < configs.length; i++) {
            if (configs[i]) order.push(i);
        }

        order.sort((a, b) => (configs[b].name || "").localeCompare(configs[a].name || ""));

        this.aid = new Array(configs.length).fill(0);
        order.forEach((petal, rank) => (this.aid[petal] = rank));
        this.configsRef = configs;

        for (const item of this.items.values()) this.assignSortIds(item);
    }

    assignSortIds(item) {
        const petalCount = Math.max(1, this.aid.length);
        const rarityCount = Math.max(1, net.state.tiers?.length ?? 1);
        const aid = this.aid[item.petal] ?? 0;

        item.sortId = item.rarity * petalCount + aid;
        item.stackSortId = aid * rarityCount + item.rarity;
    }

    createItem(key, rarity, petal, amount) {
        const el = document.createElement("div");
        el.className = "petal2";

        const item = {
            key,
            rarity,
            petal,
            amount,
            el,
            hidden: false,
            pop: 1,
            sortId: 0,
            stackSortId: 0,
            text: `${net.state.petalConfigs[petal].name} ${net.state.tiers[rarity].name}`.toLowerCase(),
        };

        el._item = item;
        this.assignSortIds(item);

        return item;
    }

    clear() {
        this.items.clear();
        this.sorted = [];
        this.shown = [];
        this.visible = [];
        this.popping.clear();
        this.grid.replaceChildren();
        this.totalsEl.replaceChildren();
        this.totalsEl.classList.add("hidden");
        this.totalsSignature = "";
        this.emptyEl.classList.remove("hidden");
        this.paintDirty = this.layoutDirty = true;
    }

    sync(animate) {
        const state = net.state;
        const inventory = state.inventory;
        const tiers = state.tiers;
        const configs = state.petalConfigs;

        this.inventoryRef = inventory;
        this.version = state._inventoryVersion;

        if (!inventory || !tiers || !configs) {
            if (this.items.size > 0) this.clear();
            return;
        }

        this.ensureOrder();

        const next = new Map();
        for (let rarity = 0; rarity < tiers.length; rarity++) {
            const petals = inventory[tiers[rarity]?.name];
            if (!petals) continue;

            for (const id in petals) {
                const petal = Number(id);
                const amount = Math.floor(petals[id]);
                if (!(amount > 0) || !configs[petal]) continue;

                next.set((rarity << 16) | petal, amount);
            }
        }

        let structural = false;
        let changed = false;

        for (const [key, item] of this.items) {
            if (next.has(key)) continue;

            item.el.remove();
            this.popping.delete(item);
            this.items.delete(key);
            structural = changed = true;
        }

        for (const [key, amount] of next) {
            const existing = this.items.get(key);

            if (existing) {
                if (existing.amount !== amount) {
                    existing.amount = amount;
                    changed = true;
                }
                continue;
            }

            const item = this.createItem(key, key >>> 16, key & 0xffff, amount);

            if (animate) {
                item.pop = 0;
                this.popping.add(item);
            }

            this.items.set(key, item);
            structural = changed = true;
        }

        if (structural) this.resort();

        if (changed) {
            this.updateTotals();
            this.paintDirty = true;
        }
    }

    resort() {
        for (const divider of this.dividers) divider.remove();
        this.dividers.length = 0;

        const sortKey = this.stack.checked ? "stackSortId" : "sortId";
        this.sorted = [...this.items.values()].sort((a, b) => b[sortKey] - a[sortKey]);

        let cursor = this.grid.firstElementChild;
        for (const item of this.sorted) {
            if (item.el === cursor) {
                cursor = cursor.nextElementSibling;
            } else {
                this.grid.insertBefore(item.el, cursor);
            }
        }

        this.applyFilters();
    }

    applyFilters() {
        const stacked = this.stack.checked;
        const tokens = this.tokens;

        let best = null;
        if (stacked) {
            best = new Map();
            for (const item of this.items.values()) {
                const current = best.get(item.petal);
                if (!current || item.rarity > current.rarity) best.set(item.petal, item);
            }
        }

        this.shown.length = 0;

        for (const item of this.sorted) {
            let hide = stacked && best.get(item.petal) !== item;

            if (!hide) {
                for (const token of tokens) {
                    if (!item.text.includes(token)) {
                        hide = true;
                        break;
                    }
                }
            }

            if (hide !== item.hidden) {
                item.hidden = hide;
                item.el.classList.toggle("hidden", hide);
            }

            if (!hide) this.shown.push(item);
        }

        this.emptyEl.classList.toggle("hidden", this.shown.length > 0);

        for (const divider of this.dividers) divider.remove();
        this.dividers.length = 0;

        if (!stacked) {
            let last = -1;

            for (const item of this.shown) {
                if (item.rarity === last) continue;
                last = item.rarity;

                const tier = net.state.tiers[item.rarity];
                const divider = document.createElement("div");
                divider.className = "inventory-divider";

                const label = document.createElement("span");
                label.className = "inventory-rarity-name";
                label.textContent = tier.name;
                label.style.color = tier.color;

                divider.appendChild(label);
                this.grid.insertBefore(divider, item.el);
                this.dividers.push(divider);
            }
        }

        this.layoutDirty = this.paintDirty = true;
    }

    updateTotals() {
        const tiers = net.state.tiers;
        const totals = new Map();

        for (const item of this.items.values()) {
            totals.set(item.rarity, (totals.get(item.rarity) ?? 0) + item.amount);
        }

        let signature = "";
        for (let rarity = tiers.length - 1; rarity >= 0; rarity--) {
            if (totals.has(rarity)) signature += rarity + ":" + totals.get(rarity) + ";";
        }

        if (signature === this.totalsSignature) return;
        this.totalsSignature = signature;

        this.totalsEl.replaceChildren();

        for (let rarity = tiers.length - 1; rarity >= 0; rarity--) {
            if (!totals.has(rarity)) continue;

            const entry = document.createElement("div");
            entry.className = "inventory-rarity-total";
            entry.style.color = tiers[rarity].color;
            entry.textContent = formatCount(totals.get(rarity)) + " " + tiers[rarity].name;
            this.totalsEl.appendChild(entry);
        }

        if (this.totalsEl.children.length % 2 === 1) this.totalsEl.firstElementChild.style.gridColumn = "span 2";

        this.totalsEl.classList.toggle("hidden", this.totalsEl.children.length === 0);
        this.layoutDirty = true;
    }

    computeVisible() {
        this.layoutDirty = false;

        const scroller = this.scroller;
        const top = scroller.scrollTop;
        const height = scroller.clientHeight;
        const shown = this.shown;
        const visible = this.visible;

        visible.length = 0;

        let lo = 0;
        let hi = shown.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;
            const el = shown[mid].el;

            if (el.offsetTop + el.offsetHeight < top) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }

        for (let i = lo; i < shown.length; i++) {
            const el = shown[i].el;
            const y = el.offsetTop - top;
            if (y > height) break;

            visible.push({ item: shown[i], x: el.offsetLeft, y, size: el.offsetWidth });
        }

        this.paintDirty = true;
    }

    paint() {
        this.paintDirty = false;

        const scroller = this.scroller;
        const width = scroller.clientWidth;
        const height = scroller.clientHeight;
        if (!width || !height) return;

        const scale = (window.devicePixelRatio || 1) * SUPERSAMPLE;
        const pixelWidth = Math.max(1, Math.round(width * scale));
        const pixelHeight = Math.max(1, Math.round(height * scale));
        const { canvas, ctx } = this;

        if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
            canvas.width = pixelWidth;
            canvas.height = pixelHeight;
            canvas.style.width = width + "px";
            canvas.style.height = height + "px";
        } else {
            ctx.clearRect(0, 0, pixelWidth, pixelHeight);
        }

        canvas.style.top = scroller.scrollTop + "px";

        ctx.save();
        ctx.scale(scale, scale);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const labelled = [];

        for (const entry of this.visible) {
            const { item, x, y, size } = entry;

            let icon;
            try {
                icon = getPetalIcon(item.petal, item.rarity);
            } catch (err) {
                if (!this.failed) {
                    this.failed = true;
                    console.error("[inventory] could not render petal", item.petal, item.rarity, err);
                }
                continue;
            }

            ctx.save();
            ctx.translate(x, y);

            if (item.pop < 1) {
                ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
                ctx.beginPath();
                ctx.roundRect(0, 0, size, size, size * 0.1);
                ctx.fill();

                this.applyPop(ctx, item.pop, size / 2);
            }

            ctx.drawImage(icon, 0, 0, size, size);
            ctx.restore();

            if (item.amount > 1) labelled.push(entry);
        }

        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.lineJoin = "round";
        ctx.font = "bold 28px Ubuntu, sans-serif";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#000000";
        ctx.fillStyle = "#ffffff";

        for (const { item, x, y, size } of labelled) {
            const label = "x" + formatCount(item.amount);

            ctx.save();
            ctx.translate(x, y);
            ctx.scale(size / 100, size / 100);

            if (item.pop < 1) this.applyPop(ctx, item.pop, 50);

            ctx.translate(87, 18);
            ctx.strokeText(label, 0, 0);
            ctx.fillText(label, 0, 0);
            ctx.restore();
        }

        ctx.restore();
    }

    applyPop(ctx, progress, center) {
        ctx.translate(center, center);
        ctx.scale(progress, progress);
        ctx.rotate((1 - progress) * TAU * -1.5);
        ctx.translate(-center, -center);
    }
}
