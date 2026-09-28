import { tiers as _tiers, Drawing, WEARABLES, PetalTier, MobTier, PetalConfig, MobDrop, MobConfig } from "../../lib/protocol.js";
import { DROP_TABLES } from "./dropTables.js";
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
    new PetalConfig("Stinger", 51.25, 1, 46)
        .setMulti([1, 1, 2, 2, 3, 3, 4, 4, 5, 5], 1, true)
        .setDescription("A fragile petal that deals lots of damage."),
    new PetalConfig("Rice", 0, .5, 5)
        .setSize(1.25)
        .setDescription("A bit weak, but recharges instantly."),
    new PetalConfig("Rock", 22.5 * 2, 65, 53)
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
    new PetalConfig("Wing", 22.5 * 1.25, 17, [17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 20, 21, 22])
        .setSize(1.3)
        .setWingMovement(true)
        .setDescription("It comes and it goes."),
    new PetalConfig("Bone", 22.5 * 1.5, [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 20], 18.25)
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
    new PetalConfig("Sand", 22.5 * .45, 5, 16)
        .setSize(.85)
        .setMulti(4, true)
        .setDescription("Some fine grains of sand. They recharge quickly and can pack a punch."),
    new PetalConfig("Orange", 22.5 * .75, 12.5, 7.5)
        .setMulti(3, true)
        .setDescription("A bunch of oranges. They're pretty juicy."),
    new PetalConfig("Missile", 7.5, 4, 18.5)
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
    new PetalConfig("Iris", 22.5 * 1, 10, [29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 49])
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
    new PetalConfig("Pincer", 8.5, 7.5, 14)
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
    new PetalConfig("Scorpion Missile.projectile", 22.5 * 100, 0.00001, 0.0000005)
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
    new PetalConfig("Lightning", 22.5 * 1, 1e-15, [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 17])
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
    new PetalConfig("Yucca", 22.5 * 1.5, 8, 15.5)
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
    new PetalConfig("Yggdrasil", 225, Infinity, 0)
        .setDeathDefying(.15, 2.5)
        .setHuddles(1)
        .setPhases(1)
        .setDescription("The tree of life. If you were to die with this petal alive, you'd be revived with a portion of your health."),
    new PetalConfig("Glass", 22.5 * 2, 1e-15, 22)
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
    new PetalConfig("Dice", 20.5, 5, [17.5, 17.5, 17.5, 17.5, 17.5, 17.5, 17.5, 17.5, 17.5, 17.5, 17.5, 17.5, 17.5, 23, 23, 25]).setIcon(1, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7], "Dice", 0).setMulti([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7], 1, true).setDiceAbility(0.05, 35).setSize(1.5).setDrawing(new Drawing().addAction("beginPath").addAction("polygon", 4, 1, 0).addAction("paint", "#FFFFFF", .2, .2).addAction("beginPath")
        .addAction("circle", 0, 0, 0).addAction("paint", "#FFFFFF", .275, .2).addAction("beginPath").addAction("circle", .4, 0, 0).addAction("paint", "#FFFFFF", .275, .2).addAction("beginPath").addAction("circle", 0, .4, 0).addAction("paint", "#FFFFFF", .275, .2).addAction("beginPath").addAction("circle", -.4, 0, 0).addAction("paint", "#FFFFFF", .275, .2).addAction("beginPath").addAction("circle", 0, -.4, 0).addAction("paint", "#FFFFFF", .275, .2)).setDescription("Has a 5% chance of dealing 35x damage. Criticals will only apply if the base dice damage is higher than the mob armor."),
    new PetalConfig("Fire Sand", 10.125, 5, 48).setIcon(0.575, [4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15], "Sand", 0).setSize(.85).setMulti([4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15], 1, true)
        .setDrawing(new Drawing().addAction("beginPath").addAction("polygon", 7, 1, 0).addAction("closePath").addAction("paint", "#e86d48", .445, .2)
        ).setDescription("Some fine grains of sand on fire. They deal 3x damage than normal sand."),
    new PetalConfig("Cinderbrick", 100.125, 5, 128).setIcon(1, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8], "Cinderbrick", 0).setSize(1.05).setMulti([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8], 1, true)
        .setDrawing(new Drawing().addAction("beginPath").addAction("dipPolygon", 5, 1, .4, 0).addAction("paint", "#c9b48c", .225, .2).addAction("beginPath").addAction("dipPolygon", 5, .5, .4, 180 * Math.PI / 180).addAction("fill", "#b4a27e")
        ).setDescription("A really hard piece of rock."),
    new PetalConfig("Rare Cactus", 25, 40, 40).setIcon(1, 1, "Cactus", 0).setSize(1.25).setExtraHealth(175).setDrawing(new Drawing()
        .addAction("beginPath").addAction("dipPolygon", 9, 1, 3, 0).addAction("closePath").addAction("paint", "#e6d450", .2, .2).addAction("beginPath").addAction("dipPolygon", 8, .525, 3, 0).addAction("closePath").addAction("paint", "#ede084", .15, 0).addAction("beginPath").addAction("circle", 0, 0, .3).addAction("closePath").addAction("fill", "#f8f4d3")
        ).setDescription("This shiny cactus will give you 5x extra health than normal cactus and his sharp thorns will deal massive damage."),
    new PetalConfig("Scorpion Egg", 45, 25, 1).setIcon(1, 1, "Egg", 0).setSize(1.5).setHuddles(1)
        .setDrawing(new Drawing().addAction("beginPath").addAction("ellipse", 0, 0, .775, 1, 0).addAction("paint", "#c69a2d", .2, .2).addAction("beginPath").addAction("ellipse", 0, 0, .4, .6, 0).addAction("fill", "#b28a28")
        ).setDescription("Where did you get this?"),
    new PetalConfig("Jellyfish Egg", 45, 25, 1).setIcon(1, 1, "Egg", 0).setSize(1.5).setHuddles(1)
        .setDrawing(new Drawing().addAction("beginPath").addAction("ellipse", 0, 0, .775, 1, 0).addAction("opacity", .4).addAction("fill", "#ffffff").addAction("opacity", .6).addAction("stroke", "#ffffff", .2, 0).addAction("closePath").addAction("beginPath").addAction("moveTo", 0, 0).addAction("circle", -.175, .4, .275).addAction("moveTo", 0, 0).addAction("circle", .3, 0, .225).addAction("moveTo", 0, 0).addAction("circle", -.25, -.25, .175).addAction("moveTo", 0, 0).addAction("circle", .125, -.55, .13).addAction("fill", "#ffffff").addAction("closePath")
        ).setDescription(["May be op idk.", "May be op idk.", "May be op idk.", "May be op idk.", "May be op idk.", "May be op idk.", "May be op idk.", "May be op idk.", "May be op idk.", "May be op idk.", "May be op idk.", "May be op idk.", "Dude how"]),
    new PetalConfig("Ruby", 22.5, 5, 17.5).setSize(1.5)
        .setTierRubyAbility(7)
        .SummonLifetime(10 * 1000)
        .MinimumSummonRarity(5, 7)
        .SummonRarity(6, 7)
        .SummonRarity(7, 7)
        .SummonRarity(8, 7)
        .SummonRarity(9, 8)
        .MaximumSummonRarity(10, 8)
        .endTierRubyAbility()
        .setTierRubyAbility(8)
        .SummonLifetime(11 * 1000)
        .MinimumSummonRarity(8, 8)
        .SummonRarity(9, 8)
        .SummonRarity(10, 8)
        .SummonRarity(11, 9)
        .SummonRarity(12, 9)
        .MaximumSummonRarity(13, 9)
        .endTierRubyAbility()
        .setTierRubyAbility(9)
        .SummonLifetime(20 * 1000)
        .MinimumSummonRarity(10, 9)
        .SummonRarity(11, 9)
        .SummonRarity(12, 9)
        .SummonRarity(13, 9)
        .SummonRarity(14, 10)
        .MaximumSummonRarity(15, 10)
        .endTierRubyAbility()
        .setTierRubyAbility(10)
        .SummonLifetime(40 * 1000)
        .MinimumSummonRarity(13, 10)
        .SummonRarity(14, 10)
        .SummonRarity(15, 11)
        .SummonRarity(16, 11)
        .MaximumSummonRarity(17, 11)
        .endTierRubyAbility()
        .setTierRubyAbility(11)
        .SummonLifetime(60 * 1000)
        .MinimumSummonRarity(14, 11)
        .SummonRarity(15, 11)
        .SummonRarity(16, 12)
        .SummonRarity(17, 12)
        .MaximumSummonRarity(18, 12)
        .endTierRubyAbility()
        .setTierRubyAbility(12)
        .SummonLifetime(70 * 1000)
        .MinimumSummonRarity(15, 12)
        .SummonRarity(16, 12)
        .SummonRarity(17, 12)
        .SummonRarity(18, 13)
        .SummonRarity(19, 13)
        .MaximumSummonRarity(20, 13)
        .endTierRubyAbility()
        .setTierRubyAbility(13)
        .SummonLifetime(80 * 1000)
        .MinimumSummonRarity(17, 13)
        .SummonRarity(18, 13)
        .SummonRarity(19, 14)
        .SummonRarity(20, 14)
        .MaximumSummonRarity(21, 14)
        .endTierRubyAbility()
        .setTierRubyAbility(14)
        .SummonLifetime(90 * 1000)
        .MinimumSummonRarity(19, 14)
        .SummonRarity(20, 14)
        .SummonRarity(21, 15)
        .SummonRarity(22, 15)
        .MaximumSummonRarity(23, 15)
        .endTierRubyAbility()
        .setTierRubyAbility(15)
        .SummonLifetime(100 * 1000)
        .MinimumSummonRarity(21, 15)
        .SummonRarity(22, 15)
        .SummonRarity(23, 16)
        .SummonRarity(24, 16)
        .MaximumSummonRarity(25, 16)
        .endTierRubyAbility()
        .setTierRubyAbility(16)
        .SummonLifetime(105 * 1000)
        .MinimumSummonRarity(22, 16)
        .SummonRarity(23, 16)
        .SummonRarity(24, 16)
        .SummonRarity(25, 17)
        .MaximumSummonRarity(26, 17)
        .endTierRubyAbility()
        .setTierRubyAbility(17)
        .SummonLifetime(110 * 1000)
        .MinimumSummonRarity(24, 17)
        .SummonRarity(25, 17)
        .SummonRarity(26, 17)
        .SummonRarity(27, 18)
        .MaximumSummonRarity(28, 18)
        .endTierRubyAbility()
        .setDrawing(new Drawing().addAction("rotate", 45).addAction("beginPath").addAction("polygon", 3, 1, 0).addAction("paint", "#e85a5a", .3, .2).addAction("dipPolygon", 3, .3, 1.1, 0).addAction("fill", "#f3acac").addAction("closePath")
        ).setDescription(["How did you get this?", "How did you get this?", "How did you get this?", "How did you get this?", "How did you get this?", "How did you get this?", "How did you get this?", "Turns everything you kill into summons with the power of friendship. Check /info\nMobs below Mythic dont get converted to summons at all.\nMobs below Omega get converted into Super summons.\nMobs above Ancient get converted into Ancient summons.\nSummons Lifetime: 10s"
        , "Turns everything you kill into summons with the power of friendship. Check /info\nMobs below Ancient dont get converted to summons at all.\nMobs below Unique get converted into Ancient summons.\nMobs above Eternal get converted into Omega summons.\nSummons Lifetime: 11s"
        , "Turns everything you kill into summons with the power of friendship. Check /info\nMobs below Eternal dont get converted to summons at all.\nMobs below Millom get converted into Omega summons.\nMobs above Galaxium get converted into Eternal summons.\nSummons Lifetime: 20s"
        , "Turns everything you kill into summons with the power of friendship. Check /info\nMobs below Galaxium dont get converted to summons at all.\nMobs below Fictional get converted into Eternal summons.\nMobs above Millom get converted into Unique summons.\nSummons Lifetime: 40s"
        , "Turns everything you kill into summons with the power of friendship. Check /info\nMobs below Millom dont get converted to summons at all.\nMobs below Transcestrial get converted into Unique summons.\nMobs above Fictional get converted into Hyper summons.\nSummons Lifetime: 60s"
        , "Turns everything you kill into summons with the power of friendship. Check /info\nMobs below Fictional dont get converted to summons at all.\nMobs below Absiorcadinary get converted into Hyper summons.\nMobs above Chaos get converted into Galaxium summons.\nSummons Lifetime: 70s"
        , "Turns everything you kill into summons with the power of friendship. Check /info\nMobs below Chaos dont get converted to summons at all.\nMobs below Absolute Fictional get converted into Galaxium summons.\nMobs above Absiorcadinary get converted into Millom summons.\nSummons Lifetime: 80s"
        , "Turns everything you kill into summons with the power of friendship. Check /info\nMobs below Absolute Fictional dont get converted to summons at all.\nMobs below Hyperfixation get converted into Millom summons.\nMobs above Nullified get converted into Fictional summons.\nSummons Lifetime: 90s"
        , "Turns everything you kill into summons with the power of friendship. Check /info\nMobs below Hyperfixation dont get converted to summons at all.\nMobs below Alpha get converted into Fictional summons.\nMobs above Atlantical get converted into Transcestrial summons.\nSummons Lifetime: 100s"
        , "Turns everything you kill into summons with the power of friendship. Check /info\nMobs below Atlantical dont get converted to summons at all.\nMobs below Epsilation get converted into Transcestrial summons.\nMobs above Finalist get converted into Chaos summons.\nSummons Lifetime: 105s"
        , "Turns everything you kill into summons with the power of friendship. Check /info\nMobs below Finalist dont get converted to summons at all.\nMobs below Izolational get converted into Chaos summons.\nMobs above Improbable get converted into Absiorcadinary summons.\nSummons Lifetime: 110s"
        ]),
    new PetalConfig("Emerald", 675, 1, 0.01).setSize(1.5)
        .setEmeraldAbility(30000, 10)
        .setTierEmeraldAbility(7)
        .MinimumMobRarity(5)
        .MaximumMobRarity(10)
        .endTierEmeraldAbility()
        .setTierEmeraldAbility(8)
        .MinimumMobRarity(7)
        .MaximumMobRarity(12)
        .endTierEmeraldAbility()
        .setTierEmeraldAbility(9)
        .MinimumMobRarity(9)
        .MaximumMobRarity(15)
        .endTierEmeraldAbility()
        .setTierEmeraldAbility(10)
        .MinimumMobRarity(12)
        .MaximumMobRarity(17)
        .endTierEmeraldAbility()
        .setTierEmeraldAbility(11)
        .MinimumMobRarity(13)
        .MaximumMobRarity(19)
        .endTierEmeraldAbility()
        .setTierEmeraldAbility(12)
        .MinimumMobRarity(15)
        .MaximumMobRarity(21)
        .endTierEmeraldAbility()
        .setTierEmeraldAbility(13)
        .MinimumMobRarity(18)
        .MaximumMobRarity(23)
        .endTierEmeraldAbility()
        .setTierEmeraldAbility(14)
        .MinimumMobRarity(20)
        .MaximumMobRarity(25)
        .endTierEmeraldAbility()
        .setTierEmeraldAbility(15)
        .MinimumMobRarity(23)
        .MaximumMobRarity(27)
        .endTierEmeraldAbility()
        .setTierEmeraldAbility(16)
        .MinimumMobRarity(25)
        .MaximumMobRarity(29)
        .endTierEmeraldAbility()
        .setDrawing(new Drawing().addAction("beginPath").addAction("polygon", 5, 1, 0).addAction("paint", "#76de82", .3, .2).addAction("dipPolygon", 5, .4, 10, 0).addAction("fill", "#baeec0").addAction("closePath")
        ).setDescription(["How did you get this?", "How did you get this?", "How did you get this?", "How did you get this?", "How did you get this?", "How did you get this?", "How did you get this?", "Dupes mobs, pretty magical if you ask me. Check /info\nMinimum mob rarity required: Mythic\nMaximum mob rarity (capped): Eternal"
        , "Dupes mobs, pretty magical if you ask me. Check /info\nMinimum mob rarity required: Super\nMaximum mob rarity (capped): Hyper"
        , "Dupes mobs, pretty magical if you ask me. Check /info\nMinimum mob rarity required: Omega\nMaximum mob rarity (capped): Fictional"
        , "Dupes mobs, pretty magical if you ask me. Check /info\nMinimum mob rarity required: Hyper\nMaximum mob rarity (capped): Chaos"
        , "Dupes mobs, pretty magical if you ask me. Check /info\nMinimum mob rarity required: Galaxium\nMaximum mob rarity (capped): Absolute Fictional"
        , "Dupes mobs, pretty magical if you ask me. Check /info\nMinimum mob rarity required: Fictional\nMaximum mob rarity (capped): Hyperfixation"
        , "Dupes mobs, pretty magical if you ask me. Check /info\nMinimum mob rarity required: Absiorcadinary\nMaximum mob rarity (capped): Alpha"
        , "Dupes mobs, pretty magical if you ask me. Check /info\nMinimum mob rarity required: Nullified\nMaximum mob rarity (capped): Epsilation"
        , "Dupes mobs, pretty magical if you ask me. Check /info\nMinimum mob rarity required: Alpha\nMaximum mob rarity (capped): Izolational"
        , "Dupes mobs, pretty magical if you ask me. Check /info\nMinimum mob rarity required: Epsilation\nMaximum mob rarity (capped): Multiversal"
        ]),
    new PetalConfig("Diamond", 60, 1, 9).setSize(1.5)
        .setDrawing(new Drawing().addAction("beginPath").addAction("polygon", 4, 1, 0).addAction("paint", "#78cdff", .3, .2).addAction("dipPolygon", 4, .4, 7.2, 0).addAction("fill", "#bbe6ff").addAction("closePath")
        ).setDescription(["How did you get this?", "How did you get this?", "How did you get this?", "How did you get this?", "How did you get this?", "How did you get this?", "How did you get this?", "Reduces incoming damage. Note: Does not reduce poison or lightning damage. Check /info\nDamage Reduction: 5%", "Reduces incoming damage. Note: Does not reduce poison or lightning damage. Check /info\nDamage Reduction: 8%", "Reduces incoming damage. Note: Does not reduce poison or lightning damage. Check /info\nDamage Reduction: 12%", "Reduces incoming damage. Note: Does not reduce poison or lightning damage. Check /info\nDamage Reduction: 15%", "Reduces incoming damage. Note: Does not reduce poison or lightning damage. Check /info\nDamage Reduction: 18%", "Reduces incoming damage. Note: Does not reduce poison or lightning damage. Check /info\nDamage Reduction: 21%", "Reduces incoming damage. Note: Does not reduce poison or lightning damage. Check /info\nDamage Reduction: 24%", "Reduces incoming damage. Note: Does not reduce poison or lightning damage. Check /info\nDamage Reduction: 27%", "Reduces incoming damage. Note: Does not reduce poison or lightning damage. Check /info\nDamage Reduction: 30%", "Reduces incoming damage. Note: Does not reduce poison or lightning damage. Check /info\nDamage Reduction: 33%", "Reduces incoming damage. Note: Does not reduce poison or lightning damage. Check /info\nDamage Reduction: 36%", "Reduces incoming damage. Note: Does not reduce poison or lightning damage. Check /info\nDamage Reduction: undefined%"]),
    new PetalConfig("Coin", 30, 5, 16.85).setSize(1.5)
        .setDrawing(new Drawing()
        .addAction("beginPath")
        .addAction("circle", 0, 0, 1).addAction("fill", "#C69B2E").addAction("stroke", "#F5bF39", .2, 0).addAction("beginPath").addAction("arc", 0, 0, .4, Math.PI / 4, Math.PI * 1.8).addAction("stroke", "#FFE783", .25, 0).addAction("beginPath").addAction("line", .05, .4, -.1, .6).addAction("line", -.05, -.4, .1, -.6).addAction("stroke", "#FFE783", .2, 0).addAction("closePath")
        ).setDescription("Coin."),
    new PetalConfig("Blood Light", 10.155, 20, 52).setIcon(.6, [1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 15], "Light", 0).setBloodLight(0.01).setMulti([1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 15], 0, true)
        .setDrawing(new Drawing().addAction("beginPath").addAction("circle", 0, 0, 1).addAction("closePath").addAction("paint", "#a82f2f", .4, .2)
        ).setDescription(["Deals high damage but with the cost of dealing damage to the player. Check /petalinfo [rarity] bloodlight\nSelf Damage: 0.05", "Deals high damage but with the cost of dealing damage to the player. Check /petalinfo [rarity] bloodlight\nSelf Damage: 0.31", "Deals high damage but with the cost of dealing damage to the player. Check /petalinfo [rarity] bloodlight\nSelf Damage: 1.04", "Deals high damage but with the cost of dealing damage to the player. Check /petalinfo [rarity] bloodlight\nSelf Damage: 3.33", "Deals high damage but with the cost of dealing damage to the player. Check /petalinfo [rarity] bloodlight\nSelf Damage: 8.32", "Deals high damage but with the cost of dealing damage to the player. Check /petalinfo [rarity] bloodlight\nSelf Damage: 33.28", "Deals high damage but with the cost of dealing damage to the player. Check /petalinfo [rarity] bloodlight\nSelf Damage: 249.6", "Deals high damage but with the cost of dealing damage to the player. Check /petalinfo [rarity] bloodlight\nSelf Damage: 1.25k", "Deals high damage but with the cost of dealing damage to the player. Check /petalinfo [rarity] bloodlight\nSelf Damage: 10.48k", "Deals high damage but with the cost of dealing damage to the player. Check /petalinfo [rarity] bloodlight\nSelf Damage: 53.91k", "Deals high damage but with the cost of dealing damage to the player. Check /petalinfo [rarity] bloodlight\nSelf Damage: 431.31k", "Deals high damage but with the cost of dealing damage to the player. Check /petalinfo [rarity] bloodlight\nSelf Damage: 2.59m", "Deals high damage but with the cost of dealing damage to the player. Check /petalinfo [rarity] bloodlight\nSelf Damage: 38.82m", "Deals high damage but with the cost of dealing damage to the player. Check /petalinfo [rarity] bloodlight\nSelf Damage: 139.74m", "Deals high damage but with the cost of dealing damage to the player. Check /petalinfo [rarity] bloodlight\nSelf Damage: 1.4b", "Deals high damage but with the cost of dealing damage to the player. Check /petalinfo [rarity] bloodlight\nSelf Damage: 8.38b"]),
    new PetalConfig("Fire Missile", 15.5, 6, 150.5).setIcon(1, 1, "Missile", -45).setLaunchable(.7, 45).setSize([1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.6, 2.8, 3]).setPoison(41.5, 5).setMulti([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8], 0, true)
        .setDrawing(new Drawing().addAction("beginPath").addAction("moveTo", 1 * .8, 0).addAction("lineTo", -.9 * .8, -.667 * .8).addAction("lineTo", -.9 * .8, .667 * .8).addAction("closePath").addAction("paint", "#862100", .6, 0)
        ).setDescription("You can actually shoot this one and now with an extra ingredient: poison!"),
    new PetalConfig("Shovel", 30, 1, 1).setIcon(.8, 1, "Shovel", -45).setSize(1.6)
        .setDrawing(new Drawing().addAction("beginPath").addAction("line", -.65, 0, 1, 0).addAction("stroke", "#614c39", .225, 0).addAction("beginPath").addAction("moveTo", .6, .65).addAction("lineTo", .6, -.65).addAction("lineTo", 1.35, -.55).addAction("lineTo", 1.7, -.15).addAction("lineTo", 1.7, .15).addAction("lineTo", 1.35, .55).addAction("lineTo", .6, .65).addAction("closePath").addAction("paint", "#c7ccd1", .225, .2).addAction("beginPath").addAction("moveTo", .6, -.1).addAction("lineTo", 1.2, 0).addAction("lineTo", .6, .1).addAction("closePath").addAction("fill", "#9fa3a7").addAction("beginPath").addAction("moveTo", -1.2, .35).addAction("lineTo", -1, .35).addAction("quadraticCurveTo", -.35, 0, -1, -.35).addAction("lineTo", -1.2, -.35).addAction("closePath").addAction("stroke", "#4a3f35", .252, 0)
        ).setDescription("Disables colliding with mobs for 5s, cooldown of 70s after using. Note: Renders kind of broken and buggy but main logic actually works."),
    new PetalConfig("Blood Leaf", 12.5, 18, 35.5).setSize(2).setIcon(1, 1, "Leaf", 0)
        .setTierMinimumMobRarityForBloodLeafDamage(0, 0)
        .setTierMinimumMobRarityForBloodLeafDamage(1, 0)
        .setTierMinimumMobRarityForBloodLeafDamage(2, 0)
        .setTierMinimumMobRarityForBloodLeafDamage(3, 0)
        .setTierMinimumMobRarityForBloodLeafDamage(4, 1)
        .setTierMinimumMobRarityForBloodLeafDamage(5, 2)
        .setTierMinimumMobRarityForBloodLeafDamage(6, 3)
        .setTierMinimumMobRarityForBloodLeafDamage(7, 5)
        .setTierMinimumMobRarityForBloodLeafDamage(8, 7)
        .setTierMinimumMobRarityForBloodLeafDamage(9, 9)
        .setTierMinimumMobRarityForBloodLeafDamage(10, 10)
        .setTierMinimumMobRarityForBloodLeafDamage(11, 11)
        .setTierMinimumMobRarityForBloodLeafDamage(12, 13)
        .setTierMinimumMobRarityForBloodLeafDamage(13, 14)
        .setTierMinimumMobRarityForBloodLeafDamage(14, 16)
        .setTierMinimumMobRarityForBloodLeafDamage(15, 18)
        .setTierMinimumMobRarityForBloodLeafDamage(16, 20)
        .setTierMinimumMobRarityForBloodLeafDamage(17, 22)
        .setDrawing(new Drawing().addAction("beginPath").addAction("moveTo", -.531, .801).addAction("lineTo", -.634, .534).addAction("lineTo", -.688, .286).addAction("lineTo", -.692, .057).addAction("lineTo", -.647, -.153).addAction("lineTo", -.552, -.343).addAction("lineTo", -.408, -.514).addAction("lineTo", -.214, -.665).addAction("lineTo", .030, -.798).addAction("lineTo", .323, -.911).addAction("lineTo", .666, -1.005).addAction("lineTo", .713, -.653).addAction("lineTo", .723, -.338).addAction("lineTo", .696, -.062).addAction("lineTo", .586, .280).addAction("lineTo", .393, .537).addAction("lineTo", .116, .707).addAction("lineTo", -.245, .792).addAction("lineTo", -.531, .801).addAction("paint", "#e03f3f", .2, .2).addAction("closePath").addAction("beginPath").addAction("moveTo", -.558, .842).addAction("lineTo", -.727, 1.096).addAction("stroke", "#e03f3f", .2, .2).addAction("closePath").addAction("beginPath").addAction("moveTo", -.272, .410).addAction("lineTo", -.221, .302).addAction("lineTo", -.167, .198).addAction("lineTo", -.110, .095).addAction("lineTo", -.051, -.005).addAction("lineTo", .012, -.102).addAction("lineTo", .077, -.197).addAction("lineTo", .145, -.289).addAction("lineTo", .215, -.379).addAction("lineTo", .289, -.466).addAction("lineTo", .365, -.551).addAction("stroke", "#e03f3f", .2, .2).addAction("closePath")
        ).setDescription("Each kill with this petal equipped gives extra damage bonus, resets when dying. Check /petalinfo [rarity] bloodleaf"),
    new PetalConfig("Shiny Wing", 7.125, 22, 34).setIcon(1, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7], "Wing", 0).setMulti([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7], 1, true).setSize([1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.6, 2.8, 3]).setWingMovement(true).setSize(2.4)
        .setDrawing(new Drawing().addAction("rotate", 45).addAction("beginPath").addAction("arc", 0, 0, 1, -0.63, 3.7699111843077517).addAction("quadraticCurveTo", 0, .6, .77, -.63).addAction("closePath").addAction("paint", "#fff991", .2, .2)).setDescription("It comes and it goes, bonus damage depending on how fast its going, check /petalinfo [rarity] shinywing"),
    new PetalConfig("Uranium", 225, 1, 9)
        .setSize(1.5)
        .setTierUraniumAbility(7)
        .setUraniumAbility(7 * 1000, 1000)
        .setMinimumMobForUraniumAbility(5)
        .setMaximumMobForUraniumAbility(12)
        .setEndTierUraniumAbility()
        .setTierUraniumAbility(8)
        .setUraniumAbility(7.5 * 1000, 1000)
        .setMinimumMobForUraniumAbility(7)
        .setMaximumMobForUraniumAbility(13)
        .setEndTierUraniumAbility()
        .setTierUraniumAbility(9)
        .setUraniumAbility(8 * 1000, 1000)
        .setMinimumMobForUraniumAbility(8)
        .setMaximumMobForUraniumAbility(14)
        .setEndTierUraniumAbility()
        .setTierUraniumAbility(10)
        .setUraniumAbility(8.5 * 1000, 1000)
        .setMinimumMobForUraniumAbility(10)
        .setMaximumMobForUraniumAbility(18)
        .setEndTierUraniumAbility()
        .setTierUraniumAbility(11)
        .setUraniumAbility(9 * 1000, 1000)
        .setMinimumMobForUraniumAbility(12)
        .setMaximumMobForUraniumAbility(20)
        .setEndTierUraniumAbility()
        .setTierUraniumAbility(12)
        .setUraniumAbility(9.5 * 1000, 1000)
        .setMinimumMobForUraniumAbility(14)
        .setMaximumMobForUraniumAbility(22)
        .setEndTierUraniumAbility()
        .setTierUraniumAbility(13)
        .setUraniumAbility(10 * 1000, 1000)
        .setMinimumMobForUraniumAbility(16)
        .setMaximumMobForUraniumAbility(24)
        .setEndTierUraniumAbility()
        .setTierUraniumAbility(14)
        .setUraniumAbility(10.5 * 1000, 1000)
        .setMinimumMobForUraniumAbility(18)
        .setMaximumMobForUraniumAbility(26)
        .setEndTierUraniumAbility()
        .setTierUraniumAbility(15)
        .setUraniumAbility(11 * 1000, 1000)
        .setMinimumMobForUraniumAbility(19)
        .setMaximumMobForUraniumAbility(28)
        .setEndTierUraniumAbility()
        .setDrawing(new Drawing()
        .addAction("beginPath")
        .addAction("polygon", 6, 0.85, 9.2)
        .addAction("fill", "#d6fc97")
        .addAction("stroke", "#a6cf65", 0.35, 0)
        .addAction("closePath")
        )
        .setDescription(["How did you get this?", "How did you get this?", "How did you get this?", "How did you get this?", "How did you get this?", "How did you get this?", "How did you get this?", "Freezes mobs and stops them from firing projectiles for an amount of time. Check /info\nFreeze duration: 7s\nMinimum mob rarity required: Mythic\nMaximum mob rarity (if above no freeze): Hyper",
        "Freezes mobs and stops them from firing projectiles for an amount of time. Check /info\nFreeze duration: 7.5s\nMinimum mob rarity required: Super\nMaximum mob rarity (if above no freeze): Galaxium",
        "Freezes mobs and stops them from firing projectiles for an amount of time. Check /info\nFreeze duration: 8s\nMinimum mob rarity required: Ancient\nMaximum mob rarity (if above no freeze): Millom",
        "Freezes mobs and stops them from firing projectiles for an amount of time. Check /info\nFreeze duration: 8.5s\nMinimum mob rarity required: Eternal\nMaximum mob rarity (if above no freeze): Absiorcadinary",
        "Freezes mobs and stops them from firing projectiles for an amount of time. Check /info\nFreeze duration: 9s\nMinimum mob rarity required: Hyper\nMaximum mob rarity (if above no freeze): Nullified",
        "Freezes mobs and stops them from firing projectiles for an amount of time. Check /info\nFreeze duration: 9.5s\nMinimum mob rarity required: Millom\nMaximum mob rarity (if above no freeze): Atlantical",
        "Freezes mobs and stops them from firing projectiles for an amount of time. Check /info\nFreeze duration: 10s\nMinimum mob rarity required: Transcestrial\nMaximum mob rarity (if above no freeze): Finalist",
        "Freezes mobs and stops them from firing projectiles for an amount of time. Check /info\nFreeze duration: 10.5s\nMinimum mob rarity required: Absiorcadinary\nMaximum mob rarity (if above no freeze): Improbable",
        "Freezes mobs and stops them from firing projectiles for an amount of time. Check /info\nFreeze duration: 11s\nMinimum mob rarity required: Absolute Fictional\nMaximum mob rarity (if above no freeze): Chronodynamic",
        ]),
    new PetalConfig("Clover", 52, 11, 11)
        .setTierCloverAbility(5)
        .setCloverChance(0.001)
        .endTierCloverAbility()
        .setTierCloverAbility(6)
        .setCloverChance(0.005)
        .endTierCloverAbility()
        .setTierCloverAbility(7)
        .setCloverChance(0.01)
        .endTierCloverAbility()
        .setTierCloverAbility(8)
        .setCloverChance(0.0125)
        .endTierCloverAbility()
        .setTierCloverAbility(9)
        .setCloverChance(0.0150)
        .endTierCloverAbility()
        .setTierCloverAbility(10)
        .setCloverChance(0.0175)
        .endTierCloverAbility()
        .setTierCloverAbility(11)
        .setCloverChance(0.02)
        .endTierCloverAbility()
        .setTierCloverAbility(12)
        .setCloverChance(0.0225)
        .endTierCloverAbility()
        .setTierCloverAbility(13)
        .setCloverChance(0.0250)
        .endTierCloverAbility()
        .setTierCloverAbility(14)
        .setCloverChance(0.0275)
        .endTierCloverAbility()
        .setTierCloverAbility(15)
        .setCloverChance(0.03)
        .endTierCloverAbility()
        .setTierCloverAbility(16)
        .setCloverChance(0.0325)
        .endTierCloverAbility()
        .setTierCloverAbility(17)
        .setCloverChance(0.0350)
        .endTierCloverAbility()
        .setTierCloverAbility(18)
        .setCloverChance(0.0375)
        .endTierCloverAbility()
        .setTierCloverAbility(19)
        .setCloverChance(0.04)
        .endTierCloverAbility()
        .setTierCloverAbility(20)
        .setCloverChance(0.0425)
        .endTierCloverAbility()
        .setTierCloverAbility(21)
        .setCloverChance(0.0450)
        .endTierCloverAbility()
        .setTierCloverAbility(22)
        .setCloverChance(0.0475)
        .endTierCloverAbility()
        .setTierCloverAbility(23)
        .setCloverChance(0.05)
        .endTierCloverAbility()
        .setTierCloverAbility(24)
        .setCloverChance(0.0525)
        .endTierCloverAbility()
        .setTierCloverAbility(25)
        .setCloverChance(0.0550)
        .endTierCloverAbility()
        .setTierCloverAbility(26)
        .setCloverChance(0.0575)
        .endTierCloverAbility()
        .setTierCloverAbility(27)
        .setCloverChance(0.06)
        .endTierCloverAbility()
        .setTierCloverAbility(28)
        .setCloverChance(0.08)
        .endTierCloverAbility()
        .setTierCloverAbility(29)
        .setCloverChance(0.1)
        .endTierCloverAbility()
        .setDrawing(new Drawing().addAction("rotate", 15).addAction("beginPath").addAction("moveTo", 0, 0).addAction("quadraticCurveTo", .825, -.56, 1, -.225).addAction("quadraticCurveTo", 1.105, 0, 1, .225).addAction("quadraticCurveTo", .825, .56, 0, 0).addAction("rotate", 360 / 6).addAction("moveTo", 0, 0).addAction("quadraticCurveTo", .825, -.56, 1, -.225).addAction("quadraticCurveTo", 1.105, 0, 1, .225).addAction("quadraticCurveTo", .825, .56, 0, 0).addAction("rotate", 360 / 6).addAction("moveTo", 0, 0).addAction("quadraticCurveTo", .825, -.56, 1, -.225).addAction("quadraticCurveTo", 1.105, 0, 1, .225).addAction("quadraticCurveTo", .825, .56, 0, 0).addAction("rotate", 360 / 6).addAction("moveTo", 0, 0).addAction("quadraticCurveTo", .825, -.56, 1, -.225).addAction("quadraticCurveTo", 1.105, 0, 1, .225).addAction("quadraticCurveTo", .825, .56, 0, 0).addAction("rotate", 360 / 6).addAction("moveTo", 0, 0).addAction("quadraticCurveTo", .825, -.56, 1, -.225).addAction("quadraticCurveTo", 1.105, 0, 1, .225).addAction("quadraticCurveTo", .825, .56, 0, 0).addAction("rotate", 360 / 6).addAction("moveTo", 0, 0).addAction("quadraticCurveTo", .825, -.56, 1, -.225).addAction("quadraticCurveTo", 1.105, 0, 1, .225).addAction("quadraticCurveTo", .825, .56, 0, 0).addAction("rotate", 360 / 6).addAction("paint", "#3AB54A", .225, .2).addAction("closePath")
        ).setDescription(["How did you get this?", "How did you get this?", "How did you get this?", "How did you get this?", "How did you get this?", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 0.1%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 0.5%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 1%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 1.25%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 1.5%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 1.75%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 2%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 2.25%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 2.5%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 2.75%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 3%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 3.25%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 3.5%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 3.75%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 4%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 4.25%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 4.5%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 4.75%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 5%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 5.25%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 5.5%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 5.75%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 6%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 8%", "Has a chance of duping when collecting drops if this petal is on main slots. Does not stack. Check /petalinfo [rarity] clover\nDupe chance: 10%"]),
    new PetalConfig("Rock.projectile", 2250, 0.0000001, 0.00000005)
        .setDrawing(new Drawing()
        .addAction("beginPath")
        .addAction("polygon", 5, 1, 3.2)
        .addAction("fill", "#707070")
        .addAction("stroke", "#525252", 0.2, 0)
        .addAction("closePath")
        ).setDescription("[object null object]"),
    new PetalConfig("Pomegranate", 10.125, 6, [44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 54]).setIcon(.85, 1, "Pomegranate", -45).setSize(1.25).setPomegranate(0.005)
        .setDrawing(new Drawing().addAction("beginPath").addAction("circle", .75, 0, .75).addAction("paint", "#e52669", .25, .2).addAction("beginPath").addAction("circle", 0, .75, .75).addAction("paint", "#e52669", .25, .2).addAction("beginPath").addAction("circle", -.75, 0, .75).addAction("paint", "#e52669", .25, .2).addAction("beginPath").addAction("circle", 0, -.75, .75).addAction("paint", "#e52669", .25, .2)
        ).setDescription("A deadly 4 in 1 deal. Check /petalinfo [rarity] pomegranate"),
    new PetalConfig("projectile.pomegranate", 2250, 6, [44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 54]).setPomegranate(0.005)
        .setDrawing(new Drawing()
        .addAction("beginPath")
        .addAction("circle", 0, 0, 0.80)
        .addAction("fill", "#cf235f")
        .addAction("closePath")
        .addAction("beginPath")
        .addAction("circle", 0, 0, 0.50)
        .addAction("fill", "#ff2b75")
        .addAction("closePath")
        ).setDescription("[object null object]"),
    new PetalConfig("ӇЄҲƛƓƠƝ", 225, 6, 44)
        .setDrawing(new Drawing()
        .addAction("opacity", 1)
        .addAction("beginPath")
        .addAction("polygon", 6, 1.1, 1)
        .addAction("fill", "#c73626")
        .addAction("stroke", "#853d35", 0.2, 0)
        .addAction("closePath")
        .addAction("beginPath")
        .addAction("opacity", 0.5)
        .addAction("polygon", 6, 1.2, 1)
        .addAction("fill", "#c73626")
        .addAction("stroke", "#853d35", 0.2, 0)
        .addAction("closePath")
        ).setDescription("ƬƦƠƤӇƳ ƤЄƬƛԼ."),
    new PetalConfig("Fiberglass", 25, 6, 28).setPhases(1)
        .setDrawing(new Drawing().addAction("beginPath").addAction("dipPolygon", 7, 1, -1, 0).addAction("paint", "#a7b9d1", .225, .2).addAction("beginPath").addAction("dipPolygon", 7, .5, -1, 180 * Math.PI / 180).addAction("fill", "#bdcadc").addAction("rotate", 20).addAction("beginPath").addAction("circle", 0.4, 0, .275).addAction("fill", "#bdcadc").addAction("rotate", 125).addAction("beginPath").addAction("circle", 0.4, 0, .25).addAction("fill", "#bdcadc").addAction("rotate", 125).addAction("beginPath").addAction("circle", 0.4, 0, .3).addAction("fill", "#bdcadc").addAction("beginPath").addAction("dipPolygon", 12, .6, 7, 0).addAction("fill", "#bdcadc")
        ).setDescription("Fiber?"),
    new PetalConfig("Fiberglass.projectile", 25, 6, 28)
        .setDrawing(new Drawing().addAction("beginPath").addAction("dipPolygon", 7, 1, .8, 0).addAction("paint", "#a7b9d1", .225, .2).addAction("beginPath").addAction("dipPolygon", 10, .6, 5, 0).addAction("fill", "#bdcadc").addAction("beginPath").addAction("dipPolygon", 10, .25, -5, 0).addAction("fill", "#a7b9d1")
        ).setDescription("[object null object]"),
    new PetalConfig("Resin", 185, 6, 30).setSize(1.1).setEnemySpeedMultiplier(.45, 5)
        .setDrawing(new Drawing().addAction("opacity", .45).addAction("beginPath").addAction("dipPolygon", 5, 1, -1.3, 0).addAction("fill", "#fcebff").addAction("opacity", 1).addAction("stroke", "#fcebff", .2, 0).addAction("opacity", .6).addAction("beginPath").addAction("dipPolygon", 5, .45, -1.6, Math.PI).addAction("fill", "#fcebff")
        ).setDescription("It's sticky and will slow your enemies down. Each resin projectile collision with a mob has a 0.01% chance of temporary pacifying for 5 minutes that mob."),
    new PetalConfig("Resin.projectile", 2250, 1e5, 15).setSize(35).setEnemySpeedMultiplier(.334, .05).setIgnoreWalls(1).setPacifyAbility(0.0001)
        .setDrawing(new Drawing().addAction("opacity", .45).addAction("beginPath").addAction("dipPolygon", 5, 1, -1.3, 0).addAction("fill", "#fcebff").addAction("opacity", 1).addAction("stroke", "#fcebff", .2, 0).addAction("opacity", .6).addAction("beginPath").addAction("dipPolygon", 5, .45, -1.6, Math.PI).addAction("fill", "#fcebff")
        ).setDescription("[object null object]"),
    new PetalConfig("Thorn", 25, 80, [60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 114]).setSize(1.1).setIcon(1, 1, "Thorn", -45).setLaunchable(.7, 45).setSize(1.35)
        .setDrawing(new Drawing().addAction("beginPath").addAction("moveTo", 1 * .8, 0).addAction("lineTo", -.9 * .8, -.667 * .8).addAction("lineTo", -.9 * .8, .667 * .8).addAction("closePath").addAction("paint", "#91775a", .6, 0)
        ).setDescription("Spiky."),
    new PetalConfig("Thorn.projectile", 25, 0.0000000005, 0.0000000005).setSize(1.35).setLaunchable(.7, 45)
        .setDrawing(new Drawing().addAction("beginPath").addAction("moveTo", 1 * .8, 0).addAction("lineTo", -.9 * .8, -.667 * .8).addAction("lineTo", -.9 * .8, .667 * .8).addAction("closePath").addAction("paint", "#91775a", .6, 0)
        ).setDescription("[object null object]"),
    new PetalConfig("Lilypad", 225, 6, 44)
        .setDrawing(new Drawing().addAction("beginPath").addAction("moveTo", 0, 0).addAction("arc", 0, 0, 1, Math.PI * 1 / 4, Math.PI * 2).addAction("lineTo", 0, 0).addAction("paint", "#3AB54A", .2, .2)
        ).setDescription("It heals your summons somehow."),
    new PetalConfig("Lilypad.aura", 225, 6, 44).setSummonHealing(0.00001)
        .setDrawing(new Drawing().addAction("opacity", 0).addAction("beginPath").addAction("moveTo", 0, 0).addAction("arc", 0, 0, 1, Math.PI * 1 / 4, Math.PI * 2).addAction("lineTo", 0, 0).addAction("paint", "#3AB54A", .2, .2).addAction("opacity", 1)
        ).setDescription("[object null object]"),
    new PetalConfig("Dune", 112.5, 60, 60).setSize(4).setPlaceDown(1)
        .setDrawing(new Drawing().addAction("rotate", 15).addAction("beginPath").addAction("dipPolygon", 3, 1, -1, 0).addAction("paint", "#d4c6a5", .2, .2).addAction("dipPolygon", 3, .7, -1, 0).addAction("fill", "#ecdcb8")
        ).setDescription("Kaboom."),
    new PetalConfig("Lens", 112.5, 2500, 44).setSize(3.6).setDown(1).setPetalAttractsAggro(1)
        .setDrawing(new Drawing().addAction("rotate", -45).addAction("opacity", .7).addAction("beginPath").addAction("moveTo", .95, .275).addAction("lineTo", .95, -.275).addAction("lineTo", -.95, -.275).addAction("lineTo", -.95, .275).addAction("fill", "#FFFFFF").addAction("opacity", .35).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("fill", "#FFFFFF").addAction("opacity", 1).addAction("stroke", "#FFFFFF", .2, 0)
        ).setDescription("Lures mobs to this petal until destroyed, can be placed down too."),
    new PetalConfig("Salt", 32.5, 11, 44).setSize(1.2).setDamageReflection(globalThis.salt_table)
        .setDrawing(new Drawing().addAction("beginPath").addAction("polygon", 7, 1, 0).addAction("paint", "#FFFFFF", .25, .2)
        ).setDescription("Reflects damage."),
    new PetalConfig("Rubber", 15, 95, 1.1).setIcon(1, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5], "Rubber", 0).setSize(1.55).setAttractsLightning(1).setMulti([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5], 0, true).setDescription("Attracts lightning. Does not stack.")
        .setDrawing(new Drawing().addAction("rotate", -15).addAction("beginPath").addAction("dipPolygon", 4, 1, 0, 0).addAction("paint", "#ebeef5", .2, .2).addAction("beginPath").addAction("dipPolygon", 4, .5, Math.PI, 0).addAction("fill", "#ffffff")
        ),
    new PetalConfig("Amulet of Fire", 15, 95, 1.1).setIcon(1, 1, "Amulet", 0).setSize(1.55).setDescription("A rare relic infused with the power of fire. An aura emanates from the player once it is equipped which deals massive damage to mobs. It converts sandstorm summons into firestorms. Does not stack. For more info type /info [rarity] amuletoffire.")
        .setDrawing(new Drawing().addAction("rotate", 45).addAction("beginPath").addAction("polygon", 3, 1.1, 0).addAction("paint", "#f4c952", .3, .2).addAction("closePath").addAction("beginPath").addAction("polygon", 3, .4, 0).addAction("paint", "#cf4b44", .1, .2).addAction("closePath")
        ),
    new PetalConfig("fire.aura", 15, 9000, 520).setSize(0.25).setDescription("[object null object]")
        .setDrawing(new Drawing().addAction("beginPath").addAction("opacity", 0.3).addAction("circle", 0, 0, 1).addAction("paint", "#fc4503", .1, .2).addAction("opacity", 1).addAction("closePath")
        ),
    new PetalConfig("Shade", 105, 95, 1.1).setSize(0.85).setDescription(["The remains of a dark soul. Upon being killed, hold on to life for just a bit longer. Does not stack.\nShadow time: 0.5s",
        "The remains of a dark soul. Upon being killed, hold on to life for just a bit longer. Does not stack.\nShadow time: 1s",
        "The remains of a dark soul. Upon being killed, hold on to life for just a bit longer. Does not stack.\nShadow time: 1.2s",
        "The remains of a dark soul. Upon being killed, hold on to life for just a bit longer. Does not stack.\nShadow time: 1.4s",
        "The remains of a dark soul. Upon being killed, hold on to life for just a bit longer. Does not stack.\nShadow time: 1.6s",
        "The remains of a dark soul. Upon being killed, hold on to life for just a bit longer. Does not stack.\nShadow time: 2s",
        "The remains of a dark soul. Upon being killed, hold on to life for just a bit longer. Does not stack.\nShadow time: 2.3s",
        "The remains of a dark soul. Upon being killed, hold on to life for just a bit longer. Does not stack.\nShadow time: 2.6s",
        "The remains of a dark soul. Upon being killed, hold on to life for just a bit longer. Does not stack.\nShadow time: 3s",
        "The remains of a dark soul. Upon being killed, hold on to life for just a bit longer. Does not stack.\nShadow time: 3.4s",
        "The remains of a dark soul. Upon being killed, hold on to life for just a bit longer. Does not stack.\nShadow time: 3.8s",
        "The remains of a dark soul. Upon being killed, hold on to life for just a bit longer. Does not stack.\nShadow time: 4s",
        "The remains of a dark soul. Upon being killed, hold on to life for just a bit longer. Does not stack.\nShadow time: 4.9s",
        "The remains of a dark soul. Upon being killed, hold on to life for just a bit longer. Does not stack.\nShadow time: 5.2s",
        "The remains of a dark soul. Upon being killed, hold on to life for just a bit longer. Does not stack.\nShadow time: 6s",
        "The remains of a dark soul. Upon being killed, hold on to life for just a bit longer. Does not stack.\nShadow time: 6.5s",
        "The remains of a dark soul. Upon being killed, hold on to life for just a bit longer. Does not stack.\nShadow time: 7s",
        "The remains of a dark soul. Upon being killed, hold on to life for just a bit longer. Does not stack.\nShadow time: 7.5s"
        ])
        .setDrawing(new Drawing().addAction("opacity", .3).addAction("beginPath").addAction("dipPolygon", 5, 1, -0.825, 0).addAction("fill", "#000000").addAction("beginPath").addAction("dipPolygon", 5, .5, -0.825, 0).addAction("fill", "#000000")
        ),
    new PetalConfig("Amulet of Grace", 225, 1.1, 1.1).setIcon(1, 1, "Amulet", 0).setSize(1.1).setDescription("A rare relic believed to have the power of delaying the inevitable, costing more mana if the wave is higher. Only works in Waves. Check /waveinfo on wave state timeout.")
        .setDrawing(new Drawing().addAction("rotate", 25).addAction("beginPath").addAction("polygon", 5, 1.1, 0).addAction("paint", "#f4c952", .3, .2).addAction("closePath").addAction("beginPath").addAction("polygon", 5, .52, 0).addAction("paint", "#ffb6c1", .31, .1).addAction("closePath")
        ),
    new PetalConfig("Compass", 22, 1.1, 1.1).setIcon(1, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 3, 3, 5, 5, 5, 8, 8, 8, 8, 10, 10, 10, 14, 14, 14, 16], "Compass", 0).setMulti([1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 3, 3, 5, 5, 5, 8, 8, 8, 8, 10, 10, 10, 14, 14, 14, 16], 1, true).setSize(0.75).setDescription("Broadcasts the color of the highest rarity due to spawn in a wave. Only works in Waves.")
        .setDrawing(new Drawing()
        .addAction("beginPath").addAction("circle", 0, 0, 1.0).addAction("paint", "#d7d7d7", 0.08, 0.15).addAction("closePath").addAction("beginPath").addAction("circle", 0, 0, 0.82).addAction("fill", "#4fa3df").addAction("closePath")
        .addAction("beginPath").addAction("moveTo", 0.9599999785423279, 0).addAction("lineTo", 0.9599999785423279, 0).addAction("fill", "#d7d7d7").addAction("closePath").addAction("beginPath").addAction("moveTo", 0.7999999821186066, 0).addAction("lineTo", 0.7999999821186066, 0).addAction("fill", "#4fa3df").addAction("closePath").addAction("beginPath").addAction("moveTo", 0, 0).addAction("lineTo", -0.17999999597668648, -0.17999999597668648).addAction("lineTo", -0.6999999843537807, 0.6999999843537807).addAction("lineTo", 0.17999999597668648, 0.17999999597668648).addAction("lineTo", 0, 0).addAction("fill", "#ffffff").addAction("closePath").addAction("beginPath").addAction("moveTo", 0, 0).addAction("lineTo", 0.17999999597668648, 0.17999999597668648).addAction("lineTo", 0.6999999843537807, -0.6999999843537807).addAction("lineTo", -0.17999999597668648, -0.17999999597668648).addAction("lineTo", 0, 0).addAction("fill", "#e74c3c").addAction("closePath").addAction("beginPath").addAction("moveTo", 0.09999999776482582, 0).addAction("lineTo", 0.09999999776482582, 0).addAction("fill", "#bfbfbf").addAction("closePath")
        .addAction("circle", 0, 0, 0.12)
        .addAction("fill", "#bcbcbc")
        ),
    new PetalConfig("fire.projectile", 15, 0.00000005, 0.00000005).setSize(0.25).setDescription("[object null object]")
        .setDrawing(new Drawing().addAction("beginPath").addAction("opacity", 0.3).addAction("circle", 0, 0, 1).addAction("paint", "#fc4503", .1, .2).addAction("opacity", 1).addAction("closePath")
        ),
    new PetalConfig("Horn", 92, 1.1, 1.1).setSize(1.1).setDescription(["How did you get this?", "How did you get this?", "How did you get this?", "How did you get this?", "How did you get this?",
        "If the current wave has ended, this petal calls for the next wave to start if there are under a certain number of mobs remaining. It also instantly vanquishes all remaining mobs under some rarity without drops. Horns up to Ultra mobs.\nMaximum Mobs: 10",
        "If the current wave has ended, this petal calls for the next wave to start if there are under a certain number of mobs remaining. It also instantly vanquishes all remaining mobs under some rarity without drops. Horns up to Ancient mobs.\nMaximum Mobs: 20",
        "If the current wave has ended, this petal calls for the next wave to start if there are under a certain number of mobs remaining. It also instantly vanquishes all remaining mobs under some rarity without drops. Horns up to Omega mobs.\nMaximum Mobs: 30",
        "If the current wave has ended, this petal calls for the next wave to start if there are under a certain number of mobs remaining. It also instantly vanquishes all remaining mobs under some rarity without drops. Horns up to Unique mobs.\nMaximum Mobs: 40",
        "If the current wave has ended, this petal calls for the next wave to start if there are under a certain number of mobs remaining. It also instantly vanquishes all remaining mobs under some rarity without drops. Horns up to Galaxium mobs.\nMaximum Mobs: 50",
        "If the current wave has ended, this petal calls for the next wave to start if there are under a certain number of mobs remaining. It also instantly vanquishes all remaining mobs under some rarity without drops. Horns up to Fictional mobs.\nMaximum Mobs: 70",
        "If the current wave has ended, this petal calls for the next wave to start if there are under a certain number of mobs remaining. It also instantly vanquishes all remaining mobs under some rarity without drops. Horns up to Chaos mobs.\nMaximum Mobs: 80",
        "If the current wave has ended, this petal calls for the next wave to start if there are under a certain number of mobs remaining. It also instantly vanquishes all remaining mobs under some rarity without drops. Horns up to Absiorcadinary mobs.\nMaximum Mobs: 100",
        "If the current wave has ended, this petal calls for the next wave to start if there are under a certain number of mobs remaining. It also instantly vanquishes all remaining mobs under some rarity without drops. Horns up to Nullified mobs.\nMaximum Mobs: 150",
        "If the current wave has ended, this petal calls for the next wave to start if there are under a certain number of mobs remaining. It also instantly vanquishes all remaining mobs under some rarity without drops. Horns up to Atlantical mobs.\nMaximum Mobs: 225",
        "If the current wave has ended, this petal calls for the next wave to start if there are under a certain number of mobs remaining. It also instantly vanquishes all remaining mobs under some rarity without drops. Horns up to Finalist mobs.\nMaximum Mobs: 300",
        "If the current wave has ended, this petal calls for the next wave to start if there are under a certain number of mobs remaining. It also instantly vanquishes all remaining mobs under some rarity without drops. Horns up to Improbable mobs.\nMaximum Mobs: 450",
        "If the current wave has ended, this petal calls for the next wave to start if there are under a certain number of mobs remaining. It also instantly vanquishes all remaining mobs under some rarity without drops. Horns up to Chronodynamic mobs.\nMaximum Mobs: 600"
        ])
        .setDrawing(new Drawing()
        .addAction("beginPath").addAction("beginPath").addAction("moveTo", 1.16, -0.83).addAction("lineTo", 0.54, -0.37).addAction("lineTo", -0.16, -0.23).addAction("lineTo", -0.86, -0.53).addAction("lineTo", -1.38, -0.99).addAction("lineTo", -1.23, -0.3).addAction("lineTo", -0.76, 0.22).addAction("lineTo", -0.18, 0.64).addAction("lineTo", 0.52, 0.72).addAction("lineTo", 1.28, 0.37).addAction("fill", "#af997e").addAction("closePath").addAction("beginPath").addAction("moveTo", -1.38, -0.99).addAction("lineTo", -0.91, -0.33).addAction("stroke", "#bdab95", 0.15, 0).addAction("closePath").addAction("beginPath").addAction("moveTo", -0.91, -0.33).addAction("lineTo", -0.27, 0.03).addAction("stroke", "#bdab95", 0.16, 0).addAction("closePath").addAction("beginPath").addAction("moveTo", -0.27, 0.03).addAction("lineTo", 0.33, -0.03).addAction("stroke", "#bdab95", 0.18, 0).addAction("closePath").addAction("beginPath").addAction("moveTo", 0.33, -0.03).addAction("lineTo", 1, -0.37).addAction("stroke", "#bdab95", 0.2, 0).addAction("closePath").addAction("beginPath").addAction("moveTo", 1.16, -0.83).addAction("quadraticCurveTo", 0.69, -0.15, 1.28, 0.37).addAction("quadraticCurveTo", 1.67, -0.29, 1.16, -0.83).addAction("fill", "#706150").addAction("stroke", "#8f7d67", 0.15, 0).addAction("closePath").addAction("beginPath").addAction("moveTo", -0.86, -0.53).addAction("quadraticCurveTo", -1.01, -0.26, -0.76, 0.22).addAction("moveTo", -0.16, -0.23).addAction("quadraticCurveTo", -0.53, 0.15, -0.18, 0.64).addAction("moveTo", 0.54, -0.37).addAction("quadraticCurveTo", 0.17, 0.25, 0.52, 0.72).addAction("stroke", "#8f7d67", 0.15, 0).addAction("closePath").addAction("beginPath").addAction("moveTo", 1.16, -0.83).addAction("lineTo", 0.54, -0.37).addAction("lineTo", -0.16, -0.23).addAction("lineTo", -0.86, -0.53).addAction("lineTo", -1.38, -0.99).addAction("lineTo", -1.23, -0.3).addAction("lineTo", -0.76, 0.22).addAction("lineTo", -0.18, 0.64).addAction("lineTo", 0.52, 0.72).addAction("lineTo", 1.28, 0.37).addAction("stroke", "#8f7d67", 0.15, 0).addAction("closePath")
        ),
    new PetalConfig("Card", 22, 1.1, 1.1).setSize(1.1).setDescription(["Speeds up the wave. Does not stack.\nSpeed Multiplier: x1.00",
        "Speeds up the wave. Does not stack.\nSpeed Multiplier: x1.00",
        "Speeds up the wave. Does not stack.\nSpeed Multiplier: x1.00",
        "Speeds up the wave. Does not stack.\nSpeed Multiplier: x1.00",
        "Speeds up the wave. Does not stack.\nSpeed Multiplier: x1.00",
        "Speeds up the wave. Does not stack.\nSpeed Multiplier: x1.00",
        "Speeds up the wave. Does not stack.\nSpeed Multiplier: x1.00",
        "Speeds up the wave. Does not stack.\nSpeed Multiplier: x1.05",
        "Speeds up the wave. Does not stack.\nSpeed Multiplier: x1.10",
        "Speeds up the wave. Does not stack.\nSpeed Multiplier: x1.15",
        "Speeds up the wave. Does not stack.\nSpeed Multiplier: x1.20",
        "Speeds up the wave. Does not stack.\nSpeed Multiplier: x1.25",
        "Speeds up the wave. Does not stack.\nSpeed Multiplier: x1.50",
        "Speeds up the wave. Does not stack.\nSpeed Multiplier: x2.00",
        "Speeds up the wave. Does not stack.\nSpeed Multiplier: x3.00",
        "Speeds up the wave. Does not stack.\nSpeed Multiplier: x4.00",
        "Speeds up the wave. Does not stack.\nSpeed Multiplier: x6.00",
        "Speeds up the wave. Does not stack.\nSpeed Multiplier: x8.00",
        "Speeds up the wave. Does not stack.\nSpeed Multiplier: xundefined"
        ])
        .setDrawing(new Drawing()
        .addAction("beginPath").addAction("rect", -1.2, -0.8, 2.4, 1.6).addAction("fill", "#ffffff").addAction("closePath").addAction("beginPath").addAction("moveTo", -1.1, 0.35).addAction("lineTo", 1.1, 0.35).addAction("stroke", "#202020", 0.3, 0).addAction("closePath").addAction("beginPath").addAction("rect", -1.2, -0.8, 2.4, 1.6).addAction("stroke", "#cfcfcf", 0.3, 0).addAction("closePath").addAction("beginPath").addAction("rect", -0.9, -0.45, 0.8, 0.5).addAction("fill", "#d4af37").addAction("closePath").addAction("beginPath").addAction("circle", 0.4, -0.2, 0.25).addAction("fill", "#ff9500").addAction("beginPath").addAction("circle", 0.7, -0.2, 0.25).addAction("closePath").addAction("fill", "#ff1500").addAction("closePath")
        ),
];

export const petalIDOf = name => petalConfigs.findIndex(p => p.name === name);

// After references are set
petalConfigs[petalIDOf("Web")].setShootOut(petalIDOf("web.player.launched"));
petalConfigs[petalIDOf("Resin")].setShootOut(petalIDOf("Resin.projectile"));
petalConfigs[petalIDOf("Peas")].setSplits(petalIDOf("Pea.projectile"), 4);
petalConfigs[petalIDOf("Grapes")].setSplits(petalIDOf("projectile.grape"), 4);
petalConfigs[petalIDOf("Pomegranate")].setSplits(petalIDOf("projectile.pomegranate"), 4);
petalConfigs[petalIDOf("Fiberglass")].setSplits(petalIDOf("Fiberglass.projectile"), 8);

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
    new MobConfig("Scorpion", 45, 54.5, 32.5, 3)
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
    new MobConfig("Jellyfish", 62, 74, 35, 2.5)
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
    new MobConfig("Soldier Ant", 25, 5, 15, 3.75)
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
    new MobConfig("Fire Ant Hole", 250, 2, 25, 0)
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
        .addDrop(petalIDOf("Pentagon Egg"), .01),
    new MobConfig("Sandstone", 75, 5, 35, 0)
        .setDrawing(new Drawing().addAction("beginPath").addAction("dipPolygon", 7, 1, .3, 0).addAction("paint", "#d4be94", .225, .2).addAction("beginPath").addAction("dipPolygon", 8, .6, .3, 0).addAction("fill", "#dbc9a6").addAction("beginPath").addAction("dipPolygon", 8, .4, .3, 0).addAction("fill", "#d4be94")
        )
        ,
    new MobConfig("Beetle Pod", 40, 2, 30, 0)
        .setDrawing(new Drawing().addAction("beginPath").addAction("dipPolygon", 7, 1.1, 1, Math.PI).addAction("paint", "#7e519a", .2, .2).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#7e519a", .2, .2).addAction("beginPath").addAction("circle", 0, 0, .5).addAction("fill", "#915db0")
        ),
    new MobConfig("Beetle Hole", 300, 2, 35, 0).setPushability(0)
        .setDrawing(new Drawing().addAction("beginPath").addAction("dipPolygon", 7, 1.1, 1, 0).addAction("fill", "#774c91").addAction("beginPath").addAction("circle", 0, 0, 1).addAction("fill", "#774c91").addAction("beginPath").addAction("dipPolygon", 6, .75 + .06, .75, Math.PI * 1.5).addAction("fill", "#69437f").addAction("beginPath").addAction("circle", 0, 0, .75).addAction("fill", "#69437f").addAction("beginPath").addAction("dipPolygon", 5, .5 + .05, .5, 0).addAction("fill", "#5a3a6e").addAction("beginPath").addAction("circle", 0, 0, .5).addAction("fill", "#5a3a6e")
        ),
    new MobConfig("ӇЄҲƛƓƠƝ", 300, 22, 30, 0)
        .setDrawing(new Drawing()
        .addAction("beginPath")
        .addAction("opacity", 0.5)
        .addAction("polygon", 6, 1.2, 1)
        .addAction("fill", "#c73626")
        .addAction("stroke", "#853d35", 0.2, 0)
        .addAction("closePath")
        .addAction("beginPath")
        .addAction("opacity", 1)
        .addAction("polygon", 6, 1.1, 1)
        .addAction("fill", "#c73626")
        .addAction("stroke", "#853d35", 0.2, 0)
        .addAction("closePath")
        )
        ,
    new MobConfig("Shiny Soldier Ant", 12, 22, 15, 5).setAggressive(1).setLightning([75, 75, 75, 65, 65, 65, 55, 55, 55, 45, 35, 25], [2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 8], 313, 2, 250).setProjectile({
        petalIndex: petalIDOf("Missile"),
        cooldown: 45,
        health: 0.000000000002,
        damage: 0.00000000002,
        speed: 5,
        range: 850,
        size: .5
        })
        .setDrawing(
        new Drawing()
        .addAction("beginPath")
        .addAction("circle", -1.1, 0, 0.667)
        .addAction("fill", "#f5df16")
        .addAction("stroke", "#d6c52b", 0.4, 0)
        .addAction("closePath")
        .addAction("beginPath")
        .addAction("opacity", 0.3)
        .addAction("ellipse", -0.667, -0.375, 1.6875, 0.625, 18)
        .addAction("ellipse", -0.667, 0.375, 1.6875, 0.625, -18)
        .addAction("fill", "#ffffff")
        .addAction("closePath")
        .addAction("opacity", 1)
        .addAction("beginPath")
        .addAction("moveTo", 0, -0.7)
        .addAction("quadraticCurveTo", 1.25, -0.5, 1.5, -0.4)
        .addAction("stroke", "#2b1d0e", 0.5, 0)
        .addAction("closePath")
        .addAction("beginPath")
        .addAction("moveTo", 0, 0.7)
        .addAction("quadraticCurveTo", 1.25, 0.5, 1.5, 0.4)
        .addAction("stroke", "#2b1d0e", 0.5, 0)
        .addAction("closePath")
        .addAction("beginPath")
        .addAction("circle", 0, 0, 1)
        .addAction("fill", "#f5df16")
        .addAction("stroke", "#d6c52b", 0.4, 0)
        .addAction("closePath")
        )
        ,
    new MobConfig("Desert Shrub", 40, 10, 15, 0).setThornSpawn(0.6, "Thorn.projectile", 14)
        .setDrawing(new Drawing().addAction("beginPath").addAction("dipPolygon", 7, 1, -3, 0).addAction("stroke", "#91775a", .2, 0).addAction("dipPolygon", 5, .7, -3, .4).addAction("stroke", "#91775a", .2, 0).addAction("dipPolygon", 4, .5, -1.5, .3).addAction("stroke", "#91775a", .2, 0).addAction("closePath").addAction("beginPath").addAction("moveTo", 1.05, .065).addAction("lineTo", 1.25, 0).addAction("lineTo", 1.05, -.065).addAction("rotate", 360 / 7).addAction("moveTo", 1.05, .065).addAction("lineTo", 1.25, 0).addAction("lineTo", 1.05, -.065).addAction("rotate", 360 / 7).addAction("moveTo", 1.05, .065).addAction("lineTo", 1.25, 0).addAction("lineTo", 1.05, -.065).addAction("rotate", 360 / 7).addAction("moveTo", 1.05, .065).addAction("lineTo", 1.25, 0).addAction("lineTo", 1.05, -.065).addAction("rotate", 360 / 7).addAction("moveTo", 1.05, .065).addAction("lineTo", 1.25, 0).addAction("lineTo", 1.05, -.065).addAction("rotate", 360 / 7).addAction("moveTo", 1.05, .065).addAction("lineTo", 1.25, 0).addAction("lineTo", 1.05, -.065).addAction("rotate", 360 / 7).addAction("moveTo", 1.05, .065).addAction("lineTo", 1.25, 0).addAction("lineTo", 1.05, -.065).addAction("stroke", "#91775a", .1, 0).addAction("closePath").addAction("rotate", 360 / 7).addAction("beginPath").addAction("dipPolygon", 3, .45, -1, 0).addAction("paint", "#3AB54A", .2, .3).addAction("dipPolygon", 5, .35, -1.5, 0).addAction("paint", "#FC93C5", .2, .2).addAction("beginPath").addAction("circle", 0, 0, .15).addAction("fill", "#fcebff")
        )
        ,
    new MobConfig("Lilypad", 40, 10, 40, 0)
        .setDrawing(new Drawing().addAction("beginPath").addAction("moveTo", 0, 0).addAction("arc", 0, 0, 1, Math.PI * 1 / 4, Math.PI * 2).addAction("lineTo", 0, 0).addAction("paint", "#3AB54A", .2, .2)
        ),
    new MobConfig("Lilypad (Summon)", 40, 10, 40, 0)
        .setDrawing(new Drawing().addAction("beginPath").addAction("moveTo", 0, 0).addAction("arc", 0, 0, 1, Math.PI * 1 / 4, Math.PI * 2).addAction("lineTo", 0, 0).addAction("paint", "#ffe763", .2, .2)
        )
        ,
    new MobConfig("Puddle", 40, 10, 50, 0)
        .setDrawing(new Drawing().addAction("beginPath").addAction("opacity", .45).addAction("moveTo", 1, 0).addAction("quadraticCurveTo", 1.0321587991342152, 0.5417187271752805, 0.5680647467311558, 0.8229838658936565).addAction("quadraticCurveTo", 0.13152049608924002, 1.0831687359981133, -0.3546048870425357, 0.9350162426854148).addAction("quadraticCurveTo", -0.8601230017445436, 0.7620024865701919, -0.970941817426052, 0.23931566428755768).addAction("quadraticCurveTo", -1.0352882573974829, -0.2551756373054311, -0.748510748171101, -0.6631226582407953).addAction("quadraticCurveTo", -0.4074808820334939, -1.0744387830148376, 0.1205366802553232, -0.992708874098054).addAction("quadraticCurveTo", 0.6433585356470011, -0.9320657510771945, 0.88545602565321, -0.4647231720437684).addAction("quadraticCurveTo", 1, -0.2, 1, 0).addAction("fill", "#fffde6").addAction("opacity", .9).addAction("stroke", "#fffde6", .2, 0).addAction("opacity", 1).addAction("beginPath").addAction("moveTo", 0, 0).addAction("arc", 0, 0, .3, Math.PI * 1 / 4, Math.PI * 2).addAction("lineTo", 0, 0).addAction("paint", "#3AB54A", .1, .2)
        ),
    new MobConfig("Salt Flat", 40, 10, 25, 0).setFixedDamageReflection()
        .setDrawing(new Drawing().addAction("rotate", 15).addAction("beginPath").addAction("dipPolygon", 6, 1, .6, 0).addAction("paint", "#eee1c2", .2, .2).addAction("beginPath").addAction("dipPolygon", 6, .55, .6, Math.PI / 2).addAction("paint", "#f5eddb", .2, 0).addAction("beginPath").addAction("dipPolygon", 6, .4, .6, 0).addAction("paint", "#eee1c2", .2, 0).addAction("beginPath").addAction("spikeBall", 6, .275, 0).addAction("paint", "#f5eddb", .2, 0)
        ),
    new MobConfig("Firestorm", 135, 45, 35, 3).setSandstormMovement(1).setThornSpawn(0.3, "fire.projectile", 14)
        .setDrawing(new Drawing().addAction("beginPath").addAction("polygon", 7, 1, "date_0.0025").addAction("paint", "#e86d48", .3, 0).addAction("beginPath").addAction("polygon", 7, .75, "date_-0.002").addAction("paint", "#d06240", .3, 0).addAction("beginPath").addAction("polygon", 7, .5, "date_0.0015").addAction("paint", "#b95739", .3, 0).addAction("beginPath").addAction("polygon", 7, .25, "date_-0.001").addAction("paint", "#a24c32", .3, 0)
        ),
    new MobConfig("Firestorm (Summon)", 135, 45, 35, 3).setSandstormMovement(1)
        .setSize(35, MobTier.SIZE_SCALE, .9, .25)
        .setDrawing(new Drawing().addAction("beginPath").addAction("polygon", 7, 1, "date_0.0025").addAction("paint", "#fce803", .3, 0).addAction("beginPath").addAction("polygon", 7, .75, "date_-0.002").addAction("paint", "#e3d642", .3, 0).addAction("beginPath").addAction("polygon", 7, .5, "date_0.0015").addAction("paint", "#c9bf47", .3, 0).addAction("beginPath").addAction("polygon", 7, .25, "date_-0.001").addAction("paint", "#999243", .3, 0)
        ),
    new MobConfig("Evil Desert Centipede", 25, 10, 22.5, 5.5).setAggressive(1).setCentipedeMovement(1)
        .setDrawing(new Drawing().addAction("beginPath").addAction("circle", 0, -0.875, 0.375).addAction("circle", 0, 0.875, 0.375).addAction("closePath").addAction("paint", "#222222", .2, 0).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("closePath").addAction("paint", "#e86d48", .2, .2).addAction("beginPath").addAction("moveTo", 0.75, -0.2).addAction("quadraticCurveTo", 1.2, -0.3, 1.3, -0.5).addAction("moveTo", 0.75, 0.2).addAction("quadraticCurveTo", 1.2, 0.3, 1.3, 0.5).addAction("paint", "#222222", .2, 0).addAction("closePath")
        )
        ,
    new MobConfig("Evil Desert Centipede", 25, 10, 22.5, 5.5).setSystem(1).setAggressive(1).setCentipedeMovement(1)
        .setDrawing(new Drawing().addAction("beginPath").addAction("circle", 0, -0.875, 0.375).addAction("circle", 0, 0.875, 0.375).addAction("closePath").addAction("paint", "#222222", .2, 0).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("closePath").addAction("paint", "#e86d48", .2, .2)
        ),
    new MobConfig("Jelly (Summon)", 0.00001, 0.00001, 15, 0)
        .setDensity(150)
        .setDrawing(
        new Drawing()
        .addAction("beginPath")
        .addAction("arc", 0, 0, 1, 0, Math.PI * 2)
        .addAction("closePath")
        .addAction("opacity", 0.6)
        .addAction("fill", "#FBBAFF")
        .addAction("stroke", "#d4b4d3", 0.2, 0)
        .addAction("opacity", 1)
        .addAction("beginPath")
        .addAction("arc", 0.25, 0.45, 0.35, 0, Math.PI * 2)
        .addAction("closePath")
        .addAction("fill", "#d4b4d3")
        .addAction("beginPath")
        .addAction("arc", -0.55, 0.3, 0.2, 0, Math.PI * 2)
        .addAction("closePath")
        .addAction("fill", "#d4b4d3")
        .addAction("beginPath")
        .addAction("arc", 0.3, -0.25, 0.2, 0, Math.PI * 2)
        .addAction("closePath")
        .addAction("fill", "#d4b4d3")
        .addAction("beginPath")
        .addAction("arc", -0.4, -0.25, 0.25, 0, Math.PI * 2)
        .addAction("closePath")
        .addAction("fill", "#d4b4d3")
        .addAction("beginPath")
        .addAction("arc", 0, -0.9, 0.35, 0, Math.PI)
        .addAction("closePath")
        .addAction("fill", "#d4b4d3")
        ),
    new MobConfig("Sunlit Frog", 25, 10, 20, 30).setMovesInBursts(1).setNeutral(1)
        .setDrawing(new Drawing().addAction("beginPath").addAction("moveTo", -.50, .75).addAction("lineTo", .23, 1.09).addAction("moveTo", .23, 1.09).addAction("lineTo", .36, 1.26).addAction("moveTo", .23, 1.09).addAction("lineTo", .45, 1.08).addAction("stroke", "#ada259", .12, 0).addAction("closePath").addAction("beginPath").addAction("moveTo", -.50, -.75).addAction("lineTo", .23, -1.09).addAction("moveTo", .23, -1.09).addAction("lineTo", .45, -1.08).addAction("moveTo", .23, -1.09).addAction("lineTo", .36, -1.26).addAction("stroke", "#ada259", .12, 0).addAction("closePath").addAction("beginPath").addAction("moveTo", .60, .30).addAction("lineTo", 1.16, .51).addAction("moveTo", 1.16, .51).addAction("lineTo", 1.28, .63).addAction("moveTo", 1.16, .51).addAction("lineTo", 1.33, .49).addAction("stroke", "#ada259", .11, 0).addAction("closePath").addAction("beginPath").addAction("moveTo", .60, -.30).addAction("lineTo", 1.16, -.51).addAction("moveTo", 1.16, -.51).addAction("lineTo", 1.33, -.49).addAction("moveTo", 1.16, -.51).addAction("lineTo", 1.28, -.63).addAction("stroke", "#ada259", .11, 0).addAction("closePath")
        .addAction("beginPath")
        .addAction("moveTo", .12, .92)
        .addAction("bezierCurveTo",
        -.55, 1.22,
        -1.32, .86,
        -1.18, .34)
        .addAction("quadraticCurveTo",
        -.82, .08,
        .10, .70)
        .addAction("closePath")
        .addAction("fill", "#d3c66d")
        .addAction("stroke", "#ada259", .12, 0)
        .addAction("beginPath")
        .addAction("moveTo", .12, -.92)
        .addAction("bezierCurveTo",
        -.55, -1.22,
        -1.32, -.86,
        -1.18, -.34)
        .addAction("quadraticCurveTo",
        -.82, -.08,
        .10, -.70)
        .addAction("closePath")
        .addAction("fill", "#d3c66d")
        .addAction("stroke", "#ada259", .12, 0)
        .addAction("beginPath")
        .addAction("ellipse", 0, 0, 1.10, .86, 0)
        .addAction("fill", "#d3c66d")
        .addAction("stroke", "#ada259", .15, 0)
        .addAction("beginPath")
        .addAction("ellipse", -.08, 0, .63, .46, .18)
        .addAction("fill", "#dbd087")
        .addAction("stroke", "#dbd087", .15, 0)
        .addAction("beginPath")
        .addAction("circle", .55, .50, .20)
        .addAction("fill", "#000000")
        .addAction("beginPath")
        .addAction("circle", .55, -.50, .20)
        .addAction("fill", "#000000")
        .addAction("beginPath").addAction("circle", .55, .50, .20).addAction("fill", "#000000").addAction("beginPath").addAction("circle", .55, -.50, .20).addAction("fill", "#000000")
        ),
    new MobConfig("Moonlit Frog", 25, 10, 20, 32).setMovesInBursts(1).setNeutral(1)
        .setDrawing(new Drawing().addAction("beginPath").addAction("moveTo", -.50, .75).addAction("lineTo", .23, 1.09).addAction("moveTo", .23, 1.09).addAction("lineTo", .36, 1.26).addAction("moveTo", .23, 1.09).addAction("lineTo", .45, 1.08).addAction("stroke", "#3d178e", .12, 0).addAction("closePath").addAction("beginPath").addAction("moveTo", -.50, -.75).addAction("lineTo", .23, -1.09).addAction("moveTo", .23, -1.09).addAction("lineTo", .45, -1.08).addAction("moveTo", .23, -1.09).addAction("lineTo", .36, -1.26).addAction("stroke", "#3d178e", .12, 0).addAction("closePath").addAction("beginPath").addAction("moveTo", .60, .30).addAction("lineTo", 1.16, .51).addAction("moveTo", 1.16, .51).addAction("lineTo", 1.28, .63).addAction("moveTo", 1.16, .51).addAction("lineTo", 1.33, .49).addAction("stroke", "#3d178e", .11, 0).addAction("closePath").addAction("beginPath").addAction("moveTo", .60, -.30).addAction("lineTo", 1.16, -.51).addAction("moveTo", 1.16, -.51).addAction("lineTo", 1.33, -.49).addAction("moveTo", 1.16, -.51).addAction("lineTo", 1.28, -.63).addAction("stroke", "#3d178e", .11, 0).addAction("closePath")
        .addAction("beginPath")
        .addAction("moveTo", .12, .92)
        .addAction("bezierCurveTo",
        -.55, 1.22,
        -1.32, .86,
        -1.18, .34)
        .addAction("quadraticCurveTo",
        -.82, .08,
        .10, .70)
        .addAction("closePath")
        .addAction("fill", "#4a1cad")
        .addAction("stroke", "#3d178e", .12, 0)
        .addAction("beginPath")
        .addAction("moveTo", .12, -.92)
        .addAction("bezierCurveTo",
        -.55, -1.22,
        -1.32, -.86,
        -1.18, -.34)
        .addAction("quadraticCurveTo",
        -.82, -.08,
        .10, -.70)
        .addAction("closePath")
        .addAction("fill", "#4a1cad")
        .addAction("stroke", "#3d178e", .12, 0)
        .addAction("beginPath")
        .addAction("ellipse", 0, 0, 1.10, 0.86, 0)
        .addAction("fill", "#4a1cad")
        .addAction("stroke", "#3d178e", .15, 0)
        .addAction("beginPath")
        .addAction("ellipse", -.08, 0, .63, .46, .18)
        .addAction("fill", "#6b45bc")
        .addAction("stroke", "#6b45bc", .15, 0)
        .addAction("beginPath").addAction("circle", .55, .50, .20).addAction("fill", "#000000").addAction("beginPath").addAction("circle", .55, -.50, .20).addAction("fill", "#000000")
        ),
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
petalConfigs[petalIDOf("Jelly")].setSpawnable(mobIDOf("Jelly (Summon)"), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 29], 4);
petalConfigs[petalIDOf("Lilypad")].setSpawnable(mobIDOf("Lilypad (Summon)"), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 29], 4);
petalConfigs[petalIDOf("ӇЄҲƛƓƠƝ")].setSpawnable(mobIDOf("ӇЄҲƛƓƠƝ"), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 29], 4);
petalConfigs[petalIDOf("Scorpion Egg")].setSpawnable(mobIDOf("Scorpion"), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 29], 8);
petalConfigs[petalIDOf("Jellyfish Egg")].setSpawnable(mobIDOf("Jellyfish"), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 29], 8);

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
    index: mobIDOf("Shiny Soldier Ant"),
    count: 1,
    chance: 0.005
}, {
    index: mobIDOf("Queen Fire Ant"),
    count: 1,
    minHealthRatio: .01
}]);

mobConfigs[mobIDOf("Beetle Hole")].setAntHoleSpawns([{
    index: mobIDOf("Beetle"),
    count: [4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7]
}, {
    index: mobIDOf("Beetle Pod"),
    count: 5
}, {
    index: mobIDOf("Beetle"),
    count: 1,
    minHealthRatio: .01
}]);

mobConfigs[mobIDOf("Puddle")].setAntHoleSpawns([{
    index: mobIDOf("Desert Shrub"),
    count: [4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7]
}, {
    index: mobIDOf("Lilypad"),
    count: 5
}, {
    index: mobIDOf("Jellyfish"),
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

mobConfigs[mobIDOf("Beetle Pod")].setHatchables({
    index: mobIDOf("Beetle"),
    time: 4787.5
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
mobConfigs[mobIDOf("Evil Desert Centipede")].segmentWith(queryMob(m => m.isSystem && m.name === "Evil Desert Centipede"));
mobConfigs[mobIDOf("Hell Centipede")].segmentWith(queryMob(m => m.isSystem && m.name === "Hell Centipede"));
mobConfigs[mobIDOf("Wilt")].branchWith(queryMob(m => m.isSystem && m.name === "Wilt"), 5, 2);

export const DEFAULT_PETAL_COUNT = petalConfigs.length;
export const DEFAULT_MOB_COUNT = mobConfigs.length;

export const DROP_LOOKUP = {};

{
    const petalByName = new Map(petalConfigs.map((petal, index) => [petal.name, index]));

    for (const [mobName, table] of Object.entries(DROP_TABLES)) {
        const lookup = {};

        for (const [tierKey, rows] of Object.entries(table.tiers)) {
            const tier = Number(tierKey);

            if (!Number.isInteger(tier) || tier < 0 || tier > 40) {
                throw new Error(`[DROP TABLE] ${mobName}: invalid tier ${tierKey}`);
            }

            lookup[tier] = rows.map((row, rowIndex) => ({
                chance: row.weight ?? 1,
                entries: row.drops.map((drop, dropIndex) => {
                    const index = petalByName.get(drop.petal);

                    if (index === undefined || index < 0) {
                        throw new Error(
                            `[DROP TABLE] ${mobName} tier ${tier} row ${rowIndex} drop ${dropIndex}: invalid item "${drop.petal}"`
                        );
                    }

                    if (!Number.isFinite(drop.chance) || drop.chance < 0) {
                        throw new Error(
                            `[DROP TABLE] ${mobName} tier ${tier} row ${rowIndex} drop ${dropIndex}: invalid chance ${drop.chance}`
                        );
                    }

                    if (!Number.isInteger(drop.rarity) || drop.rarity < 0) {
                        throw new Error(
                            `[DROP TABLE] ${mobName} tier ${tier} row ${rowIndex} drop ${dropIndex}: invalid rarity ${drop.rarity}`
                        );
                    }

                    if (!Number.isInteger(drop.amount) || drop.amount <= 0) {
                        throw new Error(
                            `[DROP TABLE] ${mobName} tier ${tier} row ${rowIndex} drop ${dropIndex}: invalid amount ${drop.amount}`
                        );
                    }

                    return {
                        index,
                        rarity: drop.rarity,
                        amount: drop.amount,
                        weight: drop.chance
                    };
                })
            }));
        }

        DROP_LOOKUP[mobName] = lookup;
    }
}

console.log("config.js loaded", petalConfigs.length, "petals", mobConfigs.length, "mobs.");

export const randomPossiblePetal = (rarity) => {
    const possible = [];

    mobConfigs.forEach(mob => {
        const table = DROP_LOOKUP[mob.name];

        if (table) {
            for (const rows of Object.values(table)) {
                for (const row of rows) {
                    for (const entry of row.entries) {
                        if (entry.index > -1 && rarity >= entry.rarity) {
                            possible.push(entry.index);
                        }
                    }
                }
            }
        }

        mob.drops.forEach(drop => {
            if (drop.index > -1 && rarity >= drop.minRarity) {
                possible.push(drop.index);
            }
        });
    });

    return possible[Math.random() * possible.length | 0];
}
