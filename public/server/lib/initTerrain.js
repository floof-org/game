import { BIOME_TYPES, ENTITY_TYPES, SIDE_FLAGS, SPAWN_TYPES } from "../../lib/protocol.js";
import { Terrain } from "./Entity.js";
import state from "./state.js";
import { isHalloween } from "../../lib/util.js";
import MazeGenerator from "./MazeGenerator.js";
import Pathfinder from "./Pathfinder.js";
import { initTutorialLoop } from "./gridTutorial.js";

const MAP_TYPES = {
    standard: "/server/maps/standard.json",
    antHell: "/server/maps/antHell.json",
    desert: "/server/maps/desert.json",
    pvp: "/server/maps/pvp.json",
    ocean: "/server/maps/ocean.json",
    hell: "/server/maps/hell.json",
    sewers: "/server/maps/sewers.json",
    darkForest: "/server/maps/darkForest.json",
    allMobs: "/server/maps/allMobs.json",
    sleepyMaze: "/server/maps/sleepyMaze.json",
    sleepyMazeOmega: "/server/maps/sleepyMazeOmega.json",
    crypt: "/server/maps/crypt_map.json"
};

let mapSrc = MAP_TYPES.standard,
    map = [];

export default async function initTerrain(type) {
    if ((isHalloween && type === BIOME_TYPES.HALLOWEEN) || Math.random() > 1) { // temp disable for now
        map = generateRandomMap(56, 56, false);
    } else {
        switch (type) {
            case BIOME_TYPES.DEFAULT:
                mapSrc = MAP_TYPES.sleepyMazeOmega;
                break;
            case BIOME_TYPES.GARDEN:
                mapSrc = MAP_TYPES.sleepyMaze;
                break;
            case BIOME_TYPES.DESERT:
                mapSrc = MAP_TYPES.desert;
                break;
            case BIOME_TYPES.OCEAN:
                mapSrc = MAP_TYPES.ocean;
                break;
            case BIOME_TYPES.ANT_HELL:
                mapSrc = MAP_TYPES.antHell;
                break;
            case BIOME_TYPES.HELL:
                mapSrc = MAP_TYPES.hell;
                break;
            case BIOME_TYPES.SEWERS:
                mapSrc = MAP_TYPES.sewers;
                break;
            case BIOME_TYPES.DARK_FOREST:
                mapSrc = MAP_TYPES.darkForest;
                break;
            case BIOME_TYPES.CRYPT:
                mapSrc = MAP_TYPES.crypt;
                break;
            default:
                throw new Error("Invalid biome type");
        }

        if (typeof mapSrc === "string") {
            const response = await fetch(mapSrc);
            map = await response.json();
        } else {
            map = mapSrc;
        }
    }

    if (state.isBiomeGrid) {
        // Generate a grid pattern
        map.maxRarity = 11;
        map.height = 24 + 16 + 24 * (map.maxRarity - 1) / 2;
        map.width = 24 + 16 + 24 * (map.maxRarity - 1) / 2;
        const mapStartHeight = map.height / 2 - 32;
        state.height = map.height * 192;
        state.width = map.width * 192;
        map.cells = [];

        state.mapConstants = {
            biomeTransition: 12 * 192,
            tpThreshold: 31 * 192,
        };

        for (let y = -mapStartHeight; y < map.height - mapStartHeight; y++) {
            for (let x = -24; x < map.width - 24; x++) {
                const cell = {x: x + 24, y: y + mapStartHeight, type: 0};
                if (x < 0 || y <= -1 || y >= 64) { // Walls for out-of-bounds
                    cell.type = 0;
                } else if ((x === 0 || x === 1) && (y % 24 === 7 || y % 24 === 8)) { // Player spawns next to left wall
                    cell.type = 1;
                    cell.score = 0;
                } else if (
                    (x % 24 < 16 && y % 24 < 16) // Grid squares
                    || (x % 24 <= 9 && x % 24 >= 6) // Vertical halls
                    || (y % 24 <= 9 && y % 24 >= 6) // Horizontal halls
                ) {
                    const rarity = Math.max(0.001, Math.min(map.maxRarity, (x - 1.5) / 12))
                    cell.type = 3;
                    cell.score = rarity / map.maxRarity;

                    if ((x % 24 === 20 || x % 24 === 21) && (y % 24 === 7 || y % 24 === 8)) { // Hallway checkpoints
                        cell.type = 2;
                    }

                    if (y < 20) {
                        cell.spawn = SPAWN_TYPES.GARDEN;
                    } else if (y < 44) {
                        cell.spawn = SPAWN_TYPES.OCEAN;
                    } else {
                        cell.spawn = SPAWN_TYPES.DESERT;
                    }
                }
                map.cells.push(cell);
            }
        }

        // Pixel art is stored as columns of non-wall pixels.
        // Each entry has the following format: [x, starty, endy], with both y-bounds being inclusive.
        const gardenIconData = [
            [5, 13, 13],
            [6, 13, 13],
            [7, 7, 10],
            [7, 12, 12],
            [8, 6, 11],
            [9, 5, 12],
            [10, 4, 12],
            [11, 4, 12],
            [12, 3, 12],
            [13, 3, 11],
            [14, 3, 10],
            [15, 2, 9],
            [16, 2, 7],
            [17, 2, 4],
        ];

        const oceanIconData = [
            [7, 32, 36],
            [8, 31, 37],
            [9, 29, 38],
            [10, 27, 38],
            [11, 25, 38],
            [12, 27, 38],
            [13, 29, 38],
            [14, 31, 37],
            [15, 32, 36],
        ];

        const desertIconData = [
            [4, 57, 58],
            [5, 52, 53],
            [5, 55, 59],
            [6, 51, 52],
            [6, 57, 58],
            [7, 51, 52],
            [8, 51, 52],
            [9, 51, 53],
            [10, 51, 53],
            [11, 51, 54],
            [12, 52, 55],
            [13, 52, 56],
            [14, 52, 57],
            [15, 53, 58],
            [16, 53, 59],
            [17, 54, 60],
            [18, 55, 59],
        ];

        for (let [x, starty, endy] of gardenIconData) {
            for (let y = starty; y <= endy; y++) {
                const cell = map.cells[x + map.width * (y + mapStartHeight)];
                cell.type = 3;
                cell.score = 7 / map.maxRarity; // Super: #2affa3
                cell.spawn = SPAWN_TYPES.NONE;
            }
        }

        for (let [x, starty, endy] of oceanIconData) {
            for (let y = starty; y <= endy; y++) {
                const cell = map.cells[x + map.width * (y + mapStartHeight)];
                cell.type = 3;
                cell.score = 2 / map.maxRarity; // Rare: #455fcf
                cell.spawn = SPAWN_TYPES.NONE;
            }
        }

        for (let [x, starty, endy] of desertIconData) {
            for (let y = starty; y <= endy; y++) {
                const cell = map.cells[x + map.width * (y + mapStartHeight)];
                cell.type = 3;
                cell.score = 3 / map.maxRarity; // Epic: #7633cb
                cell.spawn = SPAWN_TYPES.NONE;
            }
        }
        
        // Tutorials can start running AFTER the map is all set up
        initTutorialLoop();
    }

    globalThis._MAP_CELLS = map.cells;

    // O(1) lookup index over cells, built once at load. The JSON map format on disk
    // is unchanged; this only adds an in-memory structure derived from it.
    const cellLookup = new Map();

    for (let i = 0; i < map.cells.length; i++) {
        const c = map.cells[i];
        cellLookup.set(c.y * map.width + c.x, c);
    }

    state.mapCellLookup = cellLookup;

    const generator = {
        width: map.width,
        height: map.height,
        mobSpawners: map.mobSpawners,
        maxRarity: map.maxRarity,
        cells: map.cells,
        get: (x, y) => cellLookup.get(y * map.width + x) ?? null
    };

    state.terrainGridWidth = generator.width;
    state.terrainGridHeight = generator.height;

    const size = state.width / state.terrainGridWidth / 2;

    const spawns = {
        [ENTITY_TYPES.PLAYER]: [],
        [ENTITY_TYPES.MOB]: []
    };

    for (let i = 0; i < generator.width; i++) {
        for (let j = 0; j < generator.height; j++) {
            if (generator.get(i, j).type === 0) {
                let top = j <= 0 || generator.get(i, j - 1).type === 0,
                    right = i >= generator.width - 1 || generator.get(i + 1, j).type === 0,
                    bottom = j >= generator.height - 1 || generator.get(i, j + 1).type === 0,
                    left = i <= 0 || generator.get(i - 1, j).type === 0;

                let flags = 0;

                if (!top) {
                    flags |= SIDE_FLAGS.TOP;
                }

                if (!right) {
                    flags |= SIDE_FLAGS.RIGHT;
                }

                if (!bottom) {
                    flags |= SIDE_FLAGS.BOTTOM;
                }

                if (!left) {
                    flags |= SIDE_FLAGS.LEFT;
                }

                const object = new Terrain({
                    x: (i - state.terrainGridWidth / 2 + .5) * size * 2,
                    y: (j - state.terrainGridHeight / 2 + .5) * size * 2
                }, size, flags);

                object.gridX = i;
                object.gridY = j;
            } else {
                const spawn = {
                    x: (i / state.terrainGridWidth) - .5,
                    y: (j / state.terrainGridHeight) - .5,
                    rarity: Math.round(generator.get(i, j).score * generator.maxRarity)
                };

                spawns[ENTITY_TYPES[generator.get(i, j).type === 1 || generator.get(i, j).type === 2 ? "PLAYER" : "MOB"]].push(spawn);
                state.maxMapDistFromSpawn = Math.max(state.maxMapDistFromSpawn, spawn.dist);
            }
        }
    }

    state.mapSpawns = spawns;
    state.mapData = map;

    state.updateTerrain();
}

function generateRandomMap(width, height, enclose = false) {
    const maze = new MazeGenerator(width, height);
    maze.spacing = 4;
    maze.gridChance = 1;
    maze.toPlaceAmount = .425;
    maze.maxNeighbors = 4;
    maze.maxDiagonalNeighbors = 2;
    maze.removeSingles = true;
    maze.removeBlocks = false;

    maze.generate();

    if (enclose) {
        for (let i = 0; i < width; i++) {
            maze.set(i, 0, 1);
            maze.set(i, height - 1, 1);
        }

        for (let i = 0; i < height; i++) {
            maze.set(0, i, 1);
            maze.set(width - 1, i, 1);
        }
    }

    let spawnX = 0, spawnY = 0;

    do {
        spawnX = Math.floor(Math.random() * width);
        spawnY = Math.floor(Math.random() * height);
    } while (maze.get(spawnX, spawnY) !== 0);

    maze.set(spawnX, spawnY, 2);

    const finder = new Pathfinder(maze);
    let maxLength = 0;

    for (let x = 0; x < maze.width; x++) {
        for (let y = 0; y < maze.height; y++) {
            if (maze.get(x, y) === 0) {
                const path = finder.findPath(spawnX, spawnY, x, y);

                maze.set(x, y, path.length + 10);
                maxLength = Math.max(maxLength, path.length);
            }
        }
    }

    for (let x = 0; x < maze.width; x++) {
        for (let y = 0; y < maze.height; y++) {
            if (maze.get(x, y) > 10) {
                maze.set(x, y, Math.floor((maze.get(x, y) - 10) / maxLength * 9) + 3);
            }
        }
    }

    return maze.to2DArray();
}