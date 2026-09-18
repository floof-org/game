const shiftA = 6;
// Cell coords are packed into a single numeric key with an offset so that negative
// coordinates cannot collide (the old `x | (y << 6)` mapping merged distinct cells,
// which made lookups degrade badly on large maps). Supports cell coords in
// [-2048, +2047] => world range of +/-131072 units at the current 64px cell size.
const CELL_OFFSET = 1 << 11;
const CELL_STRIDE = 1 << 12;

function cellKey(x, y) {
    return (x + CELL_OFFSET) * CELL_STRIDE + (y + CELL_OFFSET);
}

export default class SpatialHashGrid {
    static OFFSET = 0;
    static SHIFT = 0;
    static _w = -1;
    static _h = -1;

    // Call once per frame, before entities update, with the current world size.
    static configure(worldW, worldH) {
        if (worldW === this._w && worldH === this._h) return; // unchanged -> nothing to do
        this._w = worldW;
        this._h = worldH;
        const cell = 1 << shiftA;
        // Max |cell index| across either axis (world is centered at 0), +1 margin.
        this.OFFSET = Math.max(Math.ceil(worldW / 2 / cell), Math.ceil(worldH / 2 / cell)) + 1;
        // Bits needed to hold (coord + OFFSET) -> makes the pack a pure shift + or.
        this.SHIFT = Math.ceil(Math.log2(2 * this.OFFSET + 1));
    }

    constructor() {
        this.grid = new Map();
    }

    clear() {
        this.grid.clear();
    }

    insert(object) {
        const startX = object._AABB.x1 >> shiftA;
        const startY = object._AABB.y1 >> shiftA;
        const endX = object._AABB.x2 >> shiftA;
        const endY = object._AABB.y2 >> shiftA;

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                const key = cellKey(x, y);

                if (!this.grid.has(key)) {
                    this.grid.set(key, [object]);
                } else {
                    this.grid.get(key).push(object);
                }
            }
        }
    }

    retrieve(object) {
        const result = new Map();
        const startX = object._AABB.x1 >> shiftA;
        const startY = object._AABB.y1 >> shiftA;
        const endX = object._AABB.x2 >> shiftA;
        const endY = object._AABB.y2 >> shiftA;

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                const key = cellKey(x, y);

                if (!this.grid.has(key)) {
                    continue;
                }

                const cell = this.grid.get(key);
                for (let i = 0; i < cell.length; i++) {
                    if (!result.has(cell[i].id) && this.hitDetection(object, cell[i])) {
                        result.set(cell[i].id, cell[i]);
                    }
                }
            }
        }

        return result;
    }

    hitDetection(object, other) {
        return !(object._AABB.x1 > other._AABB.x2 || object._AABB.y1 > other._AABB.y2 || object._AABB.x2 < other._AABB.x1 || object._AABB.y2 < other._AABB.y1);
    }

    getAABB(object) {
        const width = object.width * object.size;
        const height = object.height * object.size;

        return {
            x1: object.x - width,
            y1: object.y - height,
            x2: object.x + width,
            y2: object.y + height
        };
    }
}