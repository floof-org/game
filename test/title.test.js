import { describe, expect, test } from "bun:test";

import { RAINBOW_COLOR_ID, RAINBOW_COLORS, rainbowColorAt } from "../public/lib/rainbow.js";


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

    test("accepts rainbow as a per-character colour", () => {
        expect(parseTitleCommand("rainbow hello 3")).toEqual({
            color: RAINBOW_COLOR_ID,
            text: "hello",
            duration: 3
        });
    });

    test("rejects empty text and bad durations", () => {
        expect(parseTitleCommand("").error).toBeTruthy();
        expect(parseTitleCommand("red").error).toBeTruthy();
        expect(parseTitleCommand("hello 0").error).toBeTruthy();
        expect(parseTitleCommand("hello nope").text).toBe("hello nope");
    });
});

describe("rainbow gradient", () => {
    test("spans red to purple across the visible characters", () => {
        expect(rainbowColorAt(0, 5)).toBe(RAINBOW_COLORS[0]);
        expect(rainbowColorAt(4, 5)).toBe(RAINBOW_COLORS[RAINBOW_COLORS.length - 1]);
    });

    test("interpolates between palette stops", () => {
        expect(rainbowColorAt(1, 7)).toBe(RAINBOW_COLORS[1]);
        expect(rainbowColorAt(2, 7)).toBe(RAINBOW_COLORS[2]);
    });

    test("a single character is red", () => {
        expect(rainbowColorAt(0, 1)).toBe(RAINBOW_COLORS[0]);
    });
});
