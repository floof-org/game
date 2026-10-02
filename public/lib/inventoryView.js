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

// A wheel notch is roughly this many CSS pixels, used when the browser reports line units.
const WHEEL_LINE_HEIGHT = 16;

/**
 * Owns the single canvas inside the menu and does its own scrolling.
 *
 * Scrolling is handled here rather than by the menu's own overflow for three reasons:
 * the menu hides its scrollbar, so native scrolling bought nothing; a 3000 row grid
 * made the browser lay out a fifty thousand pixel scroll box next to a canvas that is
 * repainted every frame; and position: sticky or a counter transform both have to be
 * reconciled with the menu padding, which is not something that can be reasoned about
 * reliably without a browser. Owning the offset makes the whole thing deterministic.
 */
export function createInventorySurface({ host, createCanvas, measure, requestFrame, rendererOptions = {} }) {
    const renderer = createInventoryRenderer(rendererOptions);

    // A trackpad can fire a dozen wheel events in one frame. Repainting each one asks the
    // icon cache for a whole screenful of petals per event, and every cache miss builds a
    // fresh OffscreenCanvas, so the repaints are coalesced into one per frame. The offset
    // still updates immediately so hit testing stays in step with the wheel.
    const scheduleFrame = requestFrame ?? (fn => fn());

    let canvas = null;
    let ctx = null;
    let columns = 1;
    let items = [];
    let scrollTop = 0;
    let viewportWidth = 0;
    let viewportHeight = 0;
    let repaintQueued = false;

    // Cached so the game loop never reads layout. Reading a rect after the loop has
    // dirtied layout forces a synchronous reflow of the whole document, and doing that
    // every frame was enough to stutter the menu. The canvas only moves when the menu
    // opens, closes or the window resizes.
    let rect = null;

    function mount() {
        canvas = createCanvas();
        // Absolute inside the already fixed menu, so it fills it without the padding
        // getting in the way of the scroll maths.
        canvas.style.position = "absolute";
        canvas.style.left = "0";
        canvas.style.top = "0";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        ctx = canvas.getContext("2d");
    }

    /** Re-read the canvas position. Call when the menu may have moved. */
    function refreshRect() {
        rect = canvas ? canvas.getBoundingClientRect() : null;
        return rect;
    }

    function maxScrollTop() {
        if (!canvas) return 0;
        return Math.max(0, renderer.contentHeight(items.length, columns) - viewportHeight);
    }

    const canScroll = () => maxScrollTop() > 0;

    function resize() {
        if (!canvas) return false;

        const measured = measure();

        if (!(measured.contentWidth > 0) || !(measured.contentHeight > 0)) return false;

        viewportWidth = measured.contentWidth;
        viewportHeight = measured.contentHeight;

        // Not scaled by devicePixelRatio, matching how the per-icon canvases used to be
        // sized, so the menu keeps the exact appearance it had.
        canvas.width = viewportWidth;
        canvas.height = viewportHeight;

        columns = computeColumns(viewportWidth, INVENTORY_ITEM_SIZE, INVENTORY_GAP);
        scrollTop = Math.min(scrollTop, maxScrollTop());

        return true;
    }

    function paint() {
        if (!ctx) return;

        renderer.draw(ctx, {
            items,
            columns,
            scrollTop,
            viewportWidth,
            viewportHeight,
        });
    }

    /** Repaint at most once per frame, however many events arrived. */
    function queueRepaint() {
        if (repaintQueued) return;

        repaintQueued = true;
        scheduleFrame(() => {
            repaintQueued = false;
            paint();
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
            rect = null;
            scrollTop = 0;
            return false;
        }

        if (!canvas) mount();

        // Also reattaches after a remount, so a menu that something else emptied still
        // ends up holding the canvas.
        host.replaceChildren(canvas);

        if (!resize()) return false;

        paint();
        // Resizing the canvas moves it, so the cached position is stale straight away.
        refreshRect();
        return true;
    }

    /** Move the offset, clamped to the grid, and repaint if it actually moved. */
    function scrollBy(delta) {
        if (!canvas || !delta) return false;

        const next = Math.max(0, Math.min(scrollTop + delta, maxScrollTop()));

        if (next === scrollTop) return false;

        scrollTop = next;
        queueRepaint();
        return true;
    }

    function scrollTo(next) {
        return scrollBy(next - scrollTop);
    }

    /**
     * Apply a wheel event. Returns true when the menu consumed it, which is the caller's
     * cue to preventDefault so the page behind does not scroll as well.
     */
    function handleWheel({ deltaY, deltaMode = 0 }) {
        if (!canScroll()) return false;

        const scale = deltaMode === 1 ? WHEEL_LINE_HEIGHT : deltaMode === 2 ? viewportHeight : 1;

        return scrollBy(deltaY * scale);
    }

    /**
     * Whether a viewport point is inside the canvas at all.
     *
     * Checked before any hit testing so the game loop can skip the work entirely when the
     * cursor is somewhere else, which is the common case.
     */
    function containsScreenPoint(screenX, screenY) {
        if (!rect || !(rect.width > 0) || !(rect.height > 0)) return false;

        return screenX >= rect.left
            && screenX <= rect.left + rect.width
            && screenY >= rect.top
            && screenY <= rect.top + rect.height;
    }

    /** Index under a viewport point, or -1. Uses the cached rect; never reads layout. */
    function indexAtScreen({ screenX, screenY }) {
        if (!canvas || !containsScreenPoint(screenX, screenY)) return -1;

        return renderer.indexAt({
            x: screenX - rect.left,
            y: screenY - rect.top,
            scrollTop,
            totalItems: items.length,
            columns,
        });
    }

    /** Tooltip anchor for an index, in viewport coordinates relative to the canvas. */
    function anchorFor(index) {
        return renderer.anchorFor(index, { columns, scrollTop });
    }

    return {
        show,
        paint,
        queueRepaint,
        resize,
        refreshRect,
        handleWheel,
        scrollBy,
        scrollTo,
        canScroll,
        maxScrollTop,
        indexAtScreen,
        anchorFor,
        itemAt: index => items[index],
        get rect() { return rect; },
        get scrollTop() { return scrollTop; },
        get canvas() { return canvas; },
        get columns() { return columns; },
        get items() { return items; },
        get mounted() { return canvas !== null; },
    };
}
