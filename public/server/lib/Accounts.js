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
        highestWave: Math.max(0, Math.floor(+client.highestWave || 0)),
        slots: (client.slots || []).map(slot => slot ? { id: slot.id, rarity: slot.rarity } : null),
        secondarySlots: (client.secondarySlots || []).map(slot => slot ? { id: slot.id, rarity: slot.rarity } : null),
        inventory,
        craftAttempts: structuredClone(client.craftAttempts || {})
    };
}

class Accounts {
    constructor() {
        /** @type {Map<string, object>} */
        this.accounts = new Map();
        this.loaded = false;
        /** @type {Promise<void>} */
        this.ready = this.load();
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
            banned: false,
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

    saveClient(client) {
        if (!client?.auth?.loggedIn) return;

        const account = this.find(client.auth.username);

        if (!account) return;

        account.data = snapshot(client);
        this.persist().catch(err => console.warn("[Accounts] Save failed:", err));
    }

    async persist() {
        if (typeof Bun === "undefined") return;

        const output = {};

        for (const [id, account] of this.accounts) {
            output[account.username || id] = account;
        }

        await Bun.write(ACCOUNTS_FILE, JSON.stringify(output, null, 2));
    }
}

export default new Accounts();