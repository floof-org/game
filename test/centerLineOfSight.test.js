import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import state from "../public/server/lib/state.js";
import SpatialHashGrid from "../public/server/lib/SpatialHashGrid.js";
import { Terrain } from "../public/server/lib/Entity.js";
import { terrains } from "../public/lib/protocol.js";

const GRID = 40;
const WORLD = 400;
const CELL = WORLD / GRID;
const WALL_CELL = 20;
const WALL_CENTER = -WORLD / 2 + (WALL_CELL + .5) * CELL;

const original = {
    width: state.width,
    height: state.height,
    mapSolid: state.mapSolid,
    mapData: state.mapData,
    mapCellLookup: state.mapCellLookup,
    terrainGridWidth: state.terrainGridWidth,
    terrainGridHeight: state.terrainGridHeight
};

const originalTerrain = terrains[0];

function resetWorld() {
    state.width = WORLD;
    state.height = WORLD;
    state.terrainGridWidth = GRID;
    state.terrainGridHeight = GRID;
    state.mapData = { cells: new Array(GRID * GRID).fill(0) };
    state.mapCellLookup = null;

    const solid = new Uint8Array(GRID * GRID);

    for (let y = 0; y < GRID; y++) {
        solid[y * GRID + WALL_CELL] = 1;
    }

    state.mapSolid = solid;

    SpatialHashGrid.configure(WORLD, WORLD);
    state.terrain.clear();
    state.entities.clear();

    // Only the left half of the solid cell is real wall geometry. A mob
    // center can therefore sit inside the coarse solid cell while being
    // physically clear of the wall, just like the 1x1 center box allows.
    terrains[0] = [[
        { x: -1, y: -1 },
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 1 }
    ]];

    new Terrain({ x: WALL_CENTER, y: 0 }, CELL / 2, 0);
    state.updateTerrain();
}

beforeEach(() => {
    resetWorld();
});

afterEach(() => {
    Object.assign(state, original);
    state.terrain.clear();

    if (originalTerrain === undefined) {
        delete terrains[0];
    } else {
        terrains[0] = originalTerrain;
    }
});

describe("center line of sight", () => {
    test("uses the wall polygon instead of the coarse solid cell", () => {
        // The target center is inside the solid grid cell but to the right
        // of the actual wall polygon, so it is visible from the right and
        // blocked from the left.
        expect(state.hasLineOfSight(50, 0, 7, 0)).toBe(true);
        expect(state.hasLineOfSight(-50, 0, 7, 0)).toBe(false);
    });

    test("a center touching a wall is visible from its own side", () => {
        expect(state.hasLineOfSight(-50, 0, -3, 0)).toBe(true);
        expect(state.hasLineOfSight(50, 0, -3, 0)).toBe(false);
    });

    test("clear rows stay visible", () => {
        expect(state.hasLineOfSight(-150, 100, 150, 100)).toBe(true);
    });
});
