// One-off ops script: strip high rarity petals and pity from named accounts.
//
// Stop the server before running it, otherwise the in-memory save of a connected
// player overwrites the file on exit. Restart after.
//
//   node scripts/wipeHighRarity.js accounts.json --dry
//   node scripts/wipeHighRarity.js accounts.json
//   node scripts/wipeHighRarity.js accounts.json --all-pity

// package.json sets "type": "module", so this has to be ESM
import fs from "node:fs";

const FILE = process.argv[2] || "./accounts.json";

// Only these two accounts are touched. Anyone else in the save file, and every
// account that is not listed here, is left exactly as it is.

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

/** username (lowercased) -> level to set */
const LEVELS = {
    gravityfan: 625,
    l3veticus_: 625
};

/** Client#addXP recomputes level from xp, and restoreFromData runs addXP(0) on login, so xp has to move with it */
const xpForLevel = level => Math.pow(level, 2.35) + Math.exp(level / 25);

const MODERATION_KEY = "$moderation";

/**
 * Rarity name -> index, case insensitive.
 * Chat crafting writes its pity under lowercase rarity keys (Client.js restores
 * those separately), so a plain TIERS.indexOf lookup misses them entirely.
 */
const TIER_INDEX = new Map(TIERS.map((name, i) => [name.toLowerCase(), i]));
const indexOfTier = name => TIER_INDEX.get(String(name).toLowerCase()) ?? -1;

/** highest stack size kept for the rarities that are not wiped outright, per account */
const CAPS = {
    gravityfan: 200,
    l3veticus_: 200
};

const wipeAllPity = process.argv.includes("--all-pity");
const dryRun = process.argv.includes("--dry");

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
    const min = TARGETS[key];
    if (min === undefined) continue;

    matched.add(key);

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

    const cap = CAPS[key] ?? 200;
    let removed = 0;
    let capped = 0;
    for (const tier of Object.keys(d.inventory || {})) {
        if (indexOfTier(tier) >= min) {
            for (const id of Object.keys(d.inventory[tier])) removed += +d.inventory[tier][id] || 0;
            // zeroed rather than deleted: the client merges inventory per petal id and
            // never forgets an id the server stops sending
            d.inventory[tier] = {};
            continue;
        }

        // rarities that survive still get a cap, so a stacked petal cannot sit at 100k
        if (!Number.isFinite(cap)) continue;

        for (const id of Object.keys(d.inventory[tier])) {
            const count = Math.floor(+d.inventory[tier][id] || 0);
            if (count <= cap) continue;
            capped += count - cap;
            d.inventory[tier][id] = cap;
        }
    }

    // pity keys can be properly cased or lowercase, and the value can be an
    // object or a per-petal array, so match on the key and blank whatever form
    for (const rarity of Object.keys(d.craftAttempts || {})) {
        if (wipeAllPity || indexOfTier(rarity) >= min) d.craftAttempts[rarity] = {};
    }

    const level = LEVELS[key];
    let levelNote = "";

    if (level !== undefined) {
        levelNote = `, level ${d.level} -> ${level}`;
        d.level = level;
        // Level alone does not stick: restoreFromData runs addXP(0) on login, which
        // recomputes the level from the xp total. So xp has to be pinned to exactly
        // the target level, not merely raised to it. Keeping a higher xp leaves the
        // old, higher level to be recomputed right back.
        d.xp = xpForLevel(level - 1);
    }

    const capNote = Number.isFinite(cap) ? `${capped} clamped down to the ${cap} cap` : "no stack cap";

    console.log(
        `${save.username}: rarity ${TIERS[min]} and up cleared, ${removed} petals removed, ` +
        `${capNote}, pity ${TIERS[min]} and up cleared${levelNote}`
    );
}

for (const name of Object.keys(TARGETS)) {
    if (matched.has(name)) continue;
    console.warn(`WARNING: ${name} was not found in ${FILE}. Check the recorded username in the save file.`);
}

if (dryRun) {
    console.log("(dry run, nothing written)");
} else {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
    console.log("written");
}