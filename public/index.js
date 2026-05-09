import { canvas, ctx, drawBackground, drawBackgroundOverlay, drawBar, drawFace, drawWrappedText, gameScale, mixColors, setStyle, text, uiScale } from "./lib/canvas.js";
import * as net from "./lib/net.js";
import { mouse, keyMap } from "./lib/net.js";
import { colors, isHalloween, lerp, options, SERVER_URL, shakeElement, formatLargeNumber } from "./lib/util.js";
import { BIOME_BACKGROUNDS, BIOME_TYPES, DEV_CHEAT_IDS, SERVER_BOUND, terrains, WEARABLES } from "./lib/protocol.js";
import { drawMob, drawUIMob, drawPetal, getPetalIcon, drawUIPetal, petalTooltip, mobTooltip, drawThirdEye, drawAntennae, pentagram, drawAmulet, drawPetalIconWithRatio, drawArmor } from "./lib/renders.js";
import { beginDragDrop, beginInventoryDragDrop, DRAG_TYPE_DESTROY, DRAG_TYPE_MAINDOCKER, DRAG_TYPE_SECONDARYDOCKER, dragConfig, inventoryDragConfig, updateAndDrawDragDrop, updateAndDrawInventoryDragDrop } from "./lib/dragAndDrop.js";
import { loadAndRenderChangelogs, showMenu, showMenus } from "./lib/menus.js";

if (location.hash) {
    fetch(SERVER_URL + "/lobby/get?partyURL=" + location.hash.slice(1)).then(response => response.json()).then(json => {
        if (json == null) {
            console.warn("Invalid party URL");
            location.hash = "";
            history.replaceState(null, null, location.pathname + location.search);
        } else {
            getUsername().then(async u => {
                const res = await fetch(SERVER_URL + "/lobby/get?partyURL=" + location.hash.slice(1));
                const text = await res.text();

                if (text == "null") {
                    alert("Invalid party URL");
                    location.hash = "";
                    history.replaceState(null, null, location.pathname + location.search);
                    return;
                }

                const lobby = JSON.parse(text);

                net.beginState(location.hash.slice(1), u, lobby.directConnect ? location.protocol.replace("http", "ws") + "//" + lobby.directConnect.address : SERVER_URL.replace("http", "ws"));
            });
        }
    }).catch(() => {
        console.warn("Invalid party URL");
        location.hash = "";
        history.replaceState(null, null, location.pathname + location.search);
    });
}

document.getElementById("lobbyName").value = "Lobby " + Math.floor(Math.random() * 1000);

function refreshLobbies() {
    const lobbiesDisplay = document.getElementById("lobbiesDisplay");
    lobbiesDisplay.innerHTML = "<span>Loading...</span>";
    net.findLobbies().then(lobbies => {
        lobbiesDisplay.innerHTML = "";
        lobbies.forEach(lobby => {
            const element = document.createElement("div");
            element.textContent = lobby.name + " (" + BIOME_BACKGROUNDS[lobby.biome].name + " " + lobby.gamemode + ")";

            if (lobby.isModded) {
                element.textContent += " (modded)";
            }

            if (lobby.trusted) {
                element.style.color = colors.playerYellow;
                element.textContent += " (trusted)";
            }

            element.onclick = () => {
                getUsername().then(username => {
                    net.beginState(lobby.partyCode, username, lobby.directConnect ? location.protocol.replace("http", "ws") + "//" + lobby.directConnect.address : SERVER_URL.replace("http", "ws"));
                });
            };

            lobbiesDisplay.appendChild(element);
        });
    });
}

document.getElementById("refreshLobbies").onclick = refreshLobbies;

function changeMenu(activeMenuID) {
    document.querySelectorAll(".preMenu").forEach(menu => {
        menu.classList.remove("active");

        if (menu.id === activeMenuID) {
            menu.classList.add("active");

            if (activeMenuID === "findLobbies") {
                refreshLobbies();
            }
        }
    });
}

document.querySelectorAll("button").forEach(button => {
    if (button.dataset.switchmenu) {
        button.onclick = () => changeMenu(button.dataset.switchmenu);
    }
});

async function getUsername() {
    changeMenu("usernameInput");

    return new Promise(resolve => {
        const usernameInputInput = document.getElementById("usernameInputInput");
        const button = document.getElementById("usernameButton");

        button.onclick = () => {
            const value = usernameInputInput.value.trim() || "guest";

            if (value.length > 24) {
                shakeElement(usernameInputInput);
                return;
            }

            button.onclick = null;
            changeMenu("thisshouldntexistsoletshopeitdoesnt");
            resolve(value);
        };
    });
}

let hasCreatedLobby = false;
document.getElementById("createLobbyButton").onclick = async () => {
    if (hasCreatedLobby) {
        return;
    }

    const lobbyName = document.getElementById("lobbyName");

    if (lobbyName.value.length < 3 || lobbyName.value.length > 32 || !/^[a-zA-Z0-9 ]+$/.test(lobbyName.value)) {
        shakeElement(lobbyName);
        return;
    }

    const gamemodeSelect = document.getElementById("gamemodeSelect");
    localStorage.setItem("gamemode", gamemodeSelect.value);

    const biomeSelect = document.getElementById("biomeSelect");
    localStorage.setItem("biome", biomeSelect.value);

    const enableMods = document.getElementById("enableMods");
    localStorage.setItem("enableMods", enableMods.checked);

    const privateLobby = document.getElementById("privateLobby");
    localStorage.setItem("privateLobby", privateLobby.checked);

    hasCreatedLobby = true;

    document.getElementById("createLobbyButton").disabled = true;
    const server = await net.createServer(lobbyName.value, gamemodeSelect.value, enableMods.checked, privateLobby.checked, biomeSelect.value);
    document.getElementById("createLobbyButton").disabled = false;

    if (!server.ok) {
        alert(server.error);
        hasCreatedLobby = false;
        return;
    }

    const username = await getUsername();
    localStorage.setItem("username", username);

    net.beginState(server.party, username);
}

let lastFlag = 0,
    mouseX = 0,
    mouseY = 0;

canvas.addEventListener("touchstart", e => {
    const touch = e.touches[0];
    mouse.x = touch.clientX;
    mouse.y = touch.clientY;
    mouse.left = true;
});

canvas.addEventListener("touchmove", e => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const touch = e.touches[0];
    mouse.x = (touch.clientX - rect.left) * scaleX;
    mouse.y = (touch.clientY - rect.top) * scaleY;
});

canvas.addEventListener("touchend", e => {
    mouse.left = false;
});

const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);

export let joystick = {
    on: false,
    pointerId: null,
    baseX: 250,
    baseY: null,
    stickX: 250,
    stickY: null,
    radius: 200,
    angle: 0,
    distance: 0
};
export let attackButton = {
    on: false,
    pointerId: null,
    x: canvas.width - 250,
    y: canvas.height - 500,
    radius: 125
};
export let defendButton = {
    on: false,
    pointerId: null,
    x: canvas.width - 250,
    y: canvas.height - 250,
    radius: 125
};

function updateButtons() {
    attackButton.x = canvas.width - 200;
    attackButton.y = canvas.height - 200;

    defendButton.x = canvas.width - 400;
    defendButton.y = canvas.height - 400;

    joystick.baseY = canvas.height - 250;
    if (!joystick.on) {
        joystick.stickY = joystick.baseY;
    }
}

updateButtons();
window.addEventListener("resize", updateButtons);

let resizeTimeout;

window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        drawIconsToOffscreen(net.state.waveInfo.aliveMobs);
    }, 150);
});


function drawButtons(ctx) {
    ctx.globalAlpha = .2;
    ctx.beginPath();
    ctx.arc(joystick.baseX, joystick.baseY, joystick.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#000000";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(joystick.stickX, joystick.stickY, joystick.radius / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.globalAlpha = attackButton.on ? .5 : .2;
    ctx.beginPath();
    ctx.arc(attackButton.x, attackButton.y, attackButton.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.globalAlpha = .7;
    text("A", attackButton.x, attackButton.y, 100, colors.white, ctx, .00001);
    ctx.globalAlpha = 1;

    ctx.globalAlpha = defendButton.on ? .5 : .2;
    ctx.beginPath();
    ctx.arc(defendButton.x, defendButton.y, defendButton.radius, 0, Math.PI * 2);
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.globalAlpha = .7;
    text("B", defendButton.x, defendButton.y, 100, colors.white, ctx, .00001);
    ctx.globalAlpha = 1;
}

canvas.addEventListener("touchstart", e => {
    if (mouse.left && net.state.isDead && net.state.socket?.readyState === WebSocket.OPEN) {
        net.state.socket.spawn();
        net.state.isDead = false;
    }
    for (const touch of e.changedTouches) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mx = (touch.clientX - rect.left) * scaleX;
        const my = (touch.clientY - rect.top) * scaleY;

        const dx = mx - joystick.baseX;
        const dy = my - joystick.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (!joystick.on && dist < joystick.radius) {
            joystick.on = true;
            joystick.pointerId = touch.identifier;
            joystick.stickX = mx;
            joystick.stickY = my;
        }

        const adx = mx - attackButton.x;
        const ady = my - attackButton.y;
        const adist = Math.sqrt(adx * adx + ady * ady);
        if (!attackButton.on && adist < attackButton.radius) {
            attackButton.on = true;
            attackButton.pointerId = touch.identifier;
        }

        const ddx = mx - defendButton.x;
        const ddy = my - defendButton.y;
        const ddist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (!defendButton.on && ddist < defendButton.radius) {
            defendButton.on = true;
            defendButton.pointerId = touch.identifier;
        }
    }
    e.preventDefault();
});

canvas.addEventListener("touchmove", e => {
    for (const touch of e.changedTouches) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mx = (touch.clientX - rect.left) * scaleX;
        const my = (touch.clientY - rect.top) * scaleY;

        if (joystick.on && touch.identifier === joystick.pointerId) {
            const dx = mx - joystick.baseX;
            const dy = my - joystick.baseY;
            const dist = Math.min(Math.sqrt(dx * dx + dy * dy), joystick.radius);
            const angle = Math.atan2(dy, dx);
            joystick.angle = angle;
            joystick.distance = dist / joystick.radius;
            joystick.stickX = joystick.baseX + Math.cos(angle) * dist;
            joystick.stickY = joystick.baseY + Math.sin(angle) * dist;
            processInputs();
        }
    }
});

canvas.addEventListener("touchend", e => {
    for (const touch of e.changedTouches) {
        if (touch.identifier === joystick.pointerId) {
            joystick.on = false;
            joystick.pointerId = null;
            joystick.stickX = joystick.baseX;
            joystick.stickY = joystick.baseY;
            processInputs();
        }

        if (touch.identifier === attackButton.pointerId) {
            attackButton.on = false;
            attackButton.pointerId = null;
            processInputs();
        }

        if (touch.identifier === defendButton.pointerId) {
            defendButton.on = false;
            defendButton.pointerId = null;
            processInputs();
        }
    }
});

function processInputs() {
    let newFlags = 0;

    if (keyMap.has("w") || keyMap.has("arrowup")) {
        newFlags |= 0x01;
    }

    if (keyMap.has("a") || keyMap.has("arrowleft")) {
        newFlags |= 0x02;
    }

    if (keyMap.has("s") || keyMap.has("arrowdown")) {
        newFlags |= 0x04;
    }

    if (keyMap.has("d") || keyMap.has("arrowright")) {
        newFlags |= 0x08;
    }

    if (keyMap.has(" ") || attackButton.on || mouse.left && !isMobile) {
        newFlags |= 0x10;
    }

    if (keyMap.has("shift") || defendButton.on || mouse.right) {
        newFlags |= 0x20;
    }

    if (newFlags !== lastFlag || mouseX !== mouse.x || mouseY !== mouse.y) {
        if (options.mouseMovement && !isMobile) {
            newFlags |= 0x40;
            mouseX = mouse.x;
            mouseY = mouse.y;
        }

        if (joystick.on) {
            newFlags |= 0x80;
        }

        net.state.socket?.talk(SERVER_BOUND.INPUTS, newFlags);
        lastFlag = newFlags;
    }
}
window.addEventListener("keydown", e => {
    if (e.key === "Enter" && !net.ChatMessage.showInput && !net.state.isDead) {
        net.ChatMessage.showInput = !net.ChatMessage.showInput;

        setTimeout(() => {
            if (net.ChatMessage.showInput) {
                net.ChatMessage.element.focus();
            }
        }, 250);
    }

    if (net.ChatMessage.showInput && net.ChatMessage.element === document.activeElement) {
        if (e.key === "Enter") {
            net.ChatMessage.send();
        }

        return;
    }

    if (e.keyCode === 13 && net.state.isDead && net.state.socket?.readyState === WebSocket.OPEN) {
        net.state.socket.spawn();
        net.state.isDead = false;
        return;
    }
    if (net.state.socket?.readyState === WebSocket.OPEN) {
        switch (e.key.toLowerCase()) {
            case ";":
                net.state.socket.talk(SERVER_BOUND.DEV_CHEAT, DEV_CHEAT_IDS.GODMODE);
                break;
            case "t":
                net.state.socket.talk(SERVER_BOUND.DEV_CHEAT, DEV_CHEAT_IDS.TELEPORT);
                break;
            case "z":
                net.state.socket.talk(SERVER_BOUND.DEV_CHEAT, DEV_CHEAT_IDS.CHANGE_TEAM);
                break;
            case "r":
                if (net.state.socket?.readyState === WebSocket.OPEN) {
                    for (let i = 0; i < net.state.slots.length; i++) {
                        if (net.state.slots[i].index > -1 && net.state.secondarySlots[i]?.index > -1) {
                            net.state.socket.talk(SERVER_BOUND.CHANGE_LOADOUT, {
                                drag: {
                                    type: net.state.isInDestroy ? DRAG_TYPE_SECONDARYDOCKER : DRAG_TYPE_MAINDOCKER,
                                    index: i
                                },
                                drop: {
                                    type: net.state.isInDestroy ? DRAG_TYPE_DESTROY : DRAG_TYPE_SECONDARYDOCKER,
                                    index: i
                                }
                            });
                        }
                    }
                }
                break;
            /* case "k":
                net.state.isInDestroy = true;
                break;
            */
        }

        if (e.key >= "0" && e.key <= "9") {
            const index = e.key === "0" ? 9 : parseInt(e.key) - 1;

            if (net.state.socket?.readyState === WebSocket.OPEN && index < net.state.slots.length && net.state.slots[index].index > -1 && net.state.secondarySlots[index]?.index > -1) {
                net.state.socket.talk(SERVER_BOUND.CHANGE_LOADOUT, {
                    drag: {
                        type: net.state.isInDestroy ? DRAG_TYPE_SECONDARYDOCKER : DRAG_TYPE_MAINDOCKER,
                        index
                    },
                    drop: {
                        type: net.state.isInDestroy ? DRAG_TYPE_DESTROY : DRAG_TYPE_SECONDARYDOCKER,
                        index
                    }
                });
            }
        }

        keyMap.add(e.key.toLowerCase());

        processInputs();
    }
});

window.addEventListener("keyup", e => {
    keyMap.delete(e.key.toLowerCase());

    if (e.key === "k") {
        net.state.isInDestroy = false;
    }

    if (net.state.socket?.readyState === WebSocket.OPEN) {
        processInputs();
    }
});

window.addEventListener("mousemove", e => {
    mouse.x = e.clientX * window.devicePixelRatio;
    mouse.y = e.clientY * window.devicePixelRatio;

    if (options.mouseMovement) {
        processInputs();
    }
});

window.addEventListener("mousedown", e => {
    switch (e.button) {
        case 0:
            mouse.left = true;
            break;
        case 2:
            mouse.right = true;
            break;
    }

    if (net.state.socket?.readyState === WebSocket.OPEN) {
        processInputs();
    }
});

window.addEventListener("mouseup", e => {
    switch (e.button) {
        case 0:
            mouse.left = false;
            break;
        case 2:
            mouse.right = false;
            break;
    }

    if (net.state.socket?.readyState === WebSocket.OPEN) {
        processInputs();
    }
});

function processDrop() {
    let drag = {
        type: dragConfig.type,
        index: dragConfig.index
    };

    let drop = null;

    const mX = mouse.x / uiScale();
    const mY = mouse.y / uiScale();

    for (let i = 0; i < net.state.slots.length; i++) {
        const slot = net.state.slots[i];

        if (slot.icon && slot.icon.x < mX && slot.icon.x + slot.icon.size > mX && slot.icon.y < mY && slot.icon.y + slot.icon.size > mY) {
            drop = {
                type: DRAG_TYPE_MAINDOCKER,
                index: i
            };
            break;
        }
    }

    if (drop === null) {
        for (let i = 0; i < net.state.secondarySlots.length; i++) {
            const slot = net.state.secondarySlots[i];

            if (slot.icon && slot.icon.x < mX && slot.icon.x + slot.icon.size > mX && slot.icon.y < mY && slot.icon.y + slot.icon.size > mY) {
                drop = {
                    type: DRAG_TYPE_SECONDARYDOCKER,
                    index: i
                };
                break;
            }
        }
    }

    /*
    if (drop === null) {
        const slot = net.state.destroyIcon;

        if (slot.realX < mX && slot.realX + slot.realSize > mX && slot.realY < mY && slot.realY + slot.realSize > mY) {
            drop = {
                type: DRAG_TYPE_DESTROY,
                index: 0
            };
        }
    }
    */

    if (drop === null && drag.type === DRAG_TYPE_SECONDARYDOCKER) {
        drag = {
            index: 0,
            rarity: 0
        };
        drop = {
            type: 2,
            index: dragConfig.index,
            rarity: 0,
            petalIndex: 0
        };
        net.state.socket.talk(SERVER_BOUND.INVENTORY_CHANGE_LOADOUT, { drag, drop });
        return true;
    }

    if (drop === null || (drop.type === drag.type && drop.index === drag.index)) {
        return false;
    }

    if (drag.type === DRAG_TYPE_MAINDOCKER && drop.type === DRAG_TYPE_SECONDARYDOCKER) {
        return false;
    }

    if (drag.type === DRAG_TYPE_MAINDOCKER && drop.type === DRAG_TYPE_DESTROY) {
        return false;
    }

    net.state.socket.talk(SERVER_BOUND.CHANGE_LOADOUT, { drag, drop });

    return true;
}

function processInventoryDrop() {
    const drag = {
        index: inventoryDragConfig.index,
        rarity: inventoryDragConfig.rarity
    };

    let drop = null;

    const mX = mouse.x / uiScale();
    const mY = mouse.y / uiScale();

    for (let i = 0; i < net.state.slots.length; i++) {
        const slot = net.state.slots[i];

        if (slot.icon && slot.icon.x < mX && slot.icon.x + slot.icon.size > mX && slot.icon.y < mY && slot.icon.y + slot.icon.size > mY) {
            drop = {
                type: DRAG_TYPE_MAINDOCKER,
                index: i,
                rarity: slot.rarity,
                petalIndex: slot.index
            };
            break;
        }
    }

    if (drop === null) {
        for (let i = 0; i < net.state.secondarySlots.length; i++) {
            const slot = net.state.secondarySlots[i];

            if (slot.icon && slot.icon.x < mX && slot.icon.x + slot.icon.size > mX && slot.icon.y < mY && slot.icon.y + slot.icon.size > mY) {
                drop = {
                    type: DRAG_TYPE_SECONDARYDOCKER,
                    index: i,
                    rarity: slot.rarity ?? 255,
                    petalIndex: slot.index === -1 ? 255 : slot.index
                };
                break;
            }
        }
    }
    if (drop === null) {
        return false;
    }

    net.state.socket.talk(SERVER_BOUND.INVENTORY_CHANGE_LOADOUT, { drag, drop });

    return true;
}

const clientDebug = {
    fps: 0,
    mspt: 0,
    frames: 0,
    totalTime: 0
};

setInterval(() => {
    clientDebug.fps = clientDebug.frames;
    clientDebug.mspt = clientDebug.totalTime / Math.max(1, clientDebug.frames);
    clientDebug.frames = 0;
    clientDebug.totalTime = 0;

    net.state.updateRate = net.state.updatesCounter;
    net.state.updatesCounter = 0;
}, 1e3);

let cuteLittleAnimations = {
    nameText: 200,
    chatBGSize: 0
};

const buttonsContainer = document.getElementById("menus2");
const menu = buttonsContainer.children.item("inventory");

function drawInventory() {
    net.state.petalElements = [];
    menu.innerHTML = "";

    if (!net.state.inventory) {
        menu.textContent = "Your inventory is empty :(";
        return;
    }

    let inventoryEmpty = true;
    Object.values(net.state.inventory).forEach(tier => {
        if (Object.values(tier).some(count => count > 0)) {
            inventoryEmpty = false;
        }
    });

        petal.appendChild(icon);

        net.state.petalElements.push({
          icon,
          index: Number(petalIndex),
          rarity: rarityIndex,
          width: petalSize,
          height: petalSize,
        });
      });
  });
}

window.addEventListener("keydown", e => {
    if (e.key === " " || e.key === "Enter") {
        if (e.target.closest("button")) {
            e.preventDefault();
            return false;
        }
    }
    if (e.key === "z" && !net.ChatMessage.showInput) {
        const isNowActive = menu.classList.toggle("active");
        if (isNowActive) {
            drawInventory();
        } else {
            // Release GPU texture memory immediately rather than waiting for GC
            net.state.petalElements?.forEach(({ icon }) => {
                icon.width = 0;
                icon.height = 0;
            });
            net.state.petalElements = [];
            menu.innerHTML = "";
        }
    }

    const petal = document.createElement("div");
    petal.style.display = "flex";
    petal.style.flexWrap = "wrap";
    petal.style.padding = "0px";
    petal.style.gap = "5px";
    menu.appendChild(petal);

    const petalSize = 56;

    let sortedTiers = Object.entries(net.state.inventory)
        .sort(([a], [b]) => {
            const aIndex = net.state.tiers.findIndex(t => t.name === a);
            const bIndex = net.state.tiers.findIndex(t => t.name === b);
            return bIndex - aIndex;
        });

    sortedTiers.forEach(([tierName, petals]) => {
        const rarityIndex = net.state.tiers.findIndex(t => t.name === tierName);

        Object.entries(petals)
            .sort(([a], [b]) => {
                const aName = net.state.petalConfigs[Number(a)].name;
                const bName = net.state.petalConfigs[Number(b)].name;
                return aName.localeCompare(bName);
            })
            .forEach(([petalIndex, count]) => {
                if (count <= 0) return;

                const petalCanvas = getPetalIcon(Number(petalIndex), rarityIndex);

                const icon = document.createElement("canvas");
                icon.width = petalSize;
                icon.height = petalSize;

                icon.style.width = petalSize + "px";
                icon.style.height = petalSize + "px";
                icon.style.flex = "0 0 auto";

                const c = icon.getContext("2d");
                c.drawImage(petalCanvas, 0, 0, petalSize, petalSize);

                if (count > 1) {
                    c.fillStyle = colors.white;
                    c.strokeStyle = "#000000";
                    c.lineWidth = 2;
                    c.font = `bold ${petalSize * .25}px Ubuntu`;
                    c.textAlign = "right";
                    c.textBaseline = "top";

                    const text = count > 1000 ? `x${formatLargeNumber(count, 1)}` : `x${formatLargeNumber(count)}`;

                    c.strokeText(text, petalSize - 4, 4);
                    c.fillText(text, petalSize - 4, 4);
                }

                petal.appendChild(icon);

                net.state.petalElements.push({
                    icon,
                    index: Number(petalIndex),
                    rarity: rarityIndex,
                    width: petalSize,
                    height: petalSize,
                });
            });
    });
}

window.addEventListener("keydown", e => {
    if (e.key === " " || e.key === "Enter") {
        if (e.target.closest("button")) {
            e.preventDefault();
            return false;
        }
    }
    if (e.key === "z" && !net.ChatMessage.showInput) {
        menu.classList.toggle("active");
        drawInventory();
    }
});

const mobIconCanvas = document.createElement("canvas");
const mobIconCtx = mobIconCanvas.getContext("2d");

function draw() {
    net.state.petalHover = null;
    net.state.mobHover = null;
    net.state.interpolationFactor = options.rigidInterpolation ? .4 : .2;
    requestAnimationFrame(draw);

    const start = performance.now();

    if (net.state.socket?.readyState !== WebSocket.OPEN) {
        net.state.camera.realX += .5;
        net.state.camera.realY = Math.sin(net.state.camera.realX / 100) * 50;
    }

    net.state.camera.interpolate();

    const scale = gameScale(net.state.camera.fov);
    const cameraX = net.state.camera.x * scale;
    const cameraY = net.state.camera.y * scale;
    const halfWidth = canvas.width * .5;
    const halfHeight = canvas.height * .5;

    drawBackground(
        cameraX, cameraY, scale, net.state.socket?.readyState === WebSocket.OPEN,
        net.state.room.width, net.state.room.height,
        net.state.disconnected ? null : BIOME_BACKGROUNDS[net.state.room.biome],
        net.state.room.isRadial
    );

    if (net.state.disconnected) {
        const sc = uiScale();
        // ctx.save();
        const oldTransform = ctx.getTransform();
        // ctx.scale(sc, sc);
        ctx.setTransform(sc, 0, 0, sc, 0, 0);
        const w = canvas.width / sc;
        const h = canvas.height / sc;
        text("Disconnected", w / 2, h / 2, 30);
        text(net.state.disconnectMessage, w / 2, h / 2 + 30, 15);
        // ctx.restore();
        ctx.setTransform(oldTransform);
        return;
    }

    if (net.state.terrain !== null && net.state.terrainImg) {
        ctx.drawImage(net.state.terrainImg, -net.state.room.width / 2 * scale - cameraX + halfWidth, -net.state.room.height / 2 * scale - cameraY + halfHeight, net.state.room.width * scale, net.state.room.height * scale);
    }

    net.state.markers.forEach(marker => {
        const drawX = marker.x * scale - cameraX + halfWidth;
        const drawY = marker.y * scale - cameraY + halfHeight;
        if (marker.tick > 1) return net.state.markers.delete(marker.id);
        const oldTransform = ctx.getTransform();
        ctx.setTransform(marker.size * scale, 0, 0, marker.size * scale, drawX, drawY)
        pentagram(ctx, marker.tick);
        ctx.setTransform(oldTransform);
    });

    if (!net.state.previousMobs) {
        net.state.previousMobs = new Map();
        net.state.dyingMobs = new Map();
        net.state.previousPetals = new Map();
        net.state.dyingPetals = new Map();
        net.state.previousPlayers = new Map();
        net.state.dyingPlayers = new Map();
    }

    const currentMobs = new Map();
    const currentPetals = new Map();
    const currentPlayers = new Map();

    net.state.mobs.forEach(mob => currentMobs.set(mob.id, mob));
    net.state.petals.forEach(petal => currentPetals.set(petal.id, petal));
    net.state.players.forEach(p => currentPlayers.set(p.id, p));

    net.state.previousMobs.forEach((mob, id) => {
        if (!currentMobs.has(id)) net.state.dyingMobs.set(id, { mob, progress: 0 });
    });

    net.state.previousPetals.forEach((petal, id) => {
        if (!currentPetals.has(id)) net.state.dyingPetals.set(id, { petal, progress: 0 });
    });

    net.state.previousPlayers.forEach((p, id) => {
        if (!currentPlayers.has(id)) net.state.dyingPlayers.set(id, { player: p, progress: 0 });
    });

    net.state.dyingPetals.forEach((data, id) => {
        const entity = data.petal;
        data.progress += .2;
        if (data.progress >= 1) return net.state.dyingPetals.delete(id);
        const fade = 1 - data.progress;
        const scaling = 1.35 + data.progress;
        const drawX = entity.x * scale - cameraX + halfWidth;
        const drawY = entity.y * scale - cameraY + halfHeight;
        const size = entity.size * scale * scaling;

        // ctx.save();
        const oldTransform = ctx.getTransform();
        const oldFillStyle = ctx.fillStyle;
        const oldStrokeStyle = ctx.strokeStyle;
        const oldLineWidth = ctx.lineWidth;
        const oldGlobalAlpha = ctx.globalAlpha;
        const oldShadowBlur = ctx.shadowBlur;
        const oldShadowColor = ctx.shadowColor;
        ctx.globalAlpha = fade;
        // ctx.translate(drawX, drawY);
        // ctx.scale(size, size);
        ctx.setTransform(size, 0, 0, size, drawX, drawY);
        ctx.rotate(entity.facing);
        drawPetal(entity.index, entity.hit, ctx, entity.id, entity.size);
        // ctx.restore();
        ctx.setTransform(oldTransform);
        ctx.fillStyle = oldFillStyle;
        ctx.strokeStyle = oldStrokeStyle;
        ctx.lineWidth = oldLineWidth;
        ctx.globalAlpha = oldGlobalAlpha;
        ctx.shadowBlur = oldShadowBlur;
        ctx.shadowColor = oldShadowColor;
    });

    net.state.dyingMobs.forEach((data, id) => {
        const entity = data.mob;
        data.progress += .2;
        if (data.progress >= 1) return net.state.dyingMobs.delete(id);
        const fade = 1 - data.progress;
        const scaling = 1.35 + data.progress;
        const drawX = entity.x * scale - cameraX + halfWidth;
        const drawY = entity.y * scale - cameraY + halfHeight;
        const size = entity.size * scale * scaling;

        // ctx.save();
        const oldTransform = ctx.getTransform();
        const oldFillStyle = ctx.fillStyle;
        const oldStrokeStyle = ctx.strokeStyle;
        const oldLineWidth = ctx.lineWidth;
        const oldGlobalAlpha = ctx.globalAlpha;
        const oldShadowBlur = ctx.shadowBlur;
        const oldShadowColor = ctx.shadowColor;
        ctx.globalAlpha = fade;
        // ctx.translate(drawX, drawY);
        // ctx.scale(size, size);
        ctx.setTransform(size, 0, 0, size, drawX, drawY);
        ctx.rotate(entity.facing);

        if (options.fancyGraphics && net.state.room.biome === BIOME_TYPES.HELL) {
            ctx.shadowBlur = 10 * scale * (Math.sin(performance.now() / 500 + entity.id * 3) * .8 + .8);
            ctx.shadowColor = "#FFFFFF";
        }

        drawMob(entity.id, entity.index, entity.rarity, entity.hit, ctx, entity.attack, entity.friendly, entity.facing, entity.extraData);
        // ctx.restore();
        ctx.setTransform(oldTransform);
        ctx.fillStyle = oldFillStyle;
        ctx.strokeStyle = oldStrokeStyle;
        ctx.lineWidth = oldLineWidth;
        ctx.globalAlpha = oldGlobalAlpha;
        ctx.shadowBlur = oldShadowBlur;
        ctx.shadowColor = oldShadowColor;
    });

    net.state.dyingPlayers.forEach((data, id) => {
        const entity = data.player;
        data.progress += .2;
        if (data.progress >= 1) return net.state.dyingPlayers.delete(id);
        const fade = 1 - data.progress;
        const scaling = 1 + data.progress;

        const drawX = entity.x * scale - cameraX + halfWidth;
        const drawY = entity.y * scale - cameraY + halfHeight;
        const size = (entity.size * scale) * scaling;

        // ctx.save();
        const oldAlpha = ctx.globalAlpha;
        const oldTransform = ctx.getTransform();
        ctx.globalAlpha = fade;
        // ctx.translate(drawX, drawY);
        // ctx.scale(size, size);
        ctx.setTransform(size, 0, 0, size, drawX, drawY);
        setStyle(mixColors([colors.playerYellow, colors.team1, colors.team2][entity.team] ?? colors.crafting, colors.legendary, entity.hit * .5), .1);
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        drawFace(1 * .375, 0, 1, .6, 1, true);
        // ctx.restore();
        ctx.globalAlpha = oldAlpha;
        ctx.setTransform(oldTransform);
    });

    net.state.previousMobs = currentMobs;
    net.state.previousPetals = currentPetals;
    net.state.previousPlayers = currentPlayers;

    net.state.petals.forEach(entity => {
        entity.interpolate();
        entity.size2 ??= entity.index === 24 || entity.index === 64 ? entity.size / 1.4 : entity.size;
        if (entity.index === 24 || entity.index === 64) entity.size2 += (entity.size - entity.size2) * .25;

        const drawX = entity.x * scale - cameraX + halfWidth;
        const drawY = entity.y * scale - cameraY + halfHeight;

        // ctx.save();
        // ctx.translate(drawX, drawY);
        // ctx.scale(entity.size2 * scale, entity.size2 * scale);
        const oldTransform = ctx.getTransform();
        const oldFillStyle = ctx.fillStyle;
        const oldStrokeStyle = ctx.strokeStyle;
        const oldLineWidth = ctx.lineWidth;
        const oldGlobalAlpha = ctx.globalAlpha;
        const oldShadowBlur = ctx.shadowBlur;
        const oldShadowColor = ctx.shadowColor;
        ctx.setTransform(entity.size2 * scale, 0, 0, entity.size2 * scale, drawX, drawY);
        ctx.rotate(entity.facing);
        drawPetal(entity.index, entity.hit, ctx, entity.id, entity.size2);
        // ctx.restore();
        ctx.setTransform(oldTransform);
        ctx.fillStyle = oldFillStyle;
        ctx.strokeStyle = oldStrokeStyle;
        ctx.lineWidth = oldLineWidth;
        ctx.globalAlpha = oldGlobalAlpha;
        ctx.shadowBlur = oldShadowBlur;
        ctx.shadowColor = oldShadowColor;

        if (options.showHitboxes) {
            ctx.beginPath();
            ctx.arc(drawX, drawY, entity.size * scale, 0, Math.PI * 2);
            ctx.lineWidth = 1.5 * scale;
            ctx.strokeStyle = colors["???"];
            ctx.stroke();
            ctx.closePath();
        }
        if (keyMap.has("g")) {
            ctx.globalAlpha = .3;
            ctx.beginPath();
            ctx.arc(drawX, drawY, (entity.size * scale) * 1.4, 0, Math.PI * 2);
            ctx.fillStyle = net.state.tiers[entity.rarity].color;
            ctx.fill();
            ctx.closePath();
            ctx.globalAlpha = 1;
            text(net.state.tiers[entity.rarity].name, drawX, drawY, (entity.size * scale) * 1.15, net.state.tiers[entity.rarity].color);
        }
    });

    net.state.drops.forEach(entity => {
        const oldTransform = ctx.getTransform();
        const oldFillStyle = ctx.fillStyle;
        const oldAlpha = ctx.globalAlpha;
        const drawX = entity.x * scale - cameraX + halfWidth;
        const drawY = entity.y * scale - cameraY + halfHeight;
        const outlineTimer = Math.sin(performance.now() / 250 + entity.id) + 1.5;
        entity.creation ??= performance.now();
        // ctx.save();
        // ctx.translate(drawX, drawY);
        entity.rotation ??= (Math.random() * (Math.PI / 6)) - (Math.PI / 12);
        const aSin = Math.sin((performance.now() + entity.creation) / 200) * .05;
        // ctx.scale((1 + aSin) * entity.size * scale, (1 + aSin) * entity.size * scale);
        ctx.setTransform((1 + aSin) * entity.size * scale, 0, 0, (1 + aSin) * entity.size * scale, drawX, drawY);
        ctx.rotate(entity.rotation);

        ctx.fillStyle = colors.black;
        ctx.beginPath();
        ctx.roundRect(-.55 - .025 * outlineTimer, -.55 - .025 * outlineTimer, 1.1 + .05 * outlineTimer, 1.1 + .05 * outlineTimer, .1);
        ctx.globalAlpha *= .125;
        ctx.fill();
        ctx.closePath();

        ctx.globalAlpha *= 8;

        ctx.drawImage(getPetalIcon(entity.index, entity.rarity), -.5, -.5, 1, 1);

        // ctx.restore();
        ctx.fillStyle = oldFillStyle;
        ctx.globalAlpha = oldAlpha;
        ctx.setTransform(oldTransform);
    });

    net.state.mobs.forEach(entity => {
        entity.interpolate();
        const drawX = entity.x * scale - cameraX + halfWidth;
        const drawY = entity.y * scale - cameraY + halfHeight;
        const size = entity.size * scale;
        // ctx.save();
        // ctx.translate(drawX, drawY);
        // ctx.scale(size, size);
        const oldTransform = ctx.getTransform();
        const oldFillStyle = ctx.fillStyle;
        const oldStrokeStyle = ctx.strokeStyle;
        const oldLineWidth = ctx.lineWidth;
        const oldGlobalAlpha = ctx.globalAlpha;
        const oldShadowBlur = ctx.shadowBlur;
        const oldShadowColor = ctx.shadowColor;
        ctx.setTransform(size, 0, 0, size, drawX, drawY);
        ctx.rotate(entity.facing);

        if (options.fancyGraphics && net.state.room.biome === BIOME_TYPES.HELL) {
            ctx.shadowBlur = 10 * scale * (Math.sin(performance.now() / 500 + entity.id * 3) * .8 + .8);
            ctx.shadowColor = "#FFFFFF";
        }

        drawMob(entity.id, entity.index, entity.rarity, entity.hit, ctx, entity.attack, entity.friendly, entity.facing, entity.extraData);
        // ctx.restore();
        ctx.setTransform(oldTransform);
        ctx.fillStyle = oldFillStyle;
        ctx.strokeStyle = oldStrokeStyle;
        ctx.lineWidth = oldLineWidth;
        ctx.globalAlpha = oldGlobalAlpha;
        ctx.shadowBlur = oldShadowBlur;
        ctx.shadowColor = oldShadowColor;

        if (options.showHitboxes) {
            ctx.beginPath();
            ctx.arc(drawX, drawY, size, 0, Math.PI * 2);
            ctx.lineWidth = 1.5 * scale;
            ctx.strokeStyle = colors["???"];
            ctx.stroke();
        }

        if (!options.hideEntityUI && !net.state.mobConfigs[entity.index].hideUI) {
            const barSize = Math.max(size, 30 * scale);
            const barthicc = (5 + (entity.size * .1)) * scale;

            drawBar(drawX - barSize, drawX + barSize, drawY + barSize + 13 * scale, barthicc, colors["???"]);
            drawBar(drawX - barSize, drawX - barSize + barSize * 2 * entity.secondaryHealthBar, drawY + barSize + 13 * scale, .667 * barthicc, colors.legendary);
            drawBar(drawX - barSize, drawX - barSize + barSize * 2 * entity.healthRatio, drawY + barSize + 13 * scale, .667 * barthicc, entity.poisoned ? mixColors(colors.common, colors.irisPurple, .5 + Math.sin(performance.now() / 333 + entity.id * 3) * .5) : colors.common);

            ctx.textAlign = "left";
            text(net.state.mobConfigs[entity.index].name, drawX - barSize - barthicc * .5, drawY + barSize + 8 * scale - barthicc * .5, 8.5 * scale);

            ctx.textAlign = "right";
            text(net.state.tiers[entity.rarity].name, drawX + barSize + barthicc * .5, drawY + barSize + 18 * scale + barthicc * .5, 8.5 * scale, net.state.tiers[entity.rarity].color);
        }
    });

    ctx.textAlign = "center";

    net.state.players.forEach(entity => {
        entity.interpolate();

        let expression = 1,
            targetMouthDip = 1.7;

        if (entity.attack) {
            expression = 2;
            targetMouthDip = .6;
        }

        if (entity.defend) {
            expression = 3;
            targetMouthDip = .8;
        }

        entity.mood = lerp(entity.mood, expression, .4)
        entity.mouthDip = lerp(entity.mouthDip, targetMouthDip, .4);

        let drawX = entity.x * scale - cameraX + halfWidth,
            drawY = entity.y * scale - cameraY + halfHeight;

        if (entity.id === net.state.playerID) {
            drawX = halfWidth;
            drawY = halfHeight;
        }

        setStyle(mixColors([colors.playerYellow, colors.team1, colors.team2][entity.team] ?? colors.crafting, colors.legendary, entity.hit * .5), 5 * scale);

        const size = entity.size * scale;

        if (entity.wearing & WEARABLES.AMULET) {
            // ctx.save();
            // ctx.translate(drawX, drawY);
            const oldTransform = ctx.getTransform();
            const oldStrokeStyle = ctx.strokeStyle;
            const oldLineWidth = ctx.lineWidth;
            const oldFillStyle = ctx.fillStyle;
            ctx.setTransform(1, 0, 0, 1, drawX, drawY);

            const xTrans = size * .334 * Math.sin(performance.now() / 1250 + entity.id * Math.PI / 6) * scale;

            ctx.beginPath();
            ctx.arc(0, 0, size + 2.5 * scale, 0, Math.PI * 2);
            ctx.moveTo(-size, 0);
            ctx.lineTo(xTrans, size * 2.5);
            ctx.lineTo(size, 0);
            ctx.strokeStyle = colors["???"];
            ctx.lineWidth = 2.5 * scale;
            ctx.stroke();

            // ctx.translate(xTrans, size * 2.5);
            // ctx.scale(size * .6, size * .6);
            ctx.setTransform(size * .6, 0, 0, size * .6, xTrans, size * 2.5)
            ctx.rotate(performance.now() / 1000 + entity.id * 5);
            drawAmulet(ctx, false);
            // ctx.restore();
            ctx.setTransform(oldTransform);
            ctx.strokeStyle = oldStrokeStyle;
            ctx.lineWidth = oldLineWidth;
            ctx.fillStyle = oldFillStyle;
        }

        if (entity.wearing & WEARABLES.ARMOR) {
            // ctx.save();
            // ctx.translate(drawX, drawY);
            // ctx.scale(size * 1.35, size * 1.35);
            const oldTransform = ctx.getTransform();
            ctx.setTransform(size * 1.35, 0, 0, size * 1.35, drawX, drawY);
            ctx.rotate(performance.now() / 250 + entity.id * 5);
            drawArmor(ctx);
            // ctx.restore();
            ctx.setTransform(oldTransform);
        }

        ctx.beginPath();
        ctx.arc(drawX, drawY, size, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();

        const oldTransform = ctx.getTransform();
        ctx.setTransform(1, 0, 0, 1, drawX, drawY);
        drawFace(size * .4, entity.facing, entity.mood, entity.mouthDip, expression);
        ctx.setTransform(oldTransform);

        if (entity.wearing & WEARABLES.THIRD_EYE) {
            const oldTransform = ctx.getTransform();
            // ctx.save();
            // ctx.translate(drawX, drawY - size * .6);
            // ctx.scale(size * .3, size * .3);
            ctx.setTransform(size * .3, 0, 0, size * .3, drawX, drawY - size * .6);
            drawThirdEye(ctx, false);
            // ctx.restore();
            ctx.setTransform(oldTransform);
        }

        if (entity.wearing & WEARABLES.ANTENNAE) {
            const oldTransform = ctx.getTransform();
            // ctx.save();
            // ctx.translate(drawX, drawY - size * .8);
            // ctx.scale(size * .9, size * .9);
            ctx.setTransform(size * .9, 0, 0, size * .9, drawX, drawY - size * .8);
            drawAntennae(ctx);
            // ctx.restore();
            ctx.setTransform(oldTransform);
        }

        if (options.showHitboxes) {
            ctx.beginPath();
            ctx.arc(drawX, drawY, size, 0, Math.PI * 2);
            ctx.lineWidth = 1.5 * scale;
            ctx.strokeStyle = colors["???"];
            ctx.stroke();
        }

        drawBar(drawX - size, drawX + size, drawY + size + 16 * scale, 6 * scale, colors["???"]);
        drawBar(drawX - size, drawX - size + size * 2 * entity.secondaryHealthBar, drawY + size + 16 * scale, 4 * scale, colors.legendary);
        drawBar(drawX - size, drawX - size + size * 2 * entity.healthRatio, drawY + size + 16 * scale, 4 * scale, entity.poisoned ? mixColors(colors.common, colors.irisPurple, .5 + Math.sin(performance.now() / 333 + entity.id * 3) * .5) : colors.common);

        if (entity.shieldRatio > 0) {
            drawBar(drawX - size, drawX - size + size * 2 * entity.shieldRatio, drawY + size + 16 * scale, 2.5 * scale, colors.unique);
        }

        if (!options.hideEntityUI && entity.id !== net.state.playerID) {
            // Like mob bar
            ctx.textAlign = "left";
            text(entity.name, drawX - size - 2, drawY + size + 9 * scale, 8 * scale, entity.nameColor);

            ctx.textAlign = "right";
            text("Lvl " + entity.level, drawX + size + 2, drawY + size + 23 * scale, 8 * scale, net.state.tiers[entity.rarity].color);

            ctx.textAlign = "center";
        }
    });

    net.state.lightning.forEach(lightning => {
        const alpha = lightning.alpha;

        if (alpha <= 0) {
            net.state.lightning.delete(lightning.id);
            return;
        }

        ctx.beginPath();
        ctx.moveTo(lightning.points[0].x * scale - cameraX + halfWidth, lightning.points[0].y * scale - cameraY + halfHeight);
        for (let i = 1; i < lightning.points.length; i++) {
            ctx.lineTo(lightning.points[i].x * scale - cameraX + halfWidth, lightning.points[i].y * scale - cameraY + halfHeight);
        }
        ctx.lineWidth = 2 * scale;
        ctx.strokeStyle = colors.white;
        ctx.globalAlpha = Math.pow(alpha, 4) * 1.25;
        ctx.stroke();
    });

    ctx.globalAlpha = 1;

    if (!options.disableTiledBackground) {
        drawBackgroundOverlay(cameraX, cameraY, scale, BIOME_BACKGROUNDS[net.state.room.biome]);
    }

    if (net.state.terrain !== null && net.state.terrain.overlay !== null && net.state.room.biome === BIOME_TYPES.HALLOWEEN) {
        net.state.terrain.overlay.render(ctx, cameraX, cameraY, net.state.camera.lightingBoost, net.state.room.width * scale, net.state.room.width * scale, scale, halfWidth, halfHeight);
    }

    const uScale = uiScale();
    ctx.save();
    ctx.scale(uScale, uScale);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const width = canvas.width / uScale;
    const height = canvas.height / uScale;
    const mX = mouse.x / uScale;
    const mY = mouse.y / uScale;

    if (net.state.slots.length > 0) { // Slots
        const padding = 12.5;
        let boxSize = net.state.isInDestroy ? 48 : 72;
        let lineWidth = isMobile ? 7 : 5.25
        if (isMobile) {
            boxSize *= 1.4
        }

        let secondaryBoxSize = net.state.isInDestroy ? 65 : boxSize * .75;

        if (dragConfig.enabled) {
            dragConfig.item.realSize = boxSize;
        }
        if (inventoryDragConfig.enabled) {
            inventoryDragConfig.item.realSize = boxSize;
        }

        if (net.state.isInDestroy) {
            text("(Press the keybind to destroy the item)", width / 2, height - boxSize - secondaryBoxSize - padding * 4, 15);
        }

        for (let i = 0; i < net.state.slots.length; i++) {
            const slot = net.state.slots[i];
            const x = width / 2 - (boxSize + padding) * net.state.slots.length / 2 + (boxSize + padding) * i + padding / 2;
            const y = height - boxSize - secondaryBoxSize - padding * 3;

            ctx.globalAlpha = .5;
            ctx.fillStyle = mixColors(colors.unique, "#000000", .2);
            ctx.beginPath();
            ctx.roundRect(x, y, boxSize, boxSize, 4);
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = colors.unique
            ctx.beginPath();
            ctx.roundRect(x + lineWidth, y + lineWidth, boxSize - lineWidth * 2, boxSize - lineWidth * 2, 2);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1;

            if (slot.index !== -1 && ((!dragConfig.enabled || dragConfig.type !== DRAG_TYPE_MAINDOCKER) || dragConfig.index !== i)) {
                if (slot.icon === undefined) {
                    slot.icon = new net.IconItem();
                    slot.icon.realX = slot.icon.x = x;
                    slot.icon.realY = slot.icon.y = y;
                    slot.icon.realSize = slot.icon.size = boxSize;
                }

                slot.icon.interpolate();
                slot.icon.realX = x;
                slot.icon.realY = y;
                slot.icon.realSize = boxSize;

                if (slot.index > -1) {
                    if (slot.ratio > slot.realRatio) {
                        slot.ratio = slot.realRatio;
                    } else {
                        slot.ratio = lerp(slot.ratio, slot.realRatio, .1);
                    }

                    if (slot.ratio < .995) {
                        drawPetalIconWithRatio(slot.index, slot.rarity, x, y, boxSize, slot.ratio, ctx);
                    } else {
                        ctx.save();
                        ctx.translate(slot.icon.x, slot.icon.y);
                        ctx.scale(slot.icon.size, slot.icon.size);
                        ctx.drawImage(getPetalIcon(slot.index, slot.rarity), 0, 0, 1, 1);
                        ctx.restore();
                    }

                    if (mX > x && mX < x + boxSize && mY > y && mY < y + boxSize) {
                        net.state.petalHover = [slot.index, slot.rarity, x, y];

                        if (mouse.left && !dragConfig.enabled && !inventoryDragConfig.enabled && !joystick.on) {
                            beginDragDrop(x + boxSize / 2, y + boxSize / 2, boxSize, slot.index, slot.rarity);
                            dragConfig.type = DRAG_TYPE_MAINDOCKER;
                            dragConfig.index = i;
                            dragConfig.item.stableSize = boxSize;

                            dragConfig.onDrop = () => {
                                if (!processDrop()) {
                                    slot.icon.x = mouse.x / uScale - boxSize / 2;
                                    slot.icon.y = mouse.y / uScale - boxSize / 2;
                                }
                            }
                        }
                    }
                }
            }
        }

        if (net.state.secondarySlots.length > 0) {
            const y = height - secondaryBoxSize - padding * 2;
            if (dragConfig.enabled || inventoryDragConfig.enabled) {
                // If the drag item is within this row, make the size secondaryBoxSize
                const barWidth = secondaryBoxSize * net.state.slots.length + padding * (net.state.slots.length + 1);
                const barX = width / 2 - barWidth / 2;
                const barY = height - secondaryBoxSize - padding;

                if (dragConfig.enabled) {
                    if (dragConfig.item.x > barX && dragConfig.item.x < barX + barWidth && dragConfig.item.y > barY && dragConfig.item.y < barY + secondaryBoxSize) {
                        dragConfig.item.realSize = secondaryBoxSize;
                    }
                }
                if (inventoryDragConfig.enabled) {
                    if (inventoryDragConfig.item.x > barX && inventoryDragConfig.item.x < barX + barWidth && inventoryDragConfig.item.y > barY && inventoryDragConfig.item.y < barY + secondaryBoxSize) {
                        inventoryDragConfig.item.realSize = secondaryBoxSize;
                    }
                }
            }

            const minXOfSecondary = width / 2 - (secondaryBoxSize + padding) * net.state.slots.length / 2 + padding / 2;
            text("[R]", minXOfSecondary - secondaryBoxSize / 2.25, y + secondaryBoxSize / 2, 15);

            for (let i = 0; i < net.state.slots.length; i++) {
                const slot = net.state.secondarySlots[i];
                const x = width / 2 - (secondaryBoxSize + padding) * net.state.slots.length / 2 + (secondaryBoxSize + padding) * i + padding / 2;

                ctx.globalAlpha = .5;
                ctx.fillStyle = mixColors(colors.unique, "#000000", .2);
                ctx.beginPath();
                ctx.roundRect(x, y, secondaryBoxSize, secondaryBoxSize, 4);
                ctx.closePath();
                ctx.fill();

                ctx.fillStyle = colors.unique
                ctx.beginPath();
                ctx.roundRect(x + (lineWidth - 1), y + (lineWidth - 1), secondaryBoxSize - (lineWidth - 1) * 2, secondaryBoxSize - (lineWidth - 1) * 2, 2);
                ctx.closePath();
                ctx.fill();
                ctx.globalAlpha = 1;

                if (slot.icon === undefined) {
                    slot.icon = new net.IconItem();
                    slot.icon.realX = slot.icon.x = x;
                    slot.icon.realY = slot.icon.y = y;
                    slot.icon.realSize = slot.icon.size = secondaryBoxSize;
                }

                slot.icon.interpolate();
                slot.icon.realX = x;
                slot.icon.realY = y;
                slot.icon.realSize = secondaryBoxSize;

                if (slot.index > -1 && ((!dragConfig.enabled || dragConfig.type !== DRAG_TYPE_SECONDARYDOCKER) || dragConfig.index !== i)) {
                    ctx.save();
                    ctx.translate(slot.icon.x, slot.icon.y);
                    ctx.scale(slot.icon.size, slot.icon.size);
                    ctx.drawImage(getPetalIcon(slot.index, slot.rarity), 0, 0, 1, 1);
                    ctx.restore();

                    if (mX > x && mX < x + secondaryBoxSize && mY > y && mY < y + secondaryBoxSize) {
                        net.state.petalHover = [slot.index, slot.rarity, x, y];

                        if (mouse.left && !dragConfig.enabled && !inventoryDragConfig.enabled && !joystick.on) {
                            beginDragDrop(x + boxSize / 2, y + boxSize / 2, boxSize, slot.index, slot.rarity);
                            dragConfig.type = DRAG_TYPE_SECONDARYDOCKER;
                            dragConfig.index = i;
                            dragConfig.item.stableSize = secondaryBoxSize;

                            dragConfig.onDrop = () => {
                                if (!processDrop()) {
                                    slot.icon.x = mouse.x / uScale - boxSize / 2;
                                    slot.icon.y = mouse.y / uScale - boxSize / 2;
                                }
                            }
                        }
                    }
                }

                // Keybinds
                text(`[${(i + 1) % 10}]`, x + secondaryBoxSize / 2, y + secondaryBoxSize + padding, 12);
            }
        }

        /*
        if (net.state.slots.length > 0) {
            const maxXOfSecondary = width / 2 - (secondaryBoxSize + padding) * net.state.slots.length / 2 + (secondaryBoxSize + padding) * net.state.slots.length + padding / 2 + secondaryBoxSize / 2;
            const y = height - secondaryBoxSize - padding * 2;

            net.state.destroyIcon.realX = maxXOfSecondary;
            net.state.destroyIcon.realY = y;
            net.state.destroyIcon.realSize = secondaryBoxSize;
            net.state.destroyIcon.interpolate();

            ctx.beginPath();
            ctx.fillStyle = mixColors(colors.skillTree, "#000000", .2);
            ctx.roundRect(maxXOfSecondary, y, secondaryBoxSize, secondaryBoxSize, 4);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.fillStyle = colors.skillTree
            ctx.roundRect(maxXOfSecondary + (lineWidth - 1), y + (lineWidth - 1), secondaryBoxSize - (lineWidth - 1) * 2, secondaryBoxSize - (lineWidth - 1) * 2, 2);
            ctx.closePath();
            ctx.fill();
            
            text("Destroy", maxXOfSecondary + secondaryBoxSize / 2, y + secondaryBoxSize / 2, secondaryBoxSize / 5);
            text("[k]", maxXOfSecondary + secondaryBoxSize / 2, y + secondaryBoxSize + padding, 12);
        }
        */
    }

    net.state.iconStuff ??= [];

    function drawIconsToOffscreen(info) {
        net.state.iconStuff = [];

        mobIconCanvas.width = width;
        mobIconCanvas.height = height;

        const ctx = mobIconCtx;
        ctx.clearRect(0, 0, mobIconCanvas.width, mobIconCanvas.height);
        let boxSize = 75;
        let gapY = 40;
        let gapX = 5;

        ctx.lineCap = ctx.lineJoin = "round";

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        const groupedByIndex = {};
        net.state.waveInfo.aliveMobs.forEach(mob => {
            if (!groupedByIndex[mob.index]) groupedByIndex[mob.index] = {};
            if (!groupedByIndex[mob.index][mob.rarity]) {
                groupedByIndex[mob.index][mob.rarity] = {
                    index: mob.index,
                    rarity: mob.rarity,
                    count: 0
                };
            }
            groupedByIndex[mob.index][mob.rarity].count++;
        });

        const mobStacks = Object.entries(groupedByIndex)
            .map(([index, rarities]) => Object.values(rarities).sort((a, b) => a.rarity - b.rarity))
            .sort((a, b) => {
                if (a[0].index === 255) return -1;
                if (b[0].index === 255) return 1;
                return a[0].index - b[0].index;
            });
        boxSize -= mobStacks.length / 1.1;
        gapX -= mobStacks.length;
        gapY -= mobStacks.length / 1.2;

        mobStacks.forEach((stack, stackI) => {
            stack.forEach((entity, rarityI) => {
                const x = width / 2 + 45 - (80 / 2) + (stackI - mobStacks.length / 2) * (80 + gapX);
                const y = 100 + rarityI * (boxSize - gapY);
                let defaultIconSize = net.state.mobConfigs[entity.index]?.wavesIconSize ?? 3.5;

                net.state.iconStuff.push({
                    x, y, size: boxSize,
                    index: entity.index,
                    rarity: entity.rarity,
                    count: entity.count
                });

                setStyle(net.state.tiers[entity.rarity].color, 5, .2, ctx);
                ctx.save();
                ctx.beginPath();
                ctx.roundRect(x, y, boxSize, boxSize, 5);
                ctx.fill();
                ctx.clip();

                ctx.translate(x + boxSize / 2, y + boxSize / 2);

                let indexScales = {
                    0: 4, // Ladybug
                    1: 4, // Rock
                    2: 4, // Bee
                    3: 5.5, // Spider
                    4: 4, // Beetle
                    5: 3, // Leafbug
                    6: 4, // Roach
                    7: 4, // Hornet
                    8: 3.25, // Mantis
                    9: 4, // Pupa
                    10: 3.25, // Sandstorm
                    11: 3.25, // Scorpion
                    12: 3.25, // Demon
                    13: 4, // Jellyfish
                    14: 4, // Cactus
                    15: 6.25, // Baby Ant
                    16: 6.25, // Worker Ant
                    17: 6.25, // Soldier Ant
                    18: 6.25, // Queen Ant
                    19: 4, // Ant Hole
                    20: 6.25, // Baby Fire Ant
                    21: 6.25, // Worker Fire Ant
                    22: 6.25, // Soldier Fire Ant
                    23: 6.25, // Queen Fire Ant
                    24: 4, // Fire Ant Hole
                    25: 6.25, // Baby Termite
                    26: 6.25, // Worker Termite
                    27: 6.25, // Soldier Termite
                    28: 4, // Termite Overmind
                    29: 4, // Termite Mound
                    30: 5.25, // Ant Egg
                    31: 5.25, // Queen Ant Egg
                    32: 5.25, // Fire Ant Egg
                    33: 5.25, // Queen Fire Ant Egg
                    34: 5.25, // Termite Egg
                    35: 4, // Evil Ladybug
                    36: 4, // Shiny Ladybug
                    37: 4, // Angelic Ladybug
                    38: 4.5, // Centipede
                    39: 4.5, // Centipede Body
                    40: 4.5, // Desert Centipede
                    41: 4.5, // Desert Centipede Body
                    42: 4.5, // Evil Centipede
                    43: 4.5, // Evil Centipede Body
                    44: 4.5, // Dandelion
                    45: 3, // Sponge
                    46: 4, // Bubble
                    47: 3.25, // Shelll
                    48: 5.25, // Starfish
                    49: 3.35, // Leech
                    50: 3, // Maggot
                    51: 5.25, // Firefly
                    52: 4, // Bumblebee
                    53: 4.5, // Moth
                    54: 4.5, // Fly
                    55: 4, // Square
                    56: 4, // Triangle
                    57: 4, // Pentagon
                    58: 4, // Hell Beetle
                    59: 5.5, // Hell Spider
                    60: 4, // Hell Yellowjacket
                    61: 4.5, // Termite Overmind Egg
                    62: 4, // Spirit
                    63: 4, // Wasp
                    64: 6.5, // Stickbug
                    65: 4, // Hell Beetle
                    66: 4.5, // Hell Centipede
                    67: 4.5, // Hell Centipede Body
                    68: 4, // Wilt
                    69: 4, // Wilt Branch
                    70: 4, // Pumpkin
                    71: 4, // Jack O Lantern
                    72: 4.5, // Crab
                    73: 4.5, // Tank

                    255: 4, // Bot
                }

                let scale = indexScales[entity.index] ? boxSize / indexScales[entity.index] : boxSize / defaultIconSize

                ctx.scale(scale, scale);
                if (entity.index !== 255) {
                    if (entity.index !== 46 && entity.index !== 49 && entity.index !== 55) {
                        ctx.rotate(-Math.PI / 4);
                    }
                    drawUIMob(entity.index, entity.rarity, ctx);
                } else {
                    setStyle(colors.crafting, .135, .2, ctx);

                    ctx.beginPath();
                    ctx.arc(0, 0, 1, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.stroke();
                    drawFace(.35, -Math.PI / 4, 1.7, 1.7, 1, false, ctx);
                }

                ctx.restore();

                ctx.beginPath();
                ctx.roundRect(x, y, boxSize, boxSize, 5);
                ctx.stroke();

                if (entity.count > 1) {
                    ctx.save();
                    ctx.textAlign = "right";
                    ctx.textBaseline = "top";
                    text(`x${entity.count}`, x + boxSize + 6, y - 5, boxSize * .275, colors.white, ctx);
                    ctx.restore();
                }
            });
        });
    }

    if (net.state.waveInfo !== null) { // Wave info
        ctx.textBaseline = "middle";
        text("Wave " + net.state.waveInfo.wave, width / 2, 30, 35);
        drawBar(width / 2 - 200, width / 2 + 200, 65, 30, colors["???"]);
        drawBar(width / 2 - 200, width / 2 - 200 + 400 * (net.state.waveInfo.livingMobs / net.state.waveInfo.maxMobs), 65, 22.5, mixColors(BIOME_BACKGROUNDS[net.state.room.biome].color, colors.white, .2));
        text(net.state.waveInfo.livingMobs + " / " + net.state.waveInfo.maxMobs, width / 2, 65, 22.5);
        if (net.state.waveInfo.aliveMobs) {
            if (JSON.stringify(net.state.aliveMobs2) !== JSON.stringify(net.state.waveInfo.aliveMobs)) {
                drawIconsToOffscreen(net.state.waveInfo.aliveMobs);
                net.state.aliveMobs2 = JSON.parse(JSON.stringify(net.state.waveInfo.aliveMobs));
            }

            ctx.drawImage(mobIconCanvas, 0, 0);

            const mX = mouse.x / uiScale();
            const mY = mouse.y / uiScale();

            net.state.mobHover = null;

            net.state.iconStuff.forEach(hit => {
                if (mX > hit.x && mX < hit.x + hit.size && mY > hit.y && mY < hit.y + hit.size) {
                    net.state.mobHover = [
                        hit.index,
                        hit.rarity,
                        hit.x + hit.size / 2 - 350 / 2,
                        hit.y + hit.size + 10
                    ];
                }
            });
        }
    }

    if (net.state.socket?.readyState === WebSocket.OPEN) {
        if (!isHalloween || net.state.room.biome !== BIOME_TYPES.HALLOWEEN) { // Minimap
            const doTerrain = net.state.terrain?.blocks?.length > 0;
            const biggestSize = doTerrain ? 275 : Math.abs(1 - net.state.room.width / net.state.room.height) < .1 ? 150 : 200;
            const bigger = Math.max(net.state.room.width, net.state.room.height);
            const mapWidth = net.state.room.width / bigger * biggestSize;
            const mapHeight = net.state.room.height / bigger * biggestSize;

            const x = width - mapWidth - 10;
            const y = height - mapHeight - 10;

            if (doTerrain) {
                ctx.drawImage(net.state.minimapImg, x, y, mapWidth, mapHeight);
            } else {
                ctx.fillStyle = BIOME_BACKGROUNDS[net.state.room.biome].color;
                ctx.strokeStyle = "#444444";
                ctx.lineWidth = 5;
                ctx.beginPath();

                if (net.state.room.isRadial) {
                    ctx.arc(x + mapWidth / 2, y + mapHeight / 2, mapWidth / 2, 0, Math.PI * 2);
                } else {
                    ctx.roundRect(x, y, mapWidth, mapHeight, 10);
                }

                ctx.fill();
                ctx.stroke();
            }

            ctx.fillStyle = doTerrain ? colors.peaGreen : colors.playerYellow;
            ctx.beginPath();
            ctx.arc(
                net.state.camera.x / net.state.room.width * mapWidth + x + mapWidth / 2,
                net.state.camera.y / net.state.room.height * mapHeight + y + mapHeight / 2,
                biggestSize * (doTerrain ? .0225 : .025), 0, Math.PI * 2
            );
            ctx.fill();
        }

        { // Level
            net.state.levelProgress = lerp(net.state.levelProgress, net.state.levelProgressTarget, .1);

            if (net.state.levelProgressTarget < net.state.levelProgress || isNaN(net.state.levelProgress)) {
                net.state.levelProgress = 0;
            }

            const player = net.state.players.get(net.state.playerID);
            drawBar(50, 275, 175, 37.5, colors["???"]);

            ctx.save();
            ctx.translate(50, 175);
            ctx.beginPath();
            ctx.arc(0, 0, 35, 0, Math.PI * 2);
            setStyle(colors.playerYellow, 4, .2, ctx);
            ctx.fill();
            ctx.stroke();

            if (player) {
                drawFace(13, player.facing, player.mood, player.mouthDip, player.attack ? 2 : player.defend ? 3 : 1);
                drawBar(70, 70 + 155 * player.secondaryHealthBar, 0, 25, colors.legendary);
                drawBar(70, 70 + 155 * player.healthRatio, 0, 27.5, player.poisoned ? mixColors(colors.common, colors.irisPurple, .5 + Math.sin(performance.now() / 333 + player.id * 3) * .5) : colors.common);
                drawBar(70, 70 + 155 * player.shieldRatio, 0, 22.5, colors.white);
                cuteLittleAnimations.nameText = lerp(cuteLittleAnimations.nameText, 197.5, .1);
            } else {
                drawFace(13, 0, 1, .6, 1, true);
                cuteLittleAnimations.nameText = lerp(cuteLittleAnimations.nameText, 180, .1);
            }

            ctx.restore();

            text(net.state.username, cuteLittleAnimations.nameText, 175, 20);

            drawBar(175, 275, 210, 22.5, colors["???"]);
            drawBar(175, 175 + 100 * net.state.levelProgress, 210, 15, colors.playerYellow);
            text("Level " + net.state.level, 225, 210, 12);
        }
    }

    if (net.state.alivePlayers && net.state.alivePlayers.length > 0) { // Leaderboard
        const spacing = 35;
        const barMaxWidth = 180;
        let x = width - barMaxWidth - 30;
        let y = 175;

        const playersSorted = [...net.state.alivePlayers].sort((a, b) => b.xp - a.xp).slice(0, 10);

        const maxXp = playersSorted[0].xp;

        playersSorted.forEach(player => {
            const barWidth = maxXp > 0 ? (player.xp / maxXp) * barMaxWidth : barMaxWidth;
            const barSize = 35;
            const color = [colors.playerYellow, colors.team1, colors.team2][player.team] ?? colors.crafting;

            ctx.textAlign = "left";
            ctx.textBaseline = "middle";

            drawBar(x, x + barMaxWidth, y, barSize, colors.lighterBlack);
            drawBar(x, x + barWidth, y, barSize * 0.75, color);

            let w = x + text(`${player.username} - ${formatLargeNumber(player.xp.toFixed(2))}`, x, y, barSize * 0.5, colors.white);
            w += text(` (${net.state.tiers[player.highestRarity].name.charAt(0)}.)`, w, y, barSize * 0.5, net.state.tiers[player.highestRarity].color);


            x -= 45
            setStyle(color, 4);
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            ctx.translate(x, y)
            drawFace(7, -Math.PI / 4, 1.7, 1.7, 1);
            ctx.translate(-x, -y)

            y += spacing + 15;
            x += 45
        });
    }

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (net.state.inventoryDirty) {
        if (menu.classList.contains("active")) {
            drawInventory();
        }
        net.state.inventoryDirty = false;
    }

    if (menu.classList.contains("active") && net.state.petalElements) {
        net.state.petalElements.forEach(petal => {
            const rect = petal.icon.getBoundingClientRect();
            const menuRect = menu.getBoundingClientRect();
            const mouseX = mouse.x / window.devicePixelRatio;
            const mouseY = mouse.y / window.devicePixelRatio;
            if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
                // net.state.petalHover = [petal.index, petal.rarity, x, y];
                if (!inventoryDragConfig.enabled && !dragConfig.enabled && !joystick.on && mouse.left && rect.y > menuRect.top) {
                    beginInventoryDragDrop(
                        rect.x * 1.1 / uScale,
                        rect.y * 1.1 / uScale,
                        rect.width,
                        petal.index,
                        petal.rarity
                    );
                    menu.classList.toggle("active");
                    inventoryDragConfig.index = petal.index;
                    inventoryDragConfig.rarity = petal.rarity;
                    inventoryDragConfig.item.stableSize = rect.width;
                    inventoryDragConfig.onDrop = () => {
                        processInventoryDrop();
                        menu.classList.toggle("active");
                    };
                }
            }
        });
    }

    ctx.restore();

    { // Hovers
        net.state.petalHoverAlpha ??= 0;
        net.state.lastPetalHover ??= null;

        if (net.state.petalHover !== null) {
            net.state.lastPetalHover = [...net.state.petalHover];
            net.state.petalHoverAlpha += .25;
        } else {
            net.state.petalHoverAlpha -= .25;
        }

        net.state.petalHoverAlpha = Math.max(0, Math.min(1, net.state.petalHoverAlpha));

        if (net.state.lastPetalHover) {
            ctx.save();
            const img = petalTooltip(...net.state.lastPetalHover);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            if (net.state.petalHoverAlpha > 0) {
                ctx.globalAlpha = net.state.petalHoverAlpha;
                let bw = 350;
                let bh = 350 * img.height / img.width;

                let x = net.state.lastPetalHover[2] - 150;
                let y = net.state.lastPetalHover[3] - bh - 10;

                x = Math.max(0, Math.min(x, width - bw));

                ctx.drawImage(img, x, y, bw, bh);
            }

            ctx.restore();

            if (net.state.petalHoverAlpha === 0) {
                net.state.lastPetalHover = null;
            }
        }

        net.state.mobHoverAlpha ??= 0;
        net.state.lastMobHover ??= null;

        if (net.state.mobHover !== null) {
            net.state.lastMobHover = [...net.state.mobHover];
            net.state.mobHoverAlpha += .25;
        } else {
            net.state.mobHoverAlpha -= .25;
        }

        net.state.mobHoverAlpha = Math.max(0, Math.min(1, net.state.mobHoverAlpha));

        if (net.state.lastMobHover) {
            ctx.save();
            const img = mobTooltip(...net.state.lastMobHover);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            if (net.state.mobHoverAlpha > 0) {
                ctx.globalAlpha = net.state.mobHoverAlpha;
                let bw = 350;
                let bh = -350 * img.height / img.width;

                let x = net.state.lastMobHover[2];
                let y = net.state.lastMobHover[3] - bh;

                x = Math.max(0, Math.min(x, width - bw));

                ctx.drawImage(img, x, y, bw, bh);
            }

            ctx.restore();

            if (net.state.mobHoverAlpha === 0) {
                net.state.lastMobHover = null;
            }
        }
    }

    updateAndDrawDragDrop(mX, mY);
    updateAndDrawInventoryDragDrop(mX, mY);

    if (net.state.isDead) {
        ctx.fillStyle = "rgba(0, 0, 0, .2)";
        ctx.fillRect(0, 0, width, height);
        text("You died", width / 2, height / 2, 30);
        text(net.state.killMessage, width / 2, height / 2 + 30, 15);
        if (isMobile) {
            text("(Tap anywhere to respawn)", width / 2, height / 2 + 60, 15);
        } else {
            text("(Press Enter to respawn)", width / 2, height / 2 + 60, 15);
        }
    }

    if (options.showDebug) {
        ctx.textAlign = "right";
        ctx.textBaseline = "top";

        text(`C: ${clientDebug.fps} FPS | ${clientDebug.mspt.toFixed(2)} mspt`, width - 10, 10, 15);
        text(`S: ${net.state.updateRate} UPS | ${+net.state.ping.toFixed(2)} ms ping`, width - 10, 25, 15);

        if (net.state.socket) {
            text(`B(I/O): ${net.state.socket.bandWidth.in}/${net.state.socket.bandWidth.out} KB/s`, width - 10, 40, 15);
        } else {
            text("Not connected", width - 10, 40, 15);
        }

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
    }

    ctx.restore();

    if (isMobile) {
        drawButtons(ctx)
    }

    clientDebug.frames++;
    clientDebug.totalTime += performance.now() - start;

    { // Chat
        if (net.state.socket?.readyState !== WebSocket.OPEN) return;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, boxSize, boxSize, 5);

                net.state.iconStuff.push({
                    x, y, size: boxSize,
                    index: entity.index,
                    rarity: entity.rarity,
                    count: entity.count
                });

                setStyle(net.state.tiers[entity.rarity].color, 5, .2, ctx);
                ctx.save();
                ctx.beginPath();
                ctx.roundRect(x, y, boxSize, boxSize, 5);
                ctx.fill();
                ctx.clip();

                ctx.translate(x + boxSize / 2, y + boxSize / 2);

                let indexScales = {
                    0: 4, // Ladybug
                    1: 4, // Rock
                    2: 4, // Bee
                    3: 5.5, // Spider
                    4: 4, // Beetle
                    5: 3, // Leafbug
                    6: 4, // Roach
                    7: 4, // Hornet
                    8: 3.25, // Mantis
                    9: 4, // Pupa
                    10: 3.25, // Sandstorm
                    11: 3.25, // Scorpion
                    12: 3.25, // Demon
                    13: 4, // Jellyfish
                    14: 4, // Cactus
                    15: 6.25, // Baby Ant
                    16: 6.25, // Worker Ant
                    17: 6.25, // Soldier Ant
                    18: 6.25, // Queen Ant
                    19: 4, // Ant Hole
                    20: 6.25, // Baby Fire Ant
                    21: 6.25, // Worker Fire Ant
                    22: 6.25, // Soldier Fire Ant
                    23: 6.25, // Queen Fire Ant
                    24: 4, // Fire Ant Hole
                    25: 6.25, // Baby Termite
                    26: 6.25, // Worker Termite
                    27: 6.25, // Soldier Termite
                    28: 4, // Termite Overmind
                    29: 4, // Termite Mound
                    30: 5.25, // Ant Egg
                    31: 5.25, // Queen Ant Egg
                    32: 5.25, // Fire Ant Egg
                    33: 5.25, // Queen Fire Ant Egg
                    34: 5.25, // Termite Egg
                    35: 4, // Evil Ladybug
                    36: 4, // Shiny Ladybug
                    37: 4, // Angelic Ladybug
                    38: 4.5, // Centipede
                    39: 4.5, // Centipede Body
                    40: 4.5, // Desert Centipede
                    41: 4.5, // Desert Centipede Body
                    42: 4.5, // Evil Centipede
                    43: 4.5, // Evil Centipede Body
                    44: 4.5, // Dandelion
                    45: 3, // Sponge
                    46: 4, // Bubble
                    47: 3.25, // Shelll
                    48: 5.25, // Starfish
                    49: 3.35, // Leech
                    50: 3, // Maggot
                    51: 5.25, // Firefly
                    52: 4, // Bumblebee
                    53: 4.5, // Moth
                    54: 4.5, // Fly
                    55: 4, // Square
                    56: 4, // Triangle
                    57: 4, // Pentagon
                    58: 4, // Hell Beetle
                    59: 5.5, // Hell Spider
                    60: 4, // Hell Yellowjacket
                    61: 4.5, // Termite Overmind Egg
                    62: 4, // Spirit
                    63: 4, // Wasp
                    64: 6.5, // Stickbug
                    65: 4, // Hell Beetle
                    66: 4.5, // Hell Centipede
                    67: 4.5, // Hell Centipede Body
                    68: 4, // Wilt
                    69: 4, // Wilt Branch
                    70: 4, // Pumpkin
                    71: 4, // Jack O Lantern
                    72: 4.5, // Crab
                    73: 4.5, // Tank

                    255: 4, // Bot
                }

                let scale = indexScales[entity.index] ? boxSize / indexScales[entity.index] : boxSize / defaultIconSize

                ctx.scale(scale, scale);
                if (entity.index !== 255) {
                    if (entity.index !== 46 && entity.index !== 49 && entity.index !== 55) {
                        ctx.rotate(-Math.PI / 4);
                    }
                    drawUIMob(entity.index, entity.rarity, ctx);
                } else {
                    setStyle(colors.crafting, .135, .2, ctx);

                    ctx.beginPath();
                    ctx.arc(0, 0, 1, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.stroke();
                    drawFace(.35, -Math.PI / 4, 1.7, 1.7, 1, false, ctx);
                }

                ctx.restore();

                ctx.beginPath();
                ctx.roundRect(x, y, boxSize, boxSize, 5);
                ctx.stroke();

                if (entity.count > 1) {
                    ctx.save();
                    ctx.textAlign = "right";
                    ctx.textBaseline = "top";
                    text(`x${entity.count}`, x + boxSize + 6, y - 5, boxSize * .275, colors.white, ctx);
                    ctx.restore();
                }
            });
        });
    }

    if (net.state.waveInfo !== null) { // Wave info
        ctx.textBaseline = "middle";
        text("Wave " + net.state.waveInfo.wave, width / 2, 30, 35);
        drawBar(width / 2 - 200, width / 2 + 200, 65, 30, colors["???"]);
        drawBar(width / 2 - 200, width / 2 - 200 + 400 * (net.state.waveInfo.livingMobs / net.state.waveInfo.maxMobs), 65, 22.5, mixColors(BIOME_BACKGROUNDS[net.state.room.biome].color, colors.white, .2));
        text(net.state.waveInfo.livingMobs + " / " + net.state.waveInfo.maxMobs, width / 2, 65, 22.5);
        if (net.state.waveInfo.aliveMobs) {
            if (JSON.stringify(net.state.aliveMobs2) !== JSON.stringify(net.state.waveInfo.aliveMobs)) {
                drawIconsToOffscreen(net.state.waveInfo.aliveMobs);
                net.state.aliveMobs2 = JSON.parse(JSON.stringify(net.state.waveInfo.aliveMobs));
            }

            ctx.drawImage(mobIconCanvas, 0, 0);

            const mX = mouse.x / uiScale();
            const mY = mouse.y / uiScale();

            net.state.mobHover = null;

            net.state.iconStuff.forEach(hit => {
                if (mX > hit.x && mX < hit.x + hit.size && mY > hit.y && mY < hit.y + hit.size) {
                    net.state.mobHover = [
                        hit.index,
                        hit.rarity,
                        hit.x + hit.size / 2 - 350 / 2,
                        hit.y + hit.size + 10
                    ];
                }
            });
        }
    }

    if (net.state.socket?.readyState === WebSocket.OPEN) {
        if (!isHalloween || net.state.room.biome !== BIOME_TYPES.HALLOWEEN) { // Minimap
            const doTerrain = net.state.terrain?.blocks?.length > 0;
            const biggestSize = doTerrain ? 275 : Math.abs(1 - net.state.room.width / net.state.room.height) < .1 ? 150 : 200;
            const bigger = Math.max(net.state.room.width, net.state.room.height);
            const mapWidth = net.state.room.width / bigger * biggestSize;
            const mapHeight = net.state.room.height / bigger * biggestSize;

            const x = width - mapWidth - 10;
            const y = height - mapHeight - 10;

            if (doTerrain) {
                ctx.drawImage(net.state.minimapImg, x, y, mapWidth, mapHeight);
            } else {
                ctx.fillStyle = BIOME_BACKGROUNDS[net.state.room.biome].color;
                ctx.strokeStyle = "#444444";
                ctx.lineWidth = 5;
                ctx.beginPath();

                if (net.state.room.isRadial) {
                    ctx.arc(x + mapWidth / 2, y + mapHeight / 2, mapWidth / 2, 0, Math.PI * 2);
                } else {
                    ctx.roundRect(x, y, mapWidth, mapHeight, 10);
                }

                ctx.fill();
                ctx.stroke();
            }

            ctx.fillStyle = doTerrain ? colors.peaGreen : colors.playerYellow;
            ctx.beginPath();
            ctx.arc(
                net.state.camera.x / net.state.room.width * mapWidth + x + mapWidth / 2,
                net.state.camera.y / net.state.room.height * mapHeight + y + mapHeight / 2,
                biggestSize * (doTerrain ? .0225 : .025), 0, Math.PI * 2
            );
            ctx.fill();
        }

        { // Level
            net.state.levelProgress = lerp(net.state.levelProgress, net.state.levelProgressTarget, .1);

            if (net.state.levelProgressTarget < net.state.levelProgress || isNaN(net.state.levelProgress)) {
                net.state.levelProgress = 0;
            }

            const player = net.state.players.get(net.state.playerID);
            drawBar(50, 275, 175, 37.5, colors["???"]);

            ctx.save();
            ctx.translate(50, 175);
            ctx.beginPath();
            ctx.arc(0, 0, 35, 0, Math.PI * 2);
            setStyle(colors.playerYellow, 4, .2, ctx);
            ctx.fill();
            ctx.stroke();

            if (player) {
                drawFace(13, player.facing, player.mood, player.mouthDip, player.attack ? 2 : player.defend ? 3 : 1);
                drawBar(70, 70 + 155 * player.secondaryHealthBar, 0, 25, colors.legendary);
                drawBar(70, 70 + 155 * player.healthRatio, 0, 27.5, player.poisoned ? mixColors(colors.common, colors.irisPurple, .5 + Math.sin(performance.now() / 333 + player.id * 3) * .5) : colors.common);
                drawBar(70, 70 + 155 * player.shieldRatio, 0, 22.5, colors.white);
                cuteLittleAnimations.nameText = lerp(cuteLittleAnimations.nameText, 197.5, .1);
            } else {
                drawFace(13, 0, 1, .6, 1, true);
                cuteLittleAnimations.nameText = lerp(cuteLittleAnimations.nameText, 180, .1);
            }

            ctx.restore();

            text(net.state.username, cuteLittleAnimations.nameText, 175, 20);

            drawBar(175, 275, 210, 22.5, colors["???"]);
            drawBar(175, 175 + 100 * net.state.levelProgress, 210, 15, colors.playerYellow);
            text("Level " + net.state.level, 225, 210, 12);
        }
    }

    if (net.state.alivePlayers && net.state.alivePlayers.length > 0) { // Leaderboard
        const spacing = 35;
        const barMaxWidth = 180;
        let x = width - barMaxWidth - 30;
        let y = 175;

        const playersSorted = [...net.state.alivePlayers].sort((a, b) => b.xp - a.xp).slice(0, 10);

        const maxXp = playersSorted[0].xp;

        playersSorted.forEach(player => {
            const barWidth = maxXp > 0 ? (player.xp / maxXp) * barMaxWidth : barMaxWidth;
            const barSize = 35;
            const color = [colors.playerYellow, colors.team1, colors.team2][player.team] ?? colors.crafting;

            ctx.textAlign = "left";
            ctx.textBaseline = "middle";

            drawBar(x, x + barMaxWidth, y, barSize, colors.lighterBlack);
            drawBar(x, x + barWidth, y, barSize * 0.75, color);

            let w = x + text(`${player.username} - ${formatLargeNumber(player.xp.toFixed(2))}`, x, y, barSize * 0.5, colors.white);
            w += text(` (${net.state.tiers[player.highestRarity].name.charAt(0)}.)`, w, y, barSize * 0.5, net.state.tiers[player.highestRarity].color);


            x -= 45
            setStyle(color, 4);
            ctx.beginPath();
            ctx.arc(x, y, 20, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();

            ctx.translate(x, y)
            drawFace(7, -Math.PI / 4, 1.7, 1.7, 1);
            ctx.translate(-x, -y)

            y += spacing + 15;
            x += 45
        });
    }

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    if (JSON.stringify(net.state.inventory2) !== JSON.stringify(net.state.inventory)) {
        if (menu.classList.contains("active")) {
            drawInventory();
        }
        net.state.inventory2 = JSON.parse(JSON.stringify(net.state.inventory));
    }

    if (menu.classList.contains("active") && net.state.petalElements) {
        net.state.petalElements.forEach(petal => {
            const rect = petal.icon.getBoundingClientRect();
            const menuRect = menu.getBoundingClientRect();
            const mouseX = mouse.x;
            const mouseY = mouse.y;
            if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
                // net.state.petalHover = [petal.index, petal.rarity, x, y];
                if (!inventoryDragConfig.enabled && !dragConfig.enabled && !joystick.on && mouse.left && rect.y > menuRect.top) {
                    beginInventoryDragDrop(
                        rect.x * 1.1 / uScale,
                        rect.y * 1.1 / uScale,
                        rect.width,
                        petal.index,
                        petal.rarity
                    );
                    menu.classList.toggle("active");
                    inventoryDragConfig.index = petal.index;
                    inventoryDragConfig.rarity = petal.rarity;
                    inventoryDragConfig.item.stableSize = rect.width;
                    inventoryDragConfig.onDrop = () => {
                        processInventoryDrop();
                        menu.classList.toggle("active");
                    };
                }
            }
        });
    }

    ctx.restore();

    { // Hovers
        net.state.petalHoverAlpha ??= 0;
        net.state.lastPetalHover ??= null;

        if (net.state.petalHover !== null) {
            net.state.lastPetalHover = [...net.state.petalHover];
            net.state.petalHoverAlpha += .25;
        } else {
            net.state.petalHoverAlpha -= .25;
        }

        net.state.petalHoverAlpha = Math.max(0, Math.min(1, net.state.petalHoverAlpha));

        if (net.state.lastPetalHover) {
            ctx.save();
            const img = petalTooltip(...net.state.lastPetalHover);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            if (net.state.petalHoverAlpha > 0) {
                ctx.globalAlpha = net.state.petalHoverAlpha;
                let bw = 350;
                let bh = 350 * img.height / img.width;

                let x = net.state.lastPetalHover[2] - 150;
                let y = net.state.lastPetalHover[3] - bh - 10;

                x = Math.max(0, Math.min(x, width - bw));

                ctx.drawImage(img, x, y, bw, bh);
            }

            ctx.restore();

            if (net.state.petalHoverAlpha === 0) {
                net.state.lastPetalHover = null;
            }
        }

        net.state.mobHoverAlpha ??= 0;
        net.state.lastMobHover ??= null;

        if (net.state.mobHover !== null) {
            net.state.lastMobHover = [...net.state.mobHover];
            net.state.mobHoverAlpha += .25;
        } else {
            net.state.mobHoverAlpha -= .25;
        }

        net.state.mobHoverAlpha = Math.max(0, Math.min(1, net.state.mobHoverAlpha));

        if (net.state.lastMobHover) {
            ctx.save();
            const img = mobTooltip(...net.state.lastMobHover);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            if (net.state.mobHoverAlpha > 0) {
                ctx.globalAlpha = net.state.mobHoverAlpha;
                let bw = 350;
                let bh = -350 * img.height / img.width;

                let x = net.state.lastMobHover[2];
                let y = net.state.lastMobHover[3] - bh;

                x = Math.max(0, Math.min(x, width - bw));

                ctx.drawImage(img, x, y, bw, bh);
            }

            ctx.restore();

            if (net.state.mobHoverAlpha === 0) {
                net.state.lastMobHover = null;
            }
        }
    }

    updateAndDrawDragDrop(mX, mY);
    updateAndDrawInventoryDragDrop(mX, mY);

    if (net.state.isDead) {
        ctx.fillStyle = "rgba(0, 0, 0, .2)";
        ctx.fillRect(0, 0, width, height);
        text("You died", width / 2, height / 2, 30);
        text(net.state.killMessage, width / 2, height / 2 + 30, 15);
        if (isMobile) {
            text("(Tap anywhere to respawn)", width / 2, height / 2 + 60, 15);
        } else {
            text("(Press Enter to respawn)", width / 2, height / 2 + 60, 15);
        }
    }

    if (options.showDebug) {
        ctx.textAlign = "right";
        ctx.textBaseline = "top";

        text(`C: ${clientDebug.fps} FPS | ${clientDebug.mspt.toFixed(2)} mspt`, width - 10, 10, 15);
        text(`S: ${net.state.updateRate} UPS | ${+net.state.ping.toFixed(2)} ms ping`, width - 10, 25, 15);

        if (net.state.socket) {
            text(`B(I/O): ${net.state.socket.bandWidth.in}/${net.state.socket.bandWidth.out} KB/s`, width - 10, 40, 15);
        } else {
            text("Not connected", width - 10, 40, 15);
        }

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
    }

    ctx.restore();

    if (isMobile) {
        drawButtons(ctx)
    }

    clientDebug.frames++;
    clientDebug.totalTime += performance.now() - start;

    { // Chat
        if (net.state.socket?.readyState !== WebSocket.OPEN) return;
        ctx.save();
        const maxWidth = width * .2;
        const heights = [];
        const messages = net.ChatMessage.messages;
        const msgSize = 18;

        for (let i = 0; i < messages.length; i++) {
            heights.push(drawWrappedText(messages[i].completeMessage, -2048, -2048, msgSize, 270));
        }

        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        let y = canvas.height - 55;

        ctx.fillStyle = "rgba(0, 0, 0, .4)";
        ctx.beginPath();
        ctx.roundRect(-12, -cuteLittleAnimations.chatBGSize - 10, maxWidth + 22, cuteLittleAnimations.chatBGSize + 22, 5);

        if (net.ChatMessage.showInput) {
            const element = net.ChatMessage.element;
            element.style.display = "block";
            element.style.left = `60px`;
            element.style.bottom = `12px`;
            element.style.width = `202px`;
            element.style.height = `7px`;
            element.style.fontSize = `14px`;
            element.style.padding = `10px`;
            element.style.backgroundColor = `white`;
            element.style.border = "4px solid black";

            const overlayX = 66;
            const overlayY = canvas.height - 455;
            const overlayWidth = 250;
            const overlayHeight = 400;

            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.beginPath();
            ctx.roundRect(overlayX, overlayY, overlayWidth, overlayHeight, 4);
            ctx.fill();

            ctx.textAlign = "left";
            ctx.textBaseline = "top";

            let y = overlayY + overlayHeight - 3;

            for (let i = net.ChatMessage.allMessages.length - 1; i >= 0; i--) {
                const msg = net.ChatMessage.allMessages[i];
                let msgHeight;

                switch (msg.type) {
                    case 0: // Chat
                        const nameWidth = text(msg.username, overlayX + 7, 50000, 14, msg.color);
                        msgHeight = drawWrappedText(": " + msg.message, overlayX + 7 + nameWidth, 50000, 14, overlayWidth - 20 - nameWidth, "#FFFFFF", ctx, 73);
                        msgHeight = Math.max(msgHeight, 14);
                        break;
                    case 1: // System
                        msgHeight = drawWrappedText(msg.message, overlayX + 7, 50000, 14, overlayWidth - 20, msg.color, ctx, 73);
                        break;
                }

                y -= msgHeight + 3;

                if (y < overlayY + 7) {
                    net.ChatMessage.allMessages.splice(i, 1);
                    continue;
                }

                switch (msg.type) {
                    case 0:
                        const nameWidth2 = text(msg.username, overlayX + 7, y, 14, msg.color);
                        drawWrappedText(": " + msg.message, overlayX + 7 + nameWidth2, y, 14, overlayWidth - 20 - nameWidth2, "#FFFFFF", ctx, 73);
                        break;
                    case 1:
                        drawWrappedText(msg.message, overlayX + 7, y, 14, overlayWidth - 20, msg.color, ctx, 73);
                        break;
                }
            }
        } else {
            ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
            ctx.beginPath();
            ctx.roundRect(66, canvas.height - 51, 252, 38, 5);
            ctx.fill();
            net.ChatMessage.element.style.display = "none";
            text("Press Enter to open chat", 81, canvas.height - 31, 14);
        }

        ctx.textBaseline = "top";
        y -= heights[heights.length - 1];

        if (!net.ChatMessage.showInput) {
            for (let i = messages.length - 1; i >= 0; i--) {
                const message = messages[i];

                message.y = lerp(message.y, y, .2);
                message.ticker++;

                if (message.ticker > (clientDebug.fps * 15) - messages.length * 2) {
                    net.ChatMessage.messages.splice(i, 1);
                    continue;
                }

                switch (message.type) {
                    case 0: // Chat
                        const nameWidth = text(message.username, 66, message.y, 15, message.color);
                        drawWrappedText(": " + message.message, nameWidth + 66, message.y, 15, 235, "#FFFFFF", ctx, 66);
                        break;
                    case 1: // System
                        drawWrappedText(message.message, 66, message.y, 15, 235, message.color, ctx, 66);
                        break;
                }

                if (i > 0) {
                    y -= heights[i - 1];
                    y -= 2.5;
                }
            }
        }

        ctx.restore();
    }
}

draw();

if (isHalloween) {
    document.getElementById("biomeSelect").appendChild(new Option("Halloween", "halloween"));
}

document.getElementById("usernameInputInput").value = localStorage.getItem("username") || "guest";
document.getElementById("gamemodeSelect").value = localStorage.getItem("gamemode") || "ffa";
document.getElementById("biomeSelect").value = localStorage.getItem("biome") || "default";
document.getElementById("enableMods").checked = localStorage.getItem("enableMods") === "true";
document.getElementById("privateLobby").checked = localStorage.getItem("privateLobby") === "true";

showMenus();
loadAndRenderChangelogs();

async function getUserFromSession() {
    try {
        const res = await fetch(`${process.env.AUTH_SERVER}/api/me`, {
            method: "GET",
            credentials: "include",
            headers: { "Accept": "application/json" }
        });

        if (!res.ok) throw new Error("Not logged in");

        const user = await res.json();
        console.log("Logged in as:", user.username + "#" + user.discriminator);
        return user;
    } catch (e) {
        console.error(e)
        console.log("Not logged in");
        return null;
    }
}

// Call it anywhere
getUserFromSession();