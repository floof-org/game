import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import state from "../public/server/lib/state.js";
import SpatialHashGrid from "../public/server/lib/SpatialHashGrid.js";
import { Mob, Player, Terrain, createBoss } from "../public/server/lib/Entity.js";
import { mobConfigs } from "../public/server/lib/config.js";
import { terrains } from "../public/lib/protocol.js";

const GRID = 40;
const WORLD = 400;
const WALL_SIZE = 20;
const BEETLE = mobConfigs.find(mob => mob.name === "Beetle");

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
    state.mapSolid = null;
    state.mapData = { cells: new Array(GRID * GRID).fill(0) };
    state.mapCellLookup = null;

    SpatialHashGrid.configure(WORLD, WORLD);
    state.spatialHash.clear();
    state.entities.clear();
    state.terrain.clear();

    // A single square wall centered on the origin, with a half-extent of 20.
    terrains[0] = [[{ x: -1, y: -1 }, { x: 1, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 }]];

    new Terrain({ x: 0, y: 0 }, WALL_SIZE, 0);
    state.updateTerrain();
}

function place(entity) {
    entity._AABB = state.spatialHash.getAABB(entity);
    state.spatialHash.insert(entity);
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

describe("mob wall collision", () => {
    test("mob centers can overlap a wall by half the body", () => {
        const mob = new Mob({ x: WALL_SIZE + 1, y: 0 });

        mob.define(BEETLE, 0);
        mob.size = 17;
        place(mob);

        mob.collideTerrain();

        expect(mob.x).toBe(WALL_SIZE + 1);
        expect(mob.y).toBe(0);
    });

    test("a mob center inside the wall is pushed just outside", () => {
        const mob = new Mob({ x: WALL_SIZE - 5, y: 0 });

        mob.define(BEETLE, 0);
        mob.size = 17;
        place(mob);

        mob.collideTerrain();

        expect(mob.x).toBeCloseTo(WALL_SIZE + .51, 5);
    });

    test("the collision box is exactly one pixel wide", () => {
        const overlapping = new Mob({ x: WALL_SIZE + .4, y: 0 });

        overlapping.define(BEETLE, 0);
        overlapping.size = 17;
        place(overlapping);

        overlapping.collideTerrain();

        // 0.4px from the wall is inside the 1x1 center box, so it is pushed
        // to half a pixel plus the separation padding.
        expect(overlapping.x).toBeCloseTo(WALL_SIZE + .51, 5);

        const clear = new Mob({ x: WALL_SIZE + .6, y: 0 });

        clear.define(BEETLE, 0);
        clear.size = 17;
        place(clear);

        clear.collideTerrain();

        // 0.6px leaves the 1x1 center box clear of the wall.
        expect(clear.x).toBe(WALL_SIZE + .6);
    });

    test("bosses use the same center point collision", () => {
        const boss = createBoss({ x: WALL_SIZE + 1, y: 0 }, BEETLE, 0);

        place(boss);

        boss.collideTerrain();

        expect(boss.x).toBe(WALL_SIZE + 1);
    });

    test("players still collide with their full body", () => {
        const player = new Player({ x: WALL_SIZE + 1, y: 0 });

        player.size = 17;
        place(player);

        player.collideTerrain();

        expect(player.x).toBeCloseTo(WALL_SIZE + player.size + 3, 5);
    });
});
