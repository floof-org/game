// One-off ops script: restore inventory and xp for named accounts from a
// timestamped accounts.json.auto-* backup.
//
// Stop the server before running it, otherwise the in-memory save of a connected
// player overwrites the file on exit. Restart after.
//
// Newest backup wins. Level, slots and craft pity are left as they are.
//
//   node scripts/restoreFromBackups.js itzshovel arrasfanboii
//   node scripts/restoreFromBackups.js itzshovel arrasfanboii accounts.json.auto-2026-10-10-01-09-29
//   node scripts/restoreFromBackups.js itzshovel arrasfanboii --dry
//   node scripts/restoreFromBackups.js itzshovel arrasfanboii --xp 140b --remove armor,amulet

// package.json sets "type": "module", so this has to be ESM
import fs from "node:fs";

const FILE = "accounts.json";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry");

/** petals to zero out after the restore, by index into petalConfigs */
const PETAL_NAMES = { amulet: 41, armor: 58 };

/** value of a flag, or "" when the flag was not passed */
const flagValue = flag => {
    const at = args.indexOf(flag);
    return at === -1 ? "" : String(args[at + 1] ?? "");
};

const removeArg = flagValue("--remove").toLowerCase();
const REMOVE_PETALS = removeArg
    .split(",")
    .map(name => name.trim())
    .filter(Boolean)
    .map(name => {
        const index = PETAL_NAMES[name.toLowerCase()];
        if (!Number.isInteger(index)) {
            console.error(`Unknown petal "${name}". Known: ${Object.keys(PETAL_NAMES).join(", ")}`);
            process.exit(1);
        }
        return index;
    });

/** --xp accepts plain numbers and a b/m suffix, e.g. 140b */
function parseXp(value) {
    const match = /^([\d.]+)\s*([bmk]?)$/i.exec(String(value).trim());
    if (!match) return null;

    const scale = { "": 1, b: 1e9, m: 1e6, k: 1e3 }[match[2].toLowerCase()];

    return Number(match[1]) * scale;
}

const FORCED_XP = args.includes("--xp") ? parseXp(flagValue("--xp")) : null;

if (args.includes("--xp") && FORCED_XP === null) {
    console.error(`Could not read --xp "${flagValue("--xp")}". Use a number, optionally suffixed b/m/k.`);
    process.exit(1);
}

/** level for a cumulative xp total, mirroring levelForXP in public/lib/util.js */
const levelForXP = xp => {
    const xpForLevel = level => Math.pow(level, 2.35) + Math.exp(level / 25);
    let level = 1;

    while (xp >= xpForLevel(level)) level++;

    return level;
};
const positional = args.filter(arg => !arg.startsWith("--"));

/** drop the values that belong to a flag, so "140b" is not read as a username */
const flagValues = new Set();

for (const flag of ["--remove", "--xp"]) {
    const at = args.indexOf(flag);
    if (at !== -1 && args[at + 1]) flagValues.add(args[at + 1]);
}

const targets = positional
    .filter(arg => !arg.endsWith(".json") && !arg.includes("accounts.json") && !flagValues.has(arg))
    .map(name => name.toLowerCase());

const backups = positional.filter(arg => arg.includes(".json") && arg !== FILE);

if (targets.length === 0) {
    console.error("Usage: node scripts/restoreFromBackups.js <username...> [backup files...] [--dry]");
    process.exit(1);
}

// no explicit backups: take the two newest, oldest applied first so the newest wins
if (backups.length === 0) {
    const prefix = FILE + ".auto-";
    const found = fs.readdirSync(".")
        .filter(name => name.startsWith(prefix))
        .sort()
        .reverse()
        .slice(0, 2)
        .reverse();

    backups.push(...found);

    if (found.length === 0) {
        console.error(`No ${prefix}* backups found.`);
        process.exit(1);
    }
}

if (!fs.existsSync(FILE)) {
    console.error(`No ${FILE} in the current directory.`);
    process.exit(1);
}

console.log(`Restoring ${targets.join(", ")} from:\n  ${backups.join("\n  ")}\n`);

const data = JSON.parse(fs.readFileSync(FILE, "utf8"));

/** every Discord id -> save for the target accounts, skipping the moderation key */
const findAll = source => {
    const hits = [];

    for (const [id, save] of Object.entries(source)) {
        if (id.startsWith("$")) continue;
        if (targets.includes(String(save?.username || "").toLowerCase())) hits.push([id, save]);
    }

    return hits;
};

const restored = new Set();

for (const file of backups) {
    if (!fs.existsSync(file)) {
        console.error(`Skipping ${file}, not found.`);
        continue;
    }

    const backup = JSON.parse(fs.readFileSync(file, "utf8"));
    const hits = findAll(backup);

    if (hits.length === 0) {
        console.log(`${file}: none of the target accounts present.`);
        continue;
    }

    // every target in this backup, not just the first one
    for (const [id, save] of hits) {
        const current = data[id];

        if (!current) {
            console.error(`${save.username} is not in ${FILE}, cannot restore.`);
            continue;
        }

        current.data ??= {};
        current.data.inventory = save.data?.inventory ?? {};
        current.data.xp = save.data?.xp ?? current.data.xp;

        restored.add(String(save.username).toLowerCase());

        const petals = Object.values(current.data.inventory)
            .reduce((sum, tier) => sum + Object.values(tier).reduce((n, count) => n + (+count || 0), 0), 0);

        console.log(`${file}: ${save.username} -> xp ${save.data?.xp}, ${petals} petals`);
    }
}

for (const name of targets) {
    if (restored.has(name.toLowerCase())) continue;
    console.warn(`WARNING: ${name} was not found in any backup. Check the recorded username in ${FILE}.`);
}

// Applied after the restore, so the restored xp and inventory are adjusted
for (const name of targets) {
    const key = name.toLowerCase();
    const entry = Object.entries(data).find(([id, save]) =>
        !id.startsWith("$") && String(save?.username || "").toLowerCase() === key
    );

    if (!entry) continue;

    const [id, save] = entry;
    const d = save.data;
    if (!d) continue;

    if (FORCED_XP !== null) {
        d.xp = FORCED_XP;
        // addXP(0) derives the level from xp on login, so the stored level has to follow
        d.level = levelForXP(FORCED_XP);
    }

    let cleared = 0;

    if (REMOVE_PETALS.length > 0) {
        d.inventory ??= {};

        for (const tier of Object.keys(d.inventory)) {
            const petals = d.inventory[tier];
            if (!petals || typeof petals !== "object") continue;

            for (const petalId of Object.keys(petals)) {
                if (!REMOVE_PETALS.includes(Number(petalId))) continue;
                cleared += Math.floor(+petals[petalId] || 0);
                // zeroed rather than deleted: the client merges inventory per petal id
                // and never forgets an id the server stops sending
                petals[petalId] = 0;
            }
        }
    }

    if (FORCED_XP !== null || cleared > 0) {
        const names = REMOVE_PETALS.map(i => Object.keys(PETAL_NAMES).find(n => PETAL_NAMES[n] === i)).join(" + ");
        console.log(`  ${save.username}: xp ${d.xp} (level ${d.level})${cleared > 0 ? `, cleared ${cleared} ${names}` : ""}`);
    }
}

if (dryRun) {
    console.log("(dry run, nothing written)");
} else {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
    console.log("written");
}