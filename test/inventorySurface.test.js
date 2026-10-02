import { describe, expect, test } from "bun:test";
import { EMPTY_INVENTORY_TEXT, createInventorySurface } from "../public/lib/inventoryView.js";
import { INVENTORY_ITEM_SIZE } from "../public/lib/inventoryLayout.js";

const PITCH = INVENTORY_ITEM_SIZE + 5;
const ROW = PITCH;

/** The real menu is 300x350 with 10px padding, so the content area is 280x330 and fits 4 columns. */
const MENU = { clientWidth: 300, clientHeight: 350, padding: 10 };
const CONTENT_WIDTH = MENU.clientWidth - MENU.padding * 2;
const CONTENT_HEIGHT = MENU.clientHeight - MENU.padding * 2;

function stubElement(tag = "div") {
    const el = {
        tagName: tag,
        style: {},
        children: [],
        textContent: "",
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
        replaceChildren(...kids) {
            el.children = kids;
            el.textContent = "";
        },
    };
    return el;
}

function makeHost() {
    const host = stubElement("div");
    host.ownerDocument = { createElement: tag => stubElement(tag) };
    host.scrollTop = 0;
    return host;
}

function makeSurface(host = makeHost(), overrides = {}) {
    return createInventorySurface({
        host,
        createCanvas: () => stubElement("canvas"),
        createElement: tag => stubElement(tag),
        measure: () => ({ contentWidth: CONTENT_WIDTH, contentHeight: CONTENT_HEIGHT }),
        rendererOptions: {
            getPetalIcon: (index, rarity) => ({ name: `${index}_${rarity}` }),
            formatAmount: n => String(n),
        },
        ...overrides,
    });
}

const items = n => Array.from({ length: n }, (_, i) => ({ index: i % 100, rarity: (i / 100) | 0, count: 1 }));
const drawn = surface => (surface.canvas?._calls ?? []).filter(c => c[0] === "drawImage");

describe("mounting", () => {
    test("puts exactly two elements in the host: the canvas and a spacer", () => {
        const host = makeHost();
        const surface = makeSurface(host);

        expect(surface.show(items(100))).toBe(true);
        expect(host.children).toHaveLength(2);
        expect(host.children[0].tagName).toBe("canvas");
        expect(host.children[1].tagName).toBe("div");
    });

    test("makes the canvas sticky so it stays pinned while the spacer scrolls", () => {
        const host = makeHost();
        makeSurface(host).show(items(100));

        expect(host.children[0].style).toMatchObject({ position: "sticky", top: "0", display: "block" });
    });

    test("reuses the same canvas when shown again instead of remounting", () => {
        const host = makeHost();
        const surface = makeSurface(host);

        surface.show(items(100));
        const first = surface.canvas;

        surface.show(items(120));

        expect(surface.canvas).toBe(first);
        expect(host.children[0]).toBe(first);
    });

    test("sizes the canvas to the content area, not the padded box", () => {
        const host = makeHost();
        const surface = makeSurface(host);
        surface.show(items(100));

        expect(surface.canvas.width).toBe(CONTENT_WIDTH);
        expect(surface.canvas.height).toBe(CONTENT_HEIGHT);
        expect(surface.canvas.style.width).toBe(CONTENT_WIDTH + "px");
    });

    test("derives the column count from the content width", () => {
        const host = makeHost();
        const surface = makeSurface(host);
        surface.show(items(100));

        // 280px fits four 56px icons and three 5px gaps, but not five.
        expect(surface.columns).toBe(4);
    });
});

describe("scroll range", () => {
    test("reserves the grid height beyond the viewport in the spacer", () => {
        const host = makeHost();
        const surface = makeSurface(host);
        surface.show(items(3450));

        const rows = Math.ceil(3450 / 4);
        const expected = Math.max(0, rows * ROW - CONTENT_HEIGHT);

        expect(host.children[1].style.height).toBe(expected + "px");
    });

    test("gives the spacer no height when everything fits on screen", () => {
        const host = makeHost();
        const surface = makeSurface(host);
        surface.show(items(4));

        expect(host.children[1].style.height).toBe("0px");
    });

    test("grows the scroll range as the inventory fills up", () => {
        const host = makeHost();
        const surface = makeSurface(host);

        surface.show(items(8));
        const small = parseFloat(host.children[1].style.height);

        surface.show(items(3450));
        const large = parseFloat(host.children[1].style.height);

        expect(large).toBeGreaterThan(small);
    });
});

describe("painting", () => {
    test("paints the first rows on show", () => {
        const surface = makeSurface();
        surface.show(items(3450));

        // 330px of a 61px row is 5.4 rows, plus one partial row.
        expect(drawn(surface).length).toBeLessThanOrEqual(7 * 4);
        expect(drawn(surface).length).toBeGreaterThan(16);
    });

    test("paints nothing beyond the visible rows even at 3450 entries", () => {
        const surface = makeSurface();
        surface.show(items(3450));

        expect(drawn(surface).length).toBeLessThan(40);
    });

    test("repaints the rows for the new scroll position", () => {
        const host = makeHost();
        const surface = makeSurface(host);

        surface.show(items(1000));
        surface.canvas._calls.length = 0;

        host.scrollTop = 100 * ROW;
        surface.paint();

        // Content row 100 is pinned to the top edge once scrolled.
        expect(drawn(surface)[0][3]).toBe(0);
        expect(drawn(surface)[0][2]).toBe(0);
    });

    test("clears the viewport so no stale icon is left behind", () => {
        const surface = makeSurface();
        surface.show(items(100));

        expect(surface.canvas._calls[0]).toEqual(["clearRect", 0, 0, CONTENT_WIDTH, CONTENT_HEIGHT]);
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
        expect(host.children).toHaveLength(2);
    });

    test("never reports a hover target while empty", () => {
        const surface = makeSurface();
        surface.show([]);

        expect(surface.indexAtScreen({ rect: { left: 0, top: 0, width: 280, height: 330 }, screenX: 10, screenY: 10 })).toBe(-1);
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
    const rect = { left: 60, top: 5, width: CONTENT_WIDTH, height: CONTENT_HEIGHT };

    test("resolves the entry under a viewport point", () => {
        const surface = makeSurface();
        surface.show(items(100));

        expect(surface.indexAtScreen({ rect, screenX: 60 + 5, screenY: 5 + 5 })).toBe(0);
        expect(surface.indexAtScreen({ rect, screenX: 60 + PITCH + 5, screenY: 5 + 5 })).toBe(1);
        expect(surface.indexAtScreen({ rect, screenX: 60 + 5, screenY: 5 + ROW + 5 })).toBe(4);
    });

    test("subtracts the canvas origin so the menu position does not matter", () => {
        const surface = makeSurface();
        surface.show(items(100));

        const elsewhere = { left: 400, top: 300, width: CONTENT_WIDTH, height: CONTENT_HEIGHT };

        expect(surface.indexAtScreen({ rect: elsewhere, screenX: 400 + 5, screenY: 300 + 5 })).toBe(0);
    });

    test("accounts for the current scroll position", () => {
        const host = makeHost();
        const surface = makeSurface(host);
        surface.show(items(1000));

        host.scrollTop = 20 * ROW;

        expect(surface.indexAtScreen({ rect, screenX: 60 + 5, screenY: 5 + 5 })).toBe(20 * 4);
    });

    test("returns -1 in a gap between icons", () => {
        const surface = makeSurface();
        surface.show(items(100));

        expect(surface.indexAtScreen({ rect, screenX: 60 + INVENTORY_ITEM_SIZE + 1, screenY: 5 + 5 })).toBe(-1);
    });

    test("returns -1 when the cursor is outside the canvas", () => {
        const surface = makeSurface();
        surface.show(items(100));

        expect(surface.indexAtScreen({ rect, screenX: 5, screenY: 5 })).toBe(-1);
        expect(surface.indexAtScreen({ rect, screenX: 60 + CONTENT_WIDTH + 40, screenY: 5 + 5 })).toBe(-1);
    });

    test("returns -1 for a zero sized or missing rect", () => {
        const surface = makeSurface();
        surface.show(items(100));

        expect(surface.indexAtScreen({ rect: { left: 0, top: 0, width: 0, height: 0 }, screenX: 5, screenY: 5 })).toBe(-1);
        expect(surface.indexAtScreen({ rect: null, screenX: 5, screenY: 5 })).toBe(-1);
    });

    test("returns -1 before anything is mounted", () => {
        const surface = makeSurface();

        expect(surface.indexAtScreen({ rect, screenX: 65, screenY: 10 })).toBe(-1);
    });

    test("finds the same entry that was painted at that position", () => {
        const surface = makeSurface();
        surface.show(items(3450));

        for (const call of drawn(surface)) {
            const index = surface.indexAtScreen({
                rect,
                screenX: rect.left + call[2] + 2,
                screenY: rect.top + call[3] + 2,
            });

            expect(index).toBeGreaterThanOrEqual(0);
            expect(index).toBeLessThan(3450);
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
});

describe("queueRepaint", () => {
    test("coalesces a burst of scroll events into a single repaint", () => {
        const surface = makeSurface();
        surface.show(items(3450));

        let frames = 0;
        const requestFrame = fn => frames++;

        for (let i = 0; i < 50; i++) surface.queueRepaint(requestFrame);

        expect(frames).toBe(1);
    });

    test("paints once per frame when the queued callback runs", () => {
        const surface = makeSurface();
        surface.show(items(3450));
        surface.canvas._calls.length = 0;

        let run = null;
        for (let i = 0; i < 20; i++) surface.queueRepaint(fn => (run = fn));

        run();

        expect(surface.canvas._calls[0][0]).toBe("clearRect");
        expect(drawn(surface).length).toBeGreaterThan(0);
    });

    test("accepts a new burst after the previous frame ran", () => {
        const surface = makeSurface();
        surface.show(items(100));

        let frames = 0;
        const requestFrame = fn => {
            frames++;
            fn();
        };

        surface.queueRepaint(requestFrame);
        surface.queueRepaint(requestFrame);

        expect(frames).toBe(2);
    });
});

describe("a full addall cycle", () => {
    test("mounts, scrolls, repaints and resolves targets with two DOM nodes", () => {
        const host = makeHost();
        const surface = makeSurface(host);
        const rect = { left: 60, top: 5, width: CONTENT_WIDTH, height: CONTENT_HEIGHT };

        // A real /addall produces tens of thousands of entries.
        const big = items(3465);
        expect(surface.show(big)).toBe(true);
        expect(host.children).toHaveLength(2);

        for (const scrollTop of [0, 500, 5000, 20000, 50000]) {
            host.scrollTop = scrollTop;
            surface.canvas._calls.length = 0;
            surface.paint();

            const painted = drawn(surface);
            expect(painted.length).toBeGreaterThan(0);
            expect(painted.length).toBeLessThanOrEqual(7 * surface.columns);

            for (const call of painted) {
                const index = surface.indexAtScreen({
                    rect,
                    screenX: rect.left + call[2] + 2,
                    screenY: rect.top + call[3] + 2,
                });

                expect(index).toBeGreaterThanOrEqual(0);
                expect(index).toBeLessThan(big.length);
            }
        }
    });
});
