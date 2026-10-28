import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = mkdtempSync(join(tmpdir(), "dmaze-accounts-"));
const file = join(dir, "accounts.json");
const OWNER_LEVEL = 50;

writeFileSync(file, JSON.stringify({
    "111": {
        username: "Owner#1",
        data: { level: OWNER_LEVEL, xp: 1, slots: [], secondarySlots: [], inventory: {}, craftAttempts: {} },
        createdAt: 1,
        lastSeen: 1
    }
}));

process.env.ACCOUNTS_FILE = file;

const { default: accounts } = await import("../public/server/lib/Accounts.js");
await accounts.ready;

function fakeClient() {
    return {
        userId: "111",
        username: "Owner#1",
        discordName: "Owner#1",
        level: 1,
        xp: 1,
        slots: [],
        secondarySlots: [],
        inventory: {},
        craftAttempts: {},
        restoreFromData(data) {
            this.level = data.level;
        }
    };
}

describe("account profiles", () => {
    test("loads the owner account by default", () => {
        const client = fakeClient();

        accounts.attach(client);

        expect(client.accountProfile).toBe("owner");
        expect(client.level).toBe(OWNER_LEVEL);
    });

    test("switching to player yields a fresh save without touching the owner save", async () => {
        accounts.setActiveProfile("111", "player");
        await accounts.persist();

        const client = fakeClient();
        accounts.attach(client);

        expect(client.accountProfile).toBe("player");
        expect(client.level).toBe(1);

        client.level = 7;
        accounts.saveClient(client);
        await accounts.flush();

        const stored = JSON.parse(readFileSync(file, "utf8"));

        expect(stored["111"].data.level).toBe(OWNER_LEVEL);
        expect(stored["111#player"].data.level).toBe(7);
        expect(stored["111"].activeProfile).toBe("player");
    });

    test("switching back restores the owner save and keeps the player save", async () => {
        accounts.setActiveProfile("111", "owner");
        await accounts.persist();

        const client = fakeClient();
        accounts.attach(client);

        expect(client.accountProfile).toBe("owner");
        expect(client.level).toBe(OWNER_LEVEL);

        const stored = JSON.parse(readFileSync(file, "utf8"));

        expect(stored["111"].activeProfile).toBeUndefined();
        expect(stored["111#player"].data.level).toBe(7);
    });

    test("moderation stays keyed by the real Discord id", () => {
        expect(accounts.findByName("Owner#1")).toMatchObject({ discordId: "111", save: { profile: "owner" } });
    });
});
