import { CLIENT_BOUND, ENTITY_TYPES, GAMEMODES, ROUTER_PACKET_TYPES, Writer, tiers } from "../../lib/protocol.js";
import { quickDiff } from "../../lib/util.js";
import { BOSS_SIZE_MULTIPLIER } from "./config.js";
import SpatialHashGrid from "./SpatialHashGrid.js";

/**
 * Lowest mob rarity that gets a spawn, despawn, kill or drop announcement.
 * Exported so a lobby that overrides it cannot silently drift away from the default.
 */
export const DEFAULT_ANNOUNCE_RARITY = 25; // Epsilation

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

    announceRarity: DEFAULT_ANNOUNCE_RARITY,

    gamemode: GAMEMODES.FFA,
    useCraftingProtocol: false,

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
            if (client?.firstSpawn) {
                spawns = spawns.filter((spawn) => spawn.rarity === 1);

                if (spawns.length === 0) {
                    return state.random();
                }
            } else {
                let highestSpawnRarity = 0
                spawns = spawns.filter((spawn) => {
                    if (spawn.rarity <= client?.highestRarity) {
                        return true
                    }
                })

                spawns.forEach((data) => {
                    highestSpawnRarity = Math.max(data.rarity, highestSpawnRarity)
                })

                spawns = spawns.filter((data) => {
                    if (data.rarity >= highestSpawnRarity) return true
                })

                if (spawns.length === 0) {
                    return state.random();
                }
            }
        }

        const spawn = spawns[Math.floor(Math.random() * spawns.length)];

        return {
            x: spawn.x * state.width,
            y: spawn.y * state.height,
            rarity: spawn.rarity
        }
    },

    isValidMapSpawn: (x, y) => {
        if (!state.mapData?.cells?.length) {
            return true;
        }

        const gridX = Math.floor((x + state.width / 2) / state.width * state.terrainGridWidth);
        const gridY = Math.floor((y + state.height / 2) / state.height * state.terrainGridHeight);

        if (gridX < 0 || gridX >= state.terrainGridWidth || gridY < 0 || gridY >= state.terrainGridHeight) {
            return false;
        }

        return state.mapDataAt(x, y).type !== 0;
    },

    /**
     * True when a circular body of `radius` at (x, y) fits inside the room and
     * does not overlap any wall. Rooms without terrain always pass.
     */
    isClearOfTerrain: (x, y, radius) => {
        if (!state.mapData?.cells?.length || radius == null) {
            return true;
        }

        if (x - radius < -state.width / 2 || x + radius > state.width / 2 ||
            y - radius < -state.height / 2 || y + radius > state.height / 2) {
            return false;
        }

        const terrains = state.terrainSpatialHash.retrieve({
            _AABB: {
                x1: x - radius,
                y1: y - radius,
                x2: x + radius,
                y2: y + radius
            }
        });

        for (const terrain of terrains.values()) {
            if (terrain.polygon.circleIntersects(x, y, radius)) {
                return false;
            }
        }

        return true;
    },

    /**
     * Nearest position around (x, y) where a body of `radius` is clear of
     * walls. Used as a last resort for entities placed inside terrain.
     * Returns null when nothing clear is found within the search distance.
     */
    findClearPosition: (x, y, radius) => {
        if (state.isClearOfTerrain(x, y, radius)) {
            return { x, y };
        }

        const cellSize = state.terrainGridWidth
            ? state.width / state.terrainGridWidth
            : radius;
        const step = Math.max(cellSize, radius * .5);
        const rings = 8;
        const directions = 16;

        for (let ring = 1; ring <= rings; ring++) {
            const distance = ring * step;

            for (let i = 0; i < directions; i++) {
                const angle = i / directions * Math.PI * 2;
                const candidateX = x + Math.cos(angle) * distance;
                const candidateY = y + Math.sin(angle) * distance;

                if (state.isClearOfTerrain(candidateX, candidateY, radius)) {
                    return { x: candidateX, y: candidateY };
                }
            }
        }

        return null;
    },

    mapDataAt: (x, y) => {
        const gridX = Math.floor((x + state.width / 2) / state.width * state.terrainGridWidth);
        const gridY = Math.floor((y + state.height / 2) / state.height * state.terrainGridHeight);

        if (gridX < 0 || gridX >= state.terrainGridWidth || gridY < 0 || gridY >= state.terrainGridHeight) {
            return null;
        }

        return state.mapCellLookup?.get(gridY * state.terrainGridWidth + gridX) ?? null;
    },

    /**
     * Grid raycast between two world positions. Returns true when the segment
     * does not cross a wall cell, or when the room has no map grid at all.
     * Endpoints are allowed to touch a wall; only cells strictly between them
     * are checked, so a mob standing next to a wall can still be hit.
     */
    hasLineOfSight: (x1, y1, x2, y2) => {
        const solid = state.mapSolid;
        const width = state.terrainGridWidth;
        const height = state.terrainGridHeight;

        if (!solid || !width || !height) {
            return true;
        }

        const cellWidth = state.width / width;
        const cellHeight = state.height / height;
        const toGridX = x => Math.floor((x + state.width / 2) / cellWidth);
        const toGridY = y => Math.floor((y + state.height / 2) / cellHeight);

        let gridX = toGridX(x1);
        let gridY = toGridY(y1);
        const targetX = toGridX(x2);
        const targetY = toGridY(y2);

        if (gridX < 0 || gridX >= width || gridY < 0 || gridY >= height ||
            targetX < 0 || targetX >= width || targetY < 0 || targetY >= height) {
            return false;
        }

        const dirX = x2 - x1;
        const dirY = y2 - y1;

        if (dirX === 0 && dirY === 0) {
            return true;
        }

        const stepX = dirX > 0 ? 1 : -1;
        const stepY = dirY > 0 ? 1 : -1;
        const edgeX = x => -state.width / 2 + x * cellWidth;
        const edgeY = y => -state.height / 2 + y * cellHeight;

        let maxX = Infinity;
        let deltaX = Infinity;

        if (dirX !== 0) {
            maxX = (edgeX(dirX > 0 ? gridX + 1 : gridX) - x1) / dirX;
            deltaX = cellWidth / Math.abs(dirX);
        }

        let maxY = Infinity;
        let deltaY = Infinity;

        if (dirY !== 0) {
            maxY = (edgeY(dirY > 0 ? gridY + 1 : gridY) - y1) / dirY;
            deltaY = cellHeight / Math.abs(dirY);
        }

        // A straight segment crosses at most width + height cells.
        for (let guard = width + height; guard > 0 && (gridX !== targetX || gridY !== targetY); guard--) {
            if (maxX <= maxY) {
                gridX += stepX;
                maxX += deltaX;
            } else {
                gridY += stepY;
                maxY += deltaY;
            }

            if (gridX === targetX && gridY === targetY) {
                return true;
            }

            if (gridX < 0 || gridX >= width || gridY < 0 || gridY >= height) {
                return false;
            }

            if (solid[gridY * width + gridX]) {
                return false;
            }
        }

        return gridX === targetX && gridY === targetY;
    },

    /**
     * Rarity of the zone a world position sits in (0 .. map.maxRarity), or null
     * when the cell has no score or the room was started without a zoned map.
     */
    mapRarityAt: (x, y) => {
        const cell = state.mapDataAt(x, y);
        const maxRarity = state.mapData?.maxRarity;

        if (!cell || cell.score === undefined || !Number.isFinite(maxRarity)) {
            return null;
        }

        return Math.max(0, Math.min(tiers.length - 1, Math.round(cell.score * maxRarity)));
    },

    /**
     * A mob may only appear on a cell whose zone rarity is within one tier of its
     * own rarity. Unscored cells are let through, since there is no zone to
     * compare against.
     */
    isSpawnRarityAllowed: (position, rarity) => {
        const zoneRarity = state.mapRarityAt(position.x, position.y);

        return zoneRarity === null || Math.abs(zoneRarity - rarity) <= 1;
    },

    /** Pulls a rarity into the band its position allows: zoneRarity - 1 .. zoneRarity + 1. */
    clampRarityToZone: (position, rarity) => {
        const zoneRarity = state.mapRarityAt(position.x, position.y);

        if (zoneRarity === null) {
            return rarity;
        }

        const clamped = Math.max(zoneRarity - 1, Math.min(zoneRarity + 1, rarity));

        return Math.max(0, Math.min(tiers.length - 1, clamped));
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
                    size: c.body.size,
                    fov: c.camera?.fov ?? 1256
                });
            }
        });

        if (bodies.length === 0) {
            let spawn = state.mapBasedSpawn(ENTITY_TYPES.MOB);
            let zoneRarity = Number.isFinite(spawn.rarity)
                ? Math.max(0, Math.min(tiers.length - 1, spawn.rarity))
                : 0;
            let rarity = Math.max(0, zoneRarity - (Math.random() < .5 ? 1 : 0));
            let size = config.tiers?.[rarity]?.size ?? config.size ?? 20;
            let position = { x: spawn.x, y: spawn.y };

            // Try a few map points before relocating, so the spawn keeps its
            // original zone as often as possible.
            for (let k = 0; k < 20 && !state.isClearOfTerrain(position.x, position.y, size); k++) {
                spawn = state.mapBasedSpawn(ENTITY_TYPES.MOB);
                zoneRarity = Number.isFinite(spawn.rarity)
                    ? Math.max(0, Math.min(tiers.length - 1, spawn.rarity))
                    : 0;
                rarity = Math.max(0, zoneRarity - (Math.random() < .5 ? 1 : 0));
                size = config.tiers?.[rarity]?.size ?? config.size ?? 20;
                position = { x: spawn.x, y: spawn.y };
            }

            if (!state.isClearOfTerrain(position.x, position.y, size)) {
                const clear = state.findClearPosition(position.x, position.y, size);

                if (clear) {
                    position = clear;
                    rarity = state.clampRarityToZone(position, rarity);
                }
            }

            return {
                position: position,
                rarity: rarity,
                tile: state.mapDataAt(position.x, position.y)
            };
        }

        const body = bodies[Math.floor(Math.random() * bodies.length)];

        const halfView = body.fov / 1.85;
        const minDist = body.size * 2 + 48;

        let position,
            k = 0,
            isGood = false,
            rarity = 0;

        do {
            position = {
                x: body.x + (Math.random() - .5) * 2 * halfView,
                y: body.y + (Math.random() - .5) * 2 * halfView
            };

            const dx = body.x - position.x;
            const dy = body.y - position.y;

            if (dx * dx + dy * dy <= minDist * minDist || !state.isValidMapSpawn(position.x, position.y)) {
                continue;
            }

            // Rarity follows the target PLAYER's own cell (their zone), never the exact
            // spawn position: a spawn point inside the player's view can sit on an
            // unscored cell or just across a zone boundary, which previously let
            // higher-rarity mobs materialize in front of players camping a low area.
            const playerRarity = state.mapRarityAt(body.x, body.y)
                ?? (state.mapSpawnClosestTo(body.x, body.y)?.rarity ?? 0);

            // The position is rolled anywhere in the view, so it can land far outside
            // the player's zone. Taking the lower of the two stops high rarity mobs
            // from appearing in a low rarity area.
            const spawnRarity = state.mapRarityAt(position.x, position.y) ?? playerRarity;

            const baseRarity = Math.min(playerRarity, spawnRarity);

            const clamped = Math.max(0, Math.min(tiers.length - 1, Number.isFinite(baseRarity) ? baseRarity : 0));
            const low = Math.max(0, clamped - 1);
            rarity = low + Math.floor(Math.random() * (clamped - low + 1));

            // A roll that does not fit the zone it landed in is thrown away and the
            // loop picks another spot, so no mob ever appears more than one tier away
            // from the rarity of the area it spawns in.
            if (!state.isSpawnRarityAllowed(position, rarity)) {
                continue;
            }

            // Checking only the center cell is not enough: a large body can spawn
            // with half of it inside a wall and then never move.
            if (!state.isClearOfTerrain(position.x, position.y, config.tiers[rarity].size)) {
                continue;
            }

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
        } while (++k < 100);

        if (!isGood) {
            // Last resort: fall back to a map spawn point and adopt that cell's own
            // rarity, so the fallback cannot drop a mob into an area it does not fit.
            const fallback = state.mapBasedSpawn(ENTITY_TYPES.MOB);

            position = { x: fallback.x, y: fallback.y };

            rarity = Number.isFinite(fallback.rarity)
                ? Math.max(0, Math.min(tiers.length - 1, fallback.rarity))
                : state.clampRarityToZone(position, rarity);

            const clear = state.findClearPosition(position.x, position.y, config.tiers?.[rarity]?.size ?? config.size ?? 20);

            if (clear) {
                position = clear;
                rarity = state.clampRarityToZone(position, rarity);
            }
        }

        return {
            position: position,
            rarity: rarity,
            tile: state.mapDataAt(position.x, position.y)
        };
    },

    /**
     * Bosses ignore zone rarity, so they need their own placement helper. It
     * still spawns in the selected player's view and rejects walls/occupied
     * space using the boss's much larger body.
     */
    /**
     * Spawns a boss in the zone whose rarity matches the boss's rarity exactly.
     * Returns null when the map has no matching zone (the boss cannot spawn
     * off-zone). When the room has no zoned map at all, falls back to the old
     * spawn helper.
     */
    spawnBossInZone: (config, rarity) => {
        if (!state.mapData?.cells?.length) {
            return state.spawnBossNearPlayer(config, rarity);
        }

        const bossSize = (config.tiers?.[rarity]?.size ?? config.size ?? 20) * BOSS_SIZE_MULTIPLIER;
        const matching = (state.mapSpawns?.[ENTITY_TYPES.MOB] ?? [])
            .filter(spawn => spawn?.rarity === rarity);

        if (matching.length === 0) {
            return null;
        }

        for (let k = 0; k < 100; k++) {
            const cell = matching[Math.floor(Math.random() * matching.length)];
            const position = { x: cell.x * state.width, y: cell.y * state.height };

            if (!state.isValidMapSpawn(position.x, position.y)) continue;

            if (!state.isClearOfTerrain(position.x, position.y, bossSize)) continue;

            const occupied = state.spatialHash.retrieve({
                _AABB: {
                    x1: position.x - bossSize,
                    y1: position.y - bossSize,
                    x2: position.x + bossSize,
                    y2: position.y + bossSize
                }
            });

            if (occupied.size === 0) {
                return position;
            }
        }

        // Low-rarity edge zones can be too narrow for a boss at every spawn
        // point. Move a zone point to the nearest clear spot instead of losing
        // the boss event, as long as it stays in a compatible zone.
        for (let k = 0; k < 20; k++) {
            const cell = matching[Math.floor(Math.random() * matching.length)];
            const position = state.findClearPosition(cell.x * state.width, cell.y * state.height, bossSize);

            if (!position ||
                !state.isSpawnRarityAllowed(position, rarity) ||
                !state.isValidMapSpawn(position.x, position.y)) {
                continue;
            }

            const occupied = state.spatialHash.retrieve({
                _AABB: {
                    x1: position.x - bossSize,
                    y1: position.y - bossSize,
                    x2: position.x + bossSize,
                    y2: position.y + bossSize
                }
            });

            if (occupied.size === 0) {
                return position;
            }
        }

        return null;
    },

    spawnBossNearPlayer: (config, rarity) => {
        const bossSize = (config.tiers?.[rarity]?.size ?? config.size ?? 20) * BOSS_SIZE_MULTIPLIER;
        const bodies = [];

        state.clients.forEach(c => {
            if (c.body) {
                bodies.push({
                    x: c.body.x,
                    y: c.body.y,
                    size: c.body.size,
                    fov: c.camera?.fov ?? 1256
                });
            }
        });

        if (bodies.length === 0) {
            const spawn = state.mapBasedSpawn(ENTITY_TYPES.MOB);
            return state.findClearPosition(spawn.x, spawn.y, bossSize) ?? { x: spawn.x, y: spawn.y };
        }

        const body = bodies[Math.floor(Math.random() * bodies.length)];
        const halfView = body.fov / 1.85;
        const minDist = body.size * 2 + bossSize + 48;
        // A boss larger than the room cannot fit; keep at least its center inside
        // so it never ends up in the void where no player can reach it.
        const maxX = Math.max(0, state.width / 2 - bossSize);
        const maxY = Math.max(0, state.height / 2 - bossSize);

        for (let k = 0; k < 100; k++) {
            const position = {
                x: body.x + (Math.random() - .5) * 2 * halfView,
                y: body.y + (Math.random() - .5) * 2 * halfView
            };
            const dx = body.x - position.x;
            const dy = body.y - position.y;

            if (
                Math.abs(position.x) > maxX ||
                Math.abs(position.y) > maxY ||
                dx * dx + dy * dy <= minDist * minDist ||
                !state.isValidMapSpawn(position.x, position.y) ||
                !state.isClearOfTerrain(position.x, position.y, bossSize)
            ) {
                continue;
            }

            const occupied = state.spatialHash.retrieve({
                _AABB: {
                    x1: position.x - bossSize,
                    y1: position.y - bossSize,
                    x2: position.x + bossSize,
                    y2: position.y + bossSize
                }
            });

            if (occupied.size === 0) {
                return position;
            }
        }

        const fallback = {
            x: Math.max(-maxX, Math.min(maxX, body.x + (Math.random() - .5) * 2 * halfView)),
            y: Math.max(-maxY, Math.min(maxY, body.y + (Math.random() - .5) * 2 * halfView))
        };

        return state.findClearPosition(fallback.x, fallback.y, bossSize) ?? fallback;
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

        const size = config.tiers?.[rarity]?.size ?? config.size ?? 20;
        const clear = state.findClearPosition(x, y, size);

        return {
            position: clear ?? { x, y },
            rarity: rarity
        };
    },

    spatialHash: new SpatialHashGrid(),
    viewsSpatialHash: new SpatialHashGrid(),
    terrainSpatialHash: new SpatialHashGrid(),

    /** @type {Map<number, {x:number,y:number,type?:number,score?:number}>|null} */
    mapCellLookup: null,

    /**
     * Flat row-major grid of wall cells (1 = solid, 0 = walkable), derived from
     * mapCellLookup when a map loads. Used for cheap line-of-sight checks.
     * @type {Uint8Array|null}
     */
    mapSolid: null,

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
        worldMs: 0,
        bytesOut: 0,

        ticks: 0,
        totalTime: 0,
        worldTicks: 0,
        worldTime: 0
    },

    updateTerrain: () => {
        state.terrainSpatialHash.clear();
        SpatialHashGrid.configure(state.width, state.height);
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

        writer.setUint32(state.terrainGridWidth);
        writer.setUint32(state.terrainGridHeight);

        writer.setUint32(state.terrain.size);
        state.terrain.forEach(terrain => {
            writer.setInt32(terrain.gridX);
            writer.setInt32(terrain.gridY);
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
