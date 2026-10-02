import {
    INVENTORY_GAP,
    INVENTORY_ITEM_SIZE,
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
