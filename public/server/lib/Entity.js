import { ENTITY_TYPES, getTerrain, PetalTier, tiers, WEARABLES } from "../../lib/protocol.js";
import { angleDiff, applyArticle, getDropRarity, lerpAngle, quickDiff, xpForLevel } from "../../lib/util.js";
import { MobConfig, mobConfigs, PetalConfig, petalConfigs, petalIDOf, randomPossiblePetal } from "./config.js";
import state, { getActiveRoomState, setActiveRoomState } from "./state.js";
import Vector2D from "./Vector2D.js";
import RoomManager from "./Room.js";
import { ROOM_CENTER_PORTALS } from "./roomTypes.js";

export class HealthComponent {
    constructor(x) {
        this.health = x;
        this.maxHealth = x;
        this.lastDamaged = 0;
        this.damageReduction = 0;
        this.invulnerable = false;
        this.onDamage = null;
        this.shield = 0;
    }

    set(x, preserve = true) {
        this.health = x * (preserve ? this.ratio : 1);
        this.maxHealth = x;

        this.shield = Math.min(this.shield, this.maxHealth);
    }

    damage(x) {
        if (this.invulnerable) {
            return 0;
        }

        // const dmg = Math.max(0, Math.min(this.health, x - x * Math.min(.75, this.damageReduction)));
        // this.health = this.health - dmg;

        let damageDone = 0;

        if (this.shield > 0) {
            damageDone = Math.min(this.shield, x);
            this.shield -= damageDone;
        }

        if (this.shield <= 0) {
            const dmg = Math.max(0, Math.min(this.health, (x - damageDone) - (x - damageDone) * Math.min(.75, this.damageReduction)));
            this.health = this.health - dmg;
            damageDone += dmg;
        }

        this.lastDamaged = Date.now();

        if (this.onDamage) {
            this.onDamage(damageDone);
        }

        return damageDone;
    }

    deteriorateShield() {
        this.shield = Math.max(0, this.shield - this.maxHealth * .015 / 23);
    }

    get ratio() {
        return Math.max(0, this.health) / this.maxHealth;
    }

    get shieldRatio() {
        return Math.max(0, this.shield) / this.maxHealth;
    }

    get isDead() {
        return this.health <= 0;
    }
}

export class PetalSlot {
    /** @param {Player} player */
    constructor(player, index) {
        this.player = player;
        this.index = index;

        this.rarity = 0;

        /** @type {Petal[]} */
        this.petals = [];
        this.cooldowns = [];

        /** @type {Mob[][]} */
        this.boundMobs = [];

        /** @type {PetalConfig} */
        this.config = null;

        this.amount = 1;
        this.clumps = false;
    }

    get displayRatio() {
        if (this.amount === 0 || this.config.wearable) {
            return 1;
        }

        if (this.petals.every(p => p && p.health.ratio > 0)) {
            return this.petals.reduce((acc, petal) => acc + petal.health.ratio, 0) / this.amount;
        }

        return Math.max(...this.cooldowns) / Math.max(1, this.config.cooldown);
    }

    /** @param {PetalConfig} configType */
    define(configType, rarityID = 0) {
        this.config = configType;
        this.amount = this.config.tiers[rarityID].count;
        this.clumps = this.config.tiers[rarityID].clumps && this.amount > 1;
        this.petals = new Array(this.amount).fill(null);
        this.cooldowns = new Array(this.amount).fill(0);
        this.boundMobs = new Array(this.amount).fill(null).map(() => []);

        this.player.health.set(Math.max(1e-10, this.player.health.maxHealth + this.config.tiers[rarityID].extraHealth));
        this.player.health.damageReduction += this.config.tiers[rarityID].damageReduction;
        this.player.size += this.config.tiers[rarityID].extraSize;
        this.player.speed *= this.config.tiers[rarityID].speedMultiplier;
        this.rarity = rarityID;

        if (this.config.wearable > 0) {
            this.player.wearing[this.config.wearable] ??= 0;
            this.player.wearing[this.config.wearable]++;

            if (this.config.tiers[this.rarity].damageReflection?.reflection > 0 && this.player.wearing[this.config.wearable] === 1) {
                this.player.damageReflection.reflection += this.config.tiers[this.rarity].damageReflection.reflection;
                this.player.damageReflection.cap += this.config.tiers[this.rarity].damageReflection.cap;
            }
        }

        if (this.config.tiers[this.rarity].extraVision) {
            this.player.extraVision += this.config.tiers[this.rarity].extraVision;
        }

        if (this.config.tiers[this.rarity].extraAttraction) {
            this.player.attraction += this.config.tiers[this.rarity].extraAttraction;
        }

        if (this.config.tiers[this.rarity].extraArmor) {
            this.player.armor += this.config.tiers[this.rarity].extraArmor;
        }

        if (this.config.tiers[this.rarity].absorbsDamage) {
            this.player.absorbStacks.set(this.index, new SpongeStack(this.config.tiers[this.rarity].absorbsDamage.maxDamage, this.config.tiers[this.rarity].absorbsDamage.period));
        }

        if (this.config.attractsAggro) {
            this.player.aggroLevel += this.rarity;
        }

        if (this.player.client) {
            this.player.client.camera.lightingBoost += this.config.extraLighting;
        }
    }

    destroy() {
        this.petals.forEach(petal => petal?.destroy());
        this.player.health.set(this.player.health.maxHealth - this.config.tiers[this.rarity].extraHealth);
        this.player.health.damageReduction -= this.config.tiers[this.rarity].damageReduction;
        this.player.size -= this.config.tiers[this.rarity].extraSize;
        this.player.speed /= this.config.tiers[this.rarity].speedMultiplier;
        this.cooldowns = new Array(this.amount).fill(-100);

        this.boundMobs.forEach(mobs => {
            mobs.forEach(mob => {
                if (mob.segmentBodies) {
                    mob.segmentBodies.forEach((segment => {
                        segment.destroy();
                    }));
                }
                mob.destroy();
            });
        });

        if (this.config.wearable > 0) {
            this.player.wearing[this.config.wearable]--;

            if (this.config.tiers[this.rarity].damageReflection?.reflection > 0 && this.player.wearing[this.config.wearable] === 0) {
                this.player.damageReflection.reflection -= this.config.tiers[this.rarity].damageReflection.reflection;
                this.player.damageReflection.cap -= this.config.tiers[this.rarity].damageReflection.cap;
            }
        }

        if (this.config.tiers[this.rarity].extraVision) {
            this.player.extraVision -= this.config.tiers[this.rarity].extraVision;
        }

        if (this.config.tiers[this.rarity].extraAttraction) {
            this.player.attraction -= this.config.tiers[this.rarity].extraAttraction;
        }

        if (this.config.tiers[this.rarity].extraArmor) {
            this.player.armor -= this.config.tiers[this.rarity].extraArmor;
        }

        if (this.config.tiers[this.rarity].absorbsDamage) {
            let totalDamage = 0
            this.player.absorbStacks.forEach((t => {
                t.stacks.forEach((e => {
                    totalDamage += e.damagePerTick * e.remainingTicks
                }))
            }))
            this.player.health.damage(totalDamage)
            this.player.absorbStacks.delete(this.index);
        }

        if (this.config.attractsAggro) {
            this.player.aggroLevel -= this.rarity;
        }

        if (this.player.client) {
            this.player.client.camera.lightingBoost -= this.config.extraLighting;
        }
    }

    get radianSlots() {
        return this.clumps ? 1 : this.amount;
    }

    update(nSpots, i, orbitRatio) {
        let orbit = this.player.size + 52.5 * (this.config.huddles ? .65 : orbitRatio);

        if (this.config.wingMovement === true && this.player.attack) {
            orbit += (1 + Math.sin(performance.now() / 125 + this.index)) * (this.player.size * 4);
        }

        for (let j = 0; j < this.amount; j++) {
            const petal = this.petals[j];

            if (this.config.tiers[this.rarity].constantHeal !== 0 && this.player.health.ratio <= this.config.healWhenUnder && this.player.health.ratio > 0 && (!this.config.healsInDefense || (!this.player.attack && this.player.defend))) {
                this.player.health.health = Math.min(this.player.health.maxHealth, this.player.health.health + this.config.tiers[this.rarity].constantHeal);
            }

            if (petal) {
                if (this.config.healSpit) {
                    petal.range--;

                    if (petal.range <= 0) {
                        petal.range = this.config.healSpit.cooldown;

                        state.spatialHash.retrieve({
                            _AABB: {
                                x1: this.player.x - this.config.healSpit.range,
                                y1: this.player.y - this.config.healSpit.range,
                                x2: this.player.x + this.config.healSpit.range,
                                y2: this.player.y + this.config.healSpit.range
                            }
                        }).forEach(entity => {
                            if (entity.parent.team !== petal.parent.team || entity.type !== ENTITY_TYPES.PLAYER || entity.health.ratio >= 1) {
                                return;
                            }

                            entity.health.health = Math.min(entity.health.maxHealth, entity.health.health + this.config.healSpit.heal * Math.pow(PetalTier.HEALTH_SCALE, this.rarity));
                        });
                    }
                }

                if (this.config.tiers[this.rarity].pentagramAbility) {
                    petal.range--;

                    if (petal.range <= 0) {
                        const ability = this.config.tiers[this.rarity].pentagramAbility;
                        petal.range = ability.cooldown;

                        const target = petal.findTarget(ability.range, true);
                        if (target) {
                            new Pentagram(this.player, target, 25 * Math.pow(this.rarity + 1, 1.15), 1000, this.rarity).define(ability.damage, ability.poison.damage, ability.poison.duration, ability.speedDebuff.multiplier, ability.speedDebuff.duration);
                        }
                    }
                }

                if (this.config.shootsOut > -1) {
                    petal.range -= 3;

                    if (petal.range <= 0 && (this.player.attack || this.player.defend)) {
                        const newPet = new Petal(this.player, -1, -1);
                        newPet.x = petal.x;
                        newPet.y = petal.y;
                        newPet.index = this.config.shootsOut;

                        const conf = petalConfigs[this.config.shootsOut];
                        const tier = conf.tiers[this.rarity];

                        newPet.rarity = this.rarity
                        newPet.size = conf.sizeRatio * Math.pow(1.3, this.rarity);
                        newPet.health.set(tier.health);
                        newPet.damage = tier.damage;
                        newPet.speed = 0;
                        newPet.spinSpeed = 0;
                        newPet.launched = true;
                        newPet.range = 100;
                        newPet.nullCollision = true;
                        newPet.ignoreWalls = conf.ignoreWalls

                        if (tier.poison) {
                            newPet.poison.toApply.damage = tier.poison.damage;
                            newPet.poison.toApply.timer = tier.poison.duration;
                        }

                        if (conf.enemySpeedDebuff) {
                            newPet.speedDebuff.toApply.multiplier = conf.enemySpeedDebuff.speedMultiplier;
                            newPet.speedDebuff.toApply.timer = conf.enemySpeedDebuff.duration;
                        }

                        // Add velocity so it shoots out
                        const ang = Math.atan2(petal.y - this.player.y, petal.x - this.player.x);
                        newPet.velocity.x = Math.cos(ang) * (this.player.attack ? 25 : 5);
                        newPet.velocity.y = Math.sin(ang) * (this.player.attack ? 25 : 5);

                        petal.health.health = 0;
                    }
                }

                if (this.config.tiers[this.rarity].healing) {
                    let targets = [];
                    
                    state.spatialHash.retrieve({
                        _AABB: {
                            x1: this.player.x - 150,
                            y1: this.player.y - 150,
                            x2: this.player.x + 150,
                            y2: this.player.y + 150
                        }
                    }).forEach(entity => {
                        if (entity.type !== ENTITY_TYPES.MOB && entity.type !== ENTITY_TYPES.PETAL && entity.team === this.player.team) {
                            targets.push(entity);
                        }
                    });
                
                    let target = null;
                
                    if (this.player.health.ratio < 1) {
                        target = this.player;
                    } else {
                        let teammates = targets.filter(t => t !== this.player && t.health?.ratio < 1);
                
                        if (teammates.length > 0) {
                            target = teammates.sort((a, b) => quickDiff(petal, a) - quickDiff(petal, b))[0];
                        }
                    }
                
                    if (target) {
                        petal.range--;
                    
                        petal.moveAngle = Math.atan2(target.y - petal.y, target.x - petal.x);
                    
                        if (petal.range <= 0) {
                            if (quickDiff(petal, target) < target.size) {
                                target.health.health = Math.min(target.health.maxHealth, target.health.health + this.config.tiers[this.rarity].healing);
                                petal.destroy();
                            }
                            continue;
                        }
                    } else {
                        petal.range = 22.5 * 1;
                    }
                }

                if (this.config.tiers[this.rarity].shield > 0) {
                    let targets = [];
                    
                    state.spatialHash.retrieve({
                        _AABB: {
                            x1: this.player.x - 150,
                            y1: this.player.y - 150,
                            x2: this.player.x + 150,
                            y2: this.player.y + 150
                        }
                    }).forEach(entity => {
                        if (entity.type !== ENTITY_TYPES.MOB && entity.type !== ENTITY_TYPES.PETAL && entity.team === this.player.team) {
                            targets.push(entity);
                        }
                    });
                
                    let target = null;
                
                    if (this.player.health.shieldRatio < .95) {
                        target = this.player;
                    } else {
                        let teammates = targets.filter(t => t !== this.player && t.health?.shieldRatio < .95);
                
                        if (teammates.length > 0) {
                            target = teammates.sort((a, b) => quickDiff(petal, a) - quickDiff(petal, b))[0];
                        }
                    }
                
                    if (target) {
                        petal.range--;
                    
                        petal.moveAngle = Math.atan2(target.y - petal.y, target.x - petal.x);
                    
                        if (petal.range <= 0) {
                            if (quickDiff(petal, target) < target.size) {
                                target.health.shield = Math.min(target.health.maxHealth, target.health.shield + this.config.tiers[this.rarity].shield);
                                petal.destroy();
                            }
                            continue;
                        }
                    } else {
                        petal.range = 22.5 * 1;
                    }
                }

                if (!petal.launched) {
                    let gx = 0, gy = 0;
                    if (this.clumps) {
                        // Clump center
                        const ang = i / nSpots * Math.PI * 2 + this.player.petalRotation;
                        const xx = this.player.x + Math.cos(ang) * orbit;
                        const yy = this.player.y + Math.sin(ang) * orbit;

                        // Clump orbit
                        const ang2 = j / this.amount * Math.PI * 2 - this.player.petalRotation;
                        let k = petal.size * 1.5;

                        if (this.config.wingMovement === 2) {
                            k *= 1 + Math.sin(performance.now() / 125 + petal.id * 5) * 4;
                        }

                        gx = xx + Math.cos(ang2) * k;
                        gy = yy + Math.sin(ang2) * k;
                    } else {
                        const ang = (i + j) / nSpots * Math.PI * 2 + this.player.petalRotation;

                        gx = this.player.x + Math.cos(ang) * orbit;
                        gy = this.player.y + Math.sin(ang) * orbit;
                    }

                    if (!this.config.notAttraction) {
                        if (!(petal.attractionTimer > 0)) {
                            petal.attractionTimer = 4;
                            petal.attractionTarget = petal.findTarget(12 * (1 + this.player.attraction));
                        } else {
                            petal.attractionTimer--;
                        }

                        if (petal.attractionTarget && !petal.attractionTarget.health?.isDead) {
                            gx = petal.attractionTarget.x;
                            gy = petal.attractionTarget.y;
                        } else {
                            petal.attractionTarget = null;
                        }
                    }

                    const dx = gx - petal.x;
                    const dy = gy - petal.y;
                    petal.moveStrength = Math.max(1, Math.cbrt(dx * dx + dy * dy) / petal.speed);
                    petal.moveAngle = Math.atan2(dy, dx);
                }

                if (this.config.launchable && !petal.launched) {
                    petal.facing = (i + j) / nSpots * Math.PI * 2 + this.player.petalRotation;

                    petal.range -= 3;

                    if ((this.player.defend && this.config.launchedSpeed == 0 || this.player.attack) && petal.range <= 0) {
                        petal.launched = true;
                        petal.speed *= this.config.launchedSpeed;
                        petal.range = this.config.launchedRange;
                        const [ang, targ] = petal.findTargetAngleWithinRadianArc(petal.facing, Math.PI * 2 / (7.5 - (.4 * this.rarity)));
                        petal.launchedAt = targ;
                        petal.moveAngle = ang;
                        petal.facing = petal.moveAngle;
                        petal.moveStrength = 1;

                        this.player.petalSlots[petal.slotIndex].petals[petal.petalIndex] = null;
                        petal.slotIndex = -1;
                        petal.petalIndex = -1;
                    }
                }

                if (this.config.splits) {
                    petal.range -= 2;

                    if (petal.range <= 0 && this.player.attack) {
                        for (let i = 0; i < this.config.splits.count; i++) {
                            const newPet = new Petal(this.player, -1, -1);
                            newPet.rarity = this.rarity
                            newPet.index = this.config.splits.index;
                            newPet.size = petal.size / this.config.splits.count * 3;
                            newPet.health.set(petal.health.health);
                            newPet.damage = petal.damage;
                            newPet.poison = petal.poison
                            newPet.speed = petal.speed;
                            newPet.spinSpeed = petal.spinSpeed;
                            newPet.launched = true;
                            newPet.range = 100;
                            newPet.facing = newPet.moveAngle = Math.PI * 2 / this.config.splits.count * i + petal.facing + petal.moveAngle;
                            newPet.x = petal.x;
                            newPet.y = petal.y;
                        }

                        petal.health.health = 0;
                    }
                }

                if (this.config.wingMovement === true) {
                    petal.facing += .15;
                }

                if (this.config.tiers[this.rarity].spawnable) {
                    petal.range--;

                    if (petal.range <= -3) {
                        const mob = new Mob(petal);
                        mob.parent = this.player;
                        mob.team = this.player.team;
                        mob.friendly = true;
                        state.livingMobCount--;

                        const spawnable = this.config.tiers[this.rarity].spawnable;
                        mob.define(mobConfigs[spawnable.index], spawnable.rarity);
                        mob.friendly = true;
                        mob.yellow = true;
                        mob.health.set(spawnable.health);
                        mob.damage = spawnable.damage;
                        mob.size = spawnable.size;
                        mob.armor = 0;
                        mob.givesXP = !1;
                        mob.density = 0.5;

                        this.boundMobs[j].push(mob);
                        this.config.phases ? (petal.range = this.config.tiers[this.rarity].spawnable.timer,
                                setTimeout( () => {
                                    mob && mob.health && (mob.health.health = 0)
                                }
                                , 135 * this.config.tiers[this.rarity].spawnable.timer)) : petal.health.health = 0;

                        if (mob.segmentBodies) {
                            mob.segmentBodies.forEach((segment => {
                                segment.size = mob.size
                                segment.health = mob.health
                                segment.damage = mob.damage
                            }));
                        }
                    }
                }
            } else {
                if (this.boundMobs[j].length > 0) {
                    this.boundMobs[j] = this.boundMobs[j].filter(mob => mob && !mob.health.isDead);

                    if (this.boundMobs[j].length > 0) {
                        continue;
                    }
                }

                this.cooldowns[j]++;
                if (this.cooldowns[j] >= this.config.cooldown) {
                    this.petals[j] = new Petal(this.player, this.index, j);
                    this.petals[j].define(this.config, this.rarity);
                    this.cooldowns[j] = 0;
                }
            }
        }

        return this.clumps ? i + 1 : i + this.amount;
    }

    get gui() {
        return {
            index: this.config.id,
            rarity: this.rarity,
            alive: this.petals.some(p => p?.health.ratio > 0),
            cooldown: Math.min(...this.cooldowns) / this.config.cooldown,
        };
    }
}

class SpongeStack {
    constructor(maxDamage = 1024, periodInTicks = 96, maxStacks = 8) {
        this.maxDamage = maxDamage;
        this.ticks = periodInTicks;
        this.maxStacks = maxStacks;

        /** @type {{damagePerTick:number,remainingTicks:number}[]} */
        this.stacks = [];
    }

    addStack(damage) {
        if (this.stacks.length >= this.maxStacks || damage <= 0 || damage >= this.maxDamage) {
            return false;
        }

        this.stacks.push({
            damagePerTick: damage / this.ticks,
            remainingTicks: this.ticks
        });

        return true;
    }

    tick() {
        let damage = 0;

        for (let i = 0; i < this.stacks.length; i++) {
            damage += this.stacks[i].damagePerTick;

            if (--this.stacks[i].remainingTicks <= 0) {
                this.stacks.splice(i--, 1);
            }
        }

        return damage;
    }
}

export class Gun {
    /** @param {Entity} entity */
    constructor(entity) {
        this.entity = entity;

        this.petalIndex = 0;
        this.range = 0;
        this.reload = 0;
        this.tick = 0;
        this.delay = 0;

        this.animation = 0;
        this.animationDirection = 0;

        this.length = 0;
        this.width = 0;
        this.angle = 0;
        this.offset = 0;
        this.direction = 0;

        this.health = 0;
        this.damage = 0;
        this.speed = 0;
    }

    update() {
        this.tick++;
        this.animation += this.animationDirection;

        if (this.animation <= .8) {
            this.animationDirection = .1;
        }

        if (this.animation >= 1) {
            this.animation = 1;
            this.animationDirection = 0;
        }

        let fire = false;

        if (this.entity.type === ENTITY_TYPES.MOB) {
            fire = this.entity.target && this.entity.target.health.ratio > 0;
        } else if (this.entity.type === ENTITY_TYPES.PETAL) {
            fire = this.entity.parent.attack;
        }

        if (!fire) {
            this.tick = Math.min(this.tick, this.reload * this.delay);
            return;
        }

        if (this.tick >= this.reload) {
            this.tick = 0;
            this.shoot();
        }
    }

    shoot() {
        let gx = this.offset * Math.cos(this.entity.facing + this.direction) + this.length * Math.cos(this.entity.facing + this.angle),
            gy = this.offset * Math.sin(this.entity.facing + this.direction) + this.length * Math.sin(this.entity.facing + this.angle);

        const bullet = new Petal(this.entity.parent, -1, -1);
        bullet.define(petalConfigs[this.petalIndex], this.entity.rarity);
        bullet.x = this.entity.x + gx * this.entity.size;
        bullet.y = this.entity.y + gy * this.entity.size;
        bullet.size = this.entity.size * this.width;
        bullet.facing = this.entity.facing + this.angle;

        bullet.speed = this.speed;
        bullet.damage = this.damage;
        bullet.range = this.range;
        bullet.launched = true;

        bullet.health.set(this.health);

        bullet.velocity.x = Math.cos(bullet.facing) * bullet.speed;
        bullet.velocity.y = Math.sin(bullet.facing) * bullet.speed;

        this.animation = 1;
        this.animationDirection = -1;
    }
}

export class Entity {
    static idAccumulator = 1; // 0 is reserved for the protocol as a flag

    // Fixed knockback strength applied to players on any collision, regardless
    // of either entity's velocity/overlap depth at the moment of impact.
    static PLAYER_PUSH_STRENGTH = 48;

    // Multiplier applied to non-player entity-vs-entity collision resolution
    // to make overlaps get resolved harder/faster (more aggressive collisions).
    static COLLISION_AGGRESSIVENESS = 1.6;

    constructor(position = { x: 0, y: 0 }) {
        this.id = Entity.idAccumulator++;
        this.parent = this;

        this.x = position.x;
        this.y = position.y;
        this.size = 20;
        this.width = 1;
        this.height = 1;
        this.facing = 0;
        this.speed = 4;
        this.velocity = new Vector2D(0, 0);
        this.health = new HealthComponent(10);
        this.type = ENTITY_TYPES.STANDARD;
        this.friction = .5;
        this.damage = 5;
        this.pushability = 1;
        this.density = 1;
        this.damageReflection = {
            reflection: 0,
            cap: 0
        };
        this.healBack = 0;
        this.aggroLevel = 0;

        this.canBeViewed = true;

        this.nullCollision = false;

        this.hit = 0;

        this.collisionIDs = new Set();

        this.damagedBy = {};

        this.noDebuff = false;

        this.speedDebuff = {
            multiplier: 1,
            timer: 0,

            toApply: {
                multiplier: 1,
                timer: 0
            }
        };

        this.poison = {
            damage: 0,
            timer: 0,

            toApply: {
                damage: 0,
                timer: 0
            }
        };

        /** @type {Map<number,SpongeStack>} */
        this.absorbStacks = new Map();

        this.lastGoodPosition = {
            x: this.x,
            y: this.y
        };

        /** @type {Gun[]} */
        this.guns = [];

        state.entities.set(this.id, this);
    }

    bindToRoom() {
        if (state.isRadial) {
            const angle = Math.atan2(this.y, this.x);
            const dstSqr = this.x * this.x + this.y * this.y;
            const max = state.width / 2;

            if (dstSqr > max * max) {
                const newDst = Math.sqrt(max * max - 1);
                this.x = Math.cos(angle) * newDst;
                this.y = Math.sin(angle) * newDst;
            }

            return;
        }

        this.x = Math.max(-state.width / 2, Math.min(state.width / 2, this.x));
        this.y = Math.max(-state.height / 2, Math.min(state.height / 2, this.y));
    }

    findTarget(range, random = false) {
        const retrieved = state.spatialHash.retrieve({
            _AABB: {
                x1: this.x - range,
                y1: this.y - range,
                x2: this.x + range,
                y2: this.y + range
            }
        });

        if (random) {
            const valid = [];

            retrieved.forEach(entity => {
                if (entity.parent.id === this.parent.id || entity.parent.team === this.parent.team || entity.type === ENTITY_TYPES.PETAL) {
                    return;
                }

                valid.push(entity);
            });

            return valid[Math.floor(Math.random() * valid.length)];
        } else {
            const valid = [];

            retrieved.forEach(entity => {
                if (entity.parent.id === this.parent.id || entity.parent.team === this.parent.team || entity.type === ENTITY_TYPES.PETAL) {
                    return;
                }

                valid.push(entity);
            });

            return valid.sort((a, b) => quickDiff(this, a) - quickDiff(this, b)).sort((a, b) => b.parent.aggroLevel - a.parent.aggroLevel)[0] || null;
        }
    }

    update() {
        if (this.health.isDead) {
            this.destroy();
            return;
        }

        if (this.poison.timer > 0) {
            this.health.damage(this.poison.damage);
            this.poison.timer--;
        }

        if (this.absorbStacks.size > 0) {
            let damage = 0;

            this.absorbStacks.forEach(stack => {
                damage += stack.tick();
            });

            this.health.damage(damage);
        }

        if (this.speedDebuff.timer > 0) {
            this.velocity.multiply(this.speedDebuff.multiplier);
            this.speedDebuff.timer--;
        }

        this.x += this.velocity.x;
        this.y += this.velocity.y;

        if (this.speedDebuff.timer > 0) {
            this.velocity.divide(this.speedDebuff.multiplier);
        }

        this.velocity.multiply(this.friction);

        this._AABB = state.spatialHash.getAABB(this);
        if (this.canBeViewed) {
            state.viewsSpatialHash.insert(this);
        }
        state.spatialHash.insert(this);
        this.collisionIDs.clear();
        this.hit = Math.max(0, this.hit - 1);

        if (this.dandelionCooldown > 0) {
            this.dandelionCooldown--
        }
    }

    collide() {
        const collisions = state.spatialHash.retrieve(this);

        collisions.forEach(/** @param {Entity} other */ other => {
            if (this.collisionIDs.has(other.id) || other.collisionIDs.has(this.id) || this.id === other.id || (this.parent.id === other.parent.id && this.type !== other.type)) {
                return;
            }

            this.collisionIDs.add(other.id);
            other.collisionIDs.add(this.id);

            if (this.parent.team === other.parent.team && (this.type === ENTITY_TYPES.PETAL || other.type === ENTITY_TYPES.PETAL || (this.type === ENTITY_TYPES.PLAYER && other.type === ENTITY_TYPES.MOB) || (other.type === ENTITY_TYPES.PLAYER && this.type === ENTITY_TYPES.MOB))) {
                return;
            }

            if (this.type === ENTITY_TYPES.MOB && other.type === ENTITY_TYPES.MOB && this.team === other.team && this.segmentID > -1 && other.segmentID > -1) {
                if (this.segmentID === other.segmentID) {
                    return;
                }
            }

            const dx = this.x - other.x;
            const dy = this.y - other.y;
            const distSqr = dx * dx + dy * dy;

            if (distSqr === 0 || this.size + other.size < Math.sqrt(distSqr)) {
                return;
            }

            if (this.parent.team !== other.parent.team && !this.spawnInvincibility && !other.spawnInvincibility) {
                if (!this.nullCollision && !other.nullCollision) {
                    let otherDamageDone = 0,
                        thisDamageDone = 0;

                    thisDamageDone += this.damage;
                    otherDamageDone += other.damage;

                    thisDamageDone = thisDamageDone - other.armor
                    otherDamageDone = otherDamageDone - this.armor

                    if (this.type === ENTITY_TYPES.PETAL && this.evadeChance > 0 && Math.random() < this.evadeChance) {
                        otherDamageDone = 0;
                    }

                    if (other.type === ENTITY_TYPES.PETAL && other.evadeChance > 0 && Math.random() < other.evadeChance) {
                        thisDamageDone = 0;
                    }

                    if (this.type === ENTITY_TYPES.PETAL && this.critDamage && Math.random() < this.critDamage.chance) {
                        thisDamageDone *= this.critDamage.multiplier;
                    }

                    if (other.type === ENTITY_TYPES.PETAL && other.critDamage && Math.random() < other.critDamage.chance) {
                        otherDamageDone *= other.critDamage.multiplier;
                    }

                    if (this.extraDamage) if (other.health.ratio >= this.extraDamage.minHp && other.health.ratio <= this.extraDamage.maxHp) {
                        thisDamageDone += this.damage * this.extraDamage.multiplier;
                    }

                    if (other.extraDamage) if (this.health.ratio >= other.extraDamage.minHp && this.health.ratio <= other.extraDamage.maxHp) {
                        otherDamageDone += other.damage * other.extraDamage.multiplier;
                    }

                    if (this.absorbStacks.size > 0) {
                        let done = false;

                        this.absorbStacks.forEach(stack => {
                            if (!done && stack.addStack(otherDamageDone)) {
                                done = true;
                            }
                        });

                        if (!done) {
                            this.health.damage(otherDamageDone);
                        }
                    } else {
                        this.health.damage(otherDamageDone);
                    }

                    if (other.absorbStacks.size > 0) {
                        let done = false;

                        other.absorbStacks.forEach(stack => {
                            if (!done && stack.addStack(thisDamageDone)) {
                                done = true;
                            }
                        });

                        if (!done) {
                            other.health.damage(thisDamageDone);
                        }
                    } else {
                        other.health.damage(thisDamageDone);
                    }

                    if (this.config?.name === "Starfish" && this.type === ENTITY_TYPES.MOB && other.config?.name === "Dandelion") {
                        this.dandelionCooldown = 22.5 + (11.25 * other.rarity)
                    }

                    if (this.damageReflection?.reflection > 0 && !other.parent.spawnInvincibility) {
                        if (this.damageReflection.cap > 0) {
                            other.parent.health.damage(Math.min(other.parent.health.maxHealth * this.damageReflection.cap, this.damageReflection.reflection * otherDamageDone));
                        } else {
                            other.parent.health.damage(this.damageReflection.reflection * otherDamageDone);
                        }
                    }

                    if (other.damageReflection?.reflection > 0 && !this.parent.spawnInvincibility) {
                        if (other.damageReflection.cap > 0) {
                            this.parent.health.damage(Math.min(this.parent.health.maxHealth * other.damageReflection.cap, other.damageReflection.reflection * thisDamageDone));
                        } else {
                            this.parent.health.damage(other.damageReflection.reflection * thisDamageDone);
                        }
                    }

                    if (this.healBack !== 0) {
                        this.parent.health.health = Math.min(this.parent.health.maxHealth, this.parent.health.health + this.healBack * thisDamageDone);
                    }

                    if (other.healBack !== 0) {
                        other.parent.health.health = Math.min(other.parent.health.maxHealth, other.parent.health.health + other.healBack * otherDamageDone);
                    }

                    if (Number.isFinite(this.health?.health) && Number.isFinite(other.health?.health)) {
                        this.hit = 3;
                        other.hit = 3;
                    }

                    if (this.type === ENTITY_TYPES.MOB && this.neutral) {
                        this.target = other.parent;
                    }

                    if (other.type === ENTITY_TYPES.MOB && other.neutral) {
                        other.target = this.parent;
                    }

                    if (this.type === ENTITY_TYPES.PLAYER || this.type === ENTITY_TYPES.MOB) {
                        if (this.parent && this.config?.name === "Leech") {
                            let existing = this.parent.damagedBy[other.parent.id] || [0, other.parent.type, other.parent.type === ENTITY_TYPES.PLAYER ? other.parent.name : other.parent.index, other.parent.type === ENTITY_TYPES.PLAYER && other.parent.client ? other.parent.client.id : null];
                            existing[0] += other.damage;

                            this.parent.damagedBy[other.parent.id] = existing;
                        } else {
                            let existing = this.damagedBy[other.parent.id] || [0, other.parent.type, other.parent.type === ENTITY_TYPES.PLAYER ? other.parent.name : other.parent.index, other.parent.type === ENTITY_TYPES.PLAYER && other.parent.client ? other.parent.client.id : null];
                            existing[0] += other.damage;

                            this.damagedBy[other.parent.id] = existing;
                        }
                    }

                    if (other.type === ENTITY_TYPES.PLAYER || other.type === ENTITY_TYPES.MOB) {
                        if (other.parent && other.config?.name === "Leech") {
                            let existing = other.parent.damagedBy[this.parent.id] || [0, this.parent.type, this.parent.type === ENTITY_TYPES.PLAYER ? this.parent.name : this.parent.index, this.parent.type === ENTITY_TYPES.PLAYER && this.parent.client ? this.parent.client.id : null];
                            existing[0] += this.damage;

                            other.parent.damagedBy[this.parent.id] = existing;
                        } else {
                            let existing = other.damagedBy[this.parent.id] || [0, this.parent.type, this.parent.type === ENTITY_TYPES.PLAYER ? this.parent.name : this.parent.index, this.parent.type === ENTITY_TYPES.PLAYER && this.parent.client ? this.parent.client.id : null];
                            existing[0] += this.damage;

                            other.damagedBy[this.parent.id] = existing;
                        }
                    }

                    if (this.type === ENTITY_TYPES.PLAYER) {
                        this.petalSlots.forEach((slot => {
                            slot.petals.forEach((petal => {
                                if (petal?.lightning?.lightningOnParentHit) {
                                    new Lightning(this).define(petal.lightning.damage, petal.lightning.range, petal.lightning.bounces, petal.rarity).bounce();
                                    petal.lightning.chargesLeft--;
                                    petal.health.health = petal.health.maxHealth / petal.lightning.charges * petal.lightning.chargesLeft
                                }

                                if (petal?.config?.explodesOnParentHit && petal.config?.explodesOut > -1) {
                                    petal.explodeOut();
                                }
                            }))
                        }))
                    }

                    if (this.type === ENTITY_TYPES.PETAL && this.lightning !== null && this.lightning.chargesLeft > 0 && !this.lightning.lightningOnParentHit) {
                        const lightning = new Lightning(this.parent).define(this.lightning.damage, this.lightning.range, this.lightning.bounces);
                        lightning.points[0].x = this.x;
                        lightning.points[0].y = this.y;
                        lightning.bounce();

                        if (this.lightning.charges > 1) {
                            this.lightning.chargesLeft--;
                            this.health.health = this.health.maxHealth / this.lightning.charges * this.lightning.chargesLeft;
                        }
                    }

                    if (other.type === ENTITY_TYPES.PLAYER) {
                        other.petalSlots.forEach((slot => {
                            slot.petals.forEach((petal => {
                                if (petal?.lightning?.lightningOnParentHit) {
                                    new Lightning(other).define(petal.lightning.damage, petal.lightning.range, petal.lightning.bounces, petal.rarity).bounce();
                                    petal.lightning.chargesLeft--;
                                    petal.health.health = petal.health.maxHealth / petal.lightning.charges * petal.lightning.chargesLeft
                                }

                                if (petal?.config?.explodesOnParentHit && petal.config?.explodesOut > -1) {
                                    petal.explodeOut();
                                }
                            }))
                        }))
                    }

                    if (other.type === ENTITY_TYPES.PETAL && other.lightning !== null && other.lightning.chargesLeft > 0 && !other.lightning.lightningOnParentHit) {
                        const lightning = new Lightning(other.parent).define(other.lightning.damage, other.lightning.range, other.lightning.bounces);
                        lightning.points[0].x = other.x;
                        lightning.points[0].y = other.y;
                        lightning.bounce();

                        if (other.lightning.charges > 1) {
                            other.lightning.chargesLeft--;
                            other.health.health = other.health.maxHealth / other.lightning.charges * other.lightning.chargesLeft;
                        }
                    }
                }

                if (this.speedDebuff.toApply.timer > 0 && !other.noDebuff) {
                    other.speedDebuff.multiplier = this.speedDebuff.toApply.multiplier;
                    other.speedDebuff.timer = this.speedDebuff.toApply.timer;
                }

                if (other.speedDebuff.toApply.timer > 0 && !this.noDebuff) {
                    this.speedDebuff.multiplier = other.speedDebuff.toApply.multiplier;
                    this.speedDebuff.timer = other.speedDebuff.toApply.timer;
                }

                if (this.poison.toApply.timer > 0 && !other.noDebuff) {
                    other.poison.damage = this.poison.toApply.damage;
                    other.poison.timer = this.poison.toApply.timer;
                }

                if (other.poison.toApply.timer > 0 && !this.noDebuff) {
                    this.poison.damage = other.poison.toApply.damage;
                    this.poison.timer = other.poison.toApply.timer;
                }
            }

            if (!this.nullCollision && !other.nullCollision && !this.phases && !other.phases) {
                const angle = Math.atan2(dy, dx);
                const combinedSize = this.size + other.size;
                const overlap = combinedSize - Math.sqrt(distSqr);
                // More aggressive collision resolution between (non-player) entities:
                // overlaps get pushed apart harder instead of drifting apart slowly.
                const strength = overlap * Entity.COLLISION_AGGRESSIVENESS;
                const mySizeRatio = this.size / combinedSize;
                const otherSizeRatio = other.size / combinedSize;

                // Players always get knocked back with a fixed strength, regardless of
                // the overlap depth or either entity's current velocity.
                const thisStrength = this.type === ENTITY_TYPES.PLAYER ? Entity.PLAYER_PUSH_STRENGTH : strength;
                const otherStrength = other.type === ENTITY_TYPES.PLAYER ? Entity.PLAYER_PUSH_STRENGTH : strength;

                this.velocity.x += Math.cos(angle) * thisStrength * this.pushability * other.density * otherSizeRatio;
                this.velocity.y += Math.sin(angle) * thisStrength * this.pushability * other.density * otherSizeRatio;
            
                other.velocity.x -= Math.cos(angle) * otherStrength * other.pushability * this.density * mySizeRatio;
                other.velocity.y -= Math.sin(angle) * otherStrength * other.pushability * this.density * mySizeRatio;
            }
        });
    }

    collideTerrain() {
        const retrieved = state.terrainSpatialHash.retrieve(this);

        /** @type {Terrain[]} */
        const collisionResponses = [];

        retrieved.forEach(/** @param {Terrain} terrain */ terrain => {
            if (terrain.polygon.circleIntersects(this.x, this.y, this.size)) {
                const resolution = terrain.polygon.resolve(this.x, this.y, this.size);
                this.x = resolution.x;
                this.y = resolution.y;

                if (this.config?.bumblebeeMovement) {
                    this.movementAngle = Math.random() * Math.PI * 2;
                }

                collisionResponses.push(terrain);
            }
        });

        if (collisionResponses.length > 0) {
            this.velocity.multiply(.5);
        } else {
            this.lastGoodPosition = {
                x: this.x,
                y: this.y
            };
        }

        if (collisionResponses.length === 2) {
            const xDiff = Math.abs(collisionResponses[0].gridX - collisionResponses[1].gridX);
            const yDiff = Math.abs(collisionResponses[0].gridY - collisionResponses[1].gridY);

            if (xDiff === yDiff || xDiff > 1 || yDiff > 1) {
                return;
            }

            const avg = {
                x: 0,
                y: 0,
                size: 0
            };

            for (const polygon of collisionResponses) {
                avg.x += polygon.x;
                avg.y += polygon.y;
                avg.size += polygon.size;
            }

            avg.x /= collisionResponses.length;
            avg.y /= collisionResponses.length;
            avg.size /= collisionResponses.length;

            const dx = this.x - avg.x;
            const dy = this.y - avg.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.size) {
                return;
            }

            const angle = Math.atan2(this.y - avg.y, this.x - avg.x);
            this.x = avg.x + Math.cos(angle) * (avg.size + this.size + 3);
            this.y = avg.y + Math.sin(angle) * (avg.size + this.size + 3);
        }

        let good = this.x > -state.width / 2 && this.x < state.width / 2 && this.y > -state.height / 2 && this.y < state.height / 2;

        if (good) {
            this._AABB = state.spatialHash.getAABB(this);
            state.terrainSpatialHash.retrieve(this).forEach(/** @param {Terrain} terrain */ terrain => {
                if (good && terrain.polygon.circleIntersects(this.x, this.y, this.size)) {
                    good = false;
                }
            });
        }

        if (!good) {
            this.x = this.lastGoodPosition.x;
            this.y = this.lastGoodPosition.y;
        }
    }

    /** @returns {{id:number,type:number,damage:number,name:string,clientID:?number}[]} */
    getTopDamagers(n = 3, filterType = -1) {
        const topHurters = [];

        for (const id in this.damagedBy) {
            const [damage, type, name, clientID] = this.damagedBy[id];

            if (filterType !== -1 && type !== filterType) {
                continue;
            }

            if (type === ENTITY_TYPES.PLAYER && !topHurters.some(hurter => hurter.clientID === clientID)) {
                topHurters.push({
                    id: +id,
                    type: type,
                    damage: damage,
                    name: name,
                    clientID: clientID
                });
            }

            if (type === ENTITY_TYPES.MOB) {
                topHurters.push({
                    id: +id,
                    type: type,
                    damage: damage,
                    name: mobConfigs[name].name
                });
            }
        }

        topHurters.sort((a, b) => b.damage - a.damage);

        return topHurters.slice(0, n);
    }

    destroy() {
        this.health.health = 0;
        state.entities.delete(this.id);
        if (state.isWaves) {
            state.aliveMobs = state.aliveMobs.filter(m => m.id !== this.id);
        }
    }
}

export class Petal extends Entity {
    constructor(player, slotIndex, petalIndex) {
        super(player);

        this.parent = player;
        this.slotIndex = slotIndex;
        this.petalIndex = petalIndex;
        this.moveAngle = 0;
        this.moveDist = 1;
        this.speed = 6;
        this.size = 7.5;
        this.health.set(10);
        this.type = ENTITY_TYPES.PETAL;
        this.friction = .7;
        this.index = 0;
        this.spinSpeed = .1;
        this.launched = false;
        this.range = 22.5 * 1.5;
        this.moveStrength = 1;
        this.launchedAt = null;
        this.attractsLightning = false;
        this.placeDown = false;
        this.rarity = 0;
        this.armor = 0;
        this.evadeChance = 0;
        this.critDamage = null;

        /** @type {{damage:number,range:number,bounces:number,charges:number,chargesLeft:number}|null} */
        this.lightning = null;

        this.burst = false;
        this.faceInRelation = false;
        this.ignoreWalls = false;
    }

    /** @param {PetalConfig} config @param {number} rarity */
    define(config, rarity) {
        const tier = config.tiers[rarity];
        this.rarity = rarity;

        this.health.set(tier.health);
        this.damage = tier.damage;
        this.config = config;
        this.size *= config.sizeRatio;
        this.index = config.id;
        this.spinSpeed = config.launchable ? 0 : .1;
        this.armor = 0;
        this.evadeChance = tier.evadeChance ?? 0;
        this.critDamage = tier.critDamage ?? null;

        if (config.enemySpeedDebuff) {
            this.speedDebuff.toApply.multiplier = config.enemySpeedDebuff.speedMultiplier;
            this.speedDebuff.toApply.timer = config.enemySpeedDebuff.duration;
        }

        if (tier.poison) {
            this.poison.toApply.damage = tier.poison.damage;
            this.poison.toApply.timer = tier.poison.duration;
        }

        if (tier.spawnable) {
            this.range = tier.spawnable.timer;
            this.spinSpeed = 0;
        }

        if (tier.lightning) {
            this.lightning = tier.lightning;
            this.lightning.chargesLeft = tier.lightning.charges;
        }

        if (config.canPlaceDown) {
            this.placeDown = true;
        }

        if (tier.density) {
            this.density = tier.density;
        }

        if (config.phases) {
            this.health.invulnerable = true;
            this.phases = true;
        }

        this.attractsLightning = config.attractsLightning;

        if (tier.boost) {
            this.burst = {
                speed: tier.boost.length,
                ticks: tier.boost.delay
            };
        }

        if (config.healWhenUnder < 1) {
            this.spinSpeed = 0;
        }

        if (config.name === "Starfish") {
            this.faceInRelation = 0;
        }

        if (tier.healBack) {
            this.healBack = tier.healBack;
        }

        if (config.extraDamage) {
            this.extraDamage = config.extraDamage
        }

        if (tier.armor !== 0) {
            this.armor = tier.armor;
        }

        if (!config.wearable && tier.damageReflection?.reflection > 0) {
            this.damageReflection = {
                reflection: tier.damageReflection.reflection,
                cap: tier.damageReflection.cap
            };
        }

        this.ignoreWalls = config.ignoreWalls;
    }

    findTargetAngleWithinRadianArc(myAngle, arc) {
        let targetAngle = myAngle,
            nearestDist = Infinity,
            targ = null;

        state.entities.forEach(entity => {
            if (entity.parent.id === this.parent.id || entity.parent.team === this.parent.team || entity.type === ENTITY_TYPES.PETAL) {
                return;
            }

            const angle = Math.atan2(entity.y - this.y, entity.x - this.x);

            if (Math.abs(angleDiff(myAngle, angle)) > arc / 2) {
                return;
            }

            const dx = this.x - entity.x;
            const dy = this.y - entity.y;
            const distSqr = dx * dx + dy * dy;

            if (distSqr < nearestDist) {
                targetAngle = angle;
                nearestDist = distSqr;
                targ = entity;
            }
        });

        return [targetAngle, targ];
    }

    update() {
        if (this.dandelionBind) {
            this.x = this.dandelionBind.x + Math.cos(this.facing) * (this.size + this.dandelionBind.size * 1.2);
            this.y = this.dandelionBind.y + Math.sin(this.facing) * (this.size + this.dandelionBind.size * 1.2);
            return super.update();
        }

        if (this.burst !== false) {
            this.burst.ticks--;

            if (this.parent.type === ENTITY_TYPES.PLAYER && this.parent.defend && this.burst.ticks <= 0) {
                const ang = Math.atan2(this.parent.y - this.y, this.parent.x - this.x);
                const length = this.burst.speed / this.parent.friction;
                this.parent.velocity.x += Math.cos(ang) * length;
                this.parent.velocity.y += Math.sin(ang) * length;
                this.destroy();
                return;
            }
        }

        if (this.launched && this.launchedAt !== null && !this.launchedAt.health.isDead) {
            this.moveAngle = lerpAngle(this.moveAngle, Math.atan2(this.launchedAt.y - this.y, this.launchedAt.x - this.x), .35);
            this.facing = this.moveAngle;
        }

        if (this.placeDown && this.parent.attack) {
            return super.update();
        }

        this.velocity.x += Math.cos(this.moveAngle) * this.speed * this.moveStrength;
        this.velocity.y += Math.sin(this.moveAngle) * this.speed * this.moveStrength;
        this.facing += this.spinSpeed;

        if (this.faceInRelation !== false) {
            this.facing = Math.atan2(this.y - this.parent.y, this.x - this.parent.x) + this.faceInRelation;
        }

        if (this.launched) {
            this.range--;

            if (this.range <= 0) {
                this.destroy();
                return;
            }
        }

        super.update();
    }

    collide() {
        if (this.launched && this.ignoreWalls === false) {
            const terrains = state.terrainSpatialHash.retrieve(this);

            terrains.forEach(terrain => {
                if (terrain.polygon.circleIntersects(this.x, this.y, this.size)) {
                    this.destroy();
                }
            });
        }

        super.collide();
    }

    explodeOut() {
        const config = petalConfigs[this.config.explodesOut];
        if (!config) {
            return;
        }

        const tier = config.tiers[this.rarity];
        const petal = new Petal(this.parent, -1, -1);

        petal.x = this.x;
        petal.y = this.y;
        petal.index = this.config.explodesOut;
        petal.size = config.sizeRatio;
        petal.health.set(tier.health);
        petal.damage = tier.damage;
        petal.rarity = this.rarity;
        petal.speed = 0;
        petal.spinSpeed = 0;
        petal.pushability = 0;
        petal.launched = true;
        petal.density = tier.density / 30;
        petal.range = 3;
        petal.nullCollision = false;

        if (tier.poison) {
            petal.poison.toApply.damage = tier.poison.damage;
            petal.poison.toApply.timer = tier.poison.duration;
        }

        if (config.enemySpeedDebuff) {
            petal.speedDebuff.toApply.multiplier = config.enemySpeedDebuff.speedMultiplier;
            petal.speedDebuff.toApply.timer = config.enemySpeedDebuff.duration;
        }
    }

    destroy() {
        if (this.slotIndex > -1) {
            this.parent.petalSlots[this.slotIndex].petals[this.petalIndex] = null;
        }

        if (this.config?.explodesOut > -1 && !this.config?.explodesOnParentHit) {
            this.explodeOut();
        }

        if (this.config?.breaks) {
            const config = petalConfigs[this.config.breaks.index];

            if (config) {
                const tier = config.tiers[this.rarity];
                const count = this.config.breaks.count;
                const baseAngle = Math.random() * Math.PI * 2;

                for (let i = 0; i < count; i++) {
                    const petal = new Petal(this.parent, -1, -1);

                    petal.x = this.x;
                    petal.y = this.y;
                    petal.index = this.config.breaks.index;
                    petal.size = this.size / count * 2.5;
                    petal.health.set(tier.health);
                    petal.damage = tier.damage;
                    petal.rarity = this.rarity;
                    petal.speed = 6.5;
                    petal.spinSpeed = .15;
                    petal.launched = true;
                    petal.range = 20 + 30 * Math.random();
                    petal.moveAngle = petal.facing = baseAngle + (2 * Math.PI / count) * i;
                    petal.moveStrength = 1;

                    if (tier.poison) {
                        petal.poison.toApply.damage = tier.poison.damage;
                        petal.poison.toApply.timer = tier.poison.duration;
                    }

                    if (config.enemySpeedDebuff) {
                        petal.speedDebuff.toApply.multiplier = config.enemySpeedDebuff.speedMultiplier;
                        petal.speedDebuff.toApply.timer = config.enemySpeedDebuff.duration;
                    }
                }
            }
        }

        super.destroy();
    }
}

export class Player extends Entity {
    constructor(position = { x: 0, y: 0 }) {
        super(position);

        this.name = "guest";
        this.nameColor = "#FFFFFF";
        this.type = ENTITY_TYPES.PLAYER;
        this.team = this.id;

        this.health.set(40);

        this.moveAngle = 0;
        this.moveStrength = 0;
        this.attack = false;
        this.defend = false;

        this.petalRotation = 0;
        this.size = 17;
        this.extraPickupRange = 0;
        this.armor = 0;

        /** @type {PetalSlot[]} */
        this.petalSlots = [];
        this.initSlots(5);

        /** @type {import("./Client.js").default} */
        this.client = null;

        this.wearing = [];
        this.extraVision = 0;
        this.attraction = 0.4;

        this.lightVision = 2;
    }

    get level() {
        return this.client ? this.client.level : 1;
    }

    get rarity() {
        if (this.client) {
            return this.client.highestRarity;
        }

        let rarity = 0;

        this.petalSlots.forEach(slot => {
            rarity = Math.max(rarity, slot.rarity);
        });

        return rarity;
    }

    initSlots(n) {
        if (n > this.petalSlots.length) {
            for (let i = this.petalSlots.length; i < n; i++) {
                if (this.client?.slots[i]) {
                    const slot = new PetalSlot(this, i);
                    slot.define(petalConfigs[0], 0);
                    this.petalSlots.push(slot);
                }
            }
        } else {
            for (let i = this.petalSlots.length - 1; i >= n; i--) {
                this.petalSlots[i].destroy();
                this.petalSlots.pop();
            }
        }
    }

    setSlot(slotIndex, petalIndex, rarity) {
        if (this.petalSlots[slotIndex]) {
            this.petalSlots[slotIndex].destroy();
            this.petalSlots[slotIndex].define(petalConfigs[petalIndex], rarity);
        }
    }

    update() {
        if (this.health.isDead) {
            for (const slot of this.petalSlots) {
                if (slot.config.tiers[slot.rarity].deathDefying?.duration > 0 && slot.petals.some(petal => petal && !petal.health.isDead)) {
                    this.health.health = Math.min(slot.config.tiers[slot.rarity].deathDefying.health * this.health.maxHealth, this.health.maxHealth);
                    slot.petals.forEach(petal => petal?.destroy());

                    if (!this.health.invulnerable) {
                        this.health.invulnerable = true;
                        setTimeout(() => this.health.invulnerable = false, slot.config.tiers[slot.rarity].deathDefying.duration * 1000);
                    }
                    break;
                }
            }
        }

        if (this.health.shield > 0) {
            this.health.deteriorateShield();
        }

        this.velocity.x += Math.cos(this.moveAngle) * this.moveStrength;
        this.velocity.y += Math.sin(this.moveAngle) * this.moveStrength;

        this.bindToRoom();
        this.facing = this.moveAngle;

        super.update();

        if (this.health.lastDamaged + 1.5E4 < Date.now()) {
            this.health.health = Math.min(this.health.maxHealth, this.health.health + this.health.maxHealth * .0025);
        }
    }

    collide() {
        super.collide();
        this.collideTerrain();

        let i = 0,
            yangs = 0,
            range = 0;

        const nSpots = this.petalSlots.reduce((acc, slot) => {
            if (slot.config.yinYangMovement) {
                yangs++;
            }

            if (slot.config.tiers[slot.rarity].extraRange > range) {
                range = slot.config.tiers[slot.rarity].extraRange;
            }

            return acc + slot.radianSlots;
        }, 0);

        let spin = 1;

        if (yangs % 3 === 0) {
            spin = 1;
        } else if (yangs % 3 === 1) {
            spin = -1;
        } else {
            spin = 0;
        }

        this.petalRotation += .125 * spin;
        this.extraPickupRange = 0;

        const ratio = (1 + this.attack * .5 - this.defend * .4) * (1 + range * this.attack);
        this.petalSlots.forEach(slot => {
            i = slot.update(nSpots, i, ratio);

            if (slot.config.tiers[slot.rarity].extraRadians) {
                this.petalRotation += slot.config.tiers[slot.rarity].extraRadians * spin;
            }

            this.extraPickupRange = Math.max(this.extraPickupRange, slot.config.tiers[slot.rarity].extraPickupRange);
        });
    }

    /**
     * @param {{transferringRoom?: boolean}} [options]
     */
    destroy(options = {}) {
        const { transferringRoom = false } = options;

        this.petalSlots.forEach(slot => slot.destroy());
        super.destroy();

        if (this.client !== null) {
            const client = this.client;
            client.body = null;
            state.alivePlayers = state.alivePlayers.filter(m => m.id !== client.id);

            if (transferringRoom) {
                return;
            }

            const topDamagers = this.getTopDamagers(10);

            const xpToGift = this.petalSlots.reduce((acc, slot) => acc + Math.pow(slot.rarity + 1, 3), 0);
            client.addXP(-Math.random() * .1 * client.xp);

            topDamagers.forEach(damager => {
                if (damager.type === ENTITY_TYPES.PLAYER && damager.clientID !== null) {
                    const damagerClient = state.clients.get(damager.clientID);

                    if (damagerClient) {
                        damagerClient.addXP(xpToGift);
                    }
                }
            });

            const currentRoom = RoomManager.roomOf(client.id);

            if (currentRoom && currentRoom.name === "main-ffa") {
                const gardenRoom = RoomManager.findByName("main-garden");

                if (gardenRoom) {
                    setTimeout(() => {
                        RoomManager.moveClient(client, gardenRoom);
                        client.spawn();
                    }, 0);
                }
            } else if (currentRoom && currentRoom.gamemode !== "waves") {
                setTimeout(() => client.spawn(), 0);
            }
        }
    }
}

class FakeClient {
    constructor(id) {
        this.id = id;

        /** @type {AIPlayer|Player|null} */
        this.body = null;

        this.camera = {
            lightingBoost: 1
        };

        this.level = 1;
        this.xp = 1;

        this.slots = new Array(5).fill(null).map(() => ({ id: 0, rarity: 2 }));
        this.secondarySlots = new Array(5).fill(null).map(() => null);
    }

    talk() { }

    addXP(x) {
        if (!Number.isFinite(x)) {
            return;
        }

        this.xp += x;

        while (this.xp < xpForLevel(this.level - 1)) {
            this.level--;

            if (this.body && !this.body.health.isDead) {
                this.body.health.set(this.healthAdjustement + this.body.petalSlots.reduce((acc, slot) => acc + slot.config.tiers[slot.rarity].extraHealth, 0));
                this.body.damage = this.bodyDamageAdjustment;
            }
        }

        while (this.xp >= xpForLevel(this.level)) {
            this.level++;

            if (this.body && !this.body.health.isDead) {
                this.body.health.set(this.healthAdjustement + this.body.petalSlots.reduce((acc, slot) => acc + slot.config.tiers[slot.rarity].extraHealth, 0));
                this.body.damage = this.bodyDamageAdjustment;
            }
        }

        let slots = 5 + Math.min(5, Math.floor(this.level / 10));
        if (slots !== this.slots.length) {
            if (slots > this.slots.length) {
                for (let i = this.slots.length; i < slots; i++) {
                    this.slots.push({ id: 0, rarity: 0 });
                    this.secondarySlots.push(null);
                }
            } else if (slots < this.slots.length) {
                for (let i = this.slots.length - 1; i >= slots; i--) {
                    this.slots.pop();
                    this.secondarySlots.pop();
                }
            }
        }
        if (this.body && !this.body.health.isDead) {
            this.body.initSlots(slots);
        }
    }

    get healthAdjustement() {
        return 40 + 5 * Math.pow(this.level, 1.5);
    }

    get bodyDamageAdjustment() {
        return 5 + 1 * Math.pow(this.level, 1.5);
    }

    get highestRarity() {
        let highest = 0;
        for (const slot of this.slots) {
            if (slot.rarity > highest) {
                highest = slot.rarity;
            }
        }

        for (const slot of this.secondarySlots) {
            if (slot && slot.rarity > highest) {
                highest = slot.rarity;
            }
        }

        return highest;
    }
}

export class AIPlayer extends Player {
    static names = [
        "Abe", "Abraham", "Adam", "Adrian", "Al", "Alan", "Albert", "Alex", "Alexander", "Alfred", "Allan", "Allen", "Alvin", "Andre",
        "Andrew", "Andy", "Anthony", "Antonio", "Archie", "Arnold", "Arthur", "Austin", "Barry", "Ben", "Benjamin", "Bernard", "Bill",
        "Billy", "Bob", "Bobby", "Brad", "Bradley", "Brandon", "Brent", "Brett", "Brian", "Bruce", "Bryan", "Calvin", "Carl", "Cary",
        "Casey", "Cecil", "Chad", "Charles", "Charlie", "Chester", "Chris", "Christian", "Christopher", "Chuck", "Clarence", "Clifford",
        "Clint", "Clyde", "Cody", "Colin", "Corey", "Craig", "Curtis", "Dale", "Dan", "Daniel", "Danny", "Darrell", "Darren", "Dave",
        "David", "Dean", "Dennis", "Derek", "Derrick", "Don", "Donald", "Doug", "Douglas", "Duane", "Dustin", "Dwayne", "Dwight", "Dylan",
        "Earl", "Ed", "Eddie", "Edgar", "Edward", "Edwin", "Eli", "Eric", "Ernest", "Eugene", "Evan", "Floyd", "Francis", "Frank",
        "Franklin", "Fred", "Freddie", "Gabriel", "Garry", "Gary", "Gene", "Geoffrey", "George", "Gerald", "Gilbert", "Glen", "Glenn",
        "Gordon", "Greg", "Gregory", "Guy", "Harold", "Harry", "Harvey", "Henry", "Herbert", "Homer", "Horace", "Howard", "Hugh", "Ian",
        "Ira", "Isaac", "Jack", "Jacob", "Jake", "James", "Jamie", "Jason", "Jay", "Jeff", "Jeffery", "Jeffrey", "Jeremiah", "Jeremy", "Jerome",
        "Jerry", "Jesse", "Jim", "Jimmy", "Joe", "Joel", "John", "Johnny", "Jon", "Jonathan", "Jordan", "Jose", "Joseph", "Josh", "Joshua",
        "Juan", "Julian", "Justin", "Karl", "Keith", "Ken", "Kenneth", "Kenny", "Kent", "Kevin", "Kirk", "Kurt", "Kyle", "Lance", "Larry",
        "Lawrence", "Lee", "Leo", "Leon", "Leonard", "Leroy", "Leslie", "Lewis", "Lloyd", "Lonnie", "Louis", "Lucas", "Luther", "Marc",
        "Marcus", "Mario", "Marion", "Mark", "Marshall", "Martin", "Marvin", "Matt", "Matthew", "Maurice", "Max", "Melvin", "Michael",
        "Micheal", "Mike", "Mitchell", "Nathan", "Nathaniel", "Neil", "Nelson", "Nicholas", "Norman", "Oliver", "Oscar", "Otis", "Patrick",
        "Paul", "Perry", "Peter", "Phil", "Philip", "Phillip", "Ralph", "Randall", "Randy", "Ray", "Raymond", "Reginald", "Rex", "Richard",
        "Rick", "Rickey", "Ricky", "Robert", "Rodney", "Roger", "Ron", "Ronald", "Ronnie", "Ross", "Roy", "Russell", "Ryan", "Sam", "Samuel",
        "Scott", "Sean", "Seth", "Shane", "Shannon", "Shaun", "Shawn", "Sidney", "Stanley", "Stephen", "Steve", "Steven", "Ted", "Terry",
        "Theodore", "Thomas", "Tim", "Timothy", "Todd", "Tom", "Tommy", "Tony", "Tracy", "Travis", "Troy", "Tyler", "Tyrone", "Vernon",
        "Victor", "Vincent", "Virgil", "Wade", "Wallace", "Walter", "Warren", "Wayne", "Wesley", "Willard", "William", "Willie", "Zachary",
        "Zane", "Thot Clapper", "Grim Reaper", "real dev", "fake dev", "the void", "&#*!@$^*&$", "error 404", "ej", "Amara", "Lucifer", "Castiel",
    ];

    constructor(position = { x: 0, y: 0 }, rarity = 0, level = 5) {
        super(position);

        this.team = -69;

        /** @type {Entity|null} */
        this.target = null;
        this.targetTick = 0;

        this.randomMovementTick = 0;

        this.name = ":" + AIPlayer.names[Math.floor(Math.random() * AIPlayer.names.length)] + ":";

        this.client = new FakeClient(1024 + this.id);
        this.client.body = this;
        this.client.addXP(xpForLevel(level) + 1);

        this.index = 255

        for (let i = 0; i < this.petalSlots.length; i++) {
            const pRarity = Math.max(0, rarity - Math.random() * 2 | 0);
            const petalID = randomPossiblePetal(rarity);
            this.client.slots[i] = { id: petalID, rarity: pRarity };
            this.petalSlots[i].define(petalConfigs[petalID], pRarity);
        }

        state.livingMobCount++;
        if (state.isWaves) {
            state.aliveMobs.push(this);
        }
    }

    update() {
        if (this.target && this.target.health.isDead) {
            this.target = null;
        }

        if (this.target) {
            this.moveAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
            this.moveStrength = this.speed;

            if (this.health.ratio < .334) {
                this.defend = true;
                this.attack = false;
                this.moveAngle += Math.PI + Math.sin(performance.now() / 2500) * .5;
            } else {
                this.defend = false;
                this.attack = true;
            }
        } else {
            this.attack = this.defend = false;
        }

        super.update();
    }

    collide() {
        super.collide();

        if (this.targetTick-- <= 0) {
            this.targetTick = 30;

            this.target = this.findTarget(1024, true);
        }
    }

    destroy() {
        super.destroy();
        if (state.isWaves) {
            state.aliveMobs = state.aliveMobs.filter(m => m.id !== this.id);
        }
        state.livingMobCount--;

        const topDamagers = this.getTopDamagers(10).filter(damager => damager.type === ENTITY_TYPES.PLAYER);
        topDamagers.forEach(damager => {
            const client = state.clients.get(damager.clientID);

            if (client) {
                for (let i = 0; i < this.petalSlots.length; i++) {
                    if (Math.random() < .85) {
                        continue;
                    }

                    new Drop({
                        x: this.x + Math.random() * 75 - 37.5,
                        y: this.y + Math.random() * 75 - 37.5
                    }, client, this.petalSlots[i].config.id, Math.min(client.highestRarity + 1, this.petalSlots[i].rarity));
                }
            }
        });
    }
}

export class Mob extends Entity {
    static segmentedLength = 0;

    static TEMPORARY_RANDOM_RARITY() {
        const rnd = Math.random();

        if (rnd > .99995) {
            return 5;
        }

        if (rnd > .995) {
            return 4;
        }

        if (rnd > .9) {
            return 3;
        }

        if (rnd > .8) {
            return 2;
        }

        if (rnd > .6) {
            return 1;
        }

        return 0;
    }

    constructor(position = { x: 0, y: 0 }) {
        super(position);
        this.type = ENTITY_TYPES.MOB;

        this.index = 0;
        this.rarity = 0;
        this.facing = Math.random() * Math.PI * 2;
        this.movementAngle = Math.random() * Math.PI * 2;
        this.moveStrength = 0;
        this.tick = 0;
        this.team = -69;
        this.aggressive = false;
        this.neutral = false;
        this.friendly = false;
        this.yellow = false;

        /** @type {Mob|null} */
        this.head = null;

        /** @type {Entity|null} */
        this.target = null;
        this.targetTick = 0;
        this.extraTicker = 0;

        this.projectile = null;

        this.givesXP = true;

        state.livingMobCount++;

        this.config = mobConfigs[0];
        this.lastSeen = performance.now() + 10000;

        /** @type {{index:number,time:number}|null} */
        this.hatchable = null;

        /** @type {{index:number,ticker:number,interval:number}} */
        this.poopable = null;

        this.deathEvent = null;
        this.movesInBursts = false;
        this.spins = {
            rate: 0,
            constant: false
        }
        this.fleeAtLowHealth = 0;
        this.healing = 0;

        this.segmentID = -1;

        this.ropeBodies = null;

        this._countsTowardsMobCount = true;
    }

    get countsTowardsMobCount() {
        return this._countsTowardsMobCount;
    }

    set countsTowardsMobCount(value) {
        const old = this._countsTowardsMobCount;

        if (old === value) {
            return;
        }

        this._countsTowardsMobCount = value;

        if (old && !value) {
            state.livingMobCount--;
        }

        if (!old && value) {
            state.livingMobCount++;
        }
    }

    /** @param {MobConfig} config */
    define(config, rarity = 0) {
        this.config = config;
        rarity = Math.min(config.tiers.length - 1, rarity);
        const tier = config.tiers[rarity];

        this.health.set(tier.health);
        this.damage = tier.damage;
        this.size = tier.size * (.98 + Math.random() * .04) * (config.sizeRand.min + Math.random() * config.sizeRand.max);
        this.speed = config.speed;
        this.index = config.id;
        this.rarity = rarity;
        this.aggressive = config.aggressive;
        this.neutral = config.neutral;
        this.friendly = config.friendly;
        this.noDebuff = config.noDebuff;
        this.spins = config.spins;
        this.healing = config.healing;
        this.fleeAtLowHealth = config.fleeAtLowHealth;
        this.armor = 0;

        this.spawnInvincibility = true

        setTimeout(() => {
            this.spawnInvincibility = false
        }, .334 * 1000);

        this.health.damageReduction += tier.damageReduction;

        if (tier.projectile) {
            this.projectile = {
                ...tier.projectile,
                tick: 0
            };
        }

        if (tier.poison) {
            this.poison.toApply.damage = tier.poison.damage;
            this.poison.toApply.timer = tier.poison.duration;
        }

        if (config.damageReflection) {
            this.damageReflection.reflection = config.damageReflection.reflection;
            this.damageReflection.cap = config.damageReflection.cap;
        }

        if (tier.armor) {
            this.armor = tier.armor;
        }

        if (tier.antHoleSpawns) {
            const spawns = structuredClone(tier.antHoleSpawns);

            const sp = s => {
                const a = Math.random() * Math.PI * 2;
                const d = this.size + s + 1;

                return {
                    x: this.x + Math.cos(a) * d,
                    y: this.y + Math.sin(a) * d
                };
            }

            for (let i = 0; i < spawns.length; i++) {
                spawns[i].maxCount = spawns[i].count;
            }

            const roomState = getActiveRoomState();

            for (const spawn of spawns) {
                if (spawn.count > 4) {
                    for (let i = 0, n = Math.random() * 4 | 0; i < n; i++) {
                        setTimeout(() => {
                            if (Math.random() >= spawn.chance) {
                                return;
                            }

                            const previousRoomState = getActiveRoomState();
                            setActiveRoomState(roomState);

                            const rarity = Math.max(0, this.rarity - (Math.random() * 2 | 0));
                            const mob = new Mob(sp(mobConfigs[spawn.index].tiers[rarity].size));
                            mob.define(mobConfigs[spawn.index], rarity);
                            mob.team = this.team;
                            if (mob.config.name === "Digger") {
                                mob.team = 0;
                            }
                            mob.friendly = this.friendly;
                            mob.yellow = this.yellow;
                            spawn.count--;
                            spawn.maxCount--;

                            if (state.isWaves) {
                                state.maxMobs++;
                                state.aliveMobs.push(mob);
                            }

                            setActiveRoomState(previousRoomState);
                        }, 64);
                    }
                }
            }

            this.health.onDamage = () => {
                for (const spawn of spawns) {
                    if (spawn.count <= 0) {
                        continue;
                    }

                    if (!!!spawn.minHealthRatio || this.health.ratio <= spawn.minHealthRatio) {
                        while (spawn.count > 0 && (spawn.minHealthRatio < 1 || this.health.ratio <= spawn.count / spawn.maxCount)) {
                            if (Math.random() >= spawn.chance) {
                                spawn.count--;
                                continue;
                            }

                            const rarity = spawn.maxCount === 1 ? this.rarity : Math.max(0, this.rarity - (Math.random() * 2 | 0));
                            const mob = new Mob(sp(mobConfigs[spawn.index].tiers[rarity].size));
                            mob.define(mobConfigs[spawn.index], rarity);
                            mob.aggressive = true;
                            mob.team = this.team;
                            if (mob.config.name === "Digger") {
                                mob.team = 0;
                            }
                            mob.friendly = this.friendly;
                            mob.yellow = this.yellow;
                            spawn.count--;

                            if (state.isWaves) {
                                state.maxMobs++;
                                state.aliveMobs.push(mob);
                            }
                        }
                    }
                }
            };
        }

        if (config.hatchables?.length > 0) {
            this.hatchable = structuredClone(config.hatchables[Math.random() * config.hatchables.length | 0]);
        }

        if (config.poopable) {
            this.poopable = {
                index: config.poopable.index,
                ticker: 0,
                interval: config.poopable.interval
            };
        }

        if (config.segment) {
            const segmentID = Mob.segmentedLength++;
            let count = 3;
            let chance = Math.max(0.1, 0.8 - (this.rarity / 9) * 0.31);
            
            for (let s = 0; s < 27; s++) {
                if (Math.random() < chance) {
                    count++;
                } else {
                    break;
                }
            }
            let last = this;

            this.segmentID = segmentID;
            this.segmentBodies = [];

            for (let i = 0; i < count; i++) {
                const segment = new Mob(this);
                segment.head = last;
                segment.define(mobConfigs[config.segment], this.rarity);
                segment.countsTowardsMobCount = false;
                segment.segmentID = segmentID;
                segment.team = this.team;
                segment.friendly = this.friendly;
                segment.yellow = this.yellow;

                segment.x = last.x - Math.cos(this.facing) * (this.size + segment.size + 1);
                segment.y = last.y - Math.sin(this.facing) * (this.size + segment.size + 1);
                segment.facing = this.facing;

                this.segmentBodies.push(segment)
                if (state.isWaves && !segment.friendly) {
                    state.aliveMobs.push(segment)
                }
                last = segment;
            }
        }

        if (config.branch) {
            const segmentID = Mob.segmentedLength++;
            for (let branchID = 0; branchID < config.branch.branches; branchID++) {
                const count = config.branch.branchLength
                let last = this;

                this.segmentID = segmentID;

                for (let i = 0; i < count; i++) {
                    const segment = new Mob(this);
                    segment.head = last;
                    segment.define(mobConfigs[config.branch.index], this.rarity);
                    segment.countsTowardsMobCount = false;
                    segment.segmentID = segmentID;
                    segment.team = this.team;
                    segment.friendly = this.friendly;
                    segment.yellow = this.yellow;

                    const ang = this.facing + branchID * (Math.PI * 2) / config.branch.branches

                    segment.x = last.x - Math.cos(ang) * (this.size + segment.size + 1);
                    segment.y = last.y - Math.sin(ang) * (this.size + segment.size + 1);
                    this.facing = ang / 3;
                    segment.facing = ang;

                    if (state.isWaves && !segment.friendly) {
                        state.aliveMobs.push(segment)
                    }

                    last = segment;
                }
            }
        }

        if (config.name === "Leech" && !this.head) {
            const count = 4 + Math.random() * 5 | 0;
            let last = this;
            let parent = this;

            const segmentID = Mob.segmentedLength++;
            this.segmentID = segmentID;

            this.ropeBodies = [];

            for (let i = 0; i < count; i++) {
                const segment = new Mob(this);
                segment.head = last;
                segment.define(mobConfigs[this.index], this.rarity);
                segment.size = this.size;
                segment.givesXP = false;
                segment.health = this.health;
                segment.canBeViewed = false;
                segment.countsTowardsMobCount = false;
                segment.segmentID = segmentID;
                segment.team = this.team;
                segment.parent = this;

                segment.x = last.x - Math.cos(this.facing) * (this.size + segment.size + 1);
                segment.y = last.y - Math.sin(this.facing) * (this.size + segment.size + 1);
                segment.facing = this.facing;

                this.ropeBodies.push(segment);

                last = segment;
            }
        }

        this.movesInBursts = config.movesInBursts;

        if (this.config.name === "Dandelion") {
            const k = [];

            this.id--;
            Entity.idAccumulator--;

            for (let i = 0; i < 8; i++) {
                const angle = Math.PI * 2 / 8 * i + this.facing;
                const missile = new Petal(this, -1, -1);
                missile.team = this.team;
                missile.define(petalConfigs[petalIDOf("Dandelion")], this.rarity);
                missile.facing = angle;
                missile.pushability = 0;
                missile.dandelionBind = this;
                missile.size = this.size / 2;
                missile.health.set(missile.health.maxHealth * 3);

                missile.x = this.x + Math.cos(angle) * (this.size + missile.size * 1.2);
                missile.y = this.y + Math.sin(angle) * (this.size + missile.size * 1.2);

                k.push(missile);
            }

            let released = false;

            this.health.onDamage = () => {
                k.forEach(missile => {
                    missile.dandelionBind = false;
                    missile.moveAngle = missile.facing;
                    missile.launched = true;
                    missile.range = 22.5 * 3;
                });

                released = true;
            }

            this.deathEvent = () => {
                if (!released) {
                    k.forEach(missile => missile.destroy());
                }
            }

            this.id = Entity.idAccumulator++;
            state.entities.set(this.id, this);
        }

        if (this.config.name === "Spirit") {
            this.deathEvent = () => {
                const choices = mobConfigs.filter(config => {
                    if (!config.isSystem) return true
                });
                const mob = new Mob(this);
                mob.friendly = this.friendly;
                mob.yellow = this.yellow;
                mob.team = this.team;
                mob.define(choices[Math.random() * choices.length | 0], this.rarity);
            }
        }

        if (config.strafes) this.strafes = {
            ...config.strafes,
            cTick: 0, // cooldown
            mTick: 0, // movement
            direction: 0
        }

        this.pushability = config.pushability / Math.pow(1.10, rarity)
    }

    update() {
        if (this.parent.type === ENTITY_TYPES.PLAYER && this.parent.health.isDead) {
            this.destroy();
            return;
        }

        if (state.mobsExpire && (this.head === null || this.head.health.isDead) && (this.lastSeen + (this.health.ratio <= .8 ? 120_000 : 30_000)) < performance.now()) {
            this.damagedBy = []
            this.destroy();
            return;
        }

        if (this.healing > 0 && this.health.ratio > 0 && !this.dandelionCooldown) {
            this.health.health = Math.min(this.health.maxHealth, this.health.health + this.health.maxHealth * this.healing);
        }

        if (this.hatchable !== null) {
            this.hatchable.time--;

            if (this.hatchable.time <= 0) {
                this.destroy();

                const mob = new Mob(this);
                mob.define(mobConfigs[this.hatchable.index], this.rarity);
                mob.target = this.parent.target;
                mob.team = this.team;
                mob.friendly = this.friendly;
                mob.yellow = this.yellow;
                if (state.isWaves && !mob.friendly) {
                    state.aliveMobs.push(mob)
                }
                this.hatchable = null;
                return;
            }
        }

        if (this.head !== null) {
            if (this.head.health.isDead) {
                this.head = null;
                this.countsTowardsMobCount = true;
                return;
            }

            const atan2 = Math.atan2(this.head.y - this.y, this.head.x - this.x);
            this.x = this.head.x - Math.cos(atan2) * (this.size + this.head.size + 1);
            this.y = this.head.y - Math.sin(atan2) * (this.size + this.head.size + 1);
            this.facing = atan2;
        } else if (this.speed > 0) {
            this.tick--;
            if (this.tick2) this.tick2--;

            if (this.target?.health.ratio > 0) {
                if (this.poopable !== null) {
                    this.poopable.ticker++;

                    if (this.poopable.ticker >= this.poopable.interval - 22.5 * 1) {
                        this.velocity.multiply(-.1)
                    }

                    if (this.poopable.ticker >= this.poopable.interval) {
                        this.poopable.ticker = 0;

                        const poop = new Mob(this);
                        poop.x -= Math.cos(this.facing) * this.size * 2;
                        poop.y -= Math.sin(this.facing) * this.size * 2;
                        poop.define(mobConfigs[this.poopable.index], Math.max(0, this.rarity - 1));
                        poop.team = this.team;
                        poop.parent = this;
                        poop.friendly = this.friendly;
                        poop.yellow = this.yellow;

                        if (state.isWaves) {
                            state.maxMobs++;
                            state.aliveMobs.push(poop);
                        }
                    }
                }
                
                if (this.config.sandstormMovement) {
                    const angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
                    const dist = quickDiff(this, this.target);

                    if (dist > Math.pow(this.size * 5 + this.target.size * 4 + 50, 2)) {
                        this.movementAngle = angle;
                        this.moveStrength = this.speed;
                        this.extraTicker = angle + Math.PI + (Math.random() * Math.PI / 1.5) - (Math.PI / 3);
                    } else {
                        const orbitDist = (Math.sin(this.extraTicker) * .7 + .6) * (this.target.size * 10 + this.size * 5);
                        const tx = this.target.x + Math.cos(this.extraTicker) * orbitDist;
                        const ty = this.target.y + Math.sin(this.extraTicker) * orbitDist;
                        const d2 = quickDiff(this, { x: tx, y: ty });
                        const a2 = Math.atan2(ty - this.y, tx - this.x);

                        if (d2 < this.size * 1.25) {
                            this.extraTicker = angle + Math.PI + (Math.random() * Math.PI) - (Math.PI / 2);
                        }

                        this.movementAngle = a2;
                        this.moveStrength = this.speed;
                    }
                } else if (this.movesInBursts) {
                    if (this.tick <= 0) {
                        this.tick = 35 - this.rarity;
                        this.movementAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);
                        this.moveStrength = this.speed;
                    }

                    this.moveStrength *= .7;
                } else if (this.strafes?.cTick < this.strafes?.cooldown) {
                    this.strafes.cTick++;
                } else {
                    this.movementAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);

                    if (this.config.tiers[this.rarity].lightning) {
                        const diff = quickDiff(this, this.target);

                        if (diff < Math.pow(this.config.tiers[this.rarity].lightning.range, 2) * .85) {
                            this.moveStrength = 0;
                        } else {
                            this.moveStrength = this.speed;
                        }
                    } else if (this.projectile && !this.strafes || this.strafes?.mTick > this.strafes?.length) {
                        if (this.projectile.runs === false) {
                            const diff = quickDiff(this, this.target);

                            if (diff < Math.pow(this.projectile.range * this.projectile.speed, 2) * .85) {
                                this.moveStrength = 0;
                            } else {
                                this.moveStrength = this.speed;
                            }
                        } else {
                            this.moveStrength = this.speed;
                        }
                    } else {
                        this.moveStrength = this.speed;
                    }

                    if (this.health.ratio < this.fleeAtLowHealth) {
                        this.movementAngle += Math.PI;
                        this.moveStrength *= .85;
                    }

                    if (this.strafes) {
                        if (this.strafes.mTick < this.strafes.length) {
                            this.movementAngle += (this.strafes.direction == 0 ? Math.PI : -Math.PI) / 2;
                            this.moveStrength *= this.strafes.speedMult;
                            this.strafes.cTick = this.strafes.cooldown;

                            if (Math.random() < .025) this.strafes.direction = !this.strafes.direction;
                        } else {
                            this.strafes.mTick = 0;
                            this.strafes.cTick = 0;
                        }
                        this.strafes.mTick++;
                    }
                }
            } else if (this.movesInBursts) {
                this.moveStrength *= .7;
            } else if (this.config.centipedeMovement) {
                if (this.parent.type === ENTITY_TYPES.PLAYER) {
                    this.movementAngle = Math.atan2(this.parent.y - this.y, this.parent.x - this.x);
                    this.moveStrength = quickDiff(this, this.parent) < this.size + this.parent.size * 2 ? 0 : this.speed;
                } else {
                    if (this.tick <= 0) {
                        this.tick = 22.5 * 4;
                        if (this.moveStrength !== this.speed / 5) {
                            this.movementAngle = Math.random() * Math.PI * 2;
                            this.moveStrength = this.speed / 5;
                        }
                        if (Math.random() > .5) {
                            this.movementAngle += 1.2 * (Math.random() * .4 + .6)
                        } else {
                            this.movementAngle -= 1.2 * (Math.random() * .4 + .6)
                        }
                    }
                }
            } else if (this.config.desertCentipedeMovement) {
                if (this.tick <= 0) {
                    this.tick = 22.5 * .1;
                    if (this.clockwise) {
                        this.movementAngle -= .15;
                    } else {
                        this.movementAngle += .15;
                    }
                    if (!this.tick2 || this.tick2 <= 0) {
                        this.tick2 = 22.5 * 4;
                        this.movementAngle = Math.random() * Math.PI * 2;
                        this.clockwise = Math.random() > .5
                    }
                    if (this.moveStrength !== this.speed) {
                        this.movementAngle = Math.random() * Math.PI * 2;
                        this.moveStrength = this.speed;
                    }
                }
            } else if (this.config.bumblebeeMovement) {
                if (this.tick <= 0) {
                    this.tick = 22.5 * 6;
                    this.movementAngle = Math.random() * Math.PI * 2;
                    this.moveStrength = this.speed;
                }
            } else {
                if (this.parent.type === ENTITY_TYPES.PLAYER) {
                    this.movementAngle = Math.atan2(this.parent.y - this.y, this.parent.x - this.x);
                    this.moveStrength = quickDiff(this, this.parent) < this.size + this.parent.size * 2 ? 0 : this.speed;
                } else {
                    if (this.tick <= 0) {
                        this.tick = 22.5 * 4;
                        this.movementAngle = Math.random() * Math.PI * 2;
                        this.moveStrength = this.speed;
                    }
                }

                this.moveStrength *= .95;
            }

            if (this.config.moveInSines) {
                if (this.config.bumblebeeMovement) {
                    this.movementAngle += Math.sin(performance.now() / 120 + this.id) * .1 * (this.velocity.magnitude * .5);
                } else {
                    this.movementAngle += Math.sin(performance.now() / 120 + this.id) * .1 * this.velocity.magnitude;
                }
            }

            this.velocity.x += Math.cos(this.movementAngle) * this.moveStrength;
            this.velocity.y += Math.sin(this.movementAngle) * this.moveStrength;

            if (!this.projectile || this.projectile.aimLockTick <= 0) {
                if (this.spins) {
                    this.facing += (this.spins.constant == false ? this.velocity.magnitude : 1) / this.speed * .1 * this.spins.rate;
                } else {
                    this.facing = this.movementAngle;
                }
            }

            if (this.strafes && this.target) if (this.strafes.cTick == this.strafes.cooldown) {
                this.facing -= (this.strafes.direction == 0 ? Math.PI : -Math.PI) / 2;
            }
        }

        if (this.projectile !== null) {
            this.projectile.tick++;

            if (this.projectile.aimLockTick > 0) {
                this.projectile.aimLockTick--;
            }

            if ((this.config.name === "Bumblebee" || this.config.isPortal || this.target?.health.ratio > 0) && this.projectile.tick >= this.projectile.cooldown) {
                this.projectile.tick = 0;

                if (this.projectile.aimbot && this.target) {
                    const dist = Math.sqrt(quickDiff(this, this.target));
                    const time = dist / this.projectile.speed / 2;
                    const targetX = this.target.x + this.target.velocity.x * time;
                    const targetY = this.target.y + this.target.velocity.y * time;
                    this.facing = Math.atan2(targetY - this.y, targetX - this.x);
                    this.projectile.aimLockTick = 7;
                }

                if (this.projectile.multiShot) {
                    const roomState = getActiveRoomState();

                    for (let i = 0; i < this.projectile.multiShot.count; i++) {
                        setTimeout(() => {
                            if (this.health.isDead || this.target === null || this.target.health.isDead) {
                                return;
                            }

                            const previousRoomState = getActiveRoomState();
                            setActiveRoomState(roomState);

                            const petal = new Petal(this, -1, -1);
                            petal.define(petalConfigs[this.projectile.petalIndex], this.rarity);
                            petal.index = this.projectile.petalIndex;
                            petal.size = this.size * this.projectile.size;
                            petal.health.set(this.projectile.health);
                            petal.damage = this.projectile.damage;
                            petal.speed = this.projectile.stops ? 0 : this.projectile.speed;
                            petal.launched = true;
                            petal.range = this.projectile.range;
                            petal.spinSpeed = 0;
                            petal.nullCollision = this.projectile.nullCollision;

                            let ang = this.projectile.random ? Math.random() * Math.PI * 2 : this.facing;

                            if (this.projectile.multiShot.spread > 0) {
                                ang += (Math.random() - .5) * this.projectile.multiShot.spread;

                                if (!this.projectile.stops) {
                                    petal.speed *= 1 + (Math.random() - .5) * this.projectile.multiShot.spread;
                                }
                            }

                            petal.facing = petal.moveAngle = ang;

                            if (!this.projectile.center) {
                                petal.x += Math.cos(ang) * this.size * .8;
                                petal.y += Math.sin(ang) * this.size * .8;
                            }

                            if (this.projectile.stops) {
                                const spreadFactor = this.projectile.multiShot.spread > 0 ? 1 + (Math.random() - .5) * this.projectile.multiShot.spread : 1;
                                petal.velocity.x += Math.cos(ang) * this.projectile.speed * spreadFactor;
                                petal.velocity.y += Math.sin(ang) * this.projectile.speed * spreadFactor;
                            }

                            if (this.projectile.recoil > 0) {
                                this.velocity.x -= Math.cos(ang) * this.projectile.recoil;
                                this.velocity.y -= Math.sin(ang) * this.projectile.recoil;
                            }

                            setActiveRoomState(previousRoomState);
                        }, i * this.projectile.multiShot.delay);
                    }
                } else {
                    const petal = new Petal(this, -1, -1);
                    petal.define(petalConfigs[this.projectile.petalIndex], this.rarity);
                    petal.index = this.projectile.petalIndex;
                    petal.size = this.size * this.projectile.size;
                    petal.health.set(this.projectile.health);
                    petal.damage = this.projectile.damage;
                    petal.speed = this.projectile.stops ? 0 : this.projectile.speed;
                    petal.launched = true;
                    petal.range = this.projectile.range;
                    petal.spinSpeed = 0;
                    petal.nullCollision = this.projectile.nullCollision;

                    const ang = this.projectile.random ? Math.random() * Math.PI * 2 : this.facing;
                    petal.facing = petal.moveAngle = ang;

                    if (!this.projectile.center) {
                        petal.x += Math.cos(ang) * this.size * .66;
                        petal.y += Math.sin(ang) * this.size * .66;

                        if (this.config.name === "Tank") {
                            petal.x += Math.cos(ang) * (this.size) * 1.25;
                            petal.y += Math.sin(ang) * (this.size) * 1.25;
                        }
                    }

                    if (this.projectile.stops) {
                        petal.velocity.x += Math.cos(ang) * this.projectile.speed;
                        petal.velocity.y += Math.sin(ang) * this.projectile.speed;
                    }

                    if (this.projectile.recoil > 0) {
                        this.velocity.x -= Math.cos(ang) * this.projectile.recoil;
                        this.velocity.y -= Math.sin(ang) * this.projectile.recoil;
                    }
                }
            }
        }

        if (this.config.isPortal) {
            this.facing = performance.now() / 1000 * (2 * Math.PI / 3);

            const pullRadius = 1.5 * this.size;
            const pullRadiusSq = pullRadius * pullRadius;

            this.portalQueue ??= new Set();

            state.alivePlayers.forEach(client => {
                if (!client.body || client.body.health.isDead) return;

                const dx = client.body.x - this.x;
                const dy = client.body.y - this.y;
                const distSq = dx * dx + dy * dy;

                if (distSq >= pullRadiusSq) return;

                const dist = Math.sqrt(distSq) || 1;
                const pull = 1 - dist / pullRadius;
                const strength = 12 + 20 * pull * pull;

                client.body.velocity.x -= dx / dist * strength;
                client.body.velocity.y -= dy / dist * strength;

                if (this.portalQueue.has(client)) return;
                this.portalQueue.add(client);

                const portal = this;

                setTimeout(() => {
                    portal.portalQueue?.delete(client);

                    if (portal.health.isDead || !client.body || client.body.health.isDead) {
                        return;
                    }

                    const fromRoom = RoomManager.roomOf(client.id);
                    if (!fromRoom) return;

                    if (portal.sideTargetRoomName) {
                        const targetRoom = RoomManager.findByName(portal.sideTargetRoomName);
                        if (!targetRoom) return;

                        RoomManager.moveClient(client, targetRoom);
                        return;
                    }

                    if (ROOM_CENTER_PORTALS[fromRoom.name] !== portal.config.name) return;

                    const waveRoom = RoomManager.createWaveRoom(fromRoom);
                    RoomManager.moveClient(client, waveRoom);
                }, 1000);
            });
        }

        this.bindToRoom();

        super.update();
    }

    collide() {
        super.collide();
        this.collideTerrain();

        this.targetTick--;
        if (this.aggressive) {
            if (this.targetTick <= 0 || this.target === null || this.target.health.isDead) {
                this.targetTick = 25 + Math.random() * 100 | 0;
                this.target = this.findTarget(this.size * 12 + 50);
            }

            if (this.target?.health.ratio > 0) {
                if (this.config.tiers[this.rarity].lightning) {
                    const lightning = this.config.tiers[this.rarity].lightning;

                    this.extraTicker--;

                    if (this.extraTicker <= 0) {
                        new Lightning(this).define(lightning.damage, lightning.range, lightning.bounces).bounce();
                        this.extraTicker = lightning.cooldown * (.95 + Math.random() * .1);
                    }
                }
            }
        }
    }

    destroy() {
        if (this.deathEvent) {
            this.deathEvent();
        }

        super.destroy();

        if (!this.friendly && this.countsTowardsMobCount) {
            state.livingMobCount--;
        }

        if (!this.givesXP) {
            return;
        }

        const topDamagers = this.getTopDamagers(3, ENTITY_TYPES.PLAYER);
        let killText = '';
        topDamagers.forEach(damager => {
            if (damager.clientID > 0) {
                const client = state.clients.get(damager.clientID);

                if (client) {
                    client.addXP(Math.max(1, this.health.maxHealth / 100));
                }
            }
        });

        const roomClients = [...state.clients.values()];

        if (roomClients.length > 0) {
            const highestRarityInRoom = roomClients.reduce((max, c) => Math.max(max, c.highestRarity || 0), 0);

            const rolledDrops = [];
            for (const drop of mobConfigs[this.index].drops) {
                if (Math.random() > drop.chance) {
                    continue;
                }

                const rarity = getDropRarity(this.rarity, highestRarityInRoom + 5);
                if (rarity < drop.minRarity) {
                    continue;
                }

                rolledDrops.push({ index: drop.index, rarity });
            }

            if (rolledDrops.length > 0) {
                roomClients.forEach(client => {
                    const output = rolledDrops.map(rolled => new Drop(this, client, rolled.index, rolled.rarity));

                    for (let i = 0; i < output.length; i++) {
                        output[i].x += Math.cos(i / output.length * Math.PI * 2) * 30;
                        output[i].y += Math.sin(i / output.length * Math.PI * 2) * 30;
                    }
                });
            }
        }

        if (
            this.config.isSystem === false &&
            !this.friendly &&
            !["Queen Ant Egg", "Termite Overmind Egg", "Queen Fire Ant Egg"].includes(this.config.name) &&
            this.rarity >= state.announceRarity
        ) {
            if (topDamagers.length > 0) {
                killText = applyArticle(tiers[this.rarity].name, true) + " " + this.config.name + " was killed by ";
                for (let index = 0, max = topDamagers.length; index < max; index++) {
                    if (!state.clients.has(topDamagers[index].clientID)) {
                        continue;
                    }

                    const name = state.clients.get(topDamagers[index].clientID).username;
                    if (index === max - 1) {
                        if (max === 1) {
                            killText += name;
                        } else if (max === 2) {
                            killText += " and " + name;
                        } else {
                            killText += ", and " + name;
                        };
                    } else if (index === 0) {
                        killText += name;
                    } else {
                        killText += ", " + name;
                    };
                }
            } else {
                killText = applyArticle(tiers[this.rarity].name, true) + " " + this.config.name + " despawned";
            }
            state.clients.forEach(c => c.systemMessage(killText, tiers[this.rarity].color));
        }
    }
}

export class Drop {
    static idAccumulator = 1;

    constructor(position = { x: 0, y: 0 }, client, i, r) {
        this.id = Drop.idAccumulator++;
        this.x = position.x;
        this.y = position.y;

        /** @type {import("./Client.js").default} */
        this.client = client;

        this.size = 30;

        this.index = i;
        this.rarity = r;
        this.duration = 20 * Math.pow(1.1, r);

        this.creation = performance.now();

        this.client.addDrop(this);
        state.drops.set(this.id, this);
    }

    update() {
        if (this.creation + this.duration * 1e3 < performance.now()) {
            this.destroy();
        }

        if (this.client.body === null || this.client.body.health.isDead) {
            return;
        }

        const dx = this.x - this.client.body.x;
        const dy = this.y - this.client.body.y;
        const distSqr = dx * dx + dy * dy;

        if (distSqr < Math.pow(this.size + this.client.body.size + this.client.body.extraPickupRange, 2)) {
            if (this.client.pickupDrop(this)) {
                this.destroy();
            }
        }
    }

    destroy() {
        this.client.removeDrop(this);
        state.drops.delete(this.id);
    }
}

export class Pentagram {
    static idAccum = 1;

    constructor(parent, position, size, timer, rarity = parent.rarity ?? 0) {
        this.id = Pentagram.idAccum++;

        /** @type {Mob} */
        this.parent = parent;

        this.x = position.x;
        this.y = position.y;
        this.size = size;

        this.createdAt = Date.now();
        this.timer = timer;

        this.rarity = rarity;

        state.pentagrams.set(this.id, this);

        setTimeout(this.destroy.bind(this), timer);

        this.damage = Math.pow(this.rarity + 1, 3);
        this.poisonDamage = .5 / 22.5 * Math.pow(this.rarity + 1, 3);
        this.poisonTime = 22.5 * 5;
        this.speedDebuff = .75;
        this.speedDebuffTime = 22.5 * 5;
    }

    define(damage, poisonDamage, poisonTime, speedDebuff, speedDebuffTime) {
        this.damage = damage;
        this.poisonDamage = poisonDamage;
        this.poisonTime = poisonTime;
        this.speedDebuff = speedDebuff;
        this.speedDebuffTime = speedDebuffTime;
        return this;
    }

    destroy() {
        state.pentagrams.delete(this.id);

        if (this.parent.health.isDead) {
            return;
        }

        state.entities.forEach(entity => {
            if (entity.parent.id === this.parent.id || entity.parent.team === this.parent.team) {
                return;
            }

            const dx = this.x - entity.x;
            const dy = this.y - entity.y;
            const distSqr = dx * dx + dy * dy;

            if (distSqr < this.size * this.size) {
                entity.health.damage(this.damage);

                if (entity.parent && entity.config?.name === "Leech") {
                    entity.parent.damagedBy[this.parent.id] ??= [0, this.parent.type, this.parent.type === ENTITY_TYPES.PLAYER ? this.parent.name : this.parent.index, this.parent.type === ENTITY_TYPES.PLAYER && this.parent.client ? this.parent.client.id : null];
                    entity.parent.damagedBy[this.parent.id][0] += this.damage;
                } else {
                    entity.damagedBy[this.parent.id] ??= [0, this.parent.type, this.parent.type === ENTITY_TYPES.PLAYER ? this.parent.name : this.parent.index, this.parent.type === ENTITY_TYPES.PLAYER && this.parent.client ? this.parent.client.id : null];
                    entity.damagedBy[this.parent.id][0] += this.damage;
                }

                if (!entity.noDebuff) {
                    entity.poison.timer = this.poisonTime;
                    entity.poison.damage = this.poisonDamage;

                    entity.speedDebuff.timer = this.speedDebuffTime;
                    entity.speedDebuff.multiplier = this.speedDebuff;
                }
            }
        });
    }
}

export class Lightning {
    static idAccum = 1;

    constructor(parent) {
        this.id = Lightning.idAccum++;

        this.parent = parent;

        /** @type {{x:number,y:number}[]} */
        this.points = [{
            x: parent.x,
            y: parent.y,
            id: -1
        }];

        this.damage = 0;
        this.range = 0;
        this.bounces = 0;

        this.remainTick = 3;

        state.lightning.set(this.id, this);
    }

    define(damage, range, bounces) {
        this.damage = damage;
        this.range = range;
        this.bounces = bounces;
        return this;
    }

    bounce() {
        for (let i = 0; i < this.bounces; i++) {
            const last = this.points[this.points.length - 1];
            const retrieved = state.spatialHash.retrieve({
                _AABB: {
                    x1: last.x - this.range,
                    y1: last.y - this.range,
                    x2: last.x + this.range,
                    y2: last.y + this.range
                }
            });

            let closest = null,
                closestDist = Infinity;

            retrieved.forEach(entity => {
                if (entity.parent.id === this.parent.id || entity.parent.team === this.parent.team || this.points.some(p => p.id === entity.id) || (entity.type === ENTITY_TYPES.PETAL && !entity.attractsLightning)) {
                    return;
                }

                if (entity.type === ENTITY_TYPES.PETAL) {
                    closest = entity;
                    closestDist = 0;
                    return;
                }

                const dx = last.x - entity.x;
                const dy = last.y - entity.y;
                const distSqr = dx * dx + dy * dy;

                if (distSqr < closestDist) {
                    closest = entity;
                    closestDist = distSqr;
                }
            });

            if (closest === null) {
                break;
            }

            this.points.push({
                x: closest.x,
                y: closest.y,
                id: closest.id
            });

            if (closest.type === ENTITY_TYPES.PETAL) {
                break;
            }
        }

        for (let i = 1; i < this.points.length; i++) {
            const ent = state.entities.get(this.points[i].id);

            if (ent) {
                if (ent.type === ENTITY_TYPES.PLAYER) {
                    this.points[i].x += Math.random() * ent.size * 2 - ent.size;
                    this.points[i].y += Math.random() * ent.size * 2 - ent.size;

                    const d = quickDiff(this.points[i], ent);
                    if (d > ent.size * ent.size) {
                        continue;
                    }
                }

                ent.health.damage(this.damage);

                if (ent.parent && ent.config?.name === "Leech") {
                    ent.parent.damagedBy[this.parent.id] ??= [0, this.parent.type, this.parent.type === ENTITY_TYPES.PLAYER ? this.parent.name : this.parent.index, this.parent.type === ENTITY_TYPES.PLAYER && this.parent.client ? this.parent.client.id : null];
                    ent.parent.damagedBy[this.parent.id][0] += this.damage;
                } else {
                    ent.damagedBy[this.parent.id] ??= [0, this.parent.type, this.parent.type === ENTITY_TYPES.PLAYER ? this.parent.name : this.parent.index, this.parent.type === ENTITY_TYPES.PLAYER && this.parent.client ? this.parent.client.id : null];
                    ent.damagedBy[this.parent.id][0] += this.damage;
                }

                if (ent.type === ENTITY_TYPES.MOB && ent.neutral) {
                    ent.target = this.parent;
                }
            }
        }
    }

    update() {
        if (this.remainTick-- <= 0) {
            this.destroy();
            return;
        }
    }

    destroy() {
        state.lightning.delete(this.id);
    }
}

class Polygon {
    constructor(sides, x, y, radius, rotation) {
        this.numSides = sides.length;
        this.numPoints = this.numSides * 2;
        this.sides = new Float32Array(this.numPoints);
        this.points = new Float32Array(this.numPoints);

        this.x = 0;
        this.y = 0;
        this.radius = 0;
        this.rotation = 0;
        this._AABB = { x1: 0, y1: 0, x2: 0, y2: 0 };

        for (let i = 0; i < this.numSides; i++) {
            this.sides[i * 2] = sides[i].x;
            this.sides[i * 2 + 1] = sides[i].y;
        }

        this.transform(x, y, radius, rotation);
    }

    transform(x, y, radius, rotation) {
        if (this.x === x && this.y === y && this.radius === radius && this.rotation === rotation) {
            return;
        }

        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);

        for (let i = 0; i < this.numPoints; i += 2) {
            const pointX = this.sides[i];
            const pointY = this.sides[i + 1];

            this.points[i] = x + (pointX * cos - pointY * sin) * radius;
            this.points[i + 1] = y + (pointX * sin + pointY * cos) * radius;
        }

        this.x = x;
        this.y = y;
        this.radius = radius;
        this.rotation = rotation;
        this._AABB = this.getAABB();
    }

    getAABB() {
        let minX = Infinity,
            minY = Infinity,
            maxX = -Infinity,
            maxY = -Infinity;

        for (let i = 0; i < this.numPoints; i += 2) {
            const x = this.points[i];
            const y = this.points[i + 1];

            if (x < minX) {
                minX = x;
            }

            if (y < minY) {
                minY = y;
            }

            if (x > maxX) {
                maxX = x;
            }

            if (y > maxY) {
                maxY = y;
            }
        }

        return {
            x1: minX,
            y1: minY,
            x2: maxX,
            y2: maxY
        };
    }

    pointIsInside(x, y) {
        let inside = false;

        let x1 = this.points[this.numPoints - 2],
            y1 = this.points[this.numPoints - 1];

        for (let i = 0; i < this.numPoints; i += 2) {
            let x2 = this.points[i],
                y2 = this.points[i + 1];

            if (y < y1 !== y < y2 && x < (x2 - x1) * (y - y1) / (y2 - y1) + x1) {
                inside = !inside;
            }

            x1 = x2;
            y1 = y2;
        }

        return inside;
    }

    circleIntersectsEdge(px1, py1, px2, py2, cx, cy, radius) {
        const ABx = px2 - px1;
        const ABy = py2 - py1;
        const ACx = cx - px1;
        const ACy = cy - py1;

        const t = Math.max(0, Math.min(1, (ABx * ACx + ABy * ACy) / (ABx * ABx + ABy * ABy)));
        const dx = (px1 + ABx * t) - cx;
        const dy = (py1 + ABy * t) - cy;

        return dx * dx + dy * dy <= radius * radius;
    }

    circleIntersects(x, y, radius) {
        if (this.pointIsInside(x, y)) {
            return true;
        }

        for (let i = 0; i < this.numPoints; i += 2) {
            if (this.circleIntersectsEdge(this.points[i], this.points[i + 1], this.points[(i + 2) % this.numPoints], this.points[(i + 3) % this.numPoints], x, y, radius)) {
                return true;
            }
        }

        return false;
    }

    getClosestPointOnEdge(px1, py1, px2, py2, cx, cy) {
        const ABx = px2 - px1;
        const ABy = py2 - py1;
        const ACx = cx - px1;
        const ACy = cy - py1;
        const AB_AB = ABx * ABx + ABy * ABy;
        const AB_AC = ABx * ACx + ABy * ACy;
        const t = AB_AC / AB_AB;
        const t_clamped = Math.max(0, Math.min(1, t));

        return {
            x: px1 + ABx * t_clamped,
            y: py1 + ABy * t_clamped
        };
    }

    resolve(x, y, radius) {
        radius += 3;

        let closestDistance = Infinity,
            closestPoint = null;

        for (let i = 0; i < this.numPoints; i += 2) {
            const point = this.getClosestPointOnEdge(this.points[i], this.points[i + 1], this.points[(i + 2) % this.numPoints], this.points[(i + 3) % this.numPoints], x, y);

            const dx = point.x - x;
            const dy = point.y - y;
            const distance = dx * dx + dy * dy;

            if (distance < closestDistance) {
                closestDistance = distance;
                closestPoint = point;
            }
        }

        const dx = closestPoint.x - x;
        const dy = closestPoint.y - y;
        const angle = Math.atan2(dy, dx);

        x = closestPoint.x - Math.cos(angle) * radius;
        y = closestPoint.y - Math.sin(angle) * radius;

        let atan = Math.atan2(y - closestPoint.y, x - closestPoint.x);

        if (this.pointIsInside(x, y)) {
            atan += Math.PI;
        }

        return {
            x: closestPoint.x + Math.cos(atan) * radius,
            y: closestPoint.y + Math.sin(atan) * radius,
            angle: atan
        }
    }
}

export class Terrain {
    static idAccum = 1;

    constructor(position, size, flags) {
        this.id = Terrain.idAccum++;

        this.x = position.x;
        this.y = position.y;
        this.size = size;

        const data = getTerrain(flags);
        this.type = data.id;
        this.polygon = new Polygon(data.terrain, this.x, this.y, this.size, 0);

        this.gridX = 0;
        this.gridY = 0;

        state.terrain.set(this.id, this);
    }

    destroy() {
        state.terrain.delete(this.id);
        state.updateTerrain();
    }
}