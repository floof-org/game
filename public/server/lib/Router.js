import { BIOME_BACKGROUNDS, BIOME_TYPES, GAMEMODES, loadTerrains, Reader } from "../../lib/protocol.js";
import Client from "./Client.js";
import { mobConfigs, mobIDOf } from "./config.js";
import initTerrain from "./initTerrain.js";
import state from "./state.js";

globalThis.environmentName ??= "browser";

// Setup shit
function createTable(numTable) {
    const table = [];

    for (const id in numTable) {
        for (let i = 0; i < numTable[id]; i++) {
            table.push(+id);
        }
    }

    return table;
}

function mobTableIntoChances(table) {
    const output = {};

    for (const chance of table) {
        output[chance] = (output[chance] || 0) + 1;
    }

    const chances = [];

    for (const id in output) {
        chances.push({
            id: id,
            chance: output[id] / table.length
        });
    }

    // Highest to lowest, sort as name: chance%
    chances.sort((a, b) => b.chance - a.chance);

    return chances.map(e => mobConfigs[e.id].name + ": " + (e.chance * 100).toFixed(2) + "%").join(", ");
}

function applyBiome(int) {
    if (BIOME_BACKGROUNDS[int] == null) {
        throw new Error("Invalid biome");
    }

    state.biome = int;

    const mobTable = {
        [BIOME_TYPES.GARDEN]: createTable({
            [mobIDOf("Ladybug")]: 5,
            [mobIDOf("Bee")]: 5,
            [mobIDOf("Bumblebee")]: 2,
            [mobIDOf("Rock")]: 4,
            [mobIDOf("Hornet")]: 6,
            [mobIDOf("Baby Ant")]: 3,
            [mobIDOf("Ant Egg")]: 1,
            [mobIDOf("Worker Ant")]: 4,
            [mobIDOf("Soldier Ant")]: 5,
            [mobIDOf("Spider")]: 4,
            [mobIDOf("Leafbug")]: 3,
            [mobIDOf("Centipede")]: 2,
            [mobIDOf("Ant Hole")]: 1,
            [mobIDOf("Dandelion")]: 2
        }),
        [BIOME_TYPES.DESERT]: createTable({
            [mobIDOf("Shiny Ladybug")]: 1,
            [mobIDOf("Sandstorm")]: 3,
            [mobIDOf("Scorpion")]: 6,
            [mobIDOf("Beetle")]: 6,
            [mobIDOf("Fire Ant Egg")]: 1,
            [mobIDOf("Baby Fire Ant")]: 2,
            [mobIDOf("Worker Fire Ant")]: 3,
            [mobIDOf("Soldier Fire Ant")]: 4,
            [mobIDOf("Pupa")]: 3,
            [mobIDOf("Moth")]: 3,
            [mobIDOf("Desert Centipede")]: 3,
            [mobIDOf("Fire Ant Hole")]: 1,
            [mobIDOf("Cactus")]: 4
        }),
        [BIOME_TYPES.OCEAN]: createTable({
            [mobIDOf("Jellyfish")]: 5,
            [mobIDOf("Sponge")]: 5,
            [mobIDOf("Bubble")]: 4,
            [mobIDOf("Shell")]: 4,
            [mobIDOf("Starfish")]: 3,
            [mobIDOf("Leech")]: 3,
            [mobIDOf("Crab")]: 2.5
        }),
        [BIOME_TYPES.SEWERS]: createTable({
            [mobIDOf("Fly")]: 5,
            [mobIDOf("Moth")]: 4,
            [mobIDOf("Firefly")]: 4,
            [mobIDOf("Maggot")]: 3,
            [mobIDOf("Roach")]: 3,
            [mobIDOf("Spider")]: 3,
            [mobIDOf("Rock")]: 2,
            [mobIDOf("Evil Ladybug")]: 2,
            [mobIDOf("Evil Centipede")]: 1
        }),
        [BIOME_TYPES.ANT_HELL]: createTable({
            [mobIDOf("Baby Ant")]: 5,
            [mobIDOf("Worker Ant")]: 5,
            [mobIDOf("Soldier Ant")]: 5,
            [mobIDOf("Queen Ant")]: 1,
            [mobIDOf("Ant Egg")]: 2,
            [mobIDOf("Baby Fire Ant")]: 5,
            [mobIDOf("Worker Fire Ant")]: 5,
            [mobIDOf("Soldier Fire Ant")]: 5,
            [mobIDOf("Queen Fire Ant")]: 1,
            [mobIDOf("Fire Ant Egg")]: 2,
            [mobIDOf("Baby Termite")]: 5,
            [mobIDOf("Worker Termite")]: 5,
            [mobIDOf("Soldier Termite")]: 5,
            [mobIDOf("Termite Overmind")]: 1,
            [mobIDOf("Termite Egg")]: 2
        }),
        [BIOME_TYPES.HELL]: createTable({
            [mobIDOf("Hell Beetle")]: 25,
            [mobIDOf("Hell Spider")]: 25,
            [mobIDOf("Hell Yellowjacket")]: 20,
            [mobIDOf("Hell Centipede")]: 5,
            [mobIDOf("Demon")]: 2,
            [mobIDOf("Angelic Ladybug")]: 1
        }),
        [BIOME_TYPES.HALLOWEEN]: createTable({
            [mobIDOf("Hell Beetle")]: 5,
            [mobIDOf("Hell Spider")]: 5,
            [mobIDOf("Hell Yellowjacket")]: 5,
            [mobIDOf("Hell Centipede")]: 5,
            [mobIDOf("Spider")]: 5,
            [mobIDOf("Pumpkin")]: 5,
            [mobIDOf("Jack O' Lantern")]: 5,
            [mobIDOf("Spirit")]: 4,
            [mobIDOf("Wilt")]: 3,
            [mobIDOf("Demon")]: 2,
            [mobIDOf("Termite Mound")]: 1
        }),
        [BIOME_TYPES.DARK_FOREST]: createTable({
            [mobIDOf("Evil Centipede")]: 2,
            [mobIDOf("Evil Ladybug")]: 12.5,
            [mobIDOf("Termite Mound")]: 2,
            [mobIDOf("Soldier Termite")]: 16,
            [mobIDOf("Worker Termite")]: 8,
            [mobIDOf("Baby Termite")]: 8,
            [mobIDOf("Termite Egg")]: 1,
            [mobIDOf("Termite Overmind")]: 1,
            [mobIDOf("Wasp")]: 32.5,
            [mobIDOf("Spider")]: 25,
            [mobIDOf("Fly")]: 12.5,
            [mobIDOf("Stickbug")]: 8,
            [mobIDOf("Shrub")]: 15
        }),
    }[int];

    if (mobTable) {
        if (mobTable.some(e => e < 0)) {
            throw new Error("Invalid mob table for " + BIOME_BACKGROUNDS[int].name);
        }

        state.mobTable = mobTable;
    }
}

export default class Router {
    static encoder = new TextEncoder();
    static decoder = new TextDecoder();

    static isSandbox = globalThis.environmentName !== "node" && globalThis.environmentName !== "bun" && (typeof location !== "undefined" ? location.hostname !== "localhost" : false);

    static u16ToU8 = n => [n & 0xFF, n >> 8];
    static u8ToU16 = (u8, o = 0) => u8[o] | u8[o + 1] << 8;
    static getText = (u8, o, l) => Router.decoder.decode(u8.slice(o, o + l));
    static setText = t => Router.encoder.encode(t);

    addClient(numericID, uuid, isAdmin) {
        let kick = false;
        if (!isAdmin) {
            for (const client of state.clients.values()) {
                if (client.uuid === uuid) {
                    kick = "DAR-7";
                    break;
                }
            }
        }

        const client = new Client(numericID, uuid, isAdmin);

        if (state.clients.size > 35) {
            client.kick("Lobby is full, create another one");
            return null;
        } else if (kick !== false) {
            client.kick(kick);
            return null;
        }

        return client;
    }

    pipeMessage(numericID, dataView) {
        const client = state.clients.get(numericID);
        if (!client) return;
        client.onMessage(new Reader(dataView, 0, true));
    }

    removeClient(numericID) {
        const client = state.clients.get(numericID);

        if (client) {
            client.onClose();
        }
    }

    async begin(message) {
        await loadTerrains();

        applyBiome(message[4]);

        if (Router.isSandbox && message[1] === "maze") {
            message[1] = "ffa";
            console.warn("Maze is not supported in sandbox");
        }

        switch (message[1]) {
            case "maze":
                state.isTDM = true;
                state.width = state.height = 32 * (256 + 64 + 64);
                state.gamemode = GAMEMODES.MAZE;
                state.mobsExpire = true;
                state.teamCount = 0;
                state.announceRarity = 8;
                await initTerrain(state.biome);
                break;
            case "ffa":
                state.isTDM = false;
                state.gamemode = GAMEMODES.FFA;
                break;
            case "mmo":
                state.isTDM = false;
                state.gamemode = GAMEMODES.MMO;
                state.biome = BIOME_TYPES.CRYPT;
                break;
            case "tdm":
                state.isTDM = true;
                state.gamemode = GAMEMODES.TDM;
                break;
            case "waves":
                state.isTDM = true;
                state.teamCount = 0;
                state.isWaves = true;
                state.isRadial = true;
                state.gamemode = GAMEMODES.WAVES;
                break;
            case "line":
                state.isTDM = true;
                state.teamCount = 0;
                state.isLineMap = true;
                state.gamemode = GAMEMODES.LINE;
                state.mobsExpire = true;
                break;
            default:
                throw new Error("Invalid gamemode");
        }

        state.secretKey = message[3];

        console.log([
            "Lobby Created:",
            "  - Gamemode: " + message[1],
            "  - Biome: " + BIOME_BACKGROUNDS[message[4]].name,
            "  - Modded: " + (message[2] ? "Yes" : "No"),
            "  - Admin UUID: " + state.secretKey,
            "  - Spawn Table: " + (state.mobTable ? mobTableIntoChances(state.mobTable) : "None")
        ].join("\n"));
    }

    postMessage(message) {}
}
