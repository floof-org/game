// Rainbow palette shared by /title parsing on the server and title rendering
// on the client. The seven stops are red, orange, yellow, green, cyan, blue
// and purple, in that order.
export const RAINBOW_COLORS = [
    "#FF5555",
    "#FFA500",
    "#FFFF00",
    "#55FF55",
    "#55FFFF",
    "#5555FF",
    "#AA55FF"
];

/** Colour id sent over the wire to request a per-character rainbow title. */
export const RAINBOW_COLOR_ID = "rainbow";

function parseHex(hex) {
    const value = parseInt(hex.slice(1), 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function mixHex(from, to, amount) {
    const a = parseHex(from);
    const b = parseHex(to);
    const channel = index => Math.round(a[index] + (b[index] - a[index]) * amount);
    const hex = (channel(0) << 16) | (channel(1) << 8) | channel(2);
    return `#${hex.toString(16).padStart(6, "0").toUpperCase()}`;
}

/**
 * Colour for one step of the rainbow. `count` is the number of visible
 * characters, so the first character is red and the last is purple.
 */
export function rainbowColorAt(index, count) {
    if (count <= 1) return RAINBOW_COLORS[0];

    const position = (index / (count - 1)) * (RAINBOW_COLORS.length - 1);
    const lower = Math.floor(position);
    const upper = Math.min(lower + 1, RAINBOW_COLORS.length - 1);

    return mixHex(RAINBOW_COLORS[lower], RAINBOW_COLORS[upper], position - lower);
}
