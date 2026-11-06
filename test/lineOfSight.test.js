import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import state from "../public/server/lib/state.js";
import SpatialHashGrid from "../public/server/lib/SpatialHashGrid.js";
import { Lightning, Mob, Petal, Player } from "../public/server/lib/Entity.js";
import { mobConfigs, petalConfigs } from "../public/server/lib/config.js";

const GRID = 40;
const WORLD = 400;
const WALL_COLUMN = 20;

const BEETLE = mobConfigs.find(mob => mob.name === "Beetle");
const STINGER = petalConfigs.find(petal => petal.name === "Stinger");

const original = {
    width: state.width,
    height: state.height,
    mapSolid: state.mapSolid,
    mapData: state.mapData,
    mapCellLookup: state.mapCellLookup,
    terrainGridWidth: state.terrainGridWidth,
    terrainGridHeight: state.terrainGridHeight
};

function buildGrid(withWall) {
    const solid = new Uint8Array(GRID * GRID);

    if (withWall) {
        for (let y = 0; y < GRID; y++) {
            solid[y * GRID + WALL_COLUMN] = 1;
        }
    }

    state.mapSolid = solid;
}

function resetWorld() {
    state.width = WORLD;
    state.height = WORLD;
    state.terrainGridWidth = GRID;
    state.terrainGridHeight = GRID;
    state.mapData = [];
    state.mapCellLookup = null;
    buildGrid(false);

    SpatialHashGrid.configure(WORLD, WORLD);
    state.spatialHash.clear();
    state.entities.clear();
    state.lightning.clear();
    state.clients.clear();
    state.gamemode = 0;
    state.livingMobCount = 0;
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
    resetWorld();
});

describe("line of sight", () => {
    test("is blocked by a wall between the endpoints", () => {
        buildGrid(true);

        expect(state.hasLineOfSight(-50, 0, 50, 0)).toBe(false);
    });

    test("is clear when both endpoints are on the same side", () => {
        buildGrid(true);

        expect(state.hasLineOfSight(-150, 0, -50, 0)).toBe(true);
        expect(state.hasLineOfSight(50, 0, 150, 0)).toBe(true);
    });

    test("is always clear when the room has no map grid", () => {
        state.mapSolid = null;

        expect(state.hasLineOfSight(-150, 0, 150, 0)).toBe(true);
    });
});

describe("attacks through walls", () => {
    function makeFight() {
        const player = new Player({ x: -50, y: 0 });
        const mob = new Mob({ x: 55, y: 0 });

        mob.define(BEETLE, 0);
        mob.spawnInvincibility = false;

        const petal = new Petal(player, -1, -1);
        petal.define(STINGER, 0);
        petal.damage = 10;
        petal.x = 50;
        petal.y = 0;

        place(mob);
        place(petal);

        return { mob, petal };
    }

    test("a petal cannot damage a mob across a wall", () => {
        buildGrid(true);
        const { mob, petal } = makeFight();
        const before = mob.health.health;

        petal.collide();

        expect(mob.health.health).toBe(before);
    });

    test("the same petal damages the mob once the wall is gone", () => {
        buildGrid(true);
        const { mob, petal } = makeFight();

        buildGrid(false);
        petal.collisionIDs.clear();
        mob.collisionIDs.clear();

        const before = mob.health.health;
        petal.collide();

        expect(mob.health.health).toBeLessThan(before);
    });
});

describe("lightning through walls", () => {
    function makeTarget() {
        const mob = new Mob({ x: 55, y: 0 });
        mob.define(BEETLE, 0);
        mob.spawnInvincibility = false;
        place(mob);
        return mob;
    }

    test("does not bounce to a target across a wall", () => {
        buildGrid(true);
        const source = new Player({ x: -50, y: 0 });
        const mob = makeTarget();
        const before = mob.health.health;

        new Lightning(source).define(10, 500, 3).bounce();

        expect(mob.health.health).toBe(before);
    });

    test("bounces to a visible target", () => {
        buildGrid(false);
        const source = new Player({ x: -50, y: 0 });
        const mob = makeTarget();
        const before = mob.health.health;

        new Lightning(source).define(10, 500, 3).bounce();

        expect(mob.health.health).toBeLessThan(before);
    });
});
