import { CLIENT_BOUND } from "../../lib/protocol.js";
import { petalConfigs, tiers } from "./config.js";

class CraftManager {
    maxAttempts = [2, 4, 7, 13, 25, 50, 100, 200, 500, 1000, 2000];

    /**
     * Returns the chance of successfully crafting a petal on the next attempt,
     * if the player is spending petals of the given rarity after a given
     * number of attempts.
     * 
     * By default, this function implements a uniform distribution for the
     * number of attempts needed to craft a petal. You can feel free to replace
     * this with a different pity system for your own lobbies.
     */
    calculateChance(rarity, attempts) {
        if (rarity < tiers.length - 1) {
            return 1 / Math.max(1, this.maxAttempts[rarity] - attempts);
        } else {
            return 0;
        }
    }

    /**
     * Handles a craft request from a given client who wants to spend a given
     * amount of a given petal on crafting attempts.
     */
    handleCraftRequest(client, rarity, petalId, amount) {
        const rarityName = tiers[rarity]?.name;
        const nextRarityName = tiers[rarity + 1]?.name;
        const petalName = petalConfigs[petalId].name;

        if (petalName === "Basic") {
            return client.talk(CLIENT_BOUND.CRAFT_RESULT, {
                error: true,
                errorMsg: "Error: You cannot craft Basics!",
            });
        } else if (rarity >= tiers.length - 1 || nextRarityName === undefined) {
            return client.talk(CLIENT_BOUND.CRAFT_RESULT, {
                error: true,
                errorMsg: `Error: You cannot craft using ${rarityName} petals!`,
            });
        } else if (amount > 1000000) {
            return client.talk(CLIENT_BOUND.CRAFT_RESULT, {
                error: true,
                errorMsg: "Error: You cannot craft using more than 1,000,000 petals at a time!",
            });
        } else if (amount > (client.inventory[rarityName][petalId] ?? 0)) {
            return client.talk(CLIENT_BOUND.CRAFT_RESULT, {
                error: true,
                errorMsg: "Error: You cannot craft using petals that you do not own!",
            });
        } else if (client.handlingCraft) {
            return client.talk(CLIENT_BOUND.CRAFT_RESULT, {
                error: true,
                errorMsg: "Error: Already processing another craft request!",
            });
        }

        client.handlingCraft = true;

        let crafted = 0;
        let attempts = 0;
        while (amount >= 5 && client.inventory[rarityName][petalId] >= 5) {
            attempts++;

            let chance = this.calculateChance(rarity, client.craftAttempts[rarityName][petalId]);
            if (Math.random() < chance) {
                crafted++;
                client.inventory[nextRarityName][petalId]++;
                amount -= 5;
                client.inventory[rarityName][petalId] -= 5;
                client.craftAttempts[rarityName][petalId] = 0;
            } else {
                const lost = Math.floor(1 + Math.random() * 4);
                amount -= lost;
                client.inventory[rarityName][petalId] -= lost;
                client.craftAttempts[rarityName][petalId]++;
            }
        }

        client.handlingCraft = false;

        return client.talk(CLIENT_BOUND.CRAFT_RESULT, {
            error: false,
            rarity,
            petalId,
            crafted,
            attempts,
            pity: this.calculateChance(rarity, client.craftAttempts[rarityName][petalId]),
        });
    }
}

const craftManager = new CraftManager();
export default craftManager;