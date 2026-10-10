// One-off ops script: strip high rarity petals and pity from named accounts.
//
// Stop the server before running it, otherwise the in-memory save of a connected
// player overwrites the file on exit. Restart after.
//
//   node scripts/wipeHighRarity.js accounts.json --dry
//   node scripts/wipeHighRarity.js accounts.json
//   node scripts/wipeHighRarity.js accounts.json --all-pity

const fs = require("fs");

const FILE = process.argv[2] || "./accounts.json";

/** username (lowercased) -> lowest rarity index that gets wiped, matches the tiers array in public/lib/protocol.js */
const TARGETS = {
    gravityfan: 10, // Eternal and up
    l3veticus_: 11 // Unique and up
};

const TIERS = [
    "Common", "Uncommon", "Rare", "Epic", "Legendary", "Mythic", "Ultra", "Super", "Ancient",
    "Omega", "Eternal", "Unique", "Hyper", "Galaxium", "Millom", "Fictional", "Transcestrial",
    "Chaos", "Absiorcadinary", "Absolute Fictional", "Nullified", "Hyperfixation", "Atlantical",
    "Alpha", "Finalist", "Epsilation", "Improbable", "Izolational", "Chronodynamic", "Multiversal"
];

const MODERATION_KEY = "$moderation";

/**
 * Rarity name -> index, case insensitive.
 * Chat crafting writes its pity under lowercase rarity keys (Client.js restores
 * those separately), so a plain TIERS.indexOf lookup misses them entirely.
 */
const TIER_INDEX = new Map(TIERS.map((name, i) => [name.toLowerCase(), i]));
const indexOfTier = name => TIER_INDEX.get(String(name).toLowerCase()) ?? -1;

const wipeAllPity = process.argv.includes("--all-pity");
const dryRun = process.argv.includes("--dry");

const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);

// never edit in place without a copy of what was there
fs.writeFileSync(FILE + ".pre-wipe", raw);

for (const [id, save] of Object.entries(data)) {
    if (id === MODERATION_KEY) continue;

    const min = TARGETS[String(save?.username || "").toLowerCase()];
    if (min === undefined) continue;

    const d = save.data;
    if (!d) {
        console.log(`${save.username}: no save data, skipped`);
        continue;
    }

    for (const list of ["slots", "secondarySlots"]) {
        if (!Array.isArray(d[list])) continue;
        for (let i = 0; i < d[list].length; i++) {
            const slot = d[list][i];
            if (slot && +slot.rarity >= min) d[list][i] = null;
        }
    }

    let removed = 0;
    for (const tier of Object.keys(d.inventory || {})) {
        if (indexOfTier(tier) < min) continue;
        for (const id of Object.keys(d.inventory[tier])) removed += +d.inventory[tier][id] || 0;
        // zeroed rather than deleted: the client merges inventory per petal id and
        // never forgets an id the server stops sending
        d.inventory[tier] = {};
    }

    // pity keys can be properly cased or lowercase, and the value can be an
    // object or a per-petal array, so match on the key and blank whatever form
    for (const rarity of Object.keys(d.craftAttempts || {})) {
        if (wipeAllPity || indexOfTier(rarity) >= min) d.craftAttempts[rarity] = {};
    }

    console.log(`${save.username}: rarity ${TIERS[min]} and up cleared, ${removed} petals removed from inventory`);
}

if (dryRun) {
    console.log("(dry run, nothing written)");
} else {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
    console.log("written");
}