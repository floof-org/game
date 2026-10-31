import { beforeEach, describe, expect, test } from "bun:test";

import state from "../public/server/lib/state.js";
import { ENTITY_TYPES } from "../public/lib/protocol.js";
import SpatialHashGrid from "../public/server/lib/SpatialHashGrid.js";

const GRID = 40;
const WORLD = 400;
const MAX_RARITY = 10;

// The fake map is a 40x40 room where the zone rarity climbs from 0 on the west
// edge to 10 on the east edge, exactly like a scored maze map.
function buildMap(types) {
    const cells = [];

    for (let y = 0; y < GRID; y++) {
        for (let x = 0; x < GRID; x++) {
            cells.push({ x, y, type: types(x, y), score: x / (GRID - 1) });
        }
    }

    const lookup = new Map();

    for (const cell of cells) {
        lookup.set(cell.y * GRID + cell.x, cell);
    }

    state.mapData = { cells, maxRarity: MAX_RARITY, mobSpawners: [] };
    state.mapCellLookup = lookup;
    state.terrainGridWidth = GRID;
    state.terrainGridHeight = GRID;
    state.width = WORLD;
    state.height = WORLD;

    const spawns = [];

    for (let x = 0; x < GRID; x++) {
        for (let y = 0; y < GRID; y++) {
            spawns.push({
                x: ((x + .5) / GRID) - .5,
                y: ((y + .5) / GRID) - .5,
                rarity: Math.round((x / (GRID - 1)) * MAX_RARITY)
            });
        }
    }

    state.mapSpawns = {
        [ENTITY_TYPES.MOB]: spawns,
        [ENTITY_TYPES.PLAYER]: []
    };
}

function setPlayerBody(x, y) {
    state.clients = new Map([[
        1,
        { body: { x, y, size: 17 }, highestRarity: 5, camera: { fov: 300 } }
    ]]);
}

const fakeConfig = {
    name: "Rock",
    tiers: Array.from({ length: 30 }, () => ({ size: 10 }))
};

beforeEach(() => {
    state.clients = new Map();
    state.mapData = [];
    state.mapCellLookup = null;
    state.mapSpawns = null;
    state.spatialHash = new SpatialHashGrid();
    SpatialHashGrid.configure(WORLD, WORLD);
    state.spatialHash.clear();
});

describe("zone rarity lookup", () => {
    test("reads the cell score through the map scale", () => {
        buildMap(() => 3);

        expect(state.mapRarityAt(-200, 0)).toBe(0);
        expect(state.mapRarityAt(0, 0)).toBe(5);
        expect(state.mapRarityAt(195, 0)).toBe(MAX_RARITY);
    });

    test("returns null when the map has no zones", () => {
        expect(state.mapRarityAt(0, 0)).toBeNull();
    });

    test("accepts only rarities one tier away from the zone", () => {
        buildMap(() => 3);

        const centre = { x: 0, y: 0 };

        expect(state.isSpawnRarityAllowed(centre, 4)).toBe(true);
        expect(state.isSpawnRarityAllowed(centre, 5)).toBe(true);
        expect(state.isSpawnRarityAllowed(centre, 6)).toBe(true);
        expect(state.isSpawnRarityAllowed(centre, 7)).toBe(false);
        expect(state.isSpawnRarityAllowed(centre, 2)).toBe(false);
    });

    test("clamps a rarity into the zone band", () => {
        buildMap(() => 3);

        const centre = { x: 0, y: 0 };

        expect(state.clampRarityToZone(centre, 29)).toBe(6);
        expect(state.clampRarityToZone(centre, 0)).toBe(4);
        expect(state.clampRarityToZone(centre, 5)).toBe(5);
    });
});

describe("spawnNearPlayer", () => {
    test("never rolls a mob more than one tier from the zone it lands in", () => {
        buildMap(() => 3);
        setPlayerBody(0, 0);

        for (let i = 0; i < 2000; i++) {
            const info = state.spawnNearPlayer(fakeConfig);
            const zoneRarity = state.mapRarityAt(info.position.x, info.position.y);

            expect(zoneRarity).not.toBeNull();
            expect(Math.abs(zoneRarity - info.rarity)).toBeLessThanOrEqual(1);
        }
    });

    test("keeps the invariant when the player camps a low zone", () => {
        buildMap(() => 3);
        setPlayerBody(-190, 0);

        for (let i = 0; i < 2000; i++) {
            const info = state.spawnNearPlayer(fakeConfig);
            const zoneRarity = state.mapRarityAt(info.position.x, info.position.y);

            expect(Math.abs(zoneRarity - info.rarity)).toBeLessThanOrEqual(1);
        }
    });

    test("falls back to a map spawn point that matches its own zone", () => {
        // Every cell is solid, so the placement loop always fails and the fallback
        // has to be used.
        buildMap(() => 0);
        setPlayerBody(0, 0);

        // One mob spawn sitting on the western edge, where the zone rarity is 0.
        state.mapSpawns[ENTITY_TYPES.MOB] = [
            { x: ((0 + .5) / GRID) - .5, y: 0, rarity: 0 }
        ];

        const info = state.spawnNearPlayer(fakeConfig);

        expect(info.rarity).toBe(0);
        expect(state.isSpawnRarityAllowed(info.position, info.rarity)).toBe(true);
    });

    test("without players, spawns follow the chosen map point's zone", () => {
        buildMap(() => 3);

        for (let i = 0; i < 500; i++) {
            const info = state.spawnNearPlayer(fakeConfig);
            const zoneRarity = state.mapRarityAt(info.position.x, info.position.y);

            expect(Math.abs(zoneRarity - info.rarity)).toBeLessThanOrEqual(1);
        }
    });
});
