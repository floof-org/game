import { tiers as _tiers, Drawing, WEARABLES, PetalTier, MobTier, PetalConfig, MobDrop, MobConfig } from "../../lib/protocol.js";
export const tiers = structuredClone(_tiers);
export { Drawing, WEARABLES, PetalTier, MobTier, PetalConfig, MobDrop, MobConfig };

export const petalConfigs = [
    new PetalConfig("Basic",22.5,10,10)
        .setDescription("A simple petal. Not too strong, not too weak"),
    new PetalConfig("Light",6.75,1,15)
        .setMulti([1, 2, 2, 3, 3, 5, 5, 6, 7, 8], false, true)
        .setSize(.8)
        .setDescription("It's very light and recharges quickly, at the cost of damage"),
    new PetalConfig("Faster",22.5,5,12)
        .setSize(.8)
        .setExtraRadians(.021)
        .setSize(.8)
        .setDescription("This one makes your petals spin faster"),
    new PetalConfig("Heavy",67.5,200,5)
        .setSize(1.5)
        .setDensity(10)
        .setDescription("A more chunky petal that hits harder but takes longer to recharge"),
    new PetalConfig("Stinger",67.5,1,100)
        .setSize(.8)
        .setMulti([1, 1, 1, 1, 1, 3, 5, 5, 7, 7], 1, true)
        .setDescription("A fragile petal that deals lots of damage"),
    new PetalConfig("Rice",0,1,10)
        .setSize(1.7)
        .setDescription("A bit weak, but recharges instantly"),
    new PetalConfig("Rock",22.5,30,15)
        .setSize(1.5)
        .setDescription("It's a rock, not much to say about it"),
    new PetalConfig("Cactus",6.75,15,10)
        .setSize(1.4)
        .setExtraHealth(50)
        .setDescription("A petal that gives you extra health. Pretty magical if you ask me"),
    new PetalConfig("Leaf",22.5,16,12)
        .setSize(1.4)
        .setConstantHeal(5)
        .setDescription("A petal that heals you over time by the power of photosynthesis"),
    new PetalConfig("Wing",22.5,10,20)
        .setSize(1.4)
        .setWingMovement(true)
        .setDescription("It comes and it goes"),
    new PetalConfig("Bone",22.5,10,15)
        .setSize(1.8)
        .setArmor(6)
        .setDescription("A petal that reduces incoming damage"),
    new PetalConfig("Dirt",22.5,10,10)
        .setSize(1.3)
        .setExtraHealth(65)
        .setExtraSize(6)
        .setDescription("The extra Dirt gives your flower more mass"),
    new PetalConfig("Magnolia",0,0,0)
        .setDescription("Magnolia"),
    new PetalConfig("Corn",67.5,100,10)
        .setSize(1.6)
        .setDescription("It's a piece of corn. They say ants like to snack on it"),
    new PetalConfig("Sand",13.5,1,20)
        .setSize(.8)
        .setMulti([4, 4, 4, 4, 4, 4, 4, 5, 6, 7], true, true)
        .setDescription("Some fine grains of sand. They recharge quickly and can pack a punch"),
    new PetalConfig("Orange",22.5,20,21)
        .setSize(1.2)
        .setMulti([3, 3, 3, 3, 3, 3, 3, 4, 5, 6], true, true)
        .setDescription("A bunch of oranges. They're pretty juicy"),
    new PetalConfig("Missile",22.5,2,30)
        .setLaunchable(1.1, 45)
        .setSize(1.4)
        .setDescription("You can actually shoot this one!"),
    new PetalConfig("Pea.projectile",2109.4,3,3)
        .setDescription("[object null object]"),
    new PetalConfig("Rose",22.5,5,5)
        .setHealing(15)
        .setHuddles(1)
        .setNotAttraction(true)
        .setDescription("Not great at combat, but it's healing properties are amazing"),
    new PetalConfig("Yin Yang",6.75,10,10)
        .setSize(1.4)
        .setYinYang(1)
        .setDescription("The mysterious petal of balance"),
    new PetalConfig("Pollen",22.5,5,27)
        .setSize(.8)
        .setLaunchable(0, 75)
        .setMulti([1, 1, 2, 3, 3, 3, 3, 4, 5, 6], false, true)
        .setDescription("It makes you sneeze. Don't drop it!"),
    new PetalConfig("Honey",22.5,50,5)
        .setSize(1.4)
        .setEnemySpeedMultiplier(.5, 2)
        .setBouncing(22.5)
        .setDescription("It's sticky and will slow your enemies down"),
    new PetalConfig("Iris",22.5,5,5)
        .setSize(.8)
        .setPoison(30, 3)
        .setDescription("Packs an unexpected punch in its secret weapon: poison"),
    new PetalConfig("Web",22.5,100,0)
        .setSize(1.3)
        .setDescription("Sticky!")
        .setNotAttraction(true),
    new PetalConfig("Web.projectile",2109.4,1e5,0)
        .setSize(30)
        .setEnemySpeedMultiplier(.334, .05)
        .setIgnoreWalls(1)
        .setDescription("[object null object]"),
    new PetalConfig("Third Eye",0,0,0)
        .setExtraRange(.5)
        .setMulti(0, false)
        .setWearable(WEARABLES.THIRD_EYE)
        .setDescription("Through the eye of the beholder comes extra range"),
    new PetalConfig("Pincer",22.5,5,5)
        .setSize(1.2)
        .setPoison(30, .2)
        .setEnemySpeedMultiplier(.3, 1)
        .setDescription("Poisonous, and it slows down your enemies"),
    new PetalConfig("Beetle Egg",22.5,100,0)
        .setSize(1.8)
        .setHuddles(1)
        .setNotAttraction(true)
        .setDescription("Something might pop out of this"),
    new PetalConfig("Antennae",0,0,0)
        .setExtraVision(150)
        .setMulti(0, false)
        .setWearable(WEARABLES.ANTENNAE)
        .setDescription("These feelers give you some extra vision"),
    new PetalConfig("Peas",22.5,10,10)
        .setSize(1.2)
        .setNotAttraction(true)
        .setDescription("A pod of peas. They'll explode if you're not careful"),
    new PetalConfig("Stick",22.5,1e-10,0)
        .setSize(1.3)
        .setHuddles(1)
        .setPhases(true)
        .setNotAttraction(true)
        .setDescription("Wonder what will happen if you spin it"),
    new PetalConfig("Scorpion Missile.projectile",2109.4,5,2.5)
        .setPoison(10, 3)
        .setDescription("[object null object]"),
    new PetalConfig("Dahlia",13.5,1.25,3.75)
        .setHealing(4)
        .setSize(.7)
        .setHuddles(1)
        .setNotAttraction(true)
        .setMulti([3, 3, 3, 3, 3, 3, 3, 4, 5, 6], true)
        .setDescription("A very consistent trickle heal"),
    new PetalConfig("Primrose",0,0,0)
        .setDescription("Primrose"),
    new PetalConfig("Fire Spellbook",0,0,0)
        .setDescription("Fire Spellbook"),
    new PetalConfig("Deity",0,0,0)
        .setDescription("Deity"),
    new PetalConfig("Lightning",13.5,1e-10,0)
        .setSize(1.2)
        .setLightning(3, 128, 10)
        .setDescription("Shockingly shocking!"),
    new PetalConfig("Powder",22.5,5,5)
        .setSize(1.7)
        .setSpeedMultiplier(1.03)
        .setDescription("This special cocaine will make you go fast!"),
    new PetalConfig("Ant Egg",22.5,100,0)
        .setSize(1.3)
        .setMulti(4, false)
        .setHuddles(1)
        .setNotAttraction(true)
        .setDescription("Something might pop out of this"),
    new PetalConfig("Yucca",22.5,10,5)
        .setSize(1.3)
        .setConstantHeal(11, true)
        .setDescription("A strange leaf that heals you but only when you're in defensive mode"),
    new PetalConfig("Magnet",13.5,30,1)
        .setSize(1.8)
        .setExtraPickupRange(50)
        .setDescription("This petal's magnetic field will attract nearby items. Does not stack"),
    new PetalConfig("Amulet",0,0,0)
        .setDescription("Amulet"),
    new PetalConfig("Jelly",22.5,100,0)
        .setSize(1.3)
        .setDensity(25)
        .setDescription("Super bouncy! Knocks all your enemies around. Very fun to use and cause problems with"),
    new PetalConfig("Yggdrasil",67.5,50,0)
        .setSize(1.3)
        .setRevives(1, [1, 1, 90, 1, 225, 157.5, 90, 67.5, 45, 22.5])
        .setNotAttraction(true)
        .setHuddles(1)
        .setDescription("Revives a random player"),
    new PetalConfig("Glass",22.5,1e-10,10)
        .setSize(1.4)
        .setPhases(1)
        .setBouncing(22.5)
        .setDescription("Cannot damage an enemy more than once per second"),
    new PetalConfig("Dandelion",13.5,5,5)
        .setMulti([2, 2, 2, 2, 2, 2, 3, 4, 5, 6], false)
        .setSize(1.4)
        .setDescription("A paralyzing force"),
    new PetalConfig("Sponge",22.5,1e-10,0)
        .setSize(1.5)
        .setHuddles(1)
        .setNotAttraction(true)
        .setPhases(true)
        .setAbsorbsDamage(100, [45, 67.5, 112.5, 157.5, 225, 337.5, 450, 562.5, 675])
        .setDescription("It absorbs conventional damage done to your flower. If incoming damage is too great, you will suffer all of the damage the sponge has contained at once"),
    new PetalConfig("Pearl",225,1e3,20)
        .setSize(1.8)
        .setNotAttraction(true)
        .setPlaceDown(1)
        .setDescription("A pearl that can be placed on the ground. You can call it back to you at any time"),
    new PetalConfig("Shell",22.5,20,5)
        .setSize(1.5)
        .setShield(20)
        .setHuddles(1)
        .setNotAttraction(true)
        .setDescription("Provides extra protection through a shield"),
    new PetalConfig("Bubble",0,1e-10,0)
        .setSize(1.3)
        .setBoost(22.5, [22.5, 20.25, 18, 15.75, 13.5, 11.25, 9, 6.75, 4.5, 2.25])
        .setNotAttraction(true)
        .setDescription("It will boost you when you pop it"),
    new PetalConfig("Air",0,0,0)
        .setMulti([1, 2, 3, 4, 6, 8, 12, 16, 32, 64], false)
        .setDescription("Makes big space in your slots!"),
    new PetalConfig("Starfish",22.5,7,5)
        .setSize(1.5)
        .setConstantHeal(11, false, .7)
        .setDescription("A leg of a starfish. It will heal you quite effectively while you are under 70% health"),
    new PetalConfig("Fang",22.5,1,20)
        .setSize(1.3)
        .setHealBack(.25)
        .setDescription("It will heal back the damage it causes"),
    new PetalConfig("Goo",0,0,0)
        .setDescription("Goo"),
    new PetalConfig("Maggot Poo",0,0,0)
        .setDescription("Maggo Poo"),
    new PetalConfig("Lightbulb",6.75,10,5)
        .setSize(1.4)
        .setLighting(1)
        .setIcon(1, 1, "Bulb")
        .setAttractsAggro(1)
        .setDescription("A glowing bulb that attracts attention"),
    new PetalConfig("Battery",22.5,1e-10,0)
        .setPhases(1)
        .setSize(1.4)
        .setNotAttraction(true)
        .setLightning(3, 128, 10, 3, true)
        .setDescription("A battery that can release electric charges when its parent is hit"),
    new PetalConfig("Dust",0,0,0)
        .setDescription("Dust"),
    new PetalConfig("Armor",0,0,0)
        .setDescription("Armor"),
    new PetalConfig("Wasp Missile.projectile",0,0,0)
        .setDescription("Wasp Projectile"),
    new PetalConfig("Shrub",0,0,0)
        .setDescription("Shrub"),
    new PetalConfig("projectile.grape",2109.4,1,4)
        .setPoison(30, 1)
        .setDescription("[object null object]"),
    new PetalConfig("Grapes",22.5,5,8)
        .setSize(1.2)
        .setPoison(30, 1)
        .setNotAttraction(true)
        .setDescription("With an added bonus: Poison!"),
    new PetalConfig("Lantern",0,0,0)
        .setDescription("Lantern"),
    new PetalConfig("web.player.launched",2109.4,1e5,0)
        .setSize(30)
        .setEnemySpeedMultiplier(.7, .05)
        .setIgnoreWalls(1)
        .setDescription("[object null object]"),
    new PetalConfig("Branch",0,0,0)
        .setDescription("Branch"),
    new PetalConfig("Leech Egg",0,0,0)
        .setDescription("Leech Egg"),
    new PetalConfig("Hornet Egg",0,0,0)
        .setDescription("Hornet Egg"),
    new PetalConfig("Candy",0,0,0)
        .setDescription("Candy"),
    new PetalConfig("Claw",22.5,5,20)
        .setSize(1.2)
        .setExtraDamage(.8, 1, 5)
        .setDescription("Sharp against the strong, weak against the weak"),
    new PetalConfig("Bullet.projectile",0,0,0)
        .setDescription("Bullet"),
    new PetalConfig("Square Egg",0,0,0)
        .setSize(1.2)
        .setDescription("Square"),
    new PetalConfig("Triangle Egg",0,0,0)
        .setDescription("Triangle"),
    new PetalConfig("Pentagon Egg",0,0,0)
        .setDescription("Pentagon"),
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
    new PetalConfig("Blank",22.5,10,10)
        .setDescription("Blank")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffffff", .2, .2)),
    new PetalConfig("Blank",22.5,10,10)
        .setDescription("Blank")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffffff", .2, .2)),
    new PetalConfig("Blank",22.5,10,10)
        .setDescription("Blank")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffffff", .2, .2)),
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
    new PetalConfig("Blank",22.5,10,10)
        .setDescription("Blank")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffffff", .2, .2)),
    new PetalConfig("Blank",22.5,10,10)
        .setDescription("Blank")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffffff", .2, .2)),
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
    new PetalConfig("Blank",22.5,10,10)
        .setDescription("Blank")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffffff", .2, .2)),
    new PetalConfig("Blank",22.5,10,10)
        .setDescription("Blank")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffffff", .2, .2)),
    new PetalConfig("Blank",22.5,10,10)
        .setDescription("Blank")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffffff", .2, .2)),
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
    new PetalConfig("Blank",22.5,10,10)
        .setDescription("Blank")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffffff", .2, .2)),
    new PetalConfig("Blank",22.5,10,10)
        .setDescription("Blank")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffffff", .2, .2)),
    new PetalConfig("Blank",22.5,10,10)
        .setDescription("Blank")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffffff", .2, .2)),
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
    new PetalConfig("Blank",22.5,10,10)
        .setDescription("Blank")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffffff", .2, .2)),
    new PetalConfig("Blank",22.5,10,10)
        .setDescription("Blank")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffffff", .2, .2)),
    new PetalConfig("Blank",22.5,10,10)
        .setDescription("Blank")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffffff", .2, .2)),
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
    new PetalConfig("Blank",22.5,10,10)
        .setDescription("Blank")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffffff", .2, .2)),
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
    new PetalConfig("Blank",22.5,10,10)
        .setDescription("Blank")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffffff", .2, .2)),
    new PetalConfig("Blank",22.5,10,10)
        .setDescription("Blank")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffffff", .2, .2)),
    new PetalConfig("Blank",22.5,10,10)
        .setDescription("Blank")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffffff", .2, .2)),
    new PetalConfig("Blank",22.5,10,10)
        .setDescription("Blank")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffffff", .2, .2)),
    new PetalConfig("Blank",22.5,10,10)
        .setDescription("Blank")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffffff", .2, .2)),
    new PetalConfig("Blank",22.5,10,10)
        .setDescription("Blank")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffffff", .2, .2)),
    new PetalConfig("Blank",22.5,10,10)
        .setDescription("Blank")
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffffff", .2, .2)),
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
    new MobConfig("Ladybug",62.5,10,25,3.5)
        .setNeutral(1)
        .addDrop(petalIDOf("Rose"), .6)
        .addDrop(petalIDOf("Light"), .45),
    new MobConfig("Rock",75,10,30.5,0)
        .addDrop(petalIDOf("Rock"), .25)
        .addDrop(petalIDOf("Heavy"), .15, 2),
    new MobConfig("Bee",37.5,50,26,4)
        .setMoveInSines(1)
        .setNeutral(1)
        .addDrop(petalIDOf("Honey"), .25, 2)
        .addDrop(petalIDOf("Stinger"), .45)
        .addDrop(petalIDOf("Pollen"), .25, 1),
    new MobConfig("Spider",62.5,20,20,4)
        .setAggressive(1)
        .setPoison(10, 3)
        .setProjectile({
                petalIndex: petalIDOf("Web") + 1,
                cooldown: 22.5,
                health: 1 / 0,
                damage: 0,
                speed: 0,
                range: 72,
                center: true,
                size: 1,
                runs: true,
                nullCollision: true
            })
        .addDrop(petalIDOf("Web"), .45, 1)
        .addDrop(petalIDOf("Faster"), .25)
        .addDrop(petalIDOf("Third Eye"), 0, 5),
    new MobConfig("Beetle",100,30,36,3)
        .setAggressive(1)
        .setBeetleMovement(1)
        .addDrop(petalIDOf("Beetle Egg"), 1),
    new MobConfig("Leafbug",50,30,36,3.5)
        .setNeutral(1)
        .setArmor(9)
        .addDrop(petalIDOf("Leaf"), .6)
        .addDrop(petalIDOf("Root"), .6)
        .addDrop(petalIDOf("Golden Leaf"), 0, 5),
    new MobConfig("Roach",62.5,20,34,6.5)
        .setNeutral(1)
        .addDrop(petalIDOf("Antennae"), 1, 2)
        .addDrop(petalIDOf("Iris"), .25, 1),
    new MobConfig("Hornet",62.5,50,30,3)
        .setAggressive(1)
        .setProjectile({
                petalIndex: petalIDOf("Missile"),
                cooldown: 33.75,
                health: 62.5,
                damage: 10,
                recoil: 8,
                speed: 6.75,
                aimbot: true,
                range: 45
            })
        .addDrop(petalIDOf("Missile"), .6)
        .addDrop(petalIDOf("Antennae"), 1, 2)
        .addDrop(petalIDOf("Dandelion"), .45, 1),
    new MobConfig("Mantis",125,20,34,2)
        .setAggressive(1)
        .setProjectile({
                petalIndex: petalIDOf("Pea.projectile"),
                cooldown: 33.75,
                health: 25,
                damage: 10,
                speed: 7.5,
                recoil: 3,
                range: 45,
                size: .2,
                aimbot: true,
                multiShot: {
                    count: 3,
                    delay: 256
                }
            })
        .addDrop(petalIDOf("Peas"), .45),
    new MobConfig("Pupa",0,0,0),
    new MobConfig("Sandstorm",125,40,42,3)
        .setAggressive(1)
        .setSandstormMovement(1)
        .setDensity(0)
        .setPushability(0)
        .setSize(42, MobTier.SIZE_SCALE, .9, .25)
        .setSpins(0, true)
        .addDrop(petalIDOf("Glass"), .6)
        .addDrop(petalIDOf("Sand"), .45)
        .addDrop(petalIDOf("Stick"), .15, 2),
    new MobConfig("Scorpion",100,10,32.5,3)
        .setAggressive(1)
        .setProjectile({
                petalIndex: petalIDOf("Scorpion Missile.projectile"),
                cooldown: 33.75,
                health: 37.5,
                damage: 10,
                speed: 7,
                range: 45,
                size: .2
            })
        .addDrop(petalIDOf("Pincer"), 1, 1)
        .addDrop(petalIDOf("Iris"), 1, 1),
    new MobConfig("Demon",0,0,0,0),
    new MobConfig("Jellyfish",125,20,38,2.5)
        .setAggressive(1)
        .setSpins(.1, true)
        .setLightning(24, 4, 128, 7)
        .addDrop(petalIDOf("Jelly"), .6)
        .addDrop(petalIDOf("Lightning"), .25),
    new MobConfig("Cactus",37.5,50,30,0)
        .setPushability(.5)
        .addDrop(petalIDOf("Cactus"), .6),
    new MobConfig("Baby Ant",25,10,16,3.5)
        .addDrop(petalIDOf("Light"), .6)
        .addDrop(petalIDOf("Leaf"), .6)
        .addDrop(petalIDOf("Rice"), .25),
    new MobConfig("Worker Ant",62.5,10,18,3.5)
        .setNeutral(1)
        .addDrop(petalIDOf("Leaf"), .25)
        .addDrop(petalIDOf("Corn"), .45),
    new MobConfig("Soldier Ant",100,10,18,3.5)
        .setAggressive(1)
        .addDrop(petalIDOf("Glass"), .25)
        .addDrop(petalIDOf("Clover"), .25),
    new MobConfig("Queen Ant",250,10,28,3.5)
        .setAggressive(1)
        .setPushability(.6)
        .addDrop(petalIDOf("Ant Egg"), .6)
        .addDrop(petalIDOf("Ant Egg"), .6)
        .addDrop(petalIDOf("Horn"), .01, 2),
    new MobConfig("Ant Hole",0,0,0,0),
    new MobConfig("Baby Fire Ant",25,20,15,3.5)
        .addDrop(petalIDOf("Light"), .6)
        .addDrop(petalIDOf("Broccoli"), .25)
        .addDrop(petalIDOf("Yucca"), 1, 1),
    new MobConfig("Worker Fire Ant",37.5,20,15,3.5)
        .setNeutral(1)
        .addDrop(petalIDOf("Yucca"), 1, 1)
        .addDrop(petalIDOf("Corn"), .45),
    new MobConfig("Soldier Fire Ant",62.5,20,15,3.5)
        .setAggressive(1)
        .addDrop(petalIDOf("Yucca"), 1, 1)
        .addDrop(petalIDOf("Bone"), .1),
    new MobConfig("Queen Fire Ant",250,20,25,3.5)
        .setAggressive(1)
        .setPushability(.6)
        .addDrop(petalIDOf("Ant Egg"))
        .addDrop(petalIDOf("Ant Egg")),
    new MobConfig("Fire Ant Hole",0,0,0,0),
    new MobConfig("Baby Termite",25,10,16,3.5)
        .addDrop(petalIDOf("Light"), .25)
        .setDamageReflection(.01)
        .addDrop(petalIDOf("Relic"), .1, 1),
    new MobConfig("Worker Termite",62.5,10,18,3.5)
        .setNeutral(1)
        .setDamageReflection(.01)
        .addDrop(petalIDOf("Corn"), .45)
        .addDrop(petalIDOf("Relic"), .1, 1),
    new MobConfig("Soldier Termite",100,10,18,3.5)
        .setAggressive(1)
        .setDamageReflection(.01)
        .addDrop(petalIDOf("Triangle"), .25)
        .addDrop(petalIDOf("Relic"), .1, 1),
    new MobConfig("Termite Overmind",425,10,42,.5)
        .setAggressive(1)
        .setDamageReflection(.01)
        .setPushability(.2)
        .addDrop(petalIDOf("Relic"), 1, 1)
        .addDrop(petalIDOf("Ant Egg"), .25, 2)
        .addDrop(petalIDOf("Compass"), .25, 2),
    new MobConfig("Termite Mound",0,0,0,0),
    new MobConfig("Ant Egg",150,3,17,0)
        .addDrop(petalIDOf("Ant Egg"), .6)
        .setPushability(.1),
    new MobConfig("Queen Ant Egg",150,3,17,0)
        .setPushability(.1)
        .setSystem(true)
        .setWavesHidden(),
    new MobConfig("Fire Ant Egg",150,3,17,0)
        .addDrop(petalIDOf("Ant Egg"), .6)
        .setPushability(.1),
    new MobConfig("Queen Fire Ant Egg",150,3,17,0)
        .setPushability(.1)
        .setSystem(true)
        .setWavesHidden(),
    new MobConfig("Termite Egg",150,3,17,0)
        .addDrop(petalIDOf("Ant Egg"), .6)
        .setPushability(.1),
    new MobConfig("Dark Ladybug",85,10,25,3.5)
        .setNeutral(1)
        .addDrop(petalIDOf("Dahlia"), 1, 1)
        .addDrop(petalIDOf("Yin Yang"), .15, 2),
    new MobConfig("Shiny Ladybug",85,10,25,3.5)
        .setNeutral(1)
        .addDrop(petalIDOf("Rose"), .6)
        .addDrop(petalIDOf("Dahlia"), 1, 1)
        .addDrop(petalIDOf("Yggdrasil"), .25, 4),
    new MobConfig("Aquatic Ladybug",85,10,25,3.5)
        .setNeutral(1)
        .addDrop(petalIDOf("Light"), .6)
        .addDrop(petalIDOf("Yin Yang"), 1, 2),
    new MobConfig("Centipede",25,10,24,3.5)
        .setNeutral(1)
        .setCentipedeMovement(1)
        .addDrop(petalIDOf("Peas"), .15)
        .addDrop(petalIDOf("Leaf"), .05),
    new MobConfig("Centipede",25,10,24,3.5)
        .setSystem(1)
        .setNeutral(1)
        .setCentipedeMovement(1)
        .addDrop(petalIDOf("Peas"), .15)
        .addDrop(petalIDOf("Leaf"), .05),
    new MobConfig("Desert Centipede",25,10,24,5)
        .setDesertCentipedeMovement(1)
        .addDrop(petalIDOf("Salt"), .25, 1)
        .addDrop(petalIDOf("Powder"), .15),
    new MobConfig("Desert Centipede",25,10,24,5)
        .setSystem(1)
        .setDesertCentipedeMovement(1)
        .addDrop(petalIDOf("Salt"), .25, 1)
        .addDrop(petalIDOf("Powder"), .15),
    new MobConfig("Evil Centipede",25,10,24,3.5)
        .setNeutral(1)
        .setCentipedeMovement(1)
        .addDrop(petalIDOf("Grapes"), .15)
        .addDrop(petalIDOf("Iris"), .05, 1),
    new MobConfig("Evil Centipede",25,10,24,3.5)
        .setSystem(1)
        .setNeutral(1)
        .setCentipedeMovement(1)
        .addDrop(petalIDOf("Grapes"), .15)
        .addDrop(petalIDOf("Iris"), .05, 1),
    new MobConfig("Dandelion",75,10,24,0)
        .setPushability(.5)
        .addDrop(petalIDOf("Dandelion"), 1, 1),
    new MobConfig("Sponge",125,10,42,0)
        .addDrop(petalIDOf("Sponge"), 1, 1)
        .addDrop(petalIDOf("Coral"), .45, 1),
    new MobConfig("Bubble",1,5,42,.2)
        .setPush(3.2, 100)
        .setArmor(9)
        .addDrop(petalIDOf("Air"), 1)
        .addDrop(petalIDOf("Bubble"), .45),
    new MobConfig("Shell",100,10,34,30)
        .setMovesInBursts(1)
        .setNeutral(1)
        .setArmor(3)
        .addDrop(petalIDOf("Shell"), .25)
        .addDrop(petalIDOf("Magnet"), .05, 2),
    new MobConfig("Starfish",50,20,30,4)
        .setAggressive(1)
        .setSpins(1)
        .setHealing(.007)
        .setFleeAtLowHealth(.4)
        .addDrop(petalIDOf("Starfish"), 1)
        .addDrop(petalIDOf("Sand"), .25)
        .addDrop(petalIDOf("Salt"), .25, 1),
    new MobConfig("Leech",100,10,16,5)
        .setAggressive(1)
        .addDrop(petalIDOf("Fang"), .2)
        .addDrop(petalIDOf("Faster"), .25),
    new MobConfig("Maggot",0,0,0,0),
    new MobConfig("Firefly",40,10,24,4)
        .setMoveInSines(1)
        .addDrop(petalIDOf("Wing"), .6)
        .addDrop(petalIDOf("Lightbulb"), .45)
        .addDrop(petalIDOf("Battery"), .45),
    new MobConfig("Bumblebee",62.5,20,30,5)
        .setMoveInSines(1)
        .setBumblebeeMovement(1)
        .setProjectile({
                petalIndex: petalIDOf("Pollen"),
                cooldown: 11.25,
                health: 12.5,
                center: true,
                damage: 10,
                speed: 0,
                range: 120
            })
        .addDrop(petalIDOf("Pollen"), 1, 1)
        .addDrop(petalIDOf("Wax"), .45, 2)
        .addDrop(petalIDOf("Honey"), .25, 2),
    new MobConfig("Moth",37.5,10,20,3)
        .setMoveInSines(1)
        .setNeutral(1)
        .setFleeAtLowHealth(1)
        .addDrop(petalIDOf("Wing"), .6)
        .addDrop(petalIDOf("Lightbulb"), .45),
    new MobConfig("Fly",62.5,10,24,6)
        .setAggressive(1)
        .setMoveInSines(1)
        .addDrop(petalIDOf("Wing"), .6),
    new MobConfig("Square",100,0,0,0),
    new MobConfig("Triangle",0,0,0,0),
    new MobConfig("Pentagon",0,0,0,0),
    new MobConfig("Hell Beetle",150,50,35,4)
        .addDrop(petalIDOf("Beetle Egg"), 1)
        .addDrop(petalIDOf("Stinger"), .4)
        .addDrop(petalIDOf("Mark"), 0)
        .setAggressive(1)
        .setBeetleMovement(1),
    new MobConfig("Hell Spider",150,20,20,4)
        .addDrop(petalIDOf("Web"), 1)
        .addDrop(petalIDOf("Stinger"), .4)
        .addDrop(petalIDOf("Third Eye"), 0, 5)
        .addDrop(petalIDOf("Mark"), 0)
        .setAggressive(1)
        .setPoison(30, 3)
        .setProjectile({
                petalIndex: petalIDOf("Web") + 1,
                cooldown: 22.5,
                health: 1 / 0,
                damage: 0,
                stops: true,
                speed: 50,
                range: 120,
                size: 1,
                runs: true,
                nullCollision: true
            }),
    new MobConfig("Hell Hornet",125,50,36,4)
        .setAggressive(1)
        .setProjectile({
                petalIndex: petalIDOf("Blood Stinger"),
                cooldown: 33.75,
                health: 62.5,
                damage: 10,
                speed: 6.5,
                recoil: 8,
                aimbot: true,
                range: 45,
                aimbot: true
            })
        .addDrop(petalIDOf("Antennae"), 1, 2)
        .addDrop(petalIDOf("Blood Stinger"), .6)
        .addDrop(petalIDOf("Wing"), .6)
        .addDrop(petalIDOf("Mark"), 0),
    new MobConfig("Termite Overmind Egg",150,3,17,0)
        .setPushability(.1)
        .setSystem(true)
        .setWavesHidden(),
    new MobConfig("Spirit",1,0,0,0),
    new MobConfig("Wasp",0,0,0,0),
    new MobConfig("Stickbug",0,0,0,0),
    new MobConfig("Pine",125,10,36,0)
        .setPushability(0)
        .addDrop(petalIDOf("Fig"), 1),
    new MobConfig("Hell Centipede",50,20,24,4)
        .setAggressive(1)
        .addDrop(petalIDOf("Stinger"), .4)
        .addDrop(petalIDOf("Mark"), 0)
        .setSize(24, MobTier.SIZE_SCALE, .75, .25),
    new MobConfig("Hell Centipede",50,20,24,4)
        .addDrop(petalIDOf("Stinger"), .4)
        .addDrop(petalIDOf("Mark"), 0)
        .setSystem(1)
        .setAggressive(1)
        .setSize(24, MobTier.SIZE_SCALE, .75, .25),
    new MobConfig("Wilt",25,10,30,0)
        .setPushability(0)
        .addDrop(petalIDOf("Leaf"), .6),
    new MobConfig("Wilt",0,0,0,0),
    new MobConfig("Pumpkin",62.5,10,32,0)
        .setExplodes("pumpkin.explosion")
        .addDrop(petalIDOf("Root"), .25)
        .addDrop(petalIDOf("Pumpkin Seed"), .25, 1),
    new MobConfig("Jack O' Lantern",0,0,0,0),
    new MobConfig("Crab",125,20,32,7)
        .setAggressive(1)
        .setStrafes(125, 25, .5)
        .addDrop(petalIDOf("Claw"), .6)
        .addDrop(petalIDOf("Sand"), .45)
        .addDrop(petalIDOf("Carapace"), .25),
    new MobConfig("Tank",0,0,0,0),
    new MobConfig("Dummy",1e10,10,25,0)
        .setPushability(0)
        .setSystem(true)
        .setDummy(true)
        .setSize(25, 1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#999999", .2, .2)),
    new MobConfig("Desert Dummy",1e10,30,25,0)
        .setPushability(0)
        .setSystem(true)
        .setDummy(true)
        .setSize(25, 1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#915db0", .2, .2).addAction("beginPath").addAction("circle", 0, 0, .5).addAction("stroke", "#915db0", .25, .2)),
    new MobConfig("Ocean Dummy",1e10,20,25,0)
        .setPushability(0)
        .setSystem(true)
        .setDummy(true)
        .setSize(25, 1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#988eba", .2, .2).addAction("beginPath").addAction("line", .05, 0, .25, .3).addAction("line", .05, 0, -.15, .5).addAction("line", .05, 0, -.55, -.05).addAction("line", .05, 0, -.1, -.35).addAction("line", .05, 0, .45, -.4).addAction("line", .05, 0, .35, .1).addAction("line", .05, 0, -.05, .25).addAction("line", .25, .3, .45, .55).addAction("line", .25, .3, .55, .2).addAction("line", -.15, .5, -.3, .85).addAction("line", -.15, .5, .15, .8).addAction("line", -.55, -.05, -.9, -.2).addAction("line", -.55, -.05, -.85, .25).addAction("line", -.1, -.35, -.05, -.75).addAction("line", -.1, -.35, -.4, -.65).addAction("line", .45, -.4, .7, -.8).addAction("line", .45, -.4, .85, -.3).addAction("line", .35, .1, .65, .25).addAction("line", .35, .1, .6, -.15).addAction("line", -.05, .25, -.15, .6).addAction("line", -.05, .25, .2, .55).addAction("line", .05, 0, -.05, .25).addAction("stroke", "#F66767", .4, .2).addAction("stroke", "#F66767", .2, 0)),
    new MobConfig("Ant Dummy",1e10,10,25,0)
        .setPushability(0)
        .setSystem(true)
        .setDummy(true)
        .setSize(25, 1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#555555", .2, .2).addAction("beginPath").addAction("circle", 0, 0, .625).addAction("stroke", "#555555", .2, .2).addAction("beginPath").addAction("circle", 0, 0, .25).addAction("stroke", "#555555", .2, .2)),
    new MobConfig("Fire Ant Dummy",1e10,20,25,0)
        .setPushability(0)
        .setSystem(true)
        .setDummy(true)
        .setSize(25, 1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#a82a01", .2, .2).addAction("beginPath").addAction("circle", 0, 0, .625).addAction("stroke", "#a82a01", .2, .2).addAction("beginPath").addAction("circle", 0, 0, .25).addAction("stroke", "#a82a01", .2, .2)),
    new MobConfig("Termite Dummy",1e10,10,25,0)
        .setPushability(0)
        .setSystem(true)
        .setDummy(true)
        .setSize(25, 1)
        .setDamageReflection(.01)
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#d3a35b", .2, .2).addAction("beginPath").addAction("circle", 0, 0, .625).addAction("stroke", "#d3a35b", .2, .2).addAction("beginPath").addAction("circle", 0, 0, .25).addAction("stroke", "#d3a35b", .2, .2)),
    new MobConfig("Dark Forest Dummy",1e10,50,25,0)
        .setPushability(0)
        .setSystem(true)
        .setDummy(true)
        .setSize(25, 1)
        .setPoison(10, 3)
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#c8803c", .2, .2).addAction("beginPath").addAction("dipPolygon", 7, .5, -2, 0).addAction("stroke", "#222222", .25, 0)),
    new MobConfig("Factory Dummy",1e10,50,25,0)
        .setArmor(3)
        .setSystem(true)
        .setDummy(true)
        .setPushability(0)
        .setSize(25, 1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#8F9699", .2, .2).addAction("beginPath").addAction("circle", 0, 0, .5).addAction("stroke", "#ECD54A", .25, 0)),
    new MobConfig("Sewers Dummy",1e10,50,25,0)
        .setSystem(true)
        .setDummy(true)
        .setPushability(0)
        .setSize(25, 1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#4a7c4e", .2, .2).addAction("beginPath").addAction("polygon", 6, .5, 0).addAction("stroke", "#2d5c31", .25, 0)),
    new MobConfig("Hell Dummy",1e10,50,25,0)
        .setSystem(true)
        .setDummy(true)
        .setPushability(0)
        .setSize(25, 1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#b12524", .2, .2).addAction("beginPath").addAction("spikeBall", 5, .75, 0).addAction("stroke", "#b12524", .2, .2).addAction("beginPath").addAction("polygon", 5, .35, Math.PI).addAction("stroke", "#b12524", .2, .2)),
    new MobConfig("Portal",1e4,1,64,0)
        .setHealing(1)
        .setSystem(true)
        .setPortal(true)
        .setPushability(0)
        .setDensity(0)
        .setSpins(1.6, true)
        .setDrawing((new Drawing).addAction("opacity", .5).addAction("beginPath").addAction("polygon", 6, 1, "date_.0004").addAction("fill", "#ffffff").addAction("stroke", "#ffffff", .2, 0).addAction("beginPath").addAction("polygon", 6, .9, "date_.0003").addAction("fill", "#ffffff").addAction("stroke", "#ffffff", .2, 0).addAction("beginPath").addAction("polygon", 6, .8, "date_.0007").addAction("fill", "#ffffff").addAction("stroke", "#ffffff", .2, 0).addAction("beginPath").addAction("polygon", 6, .7, "date_.0003").addAction("fill", "#ffffff").addAction("stroke", "#ffffff", .2, 0).addAction("beginPath").addAction("polygon", 6, .6, "date_.0006").addAction("fill", "#ffffff").addAction("stroke", "#ffffff", .2, 0).addAction("beginPath").addAction("polygon", 6, .5, "date_.0004").addAction("fill", "#ffffff").addAction("stroke", "#ffffff", .2, 0).addAction("beginPath").addAction("polygon", 6, .4, "date_.0003").addAction("fill", "#ffffff").addAction("stroke", "#ffffff", .2, 0).addAction("beginPath").addAction("polygon", 6, .3, "date_.0007").addAction("fill", "#ffffff").addAction("stroke", "#ffffff", .2, 0).addAction("beginPath").addAction("polygon", 6, .2, "date_.0005").addAction("fill", "#ffffff").addAction("stroke", "#ffffff", .2, 0).addAction("beginPath").addAction("polygon", 6, .1, "date_.0007").addAction("fill", "#ffffff").addAction("stroke", "#ffffff", .2, 0))
        .setProjectile({
                petalIndex: petalIDOf("portal.particle"),
                cooldown: 3.8,
                health: 1e4,
                damage: 0,
                random: true,
                speed: 1.5,
                range: 24,
                size: .1,
                runs: true,
                nullCollision: true
            })
        .setFriendly(true),
    new MobConfig("Garden Portal",1e4,1,64,0)
        .setHealing(1)
        .setSystem(true)
        .setPortal(true)
        .setPushability(0)
        .setDensity(0)
        .setSpins(1.6, true)
        .setDrawing((new Drawing).addAction("opacity", .5).addAction("beginPath").addAction("polygon", 6, 1, "date_.0003").addAction("fill", "#2ec778").addAction("stroke", "#2ec778", .2, 0).addAction("beginPath").addAction("polygon", 6, .9, "date_.0006").addAction("fill", "#2ec778").addAction("stroke", "#2ec778", .2, 0).addAction("beginPath").addAction("polygon", 6, .8, "date_.0006").addAction("fill", "#2ec778").addAction("stroke", "#2ec778", .2, 0).addAction("beginPath").addAction("polygon", 6, .7, "date_.0007").addAction("fill", "#2ec778").addAction("stroke", "#2ec778", .2, 0).addAction("beginPath").addAction("polygon", 6, .6, "date_.0006").addAction("fill", "#2ec778").addAction("stroke", "#2ec778", .2, 0).addAction("beginPath").addAction("polygon", 6, .5, "date_.0006").addAction("fill", "#2ec778").addAction("stroke", "#2ec778", .2, 0).addAction("beginPath").addAction("polygon", 6, .4, "date_.0007").addAction("fill", "#2ec778").addAction("stroke", "#2ec778", .2, 0).addAction("beginPath").addAction("polygon", 6, .3, "date_.0004").addAction("fill", "#2ec778").addAction("stroke", "#2ec778", .2, 0).addAction("beginPath").addAction("polygon", 6, .2, "date_.0003").addAction("fill", "#2ec778").addAction("stroke", "#2ec778", .2, 0).addAction("beginPath").addAction("polygon", 6, .1, "date_.0005").addAction("fill", "#2ec778").addAction("stroke", "#2ec778", .2, 0))
        .setProjectile({
                petalIndex: petalIDOf("garden.particle"),
                cooldown: 3.8,
                health: 1e4,
                damage: 0,
                random: true,
                speed: 1.5,
                range: 18,
                size: .1,
                runs: true,
                nullCollision: true
            })
        .setFriendly(true),
    new MobConfig("Ant Hell Portal",1e4,1,64,0)
        .setHealing(1)
        .setSystem(true)
        .setPortal(true)
        .setPushability(0)
        .setDensity(0)
        .setSpins(1.6, true)
        .setDrawing((new Drawing).addAction("opacity", .5).addAction("beginPath").addAction("polygon", 6, 1, "date_.0004").addAction("fill", "#bd8458").addAction("stroke", "#bd8458", .2, 0).addAction("beginPath").addAction("polygon", 6, .9, "date_.0004").addAction("fill", "#bd8458").addAction("stroke", "#bd8458", .2, 0).addAction("beginPath").addAction("polygon", 6, .8, "date_.0006").addAction("fill", "#bd8458").addAction("stroke", "#bd8458", .2, 0).addAction("beginPath").addAction("polygon", 6, .7, "date_.0007").addAction("fill", "#bd8458").addAction("stroke", "#bd8458", .2, 0).addAction("beginPath").addAction("polygon", 6, .6, "date_.0003").addAction("fill", "#bd8458").addAction("stroke", "#bd8458", .2, 0).addAction("beginPath").addAction("polygon", 6, .5, "date_.0006").addAction("fill", "#bd8458").addAction("stroke", "#bd8458", .2, 0).addAction("beginPath").addAction("polygon", 6, .4, "date_.0003").addAction("fill", "#bd8458").addAction("stroke", "#bd8458", .2, 0).addAction("beginPath").addAction("polygon", 6, .3, "date_.0007").addAction("fill", "#bd8458").addAction("stroke", "#bd8458", .2, 0).addAction("beginPath").addAction("polygon", 6, .2, "date_.0003").addAction("fill", "#bd8458").addAction("stroke", "#bd8458", .2, 0).addAction("beginPath").addAction("polygon", 6, .1, "date_.0005").addAction("fill", "#bd8458").addAction("stroke", "#bd8458", .2, 0))
        .setProjectile({
                petalIndex: petalIDOf("anthell.particle"),
                cooldown: 3.8,
                health: 1e4,
                damage: 0,
                random: true,
                speed: 1.5,
                range: 18,
                size: .1,
                runs: true,
                nullCollision: true
            })
        .setFriendly(true),
    new MobConfig("Ant Portal",1e4,1,64,0)
        .setHealing(1)
        .setSystem(true)
        .setPortal(true)
        .setPushability(0)
        .setDensity(0)
        .setSpins(1.6, true)
        .setDrawing((new Drawing).addAction("opacity", .5).addAction("beginPath").addAction("polygon", 6, 1, "date_.0006").addAction("fill", "#555555").addAction("stroke", "#555555", .2, 0).addAction("beginPath").addAction("polygon", 6, .9, "date_.0007").addAction("fill", "#555555").addAction("stroke", "#555555", .2, 0).addAction("beginPath").addAction("polygon", 6, .8, "date_.0006").addAction("fill", "#555555").addAction("stroke", "#555555", .2, 0).addAction("beginPath").addAction("polygon", 6, .7, "date_.0006").addAction("fill", "#555555").addAction("stroke", "#555555", .2, 0).addAction("beginPath").addAction("polygon", 6, .6, "date_.0006").addAction("fill", "#555555").addAction("stroke", "#555555", .2, 0).addAction("beginPath").addAction("polygon", 6, .5, "date_.0004").addAction("fill", "#555555").addAction("stroke", "#555555", .2, 0).addAction("beginPath").addAction("polygon", 6, .4, "date_.0007").addAction("fill", "#555555").addAction("stroke", "#555555", .2, 0).addAction("beginPath").addAction("polygon", 6, .3, "date_.0007").addAction("fill", "#555555").addAction("stroke", "#555555", .2, 0).addAction("beginPath").addAction("polygon", 6, .2, "date_.0003").addAction("fill", "#555555").addAction("stroke", "#555555", .2, 0).addAction("beginPath").addAction("polygon", 6, .1, "date_.0004").addAction("fill", "#555555").addAction("stroke", "#555555", .2, 0))
        .setProjectile({
                petalIndex: petalIDOf("ant.particle"),
                cooldown: 3.8,
                health: 1e4,
                damage: 0,
                random: true,
                speed: 1.5,
                range: 18,
                size: .1,
                runs: true,
                nullCollision: true
            })
        .setFriendly(true),
    new MobConfig("Fire Ant Portal",1e4,1,64,0)
        .setHealing(1)
        .setSystem(true)
        .setPortal(true)
        .setPushability(0)
        .setDensity(0)
        .setSpins(1.6, true)
        .setDrawing((new Drawing).addAction("opacity", .5).addAction("beginPath").addAction("polygon", 6, 1, "date_.0004").addAction("fill", "#a82a01").addAction("stroke", "#a82a01", .2, 0).addAction("beginPath").addAction("polygon", 6, .9, "date_.0005").addAction("fill", "#a82a01").addAction("stroke", "#a82a01", .2, 0).addAction("beginPath").addAction("polygon", 6, .8, "date_.0004").addAction("fill", "#a82a01").addAction("stroke", "#a82a01", .2, 0).addAction("beginPath").addAction("polygon", 6, .7, "date_.0004").addAction("fill", "#a82a01").addAction("stroke", "#a82a01", .2, 0).addAction("beginPath").addAction("polygon", 6, .6, "date_.0004").addAction("fill", "#a82a01").addAction("stroke", "#a82a01", .2, 0).addAction("beginPath").addAction("polygon", 6, .5, "date_.0003").addAction("fill", "#a82a01").addAction("stroke", "#a82a01", .2, 0).addAction("beginPath").addAction("polygon", 6, .4, "date_.0005").addAction("fill", "#a82a01").addAction("stroke", "#a82a01", .2, 0).addAction("beginPath").addAction("polygon", 6, .3, "date_.0004").addAction("fill", "#a82a01").addAction("stroke", "#a82a01", .2, 0).addAction("beginPath").addAction("polygon", 6, .2, "date_.0005").addAction("fill", "#a82a01").addAction("stroke", "#a82a01", .2, 0).addAction("beginPath").addAction("polygon", 6, .1, "date_.0006").addAction("fill", "#a82a01").addAction("stroke", "#a82a01", .2, 0))
        .setProjectile({
                petalIndex: petalIDOf("fireant.particle"),
                cooldown: 3.8,
                health: 1e4,
                damage: 0,
                random: true,
                speed: 1.5,
                range: 18,
                size: .1,
                runs: true,
                nullCollision: true
            })
        .setFriendly(true),
    new MobConfig("Termite Portal",1e4,1,64,0)
        .setHealing(1)
        .setSystem(true)
        .setPortal(true)
        .setPushability(0)
        .setDensity(0)
        .setSpins(1.6, true)
        .setDrawing((new Drawing).addAction("opacity", .5).addAction("beginPath").addAction("polygon", 6, 1, "date_.0006").addAction("fill", "#d3a35b").addAction("stroke", "#d3a35b", .2, 0).addAction("beginPath").addAction("polygon", 6, .9, "date_.0007").addAction("fill", "#d3a35b").addAction("stroke", "#d3a35b", .2, 0).addAction("beginPath").addAction("polygon", 6, .8, "date_.0006").addAction("fill", "#d3a35b").addAction("stroke", "#d3a35b", .2, 0).addAction("beginPath").addAction("polygon", 6, .7, "date_.0003").addAction("fill", "#d3a35b").addAction("stroke", "#d3a35b", .2, 0).addAction("beginPath").addAction("polygon", 6, .6, "date_.0006").addAction("fill", "#d3a35b").addAction("stroke", "#d3a35b", .2, 0).addAction("beginPath").addAction("polygon", 6, .5, "date_.0006").addAction("fill", "#d3a35b").addAction("stroke", "#d3a35b", .2, 0).addAction("beginPath").addAction("polygon", 6, .4, "date_.0004").addAction("fill", "#d3a35b").addAction("stroke", "#d3a35b", .2, 0).addAction("beginPath").addAction("polygon", 6, .3, "date_.0003").addAction("fill", "#d3a35b").addAction("stroke", "#d3a35b", .2, 0).addAction("beginPath").addAction("polygon", 6, .2, "date_.0003").addAction("fill", "#d3a35b").addAction("stroke", "#d3a35b", .2, 0).addAction("beginPath").addAction("polygon", 6, .1, "date_.0007").addAction("fill", "#d3a35b").addAction("stroke", "#d3a35b", .2, 0))
        .setProjectile({
                petalIndex: petalIDOf("termite.particle"),
                cooldown: 3.8,
                health: 1e4,
                damage: 0,
                random: true,
                speed: 1.5,
                range: 18,
                size: .1,
                runs: true,
                nullCollision: true
            })
        .setFriendly(true),
    new MobConfig("Desert Portal",1e4,1,64,0)
        .setHealing(1)
        .setSystem(true)
        .setPortal(true)
        .setPushability(0)
        .setDensity(0)
        .setSpins(1.6, true)
        .setDrawing((new Drawing).addAction("opacity", .5).addAction("beginPath").addAction("polygon", 6, 1, "date_.0005").addAction("fill", "#ffeeca").addAction("stroke", "#ffeeca", .2, 0).addAction("beginPath").addAction("polygon", 6, .9, "date_.0005").addAction("fill", "#ffeeca").addAction("stroke", "#ffeeca", .2, 0).addAction("beginPath").addAction("polygon", 6, .8, "date_.0004").addAction("fill", "#ffeeca").addAction("stroke", "#ffeeca", .2, 0).addAction("beginPath").addAction("polygon", 6, .7, "date_.0004").addAction("fill", "#ffeeca").addAction("stroke", "#ffeeca", .2, 0).addAction("beginPath").addAction("polygon", 6, .6, "date_.0005").addAction("fill", "#ffeeca").addAction("stroke", "#ffeeca", .2, 0).addAction("beginPath").addAction("polygon", 6, .5, "date_.0003").addAction("fill", "#ffeeca").addAction("stroke", "#ffeeca", .2, 0).addAction("beginPath").addAction("polygon", 6, .4, "date_.0004").addAction("fill", "#ffeeca").addAction("stroke", "#ffeeca", .2, 0).addAction("beginPath").addAction("polygon", 6, .3, "date_.0003").addAction("fill", "#ffeeca").addAction("stroke", "#ffeeca", .2, 0).addAction("beginPath").addAction("polygon", 6, .2, "date_.0006").addAction("fill", "#ffeeca").addAction("stroke", "#ffeeca", .2, 0).addAction("beginPath").addAction("polygon", 6, .1, "date_.0006").addAction("fill", "#ffeeca").addAction("stroke", "#ffeeca", .2, 0))
        .setProjectile({
                petalIndex: petalIDOf("desert.particle"),
                cooldown: 3.8,
                health: 1e4,
                damage: 0,
                random: true,
                speed: 1.5,
                range: 18,
                size: .1,
                runs: true,
                nullCollision: true
            })
        .setFriendly(true),
    new MobConfig("Ocean Portal",1e4,1,64,0)
        .setHealing(1)
        .setSystem(true)
        .setPortal(true)
        .setPushability(0)
        .setDensity(0)
        .setSpins(1.6, true)
        .setDrawing((new Drawing).addAction("opacity", .5).addAction("beginPath").addAction("polygon", 6, 1, "date_.0006").addAction("fill", "#93c5e9").addAction("stroke", "#93c5e9", .2, 0).addAction("beginPath").addAction("polygon", 6, .9, "date_.0005").addAction("fill", "#93c5e9").addAction("stroke", "#93c5e9", .2, 0).addAction("beginPath").addAction("polygon", 6, .8, "date_.0003").addAction("fill", "#93c5e9").addAction("stroke", "#93c5e9", .2, 0).addAction("beginPath").addAction("polygon", 6, .7, "date_.0006").addAction("fill", "#93c5e9").addAction("stroke", "#93c5e9", .2, 0).addAction("beginPath").addAction("polygon", 6, .6, "date_.0004").addAction("fill", "#93c5e9").addAction("stroke", "#93c5e9", .2, 0).addAction("beginPath").addAction("polygon", 6, .5, "date_.0004").addAction("fill", "#93c5e9").addAction("stroke", "#93c5e9", .2, 0).addAction("beginPath").addAction("polygon", 6, .4, "date_.0006").addAction("fill", "#93c5e9").addAction("stroke", "#93c5e9", .2, 0).addAction("beginPath").addAction("polygon", 6, .3, "date_.0004").addAction("fill", "#93c5e9").addAction("stroke", "#93c5e9", .2, 0).addAction("beginPath").addAction("polygon", 6, .2, "date_.0006").addAction("fill", "#93c5e9").addAction("stroke", "#93c5e9", .2, 0).addAction("beginPath").addAction("polygon", 6, .1, "date_.0005").addAction("fill", "#93c5e9").addAction("stroke", "#93c5e9", .2, 0))
        .setProjectile({
                petalIndex: petalIDOf("ocean.particle"),
                cooldown: 3.8,
                health: 1e4,
                damage: 0,
                random: true,
                speed: 1.5,
                range: 18,
                size: .1,
                runs: true,
                nullCollision: true
            })
        .setFriendly(true),
    new MobConfig("Dark Forest Portal",1e4,1,64,0)
        .setHealing(1)
        .setSystem(true)
        .setPortal(true)
        .setPushability(0)
        .setDensity(0)
        .setSpins(1.6, true)
        .setDrawing((new Drawing).addAction("opacity", .5).addAction("beginPath").addAction("polygon", 6, 1, "date_.0003").addAction("fill", "#4d7e5c").addAction("stroke", "#4d7e5c", .2, 0).addAction("beginPath").addAction("polygon", 6, .9, "date_.0006").addAction("fill", "#4d7e5c").addAction("stroke", "#4d7e5c", .2, 0).addAction("beginPath").addAction("polygon", 6, .8, "date_.0003").addAction("fill", "#4d7e5c").addAction("stroke", "#4d7e5c", .2, 0).addAction("beginPath").addAction("polygon", 6, .7, "date_.0006").addAction("fill", "#4d7e5c").addAction("stroke", "#4d7e5c", .2, 0).addAction("beginPath").addAction("polygon", 6, .6, "date_.0003").addAction("fill", "#4d7e5c").addAction("stroke", "#4d7e5c", .2, 0).addAction("beginPath").addAction("polygon", 6, .5, "date_.0003").addAction("fill", "#4d7e5c").addAction("stroke", "#4d7e5c", .2, 0).addAction("beginPath").addAction("polygon", 6, .4, "date_.0003").addAction("fill", "#4d7e5c").addAction("stroke", "#4d7e5c", .2, 0).addAction("beginPath").addAction("polygon", 6, .3, "date_.0007").addAction("fill", "#4d7e5c").addAction("stroke", "#4d7e5c", .2, 0).addAction("beginPath").addAction("polygon", 6, .2, "date_.0004").addAction("fill", "#4d7e5c").addAction("stroke", "#4d7e5c", .2, 0).addAction("beginPath").addAction("polygon", 6, .1, "date_.0006").addAction("fill", "#4d7e5c").addAction("stroke", "#4d7e5c", .2, 0))
        .setProjectile({
                petalIndex: petalIDOf("darkforest.particle"),
                cooldown: 3.8,
                health: 1e4,
                damage: 0,
                random: true,
                speed: 1.5,
                range: 18,
                size: .1,
                runs: true,
                nullCollision: true
            })
        .setFriendly(true),
    new MobConfig("Factory Portal",1e4,1,64,0)
        .setHealing(1)
        .setSystem(true)
        .setPortal(true)
        .setPushability(0)
        .setDensity(0)
        .setSpins(1.6, true)
        .setDrawing((new Drawing).addAction("opacity", .5).addAction("beginPath").addAction("polygon", 6, 1, "date_.0006").addAction("fill", "#a2b6ba").addAction("stroke", "#a2b6ba", .2, 0).addAction("beginPath").addAction("polygon", 6, .9, "date_.0007").addAction("fill", "#a2b6ba").addAction("stroke", "#a2b6ba", .2, 0).addAction("beginPath").addAction("polygon", 6, .8, "date_.0005").addAction("fill", "#a2b6ba").addAction("stroke", "#a2b6ba", .2, 0).addAction("beginPath").addAction("polygon", 6, .7, "date_.0005").addAction("fill", "#a2b6ba").addAction("stroke", "#a2b6ba", .2, 0).addAction("beginPath").addAction("polygon", 6, .6, "date_.0006").addAction("fill", "#a2b6ba").addAction("stroke", "#a2b6ba", .2, 0).addAction("beginPath").addAction("polygon", 6, .5, "date_.0003").addAction("fill", "#a2b6ba").addAction("stroke", "#a2b6ba", .2, 0).addAction("beginPath").addAction("polygon", 6, .4, "date_.0003").addAction("fill", "#a2b6ba").addAction("stroke", "#a2b6ba", .2, 0).addAction("beginPath").addAction("polygon", 6, .3, "date_.0005").addAction("fill", "#a2b6ba").addAction("stroke", "#a2b6ba", .2, 0).addAction("beginPath").addAction("polygon", 6, .2, "date_.0004").addAction("fill", "#a2b6ba").addAction("stroke", "#a2b6ba", .2, 0).addAction("beginPath").addAction("polygon", 6, .1, "date_.0006").addAction("fill", "#a2b6ba").addAction("stroke", "#a2b6ba", .2, 0))
        .setProjectile({
                petalIndex: petalIDOf("factory.particle"),
                cooldown: 3.8,
                health: 1e4,
                damage: 0,
                random: true,
                speed: 1.5,
                range: 18,
                size: .1,
                runs: true,
                nullCollision: true
            })
        .setFriendly(true),
    new MobConfig("Hell Portal",1e4,1,64,0)
        .setHealing(1)
        .setSystem(true)
        .setPortal(true)
        .setPushability(0)
        .setDensity(0)
        .setSpins(1.6, true)
        .setDrawing((new Drawing).addAction("opacity", .5).addAction("beginPath").addAction("polygon", 6, 1, "date_.0004").addAction("fill", "#d1312f").addAction("stroke", "#d1312f", .2, 0).addAction("beginPath").addAction("polygon", 6, .9, "date_.0004").addAction("fill", "#d1312f").addAction("stroke", "#d1312f", .2, 0).addAction("beginPath").addAction("polygon", 6, .8, "date_.0005").addAction("fill", "#d1312f").addAction("stroke", "#d1312f", .2, 0).addAction("beginPath").addAction("polygon", 6, .7, "date_.0006").addAction("fill", "#d1312f").addAction("stroke", "#d1312f", .2, 0).addAction("beginPath").addAction("polygon", 6, .6, "date_.0007").addAction("fill", "#d1312f").addAction("stroke", "#d1312f", .2, 0).addAction("beginPath").addAction("polygon", 6, .5, "date_.0004").addAction("fill", "#d1312f").addAction("stroke", "#d1312f", .2, 0).addAction("beginPath").addAction("polygon", 6, .4, "date_.0006").addAction("fill", "#d1312f").addAction("stroke", "#d1312f", .2, 0).addAction("beginPath").addAction("polygon", 6, .3, "date_.0006").addAction("fill", "#d1312f").addAction("stroke", "#d1312f", .2, 0).addAction("beginPath").addAction("polygon", 6, .2, "date_.0006").addAction("fill", "#d1312f").addAction("stroke", "#d1312f", .2, 0).addAction("beginPath").addAction("polygon", 6, .1, "date_.0005").addAction("fill", "#d1312f").addAction("stroke", "#d1312f", .2, 0))
        .setProjectile({
                petalIndex: petalIDOf("hell.particle"),
                cooldown: 3.8,
                health: 1e4,
                damage: 0,
                random: true,
                speed: 1.5,
                range: 18,
                size: .1,
                runs: true,
                nullCollision: true
            })
        .setFriendly(true),
    new MobConfig("Sewers Portal",1e4,1,64,0)
        .setHealing(1)
        .setSystem(true)
        .setPortal(true)
        .setPushability(0)
        .setDensity(0)
        .setSpins(1.6, true)
        .setDrawing((new Drawing).addAction("opacity", .5).addAction("beginPath").addAction("polygon", 6, 1, "date_.0003").addAction("fill", "#85380c").addAction("stroke", "#85380c", .2, 0).addAction("beginPath").addAction("polygon", 6, .9, "date_.0005").addAction("fill", "#85380c").addAction("stroke", "#85380c", .2, 0).addAction("beginPath").addAction("polygon", 6, .8, "date_.0004").addAction("fill", "#85380c").addAction("stroke", "#85380c", .2, 0).addAction("beginPath").addAction("polygon", 6, .7, "date_.0006").addAction("fill", "#85380c").addAction("stroke", "#85380c", .2, 0).addAction("beginPath").addAction("polygon", 6, .6, "date_.0007").addAction("fill", "#85380c").addAction("stroke", "#85380c", .2, 0).addAction("beginPath").addAction("polygon", 6, .5, "date_.0005").addAction("fill", "#85380c").addAction("stroke", "#85380c", .2, 0).addAction("beginPath").addAction("polygon", 6, .4, "date_.0007").addAction("fill", "#85380c").addAction("stroke", "#85380c", .2, 0).addAction("beginPath").addAction("polygon", 6, .3, "date_.0004").addAction("fill", "#85380c").addAction("stroke", "#85380c", .2, 0).addAction("beginPath").addAction("polygon", 6, .2, "date_.0004").addAction("fill", "#85380c").addAction("stroke", "#85380c", .2, 0).addAction("beginPath").addAction("polygon", 6, .1, "date_.0005").addAction("fill", "#85380c").addAction("stroke", "#85380c", .2, 0))
        .setProjectile({
                petalIndex: petalIDOf("sewers.particle"),
                cooldown: 3.8,
                health: 1e4,
                damage: 0,
                random: true,
                speed: 1.5,
                range: 18,
                size: .1,
                runs: true,
                nullCollision: true
            })
        .setFriendly(true),
    new MobConfig("Rift Portal",1e4,1,64,0)
        .setHealing(1)
        .setSystem(true)
        .setPortal(true)
        .setPushability(0)
        .setDensity(0)
        .setSpins(1.6, true)
        .setDrawing((new Drawing).addAction("opacity", .5).addAction("beginPath").addAction("polygon", 6, 1, "date_.0007").addAction("fill", "#a2b6ba").addAction("stroke", "#a2b6ba", .2, 0).addAction("beginPath").addAction("polygon", 6, .9, "date_.0004").addAction("fill", "#a2b6ba").addAction("stroke", "#a2b6ba", .2, 0).addAction("beginPath").addAction("polygon", 6, .8, "date_.0007").addAction("fill", "#a2b6ba").addAction("stroke", "#a2b6ba", .2, 0).addAction("beginPath").addAction("polygon", 6, .7, "date_.0003").addAction("fill", "#a2b6ba").addAction("stroke", "#a2b6ba", .2, 0).addAction("beginPath").addAction("polygon", 6, .6, "date_.0006").addAction("fill", "#a2b6ba").addAction("stroke", "#a2b6ba", .2, 0).addAction("beginPath").addAction("polygon", 6, .5, "date_.0006").addAction("fill", "#a2b6ba").addAction("stroke", "#a2b6ba", .2, 0).addAction("beginPath").addAction("polygon", 6, .4, "date_.0004").addAction("fill", "#a2b6ba").addAction("stroke", "#a2b6ba", .2, 0).addAction("beginPath").addAction("polygon", 6, .3, "date_.0003").addAction("fill", "#a2b6ba").addAction("stroke", "#a2b6ba", .2, 0).addAction("beginPath").addAction("polygon", 6, .2, "date_.0006").addAction("fill", "#a2b6ba").addAction("stroke", "#a2b6ba", .2, 0).addAction("beginPath").addAction("polygon", 6, .1, "date_.0004").addAction("fill", "#a2b6ba").addAction("stroke", "#a2b6ba", .2, 0))
        .setProjectile({
                petalIndex: petalIDOf("rift.particle"),
                cooldown: 3.8,
                health: 1e4,
                damage: 0,
                random: true,
                speed: 1.5,
                range: 18,
                size: .1,
                runs: true,
                nullCollision: true
            })
        .setFriendly(true),
    new MobConfig("Druid",1e4,10,24,.3)
        .setDesertCentipedeMovement(true)
        .setSpins(0, true)
        .setHealing(1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("dipPolygon", 11, 1.4, -5, 0).addAction("paint", "#1c9e5b", .2, .2).addAction("beginPath").addAction("circle", 0, 0, .9).addAction("fill", "#27b46b"))
        .setFriendly(true),
    new MobConfig("Trader",1e4,10,24,.3)
        .setDesertCentipedeMovement(true)
        .setSpins(0, true)
        .setHealing(1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("dipPolygon", 13, 1.4, -5, 0).addAction("paint", "#ffffff", .2, .2).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ffe763", .2, .2))
        .setFriendly(true),
    new MobConfig("Oracle",1e4,10,32,.3)
        .setDesertCentipedeMovement(true)
        .setSpins(0, true)
        .setHealing(1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("dipPolygon", 11, 1.4, -5, 0).addAction("paint", "#326667", .2, .2).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("fill", "#3f8081").addAction("beginPath").addAction("line", .05, 0, .25, .3).addAction("line", .05, 0, -.15, .5).addAction("line", .05, 0, -.55, -.05).addAction("line", .05, 0, -.1, -.35).addAction("line", .05, 0, .45, -.4).addAction("line", .05, 0, .35, .1).addAction("line", .05, 0, -.05, .25).addAction("line", .25, .3, .45, .55).addAction("line", .25, .3, .55, .2).addAction("line", -.15, .5, -.3, .85).addAction("line", -.15, .5, .15, .8).addAction("line", -.55, -.05, -.9, -.2).addAction("line", -.55, -.05, -.85, .25).addAction("line", -.1, -.35, -.05, -.75).addAction("line", -.1, -.35, -.4, -.65).addAction("line", .45, -.4, .7, -.8).addAction("line", .45, -.4, .85, -.3).addAction("line", .35, .1, .65, .25).addAction("line", .35, .1, .6, -.15).addAction("line", -.05, .25, -.15, .6).addAction("line", -.05, .25, .2, .55).addAction("line", .05, 0, -.05, .25).addAction("stroke", "#9682c7", .4, .2).addAction("stroke", "#9682c7", .2, 0))
        .setFriendly(true),
    new MobConfig("Ant Hole",750,10,34,0)
        .setPushability(0)
        .setDensity(0)
        .addDrop(petalIDOf("Dirt"), .6)
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("fill", "#A8711E").addAction("beginPath").addAction("circle", 0, 0, .66).addAction("fill", "#865A18").addAction("beginPath").addAction("circle", 0, 0, .33).addAction("fill", "#6B4813")),
    new MobConfig("Fire Burrow",1e-10,20,18,0)
        .setPushability(0)
        .setDensity(0)
        .addDrop(petalIDOf("Magnet"), 1, 2)
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("fill", "#a82a01").addAction("beginPath").addAction("circle", 0, 0, .66).addAction("fill", "#862100").addAction("beginPath").addAction("circle", 0, 0, .33).addAction("fill", "#641800")),
    new MobConfig("Termite Mound",1500,10,34,0)
        .setPushability(0)
        .setDensity(0)
        .addDrop(petalIDOf("Dirt"), .6)
        .addDrop(petalIDOf("Relic"), .1, 1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("fill", "#d1a25a").addAction("beginPath").addAction("circle", 0, 0, .66).addAction("fill", "#a78148").addAction("beginPath").addAction("circle", 0, 0, .33).addAction("fill", "#7e6136")),
    new MobConfig("Wasp",62.5,50,34,3)
        .setAggressive(1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("moveTo", -1.6, 0).addAction("lineTo", -.6, -.4).addAction("lineTo", -.6, .4).addAction("lineTo", -1.6, 0).addAction("paint", "#222222", .2, 0).addAction("beginPath").addAction("ellipse", 0, 0, 1, .7, 0).addAction("paint", "#c8803c", .15, .2).addAction("beginPath").addAction("moveTo", .275, -.625).addAction("quadraticCurveTo", .125, 0, .275, .625).addAction("moveTo", .15, -.6).addAction("quadraticCurveTo", 0, 0, .15, .6).addAction("stroke", "#222222", .2, 0).addAction("beginPath").addAction("moveTo", -.2, -.65).addAction("quadraticCurveTo", -.35, 0, -.2, .65).addAction("moveTo", -.4, -.6).addAction("quadraticCurveTo", -.55, 0, -.4, .6).addAction("stroke", "#222222", .2, 0).addAction("beginPath").addAction("ellipse", 0, 0, 1, .7, 0).addAction("stroke", "#c8803c", .15, .15).addAction("beginPath").addAction("moveTo", .85, .16).addAction("quadraticCurveTo", 1.36, .18, 1.68, .49).addAction("quadraticCurveTo", 1.26, .3, .85, .16).addAction("moveTo", .85, -.16).addAction("quadraticCurveTo", 1.36, -.18, 1.68, -.49).addAction("quadraticCurveTo", 1.26, -.3, .85, -.16).addAction("stroke", "#222222", .15, 0))
        .setProjectile({
                petalIndex: petalIDOf("Stinger"),
                cooldown: 22.5,
                health: 62.5,
                damage: 10,
                recoil: 8,
                speed: 7.5,
                aimbot: true,
                range: 45
            })
        .addDrop(petalIDOf("Antennae"), 1, 2)
        .addDrop(petalIDOf("Fig"), .35)
        .addDrop(petalIDOf("Blood Stinger"), .45),
    new MobConfig("Wax",1e3,0,42,1e-10)
        .setSpins(0, true)
        .setPushability(.2)
        .setSystem(1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("polygon", 6, 1, 0).addAction("paint", "#FEE86B", .2, .2)),
    new MobConfig("Pearl",67.5,20,20,0)
        .setArmor(0)
        .setWavesIconSize(3.8)
        .setPushability(.6)
        .addDrop(petalIDOf("Pearl"), 1, 1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#fff0b7", .125, .2)),
    new MobConfig("Chest",62.5,5,25,0)
        .setWavesIconSize(3.8)
        .addDrop(petalIDOf("Coin"), .01)
        .addDrop(petalIDOf("Coin"), .01)
        .addDrop(petalIDOf("Coin"), .01)
        .setDrawing((new Drawing).addAction("beginPath").addAction("moveTo", -.8, -.6).addAction("quadraticCurveTo", 0, -.8, .8, -.6).addAction("quadraticCurveTo", 1.1, 0, .8, .6).addAction("quadraticCurveTo", 0, .8, -.8, .6).addAction("quadraticCurveTo", -1.1, 0, -.8, -.6).addAction("stroke", "#F5bF39", .6, 0).addAction("paint", "#4c3b19", .2, .2).addAction("beginPath").addAction("line", .5, .8, .5, -.8).addAction("stroke", "#F5bF39", .2, 0).addAction("beginPath").addAction("line", -.5, .8, -.5, -.8).addAction("stroke", "#F5bF39", .2, 0).addAction("beginPath").addAction("rect", -.2, .77, .4, .2).addAction("stroke", "#F5bF39", .2, 0)),
    new MobConfig("Digger",1125,30,36,3)
        .setWavesIconSize(3.8)
        .setAggressive(true)
        .setFriendly(true)
        .setPushability(.4)
        .setSpins(6, 1)
        .addDrop(petalIDOf("Stinger"), 1)
        .addDrop(petalIDOf("Rock"), 1)
        .addDrop(petalIDOf("Rose"), 1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("dipPolygon", 8, 1.4, 2.3, 12).addAction("paint", "#222222", .2, .2).addAction("beginPath").addAction("circle", 0, 0, .9).addAction("paint", "#9E9E9E", .2, .2)),
    new MobConfig("Hive",275,50,34,0)
        .setPushability(.05)
        .addDrop(petalIDOf("Honey"), .45, 2)
        .addDrop(petalIDOf("Pollen"), .25)
        .addDrop(petalIDOf("Wax"), .25, 2)
        .setDrawing((new Drawing).addAction("beginPath").addAction("dipPolygon", 6, 1, .3, 0).addAction("paint", "#FED263", .25, .2).addAction("beginPath").addAction("dipPolygon", 6, .5, .3, 0).addAction("paint", "#FED263", .25, .2)),
    new MobConfig("Cave Centipede",62.5,10,24,3.5)
        .setWavesIconSize(3.8)
        .setAggressive(1)
        .setCentipedeMovement(1)
        .setBeetleMovement(1)
        .addDrop(petalIDOf("Dirt"), .1)
        .addDrop(petalIDOf("Clay"), .1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 1.1, .5).addAction("fill", "#240000").addAction("beginPath").addAction("circle", .7, .9, .5).addAction("fill", "#240000").addAction("beginPath").addAction("circle", -.7, .8, .5).addAction("fill", "#240000").addAction("beginPath").addAction("circle", 0, -1.1, .5).addAction("fill", "#240000").addAction("beginPath").addAction("circle", .7, -.9, .5).addAction("fill", "#240000").addAction("beginPath").addAction("circle", -.7, -.9, .5).addAction("fill", "#240000").addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#795134", .25, .2).addAction("beginPath").addAction("moveTo", .8, .2).addAction("quadraticCurveTo", 1.3, .2, 1.4, .5).addAction("moveTo", .8, -.2).addAction("quadraticCurveTo", 1.3, -.2, 1.4, -.5).addAction("stroke", "#240000", .2, 0)),
    new MobConfig("Cave Centipede",62.5,10,24,3.5)
        .setWavesIconSize(3.8)
        .setSystem(1)
        .setAggressive(1)
        .setBeetleMovement(1)
        .setCentipedeMovement(1)
        .addDrop(petalIDOf("Dirt"), .1)
        .addDrop(petalIDOf("Clay"), .1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 1.1, .5).addAction("fill", "#240000").addAction("beginPath").addAction("circle", .7, .9, .5).addAction("fill", "#240000").addAction("beginPath").addAction("circle", -.7, .8, .5).addAction("fill", "#240000").addAction("beginPath").addAction("circle", 0, -1.1, .5).addAction("fill", "#240000").addAction("beginPath").addAction("circle", .7, -.9, .5).addAction("fill", "#240000").addAction("beginPath").addAction("circle", -.7, -.9, .5).addAction("fill", "#240000").addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#795134", .25, .2).addAction("beginPath")),
    new MobConfig("Buried",100,0,28,5)
        .setWavesIconSize(3.8)
        .setDensity(5)
        .setArmor(0)
        .setMoveInSines(1)
        .setBumblebeeMovement(1)
        .setSystem(1)
        .setAggressive(1)
        .setNoDebuff(1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("opacity", .5).addAction("circle", 0, 0, 1.05).addAction("fill", "#795134")),
    new MobConfig("Worm",100,30,36,.01)
        .setDigging(1)
        .setPushability(.1)
        .setWavesIconSize(3.8)
        .addDrop(petalIDOf("Dirt"))
        .addDrop(petalIDOf("Shovel"))
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, .9).addAction("fill", "#ffffff").addAction("beginPath").addAction("spikeBall", 11, .9, 0).addAction("fill", "#362416").addAction("beginPath").addAction("circle", 0, 0, .9).addAction("stroke", "#795134", .4, .2).addAction("stroke", "#795134", .133, 0)),
    new MobConfig("Dirt",175,10,32,0)
        .setWavesIconSize(4.2)
        .setPushability(.6)
        .addDrop(petalIDOf("Dirt"), .6)
        .addDrop(petalIDOf("Plank"), .25)
        .setDrawing((new Drawing).addAction("beginPath").addAction("dipPolygon", 7, 1.1, 1.5, 0).addAction("paint", "#A8711E", .3, .2)),
    new MobConfig("Sandstone",37.5,20,24,0)
        .setWavesIconSize(3.8)
        .setPushability(.6)
        .addDrop(petalIDOf("Sand"), .6)
        .addDrop(petalIDOf("Sandstone"), .25)
        .setDrawing((new Drawing).addAction("beginPath").addAction("dipPolygon", 5, 1, 0, 0).addAction("paint", "#E1C85D", .2, .2)),
    new MobConfig("Flea",62.5,10,20,40)
        .setExplodes("flea.explosion")
        .setWavesIconSize(3.6)
        .setMovesInBursts(true)
        .setMoveInSines(1)
        .setAggressive(1)
        .addDrop(petalIDOf("Powder"), .6)
        .addDrop(petalIDOf("Lentil"), .25, 2)
        .setDrawing((new Drawing).addAction("beginPath").addAction("line", 0, 0, -1.05, -.3).addAction("line", 0, 0, -1.05, .3).addAction("line", 0, 0, -1.15, 0).addAction("paint", "#a38b73", .4, .15).addAction("beginPath").addAction("ellipse", -.2, 0, .75, .65, 0).addAction("paint", "#a38b73", .15, .15).addAction("beginPath").addAction("moveTo", -.4, -.55).addAction("quadraticCurveTo", -.6, 0, -.4, .55).addAction("stroke", "#333333", .25, 0).addAction("beginPath").addAction("ellipse", -.2, 0, .75, .65, 0).addAction("stroke", "#a38b73", .15, .15).addAction("beginPath").addAction("ellipse", .5, 0, .6, .65, 0).addAction("paint", "#a38b73", .15, .15).addAction("beginPath").addAction("moveTo", .85, .17).addAction("quadraticCurveTo", 1.36, .18, 1.5, .5).addAction("moveTo", .85, -.17).addAction("quadraticCurveTo", 1.36, -.18, 1.5, -.5).addAction("circle", 1.5, -.5, .075).addAction("stroke", "#333333", .15, 0).addAction("beginPath").addAction("circle", 1.5, .5, .075).addAction("stroke", "#333333", .2, 0).addAction("beginPath").addAction("circle", 1.5, -.5, .075).addAction("stroke", "#333333", .2, 0)),
    new MobConfig("Lily Pad",25,10,30,0)
        .setWavesIconSize(3.8)
        .setSize(30, MobTier.SIZE_SCALE, .75, .25)
        .addDrop(petalIDOf("Lily Pad"), .1)
        .addDrop(petalIDOf("Lotus"), 1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("arc", 0, 0, 1, 5.6, 5).addAction("lineTo", 0, 0).addAction("closePath").addAction("paint", "#3C9564", .25, .2) .addAction("beginPath") .addAction("rotate", 30) .addAction("moveTo", 0, 0) .addAction("bezierCurveTo", -0.312, -0.18, -0.779, -0.45, 0, -0.9) .addAction("bezierCurveTo", 0.779, -0.45, 0.39, -0.225, 0, 0) .addAction("bezierCurveTo", 0.312, -0.18, 0.779, -0.45, 0.779, 0.45) .addAction("bezierCurveTo", 0, 0.9, 0, 0.45, 0, 0) .addAction("bezierCurveTo", 0, 0.36, 0, 0.9, -0.779, 0.45) .addAction("bezierCurveTo", -0.779, -0.45, -0.39, -0.225, 0, 0) .addAction("closePath") .addAction("paint", "#FFB7C5", 0.15, 0.2) .addAction("beginPath") .addAction("circle", 0, 0, 0.3) .addAction("paint", "#ffddbf", 0.125, 0.15)), new MobConfig("Lily Pad",4.5,10,26,0)
        .setWavesIconSize(3.8)
        .setSystem(true)
        .setSize(26, MobTier.SIZE_SCALE, .75, .25)
        .addDrop(petalIDOf("Lily Pad"), .1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("arc", 0, 0, 1, 1.6, 1).addAction("lineTo", 0, 0).addAction("closePath").addAction("paint", "#3C9564", .25, .2)),
    new MobConfig("Urchin",37.5,50,26,.5)
        .setWavesIconSize(3.8)
        .setNeutral(1)
        .setSpins(2)
        .setPoison(10, 3)
        .setProjectile({
                petalIndex: petalIDOf("Venomous Stinger"),
                cooldown: 3,
                health: 20,
                damage: 10,
                random: true,
                speed: 5.5,
                range: 11.25,
                runs: true,
                multiShot: {
                    count: 1,
                    delay: 0,
                    spread: 1.5
                }
            })
        .addDrop(petalIDOf("Salt"), 1, 1)
        .addDrop(petalIDOf("Venomous Stinger"), .45, 2)
        .setDrawing((new Drawing).addAction("beginPath").addAction("dipPolygon", 13, .9, -16, 0).addAction("paint", "#5F4383", .15, .2).addAction("beginPath").addAction("dipPolygon", 12, .7, -16, 0).addAction("paint", "#5F4383", .15, .2).addAction("beginPath").addAction("dipPolygon", 9, .4, -16, 0).addAction("paint", "#5F4383", .15, .2)),
    new MobConfig("Mecha Digger",50,50,24,3.8)
        .setWavesIconSize(4.3)
        .setArmor(3)
        .setAggressive(1)
        .setSpins(12, true)
        .addDrop(petalIDOf("Fragment"), 1, 2)
        .addDrop(petalIDOf("Fragment"), 1, 2)
        .addDrop(petalIDOf("Battery"), .1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("dipPolygon", 8, 1.6, 2, 30).addAction("paint", "#727679", .2, .2).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("fill", "#8F9699").addAction("beginPath").addAction("circle", 0, 0, .6).addAction("stroke", "#ECD54A", .25, 0)),
    new MobConfig("Mecha Centipede",25,20,20,35)
        .setWavesIconSize(3.8)
        .setArmor(3)
        .setAggressive(1)
        .setMovesInBursts(1)
        .addDrop(petalIDOf("Cog"), .05, 2)
        .addDrop(petalIDOf("Magnet"), .05, 2)
        .addDrop(petalIDOf("Fragment"), .25, 2)
        .addDrop(petalIDOf("Battery"), 0)
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 1, .5).addAction("fill", "#000000").addAction("beginPath").addAction("circle", 0, -1, .5).addAction("fill", "#000000").addAction("dipPolygon", 12, 1.1, 2.5, 0).addAction("stroke", "#8F9699", .2, .2).addAction("beginPath").addAction("dipPolygon", 12, .975, 2.5, 0).addAction("stroke", "#acb5b9", .125, .2).addAction("beginPath").addAction("circle", 0, 0, .7).addAction("stroke", "#acb5b9", .5, .2).addAction("beginPath").addAction("circle", 0, 0, .55).addAction("stroke", "#8F9699", .2, .2).addAction("beginPath").addAction("line", .8, -.25, 1.5, -.8).addAction("stroke", "#000000", .2, 0).addAction("beginPath").addAction("circle", 1.5, -.75, .2).addAction("paint", "#E78d78", .2, .2).addAction("beginPath").addAction("line", .8, .25, 1.5, .8).addAction("stroke", "#000000", .2, 0).addAction("beginPath").addAction("circle", 1.5, .75, .2).addAction("paint", "#E78d78", .2, .2)),
    new MobConfig("Mecha Centipede",25,20,20,35)
        .setWavesIconSize(3.8)
        .setArmor(3)
        .setAggressive(1)
        .setMovesInBursts(1)
        .setSystem(1)
        .setArmor(3)
        .addDrop(petalIDOf("Cog"), .05, 2)
        .addDrop(petalIDOf("Magnet"), .05, 2)
        .addDrop(petalIDOf("Fragment"), .25, 2)
        .addDrop(petalIDOf("Battery"), 0)
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 1, .5).addAction("fill", "#000000").addAction("beginPath").addAction("circle", 0, -1, .5).addAction("fill", "#000000").addAction("dipPolygon", 12, 1.1, 2.5, 0).addAction("stroke", "#8F9699", .2, .2).addAction("beginPath").addAction("dipPolygon", 12, .975, 2.5, 0).addAction("stroke", "#acb5b9", .125, .2).addAction("beginPath").addAction("circle", 0, 0, .7).addAction("stroke", "#acb5b9", .5, .2).addAction("beginPath").addAction("circle", 0, 0, .55).addAction("stroke", "#8F9699", .2, .2)),
    new MobConfig("Mecha Wasp",62.5,50,34,3)
        .setWavesIconSize(3.6)
        .setAggressive(1)
        .setArmor(3)
        .setDrawing((new Drawing).addAction("beginPath") .addAction("moveTo", -1.6, 0) .addAction("lineTo", -0.8, -0.4) .addAction("lineTo", -0.8, 0.4) .addAction("lineTo", -1.6, 0) .addAction("paint", "#8F9699", 0.15, 0.2) .addAction("beginPath") .addAction("ellipse", 0, 0, 1, 0.7, 0) .addAction("paint", "#8F9699", 0.15, 0.2) .addAction("beginPath") .addAction("moveTo", 0.275, -0.625) .addAction("quadraticCurveTo", 0.125, 0, 0.275, 0.625) .addAction("moveTo", 0.15, -0.6) .addAction("quadraticCurveTo", 0, 0, 0.15, 0.6) .addAction("stroke", "#ecd54a", 0.2, 0) .addAction("beginPath") .addAction("moveTo", -0.2, -0.65) .addAction("quadraticCurveTo", -0.35, 0, -0.2, 0.65) .addAction("moveTo", -0.4, -0.6) .addAction("quadraticCurveTo", -0.55, 0, -0.4, 0.6) .addAction("stroke", "#ecd54a", 0.2, 0) .addAction("beginPath") .addAction("ellipse", 0, 0, 1, 0.7, 0) .addAction("stroke", "#8F9699", 0.15, 0.2) .addAction("beginPath") .addAction("moveTo", 0.85, 0.16) .addAction("quadraticCurveTo", 1.36, 0.18, 1.68, 0.49) .addAction("quadraticCurveTo", 1.26, 0.3, 0.85, 0.16) .addAction("moveTo", 0.85, -0.16) .addAction("quadraticCurveTo", 1.36, -0.18, 1.68, -0.49) .addAction("quadraticCurveTo", 1.26, -0.3, 0.85, -0.16) .addAction("stroke", "#222222", 0.12, 0) .addAction("beginPath") .addAction("circle", -1.18, 0, 0.075) .addAction("fill", "#FF0000") .addAction("beginPath") .addAction("circle", -0.67, 0.3, 0.075) .addAction("fill", "#727679") .addAction("beginPath") .addAction("circle", -0.67, -0.3, 0.075) .addAction("fill", "#727679") .addAction("beginPath") .addAction("circle", 0.47, -0.4, 0.075) .addAction("fill", "#727679") .addAction("beginPath") .addAction("circle", 0.47, 0.4, 0.075) .addAction("fill", "#727679"))
        .addDrop(petalIDOf("Mecha Missile"), 1, 1)
        .addDrop(petalIDOf("Antennae"), 1, 2)
        .addDrop(petalIDOf("Fragment"), 1, 2)
        .addDrop(petalIDOf("Battery"), .1)
        .setProjectile({
                petalIndex: petalIDOf("Mecha Missile"),
                cooldown: 33.75,
                health: 62.5,
                damage: 10,
                recoil: 8,
                speed: 6.75,
                aimbot: true,
                range: 45
            }),
    new MobConfig("Garbage",125,10,36,0)
        .setWavesIconSize(3.8)
        .addDrop(petalIDOf("Broccoli"), 0)
        .addDrop(petalIDOf("Clay"), .25)
        .setDrawing((new Drawing).addAction("beginPath").addAction("moveTo", .96, -.58).addAction("lineTo", .38, -.95).addAction("lineTo", -.49, -1.01).addAction("lineTo", -.93, -.58).addAction("lineTo", -1, 0).addAction("lineTo", -.93, .58).addAction("lineTo", -.49, 1.01).addAction("lineTo", .38, 1.01).addAction("lineTo", .96, .58).addAction("lineTo", 1.1, 0).addAction("lineTo", .96, -.58).addAction("paint", "#2A2B2D", .125, .2).addAction("beginPath").addAction("moveTo", .74, 0).addAction("quadraticCurveTo", .82, -.29, .6, -.44).addAction("paint", "#2A2B2D", .125, .2).addAction("beginPath").addAction("moveTo", .6, .14).addAction("quadraticCurveTo", 1.25, -.29, .52, -.14).addAction("paint", "#2A2B2D", .125, .2).addAction("beginPath").addAction("moveTo", .82, -.14).addAction("lineTo", 1.1, -.22).addAction("lineTo", 1.4, -.29).addAction("lineTo", 1.31, .08).addAction("lineTo", 1.4, .29).addAction("lineTo", 1.1, .22).addAction("lineTo", .82, .14).addAction("quadraticCurveTo", .68, 0, .82, -.14).addAction("paint", "#2A2B2D", .125, .2)),
    new MobConfig("Hiding Pillbug",100,5,22,0)
        .setWavesIconSize(4.2)
        .addDrop(petalIDOf("Dahlia"), .45, 1)
        .addDrop(petalIDOf("Glass"), .35)
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", -0, 0, 1).addAction("paint", "#58585d", .2, .2).addAction("beginPath").addAction("line", 0, .85, 0, -.85).addAction("stroke", "#58585d", .2, .2)),
    new MobConfig("Pillbug",100,10,22,4.5)
        .setWavesIconSize(4.4)
        .setAggressive(true)
        .setBumblebeeMovement(1)
        .setMoveInSines(1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", -.5, 0, 1).addAction("paint", "#58585d", .2, .2).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#58585d", .2, .2).addAction("beginPath").addAction("circle", .5, 0, 1).addAction("paint", "#58585d", .2, .2).addAction("beginPath").addAction("arc", .9, 0, .9, Math.PI / 2, 1.5 * Math.PI).addAction("stroke", "#58585d", .2, .2).addAction("beginPath").addAction("line", 1.2, -.25, 1.8, -.6).addAction("stroke", "#000000", .2, 0).addAction("beginPath").addAction("line", 1.8, -.6, 2, -1.2).addAction("stroke", "#000000", .2, 0).addAction("beginPath").addAction("line", 1.2, .25, 1.8, .6).addAction("stroke", "#000000", .2, 0).addAction("beginPath").addAction("line", 1.8, .6, 2, 1.2).addAction("stroke", "#000000", .2, 0)),
    new MobConfig("Tesla Coil",150,10,26,0)
        .setWavesIconSize(3.8)
        .setAggressive(true)
        .addDrop(petalIDOf("Lightning"), .25)
        .addDrop(petalIDOf("Fragment"), 1, 2)
        .setLightning(24, [2, 4, 6, 8, 10, 12, 14, 16], 128, 7)
        .setDrawing((new Drawing).addAction("beginPath").addAction("rect", -.8, -1, 1.6, 2).addAction("paint", "#959C9F", .2, .2).addAction("beginPath").addAction("rect", -.95, -.6, 1.9, .4).addAction("paint", "#e78d78", .2, .2).addAction("beginPath").addAction("rect", -.95, -.2, 1.9, .4).addAction("paint", "#e78d78", .2, .2).addAction("beginPath").addAction("rect", -.95, .2, 1.9, .4).addAction("paint", "#e78d78", .2, .2)),
    new MobConfig("Barrel",62.5,10,24,0)
        .setWavesIconSize(3.8)
        .addDrop(petalIDOf("Fragment"), 1, 2)
        .addDrop(petalIDOf("Iris"), .25, 1)
        .setDrawing((new Drawing).addAction("beginPath").addAction("circle", 0, 0, 1).addAction("paint", "#ecd54a", .15, .2).addAction("beginPath").addAction("circle", 0, 0, .75).addAction("paint", "#ECD54A", .15, .2).addAction("beginPath").addAction("circle", .6, 0, .175).addAction("fill", "#66BB2A").addAction("stroke", "#BCAA3B", .075, 0).addAction("beginPath").addAction("circle", -.75, 0, .125).addAction("paint", "#8F9699", .075, .2).addAction("beginPath").addAction("dipPolygon", 5, .1, -5, 0).addAction("paint", "#404244", .2, .2)),
    new MobConfig("Tick",62.5,20,20,4)
        .setWavesIconSize(3.8)
        .setAggressive(1)
        .setPoison(10, 3)
        .setProjectile({
                petalIndex: petalIDOf("G"),
                cooldown: 22.5,
                health: 1 / 0,
                damage: 0,
                speed: 2,
                range: 72,
                size: 1,
                runs: true,
                nullCollision: true
            })
        .addDrop(petalIDOf("Web"), .45, 1)
        .addDrop(petalIDOf("Faster"), .25)
        .addDrop(petalIDOf("Third Eye"), 0, 5)
        .setDrawing((new Drawing) .addAction("beginPath") .addAction("circle", 0, 0, 1) .addAction("paint", "#353535", 0.357, 0.2) .addAction("beginPath") .addAction("moveTo", 0.857, -0.571) .addAction("quadraticCurveTo", 1.429, -0.571, 1.429, -0.429) .addAction("stroke", "#353535", 0.357, 0.2) .addAction("beginPath") .addAction("moveTo", 0.857, 0.571) .addAction("quadraticCurveTo", 1.429, 0.571, 1.429, 0.429) .addAction("stroke", "#353535", 0.357, 0.2) .addAction("beginPath") .addAction("moveTo", 0, -1.286) .addAction("quadraticCurveTo", -1.714, -2.286, -3.143, -1.143) .addAction("quadraticCurveTo", -4.286, 0, -3.143, 1.143) .addAction("quadraticCurveTo", -1.714, 2.286, 0, 1.286) .addAction("quadraticCurveTo", -0.857, 0, 0, -1.286) .addAction("paint", "#962921", 0.357, 0.2) .addAction("beginPath") .addAction("moveTo", -1.143, -1) .addAction("quadraticCurveTo", -2, -1.143, -2.629, -0.571) .addAction("stroke", "#962921", 0.357, 0.2) .addAction("beginPath") .addAction("moveTo", -1.143, 1) .addAction("quadraticCurveTo", -2, 1.143, -2.629, 0.571) .addAction("stroke", "#962921", 0.357, 0.2))];

// Flu: Wing, Faster, Third Eye

export const mobIDOf = name => mobConfigs.findIndex(m => m.name === name);

petalConfigs[petalIDOf("Beetle Egg")].setSpawnable(mobIDOf("Beetle"), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4);
petalConfigs[petalIDOf("Stick")].setSpawnable(mobIDOf("Sandstorm"), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4);
petalConfigs[petalIDOf("Ant Egg")].setSpawnable(mobIDOf("Soldier Ant"), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 4);
petalConfigs[petalIDOf("Branch")].setSpawnable(mobIDOf("Wilt") + 1, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5);
petalConfigs[petalIDOf("Leech Egg")].setSpawnable(mobIDOf("Leech"), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3);
petalConfigs[petalIDOf("Hornet Egg")].setSpawnable(mobIDOf("Hornet"), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5);
petalConfigs[petalIDOf("Square Egg")].setSpawnable(mobIDOf("Square"), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2);
petalConfigs[petalIDOf("Triangle Egg")].setSpawnable(mobIDOf("Triangle"), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2);
petalConfigs[petalIDOf("Pentagon Egg")].setSpawnable(mobIDOf("Pentagon"), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2);

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
mobConfigs[mobIDOf("Mecha Centipede")].segmentWith(queryMob(m => m.isSystem && m.name === "Mecha Centipede"));
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