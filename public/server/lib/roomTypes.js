import { BIOME_TYPES } from "../../lib/protocol.js";

export const ROOM_TYPES = {
    "main-ffa": {
        biome: BIOME_TYPES.DEFAULT,
        gamemode: "ffa"
    },
    "main-garden": {
        biome: BIOME_TYPES.GARDEN,
        gamemode: "tdm"
    },
    "main-desert": {
        biome: BIOME_TYPES.DESERT,
        gamemode: "tdm"
    },
    "main-ocean": {
        biome: BIOME_TYPES.OCEAN,
        gamemode: "tdm"
    }
};

/**
 * @param {string} name
 * @returns {{biome: number, gamemode: string}}
 */
export function resolveRoomType(name) {
    const roomType = ROOM_TYPES[name];

    if (!roomType) {
        throw new Error(`Unknown room type "${name}". Valid options: ${Object.keys(ROOM_TYPES).join(", ")}`);
    }

    return roomType;
}

export const ROOM_CENTER_PORTALS = {
    "main-garden": "Garden Portal",
    "main-desert": "Desert Portal",
    "main-ocean": "Ocean Portal"
};

export const ROOM_NPCS = {
    "main-garden": [
        { name: "Druid", x: -180, y: 180 },
        { name: "Trader", x: 180, y: 180 },
        { name: "Oracle", x: 0, y: -220 }
    ],
    "main-desert": [
        { name: "Druid", x: -180, y: 180 },
        { name: "Trader", x: 180, y: 180 },
        { name: "Oracle", x: 0, y: -220 }
    ],
    "main-ocean": [
        { name: "Druid", x: -180, y: 180 },
        { name: "Trader", x: 180, y: 180 },
        { name: "Oracle", x: 0, y: -220 }
    ]
};

export const ROOM_SIDE_PORTALS = {
    "main-garden": {
        left: { room: "main-ffa", portal: "Portal" },
        right: { room: "main-desert", portal: "Desert Portal" }
    },
    "main-desert": {
        left: { room: "main-garden", portal: "Garden Portal" },
        right: { room: "main-ocean", portal: "Ocean Portal" }
    },
    "main-ocean": {
        left: { room: "main-desert", portal: "Desert Portal" }
    }
};