export const SERVER_URL = process.env.ROUTING_SERVER;
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function lerpAngle(a, b, t) {
    const CS = (1 - t) * Math.cos(a) + t * Math.cos(b);
    const SN = (1 - t) * Math.sin(a) + t * Math.sin(b);
    return Math.atan2(SN, CS);
}

export function shakeElement(element) {
    element.classList.add("shake");
    setTimeout(element.classList.remove.bind(element.classList, "shake"), 500);
}

export const colors = {
    "common": "#7EEF6D",
    "uncommon": "#FFE65D",
    "rare": "#455FCF",
    "epic": "#7633CB",
    "legendary": "#C13328",
    "mythic": "#1ED2CB",
    "ultra": "#ff2b75",
    "super": "#2affa3",
    "ancient": "#ff7b29",
    "omega": "#d966e8",
    "???": "#333333",
    "unique": "#FFFFFF",
    "account": "#7EEF6D",
    "absorb": "#895adc",
    "skillTree": "#dc5a5a",
    "inventory": "#5a9edb",
    "settings": "#C8C8C8",
    "crafting": "#DB9D5A",
    "mobGallery": "#DBD64A",
    "team1": "#00B2E1",
    "team2": "#F14E54",
    // RENDER COLORS
    white: "#FFFFFF",
    peach: "#FFF0B7",
    sponge: "#FFD09F",
    cumWhite: "#ffffC9",
    black: "#000000",
    rosePink: "#FC93C5",
    jellyPink: "#e3b8df",
    irisPurple: "#CD75DE",
    pollenGold: "#FEE86B",
    peaGreen: "#8CC05B",
    sandGold: "#DDC758",
    grapePurple: "#C973D8",
    leafGreen: "#3AB54A",
    uraniumLime: "#66BB2A",
    honeyGold: "#F5D230",
    hornet: "#FED263",
    lightningTeal: "#00FFFF",
    rockGray: "#7B727C",
    stingerBlack: "#222222",
    lighterBlack: "#353535",
    cactusGreen: "#39C660",
    cactusLightGreen: "#75D68F",
    bubbleGrey: "#B8B8B8",
    playerYellow: "#FFE763",
    scorpionBrown: "#C69A2D",
    diepBlue: "#00BEFF",
    diepSquare: "#ffe46b",
    diepTriangle: "#fc7676",
    diepPentagon: "#768cfc",
    ladybugRed: "#EB4034",
    evilLadybugRed: "#962921",
    shinyLadybugGold: "#ebeb34",
    hellMobColor: "#AA1C1D",
    beeYellow: "#FFE763",
    pincer: "#2a2a2a",
    antHole: "#A8711E",
    ants: "#555555",
    fireAnt: "#a82a01",
    termite: "#d3a35b",
    wasp: "#c8803c",
    jellyfish: "#EFEFEF",
    spider: "#4f412e",
    darkGreen: "#118240",
    beetlePurple: "#915db0",
    roach: "#9D4F23",
    roachHead: "#6C3419",
    sand: "#E1C85D",
    jelly: "#D5B5D3",
    orange: "#F1BC48",
    starfish: "#c74a48",
    book: "#c28043",
    shrubGreen: "#0b7240",
    crabBodyOrange: "#dc704b",
    crabLimbBrown: "#4d2621",
    jelly: "#D5B5D3",
    stickBrown: "#6A4923",

    defaultGray: "#718083",
    gardenGreen: "#1EA660",
    desertYellow: "#ECDCB8",
    oceanBlue: "#6D96BE",
    antHellBrown: "#8E603F",
    hellRed: "#973332",
    sewersGreen: "#676733",
    darkForestGreen: "#2C5037",
    halloweenOrange: "#CF5704"
};
export function rgbToHex(r, g, b) {
    return (
        "#" +
        [r, g, b]
            .map(v => v.toString(16).padStart(2, "0"))
            .join("")
    );
}
export function hexToRGB(h) {
    h = h.replace("#", "");

    return {
        r: parseInt(h.substring(0, 2), 16),
        g: parseInt(h.substring(2, 4), 16),
        b: parseInt(h.substring(4, 6), 16)
    };
}
export function chatGradient(speed, type, c1 = "#000000", c2 = "#ffffff") {
    const a = performance.now() * speed;
    switch (type) {
        case 0: {
            const t = hexToRGB(c1);
            const e = hexToRGB(c2);

            const mix = (Math.sin(a) + 1) / 2;

            const r = Math.round(t.r + (e.r - t.r) * mix);
            const g = Math.round(t.g + (e.g - t.g) * mix);
            const b = Math.round(t.b + (e.b - t.b) * mix);

            return rgbToHex(r, g, b);
        }
        case 1: {
            const hue = a % 360;
            return `hsl(${hue}, 100%, 60%)`;
        }
        default:
            return "#ffffff";
    }
}

export function formatLargeNumber(number, type = 0) {
    let returnedNumber = number;
    if (type === 1) {
        if (number >= 1e15) {
            returnedNumber = (number / 1e15).toFixed(1) + "q";
        } else if (number >= 1e12) {
            returnedNumber = (number / 1e12).toFixed(2) + "t";
        } else if (number >= 1e9) {
            returnedNumber = (number / 1e9).toFixed(2) + "b";
        } else if (number >= 1e6) {
            returnedNumber = (number / 1e6).toFixed(2) + "m";
        } else if (number >= 1e3) {
            returnedNumber = (number / 1e3).toFixed(1) + "k";
        }
    } else {
        if (number >= 1e15) {
            returnedNumber = (number / 1e15).toFixed(2) + "q";
        } else if (number >= 1e12) {
            returnedNumber = (number / 1e12).toFixed(2) + "t";
        } else if (number >= 1e9) {
            returnedNumber = (number / 1e9).toFixed(2) + "b";
        } else if (number >= 1e6) {
            returnedNumber = (number / 1e6).toFixed(2) + "m";
        } else if (number >= 1e3) {
            returnedNumber = (number / 1e3).toFixed(2) + "k";
        }
    }
    return returnedNumber;
}

const threshold = .6375;

export function getDropRarity(mobRarity, highestPlayerRarity) {
    const maxRarity = Math.min(11, Math.min(mobRarity, highestPlayerRarity + 1));
    const minRarity = Math.max(0, maxRarity - 2);

    if (minRarity > maxRarity) {
        return minRarity;
    }

    let rarity = minRarity;
    const myThreshold = Math.pow(threshold, maxRarity);

    for (let i = minRarity; i < maxRarity; i++) {
        if (Math.random() < myThreshold) {
            rarity++;
        }
    }

    return rarity;
}

export function getWaveMobRarity(wave, scaling, raritiesLength) {
    let progress = (wave % scaling) / scaling
    let baseMobRarity = Math.floor(wave / scaling)
    let mobRarity = baseMobRarity

    if (Math.random() < progress) {
        mobRarity++
    }

    if (Math.random() < .082) {
        mobRarity++
        if (Math.random() < .023) {
            mobRarity++
        }
    }

    if (Math.random() < .091) {
        mobRarity--
    }
    if (Math.random() < .074) {
        mobRarity--
    }
    if (Math.random() < .025) {
        mobRarity--
    }
    
    return Math.min(raritiesLength, Math.max(0, mobRarity));
}

export function testCaseDrops(mobRarity, highestPlayerRarity, count) {
    const results = [];

    for (let i = 0; i < count; i++) {
        const rarity = getDropRarity(mobRarity, highestPlayerRarity);
        results[rarity] = (results[rarity] || 0) + 1;
    }

    return results.map(c => (c / count * 100).toFixed(2));
}

export function angleDiff(a, b) {
    const diff = a - b;
    return Math.atan2(Math.sin(diff), Math.cos(diff));
}

export function quickDiff(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
}

export function xpForLevel(level) {
    return Math.pow(level, 2.35) + Math.exp(level / 25);
}

export const options = {
    showDebug: false,
    hideGrid: false,
    rigidInterpolation: false,
    mouseMovement: false,
    hideEntityUI: false,
    useTileBackground: false,
    fancyGraphics: false,
    showHitboxes: false,
    showDamageNumbers: true,
    cacheMobAssets: false,
    cachePetalAssets: false,

    disableGradients: true,
    minimumGradientRarity: 6
};

export function applyArticle(word, capitalize = false) {
    if (/^[aeiou]/i.test(word)) {
        return (capitalize ? "An" : "an") + " " + word;
    } else {
        return (capitalize ? "A" : "a") + " " + word;
    }
}

export function applyPlural(word, capitalize = false) {
    const rules = {
        y: "ies",
        h: "hes",
        s: "ses",
        x: "xes",
        o: "oes"
    };

    for (const [ending, replacement] of Object.entries(rules)) {
        if (word.endsWith(ending)) {
            word = word.slice(0, -ending.length) + replacement;
            break;
        }
    }

    if (!Object.keys(rules).some(e => word.endsWith(rules[e]))) {
        word += "s";
    }

    if (capitalize) {
        word = word.charAt(0).toUpperCase() + word.slice(1);
    }

    return word;
}

// Between Oct 31st and Nov 7th
export const isHalloween = (() => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();

    return month === 10 && day >= 31 || month === 11 && day <= 7;
})();
