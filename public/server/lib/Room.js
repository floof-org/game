import state, { createRoomState, setActiveRoomState } from "./state.js";
export const ROOM_COUNT = +(globalThis?.process?.env?.ROOM_COUNT ?? (typeof Bun !== "undefined" ? Bun.env.ROOM_COUNT : null) ?? 4);
export const ROOM_CAPACITY = 35;

export class GameRoom {
    constructor(index) {
        this.index = index;
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

    static hooks = null;

    static create(count = ROOM_COUNT) {
        RoomManager.rooms = [];
        for (let i = 0; i < count; i++) {
            RoomManager.rooms.push(new GameRoom(i));
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
        let best = RoomManager.rooms[0];

        for (const room of RoomManager.rooms) {
            if (room.clientCount < best.clientCount) {
                best = room;
            }
        }

        return best;
    }

    static assignToRoom(numericID, room) {
        RoomManager.clientRoom.set(numericID, room);
        return room;
    }

    static roomOf(numericID) {
        return RoomManager.clientRoom.get(numericID) ?? null;
    }

    static activateFor(numericID) {
        const room = RoomManager.clientRoom.get(numericID);
        if (room) room.activate();
        return room ?? null;
    }

    static release(numericID) {
        RoomManager.clientRoom.delete(numericID);
    }

    static forEachRoom(fn) {
        for (const room of RoomManager.rooms) {
            room.activate();
            fn(room);
        }
    }
}

export default RoomManager;