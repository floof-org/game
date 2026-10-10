// One-off ops script: put an account's inventory and pity back the way they were
// before the most recent wipeHighRarity run.
//
// wipeHighRarity writes accounts.json.pre-wipe before every run and overwrites it,
// so this restores from the state of the LAST run only.
//
//   node scripts/restoreFromPreWipe.js accounts.json l3veticus_ --dry
//   node scripts/restoreFromPreWipe.js accounts.json l3veticus_

// package.json sets "type": "module", so this has to be ESM
import fs from "node:fs";

const FILE = process.argv[2] || "./accounts.json";
const USERNAME = String(process.argv[3] || "").toLowerCase();

const dryRun = process.argv.includes("--dry");

if (!USERNAME) {
    console.error("Usage: node scripts/restoreFromPreWipe.js [accounts.json] [username] [--dry]");
    process.exit(1);
}

const BACKUP = FILE + ".pre-wipe";

if (!fs.existsSync(BACKUP)) {
    console.error(`No backup at ${BACKUP}. Nothing to restore from.`);
    process.exit(1);
}

const current = JSON.parse(fs.readFileSync(FILE, "utf8"));
const backup = JSON.parse(fs.readFileSync(BACKUP, "utf8"));

const wanted = String(USERNAME).toLowerCase();

/** Discord id -> save, skipping the moderation key */
const find = data => {
    for (const [id, save] of Object.entries(data)) {
        if (id.startsWith("$")) continue;
        if (String(save?.username || "").toLowerCase() === wanted) return save;
    }
    return null;
};

const target = find(current);
const source = find(backup);

if (!source?.data) {
    console.error(`${USERNAME} has no save data in ${BACKUP}.`);
    process.exit(1);
}

if (!target) {
    console.error(`${USERNAME} is not in ${FILE}.`);
    process.exit(1);
}

target.data ??= {};

// only these two keys, level and xp are left as the wipe set them
target.data.inventory = source.data.inventory ?? {};
target.data.craftAttempts = source.data.craftAttempts ?? {};

const petalCount = Object.values(target.data.inventory)
    .reduce((sum, petals) => sum + Object.values(petals).reduce((n, count) => n + (+count || 0), 0), 0);

if (dryRun) {
    console.log(`(dry run) would restore ${petalCount} petals and the craft pity for ${source.username}`);
} else {
    fs.writeFileSync(FILE, JSON.stringify(current, null, 2));
    console.log(`Restored ${petalCount} petals and the craft pity for ${source.username}`);
}