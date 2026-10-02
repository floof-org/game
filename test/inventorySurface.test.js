import { describe, expect, test } from "bun:test";
import { EMPTY_INVENTORY_TEXT, createInventorySurface } from "../public/lib/inventoryView.js";
import { INVENTORY_ITEM_SIZE } from "../public/lib/inventoryLayout.js";

const PITCH = INVENTORY_ITEM_SIZE + 5;
const ROW = PITCH;

// The real menu is 300x350. The surface zeroes the padding and fills it, so the whole
// box is the viewport, and 300px fits five 56px icons with four 5px gaps.
const MENU_W = 300;
const MENU_H = 350;
const COLUMNS = 5;
const VISIBLE_ROWS = Math.ceil(MENU_H / ROW) + 1;

const RECT = { left: 60, top: 5, width: MENU_W, height: MENU_H };

function stubCanvas() {
    const el = {
        tagName: "canvas",
        style: {},
        width: 0,
        height: 0,
        _calls: [],
        getContext() {
            return {
                clearRect: (...a) => el._calls.push(["clearRect", ...a]),
                drawImage: (img, ...a) => el._calls.push(["drawImage", img, ...a]),
                strokeText: (...a) => el._calls.push(["strokeText", ...a]),
                fillText: (...a) => el._calls.push(["fillText", ...a]),
                fillStyle: "",
                strokeStyle: "",
                lineWidth: 0,
                font: "",
                textAlign: "",
                textBaseline: "",
            };
        },
        getBoundingClientRect: () => RECT,
    };
    return el;
}

function makeHost() {
    const host = {
        tagName: "div",
        style: {},
        children: [],
        textContent: "",
        replaceChildren(...kids) {
            host.children = kids;
            host.textContent = "";
        },
    };
    return host;
}

function makeSurface(host = makeHost(), overrides = {}) {
    return createInventorySurface({
        host,
        createCanvas: stubCanvas,
        measure: () => ({ contentWidth: MENU_W, contentHeight: MENU_H }),
        rendererOptions: {
            getPetalIcon: (index, rarity) => ({ name: `${index}_${rarity}` }),
            formatAmount: n => String(n),
        },
        ...overrides,
    });
}

const items = n => Array.from({ length: n }, (_, i) => ({ index: i % 100, rarity: (i / 100) | 0, count: 1 }));
const drawn = surface => (surface.canvas?._calls ?? []).filter(c => c[0] === "drawImage");
const resetCalls = surface => { surface.canvas._calls.length = 0; };

describe("mounting", () => {
    test("puts exactly one element in the host", () => {
        const host = makeHost();
        const surface = makeSurface(host);

        expect(surface.show(items(100))).toBe(true);
        expect(host.children).toHaveLength(1);
        expect(host.children[0].tagName).toBe("canvas");
    });

    test("fills the menu outright instead of relying on sticky or a transform", () => {
        const host = makeHost();
        makeSurface(host).show(items(100));

        expect(host.children[0].style).toEqual({
            position: "absolute",
            left: "0",
            top: "0",
            width: "100%",
            height: "100%",
            display: "block",
        });
    });

    test("creates no scroll spacer, so no fifty thousand pixel box is laid out", () => {
        const host = makeHost();
        makeSurface(host).show(items(3450));

        expect(host.children.filter(c => c.tagName === "div")).toHaveLength(0);
    });

    test("reuses the same canvas when shown again", () => {
        const host = makeHost();
        const surface = makeSurface(host);

        surface.show(items(100));
        const first = surface.canvas;

        surface.show(items(120));

        expect(surface.canvas).toBe(first);
        expect(host.children[0]).toBe(first);
    });

    test("sizes the canvas backing store to the viewport", () => {
        const surface = makeSurface();
        surface.show(items(100));

        expect(surface.canvas.width).toBe(MENU_W);
        expect(surface.canvas.height).toBe(MENU_H);
    });

    test("derives the column count from the viewport width", () => {
        const surface = makeSurface();
        surface.show(items(100));

        expect(surface.columns).toBe(COLUMNS);
    });

    test("caches the rect on show so the game loop never reads layout", () => {
        const surface = makeSurface();
        surface.show(items(100));

        expect(surface.rect).toBe(RECT);
    });
});

describe("scroll range", () => {
    test("is the grid height minus the viewport", () => {
        const surface = makeSurface();
        surface.show(items(3450));

        const rows = Math.ceil(3450 / COLUMNS);
        expect(surface.maxScrollTop()).toBe(rows * ROW - MENU_H);
    });

    test("is zero when everything fits on screen", () => {
        const surface = makeSurface();
        surface.show(items(4));

        expect(surface.maxScrollTop()).toBe(0);
        expect(surface.canScroll()).toBe(false);
    });

    test("grows as the inventory fills up", () => {
        const surface = makeSurface();

        surface.show(items(8));
        const small = surface.maxScrollTop();

        surface.show(items(3450));

        expect(surface.maxScrollTop()).toBeGreaterThan(small);
    });

    test("clamps the offset when a rebuild shrinks the grid", () => {
        const surface = makeSurface();

        surface.show(items(3450));
        surface.scrollTo(99999);
        expect(surface.scrollTop).toBe(surface.maxScrollTop());

        surface.show(items(4));
        expect(surface.scrollTop).toBe(0);
    });
});

describe("scrolling", () => {
    test("moves the offset and repaints", () => {
        const surface = makeSurface();
        surface.show(items(1000));
        resetCalls(surface);

        expect(surface.scrollBy(10 * ROW)).toBe(true);
        expect(surface.scrollTop).toBe(10 * ROW);
        expect(drawn(surface)[0][3]).toBe(0);
    });

    test("reports no change when it is already at an edge", () => {
        const surface = makeSurface();
        surface.show(items(1000));

        expect(surface.scrollBy(-500)).toBe(false);
        expect(surface.scrollTop).toBe(0);
    });

    test("does not scroll past the last row", () => {
        const surface = makeSurface();
        surface.show(items(1000));

        surface.scrollTo(1e9);

        expect(surface.scrollTop).toBe(surface.maxScrollTop());
    });

    test("scrollTo jumps straight to an offset", () => {
        const surface = makeSurface();
        surface.show(items(1000));

        surface.scrollTo(100);

        expect(surface.scrollTop).toBe(100);
    });

    test("ignores a zero delta without repainting", () => {
        const surface = makeSurface();
        surface.show(items(1000));
        resetCalls(surface);

        expect(surface.scrollBy(0)).toBe(false);
        expect(surface.canvas._calls).toHaveLength(0);
    });
});

describe("handleWheel", () => {
    test("consumes the event and scrolls when the grid is taller than the viewport", () => {
        const surface = makeSurface();
        surface.show(items(1000));

        expect(surface.handleWheel({ deltaY: 120 })).toBe(true);
        expect(surface.scrollTop).toBe(120);
    });

    test("leaves the event alone when there is nothing to scroll", () => {
        const surface = makeSurface();
        surface.show(items(4));

        expect(surface.handleWheel({ deltaY: 120 })).toBe(false);
        expect(surface.scrollTop).toBe(0);
    });

    test("leaves the event alone at the bottom so the page can take over", () => {
        const surface = makeSurface();
        surface.show(items(1000));

        surface.scrollTo(1e9);
        expect(surface.scrollTop).toBe(surface.maxScrollTop());

        expect(surface.handleWheel({ deltaY: 120 })).toBe(false);
    });

    test("scales line and page deltas to pixels", () => {
        const surface = makeSurface();
        surface.show(items(1000));

        surface.handleWheel({ deltaY: 3, deltaMode: 1 });
        expect(surface.scrollTop).toBe(48);

        surface.scrollTo(0);
        surface.handleWheel({ deltaY: 1, deltaMode: 2 });
        expect(surface.scrollTop).toBe(MENU_H);
    });

    test("scrolls up on a negative delta", () => {
        const surface = makeSurface();
        surface.show(items(1000));

        surface.scrollTo(500);
        surface.handleWheel({ deltaY: -200 });

        expect(surface.scrollTop).toBe(300);
    });
});

describe("painting", () => {
    test("paints the first rows on show", () => {
        const surface = makeSurface();
        surface.show(items(3450));

        expect(drawn(surface).length).toBeLessThanOrEqual(VISIBLE_ROWS * COLUMNS);
        expect(drawn(surface).length).toBeGreaterThan(COLUMNS * 4);
    });

    test("paints no more than a screenful no matter how large the inventory is", () => {
        for (const total of [100, 3450, 50000, 1000000]) {
            const surface = makeSurface();
            surface.show(items(total));

            expect(drawn(surface).length).toBeLessThanOrEqual(VISIBLE_ROWS * COLUMNS);
        }
    });

    test("shifts the painted rows as the offset moves", () => {
        const surface = makeSurface();
        surface.show(items(1000));

        surface.scrollTo(10 * ROW);
        resetCalls(surface);
        surface.paint();

        expect(drawn(surface)[0][3]).toBe(0);
        expect(drawn(surface)[COLUMNS][3]).toBe(ROW);
    });

    test("clears the viewport so no stale icon is left behind", () => {
        const surface = makeSurface();
        surface.show(items(100));

        expect(surface.canvas._calls[0]).toEqual(["clearRect", 0, 0, MENU_W, MENU_H]);
    });

    test("does not touch the context before anything is shown", () => {
        const surface = makeSurface();

        expect(() => surface.paint()).not.toThrow();
        expect(drawn(surface)).toHaveLength(0);
    });
});

describe("empty inventory", () => {
    test("shows the empty message and unmounts", () => {
        const host = makeHost();
        const surface = makeSurface(host);

        expect(surface.show([])).toBe(false);
        expect(host.textContent).toBe(EMPTY_INVENTORY_TEXT);
        expect(host.children).toHaveLength(0);
        expect(surface.mounted).toBe(false);
        expect(surface.rect).toBeNull();
    });

    test("treats a missing item list as empty", () => {
        const surface = makeSurface();

        expect(surface.show(null)).toBe(false);
        expect(surface.show(undefined)).toBe(false);
    });

    test("rebuilds the canvas after going from empty back to full", () => {
        const host = makeHost();
        const surface = makeSurface(host);

        surface.show(items(100));
        const first = surface.canvas;

        surface.show([]);
        expect(surface.canvas).toBeNull();

        expect(surface.show(items(100))).toBe(true);
        expect(surface.canvas).not.toBeNull();
        expect(surface.canvas).not.toBe(first);
        expect(host.children).toHaveLength(1);
    });

    test("never reports a hover target while empty", () => {
        const surface = makeSurface();
        surface.show([]);

        expect(surface.indexAtScreen({ screenX: RECT.left + 10, screenY: RECT.top + 10 })).toBe(-1);
    });

    test("refuses to scroll while empty", () => {
        const surface = makeSurface();
        surface.show([]);

        expect(surface.handleWheel({ deltaY: 500 })).toBe(false);
        expect(surface.scrollBy(500)).toBe(false);
    });
});

describe("degenerate measurement", () => {
    test("reports failure and paints nothing when the menu has no size", () => {
        const surface = makeSurface(makeHost(), { measure: () => ({ contentWidth: 0, contentHeight: 0 }) });

        expect(surface.show(items(100))).toBe(false);
        expect(drawn(surface)).toHaveLength(0);
    });

    test("copes with a collapsed menu without throwing", () => {
        const surface = makeSurface(makeHost(), { measure: () => ({ contentWidth: -10, contentHeight: 0 }) });

        expect(() => surface.show(items(100))).not.toThrow();
    });
});

describe("indexAtScreen", () => {
    test("resolves the entry under a viewport point", () => {
        const surface = makeSurface();
        surface.show(items(100));

        expect(surface.indexAtScreen({ screenX: RECT.left + 5, screenY: RECT.top + 5 })).toBe(0);
        expect(surface.indexAtScreen({ screenX: RECT.left + PITCH + 5, screenY: RECT.top + 5 })).toBe(1);
        expect(surface.indexAtScreen({ screenX: RECT.left + 5, screenY: RECT.top + ROW + 5 })).toBe(COLUMNS);
    });

    test("subtracts the canvas origin so the menu position does not matter", () => {
        const surface = makeSurface();
        surface.show(items(100));

        // Same local point, different absolute position.
        expect(surface.indexAtScreen({ screenX: 400 + 5, screenY: 300 + 5 })).toBe(-1);
        expect(surface.indexAtScreen({ screenX: RECT.left + 5, screenY: RECT.top + 5 })).toBe(0);
    });

    test("accounts for the offset", () => {
        const surface = makeSurface();
        surface.show(items(1000));

        surface.scrollTo(20 * ROW);

        expect(surface.indexAtScreen({ screenX: RECT.left + 5, screenY: RECT.top + 5 })).toBe(20 * COLUMNS);
    });

    test("returns -1 in a gap between icons", () => {
        const surface = makeSurface();
        surface.show(items(100));

        expect(surface.indexAtScreen({ screenX: RECT.left + INVENTORY_ITEM_SIZE + 1, screenY: RECT.top + 5 })).toBe(-1);
    });

    test("returns -1 when the cursor is outside the canvas", () => {
        const surface = makeSurface();
        surface.show(items(100));

        expect(surface.indexAtScreen({ screenX: 5, screenY: 5 })).toBe(-1);
        expect(surface.indexAtScreen({ screenX: RECT.left + MENU_W + 40, screenY: RECT.top + 5 })).toBe(-1);
    });

    test("returns -1 before anything is mounted", () => {
        const surface = makeSurface();

        expect(surface.indexAtScreen({ screenX: RECT.left + 5, screenY: RECT.top + 5 })).toBe(-1);
    });

    test("skips the hit test entirely when the cursor is off the canvas", () => {
        const surface = makeSurface();
        surface.show(items(100));

        // Far outside the menu, and inside it but past the last column.
        expect(surface.indexAtScreen({ screenX: 0, screenY: 0 })).toBe(-1);
        expect(surface.indexAtScreen({ screenX: RECT.left + MENU_W + 1, screenY: RECT.top + 5 })).toBe(-1);
    });

    test("every entry reachable on screen is one that was painted", () => {
        const surface = makeSurface();
        surface.show(items(3450));

        const painted = drawn(surface);
        const ys = new Set(painted.map(c => c[3]));

        // Sweep the viewport and confirm no point resolves to an entry on a row that was
        // never drawn. The window deliberately paints one row past the fold, so the check
        // is that nothing inside the viewport is missing, not that every icon is reachable.
        for (let y = 0; y < MENU_H; y += 7) {
            for (let x = 0; x < MENU_W; x += 7) {
                const index = surface.indexAtScreen({ screenX: RECT.left + x, screenY: RECT.top + y });
                if (index < 0) continue;

                const rowTop = Math.floor(y / ROW) * ROW - (surface.scrollTop % ROW);
                expect(ys.has(rowTop)).toBe(true);
            }
        }
    });
});

describe("itemAt and anchorFor", () => {
    test("exposes the entry behind an index", () => {
        const surface = makeSurface();
        const list = items(100);
        surface.show(list);

        expect(surface.itemAt(7)).toBe(list[7]);
        expect(surface.items).toBe(list);
    });

    test("anchors the tooltip above the entry in canvas relative coordinates", () => {
        const surface = makeSurface();
        surface.show(items(100));

        const { x, y } = surface.anchorFor(0);

        expect(x).toBe(INVENTORY_ITEM_SIZE / 2);
        expect(y).toBe(INVENTORY_ITEM_SIZE / 2 - 22);
    });

    test("moves the anchor with the offset", () => {
        const surface = makeSurface();
        surface.show(items(1000));

        surface.scrollTo(3 * ROW);

        expect(surface.anchorFor(0).y).toBe(INVENTORY_ITEM_SIZE / 2 - 22 - 3 * ROW);
    });
});

describe("a full addall cycle", () => {
    test("mounts, scrolls and resolves every target with one DOM node", () => {
        const host = makeHost();
        const surface = makeSurface(host);

        const big = items(3465);
        expect(surface.show(big)).toBe(true);
        expect(host.children).toHaveLength(1);

        for (const offset of [0, 500, 5000, 20000, 50000]) {
            surface.scrollTo(offset);
            resetCalls(surface);
            surface.paint();

            const painted = drawn(surface);
            expect(painted.length).toBeGreaterThan(0);
            expect(painted.length).toBeLessThanOrEqual(VISIBLE_ROWS * COLUMNS);

            // Every row the viewport actually reaches must have been painted.
            const paintedRows = new Set(painted.map(c => c[3]));
            for (let y = 0; y < MENU_H; y += ROW) {
                if (surface.indexAtScreen({ screenX: RECT.left + 2, screenY: RECT.top + y }) < 0) continue;
                expect(paintedRows.has(y - (surface.scrollTop % ROW))).toBe(true);
            }
        }
    });

    test("never reads layout while scrolling", () => {
        let reads = 0;
        const canvas = stubCanvas();
        const rawRect = canvas.getBoundingClientRect;
        canvas.getBoundingClientRect = () => {
            reads++;
            return rawRect();
        };

        const surface = makeSurface(makeHost(), { createCanvas: () => canvas });
        surface.show(items(3465));

        const afterShow = reads;

        for (let i = 0; i < 200; i++) {
            surface.scrollBy(20);
            surface.indexAtScreen({ screenX: RECT.left + 5, screenY: RECT.top + 5 });
        }

        // Two hundred scrolls and hit tests added no layout reads at all.
        expect(reads).toBe(afterShow);
    });
});
