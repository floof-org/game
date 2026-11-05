import { tiers } from "../../lib/protocol.js";
import { BOSS_SPAWN_MESSAGES } from "./config.js";
import state from "./state.js";

/** Boss spawn titles are always shown in yellow. */
export const BOSS_TITLE_COLOR = "#FFFF00";
/** Matches the default /title length. */
export const BOSS_TITLE_DURATION = 5;

/**
 * Lobby-wide boss spawn announce: the flavour line becomes a yellow title and
 * chat gets the plain "A <rarity> Boss <mob> Has Spawned!" line in the
 * rarity's colour.
 */
export function announceBossSpawn(config, rarity) {
    const rarityData = tiers[rarity];
    const chatMessage = `A ${rarityData?.name ?? ""} Boss ${config.name} Has Spawned!`;
    const titleText = BOSS_SPAWN_MESSAGES[config.name] ?? chatMessage;
    const rarityColor = rarityData?.color ?? "#ffffff";

    state.clients.forEach(client => {
        if (typeof client.title === "function") {
            client.title(titleText, BOSS_TITLE_COLOR, BOSS_TITLE_DURATION);
        }

        client.systemMessage(chatMessage, rarityColor);
    });
}
