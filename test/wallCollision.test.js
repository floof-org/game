import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import state from "../public/server/lib/state.js";
import SpatialHashGrid from "../public/server/lib/SpatialHashGrid.js";
import { Mob, Player, Terrain, createBoss } from "../public/server/lib/Entity.js";
import { mobConfigs } from "../public/server/lib/config.js";
import { terrains } from "../public/lib/protocol.js";

const GRID = 40;
const WORLD = 400;
const TILE = WORLD / GRID;
const WALL_SIZE = 20;
const MOB_RADIUS = TILE * .49;
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
    test("mob circles keep one tile of clearance from walls", () => {
        const mob = new Mob({ x: WALL_SIZE + 1, y: 0 });

        mob.define(BEETLE, 0);
        mob.size = 17;
        place(mob);

        mob.collideTerrain();

        expect(mob.x).toBeCloseTo(WALL_SIZE + MOB_RADIUS, 5);
        expect(mob.y).toBeCloseTo(0, 10);
    });

    test("a mob circle inside the wall is pushed just outside", () => {
        const mob = new Mob({ x: WALL_SIZE - 5, y: 0 });

        mob.define(BEETLE, 0);
        mob.size = 17;
        place(mob);

        mob.collideTerrain();

        expect(mob.x).toBeCloseTo(WALL_SIZE + MOB_RADIUS, 5);
    });

    test("the collision circle is one tile wide", () => {
        const overlapping = new Mob({ x: WALL_SIZE + MOB_RADIUS - .1, y: 0 });

        overlapping.define(BEETLE, 0);
        overlapping.size = 17;
        place(overlapping);

        overlapping.collideTerrain();

        expect(overlapping.x).toBeCloseTo(WALL_SIZE + MOB_RADIUS, 5);

        const clear = new Mob({ x: WALL_SIZE + MOB_RADIUS + .1, y: 0 });

        clear.define(BEETLE, 0);
        clear.size = 17;
        place(clear);

        clear.collideTerrain();

        expect(clear.x).toBeCloseTo(WALL_SIZE + MOB_RADIUS + .1, 5);
    });

    test("a mob slides along a wall instead of snapping back", () => {
        const mob = new Mob({ x: WALL_SIZE + .2, y: 0 });

        mob.define(BEETLE, 0);
        mob.size = 17;
        // Moving diagonally into the wall: -x is into it, +y is along it.
        mob.velocity.x = -2;
        mob.velocity.y = 3;
        mob.lastGoodPosition = { x: WALL_SIZE + 30, y: 0 };
        place(mob);

        mob.collideTerrain();

        // The circle is pushed out, the along-wall speed is kept, and the mob
        // is not teleported back to the recorded last good position.
        expect(mob.x).toBeCloseTo(WALL_SIZE + MOB_RADIUS, 5);
        expect(mob.y).toBeCloseTo(0, 10);
        expect(mob.velocity.x).toBeCloseTo(0, 10);
        expect(mob.velocity.y).toBeCloseTo(3, 10);
    });

    test("a fast mob cannot tunnel through a wall in one tick", () => {
        const mob = new Mob({ x: WALL_SIZE + MOB_RADIUS, y: 0 });

        mob.define(BEETLE, 0);
        mob.size = 17;
        // Simulate a large step that starts clear on the right and ends clear
        // on the far side of the 40 unit thick wall.
        mob._terrainStartX = WALL_SIZE + MOB_RADIUS;
        mob._terrainStartY = 0;
        mob.x = -WALL_SIZE - MOB_RADIUS;
        mob.velocity.x = -400;
        place(mob);

        mob.collideTerrain();

        expect(mob.x).toBeCloseTo(WALL_SIZE + MOB_RADIUS, 5);
    });

    test("player summons use the same circular collision", () => {
        const owner = new Player({ x: 0, y: 0 });

        owner.size = 17;

        const summon = new Mob({ x: WALL_SIZE + MOB_RADIUS - .1, y: 0 });

        // Ruby and petal summons are friendly mobs owned by a player.
        summon.parent = owner;
        summon.owner = { body: owner };
        summon.isSummon = true;
        summon.friendly = true;
        summon.team = owner.team;
        summon.define(BEETLE, 0);
        summon.size = 17;

        // A large step starts clear on the right and ends clear on the far side.
        summon._terrainStartX = WALL_SIZE + MOB_RADIUS;
        summon._terrainStartY = 0;
        summon.x = -WALL_SIZE - MOB_RADIUS;
        summon.velocity.x = -400;
        place(summon);

        summon.collideTerrain();

        expect(summon.x).toBeCloseTo(WALL_SIZE + MOB_RADIUS, 5);
    });

    test("bosses use the same circular collision", () => {
        const boss = createBoss({ x: WALL_SIZE + 1, y: 0 }, BEETLE, 0);

        place(boss);

        boss.collideTerrain();

        expect(boss.x).toBeCloseTo(WALL_SIZE + MOB_RADIUS, 5);
    });

    test("players still collide with their full body", () => {
        const player = new Player({ x: WALL_SIZE + 1, y: 0 });

        player.size = 17;
        place(player);

        player.collideTerrain();

        expect(player.x).toBeCloseTo(WALL_SIZE + player.size + 3, 5);
    });
});
