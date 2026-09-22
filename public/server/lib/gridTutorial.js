import { colors } from "../../lib/util.js";
import state from "../lib/state.js";
import { mobConfigs, mobIDOf, petalConfigs, petalIDOf, tiers } from "./config.js";
import { Mob } from "./Entity.js";

/**
 * Data for the instructions to be carried out by the lobby for the tutorial.
 * The instructions are grouped into the three different biomes.
 * The possible types of instructions are:
 * - Chat: Send a system chat message [1] to all clients, using an optional colour [2].
 * - Wait: Pauses the tutorial for a specified number of milliseconds [1].
 * - Set Biome: Send a room update with the new biome [1] to all clients.
 * - Set Slots: Set each client's primary slots to Legendary petals of the specified types [1-10].
 *   - Also handles clearing the client's inventory.
 * - Set Secondary Slots: Set each client's secondary slots to Legendary petals of the specified types [1-10].
 * - Spawn Mob: Spawns a Super mob of the specified type [1] and rarity [2].
 * - Await Chat: Pauses the tutorial until any client sends a chat message (or somehow kills all mobs in the room).
 * - Await Gallery: Pauses the tutorial until any client uses the Gallery petal (or somehow kills all mobs in the room).
 * - Await Kill: Pauses the tutorial until all mobs in the room are killed.
 * - End: End the tutorial, spawning the player back in the main playing area.
 */
const tutorialData = [
    [
        [],  // Padding step, does nothing
        ["Set Biome", "Garden"],
        ["Set Slots", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic"],
        ["Set Secondary Slots", "Gallery"],
        ["Chat", "Welcome to the tutorial for Biome Grid!"],
        ["Wait", 3000],
        ["Spawn Mob", "Shrub", 6],
        ["Chat", "Let's start with the Gallery petal.", colors.common],
        ["Chat", "You begin with a Gallery petal in your bottom petal slots.", colors.common],
        ["Chat", "You can hit any mob with the Gallery petal to view its stats and abilities.", colors.common],
        ["Await Gallery"],
        ["Chat", "Step 0 of 3 complete!"],
        ["Wait", 3000],
    ],
    [
        [],  // Padding step, does nothing
        ["Chat", "As you have just seen, Garden mobs can heal themselves, which makes them harder to finish off.", colors.super],
        ["Await Chat"],
        ["Set Slots", "Gallery", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic"],
        ["Set Secondary Slots", "Iris", "Pincer", "Faster", "Privet", "Privet", "Privet", "Privet", "Privet", "Privet", "Privet"],
        ["Chat", "You can poison mobs to inhibit their ability to heal.", colors.super],
        ["Chat", "(Likewise, if you are poisoned, your healing will also be inhibited.)", colors.super],
        ["Await Kill"],
        ["Chat", "Step 1 of 3 complete!"],
        ["Wait", 3000],
    ],
    [
        [],  // Padding step, does nothing
        ["Set Biome", "Ocean"],
        ["Set Slots", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic"],
        ["Set Secondary Slots", "Gallery"],
        ["Spawn Mob", "Sponge", 7],
        ["Chat", "Ocean mobs have fast attacks that deal chip damage.", colors.mythic],
        ["Chat", "Getting hit also makes your petals skip some of their reload time.", colors.mythic],
        ["Chat", "This means that if you have slow-reload petals, surviving these attacks can be quite rewarding.", colors.mythic],
        ["Await Chat"],
        ["Set Slots", "Gallery", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic"],
        ["Set Secondary Slots", "Cactus", "Leaf", "Leaf", "Leaf", "Leaf", "Yucca", "Dahlia", "Dahlia", "Stinger", "Stinger"],
        ["Chat", "You can use healing petals to survive these attacks easily.", colors.mythic],
        ["Chat", "You can also use powerful slow-reload petals to punish the mobs for attacking you.", colors.mythic],
        ["Await Kill"],
        ["Chat", "Step 2 of 3 complete!"],
        ["Wait", 3000],
    ],
    [
        [],  // Padding step, does nothing
        ["Set Biome", "Desert"],
        ["Set Slots", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic"],
        ["Set Secondary Slots", "Gallery"],
        ["Spawn Mob", "Baby Fire Ant", 7],
        ["Chat", "Desert mobs are highly poisonous.", colors.irisPurple],
        ["Chat", "In fact, they can even poison you when you hit them with your petals!", colors.irisPurple],
        ["Await Chat"],
        ["Set Slots", "Gallery", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic", "Basic"],
        ["Set Secondary Slots", "Faster", "Faster", "Faster", "Sand", "Sand", "Sand", "Sand", "Fang", "Light", "Light"],
        ["Chat", "Desert mobs also get worn down if you hit them with fast-reload petals.", colors.irisPurple],
        ["Chat", "Doing so will temporarily make the mob much less poisonous.", colors.irisPurple],
        ["Await Kill"],
        ["Chat", "Step 3 of 3 complete!"],
        ["Wait", 3000],
        ["Chat", "Tutorial complete! Now go and enjoy Biome Grid!"],
        ["End"],
    ],
];

/**
 * An updating state for the tutorial (mostly consisting of flags for pausing
 * the tutorial).
 */
export const tutorialState = {
    initialized: false,

    biome: "Garden",
    biomeNumber: 0,
    stepNumber: 0,
    awaitTime: false,
    awaitChatOrKill: false,
    awaitGalleryOrKill: false,
    awaitKill: false,
    timeout: undefined,
    lastMobType: "Shrub",
    lastMob: null,

    client: null,
    playerSpawn: {
        x: 0,
        y: 0,
    },
};

/**
 * An empty inventory given to the player during the tutorial.
 */
export const tutorialInventory = {};

/**
 * The primary petal slots given to the player during the tutorial.
 */
export const tutorialSlots = Array(10).fill({ id: 0, rarity: 0 });

/**
 * The secondary petal slots given to the player during the tutorial.
 */
export const tutorialSecondarySlots = Array(10).fill(null);

/**
 * Initializes the loop that runs each step of the tutorial.
 */
export function initTutorialLoop() {
    if (tutorialState.initialized) {
        console.warn("Tutorial loop is already initialized!");
        return;
    }
    tutorialState.initialized = true;

    const playerTpPoints = {
        Garden: { x: -state.width / 2 + 192 * 12, y: -2 * state.mapConstants.biomeTransition },
        Ocean: { x: -state.width / 2 + 192 * 12, y: 0 },
        Desert: { x: -state.width / 2 + 192 * 12, y: 1.8 * state.mapConstants.biomeTransition },
    };

    const mobSpawnPoints = {
        Garden: { x: -state.width / 2 + 192 * 13, y: -2 * state.mapConstants.biomeTransition },
        Ocean: { x: -state.width / 2 + 192 * 13, y: 0 },
        Desert: { x: -state.width / 2 + 192 * 13, y: 1.8 * state.mapConstants.biomeTransition },
    };

    setInterval(() => {
        if (tutorialState.lastMob?.health.isDead) {
            tutorialState.awaitKill = false;
            tutorialState.awaitChatOrKill = false;
            tutorialState.awaitGalleryOrKill = false;
        }

        // Keep the tutorial mob loaded so that it does not despawn
        if (tutorialState.lastMob) {
            tutorialState.lastMob.lastSeen = performance.now();
        }

        if (tutorialState.awaitTime
            || tutorialState.awaitKill
            || tutorialState.awaitChatOrKill
            || tutorialState.awaitGalleryOrKill
            || !tutorialState.client
        ) {
            return;
        }

        tutorialState.stepNumber++;
        if (tutorialState.stepNumber >= tutorialData[tutorialState.biomeNumber]?.length) {
            tutorialState.biomeNumber++;
            tutorialState.stepNumber = 0;
        }
        if (tutorialState.biomeNumber >= tutorialData.length) {
            return;
        }

        const client = tutorialState.client;
        const instruction = tutorialData[tutorialState.biomeNumber][tutorialState.stepNumber];
        switch (instruction[0]) {
            case "Chat":
                client.systemMessage(instruction[1], instruction[2] ?? colors.uncommon);
                break;
            case "Wait":
                tutorialState.awaitTime = true;
                tutorialState.timeout = setTimeout(() => {
                    tutorialState.awaitTime = false;
                }, instruction[1]);
                break;
            case "Set Biome":
                const biome = instruction[1];
                tutorialState.biome = biome;

                if (client.body?.health.ratio > 0) {
                    // Despawn the player's petals when teleporting
                    for (let slot of client.body.petalSlots) {
                        for (let petal of slot.petals) {
                            petal?.destroy();
                        }
                    }

                    const { x, y } = playerTpPoints[biome];
                    tutorialState.playerSpawn.x = x;
                    tutorialState.playerSpawn.y = y;
                    client.body.x = x;
                    client.body.y = y;
                }

                break;
            case "Set Slots":
                // "Populate" the empty inventory with 0's for every possible petal type
                tiers.forEach(tier => {
                    tutorialInventory[tier.name] = {};
                    petalConfigs.forEach(config => {
                        tutorialInventory[tier.name][config.id] = 0;
                    });
                });

                for (let i = 0; i < tutorialSlots.length; i++) {
                    const type = instruction[i + 1] ?? "Basic";
                    if (type === "Gallery") {
                        tutorialSlots[i] = { id: petalIDOf("Gallery"), rarity: 0 };
                    } else {
                        tutorialSlots[i] = { id: petalIDOf(type), rarity: 4 };
                    }
                }

                if (client.body && !client.body.health.isDead) {
                    client.body.initSlots(tutorialSlots.length);
                    for (let i = 0; i < tutorialSlots.length; i++) {
                        if (tutorialSlots[i]) {
                            client.body.setSlot(i, tutorialSlots[i].id, tutorialSlots[i].rarity);
                        }
                    }
                }
                break;
            case "Set Secondary Slots":
                for (let i = 0; i < tutorialSecondarySlots.length; i++) {
                    const type = instruction[i + 1];
                    if (type === "Gallery") {
                        tutorialSecondarySlots[i] = { id: petalIDOf("Gallery"), rarity: 0 };
                    } else if (type === undefined) {
                        tutorialSecondarySlots[i] = null;
                    } else {
                        tutorialSecondarySlots[i] = { id: petalIDOf(type), rarity: 4 };
                    }
                }
                break;
            case "Spawn Mob":
                // Failsafe: Despawn the previous mob if it is somehow still alive
                if (tutorialState.lastMob) {
                    tutorialState.lastMob.damagedBy = {};
                    tutorialState.lastMob.destroy();
                }

                const mob = new Mob(mobSpawnPoints[tutorialState.biome]);
                mob.define(mobConfigs[mobIDOf(instruction[1])], instruction[2]);
                state.aliveMobs.push(mob);

                tutorialState.lastMobType = instruction[1];
                tutorialState.lastMob = mob;

                // Also listen to when the mob gets hit by the Gallery petal
                const originalGetStats = mob.getStatsDescription.bind(mob);
                mob.getStatsDescription = function() {
                    tutorialState.awaitGalleryOrKill = false;
                    return originalGetStats();
                }

                break;
            case "Await Chat":
                client.systemMessage("Send any chat message to continue...", colors.uncommon);
                tutorialState.awaitChatOrKill = true;
                break;
            case "Await Gallery":
                client.systemMessage(`Use the Gallery petal on the ${tutorialState.lastMobType} to continue...`, colors.uncommon);
                tutorialState.awaitGalleryOrKill = true;
                break;
            case "Await Kill":
                client.systemMessage(`Kill the ${tutorialState.lastMobType} to continue...`, colors.uncommon);
                tutorialState.awaitKill = true;
                break;
            case "End":
                endTutorial(tutorialState.client);
                break;
        }
    }, 1000 / 22.5);
}

/**
 * Starts the tutorial for a new client. This includes resetting the tutorial
 * to the first step and resetting all tutorial flags.
 */
export function startTutorial(newClient) {
    tutorialState.client = newClient;
    newClient.doingTutorial = true;

    // Sync the player's max HP with the player's fixed level during tutorial
    if (newClient.body) {
        newClient.body.health.set(newClient.healthAdjustement);
    }

    // "Populate" the empty inventory with 0's for every possible petal type
    tiers.forEach(tier => {
        tutorialInventory[tier.name] = {};
        petalConfigs.forEach(config => {
            tutorialInventory[tier.name][config.id] = 0;
        });
    });

    tutorialState.biomeNumber = 0;
    tutorialState.stepNumber = 0;
    tutorialState.awaitTime = false;
    tutorialState.awaitChatOrKill = false;
    tutorialState.awaitGalleryOrKill = false;
    tutorialState.awaitKill = false;
    clearTimeout(tutorialState.timeout);
}

export function endTutorial(client) {
    client.doingTutorial = false;

    // Respawn the player in the main playing area
    client.body?.destroy(false);
    client.sentBiome = undefined;
    client.spawnPlayer();

    if (client === tutorialState.client) { // This should always be true
        tutorialState.client = null;
        if (tutorialState.lastMob) {
            tutorialState.lastMob.damagedBy = {};
            tutorialState.lastMob.destroy();
        }
    }
}
