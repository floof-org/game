import state from "./lib/state.js";
import { BIOME_TYPES, CLIENT_BOUND, Drawing, encodeEverything, ENTITY_TYPES, GAMEMODES, PetalTier, ROUTER_PACKET_TYPES } from "../lib/protocol.js";
import { DEFAULT_PETAL_COUNT, mobConfigs, PetalConfig, petalConfigs, tiers } from "./lib/config.js";
import { AIPlayer, Mob, Player } from "./lib/Entity.js";
import Router from "./lib/Router.js";
import { stringToU8, u8ToString, u8ToU16 } from "../lib/lobbyProtocol.js";
import { applyArticle, getWaveMobRarity, isHalloween } from "../lib/util.js";

// Dev runtime setup (bun.js wrapper provides this in production)
globalThis.environmentName = "bun";
// Override fetch to prepend a base URL to relative paths (bun.js wrapper does this)
if (typeof Bun !== "undefined") {
    const _fetch = globalThis.fetch;
    globalThis.fetch = async (...args) => {
        if (typeof args[0] === "string" && !args[0].startsWith("http")) {
            args[0] = (Bun.env.GAME_SERVER) + args[0];
        }
        return _fetch(...args);
    };
}

globalThis.ANALYTICS_DATA ??= btoa(JSON.stringify({
    screen: "0x0",
    hardware: { gl:0, gl2:0, minCores:0, minMem:0, gpu:"Unknown", os:"Linux", bench:0 },
    browser: typeof Bun !== "undefined" ? { name:"Bun", version:Bun.version } : { name:"Unknown", version:"0.0.0" },
    locale: Intl.DateTimeFormat().resolvedOptions().locale,
    tzOff: -(new Date().getTimezoneOffset() / 60),
    dst: +(new Date().getTimezoneOffset() < Math.max(new Date(new Date().getFullYear(),0,1).getTimezoneOffset(), new Date(new Date().getFullYear(),6,1).getTimezoneOffset())),
    isMobile: 0
}));

function createWave(n) {
    const output = [];

    if (state.mobTable?.length > 0) {
        for (let i = 0; i < n; i++) {
            output.push(state.mobTable[Math.random() * state.mobTable.length | 0]);
        }

        return output;
    }

    let hasHole = false,
        demons = 0,
        aiPlayers = 0;

    for (let i = 0; i < n; i++) {
        while (true) {
            if (Math.random() > .925 && aiPlayers < 3) {
                aiPlayers++;
                output.push(-1);
                break;
            }

            const index = Math.random() * mobConfigs.length | 0;
            const name = mobConfigs[index].name.toLowerCase();

            if (mobConfigs[index].isSystem) {
                continue;
            }

            if (mobConfigs[index].tiers[0].antHoleSpawns?.length > 0) {
                if (hasHole) {
                    continue;
                }

                hasHole = true;
            } else if (name.includes("ant") || name.includes("termite") || name.includes("system")) {
                continue;
            }

            if (name.includes("queen") && name.includes("egg")) {
                continue;
            }

            if (name.includes("shiny") || name.includes("angelic")) {
                if (Math.random() > .01) {
                    continue;
                }
            }

            if (name.includes("demon")) {
                if (demons >= n * .125) {
                    continue;
                }

                demons++;
            }

            output.push(index);
            break;
        }
    }

    return output;
}

function getMobIndex() {
    if (state.mobTable?.length > 0) {
        return state.mobTable[Math.random() * state.mobTable.length | 0];
    }

    let k = 0;

    while (k++ < 100) {
        const index = Math.random() * mobConfigs.length | 0;
        const name = mobConfigs[index].name.toLowerCase();

        if (mobConfigs[index].tiers[0].antHoleSpawns?.length > 0 && Math.random() > .9) {
            return index;
        }

        if ((name.includes("ant") || name.includes("termite")) && Math.random() > .2) {
            continue;
        }

        if (name.includes("demon") && Math.random() > .995) {
            return index;
        }

        if (mobConfigs[index].isSystem) {
            continue;
        }

        return index;
    }

    return 0;
}

// Game loop
setInterval(() => {
    const startTime = performance.now();

    state.spatialHash.clear();
    state.viewsSpatialHash.clear();

    state.entities.forEach(entity => {
        entity.update();
    });

    state.entities.forEach(entity => {
        if (entity._AABB) {
            entity.collide();
        }
    });

    switch (state.gamemode) {
        case GAMEMODES.FFA:
        case GAMEMODES.TDM:
            const oldMapSize = state.width;
            const newMapSize = 1024 + 32 * 8 * (state.clients.size - 1);

            if (oldMapSize !== newMapSize) {
                state.width = state.height = newMapSize;
                state.maxMobs = 10 + 2 * (state.clients.size - 1);

                state.clients.forEach(client => client.sendRoom());
            }
            break;
        case GAMEMODES.WAVES: {
            if (state.isWaves && state.livingMobCount <= 0) {
                state.currentWave++;
                state.maxMobs = Math.min(64, 6 + 2 * state.currentWave);
                state.width = state.height = Math.min(1024 + 36 * 2.25 * state.currentWave, Math.pow(128, 2));

                state.clients.forEach(client => client.sendRoom());
                const mobIndexes = createWave(state.maxMobs);

                for (let i = 0; i < state.maxMobs; i++) {
                    if (mobIndexes[i] === -1) {
                        new AIPlayer(
                            state.random(),
                            Math.max(0, getWaveMobRarity(state.currentWave, 4.83 * Math.pow(1.012, state.currentWave), tiers.length - 1)),
                            state.currentWave
                        );
                        continue;
                    }

                    const mob = new Mob(state.random());
                    mob.define(mobConfigs[mobIndexes[i]], getWaveMobRarity(state.currentWave, 4.83 * Math.pow(1.012, state.currentWave), tiers.length - 1));
                    state.aliveMobs.push(mob);
                }
            }
        } break;
        case GAMEMODES.LINE: {
            const oldW = state.width;
            const oldH = state.height;

            state.width = 1024 * 16;
            state.height = 1024 * 4;
            state.maxMobs = 10 + 2 * (state.clients.size - 1);

            if (oldW !== state.width || oldH !== state.height) {
                state.clients.forEach(client => client.sendRoom());
            }
        } break;
        case GAMEMODES.MAZE:
            state.maxMobs = state.biome === BIOME_TYPES.ANT_HELL ? (32 + 12 * state.clients.size) : (24 + 6 * state.clients.size);
            break;
    }

    if (!state.isWaves && state.livingMobCount < state.maxMobs && Math.random() > .9) {
        if (state.gamemode === GAMEMODES.MMO) {
            // No mob spawning in MMO mode until we have proper PvE zones
        } else if (state.gamemode === GAMEMODES.MAZE) {
            let cfg = mobConfigs[getMobIndex()];
            const info = state.spawnNearPlayer(cfg);
            if (info.tile?.spawn !== undefined) {
                const spawner = state.mapData.mobSpawners.find(spawner => { spawner.id == info.tile?.spawn });
                if (spawner && spawner.availableMobs.length) {
                    const spawn = spawner.availableMobs[spawner.availableMobs.length * Math.random() | 0]
                    cfg = mobConfigs[spawn[0]]
                    if (spawn[1] !== true) {
                        info.rarity = Math.min(spawn[1], spawner.maxRarity);
                    }
                }
            }
            const mob = new Mob(info.position);
            mob.define(cfg, info.rarity);

            if (info.rarity >= state.announceRarity && state.announceRarity > -1) {
                if (!tiers[info.rarity]) console.error(`Rarity returns undefined: ${info.rarity}`);
                else state.clients.forEach(c => c.systemMessage(applyArticle(tiers[info.rarity].name, true) + " " + cfg.name + " has spawned!", tiers[info.rarity].color));
            }
        } else if (state.isLineMap) {
            const cfg = mobConfigs[getMobIndex()];
            const info = state.lineMapMobSpawn(cfg);
            const mob = new Mob(info.position);
            mob.define(cfg, info.rarity);
        } else {
            const mob = new Mob(state.random());
            mob.define(mobConfigs[getMobIndex()], Mob.TEMPORARY_RANDOM_RARITY());
        }
    }

    state.lag.totalTime += performance.now() - startTime;
    state.lag.ticks++;
}, 1000 / 22.5);

let k = 0;
setInterval(() => {
    state.lag.mspt = state.lag.totalTime / Math.max(1, state.lag.ticks);
    state.lag.fps = state.lag.ticks;

    state.lag.totalTime = 0;
    state.lag.ticks = 0;

    // CHANGE THIS
    if (!Router.isSandbox && ++k % 5 === 0) {
        // console.log("FPS:", state.lag.fps, "MSPT:", state.lag.mspt.toFixed(2));
    }
}, 1000);

// Drops update
setInterval(() => {
    state.drops.forEach(d => d.update());
    state.lightning.forEach(l => l.update());
}, 256);

// World update loop
setInterval(() => state.clients.forEach(c => c.worldUpdate()), 1000 / 25);

// Router server through worker through socket
state.router = new Router();

switch (globalThis.environmentName) {
    case "browser":
        self.onmessage = async ({ data }) => {
            switch (data[0]) {
                case 0x00:
                    state.router.addClient(u8ToU16(data, 1), u8ToString(data, 4), data[3]);
                    break;
                case 0x01:
                    state.router.pipeMessage(u8ToU16(data, 1), new DataView(data.buffer, data.byteOffset + 3, data.byteLength - 3));
                    break;
                case 0x02:
                    state.router.removeClient(u8ToU16(data, 1));
                    break;
                case "start":
                    state.router.begin(data);
                    if (data[2]) new ModdingAPI();
                    break;
            }
        }

        state.router.postMessage = data => self.postMessage(data);
        break;
    case "node":
        throw new Error("Node environment not supported");
    case "bun": {
        if (Bun.env.ENV_DONE !== "true") {
            await Bun.write("./.env", [
                "ENV_DONE=false",
                "ROUTING_SERVER=https://routing.floof.supercord.lol",
                "GAME_NAME=dedicated lobby",
                "MODDED=false",
                "GAMEMODE=maze",
                `SECRET=${Array.from(crypto.getRandomValues(new Uint8Array(24))).map(e => e.toString(16).padStart(2, "0")).join("")}`,
                "ADMIN_KEYS=devkey,devkey2",
                "BIOME=0",
                "HOST=dedicated.floof.supercord.lol",
                "PORT=3005",
                "TLS_DIRECTORY=false"
            ].join("\n"));
            console.warn("Please fill out the .env file with the correct values. Set ENV_DONE to 'true' when done.");
            process.exit();
        }

        if (Bun.env.MODDED !== "true" && Bun.env.MODDED !== "false") {
            console.error("MODDED must be 'true' or 'false'");
            process.exit();
        }

        if (!["ffa", "tdm", "waves", "line", "maze", "mmo"].includes(Bun.env.GAMEMODE)) {
            console.error("GAMEMODE must be 'ffa', 'tdm', 'waves', 'line', 'maze', or 'mmo'");
            process.exit();
        }

        if (!/^[0-9a-f]{48}$/i.test(Bun.env.SECRET)) {
            console.error("SECRET must be a 48 character hex string");
            process.exit();
        }

        if (!Bun.env.ADMIN_KEYS.split(",").every(e => typeof e === "string")) {
            console.error("ADMIN_KEYS must be a comma separated list of strings");
            process.exit();
        }

        if (Bun.env.BIOME == -1) {
            console.log("BIOME is set to -1, selecting random biome");
            Bun.env.BIOME = isHalloween ? BIOME_TYPES.HALLOWEEN : (Math.random() * 8 | 0);
        }

        const keys = Bun.env.ADMIN_KEYS.split(",").filter(e => e.length > 3);

        let bunSocketID = 1;
        const bunSendMap = new Map();
        const ipCounts = new Map();
        const server = Bun.serve({
            fetch(req) {
                const ip = server.requestIP(req);

                if (!ip?.address) {
                    return new Response(":(");
                }

                const success = server.upgrade(req, {
                    data: {
                        socketID: bunSocketID++,
                        searchParams: new URLSearchParams(req.url.split("?").slice(1).join("?")),
                        begin: performance.now(),
                        ip: ip.address
                    }
                });

                if (success) {
                    return undefined;
                }

                return new Response("Hello world");
            },

            websocket: {
                perMessageDeflate: true,
                idleTimeout: 0,  // ← DISABLE IDLE TIMEOUT
                async open(socket) {
                    socket.binaryType = "arraybuffer";
                    const client = state.router.addClient(socket.data.socketID, socket.data.searchParams.get("uuid"), keys.includes(socket.data.searchParams.get("clientKey")));

                    if (client) {
                        bunSendMap.set(socket.data.socketID, socket);

                        let ct = (ipCounts.get(socket.data.ip) ?? 0) + 1;

                        if (ct > 100) {
                            client.kick("Too many connections from this IP");
                            return;
                        }

                        ipCounts.set(socket.data.ip, ct);

                        try {
                            const res = await fetch(`${Bun.env.ROUTING_SERVER}/uuid/check?uuid=${client.uuid}&trustedKey=${Bun.env.SECRET}`);
                            const data = await res.json();

                            if (!data.ok || !data.isValid) {
                                client.kick("DAR-6");
                                return;
                            }
                        } catch (e) {
                            console.error(e);
                            client.kick("DAR-5");
                            return;
                        }
                    }
                },

                close(socket) {
                    state.router.removeClient(socket.data.socketID);
                    bunSendMap.delete(socket.data.socketID);

                    if (lobbySocket.readyState === WebSocket.OPEN && socket.data.searchParams.has("analytics")) {
                        lobbySocket.send(new Uint8Array([ROUTER_PACKET_TYPES.ANALYTICS_DATA, ...stringToU8(socket.data.searchParams.get("analytics")), ...stringToU8((performance.now() - socket.data.begin).toFixed(2))]));
                    }

                    let ct = (ipCounts.get(socket.data.ip) ?? 0) - 1;

                    if (ct <= 0) {
                        ipCounts.delete(socket.data.ip);
                    } else {
                        ipCounts.set(socket.data.ip, ct);
                    }
                },

                message(socket, data) {
                    if (typeof data === "string") {
                        return;
                    }

                    state.router.pipeMessage(socket.data.socketID, new DataView(data));
                }
            },

            port: +Bun.env.DEDICATED_LOBBY_PORT,
            tls: Bun.env.TLS_DIRECTORY !== "false" ? {
                key: Bun.file(`${Bun.env.TLS_DIRECTORY}/privkey.pem`),
                cert: Bun.file(`${Bun.env.TLS_DIRECTORY}/fullchain.pem`)
            } : undefined
        });

        const timezone = -Math.floor(new Date().getTimezoneOffset() / 60);

        const lobbySocket = new WebSocket(`${Bun.env.ROUTING_SERVER.replace('http', 'ws')}/ws/lobby?gameName=${Bun.env.GAME_NAME}&isModded=${Bun.env.MODDED == "true" ? "yes" : "no"}&gamemode=${Bun.env.GAMEMODE}&secretKey=${Bun.env.SECRET}&isPrivate=no&biome=${Bun.env.BIOME}&directConnect=${Bun.env.HOST},${timezone}&analytics=${ANALYTICS_DATA}`, {
            origin: Bun.env.HOST,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
            }
        });

        lobbySocket.binaryType = "arraybuffer";

        const wait = [];

        lobbySocket.onopen = () => {
            console.log("Connected to server");

            state.router.begin(["start", Bun.env.GAMEMODE, Bun.env.MODDED == "true", crypto.randomUUID(), +Bun.env.BIOME]);

            lobbySocket.onmessage = event => {
                const data = new Uint8Array(event.data);

                if (data[0] === 255) {
                    const ok = data[1] === 1;

                    if (!ok) {
                        throw new Error("Request rejected by server");
                    }

                    console.log("Lobby Verified", new TextDecoder().decode(data.slice(2, -1)));
                    return;
                }
            }

            wait.forEach(fn => fn());
        }

        lobbySocket.onclose = () => {
            console.log("Disconnected from server");

            state.clients.forEach(c => c.kick("Connection to lobby server lost"));
            setTimeout(() => process.exit(), 1000);
        }

        state.router.postMessage = u8 => {
            switch (u8[0]) {
                case ROUTER_PACKET_TYPES.PIPE_PACKET:
                    const sock = bunSendMap.get(u8ToU16(u8, 1));

                    if (sock != null && sock.readyState === WebSocket.OPEN) {
                        sock.send(u8.slice(3));
                    }
                    break;
                case ROUTER_PACKET_TYPES.CLOSE_CLIENT:
                    bunSendMap.get(u8ToU16(u8, 1))?.close();
                    break;
                default:
                    if (lobbySocket.readyState === WebSocket.OPEN) {
                        lobbySocket.send(u8);
                        console.log(`Lobby ready state: ${lobbySocket.readyState}`)
                    } else {
                        console.log(`Lobby ready state: Closed.`)
                        wait.push(() => lobbySocket.send(u8));
                    }
                    break;
            }
        }
    } break;
    default:
        throw new Error("Invalid environment");
}

let hasDoneItBefore = false;
function sendMockups() {
    state.router.postMessage(new Uint8Array([0x02, ...stringToU8(JSON.stringify(encodeEverything(tiers, petalConfigs, mobConfigs)))]));

    if (hasDoneItBefore) {
        setTimeout(() => state.clients.forEach(c => c.talk(CLIENT_BOUND.UPDATE_ASSETS)), 250);
    }

    hasDoneItBefore = true;
}

sendMockups();

class ModdingAPI {
    static TRANSFERRABLE_TYPES = {
        PetalConfig: 0,
        MobConfig: 1
    };

    static assignTransferrableType(obj, type) {
        let output;

        switch (type) {
            case ModdingAPI.TRANSFERRABLE_TYPES.PetalConfig:
                output = Object.assign(new PetalConfig("", 0, 0, 0), structuredClone(obj));

                for (const key in obj) {
                    const value = structuredClone(obj[key]);

                    switch (key) {
                        case "drawing":
                            output.drawing = Object.assign(new Drawing(), value);
                            break;
                        case "tiers":
                            for (let i = 0; i < value.length; i++) {
                                output.tiers[i] = Object.assign(new PetalTier(0, 0, 0), value[i]);
                            }
                    }
                }
                break;
        }

        return output;
    }

    /** @type {BroadcastChannel|null} */
    #channel = null;

    constructor() {
        this.#channel = new BroadcastChannel("floofModdingAPI");
        this.#channel.onmessage = e => this.parseModdingAPICommand(e.data);
    }

    floofModdingResponse(jobID, ok, message, data = null, transferrableType = null) {
        this.#channel.postMessage([jobID, {
            ok: ok,
            message: message,
            data: data
        }, transferrableType]);
    }

    validateArg(jobID, name, arg, type, minMax) {
        if (typeof arg !== type) {
            this.floofModdingResponse(jobID, false, `Argument ${name} must be of type ${type}`);
            return false;
        }

        if (minMax) {
            if (arg < minMax[0] || arg > minMax[1]) {
                this.floofModdingResponse(jobID, false, `Argument ${name} must be between ${minMax[0]} and ${minMax[1]}`);
                return false;
            }
        }

        return true;
    }

    parseModdingAPICommand(data) {
        const [jobID, functionName, ...args] = data;

        switch (functionName) {
            case "spawnMob": {
                if (args.length !== 2) {
                    this.floofModdingResponse(jobID, false, "spawnMob(index, rarity) requires 2 arguments!");
                    return;
                }

                if (!this.validateArg(jobID, "index", args[0], "number", [0, mobConfigs.length - 1]) || !this.validateArg(jobID, "rarity", args[1], "number", [0, tiers.length - 1])) {
                    return;
                }

                const mob = new Mob(state.random());
                mob.define(mobConfigs[args[0]], args[1]);
                this.floofModdingResponse(jobID, true, "Mob spawned successfully", {
                    id: mob.id,
                    index: mob.index,
                    rarity: mob.rarity,
                    indexName: mobConfigs[mob.index].name,
                    rarityName: tiers[mob.rarity].name,
                    position: {
                        x: mob.x,
                        y: mob.y
                    }
                });
                if (state.isWaves) {
                    state.aliveMobs.push(mob)
                    state.maxMobs++
                }
            } break;
            case "setRoomInfo":
                if (args.length < 1 || args.length > 5) {
                    this.floofModdingResponse(jobID, false, "setRoomInfo(dynamic, width*, height*, mobCount*, currentWave*) requires 1 argument, has 4 extra optional arguments!");
                    return;
                }

                if (!this.validateArg(jobID, "dynamic", args[0], "boolean")) {
                    return;
                }

                if (args[0] === true) {
                    if (args.length !== 1) {
                        this.floofModdingResponse(jobID, false, "setRoomInfo(true) requires no extra arguments!");
                        return;
                    }
                } else {
                    if (
                        !this.validateArg(jobID, "width", args[1], "number", [32 * 8, 32 * 4096]) ||
                        !this.validateArg(jobID, "height", args[2], "number", [32 * 8, 32 * 4096]) ||
                        !this.validateArg(jobID, "mobCount", args[3], "number", [0, 4096]) ||
                        !this.validateArg(jobID, "currentWave", args[4], "number", [0, 4096])
                    ) {
                        return;
                    }
                }

                state.dynamicRoom = args[0];

                if (!state.dynamicRoom) {
                    state.width = args[1];
                    state.height = args[2];
                    state.maxMobs = args[3];
                    state.currentWave = args[4] - 1
                    state.livingMobCount = 0
                }

                state.clients.forEach(client => client.sendRoom());

                this.floofModdingResponse(jobID, true, "Room info set successfully", {
                    dynamic: state.dynamicRoom,
                    width: state.width,
                    height: state.height,
                    mobCount: state.maxMobs,
                    wave: state.currentWave
                });
                break;
            case "getRoomInfo":
                if (args.length !== 0) {
                    this.floofModdingResponse(jobID, false, "getRoomInfo() requires 0 arguments!");
                    return;
                }

                this.floofModdingResponse(jobID, true, "Room info fetched successfully", {
                    dynamic: state.dynamicRoom,
                    width: state.width,
                    height: state.height,
                    mobCount: state.maxMobs,
                    wave: state.wave
                });
                break;
            case "getPlayers":
                if (args.length !== 0) {
                    this.floofModdingResponse(jobID, false, "getPlayers() requires 0 arguments!");
                    return;
                }

                const players = [];

                state.clients.forEach(client => {
                    players.push({
                        clientID: client.id,
                        username: client.username,
                        slots: {
                            primary: client.slots.map(slot => ({
                                index: slot.id,
                                rarity: slot.rarity,
                                indexName: petalConfigs[slot.id].name,
                                rarityName: tiers[slot.rarity].name
                            })),
                            secondary: client.secondarySlots.map(slot => slot ? ({
                                index: slot.id,
                                rarity: slot.rarity,
                                indexName: petalConfigs[slot.id].name,
                                rarityName: tiers[slot.rarity].name
                            }) : null),
                            highestRarity: client.highestRarity
                        },
                        level: {
                            xp: Math.round(client.xp),
                            level: client.level,
                            progress: +client.levelProgress.toFixed(4)
                        },
                        body: client.body ? {
                            id: client.body.id,
                            position: {
                                x: client.body.x,
                                y: client.body.y
                            }
                        } : null
                    });
                });

                this.floofModdingResponse(jobID, true, "Players fetched successfully", players);
                break;
            case "getMobs":
                if (args.length !== 0) {
                    this.floofModdingResponse(jobID, false, "getMobs() requires 0 arguments!");
                    return;
                }

                const mobs = [];

                state.entities.forEach(entity => {
                    if (entity.type === ENTITY_TYPES.MOB) {
                        mobs.push({
                            id: entity.id,
                            index: entity.index,
                            rarity: entity.rarity,
                            indexName: mobConfigs[entity.index].name,
                            rarityName: tiers[entity.rarity].name,
                            position: {
                                x: entity.x,
                                y: entity.y
                            }
                        });
                    }
                });

                this.floofModdingResponse(jobID, true, "Mobs fetched successfully", mobs);
                break;
            case "getPetalInfo": {
                if (args.length !== 1) {
                    this.floofModdingResponse(jobID, false, "getPetalInfo(index) requires 1 argument!");
                    return;
                }

                if (!this.validateArg(jobID, "index", args[0], "number", [0, petalConfigs.length - 1])) {
                    return;
                }

                this.floofModdingResponse(jobID, true, "Petal info fetched successfully", petalConfigs[args[0]], ModdingAPI.TRANSFERRABLE_TYPES.PetalConfig);
            } break;
            case "createCustomPetal": {
                if (args.length !== 1) {
                    this.floofModdingResponse(jobID, false, "createCustomPetal(options) requires 1 argument!");
                    return;
                }

                const options = args[0];
                if (options.drawing) {
                    options.drawing = Drawing.fromString(options.drawing);
                }

                options.id = petalConfigs.length;

                petalConfigs.push(ModdingAPI.assignTransferrableType(options, ModdingAPI.TRANSFERRABLE_TYPES.PetalConfig));

                sendMockups();

                this.floofModdingResponse(jobID, true, "Custom petal created successfully", options, ModdingAPI.TRANSFERRABLE_TYPES.PetalConfig);
            } break;
            case "editPetal": {
                if (args.length !== 1) {
                    this.floofModdingResponse(jobID, false, "editPetal(options) requires 1 argument!");
                    return;
                }

                if (petalConfigs[args[0].id] == null) {
                    this.floofModdingResponse(jobID, false, "Petal does not exist");
                    return;
                }

                const options = args[0];
                if (options.drawing) {
                    options.drawing = Drawing.fromString(options.drawing);
                }

                petalConfigs[options.id] = ModdingAPI.assignTransferrableType(options, ModdingAPI.TRANSFERRABLE_TYPES.PetalConfig);

                sendMockups();

                state.entities.forEach(e => {
                    if (e.type !== ENTITY_TYPES.PLAYER) {
                        return;
                    }

                    /** @type {Player} */
                    const player = e;

                    player.petalSlots.forEach(slot => {
                        if (slot.config.id === options.id) {
                            slot.destroy();
                            slot.define(petalConfigs[options.id], slot.rarity);
                        }
                    });
                });

                this.floofModdingResponse(jobID, true, "Petal edited successfully", options, ModdingAPI.TRANSFERRABLE_TYPES.PetalConfig);
            } break;
            case "setSlot": {
                if (args.length !== 4) {
                    this.floofModdingResponse(jobID, false, "setSlot(clientID, slotID, index, rarity) requires 4 arguments!");
                    return;
                }

                if (
                    !this.validateArg(jobID, "clientID", args[0], "number") ||
                    !this.validateArg(jobID, "slotID", args[1], "number") ||
                    !this.validateArg(jobID, "index", args[2], "number", [0, petalConfigs.length - 1]) ||
                    !this.validateArg(jobID, "rarity", args[3], "number", [0, tiers.length - 1])
                ) {
                    return;
                }

                const client = state.clients.get(args[0]);

                if (!client) {
                    this.floofModdingResponse(jobID, false, "Client not found. Try to fetch the players and find the client ID you need");
                    return;
                }

                if (!client.body) {
                    this.floofModdingResponse(jobID, false, "Client does not have a body");
                    return;
                }

                if (args[1] < 0 || args[1] >= client.body.petalSlots.length) {
                    this.floofModdingResponse(jobID, false, `Slot ${args[1]} does not exist`);
                    return;
                }

                client.slots[args[1]].id = args[2];
                client.slots[args[1]].rarity = args[3];
                client.body.setSlot(args[1], args[2], args[3]);

                this.floofModdingResponse(jobID, true, "Slot set successfully", {
                    clientID: client.id,
                    slotIndex: args[1],
                    petalIndex: args[2],
                    rarity: args[3],
                    indexName: petalConfigs[args[2]].name,
                    rarityName: tiers[args[3]].name
                });
            } break;
            case "deletePetal": {
                if (args.length !== 1) {
                    this.floofModdingResponse(jobID, false, "deletePetal(index) requires 1 argument!");
                    return;
                }

                if (!this.validateArg(jobID, "index", args[0], "number", [0, petalConfigs.length - 1])) {
                    return;
                }

                if (args[0] < DEFAULT_PETAL_COUNT) {
                    petalConfigs[args[0]] = new PetalConfig("Deleted Petal", 0, 0, 0);
                } else {
                    petalConfigs.splice(args[0], 1);
                }

                for (let i = 0; i < petalConfigs.length; i++) {
                    petalConfigs[i].id = i;
                }

                PetalConfig.idAccumulator = petalConfigs.length;

                state.entities.forEach(e => {
                    if (e.type !== ENTITY_TYPES.PLAYER) {
                        return;
                    }

                    /** @type {Player} */
                    const player = e;

                    player.petalSlots.forEach(slot => {
                        if (slot.config.id === args[0]) {
                            slot.destroy();
                            slot.define(petalConfigs[0], slot.rarity);
                        }
                    });
                });

                sendMockups();

                this.floofModdingResponse(jobID, true, "Petal deleted successfully", {
                    index: args[0]
                });
            } break;
            case "setSlotAmount": {
                if (args.length !== 2) {
                    this.floofModdingResponse(jobID, false, "setSlotAmount(clientID, amount) requires 2 arguments!");
                    return;
                }

                if (
                    !this.validateArg(jobID, "clientID", args[0], "number") ||
                    !this.validateArg(jobID, "amount", args[1], "number", [1, 10])
                ) {
                    return;
                }

                const client = state.clients.get(args[0]);

                if (!client) {
                    this.floofModdingResponse(jobID, false, "Client not found. Try to fetch the players and find the client ID you need");
                    return;
                }

                if (!client.body) {
                    this.floofModdingResponse(jobID, false, "Client does not have a body");
                    return;
                }

                client.body.initSlots(args[1]);

                this.floofModdingResponse(jobID, true, "Slot amount set successfully", {
                    clientID: client.id,
                    body: {
                        id: client.body.id,
                        slots: client.body.petalSlots.map(slot => ({
                            index: slot.index,
                            rarity: slot.rarity,
                            indexName: petalConfigs[slot.index].name,
                            rarityName: tiers[slot.rarity].name
                        })),
                        position: {
                            x: client.body.x,
                            y: client.body.y
                        }
                    }
                });
            } break;
            case "spawnAIPlayer": {
                if (args.length !== 2) {
                    this.floofModdingResponse(jobID, false, "spawnAIPlayer(rarity, level) requires 2 arguments!");
                    return;
                }

                if (
                    !this.validateArg(jobID, "rarity", args[0], "number", [0, tiers.length - 1]) ||
                    !this.validateArg(jobID, "amount", args[1] - 1, "number", [1, 999])
                ) {
                    return;
                }

                const mob = new AIPlayer(state.random(), args[0], args[1] - 1);
                this.floofModdingResponse(jobID, true, "AI Flower spawned successfully", {
                    id: mob.id,
                    level: mob.client.level,
                    highestRarity: mob.client.highestRarity,
                    position: {
                        x: mob.x,
                        y: mob.y
                    }
                });
            }
            default:
                this.floofModdingResponse(jobID, false, `Function ${functionName} does not exist!`);
        }
    }
}
