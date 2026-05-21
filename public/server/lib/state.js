import { CLIENT_BOUND, ENTITY_TYPES, GAMEMODES, ROUTER_PACKET_TYPES, Writer, tiers } from "../../lib/protocol.js";
import { quickDiff } from "../../lib/util.js";
import SpatialHashGrid from "./SpatialHashGrid.js";

// Zone coords work on a [-1, 1] scale with [0, 0] being the center of the map
export class Zone {
    constructor(x1, y1, x2, y2, color = "#FFFFFF") {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.color = color;

        this.isSpawnpoint = false;
    }
}

const state = {
    /** @type {import("./Router.js").default} */
    router: null,

    width: 32 * 32,
    height: 32 * 32,
    isRadial: false,
    isLineMap: false,
    biome: 0,

    announceRarity: 7,

    gamemode: GAMEMODES.FFA,

    isTDM: false,
    teamCount: 2,
    isWaves: false,
    currentWave: 0,
    mobsExpire: false,

    dynamicRoom: true,

    teamMinimaps: [],

    random: () => {
        if (state.isRadial) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * state.width / 2;

            return {
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius
            };
        }

        return {
            x: -state.width / 2 + Math.random() * state.width,
            y: -state.height / 2 + Math.random() * state.height
        };
    },

    mapSpawns: null,
    maxMapDistFromSpawn: 0,
    mapData: [],

    mapBasedSpawn(type, client) {
        if (state.mapSpawns == null || state.mapSpawns[type] == null) {
            return state.random();
        }

        let spawns = state.mapSpawns[type];

        if (type == ENTITY_TYPES.PLAYER) {
            let highestSpawnRarity = 0
            spawns = spawns.filter((spawn) => {
                if (spawn.rarity <= client.highestRarity) {
                    return true
                }
            })

            spawns.forEach((data) => {
                highestSpawnRarity = Math.max(data.rarity, highestSpawnRarity)
            })

            spawns = spawns.filter((data) => {
                if (data.rarity >= highestSpawnRarity) return true
            })
        }

        const spawn = spawns[Math.floor(Math.random() * spawns.length)];

        return {
            x: spawn.x * state.width,
            y: spawn.y * state.height,
            rarity: spawn.rarity
        }
    },

    isValidMapSpawn: (x, y) => {
        if (state.mapData.cells.length === 0) {
            return true;
        }

        const gridX = Math.floor((x + state.width / 2) / state.width * state.terrainGridWidth);
        const gridY = Math.floor((y + state.height / 2) / state.height * state.terrainGridHeight);

        if (gridX < 0 || gridX >= state.terrainGridWidth || gridY < 0 || gridY >= state.terrainGridHeight) {
            return false;
        }

        return state.mapDataAt(x, y).type !== 0;
    },

    mapDataAt: (x, y) => {
        const gridX = Math.floor((x + state.width / 2) / state.width * state.terrainGridWidth);
        const gridY = Math.floor((y + state.height / 2) / state.height * state.terrainGridHeight);

        if (gridX < 0 || gridX >= state.terrainGridWidth || gridY < 0 || gridY >= state.terrainGridHeight) {
            return null;
        }

        return state.mapData.cells.filter((cell) => {
            if (cell.x == gridX && cell.y == gridY) return true
        })[0];
    },

    mapSpawnClosestTo: (x, y) => {
        if (state.mapData.length === 0) {
            return state.random();
        }

        x /= state.width;
        y /= state.height;

        let closest,
            closestDist = Infinity;

        for (const type in state.mapSpawns) {
            const spawns = state.mapSpawns[type];

            for (const spawn of spawns) {
                const dist = quickDiff(spawn, { x, y });

                if (dist < closestDist) {
                    closest = spawn;
                    closestDist = dist;
                }
            }
        }

        return closest;
    },

    getPlayerSpawn: client => {
        if (!state.isLineMap) {
            let pos = state.mapBasedSpawn(ENTITY_TYPES.PLAYER, client);

            return pos;
        }

        return {
            x: Math.max(-state.width / 2 + 25, Math.min(state.width / 2 - 25, -state.width / 2 + Math.min(client.level / 50, 1) * state.width / 1.5 + (Math.random() - .5) * 64)),
            y: -state.height / 2 + Math.random() * state.height
        };
    },

    spawnNearPlayer: config => {
        const bodies = [];

        state.clients.forEach(c => {
            if (c.body) {
                bodies.push({
                    highestRarity: c.highestRarity,
                    x: c.body.x,
                    y: c.body.y,
                    size: c.body.size
                });
            }
        });

        if (bodies.length === 0) {
            return {
                position: state.mapBasedSpawn(ENTITY_TYPES.MOB),
                rarity: Math.random() * 3 | 0
            };
        }

        const body = bodies[Math.floor(Math.random() * bodies.length)];

        let position,
            k = 0,
            minDist = body.size + 512,
            distLength = 2048,
            isGood = false,
            rarity = 0;

        do {
            const angle = Math.random() * Math.PI * 2;
            const dist = minDist + Math.random() * distLength;

            position = {
                x: body.x + Math.cos(angle) * dist,
                y: body.y + Math.sin(angle) * dist
            };

            const dx = body.x - position.x;
            const dy = body.y - position.y;

            if (dx * dx + dy * dy > minDist * minDist && state.isValidMapSpawn(position.x, position.y)) {
                const baseRarity = state.mapSpawnClosestTo(position.x, position.y).rarity;
                const goesUp = Math.random() > .5 * Math.pow(1.1015, baseRarity);
                rarity = Math.min(11, Math.max(0, goesUp ? baseRarity + 1 : baseRarity - (Math.random() * 2 | 0)));

                const retrieved = state.spatialHash.retrieve({
                    _AABB: {
                        x1: position.x - config.tiers[rarity].size,
                        y1: position.y - config.tiers[rarity].size,
                        x2: position.x + config.tiers[rarity].size,
                        y2: position.y + config.tiers[rarity].size
                    }
                }).size;

                if (retrieved === 0) {
                    isGood = true;
                    break;
                }
            }
        } while (++k < 100);

        if (!isGood) {
            position = state.mapBasedSpawn(ENTITY_TYPES.MOB);
        }

        return {
            position: position,
            rarity: rarity,
            tile: state.mapDataAt(position.x, position.y)
        };
    },

    lineMapMobSpawn: config => {
        const bodies = [];

        state.clients.forEach(c => {
            if (c.body) {
                bodies.push({
                    highestRarity: c.highestRarity,
                    x: c.body.x,
                    y: c.body.y
                });
            }
        });

        if (bodies.length === 0) {
            const pos = state.random();
            pos.x = Math.max(-state.width / 2 + 25, Math.min(-25, pos.x));
            return {
                position: pos,
                rarity: Math.min(10, Math.max(0, Math.floor((pos.x + state.width / 2) / state.width * 10 + (Math.random() - .5) * 2)))
            };
        }

        const body = bodies[Math.floor(Math.random() * bodies.length)];
        let rarity = Math.min(10, body.highestRarity + (Math.random() > .8), Math.max(0, Math.floor((body.x + state.width / 2) / state.width * 10 + (Math.random() - .5) * 2)));

        let x = 0,
            y = 0,
            k = 0;

        do {
            const angle = Math.random() * Math.PI * 2;
            const dist = 128 + config.tiers[rarity].size * 8 + Math.random() * config.tiers[rarity].size * 12;
            x = body.x + Math.cos(angle) * dist;
            y = body.y + Math.sin(angle) * dist;

            x = Math.max(-state.width / 2 + 25, Math.min(state.width / 2 - 25, x));
            y = Math.max(-state.height / 2 + 25, Math.min(state.height / 2 - 25, y));

            if (k > 0 && k % 10 === 9) {
                rarity = Math.max(0, rarity - 1);
            }
        } while (bodies.some(b => quickDiff(b, { x, y }) < 128) && k++ < 100);

        return {
            position: { x, y },
            rarity: rarity
        };
    },

    spatialHash: new SpatialHashGrid(),
    viewsSpatialHash: new SpatialHashGrid(),
    terrainSpatialHash: new SpatialHashGrid(),

    /** @type {Map<number, import("./Entity.js").Entity>} */
    entities: new Map(),

    /** @type {Map<number, import("./Entity.js").Drop>} */
    drops: new Map(),

    /** @type {Map<number, import("./Client.js").default>} */
    clients: new Map(),

    /** @type {Map<number, import("./Entity.js").Pentagram>} */
    pentagrams: new Map(),

    /** @type {Map<number, import("./Entity.js").Lightning>} */
    lightning: new Map(),

    /** @type {Map<number, import("./Entity.js").Terrain>} */
    terrain: new Map(),
    terrainGridWidth: 0,
    terrainGridHeight: 0,
    maxMobs: 6,
    livingMobCount: 0,
    aliveMobs: [],
    alivePlayers: [],
    playerCount: 0,
    inventory: Object.fromEntries(tiers.map(tier => [tier.name, {}])),
    secretKey: crypto.getRandomValues(new Uint8Array(32)).join(""),

    /** @type {Zone[]} */
    zones: [],

    lag: {
        fps: 20,
        mspt: 0,

        ticks: 0,
        totalTime: 0
    },

    updateTerrain: () => {
        state.terrainSpatialHash.clear();

        state.terrain.forEach(terrain => {
            terrain._AABB = terrain.polygon._AABB;
            state.terrainSpatialHash.insert(terrain);
        });
    },

    sendTerrain: id => {
        const writer = new Writer(true);
        writer.setUint8(ROUTER_PACKET_TYPES.PIPE_PACKET);
        writer.setUint16(id > 0 ? id : 0);
        writer.setUint8(CLIENT_BOUND.TERRAIN);

        writer.setUint16(state.terrainGridWidth);
        writer.setUint16(state.terrainGridHeight);

        writer.setUint16(state.terrain.size);
        state.terrain.forEach(terrain => {
            writer.setInt16(terrain.gridX);
            writer.setInt16(terrain.gridY);
            writer.setUint8(terrain.type[0]);
            writer.setUint8(terrain.type[1]);
        });

        state.router.postMessage(writer.build());
    },

    mobTable: null
};

if (state.inventory) tiers.forEach(tier => {
     state.inventory[tier.name] = {};
});

export default state;
