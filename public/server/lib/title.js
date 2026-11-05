// Built-in colours accepted by /title. Chinese players know them as
// 红橙黄绿青蓝紫; the command takes the English names below or a 6-digit hex.
export const TITLE_COLORS = {
    red: "#FF5555",
    orange: "#FFA500",
    yellow: "#FFFF00",
    green: "#55FF55",
    cyan: "#55FFFF",
    blue: "#5555FF",
    purple: "#AA55FF"
};

export const TITLE_DEFAULT_COLOR = "#FFFFFF";
// The client's default title length, kept when no duration is supplied.
export const TITLE_DEFAULT_DURATION = 5;
export const TITLE_MAX_DURATION = 300;
export const TITLE_MAX_TEXT_LENGTH = 128;

const TITLE_USAGE = "Usage: /title [color] <text> [duration]";

/**
 * Parses the arguments of /title.
 *
 *   /title red hello 3      -> red, "hello", 3s
 *   /title #00FF00 hi        -> #00FF00, "hi", default duration
 *   /title hello world       -> default colour, "hello world", default duration
 *   /title yellow "Wave 5" 10 -> yellow, "Wave 5", 10s
 *
 * The duration is only read from the last token, so titles that end in a
 * number should be quoted.
 */
export function parseTitleCommand(raw) {
    let rest = (raw ?? "").trim();

    if (!rest) return { error: TITLE_USAGE };

    let color = TITLE_DEFAULT_COLOR;

    const firstSpace = rest.search(/\s/);
    const colorToken = firstSpace === -1 ? rest : rest.slice(0, firstSpace);
    const namedColor = TITLE_COLORS[colorToken.toLowerCase()];
    const hexColor = /^#?[0-9a-f]{6}$/i.test(colorToken)
        ? `#${colorToken.replace(/^#/, "").toUpperCase()}`
        : null;

    if (namedColor || hexColor) {
        color = namedColor ?? hexColor;
        rest = firstSpace === -1 ? "" : rest.slice(firstSpace).trim();
    }

    if (!rest) return { error: TITLE_USAGE };

    let duration = TITLE_DEFAULT_DURATION;
    let text = rest;

    if (text.startsWith('"')) {
        const close = text.indexOf('"', 1);

        if (close === -1) return { error: TITLE_USAGE };

        const trailing = text.slice(close + 1).trim();
        text = text.slice(1, close).trim();

        if (trailing) {
            if (!/^\d+(?:\.\d+)?$/.test(trailing)) return { error: TITLE_USAGE };
            duration = Number(trailing);
        }
    } else {
        const match = text.match(/^(.*\S)\s+(\d+(?:\.\d+)?)$/s);

        if (match) {
            text = match[1].trim();
            duration = Number(match[2]);
        }
    }

    if (!text) return { error: TITLE_USAGE };
    if (text.length > TITLE_MAX_TEXT_LENGTH) return { error: "Title is too long." };
    if (!Number.isFinite(duration) || duration <= 0) return { error: TITLE_USAGE };

    return {
        color,
        text,
        duration: Math.min(duration, TITLE_MAX_DURATION)
    };
}
