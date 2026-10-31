// Estimates how long one player needs to kill a single mob of a given rarity
// using a loadout made of one petal type.
//
// The fight is simulated with the real server entities at the server tick rate,
// so orbit speed, sizes, collision pushes, petal breakage, reload cooldowns,
// summons, auras and projectiles are the live code. Body contact damage is
// excluded on purpose: the result is the time the chosen petals need alone.
//
//   bun scripts/petalTtk.js --petal Basic --mob-rarity 10
//   bun scripts/petalTtk.js --petal Thorn --petal-rarity 12 --mob Rock --mob-rarity 20
//   bun scripts/petalTtk.js --all --mob-rarity 24 --seconds 90
//
// Notes:
// - The player stands still and holds attack. The target is anchored on the
//   petal orbit by default; --free-target lets knockback and mob movement apply.
// - Time is virtualized: performance.now, Date.now and setTimeout run on the
//   simulation clock, otherwise cooldown and lifetime based petals would be
//   measured against wall clock speed.
// - Petals that only heal, shield or summon still report the damage their own
//   bodies deal.
// - The simulated player has no client, so bonuses that read the equipped
//   loadout (Diamond, Clover, Blood Leaf, Shiny Wing, Uranium, Shovel) do not
//   proc. Those petals are measured without their cross-petal synergy.

// config.js logs its load summary at import time, which would corrupt --json.
// Keep stdout clean while the server modules are evaluated.
const consoleLog = console.log;
console.log = () => {};

const { Mob, PetalSlot, Player } = await import("../public/server/lib/Entity.js");
const { default: SpatialHashGrid } = await import("../public/server/lib/SpatialHashGrid.js");
const { mobConfigs, petalConfigs } = await import("../public/server/lib/config.js");
const { default: state } = await import("../public/server/lib/state.js");

console.log = consoleLog;

const TICK_RATE = 22.5;
const TICK_MS = 1000 / TICK_RATE;
const WORLD_SIZE = 4000;

const realNow = performance.now.bind(performance);
const realDateNow = Date.now;

SpatialHashGrid.configure(WORLD_SIZE, WORLD_SIZE);
state.width = WORLD_SIZE;
state.height = WORLD_SIZE;

// ---------------------------------------------------------------------------
// virtual clock, timers and rng
// ---------------------------------------------------------------------------

let simNow = 0;
const simEpoch = realDateNow();
const timers = new Map();
let timerID = 1;

globalThis.setTimeout = (callback, delay = 0, ...rest) => {
    const id = timerID++;
    timers.set(id, { at: simNow + Math.max(0, Number(delay) || 0), callback, rest });
    return id;
};
globalThis.clearTimeout = id => {
    timers.delete(id);
};
performance.now = () => simNow;
Date.now = () => simEpoch + simNow;

function runTimers() {
    let due = null;

    for (const [id, timer] of timers) {
        if (timer.at > simNow) continue;

        (due ??= []).push([id, timer]);
    }

    if (!due) return;

    due.sort((a, b) => a[1].at - b[1].at);

    for (const [id, timer] of due) {
        timers.delete(id);
        try {
            timer.callback(...timer.rest);
        } catch (err) {
            console.warn("[petalTtk] timer failed:", err.message);
        }
    }
}

/** small deterministic prng so repeated sweeps are comparable */
function seedRandom(seed) {
    let value = seed >>> 0;

    Math.random = () => {
        value = (value + 0x6D2B79F5) >>> 0;
        let t = value;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// ---------------------------------------------------------------------------
// arguments
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const flag = (name, fallback) => {
    const at = args.indexOf(name);
    return at === -1 ? fallback : args[at + 1];
};
const has = name => args.includes(name);

if (has("--help") || has("-h")) {
    console.log(`Usage: bun scripts/petalTtk.js [options]

  --petal <name>         petal to test (default Basic)
  --petal-rarity <n>     petal rarity (default: --mob-rarity)
  --mob <name>           target mob (default Rock)
  --mob-rarity <n>       target rarity (default 10)
  --slots <n>            equipped slots, one petal per slot (default 5, max 10)
  --seconds <n>          simulation cap per fight (default 60)
  --seed <n>             random seed (default 1)
  --free-target          let the mob move and be pushed (default: anchored)
  --all                  run every equippable petal
  --json                 print machine readable rows

Times are in seconds of in-game time. Body contact damage is excluded. The
target is anchored on the petal orbit by default, like a training dummy, so
knockback cannot push it out of range.`);
    process.exit(0);
}

const clampRarity = value => Math.max(0, Math.min(29, Math.floor(Number(value) || 0)));
const mobName = String(flag("--mob", "Rock"));
const mobRarity = clampRarity(flag("--mob-rarity", 10));
const petalRarity = clampRarity(flag("--petal-rarity", mobRarity));
const slots = Math.max(1, Math.min(10, Math.floor(Number(flag("--slots", 5)) || 5)));
const maxSeconds = Math.max(1, Number(flag("--seconds", 60)) || 60);
const seed = Math.floor(Number(flag("--seed", 1)) || 1);
const wantJSON = has("--json");
const anchored = !has("--free-target");

const mobConfig = mobConfigs.find(mob => mob.name.toLowerCase() === mobName.toLowerCase());

if (!mobConfig) {
    console.error(`Unknown mob "${mobName}".`);
    process.exit(1);
}

// internal configs (projectiles, auras) are not equippable petals
const isInternalPetal = config => config.name.includes(".");

function findPetal(name) {
    return petalConfigs.findIndex(config => config.name.toLowerCase() === String(name).toLowerCase());
}

const requestedName = String(flag("--petal", "Basic"));

if (has("--all")) {
    // every equippable petal
} else if (findPetal(requestedName) === -1) {
    console.error(`Unknown petal "${requestedName}".`);
    process.exit(1);
}

// ---------------------------------------------------------------------------
// simulation
// ---------------------------------------------------------------------------

function resetWorld() {
    state.entities.clear();
    state.drops?.clear?.();
    state.pentagrams?.clear?.();
    state.lightning?.clear?.();
    if (Array.isArray(state.aliveMobs)) state.aliveMobs.length = 0;

    timers.clear();
    simNow = 0;
    seedRandom(seed);

    state.spatialHash = new SpatialHashGrid();
    state.terrainSpatialHash = new SpatialHashGrid();
}

/** one fight, returns seconds to kill or null when the mob outlives the cap */
function simulate(petalId) {
    resetWorld();

    const player = new Player({ x: 0, y: 0 });
    player.health.set(1e21);
    player.health.maxHealth = 1e21;
    player.damage = 0; // body damage stays out of the measurement
    player.attack = true;
    player.petalSlots = [];

    for (let i = 0; i < slots; i++) {
        const slot = new PetalSlot(player, i);
        slot.define(petalConfigs[petalId], petalRarity);
        player.petalSlots.push(slot);
    }

    // Put the target on the petal orbit, which is where a player fights from.
    // Orbit radius mirrors PetalSlot.update: player size + 52.5 * ratio, with
    // attack held (0.5) and the widest extraRange of the loadout.
    const orbitConfig = player.petalSlots[0].config;
    const orbitRange = orbitConfig.tiers[petalRarity].extraRange || 0;
    const orbitRatio = 1.5 * (1 + orbitRange);
    const orbitDistance = player.size + 52.5 * (orbitConfig.huddles ? 0.65 : orbitRatio);

    const mob = new Mob({ x: orbitDistance, y: 0 });
    mob.define(mobConfig, mobRarity);
    mob.spawnInvincibility = false;

    const anchor = { x: mob.x, y: mob.y };

    const maxTicks = Math.ceil(maxSeconds * TICK_RATE);

    for (let tick = 1; tick <= maxTicks; tick++) {
        simNow = tick * TICK_MS;
        runTimers();

        // state.entities holds every entity the server would tick, including
        // summons, projectiles and auras spawned by the petals
        const entities = new Set(state.entities.values());

        entities.add(player);
        entities.add(mob);

        for (const entity of entities) {
            entity._AABB = state.spatialHash.getAABB(entity);
            state.spatialHash.insert(entity);
        }

        for (const entity of entities) entity.collisionIDs.clear();

        for (const entity of entities) {
            if (entity !== player) entity.update();
        }

        player.collide();

        for (const entity of entities) {
            if (entity !== player) entity.collide();
        }

        if (mob.health.isDead || mob.health.health <= 0) {
            return { seconds: tick / TICK_RATE, ticks: tick, remaining: 0 };
        }

        // training dummy: keep the target on the orbit instead of letting
        // knockback push it out of petal range
        if (anchored) {
            mob.x = anchor.x;
            mob.y = anchor.y;
            mob.velocity.x = 0;
            mob.velocity.y = 0;
        }

        state.spatialHash.clear();
    }

    return { seconds: null, ticks: maxTicks, remaining: mob.health.health };
}

function formatNumber(value) {
    if (!Number.isFinite(value)) return String(value);
    if (value !== 0 && (Math.abs(value) >= 1e6 || Math.abs(value) < 0.01)) return value.toExponential(2);
    return Number(value.toFixed(2)).toLocaleString("en-US");
}

// ---------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------

const started = realNow();
const mobTier = mobConfig.tiers[mobRarity];

const targets = [];

if (has("--all")) {
    for (let id = 0; id < petalConfigs.length; id++) {
        if (isInternalPetal(petalConfigs[id])) continue;
        targets.push({ id, name: petalConfigs[id].name, damage: petalConfigs[id].tiers[petalRarity]?.damage ?? 0 });
    }
} else {
    const id = findPetal(requestedName);
    targets.push({ id, name: petalConfigs[id].name, damage: petalConfigs[id].tiers[petalRarity]?.damage ?? 0 });
}

const rows = [];

for (const target of targets) {
    let result = { seconds: null, ticks: 0, remaining: mobTier.health };

    try {
        result = simulate(target.id);
    } catch (err) {
        rows.push({ ...target, seconds: null, error: err.message, remaining: mobTier.health });
        continue;
    }

    rows.push({ ...target, ...result });
}

const elapsed = (realNow() - started) / 1000;

// fastest first, petals that never killed the target stay at the end
if (has("--all")) {
    rows.sort((a, b) => (a.seconds ?? Infinity) - (b.seconds ?? Infinity) || a.name.localeCompare(b.name));
}

if (wantJSON) {
    console.log(JSON.stringify({
        mob: mobConfig.name,
        mobRarity,
        mobHealth: mobTier.health,
        mobArmor: mobTier.armor,
        petalRarity,
        slots,
        seconds: maxSeconds,
        seed,
        elapsed,
        rows: rows.map(row => ({
            name: row.name,
            damage: row.damage,
            time: row.seconds,
            dps: row.seconds ? mobTier.health / row.seconds : null,
            error: row.error ?? null
        }))
    }, null, 2));
} else {
    console.log(`Mob: ${mobConfig.name} rarity ${mobRarity} - ${formatNumber(mobTier.health)} HP, ${formatNumber(mobTier.armor)} armor`);
    console.log(`Petal rarity ${petalRarity}, ${slots} slots, attack held, body damage excluded, cap ${maxSeconds}s`);
    console.log(anchored ? "Target anchored on the petal orbit (training dummy)" : "Target free: knockback and mob movement included");
    console.log("Damage/hit is the slot body; summons, auras and projectiles count toward Time.");
    console.log("");

    const width = Math.max(16, ...rows.map(row => row.name.length)) + 2;
    console.log(`${"Petal".padEnd(width)}${"Damage/hit".padStart(14)}${"Time".padStart(12)}${"DPS".padStart(14)}`);

    for (const row of rows) {
        if (row.error) {
            console.log(row.name.padEnd(width) + "error: " + row.error);
            continue;
        }

        const time = row.seconds === null ? `>${maxSeconds}s` : `${row.seconds.toFixed(2)}s`;
        const dps = row.seconds ? formatNumber(mobTier.health / row.seconds) : "-";

        console.log(
            row.name.padEnd(width) +
            formatNumber(row.damage).padStart(14) +
            time.padStart(12) +
            dps.padStart(14)
        );
    }

    if (has("--all")) console.log(`\n${rows.length} petals in ${elapsed.toFixed(1)}s wall clock`);
}
