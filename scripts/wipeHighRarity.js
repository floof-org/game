// One-off ops script: strip a single petal out of two named accounts.
//
// Stop the server before running it, otherwise the in-memory save of a connected
// player overwrites the file on exit. Restart after.
//
//   node scripts/wipeHighRarity.js accounts.json --dry
//   node scripts/wipeHighRarity.js accounts.json

// package.json sets "type": "module", so this has to be ESM
import fs from "node:fs";

const FILE = process.argv[2] || "./accounts.json";

const dryRun = process.argv.includes("--dry");

/** the petal to remove, index into the petalConfigs array in public/lib/protocol.js */
const PETAL_NAME = "ӇЄҲƛƓƠƝ";
const PETAL_INDEX = 94;

/** usernames (lowercased) to clean, nobody else is touched */
const TARGETS = ["itzshovel", "noahcas"];

/** how far down the equipped slot arrays to look */
const MAX_SLOTS = 64;

const MODERATION_KEY = "$moderation";

const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);

// never edit in place without a copy of what was there
fs.writeFileSync(FILE + ".pre-wipe", raw);

// the save file is keyed by Discord id, so accounts are matched on the recorded
// username. A target that never matched means the Discord username changed and this
// run would have silently done nothing for them, so it is called out at the end.
const matched = new Set();

for (const [id, save] of Object.entries(data)) {
    if (id === MODERATION_KEY) continue;

    const key = String(save?.username || "").toLowerCase();

    if (!TARGETS.includes(key)) continue;

    matched.add(key);

    const d = save.data;

    if (!d) {
        console.log(`${save.username}: no save data, skipped`);
        continue;
    }

    let removed = 0;
    let unequipped = 0;

    d.inventory ??= {};

    // rarity keys differ in case between the bag and the chat crafting tables,
    // so match the petal index case insensitively across all of them
    for (const rarity of Object.keys(d.inventory)) {
        const petals = d.inventory[rarity];
        if (!petals || typeof petals !== "object") continue;

        for (const petalId of Object.keys(petals)) {
            if (Number(petalId) !== PETAL_INDEX) continue;
            removed += Math.floor(+petals[petalId] || 0);
            // zeroed rather than deleted: the client merges inventory per petal id
            // and never forgets an id the server stops sending
            petals[petalId] = 0;
        }
    }

    for (const list of [d.slots, d.secondarySlots]) {
        if (!Array.isArray(list)) continue;

        for (let i = 0; i < Math.min(list.length, MAX_SLOTS); i++) {
            const slot = list[i];
            if (!slot || Number(slot.id) !== PETAL_INDEX) continue;
            list[i] = null;
            unequipped++;
        }
    }

    console.log(
        `${save.username}: removed ${removed} ${PETAL_NAME} from the bag` +
        (unequipped > 0 ? `, unequipped ${unequipped}` : "")
    );
}

for (const name of TARGETS) {
    if (matched.has(name)) continue;
    console.warn(`WARNING: ${name} was not found in ${FILE}. Check the recorded username in the save file.`);
}

if (dryRun) {
    console.log("(dry run, nothing written)");
} else {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
    console.log("written");
}