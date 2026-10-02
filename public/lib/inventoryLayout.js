/**
 * Pure layout and hit-testing math for the inventory grid.
 *
 * Nothing in this file touches the DOM, so it can be unit tested directly. The
 * whole point of the canvas backed inventory is that the grid position of an
 * item is arithmetic rather than something measured off the DOM: with thousands
 * of entries, calling getBoundingClientRect per icon is what made the original
 * menu unusable.
 */

export const INVENTORY_ITEM_SIZE = 56;
export const INVENTORY_GAP = 5;

export const rowHeightFor = (itemSize = INVENTORY_ITEM_SIZE, gap = INVENTORY_GAP) => itemSize + gap;
export const pitchFor = (itemSize = INVENTORY_ITEM_SIZE, gap = INVENTORY_GAP) => itemSize + gap;

/** Column count follows the container width, matching the original flex-wrap layout. */
export function computeColumns(contentWidth, itemSize = INVENTORY_ITEM_SIZE, gap = INVENTORY_GAP) {
    if (!(contentWidth > 0)) return 1;
    return Math.max(1, Math.floor((contentWidth + gap) / (itemSize + gap)));
}

export function computeTotalRows(totalItems, columns) {
    if (totalItems <= 0) return 0;
    return Math.ceil(totalItems / columns);
}

/**
 * Scrollable content height. The original menu reserved a full row height per
 * row including the last one, so keep that to leave scroll behaviour unchanged.
 */
export function computeContentHeight(totalItems, columns, itemSize = INVENTORY_ITEM_SIZE, gap = INVENTORY_GAP) {
    return computeTotalRows(totalItems, columns) * rowHeightFor(itemSize, gap);
}

/**
 * Flat index of the first and last item that can touch the viewport.
 *
 * The first and last row are allowed to be only partially visible, so the range
 * is derived from scrollTop and viewport height instead of assuming whole rows.
 */
export function computeVisibleRange({ scrollTop, viewportHeight, totalItems, columns, itemSize = INVENTORY_ITEM_SIZE, gap = INVENTORY_GAP }) {
    const rowHeight = rowHeightFor(itemSize, gap);

    if (totalItems <= 0 || columns <= 0) {
        return { startRow: 0, endRow: 0, startIndex: 0, endIndex: 0, rowCount: 0 };
    }

    const safeScroll = Math.max(0, scrollTop || 0);
    const startRow = Math.min(computeTotalRows(totalItems, columns) - 1, Math.floor(safeScroll / rowHeight));
    const visibleRows = Math.max(1, Math.ceil((viewportHeight || 0) / rowHeight) + 1);
    const endRow = Math.min(computeTotalRows(totalItems, columns), startRow + visibleRows);

    const startIndex = startRow * columns;
    const endIndex = Math.min(totalItems, endRow * columns);

    return { startRow, endRow, startIndex, endIndex, rowCount: endIndex - startIndex };
}

/** Position of a flat index inside the scrollable content, in content pixels. */
export function itemPosition(index, columns, itemSize = INVENTORY_ITEM_SIZE, gap = INVENTORY_GAP) {
    const row = Math.floor(index / columns);
    const col = index % columns;
    return { x: col * pitchFor(itemSize, gap), y: row * rowHeightFor(itemSize, gap), row, col };
}

/**
 * Which item sits under a content space point, or -1.
 *
 * `x` and `y` are content relative: y already has scrollTop added back in. Points
 * that land in the gap between two icons report a miss rather than snapping to
 * the nearest icon, which is what the original rect test did.
 */
export function hitTest({ x, y, totalItems, columns, itemSize = INVENTORY_ITEM_SIZE, gap = INVENTORY_GAP }) {
    if (!(x >= 0) || !(y >= 0)) return -1;
    if (totalItems <= 0 || columns <= 0) return -1;

    const pitch = pitchFor(itemSize, gap);
    const rowHeight = rowHeightFor(itemSize, gap);

    const col = Math.floor(x / pitch);
    if (col >= columns) return -1;

    // Reject the gap so a miss between icons does not pick up a neighbour.
    if (x - col * pitch >= itemSize) return -1;

    const row = Math.floor(y / rowHeight);
    if (y - row * rowHeight >= itemSize) return -1;

    const index = row * columns + col;
    return index < totalItems ? index : -1;
}

/**
 * Flatten the nested inventory into the display order the original menu used:
 * tiers newest first, petals alphabetical by config name inside each tier, and
 * zero count entries dropped.
 */
export function buildInventoryItems(inventory, tiers, petalConfigs) {
    const items = [];
    if (!inventory) return items;

    const rarityOf = new Map();
    tiers?.forEach((tier, i) => rarityOf.set(tier.name, i));

    const nameOf = id => petalConfigs?.[Number(id)]?.name ?? "";

    Object.entries(inventory)
        .map(([tierName, petals]) => ({ tierName, petals, rarity: rarityOf.get(tierName) ?? -1 }))
        .sort((a, b) => b.rarity - a.rarity)
        .forEach(({ tierName, petals, rarity }) => {
            Object.entries(petals)
                .filter(([, count]) => count > 0)
                .sort(([a], [b]) => nameOf(a).localeCompare(nameOf(b)))
                .forEach(([petalIndex, count]) => {
                    items.push({ index: Number(petalIndex), rarity, count, tierName });
                });
        });

    return items;
}

/**
 * With thirty-odd rarities times a hundred-odd petals, comparing with
 * JSON.stringify allocates multi-MB strings.
 */
export function isSameInventory(a, b) {
    if (a === b) return true;
    if (!a || !b) return false;

    const aTiers = Object.keys(a);
    if (aTiers.length !== Object.keys(b).length) return false;

    for (const tier of aTiers) {
        const aPetals = a[tier];
        const bPetals = b[tier];

        if (!bPetals) return false;

        const aKeys = Object.keys(aPetals);
        if (aKeys.length !== Object.keys(bPetals).length) return false;

        for (const key of aKeys) {
            if (aPetals[key] !== bPetals[key]) return false;
        }
    }

    return true;
}

/** Sync the snapshot in place so a change does not deep clone the whole inventory. */
export function syncInventory(dst, src) {
    if (!src) return null;

    // The snapshot can get reset to undefined.
    dst ??= {};

    for (const tier in dst) {
        if (!(tier in src)) delete dst[tier];
    }

    for (const tier in src) {
        if (!dst[tier]) dst[tier] = {};

        const target = dst[tier];
        const source = src[tier];

        for (const key in target) {
            if (!(key in source)) delete target[key];
        }

        for (const key in source) target[key] = source[key];
    }

    return dst;
}
