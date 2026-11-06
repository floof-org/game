import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import state from "../public/server/lib/state.js";
import SpatialHashGrid from "../public/server/lib/SpatialHashGrid.js";
import { Mob, Terrain } from "../public/server/lib/Entity.js";
import { ENTITY_TYPES, terrains } from "../public/lib/protocol.js";

const GRID = 10;
const WORLD = 1000;
const CELL = WORLD / GRID;
const MOB_RADIUS = 120;

const original = {
    width: state.width,
    height: state.height,
    mapData: state.mapData,
    mapCellLookup: state.mapCellLookup,
    mapSpawns: state.mapSpawns,
    terrainGridWidth: state.terrainGridWidth,
    terrainGridHeight: state.terrainGridHeight,
    clients: state.clients
};

const fakeConfig = {
    name: "Test Mob",
    size: MOB_RADIUS,
    tiers: Array.from({ length: 30 }, () => ({ size: MOB_RADIUS }))
};

// A boss body is 1.75x the base size, so use a smaller base body here to keep
// it inside the small test room.
const bossConfig = {
    name: "Test Boss",
    size: 60,
    tiers: Array.from({ length: 30 }, () => ({ size: 60 }))
};

const cellCentre = (x, y) => ({
    x: (x + .5) * CELL - WORLD / 2,
    y: (y + .5) * CELL - WORLD / 2
});

// A plain unit square is enough for the collision checks.
terrains["0"] = [[
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: 1, y: 1 },
    { x: -1, y: 1 }
]];

function buildMap(isWall) {
    const cells = [];
    const lookup = new Map();
    const spawns = [];

    for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
            const type = isWall(x, y) ? 0 : 3;
            const cell = { x, y, type, score: 0 };

            cells.push(cell);
            lookup.set(y * GRID + x, cell);

            if (type !== 0) {
                spawns.push({
                    x: ((x + .5) / GRID) - .5,
                    y: ((y + .5) / GRID) - .5,
                    rarity: 0
                });
            }
        }
    }

    state.mapData = { cells, maxRarity: 10, mobSpawners: [] };
    state.mapCellLookup = lookup;
    state.terrainGridWidth = GRID;
    state.terrainGridHeight = GRID;
    state.width = WORLD;
    state.height = WORLD;
    state.mapSpawns = {
        [ENTITY_TYPES.MOB]: spawns,
        [ENTITY_TYPES.PLAYER]: []
    };

    SpatialHashGrid.configure(WORLD, WORLD);
    state.spatialHash.clear();
    state.terrain.clear();
    state.terrainSpatialHash.clear();

    for (const cell of cells) {
        if (cell.type !== 0) {
            continue;
        }

        const terrain = new Terrain(cellCentre(cell.x, cell.y), CELL / 2, 0);
        terrain.gridX = cell.x;
        terrain.gridY = cell.y;
    }

    state.updateTerrain();
}

function setPlayerBody(x, y) {
    state.clients = new Map([[
        1,
        { body: { x, y, size: 17 }, highestRarity: 0, camera: { fov: 1200 } }
    ]]);
}

beforeEach(() => {
    state.clients = new Map();
    state.mapData = [];
    state.mapCellLookup = null;
    state.mapSpawns = null;
    state.terrain.clear();
    state.terrainSpatialHash.clear();
    SpatialHashGrid.configure(WORLD, WORLD);
    state.spatialHash.clear();
});

afterEach(() => {
    Object.assign(state, original);
    state.terrain.clear();
    state.terrainSpatialHash.clear();
    state.spatialHash.clear();
});

describe("spawn clearance", () => {
    test("spawnNearPlayer never creates a body that overlaps a wall", () => {
        // A solid column down the middle. A body wider than a cell cannot sit in
        // either neighbouring column without touching it.
        buildMap(x => x === 5);
        setPlayerBody(-300, 0);

        for (let i = 0; i < 500; i++) {
            const info = state.spawnNearPlayer(fakeConfig);

            expect(state.isClearOfTerrain(info.position.x, info.position.y, MOB_RADIUS)).toBe(true);
        }
    });

    test("spawnBossInZone picks a cell with room for the whole boss", () => {
        buildMap(x => x === 5);

        const bossSize = 60 * 1.75;

        for (let i = 0; i < 100; i++) {
            const position = state.spawnBossInZone(bossConfig, 0);

            expect(position).not.toBeNull();
            expect(state.isClearOfTerrain(position.x, position.y, bossSize)).toBe(true);
        }
    });

    test("spawnBossNearPlayer keeps the boss out of walls", () => {
        buildMap(x => x === 5);
        setPlayerBody(-300, 0);

        const bossSize = 60 * 1.75;

        for (let i = 0; i < 100; i++) {
            const position = state.spawnBossNearPlayer(bossConfig, 0);

            expect(state.isClearOfTerrain(position.x, position.y, bossSize)).toBe(true);
        }
    });
});

describe("terrain rescue", () => {
    test("a body created inside a wall moves to a clear position", () => {
        // Ring of walls around an open cell. The mob is too large for the cell,
        // so none of the nearby positions are valid and the resolver cannot
        // push it out on its own.
        buildMap((x, y) => x >= 4 && x <= 6 && y >= 4 && y <= 6 && !(x === 5 && y === 5));

        const mob = new Mob(cellCentre(5, 5));
        mob.define(fakeConfig, 0);
        mob._AABB = state.spatialHash.getAABB(mob);

        expect(state.isClearOfTerrain(mob.x, mob.y, mob.size)).toBe(false);

        mob.collideTerrain();

        expect(state.isClearOfTerrain(mob.x, mob.y, mob.size)).toBe(true);
    });

    test("findClearPosition returns the nearest wall-free spot", () => {
        buildMap((x, y) => x >= 4 && x <= 6 && y >= 4 && y <= 6 && !(x === 5 && y === 5));

        const start = cellCentre(5, 5);
        const clear = state.findClearPosition(start.x, start.y, MOB_RADIUS);

        expect(clear).not.toBeNull();
        expect(state.isClearOfTerrain(clear.x, clear.y, MOB_RADIUS)).toBe(true);
    });
});
