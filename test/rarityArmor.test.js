import { describe, expect, test } from "bun:test";

import { HealthComponent } from "../public/server/lib/Entity.js";
import { petalConfigs } from "../public/server/lib/config.js";
import { getSquadKey } from "../public/server/lib/squads.js";
import { MobTier, RARITY_TABLE } from "../public/lib/protocol.js";

const ARMOR = RARITY_TABLE[27].armor;
const ZINC_16 = globalThis.ZINC_TABLE[16] / 100;
const ZINC_15 = globalThis.ZINC_TABLE[15] / 100;

const petalDamage = (name, rarity) =>
    petalConfigs.find(petal => petal.name === name).tiers[rarity].damage;

const FIRE_MISSILE = petalDamage("Fire Missile", 16);
const CINDERBRICK = petalDamage("Cinderbrick", 16);

describe("rarity 27 armor", () => {
    test("is used by r27 mob tiers", () => {
        expect(new MobTier(27, 1, 1, 1).armor).toBe(ARMOR);
    });

    test("r16 fire missile alone cannot break it", () => {
        expect(FIRE_MISSILE).toBeLessThan(ARMOR);
    });

    test("r16 fire missile with r16 zinc can break it", () => {
        expect(FIRE_MISSILE).toBeGreaterThanOrEqual(ARMOR * (1 - ZINC_16));
    });

    test("r15 zinc is not enough", () => {
        expect(FIRE_MISSILE).toBeLessThan(ARMOR * (1 - ZINC_15));
    });

    test("other r16 petals with r16 zinc still cannot break it", () => {
        expect(CINDERBRICK).toBeLessThan(ARMOR * (1 - ZINC_16));
    });

    test("keeps armor increasing through rarity 29", () => {
        expect(RARITY_TABLE[28].armor).toBeGreaterThan(ARMOR);
        expect(RARITY_TABLE[29].armor).toBeGreaterThan(RARITY_TABLE[28].armor);
    });

    test("the armor gate follows the debuffed value", () => {
        const damager = { client: { id: 1, userId: "user-a" } };

        const blocked = new HealthComponent(1e30);
        blocked.armor = ARMOR;

        expect(blocked.damage(FIRE_MISSILE, damager)).toBe(0);

        const debuffed = new HealthComponent(1e30);
        debuffed.armor = ARMOR;
        debuffed.applyZincDebuff(getSquadKey(damager.client), globalThis.ZINC_TABLE[16]);

        expect(debuffed.damage(FIRE_MISSILE, damager)).toBe(FIRE_MISSILE);
    });
});
