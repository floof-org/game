import { describe, expect, test } from "bun:test";

import { TITLE_COLORS, TITLE_DEFAULT_COLOR, TITLE_DEFAULT_DURATION, TITLE_MAX_DURATION, parseTitleCommand } from "../public/server/lib/title.js";

describe("parseTitleCommand", () => {
    test("keeps the default colour and duration", () => {
        expect(parseTitleCommand("hello world")).toEqual({
            color: TITLE_DEFAULT_COLOR,
            text: "hello world",
            duration: TITLE_DEFAULT_DURATION
        });
    });

    test("accepts the built-in colour names", () => {
        for (const [name, hex] of Object.entries(TITLE_COLORS)) {
            expect(parseTitleCommand(`${name} hello`)).toEqual({
                color: hex,
                text: "hello",
                duration: TITLE_DEFAULT_DURATION
            });
        }
    });

    test("accepts hex colours with or without a leading hash", () => {
        expect(parseTitleCommand("#00ff00 hello").color).toBe("#00FF00");
        expect(parseTitleCommand("00FF00 hello").color).toBe("#00FF00");
    });

    test("reads a trailing duration in seconds", () => {
        expect(parseTitleCommand("red hello 12.5")).toEqual({
            color: TITLE_COLORS.red,
            text: "hello",
            duration: 12.5
        });
    });

    test("quoted text may end in a number", () => {
        expect(parseTitleCommand('yellow "Wave 5" 10')).toEqual({
            color: TITLE_COLORS.yellow,
            text: "Wave 5",
            duration: 10
        });
    });

    test("clamps very long durations", () => {
        expect(parseTitleCommand("hello 9999").duration).toBe(TITLE_MAX_DURATION);
    });

    test("rejects empty text and bad durations", () => {
        expect(parseTitleCommand("").error).toBeTruthy();
        expect(parseTitleCommand("red").error).toBeTruthy();
        expect(parseTitleCommand("hello 0").error).toBeTruthy();
        expect(parseTitleCommand("hello nope").text).toBe("hello nope");
    });
});
