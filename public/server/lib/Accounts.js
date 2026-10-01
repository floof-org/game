const enc = new TextEncoder();
const dec = new TextDecoder();

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_KEYLEN = 256;

const ACCOUNTS_FILE = (typeof Bun !== "undefined" && Bun.env.ACCOUNTS_FILE) || "./accounts.json";

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
        xp: Math.min(1e15, Math.max(1, +client.xp || 1)),
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

            for (const username in data) {
                const account = data[username];
                if (account?.password?.salt && account?.password?.hash && account?.data) {
                    this.accounts.set(normalizeName(username), account);
                }
            }

            console.log(`[Accounts] Loaded ${this.accounts.size} account(s)`);
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
            bannedUntil: 0,
            mutedUntil: 0,
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
     * Infinity 存进 JSON 会变成 null，所以永久用 -1 表示
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

    /** 剩余封禁时长，未封禁返回 0 */
    banRemaining(username) {
        const account = this.find(username);
        if (!account) return 0;

        // 兼容旧存档里的 banned: true / banned: false
        if (typeof account.banned === "boolean" && !("bannedUntil" in account)) {
            return account.banned ? PERMANENT : 0;
        }

        return remaining(Accounts.fromStored(account.bannedUntil));
    }

    /** 剩余禁言时长，未禁言返回 0 */
    muteRemaining(username) {
        const account = this.find(username);
        if (!account) return 0;

        return remaining(Accounts.fromStored(account.mutedUntil));
    }

    isBanned(username) {
        return this.banRemaining(username) > 0;
    }

    isMuted(username) {
        return this.muteRemaining(username) > 0;
    }

    /**
     * @param {string} username
     * @param {number} seconds 0 = 永久
     */
    async ban(username, seconds) {
        const account = this.find(username);
        if (!account) return { ok: false, error: `Player "${username}" not found.` };

        const duration = parseDuration(seconds, MAX_BAN_SECONDS);
        if (duration === null) return { ok: false, error: "Duration must be a positive number of seconds (0 for permanent)." };

        account.bannedUntil = Accounts.toStored(duration === PERMANENT ? PERMANENT : Date.now() + duration * 1000);
        delete account.banned;

        await this.persist();

        return { ok: true, account, duration };
    }

    /**
     * @param {string} username
     * @param {number} seconds 0 = 永久
     */
    async mute(username, seconds) {
        const account = this.find(username);
        if (!account) return { ok: false, error: `Player "${username}" not found.` };

        const duration = parseDuration(seconds, MAX_MUTE_SECONDS);
        if (duration === null) return { ok: false, error: "Duration must be a positive number of seconds (0 for permanent)." };

        account.mutedUntil = Accounts.toStored(duration === PERMANENT ? PERMANENT : Date.now() + duration * 1000);

        await this.persist();

        return { ok: true, account, duration };
    }

    async unmute(username) {
        const account = this.find(username);
        if (!account) return { ok: false, error: `Player "${username}" not found.` };

        account.mutedUntil = 0;

        await this.persist();

        return { ok: true, account };
    }

    async unban(username) {
        const account = this.find(username);
        if (!account) return { ok: false, error: `Player "${username}" not found.` };

        account.bannedUntil = 0;
        delete account.banned;

        await this.persist();

        return { ok: true, account };
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

            const target = ACCOUNTS_FILE + ".tmp";
            await Bun.write(target, JSON.stringify(output, null, 2));
            await Bun.$`mv ${target} ${ACCOUNTS_FILE}`.quiet();
        };

        this.pending = this.pending.then(write, write).catch(err => {
            console.warn("[Accounts] Persist failed:", err);
        });

        return this.pending;
    }

    /** 等待所有排队中的写入落盘（进程退出前调用） */
    async flush() {
        await this.pending;
    }
}

export default new Accounts();