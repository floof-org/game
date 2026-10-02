import {
    INVENTORY_GAP,
    INVENTORY_ITEM_SIZE,
    computeColumns,
    computeContentHeight,
    computeVisibleRange,
    hitTest,
    itemPosition,
} from "./inventoryLayout.js";

/**
 * Canvas backed inventory renderer.
 *
 * The previous menu built one <canvas> per inventory entry, which meant tens of
 * thousands of DOM nodes once an addall filled the tiers. This paints the visible
 * rows into a single canvas instead, and resolves hover and drop targets by
 * arithmetic through hitTest, so no per-entry element and no per-entry
 * getBoundingClientRect is ever needed.
 *
 * The renderer only touches the 2D context it is handed, so it can be exercised
 * with a recording stub in tests.
 */
export function createInventoryRenderer({
    getPetalIcon,
    formatAmount,
    white = "#ffffff",
    black = "#000000",
    font = "Ubuntu",
    itemSize = INVENTORY_ITEM_SIZE,
    gap = INVENTORY_GAP,
} = {}) {
    const rowHeight = itemSize + gap;
    const countFont = `bold ${itemSize * 0.25}px ${font}`;

    /**
     * Paint the rows that intersect the viewport.
     *
     * `scrollTop` shifts the content under the fixed canvas, so it is subtracted
     * from every row rather than read back from the DOM.
     */
    function draw(ctx, { items, columns, scrollTop = 0, viewportWidth, viewportHeight }) {
        if (!ctx || !items) return;

        const totalItems = items.length;

        ctx.clearRect(0, 0, viewportWidth, viewportHeight);

        if (totalItems === 0 || !(columns > 0)) return;

        const { startIndex, endIndex } = computeVisibleRange({
            scrollTop,
            viewportHeight,
            totalItems,
            columns,
            itemSize,
            gap,
        });

        // Text state is set once instead of per icon, because reassigning
        // ctx.font re-resolves it and that is what made counted icons expensive.
        ctx.fillStyle = white;
        ctx.strokeStyle = black;
        ctx.lineWidth = 2;
        ctx.font = countFont;
        ctx.textAlign = "right";
        ctx.textBaseline = "top";

        for (let i = startIndex; i < endIndex; i++) {
            const item = items[i];
            const { x, y } = itemPosition(i, columns, itemSize, gap);
            const top = y - scrollTop;

            ctx.drawImage(getPetalIcon(Number(item.index), item.rarity, "oneshot"), x, top, itemSize, itemSize);

            if (item.count > 1) {
                const text = `x${formatAmount(item.count)}`;
                ctx.strokeText(text, x + itemSize - 4, top + 4);
                ctx.fillText(text, x + itemSize - 4, top + 4);
            }
        }
    }

    /**
     * Index under a point given in canvas viewport coordinates, or -1.
     *
     * `scrollTop` is added back so the caller does not have to reason about the
     * difference between screen space and content space.
     */
    function indexAt({ x, y, scrollTop = 0, totalItems, columns }) {
        return hitTest({ x, y: y + scrollTop, totalItems, columns, itemSize, gap });
    }

    /** Centre of an index in canvas viewport coordinates, which anchors the tooltip. */
    function anchorFor(index, { columns, scrollTop = 0 }) {
        const { x, y } = itemPosition(index, columns, itemSize, gap);

        return { x: x + itemSize / 2, y: y - scrollTop + itemSize / 2 - 22 };
    }

    return {
        draw,
        indexAt,
        anchorFor,
        contentHeight: (totalItems, columns) => computeContentHeight(totalItems, columns, itemSize, gap),
    };
}

export const EMPTY_INVENTORY_TEXT = "Your inventory is empty :(";

/**
 * Owns the single canvas and its scroll spacer inside the menu.
 *
 * The canvas is sticky so it stays pinned in the scrollport, and the spacer below it
 * carries the remaining height, which is what gives a 3000 row menu a scroll range while
 * only one element is ever in the DOM. Sizing and hit testing live here rather than in
 * the game loop so they can be covered by tests.
 */
export function createInventorySurface({ host, createCanvas, createElement, measure, rendererOptions = {} }) {
    const renderer = createInventoryRenderer(rendererOptions);

    const makeElement = createElement ?? (tag => host.ownerDocument.createElement(tag));

    let canvas = null;
    let ctx = null;
    let spacer = null;
    let columns = 1;
    let items = [];
    let repaintQueued = false;

    function mount() {
        canvas = createCanvas();
        // Not scaled by devicePixelRatio, matching how the per-icon canvases used to be
        // sized, so the menu keeps the exact appearance it had.
        canvas.style.position = "sticky";
        canvas.style.top = "0";
        canvas.style.display = "block";

        spacer = makeElement("div");
        ctx = canvas.getContext("2d");
    }

    function resize() {
        if (!canvas) return false;

        const { contentWidth, contentHeight } = measure();

        if (!(contentWidth > 0) || !(contentHeight > 0)) return false;

        canvas.width = contentWidth;
        canvas.height = contentHeight;
        canvas.style.width = contentWidth + "px";
        canvas.style.height = contentHeight + "px";

        columns = computeColumns(contentWidth, INVENTORY_ITEM_SIZE, INVENTORY_GAP);

        // Canvas plus spacer must add up to the full grid height, otherwise the sticky
        // canvas eats into the scrollable range.
        const grid = renderer.contentHeight(items.length, columns);
        spacer.style.height = Math.max(0, grid - contentHeight) + "px";

        return true;
    }

    function paint() {
        if (!ctx) return;

        renderer.draw(ctx, {
            items,
            columns,
            scrollTop: host.scrollTop,
            viewportWidth: canvas.width,
            viewportHeight: canvas.height,
        });
    }

    /**
     * Show a new item list, rebuilding the surface only when it is not already mounted.
     * Returns false when there is nothing to show.
     */
    function show(nextItems) {
        items = Array.isArray(nextItems) ? nextItems : [];

        if (items.length === 0) {
            host.textContent = EMPTY_INVENTORY_TEXT;
            canvas = null;
            ctx = null;
            spacer = null;
            return false;
        }

        if (!canvas) mount();

        // Also reattaches after a remount, so a menu that something else emptied still
        // ends up holding the canvas and its spacer.
        host.replaceChildren(canvas, spacer);

        if (!resize()) return false;

        paint();
        return true;
    }

    /** Coalesce bursts of scroll and resize events into one repaint per frame. */
    function queueRepaint(requestFrame) {
        if (repaintQueued) return;

        repaintQueued = true;
        requestFrame(() => {
            repaintQueued = false;
            paint();
        });
    }

    /**
     * Index under a viewport point, or -1.
     *
     * Takes the canvas rect rather than reading it so the caller controls how often the
     * layout is read, and so tests can pass one in.
     */
    function indexAtScreen({ rect, screenX, screenY }) {
        if (!canvas || !rect || !(rect.width > 0) || !(rect.height > 0)) return -1;

        return renderer.indexAt({
            x: screenX - rect.left,
            y: screenY - rect.top,
            scrollTop: host.scrollTop,
            totalItems: items.length,
            columns,
        });
    }

    /** Tooltip anchor for an index, in viewport coordinates relative to the canvas. */
    function anchorFor(index) {
        return renderer.anchorFor(index, { columns, scrollTop: host.scrollTop });
    }

    return {
        show,
        paint,
        resize,
        queueRepaint,
        indexAtScreen,
        anchorFor,
        itemAt: index => items[index],
        get canvas() { return canvas; },
        get columns() { return columns; },
        get items() { return items; },
        get mounted() { return canvas !== null; },
    };
}
