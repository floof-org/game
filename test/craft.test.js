import { describe, expect, test } from "bun:test";
import craftManager, { PETALS_PER_ATTEMPT } from "../public/server/lib/CraftManager.js";
import { tiers, petalConfigs } from "../public/server/lib/config.js";

const HIGHEST_RARITY = tiers.length - 1;

// The tables are keyed by normalized rarity name, so build the same key the manager
// uses rather than hardcoding "common"/"multiversal" at each index.
function key(index) {
    return tiers[index].name.toLowerCase().replace(/\s+/g, "");
}

function fakeClient(overrides = {}) {
    return {
        inventory: {},
        craftAttempts: {},
        handlingCraft: false,
        ...overrides
    };
}

function give(client, rarityName, petalId, count) {
    client.inventory[rarityName] ??= {};
    client.inventory[rarityName][petalId] = count;
    return client;
}

describe("calculateChance", () => {
    test("returns a fraction, not a percentage", () => {
        // The client multiplies this by 100 before display, so anything above 1 would
        // render as a chance over 100%.
        for (let rarity = 0; rarity < HIGHEST_RARITY; rarity++) {
            expect(craftManager.calculateChance(rarity, 0)).toBeLessThanOrEqual(1);
            expect(craftManager.calculateChance(rarity, 0)).toBeGreaterThanOrEqual(0);
        }
    });

    test("common always succeeds because its base is 100%", () => {
        expect(tiers[0].name).toBe("Common");
        expect(craftManager.calculateChance(0, 0)).toBe(1);
        expect(craftManager.calculateChance(0, 9999)).toBe(1);
    });

    test("base chances match the supplied table at zero attempts", () => {
        // The table is in percent, so 0.009% is 0.00009 as a fraction.
        expect(craftManager.calculateChance(1, 0)).toBeCloseTo(0.64, 10); // uncommon 64%
        expect(craftManager.calculateChance(2, 0)).toBeCloseTo(0.32, 10); // rare 32%
        expect(craftManager.calculateChance(3, 0)).toBeCloseTo(0.16, 10); // epic 16%
        expect(craftManager.calculateChance(17, 0)).toBeCloseTo(0.0001, 10); // chaos 0.01%
        expect(craftManager.calculateChance(18, 0)).toBeCloseTo(0.00009, 10); // absiorcadinary 0.009%
        expect(craftManager.calculateChance(29, 0)).toBe(0); // multiversal, not craftable
    });

    test("pity grows linearly and is clamped at 100%", () => {
        // Rare sits at 32% and gains 0.4 points per failure.
        expect(craftManager.calculateChance(2, 0)).toBeCloseTo(0.32, 10);
        expect(craftManager.calculateChance(2, 1)).toBeCloseTo(0.324, 10);
        expect(craftManager.calculateChance(2, 100)).toBeCloseTo(0.72, 10);
        expect(craftManager.calculateChance(2, 1000)).toBe(1);
        expect(craftManager.calculateChance(2, 100000)).toBe(1);
    });

    test("every craftable rarity eventually reaches a guaranteed success", () => {
        for (let rarity = 0; rarity < HIGHEST_RARITY; rarity++) {
            expect(craftManager.calculateChance(rarity, 1000000)).toBe(1);
        }
    });

    test("rarities above the old maxAttempts table are no longer stuck at zero", () => {
        // The previous implementation used an 11 entry maxAttempts array against 30
        // rarities, so rarities 11 to 28 computed 1 / (undefined - attempts) = NaN.
        // NaN fails every comparison, which made those petals permanently uncraftable.
        for (let rarity = 11; rarity < HIGHEST_RARITY; rarity++) {
            const chance = craftManager.calculateChance(rarity, 0);
            expect(Number.isNaN(chance)).toBe(false);
            expect(chance).toBeGreaterThan(0);
        }
    });

    test("the highest rarity cannot be crafted", () => {
        expect(tiers[HIGHEST_RARITY].name).toBe("Multiversal");
        expect(craftManager.calculateChance(HIGHEST_RARITY, 0)).toBe(0);
        expect(craftManager.calculateChance(HIGHEST_RARITY, 50000)).toBe(0);
    });

    test("out of range and malformed input stay safe", () => {
        expect(craftManager.calculateChance(-1, 0)).toBe(0);
        expect(craftManager.calculateChance(HIGHEST_RARITY + 10, 0)).toBe(0);
        // Pity counters are restored from disk, so a corrupt value must not poison
        // the chance into NaN and make the petal uncraftable forever.
        expect(Number.isNaN(craftManager.calculateChance(5, undefined))).toBe(false);
        expect(Number.isNaN(craftManager.calculateChance(5, NaN))).toBe(false);
        expect(craftManager.calculateChance(5, undefined)).toBeCloseTo(0.04, 10); // mythic 4%
        expect(craftManager.calculateChance(5, -50)).toBeCloseTo(0.04, 10);
    });

    test("chance never decreases as pity grows", () => {
        for (let rarity = 0; rarity < HIGHEST_RARITY; rarity++) {
            let previous = -1;
            for (let attempts = 0; attempts < 200; attempts++) {
                const chance = craftManager.calculateChance(rarity, attempts);
                expect(chance).toBeGreaterThanOrEqual(previous);
                previous = chance;
            }
        }
    });
});

describe("bigPityAttempts", () => {
    test("reports the supplied display thresholds", () => {
        expect(craftManager.bigPityAttempts(1)).toBe(10); // uncommon
        expect(craftManager.bigPityAttempts(2)).toBe(20); // rare
        expect(craftManager.bigPityAttempts(3)).toBe(30); // epic
        expect(craftManager.bigPityAttempts(HIGHEST_RARITY)).toBe(50000); // multiversal
    });

    test("common has no threshold because it never fails", () => {
        expect(craftManager.bigPityAttempts(0)).toBe(0);
    });

    test("is display only and does not cap the chance", () => {
        for (let rarity = 1; rarity < HIGHEST_RARITY; rarity++) {
            const threshold = craftManager.bigPityAttempts(rarity);
            // Well past the threshold the chance must keep climbing rather than
            // freezing or collapsing.
            expect(craftManager.calculateChance(rarity, threshold)).toBeGreaterThan(craftManager.calculateChance(rarity, threshold - 1));
            expect(craftManager.calculateChance(rarity, threshold + 1)).toBeGreaterThan(craftManager.calculateChance(rarity, threshold));
        }
    });

    test("reaching a guaranteed success takes more attempts the rarer the petal", () => {
        const attemptsToGuarantee = rarity => {
            const step = craftManager.calculateChance(rarity, 1) - craftManager.calculateChance(rarity, 0);
            return Math.ceil((1 - craftManager.calculateChance(rarity, 0)) / step);
        };

        // Pity grows fast enough to matter at the low rarities.
        expect(attemptsToGuarantee(1)).toBe(72); // uncommon
        expect(attemptsToGuarantee(2)).toBe(170); // rare
        expect(attemptsToGuarantee(5)).toBe(960); // mythic

        // It stops being practical further up. Chronodynamic needs 999,999 consecutive
        // failures, which is 5,000,000 petals, and the rarities above it need more.
        // These are a property of the supplied numbers, not of this implementation.
        expect(attemptsToGuarantee(28)).toBe(999999); // chronodynamic
        expect(attemptsToGuarantee(19)).toBe(249980); // absolute fictional
        expect(attemptsToGuarantee(29)).toBe(Number.POSITIVE_INFINITY); // not craftable
    });
});

describe("craft", () => {
    test("requires 5 of the same petal", () => {
        const client = give(fakeClient(), tiers[2].name, 7, 4);

        const result = craftManager.craft(client, 2, 7, 100);

        expect(result.error).toContain("at least 5");
        expect(client.inventory[tiers[2].name][7]).toBe(4);
    });

    test("reports how many the player actually has when short", () => {
        const client = give(fakeClient(), tiers[2].name, 7, 2);

        const result = craftManager.craft(client, 2, 7, 100);

        expect(result.error).toContain("You have 2");
    });

    test("exactly 5 is enough to make one attempt", () => {
        // Stub the RNG to always succeed so the cost rules are deterministic.
        const original = Math.random;
        Math.random = () => 0;
        try {
            const client = give(fakeClient(), tiers[2].name, 7, 5);
            const result = craftManager.craft(client, 2, 7, 5);

            expect(result.error).toBeNull();
            expect(result.crafted).toBe(1);
            expect(result.attempts).toBe(1);
            expect(result.spent).toBe(5);
            expect(client.inventory[tiers[2].name][7]).toBe(0);
            expect(client.inventory[tiers[3].name][7]).toBe(1);
        } finally {
            Math.random = original;
        }
    });

    test("a success resets pity to zero", () => {
        const original = Math.random;
        Math.random = () => 0;
        try {
            const client = give(fakeClient(), tiers[2].name, 7, 5);
            client.craftAttempts[tiers[2].name] = { 7: 37 };
            craftManager.craft(client, 2, 7, 5);

            expect(client.craftAttempts[tiers[2].name][7]).toBe(0);
        } finally {
            Math.random = original;
        }
    });

    test("a failure costs 5 plus 1 to 4 extra, and raises pity", () => {
        const originalRandom = Math.random;
        const originalChance = craftManager.calculateChance;

        // Force every attempt to fail, then pin the penalty roll so the exact cost is
        // predictable. The stack is sized to the worst case so the loop runs once.
        craftManager.calculateChance = () => 0;

        try {
            // Penalty roll of 0.999 selects the maximum extra loss of 4, for 9 total.
            Math.random = () => 0.999;
            const big = give(fakeClient(), tiers[2].name, 7, 9);
            const bigResult = craftManager.craft(big, 2, 7, 9);

            expect(bigResult.error).toBeNull();
            expect(bigResult.crafted).toBe(0);
            expect(bigResult.attempts).toBe(1);
            expect(bigResult.spent).toBe(9); // 5 for the attempt plus 4 penalty
            expect(bigResult.lostToFailures).toBe(4);
            expect(big.craftAttempts[tiers[2].name][7]).toBe(1);

            // Penalty roll of 0 selects the minimum extra loss of 1, for 6 total.
            Math.random = () => 0;
            const small = give(fakeClient(), tiers[2].name, 7, 6);
            const smallResult = craftManager.craft(small, 2, 7, 6);

            expect(smallResult.attempts).toBe(1);
            expect(smallResult.spent).toBe(6);
            expect(smallResult.lostToFailures).toBe(1);
        } finally {
            craftManager.calculateChance = originalChance;
            Math.random = originalRandom;
        }
    });

    test("a small stack is never driven negative by a failure", () => {
        const original = Math.random;
        Math.random = () => 0.999;
        const savedChance = craftManager.calculateChance;
        craftManager.calculateChance = () => 0;
        try {
            // 5 petals is the minimum to attempt, and the penalty can be up to 4 more.
            const client = give(fakeClient(), tiers[2].name, 7, 5);
            const result = craftManager.craft(client, 2, 7, 5);

            expect(client.inventory[tiers[2].name][7]).toBe(0);
            expect(result.spent).toBe(5);
        } finally {
            craftManager.calculateChance = savedChance;
            Math.random = original;
        }
    });

    test("uninitialised pity counters do not become NaN", () => {
        // craftAttempts is only persisted for non-zero values, so a fresh petal has no
        // entry at all. Incrementing undefined would poison every later comparison.
        const client = give(fakeClient(), tiers[5].name, 3, 20);
        expect(client.craftAttempts[tiers[5].name]).toBeUndefined();

        const result = craftManager.craft(client, 5, 3, 20);

        expect(Number.isNaN(client.craftAttempts[tiers[5].name][3])).toBe(false);
        expect(Number.isFinite(result.pity)).toBe(true);
    });

    test("spending more than owned simply stops when petals run out", () => {
        const original = Math.random;
        Math.random = () => 0;
        try {
            const client = give(fakeClient(), tiers[2].name, 7, 12);
            const result = craftManager.craft(client, 2, 7, 100000);

            // 12 petals is two successful attempts at 5 each, 2 left over.
            expect(result.crafted).toBe(2);
            expect(result.spent).toBe(10);
            expect(result.remaining).toBe(2);
            expect(client.inventory[tiers[2].name][7]).toBe(2);
        } finally {
            Math.random = original;
        }
    });

    test("rejects Basic, the highest rarity, and unknown ids", () => {
        const basic = petalIdNamed("Basic");
        const client = give(fakeClient(), tiers[2].name, basic, 50);
        expect(craftManager.craft(client, 2, basic, 50).error).toContain("Basics");

        const anyPetal = 7;
        const top = give(fakeClient(), tiers[HIGHEST_RARITY].name, anyPetal, 50);
        expect(craftManager.craft(top, HIGHEST_RARITY, anyPetal, 50).error).toContain("cannot craft");

        expect(craftManager.craft(fakeClient(), 2, 999999, 50).error).toContain("Unknown");
        expect(craftManager.craft(fakeClient(), 999, 7, 50).error).toContain("Unknown");
    });

    test("rejects absurd request sizes", () => {
        const client = give(fakeClient(), tiers[2].name, 7, 50);
        expect(craftManager.craft(client, 2, 7, 1000001).error).toContain("1,000,000");
    });

    test("the handlingCraft lock is always released", () => {
        const client = give(fakeClient(), tiers[2].name, 7, 50);
        craftManager.craft(client, 2, 7, 50);
        expect(client.handlingCraft).toBe(false);

        // Even the error paths must not leave the lock set.
        craftManager.craft(client, 2, 7, 50);
        expect(client.handlingCraft).toBe(false);
    });

    test("running many attempts never yields more than the budget allows", () => {
        const client = give(fakeClient(), tiers[2].name, 7, 5000);
        const result = craftManager.craft(client, 2, 7, 100000);

        // Each success costs 5 and yields 1, so 5000 petals caps the output at 1000.
        expect(result.crafted).toBeLessThanOrEqual(1000);
        expect(result.crafted).toBeGreaterThanOrEqual(0);
        expect(client.inventory[tiers[2].name][7]).toBeGreaterThanOrEqual(0);
        expect(client.inventory[tiers[3].name][7] ?? 0).toBe(result.crafted);
    });

    test("conservation holds: every success consumed 5 petals", () => {
        const client = give(fakeClient(), tiers[2].name, 7, 5000);
        const result = craftManager.craft(client, 2, 7, 100000);
        const produced = client.inventory[tiers[3].name][7] ?? 0;
        const left = client.inventory[tiers[2].name][7];

        expect(produced).toBe(result.crafted);
        expect(5000 - left).toBe(result.spent);
        expect(result.spent).toBeGreaterThanOrEqual(result.crafted * PETALS_PER_ATTEMPT);
    });
});

describe("handleCraftRequest", () => {
    test("short-staff error carries the friendly message over the protocol", () => {
        const client = give(fakeClient(), tiers[2].name, 7, 1);
        const packets = [];
        client.talk = (type, data) => packets.push({ type, data });

        craftManager.handleCraftRequest(client, 2, 7, 100);

        expect(packets).toHaveLength(1);
        expect(packets[0].data.error).toBe(true);
        expect(packets[0].data.errorMsg).toContain("at least 5");
    });

    test("success reports a pity value the client can display", () => {
        const original = Math.random;
        Math.random = () => 0;
        try {
            const client = give(fakeClient(), tiers[2].name, 7, 5);
            const packets = [];
            client.talk = (type, data) => packets.push({ type, data });

            craftManager.handleCraftRequest(client, 2, 7, 5);

            expect(packets).toHaveLength(1);
            const data = packets[0].data;
            expect(data.error).toBe(false);
            expect(data.rarity).toBe(2);
            expect(data.petalId).toBe(7);
            expect(data.crafted).toBe(1);
            expect(data.attempts).toBe(1);
            // The client does pity * 100, so this has to stay at or below 1.
            expect(data.pity).toBeLessThanOrEqual(1);
            expect(data.pity).toBeGreaterThanOrEqual(0);
        } finally {
            Math.random = original;
        }
    });
});

function petalIdNamed(name) {
    return petalConfigs.findIndex(petal => petal?.name === name);
}