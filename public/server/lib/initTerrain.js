import { BIOME_TYPES, ENTITY_TYPES, SIDE_FLAGS } from "../../lib/protocol.js";
import { Terrain } from "./Entity.js";
import state from "./state.js";
import { isHalloween } from "../../lib/util.js";
import MazeGenerator from "./MazeGenerator.js";
import Pathfinder from "./Pathfinder.js";

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

    const generator = {
        width: map.width,
        height: map.height,
        mobSpawners: map.mobSpawners,
        maxRarity: map.maxRarity,
        cells: map.cells,
        get: (x, y) => map.cells.filter((cell)=>{
            if (cell.x == x && cell.y == y) return true
        })[0]
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
                    y: (j - state.terrainGridWidth / 2 + .5) * size * 2
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