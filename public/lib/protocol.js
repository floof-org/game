globalThis._mobList ??= [];
globalThis._itemList ??= [];

globalThis.BLOOD_LIGHT_TABLE = [
    0.01, 0.03, 0.05, 0.08, 0.1, 0.2, 0.3, 0.5,
    0.7, 0.6, 0.8, 0.4, 0.5, 0.6, 1, 1
];

globalThis.POMEGRANATE_TABLE = [
    0.01, 0.03, 0.05, 0.08, 0.1, 0.2, 0.3, 0.5,
    0.7, 0.6, 0.8, 0.4, 0.5, 0.6, 1, 1
];

globalThis.SUMMON_HEALING_TABLE = [
    0.625, 1.5, 2.875, 6.25, 25, 62.5, 162.5, 1112.5,
    6125, 62500, 850000, 11831375, 207425000, 1883137500,
    10742500000, 86682500000, 206682500000, 566825000000,
    566825000000, 566825000000, 5668250000000
];

export const tiers = [{
    name: "Common",
    color: "#7EEF6D"
}, {
    name: "Uncommon",
    color: "#FFE65D"
}, {
    name: "Rare",
    color: "#455FCF"
}, {
    name: "Epic",
    color: "#7633CB"
}, {
    name: "Legendary",
    color: "#C13328"
}, {
    name: "Mythic",
    color: "#1ED2CB"
}, {
    name: "Ultra",
    color: "#ff2b75"
}, {
    name: "Super",
    color: "#2affa3"
}, {
    name: "Ancient",
    color: "#ff7b29"
}, {
    name: "Omega",
    color: "#d966e8"
}, {
    name: "Eternal",
    color: "#e0d465"
}, {
    name: "Unique",
    color: "#FFFFFF"
}, {
    name: "Hyper",
    color: "#46e0b7"
}, {
    name: "Galaxium",
    color: "#f57f95"
}, {
    name: "Millom",
    color: "#3fcf32"
}, {
    name: "Fictional",
    color: "#962d2d"
}, {
    name: "Transcestrial",
    color: "#3690f7"
}, {
    name: "Chaos",
    color: "#2e3540"
}, {
    name: "Absiorcadinary",
    color: "#493ea8"
}, {
    name: "Absolute Fictional",
    color: "#361111"
}, {
    name: "Nullified",
    color: "#868491"
}, {
    name: "Hyperfixation",
    color: "#a08efa"
}, {
    name: "Atlantical",
    color: "#618691"
}, {
    name: "Alpha",
    color: "#ba80a1"
}, {
    name: "Finalist",
    color: "#ffa196"
}, {
    name: "Epsilation",
    color: "#b5f5da"
}, {
    name: "Improbable",
    color: "#41825b"
}, {
    name: "Izolational",
    color: "#ffc799"
}, {
    name: "Chronodynamic",
    color: "#666642"
}, {
    name: "Multiversal",
    color: "#ea00ff"
}];

export const RARITY_SIZE_MULTIPLIERS = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1.16,
    1.26, 1.30, 1.44, 1.51, 1.58, 1.65, 1.63, 1.87, 1.92,
    2.04,
    2.16, 2.3, 2.5, 2.61, 2.7, 2.9, 3.1, 3.3, 3.5
];

globalThis.PETAL_TIER_TABLE = {
    0: { health: 1, damage: 1 },
    1: { health: 2, damage: 2 },
    2: { health: 4, damage: 4 },
    3: { health: 8, damage: 8 },
    4: { health: 16, damage: 16 },
    5: { health: 32, damage: 32 },
    6: { health: 160, damage: 160 },
    7: { health: 480, damage: 480 },
    8: { health: 2880, damage: 2880 },
    9: { health: 17280, damage: 17280 },
    10: { health: 103680, damage: 103680 },
    11: { health: 1244160, damage: 1244160 },
    12: { health: 14929920, damage: 14929920 },
    13: { health: 89579520, damage: 89579520 },
    14: { health: 268738560, damage: 268738560 },
    15: { health: 1612431360, damage: 1612431360 },
    16: { health: 16124313600, damage: 16124313600 },
    17: { health: 193491763200, damage: 193491763200 },
    18: { health: 161243136000, damage: 161243136000 },
    19: { health: 161243136000, damage: 161243136000 },
    20: { health: 161243136000, damage: 161243136000 },
    21: { health: 1612431360000, damage: 1612431360000 },
    22: { health: 4837294080000, damage: 4837294080000 },
    23: { health: 14511882240000, damage: 14511882240000 },
    24: { health: 43535646720000, damage: 43535646720000 },
    25: { health: 130606940160000, damage: 130606940160000 },
    26: { health: 391820820480000, damage: 391820820480000 },
    27: { health: 1175462461440000, damage: 1175462461440000 },
    28: { health: 3526387384320000, damage: 3526387384320000 },
    29: { health: 10579162152960000, damage: 10579162152960000 },
};

export function petalTierMultiplier(tier) {
    const tierData = globalThis.PETAL_TIER_TABLE?.[tier];
    if (tierData && tierData.damage !== undefined) {
        return tierData.damage;
    }

    // fallback so nothing breaks past the table
    return Math.pow(PetalTier.DAMAGE_SCALE, tier);
}

export class PetalTier {
    static HEALTH_SCALE = 2;
    static DAMAGE_SCALE = 2;

    constructor(tier, health, damage) {
        // arrays are only the per-rarity baseline values, they still get the rarity multiplier
        this.health = (Array.isArray(health) ? health[Math.min(tier, health.length - 1)] : health) * petalTierMultiplier(tier);
        this.damage = (Array.isArray(damage) ? damage[Math.min(tier, damage.length - 1)] : damage) * petalTierMultiplier(tier);

        this.extraHealth = 0;
        this.constantHeal = 0;
        this.healing = 0;
        this.count = 1;
        this.clumps = false;
        this.damageReduction = 0;
        this.damageReflection = null;
        this.speedMultiplier = 1;
        this.sizeRatio = 1;
        this.extraSize = 0;
        this.extraRange = 0;

        /** @type {{damage: number, duration: number}|null} */
        this.poison = null;

        /** @type {{index: number, rarity: number, timer: number}|null} */
        this.spawnable = null;

        /** @type {{cooldown: number, range: number, damage: number, poison: {damage: number, duration: number}, speedDebuff: {multiplier: number, duration: number}}|null} */
        this.pentagramAbility = null;

        /** @type {{bounces: number, range: number, damage: number, charges: number, lightningOnParentHit: boolean}|null} */
        this.lightning = null;

        this.extraVision = 0;

        this.extraPickupRange = 0;

        this.density = 1;

        this.deathDefying = null;

        /** @type {{maxDamage: number, period: number}|null} */
        this.absorbsDamage = null;

        this.shield = 0;

        /** @type {{length:number, delay:number}|null} */
        this.boost = null;

        this.healBack = 0;

        this.armor = 0;

        this.icon = null;

        this.description = "Not much is known about this mysterious petal.";
    }
}

export const RARITY_TABLE = {
    0: { health: 2.25, damage: 0.01, size: 1, armor: 0 },
    1: { health: 6.7, damage: 0.1, size: 1.05, armor: 1 },
    2: { health: 17.5, damage: 0.5, size: 1.10, armor: 4 },
    3: { health: 53.7, damage: 1, size: 1.15, armor: 10 },
    4: { health: 114.6, damage: 2.85, size: 1.40, armor: 25 },
    5: { health: 1000.4, damage: 4, size: 1.80, armor: 51 },
    6: { health: 3600.7, damage: 6.7, size: 2.25, armor: 100 },
    7: { health: 6000.9, damage: 18.95, size: 3.10, armor: 360 },
    8: { health: 10000.3, damage: 30.2, size: 3.65, armor: 630 },
    9: { health: 27000.2, damage: 44.24, size: 4, armor: 1200 },
    10: { health: 196000, damage: 55.85, size: 4.25, armor: 6900 },
    11: { health: 512000, damage: 110, size: 4.4, armor: 8200 },
    12: { health: 3040000, damage: 320, size: 4.6, armor: 47540 },
    13: { health: 9216000, damage: 1200, size: 4.8, armor: 265000 },
    14: { health: 84400000, damage: 3100, size: 5, armor: 402000 },
    15: { health: 318800000, damage: 22000, size: 5.2, armor: 1375900 },
    16: { health: 920760056, damage: 91000, size: 5.4, armor: 5100000 },
    17: { health: 13527600560, damage: 560000, size: 5.6, armor: 17100000 },
    18: { health: 56832000000, damage: 3400000, size: 5.8, armor: 72240000 },
    19: { health: 186080000000, damage: 9990000, size: 6, armor: 248000000 },
    20: { health: 1012000000000, damage: 23000000, size: 6.2, armor: 830000000 },
    21: { health: 9960000000000, damage: 148700000, size: 6.4, armor: 5100000000 },
    22: { health: 14000000000000, damage: 948700000, size: 6.6, armor: 12900000000 },
    23: { health: 107900000000000, damage: 3500000000, size: 6.8, armor: 17400000000 },
    24: { health: 340000000000000, damage: 4900000000, size: 7, armor: 132100000000 },
    25: { health: 1274000000000000, damage: 6000000000, size: 7.2, armor: 331200000000 },
    26: { health: 2590000000000000, damage: 14000000000, size: 7.4, armor: 967630000000 },
    27: { health: 98492800000000000, damage: 71000000000, size: 7.6, armor: 13100000000000 },
    28: { health: 906800000000000000, damage: 222000000000, size: 8, armor: 22300000000000 },
    29: { health: 6700000000000000000, damage: 3700000000000, size: 10, armor: 260500000000000 }
};

export const SUMMON_STATS = {
    0: { health: 2.25, damage: 1.4, size: 1 },
    1: { health: 6.7, damage: 5.1, size: 1.05 },
    2: { health: 17.5, damage: 15.3, size: 1.10 },
    3: { health: 53.7, damage: 36.4, size: 1.15 },
    4: { health: 114.6, damage: 42.7, size: 1.40 },
    5: { health: 500, damage: 94.2, size: 1.80 },
    6: { health: 1210.7, damage: 204.7, size: 2.25 },
    7: { health: 5000.9, damage: 988, size: 3.10 },
    8: { health: 13000, damage: 2508, size: 3.65 },
    9: { health: 90000.2, damage: 11008.24, size: 4 },
    10: { health: 5050000, damage: 30004.85, size: 4.25 },
    11: { health: 340000000, damage: 141000, size: 4.50 },
    12: { health: 3780000000, damage: 1720000, size: 4.75 },
    13: { health: 34520000000, damage: 20190000, size: 5 },
    14: { health: 1976160000000, damage: 90300000, size: 5.25 },
    15: { health: 7156960000000, damage: 1300300000, size: 5.50 },
    16: { health: 300380002800000, damage: 19201200000, size: 5.75 },
    17: { health: 18909500700000, damage: 650000000, size: 6 },
    18: { health: 11040000000000, damage: 990000000, size: 6.25 },
    19: { health: 43450000000000, damage: 400500000, size: 6.50 },
    20: { health: 462000000000000, damage: 430000000, size: 6.75 },
    21: { health: 3000000000000000, damage: 2870000000, size: 7 },
    22: { health: 3400000000000000, damage: 3000000000, size: 7.25 },
    23: { health: 3700000000000000, damage: 3500000000, size: 7.5 },
    24: { health: 5000000000000000, damage: 4900000000, size: 8.125 },
    25: { health: 6520000000000000, damage: 6000000000, size: 8.50 },
    26: { health: 37000000000000000, damage: 34000000000, size: 9.75 },
    27: { health: 56000000000000000, damage: 51000000000, size: 11 },
    28: { health: 26800000000000000, damage: 252000000000, size: 12.5 },
    29: { health: 37000000000000000, damage: 3700000000000, size: 15.5 }
};

export class MobTier {
    static HEALTH_SCALE = 3.15;
    static DAMAGE_SCALE = 3;
    static SIZE_STEP = 3.5;
    static RANGE_SCALE = 0.988;

    constructor(tier, health, damage, size) {
        const rarityData = RARITY_TABLE[Math.min(tier, 29)] ?? {};

        this.health = health * (rarityData.health ?? 1);
        this.damage = damage * (rarityData.damage ?? 1);
        this.size = size;
        this.armor = rarityData.armor ?? 0;

        this.damageReduction = 0;

        /** @type {{aimbot: boolean, petalIndex: number, cooldown: number, health: number, damage: number, speed: number, range: number, size: number, multiShot: {count:number,delay:number}|null}|null} */
        this.projectile = null;

        /** @type {{speedMultiplier: number, duration: number}|null} */
        this.poison = null;

        /** @type {{cooldown: number, bounces: number, range: number, damage: number}|null} */
        this.lightning = null;

        /** @type {{index: number, count: number, minHealthRatio: number}[]} */
        this.antHoleSpawns = null;
    }
}

export class GunConfig {
    constructor(length, width, offsetX, offsetY, angle, delay) {
        this.length = length;
        this.width = width;
    
        this.offset = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
        this.direction = Math.atan2(offsetY, offsetX);

        this.angle = angle;
        this.delay = delay;
    }
}

export class PetalConfig {
    static idAccumulator = 0;

    #initTiers() {
        const output = [];

        for (let i = 0; i < tiers.length; i++) {
            output.push(new PetalTier(i, this.health, this.damage));
        }

        return output;
    }

    constructor(name, cooldown, health, damage) {
        this.id = PetalConfig.idAccumulator++;
        this.name = name;

        globalThis._itemList.push(this);

        this.cooldown = cooldown;
        this.health = health;
        this.damage = damage;
        this.sizeRatio = 1;

        this.launchable = false;
        this.launchedSpeed = 0;
        this.launchedRange = 0;

        /** auto lock half angle on fire, in radians, 0 means use the default lock */
        this.autoLockAngle = 0;

        this.wingMovement = false;
        this.yinYangMovement = false;
        this.wearable = false;

        /** @type {{speedMultiplier: number, duration: number}|null} */
        this.enemySpeedDebuff = null;

        /** @type {{index: number, count: number}|null} */
        this.splits = null;

        this.tiers = this.#initTiers();
        this.attractsLightning = false;
        this.drawing = null;
        this.shootsOut = -1;
        this.healsInDefense = false;
        this.phases = false;
        this.canPlaceDown = false;
        this.healWhenUnder = 1;
        this.huddles = false;
        this.ignoreWalls = false;
        this.extraLighting = 0;
    }

    setName(name) {
        this.name = name;
        return this;
    }

    setHuddles(huddles) {
        this.huddles = Boolean(huddles);
        return this;
    }

    setCooldown(cooldown) {
        this.cooldown = cooldown;
        return this;
    }

    setHealth(health) {
        this.health = health;
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].health = health * petalTierMultiplier(i);
        }

        return this;
    }

    setDamage(damage) {
        this.damage = damage;
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].damage = damage * petalTierMultiplier(i);
        }

        return this;
    }

    setSize(sizeRatio) {
        if (Array.isArray(sizeRatio)) {
            this.sizeRatio = sizeRatio[sizeRatio.length - 1] ?? this.sizeRatio;

            for (let i = 0; i < this.tiers.length; i++) {
                this.tiers[i].sizeRatio = sizeRatio[i] ?? sizeRatio[sizeRatio.length - 1];
            }
        } else {
            this.sizeRatio = sizeRatio;

            for (let i = 0; i < this.tiers.length; i++) {
                this.tiers[i].sizeRatio = sizeRatio;
            }
        }

        return this;
    }

    /**
     * @param {number|number[]} count segments per rarity
     * @param {boolean|number} clumps whether the segments clump into one ball
     * @param {boolean} splitDamage deprecated: segments no longer split damage, each deals full damage
     */
    setMulti(count, clumps, splitDamage = false) {
        for (let i = 0; i < this.tiers.length; i++) {
            let x = count instanceof Array ? (count[i] ?? count[count.length - 1]) : count;
            this.tiers[i].count = x;
            this.tiers[i].clumps = Boolean(clumps);
        }

        return this;
    }

    /** @param {Drawing} customDrawing */
    setDrawing(customDrawing) {
        if (!(customDrawing instanceof Drawing)) {
            throw new Error("Invalid drawing type");
        }

        this.drawing = customDrawing;
        return this;
    }

    setExtraRadians(extraRadians) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].extraRadians = extraRadians * Math.pow(1.15, i);
        }
        return this;
    }

    setExtraHealth(extraHealth) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].extraHealth = extraHealth * petalTierMultiplier(i);
        }

        return this;
    }

    setConstantHeal(constantHeal, healsInDefense = false, healWhenUnder = 1) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].constantHeal = (constantHeal / 22.5) * petalTierMultiplier(i);
        }

        this.healsInDefense = healsInDefense;
        this.healWhenUnder = healWhenUnder;

        return this;
    }

    setWingMovement(wingMovement) {
        this.wingMovement = wingMovement;
        return this;
    }

    setDamageReduction(damageReduction) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].damageReduction = damageReduction * Math.pow(1.1, i);
        }

        return this;
    }

    setSpeedMultiplier(speedMultiplier) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].speedMultiplier = Math.pow(speedMultiplier, 1 + i / 2.25);
        }

        return this;
    }

    setExtraSize(extraSize) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].extraSize = extraSize + Math.pow(1.5, i);
        }

        return this;
    }

    setDescription(description) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].description = description instanceof Array ? (description[i] ?? description[description.length - 1]) : description;
        }

        return this;
    }

    setLaunchable(launchedSpeed, launchedRange) {
        this.launchable = true;
        this.launchedSpeed = launchedSpeed;
        this.launchedRange = launchedRange;
        return this;
    }

    /**
     * Wall bounces: launched projectiles reflect off terrain instead of
     * breaking, up to count times at the incident angle, then despawn.
     */
    setWallBounces(count) {
        this.wallBounces = count;
        return this;
    }

    /**
     * Pull burst: attacking consumes one live petal and yanks nearby mobs
     * toward the player. Radius in world units, strength as velocity impulse.
     */
    setPullBurst(radius, strength) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].pullBurst = {
                radius: radius instanceof Array ? (radius[i] ?? radius[radius.length - 1]) : radius,
                strength: strength instanceof Array ? (strength[i] ?? strength[strength.length - 1]) : strength
            };
        }

        return this;
    }

    /**
     * Auto lock on fire: among the enemies within angle radians of the firing direction, lock the nearest the player.
     * When unset, keeps the default nearest-to-self lock.
     * @param {number} angle half angle in radians. Math.PI * .15 is about 27 degrees to either side
     */
    setAutoLock(angle) {
        this.autoLockAngle = angle;
        return this;
    }

    setHealing(healing) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].healing = healing * petalTierMultiplier(i);
        }
        return this;
    }

    setYinYang(yinYangMovement) {
        this.yinYangMovement = yinYangMovement;
        return this;
    }

    setEnemySpeedMultiplier(speedMultiplier, duration) {
        this.enemySpeedDebuff = {
            speedMultiplier: speedMultiplier,
            duration: duration * 22.5
        };

        return this;
    }
    setReloadReduction(t, e) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].reloadReduction = t + (e * i);
        }
        return this;
    }
    setPoison(poisonDamage, duration) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].poison = {
                damage: poisonDamage * petalTierMultiplier(i) / 22.5,
                duration: duration * 22.5
            };
        }

        return this;
    }

    setShootOut(shootIndex) {
        this.shootsOut = shootIndex;
        return this;
    }

    setExtraRange(extraRange) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].extraRange = extraRange * Math.pow(1.15, i);
        }

        return this;
    }

    setWearable(wearable) {
        this.wearable = wearable;
        return this;
    }

    setSpawnable(index, rarity, timer, damageMultiplier = 1, healthMultiplier = 6) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].spawnable = {
                index: index,
                rarity: rarity instanceof Array ? (rarity[i] ?? rarity[rarity.length - 1]) : rarity,
                timer: timer * 22.5,
                // Server only: not part of the wire format, so the client never sees them.
                damageMultiplier: damageMultiplier,
                healthMultiplier: healthMultiplier
            };
        }

        return this;
    }

    setExtraVision(extraVision) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].extraVision = extraVision * Math.pow(1.45, i);
        }

        return this;
    }

    setSplits(index, count) {
        this.splits = {
            index: index,
            count: count
        };

        return this;
    }

    setHealSpit(cooldown, range, heal) {
        this.healSpit = {
            cooldown: cooldown,
            range: range,
            heal: heal
        };

        return this;
    }

    setPentagramAbility(cooldown, range, damage, poison, speedDebuff) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].pentagramAbility = {
                cooldown: cooldown,
                range: range * Math.pow(1.15, i),
                damage: damage * petalTierMultiplier(i),
                poison: {
                    damage: (poison.damage / 22.5) * petalTierMultiplier(i),
                    duration: poison.duration * 22.5 * Math.pow(1.1, i)
                },
                speedDebuff: {
                    multiplier: speedDebuff.multiplier,
                    duration: speedDebuff.duration * 22.5 * Math.pow(1.1, i)
                }
            };
        }

        return this;
    }

    setLightning(bounces, range, damage, charges = 1, lightningOnParentHit = false) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].lightning = {
                bounces: bounces instanceof Array ? (bounces[i] ?? bounces[bounces.length - 1]) : bounces,
                range: range * Math.pow(1.15, i),
                damage: damage * petalTierMultiplier(i),
                charges: charges instanceof Array ? (charges[i] ?? charges[charges.length - 1]) : charges,
                lightningOnParentHit: lightningOnParentHit
            };
        }

        return this;
    }

    setExtraPickupRange(extraPickupRange) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].extraPickupRange = extraPickupRange * Math.pow(1.35, i);
        }

        return this;
    }

    setDamageReflection(damageReflection, cap = 0) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].damageReflection = {
                reflection: damageReflection * Math.pow(4 / 3, i),
                cap: cap * Math.pow(1.05, i)
            };
        }

        return this;
    }

    setAttractsLightning(attractsLightning) {
        this.attractsLightning = attractsLightning;
        return this;
    }

    setDensity(density) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].density = density * Math.pow(1.25, i);
        }

        return this;
    }

    setDeathDefying(healthRegain, durationScale) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].deathDefying = {
                health: Math.min(1, healthRegain * Math.pow(1.1883, i)),
                duration: 1.5 + i * durationScale
            };
        }

        return this;
    }

    setPhases(phases) {
        this.phases = Boolean(phases);

        return this;
    }

    setAbsorbsDamage(maxDamage, period) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].absorbsDamage = {
                maxDamage: maxDamage instanceof Array ? (maxDamage[i] ?? maxDamage[maxDamage.length - 1]) : (maxDamage * petalTierMultiplier(i)),
                period: period instanceof Array ? (period[i] ?? period[period.length - 1]) : period
            };
        }

        return this;
    }

    setPlaceDown(canPlaceDown) {
        this.canPlaceDown = Boolean(canPlaceDown);
        return this;
    }

    setShield(shield) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].shield = shield instanceof Array ? (shield[i] ?? shield[shield.length - 1]) : (shield * petalTierMultiplier(i));
        }

        return this;
    }

    setBoost(length, delay) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].boost = {
                length: length instanceof Array ? (length[i] ?? length[length.length - 1]) : length,
                delay: delay instanceof Array ? (delay[i] ?? delay[delay.length - 1]) : delay
            };
        }

        return this;
    }

    setHealBack(healBack) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].healBack = healBack instanceof Array ? (healBack[i] ?? healBack[healBack.length - 1]) : healBack;
        }

        return this;
    }

    setAttractsAggro(attractsAggro) {
        this.attractsAggro = Boolean(attractsAggro);
        return this;
    }

    setIgnoreWalls(ignoreWalls) {
        this.ignoreWalls = Boolean(ignoreWalls);
        return this;
    }

    setLighting(extraLighting) {
        this.extraLighting = extraLighting;
        return this;
    }

    setExtraDamage(minimum, maximum, multiplier) {
        this.extraDamage = {
            minHp: minimum,
            maxHp: maximum,
            multiplier
        }
        return this;
    }
    setArmor(armor) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].armor = armor * petalTierMultiplier(i);
        }

        return this;
    }
    setIcon(size, count, name, rotation) {
        for (let i = 0; i < this.tiers.length; i++) {
            let c2 = count instanceof Array ? (count[i] ?? count[count.length - 1]) : count;
            let s2 = size instanceof Array ? (size[i] ?? size[size.length - 1]) : size;

            this.tiers[i].icon = {
                size: s2,
                count: c2,
                name: name,
                rotation: rotation * Math.PI / 180
            }
        }

        return this;
    }

    setDiceAbility(chance, multiplier) {
        return this.dice = {
            chance: chance,
            multiplier: multiplier
        }, this;
    }

    setBloodLight(baseRatio) {
        const table = globalThis.BLOOD_LIGHT_TABLE;

        if (!table) {
            console.error("BLOOD_LIGHT_TABLE is missing");
            return this;
        }

        for (let e = 0; e < this.tiers.length; e++) {
            if (!this.tiers[e]) continue;

            const tierMultiplier = table[e] ?? table[table.length - 1];

            this.tiers[e].bloodLight = {
                ratio: baseRatio * tierMultiplier
            };
        }

        return this;
    }

    setPomegranate(baseRatio) {
        const table = globalThis.POMEGRANATE_TABLE;

        if (!table) {
            console.error("POMEGRANATE_TABLE is missing");
            return this;
        }

        for (let e = 0; e < this.tiers.length; e++) {
            if (!this.tiers[e]) continue;

            const tierMultiplier = table[e] ?? table[table.length - 1];

            this.tiers[e].pomegranate = {
                ratio: baseRatio * tierMultiplier
            };
        }

        return this;
    }

    setSummonHealing(base) {
        const table = globalThis.SUMMON_HEALING_TABLE;
        if (!table) return this;

        const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
        const fallback = table[keys[keys.length - 1]] ?? 1;

        for (let e = 0; e < this.tiers.length; e++) {
            if (!this.tiers[e]) continue;

            const tierMultiplier = table[e] ?? fallback;
            this.tiers[e].summonHealing = base * tierMultiplier;
        }

        return this;
    }

    setTierRubyAbility(tier) {
        this.rubySummonTiers ??= {};
        this.currentRubyTier = tier;

        this.rubySummonTiers[tier] ??= {
            min: null,
            max: null,
            map: {},
            maxSummon: null,
            description: null
        };

        return this;
    }

    setEmeraldAbility(cooldown, maxClones) {
        this.emerald = {
            cooldown,
            maxClones,
            lastProc: 0,
            activeClones: 0
        };
        return this;
    }

    setTierEmeraldAbility(tier) {
        this.emeraldTiers ??= {};
        this.currentEmeraldTier = tier;

        this.emeraldTiers[tier] ??= {
            min: null,
            max: null
        };

        return this;
    }

    setTierMinimumMobRarityForBloodLeafDamage(tier, minMobRarity) {
        if (!this.minimumMobRarityForBloodLeafDamage) {
            this.minimumMobRarityForBloodLeafDamage = {};
        }

        this.minimumMobRarityForBloodLeafDamage[tier] = minMobRarity;
        return this;
    }

    setTierUraniumAbility(tier) {
        this.uraniumTiers ??= {};
        this.currentUraniumTier = tier;

        this.uraniumTiers[tier] ??= {
            min: null,
            max: null,
            duration: null,
            cooldown: null
        };

        return this;
    }

    setUraniumAbility(duration, cooldown) {
        if (this.currentUraniumTier != null) {
            const tier = this.currentUraniumTier;
            this.uraniumTiers[tier].duration = duration;
            this.uraniumTiers[tier].cooldown = cooldown;
        } else {
            this.uranium = {
                duration,
                cooldown,
                lastProc: 0
            };
        }

        return this;
    }

    setMinimumMobForUraniumAbility(rarity) {
        const tier = this.currentUraniumTier;
        this.uraniumTiers[tier].min = rarity;
        return this;
    }

    setMaximumMobForUraniumAbility(rarity) {
        const tier = this.currentUraniumTier;
        this.uraniumTiers[tier].max = rarity;
        return this;
    }

    setEndTierUraniumAbility() {
        this.currentUraniumTier = null;
        return this;
    }

    setCloverChance(chance) {
        const tier = this.currentCloverTier;

        if (tier != null) {
            this.cloverTiers[tier].chance = chance;
        }

        return this;
    }

    setTierCloverAbility(tier) {
        this.cloverTiers ??= {};
        this.currentCloverTier = tier;

        this.cloverTiers[tier] ??= {
            chance: 0
        };

        return this;
    }

    setPacifyAbility(chance = 0.005) {
        this.pacify = {
            chance
        };

        return this;
    }

    setPetalAttractsAggro(t) {
        return this.petalAttractsAggro = Boolean(t), this;
    }

    setDown(t) {
        return this.stayDown = Boolean(t), this;
    }

    SummonLifetime(ms) {
        const tier = this.currentRubyTier;
        this.rubySummonTiers[tier].lifetime = ms;
        return this;
    }

    SummonRarity(mobRarity, summonRarity) {
        const tier = this.currentRubyTier;
        this.rubySummonTiers[tier].map[mobRarity] = summonRarity;
        return this;
    }

    MinimumSummonRarity(mobRarity, summonRarity) {
        const tier = this.currentRubyTier;
        const obj = this.rubySummonTiers[tier];

        obj.min = mobRarity;
        obj.map[mobRarity] = summonRarity;

        return this;
    }

    MaximumSummonRarity(mobRarity, summonRarity) {
        const tier = this.currentRubyTier;
        const obj = this.rubySummonTiers[tier];

        obj.max = mobRarity;
        obj.maxSummon = summonRarity;

        return this;
    }

    endTierRubyAbility() {
        this.currentRubyTier = null;
        return this;
    }

    MinimumMobRarity(rarity) {
        const tier = this.currentEmeraldTier;
        this.emeraldTiers[tier].min = rarity;
        return this;
    }

    MaximumMobRarity(rarity) {
        const tier = this.currentEmeraldTier;
        this.emeraldTiers[tier].max = rarity;
        return this;
    }

    endTierEmeraldAbility() {
        this.currentEmeraldTier = null;
        return this;
    }

    endTierCloverAbility() {
        this.currentCloverTier = null;
        return this;
    }
}

export class MobDrop {
    index = 0;
    minRarity = 0;
    chance = 1;
}

export class MobConfig {
    static idAccumulator = 0;

    #initTiers() {
        const output = [];

        for (let i = 0; i < tiers.length; i++) {
            output.push(new MobTier(i, this.health, this.damage, this.size));
        }

        return output;
    }

    constructor(name, health, damage, size, speed) {
        this.id = MobConfig.idAccumulator++;
        this.name = name;

        globalThis._mobList.push(this);

        this.health = health;
        this.damage = damage;
        this.size = size;
        this.speed = speed;
        this.aggressive = false;
        this.neutral = false;

        /**
         * Per-rarity size step. Defaults to matching MobTier.SIZE_STEP,
         * individual mobs can lower it so high rarities do not grow too large.
         * @type {number}
         */
        this.sizeStep = MobTier.SIZE_STEP;

        /**
         * Chance that this mob spawns directly as its shiny variant.
         * Replaces listing shiny mobs separately in the ant hole spawns.
         * @type {number}
         */
        this.shinyChance = 0;

        /**
         * Mob id of the shiny variant, 0 means unset.
         * @type {number}
         */
        this.shinyID = 0;

        this.spawnable = true;
        this.sandstormMovement = false;
        this.damageReflection = {
            reflection: 0,
            cap: 0
        };

        this.tiers = this.#initTiers();

        /** @type {MobDrop[]} */
        this.drops = [];

        this.drawing = null;

        /** @type {{index: number, time: number}[]|null} */
        this.hatchables = null;

        /** @type {{index: number, interval: number}|null} */
        this.poopable = null;

        this.isSystem = false;

        /**
         * Wire-only override of the hideUI bit (the byte the client reads as hideUI while the
         * server keeps isSystem). Used for centipede segments: their bar has to show on the
         * stock client without touching the server's isSystem semantics.
         * undefined falls back to isSystem.
         */
        this.wireHideUI = undefined;

        this.movesInBursts = false;
        this.moveInSines = false;

        this.pushability = 1;

        this.sizeRand = {
            min: 1,
            max: 0,
        };

        this.wavesIconSize = 3.5;
    }

    setSystem(isSystem) {
        this.isSystem = Boolean(isSystem);
        return this;
    }

    setMovesInBursts(movesInBursts) {
        this.movesInBursts = Boolean(movesInBursts);
        return this;
    }

    setAggressive(aggressive) {
        this.aggressive = Boolean(aggressive);
        return this;
    }

    setNeutral(neutral) {
        this.neutral = Boolean(neutral);
        return this;
    }

    setSandstormMovement(sandstormMovement) {
        this.sandstormMovement = Boolean(sandstormMovement);
        return this;
    }

    setCentipedeMovement(centipedeMovement) {
        this.centipedeMovement = Boolean(centipedeMovement);
        return this;
    }

    setBumblebeeMovement(bumblebeeMovement) {
        this.bumblebeeMovement = Boolean(bumblebeeMovement);
        return this;
    }

    setDesertCentipedeMovement(desertCentipedeMovement) {
        this.desertCentipedeMovement = Boolean(desertCentipedeMovement);
        return this;
    }

    setDamageReduction(damageReduction) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].damageReduction = damageReduction * Math.pow(1.1, i);
        }

        return this;
    }

    setDamageReflection(damageReflection, cap = 0) {
        this.damageReflection = {
            reflection: damageReflection,
            cap: cap
        };

        return this;
    }

    setArmor(armor) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].armor = armor * Math.pow(PetalTier.DAMAGE_SCALE, i);
        }

        return this;
    }

    /** @param {{aimbot: boolean, petalIndex: number, cooldown: number, health: number, damage: number, speed: number, range: number, size: number, multiShot: {count:number,delay:number,spread:number}|null, runs: boolean, nullCollision: boolean}} projectile */
    setProjectile(projectile = {}) {
        for (let i = 0; i < this.tiers.length; i++) {
        
            this.tiers[i].projectile = {
                petalIndex: projectile.petalIndex ?? 0,
                cooldown: projectile.cooldown ?? 10,
                health: (projectile.health ?? 1) * Math.pow(PetalTier.HEALTH_SCALE, i),
                damage: ((projectile.damage ?? 1) * Math.pow(PetalTier.DAMAGE_SCALE, i)) * .75,
                speed: projectile.speed ?? 5,
                range: (projectile.range ?? 50) * Math.pow(MobTier.RANGE_SCALE, i),
                size: projectile.size ?? .35,
                multiShot: projectile.multiShot ?? null,
                runs: projectile.runs ?? false,
                nullCollision: projectile.nullCollision ?? false,
                aimbot: projectile.aimbot ?? false
            };
        }

        return this;
    }

    addDrop(index, chance = 1, minRarity = 0) {
        if (index < 0 || index > 255) {
            throw new Error("Invalid drop index");
        }

        const drop = new MobDrop();
        drop.index = index;
        drop.minRarity = minRarity;
        drop.chance = chance;

        this.drops.push(drop);
        return this;
    }

    setPoison(poisonDamage, duration) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].poison = {
                damage: poisonDamage * Math.pow(PetalTier.DAMAGE_SCALE, i) / 22.5,
                duration: duration * 22.5
            };
        }

        return this;
    }

    setLightning(cooldown, bounces, range, damage) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].lightning = {
                cooldown: cooldown instanceof Array ? (cooldown[i] ?? cooldown[cooldown.length - 1]) : cooldown,
                bounces: bounces instanceof Array ? (bounces[i] ?? bounces[bounces.length - 1]) : bounces,
                range: range * Math.pow(1.15, i),
                damage: damage * Math.pow(PetalTier.DAMAGE_SCALE, i)
            };
        }

        return this;
    }

    setSize(baseSize, sizeStep = MobTier.SIZE_STEP) {
        this.size = baseSize;
        this.sizeStep = sizeStep;
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].size = baseSize + sizeStep * i;
        }

        return this;
    }

    /**
     * Only adjusts the per-rarity size step, the base size is unchanged.
     */
    setSizeStep(sizeStep) {
        this.sizeStep = sizeStep;
        return this;
    }

    /**
     * Sets the shiny variant: when this mob spawns it has a shinyChance of being replaced by the mob shinyID points at.
     * @param {number} shinyID
     * @param {number} shinyChance
     */
    setShinyVariant(shinyID, shinyChance) {
        this.shinyID = shinyID;
        this.shinyChance = shinyChance;
        return this;
    }

    setDrawing(customDrawing) {
        if (!(customDrawing instanceof Drawing)) {
            throw new Error("Invalid drawing type");
        }

        this.drawing = customDrawing;
        return this;
    }

    /** @param {{index:number,count:number|number[],minHealthRatio?:number,chance?:number}[]} data */
    setAntHoleSpawns(data) {
        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].antHoleSpawns = data.map(({ index, count, minHealthRatio, chance }) => ({
                index: index,
                count: count instanceof Array ? (count[i] ?? count[count.length - 1]) : count,
                minHealthRatio: minHealthRatio ?? 1,
                chance: chance ?? 1
            }));
        }

        return this;
    }

    /** @param {{index:number,time:number}[]|{index:number,time:number}} hatchable */
    setHatchables(hatchable) {
        if (hatchable instanceof Array) {
            for (let i = 0; i < hatchable.length; i++) {
                if (hatchable[i].index < 0 || hatchable[i].index > 255) {
                    throw new Error("Invalid hatchable index");
                }
            }

            this.hatchables = hatchable;
        } else {
            if (hatchable.index < 0 || hatchable.index > 255) {
                throw new Error("Invalid hatchable index");
            }

            this.hatchables = [hatchable];
        }

        return this;
    }

    /** @param {{index:number,interval:number}} poopable */
    setPoopable(poopable) {
        if (poopable.index < 0 || poopable.index > 255) {
            throw new Error("Invalid poopable index");
        }

        this.poopable = poopable;
        return this;
    }

    segmentWith(index) {
        this.segment = index;
        return this;
    }

    setMoveInSines(moveInSines) {
        this.moveInSines = Boolean(moveInSines);
        return this;
    }

    setSpins(spinRate, constant = false) {
        this.spins = {
            rate: spinRate,
            constant: Boolean(constant),
        };
        return this;
    }

    setFleeAtLowHealth(healthRatio) {
        this.fleeAtLowHealth = healthRatio;
        return this;
    }

    setHealing(healPercent = 0) {
        this.healing = healPercent;
        return this;
    }

    setPushability(pushability) {
        this.pushability = pushability;

        return this;
    }

    branchWith(index, branches, branchLength) {
        this.branch = {
            index,
            branches,
            branchLength,
        };
        return this;
    }

    setStrafes(length, cooldown, speedMult) {
        this.strafes = {
            length,
            cooldown,
            speedMult
        }
        return this;
    }

    setWavesIconSize(wavesIconSize) {
        this.wavesIconSize = wavesIconSize;
        return this;
    }

    setDensity(t) {
        for (let e = 0; e < this.tiers.length; e++)
            this.tiers[e].density = t * Math.pow(1.25, e);
        return this;
    }

    setFixedDamageReflection(values) {
        const table = values ?? [
            1, 2, 3, 3, 4,
            8, 10, 25, 40, 200,
            400, 600, 1200, 3500, 6000,
            62000, 320000, 1000000, 6000000, 38000000,
            150000000, 300000000, 1500000000, 3000000000
        ];

        for (let i = 0; i < this.tiers.length; i++) {
            this.tiers[i].fixedDamageReflection = {
                damage: table[i] ?? table[table.length - 1]
            };
        }

        return this;
    }

    setThornSpawn(chance, mobName, speed = 12) {
        this.thornSpawn = {
            chance,
            mobName,
            speed
        };

        return this;
    }
}

export const CLIENT_BOUND = {
    KICK: 0x00,
    READY: 0x01,
    MESSAGE: 0x02,
    WORLD_UPDATE: 0x03,
    DEATH: 0x04,
    ROOM_UPDATE: 0x05,
    UPDATE_ASSETS: 0x06,
    JSON_MESSAGE: 0x07,
    PONG: 0x08,
    TERRAIN: 0x09,
    CHAT_MESSAGE: 0x0A,
    CRAFT_INIT: 0x0B,
    CRAFT_RESULT: 0x0C,

    CUSTOM_GRADIENTS: 111,
    TERRAIN_SCORES: 113,
    DROPS_AMOUNT_UPDATE: 250,

    // Section: Options that seem to be unused by server.
    // This info is sent via `CLIENT_BOUND.WORLD_UPDATE` instead.
    UNUSED_INVENTORY_UPDATE: 110,
};

export const SERVER_BOUND = {
    VERIFY: 0x00,
    SPAWN: 0x01,
    INPUTS: 0x02,
    CHANGE_LOADOUT: 0x03,
    DEV_CHEAT: 0x04,
    PING: 0x05,
    CHAT_MESSAGE: 0x06,
    INVENTORY_CHANGE_LOADOUT: 0x07,
    CRAFT_REQUEST: 0x08,
};

export const DEV_CHEAT_IDS = {
    TELEPORT: 0x00,
    GODMODE: 0x01,
    CHANGE_TEAM: 0x02,
    SPAWN_MOB: 0x03,
    SET_PETAL: 0x04,
    SET_XP: 0x05,
    INFO_DUMP: 0x06
};

// In an 8 bit flag, 0x80 is the highest bit that can be set (0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80)
export const ENTITY_FLAGS = {
    NEW: 0x00,
    DIE: 0x01,
    POSITION: 0x02,
    SIZE: 0x04,
    FACING: 0x08,
    FLAGS: 0x10,
    HEALTH: 0x20,
    DISPLAY: 0x40,
    ROPE_BODIES: 0x80
};

export const ENTITY_MODIFIER_FLAGS = {
    HIT: 0x01,
    POISON: 0x02,
    ATTACK: 0x04,
    DEFEND: 0x08,
    TDM: 0x10,
    FRIEND: 0x20,
    WEARABLES: 0x40
};

export const WEARABLES = {
    ANTENNAE: 0x01,
    THIRD_EYE: 0x02,
    CUTTER: 0x04,
    AMULET: 0x08,
    AIR: 0x10,
    ARMOR: 0x20,
};

export const ROUTER_PACKET_TYPES = {
    CLOSE_CLIENT: 0x00,
    PIPE_PACKET: 0x01,
    ANALYTICS_DATA: 0x03
};

export const ENTITY_TYPES = {
    STANDARD: 0,
    PLAYER: 1,
    PETAL: 2,
    MOB: 3,
    PROJECTILE: 4
};

export const BIOME_TYPES = {
    DEFAULT: 0,
    GARDEN: 1,
    DESERT: 2,
    OCEAN: 3,
    ANT_HELL: 4,
    HELL: 5,
    SEWERS: 6,
    DARK_FOREST: 7,
    HALLOWEEN: 8,
    CRYPT: 9
};

export const BIOME_BACKGROUNDS = {
    [BIOME_TYPES.DEFAULT]: {
        name: "Default",
        color: "#718083",
        tile: "tiles/allMobs.svg"
    },
    [BIOME_TYPES.GARDEN]: {
        name: "Garden",
        color: "#1EA660",
        tile: "tiles/garden.svg"
    },
    [BIOME_TYPES.DESERT]: {
        name: "Desert",
        color: "#ECDCB8",
        tile: "tiles/desert.svg"
    },
    [BIOME_TYPES.OCEAN]: {
        name: "Ocean",
        color: "#6D96BE",
        tile: "tiles/ocean.svg",
        alt: "tiles/oceanAlt.svg"
    },
    [BIOME_TYPES.ANT_HELL]: {
        name: "Ant Hell",
        color: "#8E603F",
        tile: "tiles/antHell.svg"
    },
    [BIOME_TYPES.HELL]: {
        name: "Hell",
        color: "#973332",
        tile: "tiles/hell.svg"
    },
    [BIOME_TYPES.SEWERS]: {
        name: "Sewers",
        color: "#676733",
        tile: "tiles/sewer.svg",
        //alt: "tiles/sewersAlt.svg"
    },
    [BIOME_TYPES.DARK_FOREST]: {
        name: "Dark Forest",
        color: "#2C5037",
        tile: "tiles/forest.svg"
    },
    [BIOME_TYPES.HALLOWEEN]: {
        name: "Halloween",
        color: "#CF5704",
        tile: "tiles/pumpkin.svg"
    },
    [BIOME_TYPES.CRYPT]: {
        name: "Crypt",
        color: "#000000",
        tile: "tiles/pumpkin.svg"
    }
};

export class Drawing {
    static actions = {
        circle: [0, "x", "y", "radius"],
        rect: [1, "x", "y", "width", "height"],
        text: [2, "x", "y", "size", "text"],
        line: [3, "x1", "y1", "x2", "y2"],
        arc: [4, "x", "y", "radius", "startAngle", "endAngle"],
        beginPath: [5],
        closePath: [6],
        moveTo: [7, "x", "y"],
        lineTo: [8, "x", "y"],
        stroke: [9, "color", "lineWidth", "strokeDarkness"],
        fill: [10, "color"],
        paint: [11, "color", "lineWidth", "strokeDarkness"],
        polygon: [12, "sides", "radius", "rotation"],
        spikeBall: [13, "sides", "radius", "rotation"],
        dipPolygon: [14, "sides", "radius", "dipMult", "rotation"],
        opacity: [15, "opacity"],
        blur: [16, "color", "strength"],
        noBlur: [17],
        ellipse: [18, "x", "y", "radiusX", "radiusY", "rotation"],
        quadraticCurveTo: [19, "cx", "cy", "x", "y"],
        bezierCurveTo: [20, "cx1", "cy1", "cx2", "cy2", "x", "y"],
        rotate: [21, "degrees"],
    };

    static reverseActions = Object.fromEntries(Object.keys(Drawing.actions).map(key => [Drawing.actions[key][0], key]));

    static fromString(str) {
        const drawing = new Drawing();
        drawing.actions = str.split(";").map(action => {
            const [actionName, ...args] = action.split(",").map(arg => {
                if (arg === "") return undefined;
                if (arg[0] === "#") return arg;
    
                if (typeof arg === "string" && (arg === "date" || arg.startsWith("date_"))) {
                    return arg;
                }
    
                const num = parseFloat(arg);
                return isNaN(num) ? arg : num;
            });
    
            return [actionName, ...args];
        });
    
        return drawing;
    }

    constructor() {
        this.actions = [];
    }

    addAction(actionName, ...args) {
        const action = Drawing.actions[actionName];

        if (!action) {
            throw new Error(`Unknown action: ${actionName}`);
        }

        if (args.length !== action.length - 1) {
            throw new Error(`Invalid number of arguments for action ${actionName}, please provide ${action.slice(1).join(", ")}`);
        }

        this.actions.push([action[0], ...args]);
        return this;
    }

    getActions(name) {
        return this.actions.filter(action => action[0] === Drawing.actions[name][0]);
    }

    toString() {
        return this.actions.map(action => action.join(",")).join(";");
    }
}

export class Reader {
    constructor(view, offset, littleEndian) {
        this.reader = true;
        this._e = littleEndian;
        if (view) this.repurpose(view, offset);
    }

    repurpose(view, offset) {
        this.view = view;
        this._o = offset || 0;
    }

    getUint8() {
        return this.view.getUint8(this._o++, this._e);
    }

    getInt8() {
        return this.view.getInt8(this._o++, this._e);
    }

    getUint16() {
        return this.view.getUint16((this._o += 2) - 2, this._e);
    }

    getInt16() {
        return this.view.getInt16((this._o += 2) - 2, this._e);
    }

    getUint32() {
        return this.view.getUint32((this._o += 4) - 4, this._e);
    }

    getInt32() {
        return this.view.getInt32((this._o += 4) - 4, this._e);
    }

    getFloat32() {
        return this.view.getFloat32((this._o += 4) - 4, this._e);
    }

    getFloat64() {
        return this.view.getFloat64((this._o += 8) - 8, this._e);
    }

    getStringUTF8() {
        let s = '';
        let b;
        while ((b = this.view.getUint8(this._o++)) !== 0) s += String.fromCharCode(b);
        return decodeURIComponent(escape(s));
    }
}

export class Writer {
    constructor(littleEndian) {
        this.writer = true;
        this.tmpBuf = new DataView(new ArrayBuffer(8));
        this._e = littleEndian;
        this.reset();
        return this;
    }

    reset(littleEndian = this._e) {
        this._e = littleEndian;
        this._b = [];
        this._o = 0;
    }

    setUint8(a) {
        //if (!Number.isInteger(a) || a < 0 || a > 255) throw new Error("Invalid setUint8 value " + a);

        if (a >= 0 && a < 256) this._b.push(a);
        return this;
    }

    setInt8(a) {
        //if (!Number.isInteger(a) || a < -128 || a > 127) throw new Error("Invalid setInt8 value " + a);

        if (a >= -128 && a < 128) this._b.push(a);
        return this;
    }

    setUint16(a) {
        //if (!Number.isInteger(a) || a < 0 || a > 65535) throw new Error("Invalid setUint16 value " + a);

        this.tmpBuf.setUint16(0, a, this._e);
        this._move(2);
        return this;
    }

    setInt16(a) {
        //if (!Number.isInteger(a) || a < -32768 || a > 32767) throw new Error("Invalid setInt16 value " + a);

        this.tmpBuf.setInt16(0, a, this._e);
        this._move(2);
        return this;
    }

    setUint32(a) {
        //if (!Number.isInteger(a) || a < 0 || a > 4294967295) throw new Error("Invalid setUint32 value " + a);

        this.tmpBuf.setUint32(0, a, this._e);
        this._move(4);
        return this;
    }

    setInt32(a) {
        //if (!Number.isInteger(a) || a < -2147483648 || a > 2147483647) throw new Error("Invalid setInt32 value " + a);

        this.tmpBuf.setInt32(0, a, this._e);
        this._move(4);
        return this;
    }

    setFloat32(a) {
        //if (!Number.isFinite(a)) throw new Error("Invalid setFloat32 value " + a);

        this.tmpBuf.setFloat32(0, a, this._e);
        this._move(4);
        return this;
    }

    setFloat64(a) {
        //if (!Number.isFinite(a)) throw new Error("Invalid setFloat64 value " + a);

        this.tmpBuf.setFloat64(0, a, this._e);
        this._move(8);
        return this;
    }

    _move(b) {
        for (let i = 0; i < b; i++) this._b.push(this.tmpBuf.getUint8(i));
    }

    setStringUTF8(s) {
        const bytesStr = unescape(encodeURIComponent(s));
        //if (typeof bytesStr !== "string") throw new Error("Invalid setStringUTF8 value " + s);
        for (let i = 0, l = bytesStr.length; i < l; i++) {
            //if (bytesStr.charCodeAt(i) > 255) throw new Error("Invalid setStringUTF8 value " + s);
            this._b.push(bytesStr.charCodeAt(i));
        }
        this._b.push(0);
        return this;
    }

    build() {
        return new Uint8Array(this._b);
    }
}

/** @param {PetalConfig} config */
export function encodePetalConfig(config) {
    const output = [config.id, config.name, config.cooldown, 0x00];

    const flagsIndex = output.length - 1;

    if (config.tiers[0].extraHealth !== 0) {
        output[flagsIndex] |= 0x01;
    }

    if (config.tiers[0].constantHeal !== 0) {
        output[flagsIndex] |= 0x02;
    }

    if (config.tiers.some(t => t.count > 1)) {
        output[flagsIndex] |= 0x04;
    }

    if (config.tiers[0].damageReduction !== 0) {
        output[flagsIndex] |= 0x08;
    }

    if (config.tiers[0].speedMultiplier !== 1) {
        output[flagsIndex] |= 0x10;
    }

    if (config.tiers[0].extraSize !== 0) {
        output[flagsIndex] |= 0x20;
    }

    if (config.tiers[0].healing !== 0) {
        output[flagsIndex] |= 0x40;
    }

    if (config.tiers[0].extraRadians > 0) {
        output[flagsIndex] |= 0x80;
    }

    if (config.tiers[0].poison) {
        output[flagsIndex] |= 0x400;
    }

    if (config.tiers[0].extraRange > 0) {
        output[flagsIndex] |= 0x800;
    }

    if (config.tiers[0].spawnable) {
        output[flagsIndex] |= 0x2000;
    }

    if (config.tiers[0].extraVision > 0 || config.tiers[0].extraVision < 0) {
        output[flagsIndex] |= 0x4000;
    }

    if (config.tiers[0].pentagramAbility) {
        output[flagsIndex] |= 0x8000;
    }

    if (config.tiers[0].lightning) {
        output[flagsIndex] |= 0x10000;
    }

    if (config.tiers[0].extraPickupRange > 0) {
        output[flagsIndex] |= 0x20000;
    }

    if (config.healSpit?.heal > 0) {
        output[flagsIndex] |= 0x40000;
    }

    if (config.tiers[0].damageReflection !== null) {
        output[flagsIndex] |= 0x80000;
    }

    if (config.tiers[0].density !== 1) {
        output[flagsIndex] |= 0x100000;
    }

    if (config.tiers[0].deathDefying !== null) {
        output[flagsIndex] |= 0x200000;
    }

    if (config.tiers[0].absorbsDamage) {
        output[flagsIndex] |= 0x400000;
    }

    if (config.tiers[0].shield > 0) {
        output[flagsIndex] |= 0x800000;
    }

    if (config.tiers[0].boost !== null) {
        output[flagsIndex] |= 0x1000000;
    }

    if (config.tiers[0].healBack > 0 || config.tiers[0].healBack < 0) {
        output[flagsIndex] |= 0x4000000;
    }

    if (config.extraLighting > 0) {
        output[flagsIndex] |= 0x8000000;
    }

    if (config.tiers[0].armor !== 0) {
        output[flagsIndex] |= 0x20000000;
    }

    if (config.tiers[0].icon !== null) {
        output[flagsIndex] |= 0x80000000;
    }

    output.push(...config.tiers.flatMap((tier, tierID) => {
        const tierOutput = [tier.health, tier.damage, tier.description];

        if (output[flagsIndex] & 0x01) {
            tierOutput.push(tier.extraHealth);
        }

        if (output[flagsIndex] & 0x02) {
            tierOutput.push(tier.constantHeal);
        }

        if (output[flagsIndex] & 0x04) {
            tierOutput.push(tier.count);
        }

        if (output[flagsIndex] & 0x08) {
            tierOutput.push(tier.damageReduction);
        }

        if (output[flagsIndex] & 0x10) {
            tierOutput.push(tier.speedMultiplier);
        }

        if (output[flagsIndex] & 0x20) {
            tierOutput.push(tier.extraSize);
        }

        if (output[flagsIndex] & 0x40) {
            tierOutput.push(tier.healing);
        }

        if (output[flagsIndex] & 0x80) {
            tierOutput.push(tier.extraRadians);
        }

        if (output[flagsIndex] & 0x400) {
            tierOutput.push(tier.poison.damage, tier.poison.duration / 22.5);
        }

        if (output[flagsIndex] & 0x800) {
            tierOutput.push(tier.extraRange);
        }

        if (output[flagsIndex] & 0x2000) {
            tierOutput.push(tier.spawnable.index, tier.spawnable.rarity, tier.spawnable.timer);
        }

        if (output[flagsIndex] & 0x4000) {
            tierOutput.push(tier.extraVision);
        }

        if (output[flagsIndex] & 0x8000) {
            tierOutput.push(
                tier.pentagramAbility.cooldown,
                tier.pentagramAbility.range,
                tier.pentagramAbility.damage,
                tier.pentagramAbility.poison.damage,
                tier.pentagramAbility.poison.duration,
                tier.pentagramAbility.speedDebuff.multiplier,
                tier.pentagramAbility.speedDebuff.duration
            );
        }

        if (output[flagsIndex] & 0x10000) {
            tierOutput.push(tier.lightning.bounces, tier.lightning.range, tier.lightning.damage, tier.lightning.charges);
        }

        if (output[flagsIndex] & 0x20000) {
            tierOutput.push(tier.extraPickupRange);
        }

        if (output[flagsIndex] & 0x40000) {
            tierOutput.push(config.healSpit.heal * petalTierMultiplier(tierID));
        }

        if (output[flagsIndex] & 0x80000) {
            tierOutput.push(tier.damageReflection.reflection, tier.damageReflection.cap);
        }

        if (output[flagsIndex] & 0x100000) {
            tierOutput.push(tier.density);
        }

        if (output[flagsIndex] & 0x200000) {
            tierOutput.push(tier.deathDefying.health, tier.deathDefying.duration);
        }

        if (output[flagsIndex] & 0x400000) {
            tierOutput.push(tier.absorbsDamage.maxDamage, tier.absorbsDamage.period / 22.5);
        }

        if (output[flagsIndex] & 0x800000) {
            tierOutput.push(tier.shield);
        }

        if (output[flagsIndex] & 0x1000000) {
            tierOutput.push(tier.boost.length, tier.boost.delay / 22.5);
        }

        if (output[flagsIndex] & 0x4000000) {
            tierOutput.push(tier.healBack);
        }

        if (output[flagsIndex] & 0x20000000) {
            tierOutput.push(tier.armor);
        }

        if (output[flagsIndex] & 0x80000000) {
            tierOutput.push(tier.icon.size, tier.icon.count, tier.icon.name, tier.icon.rotation);
        }

        return tierOutput;
    }));

    if (config.drawing?.toString().length > 0) {
        output[flagsIndex] |= 0x100;
        output.push(config.drawing.toString());
    }

    if (config.enemySpeedDebuff) {
        output[flagsIndex] |= 0x200;
        output.push(config.enemySpeedDebuff.speedMultiplier, config.enemySpeedDebuff.duration);
    }

    if (config.wearable) {
        output[flagsIndex] |= 0x1000;
    }

    if (config.healWhenUnder < 1) {
        output[flagsIndex] |= 0x2000000;
        output.push(config.healWhenUnder);
    }

    if (output[flagsIndex] & 0x8000000) {
        output.push(config.extraLighting);
    }

    if (config.extraDamage) {
        output[flagsIndex] |= 0x10000000;
        output.push(
            config.extraDamage.minHp,
            config.extraDamage.maxHp,
            config.extraDamage.multiplier
        );
    }

    if (config.splits) {
        output[flagsIndex] |= 0x40000000;
        output.push(config.splits.count);
    }

    return output.map(value => {
        if (Number.isFinite(value)) {
            return +value.toFixed(2);
        }

        return value;
    });
}

export function decodePetalConfig(data, nTiers) {
    const output = {
        id: data.shift(),
        name: data.shift(),
        cooldown: data.shift(),
        tiers: [],
        drawing: undefined,
        healWhenUnder: 1
    };

    const flags = data.shift();

    for (let i = 0; i < nTiers; i++) {
        const tier = {
            health: data.shift(),
            damage: data.shift(),
            description: data.shift(),
            extraHealth: 0,
            constantHeal: 0,
            healing: 0,
            count: 1,
            damageReduction: 0,
            speedMultiplier: 1,
            extraSize: 0,
            density: 1,
            extraRadians: 0,
            armor: 0,
            icon: null
        };

        if (flags & 0x01) {
            tier.extraHealth = data.shift();
        }

        if (flags & 0x02) {
            tier.constantHeal = data.shift();
        }

        if (flags & 0x04) {
            tier.count = data.shift();
        }

        if (flags & 0x08) {
            tier.damageReduction = data.shift();
        }

        if (flags & 0x10) {
            tier.speedMultiplier = data.shift();
        }

        if (flags & 0x20) {
            tier.extraSize = data.shift();
        }

        if (flags & 0x40) {
            tier.healing = data.shift();
        }

        if (flags & 0x80) {
            tier.extraRadians = data.shift();
        }

        if (flags & 0x400) {
            tier.poison = {
                damage: data.shift() * 22.5,
                duration: data.shift()
            };
        }

        if (flags & 0x800) {
            tier.extraRange = data.shift();
        }

        if (flags & 0x2000) {
            tier.spawnable = {
                index: data.shift(),
                rarity: data.shift(),
                timer: data.shift() / 22.5
            };
        }

        if (flags & 0x4000) {
            tier.extraVision = data.shift();
        }

        if (flags & 0x8000) {
            tier.pentagramAbility = {
                cooldown: data.shift(),
                range: data.shift(),
                damage: data.shift(),
                poison: {
                    damage: data.shift() * 22.5,
                    duration: data.shift() / 22.5
                },
                speedDebuff: {
                    multiplier: data.shift(),
                    duration: data.shift() / 22.5
                }
            };
        }

        if (flags & 0x10000) {
            tier.lightning = {
                bounces: data.shift(),
                range: data.shift(),
                damage: data.shift(),
                charges: data.shift()
            };
        }

        if (flags & 0x20000) {
            tier.extraPickupRange = data.shift();
        }

        if (flags & 0x40000) {
            tier.healSpit = data.shift();
        }

        if (flags & 0x80000) {
            tier.damageReflection = {
                reflection: data.shift(),
                cap: data.shift()
            };
        }

        if (flags & 0x100000) {
            tier.density = data.shift();
        }

        if (flags & 0x200000) {
            tier.deathDefying = {
                health: data.shift(),
                duration: data.shift()
            };
        }

        if (flags & 0x400000) {
            tier.absorbsDamage = {
                maxDamage: data.shift(),
                period: data.shift()
            };
        }

        if (flags & 0x800000) {
            tier.shield = data.shift();
        }

        if (flags & 0x1000000) {
            tier.boost = {
                length: data.shift(),
                delay: data.shift()
            };
        }

        if (flags & 0x4000000) {
            tier.healBack = data.shift();
        }

        if (flags & 0x20000000) {
            tier.armor = data.shift();
        }

        if (flags & 0x80000000) {
            tier.icon = {
                size: data.shift(),
                count: data.shift(),
                name: data.shift(),
                rotation: data.shift()
            };
        }

        output.tiers.push(tier);
    }

    if (flags & 0x100) {
        output.drawing = Drawing.fromString(data.shift());
    }

    if (flags & 0x200) {
        output.enemySpeedDebuff = {
            speedMultiplier: data.shift(),
            duration: data.shift()
        };
    }

    if (flags & 0x1000) {
        output.wearable = true;
    }

    if (flags & 0x2000000) {
        output.healWhenUnder = data.shift();
    }

    if (flags & 0x8000000) {
        output.extraLighting = data.shift();
    }

    if (flags & 0x10000000) {
        output.extraDamage = {
            minHp: data.shift(),
            maxHp: data.shift(),
            multiplier: data.shift()
        }
    }

    if (flags & 0x40000000) {
        output.splits = data.shift();
    }

    return output;
}

export function encodePetalConfigs(configs) {
    const output = [configs.length];

    for (const config of configs) {
        const encoded = encodePetalConfig(config);
        output.push(...encoded);
    }

    return output;
}

export function decodePetalConfigs(data, nTiers) {
    const configs = [];
    const nPetals = data.shift();

    for (let i = 0; i < nPetals; i++) {
        configs.push(decodePetalConfig(data, nTiers));
    }

    return configs;
}

/** @param {MobConfig} config */
function encodeMobConfig(config) {
    const output = [config.id, config.name, +(config.wireHideUI ?? config.isSystem), config.drops, 0x00];

    const flagsIndex = output.length - 1;

    if (config.tiers[0].damageReduction !== 0) {
        output[flagsIndex] |= 0x01;
    }

    if (config.tiers[0].poison) {
        output[flagsIndex] |= 0x02;
    }

    if (config.tiers[0].lightning) {
        output[flagsIndex] |= 0x04;
    }

    if (config.damageReflection) {
        output[flagsIndex] |= 0x08;
    }

    if (config.tiers[0].armor !== 0) {
        output[flagsIndex] |= 0x10;
    }

    if (config.healing) {
        output[flagsIndex] |= 0x20;
    }

    if (config.tiers[0].projectile) {
        output[flagsIndex] |= 0x40;
    }

    if (config.wavesIconSize) {
        output[flagsIndex] |= 0x100;
    }

    output.push(...config.tiers.flatMap((tier, tierID) => {
        const tierOutput = [tier.health, tier.damage];

        if (output[flagsIndex] & 0x01) {
            tierOutput.push(tier.damageReduction);
        }

        if (output[flagsIndex] & 0x02) {
            tierOutput.push(tier.poison.damage, tier.poison.duration / 22.5);
        }

        if (output[flagsIndex] & 0x04) {
            tierOutput.push(tier.lightning.damage);
        }

        if (output[flagsIndex] & 0x10) {
            tierOutput.push(tier.armor);
        }

        if (output[flagsIndex] & 0x40) {
            tierOutput.push(tier.projectile.health, tier.projectile.damage, tier.projectile.petalIndex, tier.projectile.range);
        }

        return tierOutput;
    }));

    if (output[flagsIndex] & 0x08) {
        output.push(config.damageReflection.reflection, config.damageReflection.cap);
    }

    if (output[flagsIndex] & 0x20) {
        output.push(config.healing);
    }

    if (config.drawing?.toString().length > 0) {
        output[flagsIndex] |= 0x80;
        output.push(config.drawing.toString());
    }

    if (output[flagsIndex] & 0x100) {
        output.push(config.wavesIconSize);
    }

    return output.map(value => {
        if (Number.isFinite(value)) {
            return +value.toFixed(2);
        }

        return value;
    });
}

function decodeMobConfig(data, nTiers) {
    const output = {
        id: data.shift(),
        name: data.shift(),
        hideUI: data.shift() === 1,
        drops: data.shift(),
        drawing: undefined,
        tiers: [],
        wavesIconSize: 3.5
    };

    const flags = data.shift();

    for (let i = 0; i < nTiers; i++) {
        const tier = {
            health: data.shift(),
            damage: data.shift(),
            healing: 0,
            damageReduction: 0,
            poison: null,
            lightning: 0,
            damageReflection: null,
            armor: 0,
            projectile: null
        };

        if (flags & 0x01) {
            tier.damageReduction = data.shift();
        }

        if (flags & 0x02) {
            tier.poison = {
                damage: data.shift() * 22.5,
                duration: data.shift()
            };
        }

        if (flags & 0x04) {
            tier.lightning = data.shift();
        }

        if (flags & 0x10) {
            tier.armor = data.shift();
        }

        if (flags & 0x40) {
            tier.projectile = {
                health: data.shift(),
                damage: data.shift(),
                index: data.shift(),
                range: data.shift()
            };
        }

        output.tiers.push(tier);
    }

    if (flags & 0x08) {
        output.damageReflection = {
            reflection: data.shift(),
            cap: data.shift()
        };
    }

    if (flags & 0x20) {
        output.healing = data.shift();
    }

    if (flags & 0x80) {
        output.drawing = Drawing.fromString(data.shift());
    }

    if (flags & 0x100) {
        output.wavesIconSize = data.shift();
    }

    return output;
}

function encodeMobConfigs(configs) {
    const output = [configs.length];

    for (const config of configs) {
        const encoded = encodeMobConfig(config);
        output.push(...encoded);
    }

    return output;
}

export function decodeMobConfigs(data, nTiers) {
    const configs = [];
    const nMobs = data.shift();

    for (let i = 0; i < nMobs; i++) {
        configs.push(decodeMobConfig(data, nTiers));
    }

    return configs;
}

export function encodeEverything(tiers, petalConfigs, mobConfigs) {
    const output = [tiers.length, ...tiers.flatMap(t => [t.name, t.color])];
    output.push(...encodePetalConfigs(petalConfigs));
    output.push(...encodeMobConfigs(mobConfigs));

    return output;
}

export function decodeEverything(data) {
    const tiers = [];
    const nTiers = data.shift();

    for (let i = 0; i < nTiers; i++) {
        tiers.push({
            name: data.shift(),
            color: data.shift()
        });
    }

    const petals = decodePetalConfigs(data, nTiers);
    const mobs = decodeMobConfigs(data, nTiers);

    return {
        tiers: tiers,
        petalConfigs: petals,
        mobConfigs: mobs
    };
}

export const terrains = {};

export async function loadTerrains() {
    const response = await fetch("/assets/terrains.json");
    const data = await response.json();

    Object.assign(terrains, data);
}

export const SIDE_FLAGS = {
    TOP: 1,
    RIGHT: 2,
    BOTTOM: 4,
    LEFT: 8
};

export function getTerrain(flags) {
    const choices = terrains[flags];

    if (!choices) {
        return {
            id: [0, 0],
            terrain: terrains["0"][0]
        };
    }

    const choice = Math.random() * choices.length | 0;
    return {
        id: [flags, choice],
        terrain: choices[choice]
    };
}

export const GAMEMODES = {
    FFA: 0,
    TDM: 1,
    WAVES: 2,
    LINE: 3,
    MAZE: 4,
    MMO: 5
};
