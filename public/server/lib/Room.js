import { GAMEMODES } from "../../lib/protocol.js";
import state, { createRoomState, getActiveRoomState, setActiveRoomState } from "./state.js";
import { ROOM_TYPES } from "./roomTypes.js";

export const ROOM_CAPACITY = 35;

export class GameRoom {
    constructor(index, name, definition) {
        this.index = index;
        this.name = name;
        this.biome = definition.biome;
        this.gamemode = definition.gamemode;
        this.roomState = createRoomState();
        this.intervals = [];
    }

    activate() {
        setActiveRoomState(this.roomState);
        return this;
    }

    get clientCount() {
        return this.roomState.clients.size;
    }

    get isFull() {
        return this.clientCount >= ROOM_CAPACITY;
    }
    startLoops(hooks) {
        this.intervals.push(setInterval(() => {
            this.activate();
            hooks.tick();
        }, 1000 / 22.5));

        this.intervals.push(setInterval(() => {
            this.activate();
            hooks.lag();
        }, 1000));

        this.intervals.push(setInterval(() => {
            this.activate();
            hooks.drops();
        }, 256));

        this.intervals.push(setInterval(() => {
            this.activate();
            hooks.world();
        }, 1000 / 25));
    }
}

export class RoomManager {
    /** @type {GameRoom[]} */
    static rooms = [];

    /** @type {Map<number, GameRoom>} */
    static clientRoom = new Map();

    /**
     * @type {Map<number, GameRoom>}
     */
    static previousRoom = new Map();

    static hooks = null;

    static waveRoomSeq = 0;

    /**
     * @param {GameRoom} parentRoom
     * @returns {GameRoom}
     */
    static createWaveRoom(parentRoom) {
        RoomManager.waveRoomSeq++;
        const name = `${parentRoom.name}-waves-${RoomManager.waveRoomSeq}`;

        const room = new GameRoom(RoomManager.rooms.length, name, {
            biome: parentRoom.biome,
            gamemode: "waves"
        });
        room.parentRoomName = parentRoom.name;

        RoomManager.rooms.push(room);

        const previousRoomState = getActiveRoomState();
        room.activate();

        state.isTDM = true;
        state.teamCount = 0;
        state.isWaves = true;
        state.isRadial = true;
        state.gamemode = GAMEMODES.WAVES;
        state.maxMobs = 0;
        state.biome = parentRoom.biome;
        state.mobTable = parentRoom.roomState.mobTable;
        state.announceRarity = parentRoom.roomState.announceRarity;
        state.secretKey = parentRoom.roomState.secretKey;

        if (RoomManager.hooks) {
            room.startLoops(RoomManager.hooks);
        }

        setActiveRoomState(previousRoomState);

        console.log(`Room "${room.name}" created: waves sub-room of "${parentRoom.name}"`);

        return room;
    }

    static create() {
        RoomManager.rooms = [];

        let i = 0;
        for (const name in ROOM_TYPES) {
            RoomManager.rooms.push(new GameRoom(i, name, ROOM_TYPES[name]));
            i++;
        }

        return RoomManager.rooms;
    }

    /**
     * @param {(message: any) => Promise<void>} beginFn
     * @param {{tick, lag, drops, world}} hooks
     */
    static async beginAll(message, beginFn, hooks) {
        RoomManager.hooks = hooks;

        for (const room of RoomManager.rooms) {
            room.activate();
            await beginFn(message, room);
            room.startLoops(hooks);
        }
    }

    static findRoomForNewClient() {
        return RoomManager.findByName("main-garden") ?? RoomManager.rooms[0] ?? null;
    }

    static assignToRoom(numericID, room) {
        RoomManager.clientRoom.set(numericID, room);
        return room;
    }

    static roomOf(numericID) {
        return RoomManager.clientRoom.get(numericID) ?? null;
    }

    /**
     * @param {string} input
     * @returns {GameRoom|null}
     */
    static findByName(input) {
        const trimmed = String(input ?? "").trim();
        if (!trimmed) return null;

        const lower = trimmed.toLowerCase();
        const byName = RoomManager.rooms.find(room => room.name.toLowerCase() === lower);
        if (byName) return byName;

        const asNumber = Number(trimmed);
        if (Number.isInteger(asNumber)) {
            return RoomManager.rooms[asNumber - 1] ?? null;
        }

        return null;
    }

    static activateFor(numericID) {
        const room = RoomManager.clientRoom.get(numericID);
        if (room) room.activate();
        return room ?? null;
    }

    static release(numericID) {
        RoomManager.clientRoom.delete(numericID);
        RoomManager.previousRoom.delete(numericID);
    }

    static forEachRoom(fn) {
        for (const room of RoomManager.rooms) {
            room.activate();
            fn(room);
        }
    }

    /**
     * @param {import("./Client.js").default} client
     * @param {GameRoom} toRoom
     * @returns {boolean} whether the move happened
     */
    static moveClient(client, toRoom) {
        const fromRoom = RoomManager.clientRoom.get(client.id);

        if (!fromRoom || !toRoom) return false;
        if (fromRoom === toRoom) {
            client.systemMessage(`You're already in "${toRoom.name}".`, "#CACA22");
            return false;
        }

        if (toRoom.isFull) {
            client.systemMessage(`Room "${toRoom.name}" is full.`, "#CACA22");
            return false;
        }

        const hadBody = Boolean(client.body) && !client.body.health.isDead;

        fromRoom.activate();
        client.body?.destroy({ transferringRoom: true });
        client.body = null;
        state.alivePlayers = state.alivePlayers.filter(m => m.id !== client.id);
        state.playerCount = Math.max(0, state.playerCount - 1);
        state.clients.delete(client.id);

        RoomManager.previousRoom.set(client.id, fromRoom);

        toRoom.activate();
        RoomManager.clientRoom.set(client.id, toRoom);
        state.clients.set(client.id, client);
        state.playerCount++;

        client.team = false;
        if (state.isTDM) {
            client.team = 0;
            if (state.teamCount > 0) {
                client.team = ((client.id - 1) % state.teamCount) + 1;
            }
        }

        if (hadBody) {
            client.spawn();
        }

        client.sendRoom();
        state.sendTerrain(client.id);
        client.systemMessage(`Joined room "${toRoom.name}".`, "#7EEF6D");

        return true;
    }
}

export default RoomManager;