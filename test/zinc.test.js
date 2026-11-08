import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import state from "../public/server/lib/state.js";
import SpatialHashGrid from "../public/server/lib/SpatialHashGrid.js";
import { Mob, Petal, Player } from "../public/server/lib/Entity.js";
import { mobConfigs, petalConfigs } from "../public/server/lib/config.js";
import { SQUADS } from "../public/server/lib/squads.js";

const WORLD = 400;
const BEETLE = mobConfigs.find(mob => mob.name === "Beetle");
const ZINC = petalConfigs.find(petal => petal.name === "Zinc");
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

function resetWorld() {
    state.width = WORLD;
    state.height = WORLD;
    state.terrainGridWidth = 1;
    state.terrainGridHeight = 1;
    state.mapSolid = null;
    state.mapData = [];
    state.mapCellLookup = null;

    SpatialHashGrid.configure(WORLD, WORLD);
    state.spatialHash.clear();
    state.entities.clear();
    state.clients.clear();
    state.gamemode = 0;
    SQUADS.clear();
}

function makePlayer(id, userId) {
    const player = new Player({ x: 0, y: 0 });

    player.client = {
        id,
        userId,
        level: 1,
        highestRarity: 29,
        slots: []
    };

    return player;
}

function makeSquad(name, userIds) {
    SQUADS.set(name, { name, members: new Set(userIds) });
}

function makePetal(owner, config, x = 5, y = 0) {
    const petal = new Petal(owner, -1, -1);

    petal.define(config, 29);
    petal.damage = 60;
    petal.x = x;
    petal.y = y;

    petal._AABB = state.spatialHash.getAABB(petal);
    state.spatialHash.insert(petal);

    return petal;
}

function makeMob() {
    const mob = new Mob({ x: 0, y: 0 });

    mob.define(BEETLE, 0);
    mob.spawnInvincibility = false;
    mob.armor = 100;
    mob.health.armor = 100;

    mob._AABB = state.spatialHash.getAABB(mob);
    state.spatialHash.insert(mob);

    return mob;
}

function hit(petal, mob) {
    const before = mob.health.health;

    petal.collide();

    return before - mob.health.health;
}

beforeEach(() => {
    resetWorld();
});

afterEach(() => {
    Object.assign(state, original);
    resetWorld();
});

describe("zinc armor debuff", () => {
    test("only the squad that applied zinc can break the armor", () => {
        makeSquad("Alpha", ["user-a"]);

        const playerA = makePlayer(1, "user-a");
        const playerB = makePlayer(2, "user-b");
        const mob = makeMob();

        // The first zinc hit applies the debuff for Alpha. Damage still uses the
        // original armor on this hit, so 60 < 100 is blocked.
        expect(hit(makePetal(playerA, ZINC), mob)).toBe(0);

        // A squad without zinc still sees the full 100 armor.
        expect(hit(makePetal(playerB, STINGER), mob)).toBe(0);

        // Alpha now benefits from its own debuff.
        expect(hit(makePetal(playerA, STINGER), mob)).toBe(60);
    });

    test("squad members share the debuff", () => {
        makeSquad("Alpha", ["user-a", "user-a2"]);

        const playerA = makePlayer(1, "user-a");
        const playerA2 = makePlayer(3, "user-a2");
        const mob = makeMob();

        expect(hit(makePetal(playerA, ZINC), mob)).toBe(0);
        expect(hit(makePetal(playerA2, STINGER), mob)).toBe(60);
    });

    test("the debuff expires per squad", () => {
        makeSquad("Alpha", ["user-a"]);

        const playerA = makePlayer(1, "user-a");
        const mob = makeMob();

        expect(hit(makePetal(playerA, ZINC), mob)).toBe(0);

        for (const debuff of mob.health.zincDebuffs.values()) {
            debuff.until = Date.now() - 1;
        }

        expect(hit(makePetal(playerA, STINGER), mob)).toBe(0);
    });

    test("a solo player only benefits from their own zinc", () => {
        const soloA = makePlayer(4, "solo-a");
        const soloB = makePlayer(5, "solo-b");
        const mob = makeMob();

        expect(hit(makePetal(soloA, ZINC), mob)).toBe(0);
        expect(hit(makePetal(soloB, STINGER), mob)).toBe(0);
        expect(hit(makePetal(soloA, STINGER), mob)).toBe(60);
    });
});
