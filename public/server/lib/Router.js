import { BIOME_BACKGROUNDS, BIOME_TYPES, GAMEMODES, loadTerrains, Reader } from "../../lib/protocol.js";
import Client from "./Client.js";
import { mobConfigs, mobIDOf } from "./config.js";
import initTerrain from "./initTerrain.js";
import state from "./state.js";
import RoomManager from "./Room.js";
import { Mob } from "./Entity.js";
import { ROOM_CENTER_PORTALS, ROOM_SIDE_PORTALS, ROOM_NPCS } from "./roomTypes.js";

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

        [BIOME_TYPES.DEFAULT]: createTable({
            [mobIDOf("Dark Ladybug")]: 1
        }),

        [BIOME_TYPES.GARDEN]: createTable({
            [mobIDOf("Ladybug")]: 36,
            [mobIDOf("Bee")]: 36,
            [mobIDOf("Hornet")]: 36,
            [mobIDOf("Rock")]: 36,
            [mobIDOf("Dandelion")]: 30,
            [mobIDOf("Bumblebee")]: 30,
            [mobIDOf("Centipede")]: 18,
            [mobIDOf("Ant Hole")]: 12,
            [mobIDOf("Hive")]: 12
        }),

        [BIOME_TYPES.DESERT]: createTable({
            [mobIDOf("Beetle")]: 60,
            [mobIDOf("Cactus")]: 60,
            [mobIDOf("Desert Centipede")]: 36,
            [mobIDOf("Scorpion")]: 36,
            [mobIDOf("Sandstorm")]: 36,
            [mobIDOf("Sandstone")]: 36,
            [mobIDOf("Flea")]: 36,
            [mobIDOf("Fire Burrow")]: 36,
            [mobIDOf("Shiny Ladybug")]: 1
        }),
        
        [BIOME_TYPES.OCEAN]: createTable({
            [mobIDOf("Crab")]: 48,
            [mobIDOf("Bubble")]: 48,
            [mobIDOf("Shell")]: 40,
            [mobIDOf("Jellyfish")]: 40,
            [mobIDOf("Leech")]: 36,
            [mobIDOf("Urchin")]: 36,
            [mobIDOf("Starfish")]: 36,
            [mobIDOf("Sponge")]: 36,
            [mobIDOf("Lily Pad")]: 18,
            [mobIDOf("Aquatic Ladybug")]: 1
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

        const portalName = ROOM_CENTER_PORTALS[room.name];
        if (portalName) {
            const portalIndex = mobIDOf(portalName);
            const portalConfig = mobConfigs[portalIndex];

            if (portalConfig) {
                const portal = new Mob({ x: 0, y: 0 });
                portal.define(portalConfig, 0);
                portal.team = 0;
            }
        }

        const sidePortals = ROOM_SIDE_PORTALS[room.name];
        if (sidePortals) {
            const edgeX = state.width / 2;

            for (const side of ["left", "right"]) {
                const target = sidePortals[side];
                if (!target) continue;

                const portalIndex = mobIDOf(target.portal);
                const portalConfig = mobConfigs[portalIndex];
                if (!portalConfig) continue;

                const sidePortal = new Mob({
                    x: side === "left" ? -edgeX : edgeX,
                    y: 0
                });
                sidePortal.define(portalConfig, 0);
                sidePortal.team = 0;
                sidePortal.sideTargetRoomName = target.room;
            }
        }

        const npcs = ROOM_NPCS[room.name];
        if (npcs) {
            for (const npc of npcs) {
                const npcIndex = mobIDOf(npc.name);
                const npcConfig = mobConfigs[npcIndex];
                if (!npcConfig) continue;

                const mob = new Mob({ x: npc.x, y: npc.y });
                mob.define(npcConfig, 0);
                mob.team = 0;
                state.aliveMobs.push(mob);
            }
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