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
const originalMapData = state.mapData;
const originalMapCellLookup = state.mapCellLookup;
const originalMapSpawns = state.mapSpawns;
const originalIsValidMapSpawn = state.isValidMapSpawn;
const originalTerrainGridWidth = state.terrainGridWidth;
const originalTerrainGridHeight = state.terrainGridHeight;

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
    state.mapData = originalMapData;
    state.mapCellLookup = originalMapCellLookup;
    state.mapSpawns = originalMapSpawns;
    state.isValidMapSpawn = originalIsValidMapSpawn;
    state.terrainGridWidth = originalTerrainGridWidth;
    state.terrainGridHeight = originalTerrainGridHeight;
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

describe("boss zone spawn", () => {
    const GRID = 10;

    function buildZonedMap(rarityByCell) {
        const cells = [];
        const lookup = new Map();

        for (let y = 0; y < GRID; y++) {
            for (let x = 0; x < GRID; x++) {
                const cell = { x, y, type: 3, score: rarityByCell(x, y) };
                cells.push(cell);
                lookup.set(y * GRID + x, cell);
            }
        }

        state.mapData = { cells, maxRarity: 10, mobSpawners: [] };
        state.mapCellLookup = lookup;
        state.terrainGridWidth = GRID;
        state.terrainGridHeight = GRID;
        state.mapSpawns = {
            [ENTITY_TYPES.MOB]: cells.map(cell => ({
                x: ((cell.x + .5) / GRID) - .5,
                y: ((cell.y + .5) / GRID) - .5,
                rarity: Math.round(cell.score * 10)
            }))
        };
        state.isValidMapSpawn = () => true;
    }

    test("spawns inside the matching rarity zone", () => {
        // left half zone rarity 3, right half zone rarity 7
        buildZonedMap((x, y) => x < GRID / 2 ? 0.3 : 0.7);

        const bossPosition = state.spawnBossInZone(BEETLE, 7);

        expect(bossPosition).not.toBeNull();
        expect(state.mapRarityAt(bossPosition.x, bossPosition.y)).toBe(7);
    });

    test("refuses to spawn when no zone has the boss rarity", () => {
        buildZonedMap(() => 0.3);

        expect(state.spawnBossInZone(BEETLE, 9)).toBeNull();
    });
});

describe("boss mass", () => {
    test("bosses are three times as hard to push", () => {
        const normal = new Mob({ x: 0, y: 0 });
        normal.define(BEETLE, 5);

        const boss = createBoss({ x: 0, y: 0 }, BEETLE, 5);

        expect(boss.pushability).toBeCloseTo(normal.pushability / 3, 8);
    });
});

describe("boss resin and pincer immunity", () => {
    function place(entity) {
        entity._AABB = state.spatialHash.getAABB(entity);
        state.spatialHash.insert(entity);
    }

    function makeEnemy() {
        const enemy = new Player({ x: 0, y: 0 });
        enemy.team = 0;
        return enemy;
    }

    function makeProjectile(name, parent) {
        const petal = new Petal(parent, -1, -1);
        petal.define(petalConfigs.find(p => p.name === name), 5);
        petal.launched = true;
        petal.x = 10;
        petal.y = 0;
        return petal;
    }

    test("enemy Resin does not slow boss and cannot pacify it", () => {
        Math.random = () => 0;
        const boss = createBoss({ x: 0, y: 0 }, BEETLE, 5);
        boss.spawnInvincibility = false;
        const enemy = makeEnemy();
        const resin = makeProjectile("Resin.projectile", enemy);

        place(boss);
        place(resin);
        resin.collide();

        expect(boss.speedDebuff.timer).toBe(0);
        expect(boss.speedDebuff.multiplier).toBe(1);
        expect(boss.pacifiedUntil).toBeFalsy();
    });

    test("enemy Pincer does not slow boss, but its poison still applies", () => {
        const boss = createBoss({ x: 0, y: 0 }, BEETLE, 5);
        boss.spawnInvincibility = false;
        const enemy = makeEnemy();
        const pincer = makeProjectile("Pincer", enemy);

        place(boss);
        place(pincer);
        pincer.collide();

        expect(boss.speedDebuff.timer).toBe(0);
        expect(boss.speedDebuff.multiplier).toBe(1);
        expect(boss.poison.timer).toBeGreaterThan(0);
    });
});
