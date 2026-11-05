import { afterEach, describe, expect, test } from "bun:test";

import state from "../public/server/lib/state.js";
import { mobConfigs, BOSS_SPAWN_MESSAGES } from "../public/server/lib/config.js";
import { announceBossSpawn } from "../public/server/lib/bossAnnounce.js";
import { tiers } from "../public/lib/protocol.js";

const BEETLE = mobConfigs.find(mob => mob.name === "Beetle");

describe("announceBossSpawn", () => {
    afterEach(() => {
        state.clients.clear();
    });

    test("shows a yellow title and the rarity line in chat", () => {
        const calls = [];
        const client = {
            title(text, color, duration) {
                calls.push({ kind: "title", text, color, duration });
            },
            systemMessage(message, color) {
                calls.push({ kind: "chat", message, color });
            }
        };

        state.clients.set(1, client);

        const rarity = 6;
        announceBossSpawn(BEETLE, rarity);

        const titleCall = calls.find(call => call.kind === "title");
        const chatCall = calls.find(call => call.kind === "chat");

        expect(titleCall.text).toBe(BOSS_SPAWN_MESSAGES.Beetle);
        expect(titleCall.color).toBe("#FFFF00");
        expect(chatCall.message).toBe(`A ${tiers[rarity].name} Boss ${BEETLE.name} Has Spawned!`);
        expect(chatCall.color).toBe(tiers[rarity].color);
    });

    test("falls back to the chat line when no flavour message exists", () => {
        const calls = [];
        const client = {
            title(text) {
                calls.push({ kind: "title", text });
            },
            systemMessage() {}
        };

        state.clients.set(1, client);

        const config = { name: "Unknown Mob" };
        announceBossSpawn(config, 6);

        expect(calls[0].text).toBe(`A ${tiers[6].name} Boss Unknown Mob Has Spawned!`);
    });
});
