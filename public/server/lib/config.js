import { tiers as _tiers, Drawing, WEARABLES, PetalTier, MobTier, PetalConfig, MobDrop, MobConfig } from "../../lib/protocol.js";
import { colors } from "../../lib/util.js";
export const tiers = structuredClone(_tiers);
export { Drawing, WEARABLES, PetalTier, MobTier, PetalConfig, MobDrop, MobConfig };

export const petalConfigs = [
    new PetalConfig("Basic", 22.5 * 1, 10, 10)
        .setDescription("A simple petal. Not too strong, not too weak."),
    new PetalConfig("Light", 22.5 * .25, 6.5, 17)
        .setMulti([1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 7, 7], 0, true)
        .setSize(.75)
        .setDescription("It's very light and recharges quickly, at the cost of damage."),
    new PetalConfig("Faster", 22.5 * .65, 12, 7)
        .setSize(.75)
        .setExtraRadians(.03)
        .setDescription("This one makes your petals spin faster."),
    new PetalConfig("Heavy", 22.5 * 2, 100, 2.5)
        .setSize(1.25)
        .setDensity(3)
        .setDescription("A more chunky petal that hits harder but takes longer to recharge."),
    new PetalConfig("Stinger", 22.5 * 4.5, 1, 75)
        .setMulti([1, 1, 2, 2, 3, 3, 4, 4, 5, 5], 1, true)
        .setDescription("A fragile petal that deals lots of damage."),
    new PetalConfig("Rice", 0, .5, 5)
        .setSize(1.25)
        .setDescription("A bit weak, but recharges instantly."),
    new PetalConfig("Rock", 22.5 * 2, 50, 5.5)
        .setSize(1.3)
        .setDescription("It's a rock, not much to say about it."),
    new PetalConfig("Cactus", 22.5 * 2, 18, 6)
        .setSize(1.25)
        .setExtraHealth(35)
        .setHuddles(1)
        .setDescription("A petal that gives you extra health. Pretty magical if you ask me."),
    new PetalConfig("Leaf", 22.5 * 1, 8, 6)
        .setSize(1.2)
        .setConstantHeal(5.5)
        .setDescription("A petal that heals you over time by the power of photosynthesis."),
    new PetalConfig("Wing", 22.5 * 1.25, 10, 10)
        .setSize(1.3)
        .setWingMovement(true)
        .setDescription("It comes and it goes."),
    new PetalConfig("Bone", 22.5 * 1.5, 10, 6)
        .setSize(1.6)
        .setArmor(6)
        .setDescription("A petal that reduces incoming damage."),
    new PetalConfig("Dirt", 22.5 * 1.5, 8, 8)
        .setSize(1.3)
        .setExtraHealth(55)
        .setSpeedMultiplier(.925)
        .setExtraSize(2.5)
        .setHuddles(1)
        .setDescription("The extra soil gives your flower more mass, but it does slow you down a bit..."),
    new PetalConfig("Magnolia", 22.5 * 1.5, 8, 8)
        .setConstantHeal(3)
        .setExtraHealth(20)
        .setSize(1.5)
        .setDescription("A purely magical petal that heals you over time while simultaneously making you tougher."),
    new PetalConfig("Corn", 22.5 * 5, 425, 2)
        .setSize(1.6)
        .setDescription("It's a piece of corn. They say ants like to snack on it."),
    new PetalConfig("Sand", 22.5 * .45, 5, 8)
        .setSize(.85)
        .setMulti(4, true)
        .setDescription("Some fine grains of sand. They recharge quickly and can pack a punch."),
    new PetalConfig("Orange", 22.5 * .75, 12.5, 7.5)
        .setMulti(3, true)
        .setDescription("A bunch of oranges. They're pretty juicy."),
    new PetalConfig("Missile", 22.5 * 1, 4, 18.5)
        .setLaunchable(.7, 45)
        .setSize(1.35)
        .setDescription("You can actually shoot this one!"),
    new PetalConfig("Pea.projectile", 22.5 * 100, 3, 3)
        .setDescription("[object null object]"),
    new PetalConfig("Rose", 22.5 * 1.5, 5, 5)
        .setHealing(12.5)
        .setHuddles(1)
        .setDescription("Not great at combat, but it's healing properties are amazing."),
    new PetalConfig("Yin Yang", 22.5 * 1, 9, 11)
        .setYinYang(1)
        .setDescription("The mysterious petal of balance."),
    new PetalConfig("Pollen", 22.5 * .75, 13, 13)
        .setSize(.6)
        .setLaunchable(0, 75)
        .setMulti([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5], false, true)
        .setDescription("It makes you sneeze. Don't drop it!"),
    new PetalConfig("Honey", 22.5 * .5, 7.5, 7.5)
        .setSize(1.1)
        .setEnemySpeedMultiplier(.45, 5)
        .setDescription("It's sticky and will slow your enemies down."),
    new PetalConfig("Iris", 22.5 * 1, 10, 5)
        .setSize(.8)
        .setPoison(12.5, 5)
        .setDescription("Packs an unexpected punch in its secret weapon: poison."),
    new PetalConfig("Web", 22.5 * 2, 7, 7)
        .setDescription("Sticky!"),
    new PetalConfig("Web.projectile", 22.5 * 100, 1E5, 0)
        .setSize(30)
        .setEnemySpeedMultiplier(.334, .05)
        .setIgnoreWalls(1)
        .setDescription("[object null object]"),
    new PetalConfig("Third Eye", 0, 0, 0)
        .setExtraRange(.5)
        .setMulti(0, false)
        .setWearable(WEARABLES.THIRD_EYE)
        .setDescription("Through the eye of the beholder comes extra range."),
    new PetalConfig("Pincer", 22.5 * 1, 7.5, 7.5)
        .setSize(1.2)
        .setPoison(2, 5)
        .setEnemySpeedMultiplier(.6, 5)
        .setDescription("Poisonous, and it slows down your enemies. A perfect double whammy."),
    new PetalConfig("Beetle Egg", 22.5 * 2, 25, 1)
        .setSize(1.5)
        .setHuddles(1)
        .setDescription("Something might pop out of this!"),
    new PetalConfig("Antennae", 0, 0, 0)
        .setExtraVision(150)
        .setMulti(0, false)
        .setWearable(WEARABLES.ANTENNAE)
        .setDescription("These feelers give you some extra vision."),
    new PetalConfig("Peas", 22.5 * 1.5, 20, 17.5)
        .setSize(1.15)
        .setDescription("A pod of peas. They'll explode if you're not careful."),
    new PetalConfig("Stick", 22.5 * 1, 25, 1)
        .setSize(1.25)
        .setHuddles(1)
        .setMulti(2, false)
        .setDescription("A bundle of sticks... I wonder what'll happen if you spin them around in the desert..."),
    new PetalConfig("Scorpion Missile.projectile", 22.5 * 100, 5, 2.5)
        .setPoison(2.5, 5)
        .setDescription("[object null object]"),
    new PetalConfig("Dahlia", 22.5 * .75, 5, 5)
        .setHealing(3)
        .setSize(.5)
        .setHuddles(1)
        .setMulti(3, true)
        .setDescription("A very consistent trickle heal."),
    new PetalConfig("Primrose", 22.5 * 1, 12.5, 7.5)
        .setSize(1.3)
        .setHuddles(1)
        .setHealSpit(22.5 * 3, 125, 10)
        .setDescription("Said to be from a mystical covenant of witches who specialized in healing nature."),
    new PetalConfig("Fire Spellbook", 22.5 * 1.25, 15, 5)
        .setSize(1.2)
        .setPentagramAbility(22.5 * 4, 150, 10, {
            damage: 5,
            duration: 5
        }, {
            multiplier: .5,
            duration: 5
        })
        .setHuddles(1)
        .setDescription("A tome of ancient spells. It's said to be able to focus the power of a fallen Demon."),
    new PetalConfig("Deity", 0, 50, 50)
        .setSize(1.15)
        .setMulti(3, true)
        .setHealSpit(10, 1000, 5)
        .setConstantHeal(1000)
        .setExtraHealth(10000)
        .setEnemySpeedMultiplier(.1, 10)
        .setDamageReduction(.2)
        .setExtraRadians(.01)
        .setExtraRange(1.05)
        .setExtraVision(5)
        .setPoison(5, 10)
        .setSpeedMultiplier(1.05)
        .setWingMovement(1)
        .setLightning([5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10], 32 * 16, 128)
        .setDescription("A petal that channels the power of all that came before."),
    new PetalConfig("Lightning", 22.5 * 1, 1e-15, 5)
        .setLightning([3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 9], 32 * 8, 7)
        .setDescription("Shockingly shocking!"),
    new PetalConfig("Powder", 22.5 * .75, 3, 5)
        .setSize(1.65)
        .setSpeedMultiplier(1.03)
        .setHuddles(1)
        .setDescription("This special cocaine will make you go fast!"),
    new PetalConfig("Ant Egg", 22.5 * 2.5, 25, 1)
        .setSize(1.1)
        .setMulti(4, false)
        .setHuddles(1)
        .setDescription("A petal that spawns ants. They'll help you out!"),
    new PetalConfig("Yucca", 22.5 * 1.5, 8, 6)
        .setSize(1.2)
        .setConstantHeal(7.5, true)
        .setDescription("A strange leaf that heals you but only when you're in defensive mode."),
    new PetalConfig("Magnet", 22.5 * 2, 9, 6)
        .setSize(1.55)
        .setExtraPickupRange(125)
        .setAttractsLightning(1)
        .setHuddles(1)
        .setDescription("This petal's magnetic field will attract nearby items. Does not stack."),
    new PetalConfig("Amulet", 0, 0, 0)
        .setMulti(0, false)
        .setWearable(WEARABLES.AMULET)
        .setDamageReflection(.175, .275)
        .setDescription("What an oddity! It's said to reflect a portion of incoming conventional damage. Does not stack."),
    new PetalConfig("Jelly", 23, 9, 7)
        .setDensity(20)
        .setDescription("Super bouncy! Knocks all your enemies around. Very fun to use and cause problems with."),
    new PetalConfig("Yggdrasil", 22.5 * 45, Infinity, 0)
        .setDeathDefying(.15, 2.5)
        .setHuddles(1)
        .setPhases(1)
        .setDescription("The tree of life. If you were to die with this petal alive, you'd be revived with a portion of your health."),
    new PetalConfig("Glass", 22.5 * 2, 1e-15, 2.5)
        .setPhases(1)
        .setDescription("A shard of glass that phases through enemies."),
    new PetalConfig("Dandelion", 22.5 * 1, 10, 8)
        .setMulti(2, false)
        .setSize(1.4)
        .setLaunchable(.575, 35)
        .setEnemySpeedMultiplier(.65, 6)
        .setDescription("A paralyzing force."),
    new PetalConfig("Sponge", 22.5 * 1.5, 24, 0)
        .setSize(4 / 3)
        .setHuddles(1)
        .setAbsorbsDamage(35, [
            3 * 22.5, 3 * 22.5, 3 * 22.5,
            4 * 22.5, 4 * 22.5, 4 * 22.5,
            5 * 22.5, 5 * 22.5, 5 * 22.5,
            6 * 22.5, 7 * 22.5, 8 * 22.5
        ])
        .setDescription("It absorbs conventional damage done to your flower. If incoming damage is too great, you will suffer all of the damage the sponge has contained at once."),
    new PetalConfig("Pearl", 22.5 * 2, 23, 6.5)
        .setSize(2)
        .setPlaceDown(1)
        .setDescription("A pearl that can be placed on the ground. You can call it back to you at any time."),
    new PetalConfig("Shell", 22.5 * 1.5, 13, 6)
        .setSize(1.5)
        .setShield(12.5)
        .setHuddles(1)
        .setDescription("A shell that provides extra protection through a shield."),
    new PetalConfig("Bubble", 22.5 * .5, 1e-15, 1e-15)
        .setSize(1.3)
        .setBoost(
            [5, 7, 11, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(e => e * 2 | 0),
            [1, .9, .8, .7, .6, .5, .5, .4, .3, .2, .1, .1].map(e => e * 22.5 | 0)
        )
        .setDescription("It will boost you when you pop it."),
    new PetalConfig("Air", 0, 0, 0)
        .setMulti(0, false)
        .setWearable(WEARABLES.AIR)
        .setExtraSize(3)
        .setDescription("Literally nothing at all, but it puffs you up."),
    new PetalConfig("Starfish", 22.5 * 1.5, 9, 11)
        .setSize(1.4)
        .setConstantHeal(9, false, .7)
        .setDescription("A leg of a starfish. It will heal you quite effectively while you are under 70% health."),
    new PetalConfig("Fang", 22.5 * 1.25, 8, 10)
        .setSize(1.15)
        .setHealBack([.2, .25, .3, .35, .4, .45, .5, .55, .6, .65, .7, .75])
        .setDescription("The fang of a dangerous Leech. It will heal back the damage it causes."),
    new PetalConfig("Goo", 22.5 * 1.75, 10, 10)
        .setSize(1.3)
        .setPoison(2, 5)
        .setEnemySpeedMultiplier(.7, 5)
        .setLaunchable(1, 35)
        .setDescription("This sticky goo isn't good for you..."),
    new PetalConfig("Maggot Poo", 22.5 * 1, 5, 5.5)
        .setSize(1.3)
        .setDamageReflection(.05)
        .setLaunchable(0, 75)
        .setDescription("A steaming pile of shi- I mean, poo."),
    new PetalConfig("Lightbulb", 22.5 * 1, 10, 10)
        .setSize(1.4)
        .setAttractsAggro(1)
        .setHuddles(1)
        .setLighting(1)
        .setDescription("Mobs will prioritize your shiny bulb when in use. The priority increases with each rarity, and stacks with itself."),
    new PetalConfig("Battery", 22.5 * 2.25, 1e-15, 0)
        .setPhases(1)
        .setSize(1.34)
        .setLightning(4, 32 * 8, 5, [2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7], true)
        .setDescription("A battery that can release electric charges when its parent is hit."),
    new PetalConfig("Dust", 22.5 * .75, 6, 7.5)
        .setMulti(3, true)
        .setLaunchable(.7, 55)
        .setDensity(1.5)
        .setDescription("A cloud of dust that can be launched at enemies."),
    new PetalConfig("Armor", 0, 0, 0)
        .setMulti(0, false)
        .setWearable(WEARABLES.ARMOR)
        .setExtraHealth(-10)
        .setDamageReduction(.25)
        .setDescription("This petal greatly protects you, but at a cost..."),
    new PetalConfig("Wasp Missile.projectile", 22.5 * 100, 4, 4)
        .setPoison(2, 8)
        .setDescription("[object null object]"),
    new PetalConfig("Shrub", 22.5 * 1.5, 15, 6)
        .setSize(1.2)
        .setExtraHealth(15)
        .setPoison(3, 2)
        .setDescription("Extra HP with a bonus: poison!"),
    new PetalConfig("projectile.grape", 22.5 * 100, 1, 4)
        .setPoison(.75, 6)
        .setDescription("[object null object]"),
    new PetalConfig("Grapes", 22.5 * 1.5, 15, 10)
        .setSize(1.15)
        .setPoison(7.5, 5)
        .setDescription("With an added bonus: Poison!"),
    new PetalConfig("Lantern", 22.5 * 2, 5, 5)
        .setHuddles(1)
        .setDescription("This fragile lantern shines so bright...")
        .setLighting(3),
    new PetalConfig("web.player.launched", 22.5 * 100, 1e5, 0)
        .setSize(30)
        .setEnemySpeedMultiplier(.334, .05)
        .setIgnoreWalls(1)
        .setDescription("[object null object]"),
    new PetalConfig("Branch", 22.5 * 3, 10, 10)
        .setSize(1.5)
        .setHuddles(1)
        .setMulti(2, false)
        .setDescription("A fragile branch from the Wilt."),
    new PetalConfig("Leech Egg", 22.5 * 2, 25, 1)
        .setSize(1.5)
        .setHuddles(1)
        .setDescription("Summons leeches to help protect you!"),
    new PetalConfig("Hornet Egg", 22.5 * 2, 25, 1)
        .setSize(1.5)
        .setMulti(2, false)
        .setHuddles(1)
        .setDescription("Hey wait a minute... This isn't a Beetle Egg!"),
    new PetalConfig("Candy", 22.5 * 1, 5, 5)
        .setSize(.9)
        .setMulti(5, true)
        .setDescription("Ooh, tasty!"),
    new PetalConfig("Claw", 22.5 * 2, .25, 8)
        .setExtraDamage(.75, 1, 7.5)
        .setDescription("Sharp against the strong, weak against the weak."),
    new PetalConfig("Bullet.projectile", 1000, 12, 2)
        .setDescription("[object null object]"),
    new PetalConfig("Square Egg", 22.5 * 2, 50, 1)
        .setSize(1.2)
        .setHuddles(1)
        .setDescription("This isn't from this world..."),
    new PetalConfig("Triangle Egg", 22.5 * 3, 100, 2)
        .setSize(1.5)
        .setHuddles(1)
        .setDescription("This isn't from this world..."),
    new PetalConfig("Pentagon Egg", 22.5 * 4, 200, 4)
        .setSize(1.8)
        .setHuddles(1)
        .setDescription("This isn't from this world...")
];

export const petalIDOf = name => petalConfigs.findIndex(p => p.name === name);

// After references are set
petalConfigs[petalIDOf("Web")].setShootOut(petalIDOf("web.player.launched"));
petalConfigs[petalIDOf("Peas")].setSplits(petalIDOf("Pea.projectile"), 4);
petalConfigs[petalIDOf("Grapes")].setSplits(petalIDOf("projectile.grape"), 4);

export const mobConfigs = [
    new MobConfig("Ladybug", 25, 10, 25, 2.5)
        .addDrop(petalIDOf("Light"))
        .addDrop(petalIDOf("Rose"), .6),
    new MobConfig("Rock", 75, 5, 27.5, 0)
        .addDrop(petalIDOf("Rock"))
        .addDrop(petalIDOf("Heavy"), .5, 2),
    new MobConfig("Bee", 15, 25, 25, 4)
        .setMoveInSines(1)
        .setNeutral(1)
        .addDrop(petalIDOf("Stinger"), .7)
        .addDrop(petalIDOf("Pollen"))
        .addDrop(petalIDOf("Honey"), .4),
    new MobConfig("Spider", 20, 10, 20, 4)
        .setAggressive(1)
        .setPoison(5, 3)
        .setProjectile({
            petalIndex: petalIDOf("Web") + 1,
            cooldown: 22.5,
            health: Infinity,
            damage: 0,
            speed: 0,
            range: 175,
            size: 1,
            runs: true,
            nullCollision: true
        })
        .addDrop(petalIDOf("Faster"))
        .addDrop(petalIDOf("Web"), .5)
        .addDrop(petalIDOf("Third Eye"), .025, 5),
    new MobConfig("Beetle", 30, 10, 30, 3)
        .setAggressive(1)
        .addDrop(petalIDOf("Iris"))
        .addDrop(petalIDOf("Pincer"), .8)
        .addDrop(petalIDOf("Beetle Egg"), .225),
    new MobConfig("Leafbug", 35, 3.5, 30, 2.5)
        .setNeutral(1)
        .setDamageReduction(.13)
        .addDrop(petalIDOf("Leaf"))
        .addDrop(petalIDOf("Bone"), .5)
        .addDrop(petalIDOf("Cactus"), .25),
    new MobConfig("Roach", 30, 5, 30, 5.5)
        .setNeutral(1)
        .addDrop(petalIDOf("Antennae"), 1, 2)
        .addDrop(petalIDOf("Magnolia"), .6)
        .addDrop(petalIDOf("Bone"), .6),
    new MobConfig("Hornet", 35, 15, 30, 3)
        .setAggressive(1)
        .setProjectile({
            petalIndex: petalIDOf("Missile"),
            cooldown: 22.5 * 2,
            health: 4,
            damage: 5,
            speed: 3.75,
            range: 55
        })
        .addDrop(petalIDOf("Missile"))
        .addDrop(petalIDOf("Antennae"), 1, 2)
        .addDrop(petalIDOf("Orange")),
    new MobConfig("Mantis", 35, 10, 32.5, 2)
        .setAggressive(1)
        .setProjectile({
            petalIndex: petalIDOf("Pea.projectile"),
            cooldown: 22.5 * 6.25,
            health: 1.25,
            damage: 1.5,
            speed: 4.5,
            range: 55,
            size: .2,
            multiShot: {
                count: 3,
                delay: 256
            }
        })
        .addDrop(petalIDOf("Peas"))
        .addDrop(petalIDOf("Antennae"), .5, 2),
    new MobConfig("Pupa", 40, 10, 30, 1)
        .setAggressive(1)
        .setProjectile({
            petalIndex: petalIDOf("Rock"),
            cooldown: 22.5 * 3.5,
            health: .8,
            damage: 1.1,
            speed: 4,
            range: 45,
            size: .3,
            multiShot: {
                count: 5,
                delay: 10,
                spread: .2
            }
        })
        .addDrop(petalIDOf("Rock"))
        .addDrop(petalIDOf("Wing"))
        .addDrop(petalIDOf("Heavy"), .5, 2),
    new MobConfig("Sandstorm", 45, 15, 35, 3)
        .setSandstormMovement(1)
        .setSize(35, MobTier.SIZE_SCALE, .9, .25)
        .addDrop(petalIDOf("Sand"))
        .addDrop(petalIDOf("Glass"), .7)
        .addDrop(petalIDOf("Stick"), .2, 2),
    new MobConfig("Scorpion", 45, 7.5, 32.5, 3)
        .setAggressive(1)
        .setStrafes(30, 15, 1.25)
        .setProjectile({
            petalIndex: petalIDOf("Scorpion Missile.projectile"),
            cooldown: 22.5 * 2,
            health: 2,
            damage: 2,
            speed: 5,
            range: 65,
            size: .2
        })
        .addDrop(petalIDOf("Pincer"))
        .addDrop(petalIDOf("Iris")),
    new MobConfig("Demon", 100, 7.5, 35, 1)
        .setAggressive(1)
        .setPushability(0.8)
        .setProjectile({
            petalIndex: petalIDOf("Missile"),
            cooldown: 22.5 * 5,
            health: 1,
            damage: 1,
            speed: 5,
            range: 120,
            size: .1334,
            multiShot: {
                count: 4,
                delay: 128,
                spread: .5
            }
        })
        .addDrop(petalIDOf("Bone"))
        .addDrop(petalIDOf("Lightning"), .2)
        .addDrop(petalIDOf("Fire Spellbook"), .03),
    new MobConfig("Jellyfish", 40, 15, 30, 2.5)
        .setAggressive(1)
        .setLightning([75, 75, 75, 65, 65, 65, 55, 55, 55, 45, 35, 25], [2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 8], 125, 2)
        .addDrop(petalIDOf("Lightning"))
        .addDrop(petalIDOf("Jelly")),
    new MobConfig("Cactus", 50, 20, 30, 0)
        .setPushability(0.5)
        .addDrop(petalIDOf("Cactus"))
        .addDrop(petalIDOf("Stinger"), .8),
    new MobConfig("Baby Ant", 10, 5, 15, 2)
        .addDrop(petalIDOf("Light"), .5)
        .addDrop(petalIDOf("Faster"), .5)
        .addDrop(petalIDOf("Rice"), .5),
    new MobConfig("Worker Ant", 15, 5, 15, 3.25)
        .setNeutral(1)
        .addDrop(petalIDOf("Light"), .5)
        .addDrop(petalIDOf("Leaf"), .5)
        .addDrop(petalIDOf("Corn"), .5),
    new MobConfig("Soldier Ant", 25, 5, 15, 3.5)
        .setAggressive(1)
        .addDrop(petalIDOf("Faster"), .5)
        .addDrop(petalIDOf("Wing"), .5),
    new MobConfig("Queen Ant", 100, 5, 25, 3.5)
        .setAggressive(1)
        .setPushability(0.8)
        .addDrop(petalIDOf("Dahlia"))
        .addDrop(petalIDOf("Dirt"), .5)
        .addDrop(petalIDOf("Ant Egg"), .8),
    new MobConfig("Ant Hole", 100, 1, 25, 0)
        .setPushability(0)
        .addDrop(petalIDOf("Dirt"))
        .addDrop(petalIDOf("Ant Egg"), .5),
    new MobConfig("Baby Fire Ant", 10, 10, 15, 2)
        .addDrop(petalIDOf("Light"), .5)
        .addDrop(petalIDOf("Yucca"), .5),
    new MobConfig("Worker Fire Ant", 15, 10, 15, 3.25)
        .setNeutral(1)
        .addDrop(petalIDOf("Light"), .5)
        .addDrop(petalIDOf("Yucca"), .5),
    new MobConfig("Soldier Fire Ant", 25, 10, 15, 3.5)
        .setAggressive(1)
        .addDrop(petalIDOf("Faster"), .5)
        .addDrop(petalIDOf("Glass"), .5),
    new MobConfig("Queen Fire Ant", 100, 10, 25, 3.5)
        .setAggressive(1)
        .setPushability(0.8)
        .addDrop(petalIDOf("Primrose"), .5)
        .addDrop(petalIDOf("Dirt"), .5)
        .addDrop(petalIDOf("Ant Egg"), .8),
    new MobConfig("Fire Ant Hole", 100, 2, 25, 0)
        .setPushability(0)
        .addDrop(petalIDOf("Dirt"))
        .addDrop(petalIDOf("Ant Egg"), .5)
        .addDrop(petalIDOf("Magnet"), .5, 2),
    new MobConfig("Baby Termite", 15, 5, 15, 2)
        .setDamageReduction(.1)
        .setDamageReflection(.05, .5)
        .addDrop(petalIDOf("Bone"), .5)
        .addDrop(petalIDOf("Amulet"), .15),
    new MobConfig("Worker Termite", 20, 5, 15, 3.25)
        .setNeutral(1)
        .setDamageReduction(.1)
        .setDamageReflection(.05, .5)
        .addDrop(petalIDOf("Bone"), .5)
        .addDrop(petalIDOf("Amulet"), .15),
    new MobConfig("Soldier Termite", 30, 5, 15, 3.5)
        .setAggressive(1)
        .setDamageReduction(.1)
        .setDamageReflection(.05, .5)
        .addDrop(petalIDOf("Bone"), .5)
        .addDrop(petalIDOf("Amulet"), .15),
    new MobConfig("Termite Overmind", 150, 2, 30, .5)
        .setAggressive(1)
        .setPushability(0.5)
        .setDamageReduction(.1)
        .setDamageReflection(.05, .5)
        .addDrop(petalIDOf("Ant Egg"), .5)
        .addDrop(petalIDOf("Amulet"), .4),
    new MobConfig("Termite Mound", 150, 1, 30, 0)
        .setDamageReduction(.1)
        .setPushability(0)
        .addDrop(petalIDOf("Dirt"))
        .addDrop(petalIDOf("Armor"), .75)
        .addDrop(petalIDOf("Magnet"), .5),
    new MobConfig("Ant Egg", 20, 1, 15, 0)
        .addDrop(petalIDOf("Ant Egg")),
    new MobConfig("Queen Ant Egg", 20, 1, 15, 0),
    new MobConfig("Fire Ant Egg", 20, 2, 15, 0)
        .addDrop(petalIDOf("Ant Egg")),
    new MobConfig("Queen Fire Ant Egg", 20, 2, 15, 0),
    new MobConfig("Termite Egg", 30, 1, 15, 0)
        .addDrop(petalIDOf("Ant Egg")),
    new MobConfig("Evil Ladybug", 25, 15, 25, 2.5)
        .setAggressive(1)
        .setDamageReduction(.125)
        .addDrop(petalIDOf("Dahlia"))
        .addDrop(petalIDOf("Yin Yang"), .15),
    new MobConfig("Shiny Ladybug", 25, 10, 25, 2.5)
        .setNeutral(1)
        .addDrop(petalIDOf("Primrose"))
        .addDrop(petalIDOf("Yggdrasil"), .15, 3),
    new MobConfig("Angelic Ladybug", 55, 15, 25, 2.5)
        .setNeutral(1)
        .setDamageReflection(.05, .5)
        .addDrop(petalIDOf("Dahlia"))
        .addDrop(petalIDOf("Yin Yang"), .15)
        .addDrop(petalIDOf("Third Eye"), .05, 3),
    new MobConfig("Centipede", 25, 10, 22.5, 3.5)
        .setNeutral(1)
        .setCentipedeMovement(1)
        .addDrop(petalIDOf("Peas"), .5)
        .addDrop(petalIDOf("Leaf"), .5),
    new MobConfig("Centipede", 25, 10, 22.5, 3.5)
        .setSystem(1)
        .setNeutral(1)
        .setCentipedeMovement(1)
        .addDrop(petalIDOf("Peas"), .5)
        .addDrop(petalIDOf("Leaf"), .5),
    new MobConfig("Desert Centipede", 20, 10, 22.5, 5)
        .setDesertCentipedeMovement(1)
        .addDrop(petalIDOf("Powder"), .5)
        .addDrop(petalIDOf("Sand"), .5),
    new MobConfig("Desert Centipede", 20, 10, 22.5, 5)
        .setSystem(1)
        .setDesertCentipedeMovement(1)
        .addDrop(petalIDOf("Powder"), .5)
        .addDrop(petalIDOf("Sand"), .5),
    new MobConfig("Evil Centipede", 25, 10, 22.5, 3.5)
        .setAggressive(1)
        .setCentipedeMovement(1)
        .addDrop(petalIDOf("Iris"), .5)
        .addDrop(petalIDOf("Grapes"), .5),
    new MobConfig("Evil Centipede", 25, 10, 22.5, 3.5)
        .setSystem(1)
        .setAggressive(1)
        .setCentipedeMovement(1)
        .addDrop(petalIDOf("Iris"), .5)
        .addDrop(petalIDOf("Grapes"), .5),
    new MobConfig("Dandelion", 25, 10, 22.5, 0)
        .setPushability(0.5)
        .addDrop(petalIDOf("Dandelion"))
        .addDrop(petalIDOf("Pollen"), .5),
    new MobConfig("Sponge", 35, 3, 30, 0)
        .addDrop(petalIDOf("Sponge")),
    new MobConfig("Bubble", 1, 1, 30, 0)
        .addDrop(petalIDOf("Bubble"), .8)
        .addDrop(petalIDOf("Air"), .8),
    new MobConfig("Shell", 40, 10, 32.5, 25)
        .setMovesInBursts(1)
        .setNeutral(1)
        .addDrop(petalIDOf("Shell"), .8)
        .addDrop(petalIDOf("Pearl"), .5)
        .addDrop(petalIDOf("Magnet"), .2),
    new MobConfig("Starfish", 30, 10, 30, 4)
        .setAggressive(1)
        .setSpins(1)
        .setHealing(.007)
        .setFleeAtLowHealth(.35)
        .addDrop(petalIDOf("Starfish"), .85)
        .addDrop(petalIDOf("Sand"), .85),
    new MobConfig("Leech", 25, 3.5, 16, 5.5)
        .setAggressive(1)
        .addDrop(petalIDOf("Fang"))
        .addDrop(petalIDOf("Faster")),
    new MobConfig("Maggot", 30, 10, 35, 2)
        .setAggressive(1)
        .setProjectile({
            petalIndex: petalIDOf("Goo"),
            cooldown: 22.5 * 2.75,
            health: 2,
            damage: 1,
            speed: 3,
            range: 45,
            size: .35
        })
        .addDrop(petalIDOf("Goo"))
        .addDrop(petalIDOf("Maggot Poo"), .5)
        .addDrop(petalIDOf("Dirt"), .65),
    new MobConfig("Firefly", 30, 10, 25, 4)
        .setMoveInSines(1)
        .addDrop(petalIDOf("Wing"))
        .addDrop(petalIDOf("Lightbulb"), .6)
        .addDrop(petalIDOf("Battery"), .4),
    new MobConfig("Bumblebee", 25, 15, 30, 5)
        .setMoveInSines(1)
        .setBumblebeeMovement(1)
        .setProjectile({
            petalIndex: petalIDOf("Pollen"),
            cooldown: 22.5 * .5,
            health: 1,
            damage: 1,
            speed: 0,
            range: 90
        })
        .addDrop(petalIDOf("Pollen"))
        .addDrop(petalIDOf("Honey")),
    new MobConfig("Moth", 25, 10, 25, 3)
        .setMoveInSines(1)
        .setNeutral(1)
        .setFleeAtLowHealth(1)
        .addDrop(petalIDOf("Wing"))
        .addDrop(petalIDOf("Lightbulb"), .6)
        .addDrop(petalIDOf("Dust"), .4),
    new MobConfig("Fly", 15, 2.5, 20, 6)
        .setAggressive(1)
        .setMoveInSines(1)
        .addDrop(petalIDOf("Wing"))
        .addDrop(petalIDOf("Faster"), .8)
        .addDrop(petalIDOf("Third Eye"), .02, 5),
    new MobConfig("Square", 50, 3.5, 30, 0)
        .addDrop(petalIDOf("Square Egg")),
    new MobConfig("Triangle", 100, 5.5, 32.5, 0)
        .addDrop(petalIDOf("Triangle Egg")),
    new MobConfig("Pentagon", 150, 7.5, 35, 0)
        .addDrop(petalIDOf("Pentagon Egg")),
    new MobConfig("Hell Beetle", 35, 15, 35, 4)
        .setAggressive(1)
        .setPushability(0.8)
        .addDrop(petalIDOf("Dust"), .8)
        .addDrop(petalIDOf("Pincer"), .8)
        .addDrop(petalIDOf("Beetle Egg"), .8),
    new MobConfig("Hell Spider", 25, 15, 20, 4)
        .setAggressive(1)
        .setPoison(5, 3)
        .setPushability(0.8)
        .addDrop(petalIDOf("Faster"))
        .addDrop(petalIDOf("Web"), .5)
        .addDrop(petalIDOf("Dahlia"), .5)
        .setProjectile({
            petalIndex: petalIDOf("Web") + 1,
            cooldown: 22.5,
            health: Infinity,
            damage: 0,
            speed: 0,
            range: 175,
            size: 1,
            runs: true,
            nullCollision: true
        }),
    new MobConfig("Hell Yellowjacket", 65, 5, 25, 4)
        .setAggressive(1)
        .setProjectile({
            petalIndex: petalIDOf("Missile"),
            cooldown: 22.5 * 4,
            health: 4,
            damage: 4,
            speed: 4.5,
            range: 65,
            aimbot: true
        })
        .setPushability(0.8)
        .addDrop(petalIDOf("Missile"))
        .addDrop(petalIDOf("Antennae"), 1, 2),
    new MobConfig("Termite Overmind Egg", 20, 1, 15, 0),
    new MobConfig("Spirit", 1e-15, 0, 35, 1)
        .setSpins(4, 1)
        .addDrop(petalIDOf("Candy"), .1),
    new MobConfig("Wasp", 40, 15, 35, 3)
        .setAggressive(1)
        .setProjectile({
            petalIndex: petalIDOf("Wasp Missile.projectile"),
            cooldown: 22.5 * 5,
            health: 13,
            damage: 1.25,
            speed: 2.5,
            range: 185,
            multiShot: {
                count: 3,
                delay: 256,
                spread: .2
            }
        })
        .addDrop(petalIDOf("Missile"))
        .setPushability(.8)
        .addDrop(petalIDOf("Antennae"), 1, 2)
        .addDrop(petalIDOf("Pollen"), .4),
    new MobConfig("Stickbug", 15, 4, 10, 6.5)
        .setAggressive(1)
        .setPoison(2, 4)
        .addDrop(petalIDOf("Iris"), .75)
        .addDrop(petalIDOf("Powder")),
    new MobConfig("Shrub", 25, 10, 30, 0)
        .setPoison(3, 5)
        .setPushability(0.5)
        .addDrop(petalIDOf("Iris"), .75)
        .addDrop(petalIDOf("Shrub"), .6)
        .addDrop(petalIDOf("Leaf")),
    new MobConfig("Hell Centipede", 25, 10, 22.5, 4)
        .setAggressive(1)
        .setSize(22.5, MobTier.SIZE_SCALE, .75, .25)
        .addDrop(petalIDOf("Powder"), .5)
        .addDrop(petalIDOf("Dust"), .5),
    new MobConfig("Hell Centipede", 25, 10, 22.5, 4)
        .setSystem(1)
        .setAggressive(1)
        .setSize(22.5, MobTier.SIZE_SCALE, .75, .25)
        .addDrop(petalIDOf("Powder"), .5)
        .addDrop(petalIDOf("Dust"), .5),
    new MobConfig("Wilt", 25, 10, 30, 0)
        .setPushability(0)
        .addDrop(petalIDOf("Branch"))
        .addDrop(petalIDOf("Leaf"), .6),
    new MobConfig("Wilt", 25, 10, 15, 2.75)
        .setSystem(1)
        .setAggressive(1)
        .addDrop(petalIDOf("Branch"))
        .addDrop(petalIDOf("Leaf"), .6),
    new MobConfig("Pumpkin", 40, 10, 20, 0)
        .setSize(20, MobTier.SIZE_SCALE, .75, .25)
        .addDrop(petalIDOf("Leaf"), .5)
        .addDrop(petalIDOf("Candy"), .6)
        .addDrop(petalIDOf("Lantern"), .1),
    new MobConfig("Jack O' Lantern", 40, 10, 20, 0)
        .setAggressive(1)
        .setProjectile({
            petalIndex: petalIDOf("Candy"),
            cooldown: 22.5 * .175,
            health: 1,
            damage: 1,
            speed: 5,
            range: 20,
            size: .4
        })
        .addDrop(petalIDOf("Rock"), .8)
        .addDrop(petalIDOf("Candy"), .6)
        .addDrop(petalIDOf("Lantern"), .1),
    new MobConfig("Crab", 30, 10, 30, 7)
        .setAggressive(1)
        .setStrafes(125, 25, .5)
        .addDrop(petalIDOf("Sand"), .4)
        .addDrop(petalIDOf("Claw"), .8),
    new MobConfig("Tank", 50, 3, 20, 2)
        .setAggressive(1)
        .setProjectile({
            petalIndex: petalIDOf("Bullet.projectile"),
            cooldown: 22.5 * .75,
            health: 7.5,
            damage: 2.5,
            speed: 2.5,
            range: 22.5 * 1.5,
            size: .3,
            aimbot: true
        })
        .addDrop(petalIDOf("Square Egg"), .1)
        .addDrop(petalIDOf("Triangle Egg"), .05)
        .addDrop(petalIDOf("Pentagon Egg"), .01)
];

// Flu: Wing, Faster, Third Eye

export const mobIDOf = name => mobConfigs.findIndex(m => m.name === name);

// Give bumblebee 1/2 weight, give shrub 3/2 weight to feed bumblebees
export const GRID_GARDEN_MOBS = [
    mobIDOf("Shrub"),
    mobIDOf("Shrub"),
    mobIDOf("Shrub"),
    mobIDOf("Leafbug"),
    mobIDOf("Leafbug"),
    mobIDOf("Evil Ladybug"),
    mobIDOf("Evil Ladybug"),
    mobIDOf("Bumblebee"),
];

export const GRID_OCEAN_MOBS = [
    mobIDOf("Jellyfish"),
    mobIDOf("Leech"),
    mobIDOf("Sponge"),
];

// Give scorpion 1/2 weight
export const GRID_DESERT_MOBS = [
    mobIDOf("Scorpion"),
    mobIDOf("Soldier Fire Ant"),
    mobIDOf("Soldier Fire Ant"),
    mobIDOf("Baby Fire Ant"),
    mobIDOf("Baby Fire Ant"),
];

petalConfigs[petalIDOf("Beetle Egg")].setSpawnable(mobIDOf("Beetle"), [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4);
petalConfigs[petalIDOf("Stick")].setSpawnable(mobIDOf("Sandstorm"), [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4);
petalConfigs[petalIDOf("Ant Egg")].setSpawnable(mobIDOf("Soldier Ant"), [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4);
petalConfigs[petalIDOf("Branch")].setSpawnable(mobIDOf("Wilt") + 1, [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5);
petalConfigs[petalIDOf("Leech Egg")].setSpawnable(mobIDOf("Leech"), [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3);
petalConfigs[petalIDOf("Hornet Egg")].setSpawnable(mobIDOf("Hornet"), [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5);
petalConfigs[petalIDOf("Square Egg")].setSpawnable(mobIDOf("Square"), [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2);
petalConfigs[petalIDOf("Triangle Egg")].setSpawnable(mobIDOf("Triangle"), [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2);
petalConfigs[petalIDOf("Pentagon Egg")].setSpawnable(mobIDOf("Pentagon"), [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2);

mobConfigs[mobIDOf("Angelic Ladybug")].setPoopable({
    index: mobIDOf("Evil Ladybug"),
    interval: 22.5 * 6
});

mobConfigs[mobIDOf("Ant Hole")].setAntHoleSpawns([{
    index: mobIDOf("Baby Ant"),
    count: [4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7]
}, {
    index: mobIDOf("Worker Ant"),
    count: [5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8]
}, {
    index: mobIDOf("Soldier Ant"),
    count: [6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9]
}, {
    index: mobIDOf("Ant Egg"),
    count: 5
}, {
    index: mobIDOf("Queen Ant"),
    count: 1,
    minHealthRatio: .01
}]);

mobConfigs[mobIDOf("Fire Ant Hole")].setAntHoleSpawns([{
    index: mobIDOf("Baby Fire Ant"),
    count: [4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7]
}, {
    index: mobIDOf("Worker Fire Ant"),
    count: [5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8]
}, {
    index: mobIDOf("Soldier Fire Ant"),
    count: [6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 9]
}, {
    index: mobIDOf("Fire Ant Egg"),
    count: 5
}, {
    index: mobIDOf("Queen Fire Ant"),
    count: 1,
    minHealthRatio: .01
}]);

mobConfigs[mobIDOf("Termite Mound")].setAntHoleSpawns([{
    index: mobIDOf("Baby Termite"),
    count: 6
}, {
    index: mobIDOf("Worker Termite"),
    count: 8
}, {
    index: mobIDOf("Soldier Termite"),
    count: 8
}, {
    index: mobIDOf("Termite Egg"),
    count: 5
}, {
    index: mobIDOf("Termite Overmind"),
    count: 1,
    minHealthRatio: .01
}]);

mobConfigs[mobIDOf("Ant Egg")].setHatchables([{
    index: mobIDOf("Baby Ant"),
    time: 22.5 * 15
}, {
    index: mobIDOf("Worker Ant"),
    time: 22.5 * 25
}, {
    index: mobIDOf("Soldier Ant"),
    time: 22.5 * 35
}]);

mobConfigs[mobIDOf("Queen Ant Egg")].setHatchables({
    index: mobIDOf("Soldier Ant"),
    time: 22.5 * 1.5
});

mobConfigs[mobIDOf("Queen Ant")].setPoopable({
    index: mobIDOf("Queen Ant Egg"),
    interval: 22.5 * 2
});

mobConfigs[mobIDOf("Fire Ant Egg")].setHatchables([{
    index: mobIDOf("Baby Fire Ant"),
    time: 22.5 * 15
}, {
    index: mobIDOf("Worker Fire Ant"),
    time: 22.5 * 25
}, {
    index: mobIDOf("Soldier Fire Ant"),
    time: 22.5 * 35
}]);

mobConfigs[mobIDOf("Queen Fire Ant Egg")].setHatchables({
    index: mobIDOf("Soldier Fire Ant"),
    time: 22.5 * 1.5
});

mobConfigs[mobIDOf("Queen Fire Ant")].setPoopable({
    index: mobIDOf("Queen Fire Ant Egg"),
    interval: 22.5 * 2
});

mobConfigs[mobIDOf("Termite Egg")].setHatchables([{
    index: mobIDOf("Baby Termite"),
    time: 22.5 * 15
}, {
    index: mobIDOf("Worker Termite"),
    time: 22.5 * 25
}, {
    index: mobIDOf("Soldier Termite"),
    time: 22.5 * 35
}]);

mobConfigs[mobIDOf("Termite Overmind Egg")].setHatchables({
    index: mobIDOf("Soldier Termite"),
    time: 22.5 * 2
});

mobConfigs[mobIDOf("Termite Overmind")].setPoopable({
    index: mobIDOf("Termite Overmind Egg"),
    interval: 22.5 * 4
});

/**
 * 
 * @param {function(MobConfig)} cb 
 * @returns 
 */

export function queryMob(cb) {
    for (let i = 0; i < mobConfigs.length; i++) {
        if (cb(mobConfigs[i])) {
            return i;
        }
    }

    return -1;
}

mobConfigs[mobIDOf("Centipede")].segmentWith(queryMob(m => m.isSystem && m.name === "Centipede"));
mobConfigs[mobIDOf("Desert Centipede")].segmentWith(queryMob(m => m.isSystem && m.name === "Desert Centipede"));
mobConfigs[mobIDOf("Evil Centipede")].segmentWith(queryMob(m => m.isSystem && m.name === "Evil Centipede"));
mobConfigs[mobIDOf("Hell Centipede")].segmentWith(queryMob(m => m.isSystem && m.name === "Hell Centipede"));
mobConfigs[mobIDOf("Wilt")].branchWith(queryMob(m => m.isSystem && m.name === "Wilt"), 5, 2);

export const DEFAULT_PETAL_COUNT = petalConfigs.length;
export const DEFAULT_MOB_COUNT = mobConfigs.length;

console.log("config.js loaded", petalConfigs.length, "petals", mobConfigs.length, "mobs.");

export const randomPossiblePetal = (rarity) => {
    const possible = [];

    mobConfigs.forEach(mob => {
        mob.drops.forEach(drop => {
            if (drop.index > -1 && rarity >= drop.minRarity) {
                possible.push(drop.index);
            }
        });
    });

    return possible[Math.random() * possible.length | 0];
}

export function applyBiomeGridConfigs() {
    // Make enemy damage scale slower to prevent player from unfairly getting one-shot
    PetalTier.HEALTH_SCALE = 2;
    MobTier.DAMAGE_SCALE = 2.1;
    MobTier.SIZE_SCALE = Math.pow(4, 1 / 11);
    MobTier.LTN_RANGE_SCALE = 1;

    // Some rarity name tweaks
    tiers[1].name = "Unusual";
    tiers[10].name = "Eternal";
    tiers[10].color = "#e0d465"; // Ripped directly from dmaze

    // Add a petal that lets the player view mob descriptions
    petalConfigs.push(
        new PetalConfig("Gallery", 22.5 * 1, 1, 0, true)
            .setDescription("Hit a mob with this petal to view the mob's stats.")
            .setIsGallery(true)
            .setDoNotRotate(true)
            .setDrawing(new Drawing()
                .addAction("beginPath")
                .addAction("arc", 0, -0.5, 0.5, -2.1, Math.PI / 2)
                .addAction("line", 0, 0, 0, 0.2)
                .addAction("stroke", "#000000", 0.4, 0)
                .addAction("stroke", "#00db2f", 0.3, 0)
                .addAction("beginPath")
                .addAction("line", 0, 0.8, 0, 0.81)
                .addAction("stroke", "#000000", 0.4, 0)
                .addAction("stroke", "#00db2f", 0.3, 0)
            )
    );

    /***********    GARDEN PETALS    ***********/

    // Health: 10 -> 5
    // Damage: 10 -> 8
    petalConfigs[petalIDOf("Basic")] = new PetalConfig("Basic", 22.5 * 1, 5, 8, true, petalIDOf("Basic"))
        .setDescription("A weak starter petal. Try to replace this with better petals.");

    // Reload: 1s -> 2.5s
    // Health: 8 -> 15
    // Damage: 6 -> 25
    // Constant heal: 5.5/s -> 5/s
    petalConfigs[petalIDOf("Leaf")] = new PetalConfig("Leaf", 22.5 * 2.5, 15, 25, true, petalIDOf("Leaf"))
        .setSize(1.2)
        .setConstantHeal(5)
        .setDescription("A petal that heals you over time using photosynthesis. It's also quite sharp.");

    // Constant heal: 7.5/s -> 12/s
    // Damage: 6 -> 3
    petalConfigs[petalIDOf("Yucca")] = new PetalConfig("Yucca", 22.5 * 1.5, 8, 3, true, petalIDOf("Yucca"))
        .setSize(1.2)
        .setConstantHeal(12, true)
        .setDescription("A strange leaf that heals you but only when you're in defensive mode."),

    // Extra health: 35 -> 280
    petalConfigs[petalIDOf("Cactus")] = new PetalConfig("Cactus", 22.5 * 2, 18, 6, true, petalIDOf("Cactus"))
        .setSize(1.25)
        .setExtraHealth(280)
        .setHuddles(1)
        .setDescription("A petal that gives you extra health. Pretty magical if you ask me.");

    // Healing stat: 3 -> 4
    // Secondary heal timer: 1.5s -> 0.25s
    // Damage: 5 -> 1
    petalConfigs[petalIDOf("Dahlia")] = new PetalConfig("Dahlia", 22.5 * .75, 5, 1, true, petalIDOf("Dahlia"))
        .setHealing(4, 22.5 * 0.25)
        .setSize(.5)
        .setHuddles(1)
        .setMulti(3, true)
        .setDescription("A very consistent trickle heal.");

    // Reload: 1s -> 3s
    // Health: 9 -> 18
    // Damage: 11 -> 39
    petalConfigs[petalIDOf("Yin Yang")] = new PetalConfig("Yin Yang", 22.5 * 3, 18, 39, true, petalIDOf("Yin Yang"))
        .setYinYang(1)
        .setDescription("The mysterious petal of balance.");

    // Reload: 4.5s -> 5s
    // Damage: 75 -> 80
    petalConfigs[petalIDOf("Stinger")] = new PetalConfig("Stinger", 22.5 * 5, 1, 80, true, petalIDOf("Stinger"))
        .setMulti([1, 1, 2, 2, 3, 3, 4, 4, 5, 5], 1, true)
        .setDescription("A fragile petal that deals lots of damage.");
    
    // Vision: 150 * 1.45^rarity -> 500 * 1.13^rarity
    petalConfigs[petalIDOf("Antennae")] = new PetalConfig("Antennae", 0, 0, 0, true, petalIDOf("Antennae"))
        .setExtraVision(500, MobTier.SIZE_SCALE)
        .setMulti(0, false)
        .setWearable(WEARABLES.ANTENNAE)
        .setDescription("These feelers give you some extra vision.");

    // Reload: .75s -> 3600s
    // Damage: 13 -> 0
    petalConfigs[petalIDOf("Pollen")] = new PetalConfig("Pollen", 22.5 * 3600, 13, 0, true, petalIDOf("Pollen"))
        .setSize(.6)
        .setLaunchable(0, 75)
        .setMulti([1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5], false, true)
        .setDescription("Currently unobtainable."),

    /***********     GARDEN MOBS     ***********/

    // Health: 25 -> 50
    // Poison: 3 * 5 -> 0
    // Constant heal: 0 -> 0.0075
    // Drops: Iris 75%, Shrub 60%, Leaf 100% -> Yucca 100%, Leaf 80%
    mobConfigs[mobIDOf("Shrub")] = new MobConfig("Shrub", 50, 10, 30, 0, true, mobIDOf("Shrub"))
        .setDescription("Poses no danger, but can heal itself very fast.")
        .setPushability(0.5)
        .setHealing(0.005)
        // .addDrop(petalIDOf("Shrub"), .6)
        // Todo: Rubber-like petal
        .addDrop(petalIDOf("Leaf"), .8)
        .addDrop(petalIDOf("Yucca"));

    // Health: 35 -> 70
    // Damage: 3.5 -> 15
    // Speed: 2.5 -> 2
    // Constant heal: 0 -> 0.0015
    // Drops: Leaf 100%, Bone 50%, Cactus 25% -> Leaf 100%, Cactus 35%
    mobConfigs[mobIDOf("Leafbug")] = new MobConfig("Leafbug", 70, 15, 30, 2, true, mobIDOf("Leafbug"))
        .setDescription("Has a hard leaf body, and can also heal slightly via photosynthesis.")
        .setNeutral(1)
        .setDamageReduction(.13)
        .setHealing(0.0015)
        .addDrop(petalIDOf("Leaf"))
        // Todo: Root-like petal
        .addDrop(petalIDOf("Cactus"), .35);

    // Health: 25 -> 50
    // Damage: 15 -> 10
    // Speed: 2.5 -> 2
    // Periodic heal: None -> Dahlias
    // Drops: Dahlia 100%, Yin Yang 15% -> Dahlia 100%, Yin Yang 25%
    mobConfigs[mobIDOf("Evil Ladybug")] = new MobConfig("Evil Ladybug", 50, 10, 25, 2, true, mobIDOf("Evil Ladybug"))
        .setDescription("Will periodically stop to heal itself by eating Dahlias.")
        .setAggressive(1)
        .setPeriodicHeal(petalIDOf("Dahlia"), 3, 1 / 5, 3 * 22.5, 0.8 * 22.5)
        .addDrop(petalIDOf("Dahlia"))
        .addDrop(petalIDOf("Yin Yang"), .25);

    // Health: 25 -> 40
    // Size: 30 -> 20
    // Drops: Pollen 100%, Honey 100% -> Stinger 100%, Antennae 100%
    // Todo: Feed pollen to injured entities ability
    mobConfigs[mobIDOf("Bumblebee")] = new MobConfig("Bumblebee", 40, 15, 20, 5, true, mobIDOf("Bumblebee"))
        .setDescription("Other mobs love to eat the nutritious Pollens that it gathers.")
        .setMoveInSines(1)
        .setBumblebeeMovement(1)
        // .setProjectile({
        //     petalIndex: petalIDOf("Pollen"),
        //     cooldown: 22.5 * .5,
        //     health: 1,
        //     damage: 1,
        //     speed: 0,
        //     range: 90
        // })
        .addDrop(petalIDOf("Stinger"))
        .addDrop(petalIDOf("Antennae"));

    /***********    OCEAN PETALS    ***********/

    // Reload: 0.25s -> 0.5s
    // Damage: 17 -> 10
    // Health: 6.5 -> 1
    // Number of pellets: Min 1, max 7 -> min 3, max 7
    // Density: 1 -> 0
    petalConfigs[petalIDOf("Light")] = new PetalConfig("Light", 22.5 * .5, 1, 10, true, petalIDOf("Light"))
        .setMulti([3, 3, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7], 0, true)
        .setSize(.75)
        .setDensity(0)
        .setDescription("It's very light and recharges quickly, at the cost of damage.");

    // Health: 12 -> 5
    // Density: 1 -> 0
    petalConfigs[petalIDOf("Faster")] = new PetalConfig("Faster", 22.5 * .65, 5, 7, true, petalIDOf("Faster"))
        .setSize(.75)
        .setDensity(0)
        .setExtraRadians(.03)
        .setDescription("This one makes your petals spin faster.");
    
    // Reload: 1.25s -> 1s
    // Health: 8 -> 5
    // Healback: Percentage-based -> flat 2
    petalConfigs[petalIDOf("Fang")] = new PetalConfig("Fang", 22.5 * 1, 5, 10, true, petalIDOf("Fang"))
        .setSize(1.15)
        .setHealBack(2, false)
        .setBypassToxicRemnants(true)
        .setDescription("This petal steals health directly from the opponent, which bypasses Toxic Remnants to heal you.");

    petalConfigs[petalIDOf("Lightning")] = new PetalConfig("Lightning", 22.5 * 1, 1e-15, 5, true, petalIDOf("Lightning"))
        .setLightning([3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 9], 32 * 8, 7)
        .setDescription("Shockingly shocking!");

    // Reload: 0.45s -> 0.75s
    // Health: 5 -> 3
    // Damage: 32 -> 12
    // Density: 1 -> 0
    petalConfigs[petalIDOf("Sand")] = new PetalConfig("Sand", 22.5 * .75, 3, 12, true, petalIDOf("Sand"))
        .setSize(.85)
        .setDensity(0)
        .setMulti(4, true, true)
        .setDescription("Some fine grains of sand. They recharge quickly and can pack a punch.");

    /***********     OCEAN MOBS     ***********/

    // Health: 25 -> 60
    // Damage: 3.5 -> 1.0
    // Drops: Fang 100%, Faster 100% -> Light 50%, Faster 100%, Fang 75%
    mobConfigs[mobIDOf("Leech")] = new MobConfig("Leech", 60, 1, 16, 5.5, true, mobIDOf("Leech"))
        .setDescription("A soft and agile predator. May have trouble with destroying your petals.")
        .setAggressive(1)
        .addDrop(petalIDOf("Light"), .5)
        .addDrop(petalIDOf("Faster"))
        .addDrop(petalIDOf("Fang"), .75);

    // Lightning reload: Around 3s -> 0.4s
    // Lightning damage: 2 -> 1
    // Body damage: 15 -> 5
    // Lightning range: 125 -> 150 but no longer scales exponentially
    // Drops: Lightning 100%, Jelly 100% -> Lightning 100%
    // Todo: Replace lightning or make it not OP vs leeches
    mobConfigs[mobIDOf("Jellyfish")] = new MobConfig("Jellyfish", 40, 5, 30, 2.5, true, mobIDOf("Jellyfish"))
        .setDescription("The master of fast lightning attacks.")
        .setAggressive(1)
        .setLightning(22.5 * 0.4, [2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 8], 150, 1)
        .addDrop(petalIDOf("Lightning"));

    // On-damage projectiles: None -> Bubbles
    // Drops: Sponge 100% -> Sand 50%
    mobConfigs[mobIDOf("Sponge")] = new MobConfig("Sponge", 35, 3, 30, 0, true, mobIDOf("Sponge"))
        .setDescription("It was once harmless, but it can now defend itself by spraying bubbles at attackers.")
        .setOnDamageProjectile({
            petalIndex: petalIDOf("Bubble"),
            health: 1e-99,
            damage: 1,
            speed: 6,
            range: 22.5 * 1,
            size: .1,
        }, 60)
        .addDrop(petalIDOf("Sand"), .5);

    /***********    DESERT PETALS    ***********/

    // Poison: 2 * 5 -> 15 * 5
    petalConfigs[petalIDOf("Pincer")] = new PetalConfig("Pincer", 22.5 * 1, 7.5, 7.5, true, petalIDOf("Pincer"))
        .setSize(1.2)
        .setPoison(15, 5)
        .setEnemySpeedMultiplier(.6, 5)
        .setDescription("Poisonous, and it slows down your enemies. A perfect double whammy.");
    
    // Damage: 5 -> 1
    // Poison: 12.5 * 5 -> 30 * 3
    petalConfigs[petalIDOf("Iris")] = new PetalConfig("Iris", 22.5 * 1, 10, 1, true, petalIDOf("Iris"))
        .setSize(.8)
        .setPoison(30, 3)
        .setDescription("Packs a predictable punch in its well-known weapon: poison.");

    // Damage: 5 -> 1
    petalConfigs[petalIDOf("Powder")] = new PetalConfig("Powder", 22.5 * .75, 3, 1, true, petalIDOf("Powder"))
        .setSize(1.65)
        .setSpeedMultiplier(1.03)
        .setHuddles(1)
        .setDescription("This lightweight powder will make you go fast!");
    
    // Lightning protection: True -> false (may revert if changed to drop from Rock in Garden)
    petalConfigs[petalIDOf("Magnet")] = new PetalConfig("Magnet", 22.5 * 2, 9, 6, true, petalIDOf("Magnet"))
        .setSize(1.55)
        .setExtraPickupRange(125)
        .setHuddles(1)
        .setDescription("This petal's magnetic field will attract nearby items. Does not stack. Also does NOT protect you from lightning."),

    petalConfigs.push(
        new PetalConfig("Privet", 22.5 * 1, 5, 20, true)
            .setSize(.8)
            .setPoisonBasedCap(1)
            .setDescription("A strange berry. Its damage is capped by the poison DPS currently inflicted on the opponent.")
            .setDrawing(new Drawing()
                .addAction("beginPath")
                .addAction("arc", 0, 0, .8, 0, 2 * Math.PI)
                .addAction("fill", "#83048e")
                .addAction("stroke", "#83048e", .3, .5)
            ),
    );

    petalConfigs[petalIDOf("Scorpion Missile.projectile")] = new PetalConfig("Scorpion Missile.projectile", 22.5 * 100, 5, 2.5, true, petalIDOf("Scorpion Missile.projectile"))
        .setPoison(2.5, 5)
        .setDescription("[object null object]");
    
    petalConfigs.push(
        new PetalConfig("Poison Drain Indicator 1", 1e99, 1e99, 0, true)
            .setSize(.1 / 7.5)
            .setNullCollision(true)
            .setDoNotRotate(true)
            .setDescription("[object null object]")
            .setDrawing(new Drawing()
                .addAction("beginPath")
                .addAction("arc", -30, 45, 25, 0, 2 * Math.PI)
                .addAction("stroke", "#9B4DFF", 15, 0)
                .addAction("beginPath")
                .addAction("arc", 25, 80, 20, 0, 2 * Math.PI)
                .addAction("stroke", "#9B4DFF", 10, 0)
                .addAction("beginPath")
                .addAction("arc", -10, 120, 20, 0, 2 * Math.PI)
                .addAction("stroke", "#9B4DFF", 10, 0)
                .addAction("beginPath")
                .addAction("line", 60, 90, 60, 150)
                .addAction("line", 35, 125, 60, 150)
                .addAction("line", 85, 125, 60, 150)
                .addAction("stroke", colors.legendary, 15, 0)
                // .addAction("beginPath")
                // .addAction("line", 0, 0.8, 0, 0.8)
                // .addAction("stroke", "#000000", 0.4, 0)
                // .addAction("stroke", "#00db2f", 0.3, 0)
            ),
        new PetalConfig("Poison Drain Indicator 2", 1e99, 1e99, 0, true)
            .setSize(.1 / 7.5)
            .setNullCollision(true)
            .setDoNotRotate(true)
            .setDescription("[object null object]")
            .setDrawing(new Drawing()
                .addAction("beginPath")
                .addAction("beginPath")
                .addAction("arc", -30, 45, 25, 0, 2 * Math.PI)
                .addAction("stroke", "#9B4DFF", 15, 0)
                .addAction("beginPath")
                .addAction("arc", 25, 80, 20, 0, 2 * Math.PI)
                .addAction("stroke", "#9B4DFF", 10, 0)
                .addAction("beginPath")
                .addAction("arc", -10, 120, 20, 0, 2 * Math.PI)
                .addAction("stroke", "#9B4DFF", 10, 0)
                .addAction("beginPath")
                .addAction("line", 60, 90, 60, 150)
                .addAction("line", 35, 125, 60, 150)
                .addAction("line", 85, 125, 60, 150)
                .addAction("line", 95, 90, 95, 150)
                .addAction("line", 70, 125, 95, 150)
                .addAction("line", 120, 125, 95, 150)
                .addAction("stroke", colors.legendary, 15, 0)
            ),
        new PetalConfig("Poison Drain Indicator 3", 1e99, 1e99, 0, true)
            .setSize(.1 / 7.5)
            .setNullCollision(true)
            .setDoNotRotate(true)
            .setDescription("[object null object]")
            .setDrawing(new Drawing()
                .addAction("beginPath")
                .addAction("beginPath")
                .addAction("arc", -30, 45, 25, 0, 2 * Math.PI)
                .addAction("stroke", "#9B4DFF", 15, 0)
                .addAction("beginPath")
                .addAction("arc", 25, 80, 20, 0, 2 * Math.PI)
                .addAction("stroke", "#9B4DFF", 10, 0)
                .addAction("beginPath")
                .addAction("arc", -10, 120, 20, 0, 2 * Math.PI)
                .addAction("stroke", "#9B4DFF", 10, 0)
                .addAction("beginPath")
                .addAction("line", 60, 90, 60, 150)
                .addAction("line", 35, 125, 60, 150)
                .addAction("line", 85, 125, 60, 150)
                .addAction("line", 95, 90, 95, 150)
                .addAction("line", 70, 125, 95, 150)
                .addAction("line", 120, 125, 95, 150)
                .addAction("line", 130, 90, 130, 150)
                .addAction("line", 105, 125, 130, 150)
                .addAction("line", 155, 125, 130, 150)
                .addAction("stroke", colors.legendary, 15, 0)
            ),
    );

    /***********     DESERT MOBS     ***********/

    // Body poison: 0 -> 3 * 5
    // Speed: 3 -> 2
    // Strafe movement: 1/3 charge -> 0 charge, 300 max distance from player
    // Missile cooldown: 2s -> 4s
    // Missile poison: 2.5 * 5 -> 2.5 * 3
    // Missile range: 65 ticks -> 30 ticks
    mobConfigs[mobIDOf("Scorpion")] = new MobConfig("Scorpion", 45, 7.5, 32.5, 2, true, mobIDOf("Scorpion"))
        .setDescription("Everyone's most hated enemy. At least it won't kill you instantly this time...")
        .setAggressive(1)
        .setStrafes(1e99, 0, 1.25, 300)
        .setPoison(3, 5)
        .setProjectile({
            petalIndex: petalIDOf("Scorpion Missile.projectile"),
            cooldown: 22.5 * 4,
            health: 2,
            damage: 2,
            poison: {
                damage: 2.5,
                duration: 3,
            },
            speed: 5,
            range: 30,
            size: .2
        })
        .addDrop(petalIDOf("Pincer"))
        .addDrop(petalIDOf("Iris"));
    
    // Health: 25 -> 40
    // Poison: 0 -> 3 * 5
    // Size: 15 -> 20 (May revert if fire ant hole is added)
    // Drops: Faster 50%, Glass 50% -> Powder 80%, Privet 100%
    mobConfigs[mobIDOf("Soldier Fire Ant")] = new MobConfig("Soldier Fire Ant", 40, 10, 20, 3.5, true, mobIDOf("Soldier Fire Ant"))
        .setDescription("It has a fiery temper.")
        .setAggressive(1)
        .setPoison(3, 5)
        .addDrop(petalIDOf("Powder"), .8)
        .addDrop(petalIDOf("Privet"));

    // Health: 10 -> 25
    // Poison: 0 -> 3 * 5
    // Size: 15 -> 20 (May revert if fire ant hole is added)
    // Speed: 2 -> 0.5
    // Projectiles: None -> Poison spray
    // Drops: Light 50%, Yucca 50% -> Magnet 50%, Privet 100%
    // Todo: Find a different mob to drop magnet
    mobConfigs[mobIDOf("Baby Fire Ant")] = new MobConfig("Baby Fire Ant", 25, 10, 20, .5, true, mobIDOf("Baby Fire Ant"))
        .setDescription("It spits out pools of poison to defend itself. Watch your step.")
        .setPoison(3, 5)
        .setProjectile({
            petalIndex: petalIDOf("Iris"),
            cooldown: 22.5 * 7,
            health: Infinity,
            damage: 0,
            poison: {
                damage: 10,
                duration: 5,
            },
            speed: 6,
            range: 22.5 * 20,
            size: .2,
            multiShot: {
                count: 10,
                delay: 0,
                spread: .5
            },
            nullCollision: true,
            slowdownPerTick: .2,
            shootAtEndOfPassiveMove: true,
        })
        .addDrop(petalIDOf("Magnet"), .5)
        .addDrop(petalIDOf("Privet"));


    // Todo: Probably add crafting
    // Todo: Hopefully implement tutorial rooms?
    // Todo: Give player more ways to deal with Toxic Remnants
    // Todo: Knockback vs non-bubble projectiles
    // Todo: Should Privet also inflict Toxic Remnants?

    // Todo: Baby Fire Ant should shoot projectiles farther at higher rarities
    // Todo: Make player unable to kill mobs with Powder equipped
    // Todo: Make lightning able to hit the same mob multiple times
    // Todo: Does Antennae vision cause lag?

    // Todo: One of these 2 ideas:
    // 1. Ocean ecosystem: Leeches eat from sponges and (rarely) jf, while jf can shock and stun leeches in self-defence
    //   - Should also add Rubber petal to make this jf strategy safer
    // 2. New ocean/desert hybrid mob: Urchin. It rotates its body to launch 10 fast projectiles at the player
    //   - New petal: Lotus, absorbs poison damage, including toxic remnants
    //   - Want to do thorn-type petal that implements pokemon's Merciless ability, idk if it works in floof though

    // Pdrain doesn't show up if cache petal assets
    // Crash is most likely not a wifi issue, I can temporarily disconnect wifi and still resume lobby 10s later
    // Random crash is NOT a >16mb message issue :(
    // If socket closes from lobby creator's end, it gives close code 1005 instead of 1006, so it is NOT the cause
}
