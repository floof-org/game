import { afterEach, beforeEach, describe, expect, test } from "bun:test";

import state from "../public/server/lib/state.js";
import SpatialHashGrid from "../public/server/lib/SpatialHashGrid.js";
import { Mob, Petal, Player, createBoss } from "../public/server/lib/Entity.js";
import { BOSS_ABILITIES, BOSS_NAMES, BOSS_SIZE_MULTIPLIER, DROP_LOOKUP, mobConfigs, petalConfigs } from "../public/server/lib/config.js";
import { ENTITY_TYPES } from "../public/lib/protocol.js";

const WORLD = 1000;
const BEETLE = mobConfigs.find(mob => mob.name === "Beetle");

const originalRandom = Math.random;
const originalAnnounceRarity = state.announceRarity;

function resetWorld() {
    state.width = WORLD;
    state.height = WORLD;
    SpatialHashGrid.configure(WORLD, WORLD);
    state.spatialHash.clear();
    state.entities.clear();
    state.drops.clear();
    state.clients.clear();
    state.lightning.clear();
    state.gamemode = 0;
    state.isRadial = false;
    state.announceRarity = originalAnnounceRarity;
    state.livingMobCount = 0;
}

function makeClient(id = 1) {
    const messages = [];
    const drops = [];

    const client = {
        id,
        userId: `user-${id}`,
        username: `Tester${id}`,
        level: 1,
        highestRarity: 29,
        slots: [],
        body: null,
        messages,
        drops,
        systemMessage(message) {
            messages.push(message);
        },
        addXP() {},
        addDrop(drop) {
            drops.push({ index: drop.index, rarity: drop.rarity, amount: drop.amount });
        },
        lootName() {
            return this.username;
        }
    };

    state.clients.set(id, client);
    return client;
}

function killMob(mob, client) {
    mob.damagedBy[mob.id] = [mob.health.maxHealth * 10, ENTITY_TYPES.PLAYER, client.username, client.id];
    mob.health.health = 0;
    mob.destroy();
}

beforeEach(() => {
    resetWorld();
});

afterEach(() => {
    Math.random = originalRandom;
    state.announceRarity = originalAnnounceRarity;
    resetWorld();
});

describe("boss stats", () => {
    test("multiplies health, damage and size by four and keeps armor", () => {
        for (const rarity of [0, 6, 15, 29]) {
            const normal = new Mob({ x: 0, y: 0 });
            normal.define(BEETLE, rarity);

            const boss = createBoss({ x: 0, y: 0 }, BEETLE, rarity);

            expect(boss.health.maxHealth).toBeCloseTo(normal.health.maxHealth * 4, 6);
            expect(boss.damage).toBeCloseTo(normal.damage * 4, 6);
            expect(boss.size).toBeCloseTo(normal.size * BOSS_SIZE_MULTIPLIER, 6);
            expect(boss.armor).toBe(normal.armor);
        }
    });

    test("every boss name has abilities and is aggressive", () => {
        for (const name of BOSS_NAMES) {
            const config = mobConfigs.find(mob => mob.name === name);

            expect(config).toBeDefined();
            expect(BOSS_ABILITIES[name]).toBeDefined();

            const boss = createBoss({ x: 0, y: 0 }, config, 10);

            expect(boss.isBoss).toBe(true);
            expect(boss.aggressive).toBe(true);
            expect(boss.neutral).toBe(false);
            expect(Object.keys(boss.bossAbilities).length).toBe(Object.keys(BOSS_ABILITIES[name]).length);
        }
    });
});

describe("boss drops", () => {
    // Math.random = 0 makes every drop row pass its chance check and pick its
    // first weighted entry, so normal and boss runs drop the same item.
    test("drops five times the normal amount from drop tables", () => {
        Math.random = () => 0;

        const normalClient = makeClient(1);
        const normal = new Mob({ x: 0, y: 0 });
        normal.define(BEETLE, 0);
        killMob(normal, normalClient);

        const bossClient = makeClient(2);
        const boss = createBoss({ x: 0, y: 0 }, BEETLE, 0);
        killMob(boss, bossClient);

        expect(normalClient.drops.length).toBeGreaterThan(0);
        expect(bossClient.drops.length).toBe(normalClient.drops.length);

        for (let i = 0; i < normalClient.drops.length; i++) {
            expect(bossClient.drops[i].index).toBe(normalClient.drops[i].index);
            expect(bossClient.drops[i].rarity).toBe(normalClient.drops[i].rarity);
            expect(bossClient.drops[i].amount).toBe(normalClient.drops[i].amount * 5);
        }
    });

    test("drops five times the normal amount from config fallback drops", () => {
        Math.random = () => 0;

        const table = DROP_LOOKUP.Beetle;
        delete DROP_LOOKUP.Beetle;

        try {
            const normalClient = makeClient(1);
            const normal = new Mob({ x: 0, y: 0 });
            normal.define(BEETLE, 0);
            killMob(normal, normalClient);

            const bossClient = makeClient(2);
            const boss = createBoss({ x: 0, y: 0 }, BEETLE, 0);
            killMob(boss, bossClient);

            expect(normalClient.drops.length).toBeGreaterThan(0);
            for (const drop of bossClient.drops) {
                expect(drop.amount).toBe(5);
            }
        } finally {
            DROP_LOOKUP.Beetle = table;
        }
    });
});

describe("boss targeting", () => {
    test("ignores Lens petals that ordinary mobs chase", () => {
        const player = new Player({ x: 100, y: 0 });
        player.team = 0;

        const lensPetal = new Petal(player, -1, -1);
        lensPetal.define(petalConfigs.find(petal => petal.name === "Lens"), 5);
        lensPetal.x = 10;
        lensPetal.y = 0;

        const normal = new Mob({ x: 0, y: 0 });
        normal.define(BEETLE, 0);
        const boss = createBoss({ x: 0, y: 0 }, BEETLE, 0);

        for (const entity of [player, lensPetal, normal, boss]) {
            entity._AABB = state.spatialHash.getAABB(entity);
            state.spatialHash.insert(entity);
        }

        expect(lensPetal.aggroLevel).toBeGreaterThan(0);
        expect(normal.findTarget(300)?.type).toBe(ENTITY_TYPES.PETAL);
        expect(boss.findTarget(300)?.type).toBe(ENTITY_TYPES.PLAYER);
    });

    test("ignores Lightbulb aggro on players", () => {
        const far = new Player({ x: 100, y: 0 });
        far.team = 0;
        far.aggroLevel = 9;

        const near = new Player({ x: 40, y: 0 });
        near.team = 0;

        const normal = new Mob({ x: 0, y: 0 });
        normal.define(BEETLE, 0);
        const boss = createBoss({ x: 0, y: 0 }, BEETLE, 0);

        for (const entity of [far, near, normal, boss]) {
            entity._AABB = state.spatialHash.getAABB(entity);
            state.spatialHash.insert(entity);
        }

        expect(normal.findTarget(300)?.id).toBe(far.id);
        expect(boss.findTarget(300)?.id).toBe(near.id);
    });
});

describe("boss abilities", () => {
    test("speed abilities shrink and speed up, then restore", () => {
        const boss = createBoss({ x: 0, y: 0 }, BEETLE, 10);
        const size = boss.size;
        const speed = boss.speed;

        boss.bossAbilities.speed.nextAbility = 0;
        boss.update();

        expect(boss.size).toBeCloseTo(size / 5, 6);
        expect(boss.speed).toBeCloseTo(speed * 1.5, 6);

        boss.bossAbilities.speed.until = Date.now() - 1;
        boss.update();

        expect(boss.size).toBeCloseTo(size, 6);
        expect(boss.speed).toBeCloseTo(speed, 6);
    });

    test("a boss fires its projectile ability", () => {
        const boss = createBoss({ x: 0, y: 0 }, BEETLE, 10);

        boss.bossAbilities.missile.nextAbility = 0;
        boss.update();

        const projectiles = [...state.entities.values()].filter(
            entity => entity.type === ENTITY_TYPES.PETAL && entity.parent === boss
        );

        expect(boss.bossAbilities.missile.until).toBeGreaterThan(Date.now());
        expect(projectiles.length).toBe(BOSS_ABILITIES.Beetle.missile.count);
    });
});

describe("out of bounds players", () => {
    test("die when they leave the map", () => {
        const player = new Player({ x: WORLD / 2 + 100, y: 0 });
        player.update();

        expect(player.health.isDead).toBe(true);
    });

    test("survive inside the map", () => {
        const player = new Player({ x: WORLD / 2 - 10, y: 0 });
        player.update();

        expect(player.health.isDead).toBe(false);
    });
});

describe("announcement threshold", () => {
    test("rarity 24 stays silent and rarity 25 announces the kill", () => {
        state.announceRarity = 25;

        const silentClient = makeClient(1);
        const silent = new Mob({ x: 0, y: 0 });
        silent.define(BEETLE, 24);
        killMob(silent, silentClient);

        expect(silentClient.messages).toHaveLength(0);

        const loudClient = makeClient(2);
        const loud = createBoss({ x: 0, y: 0 }, BEETLE, 25);
        killMob(loud, loudClient);

        expect(loudClient.messages.some(message => message.startsWith("A Boss"))).toBe(true);
    });
});
