import { tiers } from "../../lib/protocol.js";
import { BOSS_SPAWN_MESSAGES } from "./config.js";
import state from "./state.js";

/** Matches the default /title length. */
export const BOSS_TITLE_DURATION = 5;

/**
 * Lobby-wide boss spawn announce: the flavour line becomes a title in the
 * boss's rarity colour and chat gets the plain "A <rarity> Boss <mob> Has
 * Spawned!" line in the same colour.
 */
export function announceBossSpawn(config, rarity) {
    const rarityData = tiers[rarity];
    const chatMessage = `A ${rarityData?.name ?? ""} Boss ${config.name} Has Spawned!`;
    const titleText = BOSS_SPAWN_MESSAGES[config.name] ?? chatMessage;
    const rarityColor = rarityData?.color ?? "#ffffff";

    state.clients.forEach(client => {
        if (typeof client.title === "function") {
            client.title(titleText, rarityColor, BOSS_TITLE_DURATION);
        }

        client.systemMessage(chatMessage, rarityColor);
    });
}
