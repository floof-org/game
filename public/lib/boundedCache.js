/**
 * Insertion-order queue used to cap the render caches.
 *
 * The petal icon and tooltip caches are keyed by index and rarity and were never pruned.
 * Sweeping a cursor across a full addall inventory touched every combination, which grew
 * them past 2.6GB and killed the tab. Tracking insertion order lets the oldest entries be
 * dropped once a cap is reached.
 *
 * This is deliberately first-in-first-out rather than least-recently-used: reordering on
 * every cache hit would mean an O(n) splice per icon per frame, since the game loop asks
 * for the same on-screen petals sixty times a second.
 */
export function createEvictionQueue(cap) {
    const order = [];

    return {
        get size() {
            return order.length;
        },

        /**
         * Record a newly cached key and evict whatever fell past the cap.
         *
         * `evict` is called once per dropped key, oldest first, and is expected to release
         * the cached value.
         */
        push(key, evict) {
            order.push(key);

            while (order.length > cap) {
                evict(order.shift());
            }
        },
    };
}
