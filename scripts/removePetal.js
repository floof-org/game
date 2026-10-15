// One-off ops script: zero out one or more petals for every account in the save
// file, except an optional list of usernames that are left alone.
//
// Stop the server before running it, otherwise the in-memory save of a connected
// player overwrites the file on exit. Restart after.
//
//   node scripts/removePetal.js armor,amulet
//   node scripts/removePetal.js armor,amulet --keep shiny_frog2020
//   node scripts/removePetal.js dice --keep shiny_frog2020,othername --dry

// package.json sets "type": "module", so this has to be ESM
import fs from "node:fs";

const FILE = "accounts.json";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry");

/** petal name -> index into petalConfigs in public/lib/protocol.js */
const PETALS = {
    amulet: 41,
    armor: 58,
    bone: 10,
    clover: 90,
    dice: 74,
    thorn: 99
};

const flagValue = flag => {
    const at = args.indexOf(flag);
    return at === -1 ? "" : String(args[at + 1] ?? "");
};

const removeArg = flagValue("--remove").toLowerCase() || "armor,amulet";
const keepArg = flagValue("--keep").toLowerCase();

// flag values are arguments too, they must not be read as petal names or usernames
const flagValues = new Set(["--remove", "--keep"].map(f => flagValue(f)).filter(Boolean));

const targets = removeArg
    .split(",")
    .map(name => name.trim())
    .filter(Boolean)
    .map(name => {
        const index = PETALS[name];
        if (!Number.isInteger(index)) {
            console.error(`Unknown petal "${name}". Known: ${Object.keys(PETALS).join(", ")}`);
            process.exit(1);
        }
        return index;
    });

const keep = new Set(keepArg.split(",").map(name => name.trim().toLowerCase()).filter(Boolean));

if (targets.length === 0) {
    console.error("Usage: node scripts/removePetal.js <petals> [--keep <usernames>] [--dry]");
    process.exit(1);
}

if (!fs.existsSync(FILE)) {
    console.error(`No ${FILE} in the current directory.`);
    process.exit(1);
}

const names = targets.map(i => Object.keys(PETALS).find(n => PETALS[n] === i)).join(" + ");

console.log(`Zeroing ${names} for every account except: ${keep.size ? [...keep].join(", ") : "(nobody)"}\n`);

const raw = fs.readFileSync(FILE, "utf8");
const data = JSON.parse(raw);

// never edit in place without a copy of what was there
fs.writeFileSync(FILE + ".pre-petal-removal", raw);

let touched = 0;
let totalRemoved = 0;

for (const [id, save] of Object.entries(data)) {
    if (id.startsWith("$")) continue;

    const username = String(save?.username || "");
    const d = save?.data;

    if (!d) continue;

    if (keep.has(username.toLowerCase())) {
        console.log(`${username}: kept as requested`);
        continue;
    }

    let removed = 0;

    d.inventory ??= {};

    for (const rarity of Object.keys(d.inventory)) {
        const petals = d.inventory[rarity];
        if (!petals || typeof petals !== "object") continue;

        for (const petalId of Object.keys(petals)) {
            if (!targets.includes(Number(petalId))) continue;
            removed += Math.floor(+petals[petalId] || 0);
            // zeroed rather than deleted: the client merges inventory per petal id and
            // never forgets an id the server stops sending
            petals[petalId] = 0;
        }
    }

    // equipped copies count too, otherwise the player keeps the benefit
    let unequipped = 0;

    for (const list of [d.slots, d.secondarySlots]) {
        if (!Array.isArray(list)) continue;

        for (let i = 0; i < list.length; i++) {
            const slot = list[i];
            if (!slot || !targets.includes(Number(slot.id))) continue;
            list[i] = list === d.slots ? { id: 0, rarity: 0 } : null;
            unequipped++;
        }
    }

    if (removed > 0 || unequipped > 0) {
        touched++;
        totalRemoved += removed;
        console.log(`${username}: ${removed} removed from the bag${unequipped ? `, ${unequipped} unequipped` : ""}`);
    }
}

console.log(`\n${touched} account(s) touched, ${totalRemoved} petals removed.`);

if (dryRun) {
    console.log("(dry run, nothing written)");
} else {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
    console.log("written");
}