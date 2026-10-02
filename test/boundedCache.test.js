import { describe, expect, test } from "bun:test";
import { createEvictionQueue } from "../public/lib/boundedCache.js";

describe("createEvictionQueue", () => {
    test("keeps everything below the cap", () => {
        const queue = createEvictionQueue(4);
        const evicted = [];

        for (const key of ["a", "b", "c"]) {
            queue.push(key, k => evicted.push(k));
        }

        expect(evicted).toEqual([]);
        expect(queue.size).toBe(3);
    });

    test("holds exactly the cap without evicting", () => {
        const queue = createEvictionQueue(3);
        const evicted = [];

        for (const key of ["a", "b", "c"]) {
            queue.push(key, k => evicted.push(k));
        }

        expect(evicted).toEqual([]);
        expect(queue.size).toBe(3);
    });

    test("evicts the oldest once the cap is passed", () => {
        const queue = createEvictionQueue(3);
        const evicted = [];

        for (const key of ["a", "b", "c", "d"]) {
            queue.push(key, k => evicted.push(k));
        }

        expect(evicted).toEqual(["a"]);
        expect(queue.size).toBe(3);
    });

    test("evicts oldest first when many arrive at once", () => {
        const queue = createEvictionQueue(2);
        const evicted = [];

        for (const key of ["a", "b", "c", "d", "e"]) {
            queue.push(key, k => evicted.push(k));
        }

        expect(evicted).toEqual(["a", "b", "c"]);
        expect(queue.size).toBe(2);
    });

    test("never grows past the cap over a long run", () => {
        const queue = createEvictionQueue(96);
        let live = 0;
        let max = 0;

        for (let i = 0; i < 10_000; i++) {
            queue.push(i, () => live--);
            live++;
            max = Math.max(max, queue.size);
        }

        expect(max).toBe(96);
        expect(queue.size).toBe(96);
        expect(live).toBe(96);
    });

    test("bounds the render caches at the size that was killing the tab", () => {
        // 3465 distinct icon lookups is what a full addall inventory produces.
        const icons = createEvictionQueue(1024);
        const tooltips = createEvictionQueue(96);

        for (let rarity = 0; rarity < 33; rarity++) {
            for (let index = 0; index < 105; index++) {
                icons.push([index, rarity, 2], () => {});
                tooltips.push([index, rarity], () => {});
            }
        }

        expect(icons.size).toBe(1024);
        expect(tooltips.size).toBe(96);

        // 64KB per icon and roughly 724KB per tooltip.
        const mb = (1024 * 128 * 128 * 4 + 96 * 350 * 530 * 4) / 1024 / 1024;
        expect(mb).toBeLessThan(160);
    });

    test("evicts the same key it was handed, for composite keys", () => {
        const queue = createEvictionQueue(1);
        const evicted = [];

        queue.push([1, 2, 3], k => evicted.push(k));
        queue.push([4, 5, 6], k => evicted.push(k));

        expect(evicted).toEqual([[1, 2, 3]]);
    });

    test("reports its size as zero when nothing is tracked", () => {
        expect(createEvictionQueue(8).size).toBe(0);
    });

    test("does not evict for a cap of one until the second key", () => {
        const queue = createEvictionQueue(1);
        const evicted = [];

        queue.push("a", k => evicted.push(k));
        expect(evicted).toEqual([]);

        queue.push("b", k => evicted.push(k));
        expect(evicted).toEqual(["a"]);
    });
});
