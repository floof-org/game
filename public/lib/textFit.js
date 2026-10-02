/**
 * Font size fitting for the petal name labels.
 *
 * The label is drawn into a fixed 96px slot, so the size is found by shrinking from 26px
 * until the measured width fits. Measuring a string is expensive relative to everything else
 * an icon draw does, and the answer depends only on the string, so callers cache the result
 * per petal index. See `ratioFontSizeCache` in renders.js.
 */

/** Largest size tried before shrinking. */
export const FONT_FIT_START_SIZE = 26;

/** Width of the slot the label has to fit into. */
export const FONT_FIT_MAX_WIDTH = 96;

/**
 * Give up after this many shrinks. A label can shrink to a negative size, which the canvas
 * clamps, so without a cap a string that never fits would loop until the size underflows.
 * The bound is kept identical to the original inline loop so rendered labels do not change.
 */
export const FONT_FIT_MAX_STEPS = 512;

/**
 * Shrink from the start size until `widthAt` reports a width under `max`.
 *
 * `widthAt` is called with a candidate size and must return the rendered width. It is
 * invoked at most `FONT_FIT_MAX_STEPS + 2` times.
 */
export function fitFontSize(widthAt, max = FONT_FIT_MAX_WIDTH) {
    let size = FONT_FIT_START_SIZE;
    let steps = 0;

    while (true) {
        if (widthAt(size) < max || steps++ > FONT_FIT_MAX_STEPS) {
            return size;
        }

        size--;
    }
}
