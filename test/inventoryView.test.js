import { describe, expect, test } from "bun:test";
import { createInventoryRenderer } from "../public/lib/inventoryView.js";
import { INVENTORY_ITEM_SIZE, computeColumns, computeContentHeight } from "../public/lib/inventoryLayout.js";

const PITCH = INVENTORY_ITEM_SIZE + 5;
const VIEWPORT = 330;

/** Records every 2D context call so assertions can inspect what was painted. */
function recordingCtx() {
    const calls = [];
    const record = name => (...args) => calls.push([name, ...args]);

    return {
        calls,
        clearRect: record("clearRect"),
        drawImage: record("drawImage"),
        strokeText: record("strokeText"),
        fillText: record("fillText"),
        set fillStyle(v) { calls.push(["fillStyle", v]); },
        set strokeStyle(v) { calls.push(["strokeStyle", v]); },
        set lineWidth(v) { calls.push(["lineWidth", v]); },
        set font(v) { calls.push(["font", v]); },
        set textAlign(v) { calls.push(["textAlign", v]); },
        set textBaseline(v) { calls.push(["textBaseline", v]); },
    };
}

const icon = name => ({ name });

function makeRenderer(overrides = {}) {
    return createInventoryRenderer({
        getPetalIcon: (index, rarity) => icon(`${index}_${rarity}`),
        formatAmount: n => String(n),
        ...overrides,
    });
}

/** A flataddall sized inventory. */
function bigItems(total) {
    return Array.from({ length: total }, (_, i) => ({ index: i % 100, rarity: (i / 100) | 0, count: 1 }));
}

const names = ctx => ctx.calls.filter(c => c[0] === "drawImage").map(c => c[1].name);

describe("draw", () => {
    test("clears the whole viewport before painting", () => {
        const ctx = recordingCtx();
        makeRenderer().draw(ctx, { items: bigItems(10), columns: 5, viewportWidth: 305, viewportHeight: VIEWPORT });

        expect(ctx.calls[0]).toEqual(["clearRect", 0, 0, 305, VIEWPORT]);
    });

    test("paints one icon per visible entry", () => {
        const ctx = recordingCtx();
        const items = bigItems(10);
        makeRenderer().draw(ctx, { items, columns: 5, viewportWidth: 305, viewportHeight: VIEWPORT });

        expect(names(ctx)).toHaveLength(10);
        expect(names(ctx)[0]).toBe("0_0");
    });

    test("only paints the rows that touch the viewport", () => {
        const ctx = recordingCtx();
        makeRenderer().draw(ctx, {
            items: bigItems(3450),
            columns: 5,
            viewportWidth: 305,
            viewportHeight: VIEWPORT,
        });

        // 330px of a 61px row is 5.4 rows, plus one partial row.
        expect(names(ctx).length).toBeLessThanOrEqual(35);
        expect(names(ctx).length).toBeGreaterThan(20);
    });

    test("paints nothing for an empty inventory but still clears", () => {
        const ctx = recordingCtx();
        makeRenderer().draw(ctx, { items: [], columns: 5, viewportWidth: 305, viewportHeight: VIEWPORT });

        expect(names(ctx)).toHaveLength(0);
        expect(ctx.calls[0][0]).toBe("clearRect");
    });

    test("survives a missing context or item list", () => {
        const renderer = makeRenderer();

        expect(() => renderer.draw(null, { items: bigItems(5), columns: 5, viewportWidth: 305, viewportHeight: VIEWPORT })).not.toThrow();
        expect(() => renderer.draw(recordingCtx(), { items: null, columns: 5, viewportWidth: 305, viewportHeight: VIEWPORT })).not.toThrow();
        expect(() => renderer.draw(recordingCtx(), { items: bigItems(5), columns: 0, viewportWidth: 305, viewportHeight: VIEWPORT })).not.toThrow();
    });

    test("lays icons out in a grid at the item pitch", () => {
        const ctx = recordingCtx();
        makeRenderer().draw(ctx, {
            items: bigItems(6),
            columns: 3,
            scrollTop: 0,
            viewportWidth: 3 * PITCH,
            viewportHeight: VIEWPORT,
        });

        const placed = ctx.calls.filter(c => c[0] === "drawImage").map(c => [c[2], c[3]]);

        expect(placed[0]).toEqual([0, 0]);
        expect(placed[1]).toEqual([PITCH, 0]);
        expect(placed[2]).toEqual([PITCH * 2, 0]);
        expect(placed[3]).toEqual([0, PITCH]);
    });

    test("shifts painted rows up by scrollTop", () => {
        const ctx = recordingCtx();
        const scrollTop = 10 * PITCH;
        makeRenderer().draw(ctx, {
            items: bigItems(100),
            columns: 5,
            scrollTop,
            viewportWidth: 305,
            viewportHeight: VIEWPORT,
        });

        const ys = ctx.calls.filter(c => c[0] === "drawImage").map(c => c[3]);
        const firstVisibleRow = 10 * PITCH;

        // The first painted row sits exactly at the top edge, the next one a row below.
        expect(ys[0]).toBe(0);
        expect(ys[5]).toBe(PITCH);
        expect(Math.min(...ys)).toBeGreaterThanOrEqual(firstVisibleRow - scrollTop);
    });

    test("draws the entries at the expected flat indices after scrolling", () => {
        const ctx = recordingCtx();
        makeRenderer().draw(ctx, {
            items: bigItems(100),
            columns: 5,
            scrollTop: 3 * PITCH,
            viewportWidth: 305,
            viewportHeight: VIEWPORT,
        });

        expect(names(ctx)[0]).toBe("15_0");
    });

    test("asks the icon factory for a oneshot image with numeric index and rarity", () => {
        const seen = [];
        const renderer = makeRenderer({
            getPetalIcon: (index, rarity, mode) => {
                seen.push([index, rarity, mode]);
                return icon("x");
            },
        });

        renderer.draw(recordingCtx(), {
            items: [{ index: "42", rarity: 3, count: 1 }],
            columns: 1,
            viewportWidth: 305,
            viewportHeight: VIEWPORT,
        });

        expect(seen[0]).toEqual([42, 3, "oneshot"]);
    });

    test("sizes every icon to the item size", () => {
        const ctx = recordingCtx();
        makeRenderer().draw(ctx, {
            items: bigItems(4),
            columns: 2,
            viewportWidth: 305,
            viewportHeight: VIEWPORT,
        });

        for (const call of ctx.calls.filter(c => c[0] === "drawImage")) {
            expect([call[4], call[5]]).toEqual([INVENTORY_ITEM_SIZE, INVENTORY_ITEM_SIZE]);
        }
    });
});

describe("count labels", () => {
    test("draws no label for a single entry", () => {
        const ctx = recordingCtx();
        makeRenderer().draw(ctx, {
            items: [{ index: 1, rarity: 0, count: 1 }],
            columns: 1,
            viewportWidth: 305,
            viewportHeight: VIEWPORT,
        });

        expect(ctx.calls.filter(c => c[0] === "fillText")).toHaveLength(0);
        expect(ctx.calls.filter(c => c[0] === "strokeText")).toHaveLength(0);
    });

    test("draws a stacked label for a counted entry", () => {
        const ctx = recordingCtx();
        makeRenderer().draw(ctx, {
            items: [{ index: 1, rarity: 0, count: 2500 }],
            columns: 1,
            viewportWidth: 305,
            viewportHeight: VIEWPORT,
        });

        const fills = ctx.calls.filter(c => c[0] === "fillText");
        const strokes = ctx.calls.filter(c => c[0] === "strokeText");

        expect(fills).toHaveLength(1);
        expect(fills[0][1]).toBe("x2500");
        // Outlined first, then filled on top, so the text stays readable on any icon.
        expect(strokes).toHaveLength(1);
        expect(ctx.calls.indexOf(strokes[0])).toBeLessThan(ctx.calls.indexOf(fills[0]));
    });

    test("anchors the label to the top right of its own icon", () => {
        const ctx = recordingCtx();
        makeRenderer().draw(ctx, {
            items: [
                { index: 1, rarity: 0, count: 5 },
                { index: 2, rarity: 0, count: 5 },
            ],
            columns: 2,
            scrollTop: 0,
            viewportWidth: 2 * PITCH,
            viewportHeight: VIEWPORT,
        });

        const fills = ctx.calls.filter(c => c[0] === "fillText");

        // Each label sits one pitch further right than the previous icon.
        expect(fills[0].slice(2)).toEqual([INVENTORY_ITEM_SIZE - 4, 4]);
        expect(fills[1].slice(2)).toEqual([PITCH + INVENTORY_ITEM_SIZE - 4, 4]);
    });

    test("runs the label through the amount formatter", () => {
        const ctx = recordingCtx();
        makeRenderer({ formatAmount: n => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)) }).draw(ctx, {
            items: [{ index: 1, rarity: 0, count: 8200 }],
            columns: 1,
            viewportWidth: 305,
            viewportHeight: VIEWPORT,
        });

        expect(ctx.calls.filter(c => c[0] === "fillText")[0][1]).toBe("x8.2k");
    });

    test("sets the text state once per frame, not once per icon", () => {
        const ctx = recordingCtx();
        makeRenderer().draw(ctx, {
            items: bigItems(30),
            columns: 5,
            viewportWidth: 305,
            viewportHeight: VIEWPORT,
        });

        const fonts = ctx.calls.filter(c => c[0] === "font");
        const aligns = ctx.calls.filter(c => c[0] === "textAlign");

        expect(fonts).toHaveLength(1);
        expect(aligns).toHaveLength(1);
        expect(fonts[0][1]).toBe(`bold ${INVENTORY_ITEM_SIZE * 0.25}px Ubuntu`);
    });
});

describe("indexAt", () => {
    const items = bigItems(100);
    const columns = 5;

    test("finds an entry under a point in the viewport", () => {
        const renderer = makeRenderer();

        expect(renderer.indexAt({ x: 5, y: 5, scrollTop: 0, totalItems: 100, columns })).toBe(0);
        expect(renderer.indexAt({ x: PITCH + 5, y: 5, scrollTop: 0, totalItems: 100, columns })).toBe(1);
        expect(renderer.indexAt({ x: 5, y: PITCH + 5, scrollTop: 0, totalItems: 100, columns })).toBe(5);
    });

    test("adds scrollTop back in so it works in viewport coordinates", () => {
        const renderer = makeRenderer();
        const scrollTop = 4 * PITCH;

        // The entry at content row 4 is pinned to the top of the viewport once scrolled.
        expect(renderer.indexAt({ x: 5, y: 5, scrollTop, totalItems: 100, columns })).toBe(20);
    });

    test("returns -1 in a gap rather than the nearest entry", () => {
        const renderer = makeRenderer();

        expect(renderer.indexAt({ x: INVENTORY_ITEM_SIZE + 1, y: 5, scrollTop: 0, totalItems: 100, columns })).toBe(-1);
    });

    test("returns -1 past the last column and the last row", () => {
        const renderer = makeRenderer();

        expect(renderer.indexAt({ x: PITCH * columns, y: 5, scrollTop: 0, totalItems: 100, columns })).toBe(-1);
        expect(renderer.indexAt({ x: 5, y: 20 * PITCH, scrollTop: 0, totalItems: 100, columns })).toBe(-1);
    });

    test("returns -1 when the menu is empty", () => {
        expect(makeRenderer().indexAt({ x: 5, y: 5, scrollTop: 0, totalItems: 0, columns })).toBe(-1);
    });

    test("agrees with draw for every visible entry after a scroll", () => {
        const renderer = makeRenderer();
        const columnsAt = 5;
        const scrollTop = 17 * PITCH;

        const ctx = recordingCtx();
        renderer.draw(ctx, { items, columns: columnsAt, scrollTop, viewportWidth: 305, viewportHeight: VIEWPORT });

        const drawn = ctx.calls.filter(c => c[0] === "drawImage").map(c => [c[2], c[3]]);

        // Every icon that was painted must hit test back to the entry it came from.
        for (const [x, top] of drawn) {
            const expected = renderer.indexAt({
                x: x + 5,
                y: top + 5,
                scrollTop,
                totalItems: items.length,
                columns: columnsAt,
            });

            expect(expected).toBeGreaterThanOrEqual(85);
            expect(expected).toBeLessThan(100);
        }
    });
});

describe("anchorFor", () => {
    test("returns the icon centre lifted above the cursor line", () => {
        const { x, y } = makeRenderer().anchorFor(0, { columns: 5, scrollTop: 0 });

        expect(x).toBe(INVENTORY_ITEM_SIZE / 2);
        expect(y).toBe(INVENTORY_ITEM_SIZE / 2 - 22);
    });

    test("tracks the scroll position", () => {
        const { y } = makeRenderer().anchorFor(0, { columns: 5, scrollTop: 3 * PITCH });

        expect(y).toBe(INVENTORY_ITEM_SIZE / 2 - 22 - 3 * PITCH);
    });

    test("offsets by column and row", () => {
        const { x, y } = makeRenderer().anchorFor(6, { columns: 5, scrollTop: 0 });

        expect(x).toBe(PITCH + INVENTORY_ITEM_SIZE / 2);
        expect(y).toBe(PITCH + INVENTORY_ITEM_SIZE / 2 - 22);
    });
});

describe("contentHeight", () => {
    test("reserves a full row per row so the scrollbar matches the old menu", () => {
        const renderer = makeRenderer();

        expect(renderer.contentHeight(10, 5)).toBe(computeContentHeight(10, 5));
        expect(renderer.contentHeight(3450, 5)).toBe(690 * 61);
    });

    test("grows with the entry count", () => {
        const renderer = makeRenderer();

        expect(renderer.contentHeight(3451, 5)).toBeGreaterThan(renderer.contentHeight(3450, 5));
    });

    test("is zero for an empty inventory", () => {
        expect(makeRenderer().contentHeight(0, 5)).toBe(0);
    });
});

describe("the layout and the renderer agree", () => {
    test("column count drives both the row layout and the hit test", () => {
        const columns = computeColumns(PITCH * 5);
        const ctx = recordingCtx();
        const items = bigItems(20);
        const renderer = makeRenderer();

        renderer.draw(ctx, { items, columns, viewportWidth: PITCH * 5, viewportHeight: VIEWPORT });

        const drawn = ctx.calls.filter(c => c[0] === "drawImage");
        const xs = [...new Set(drawn.map(c => c[2]))].sort((a, b) => a - b);

        expect(xs).toEqual([0, PITCH, PITCH * 2, PITCH * 3, PITCH * 4]);

        for (const [x, top] of drawn.map(c => [c[2], c[3]])) {
            expect(renderer.indexAt({ x: x + 1, y: top + 1, totalItems: items.length, columns })).toBeGreaterThanOrEqual(0);
        }
    });
});
