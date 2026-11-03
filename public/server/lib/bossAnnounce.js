import { tiers } from "../../lib/protocol.js";
import { BOSS_SPAWN_MESSAGES } from "./config.js";
import state from "./state.js";

/**
 * Lobby-wide boss spawn announce. Uses the boss's flavour line when one is
 * defined; falls back to a generic line otherwise.
 */
export function announceBossSpawn(config, rarity) {
    const rarityData = tiers[rarity];
    const message = BOSS_SPAWN_MESSAGES[config.name];

    state.clients.forEach(client => client.systemMessage(
        message ?? `A Boss ${rarityData?.name ?? ""} ${config.name} has spawned!`,
        rarityData?.color ?? "#ffffff"
    ));
}
