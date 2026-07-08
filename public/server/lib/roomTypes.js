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