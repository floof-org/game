import { describe, expect, test } from "bun:test";
import {
    INVENTORY_ITEM_SIZE,
    INVENTORY_GAP,
    buildInventoryItems,
    computeColumns,
    computeContentHeight,
    computeTotalRows,
    computeVisibleRange,
    hitTest,
    isSameInventory,
    itemPosition,
    syncInventory,
} from "../public/lib/inventoryLayout.js";

const PITCH = INVENTORY_ITEM_SIZE + INVENTORY_GAP;
const ROW = INVENTORY_ITEM_SIZE + INVENTORY_GAP;
const CENTER = INVENTORY_ITEM_SIZE / 2;

// A viewport that shows a bit more than six rows, matching the real 330px menu.
const VIEWPORT = 330;

describe("computeColumns", () => {
    test("fits as many icons as the width allows", () => {
        // Five icons need five sizes and four gaps, so the boundary sits at 300px.
        expect(computeColumns(300)).toBe(5);
        expect(computeColumns(305)).toBe(5);
        expect(computeColumns(299)).toBe(4);
        expect(computeColumns(361)).toBe(6);
    });

    test("never returns zero or negative for degenerate widths", () => {
        expect(computeColumns(0)).toBe(1);
        expect(computeColumns(-100)).toBe(1);
        expect(computeColumns(1)).toBe(1);
        expect(computeColumns(NaN)).toBe(1);
        expect(computeColumns(undefined)).toBe(1);
    });

    test("a column narrower than one icon still yields a single column", () => {
        expect(computeColumns(INVENTORY_ITEM_SIZE - 1)).toBe(1);
    });
});

describe("computeTotalRows / computeContentHeight", () => {
    test("rounds a partial last row up", () => {
        expect(computeTotalRows(10, 5)).toBe(2);
        expect(computeTotalRows(11, 5)).toBe(3);
        expect(computeTotalRows(3451, 5)).toBe(691);
    });

    test("handles an exact multiple without a phantom row", () => {
        expect(computeTotalRows(10, 5)).toBe(2);
        expect(computeTotalRows(3450, 5)).toBe(690);
    });

    test("empty inventory has no rows and no height", () => {
        expect(computeTotalRows(0, 5)).toBe(0);
        expect(computeContentHeight(0, 5)).toBe(0);
    });

    test("height is one full row per row, matching the old scroll extent", () => {
        expect(computeContentHeight(10, 5)).toBe(2 * ROW);
        expect(computeContentHeight(3450, 5)).toBe(690 * ROW);
    });
});

describe("computeVisibleRange", () => {
    test("starts at the row under scrollTop", () => {
        const r = computeVisibleRange({ scrollTop: 3 * ROW, viewportHeight: VIEWPORT, totalItems: 100, columns: 5 });

        expect(r.startRow).toBe(3);
        expect(r.startIndex).toBe(15);
    });

    test("includes the partially visible bottom row", () => {
        // VIEWPORT / ROW is 5.4, so five whole rows plus one partial row.
        const r = computeVisibleRange({ scrollTop: 0, viewportHeight: VIEWPORT, totalItems: 100, columns: 5 });

        expect(r.startRow).toBe(0);
        expect(r.endRow).toBe(7);
        expect(r.rowCount).toBe(35);
    });

    test("never runs past the end of the inventory", () => {
        const r = computeVisibleRange({ scrollTop: 99 * ROW, viewportHeight: VIEWPORT, totalItems: 100, columns: 5 });

        expect(r.endIndex).toBe(100);
        expect(r.endRow).toBe(computeTotalRows(100, 5));
    });

    test("clamps a start row beyond the content instead of returning nothing", () => {
        const r = computeVisibleRange({ scrollTop: 5000 * ROW, viewportHeight: VIEWPORT, totalItems: 100, columns: 5 });

        expect(r.startRow).toBe(computeTotalRows(100, 5) - 1);
        expect(r.endIndex).toBe(100);
    });

    test("treats a negative scrollTop as the top", () => {
        const r = computeVisibleRange({ scrollTop: -500, viewportHeight: VIEWPORT, totalItems: 100, columns: 5 });

        expect(r.startRow).toBe(0);
        expect(r.startIndex).toBe(0);
    });

    test("empty inventory yields an empty range", () => {
        const r = computeVisibleRange({ scrollTop: 0, viewportHeight: VIEWPORT, totalItems: 0, columns: 5 });

        expect(r).toMatchObject({ startIndex: 0, endIndex: 0, rowCount: 0 });
    });

    test("a single item is still visible at any scroll position", () => {
        const r = computeVisibleRange({ scrollTop: 0, viewportHeight: VIEWPORT, totalItems: 1, columns: 1 });

        expect(r.startIndex).toBe(0);
        expect(r.endIndex).toBe(1);
    });

    test("the window stays small no matter how large the inventory is", () => {
        // This is the property that replaces per-icon DOM nodes: cost tracks the
        // viewport, not the item count.
        for (const total of [100, 3450, 50000, 1000000]) {
            const r = computeVisibleRange({ scrollTop: 100 * ROW, viewportHeight: VIEWPORT, totalItems: total, columns: 5 });
            expect(r.rowCount).toBeLessThanOrEqual(7 * 5);
        }
    });
});

describe("itemPosition / hitTest round trip", () => {
    const columns = 5;
    const totalItems = 3450;

    test("every item's own position hit tests back to itself", () => {
        for (let i = 0; i < totalItems; i++) {
            const { x, y } = itemPosition(i, columns);
            expect(hitTest({ x, y, totalItems, columns })).toBe(i);
        }
    });

    test("the centre of every item hit tests back to itself", () => {
        for (let i = 0; i < totalItems; i++) {
            const { x, y } = itemPosition(i, columns);
            expect(hitTest({ x: x + CENTER, y: y + CENTER, totalItems, columns })).toBe(i);
        }
    });

    test("the last item of a partial final row is reachable", () => {
        const total = 3451;
        const last = total - 1;
        const { x, y } = itemPosition(last, columns);

        expect(last % columns).toBe(0);
        expect(hitTest({ x: x + CENTER, y: y + CENTER, totalItems: total, columns })).toBe(last);
    });

    test("a scrolled item is found once scrollTop is added back into y", () => {
        const columnsAt = 3;
        const index = 47;
        const { x, y } = itemPosition(index, columnsAt);

        // Mouse 10px below the top of the item, as it appears on screen.
        const screenY = y - 30 * ROW + 10;

        expect(hitTest({ x: x + CENTER, y: screenY + 30 * ROW, totalItems: 100, columns: columnsAt })).toBe(index);
    });
});

describe("hitTest misses", () => {
    const columns = 5;
    const totalItems = 100;

    test("the gap between two icons is a miss, not the nearest neighbour", () => {
        const { x, y } = itemPosition(0, columns);

        expect(hitTest({ x: x + INVENTORY_ITEM_SIZE + 1, y, totalItems, columns })).toBe(-1);
        expect(hitTest({ x, y: y + INVENTORY_ITEM_SIZE + 1, totalItems, columns })).toBe(-1);
    });

    test("the last pixel of a gap is still a miss", () => {
        const { x, y } = itemPosition(0, columns);

        expect(hitTest({ x: x + PITCH - 1, y, totalItems, columns })).toBe(-1);
    });

    test("past the last column is a miss", () => {
        const { y } = itemPosition(0, columns);

        expect(hitTest({ x: PITCH * columns, y, totalItems, columns })).toBe(-1);
        expect(hitTest({ x: PITCH * columns + 50, y, totalItems, columns })).toBe(-1);
    });

    test("past the last row is a miss rather than an out of range index", () => {
        const bottom = computeTotalRows(totalItems, columns) * ROW;

        expect(hitTest({ x: 0, y: bottom, totalItems, columns })).toBe(-1);
    });

    test("negative coordinates are a miss", () => {
        expect(hitTest({ x: -1, y: 0, totalItems, columns })).toBe(-1);
        expect(hitTest({ x: 0, y: -1, totalItems, columns })).toBe(-1);
    });

    test("an empty inventory never reports a hit", () => {
        expect(hitTest({ x: 0, y: 0, totalItems: 0, columns })).toBe(-1);
        expect(hitTest({ x: 30, y: 30, totalItems: 5, columns: 0 })).toBe(-1);
    });
});

describe("buildInventoryItems", () => {
    const tiers = [{ name: "Common" }, { name: "Rare" }, { name: "Mythic" }];
    const petalConfigs = { 0: { name: "Rose" }, 1: { name: "Apple" }, 2: { name: "Banana" } };

    test("orders tiers newest first, then petals alphabetically", () => {
        const items = buildInventoryItems(
            { Common: { 0: 1, 1: 1 }, Rare: { 0: 1 }, Mythic: { 0: 1 } },
            tiers,
            petalConfigs
        );

        expect(items.map(i => `${i.tierName}:${i.index}`)).toEqual([
            "Mythic:0",
            "Rare:0",
            "Common:1", // Apple sorts before Rose
            "Common:0",
        ]);
        expect(items.map(i => i.rarity)).toEqual([2, 1, 0, 0]);
    });

    test("drops zero count entries", () => {
        const items = buildInventoryItems({ Common: { 0: 0, 1: 5, 2: 0 } }, tiers, petalConfigs);

        expect(items).toHaveLength(1);
        expect(items[0].count).toBe(5);
    });

    test("returns a list for a missing inventory instead of throwing", () => {
        expect(buildInventoryItems(null, tiers, petalConfigs)).toEqual([]);
        expect(buildInventoryItems(undefined, tiers, petalConfigs)).toEqual([]);
        expect(buildInventoryItems({}, tiers, petalConfigs)).toEqual([]);
    });

    test("keeps indices as numbers so the canvas can look an icon up", () => {
        const items = buildInventoryItems({ Common: { 7: 3 } }, tiers, petalConfigs);

        expect(items[0].index).toBe(7);
        expect(typeof items[0].index).toBe("number");
    });

    test("sorting does not mutate the source inventory", () => {
        const inventory = { Common: { 0: 1, 1: 1 } };
        const snapshot = JSON.stringify(inventory);

        buildInventoryItems(inventory, tiers, petalConfigs);

        expect(JSON.stringify(inventory)).toBe(snapshot);
    });

    test("a full addall sized inventory flattens to every entry", () => {
        // 33 rarities of 105 petals, which is what a /addall produces.
        const manyTiers = Array.from({ length: 33 }, (_, i) => ({ name: `T${i}` }));
        const configs = {};
        for (let i = 0; i < 105; i++) configs[i] = { name: `P${String(i).padStart(3, "0")}` };

        const inventory = {};
        for (let t = 0; t < 33; t++) {
            inventory[`T${t}`] = {};
            for (let p = 0; p < 105; p++) inventory[`T${t}`][p] = 1;
        }

        const items = buildInventoryItems(inventory, manyTiers, configs);

        expect(items).toHaveLength(3465);

        const columns = computeColumns(PITCH * 5);
        const { endIndex } = computeVisibleRange({
            scrollTop: 0,
            viewportHeight: VIEWPORT,
            totalItems: items.length,
            columns,
        });

        // 3465 entries still only paint 7 rows worth of icons.
        expect(endIndex).toBeLessThanOrEqual(35);
    });
});

describe("isSameInventory", () => {
    test("treats identical contents as unchanged", () => {
        expect(isSameInventory({ A: { 1: 2 } }, { A: { 1: 2 } })).toBe(true);
    });

    test("catches a changed count", () => {
        expect(isSameInventory({ A: { 1: 2 } }, { A: { 1: 3 } })).toBe(false);
    });

    test("catches an added and a removed petal", () => {
        expect(isSameInventory({ A: { 1: 2 } }, { A: { 1: 2, 2: 1 } })).toBe(false);
        expect(isSameInventory({ A: { 1: 2, 2: 1 } }, { A: { 1: 2 } })).toBe(false);
    });

    test("catches an added and a removed tier", () => {
        expect(isSameInventory({ A: { 1: 2 } }, { A: { 1: 2 }, B: { 1: 1 } })).toBe(false);
        expect(isSameInventory({ A: { 1: 2 }, B: { 1: 1 } }, { A: { 1: 2 } })).toBe(false);
    });

    test("handles a missing snapshot on either side", () => {
        expect(isSameInventory(null, null)).toBe(true);
        expect(isSameInventory(undefined, undefined)).toBe(true);
        expect(isSameInventory({ A: {} }, null)).toBe(false);
        expect(isSameInventory(null, { A: {} })).toBe(false);
    });

    test("distinguishes an empty tier from a missing one", () => {
        expect(isSameInventory({ A: {} }, {})).toBe(false);
    });
});

describe("syncInventory", () => {
    test("copies values into the existing snapshot object", () => {
        const dst = { A: { 1: 1 } };
        const result = syncInventory(dst, { A: { 1: 9 }, B: { 2: 3 } });

        expect(result).toBe(dst);
        expect(dst).toEqual({ A: { 1: 9 }, B: { 2: 3 } });
    });

    test("drops tiers and petals that disappeared", () => {
        const dst = { A: { 1: 1, 2: 2 }, B: { 3: 3 } };
        syncInventory(dst, { A: { 1: 5 } });

        expect(dst).toEqual({ A: { 1: 5 } });
        expect("B" in dst).toBe(false);
        expect("2" in dst.A).toBe(false);
    });

    test("returns null when there is nothing to sync from", () => {
        expect(syncInventory({ A: {} }, null)).toBeNull();
    });

    test("handles an uninitialised snapshot", () => {
        const result = syncInventory(undefined, { A: { 1: 2 } });

        expect(result).toEqual({ A: { 1: 2 } });
    });

    test("does not alias the source petals, so later changes are still detected", () => {
        const src = { A: { 1: 1 } };
        const dst = syncInventory(undefined, src);

        src.A[1] = 42;

        expect(dst.A[1]).toBe(1);
        expect(isSameInventory(dst, src)).toBe(false);
    });

    test("reaches the same state as a fresh deep clone", () => {
        const src = { A: { 1: 1, 2: 2 }, B: { 3: 3 }, C: {} };
        const dst = { A: { 1: 99, 5: 5 }, D: { 7: 7 } };

        syncInventory(dst, src);

        expect(dst).toEqual(JSON.parse(JSON.stringify(src)));
        expect(isSameInventory(dst, src)).toBe(true);
    });
});
