import { BIOME_BACKGROUNDS, BIOME_TYPES, GAMEMODES, loadTerrains, Reader } from "../../lib/protocol.js";
import Client from "./Client.js";
import { mobConfigs, mobIDOf } from "./config.js";
import initTerrain from "./initTerrain.js";
import state from "./state.js";
import RoomManager from "./Room.js";

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
            [mobIDOf("Moth")]: 3,
            [mobIDOf("Desert Centipede")]: 3,
            [mobIDOf("Fire Burrow")]: 1,
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
    static hooks = null;

    static isSandbox = globalThis.environmentName !== "node" && globalThis.environmentName !== "bun" && (typeof location !== "undefined" ? location.hostname !== "localhost" : false);

    static u16ToU8 = n => [n & 0xFF, n >> 8];
    static u8ToU16 = (u8, o = 0) => u8[o] | u8[o + 1] << 8;
    static getText = (u8, o, l) => Router.decoder.decode(u8.slice(o, o + l));
    static setText = t => Router.encoder.encode(t);

    addClient(numericID, uuid, isAdmin) {
        let kick = false;
        if (!isAdmin) {
            outer: for (const room of RoomManager.rooms) {
                for (const client of room.roomState.clients.values()) {
                    if (client.uuid === uuid) {
                        kick = "DAR-7";
                        break outer;
                    }
                }
            }
        }

        const pendingDisconnect = Client.disconnects.get(uuid);
        const room = (pendingDisconnect && RoomManager.rooms.includes(pendingDisconnect.room))
            ? pendingDisconnect.room
            : RoomManager.findRoomForNewClient();

        room.activate();

        const client = new Client(numericID, uuid, isAdmin);

        if (room.isFull) {
            client.kick("Lobby is full, create another one");
            return null;
        } else if (kick !== false) {
            client.kick(kick);
            return null;
        }

        RoomManager.assignToRoom(numericID, room);

        return client;
    }

    pipeMessage(numericID, dataView) {
        const room = RoomManager.activateFor(numericID);
        if (!room) return;

        const client = state.clients.get(numericID);
        if (!client) return;
        client.onMessage(new Reader(dataView, 0, true));
    }

    removeClient(numericID) {
        const room = RoomManager.activateFor(numericID);
        if (!room) return;

        const client = state.clients.get(numericID);

        if (client) {
            client.onClose();
        }

        RoomManager.release(numericID);
    }

    /**
     * Sets the hooks (game/drops/world/lag loop bodies, moved out of
     * index.js) that every room will run independently once it's set up.
     * Must be called before begin().
     */
    static setHooks(hooks) {
        Router.hooks = hooks;
    }

    async begin(message) {
        await loadTerrains();

        RoomManager.create();

        await RoomManager.beginAll(message, (m, room) => this.beginRoom(m, room), Router.hooks);

        console.log(`Started ${RoomManager.rooms.length} room(s): ${RoomManager.rooms.map(r => r.name).join(", ")}`);
    }

    async beginRoom(message, room) {
        applyBiome(room.biome);

        if (Router.isSandbox && room.gamemode === "maze") {
            room.gamemode = "ffa";
            console.warn("Maze is not supported in sandbox");
        }

        switch (room.gamemode) {
            case "maze":
                state.isTDM = true;
                state.width = state.height = 32 * (256 + 64 + 64);
                state.gamemode = GAMEMODES.MAZE;
                state.mobsExpire = true;
                state.teamCount = 0;
                state.announceRarity = 10;

                // setTimeout(() => {
                //     state.clients.forEach(c => c.systemMessage("Lobby will be closing in 5 minutes...", "#FF0000"));

                //     setTimeout(() => {
                //         state.clients.forEach(c => c.systemMessage("Lobby will be closing in 1 minute...", "#FF0000"));

                //         setTimeout(() => {
                //             state.clients.forEach(c => c.systemMessage("Lobby is closing...", "#FF0000"));
                //             state.clients.forEach(c => c.kick("Lobby Closed"));

                //             setTimeout(() => process.exit(), 1E3);
                //         }, 60000);
                //     }, 240000);
                // }, 1000 * 60 * 60 * 8);

                await initTerrain(state.biome);
                break;
            case "ffa":
                state.isTDM = false;
                state.isRadial = true;
                state.maxMobs = 0;
                state.gamemode = GAMEMODES.FFA;
                break;
            case "mmo":
                state.isTDM = false;
                state.gamemode = GAMEMODES.MMO;
                state.biome = BIOME_TYPES.CRYPT;
                state.mobsExpire = true;
                await initTerrain(state.biome);
                break;
            case "tdm":
                state.isTDM = true;
                state.teamCount = 0;
                state.isRadial = true;
                state.width = state.height = 1024;
                state.maxMobs = 0;
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
            `Room "${room.name}" created:`,
            "  - Gamemode: " + room.gamemode,
            "  - Biome: " + BIOME_BACKGROUNDS[room.biome].name,
            "  - Modded: " + (message[2] ? "Yes" : "No"),
            "  - Admin UUID: " + state.secretKey,
            "  - Spawn Table: " + (state.mobTable ? mobTableIntoChances(state.mobTable) : "None")
        ].join("\n"));
    }

    postMessage(message) {}
}