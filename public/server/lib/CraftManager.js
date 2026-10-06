import { CLIENT_BOUND } from "../../lib/protocol.js";
import { petalConfigs, tiers } from "./config.js";

/**
 * Crafting tables, keyed by normalized rarity name (lowercase, spaces stripped).
 * `tiers[i].name` normalizes onto exactly these keys at every index.
 *
 * CRAFT_CHANCES is the chance of a success on the very first attempt, in percent.
 * PITY_INCREMENTS is how many percentage points each consecutive failure adds.
 * ATTEMPTS_FOR_BIG_PITY is a display threshold only: it is the attempt count at
 * which the accumulated pity is meant to be worth showing to the player, and it
 * does not cap or guarantee anything.
 */
const CRAFT_CHANCES = {
    common: 100,
    uncommon: 64,
    rare: 32,
    epic: 16,
    legendary: 8,
    mythic: 4,
    ultra: 2,
    super: 1,
    ancient: 0.5,
    omega: 0.4,
    eternal: 0.3,
    unique: 0.2,
    hyper: 0.1,
    galaxium: 0.09,
    millom: 0.08,
    fictional: 0.07,
    transcestrial: 0.05,
    chaos: 0.01,
    absiorcadinary: 0.009,
    absolutefictional: 0.008,
    nullified: 0.007,
    hyperfixation: 0.006,
    atlantical: 0.001,
    alpha: 0.0009,
    finalist: 0.0008,
    epsilation: 0.0007,
    improbable: 0.0006,
    izolational: 0.0005,
    chronodynamic: 0.0001,
    multiversal: 0.00001
};

const PITY_INCREMENTS = {
    uncommon: 0.5,
    rare: 0.4,
    epic: 0.3,
    legendary: 0.2,
    mythic: 0.1,
    ultra: 0.05,
    super: 0.04,
    ancient: 0.016,
    omega: 0.013,
    eternal: 0.01,
    unique: 0.008,
    hyper: 0.0072,
    galaxium: 0.0065,
    millom: 0.0057,
    fictional: 0.005,
    transcestrial: 0.004,
    chaos: 0.0026,
    absiorcadinary: 0.002,
    absolutefictional: 0.0004,
    nullified: 0.00029,
    hyperfixation: 0.00027,
    atlantical: 0.00025,
    alpha: 0.000238,
    finalist: 0.00022,
    epsilation: 0.00021,
    improbable: 0.0002,
    izolational: 0.00013,
    chronodynamic: 0.0001,
    multiversal: 0.00004
};

const ATTEMPTS_FOR_BIG_PITY = {
    uncommon: 10,
    rare: 20,
    epic: 30,
    legendary: 40,
    mythic: 50,
    ultra: 80,
    super: 100,
    ancient: 120,
    omega: 150,
    eternal: 200,
    unique: 250,
    hyper: 275,
    galaxium: 300,
    millom: 350,
    fictional: 400,
    transcestrial: 450,
    chaos: 500,
    absiorcadinary: 600,
    absolutefictional: 700,
    nullified: 900,
    hyperfixation: 1100,
    atlantical: 2000,
    alpha: 4500,
    finalist: 9000,
    epsilation: 9500,
    improbable: 10000,
    izolational: 15000,
    chronodynamic: 20000,
    multiversal: 50000
};

export const PETALS_PER_ATTEMPT = 5;
const MIN_FAILURE_LOSS = 1;
const MAX_FAILURE_LOSS = 4;
const MAX_PETALS_PER_REQUEST = 1000000;

// The rarity whose crafts get announced lobby wide. Crafting rarity N produces
// rarity N + 1, so this announces Omega petals.
export const CRAFT_ANNOUNCE_RARITY = 10;

function rarityKey(name) {
    return name.toLowerCase().replace(/\s+/g, "");
}

// Index aligned copies of the tables above. The craft loop runs once per attempt,
// so keeping the lookups numeric avoids repeating the string work every iteration.
// The percent values are kept as authored and only divided when a chance is needed,
// so display never picks up floating point noise like 0.00039999999999999996.
const BASE_CHANCE_PERCENT = tiers.map(tier => CRAFT_CHANCES[rarityKey(tier.name)] ?? 0);
const PITY_PERCENT = tiers.map(tier => PITY_INCREMENTS[rarityKey(tier.name)] ?? 0);
const BIG_PITY_ATTEMPTS = tiers.map(tier => ATTEMPTS_FOR_BIG_PITY[rarityKey(tier.name)] ?? 0);

const BASE_CHANCES = BASE_CHANCE_PERCENT.map(percent => percent / 100);
const PITY_STEPS = PITY_PERCENT.map(percent => percent / 100);

class CraftManager {
    /**
     * Returns the chance of successfully crafting a petal on the next attempt, as a
     * fraction between 0 and 1, given the rarity being spent and how many attempts
     * have already failed at that rarity.
     *
     * The client multiplies this by 100 before showing it, so this must stay a
     * fraction rather than a percentage.
     *
     * Common has a 100% base and no pity increment, so it always succeeds. The
     * highest rarity cannot be crafted at all, because there is nothing above it.
     */
    calculateChance(rarity, attempts) {
        if (rarity < 0 || rarity >= tiers.length - 1) {
            return 0;
        }

        const attemptsMade = Number.isFinite(attempts) ? Math.max(0, attempts) : 0;

        return Math.min(1, BASE_CHANCES[rarity] + attemptsMade * PITY_STEPS[rarity]);
    }

    /**
     * The base chance of a first-attempt success, in percent, for display.
     */
    baseChancePercent(rarity) {
        return BASE_CHANCE_PERCENT[rarity];
    }

    /**
     * How many percentage points each consecutive failure adds, for display.
     */
    pityIncrementPercent(rarity) {
        return PITY_PERCENT[rarity];
    }

    /**
     * The attempt count at which pity is worth surfacing to the player. Purely
     * informational: it neither caps the chance nor guarantees a success.
     */
    bigPityAttempts(rarity) {
        return BIG_PITY_ATTEMPTS[rarity] ?? 0;
    }

    /**
     * Spends petals of one rarity on crafting attempts, producing petals of the next
     * rarity. Shared by the crafting protocol and the /craft command so both use the
     * same tables and the same cost rules.
     *
     * Returns either `{ error }` or a summary of what happened.
     */
    craft(client, rarity, petalId, amount) {
        const rarityName = tiers[rarity]?.name;
        const nextRarityName = tiers[rarity + 1]?.name;
        const petalName = petalConfigs[petalId]?.name;

        if (rarityName === undefined || petalName === undefined) {
            return { error: "Error: Unknown rarity or petal." };
        }

        // Both maps are only pre-filled for ids the client has actually seen, and the
        // pity counters are only written back when they are non-zero. Without this the
        // first increment turns `undefined` into NaN, which makes every later chance
        // comparison false and the petal uncraftable.
        client.inventory[rarityName] ??= {};
        client.inventory[rarityName][petalId] ??= 0;
        client.craftAttempts[rarityName] ??= {};
        client.craftAttempts[rarityName][petalId] ??= 0;

        if (petalName === "Basic") {
            return { error: "Error: You cannot craft Basics!" };
        }

        if (rarity >= tiers.length - 1 || nextRarityName === undefined) {
            return { error: `Error: You cannot craft using ${rarityName} petals!` };
        }

        if (amount > MAX_PETALS_PER_REQUEST) {
            return { error: `Error: You cannot craft using more than ${MAX_PETALS_PER_REQUEST.toLocaleString()} petals at a time!` };
        }

        const owned = client.inventory[rarityName][petalId];

        if (owned < PETALS_PER_ATTEMPT) {
            return {
                error: `Error: You need at least ${PETALS_PER_ATTEMPT} of the same petal to craft. You have ${owned} ${rarityName} ${petalName}.`
            };
        }

        if (client.handlingCraft) {
            return { error: "Error: Already processing another craft request!" };
        }

        client.handlingCraft = true;

        // Spending more than the player owns simply stops once the petals run out.
        let budget = Math.min(amount, owned);
        let crafted = 0;
        let attempts = 0;
        let spent = 0;
        let lostToFailures = 0;

        try {
            while (budget >= PETALS_PER_ATTEMPT && client.inventory[rarityName][petalId] >= PETALS_PER_ATTEMPT) {
                attempts++;

                let chance = this.calculateChance(rarity, client.craftAttempts[rarityName][petalId]);
                const bigPityReq = this.bigPityAttempts(rarity);
                if (bigPityReq && client.craftAttempts[rarityName][petalId] >= bigPityReq) {
                    const extraFails = client.craftAttempts[rarityName][petalId] - bigPityReq + 1;
                    chance = Math.min(1, chance + extraFails * 0.025);
                }

                if (Math.random() < chance) {
                    client.inventory[nextRarityName] ??= {};
                    client.inventory[nextRarityName][petalId] ??= 0;
                    client.inventory[nextRarityName][petalId]++;
                    client.inventory[rarityName][petalId] -= PETALS_PER_ATTEMPT;
                    client.craftAttempts[rarityName][petalId] = 0;
                    budget -= PETALS_PER_ATTEMPT;
                    spent += PETALS_PER_ATTEMPT;
                    crafted++;
                } else {
                    const extra = MIN_FAILURE_LOSS + Math.floor(Math.random() * (MAX_FAILURE_LOSS - MIN_FAILURE_LOSS + 1));
                    const loss = Math.min(client.inventory[rarityName][petalId], PETALS_PER_ATTEMPT + extra);
                    client.inventory[rarityName][petalId] -= loss;
                    client.craftAttempts[rarityName][petalId]++;
                    budget -= loss;
                    spent += loss;
                    lostToFailures += loss - PETALS_PER_ATTEMPT;
                }
            }
        } finally {
            client.handlingCraft = false;
        }

        if (client.inventory[rarityName][petalId] <= 0) {
            // Keep a zero count rather than deleting the key: the client merges the
            // world update inventory per petal id and never forgets ids the server
            // stops sending.
            client.inventory[rarityName][petalId] = 0;
        }

        return {
            error: null,
            rarity,
            nextRarityIndex: rarity + 1,
            petalId,
            rarityName,
            nextRarityName,
            petalName,
            crafted,
            attempts,
            spent,
            lostToFailures,
            remaining: client.inventory[rarityName][petalId],
            pityAttempts: client.craftAttempts[rarityName][petalId],
            pity: this.calculateChance(rarity, client.craftAttempts[rarityName][petalId])
        };
    }

    /**
     * Handles a craft request from a given client who wants to spend a given
     * amount of a given petal on crafting attempts.
     */
    handleCraftRequest(client, rarity, petalId, amount) {
        const result = this.craft(client, rarity, petalId, amount);

        if (result.error) {
            return client.talk(CLIENT_BOUND.CRAFT_RESULT, {
                error: true,
                errorMsg: result.error
            });
        }

        client.talk(CLIENT_BOUND.CRAFT_RESULT, {
            error: false,
            rarity: result.rarity,
            petalId: result.petalId,
            crafted: result.crafted,
            attempts: result.attempts,
            pity: result.pity
        });

        // Returned so the caller can announce the craft lobby wide.
        return result;
    }
}

const craftManager = new CraftManager();
export default craftManager;