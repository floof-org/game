import { describe, expect, test } from "bun:test";
import {
    FONT_FIT_MAX_STEPS,
    FONT_FIT_MAX_WIDTH,
    FONT_FIT_START_SIZE,
    fitFontSize,
} from "../public/lib/textFit.js";

/** Rough stand-in for the canvas: a fixed pixel width per character. */
function widthPerChar(chars) {
    return size => chars * size * 0.5;
}

describe("fitFontSize", () => {
    test("returns the start size when the label already fits", () => {
        expect(fitFontSize(() => 1)).toBe(FONT_FIT_START_SIZE);
    });

    test("shrinks until the label fits", () => {
        // 30 characters needs about 22px to fit under 96px.
        const size = fitFontSize(widthPerChar(30));

        expect(size).toBeLessThan(FONT_FIT_START_SIZE);
        expect(30 * size * 0.5).toBeLessThan(FONT_FIT_MAX_WIDTH);
        expect(30 * (size + 1) * 0.5).toBeGreaterThanOrEqual(FONT_FIT_MAX_WIDTH);
    });

    test("a longer label never gets a larger size", () => {
        const short = fitFontSize(widthPerChar(8));
        const long = fitFontSize(widthPerChar(28));

        expect(long).toBeLessThan(short);
    });

    test("stops at a negative size instead of looping forever", () => {
        // A width that never drops under the limit, which is what the original inline loop
        // guarded against with `k++ > 512`.
        const size = fitFontSize(() => 1000);

        expect(size).toBe(FONT_FIT_START_SIZE - (FONT_FIT_MAX_STEPS + 1));
    });

    test("measures a bounded number of times", () => {
        let calls = 0;

        fitFontSize(size => {
            calls++;
            return 1000;
        });

        expect(calls).toBe(FONT_FIT_MAX_STEPS + 2);
    });

    test("a short label costs only a handful of measurements", () => {
        let calls = 0;

        fitFontSize(size => {
            calls++;
            return size * 0.5;
        });

        // The point of the shared cache: cheap enough to call once per petal, expensive
        // enough that repeating it for every icon and rarity is what stuttered scrolling.
        expect(calls).toBeLessThan(20);
    });

    test("honours a custom width limit", () => {
        const size = fitFontSize(widthPerChar(30), 200);

        expect(size).toBeGreaterThan(fitFontSize(widthPerChar(30), 96));
    });

    test("the same input always yields the same size", () => {
        expect(fitFontSize(widthPerChar(17))).toBe(fitFontSize(widthPerChar(17)));
    });
});

describe("the cost that was stuttering scrolling", () => {
    test("caching per petal index collapses thousands of fits into ~105", () => {
        // petalText is getUIPetalName(index), so the result depends on the index alone.
        const cache = new Map();
        const fits = [];

        for (let rarity = 0; rarity < 33; rarity++) {
            for (let index = 0; index < 105; index++) {
                if (cache.has(index)) {
                    fits.push(0);
                    continue;
                }

                const size = fitFontSize(widthPerChar(10 + (index % 20)));
                cache.set(index, size);
                fits.push(1);
            }
        }

        // 3465 icon creations, but only one fit per distinct petal.
        expect(fits.reduce((a, b) => a + b, 0)).toBe(105);
    });

    test("the uncached path is what the shared cache removes", () => {
        const names = 105;
        const rarities = 33;
        let uncached = 0;

        for (let rarity = 0; rarity < rarities; rarity++) {
            for (let index = 0; index < names; index++) {
                let calls = 0;
                fitFontSize(size => {
                    calls++;
                    return size * 0.5;
                });
                uncached += calls;
            }
        }

        // Thousands of canvas font assignments and measureText calls per full sweep, versus
        // zero once every petal has been fitted.
        expect(uncached).toBeGreaterThan(1000);
    });
});
