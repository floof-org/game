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

// package.json sets "type": "module", so this has to be ESM
import fs from "node:fs";

const FILE = "accounts.json";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry");
const positional = args.filter(arg => !arg.startsWith("--"));

const targets = positional
    .filter(arg => !arg.endsWith(".json") && !arg.includes("accounts.json"))
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

if (dryRun) {
    console.log("(dry run, nothing written)");
} else {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
    console.log("written");
}