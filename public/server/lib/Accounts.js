const ACCOUNTS_FILE = (typeof Bun !== "undefined" && Bun.env.ACCOUNTS_FILE) || "./accounts.json";

// Top level key holding bans and mutes on their own. Prefixed with $ because saves are keyed by numeric Discord ids and cannot collide.
const MODERATION_KEY = "$moderation";

function normalizeName(name) {
    return String(name).toLowerCase();
}

/** the auth server hands out an opaque id, it is not always a numeric Discord snowflake */
function toDiscordId(value) {
    if (value && typeof value === "object") value = value.id ?? value.userId ?? value.discordId;

    const id = String(value ?? "").trim();

    return /^[A-Za-z0-9_-]{3,64}$/.test(id) ? id : "";
}

function snapshot(client) {
    const inventory = {};
    for (const tier in (client.inventory || {})) {
        const petals = client.inventory[tier];
        const positive = {};
        for (const id in petals) {
            const count = Math.floor(+petals[id] || 0);
            if (count > 0) positive[id] = count;
        }
        inventory[tier] = positive;
    }

    return {
        level: Math.min(9999, Math.max(1, Math.floor(+client.level || 1))),
        xp: Math.min(1e21, Math.max(1, +client.xp || 1)),
        slots: (client.slots || []).map(slot => slot ? { id: slot.id, rarity: slot.rarity } : null),
        secondarySlots: (client.secondarySlots || []).map(slot => slot ? { id: slot.id, rarity: slot.rarity } : null),
        inventory,
        craftAttempts: structuredClone(client.craftAttempts || {})
    };
}

const PERMANENT = Infinity;
const MAX_BAN_SECONDS = 10 * 365 * 24 * 3600;
const MAX_MUTE_SECONDS = 30 * 24 * 3600;

function parseDuration(arg, max) {
    const seconds = Math.floor(Number(arg));

    if (!Number.isFinite(seconds) || seconds < 0) return null;

    return seconds === 0 ? PERMANENT : Math.min(max, seconds);
}

function remaining(until) {
    if (until === PERMANENT) return PERMANENT;

    return Math.max(0, until - Date.now());
}

class Accounts {
    constructor() {
        /** @type {Map<string, object>} Discord user id -> { username, data, createdAt, lastSeen } */
        this.saves = new Map();
        /** @type {Map<string, object>} Discord user id -> { playerName, bannedUntil, mutedUntil } */
        this.moderation = new Map();
        this.loaded = false;
        /** @type {Promise<void>} */
        this.ready = this.load();
        /** @type {Promise<void>} */
        this.pending = Promise.resolve();
        /** last write failure, so a caller waiting on flush() can report it instead of guessing */
        this.lastError = null;
    }

    async load() {
        try {
            if (typeof Bun === "undefined") return;

            const file = Bun.file(ACCOUNTS_FILE);
            if (!(await file.exists())) {
                console.log("[Accounts] No accounts file, starting fresh.");
                this.loaded = true;
                return;
            }

            const raw = await file.text();

            // keep the untouched file around: a load that migrates or drops records must never leave the old copy as the only one
            await Bun.write(ACCOUNTS_FILE + ".load-backup", raw).catch(() => {});

            const data = JSON.parse(raw);

            let migrated = 0;
            const dropped = [];

            for (const key in data) {
                if (key === MODERATION_KEY) {
                    const entries = data[key];
                    for (const discordId in entries) {
                        const entry = entries[discordId];

                        // older records kept the name under accountName
                        if (entry && entry.accountName !== undefined && entry.playerName === undefined) {
                            entry.playerName = entry.accountName;
                            delete entry.accountName;
                        }

                        this.moderation.set(String(discordId), entry);
                    }
                    continue;
                }

                const entry = data[key];

                // legacy layout: keyed by account name, carrying a password hash plus the Discord id it was created from
                if (entry?.password) {
                    const discordId = toDiscordId(entry.discordId);

                    if (!discordId) {
                        dropped.push(entry.username || key);
                        continue;
                    }

                    this.saves.set(discordId, {
                        username: entry.username || key,
                        data: entry.data || null,
                        createdAt: +entry.createdAt || Date.now(),
                        lastSeen: +entry.lastLogin || Date.now()
                    });

                    migrated++;
                    continue;
                }

                const discordId = toDiscordId(key);

                if (!discordId) {
                    dropped.push(entry?.username || key);
                    continue;
                }

                this.saves.set(discordId, {
                    username: entry?.username || "",
                    data: entry?.data || null,
                    createdAt: +entry?.createdAt || Date.now(),
                    lastSeen: +entry?.lastSeen || Date.now()
                });
            }

            console.log(`[Accounts] Loaded ${this.saves.size} save(s)${migrated ? `, ${migrated} migrated off the old account layout` : ""}, ${this.moderation.size} moderation record(s)`);

            for (const [discordId, save] of this.saves) {
                console.log(`[Accounts]   save ${discordId} ${save.username || "(no name)"}`);
            }

            if (dropped.length > 0) {
                console.warn(`[Accounts] Dropped ${dropped.length} record(s) with no usable Discord id: ${dropped.join(", ")}`);
            }
        } catch (err) {
            console.warn(`[Accounts] Failed to load ${ACCOUNTS_FILE}, starting fresh:`, err);
        } finally {
            this.loaded = true;
        }
    }

    /** @param {string} discordId */
    find(discordId) {
        return this.saves.get(String(discordId ?? ""));
    }

    /** last seen Discord name -> save, used when the player is offline */
    findByName(query) {
        const lower = normalizeName(query);

        for (const [discordId, save] of this.saves) {
            if (normalizeName(save.username) === lower) return { discordId, save };
        }

        return null;
    }

    /** empty record for a Discord id that has no save yet */
    blank(discordId) {
        return { username: "", data: null, createdAt: Date.now(), lastSeen: Date.now() };
    }

    /**
     * Bind a verified client to the save behind its Discord id, restoring progress when one already exists
     * @param {Client} client
     */
    attach(client) {
        const id = String(client.userId ?? "");
        if (!id) return null;

        const save = this.saves.get(id) || this.blank(id);
        this.saves.set(id, save);

        save.username = client.discordName || client.username || save.username;
        save.lastSeen = Date.now();

        if (save.data) client.restoreFromData(save.data);

        return save;
    }

    saveClient(client) {
        const id = String(client?.userId ?? "");
        if (!id) return;

        const save = this.saves.get(id) || this.blank(id);
        this.saves.set(id, save);

        save.username = client.discordName || client.username || save.username;
        save.lastSeen = Date.now();
        save.data = snapshot(client);

        this.persist().catch(err => console.warn("[Accounts] Save failed:", err));
    }

    /**
     * Infinity serializes to null in JSON, so permanent is stored as -1
     * @param {number} until
     */
    static toStored(until) {
        return until === PERMANENT ? -1 : until;
    }

    /** @param {number} stored */
    static fromStored(stored) {
        const value = +stored;

        if (value === -1) return PERMANENT;
        if (!Number.isFinite(value) || value <= 0) return 0;

        return value;
    }

    /**
     * Get the ban/mute record for a Discord ID, playerName is only used for logging and tracking renames
     * @param {string} discordId
     */
    record(discordId, playerName = "") {
        const id = String(discordId ?? "");

        if (!id) return null;

        let entry = this.moderation.get(id);

        if (!entry) {
            entry = { playerName: "", bannedUntil: 0, mutedUntil: 0 };
            this.moderation.set(id, entry);
        }

        if (playerName && !entry.playerName) entry.playerName = playerName;

        return entry;
    }

    /** remaining ban duration, 0 when not banned */
    banRemaining(discordId) {
        const entry = this.moderation.get(String(discordId ?? ""));
        if (!entry) return 0;

        return remaining(Accounts.fromStored(entry.bannedUntil));
    }

    /** remaining mute duration, 0 when not muted */
    muteRemaining(discordId) {
        const entry = this.moderation.get(String(discordId ?? ""));
        if (!entry) return 0;

        return remaining(Accounts.fromStored(entry.mutedUntil));
    }

    isBanned(discordId) {
        return this.banRemaining(discordId) > 0;
    }

    isMuted(discordId) {
        return this.muteRemaining(discordId) > 0;
    }

    /**
     * @param {string} discordId
     * @param {number} seconds 0 = permanent
     */
    async ban(discordId, seconds, playerName = "") {
        const entry = this.record(discordId, playerName);
        if (!entry) return { ok: false, error: "Missing Discord ID." };

        const duration = parseDuration(seconds, MAX_BAN_SECONDS);
        if (duration === null) return { ok: false, error: "Duration must be a positive number of seconds (0 for permanent)." };

        entry.bannedUntil = Accounts.toStored(duration === PERMANENT ? PERMANENT : Date.now() + duration * 1000);

        await this.persist();

        return { ok: true, entry, duration };
    }

    /**
     * @param {string} discordId
     * @param {number} seconds 0 = permanent
     */
    async mute(discordId, seconds, playerName = "") {
        const entry = this.record(discordId, playerName);
        if (!entry) return { ok: false, error: "Missing Discord ID." };

        const duration = parseDuration(seconds, MAX_MUTE_SECONDS);
        if (duration === null) return { ok: false, error: "Duration must be a positive number of seconds (0 for permanent)." };

        entry.mutedUntil = Accounts.toStored(duration === PERMANENT ? PERMANENT : Date.now() + duration * 1000);

        await this.persist();

        return { ok: true, entry, duration };
    }

    async unmute(discordId) {
        const entry = this.moderation.get(String(discordId ?? ""));
        if (!entry) return { ok: false, error: "That player has no mute on record." };

        entry.mutedUntil = 0;

        await this.persist();

        return { ok: true, entry };
    }

    async unban(discordId) {
        const entry = this.moderation.get(String(discordId ?? ""));
        if (!entry) return { ok: false, error: "That player has no ban on record." };

        entry.bannedUntil = 0;

        await this.persist();

        return { ok: true, entry };
    }

    /**
     * Discord username -> Discord ID that already has a punishment record (for offline lookup)
     * Punishments are keyed by Discord ID, so look up the other way using the name recorded at punishment time
     */
    findModerated(query) {
        const lower = normalizeName(query);
        let fallback = null;

        for (const [discordId, entry] of this.moderation) {
            if (normalizeName(entry.playerName) !== lower) continue;

            // prefer a record that actually carries a punishment
            if (Accounts.fromStored(entry.bannedUntil) > 0 || Accounts.fromStored(entry.mutedUntil) > 0) {
                return discordId;
            }

            fallback ??= discordId;
        }

        // when the name in the punishment record does not match, fall back to the name on the save record
        for (const [discordId, save] of this.saves) {
            if (normalizeName(save.username) === lower && this.moderation.has(discordId)) {
                return discordId;
            }
        }

        return fallback;
    }

    async persist() {
        if (typeof Bun === "undefined") return;

        const write = async () => {
            const output = {};

            for (const [discordId, save] of this.saves) {
                // a save without progress yet is just a player who connected, do not write those
                if (!save.data) continue;
                output[discordId] = save;
            }

            // only write records that have not expired, so the save file cannot grow without bound
            const moderation = {};
            for (const [discordId, entry] of this.moderation) {
                if (entry.bannedUntil === 0 && entry.mutedUntil === 0) continue;
                moderation[discordId] = entry;
            }

            if (Object.keys(moderation).length > 0) output[MODERATION_KEY] = moderation;

            const target = ACCOUNTS_FILE + ".tmp";
            await Bun.write(target, JSON.stringify(output, null, 2));
            await Bun.$`mv ${target} ${ACCOUNTS_FILE}`.quiet();
        };

        this.pending = this.pending.then(write, write).then(() => {
            this.lastError = null;
        }, err => {
            this.lastError = err;
            console.warn("[Accounts] Persist failed:", err);
        });

        return this.pending;
    }

    /** wait for all queued writes to hit disk (call before process exit) */
    async flush() {
        await this.pending;
        if (this.lastError) throw this.lastError;
    }

    /** timestamped copy of the accounts file, keeping only the newest 48 (24h at a 30min cadence) */
    async backup() {
        if (typeof Bun === "undefined") return null;
        await this.flush();

        const stamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, "-").replace("T", "-");
        const name = `${ACCOUNTS_FILE}.auto-${stamp}`;
        await Bun.$`cp ${ACCOUNTS_FILE} ${name}`.quiet();
        const prune = `total=$(ls -1 ${ACCOUNTS_FILE}.auto-* 2>/dev/null | wc -l); if [ "$total" -gt 48 ]; then ls -1 ${ACCOUNTS_FILE}.auto-* | sort | head -n $((total - 48)) | xargs rm -f; fi`;
        await Bun.$`sh -c ${prune}`.quiet().catch(() => {});

        return name;
    }
}

export default new Accounts();