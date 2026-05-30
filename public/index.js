import {
  canvas,
  ctx,
  drawBackground,
  drawBackgroundOverlay,
  drawBar,
  drawFace,
  drawWrappedText,
  gameScale,
  mixColors,
  setStyle,
  text,
  uiScale,
} from "./lib/canvas.js";
import * as net from "./lib/net.js";
import { mouse, keyMap } from "./lib/net.js";
import {
  colors,
  isHalloween,
  lerp,
  options,
  SERVER_URL,
  shakeElement,
  formatLargeNumber,
} from "./lib/util.js";
import {
  BIOME_BACKGROUNDS,
  BIOME_TYPES,
  DEV_CHEAT_IDS,
  SERVER_BOUND,
  terrains,
  WEARABLES,
} from "./lib/protocol.js";
import {
  drawMob,
  drawUIMob,
  drawPetal,
  getPetalIcon,
  drawUIPetal,
  petalTooltip,
  mobTooltip,
  drawThirdEye,
  drawAntennae,
  pentagram,
  drawAmulet,
  drawPetalIconWithRatio,
  drawArmor,
} from "./lib/renders.js";
import {
  beginDragDrop,
  beginInventoryDragDrop,
  DRAG_TYPE_DESTROY,
  DRAG_TYPE_MAINDOCKER,
  DRAG_TYPE_SECONDARYDOCKER,
  dragConfig,
  inventoryDragConfig,
  updateAndDrawDragDrop,
  updateAndDrawInventoryDragDrop,
} from "./lib/dragAndDrop.js";
import { loadAndRenderChangelogs, showMenu, showMenus } from "./lib/menus.js";
import "./lib/craftMenu.js";

if (location.hash) {
  fetch(SERVER_URL + "/lobby/get?partyURL=" + location.hash.slice(1))
    .then((response) => response.json())
    .then((json) => {
      if (json == null) {
        console.warn("Invalid party URL");
        location.hash = "";
        history.replaceState(null, null, location.pathname + location.search);
      } else {
        getUsername().then(async (u) => {
          const res = await fetch(
            SERVER_URL + "/lobby/get?partyURL=" + location.hash.slice(1),
          );
          const text = await res.text();

          if (text == "null") {
            alert("Invalid party URL");
            location.hash = "";
            history.replaceState(
              null,
              null,
              location.pathname + location.search,
            );
            return;
          }

          const lobby = JSON.parse(text);

          net.beginState(
            location.hash.slice(1),
            u,
            lobby.directConnect
              ? location.protocol.replace("http", "ws") +
                  "//" +
                  lobby.directConnect.address
              : SERVER_URL.replace("http", "ws"),
          );
        });
      }
    })
    .catch(() => {
      console.warn("Invalid party URL");
      location.hash = "";
      history.replaceState(null, null, location.pathname + location.search);
    });
}

document.getElementById("lobbyName").value =
  "Lobby " + Math.floor(Math.random() * 1000);

function refreshLobbies() {
  const lobbiesDisplay = document.getElementById("lobbiesDisplay");
  lobbiesDisplay.innerHTML = "<span>Loading...</span>";
  net.findLobbies().then((lobbies) => {
    lobbiesDisplay.innerHTML = "";
    lobbies.forEach((lobby) => {
      const element = document.createElement("div");
      element.textContent =
        lobby.name +
        " (" +
        BIOME_BACKGROUNDS[lobby.biome].name +
        " " +
        lobby.gamemode +
        ")";

      if (lobby.isModded) {
        element.textContent += " (modded)";
      }

      if (lobby.trusted) {
        element.style.color = colors.playerYellow;
        element.textContent += " (trusted)";
      }

      element.onclick = () => {
        getUsername().then((username) => {
          net.beginState(
            lobby.partyCode,
            username,
            lobby.directConnect
              ? location.protocol.replace("http", "ws") +
                  "//" +
                  lobby.directConnect.address
              : SERVER_URL.replace("http", "ws"),
          );
        });
      };

      lobbiesDisplay.appendChild(element);
    });
  });
}

document.getElementById("refreshLobbies").onclick = refreshLobbies;

function changeMenu(activeMenuID) {
  document.querySelectorAll(".preMenu").forEach((menu) => {
    menu.classList.remove("active");

    if (menu.id === activeMenuID) {
      menu.classList.add("active");

      if (activeMenuID === "findLobbies") {
        refreshLobbies();
      }
    }
  });
}

document.querySelectorAll("button").forEach((button) => {
  if (button.dataset.switchmenu) {
    button.onclick = () => changeMenu(button.dataset.switchmenu);
  }
});

async function getUsername() {
  changeMenu("usernameInput");

  return new Promise((resolve) => {
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

  if (
    lobbyName.value.length < 3 ||
    lobbyName.value.length > 32 ||
    !/^[a-zA-Z0-9 ]+$/.test(lobbyName.value)
  ) {
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
  const server = await net.createServer(
    lobbyName.value,
    gamemodeSelect.value,
    enableMods.checked,
    privateLobby.checked,
    biomeSelect.value,
  );
  document.getElementById("createLobbyButton").disabled = false;

  if (!server.ok) {
    alert(server.error);
    hasCreatedLobby = false;
    return;
  }

  const username = await getUsername();
  localStorage.setItem("username", username);

  net.beginState(server.party, username);
};

let lastFlag = 0,
  mouseX = 0,
  mouseY = 0;

canvas.addEventListener("touchstart", (e) => {
  const touch = e.touches[0];
  mouse.x = touch.clientX;
  mouse.y = touch.clientY;
  mouse.left = true;
});

canvas.addEventListener("touchmove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const touch = e.touches[0];
  mouse.x = (touch.clientX - rect.left) * scaleX;
  mouse.y = (touch.clientY - rect.top) * scaleY;
});

canvas.addEventListener("touchend", (e) => {
  mouse.left = false;
});

const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
  navigator.userAgent,
);

export let joystick = {
  on: false,
  pointerId: null,
  baseX: 250,
  baseY: null,
  stickX: 250,
  stickY: null,
  radius: 200,
  angle: 0,
  distance: 0,
};
export let attackButton = {
  on: false,
  pointerId: null,
  x: canvas.width - 250,
  y: canvas.height - 500,
  radius: 125,
};
export let defendButton = {
  on: false,
  pointerId: null,
  x: canvas.width - 250,
  y: canvas.height - 250,
  radius: 125,
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
  ctx.globalAlpha = 0.2;
  ctx.beginPath();
  ctx.arc(joystick.baseX, joystick.baseY, joystick.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#000000";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(
    joystick.stickX,
    joystick.stickY,
    joystick.radius / 2,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.globalAlpha = attackButton.on ? 0.5 : 0.2;
  ctx.beginPath();
  ctx.arc(attackButton.x, attackButton.y, attackButton.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.globalAlpha = 0.7;
  text("A", attackButton.x, attackButton.y, 100, colors.white, ctx, 0.00001);
  ctx.globalAlpha = 1;

  ctx.globalAlpha = defendButton.on ? 0.5 : 0.2;
  ctx.beginPath();
  ctx.arc(defendButton.x, defendButton.y, defendButton.radius, 0, Math.PI * 2);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.globalAlpha = 0.7;
  text("B", defendButton.x, defendButton.y, 100, colors.white, ctx, 0.00001);
  ctx.globalAlpha = 1;
}

canvas.addEventListener("touchstart", (e) => {
  if (
    mouse.left &&
    net.state.isDead &&
    net.state.socket?.readyState === WebSocket.OPEN
  ) {
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

canvas.addEventListener("touchmove", (e) => {
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

canvas.addEventListener("touchend", (e) => {
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

  if (keyMap.has(" ") || attackButton.on || (mouse.left && !isMobile)) {
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
window.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !net.ChatMessage.showInput && !net.state.isDead) {
    net.ChatMessage.showInput = !net.ChatMessage.showInput;

    setTimeout(() => {
      if (net.ChatMessage.showInput) {
        net.ChatMessage.element.focus();
      }
    }, 250);
  }

  if (
    net.ChatMessage.showInput &&
    net.ChatMessage.element === document.activeElement
  ) {
    if (e.key === "Enter") {
      net.ChatMessage.send();
    }

    return;
  }

  if (
    e.keyCode === 13 &&
    net.state.isDead &&
    net.state.socket?.readyState === WebSocket.OPEN
  ) {
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
        net.state.socket.talk(
          SERVER_BOUND.DEV_CHEAT,
          DEV_CHEAT_IDS.CHANGE_TEAM,
        );
        break;
      case "r":
        if (net.state.socket?.readyState === WebSocket.OPEN) {
          for (let i = 0; i < net.state.slots.length; i++) {
            if (
              net.state.slots[i].index > -1 &&
              net.state.secondarySlots[i]?.index > -1
            ) {
              net.state.socket.talk(SERVER_BOUND.CHANGE_LOADOUT, {
                drag: {
                  type: net.state.isInDestroy
                    ? DRAG_TYPE_SECONDARYDOCKER
                    : DRAG_TYPE_MAINDOCKER,
                  index: i,
                },
                drop: {
                  type: net.state.isInDestroy
                    ? DRAG_TYPE_DESTROY
                    : DRAG_TYPE_SECONDARYDOCKER,
                  index: i,
                },
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

      if (
        net.state.socket?.readyState === WebSocket.OPEN &&
        index < net.state.slots.length &&
        net.state.slots[index].index > -1 &&
        net.state.secondarySlots[index]?.index > -1
      ) {
        net.state.socket.talk(SERVER_BOUND.CHANGE_LOADOUT, {
          drag: {
            type: net.state.isInDestroy
              ? DRAG_TYPE_SECONDARYDOCKER
              : DRAG_TYPE_MAINDOCKER,
            index,
          },
          drop: {
            type: net.state.isInDestroy
              ? DRAG_TYPE_DESTROY
              : DRAG_TYPE_SECONDARYDOCKER,
            index,
          },
        });
      }
    }

    keyMap.add(e.key.toLowerCase());

    processInputs();
  }
});

window.addEventListener("keyup", (e) => {
  keyMap.delete(e.key.toLowerCase());

  if (e.key === "k") {
    net.state.isInDestroy = false;
  }

  if (net.state.socket?.readyState === WebSocket.OPEN) {
    processInputs();
  }
});

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX * window.devicePixelRatio;
  mouse.y = e.clientY * window.devicePixelRatio;

  if (options.mouseMovement) {
    processInputs();
  }
});

window.addEventListener("mousedown", (e) => {
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

window.addEventListener("mouseup", (e) => {
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
    index: dragConfig.index,
  };

  let drop = null;

  const mX = mouse.x / uiScale();
  const mY = mouse.y / uiScale();

  for (let i = 0; i < net.state.slots.length; i++) {
    const slot = net.state.slots[i];

    if (
      slot.icon &&
      slot.icon.x < mX &&
      slot.icon.x + slot.icon.size > mX &&
      slot.icon.y < mY &&
      slot.icon.y + slot.icon.size > mY
    ) {
      drop = {
        type: DRAG_TYPE_MAINDOCKER,
        index: i,
      };
      break;
    }
  }

  if (drop === null) {
    for (let i = 0; i < net.state.secondarySlots.length; i++) {
      const slot = net.state.secondarySlots[i];

      if (
        slot.icon &&
        slot.icon.x < mX &&
        slot.icon.x + slot.icon.size > mX &&
        slot.icon.y < mY &&
        slot.icon.y + slot.icon.size > mY
      ) {
        drop = {
          type: DRAG_TYPE_SECONDARYDOCKER,
          index: i,
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
      rarity: 0,
    };
    drop = {
      type: 2,
      index: dragConfig.index,
      rarity: 0,
      petalIndex: 0,
    };
    net.state.socket.talk(SERVER_BOUND.INVENTORY_CHANGE_LOADOUT, {
      drag,
      drop,
    });
    return true;
  }

  if (drop === null || (drop.type === drag.type && drop.index === drag.index)) {
    return false;
  }

  if (
    drag.type === DRAG_TYPE_MAINDOCKER &&
    drop.type === DRAG_TYPE_SECONDARYDOCKER
  ) {
    return false;
  }

  if (drag.type === DRAG_TYPE_MAINDOCKER && drop.type === DRAG_TYPE_DESTROY) {
    return false;
  }

  net.state.socket.talk(SERVER_BOUND.CHANGE_LOADOUT, { drag, drop });

  return true;
}

function formatAmount(v) {
  if (!isFinite(v)) return "∞";
  if (isNaN(v)) return "0";

  const f = (num, div, suffix) => {
    const val = num / div;
    if (!isFinite(val)) return "∞";

    const str = val.toFixed(1);
    return str.endsWith(".0") ? Math.floor(val) + suffix : str + suffix;
  };

  if (v >= 1e18) return f(v, 1e18, "Qt");
  if (v >= 1e15) return f(v, 1e15, "Qd");
  if (v >= 1e12) return f(v, 1e12, "t");
  if (v >= 1e9) return f(v, 1e9, "b");
  if (v >= 1e6) return f(v, 1e6, "m");
  if (v >= 1e3) return f(v, 1e3, "k");

  return Math.floor(v).toString();
}

function processInventoryDrop() {
  const drag = {
    index: inventoryDragConfig.index,
    rarity: inventoryDragConfig.rarity,
  };

  let drop = null;

  const mX = mouse.x / uiScale();
  const mY = mouse.y / uiScale();

  for (let i = 0; i < net.state.slots.length; i++) {
    const slot = net.state.slots[i];

    if (
      slot.icon &&
      slot.icon.x < mX &&
      slot.icon.x + slot.icon.size > mX &&
      slot.icon.y < mY &&
      slot.icon.y + slot.icon.size > mY
    ) {
      drop = {
        type: DRAG_TYPE_MAINDOCKER,
        index: i,
        rarity: slot.rarity,
        petalIndex: slot.index,
      };
      break;
    }
  }

  if (drop === null) {
    for (let i = 0; i < net.state.secondarySlots.length; i++) {
      const slot = net.state.secondarySlots[i];

      if (
        slot.icon &&
        slot.icon.x < mX &&
        slot.icon.x + slot.icon.size > mX &&
        slot.icon.y < mY &&
        slot.icon.y + slot.icon.size > mY
      ) {
        drop = {
          type: DRAG_TYPE_SECONDARYDOCKER,
          index: i,
          rarity: slot.rarity ?? 255,
          petalIndex: slot.index === -1 ? 255 : slot.index,
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
  totalTime: 0,
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
  chatBGSize: 0,
};

const buttonsContainer = document.getElementById("menus2");
const menu = buttonsContainer.children.item("inventory");

const inventoryTooltipLayer = document.createElement("div");
inventoryTooltipLayer.style.position = "fixed";
inventoryTooltipLayer.style.left = "0";
inventoryTooltipLayer.style.top = "0";
inventoryTooltipLayer.style.width = "100vw";
inventoryTooltipLayer.style.height = "100vh";
inventoryTooltipLayer.style.pointerEvents = "none";
inventoryTooltipLayer.style.zIndex = "999999";
inventoryTooltipLayer.style.overflow = "visible";
inventoryTooltipLayer.style.display = "none";

document.body.appendChild(inventoryTooltipLayer);

function drawInventory() {
  net.state.petalElements = [];
  menu.innerHTML = "";

  if (!net.state.inventory) {
    menu.textContent = "Your inventory is empty :(";
    return;
  }

  let inventoryEmpty = true;
  Object.values(net.state.inventory).forEach((tier) => {
    if (Object.values(tier).some((count) => count > 0)) {
      inventoryEmpty = false;
    }
  });

  if (inventoryEmpty) {
    menu.textContent = "Your inventory is empty :(";
    return;
  }

  const petal = document.createElement("div");
  petal.style.display = "flex";
  petal.style.flexWrap = "wrap";
  petal.style.padding = "0px";
  petal.style.gap = "5px";
  menu.appendChild(petal);

  const petalSize = 56;

  let sortedTiers = Object.entries(net.state.inventory).sort(([a], [b]) => {
    const aIndex = net.state.tiers.findIndex((t) => t.name === a);
    const bIndex = net.state.tiers.findIndex((t) => t.name === b);
    return bIndex - aIndex;
  });

  sortedTiers.forEach(([tierName, petals]) => {
    const rarityIndex = net.state.tiers.findIndex((t) => t.name === tierName);

    Object.entries(petals)
      .sort(([a], [b]) => {
        const aName = net.state.petalConfigs[Number(a)].name;
        const bName = net.state.petalConfigs[Number(b)].name;
        return aName.localeCompare(bName);
      })
      .forEach(([petalIndex, count]) => {
        if (count <= 0) return;

        const petalCanvas = getPetalIcon(
        Number(petalIndex),
        rarityIndex,
        "oneshot"
        );

        const icon = document.createElement("canvas");

        icon.addEventListener("pointerenter", (ev) => {
          const r = ev.currentTarget.getBoundingClientRect();
          net.state.inventoryPetalHover = [
            Number(petalIndex),
            rarityIndex,
            r.left + r.width / 2,
            r.top + r.height / 2,
          ];
        });

        icon.addEventListener("pointermove", (ev) => {
          const r = ev.currentTarget.getBoundingClientRect();
          net.state.inventoryPetalHover = [
            Number(petalIndex),
            rarityIndex,
            r.left + r.width / 2,
            r.top + r.height / 2,
          ];
        });

        icon.addEventListener("pointerleave", () => {
          net.state.inventoryPetalHover = null;
        });

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
          c.font = `bold ${petalSize * 0.25}px Ubuntu`;
          c.textAlign = "right";
          c.textBaseline = "top";

          const text = count >= 1e6 ? "x" + (count / 1e6).toFixed(1).replace(/\.0$/, "") + " million" : `x${formatAmount(count)}`;
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

window.addEventListener("keydown", (e) => {
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

function hashAliveMobs(list) {
  const grouped = {};

  for (const m of list) {
    const key = m.index + "_" + m.rarity;
    grouped[key] = (grouped[key] || 0) + 1;
  }

  let h = 0;

  for (const key in grouped) {
    const [index, rarity] = key.split("_").map(Number);
    const count = grouped[key];

    h = (h * 31 + index) | 0;
    h = (h * 31 + rarity) | 0;
    h = (h * 31 + count) | 0;
  }

  return h;
}

const mobIconCanvas = document.createElement("canvas");
const mobIconCtx = mobIconCanvas.getContext("2d");

// Mob icons gradient
const WAVE_CACHE = (globalThis.__WAVE_CACHE__ ||= Object.create(null));

function getGradientMinRarity() {
  return options.minimumGradientRarity;
}

const GLOW_PARTICLE_COUNT = 3;
const GLOW_PARTICLE_MARGIN = 28;
const GLOW_PARTICLE_SPEED = 0.011;

function rand01(n) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function wavesGradientOn() {
  return !options.disableGradients;
}

function wavesTierVisual(t) {
  const tierData = net.state.tiers?.[t] ?? {};
  return (
    globalThis.__CUSTOM_GRADIENTS?.[t] ||
    tierData.gradient ||
    tierData.gradient_2 ||
    {}
  );
}

function drawWaveMobIcon(ctx, entry) {
  if (entry.index === 255) {
    setStyle(colors.crafting, 0.135, 0.2, ctx);
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    drawFace(0.35, -Math.PI / 4, 1.7, 1.7, 1, false, ctx);
    return;
  }

  if (![46, 49, 55].includes(entry.index)) {
    ctx.rotate(-Math.PI / 4);
  }

  drawUIMob(entry.index, entry.rarity, ctx);
}

function makeWaveIcon(entry, mode, key) {
  const size = Math.ceil(entry.size + 12);
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext("2d");

  function render(now, entryOverride) {
    const e = entryOverride || entry;
    now = Number.isFinite(now) ? now : performance.now();

    const a = e.size;
    const g = 6;
    const u = 6;
    const r = 5;

    const base = net.state.tiers?.[entry.rarity]?.color ?? "#ffffff";
    const cx = g + a / 2;
    const cy = u + a / 2;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(g, u, a, a, r);

    const fill = wavesFillStyle(ctx, entry.rarity, base, null, now, g, u, a);

    if (fill !== null) {
      ctx.fillStyle = fill;
      ctx.fill();
    }

    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(g, u, a, a, r);
    ctx.clip();

    drawGlowParticles(ctx, entry.rarity, a, g, u, a, a, r, now);

    ctx.translate(cx, cy);

    const m = {
      0: 4,
      1: 4,
      2: 4,
      3: 5.5,
      4: 4,
      5: 3,
      6: 4,
      7: 4,
      8: 3.25,
      9: 4,
      10: 3.25,
      11: 3.25,
      12: 3.25,
      13: 4,
      14: 4,
      15: 6.25,
      16: 6.25,
      17: 6.25,
      18: 6.25,
      19: 4,
      20: 6.25,
      21: 6.25,
      22: 6.25,
      23: 6.25,
      24: 4,
      25: 6.25,
      26: 6.25,
      27: 6.25,
      28: 4,
      29: 4,
      30: 5.25,
      31: 5.25,
      32: 5.25,
      33: 5.25,
      34: 5.25,
      35: 4,
      36: 4,
      37: 4,
      38: 4.5,
      39: 4.5,
      40: 4.5,
      41: 4.5,
      42: 4.5,
      43: 4.5,
      44: 4.5,
      45: 3,
      46: 4,
      47: 3.25,
      48: 5.25,
      49: 3.35,
      50: 3,
      51: 5.25,
      52: 4,
      53: 4.5,
      54: 4.5,
      55: 4,
      56: 4,
      57: 4,
      58: 4,
      59: 5.5,
      60: 4,
      61: 4.5,
      62: 4,
      63: 4,
      64: 6.5,
      65: 4,
      66: 4.5,
      67: 4.5,
      68: 4,
      69: 4,
      70: 4,
      71: 4,
      72: 4.5,
      73: 4.5,
      255: 4,
    };

    const f = net.state.mobConfigs?.[entry.index]?.wavesIconSize ?? 3.5;
    const scale = m[entry.index] ? a / m[entry.index] : a / f;

    ctx.scale(scale, scale);
    drawWaveMobIcon(ctx, entry);

    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(g, u, a, a, r);
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = wavesBorderStyle(entry.rarity);
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
  }

  canvas._render = (now, entry) => render(now, entry);
  render(performance.now(), entry);
  return canvas;
}

function getWaveIcon(entry, now) {
  const mode = wavesGradientOn() ? 1 : 0;
  const sizeKey = Math.round(entry.size * 100) / 100;
  const key = `${entry.index}_${entry.rarity}_${sizeKey}_${mode}`;

  let icon = WAVE_CACHE[key];

  if (!icon) {
    icon = makeWaveIcon(entry, mode, key);
    WAVE_CACHE[key] = icon;
  }

  if (mode === 1 && icon._render) {
    icon._render(now);
  }

  return icon;
}

function drawGlowParticles(
  ctx,
  t,
  size,
  clipX,
  clipY,
  clipW,
  clipH,
  clipR,
  now,
) {
  if (!wavesGradientOn()) return;
  if (t < getGradientMinRarity()) return;

  const custom = wavesTierVisual(t);

  const count = custom.particlecount ?? GLOW_PARTICLE_COUNT;
  const glowColor = custom.particleglowcolor || "rgba(255,255,255,0.25)";
  const dotColor = custom.particledotcolor || "rgba(255,255,255,0.95)";
  const shadowColor = custom.particleshadowcolor || "rgba(0,0,0,0.35)";

  const span = size + GLOW_PARTICLE_MARGIN * 2;
  const scale = size / 128;
  const pulse = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(now * 0.002 + t));

  ctx.save();

  ctx.beginPath();
  ctx.roundRect(clipX, clipY, clipW, clipH, clipR);
  ctx.clip();

  ctx.globalCompositeOperation = "screen";

  for (let p = 0; p < count; p++) {
    const seed = t * 1000 + p * 97;
    const sideMode = rand01(seed + 10);

    let startX, startY;

    if (sideMode < 0.5) {
      startX = -GLOW_PARTICLE_MARGIN;
      startY = rand01(seed + 1) * span;
    } else {
      startX = rand01(seed) * (18 * scale);
      startY = rand01(seed + 1) * (18 * scale);
    }

    const angle = -0.35 + rand01(seed + 2) * 1.2;
    const vx = Math.cos(angle);
    const vy = Math.sin(angle);
    const travel = now * GLOW_PARTICLE_SPEED;

    const x =
      ((((startX + vx * travel) % span) + span) % span) - GLOW_PARTICLE_MARGIN;
    const y =
      ((((startY + vy * travel) % span) + span) % span) - GLOW_PARTICLE_MARGIN;

    const glowR = 20 * scale * pulse;
    const shadowR = 30 * scale * pulse;
    const coreR = Math.max(0.8, 1 * scale);

    const shadow = ctx.createRadialGradient(x, y, 0, x, y, shadowR);
    shadow.addColorStop(0, shadowColor);
    shadow.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.arc(x, y, shadowR, 0, Math.PI * 2);
    ctx.fill();

    const g = ctx.createRadialGradient(x, y, 0, x, y, glowR);
    g.addColorStop(0, glowColor);
    g.addColorStop(0.22, glowColor);
    g.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = dotColor;
    ctx.beginPath();
    ctx.arc(x, y, coreR, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function wavesSweepGradient(ctx, t, base, now) {
  now = Number.isFinite(now) ? now : performance.now();

  const custom = wavesTierVisual(t);

  const time = (now * 0.07) % 512;
  const offset = time - 256;

  const g = ctx.createLinearGradient(
    offset - 160,
    offset - 160,
    offset + 160,
    offset + 160,
  );

  const soft = custom.soft ?? mixColors(base, "#ffffff", 0.06);
  const main = custom.base ?? base;
  const mid = custom.mid ?? mixColors(base, "#ffffff", 0.14);
  const glow = custom.glow ?? mixColors(base, "#ffffff", 0.24);

  g.addColorStop(0.0, soft);
  g.addColorStop(0.18, main);
  g.addColorStop(0.36, mid);
  g.addColorStop(0.5, glow);
  g.addColorStop(0.64, mid);
  g.addColorStop(0.82, main);
  g.addColorStop(1.0, soft);

  return g;
}

function wavesDrawGradient2(ctx, t, x, y, size, clipHeight = size) {
  const tierColor = net.state.tiers?.[t]?.color ?? "#ffffff";

  const custom = wavesTierVisual(t);

  const lines = custom.lines ?? 1;

  const sizeMul = custom.size ?? 0.08;

  const delay = custom.delay ?? 300;

  const cycleDelay = custom.cycleDelay ?? 0;

  const speed = custom.speed ?? 1;

  const reversed = custom.reversed_animation ?? false;

  const lineColor = custom.linecolor ?? mixColors(tierColor, "#000000", 0.15);

  const lineGlow = custom.lineglow ?? mixColors(tierColor, "#ffffff", 0.25);

  ctx.save();

  ctx.beginPath();
  ctx.rect(x, y + size - clipHeight, size, clipHeight);
  ctx.clip();

  const back = custom.back ?? mixColors(tierColor, "#000000", 0.08);

  ctx.fillStyle = back;
  ctx.fillRect(x, y, size, size);

  const now = performance.now();

  const band = size * sizeMul;

  const travelDistance = size + band * 2;

  const pxPerMs = Math.max(speed, 0.001) * 0.05;

  const lineDuration = travelDistance / pxPerMs;

  function drawLine(elapsed) {
    let pos;

    if (!reversed) {
      pos = -band + elapsed * pxPerMs;
    } else {
      pos = size + band - elapsed * pxPerMs;
    }

    const grad = ctx.createLinearGradient(
      x + pos - band,
      y + pos - band,
      x + pos + band,
      y + pos + band,
    );

    grad.addColorStop(0, "rgba(0,0,0,0)");

    grad.addColorStop(0.15, lineGlow);

    grad.addColorStop(0.5, lineColor);

    grad.addColorStop(0.85, lineGlow);

    grad.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = grad;
    ctx.fillRect(x, y, size, size);
  }

  if (cycleDelay <= 0) {
    const firstIndex = Math.floor(now / delay);

    const maxAlive = Math.ceil(lineDuration / delay);

    for (let i = 0; i < maxAlive; i++) {
      const spawnIndex = firstIndex - i;

      if (spawnIndex < 0) continue;

      const spawnTime = spawnIndex * delay;

      const elapsed = now - spawnTime;

      if (elapsed < 0 || elapsed > lineDuration) {
        continue;
      }

      drawLine(elapsed);
    }
  } else {
    const spawnCycleLength = lines * delay + cycleDelay;

    const currentCycle = Math.floor(now / spawnCycleLength);

    const cycleStart = currentCycle * spawnCycleLength;

    for (let nLine = 0; nLine < lines; nLine++) {
      const spawnTime = cycleStart + nLine * delay;

      if (now < spawnTime) continue;

      const elapsed = now - spawnTime;

      if (elapsed < 0 || elapsed > lineDuration) {
        continue;
      }

      drawLine(elapsed);
    }

    const previousCycleStart = cycleStart - spawnCycleLength;

    if (previousCycleStart >= 0) {
      for (let nLine = 0; nLine < lines; nLine++) {
        const spawnTime = previousCycleStart + nLine * delay;

        const elapsed = now - spawnTime;

        if (elapsed < 0 || elapsed > lineDuration) {
          continue;
        }

        drawLine(elapsed);
      }
    }
  }

  ctx.restore();
}

function wavesGetGradient3Rings(t) {
  const custom = wavesTierVisual(t);

  const tierColor = net.state.tiers?.[t]?.color ?? "#ffffff";

  const fallback = [
    {
      color: mixColors(tierColor, "#ffffff", 0.12),
    },
    {
      color: mixColors(tierColor, "#ffffff", 0.18),
    },
    {
      color: mixColors(tierColor, "#ffffff", 0.24),
    },
    {
      color: mixColors(tierColor, "#ffffff", 0.3),
    },
    {
      color: mixColors(tierColor, "#ffffff", 0.36),
    },
    {
      color: mixColors(tierColor, "#ffffff", 0.42),
    },
  ];

  const input = Array.isArray(custom.rings) ? custom.rings : [];

  const count = input.length || 1;

  const rings = new Array(count);

  for (let i = 0; i < count; i++) {
    const src = input[i] || {};

    const def = fallback[i % fallback.length];

    rings[i] = {
      color: src.color ?? def.color,

      glow: src.glow ?? src.ringglow ?? src.color ?? def.color,
    };
  }

  return rings;
}

function wavesDrawGradient3(ctx, t, x, y, size, clipHeight = size) {
  const tierColor = net.state.tiers?.[t]?.color ?? "#ffffff";

  const custom = wavesTierVisual(t);

  const rings = wavesGetGradient3Rings(t);

  const delay = custom.delay ?? 180;

  const cycleDelay = custom.cycleDelay ?? 0;

  const speed = Math.max(custom.speed ?? 1.9, 0.001);

  const reversed =
    custom.reversed_animation ?? custom.revert_animation ?? false;

  const back = custom.back ?? mixColors(tierColor, "#000000", 0.08);

  const now = performance.now();

  const cx = x + size * 0.5;

  const cy = y + size * 0.5;

  ctx.save();

  ctx.beginPath();
  ctx.rect(x, y + size - clipHeight, size, clipHeight);
  ctx.clip();

  ctx.fillStyle = back;
  ctx.fillRect(x, y, size, size);

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const pxPerMs = 0.04 * speed;

  const MAX_RADIUS = (Math.hypot(size * 0.5, size * 0.5) + 40) * 3;

  const ringCount = rings.length || 1;

  const cycleSpawnTime = ringCount * delay;

  const cycleLength = cycleSpawnTime + cycleDelay;

  const maxAlive = Math.min(25, Math.ceil(MAX_RADIUS / (pxPerMs * delay)) + 4);

  if (!reversed) {
    const infiniteLoop = cycleDelay <= 0;

    const firstIndex = Math.floor(now / delay);

    for (let i = maxAlive - 1; i >= 0; i--) {
      const index = firstIndex - i;

      if (index < 0) continue;

      const linearSpawnTime = index * delay;

      let spawnTime = linearSpawnTime;

      if (!infiniteLoop) {
        const cycleIndex = Math.floor(linearSpawnTime / cycleLength);

        const cycleStart = cycleIndex * cycleLength;

        const timeInCycle = linearSpawnTime - cycleStart;

        if (timeInCycle >= cycleSpawnTime) {
          continue;
        }

        const ringOrder = Math.floor(timeInCycle / delay);

        if (ringOrder < 0 || ringOrder >= ringCount) {
          continue;
        }

        spawnTime = cycleStart + ringOrder * delay;
      }

      const elapsed = now - spawnTime;

      if (elapsed < 0) continue;

      const radius = 1 + elapsed * pxPerMs;

      if (radius <= 0 || radius > MAX_RADIUS) {
        continue;
      }

      const ring =
        rings[
          infiniteLoop
            ? ((index % ringCount) + ringCount) % ringCount
            : Math.floor((linearSpawnTime % cycleLength) / delay)
        ];

      wavesDrawGradient3Ring(ctx, ring, radius, cx, cy);
    }
  } else {
    const START_RADIUS = MAX_RADIUS * 0.22 * 1.15;

    const shrinkDuration = START_RADIUS / pxPerMs;

    const stepDelay = Math.max(delay, 1);

    const activeDuration = (ringCount - 1) * stepDelay + shrinkDuration;

    const infiniteLoop = cycleDelay <= 0;

    const totalCycleLength = activeDuration + cycleDelay;

    const cycleTime = infiniteLoop ? now : now % totalCycleLength;

    const drawList = [];

    for (let ringId = 0; ringId < ringCount; ringId++) {
      const startTime = ringId * stepDelay;

      let radius = START_RADIUS;

      if (cycleTime < startTime) {
        radius = START_RADIUS;
      } else {
        let elapsed = cycleTime - startTime;

        if (infiniteLoop) {
          elapsed =
            ((elapsed % shrinkDuration) + shrinkDuration) % shrinkDuration;
        }

        if (elapsed < shrinkDuration) {
          radius = Math.max(0.001, START_RADIUS - elapsed * pxPerMs);
        } else {
          radius = START_RADIUS;
        }
      }

      drawList.push({
        ringId,
        radius,
      });
    }

    drawList.sort((a, b) => {
      if (b.radius !== a.radius) {
        return b.radius - a.radius;
      }

      return b.ringId - a.ringId;
    });

    for (const item of drawList) {
      wavesDrawGradient3Ring(ctx, rings[item.ringId], item.radius, cx, cy);
    }
  }

  ctx.restore();
  ctx.restore();
}

function wavesDrawGradient3Ring(ctx, ring, radius, cx, cy) {
  const coreColor = ring.color;

  const glowColor = ring.glow;

  const GLOW_WIDTH = 20;
  const GLOW_OFFSET = -7;

  const innerR = Math.max(0, radius + GLOW_OFFSET);

  const outerR = innerR + GLOW_WIDTH;

  const time = (performance.now() * 0.05) % 128;

  const sweep = (time / 128) * Math.PI * 2;

  const segments = 64;

  for (let s = 0; s < segments; s++) {
    const t0 = s / segments;

    const t1 = (s + 1) / segments;

    const a0 = sweep + t0 * Math.PI * 2;

    const a1 = sweep + t1 * Math.PI * 2;

    const mid = (t0 + t1) * 0.5;

    let alpha = 0.25;

    if (mid >= 0.4 && mid <= 0.5) {
      alpha = 0.25 + ((mid - 0.4) / 0.1) * 0.75;
    } else if (mid > 0.5 && mid <= 0.6) {
      alpha = 1.0 - ((mid - 0.5) / 0.1) * 0.75;
    }

    ctx.fillStyle = glowColor.startsWith("#")
      ? glowColor +
        Math.round(alpha * 255)
          .toString(16)
          .padStart(2, "0")
      : glowColor.replace("rgb(", "rgba(").replace(")", `,${alpha})`);

    ctx.beginPath();

    ctx.arc(cx, cy, outerR, a0, a1);

    ctx.arc(cx, cy, innerR, a1, a0, true);

    ctx.closePath();
    ctx.fill();
  }

  ctx.globalCompositeOperation = "source-over";

  ctx.fillStyle = coreColor;

  ctx.beginPath();

  ctx.arc(cx, cy, radius, 0, Math.PI * 2);

  ctx.fill();

  ctx.globalCompositeOperation = "screen";
}

function wavesFillStyle(ctx, rarity, base, ratio = null, now, x, y, size) {
  if (!wavesGradientOn() || rarity < getGradientMinRarity()) {
    return base;
  }

  const custom = wavesTierVisual(rarity);

  const hasGradient3 = Array.isArray(custom.rings) || custom.type === 3;

  const hasGradient2 =
    custom.lines !== undefined || custom.linecolor !== undefined;

  if (hasGradient3) {
    wavesDrawGradient3(
      ctx,
      rarity,
      x,
      y,
      size,
      ratio === null ? size : size * ratio,
    );

    return null;
  }

  if (hasGradient2) {
    wavesDrawGradient2(
      ctx,
      rarity,
      x,
      y,
      size,
      ratio === null ? size : size * ratio,
    );

    return null;
  }

  const safeNow = Number.isFinite(now) ? now : performance.now();

  return wavesSweepGradient(ctx, rarity, base, safeNow);
}

function wavesBorderStyle(rarity) {
  const base = net.state.tiers?.[rarity]?.color ?? "#ffffff";

  if (!wavesGradientOn() || rarity < getGradientMinRarity()) {
    return mixColors(base, "#000000", 0.2);
  }

  const custom = wavesTierVisual(rarity);

  if (custom.border !== undefined) {
    return custom.border;
  }

  return mixColors(base, "#000000", 0.2);
}

function draw() {
  net.state.petalHover = null;
  net.state.mobHover = null;
  net.state.interpolationFactor = options.rigidInterpolation ? 0.4 : 0.2;
  requestAnimationFrame(draw);

  const start = performance.now();

  if (net.state.socket?.readyState !== WebSocket.OPEN) {
    net.state.camera.realX += 0.5;
    net.state.camera.realY = Math.sin(net.state.camera.realX / 100) * 50;
  }

  net.state.camera.interpolate();

  const scale = gameScale(net.state.camera.fov);
  const cameraX = net.state.camera.x * scale;
  const cameraY = net.state.camera.y * scale;
  const halfWidth = canvas.width * 0.5;
  const halfHeight = canvas.height * 0.5;

  drawBackground(
    cameraX,
    cameraY,
    scale,
    net.state.socket?.readyState === WebSocket.OPEN,
    net.state.room.width,
    net.state.room.height,
    net.state.disconnected ? null : BIOME_BACKGROUNDS[net.state.room.biome],
    net.state.room.isRadial,
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
    ctx.drawImage(
      net.state.terrainImg,
      (-net.state.room.width / 2) * scale - cameraX + halfWidth,
      (-net.state.room.height / 2) * scale - cameraY + halfHeight,
      net.state.room.width * scale,
      net.state.room.height * scale,
    );
  }

  net.state.markers.forEach((marker) => {
    const drawX = marker.x * scale - cameraX + halfWidth;
    const drawY = marker.y * scale - cameraY + halfHeight;
    if (marker.tick > 1) return net.state.markers.delete(marker.id);
    const oldTransform = ctx.getTransform();
    ctx.setTransform(
      marker.size * scale,
      0,
      0,
      marker.size * scale,
      drawX,
      drawY,
    );
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

  net.state.mobs.forEach((mob) => currentMobs.set(mob.id, mob));
  net.state.petals.forEach((petal) => currentPetals.set(petal.id, petal));
  net.state.players.forEach((p) => currentPlayers.set(p.id, p));

  net.state.previousMobs.forEach((mob, id) => {
    if (!currentMobs.has(id)) net.state.dyingMobs.set(id, { mob, progress: 0 });
  });

  net.state.previousPetals.forEach((petal, id) => {
    if (!currentPetals.has(id))
      net.state.dyingPetals.set(id, { petal, progress: 0 });
  });

  net.state.previousPlayers.forEach((p, id) => {
    if (!currentPlayers.has(id))
      net.state.dyingPlayers.set(id, { player: p, progress: 0 });
  });

  net.state.dyingPetals.forEach((data, id) => {
    const entity = data.petal;
    data.progress += 0.2;
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
    data.progress += 0.2;
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
      ctx.shadowBlur =
        10 *
        scale *
        (Math.sin(performance.now() / 500 + entity.id * 3) * 0.8 + 0.8);
      ctx.shadowColor = "#FFFFFF";
    }

    drawMob(
      entity.id,
      entity.index,
      entity.rarity,
      entity.hit,
      ctx,
      entity.attack,
      entity.friendly,
      entity.facing,
      entity.extraData,
    );
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
    data.progress += 0.2;
    if (data.progress >= 1) return net.state.dyingPlayers.delete(id);
    const fade = 1 - data.progress;
    const scaling = 1 + data.progress;

    const drawX = entity.x * scale - cameraX + halfWidth;
    const drawY = entity.y * scale - cameraY + halfHeight;
    const size = entity.size * scale * scaling;

    // ctx.save();
    const oldAlpha = ctx.globalAlpha;
    const oldTransform = ctx.getTransform();
    ctx.globalAlpha = fade;
    // ctx.translate(drawX, drawY);
    // ctx.scale(size, size);
    ctx.setTransform(size, 0, 0, size, drawX, drawY);
    setStyle(
      mixColors(
        [colors.playerYellow, colors.team1, colors.team2][entity.team] ??
          colors.crafting,
        colors.legendary,
        entity.hit * 0.5,
      ),
      0.1,
    );
    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
    drawFace(1 * 0.375, 0, 1, 0.6, 1, true);
    // ctx.restore();
    ctx.globalAlpha = oldAlpha;
    ctx.setTransform(oldTransform);
  });

  net.state.previousMobs = currentMobs;
  net.state.previousPetals = currentPetals;
  net.state.previousPlayers = currentPlayers;

  net.state.petals.forEach((entity) => {
    entity.interpolate();
    entity.size2 ??=
      entity.index === 24 || entity.index === 64
        ? entity.size / 1.4
        : entity.size;
    if (entity.index === 24 || entity.index === 64)
      entity.size2 += (entity.size - entity.size2) * 0.25;

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
    ctx.setTransform(
      entity.size2 * scale,
      0,
      0,
      entity.size2 * scale,
      drawX,
      drawY,
    );
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
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(drawX, drawY, entity.size * scale * 1.4, 0, Math.PI * 2);
      ctx.fillStyle = net.state.tiers[entity.rarity].color;
      ctx.fill();
      ctx.closePath();
      ctx.globalAlpha = 1;
      text(
        net.state.tiers[entity.rarity].name,
        drawX,
        drawY,
        entity.size * scale * 1.15,
        net.state.tiers[entity.rarity].color,
      );
    }
  });

  function formatAmount(n) {
    if (n >= 1e12) return "x" + (n / 1e12).toFixed(1) + "t";
    if (n >= 1e9) return "x" + (n / 1e9).toFixed(1) + "b";
    if (n >= 1e6) return "x" + (n / 1e6).toFixed(1) + "m";
    if (n >= 1e3) return "x" + (n / 1e3).toFixed(1) + "k";
    return "x" + n;
  }

  net.state.drops.forEach((entity) => {
    const oldTransform = ctx.getTransform();
    const oldFillStyle = ctx.fillStyle;
    const oldAlpha = ctx.globalAlpha;
    const drawX = entity.x * scale - cameraX + halfWidth;
    const drawY = entity.y * scale - cameraY + halfHeight;
    const outlineTimer = Math.sin(performance.now() / 250 + entity.id) + 1.5;
    entity.creation ??= performance.now();
    // ctx.save();
    // ctx.translate(drawX, drawY);
    entity.rotation ??= Math.random() * (Math.PI / 6) - Math.PI / 12;
    const aSin = Math.sin((performance.now() + entity.creation) / 200) * 0.05;
    // ctx.scale((1 + aSin) * entity.size * scale, (1 + aSin) * entity.size * scale);
    ctx.setTransform(
      (1 + aSin) * entity.size * scale,
      0,
      0,
      (1 + aSin) * entity.size * scale,
      drawX,
      drawY,
    );
    ctx.rotate(entity.rotation);

    ctx.fillStyle = colors.black;
    ctx.beginPath();
    ctx.roundRect(
      -0.55 - 0.025 * outlineTimer,
      -0.55 - 0.025 * outlineTimer,
      1.1 + 0.05 * outlineTimer,
      1.1 + 0.05 * outlineTimer,
      0.1,
    );
    ctx.globalAlpha *= 0.125;
    ctx.fill();
    ctx.closePath();

    ctx.globalAlpha *= 8;

    ctx.drawImage(getPetalIcon(entity.index, entity.rarity), -0.5, -0.5, 1, 1);

    if ((entity.amount ?? 1) > 1) {
      const text = formatAmount(entity.amount);

      ctx.font = "bold 0.35px Ubuntu";
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 0.06;
      ctx.textAlign = "right";
      ctx.textBaseline = "top";

      const offsetX = 0.6;
      const offsetY = -0.7;

      ctx.strokeText(text, offsetX, offsetY);
      ctx.fillText(text, offsetX, offsetY);
    }

    // ctx.restore();
    ctx.fillStyle = oldFillStyle;
    ctx.globalAlpha = oldAlpha;
    ctx.setTransform(oldTransform);
  });

  net.state.mobs.forEach((entity) => {
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
      ctx.shadowBlur =
        10 *
        scale *
        (Math.sin(performance.now() / 500 + entity.id * 3) * 0.8 + 0.8);
      ctx.shadowColor = "#FFFFFF";
    }

    drawMob(
      entity.id,
      entity.index,
      entity.rarity,
      entity.hit,
      ctx,
      entity.attack,
      entity.friendly,
      entity.facing,
      entity.extraData,
    );
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
      const barthicc = (5 + entity.size * 0.1) * scale;

      drawBar(
        drawX - barSize,
        drawX + barSize,
        drawY + barSize + 13 * scale,
        barthicc,
        colors["???"],
      );
      drawBar(
        drawX - barSize,
        drawX - barSize + barSize * 2 * entity.secondaryHealthBar,
        drawY + barSize + 13 * scale,
        0.667 * barthicc,
        colors.legendary,
      );
      drawBar(
        drawX - barSize,
        drawX - barSize + barSize * 2 * entity.healthRatio,
        drawY + barSize + 13 * scale,
        0.667 * barthicc,
        entity.poisoned
          ? mixColors(
              colors.common,
              colors.irisPurple,
              0.5 + Math.sin(performance.now() / 333 + entity.id * 3) * 0.5,
            )
          : colors.common,
      );

      ctx.textAlign = "left";
      text(
        net.state.mobConfigs[entity.index].name,
        drawX - barSize - barthicc * 0.5,
        drawY + barSize + 8 * scale - barthicc * 0.5,
        8.5 * scale,
      );

      ctx.textAlign = "right";
      text(
        net.state.tiers[entity.rarity].name,
        drawX + barSize + barthicc * 0.5,
        drawY + barSize + 18 * scale + barthicc * 0.5,
        8.5 * scale,
        net.state.tiers[entity.rarity].color,
      );
    }
  });

  ctx.textAlign = "center";

  net.state.players.forEach((entity) => {
    entity.interpolate();

    let expression = 1,
      targetMouthDip = 1.7;

    if (entity.attack) {
      expression = 2;
      targetMouthDip = 0.6;
    }

    if (entity.defend) {
      expression = 3;
      targetMouthDip = 0.8;
    }

    entity.mood = lerp(entity.mood, expression, 0.4);
    entity.mouthDip = lerp(entity.mouthDip, targetMouthDip, 0.4);

    let drawX = entity.x * scale - cameraX + halfWidth,
      drawY = entity.y * scale - cameraY + halfHeight;

    if (entity.id === net.state.playerID) {
      drawX = halfWidth;
      drawY = halfHeight;
    }

    setStyle(
      mixColors(
        [colors.playerYellow, colors.team1, colors.team2][entity.team] ??
          colors.crafting,
        colors.legendary,
        entity.hit * 0.5,
      ),
      5 * scale,
    );

    const size = entity.size * scale;

    if (entity.wearing & WEARABLES.AMULET) {
      // ctx.save();
      // ctx.translate(drawX, drawY);
      const oldTransform = ctx.getTransform();
      const oldStrokeStyle = ctx.strokeStyle;
      const oldLineWidth = ctx.lineWidth;
      const oldFillStyle = ctx.fillStyle;
      ctx.setTransform(1, 0, 0, 1, drawX, drawY);

      const xTrans =
        size *
        0.334 *
        Math.sin(performance.now() / 1250 + (entity.id * Math.PI) / 6) *
        scale;

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
      ctx.setTransform(size * 0.6, 0, 0, size * 0.6, xTrans, size * 2.5);
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
    drawFace(
      size * 0.4,
      entity.facing,
      entity.mood,
      entity.mouthDip,
      expression,
    );
    ctx.setTransform(oldTransform);

    if (entity.wearing & WEARABLES.THIRD_EYE) {
      const oldTransform = ctx.getTransform();
      // ctx.save();
      // ctx.translate(drawX, drawY - size * .6);
      // ctx.scale(size * .3, size * .3);
      ctx.setTransform(size * 0.3, 0, 0, size * 0.3, drawX, drawY - size * 0.6);
      drawThirdEye(ctx, false);
      // ctx.restore();
      ctx.setTransform(oldTransform);
    }

    if (entity.wearing & WEARABLES.ANTENNAE) {
      const oldTransform = ctx.getTransform();
      // ctx.save();
      // ctx.translate(drawX, drawY - size * .8);
      // ctx.scale(size * .9, size * .9);
      ctx.setTransform(size * 0.9, 0, 0, size * 0.9, drawX, drawY - size * 0.8);
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

    drawBar(
      drawX - size,
      drawX + size,
      drawY + size + 16 * scale,
      6 * scale,
      colors["???"],
    );
    drawBar(
      drawX - size,
      drawX - size + size * 2 * entity.secondaryHealthBar,
      drawY + size + 16 * scale,
      4 * scale,
      colors.legendary,
    );
    drawBar(
      drawX - size,
      drawX - size + size * 2 * entity.healthRatio,
      drawY + size + 16 * scale,
      4 * scale,
      entity.poisoned
        ? mixColors(
            colors.common,
            colors.irisPurple,
            0.5 + Math.sin(performance.now() / 333 + entity.id * 3) * 0.5,
          )
        : colors.common,
    );

    if (entity.shieldRatio > 0) {
      drawBar(
        drawX - size,
        drawX - size + size * 2 * entity.shieldRatio,
        drawY + size + 16 * scale,
        2.5 * scale,
        colors.unique,
      );
    }

    if (!options.hideEntityUI && entity.id !== net.state.playerID) {
      // Like mob bar
      ctx.textAlign = "left";
      text(
        entity.name,
        drawX - size - 2,
        drawY + size + 9 * scale,
        8 * scale,
        entity.nameColor,
      );

      ctx.textAlign = "right";
      text(
        "Lvl " + entity.level,
        drawX + size + 2,
        drawY + size + 23 * scale,
        8 * scale,
        net.state.tiers[entity.rarity].color,
      );

      ctx.textAlign = "center";
    }
  });

  net.state.lightning.forEach((lightning) => {
    const alpha = lightning.alpha;

    if (alpha <= 0) {
      net.state.lightning.delete(lightning.id);
      return;
    }

    ctx.beginPath();
    ctx.moveTo(
      lightning.points[0].x * scale - cameraX + halfWidth,
      lightning.points[0].y * scale - cameraY + halfHeight,
    );
    for (let i = 1; i < lightning.points.length; i++) {
      ctx.lineTo(
        lightning.points[i].x * scale - cameraX + halfWidth,
        lightning.points[i].y * scale - cameraY + halfHeight,
      );
    }
    ctx.lineWidth = 2 * scale;
    ctx.strokeStyle = colors.white;
    ctx.globalAlpha = Math.pow(alpha, 4) * 1.25;
    ctx.stroke();
  });

  ctx.globalAlpha = 1;

  if (!options.disableTiledBackground) {
    drawBackgroundOverlay(
      cameraX,
      cameraY,
      scale,
      BIOME_BACKGROUNDS[net.state.room.biome],
    );
  }

  if (
    net.state.terrain !== null &&
    net.state.terrain.overlay !== null &&
    net.state.room.biome === BIOME_TYPES.HALLOWEEN
  ) {
    net.state.terrain.overlay.render(
      ctx,
      cameraX,
      cameraY,
      net.state.camera.lightingBoost,
      net.state.room.width * scale,
      net.state.room.width * scale,
      scale,
      halfWidth,
      halfHeight,
    );
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

  if (net.state.slots.length > 0) {
    // Slots
    const padding = 12.5;
    let boxSize = net.state.isInDestroy ? 48 : 72;
    let lineWidth = isMobile ? 7 : 5.25;
    if (isMobile) {
      boxSize *= 1.4;
    }

    let secondaryBoxSize = net.state.isInDestroy ? 65 : boxSize * 0.75;

    if (dragConfig.enabled) {
      dragConfig.item.realSize = boxSize;
    }
    if (inventoryDragConfig.enabled) {
      inventoryDragConfig.item.realSize = boxSize;
    }

    if (net.state.isInDestroy) {
      text(
        "(Press the keybind to destroy the item)",
        width / 2,
        height - boxSize - secondaryBoxSize - padding * 4,
        15,
      );
    }

    for (let i = 0; i < net.state.slots.length; i++) {
      const slot = net.state.slots[i];
      const x =
        width / 2 -
        ((boxSize + padding) * net.state.slots.length) / 2 +
        (boxSize + padding) * i +
        padding / 2;
      const y = height - boxSize - secondaryBoxSize - padding * 3;

      ctx.globalAlpha = 0.5;
      ctx.fillStyle = mixColors(colors.unique, "#000000", 0.2);
      ctx.beginPath();
      ctx.roundRect(x, y, boxSize, boxSize, 4);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = colors.unique;
      ctx.beginPath();
      ctx.roundRect(
        x + lineWidth,
        y + lineWidth,
        boxSize - lineWidth * 2,
        boxSize - lineWidth * 2,
        2,
      );
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;

      if (
        slot.index !== -1 &&
        (!dragConfig.enabled ||
          dragConfig.type !== DRAG_TYPE_MAINDOCKER ||
          dragConfig.index !== i)
      ) {
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
            slot.ratio = lerp(slot.ratio, slot.realRatio, 0.1);
          }

          if (slot.ratio < 0.995) {
            drawPetalIconWithRatio(
              slot.index,
              slot.rarity,
              x,
              y,
              boxSize,
              slot.ratio,
              ctx,
            );
          } else {
            ctx.save();
            ctx.translate(slot.icon.x, slot.icon.y);
            ctx.scale(slot.icon.size, slot.icon.size);
            ctx.drawImage(getPetalIcon(slot.index, slot.rarity), 0, 0, 1, 1);
            ctx.restore();
          }

          if (mX > x && mX < x + boxSize && mY > y && mY < y + boxSize) {
            net.state.petalHover = [slot.index, slot.rarity, x, y];

            if (
              mouse.left &&
              !dragConfig.enabled &&
              !inventoryDragConfig.enabled &&
              !joystick.on
            ) {
              beginDragDrop(
                x + boxSize / 2,
                y + boxSize / 2,
                boxSize,
                slot.index,
                slot.rarity,
              );
              dragConfig.type = DRAG_TYPE_MAINDOCKER;
              dragConfig.index = i;
              dragConfig.item.stableSize = boxSize;

              dragConfig.onDrop = () => {
                if (!processDrop()) {
                  slot.icon.x = mouse.x / uScale - boxSize / 2;
                  slot.icon.y = mouse.y / uScale - boxSize / 2;
                }
              };
            }
          }
        }
      }
    }

    if (net.state.secondarySlots.length > 0) {
      const y = height - secondaryBoxSize - padding * 2;
      if (dragConfig.enabled || inventoryDragConfig.enabled) {
        // If the drag item is within this row, make the size secondaryBoxSize
        const barWidth =
          secondaryBoxSize * net.state.slots.length +
          padding * (net.state.slots.length + 1);
        const barX = width / 2 - barWidth / 2;
        const barY = height - secondaryBoxSize - padding;

        if (dragConfig.enabled) {
          if (
            dragConfig.item.x > barX &&
            dragConfig.item.x < barX + barWidth &&
            dragConfig.item.y > barY &&
            dragConfig.item.y < barY + secondaryBoxSize
          ) {
            dragConfig.item.realSize = secondaryBoxSize;
          }
        }
        if (inventoryDragConfig.enabled) {
          if (
            inventoryDragConfig.item.x > barX &&
            inventoryDragConfig.item.x < barX + barWidth &&
            inventoryDragConfig.item.y > barY &&
            inventoryDragConfig.item.y < barY + secondaryBoxSize
          ) {
            inventoryDragConfig.item.realSize = secondaryBoxSize;
          }
        }
      }

      const minXOfSecondary =
        width / 2 -
        ((secondaryBoxSize + padding) * net.state.slots.length) / 2 +
        padding / 2;
      text(
        "[R]",
        minXOfSecondary - secondaryBoxSize / 2.25,
        y + secondaryBoxSize / 2,
        15,
      );

      for (let i = 0; i < net.state.slots.length; i++) {
        const slot = net.state.secondarySlots[i];
        const x =
          width / 2 -
          ((secondaryBoxSize + padding) * net.state.slots.length) / 2 +
          (secondaryBoxSize + padding) * i +
          padding / 2;

        ctx.globalAlpha = 0.5;
        ctx.fillStyle = mixColors(colors.unique, "#000000", 0.2);
        ctx.beginPath();
        ctx.roundRect(x, y, secondaryBoxSize, secondaryBoxSize, 4);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = colors.unique;
        ctx.beginPath();
        ctx.roundRect(
          x + (lineWidth - 1),
          y + (lineWidth - 1),
          secondaryBoxSize - (lineWidth - 1) * 2,
          secondaryBoxSize - (lineWidth - 1) * 2,
          2,
        );
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

        if (
          slot.index > -1 &&
          (!dragConfig.enabled ||
            dragConfig.type !== DRAG_TYPE_SECONDARYDOCKER ||
            dragConfig.index !== i)
        ) {
          ctx.save();
          ctx.translate(slot.icon.x, slot.icon.y);
          ctx.scale(slot.icon.size, slot.icon.size);
          ctx.drawImage(getPetalIcon(slot.index, slot.rarity), 0, 0, 1, 1);
          ctx.restore();

          if (
            mX > x &&
            mX < x + secondaryBoxSize &&
            mY > y &&
            mY < y + secondaryBoxSize
          ) {
            net.state.petalHover = [slot.index, slot.rarity, x, y];

            if (
              mouse.left &&
              !dragConfig.enabled &&
              !inventoryDragConfig.enabled &&
              !joystick.on
            ) {
              beginDragDrop(
                x + boxSize / 2,
                y + boxSize / 2,
                boxSize,
                slot.index,
                slot.rarity,
              );
              dragConfig.type = DRAG_TYPE_SECONDARYDOCKER;
              dragConfig.index = i;
              dragConfig.item.stableSize = secondaryBoxSize;

              dragConfig.onDrop = () => {
                if (!processDrop()) {
                  slot.icon.x = mouse.x / uScale - boxSize / 2;
                  slot.icon.y = mouse.y / uScale - boxSize / 2;
                }
              };
            }
          }
        }

        // Keybinds
        text(
          `[${(i + 1) % 10}]`,
          x + secondaryBoxSize / 2,
          y + secondaryBoxSize + padding,
          12,
        );
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

  function drawIconsToOffscreen(info) {
    net.state.iconStuff = [];

    mobIconCanvas.width = width;
    mobIconCanvas.height = height;

    const ctx = mobIconCtx;
    ctx.clearRect(0, 0, width, height);

    let boxSize = 75;
    let gapY = 40;
    let gapX = 5;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const groupedByIndex = {};

    net.state.waveInfo.aliveMobs.forEach((mob) => {
      if (!groupedByIndex[mob.index]) groupedByIndex[mob.index] = {};
      if (!groupedByIndex[mob.index][mob.rarity]) {
        groupedByIndex[mob.index][mob.rarity] = {
          index: mob.index,
          rarity: mob.rarity,
          count: 0,
        };
      }
      groupedByIndex[mob.index][mob.rarity].count++;
    });

    const mobStacks = Object.entries(groupedByIndex)
      .map(([index, rarities]) =>
        Object.values(rarities).sort((a, b) => a.rarity - b.rarity),
      )
      .sort((a, b) => {
        if (a[0].index === 255) return -1;
        if (b[0].index === 255) return 1;
        return a[0].index - b[0].index;
      });

    boxSize -= mobStacks.length / 1.1;
    gapX -= mobStacks.length;
    gapY -= mobStacks.length / 1.2;

    const indexScales = { 255: 4 };

    mobStacks.forEach((stack, stackI) => {
      stack.forEach((entity, rarityI) => {
        const x =
          width / 2 + 45 - 40 + (stackI - mobStacks.length / 2) * (80 + gapX);

        const y = 100 + rarityI * (boxSize - gapY);

        net.state.iconStuff.push({
          x,
          y,
          size: boxSize,
          index: entity.index,
          rarity: entity.rarity,
          count: entity.count,
        });

        const baseColor = net.state.tiers[entity.rarity].color;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, boxSize, boxSize, 5);

        ctx.fillStyle = baseColor;
        ctx.fill();

        ctx.clip();

        ctx.translate(x + boxSize / 2, y + boxSize / 2);

        const m = {
          0: 4,
          1: 4,
          2: 4,
          3: 5.5,
          4: 4,
          5: 3,
          6: 4,
          7: 4,
          8: 3.25,
          9: 4,
          10: 3.25,
          11: 3.25,
          12: 3.25,
          13: 4,
          14: 4,
          15: 6.25,
          16: 6.25,
          17: 6.25,
          18: 6.25,
          19: 4,
          20: 6.25,
          21: 6.25,
          22: 6.25,
          23: 6.25,
          24: 4,
          25: 6.25,
          26: 6.25,
          27: 6.25,
          28: 4,
          29: 4,
          30: 5.25,
          31: 5.25,
          32: 5.25,
          33: 5.25,
          34: 5.25,
          35: 4,
          36: 4,
          37: 4,
          38: 4.5,
          39: 4.5,
          40: 4.5,
          41: 4.5,
          42: 4.5,
          43: 4.5,
          44: 4.5,
          45: 3,
          46: 4,
          47: 3.25,
          48: 5.25,
          49: 3.35,
          50: 3,
          51: 5.25,
          52: 4,
          53: 4.5,
          54: 4.5,
          55: 4,
          56: 4,
          57: 4,
          58: 4,
          59: 5.5,
          60: 4,
          61: 4.5,
          62: 4,
          63: 4,
          64: 6.5,
          65: 4,
          66: 4.5,
          67: 4.5,
          68: 4,
          69: 4,
          70: 4,
          71: 4,
          72: 4.5,
          73: 4.5,
          255: 4,
        };

        const f = net.state.mobConfigs?.[entity.index]?.wavesIconSize ?? 3.5;

        const scale = m[entity.index] ? boxSize / m[entity.index] : boxSize / f;

        ctx.scale(scale, scale);

        if (entity.index !== 255) {
          if (![46, 49, 55].includes(entity.index)) {
            ctx.rotate(-Math.PI / 4);
          }
          drawUIMob(entity.index, entity.rarity, ctx);
        } else {
          setStyle(colors.crafting, 0.135, 0.2, ctx);

          ctx.beginPath();
          ctx.arc(0, 0, 1, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          drawFace(0.35, -Math.PI / 4, 1.7, 1.7, 1, false, ctx);
        }

        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(x, y, boxSize, boxSize, 5);
        ctx.strokeStyle = wavesBorderStyle(entity.rarity);
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.restore();

        if (entity.count > 1) {
          ctx.save();
          ctx.textAlign = "right";
          ctx.textBaseline = "top";
          text(
            `x${entity.count}`,
            x + boxSize + 6,
            y - 5,
            boxSize * 0.275,
            colors.white,
            ctx,
          );
          ctx.restore();
        }
      });
    });
  }

  function renderWaveIcons() {
    if (!net.state.iconStuff?.length) return;

    mobIconCanvas.width = width;
    mobIconCanvas.height = height;

    const ctx = mobIconCtx;
    ctx.clearRect(0, 0, width, height);

    net.state.iconStuff.forEach((e) => {
      const icon = getWaveIcon(e);
      ctx.drawImage(icon, e.x - 6, e.y - 6);

      if (e.count > 1) {
        ctx.save();
        ctx.textAlign = "right";
        ctx.textBaseline = "top";
        text(
          `x${e.count}`,
          e.x + e.size + 6,
          e.y - 5,
          e.size * 0.275,
          colors.white,
          ctx,
        );
        ctx.restore();
      }
    });
  }

  if (net.state.waveInfo) {
    ctx.textBaseline = "middle";

    text("Wave " + net.state.waveInfo.wave, width / 2, 30, 35);

    drawBar(width / 2 - 200, width / 2 + 200, 65, 30, colors["???"]);

    drawBar(
      width / 2 - 200,
      width / 2 -
        200 +
        400 * (net.state.waveInfo.livingMobs / net.state.waveInfo.maxMobs),
      65,
      22.5,
      mixColors(
        BIOME_BACKGROUNDS[net.state.room.biome].color,
        colors.white,
        0.2,
      ),
    );

    text(
      net.state.waveInfo.livingMobs + " / " + net.state.waveInfo.maxMobs,
      width / 2,
      65,
      22.5,
    );

    if (net.state.waveInfo.aliveMobs) {
      const gradientState = wavesGradientOn() ? 1 : 0;

      const gradientChanged = net.state.lastGradientState !== gradientState;

      net.state.lastGradientState = gradientState;

      const newHash = hashAliveMobs(net.state.waveInfo.aliveMobs);

      const mobsChanged = newHash !== net.state._aliveMobsHash;
      net.state._aliveMobsHash = newHash;

      const resized = net.state._lastW !== width || net.state._lastH !== height;

      net.state._lastW = width;
      net.state._lastH = height;

      if (mobsChanged || gradientChanged || resized) {
        if (gradientChanged) {
          for (const k in WAVE_CACHE) {
            delete WAVE_CACHE[k];
          }
        }

        drawIconsToOffscreen(net.state.waveInfo.aliveMobs);
      }

      if (wavesGradientOn()) {
        renderWaveIcons();
      }

      ctx.drawImage(mobIconCanvas, 0, 0, width, height);

      const mX = mouse.x / uiScale();
      const mY = mouse.y / uiScale();

      net.state.mobHover = null;

      net.state.iconStuff.forEach((hit) => {
        if (
          mX > hit.x &&
          mX < hit.x + hit.size &&
          mY > hit.y &&
          mY < hit.y + hit.size
        ) {
          net.state.mobHover = [
            hit.index,
            hit.rarity,
            hit.x + hit.size / 2 - 350 / 2,
            hit.y + hit.size + 10,
          ];
        }
      });
    }
  }

  if (net.state.socket?.readyState === WebSocket.OPEN) {
    if (!isHalloween || net.state.room.biome !== BIOME_TYPES.HALLOWEEN) {
      // Minimap
      const doTerrain = net.state.terrain?.blocks?.length > 0;

      const biggestSize = doTerrain
        ? 275
        : Math.abs(1 - net.state.room.width / net.state.room.height) < 0.1
          ? 150
          : 200;

      const bigger = Math.max(net.state.room.width, net.state.room.height);

      const mapWidth = (net.state.room.width / bigger) * biggestSize;
      const mapHeight = (net.state.room.height / bigger) * biggestSize;

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
          ctx.arc(
            x + mapWidth / 2,
            y + mapHeight / 2,
            mapWidth / 2,
            0,
            Math.PI * 2,
          );
        } else {
          ctx.roundRect(x, y, mapWidth, mapHeight, 10);
        }

        ctx.fill();
        ctx.stroke();
      }

      const radius = biggestSize * (doTerrain ? 0.0225 : 0.025);
      const blueDot = "#2F80FF";

      const selfX =
        (net.state.camera.x / net.state.room.width) * mapWidth +
        x +
        mapWidth / 2;

      const selfY =
        (net.state.camera.y / net.state.room.height) * mapHeight +
        y +
        mapHeight / 2;

      ctx.fillStyle = doTerrain ? colors.peaGreen : colors.playerYellow;
      ctx.beginPath();
      ctx.arc(selfX, selfY, radius, 0, Math.PI * 2);
      ctx.fill();

      if (net.state.minimapPlayers) {
        for (const player of net.state.minimapPlayers.values()) {
          if (!player) continue;
          if (player.id === net.state.playerID) continue;

          const px =
            (player.x / net.state.room.width) * mapWidth + x + mapWidth / 2;

          const py =
            (player.y / net.state.room.height) * mapHeight + y + mapHeight / 2;

          ctx.fillStyle = blueDot;
          ctx.beginPath();
          ctx.arc(px, py, radius * 0.85, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    {
      // Level
      net.state.levelProgress = lerp(
        net.state.levelProgress,
        net.state.levelProgressTarget,
        0.1,
      );

      if (
        net.state.levelProgressTarget < net.state.levelProgress ||
        isNaN(net.state.levelProgress)
      ) {
        net.state.levelProgress = 0;
      }

      const player = net.state.players.get(net.state.playerID);
      drawBar(50, 275, 175, 37.5, colors["???"]);

      ctx.save();
      ctx.translate(50, 175);
      ctx.beginPath();
      ctx.arc(0, 0, 35, 0, Math.PI * 2);
      setStyle(colors.playerYellow, 4, 0.2, ctx);
      ctx.fill();
      ctx.stroke();

      if (player) {
        drawFace(
          13,
          player.facing,
          player.mood,
          player.mouthDip,
          player.attack ? 2 : player.defend ? 3 : 1,
        );
        drawBar(
          70,
          70 + 155 * player.secondaryHealthBar,
          0,
          25,
          colors.legendary,
        );
        drawBar(
          70,
          70 + 155 * player.healthRatio,
          0,
          27.5,
          player.poisoned
            ? mixColors(
                colors.common,
                colors.irisPurple,
                0.5 + Math.sin(performance.now() / 333 + player.id * 3) * 0.5,
              )
            : colors.common,
        );
        drawBar(70, 70 + 155 * player.shieldRatio, 0, 22.5, colors.white);
        cuteLittleAnimations.nameText = lerp(
          cuteLittleAnimations.nameText,
          197.5,
          0.1,
        );
      } else {
        drawFace(13, 0, 1, 0.6, 1, true);
        cuteLittleAnimations.nameText = lerp(
          cuteLittleAnimations.nameText,
          180,
          0.1,
        );
      }

      ctx.restore();

      text(net.state.username, cuteLittleAnimations.nameText, 175, 20);

      drawBar(175, 275, 210, 22.5, colors["???"]);
      drawBar(
        175,
        175 + 100 * net.state.levelProgress,
        210,
        15,
        colors.playerYellow,
      );
      text("Level " + net.state.level, 225, 210, 12);
    }
  }

  if (net.state.alivePlayers && net.state.alivePlayers.length > 0) {
    // Leaderboard
    const spacing = 35;
    const barMaxWidth = 180;
    let x = width - barMaxWidth - 30;
    let y = 175;

    const playersSorted = [...net.state.alivePlayers]
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 10);

    const maxXp = playersSorted[0].xp;

    playersSorted.forEach((player) => {
      const barWidth =
        maxXp > 0 ? (player.xp / maxXp) * barMaxWidth : barMaxWidth;
      const barSize = 35;
      const color =
        [colors.playerYellow, colors.team1, colors.team2][player.team] ??
        colors.crafting;

      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      drawBar(x, x + barMaxWidth, y, barSize, colors.lighterBlack);
      drawBar(x, x + barWidth, y, barSize * 0.75, color);

      let w =
        x +
        text(
          `${player.username} - ${formatLargeNumber(player.xp.toFixed(2))}`,
          x,
          y,
          barSize * 0.5,
          colors.white,
        );
      w += text(
        ` (${net.state.tiers[player.highestRarity].name.charAt(0)}.)`,
        w,
        y,
        barSize * 0.5,
        net.state.tiers[player.highestRarity].color,
      );

      x -= 45;
      setStyle(color, 4);
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();

      ctx.translate(x, y);
      drawFace(7, -Math.PI / 4, 1.7, 1.7, 1);
      ctx.translate(-x, -y);

      y += spacing + 15;
      x += 45;
    });
  }

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (
    JSON.stringify(net.state.inventory2) !== JSON.stringify(net.state.inventory)
  ) {
    if (menu.classList.contains("active")) {
      drawInventory();
    }
    net.state.inventory2 = JSON.parse(JSON.stringify(net.state.inventory));
  }

  net.state._foundHover = false;

  if (menu.classList.contains("active") && net.state.petalElements) {
    net.state.petalElements.forEach((petal) => {
      const rect = petal.icon.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const mouseX = mouse.x / window.devicePixelRatio;
      const mouseY = mouse.y / window.devicePixelRatio;

      const visible =
        rect.top >= menuRect.top &&
        rect.bottom <= menuRect.bottom &&
        rect.left >= menuRect.left &&
        rect.right <= menuRect.right;

      const hovered =
        visible &&
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom;

      if (hovered) {
        net.state._foundHover = true;

        net.state.inventoryPetalHover = [
          petal.index,
          petal.rarity,
          rect.left + rect.width / 2,
          rect.top + rect.height / 2 - 22,
        ];

        if (
          !inventoryDragConfig.enabled &&
          !dragConfig.enabled &&
          !joystick.on &&
          mouse.left &&
          rect.y > menuRect.top
        ) {
          beginInventoryDragDrop(
            (rect.x * 1.1) / uScale,
            (rect.y * 1.1) / uScale,
            rect.width,
            petal.index,
            petal.rarity,
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

  if (!net.state._foundHover) {
    net.state.inventoryPetalHover = null;
  }

  ctx.restore();

  {
    // Hovers

    net.state.petalHoverAlpha ??= 0;
    net.state.lastPetalHover ??= null;

    const inventoryHover = Array.isArray(net.state.inventoryPetalHover)
      ? net.state.inventoryPetalHover
      : null;

    if (inventoryHover) {
      const img = petalTooltip(...inventoryHover);

      const maxW = 300;
      const minW = 180;

      let w = Math.min(maxW, Math.max(minW, window.innerWidth * 0.22));
      let h = (w * img.height) / img.width;

      const box = document.createElement("div");
      box.style.position = "fixed";

      let left = inventoryHover[2] - w / 2;
      let top = inventoryHover[3] - h - 12;

      left = Math.max(0, Math.min(left, window.innerWidth - w));
      top = Math.max(0, Math.min(top, window.innerHeight - h));

      box.style.left = `${left}px`;
      box.style.top = `${top}px`;

      const cv = document.createElement("canvas");
      cv.width = w;
      cv.height = h;

      const cx = cv.getContext("2d");
      cx.imageSmoothingEnabled = true;
      cx.imageSmoothingQuality = "high";
      cx.drawImage(img, 0, 0, w, h);

      box.appendChild(cv);

      inventoryTooltipLayer.replaceChildren(box);
      inventoryTooltipLayer.style.display = "block";
    } else {
      inventoryTooltipLayer.replaceChildren();
      inventoryTooltipLayer.style.display = "none";
    }

    if (Array.isArray(net.state.petalHover)) {
      net.state.lastPetalHover = [...net.state.petalHover];
      net.state.petalHoverAlpha += 0.25;
    } else {
      net.state.petalHoverAlpha -= 0.25;
    }
    net.state.petalHoverAlpha = Math.max(
      0,
      Math.min(1, net.state.petalHoverAlpha),
    );

    if (
      Array.isArray(net.state.lastPetalHover) &&
      net.state.lastPetalHover.length === 4 &&
      net.state.lastPetalHover.every((v) => v !== undefined && v !== null) &&
      !Array.isArray(net.state.inventoryPetalHover)
    ) {
      ctx.save();
      const img = petalTooltip(...net.state.lastPetalHover);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      if (net.state.petalHoverAlpha > 0) {
        ctx.globalAlpha = net.state.petalHoverAlpha;
        let bw = 350;
        let bh = (350 * img.height) / img.width;

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
      net.state.mobHoverAlpha += 0.25;
    } else {
      net.state.mobHoverAlpha -= 0.25;
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
        let bh = (-350 * img.height) / img.width;

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

    text(
      `C: ${clientDebug.fps} FPS | ${clientDebug.mspt.toFixed(2)} mspt`,
      width - 10,
      10,
      15,
    );
    text(
      `S: ${net.state.updateRate} UPS | ${+net.state.ping.toFixed(2)} ms ping`,
      width - 10,
      25,
      15,
    );

    if (net.state.socket) {
      text(
        `B(I/O): ${net.state.socket.bandWidth.in}/${net.state.socket.bandWidth.out} KB/s`,
        width - 10,
        40,
        15,
      );
    } else {
      text("Not connected", width - 10, 40, 15);
    }

    text(
      `X: ${net.state.camera?.x?.toFixed(0) ?? 0} | Y: ${net.state.camera?.y?.toFixed(0) ?? 0}`,
      width - 10,
      55,
      15,
    );

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
  }

  ctx.restore();

  if (isMobile) {
    drawButtons(ctx);
  }

  clientDebug.frames++;
  clientDebug.totalTime += performance.now() - start;

  {
    // Chat
    if (net.state.socket?.readyState !== WebSocket.OPEN) return;
    ctx.save();
    const maxWidth = width * 0.2;
    const heights = [];
    const messages = net.ChatMessage.messages;
    const msgSize = 18;

    for (let i = 0; i < messages.length; i++) {
      heights.push(
        drawWrappedText(
          messages[i].completeMessage,
          -2048,
          -2048,
          msgSize,
          270,
        ),
      );
    }

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    let y = canvas.height - 55;

    ctx.fillStyle = "rgba(0, 0, 0, .4)";
    ctx.beginPath();
    ctx.roundRect(
      -12,
      -cuteLittleAnimations.chatBGSize - 10,
      maxWidth + 22,
      cuteLittleAnimations.chatBGSize + 22,
      5,
    );

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
            const nameWidth = text(
              msg.username,
              overlayX + 7,
              50000,
              14,
              msg.color,
            );
            msgHeight = drawWrappedText(
              ": " + msg.message,
              overlayX + 7 + nameWidth,
              50000,
              14,
              overlayWidth - 20 - nameWidth,
              "#FFFFFF",
              ctx,
              overlayX + 7 + nameWidth,
            );
            msgHeight = Math.max(msgHeight, 14);
            break;
          case 1: // System
            msgHeight = drawWrappedText(
              msg.message,
              overlayX + 7,
              50000,
              14,
              overlayWidth - 20,
              msg.color,
              ctx,
              73,
            );
            break;
        }

        y -= msgHeight + 3;

        if (y < overlayY + 7) {
          net.ChatMessage.allMessages.splice(i, 1);
          continue;
        }

        switch (msg.type) {
          case 0:
            const nameWidth2 = text(
              msg.username,
              overlayX + 7,
              y,
              14,
              msg.color,
            );
            drawWrappedText(
              ": " + msg.message,
              overlayX + 7 + nameWidth2,
              y,
              14,
              overlayWidth - 20 - nameWidth2,
              "#FFFFFF",
              ctx,
              overlayX + 7 + nameWidth2,
            );
            break;
          case 1:
            drawWrappedText(
              msg.message,
              overlayX + 7,
              y,
              14,
              overlayWidth - 20,
              msg.color,
              ctx,
              73,
            );
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

        message.y = lerp(message.y, y, 0.2);
        message.ticker++;

        if (message.ticker > clientDebug.fps * 15 - messages.length * 2) {
          net.ChatMessage.messages.splice(i, 1);
          continue;
        }

        switch (message.type) {
          case 0: // Chat
            const nameWidth = text(
              message.username,
              66,
              message.y,
              15,
              message.color,
            );
            drawWrappedText(
              ": " + message.message,
              nameWidth + 66,
              message.y,
              15,
              235 - nameWidth,
              "#FFFFFF",
              ctx,
              nameWidth + 66,
            );
            break;
          case 1: // System
            drawWrappedText(
              message.message,
              66,
              message.y,
              15,
              235,
              message.color,
              ctx,
              66,
            );
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
  document
    .getElementById("biomeSelect")
    .appendChild(new Option("Halloween", "halloween"));
}

document.getElementById("usernameInputInput").value =
  localStorage.getItem("username") || "guest";
document.getElementById("gamemodeSelect").value =
  localStorage.getItem("gamemode") || "ffa";
document.getElementById("biomeSelect").value =
  localStorage.getItem("biome") || "default";
document.getElementById("enableMods").checked =
  localStorage.getItem("enableMods") === "true";
document.getElementById("privateLobby").checked =
  localStorage.getItem("privateLobby") === "true";

showMenus();
loadAndRenderChangelogs();

async function getUserFromSession() {
  try {
    const res = await fetch(`${process.env.AUTH_SERVER}/api/me`, {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) throw new Error("Not logged in");

    const user = await res.json();
    console.log("Logged in as:", user.username + "#" + user.discriminator);
    return user;
  } catch (e) {
    console.error(e);
    console.log("Not logged in");
    return null;
  }
}

// Call it anywhere
getUserFromSession();
