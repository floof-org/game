const enc = new TextEncoder();
const dec = new TextDecoder();

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 256;

const ACCOUNTS_FILE = (typeof Bun !== "undefined" && Bun.env.ACCOUNTS_FILE) || "./accounts.json";

// Top level key holding bans and mutes on their own. Prefixed with $ because account names only allow [A-Za-z0-9_] and cannot collide.
const MODERATION_KEY = "$moderation";

function hexEncode(bytes) {
    return Array.from(bytes).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function hexDecode(hex) {
    return Uint8Array.from((hex.match(/.{1,2}/g) || []).map(byte => parseInt(byte, 16)));
}

function normalizeName(name) {
    return String(name).toLowerCase();
}

async function hashPassword(password, saltHex) {
    const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
        { name: "PBKDF2", salt: hexDecode(saltHex), iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
        key,
        PBKDF2_KEYLEN
    );
    return hexEncode(new Uint8Array(bits));
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
        /** @type {Map<string, object>} */
        this.accounts = new Map();
        /** @type {Map<string, object>} Discord user id -> { bannedUntil, mutedUntil } */
        this.moderation = new Map();
        this.loaded = false;
        /** @type {Promise<void>} */
        this.ready = this.load();
        /** @type {Promise<void>} */
        this.pending = Promise.resolve();
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

            const data = await file.json();

            for (const key in data) {
                if (key === MODERATION_KEY) {
                    const entries = data[key];
                    for (const discordId in entries) {
                        this.moderation.set(String(discordId), entries[discordId]);
                    }
                    continue;
                }

                const account = data[key];
                if (account?.password?.salt && account?.password?.hash && account?.data) {
                    this.accounts.set(normalizeName(key), account);
                }
            }

            console.log(`[Accounts] Loaded ${this.accounts.size} account(s), ${this.moderation.size} moderation record(s)`);
        } catch (err) {
            console.warn(`[Accounts] Failed to load ${ACCOUNTS_FILE}, starting fresh:`, err);
        } finally {
            this.loaded = true;
        }
    }

    find(username) {
        return this.accounts.get(normalizeName(username));
    }

    async create(username, password, client) {
        const id = normalizeName(username);

        if (this.accounts.has(id)) {
            return { ok: false, error: "An account with that username already exists." };
        }

        const salt = crypto.getRandomValues(new Uint8Array(16));
        const saltHex = hexEncode(salt);

        const account = {
            username,
            password: {
                salt: saltHex,
                hash: await hashPassword(password, saltHex)
            },
            discordId: String(client.userId ?? ""),
            data: snapshot(client),
            createdAt: Date.now(),
            lastLogin: Date.now()
        };

        this.accounts.set(id, account);
        await this.persist();

        return { ok: true, account };
    }

    async login(username, password) {
        const account = this.find(username);

        if (!account) {
            return { ok: false, error: "Account not found. Try /login again or create one with /createaccount." };
        }

        const hash = await hashPassword(password, account.password.salt);

        if (hash !== account.password.hash) {
            return { ok: false, error: "Incorrect password." };
        }

        account.lastLogin = Date.now();
        await this.persist();

        return { ok: true, account };
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
     * Get the ban/mute record for a Discord ID, accountName is only used for logging and tracking renames
     * @param {string} discordId
     */
    record(discordId, accountName = "") {
        const id = String(discordId ?? "");

        if (!id) return null;

        let entry = this.moderation.get(id);

        if (!entry) {
            entry = { accountName: "", bannedUntil: 0, mutedUntil: 0 };
            this.moderation.set(id, entry);
        }

        if (accountName && !entry.accountName) entry.accountName = accountName;

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
    async ban(discordId, seconds, accountName = "") {
        const entry = this.record(discordId, accountName);
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
    async mute(discordId, seconds, accountName = "") {
        const entry = this.record(discordId, accountName);
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
     * account name / Discord display name -> Discord ID that already has a punishment record (for offline lookup)
     * Punishments are keyed by Discord ID, so look up the other way using the account name at punishment time
     */
    findModerated(query) {
        const lower = normalizeName(query);
        let fallback = null;

        for (const [discordId, entry] of this.moderation) {
            if (normalizeName(entry.accountName) !== lower) continue;

            // prefer a record that actually carries a punishment
            if (Accounts.fromStored(entry.bannedUntil) > 0 || Accounts.fromStored(entry.mutedUntil) > 0) {
                return discordId;
            }

            fallback ??= discordId;
        }

        // when the name in the punishment record does not match, fall back to the Discord ID stored on the account
        const account = this.find(query);
        if (account?.discordId && this.moderation.has(account.discordId)) {
            return account.discordId;
        }

        return fallback;
    }

    saveClient(client) {
        if (!client?.auth?.loggedIn) return;

        const account = this.find(client.auth.username);

        if (!account) return;

        account.data = snapshot(client);
        this.persist().catch(err => console.warn("[Accounts] Save failed:", err));
    }

    async persist() {
        if (typeof Bun === "undefined") return;

        const write = async () => {
            const output = {};

            for (const [id, account] of this.accounts) {
                output[account.username || id] = account;
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

        this.pending = this.pending.then(write, write).catch(err => {
            console.warn("[Accounts] Persist failed:", err);
        });

        return this.pending;
    }

    /** wait for all queued writes to hit disk (call before process exit) */
    async flush() {
        await this.pending;
    }
}

export default new Accounts();