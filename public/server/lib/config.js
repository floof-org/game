import { tiers as _tiers, Drawing, WEARABLES, PetalTier, MobTier, PetalConfig, MobDrop, MobConfig } from "../../lib/protocol.js";
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
        .setHealBack([.2, .25, .3, .35, .4, .45, -.5, .55, .6, .65, .7, .75])
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
        .setDescription("This isn't from this world..."),

    // Ported from index.js build
    new PetalConfig("Clover",22.5,10,10)
        .setSize(1.4)
        .setLuck(.01)
        .setDescription(Array.from({
                length: 10
            }, (e, t) => `Has a ${t + 1}% chance to dupe petals of the same rarity`))
        .setDrawing((new Drawing).addAction("rotate", 30).addAction("beginPath").addAction("moveTo", 0, 0).addAction("quadraticCurveTo", -.6, -.6, -.4, -.9).addAction("quadraticCurveTo", -.2, -1.2, 0, -1).addAction("quadraticCurveTo", .2, -1.2, .4, -.9).addAction("quadraticCurveTo", .6, -.6, 0, 0).addAction("closePath").addAction("paint", "#3AB54A", .2, .2).addAction("beginPath").addAction("moveTo", 0, 0).addAction("quadraticCurveTo", .6, -.6, .9, -.4).addAction("quadraticCurveTo", 1.2, -.2, 1, 0).addAction("quadraticCurveTo", 1.2, .2, .9, .4).addAction("quadraticCurveTo", .6, .6, 0, 0).addAction("closePath").addAction("paint", "#3AB54A", .2, .2).addAction("beginPath").addAction("moveTo", 0, 0).addAction("quadraticCurveTo", .6, .6, .4, .9).addAction("quadraticCurveTo", .2, 1.2, 0, 1).addAction("quadraticCurveTo", -.2, 1.2, -.4, .9).addAction("quadraticCurveTo", -.6, .6, 0, 0).addAction("closePath").addAction("paint", "#3AB54A", .2, .2).addAction("beginPath").addAction("moveTo", 0, 0).addAction("quadraticCurveTo", -.6, .6, -.9, .4).addAction("quadraticCurveTo", -1.2, .2, -1, 0).addAction("quadraticCurveTo", -1.2, -.2, -.9, -.4).addAction("quadraticCurveTo", -.6, -.6, 0, 0).addAction("closePath").addAction("paint", "#3AB54A", .2, .2)),
    new PetalConfig("Golden Leaf",22.5,15,15)
        .setSize(1.4)
        .setIcon(1, 1, "Leaf")
        .setReloadSpeed(.05)
        .setDescription(Array.from({
                length: 10
            }, (e, t) => `Speedups reload for other petals you have. Reload speed: -${5 * t + 5}%`))
        .setDrawing((new Drawing).addAction("rotate", -45).addAction("beginPath").addAction("moveTo", -.6609, .4525).addAction("quadraticCurveTo", -.2989, .6336, .1536, .5431).addAction("quadraticCurveTo", .5157, .4525, .7872, .2715).addAction("quadraticCurveTo", 1.104, .0453, .8777, -.181).addAction("quadraticCurveTo", .6062, -.4525, .1536, -.5431).addAction("quadraticCurveTo", -.2989, -.6336, -.7062, -.4073).addAction("quadraticCurveTo", -1.2493, .0453, -.6609, .4525).addAction("closePath").addAction("paint", "#FFE763", .2, .2).addAction("beginPath").addAction("moveTo", .6, 0).addAction("quadraticCurveTo", 0, .1, -.6, 0).addAction("moveTo", -1, 0).addAction("quadraticCurveTo", -1.3, -.05, -1.35, -.1).addAction("stroke", "#FFE763", .2, .2)),
    new PetalConfig("Root",22.5,5,5)
        .setSize(1.4)
        .setArmor(3)
        .setExtraArmor(3)
        .setDescription("Gives armor for you")
        .setDrawing((new Drawing).addAction("beginPath").addAction("moveTo", .6, 1.2).addAction("lineTo", .2, 0).addAction("lineTo", .5, -.8).addAction("lineTo", -.3, -1.3).addAction("lineTo", -.4, -1.5).addAction("lineTo", -.45, -1.3).addAction("lineTo", -.15, -.7).addAction("lineTo", -.5, -.1).addAction("lineTo", -.35, 1.45).addAction("lineTo", .1, 1.25).addAction("lineTo", .6, 1.2).addAction("paint", "#a35f2b", .25, .2)),
    new PetalConfig("Wax",225,1e3,0)
        .setNotAttraction(true)
        .setIcon(1.3, 1, "Wax", -1)
        .setDescription("Can be your personal wall")
        .setDrawing((new Drawing).addAction("beginPath").addAction("polygon", 6, 1, 0).addAction("paint", "#FEE86B", .2, .2)),
    new PetalConfig("Shovel",67.5,10,20)
        .setSize(1.6)
        .setStationaryDamage(10)
        .setDescription("Shovel doesn't dig. Deals 10x damage to stationary enemies")
        .setDrawing((new Drawing).addAction("rotate", 45).addAction("beginPath").addAction("moveTo", -.3, -.6).addAction("lineTo", .3, -.6).addAction("lineTo", .3, 1).addAction("lineTo", -.3, 1).addAction("closePath").addAction("paint", "#795134", .2, .2).addAction("beginPath").addAction("moveTo", -.7, -.4).addAction("quadraticCurveTo", -.8, -1.5, 0, -1.55).addAction("quadraticCurveTo", .8, -1.5, .7, -.4).addAction("closePath").addAction("paint", "#4e4e4e", .2, .2).addAction("beginPath").addAction("moveTo", -.4, 1).addAction("lineTo", .4, 1).addAction("lineTo", .4, 1.4).addAction("lineTo", -.4, 1.4).addAction("closePath").addAction("paint", "#4e4e4e", .2, .2)),
    new PetalConfig("Plank",22.5,30,10)
        .setSize(1.4)
        .setNotAttraction(1)
        .setHuddles(1)
        .setProjectileDamage(10)
        .setDescription("Deals 10x damage to projectiles")
        .setDrawing((new Drawing).addAction("rotate", -120).addAction("beginPath").addAction("moveTo", 1.4, -.7).addAction("lineTo", -.5, -.7).addAction("lineTo", -.5, -.4).addAction("lineTo", -.8, -.7).addAction("lineTo", -1.4, -.7).addAction("lineTo", -1.4, -.1).addAction("lineTo", -1, .1).addAction("lineTo", -1.4, .2).addAction("lineTo", -1.4, .7).addAction("lineTo", 0, .7).addAction("lineTo", .8, .5).addAction("lineTo", 1, .7).addAction("lineTo", 1.4, .7).addAction("lineTo", 1.4, -.7).addAction("paint", "#b96c32", .2, .2).addAction("beginPath").addAction("circle", .8, -.05, .25).addAction("paint", "#b96c32", .2, .2)),
    new PetalConfig("Clay",22.5,50,10)
        .setSize(1.6)
        .setDecay(.01)
        .setDescription("Decreases in health overtime with random power")
        .setDrawing((new Drawing).addAction("beginPath").addAction("moveTo", 0, -1.05).addAction("lineTo", .25, -.92).addAction("lineTo", .78, -.62).addAction("lineTo", .85, -.35).addAction("lineTo", .98, .18).addAction("lineTo", .82, .45).addAction("lineTo", .43, .92).addAction("lineTo", .2, .98).addAction("lineTo", -.45, .88).addAction("lineTo", -.65, .65).addAction("lineTo", -.95, .22).addAction("lineTo", -.88, -.15).addAction("lineTo", -.75, -.68).addAction("lineTo", -.4, -.85).addAction("lineTo", 0, -1.05).addAction("closePath").addAction("paint", "#ba7760", .25, .2)),
    new PetalConfig("Horn",22.5,5,5)
        .setSize(1.7)
        .setHuddles(1)
        .setRandomKill(1)
        .setNotAttraction(true)
        .setDescription(Array.from({
                length: 10
            }, (e, t) => `Kills random ${tiers[t].name} or below rarity enemy every seven seconds but it doesn't drop loot`))
        .setDrawing((new Drawing).addAction("beginPath").addAction("moveTo", -1.5, .4).addAction("quadraticCurveTo", 0, .5, 1.6, -.4).addAction("quadraticCurveTo", 1, -.8, .8, -.9).addAction("quadraticCurveTo", 0, -.2, -1.5, .4).addAction("paint", "#555555", .2, .2).addAction("beginPath").addAction("moveTo", -.3, -.15).addAction("quadraticCurveTo", 0, .5, 1.6, -.4).addAction("quadraticCurveTo", 1, -.8, .8, -.9).addAction("quadraticCurveTo", 0, -.3, -.3, -.15).addAction("paint", "#b89c74", .2, .2)),
    new PetalConfig("Triangle",22.5,10,5)
        .setIcon(.7, 1, "Triangle")
        .setDescription("Using more triangles will make other triangles have 80% more damage with each next one")
        .setDrawing((new Drawing).addAction("beginPath").addAction("polygon", 3, 1, 0).addAction("paint", "#ffffff", .3, .2)),
    new PetalConfig("Lentil",22.5,10,10)
        .setSize(1.1)
        .setIcon(.8, 1, "Lentil", 45)
        .setAttraction(.3)
        .setDescription("Makes petals gravity toward stronger enemies")
        .setDrawing((new Drawing).addAction("beginPath").addAction("dipPolygon", 4, 1, -1, 0).addAction("paint", "#f4c63e", .3, .2)),
    new PetalConfig("Sandstone",22.5,20,20)
        .setSize(1.6)
        .setDescription("Hot rock that has been under sun for a while")
        .setDrawing((new Drawing).addAction("beginPath").addAction("dipPolygon", 5, 1, 0, 0).addAction("paint", "#E1C85D", .2, .2)),
    new PetalConfig("Coin",22.5,1,20)
        .setSize(1.4)
        .setIcon(.9, 1, "Coin")
        .setDescription("Maybe it's worth something")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("fill", "#C69B2E").addAction("stroke", "#F5bF39", .23, 0).addAction("beginPath").addAction("arc", 0, 0, .4, Math.PI / 4, 1.8 * Math.PI).addAction("stroke", "#FFE783", .25, 0).addAction("beginPath").addAction("line", 0, .4, 0, .6).addAction("line", 0, -.4, 0, -.6).addAction("stroke", "#FFE783", .2, 0)),
    new PetalConfig("Venomous Stinger",67.5,1,80)
        .setSize(.8)
        .setIcon(.6, [1, 1, 1, 1, 1, 3, 5, 5, 7, 7], "Stinger")
        .setMulti([1, 1, 1, 1, 1, 3, 5, 5, 7, 7], true, true)
        .setPoison(10, 3)
        .setDescription("Deadly poisonous needle with high damage!")
        .setDrawing((new Drawing).addAction("beginPath").addAction("dipPolygon", 3, 1, .3, 0).addAction("paint", "#5F4383", .5, .2)),
    new PetalConfig("Lotus",22.5,5,5)
        .setSize(1.5)
        .setIcon(1.1, 1, "Lotus")
        .setHuddles(1)
        .setHealSpit(24, 512, 3)
        .setNotAttraction(true)
        .setDescription("Heals everything on your team that is near you")
        .setDrawing((new Drawing).addAction("rotate", 13)
    .addAction("beginPath")
    .addAction("moveTo", 0, 0)
    .addAction("bezierCurveTo", -0.416, -0.24, -1.039, -0.6, 0, -1.2)
    .addAction("bezierCurveTo", 1.039, -0.6, 0.52, -0.3, 0, 0)
    .addAction("bezierCurveTo", 0.416, -0.24, 1.039, -0.6, 1.039, 0.6)
    .addAction("bezierCurveTo", 0, 1.2, 0, 0.6, 0, 0)
    .addAction("bezierCurveTo", 0, 0.48, 0, 1.2, -1.039, 0.6)
    .addAction("bezierCurveTo", -1.039, -0.6, -0.52, -0.3, 0, 0)
    .addAction("closePath")
    .addAction("paint", "#FFB7C5", 0.2, 0.2)
    .addAction("beginPath")
    .addAction("circle", 0, 0, 0.45)
    .addAction("fill", "#ffddbf")),
    new PetalConfig("Lily Pad",22.5,1,4)
        .setSize(1.6)
        .setEvade(.9)
        .setIcon(1, 1, "Lily", 235)
        .setDescription("Has 90% chance to evade attack")
        .setDrawing((new Drawing).addAction("beginPath").addAction("arc", 0, 0, 1, 1.6, 1).addAction("lineTo", 0, 0).addAction("closePath").addAction("paint", "#3C9564", .25, .2)),
    new PetalConfig("Carapace",22.5,1e3,0)
        .setSize(1.6)
        .setIcon(1.2, 1, "Carapace", 45)
        .setHuddles(1)
        .setNotAttraction(true)
        .setDescription("Something is hiding inside, come out!")
        .setDrawing((new Drawing).addAction("beginPath").addAction("ellipse", 0, 0, 1, .66, 0).addAction("paint", "#DC704B", .2, .2).addAction("beginPath").addAction("arc", .55, 0, .33, Math.PI / 1.5, -Math.PI / 1.5).addAction("stroke", "#B0593C", .2, 0).addAction("beginPath").addAction("arc", -.55, 0, .33, -Math.PI / 3, Math.PI / 3).addAction("stroke", "#B0593C", .2, 0)),
    new PetalConfig("Salt",22.5,10,10)
        .setSize(1.4)
        .setDamageReflection(.04)
        .setIcon(.9, 1, "Salt")
        .setDescription("Makes you reflect damage back to enemy")
        .setDrawing((new Drawing).addAction("beginPath").addAction("dipPolygon", 7, 1, .5, 0).addAction("paint", "#FFFFFF", .2, .2)),
    new PetalConfig("Coral",13.5,1e-10,7)
        .setSize(1.6)
        .setIcon(1.2, 1, "Coral")
        .setDescription("Splits on collision into parts")
        .setDrawing((new Drawing).addAction("beginPath").addAction("moveTo", .18, -.12).addAction("quadraticCurveTo", -.12, 0, -.66, .48).addAction("stroke", "#ab91da", .7, .2).addAction("beginPath").addAction("moveTo", .3, -.72).addAction("quadraticCurveTo", -.18, 0, .72, .18).addAction("stroke", "#ab91da", .7, .2).addAction("beginPath").addAction("moveTo", .18, -.12).addAction("quadraticCurveTo", -.12, 0, -.66, .48).addAction("stroke", "#ab91da", .4, 0).addAction("beginPath").addAction("moveTo", .3, -.72).addAction("quadraticCurveTo", -.18, 0, .72, .18).addAction("stroke", "#ab91da", .4, 0)),
    new PetalConfig("Blood Stinger",22.5,1,100)
        .setSize(.8)
        .setIcon(.6, [1, 1, 1, 1, 1, 3, 5, 5, 7, 7], "Stinger")
        .setMulti([1, 1, 1, 1, 1, 3, 5, 5, 7, 7], true, true)
        .setHealBack(-.3)
        .setDescription("Deals massive damage to you and your enemy")
        .setDrawing((new Drawing).addAction("beginPath").addAction("beginPath").addAction("dipPolygon", 3, 1, .85, 0).addAction("paint", "#962921", .5, .15)),
    new PetalConfig("Fig",22.5,1e-10,0)
        .setSize(1.4)
        .setDescription(Array.from({
                length: 10
            }, (e, t) => `Explodes on collision dealing ${20 * Math.pow(3, t)} explosion damage`))
        .setDrawing((new Drawing).addAction("beginPath").addAction("ellipse", 0, 0, .75, 1, 0).addAction("paint", "#cd75de", .25, .2)),
    new PetalConfig("Relic",22.5,5,5)
        .setSize(1.4)
        .setArmor(3)
        .setSummonArmor(3)
        .setIcon(.8, 1, "Relic")
        .setDescription("A magical relic which buffs your summons armor")
        .setDrawing((new Drawing).addAction("beginPath").addAction("dipPolygon", 4, 1, 1.5, 0).addAction("paint", "#c7a138", .3, .2)),
    new PetalConfig("Rubber",22.5,100,1)
        .setSize(1.4)
        .setHuddles(1)
        .setBounce(.3)
        .setNotAttraction(true)
        .setDescription("With it, you're like a jumper! Also attract enemy lightning")
        .setDrawing((new Drawing).addAction("rotate", -30).addAction("beginPath").addAction("dipPolygon", 4, .9, 0, 0).addAction("paint", "#FFFFFF", .2, .2)),
    new PetalConfig("Compass",112.5,10,10)
        .setSize(1.4)
        .setHuddles(1)
        .setFinds(1)
        .setNotAttraction(1)
        .setDescription("Summons an chest in the end of wave if its alive")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("fill", "#42A5F5").addAction("beginPath").addAction("circle", 0, 0, 1).addAction("stroke", "#B0BEC5", .25, 0).addAction("beginPath").addAction("moveTo", .2, .2).addAction("lineTo", -.2, -.2).addAction("lineTo", .6, -.6).addAction("lineTo", .2, .2).addAction("fill", "#e74c3c").addAction("beginPath").addAction("moveTo", .25, .25).addAction("lineTo", -.2, -.2).addAction("lineTo", -.6, .6).addAction("lineTo", .2, .2).addAction("fill", "#ffffff").addAction("beginPath").addAction("circle", 0, 0, .2).addAction("fill", "#B0BEC5")),
    new PetalConfig("Cog",22.5,10,5)
        .setSize(1.6)
        .setBlock(8)
        .setIcon(1.1, 1, "Cog")
        .setDescription("Losing only 1/8 of health on hit")
        .setDrawing((new Drawing)
    .addAction("beginPath")
    .addAction("moveTo", .75, 0)
    .addAction("lineTo", 1, .08)
    .addAction("lineTo", .85, .528)
    .addAction("lineTo", .66, .44)
    .addAction("lineTo", .537, .536)
    .addAction("lineTo", .65, .769)
    .addAction("lineTo", .23, .97)
    .addAction("lineTo", .12, .74)
    .addAction("lineTo", 0, .75)
    .addAction("lineTo", -.087, 1)
    .addAction("lineTo", -.528, .85)
    .addAction("lineTo", -.44, .66)
    .addAction("lineTo", -.536, .537)
    .addAction("lineTo", -.769, .65)
    .addAction("lineTo", -.97, .23)
    .addAction("lineTo", -.74, .124)
    .addAction("lineTo", -.75, 0)
    .addAction("lineTo", -1, -.082)
    .addAction("lineTo", -.85, -.527)
    .addAction("lineTo", -.67, -.44)
    .addAction("lineTo", -.537, -.536)
    .addAction("lineTo", -.65, -.766)
    .addAction("lineTo", -.23, -.97)
    .addAction("lineTo", -.127, -.74)
    .addAction("lineTo", 0, -.75)
    .addAction("lineTo", .08, -1)
    .addAction("lineTo", .524, -.85)
    .addAction("lineTo", .44, -.67)
    .addAction("lineTo", .535, -.537)
    .addAction("lineTo", .765, -.65)
    .addAction("lineTo", .97, -.23)
    .addAction("lineTo", .74, -.134)
    .addAction("closePath")
    .addAction("moveTo", 0, -.26)
    .addAction("quadraticCurveTo", -.25, -.25, -.26, 0)
    .addAction("quadraticCurveTo", -.25, .25, 0, .26)
    .addAction("quadraticCurveTo", .25, .25, .26, 0)
    .addAction("quadraticCurveTo", .25, -.25, 0, -.26)
    .addAction("closePath")
    .addAction("paint", "#E78d78", .2, .2)),
    new PetalConfig("Fragment",67.5,10,10)
        .setSize(.9)
        .setIcon(.8, [3, 3, 3, 4, 4, 5, 5, 6, 6, 7], "Fragment")
        .setMulti([3, 3, 3, 4, 4, 5, 5, 6, 6, 7], true, true)
        .setDescription("Increase it projectile amount with every second rarity")
        .setDrawing((new Drawing).addAction("rotate", -15).addAction("beginPath").addAction("polygon", 3, 1, 0).addAction("paint", "#8F9699", .4, .2)),
    new PetalConfig("Mecha Missile",22.5,2,30)
        .setSize(1.4)
        .setIcon(.8, 1, "Missile", -45)
        .setLaunchable(1, 225, true)
        .setDescription("Modified missile will target enemy with incredible accuracy")
        .setDrawing((new Drawing).addAction("beginPath").addAction("moveTo", -2.2, 0).addAction("lineTo", -.7, -.7).addAction("lineTo", -.7, .7).addAction("lineTo", -2.2, 0).addAction("fill", "#f13e3e").addAction("beginPath").addAction("moveTo", -1.6, 0).addAction("lineTo", -.7, -.6).addAction("lineTo", -.7, .6).addAction("lineTo", -1.6, 0).addAction("fill", "#ECD54A").addAction("beginPath").addAction("moveTo", 1.1, 0).addAction("lineTo", -.8, -.8).addAction("lineTo", -.8, .8).addAction("lineTo", 1.1, 0).addAction("paint", "#8F9699", .2, .2).addAction("beginPath").addAction("circle", .1, 0, .2).addAction("fill", "#FF0000")),
    new PetalConfig("Sawblade",22.5,30,40)
        .setSize(2.0)
        .setIcon(1.2, 1, "Saw")
        .setDescription("Cut you enemies in half!")
        .setDrawing((new Drawing)
    .addAction("beginPath")
    .addAction("moveTo", 0, -.88)
    .addAction("lineTo", .092, -1.096)
    .addAction("lineTo", .358, -.804)
    .addAction("lineTo", .53, -.964)
    .addAction("lineTo", .654, -.589)
    .addAction("lineTo", .876, -.665)
    .addAction("lineTo", .837, -.272)
    .addAction("lineTo", 1.071, -.251)
    .addAction("lineTo", .875, .092)
    .addAction("lineTo", 1.081, .206)
    .addAction("lineTo", .762, .44)
    .addAction("lineTo", .903, .628)
    .addAction("lineTo", .517, .712)
    .addAction("lineTo", .57, .941)
    .addAction("lineTo", .183, .861)
    .addAction("lineTo", .138, 1.091)
    .addAction("lineTo", -.183, .861)
    .addAction("lineTo", -.318, 1.053)
    .addAction("lineTo", -.517, .712)
    .addAction("lineTo", -.719, .833)
    .addAction("lineTo", -.762, .44)
    .addAction("lineTo", -.995, .468)
    .addAction("lineTo", -.875, .092)
    .addAction("lineTo", -1.1, .023)
    .addAction("lineTo", -.837, -.272)
    .addAction("lineTo", -1.014, -.426)
    .addAction("lineTo", -.654, -.589)
    .addAction("lineTo", -.753, -.802)
    .addAction("lineTo", -.358, -.804)
    .addAction("lineTo", -.362, -1.039)
    .addAction("closePath")
    .addAction("moveTo", 0, -.29)
    .addAction("quadraticCurveTo", -.27, -.27, -.29, 0)
    .addAction("quadraticCurveTo", -.27, .27, 0, .29)
    .addAction("quadraticCurveTo", .27, .27, .29, 0)
    .addAction("quadraticCurveTo", .27, -.27, 0, -.29)
    .addAction("closePath")
    .addAction("paint", "#888a89", .15, .2)),
    new PetalConfig("Broccoli",22.5,7,7)
        .setSize(1.4)
        .setDescription("Breaks into 3 parts upon death")
        .setDrawing((new Drawing).addAction("beginPath").addAction("line", -.5, .75, 1, .1).addAction("line", -.75, .5, -.1, -1).addAction("line", -.625, .625, .25, -.25).addAction("line", -.5, .75, -.75, .5).addAction("stroke", "#278A42", .7, 0).addAction("stroke", "#32AE54", .35, 0).addAction("beginPath").addAction("circle", -.1, -.75, .5).addAction("stroke", "#1F6e34", .3, 0).addAction("beginPath").addAction("circle", .75, .1, .5).addAction("stroke", "#1F6e34", .3, 0).addAction("beginPath").addAction("circle", .5, -.5, .5).addAction("stroke", "#1F6e34", .3, 0).addAction("beginPath").addAction("circle", -.1, -.75, .5).addAction("fill", "#278A42").addAction("beginPath").addAction("circle", .75, .1, .5).addAction("fill", "#278A42").addAction("beginPath").addAction("circle", .5, -.5, .5).addAction("fill", "#278A42")),
    new PetalConfig("Mark",22.5,10,10)
        .setSize(1.4)
        .setDescription("Mark")
        .setDrawing((new Drawing).addAction("beginPath").addAction("spikeBall", 5, 1.2, 0).addAction("paint", "#A51818", .25, .2).addAction("beginPath").addAction("polygon", 5, .5, Math.PI).addAction("paint", "#A51818", .2, .2)),
    new PetalConfig("Pumpkin Seed",22.5,10,10)
        .setSize(1.4)
        .setIcon(1, 1, "Seed")
        .setMark(true)
        .setDescription(Array.from({
                length: 10
            }, (e, t) => `When touched, makes mob explode on death with ${20 * Math.pow(3, t)} explosion damage. Explosion also applies explosive death effect`))
        .setDrawing((new Drawing).addAction("rotate", 315).addAction("beginPath").addAction("moveTo", -1.05, 0).addAction("quadraticCurveTo", -1, -.8, -.2, -.7).addAction("quadraticCurveTo", .5, -.6, .9, 0).addAction("quadraticCurveTo", .5, .6, -.2, .7).addAction("quadraticCurveTo", -1, .8, -1.05, 0).addAction("paint", "#EAD8B1", .25, .2)),

    // ==== Ported from index.js build (projectiles / particle effects) ====
    new PetalConfig("Radiation.projectile",960,1e4,0)
        .setPoison(5, 1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .33).addAction("fill", "#66BB2A")),
    new PetalConfig("coral.projectile",960,1e-10,7)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("moveTo", .3, -.6).addAction("quadraticCurveTo", -.7, 0, .3, .6).addAction("stroke", "#ab91da", .7, .2).addAction("stroke", "#ab91da", .4, 0)),
    new PetalConfig("broccoli.projectile",960,7,7)
        .setSize(1.1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, .7).addAction("paint", "#278A42", .15, .2)),
    new PetalConfig("orange.explosion",960,1e3,3)
        .setSize(90)
        .setIgnoreWalls(1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .3).addAction("fill", "#F1BC48")),
    new PetalConfig("fig.explosion",960,1e3,20)
        .setSize(120)
        .setIgnoreWalls(1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .3).addAction("fill", "#CD75DE")),
    new PetalConfig("melon.explosion",960,1e3,27)
        .setSize(90)
        .setIgnoreWalls(1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .3).addAction("fill", "#EB4034")),
    new PetalConfig("spore.explosion",960,1e3,4)
        .setSize(90)
        .setIgnoreWalls(1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .3).addAction("fill", "#4f412e")),
    new PetalConfig("mace.explosion",960,1e3,9)
        .setSize(90)
        .setIgnoreWalls(1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .3).addAction("fill", "#bcc7e1")),
    new PetalConfig("flea.explosion",960,1e3,9)
        .setSize(90)
        .setIgnoreWalls(1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .3).addAction("fill", "#a38b73")),
    new PetalConfig("mark.explosion",960,1e3,27)
        .setSize(90)
        .setIgnoreWalls(1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .3).addAction("fill", "#A51818")),
    new PetalConfig("pumpkin.explosion",960,1e3,20)
        .setSize(90)
        .setIgnoreWalls(1)
        .setMark(true)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .3).addAction("fill", "#EAD8B1")),
    new PetalConfig("portal.particle",960,1e3,0)
        .setIgnoreWalls(1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .5).addAction("fill", "#FFFFFF")),
    new PetalConfig("garden.particle",960,1e3,0)
        .setIgnoreWalls(1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .5).addAction("fill", "#2ec778")),
    new PetalConfig("anthell.particle",960,1e3,0)
        .setIgnoreWalls(1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .5).addAction("fill", "#bd8458")),
    new PetalConfig("ant.particle",960,1e3,0)
        .setIgnoreWalls(1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .5).addAction("fill", "#555555")),
    new PetalConfig("fireant.particle",960,1e3,0)
        .setIgnoreWalls(1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .5).addAction("fill", "#a82a01")),
    new PetalConfig("termite.particle",960,1e3,0)
        .setIgnoreWalls(1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .5).addAction("fill", "#d3a35b")),
    new PetalConfig("desert.particle",960,1e3,0)
        .setIgnoreWalls(1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .5).addAction("fill", "#ffeeca")),
    new PetalConfig("ocean.particle",960,1e3,0)
        .setIgnoreWalls(1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .5).addAction("fill", "#93c5e9")),
    new PetalConfig("darkforest.particle",960,1e3,0)
        .setIgnoreWalls(1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .5).addAction("fill", "#4d7e5c")),
    new PetalConfig("factory.particle",960,1e3,0)
        .setIgnoreWalls(1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .5).addAction("fill", "#a2b6ba")),
    new PetalConfig("hell.particle",960,1e3,0)
        .setIgnoreWalls(1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .5).addAction("fill", "#d1312f")),
    new PetalConfig("sewers.particle",960,1e3,0)
        .setIgnoreWalls(1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .5).addAction("fill", "#85380c")),
    new PetalConfig("rift.particle",960,1e3,0)
        .setIgnoreWalls(1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .5).addAction("fill", "#000000")),
    new PetalConfig("super.particle",960,1e3,0)
        .setIgnoreWalls(1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("opacity", .5).addAction("fill", "#2BFFA3")),
    new PetalConfig("dig.particle",960,1e3,0)
        .setIgnoreWalls(1)
        .setDescription("[object null object]")
        .setDrawing((new Drawing).addAction("beginPath").addAction("polygon", 4, 1, 0).addAction("opacity", .5).addAction("fill", "#795134"))

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