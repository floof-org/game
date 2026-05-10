import { state } from "./net.js";
import {
  ctx as _ctx,
  drawWrappedText,
  mixColors,
  roundedRectangle,
  text,
} from "./canvas.js";
import { formatLargeNumber, colors, options } from "./util.js";
import { Drawing, PetalConfig } from "./protocol.js";

const TAU = Math.PI * 2;

function setStyle(c, main, lineWidth = 0.1, mixStrength = 0.2) {
  c.fillStyle = main;
  c.strokeStyle = mixColors(main, "#000000", mixStrength);
  c.lineWidth = lineWidth;
}

function dipPolygon(ctx, sides, r, dipMult, R) {
  const dip = 1 - (7 / sides / sides) * dipMult;

  ctx.beginPath();

  ctx.moveTo(r, 0);

  for (let i = 0; i < sides; i++) {
    const theta = ((i + 1) / sides) * TAU;
    const hTheta = ((i + 0.5) / sides) * TAU;

    ctx.quadraticCurveTo(
      Math.cos(hTheta + R) * dip * r,
      Math.sin(hTheta + R) * dip * r,
      Math.cos(theta + R) * r,
      Math.sin(theta + R) * r,
    );
  }

  ctx.closePath();
}

function polygon(ctx, sides, r, R) {
  ctx.beginPath();

  const tTheta = TAU / sides;
  for (let i = 0; i < sides; i++) {
    const theta = i * tTheta;

    ctx.lineTo(Math.cos(theta + R) * r, Math.sin(theta + R) * r);
  }

  ctx.closePath();
}

function spikeBall(ctx, sides, r, R) {
  ctx.beginPath();

  const tTheta = TAU / sides;
  for (let i = 0; i < sides; i++) {
    const theta = i * tTheta;

    ctx.lineTo(Math.cos(theta + R) * r, Math.sin(theta + R) * r);
    ctx.lineTo(
      Math.cos(theta + R + tTheta / 2) * r * 0.5,
      Math.sin(theta + R + tTheta / 2) * r * 0.5,
    );
  }

  ctx.closePath();
}

function scorpionPincer(ctx) {
  ctx.beginPath();
  ctx.lineTo(0, 0);
  ctx.quadraticCurveTo(0.7, -0.16, 0.64, -0.22);
  ctx.quadraticCurveTo(0.64, -0.35, -0.03, -0.2);
  ctx.closePath();
  ctx.fill();
}

function basicPetal(ctx = _ctx, hit = false, col = colors.white, size = 7.5) {
  setStyle(
    ctx,
    mixColors(col, "#FF0000", hit * 0.5),
    0.225 * Math.max(10 / 7.5, 10 / size),
  );
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.fill();
  ctx.stroke();
}

function drawBasicPetals(
  ctx = _ctx,
  index,
  rarity,
  size = 1,
  color = colors.white,
) {
  let count = state.petalConfigs[index].tiers[rarity].count;
  setStyle(ctx, color, count > 1 ? 0.175 : 0.2);

  if (count > 1) {
    for (let i = count; i > 0; i--) {
      const angle = (TAU / count) * i;

      ctx.beginPath();
      ctx.arc(Math.cos(angle) * 0.7, Math.sin(angle) * 0.7, size, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
    }
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
}

function drawStinger(ctx = _ctx, index, rarity) {
  let count = state.petalConfigs[index].tiers[rarity].count;
  setStyle(ctx, colors.stingerBlack, 0.3, 0);

  if (count > 1) {
    for (let i = count; i > 0; i--) {
      const angle = (TAU / count) * i;
      const x = Math.cos(angle) * 0.65;
      const y = Math.sin(angle) * 0.65;

      ctx.translate(x, y);
      polygon(ctx, 3, 0.5, angle);
      ctx.fill();
      ctx.stroke();

      ctx.translate(-x, -y);
    }
  } else {
    polygon(ctx, 3, 0.5, 0);
    ctx.fill();
    ctx.stroke();
  }
}

function trianglePetal(ctx = _ctx, hit = false, col = colors.white) {
  setStyle(ctx, mixColors(col, "#FF0000", hit * 0.5), 0.6, 0);
  ctx.beginPath();
  polygon(ctx, 3, 0.9, 0);
  ctx.fill();
  ctx.stroke();
}

function drawHeavy(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.stingerBlack, "#FF0000", hit * 0.5), 0.2);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = colors.white;
  ctx.beginPath();
  ctx.arc(0.25, -0.25, 0.25, 0, TAU);
  ctx.closePath();
  ctx.fill();
}

function drawRice(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.white, "#FF0000", hit * 0.5), 1);
  ctx.rotate(Math.PI / 4);
  ctx.scale(0.7, 0.7);

  ctx.beginPath();
  ctx.moveTo(-1, 0);
  ctx.quadraticCurveTo(0, -0.4, 1, 0);
  ctx.stroke();
  ctx.closePath();

  ctx.strokeStyle = ctx.fillStyle;
  ctx.lineWidth /= 2;
  ctx.beginPath();
  ctx.moveTo(-1, 0);
  ctx.quadraticCurveTo(0, -0.4, 1, 0);
  ctx.stroke();
  ctx.closePath();
}

function drawRockP(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.rockGray, "#FF0000", hit * 0.5), 0.2);
  polygon(ctx, 5, 1, 0);
  ctx.fill();
  ctx.stroke();
}

function drawCactusPetal(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.cactusGreen, "#FF0000", hit * 0.5), 0.2);
  dipPolygon(ctx, 8, 1, 2.5, 0);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = mixColors(colors.cactusLightGreen, "#FF0000", hit * 0.5);
  ctx.beginPath();
  ctx.arc(0, 0, 0.5, 0, TAU);
  ctx.closePath();
  ctx.fill();
}

function drawLeaf(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.leafGreen, "#FF0000", hit * 0.5), 0.15);
  ctx.beginPath();
  ctx.moveTo(-0.6609, 0.4525);
  ctx.quadraticCurveTo(-0.2989, 0.6336, 0.1536, 0.5431);
  ctx.quadraticCurveTo(0.5157, 0.4525, 0.7872, 0.2715);
  ctx.quadraticCurveTo(1.104, 0.0453, 0.8777, -0.181);
  ctx.quadraticCurveTo(0.6062, -0.4525, 0.1536, -0.5431);
  ctx.quadraticCurveTo(-0.2989, -0.6336, -0.7062, -0.4073);
  ctx.quadraticCurveTo(-1.2493, 0.0453, -0.6609, 0.4525);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0.6, 0);
  ctx.quadraticCurveTo(0, 0.1, -0.6, 0);
  ctx.moveTo(-1, 0);
  ctx.quadraticCurveTo(-1.3, -0.05, -1.35, -0.1);
  ctx.stroke();
  ctx.closePath();
}

function drawWing(ctx = _ctx, hit = false) {
  ctx.rotate(Math.PI / -4);
  setStyle(ctx, mixColors(colors.white, "#FF0000", hit * 0.5), 0.2);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 1.1);
  ctx.quadraticCurveTo(0, 0.8, 0.9, -0.3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawBone(ctx = _ctx, hit = false) {
  setStyle(
    ctx,
    mixColors(mixColors(colors.white, "#000000", 0.2), "#FF0000", hit * 0.5),
    0.2,
  );

  ctx.scale(0.8, 0.8);

  ctx.beginPath();
  ctx.arc(0.33, 0.93, 0.39, -Math.PI * 0.1, Math.PI * 1.05);
  ctx.fill();
  ctx.closePath();
  ctx.beginPath();
  ctx.arc(0.7, 0.69, 0.39, -Math.PI * 0.45, Math.PI * 0.6);
  ctx.fill();
  ctx.closePath();
  ctx.beginPath();
  ctx.arc(-0.7, -0.67, 0.39, Math.PI * 0.69, Math.PI * 1.8);
  ctx.fill();
  ctx.closePath();
  ctx.beginPath();
  ctx.arc(-0.32, -0.91, 0.39, Math.PI * 0.95, 0.1);
  ctx.fill();
  ctx.closePath();

  setStyle(ctx, mixColors(colors.white, "#FF0000", hit * 0.5), 0.2);

  ctx.beginPath();
  ctx.arc(0.33, 0.93, 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
  ctx.beginPath();
  ctx.arc(0.7, 0.69, 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
  ctx.beginPath();
  ctx.arc(-0.7, -0.67, 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();
  ctx.beginPath();
  ctx.arc(-0.32, -0.91, 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.lineTo(0.035, 0.86);
  ctx.quadraticCurveTo(-0.03, 0.07, -0.86, -0.41);
  ctx.lineTo(-0.5, -0.78);
  ctx.lineTo(-0.02, -0.86);
  ctx.quadraticCurveTo(0.03, -0.07, 0.8, 0.42);
  ctx.lineTo(0.51, 0.789);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.lineTo(0.035, 0.86);
  ctx.quadraticCurveTo(-0.03, 0.07, -0.86, -0.41);
  ctx.moveTo(0.8, 0.42);
  ctx.quadraticCurveTo(0.03, -0.07, -0.02, -0.86);
  ctx.stroke();
  ctx.closePath();
}

function drawDirt(ctx = _ctx, hit = false) {
  setStyle(
    ctx,
    mixColors(
      mixColors(colors.scorpionBrown, colors.spider, 0.25),
      "#FF0000",
      0.75 * hit,
    ),
    0.3,
  );

  dipPolygon(ctx, 7, 1, 1.5, 0);
  ctx.fill();
  ctx.stroke();
}

function drawMagnolia(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.ladybugRed, "#FF0000", hit * 0.5), 0.2);
  dipPolygon(ctx, 9, 1, 4, 0);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = mixColors(
    mixColors(colors.ladybugRed, colors.white, 0.2),
    "#FF0000",
    hit * 0.5,
  );
  ctx.beginPath();
  ctx.arc(0, 0, 0.5, 0, TAU);
  ctx.closePath();
  ctx.fill();
}

function drawCorn(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.beeYellow, "#FF0000", hit * 0.5), 0.25);
  ctx.beginPath();
  ctx.moveTo(0.85, 0.85);
  ctx.quadraticCurveTo(1.3, 0, 0.85, -0.85);
  ctx.bezierCurveTo(0.55, -1.3, -0.05, -0.95, -0.9, -0.65);
  ctx.quadraticCurveTo(0, 0, -0.9, 0.65);
  ctx.bezierCurveTo(-0.05, 0.95, 0.55, 1.3, 0.85, 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawSingleSand(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.sand, "#FF0000", hit * 0.5), 0.4);

  polygon(ctx, 6, 1, 0);
  ctx.fill();
  ctx.stroke();
}

function drawSands(ctx = _ctx, index, rarity) {
  let count = state.petalConfigs[index].tiers[rarity].count;
  setStyle(ctx, colors.sand, 0.2);

  if (count > 1) {
    for (let i = 0; i < count; i++) {
      const angle = (TAU / count) * i;

      ctx.save();
      ctx.translate(Math.cos(angle) * 0.7, Math.sin(angle) * 0.7);
      polygon(ctx, 6, 0.5, angle + Math.PI / 4);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  } else {
    polygon(ctx, 6, 0.5, Math.PI / 4);
    ctx.fill();
    ctx.stroke();
  }
}

function drawOrange(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.orange, "#FF0000", hit * 0.5), 0.2);

  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  setStyle(ctx, mixColors(colors.leafGreen, "#FF0000", hit * 0.5), 0.2);

  ctx.translate(0, 0.5);
  ctx.beginPath();
  ctx.moveTo(0, -1);
  ctx.quadraticCurveTo(0.7, -1.5, 1.4, -0.9);
  ctx.quadraticCurveTo(0.6, -0.5, 0, -1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawOranges(ctx = _ctx, index, rarity) {
  let count = state.petalConfigs[index].tiers[rarity].count;
  if (count > 1) {
    for (let i = 0; i < count; i++) {
      const angle = (TAU / count) * i;

      ctx.save();
      ctx.translate(Math.cos(angle) * 0.6, Math.sin(angle) * 0.6);
      ctx.scale(0.8, 0.8);
      ctx.rotate(Math.PI / 2 + angle);
      drawOrange(ctx, false);
      ctx.restore();
    }
  } else {
    ctx.save();
    ctx.scale(0.9, 0.9);
    drawOrange(ctx, false);
    ctx.restore();
  }
}

function drawMissile(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.stingerBlack, "#FF0000", hit * 0.5), 0.6, 0);

  ctx.scale(0.8, 0.8);
  ctx.beginPath();
  ctx.moveTo(1, 0);
  ctx.lineTo(-0.9, -0.667);
  ctx.lineTo(-0.9, 0.667);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawWaspMissile(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.stingerBlack, "#FF0000", hit * 0.5), 0.6, 0);

  ctx.scale(0.8, 0.8);
  ctx.beginPath();
  ctx.moveTo(1, 0);
  ctx.lineTo(-0.9, -0.775);
  ctx.lineTo(-0.9, 0.775);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawYinYang(ctx = _ctx, hit = false) {
  const YINYANG_W = mixColors("#FFFFFF", "#FF0000", hit * 0.5);
  const YINYANG_WB = mixColors("#EAEAEA", "#FF0000", hit * 0.5);
  const YINYANG_B = mixColors("#333333", "#FF0000", hit * 0.5);
  const YINYANG_BB = mixColors("#303030", "#FF0000", hit * 0.5);

  ctx.lineWidth = 0.2;
  ctx.fillStyle = YINYANG_W;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU, false);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = YINYANG_B;
  ctx.beginPath();
  ctx.arc(0, 0, 1, -Math.PI / 2, Math.PI / 2, false);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = YINYANG_B;
  ctx.beginPath();
  ctx.arc(0, 0.5, 0.5, 0, TAU, false);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = YINYANG_W;
  ctx.beginPath();
  ctx.arc(0, -0.5, 0.5, 0, TAU, false);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = YINYANG_BB;
  ctx.beginPath();
  ctx.arc(0, 0, 1, -Math.PI / 2, 0, false);
  ctx.stroke();
  ctx.closePath();

  ctx.strokeStyle = YINYANG_WB;
  ctx.beginPath();
  ctx.arc(0, 0, 1, -Math.PI / 2, Math.PI / 2, true);
  ctx.stroke();
  ctx.closePath();

  ctx.strokeStyle = YINYANG_BB;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI / 2, false);
  ctx.stroke();
  ctx.closePath();

  ctx.strokeStyle = YINYANG_BB;
  ctx.beginPath();
  ctx.arc(0, 0.5, 0.5, -Math.PI / 2, Math.PI / 2, true);
  ctx.stroke();
  ctx.closePath();

  ctx.strokeStyle = YINYANG_WB;
  ctx.beginPath();
  ctx.arc(0, -0.5, 0.5, -Math.PI / 2, Math.PI / 2, false);
  ctx.stroke();
  ctx.closePath();

  ctx.fillStyle = YINYANG_W;
  ctx.beginPath();
  ctx.arc(0, 0.5, 0.15, 0, TAU, false);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = YINYANG_B;
  ctx.beginPath();
  ctx.arc(0, -0.5, 0.15, 0, TAU, false);
  ctx.closePath();
  ctx.fill();
}

function drawHoney(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.honeyGold, "#FF0000", hit * 0.5), 0.25);
  polygon(ctx, 6, 1, 0);
  ctx.fill();
  ctx.stroke();
}

function drawWebPetal(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.white, "#FF0000", hit * 0.5), 0.2);
  dipPolygon(ctx, 5, 1, 1.5, 0);
  ctx.fill();
  ctx.stroke();
}

// function drawWebMob(ctx = _ctx, friend = false) {
//     setStyle(ctx, friend ? colors.cumWhite : colors.white, .1);
//     dipPolygon(ctx, 13, 1, 5, 0);
//     ctx.stroke();
//     dipPolygon(ctx, 13, .8, 5, 0);
//     ctx.stroke();
//     dipPolygon(ctx, 13, .6, 5, 0);
//     ctx.stroke();
//     dipPolygon(ctx, 13, .4, 5, 0);
//     ctx.stroke();

//     ctx.beginPath();
//     for (let i = 0; i < 13; i++) {
//         ctx.moveTo(0, 0);
//         ctx.lineTo(Math.cos(TAU / 13 * i) * 1.1, Math.sin(TAU / 13 * i) * 1.1);
//     }
//     ctx.stroke();
//     ctx.closePath();
// }

function drawWebMob(ctx = _ctx, color = colors.white) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.07;
  ctx.globalAlpha *= 0.4;

  function dipPolygon2(ctx, sides, r, dipMult) {
    const dip = 1 - (7 / sides / sides) * dipMult;

    ctx.moveTo(r, 0);

    for (let i = 0; i < sides; i++) {
      const theta = ((i + 1) / sides) * TAU;
      const hTheta = ((i + 0.5) / sides) * TAU;

      ctx.quadraticCurveTo(
        Math.cos(hTheta) * dip * r,
        Math.sin(hTheta) * dip * r,
        Math.cos(theta) * r,
        Math.sin(theta) * r,
      );
    }
  }

  ctx.beginPath();
  dipPolygon2(ctx, 13, 1, 5);
  dipPolygon2(ctx, 13, 0.8, 5);
  dipPolygon2(ctx, 13, 0.6, 5);
  dipPolygon2(ctx, 13, 0.4, 5);
  for (let i = 0; i < 13; i++) {
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos((TAU / 13) * i) * 1.1, Math.sin((TAU / 13) * i) * 1.1);
  }
  ctx.stroke();
  ctx.closePath();
}

export function drawThirdEye(ctx = _ctx, hit = false) {
  ctx.fillStyle = mixColors(colors.lighterBlack, "#FF0000", hit * 0.5);
  ctx.strokeStyle = ctx.fillStyle;
  ctx.lineWidth = 0.1;
  ctx.beginPath();
  ctx.moveTo(0, -1);
  ctx.quadraticCurveTo(-1, 0, 0, 1);
  ctx.quadraticCurveTo(1, 0, 0, -1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = mixColors(colors.white, "#FF0000", hit * 0.5);
  ctx.beginPath();
  ctx.arc(0, 0, 0.5, 0, TAU);
  ctx.closePath();
  ctx.fill();
}

function drawPincer(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.lighterBlack, "#FF0000", hit * 0.5), 0.2);
  ctx.beginPath();
  ctx.moveTo(-1, -0.2);
  ctx.quadraticCurveTo(-0.2, -0.95, 0.9, 0.2);
  ctx.lineTo(0.9, 0.2);
  ctx.quadraticCurveTo(0.2, -0.1, -1, 0.2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawEgg(ctx = _ctx, color, hit = false) {
  // const size = .9 + (rarity * .025);

  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.2);
  ctx.beginPath();
  ctx.ellipse(0, 0, 0.775, 1, 0, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

export function drawAntennae(ctx = _ctx) {
  ctx.save();
  setStyle(ctx, colors.lighterBlack, 0.1);
  ctx.scale(1.5, 1.5);
  ctx.beginPath();
  ctx.moveTo(0.16, 0);
  ctx.quadraticCurveTo(0.18, -0.51, 0.49, -0.83);
  ctx.quadraticCurveTo(0.3, -0.41, 0.16, 0);
  ctx.moveTo(-0.16, 0);
  ctx.quadraticCurveTo(-0.18, -0.51, -0.49, -0.83);
  ctx.quadraticCurveTo(-0.3, -0.41, -0.16, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawPeas(ctx = _ctx, hit = false, color, index) {
  let count = state.petalConfigs[index].splits;

  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.25);
  for (let i = 0; i < count; i++) {
    const angle = (i * TAU) / count + TAU / 8;
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * 0.75, Math.sin(angle) * 0.75, 0.75, 0, TAU);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function drawStick(color, ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.4);

  ctx.beginPath();
  ctx.moveTo(-1, 0);
  ctx.lineTo(1, 0);
  ctx.moveTo(-0.6, -0.6);
  ctx.lineTo(-0.75, 0.4);
  ctx.moveTo(0.6, -0.4);
  ctx.lineTo(0.8, 0.8);
  ctx.stroke();
  ctx.closePath();
}

function drawScorpionProjectile(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.stingerBlack, "#FF0000", hit * 0.5), 0.6, 0);

  ctx.beginPath();
  ctx.moveTo(1, 0);
  ctx.lineTo(-0.65, -1);
  ctx.lineTo(-0.65, 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawDahlia(ctx = _ctx, index, rarity) {
  let count = state.petalConfigs[index].tiers[rarity].count;
  setStyle(ctx, colors.rosePink, 0.2);

  if (count > 1) {
    for (let i = 0; i < count; i++) {
      const angle = (TAU / count) * i + TAU / 12;

      ctx.beginPath();
      ctx.arc(Math.cos(angle) * 0.66, Math.sin(angle) * 0.66, 0.5, 0, TAU);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, 0.5, 0, TAU);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function drawPrimrose(ctx = _ctx, hit = false, real = false) {
  if (real) {
    ctx.shadowColor = "#FFFFFF";
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, TAU);
    ctx.closePath();
    ctx.fill();
  }

  setStyle(ctx, mixColors(colors.honeyGold, "#FF0000", hit * 0.5), 0.15);

  ctx.rotate(Math.PI / 6);
  dipPolygon(ctx, 3, 1.2, 0.1, 0);
  ctx.rotate(-Math.PI / 6);
  ctx.fill();
  ctx.stroke();

  dipPolygon(ctx, 3, 0.8, 0.1, 0);
  ctx.fill();
  ctx.stroke();

  setStyle(ctx, mixColors(colors.rosePink, "#FF0000", hit * 0.5), 0.075);
  for (let i = 0; i < 3; i++) {
    const angle = (TAU / 3) * i + TAU / 6;

    ctx.beginPath();
    ctx.arc(Math.cos(angle) * 0.3, Math.sin(angle) * 0.3, 0.12, 0, TAU);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function drawSpellbook(ctx = _ctx, hit = false, real = false, spell = 0) {
  if (real) {
    ctx.shadowColor = "#C85555";
    ctx.shadowBlur = 10 + Math.sin(performance.now() / 300) * 5;

    ctx.beginPath();
    ctx.arc(0, 0, 1, 0, TAU);
    ctx.closePath();
    ctx.fill();
  }

  ctx.shadowBlur = 0;

  setStyle(ctx, mixColors(colors.book, "#FF0000", hit * 0.5), 0.15);
  ctx.beginPath();
  ctx.rect(-1, -1, 2, 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = mixColors(
    mixColors(colors.bookSpine, "#000000", 0.2),
    "#FF0000",
    hit * 0.5,
  );
  ctx.lineWidth = 0.2;
  ctx.beginPath();
  ctx.moveTo(-1, -1);
  ctx.lineTo(-1, 1);
  ctx.stroke();

  switch (spell) {
    case 0: // Pentagram
      setStyle(
        ctx,
        mixColors(colors.evilLadybugRed, "#FF0000", hit * 0.5),
        0.1,
      );
      polygon(ctx, 5, 0.35, 0);
      ctx.fill();
      ctx.stroke();
      break;
    case 1: // Earth
      setStyle(ctx, mixColors(colors.rockGray, "#FF0000", hit * 0.5), 0.1);
      polygon(ctx, 6, 0.35, 0);
      ctx.fill();
      ctx.stroke();
      break;
  }
}

const spikeSize = TAU / 12;
function drawDeity(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.lightningTeal, "#FF0000", hit * 0.5), 0.125);

  ctx.beginPath();

  for (let i = 0; i < 3; i++) {
    const angle = (i * TAU) / 3;
    const m = angle - spikeSize;
    const M = angle + spikeSize;
    const a3 = angle + Math.PI / 3;
    const A3 = angle + (Math.PI / 3) * 2;

    ctx.lineTo(Math.cos(m) * 0.75, Math.sin(m) * 0.75);
    ctx.lineTo(Math.cos(angle), Math.sin(angle));
    ctx.bezierCurveTo(
      Math.cos(M) * 0.75,
      Math.sin(M) * 0.75,
      Math.cos(a3) * 0.5,
      Math.sin(a3) * 0.5,
      Math.cos(A3) * 0.5,
      Math.sin(A3) * 0.5,
    );
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawLightning(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.lightningTeal, "#FF0000", hit * 0.5), 0.125);
  spikeBall(ctx, 10, 1, 0);
  ctx.fill();
  ctx.stroke();
}

function drawPowderStatic(ctx = _ctx) {
  ctx.fillStyle = colors.white;

  for (let i = 0; i < 8; i++) {
    const angle = (TAU / 8) * i;

    const d = i % 3 === 0 ? 0.5 : 0.25;

    ctx.beginPath();
    ctx.arc(Math.cos(angle) * d, Math.sin(angle) * d, 0.3, 0, TAU);
    ctx.closePath();
    ctx.fill();
  }
}

function drawPowderDynamic(id, ctx = _ctx, hit = false) {
  ctx.fillStyle = mixColors(colors.white, "#FF0000", hit * 0.5);

  for (let i = 0; i < 8; i++) {
    const angle =
      (TAU / 8) * i +
      Math.cos(performance.now() * 0.005 - id) +
      id * 4 +
      i * 0.05;

    const d =
      (i % 3 === 0 ? 0.6 : 0.4) *
      (Math.sin(performance.now() * 0.005 + id * 3 + i * 0.2) * 0.5 + 0.6);

    ctx.beginPath();
    ctx.arc(
      Math.cos(angle) * d,
      Math.sin(angle) * d,
      0.5 * (Math.cos(performance.now() * 0.005 + id * 5 + i * 0.2) * 0.3 + 1),
      0,
      TAU,
    );
    ctx.closePath();
    ctx.fill();
  }
}

function drawAntEgg(ctx = _ctx, index, rarity) {
  let count = 4;
  setStyle(ctx, colors.peach, 0.2);

  if (count > 1) {
    for (let i = 0; i < count; i++) {
      const angle = (i * TAU) / count;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * 0.67, Math.sin(angle) * 0.67, 0.7, 0, TAU);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else {
    ctx.beginPath();
    ctx.arc(0, 0, 0.7, 0, TAU);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function drawYucca(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.peaGreen, "#FF0000", hit * 0.5), 0.225);
  ctx.beginPath();
  ctx.moveTo(1.1, 0);
  ctx.bezierCurveTo(0.5, -0.9, -0.5, -0.7, -1.1, 0);
  ctx.bezierCurveTo(-0.9, 0.9, 0.5, 0.7, 1.1, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(1, 0);
  ctx.quadraticCurveTo(0.4, -0.4, -1, 0);
  ctx.stroke();
}

const magnetPath = new Path2D(
  "M-.03 0-.36-0Q-.4-.21-.2-.4-.01-.56.45-.43A.04.04-88.1 01.33-.11Q.18-.17.05-.15-.05-.13-.03 0Z",
);
const magnet2Path = new Path2D(
  "M-.03 0-.36 0Q-.4.21-.2.4-.01.56.45.43A.04.04 90 00.33.11Q.18.17.05.15-.05.13-.03 0Z",
);

function drawMagnet(ctx = _ctx, hit = false) {
  ctx.save();
  ctx.scale(2, 2);
  setStyle(ctx, mixColors("#4343A4", "#FF0000", hit * 0.5), 0.15);
  ctx.fill(magnetPath);
  ctx.stroke(magnetPath);
  setStyle(ctx, mixColors("#A44343", "#FF0000", hit * 0.5), 0.15);
  ctx.fill(magnet2Path);
  ctx.stroke(magnet2Path);
  ctx.restore();
}

export function drawAmulet(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.sandGold, "#FF0000", hit * 0.5), 0.15);

  ctx.beginPath();

  for (let i = 0; i < 3; i++) {
    const angle = (i * TAU) / 3;
    const m = angle - spikeSize;
    const M = angle + spikeSize;
    const a3 = angle + Math.PI / 3;
    const A3 = angle + (Math.PI / 3) * 2;

    ctx.lineTo(Math.cos(m), Math.sin(m));
    ctx.lineTo(Math.cos(angle), Math.sin(angle));
    ctx.bezierCurveTo(
      Math.cos(M),
      Math.sin(M),
      Math.cos(a3) * 0.4,
      Math.sin(a3) * 0.4,
      Math.cos(A3) * 0.3,
      Math.sin(A3) * 0.3,
    );
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, 0.15, 0, TAU);
  ctx.fillStyle = colors.cactusLightGreen;
  ctx.fill();
}

export function drawArmor(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.stingerBlack, "#FF0000", hit * 0.5), 0.2, 0);

  ctx.beginPath();
  polygon(ctx, 6, 1, Math.PI / 6);
  ctx.arc(0, 0, 0.8, 0, TAU);
  ctx.fill("evenodd");
  ctx.stroke();
  ctx.closePath();
}

function drawJelly(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.jelly, "#FF0000", hit * 0.5), 0.15);

  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.closePath();
  ctx.globalAlpha = 0.7;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.stroke();

  ctx.fillStyle = ctx.strokeStyle;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.arc(-0.1, 0.35, 0.4, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0.5, -0.4, 0.2, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-0.4, -0.3, 0.3, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.closePath();

  ctx.globalAlpha = 1;
}

function drawYggdrasil(ctx = _ctx, hit = false) {
  const innerColor = mixColors("#aa853f", "#FF0000", hit * 0.5);
  const outerColor = mixColors("#876e36", "#FF0000", hit * 0.5);

  // Outer color
  ctx.lineCap = "round";
  ctx.strokeStyle = outerColor;
  ctx.fillStyle = outerColor;
  ctx.beginPath(); // Stem
  ctx.moveTo(1.13, 0.54);
  ctx.quadraticCurveTo(1.2, 0.6, 1.16, 0.69);
  ctx.quadraticCurveTo(1.13, 0.8, 1.03, 0.81);
  ctx.quadraticCurveTo(-0.52, 0.14, -0.63, -1.13);
  ctx.lineTo(-0.56, -1.13);
  ctx.quadraticCurveTo(-0.1, 0.38, 1.13, 0.54);
  ctx.lineWidth = 0.4;
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath(); // Curvy leaf
  ctx.moveTo(0.72, 0.54);
  ctx.quadraticCurveTo(0.3, 0.97, -0.49, 0.13);
  ctx.quadraticCurveTo(-0.92, -0.44, -0.57, -0.98);
  ctx.quadraticCurveTo(-0.2, -1.01, 0.24, -0.8);
  ctx.quadraticCurveTo(1.31, -0.2, 0.72, 0.54);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath(); // Spines
  ctx.lineWidth = 0.4;
  ctx.moveTo(0.97, -0.14);
  ctx.quadraticCurveTo(0.91, 0.24, 0.72, 0.54);
  ctx.moveTo(0.82, -0.47);
  ctx.quadraticCurveTo(0.78, -0.13, 0.61, 0.38);
  ctx.moveTo(0.66, -0.7);
  ctx.quadraticCurveTo(0.64, -0.38, 0.43, 0.26);
  ctx.moveTo(0.46, -0.79);
  ctx.quadraticCurveTo(0.42, -0.36, 0.22, 0.1);
  ctx.moveTo(0.26, -0.92);
  ctx.quadraticCurveTo(0.21, -0.59, 0.04, -0.06);
  ctx.moveTo(0.02, -0.97);
  ctx.quadraticCurveTo(0, -0.72, -0.14, -0.28);
  ctx.moveTo(-0.18, -1.04);
  ctx.quadraticCurveTo(-0.17, -0.83, -0.29, -0.47);
  ctx.moveTo(-0.38, -1.07);
  ctx.quadraticCurveTo(-0.35, -0.34, -0.74, -0.88);
  ctx.moveTo(-0.76, -0.59);
  ctx.quadraticCurveTo(-0.61, -0.49, -0.4, -0.46);
  ctx.moveTo(-0.78, -0.34);
  ctx.quadraticCurveTo(-0.61, -0.26, -0.3, -0.24);
  ctx.moveTo(-0.69, -0.06);
  ctx.quadraticCurveTo(-0.47, -0.04, -0.15, -0.09);
  ctx.moveTo(-0.65, 0.14);
  ctx.quadraticCurveTo(-0.47, 0.15, 0.05, 0.05);
  ctx.moveTo(-0.53, 0.33);
  ctx.quadraticCurveTo(-0.18, 0.32, 0.12, 0.2);
  ctx.quadraticCurveTo(-0.19, 0.31, 0.12, 0.2);
  ctx.moveTo(-0.35, 0.5);
  ctx.quadraticCurveTo(0.02, 0.47, 0.27, 0.35);
  ctx.moveTo(-0.08, 0.63);
  ctx.quadraticCurveTo(0.15, 0.6, 0.49, 0.47);
  ctx.moveTo(0.26, 0.72);
  ctx.quadraticCurveTo(0.5, 0.72, 0.72, 0.54);
  ctx.stroke();

  // Inner color
  ctx.strokeStyle = innerColor;
  ctx.fillStyle = innerColor;
  ctx.beginPath(); // Stem
  ctx.moveTo(1.13, 0.54);
  ctx.quadraticCurveTo(1.2, 0.6, 1.16, 0.69);
  ctx.quadraticCurveTo(1.13, 0.8, 1.03, 0.81);
  ctx.quadraticCurveTo(-0.52, 0.14, -0.63, -1.13);
  ctx.lineTo(-0.56, -1.13);
  ctx.quadraticCurveTo(-0.1, 0.38, 1.13, 0.54);
  ctx.lineWidth = 0.1;
  ctx.stroke();
  ctx.fill();
  ctx.closePath();

  ctx.lineCap = "square";
  ctx.beginPath(); // Curvy leaf
  ctx.lineWidth = 0.1;
  ctx.moveTo(0.72, 0.54);
  ctx.quadraticCurveTo(0.3, 0.97, -0.49, 0.13);
  ctx.quadraticCurveTo(-0.92, -0.44, -0.57, -0.98);
  ctx.quadraticCurveTo(-0.2, -1.01, 0.24, -0.8);
  ctx.quadraticCurveTo(1.31, -0.2, 0.72, 0.54);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath(); // Spines
  ctx.lineWidth = 0.125;
  ctx.moveTo(0.97, -0.14);
  ctx.quadraticCurveTo(0.91, 0.24, 0.72, 0.54);
  ctx.moveTo(0.82, -0.47);
  ctx.quadraticCurveTo(0.78, -0.13, 0.61, 0.38);
  ctx.moveTo(0.66, -0.7);
  ctx.quadraticCurveTo(0.64, -0.38, 0.43, 0.26);
  ctx.moveTo(0.46, -0.79);
  ctx.quadraticCurveTo(0.42, -0.36, 0.22, 0.1);
  ctx.moveTo(0.26, -0.92);
  ctx.quadraticCurveTo(0.21, -0.59, 0.04, -0.06);
  ctx.moveTo(0.02, -0.97);
  ctx.quadraticCurveTo(0, -0.72, -0.14, -0.28);
  ctx.moveTo(-0.18, -1.04);
  ctx.quadraticCurveTo(-0.17, -0.83, -0.29, -0.47);
  ctx.moveTo(-0.38, -1.07);
  ctx.quadraticCurveTo(-0.35, -0.34, -0.74, -0.88);
  ctx.moveTo(-0.76, -0.59);
  ctx.quadraticCurveTo(-0.61, -0.49, -0.4, -0.46);
  ctx.moveTo(-0.78, -0.34);
  ctx.quadraticCurveTo(-0.61, -0.26, -0.3, -0.24);
  ctx.moveTo(-0.69, -0.06);
  ctx.quadraticCurveTo(-0.47, -0.04, -0.15, -0.09);
  ctx.moveTo(-0.65, 0.14);
  ctx.quadraticCurveTo(-0.47, 0.15, 0.05, 0.05);
  ctx.moveTo(-0.53, 0.33);
  ctx.quadraticCurveTo(-0.18, 0.32, 0.12, 0.2);
  ctx.quadraticCurveTo(-0.19, 0.31, 0.12, 0.2);
  ctx.moveTo(-0.35, 0.5);
  ctx.quadraticCurveTo(0.02, 0.47, 0.27, 0.35);
  ctx.moveTo(-0.08, 0.63);
  ctx.quadraticCurveTo(0.15, 0.6, 0.49, 0.47);
  ctx.moveTo(0.26, 0.72);
  ctx.quadraticCurveTo(0.5, 0.72, 0.72, 0.54);
  ctx.stroke();
  ctx.lineCap = "round";
}

function drawGlass(id, ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.white, "#FF0000", hit * 0.5), 0.2);
  ctx.strokeStyle = mixColors(colors.white, "#FF0000", hit * 0.5);

  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (TAU / 5) * i;
    const dist = 1 + Math.sin(id * 4 + i * 8) * 0.2;

    ctx.lineTo(Math.cos(angle) * dist, Math.sin(angle) * dist);
  }

  ctx.closePath();

  ctx.globalAlpha *= 0.5;
  ctx.fill();
  ctx.globalAlpha *= 1.4;
  ctx.stroke();
  ctx.globalAlpha /= 0.7;
}

function drawDandy(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.stingerBlack, "#FF0000", hit * 0.5), 0.6);

  ctx.beginPath();
  ctx.moveTo(-1.2, 0);
  ctx.lineTo(0, 0);
  ctx.stroke();
  ctx.closePath();

  setStyle(ctx, mixColors(colors.white, "#FF0000", hit * 0.5), 0.225);
  ctx.beginPath();
  ctx.arc(0.2, 0, 0.75, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawDandyIcon(ctx = _ctx, index, rarity) {
  let count = state.petalConfigs[index].tiers[rarity].count;
  for (let i = 0; i < count; i++) {
    const angle = (TAU / count) * i;

    ctx.save();
    ctx.translate(Math.cos(angle) * 0.7, Math.sin(angle) * 0.7);
    ctx.rotate(angle + TAU / 5);
    ctx.scale(0.9, 0.9);
    drawDandy(ctx);
    ctx.restore();
  }
}

function drawSpongePetal(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.peach, "#FF0000", hit * 0.5), 0.2);

  ctx.beginPath();

  for (let i = 0; i < 7; i++) {
    const angle = (i * TAU) / 7 + 180;
    const max = angle + TAU / 14;

    if (i === 0) {
      const min = angle - TAU / 14;
      ctx.moveTo(Math.cos(min) * 0.75, Math.sin(min) * 0.75);
    }

    ctx.quadraticCurveTo(
      Math.cos(angle) * 1.2,
      Math.sin(angle) * 1.2,
      Math.cos(max) * 0.75,
      Math.sin(max) * 0.75,
    );
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawPearl(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.peach, "#FF0000", hit * 0.5), 0.2);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = mixColors(colors.white, "#FF0000", hit * 0.5);
  ctx.beginPath();
  ctx.arc(0.25, -0.25, 0.25, 0, TAU);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = ctx.fillStyle;
  ctx.beginPath();
  ctx.moveTo(-0.65, -0.35);
  ctx.quadraticCurveTo(-0.7, 0.15, -0.35, 0.55);
  ctx.stroke();
  ctx.closePath();
}

function drawShellPetal(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.peach, "#FF0000", hit * 0.5), 0.2);
  // Body
  ctx.beginPath();
  ctx.lineTo(-0.52, -0.34);
  ctx.arcTo(-0.87, 0, -0.52, 0.34, 0.45454545454545453);
  ctx.lineTo(-0.52, 0.34);
  ctx.lineTo(0.21, 0.95);
  ctx.arcTo(3.13, 0, 0.21, -0.95, 1);
  ctx.lineTo(-0.52, -0.34);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  // Lines
  ctx.beginPath();
  ctx.moveTo(-0.31, 0.07);
  ctx.lineTo(0.48, 0.2);
  ctx.stroke();
  ctx.moveTo(-0.37, 0.16);
  ctx.lineTo(0.3, 0.5);
  ctx.stroke();
  ctx.moveTo(-0.31, -0.07);
  ctx.lineTo(0.48, -0.2);
  ctx.stroke();
  ctx.moveTo(-0.37, -0.16);
  ctx.lineTo(0.3, -0.5);
  ctx.stroke();
  ctx.closePath();
}

function drawBubblePetal(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.white, "#FF0000", hit * 0.5), 0.25);
  ctx.strokeStyle = ctx.fillStyle;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.closePath();
  ctx.globalAlpha *= 0.4;
  ctx.fill();
  ctx.stroke();
  ctx.globalAlpha *= 1.67;

  ctx.fillStyle = mixColors(colors.white, "#FF0000", hit * 0.5);
  ctx.beginPath();
  ctx.arc(0.25, -0.35, 0.25, 0, TAU);
  ctx.closePath();
  ctx.globalAlpha *= 0.6;
  ctx.fill();
  ctx.globalAlpha /= 0.6;
}

function drawStarfishPetal(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.starfish, "#FF0000", hit * 0.5), 0.125);

  ctx.beginPath();
  ctx.moveTo(-1.2, -0.5);
  ctx.lineTo(1, -0.4);
  ctx.arc(1, 0, 0.4, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(-1.2, 0.5);
  ctx.lineTo(-1.3, 0.3);
  ctx.lineTo(-1.3, -0.3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = mixColors(ctx.fillStyle, colors.white, 0.3);

  ctx.beginPath();
  ctx.arc(-0.75, 0, 0.4, 0, TAU);
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, 0.3, 0, TAU);
  ctx.moveTo(0.667, 0);
  ctx.arc(0.667, 0, 0.2, 0, TAU);
  ctx.fill();
  ctx.closePath();
}

function drawFangPetal(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.evilLadybugRed, "#FF0000", hit * 0.5), 0.2);
  ctx.beginPath();
  ctx.moveTo(1, 0);
  ctx.lineTo(0, -0.5);
  ctx.lineTo(-1, 0);
  ctx.lineTo(0, 0.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawGoo(id, ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.cumWhite, "#FF0000", hit * 0.5), 0.2);

  const s1 = Math.sin(performance.now() * 0.005 + id * 0.1) * 0.25 + 0.75;
  const s2 = Math.sin(performance.now() * 0.0075 + id * 0.1 + 1) * 0.5 + 0.75;
  const s3 = Math.sin(performance.now() * 0.001 + id * 0.1 + 2) * 0.3 + 0.75;

  ctx.beginPath();
  ctx.arc(0, 0, 1, Math.PI / 2, -Math.PI / 2, true);
  ctx.bezierCurveTo(-1.5 * s1, -1.3, -1.6 * s2, -1.1, -2.2 * s3, -1);
  ctx.bezierCurveTo(-2.9 * s2, -0.8, -2.7 * s3, -0.5, -1.6 * s1, -0.6);
  ctx.bezierCurveTo(-2.6 * s3, -0.4, -2.8 * s1, -0.2, -1.6 * s2, 0);
  ctx.bezierCurveTo(-3.7 * s1, 0.8, -1.7 * s3, 1.2, -1.1 * s2, 0.9);
  ctx.bezierCurveTo(-1.1, 1.4, -0.2, 1.4, 0, 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawStaticGoo(ctx = _ctx) {
  setStyle(ctx, colors.cumWhite, 0.2);

  const s1 = Math.sin(0.5 * 0.005) * 0.25 + 0.75;
  const s2 = Math.sin(0.5 * 0.0075 + 1) * 0.5 + 0.75;
  const s3 = Math.sin(0.5 * 0.001 + 2) * 0.3 + 0.75;

  ctx.beginPath();
  ctx.arc(0, 0, 1, Math.PI / 2, -Math.PI / 2, true);
  ctx.bezierCurveTo(-1.5 * s1, -1.3, -1.6 * s2, -1.1, -2.2 * s3, -1);
  ctx.bezierCurveTo(-2.9 * s2, -0.8, -2.7 * s3, -0.5, -1.6 * s1, -0.6);
  ctx.bezierCurveTo(-2.6 * s3, -0.4, -2.8 * s1, -0.2, -1.6 * s2, 0);
  ctx.bezierCurveTo(-3.7 * s1, 0.8, -1.7 * s3, 1.2, -1.1 * s2, 0.9);
  ctx.bezierCurveTo(-1.1, 1.4, -0.2, 1.4, 0, 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawMaggotPoo(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.spider, "#FF0000", hit * 0.5), 0.2);
  dipPolygon(ctx, 7, 1.05, 1.3, 0);
  ctx.fill();
  ctx.stroke();
  setStyle(
    ctx,
    mixColors(
      mixColors(colors.spider, colors.cumWhite, 0.15),
      "#FF0000",
      hit * 0.5,
    ),
    0.15,
  );
  dipPolygon(ctx, 5, 0.6, 0.5, 0);
  ctx.fill();
  ctx.stroke();
  setStyle(
    ctx,
    mixColors(
      mixColors(colors.spider, colors.cumWhite, 0.3),
      "#FF0000",
      hit * 0.5,
    ),
    0.1,
  );
  polygon(ctx, 8, 0.3, 0);
  ctx.fill();
  ctx.stroke();
}

function drawLightbulb(id, ctx = _ctx, hit = false, isReal = true) {
  if (isReal) {
    ctx.fillStyle = "#FFE51C";
    ctx.globalAlpha *= 0.2;
    ctx.beginPath();
    ctx.arc(
      0,
      0,
      2.5 + Math.sin(performance.now() * 0.005 + id) * 1.75,
      0,
      TAU,
    );
    ctx.closePath();
    ctx.fill();
  }

  ctx.globalAlpha /= 0.2;

  ctx.save();
  ctx.scale(1.15, 1.15);

  setStyle(ctx, mixColors("#ffe51c", "#FF0000", hit * 0.5), 0.2);

  ctx.beginPath();
  ctx.moveTo(-0.32, 0.39);
  ctx.bezierCurveTo(-0.34, 0.27, -0.4, 0.17, -0.45, 0.1);
  ctx.bezierCurveTo(-0.5, 0, -0.57, -0.1, -0.57, -0.24);
  ctx.bezierCurveTo(-0.55, -0.55, -0.3, -0.8, 0, -0.81);
  ctx.bezierCurveTo(0.3, -0.8, 0.55, -0.55, 0.57, -0.24);
  ctx.bezierCurveTo(0.55, -0.1, 0.5, 0, 0.45, 0.1);
  ctx.bezierCurveTo(0.4, 0.17, 0.34, 0.27, 0.32, 0.39);
  ctx.lineTo(-0.32, 0.39);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  setStyle(ctx, mixColors("#666666", "#FF0000", hit * 0.5), 0.2);
  ctx.beginPath();
  ctx.rect(-0.36, 0.39, 0.72, 0.5);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";
  ctx.strokeStyle = "#fff28d";
  ctx.beginPath();
  ctx.moveTo(-0.2, 0.3);
  ctx.lineTo(-0.3, -0.2);
  ctx.lineTo(-0.15, -0.05);
  ctx.lineTo(0, -0.2);
  ctx.lineTo(0.15, -0.05);
  ctx.lineTo(0.3, -0.2);
  ctx.lineTo(0.2, 0.3);
  ctx.stroke();
  ctx.closePath();

  ctx.restore();
}

function drawBattery(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors("#C8C8C8", "#FF0000", hit * 0.5), 0.2);
  ctx.fillRect(-0.25, -1, 0.5, 0.5);
  ctx.strokeRect(-0.25, -1, 0.5, 0.5);

  setStyle(ctx, mixColors("#323233", "#FF0000", hit * 0.5), 0.2);
  ctx.fillRect(-0.6, -0.7, 1.2, 1.7);
  ctx.strokeRect(-0.6, -0.7, 1.2, 1.7);

  setStyle(ctx, mixColors("#C98A5B", "#FF0000", hit * 0.5), 0.2);
  ctx.fillRect(-0.6, -0.7, 1.2, 0.5);
  ctx.strokeRect(-0.6, -0.7, 1.2, 0.5);
}

function drawDust(ctx = _ctx, index, rarity) {
  let count = state.petalConfigs[index].tiers[rarity].count;
  setStyle(ctx, colors.rockGray, 0.2);

  for (let i = 0; i < count; i++) {
    const angle = (TAU / count) * i;

    ctx.save();
    ctx.translate(Math.cos(angle) * 0.6, Math.sin(angle) * 0.6);
    polygon(ctx, 5, 0.5, angle);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

function drawShrubPetal(color, ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.125);

  for (let i = 9; i >= 8; i--) {
    polygon(ctx, i, 1 - 0.33 * (9 - i), 0);
    ctx.fill();
    ctx.stroke();
  }

  ctx.fillStyle = mixColors(
    mixColors(color, "#000000", 0.1),
    "#FF0000",
    hit * 0.5,
  );

  ctx.beginPath();
  ctx.arc(0, 0, 0.33, 0, TAU);
  ctx.fill();
  ctx.closePath();
}

function drawLantern(color, altColor, ctx = _ctx, hit = false) {
  ctx.fillStyle = altColor;
  ctx.globalAlpha *= 0.5;

  ctx.translate(0, 0.125);

  ctx.beginPath();
  ctx.arc(0, 0, 1.25 + Math.sin(performance.now() / 750) * 0.75, 0, TAU);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.globalAlpha *= 1.5;
  ctx.arc(0, 0, 0.75 + Math.sin(performance.now() / 750) * 0.25, 0, TAU);
  ctx.fill();
  ctx.closePath();

  ctx.globalAlpha /= 0.75;

  ctx.lineWidth = 0.25;
  ctx.strokeStyle = mixColors(
    mixColors(color, "#FFFFFF", 0.25),
    "#FF0000",
    hit * 0.5,
  );

  ctx.beginPath();
  ctx.moveTo(1.05, -1);
  ctx.lineTo(0.8, 1);

  ctx.moveTo(-1.05, -1);
  ctx.lineTo(-0.8, 1);

  ctx.moveTo(0.35, -1);
  ctx.lineTo(0.25, 1);

  ctx.moveTo(-0.35, -1);
  ctx.lineTo(-0.25, 1);

  ctx.stroke();
  ctx.closePath();

  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.25);

  ctx.beginPath();
  ctx.moveTo(1.25, -1);
  ctx.lineTo(1, -1.5);
  ctx.lineTo(-1, -1.5);
  ctx.lineTo(-1.25, -1);
  ctx.lineTo(1.25, -1);

  ctx.moveTo(1, 1);
  ctx.lineTo(0.75, 1.125);
  ctx.lineTo(-0.75, 1.125);
  ctx.lineTo(-1, 1);
  ctx.lineTo(1, 1);

  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  ctx.strokeStyle = mixColors(
    mixColors(color, "#000000", 0.25),
    "#FF0000",
    hit * 0.5,
  );

  ctx.beginPath();
  ctx.moveTo(0.75, -1.5);
  ctx.lineTo(0.5, -2);
  ctx.lineTo(-0.5, -2);
  ctx.lineTo(-0.75, -1.5);
  ctx.stroke();
  ctx.closePath();
}

function drawStaticLantern(color, altColor, ctx = _ctx) {
  ctx.fillStyle = altColor;
  ctx.globalAlpha = 0.5;

  ctx.translate(0, 0.125);

  ctx.beginPath();
  ctx.arc(0, 0, 1.25 + 0.5 * 0.75, 0, TAU);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.globalAlpha = 0.75;
  ctx.arc(0, 0, 0.75 + 0.5 * 0.25, 0, TAU);
  ctx.fill();
  ctx.closePath();

  ctx.globalAlpha = 1;

  ctx.lineWidth = 0.25;
  ctx.strokeStyle = mixColors(color, "#FFFFFF", 0.25);

  ctx.beginPath();
  ctx.moveTo(1.05, -1);
  ctx.lineTo(0.8, 1);

  ctx.moveTo(-1.05, -1);
  ctx.lineTo(-0.8, 1);

  ctx.moveTo(0.35, -1);
  ctx.lineTo(0.25, 1);

  ctx.moveTo(-0.35, -1);
  ctx.lineTo(-0.25, 1);

  ctx.stroke();
  ctx.closePath();

  setStyle(ctx, color, 0.25);

  ctx.beginPath();
  ctx.moveTo(1.25, -1);
  ctx.lineTo(1, -1.5);
  ctx.lineTo(-1, -1.5);
  ctx.lineTo(-1.25, -1);
  ctx.lineTo(1.25, -1);

  ctx.moveTo(1, 1);
  ctx.lineTo(0.75, 1.125);
  ctx.lineTo(-0.75, 1.125);
  ctx.lineTo(-1, 1);
  ctx.lineTo(1, 1);

  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  ctx.strokeStyle = mixColors(color, "#000000", 0.25);

  ctx.beginPath();
  ctx.moveTo(0.75, -1.5);
  ctx.lineTo(0.5, -2);
  ctx.lineTo(-0.5, -2);
  ctx.lineTo(-0.75, -1.5);
  ctx.stroke();
  ctx.closePath();
}

function drawEggs(ctx = _ctx, color, index, rarity) {
  let count = state.petalConfigs[index].tiers[rarity].count;
  setStyle(ctx, color, 0.225);

  if (count > 1) {
    for (let i = 0; i < count; i++) {
      const angle = (i * TAU) / count;

      ctx.beginPath();
      ctx.ellipse(
        Math.cos(angle) * 0.6,
        Math.sin(angle) * 0.6,
        0.775,
        1,
        0,
        0,
        TAU,
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else {
    ctx.beginPath();
    ctx.ellipse(0, 0, 0.775, 1, 0, 0, TAU);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

const CandyColors = [
  colors.rosePink,
  colors.legendary,
  colors.rare,
  colors.common,
  colors.ancient,
  colors.orange,
];

function drawCandy(id, ctx = _ctx, hit) {
  setStyle(
    ctx,
    mixColors(CandyColors[id % CandyColors.length], "#FF0000", hit * 0.5),
    0.25,
  );

  ctx.beginPath();
  ctx.save();
  switch (id % 3) {
    case 0:
      ctx.arc(0, 0, 1, 0, TAU);
      break;
    case 1:
      polygon(ctx, 3, 1.3, 0);
      break;
    case 2:
      ctx.rect(-1, -1, 2, 2);
      break;
  }
  ctx.clip();
  ctx.fill();
  ctx.closePath();

  ctx.fillStyle = mixColors(ctx.fillStyle, colors.white, 0.25);

  ctx.beginPath();
  ctx.rotate(Math.PI / 4);
  ctx.rect(-1, -0.25, 2, 0.5);
  ctx.fill();

  ctx.restore();
  ctx.closePath();

  ctx.beginPath();
  switch (id % 3) {
    case 0:
      ctx.arc(0, 0, 1, 0, TAU);
      break;
    case 1:
      polygon(ctx, 3, 1.3, 0);
      break;
    case 2:
      ctx.rect(-1, -1, 2, 2);
      break;
  }
  ctx.stroke();
  ctx.closePath();
}

function drawCandyIcon(ctx = _ctx, index, rarity) {
  let count = state.petalConfigs[index].tiers[rarity].count;

  if (count > 1) {
    for (let i = 0; i < count; i++) {
      const angle = (TAU / count) * i;

      ctx.save();
      ctx.translate(Math.cos(angle) * 0.75, Math.sin(angle) * 0.75);
      ctx.scale(0.5, 0.5);
      ctx.rotate(angle);
      drawCandy(i, ctx, false);
      ctx.restore();
    }
  } else {
    ctx.save();
    ctx.scale(0.55, 0.55);
    drawCandy(2, ctx, false);
    ctx.restore();
  }
}

function drawClaw(ctx, hit) {
  setStyle(ctx, mixColors(colors.crabLimbBrown, "#FF0000", hit * 0.5), 0.25);

  ctx.beginPath();
  ctx.moveTo(-0.96, -0.31);
  ctx.bezierCurveTo(0.5, -0.91, 0.86, 0.23, 1, 0.54);
  ctx.lineTo(0.4, 0.09);
  ctx.lineTo(0.56, 0.75);
  ctx.bezierCurveTo(0.1, 0.33, -0.38, 0.02, -1, 0.22);
  ctx.bezierCurveTo(-0.95, 0.05, -0.86, -0.12, -0.96, -0.31);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}

const petalCache = new Map();

export function drawPetal(index, hit = false, ctx = _ctx, id = 0, size) {
  if (options.cachePetalAssets) {
    const key = `${index}`;
    let cached = petalCache.get(key);
    if (!cached) {
      const img = document.createElement("canvas");
      const _ctx = img.getContext("2d");

      const baseSize = 256;
      img.width = img.height = baseSize;
      _ctx.translate(baseSize / 2, baseSize / 2);
      _ctx.scale(baseSize / 6, baseSize / 6);

      _ctx.save();
      _ctx.lineCap = "round";
      _ctx.lineJoin = "round";

      petalRender(index, hit, _ctx, id, size);
      _ctx.restore();

      cached = img;
      petalCache.set(key, cached);
    }
    const drawSize = 6;
    ctx.drawImage(cached, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    return;
  }
  petalRender(index, hit, ctx, id, size);
}

function petalRender(index, hit, ctx, id, size) {
  if (state.petalConfigs[index].drawing) {
    const actions = state.petalConfigs[index].drawing.actions;
    for (const action of actions) {
      const [actionName, ...args] = action;
      const actionFunc = Drawing.reverseActions[actionName];

      if (!actionFunc) {
        throw new Error(`Unknown action: ${actionName} ${action}`);
      }

      switch (actionFunc) {
        case "circle":
          ctx.arc(args[0], args[1], args[2], 0, Math.PI * 2);
          break;
        case "line":
          ctx.moveTo(args[0], args[1]);
          ctx.lineTo(args[2], args[3]);
          break;
        case "fill":
          ctx.fillStyle = mixColors(args[0], "#FF0000", hit * 0.5);
          ctx.fill();
          break;
        case "stroke":
          ctx.strokeStyle = mixColors(
            mixColors(args[0], "#FF0000", hit * 0.5),
            "#000000",
            args[2],
          );
          ctx.lineWidth = args[1];
          ctx.stroke();
          break;
        case "paint":
          ctx.fillStyle = mixColors(args[0], "#FF0000", hit * 0.5);
          ctx.strokeStyle = mixColors(
            mixColors(args[0], "#FF0000", hit * 0.5),
            "#000000",
            args[2],
          );
          ctx.lineWidth = args[1];
          ctx.fill();
          ctx.stroke();
          break;
        case "polygon": {
          let arg2 = args[2];

          if (isNaN(arg2)) {
            if (typeof arg2 === "string" && arg2.startsWith("date_")) {
              const mult = parseFloat(arg2.split("_")[1]);
              arg2 = date * (isNaN(mult) ? 1 : mult);
            } else if (arg2 === "date") {
              arg2 = date;
            } else {
              arg2 = 0;
            }
          } else {
            arg2 = Number(arg2);
          }

          polygon(ctx, args[0], args[1], arg2);
          break;
        }
        case "spikeBall": {
          let arg2 = args[2];

          if (isNaN(arg2)) {
            if (typeof arg2 === "string" && arg2.startsWith("date_")) {
              const mult = parseFloat(arg2.split("_")[1]);
              arg2 = date * (isNaN(mult) ? 1 : mult);
            } else if (arg2 === "date") {
              arg2 = date;
            } else {
              arg2 = 0;
            }
          } else {
            arg2 = Number(arg2);
          }

          spikeBall(ctx, args[0], args[1], arg2);
          break;
        }
        case "dipPolygon": {
          let arg3 = args[3];

          if (isNaN(arg3)) {
            if (typeof arg3 === "string" && arg3.startsWith("date_")) {
              const mult = parseFloat(arg3.split("_")[1]);
              arg3 = date * (isNaN(mult) ? 1 : mult);
            } else if (arg3 === "date") {
              arg3 = date;
            } else {
              arg3 = 0;
            }
          } else {
            arg3 = Number(arg3);
          }

          dipPolygon(ctx, args[0], args[1], args[2], arg3);
          break;
        }
        case "opacity":
          ctx.globalAlpha *= args[0];
          break;
        case "blur":
          ctx.shadowColor = args[0];
          ctx.shadowBlur = args[1];
          break;
        case "noBlur":
          ctx.shadowBlur = 0;
          break;
        case "ellipse": {
          let arg4 = args[4];

          if (isNaN(arg4)) {
            if (typeof arg4 === "string" && arg4.startsWith("date_")) {
              const mult = parseFloat(arg4.split("_")[1]);
              arg4 = date * (isNaN(mult) ? 1 : mult);
            } else if (arg4 === "date") {
              arg4 = date;
            } else {
              arg4 = 0;
            }
          } else {
            arg4 = Number(arg4);
          }

          ctx.ellipse(args[0], args[1], args[2], args[3], arg4, 0, Math.PI * 2);
          break;
        }
        default:
          ctx[actionFunc](...args);
          break;
      }
    }

    return;
  }

  switch (index) {
    case 0: // Basic
    case 1: // Light
      basicPetal(ctx, hit, colors.white, size);
      break;
    case 2: // Faster
      basicPetal(ctx, hit, colors.cumWhite, size);
      break;
    case 3: // Heavy
      drawHeavy(ctx, hit);
      break;
    case 4: // Stinger
      trianglePetal(ctx, hit, colors.stingerBlack);
      break;
    case 5: // Rice
      drawRice(ctx, hit);
      break;
    case 6: // Rock
      drawRockP(ctx, hit);
      break;
    case 7: // Cactus
      drawCactusPetal(ctx, hit);
      break;
    case 8: // Leaf
      drawLeaf(ctx, hit);
      break;
    case 9: // Wing
      drawWing(ctx, hit);
      break;
    case 10: // Bone
      drawBone(ctx, hit);
      break;
    case 11: // Dirt
      drawDirt(ctx, hit);
      break;
    case 12: // Magnolia
      drawMagnolia(ctx, hit);
      break;
    case 13: // Corn
      drawCorn(ctx, hit);
      break;
    case 14: // Sand
      drawSingleSand(ctx, hit);
      break;
    case 15: // Orange
      drawOrange(ctx, hit);
      break;
    case 16: // Missile
      drawMissile(ctx, hit);
      break;
    case 17: // projectile.pea
      basicPetal(ctx, hit, colors.peaGreen, size);
      break;
    case 18: // Rose
      basicPetal(ctx, hit, colors.rosePink, size);
      break;
    case 19: // Yin Yang
      drawYinYang(ctx, hit);
      break;
    case 20: // Pollen
      basicPetal(ctx, hit, colors.pollenGold, size);
      break;
    case 21: // Honey
      drawHoney(ctx, hit);
      break;
    case 22: // Iris
      basicPetal(ctx, hit, colors.irisPurple, size);
      break;
    case 23: // Web
      drawWebPetal(ctx, hit);
      break;
    case 24: // web.mob.launched
      drawWebMob(ctx, colors.white);
      break;
    case 25: // Third Eye
      drawThirdEye(ctx, hit);
      break;
    case 26: // Pincer
      drawPincer(ctx, hit);
      break;
    case 27: // Beetle Egg
      drawEgg(ctx, colors.peach, hit);
      break;
    case 28: // Antennae
      drawAntennae(ctx);
      break;
    case 29: // Peas
      drawPeas(ctx, hit, colors.peaGreen, index);
      break;
    case 30: // Stick
      drawStick(colors.spider, ctx, hit);
      break;
    case 31: // scorpion.projectile
      drawScorpionProjectile(ctx, hit);
      break;
    case 32: // Dahlia
      basicPetal(ctx, hit, colors.rosePink, size);
      break;
    case 33: // Primrose
      drawPrimrose(ctx, hit, true);
      break;
    case 34: // Fire Spellbook
      drawSpellbook(ctx, hit, true, 0);
      break;
    case 35: // Deity
      drawDeity(ctx, hit);
      break;
    case 36: // Lightning
      drawLightning(ctx, hit);
      break;
    case 37: // Powder
      drawPowderDynamic(id, ctx, hit);
      break;
    case 38: // Ant Eggs
      basicPetal(ctx, hit, colors.peach, size);
      break;
    case 39: // Yucca
      drawYucca(ctx, hit);
      break;
    case 40: // Magnet
      drawMagnet(ctx, hit);
      break;
    case 41: // Amulet
      drawAmulet(ctx, hit);
      break;
    case 42: // Jelly
      drawJelly(ctx, hit);
      break;
    case 43: // Yggdrasil
      drawYggdrasil(ctx, hit);
      break;
    case 44: // Glass
      drawGlass(id, ctx, hit);
      break;
    case 45: // Dandelion
      drawDandy(ctx, hit);
      break;
    case 46: // Sponge
      drawSpongePetal(ctx, hit);
      break;
    case 47: // Pearl
      drawPearl(ctx, hit);
      break;
    case 48: // Shell
      drawShellPetal(ctx, hit);
      break;
    case 49: // Bubble
      drawBubblePetal(ctx, hit);
      break;
    case 50: // Air
      break;
    case 51: // Starfish
      drawStarfishPetal(ctx, hit);
      break;
    case 52: // Fangs
      drawFangPetal(ctx, hit);
      break;
    case 53: // Goo
      drawGoo(id, ctx, hit);
      break;
    case 54: // Maggot Poo
      drawMaggotPoo(ctx, hit);
      break;
    case 55: // Lightbulb
      drawLightbulb(id, ctx, hit, true);
      break;
    case 56: // Battery
      drawBattery(ctx, hit);
      break;
    case 57: // Dust
      setStyle(ctx, mixColors(colors.rockGray, "#FF0000", hit * 0.5), 0.3);
      polygon(ctx, 5, 1, performance.now() * 0.001 + id);
      ctx.fill();
      ctx.stroke();
      break;
    case 58: // Armor
      drawArmor(ctx, hit);
      break;
    case 59: // wasp.projectile
      drawWaspMissile(ctx, hit);
      break;
    case 60: // Shrub
      drawShrubPetal(colors.shrubGreen, ctx, hit);
      break;
    case 61: // projectile.grape
      basicPetal(ctx, hit, colors.irisPurple, size);
      break;
    case 62: // Grapes
      drawPeas(ctx, hit, colors.irisPurple, index);
      break;
    case 63: // Lantern
      drawLantern(colors.rockGray, colors.orange, ctx, hit);
      break;
    case 64: // web.player.launched
      drawWebMob(ctx, colors.playerYellow);
      break;
    case 65: // Branch
      drawStick(colors.rockGray, ctx, hit);
      break;
    case 66: // Leech Egg
      drawEgg(ctx, colors.lighterBlack, hit);
      break;
    case 67: // Hornet Egg
      drawEgg(ctx, colors.peach, hit);
      break;
    case 68: // Candy
      drawCandy(id, ctx, hit);
      break;
    case 69: // Claw
      drawClaw(ctx, hit);
      break;
    case 70: // Diep Bullet
      setStyle(ctx, mixColors(colors.diepBlue, "#FF0000", hit * 0.5), 0.45);
      ctx.beginPath();
      ctx.arc(0, 0, 1, 0, TAU);
      ctx.fill();
      ctx.stroke();
      break;
    case 71: // Diep Square
      drawSquareMob(ctx, hit);
      break;
    case 72: // Diep Triangle
      drawTriangleMob(ctx, hit);
      break;
    case 73: // Diep Pentagon
      drawPentagonMob(ctx, hit);
      break;
    default:
      console.log("Unknown petal index: " + index);
      basicPetal(ctx, hit, "#FF0000", size);
  }
}

export function drawUIPetal(index, rarity, ctx = _ctx) {
  switch (index) {
    case 0: // Basic
      drawBasicPetals(ctx, index, rarity, 1, colors.white);
      break;
    case 1: // Light
      drawBasicPetals(ctx, index, rarity, 0.5, colors.white);
      break;
    case 2: // Faster
      drawBasicPetals(ctx, index, rarity, 0.5, colors.cumWhite);
      break;
    case 4: // Stinger
      drawStinger(ctx, index, rarity);
      break;
    case 10: // Bone
      ctx.save();
      ctx.scale(1.25, 1.25);
      drawBone(ctx);
      ctx.restore();
      break;
    case 14: // Sand
      drawSands(ctx, index, rarity);
      break;
    case 15: // Orange
      drawOranges(ctx, index, rarity);
      break;
    case 18: // Basic
      drawBasicPetals(ctx, index, rarity, 0.8, colors.rosePink);
      break;
    case 20: // Pollen
      drawBasicPetals(ctx, index, rarity, 0.5, colors.playerYellow);
      break;
    case 22: // Iris
      drawBasicPetals(ctx, index, rarity, 0.6, colors.irisPurple);
      break;
    case 27: // Beetle Egg
      drawEggs(ctx, colors.peach, index, rarity);
      break;
    case 28: // Antennae
      ctx.save();
      ctx.translate(0, 0.85);
      ctx.scale(1.65, 1.65);
      drawAntennae(ctx);
      ctx.restore();
      break;
    case 29: // Peas
      ctx.save();
      ctx.scale(0.9, 0.9);
      drawPeas(ctx, 0, colors.peaGreen, index);
      ctx.restore();
      break;
    case 32: // Dahlia
      drawDahlia(ctx, index, rarity);
      break;
    case 33: // Primrose
      drawPrimrose(ctx, false, false);
      break;
    case 34: // Fire Spellbook
      drawSpellbook(ctx, false, false, 0);
      break;
    case 37: // Powder
      drawPowderStatic(ctx);
      break;
    case 38: // Ant Egg
      drawAntEgg(ctx, index, rarity);
      break;
    case 45: // Dandelion
      drawDandyIcon(ctx, index, rarity);
      break;
    case 46: // Sponge
      ctx.save();
      ctx.scale(1.25, 1.25);
      drawSpongePetal(ctx);
      ctx.restore();
      break;
    case 47: // Pearl
      ctx.save();
      ctx.scale(1.25, 1.25);
      drawPearl(ctx);
      ctx.restore();
      break;
    case 53: // Goo
      ctx.save();
      ctx.translate(0.5, 0);
      ctx.scale(0.9, 0.9);
      drawStaticGoo(ctx);
      ctx.restore();
      break;
    case 55: // Lightbulb
      drawLightbulb(0, ctx, false, false);
      break;
    case 57: // Dust
      ctx.save();
      ctx.scale(1.1, 1.1);
      drawDust(ctx, index, rarity);
      ctx.restore();
      break;
    case 62: // Grapes
      ctx.save();
      ctx.scale(0.9, 0.9);
      drawPeas(ctx, 0, colors.irisPurple, index);
      ctx.restore();
      break;
    case 63: // Lantern
      ctx.save();
      ctx.scale(0.8, 0.8);
      drawStaticLantern(colors.rockGray, colors.orange, ctx);
      ctx.restore();
      break;
    case 66: // Leech Egg
      drawEggs(ctx, colors.lighterBlack, index, rarity);
      break;
    case 67: // Hornet Egg
      drawEggs(ctx, colors.peach, index, rarity);
      break;
    case 68: // Candy
      ctx.save();
      ctx.scale(1.05, 1.05);
      drawCandyIcon(ctx, index, rarity);
      ctx.restore();
      break;
    default:
      if (state.petalConfigs[index].icon) {
        let count = state.petalConfigs[index].icon.count;
        let size = state.petalConfigs[index].icon.size;
        if (count > 1) {
          for (let i = 0; i < count; i++) {
            const angle = (TAU / count) * i;

            ctx.save();
            ctx.translate(Math.cos(angle) * 0.775, Math.sin(angle) * 0.775);
            ctx.scale(size * 0.85, size * 0.85);
            ctx.rotate(angle);
            drawPetal(index, false, ctx);
            ctx.restore();
          }
        } else {
          ctx.save();
          ctx.scale(size, size);
          drawPetal(index, false, ctx);
          ctx.restore();
        }
      } else {
        drawPetal(index, false, ctx);
      }
      break;
  }
}

function getUIPetalName(index) {
  switch (index) {
    case 27:
      return "Egg";
    case 38:
      return "Eggs";
    case 66:
      return "Egg";
    case 67:
      return "Eggs";
    default:
      return (
        state.petalConfigs[index].icon?.name ?? state.petalConfigs[index].name
      );
  }
}

// Petals icon gradient
const __ANIMATED_ICONS__ = new Set();

let __RAF_RUNNING__ = false;

function isAnimatedRarity(t) {
  return isGradientOn() && t >= getGradientMinRarity();
}

function startIconRAF() {
  if (__RAF_RUNNING__) return;
  __RAF_RUNNING__ = true;

  const loop = () => {
    if (__ANIMATED_ICONS__.size === 0) {
      __RAF_RUNNING__ = false;
      return;
    }

    for (const draw of __ANIMATED_ICONS__) {
      draw();
    }

    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);
}

function getGradientMinRarity() {
  return options.minimumGradientRarity;
}

const __PETAL_CACHE__ = [];
const __PETAL_INTERVALS__ = [];

const GLOW_PARTICLE_COUNT = 3;
const GLOW_PARTICLE_MARGIN = 28;
const GLOW_PARTICLE_SPEED = 0.011;

function isGradientOn() {
  return !options.disableGradients;
}

function getTierVisual(t) {
  const tierData = state.tiers[t];
  return (
    globalThis.__CUSTOM_GRADIENTS?.[t] ||
    tierData.gradient_3 ||
    tierData.gradient_2 ||
    tierData.gradient ||
    {}
  );
}

function rand01(n) {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function drawGlowParticles(ctx, t, size = 128) {
  if (!isGradientOn()) return;
  if (t < getGradientMinRarity()) return;

  const custom = getTierVisual(t);

  const count = custom.particlecount ?? custom.glowCount ?? GLOW_PARTICLE_COUNT;

  const glowColor = custom.particleglowcolor || "rgba(255,255,255,0.25)";
  const dotColor = custom.particledotcolor || "rgba(255,255,255,0.95)";
  const shadowColor = custom.particleshadowcolor || "rgba(0,0,0,0.35)";

  const now = performance.now();
  const span = size + GLOW_PARTICLE_MARGIN * 2;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(10, 10, 108, 108, 6);
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
      startX = rand01(seed) * 18;
      startY = rand01(seed + 1) * 18;
    }

    const angle = -0.35 + rand01(seed + 2) * 1.2;

    const vx = Math.cos(angle);
    const vy = Math.sin(angle);

    const travel = now * GLOW_PARTICLE_SPEED;

    const x =
      ((((startX + vx * travel) % span) + span) % span) - GLOW_PARTICLE_MARGIN;
    const y =
      ((((startY + vy * travel) % span) + span) % span) - GLOW_PARTICLE_MARGIN;

    const pulse = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(now * 0.002 + t));

    const glowR = 20 * pulse;
    const shadowR = 30 * pulse;

    const shadow = ctx.createRadialGradient(x, y, 0, x, y, shadowR);
    shadow.addColorStop(0, shadowColor);
    shadow.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.arc(x, y, shadowR, 0, Math.PI * 2);
    ctx.fill();

    const g = ctx.createRadialGradient(x, y, 0, x, y, glowR);
    g.addColorStop(0, glowColor);
    g.addColorStop(1, "rgba(255,255,255,0)");

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, glowR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = dotColor;
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function makeSweepGradient(ctx, t, base) {
  const custom = getTierVisual(t);

  const time = (performance.now() * 0.07) % 512;
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

function drawGradient2(ctx, t, clipHeight = 120) {
  const tierColor = state.tiers[t].color;
  const custom = globalThis.__CUSTOM_GRADIENTS?.[t] || {};

  const lines = custom.lines ?? 1;
  const size = custom.size ?? 0.08;

  const delay = custom.delay ?? 300;
  const cycleDelay = custom.cycleDelay ?? 0;

  const speed = custom.speed ?? 1;

  const reversed = custom.reversed_animation ?? false;

  const lineColor = custom.linecolor ?? mixColors(tierColor, "#000000", 0.15);

  const lineGlow = custom.lineglow ?? mixColors(tierColor, "#ffffff", 0.25);

  ctx.save();

  ctx.beginPath();
  ctx.rect(4, 124 - clipHeight, 120, clipHeight);
  ctx.clip();

  const back = custom.back ?? mixColors(tierColor, "#000000", 0.08);

  ctx.fillStyle = back;
  ctx.fillRect(4, 4, 120, 120);

  const now = performance.now();

  const band = 120 * size;

  const travelDistance = 120 + band * 2;
  const pxPerMs = Math.max(speed, 0.001) * 0.05;
  const lineDuration = travelDistance / pxPerMs;

  function drawLine(elapsed) {
    let pos;

    if (!reversed) {
      pos = -band + elapsed * pxPerMs;
    } else {
      pos = 120 + band - elapsed * pxPerMs;
    }

    const grad = ctx.createLinearGradient(
      pos - band,
      pos - band,
      pos + band,
      pos + band,
    );

    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(0.15, lineGlow);
    grad.addColorStop(0.5, lineColor);
    grad.addColorStop(0.85, lineGlow);
    grad.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = grad;
    ctx.fillRect(4, 4, 120, 120);
  }

  if (cycleDelay <= 0) {
    const firstIndex = Math.floor(now / delay);
    const maxAlive = Math.ceil(lineDuration / delay);

    for (let i = 0; i < maxAlive; i++) {
      const spawnIndex = firstIndex - i;

      if (spawnIndex < 0) continue;

      const spawnTime = spawnIndex * delay;
      const elapsed = now - spawnTime;

      if (elapsed < 0 || elapsed > lineDuration) continue;

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

      if (elapsed < 0 || elapsed > lineDuration) continue;

      drawLine(elapsed);
    }

    const previousCycleStart = cycleStart - spawnCycleLength;

    if (previousCycleStart >= 0) {
      for (let nLine = 0; nLine < lines; nLine++) {
        const spawnTime = previousCycleStart + nLine * delay;

        const elapsed = now - spawnTime;

        if (elapsed < 0 || elapsed > lineDuration) continue;

        drawLine(elapsed);
      }
    }
  }

  ctx.restore();
}

function getGradient3Rings(t) {
  const custom = getTierVisual(t);
  const tierColor = state.tiers[t].color;

  const fallback = [
    { color: mixColors(tierColor, "#ffffff", 0.12) },
    { color: mixColors(tierColor, "#ffffff", 0.18) },
    { color: mixColors(tierColor, "#ffffff", 0.24) },
    { color: mixColors(tierColor, "#ffffff", 0.3) },
    { color: mixColors(tierColor, "#ffffff", 0.36) },
    { color: mixColors(tierColor, "#ffffff", 0.42) },
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

function drawGradient3(ctx, t, clipHeight = 120) {
  const tierColor = state.tiers[t].color;
  const custom = getTierVisual(t);

  const rings = getGradient3Rings(t);

  const delay = custom.delay ?? 180;
  const cycleDelay = custom.cycleDelay ?? 0;
  const speed = Math.max(custom.speed ?? 1.9, 0.001);
  const reversed =
    custom.reversed_animation ?? custom.revert_animation ?? false;

  const back = custom.back ?? mixColors(tierColor, "#000000", 0.08);

  const now = performance.now();

  const cx = 64;
  const cy = 64;

  ctx.save();

  ctx.beginPath();
  ctx.rect(4, 124 - clipHeight, 120, clipHeight);
  ctx.clip();

  ctx.fillStyle = back;
  ctx.fillRect(4, 4, 120, 120);

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const pxPerMs = 0.04 * speed;
  const MAX_RADIUS = (Math.hypot(60, 60) + 40) * 3;

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

      drawGradient3Ring(ctx, ring, radius, cx, cy);
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
      drawGradient3Ring(ctx, rings[item.ringId], item.radius, cx, cy);
    }
  }

  ctx.restore();
  ctx.restore();
}

function drawGradient3Ring(ctx, ring, radius, cx, cy) {
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

function applyFillStyle(ctx, t, base, ratio = null) {
  if (!isGradientOn() || t < getGradientMinRarity()) {
    return base;
  }

  const custom = getTierVisual(t);

  const hasGradient3 = Array.isArray(custom.rings) || custom.type === 3;

  const hasGradient2 =
    custom.lines !== undefined || custom.linecolor !== undefined;

  if (hasGradient3) {
    drawGradient3(ctx, t, ratio === null ? 120 : 120 * ratio);

    return null;
  }

  if (hasGradient2) {
    drawGradient2(ctx, t, ratio === null ? 120 : 120 * ratio);

    return null;
  }

  return makeSweepGradient(ctx, t, base);
}

function getBorderStyle(t) {
  const base = state.tiers[t].color;

  if (!isGradientOn() || t < getGradientMinRarity()) {
    return mixColors(base, "#000000", 0.2);
  }

  const custom = getTierVisual(t);

  if (custom.border !== undefined) {
    return custom.border;
  }

  return mixColors(base, "#000000", 0.2);
}

const petalIconCache = [];
const petalIconIntervals = [];

function createPetalIcon(index, rarity) {
  const animated = isAnimatedRarity(rarity);

  const modeKey = animated ? 1 : 0;

  petalIconCache[index] ??= [];
  petalIconCache[index][rarity] ??= {};

  petalIconIntervals[index] ??= [];
  petalIconIntervals[index][rarity] ??= {};

  const otherModeKey = animated ? 0 : 1;

  const oldDraw = petalIconIntervals[index][rarity][otherModeKey];

  if (oldDraw) {
    __ANIMATED_ICONS__.delete(oldDraw);
    delete petalIconIntervals[index][rarity][otherModeKey];
  }

  delete petalIconCache[index][rarity][otherModeKey];

  const cached = petalIconCache[index][rarity][modeKey];

  if (cached) {
    const draw = petalIconIntervals[index][rarity][modeKey];

    if (draw) {
      if (animated) {
        if (!__ANIMATED_ICONS__.has(draw)) {
          __ANIMATED_ICONS__.add(draw);
          startIconRAF();
        }
      } else {
        __ANIMATED_ICONS__.delete(draw);
      }
    }

    return cached;
  }

  const canvas = new OffscreenCanvas(128, 128);

  const ctx = canvas.getContext("2d");

  const petalText = getUIPetalName(index);

  const draw = () => {
    if (!isAnimatedRarity(rarity)) {
      __ANIMATED_ICONS__.delete(draw);
    }

    ctx.clearRect(0, 0, 128, 128);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const iconPath = new Path2D();
    iconPath.roundRect(4, 4, 120, 120, 10);

    ctx.save();

    const custom = getTierVisual(rarity);

    const base = state.tiers[rarity].color;

    const back = animated
      ? (custom.back ?? custom.base ?? mixColors(base, "#000000", 0.1))
      : mixColors(base, "#000000", 0.1);

    ctx.fillStyle = back;
    ctx.fill(iconPath);

    ctx.save();
    ctx.clip(iconPath);

    const fill = applyFillStyle(ctx, rarity, base);

    if (fill !== null) {
      ctx.fillStyle = fill;
      ctx.fill(iconPath);
    }

    ctx.restore();

    ctx.lineWidth = 12;
    ctx.strokeStyle = getBorderStyle(rarity);
    ctx.stroke(iconPath);

    drawGlowParticles(ctx, rarity);

    ctx.translate(64, 51.2);
    ctx.scale(23.75, 23.75);

    drawUIPetal(index, rarity, ctx);

    ctx.restore();

    let size = 26;
    let k = 0;

    while (true) {
      ctx.font = `bold ${size}px Ubuntu`;

      if (ctx.measureText(petalText).width < 96 || k++ > 512) {
        break;
      }

      size--;
    }

    text(petalText, 64, 98, size, "#FFFFFF", ctx);
  };

  draw();

  if (animated) {
    if (!__ANIMATED_ICONS__.has(draw)) {
      __ANIMATED_ICONS__.add(draw);
      startIconRAF();
    }

    petalIconIntervals[index][rarity][modeKey] = draw;
  }

  petalIconCache[index][rarity][modeKey] = canvas;

  return canvas;
}

export function getPetalIcon(index, rarity) {
  petalIconCache[index] ??= [];
  return createPetalIcon(index, rarity);
}

const ratioFontSizeCache = [];

const ratioPath = new Path2D();
ratioPath.roundRect(4, 4, 120, 120, 8);

const ratioClip = new Path2D();
ratioClip.rect(0, 0, 128, 128);

const measuringCanvas = new OffscreenCanvas(128, 128);
const measuringCtx = measuringCanvas.getContext("2d");

function measureText(text, max) {
  let size = 26,
    k = 0;

  while (true) {
    measuringCtx.font = `bold ${size}px Ubuntu`;

    if (measuringCtx.measureText(text).width < max || k++ > 512) {
      break;
    }

    size--;
  }

  return size;
}

export function drawPetalIconWithRatio(
  index,
  rarity,
  x,
  y,
  size,
  ratio,
  ctx = _ctx,
) {
  const petalText = getUIPetalName(index);

  ctx.save();

  ctx.translate(x, y);
  ctx.scale(size / 128, size / 128);

  ctx.clip(ratioClip, "evenodd");

  const custom = getTierVisual(rarity);
  const base = state.tiers[rarity].color;

  const back = isAnimatedRarity(rarity)
    ? (custom.back ?? custom.base ?? mixColors(base, "#000000", 0.1))
    : mixColors(base, "#000000", 0.1);

  ctx.fillStyle = back;
  ctx.fill(ratioPath);

  const fill = applyFillStyle(ctx, rarity, base, ratio);

  if (fill !== null) {
    ctx.fillStyle = fill;
    ctx.fillRect(4, 124, 120, -120 * ratio);
  }

  ctx.strokeStyle = getBorderStyle(rarity);
  ctx.lineWidth = 12;
  ctx.stroke(ratioPath);

  drawGlowParticles(ctx, rarity);

  ctx.save();
  ctx.translate(64, 51.2);
  ctx.scale(23.75, 23.75);

  drawUIPetal(index, rarity, ctx);
  ctx.restore();

  if (ratioFontSizeCache[index] === undefined) {
    ratioFontSizeCache[index] = measureText(petalText, 96);
  }

  text(petalText, 64, 98, ratioFontSizeCache[index], "#FFFFFF", ctx);

  ctx.restore();
}
function drawLadybug(id, color, hit = false, ctx = _ctx, index, rarity) {
  const myColor = mixColors(color, "#FF0000", hit * 0.5);
  const black = mixColors(colors.stingerBlack, "#FF0000", hit * 0.5);
  // Ladybug head
  ctx.beginPath();
  ctx.arc(0.2, 0, 0.7, 0, TAU);
  setStyle(ctx, black, 0.175);
  ctx.fill();
  ctx.stroke();

  // Ladybug Body
  ctx.fillStyle = myColor;
  ctx.beginPath();
  ctx.arc(0, 0, 1, -Math.PI * 0.2125, Math.PI * 0.2125, true);
  ctx.arc(0.9, 0, 0.625, Math.PI * 0.6, -Math.PI * 0.6, false);
  ctx.closePath();
  ctx.fill();

  ctx.save();
  ctx.clip();

  // Spots
  ctx.fillStyle = black;
  let amount = (2 + Math.abs(Math.sin(id) * 0.667) * 10) | 0;
  amount += Math.floor(rarity / 1.5);

  for (let i = 0; i < amount; i++) {
    let angle = Math.sin(i * 100 + id) * TAU;
    let radius = Math.sin(i * 1000 + id) * 0.1 + 0.2;
    let d = Math.sin(i * 10000 + id) * 0.3 + 0.7;
    radius += Math.min(10, rarity) / 100;

    ctx.beginPath();
    ctx.arc(Math.cos(angle) * d, Math.sin(angle) * d, radius, 0, TAU);
    ctx.fill();
  }

  ctx.restore();

  // Ladybug stroke
  setStyle(ctx, myColor, 0.175);
  ctx.beginPath();
  ctx.arc(0, 0, 1, -Math.PI * 0.2125, Math.PI * 0.2125, true);
  ctx.arc(0.9, 0, 0.625, Math.PI * 0.6, -Math.PI * 0.6, false);
  ctx.closePath();
  ctx.stroke();
}

function drawRock(id, color, rarity, hit = false, ctx = _ctx) {
  const sides = Math.max(
    5 + rarity,
    4 + (8 + rarity) * ((Math.sin(id) * 0.5 + 0.25) * ((rarity + 1) * 0.25)),
  );
  const radius = 1;
  const angle = TAU / sides;

  setStyle(
    ctx,
    mixColors(color, "#FF0000", hit * 0.5),
    0.175 / (rarity * 0.1 + 1),
  );
  ctx.beginPath();
  ctx.moveTo(Math.cos(0) * radius, Math.sin(0) * radius);

  for (let i = 1; i < sides; i++) {
    const radISeed = Math.sin(i * 1000 + id) * 0.1 * (i % 2 ? 0.5 : 0);
    const radI = radius + radISeed;

    let a = angle * i;

    if (i % 3 === 0) {
      a += Math.sin(id) * 0.1;
    }

    ctx.lineTo(Math.cos(a) * radI, Math.sin(a) * radI);
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawBee(id, hit = false, ctx = _ctx, date) {
  const black = mixColors(colors.stingerBlack, "#FF0000", hit * 0.5);
  const yellow = mixColors(colors.beeYellow, "#FF0000", hit * 0.5);

  ctx.fillStyle = ctx.strokeStyle = black;
  ctx.lineWidth = 0.125;

  const stingerRotation =
    (date + id * 120) % (3000 + id * 2) > 2500 + id * 2
      ? Math.sin(date / 60 + id * 0.1) * 0.025
      : 0;

  ctx.beginPath();
  ctx.moveTo(-1.23, stingerRotation);
  ctx.lineTo(-0.65, -0.41);
  ctx.lineTo(-0.65, 0.41);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  setStyle(ctx, yellow, 0.125);
  ctx.beginPath();
  ctx.ellipse(0, 0, 1, 0.667, 0, 0, TAU);
  ctx.closePath();
  ctx.fill();

  ctx.save();
  ctx.clip();

  ctx.beginPath();
  ctx.rect(-1, -1, 0.334, 2);
  ctx.rect(-0.334, -1, 0.334, 2);
  ctx.rect(0.334, -1, 0.334, 2);
  ctx.fillStyle = black;
  ctx.fill();

  ctx.restore();

  ctx.beginPath();
  ctx.ellipse(0, 0, 1, 0.667, 0, 0, TAU);
  ctx.closePath();
  ctx.stroke();

  const rotation = 1 + Math.sin(date / 334 + id * 0.2) * 0.1;

  setStyle(ctx, black, 0.1, 0);
  ctx.beginPath();
  ctx.moveTo(0.85, -0.15);
  ctx.quadraticCurveTo(1.25, -0.2, 1.4, -0.45 * rotation);
  ctx.moveTo(0.85, 0.15);
  ctx.quadraticCurveTo(1.25, 0.2, 1.4, 0.45 * rotation);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(1.4, -0.45 * rotation, 0.15, 0, TAU);
  ctx.arc(1.4, 0.45 * rotation, 0.15, 0, TAU);
  ctx.closePath();
  ctx.fill();
}

function drawSpider(
  ctx = _ctxid,
  id,
  color,
  attack = false,
  hit = false,
  date,
) {
  // Legs
  ctx.strokeStyle = mixColors(colors.stingerBlack, "#FF0000", hit * 0.5);
  ctx.lineWidth = 0.235;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const rot =
      i * 0.52 -
      0.79 +
      Math.cos(2 + date * (0.0025 + attack * 0.0125) + i + id / 3) * 0.2;

    ctx.rotate(rot);
    ctx.moveTo(0, -2.2);
    ctx.quadraticCurveTo(0.2, -1, 0, 0);
    ctx.quadraticCurveTo(-0.2, 1, 0, 2.2);
    ctx.rotate(-rot);
  }
  ctx.stroke();
  ctx.closePath();

  // Body
  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.235);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawBeetle(id, color, hit = false, ctx = _ctx, attack = false, date) {
  const pincerRot =
    Math.sin(date * (0.0075 + 0.0075 * attack) + id / 4) * 0.15 + Math.PI / 20;

  setStyle(ctx, mixColors(colors.stingerBlack, "#FF0000", hit * 0.5), 0.1);
  ctx.save();
  ctx.translate(0.9, -0.4);
  ctx.rotate(pincerRot);
  ctx.beginPath();
  ctx.lineTo(-0.2805, -0.1445);
  ctx.quadraticCurveTo(0.306, -0.374, 0.6885, -0.085);
  ctx.quadraticCurveTo(0.7905, -0.0085, 0.697, 0.0765);
  ctx.quadraticCurveTo(0.3655, 0, -0.2125, 0.204);
  ctx.closePath();
  ctx.fill();
  ctx.rotate(-pincerRot);
  ctx.translate(0, 0.8);
  ctx.rotate(-pincerRot);
  ctx.beginPath();
  ctx.lineTo(-0.2805, 0.1445);
  ctx.quadraticCurveTo(0.306, 0.374, 0.6885, 0.085);
  ctx.quadraticCurveTo(0.7905, 0.0085, 0.697, -0.0765);
  ctx.quadraticCurveTo(0.3655, 0, -0.2125, -0.204);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.125);
  ctx.beginPath();
  ctx.moveTo(1, 0);
  ctx.bezierCurveTo(1, 1, -1, 1, -1, 0);
  ctx.bezierCurveTo(-1, -1, 1, -1, 1, 0);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(-0.667, -0.025);
  ctx.quadraticCurveTo(0.1, 0.1, 0.667, -0.025);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(-0.45, -0.3, 0.15, 0, TAU);
  ctx.arc(0, -0.3, 0.15, 0, TAU);
  ctx.arc(0.45, -0.3, 0.15, 0, TAU);
  ctx.moveTo(-0.45, 0.3);
  ctx.arc(-0.45, 0.3, 0.15, 0, TAU);
  ctx.arc(0, 0.3, 0.15, 0, TAU);
  ctx.arc(0.45, 0.3, 0.15, 0, TAU);
  ctx.fillStyle = ctx.strokeStyle;
  ctx.fill();
}

function drawLeafbug(id, color, attack = false, hit = false, ctx = _ctx, date) {
  ctx.strokeStyle = mixColors(colors.lighterBlack, "#FF0000", hit * 0.5);
  ctx.lineWidth = 0.2;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const rot =
      i * 0.52 -
      0.79 +
      Math.cos(date * (0.0025 + attack * 0.0125) + i + id / 3) * 0.2;

    ctx.rotate(rot);
    ctx.moveTo(-0.1, -0.8);
    ctx.quadraticCurveTo(0.1, -0.8, -0.1, 0);
    ctx.quadraticCurveTo(0.1, 0.8, -0.1, 0.8);
    ctx.rotate(-rot);
  }
  ctx.stroke();
  ctx.closePath();

  // Pincer
  const pincerRot =
    Math.sin(date * (0.005 + attack * 0.01) + id / 4) * 0.15 + Math.PI / 10;
  ctx.fillStyle = ctx.strokeStyle;
  ctx.save();
  ctx.translate(0.6, -0.2);
  ctx.rotate(pincerRot);
  scorpionPincer(ctx);
  ctx.rotate(-pincerRot);
  ctx.scale(1, -1);
  ctx.translate(0, -0.4);
  ctx.rotate(pincerRot);
  scorpionPincer(ctx);
  ctx.rotate(-pincerRot);
  ctx.restore();

  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.125);
  ctx.beginPath();
  ctx.moveTo(0.6609, 0.4525);
  ctx.quadraticCurveTo(0.2989, 0.6336, -0.1536, 0.5431);
  ctx.quadraticCurveTo(-0.5157, 0.4525, -0.7872, 0.2715);
  ctx.quadraticCurveTo(-1.104, 0.0453, -0.8777, -0.181);
  ctx.quadraticCurveTo(-0.6062, -0.4525, -0.1536, -0.5431);
  ctx.quadraticCurveTo(0.2989, -0.6336, 0.7062, -0.4073);
  ctx.quadraticCurveTo(1.2493, 0.0453, 0.6609, 0.4525);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0.65, 0.05);
  ctx.lineTo(0.55, 0);
  ctx.lineTo(0.25, 0.25);
  ctx.lineTo(0.5, 0);
  ctx.lineTo(0, 0);
  ctx.lineTo(-0.3, 0.25);
  ctx.lineTo(-0.1, 0);
  ctx.lineTo(-0.55, 0);
  ctx.lineTo(-0.1, 0);
  ctx.lineTo(-0.3, -0.25);
  ctx.lineTo(0, 0);
  ctx.lineTo(0.5, 0);
  ctx.lineTo(0.25, -0.25);
  ctx.lineTo(0.55, 0);
  ctx.lineTo(0.65, -0.05);
  ctx.closePath();
  ctx.stroke();
}

function drawRoach(hit = false, friend, ctx = _ctx) {
  setStyle(
    ctx,
    mixColors(
      friend ? colors.playerYellow : colors.roachHead,
      "#FF0000",
      hit * 0.5,
    ),
    0.125,
  );
  ctx.beginPath();
  ctx.arc(0.6, 0, 0.4, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  setStyle(
    ctx,
    mixColors(
      friend ? colors.playerYellow : colors.roach,
      "#FF0000",
      hit * 0.5,
    ),
    0.125,
  );
  ctx.beginPath();
  ctx.ellipse(0, 0, 1, 0.65, 0, 0.675, -0.675);
  ctx.quadraticCurveTo(0.3, 0, 0.785, 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = ctx.strokeStyle;
  ctx.beginPath();
  ctx.ellipse(0.3, -0.25, 0.15, 0.2, Math.PI / 10, 0, TAU);
  ctx.ellipse(0.3, 0.25, 0.15, 0.2, -Math.PI / 10, 0, TAU);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-0.6, 0.15);
  ctx.quadraticCurveTo(-0.3, 0.35, 0, 0.3);
  ctx.moveTo(-0.6, -0.15);
  ctx.quadraticCurveTo(-0.3, -0.35, 0, -0.3);
  ctx.stroke();
  ctx.closePath();

  setStyle(ctx, mixColors(colors.lighterBlack, "#FF0000", hit * 0.5), 0.125, 0);
  ctx.beginPath();
  ctx.moveTo(0.85, 0.16);
  ctx.quadraticCurveTo(1.36, 0.18, 1.68, 0.49);
  ctx.quadraticCurveTo(1.26, 0.3, 0.85, 0.16);
  ctx.moveTo(0.85, -0.16);
  ctx.quadraticCurveTo(1.36, -0.18, 1.68, -0.49);
  ctx.quadraticCurveTo(1.26, -0.3, 0.85, -0.16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawHornet(id, color, altColor, hit = false, ctx = _ctx, date) {
  const myColor = mixColors(color, "#FF0000", hit * 0.5);
  const myAltColor = mixColors(altColor, "#FF0000", hit * 0.5);
  setStyle(ctx, myAltColor, 0.15, 0);

  const stingerRotation =
    (date + id * 240) % (9000 + id * 8) > 8500 + id * 4
      ? Math.sin(date / 60 + id * 0.1) * 0.025
      : 0;

  ctx.beginPath();
  ctx.moveTo(-1.55, stingerRotation);
  ctx.lineTo(-0.25, -0.4);
  ctx.lineTo(-0.25, 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  setStyle(ctx, myColor, 0.1);
  ctx.beginPath();
  ctx.ellipse(0, 0, 1, 0.667, 0, 0, TAU);
  ctx.closePath();
  ctx.fill();

  ctx.save();
  ctx.clip();

  ctx.beginPath();
  ctx.rect(-1, -1, 0.334, 2);
  ctx.rect(-0.334, -1, 0.334, 2);
  ctx.rect(0.334, -1, 0.334, 2);
  ctx.fillStyle = myAltColor;
  ctx.fill();

  ctx.restore();

  ctx.beginPath();
  ctx.ellipse(0, 0, 1, 0.667, 0, 0, TAU);
  ctx.closePath();
  ctx.stroke();

  setStyle(ctx, myAltColor, 0.1, 0);

  ctx.beginPath();
  ctx.moveTo(0.85, 0.16);
  ctx.quadraticCurveTo(1.36, 0.18, 1.68, 0.49);
  ctx.quadraticCurveTo(1.26, 0.3, 0.85, 0.16);
  ctx.moveTo(0.85, -0.16);
  ctx.quadraticCurveTo(1.36, -0.18, 1.68, -0.49);
  ctx.quadraticCurveTo(1.26, -0.3, 0.85, -0.16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawMantis(id, color, attack = false, hit = false, ctx = _ctx, date) {
  const black = mixColors(colors.stingerBlack, "#FF0000", hit * 0.5);
  setStyle(ctx, black, 0.125, 0);

  // Legs
  ctx.beginPath();
  const legSpeed = attack ? 0.0075 : 0.0025;
  for (let i = 0; i < 3; i++) {
    const k = [0, 0.1, 0.3][i];
    ctx.moveTo(0.35 - 0.25 * i, -0.2);
    ctx.lineTo(
      0.5 - 0.4 * i - k - Math.sin(date * legSpeed + id / 6 + i) * 0.1,
      0.75 + 0.2 * Math.sin(i + 0.5),
    );
    ctx.moveTo(0.35 - 0.25 * i, 0.2);
    ctx.lineTo(
      0.5 - 0.4 * i - k + Math.sin(date * legSpeed + id / 3 + i / 3) * 0.1,
      -0.75 - 0.2 * Math.sin(i + 0.5),
    );
  }
  ctx.stroke();
  ctx.closePath();

  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.125);
  ctx.beginPath();
  ctx.ellipse(0, 0, 1, 0.65, 0, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-0.55, 0);
  ctx.lineTo(0.15, 0);
  ctx.moveTo(0.3, -0.35);
  ctx.quadraticCurveTo(0.15, 0, 0.3, 0.35);
  ctx.moveTo(-0.45, 0.225);
  ctx.quadraticCurveTo(-0.3, 0.35, 0, 0.4);
  ctx.moveTo(-0.45, -0.225);
  ctx.quadraticCurveTo(-0.3, -0.35, 0, -0.4);
  ctx.stroke();

  setStyle(ctx, black, 0.125, 0);
  ctx.beginPath();
  ctx.moveTo(0.85, 0.16);
  ctx.quadraticCurveTo(1.36, 0.18, 1.68, 0.49);
  ctx.quadraticCurveTo(1.26, 0.3, 0.85, 0.16);
  ctx.moveTo(0.85, -0.16);
  ctx.quadraticCurveTo(1.36, -0.18, 1.68, -0.49);
  ctx.quadraticCurveTo(1.26, -0.3, 0.85, -0.16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

const pupaPath = new Path2D(
  "M.96-.33C.72-.6-.91-.83-.84-.33Q-1.04 0-.84.33C-.91.83.72.6.96.33L.8.27A.03.03 90 11.8-.27Z",
);
function drawPupa(hit = false, color, ctx = _ctx) {
  ctx.save();
  ctx.scale(1.334, 1.334);
  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.1);
  ctx.beginPath();
  ctx.arc(0.6, 0, 0.325, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = ctx.strokeStyle;
  ctx.beginPath();
  ctx.arc(0.7, -0.08, 0.07, 0, TAU);
  ctx.arc(0.7, 0.08, 0.07, 0, TAU);
  ctx.closePath();
  ctx.fill();

  setStyle(ctx, mixColors(colors.spider, "#FF0000", hit * 0.5), 0.1);
  ctx.fill(pupaPath);
  ctx.stroke(pupaPath);

  ctx.beginPath();
  ctx.moveTo(0.65, -0.35);
  ctx.bezierCurveTo(0.65, -0.35, -0.05, -0.45, -0.6, -0.1);
  ctx.moveTo(0.65, 0.35);
  ctx.bezierCurveTo(0.65, 0.35, -0.05, 0.45, -0.6, 0.1);
  ctx.moveTo(-0.475, -0.4);
  ctx.bezierCurveTo(-0.475, -0.4, -0.8, -0.2, -0.7, -0.1);
  ctx.moveTo(-0.475, 0.4);
  ctx.bezierCurveTo(-0.475, 0.4, -0.8, 0.2, -0.7, 0.1);
  ctx.moveTo(0.475, -0.25);
  ctx.bezierCurveTo(0.475, -0.25, 0.375, 0, 0.4, 0.25);
  ctx.moveTo(0.275, -0.2);
  ctx.bezierCurveTo(0.2, -0.2, 0.175, 0, 0.275, 0.2);
  ctx.moveTo(0.1, 0);
  ctx.bezierCurveTo(-0.2, -0.1, -0.4, 0.1, -0.6, 0);
  ctx.stroke();
  ctx.closePath();
  ctx.restore();
}

function drawSandstorm(
  id,
  color,
  attack = false,
  hit = false,
  ctx = _ctx,
  date,
) {
  const baseRot = date * (attack ? 0.0075 : 0.0025) + id / 3;

  const myCol = mixColors(color, "#FF0000", hit * 0.5);

  polygon(ctx, 6, 1, baseRot);
  ctx.fillStyle = ctx.strokeStyle = myCol;
  ctx.lineWidth = 0.25;
  ctx.fill();
  ctx.stroke();

  polygon(ctx, 6, 0.667, -baseRot * 0.8 + Math.PI / 2);
  ctx.fillStyle = ctx.strokeStyle = mixColors(myCol, "#000000", 0.15);
  ctx.lineWidth = 0.25;
  ctx.fill();
  ctx.stroke();

  polygon(ctx, 6, 0.334, baseRot * 0.6);
  ctx.fillStyle = ctx.strokeStyle = mixColors(myCol, "#000000", 0.3);
  ctx.lineWidth = 0.25;
  ctx.fill();
  ctx.stroke();
}

function drawScorpion(id, color, hit = false, ctx = _ctx, date) {
  setStyle(ctx, mixColors(colors.stingerBlack, "#FF0000", hit * 0.5), 0.125);

  // Legs
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    ctx.moveTo(0.35 - 0.5 * i, -0.2);
    ctx.lineTo(
      0.5 - 0.5 * i - Math.sin(date / 400 + id / 6 + i) * 0.1,
      0.75 + 0.2 * Math.sin(i),
    );
    ctx.moveTo(0.35 - 0.5 * i, 0.2);
    ctx.lineTo(
      0.5 - 0.5 * i + Math.sin(date / 400 + id / 3 + i) * 0.1,
      -0.75 - 0.2 * Math.sin(i),
    );
  }
  ctx.stroke();
  ctx.closePath();

  // Pincer
  const pincerRot = Math.sin(date * 0.005 + id / 4) * 0.15 + Math.PI / 10;
  ctx.fillStyle = ctx.strokeStyle;
  ctx.save();
  ctx.translate(0.6, -0.2);
  ctx.rotate(pincerRot);
  scorpionPincer(ctx);
  ctx.rotate(-pincerRot);
  ctx.scale(1, -1);
  ctx.translate(0, -0.4);
  ctx.rotate(pincerRot);
  scorpionPincer(ctx);
  ctx.rotate(-pincerRot);
  ctx.restore();

  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.125);

  // Body
  ctx.beginPath();
  ctx.moveTo(-1, 0);
  ctx.bezierCurveTo(-1, -1.2, 1, -0.7, 1, 0);
  ctx.bezierCurveTo(1, 0.7, -1, 1.2, -1, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Main body designs
  ctx.beginPath();
  ctx.moveTo(0.65, -0.3);
  ctx.quadraticCurveTo(0.85, 0, 0.65, 0.3);
  ctx.moveTo(0.3, -0.4);
  ctx.quadraticCurveTo(0.5, 0, 0.3, 0.4);
  ctx.moveTo(0, -0.4);
  ctx.quadraticCurveTo(-0.15, 0, 0, 0.4);
  ctx.moveTo(-0.45, -0.5);
  ctx.quadraticCurveTo(-0.7, 0, -0.45, 0.5);
  ctx.stroke();
  ctx.closePath();

  // Tail/Head
  ctx.beginPath();
  ctx.moveTo(-1.2, 0);
  ctx.bezierCurveTo(-1.2, -0.6, -0.25, -0.3, -0.25, 0);
  ctx.bezierCurveTo(-0.25, 0.3, -1.2, 0.6, -1.2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Tail/Head designs
  ctx.lineWidth = 0.1;
  ctx.beginPath();
  ctx.moveTo(-1, -0.125);
  ctx.quadraticCurveTo(-1.1, 0, -1, 0.125);
  ctx.moveTo(-0.65, -0.175);
  ctx.quadraticCurveTo(-0.85, 0, -0.65, 0.175);
  ctx.stroke();
  ctx.closePath();

  // Stinger
  setStyle(ctx, mixColors(colors.stingerBlack, "#FF0000", hit * 0.5), 0.1, 0);
  ctx.beginPath();
  ctx.moveTo(-0.1, 0);
  ctx.lineTo(-0.35, -0.15);
  ctx.lineTo(-0.35, 0.15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawDemon(
  id,
  friendly,
  hit = false,
  ctx = _ctx,
  attack = false,
  date,
) {
  // Legs
  ctx.strokeStyle = mixColors(colors.stingerBlack, "#FF0000", hit * 0.5);
  ctx.lineWidth = 0.2;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const rot =
      i * 0.52 -
      0.79 +
      Math.cos(date * (0.001 + attack * 0.005) + i + id / 3) * 0.2;

    ctx.rotate(rot);
    ctx.moveTo(-0.1, -0.9);
    ctx.quadraticCurveTo(0.1, -0.9, -0.1, 0);
    ctx.quadraticCurveTo(0.1, 0.9, -0.1, 0.9);
    ctx.rotate(-rot);
  }
  ctx.stroke();
  ctx.closePath();

  // Eye
  setStyle(
    ctx,
    mixColors(
      friendly ? colors.playerYellow : colors.honeyGold,
      "#FF0000",
      hit * 0.5,
    ),
    0.05,
  );
  ctx.beginPath();
  ctx.arc(0.7, 0, 0.35, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Eye angry line thing idfk
  setStyle(ctx, mixColors(colors.stingerBlack, "#FF0000", hit * 0.5), 0.1);
  ctx.beginPath();
  ctx.moveTo(0.9, 0.15);
  ctx.quadraticCurveTo(attack ? 0.8 : 1, 0, 0.9, -0.15);
  ctx.stroke();

  // Body
  setStyle(
    ctx,
    mixColors(
      friendly ? colors.playerYellow : colors.hellMobColor,
      "#FF0000",
      hit * 0.5,
    ),
    0.125,
  );
  ctx.beginPath();
  ctx.moveTo(0.8, 0.3);
  ctx.bezierCurveTo(0.7, 1, -1, 1, -1, 0);
  ctx.bezierCurveTo(-1, -1, 0.7, -1, 0.8, -0.3);
  ctx.quadraticCurveTo(0.7, 0, 0.8, 0.3);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(-0.667, -0.025);
  ctx.quadraticCurveTo(0.1, Math.sin(id * 3 + date / 534) * 0.1, 0.334, -0.025);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(-0.45, -0.3, 0.15, 0, TAU);
  ctx.arc(0, -0.3, 0.15, 0, TAU);
  ctx.arc(0.45, -0.3, 0.15, 0, TAU);
  ctx.moveTo(-0.45, 0.3);
  ctx.arc(-0.45, 0.3, 0.15, 0, TAU);
  ctx.arc(0, 0.3, 0.15, 0, TAU);
  ctx.arc(0.45, 0.3, 0.15, 0, TAU);
  ctx.fillStyle = ctx.strokeStyle;
  ctx.fill();
}

function drawJellyfish(
  id,
  color,
  attack = false,
  hit = false,
  ctx = _ctx,
  date,
) {
  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.125);
  ctx.fillStyle = mixColors(color, "#FF0000", hit * 0.5);
  ctx.strokeStyle = mixColors(color, "#FF0000", hit * 0.5);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.closePath();

  ctx.globalAlpha *= 0.4;
  ctx.fill();

  ctx.globalAlpha *= 1.5;
  ctx.stroke();

  const insider = (10 + date * 0.00125 + id / 4) * (attack * 2 + 1);

  for (let i = 0; i < 8; i++) {
    ctx.rotate((TAU / 8) * i);

    const angle = Math.sin(insider * (1 + i / 8)) * 0.3 * (1 - (i % 2) * 0.2);

    ctx.beginPath();
    ctx.moveTo(0.8, 0);
    ctx.lineTo(1.6, angle);
    ctx.closePath();
    ctx.stroke();

    ctx.rotate((-TAU / 8) * i);
  }
}

const cactusSides = [7, 9, 12, 16, 24, 28, 32, 32, 32, 38, 38, 40];
function drawCactusMob(rarity, color, hit = false, ctx = _ctx) {
  const sides = cactusSides[rarity] ?? 46;

  const spikeCenter = 0.965;
  setStyle(ctx, mixColors(colors.stingerBlack, "#FF0000", hit * 0.5), 0.08, 0);
  ctx.beginPath();

  for (let i = 0; i < sides; i++) {
    const angle = (TAU / sides) * i;

    ctx.save();
    ctx.translate(Math.cos(angle) * spikeCenter, Math.sin(angle) * spikeCenter);
    ctx.rotate(angle);

    ctx.moveTo(0.2, 0);
    ctx.lineTo(0, -0.1);
    ctx.lineTo(0, 0.1);
    ctx.lineTo(0.2, 0);

    ctx.restore();
  }

  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.125);
  dipPolygon(ctx, sides, 1, 6.5 * (sides / 24), 0);
  ctx.fill();
  ctx.stroke();
}

function antHead(x, y, s, id, rotSpd, hit = false, ctx = _ctx, date) {
  ctx.save();

  ctx.strokeStyle = mixColors(colors.stingerBlack, "#FF0000", hit * 0.5);
  ctx.lineWidth = 0.5;

  ctx.translate(x, y);
  ctx.scale(s, s);

  const rotation = Math.sin(date * rotSpd + id / 4) * 0.075;

  ctx.beginPath();
  ctx.moveTo(0, -0.7);
  ctx.rotate(-rotation);
  ctx.quadraticCurveTo(1.25, -0.5, 1.5, -0.4);
  ctx.closePath();
  ctx.stroke();

  ctx.rotate(rotation);

  ctx.beginPath();
  ctx.moveTo(0, 0.7);
  ctx.rotate(rotation);
  ctx.quadraticCurveTo(1.25, 0.5, 1.5, 0.4);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();

  ctx.beginPath();
  ctx.arc(x, y, s, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function termiteHead(x, y, s, id, rotSpd, hit = false, ctx = _ctx, date) {
  ctx.save();

  ctx.strokeStyle = mixColors(colors.stingerBlack, "#FF0000", hit * 0.5);
  ctx.lineWidth = 0.45;

  ctx.translate(x, y);
  ctx.scale(s, s);

  const rotation = Math.sin(date * rotSpd + id / 4) * 0.075;

  ctx.beginPath();
  ctx.moveTo(0, -0.7);
  ctx.rotate(-rotation);
  ctx.lineTo(1.25, -0.5);
  ctx.lineTo(1.5, -0.25);
  ctx.closePath();
  ctx.stroke();

  ctx.rotate(rotation);

  ctx.beginPath();
  ctx.moveTo(0, 0.7);
  ctx.rotate(rotation);
  ctx.lineTo(1.25, 0.5);
  ctx.lineTo(1.5, 0.25);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();

  ctx.beginPath();
  ctx.arc(x, y, s, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawWings(x, y, s, id, rotSpd, hit = false, ctx = _ctx, date) {
  const rotation = Math.sin(date * rotSpd + id / 5) * 0.3 + Math.PI / 10;

  ctx.save();
  ctx.globalAlpha *= 0.3;
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = mixColors("#FFFFFF", "#FF0000", hit * 0.5);

  ctx.beginPath();
  ctx.rotate(rotation);
  ctx.ellipse(0, -0.3, 1.35, 0.5, 0, 0, TAU);
  ctx.rotate(-rotation * 2);
  ctx.ellipse(0, 0.3, 1.35, 0.5, 0, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawBabyAntT(
  id,
  fillColor,
  attk = false,
  hit = false,
  ctx = _ctx,
  date,
) {
  setStyle(ctx, mixColors(fillColor, "#FF0000", hit * 0.5), 0.4);
  antHead(0, 0, 1, id, 0.005 + attk * 0.0025, hit, ctx, date);
}

function drawWorkerAntT(
  id,
  fillColor,
  attk = false,
  hit = false,
  ctx = _ctx,
  date,
) {
  setStyle(ctx, mixColors(fillColor, "#FF0000", hit * 0.5), 0.4);

  ctx.beginPath();
  ctx.arc(-1.1, 0, 0.667, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  antHead(0, 0, 1, id, 0.005 + attk * 0.003, hit, ctx, date);
}

function drawSoldierAntT(
  id,
  fillColor,
  attk = false,
  hit = false,
  ctx = _ctx,
  date,
) {
  setStyle(ctx, mixColors(fillColor, "#FF0000", hit * 0.5), 0.4);

  ctx.beginPath();
  ctx.arc(-1.1, 0, 0.667, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  drawWings(-0.667, 0, 1.25, id, 0.002 + attk * 0.0025, hit, ctx, date);
  antHead(0, 0, 1, id, 0.005 + attk * 0.0035, hit, ctx, date);
}

function drawQueenAntT(
  id,
  fillColor,
  attk = false,
  hit = false,
  ctx = _ctx,
  date,
) {
  setStyle(ctx, mixColors(fillColor, "#FF0000", hit * 0.5), 0.4);

  ctx.beginPath();
  ctx.arc(-2, 0, 1.3, 0, TAU);
  ctx.arc(-1.1, 0, 1.15, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  drawWings(-0.667, 0, 1.25, id, 0.002 + attk * 0.003, hit, ctx, date);
  antHead(0, 0, 1, id, 0.005 + attk * 0.004, hit, ctx, date);
}

function drawAntHoleT(fillColor, hit = false, ctx = _ctx) {
  ctx.fillStyle = mixColors(fillColor, "#FF0000", hit * 0.5);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = mixColors(ctx.fillStyle, "#000000", 0.2);
  ctx.beginPath();
  ctx.arc(0, 0, 0.75, 0, TAU);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = mixColors(ctx.fillStyle, "#000000", 0.25);
  ctx.beginPath();
  ctx.arc(0, 0, 0.5, 0, TAU);
  ctx.closePath();
  ctx.fill();
}

function drawBabyAnt(id, color, attack, hit, ctx = _ctx, date) {
  drawBabyAntT(id, color, attack, hit, ctx, date);
}

function drawWorkerAnt(id, color, attack, hit, ctx = _ctx, date) {
  drawWorkerAntT(id, color, attack, hit, ctx, date);
}

function drawSoldierAnt(id, color, attack, hit, ctx = _ctx, date) {
  drawSoldierAntT(id, color, attack, hit, ctx, date);
}

function drawQueenAnt(id, color, attack, hit, ctx = _ctx, date) {
  drawQueenAntT(id, color, attack, hit, ctx, date);
}

function drawAntHole(hit, color, ctx = _ctx) {
  drawAntHoleT(color, hit, ctx);
}

function drawBabyFireAnt(id, color, attack, hit, ctx = _ctx, date) {
  drawBabyAntT(id, color, attack, hit, ctx, date);
}

function drawWorkerFireAnt(id, color, attack, hit, ctx = _ctx, date) {
  drawWorkerAntT(id, color, attack, hit, ctx, date);
}

function drawSoldierFireAnt(id, color, attack, hit, ctx = _ctx, date) {
  drawSoldierAntT(id, color, attack, hit, ctx, date);
}

function drawQueenFireAnt(id, color, attack, hit, ctx = _ctx, date) {
  drawQueenAntT(id, color, attack, hit, ctx, date);
}

function drawFireAntHole(hit, color, ctx = _ctx) {
  drawAntHoleT(color, hit, ctx);
}

function drawTermiteMound(hit, friend, ctx = _ctx) {
  setStyle(
    ctx,
    mixColors(
      friend ? colors.playerYellow : colors.scorpionBrown,
      "#FF0000",
      hit * 0.5,
    ),
    0.4,
  );
  ctx.beginPath();

  for (let i = 0; i < 7; i++) {
    const ang = (TAU / 7) * i;
    const cs = Math.cos(ang) * 0.6;
    const sn = Math.sin(ang) * 0.6;

    ctx.moveTo(cs, sn);
    ctx.arc(cs, sn, 0.5, 0, TAU);
  }

  ctx.fill();
  ctx.stroke();

  drawAntHoleT(friend ? colors.playerYellow : colors.termite, hit, ctx);
}

function drawBabyTermite(
  id,
  color,
  attk = false,
  hit = false,
  ctx = _ctx,
  date,
) {
  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.4);
  termiteHead(0, 0, 1, id, 0.005 + attk * 0.0025, hit, ctx, date);
}

function drawWorkerTermite(
  id,
  color,
  attk = false,
  hit = false,
  ctx = _ctx,
  date,
) {
  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.4);

  ctx.beginPath();
  ctx.arc(-1.1, 0, 0.667, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  termiteHead(0, 0, 1, id, 0.005 + attk * 0.003, hit, ctx, date);
}

function drawSoldierTermite(
  id,
  color,
  attk = false,
  hit = false,
  ctx = _ctx,
  date,
) {
  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.4);

  ctx.beginPath();
  ctx.arc(-1.1, 0, 0.667, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  drawWings(-0.667, 0, 1.25, id, 0.002 + attk * 0.0025, hit, ctx, date);
  termiteHead(0, 0, 1, id, 0.005 + attk * 0.0035, hit, ctx, date);
}

function drawTermiteOvermind(
  id,
  color,
  attk = false,
  hit = false,
  ctx = _ctx,
  date,
) {
  ctx.save();
  ctx.strokeStyle = mixColors(colors.stingerBlack, "#FF0000", hit * 0.5);
  ctx.lineWidth = 0.25;
  const rotation = Math.sin(date * (0.001 + attk * 0.02) + id / 4) * 0.03;
  ctx.beginPath();
  ctx.moveTo(0, -0.5);
  ctx.rotate(-rotation);
  ctx.lineTo(1.175, -0.175);
  ctx.closePath();
  ctx.stroke();
  ctx.rotate(rotation);
  ctx.beginPath();
  ctx.moveTo(0, 0.5);
  ctx.rotate(rotation);
  ctx.lineTo(1.175, 0.175);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.2);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawCentipedeSegment(color, hit = false, ctx = _ctx) {
  setStyle(ctx, mixColors(colors.stingerBlack, "#FF0000", hit * 0.5), 0.2, 0);
  ctx.beginPath();
  ctx.arc(0, -0.875, 0.375, 0, TAU);
  ctx.arc(0, 0.875, 0.375, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.2);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawCentipedeHead(id, color, hit = false, ctx = _ctx, date) {
  drawCentipedeSegment(color, hit, ctx);

  const rotation = Math.sin(date * 0.005 + id / 6) * 0.1;

  setStyle(ctx, mixColors(colors.lighterBlack, "#FF0000", hit * 0.5), 0.2);
  ctx.beginPath();
  ctx.moveTo(0.75, -0.2);
  ctx.quadraticCurveTo(1.2, -0.3 - rotation, 1.3, -0.5 - rotation);
  ctx.moveTo(0.75, 0.2);
  ctx.quadraticCurveTo(1.2, 0.3 + rotation, 1.3, 0.5 + rotation);
  ctx.stroke();
  ctx.closePath();
}

function drawDandelionCore(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.white, "#FF0000", hit * 0.5), 0.15);

  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawDandelionMissile(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.lighterBlack, "#FF0000", hit * 0.5), 0.6);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-2.1, 0);
  ctx.closePath();
  ctx.stroke();

  setStyle(ctx, mixColors(colors.white, "#FF0000", hit * 0.5), 0.2);

  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

const spongeColors = [
  colors.peach,
  colors.rosePink,
  colors.sandGold,
  colors.diepPentagon,
];

const spongePtSize = TAU / 30;

function drawSponge(id, friendly, hit = false, ctx = _ctx) {
  ctx.save();
  setStyle(
    ctx,
    mixColors(
      friendly ? colors.playerYellow : spongeColors[id % 4],
      "#FF0000",
      hit * 0.5,
    ),
    0.1175,
  );

  ctx.scale(1.1, 1.1);
  ctx.beginPath();
  for (let i = 0; i < 15; i++) {
    const angle = (i * TAU) / 15;
    const max = angle + spongePtSize;

    if (i === 0) {
      const min = angle - spongePtSize;
      ctx.moveTo(Math.cos(min) * 0.775, Math.sin(min) * 0.775);
    }

    ctx.quadraticCurveTo(
      Math.cos(angle),
      Math.sin(angle),
      Math.cos(max) * 0.775,
      Math.sin(max) * 0.775,
    );
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = ctx.strokeStyle;

  for (let i = 0; i < 5; i++) {
    const angle = (i * TAU) / 5;

    ctx.beginPath();
    ctx.arc(Math.cos(angle) * 0.5, Math.sin(angle) * 0.5, 0.15, 0, TAU);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * 0.25, Math.sin(angle) * 0.25, 0.1, 0, TAU);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * 0.1, Math.sin(angle) * 0.1, 0.05, 0, TAU);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

function drawBubbleMob(color, altColor, hit = false, ctx = _ctx) {
  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.1);
  ctx.strokeStyle = ctx.fillStyle;
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.closePath();
  ctx.globalAlpha *= 0.3;
  ctx.fill();

  ctx.globalAlpha *= 1.75;
  ctx.stroke();

  ctx.fillStyle = mixColors(altColor, "#FF0000", hit * 0.5);
  ctx.beginPath();
  ctx.arc(0.34, -0.34, 0.25, 0, TAU);
  ctx.closePath();
  ctx.globalAlpha *= 0.8;
  ctx.fill();
  ctx.globalAlpha /= 0.8;
}

function drawShellMob(ctx = _ctx, color, hit = false) {
  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.135);
  const fill = ctx.fillStyle;

  // Tail
  ctx.fillStyle = ctx.strokeStyle;
  ctx.beginPath();
  ctx.lineTo(-0.52, -0.34);
  ctx.lineTo(-0.78, -0.5);
  ctx.quadraticCurveTo(-0.61, 0, -0.76, 0.5);
  ctx.lineTo(-0.52, 0.34);
  ctx.lineTo(0.21, 0.95);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  // Body
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.lineTo(-0.52, -0.34);
  ctx.arcTo(-0.87, 0, -0.52, 0.34, 0.45454545454545453);
  ctx.lineTo(-0.52, 0.34);
  ctx.lineTo(0.21, 0.95);
  ctx.arcTo(3.13, 0, 0.21, -0.95, 1);
  ctx.lineTo(-0.52, -0.34);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  // Lines
  ctx.beginPath();
  ctx.moveTo(-0.31, 0.07);
  ctx.lineTo(0.48, 0.2);
  ctx.stroke();
  ctx.moveTo(-0.37, 0.16);
  ctx.lineTo(0.3, 0.5);
  ctx.stroke();
  ctx.moveTo(-0.31, -0.07);
  ctx.lineTo(0.48, -0.2);
  ctx.stroke();
  ctx.moveTo(-0.37, -0.16);
  ctx.lineTo(0.3, -0.5);
  ctx.stroke();
  ctx.closePath();
}

export class StarfishData {
  constructor() {
    this.legs = [1, 1, 1, 1, 1];
    this.legGoals = [1, 1, 1, 1, 1];
    this.livingCount = 5;
  }

  update(health) {
    let realLegCount = (health / 0.2 + 0.5) | 0;

    if (realLegCount > this.livingCount) {
      this.revive();
    }

    if (realLegCount < this.livingCount) {
      this.kill();
    }

    for (let i = 0; i < this.legs.length; i++) {
      if (this.legs[i] !== this.legGoals[i]) {
        this.legs[i] += (this.legGoals[i] - this.legs[i]) / 10;
      }
    }
  }

  revive() {
    if (this.livingCount === 5) {
      return;
    }

    const indexes = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5);

    for (let i = 0; i < indexes.length; i++) {
      if (this.legGoals[indexes[i]] === 0) {
        this.legGoals[indexes[i]] = 1;
        this.livingCount++;
        return;
      }
    }
  }

  kill() {
    if (this.livingCount === 0) {
      return;
    }

    const indexes = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5);

    for (let i = 0; i < indexes.length; i++) {
      if (this.legGoals[indexes[i]] === 1) {
        this.legGoals[indexes[i]] = 0;
        this.livingCount--;
        return;
      }
    }
  }
}

function drawStarfishRender(hit = false, ctx = _ctx) {
  setStyle(ctx, mixColors(colors.starfish, "#FF0000", hit * 0.5), 0.125);

  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (TAU / 5) * i;
    const dist = 1.6;

    if (i === 0) {
      ctx.moveTo(
        Math.cos(angle - (TAU / 10) * 1.8) * 1.6,
        Math.sin(angle - (TAU / 10) * 1.8) * 1.6,
      );
    }

    ctx.quadraticCurveTo(
      Math.cos(angle - TAU / 10) * 0.4,
      Math.sin(angle - TAU / 10) * 0.4,
      Math.cos(angle) * dist + Math.cos(angle - Math.PI / 2) * 0.2,
      Math.sin(angle) * dist + Math.sin(angle - Math.PI / 2) * 0.2,
    );
    ctx.arc(
      Math.cos(angle) * dist,
      Math.sin(angle) * dist,
      0.2,
      angle - Math.PI / 2,
      angle + Math.PI / 2,
    );
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = mixColors(ctx.fillStyle, colors.white, 0.3);
  for (let i = 0; i < 5; i++) {
    const angle = (TAU / 5) * i;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    ctx.beginPath();
    ctx.arc(cos * 0.4, sin * 0.4, 0.15, 0, TAU);
    ctx.moveTo(cos * 0.9, sin * 0.9);
    ctx.arc(cos * 0.9, sin * 0.9, 0.125, 0, TAU);
    ctx.moveTo(cos * 1.4, sin * 1.4);
    ctx.arc(cos * 1.4, sin * 1.4, 0.1125, 0, TAU);
    ctx.fill();
    ctx.closePath();
  }
}

/**
 * @param {boolean} hit
 * @param {CanvasRenderingContext2D} ctx
 * @param {StarfishData} data
 */
function drawLivingStarfish(ctx = _ctx, color, hit = false, data) {
  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.125);

  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (TAU / 5) * i;
    const dist = 1 + 0.6 * data.legs[i];

    if (i === 0) {
      const otherDist = 1 + 0.6 * data.legs[4];
      const k = 1.675 + 0.125 * data.legs[4];
      ctx.moveTo(
        Math.cos(angle - (TAU / 10) * k) * otherDist,
        Math.sin(angle - (TAU / 10) * k) * otherDist,
      );
    }

    ctx.quadraticCurveTo(
      Math.cos(angle - TAU / 10) * 0.4,
      Math.sin(angle - TAU / 10) * 0.4,
      Math.cos(angle) * dist + Math.cos(angle - Math.PI / 2) * 0.2,
      Math.sin(angle) * dist + Math.sin(angle - Math.PI / 2) * 0.2,
    );
    ctx.arc(
      Math.cos(angle) * dist,
      Math.sin(angle) * dist,
      0.2,
      angle - Math.PI / 2,
      angle + Math.PI / 2,
    );
  }
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  ctx.fillStyle = mixColors(ctx.fillStyle, colors.white, 0.3);
  for (let i = 0; i < 5; i++) {
    const angle = (TAU / 5) * i;
    const alive = data.legs[i] > 0.5;

    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    ctx.beginPath();
    ctx.arc(cos * 0.4, sin * 0.4, 0.15, 0, TAU);
    ctx.moveTo(cos * 0.9, sin * 0.9);
    ctx.arc(cos * 0.9, sin * 0.9, 0.125, 0, TAU);
    if (alive) {
      ctx.moveTo(cos * 1.4, sin * 1.4);
      ctx.arc(cos * 1.4, sin * 1.4, 0.1125, 0, TAU);
    }
    ctx.fill();
    ctx.closePath();
  }
}

function drawLeechRender(ctx = _ctx) {
  const fill = colors.lighterBlack;
  const stroke = mixColors(fill, "#000000", 0.2);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.strokeStyle = stroke;
  ctx.lineWidth = 0.125;
  ctx.beginPath();
  ctx.moveTo(0.5, -1);
  ctx.quadraticCurveTo(0.45, -1.125, 0.52, -1.25);
  ctx.moveTo(0.85, -1);
  ctx.quadraticCurveTo(0.85, -1.125, 0.8, -1.25);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0.65, -0.85);
  ctx.quadraticCurveTo(0.5, 0.4, -0.6, 0.9);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 0.5;
  ctx.stroke();
  ctx.strokeStyle = fill;
  ctx.lineWidth = 0.3;
  ctx.stroke();
}

/**
 *
 * @param {boolean} h
 * @param {CanvasRenderingContext2D} ctx
 * @param {{x:number,y:number}[]} bodies
 */
function drawLeechLive(
  h = false,
  ctx = _ctx,
  bodies = [],
  r,
  a = false,
  id,
  friendly = false,
) {
  const fill = mixColors(
    friendly ? colors.playerYellow : colors.lighterBlack,
    "#FF0000",
    0.5 * h,
  );
  const stroke = mixColors(fill, "#000000", 0.2);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const rotSpd = a ? 0.0075 : 0.0025;
  const rotation =
    Math.sin(performance.now() * rotSpd + id / 4) * 0.075 - Math.PI / 10;

  ctx.strokeStyle = stroke;
  ctx.lineWidth = 0.3;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(0, -0.8);
  ctx.rotate(-rotation);
  ctx.quadraticCurveTo(1.15, -1, 1.3, -0.8);
  ctx.stroke();
  ctx.closePath();

  ctx.rotate(rotation);

  ctx.beginPath();
  ctx.moveTo(0, 0.8);
  ctx.rotate(rotation);
  ctx.quadraticCurveTo(1.15, 1, 1.3, 0.8);
  ctx.stroke();
  ctx.closePath();
  ctx.restore();

  ctx.beginPath();
  ctx.moveTo(0, 0);

  ctx.rotate(-r);
  bodies.forEach((body) => {
    ctx.lineTo(body.x, body.y);
  });
  ctx.rotate(r);

  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = fill;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawFlyWings(x, y, s, id, rotSpd, hit = false, ctx = _ctx, date) {
  const rotation = Math.sin(date * rotSpd + id / 5) * 0.3 + Math.PI / 10;

  ctx.save();
  ctx.globalAlpha *= 0.3;
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = mixColors("#FFFFFF", "#FF0000", hit * 0.5);

  ctx.beginPath();
  ctx.rotate(rotation);
  ctx.moveTo(0, -0.25);
  ctx.ellipse(-0.55, -0.25, 0.675, 0.4, 0, 0, TAU);
  ctx.rotate(-rotation * 2);
  ctx.moveTo(0, 0.52);
  ctx.ellipse(-0.55, 0.25, 0.675, 0.4, 0, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawFly(ctx, color, id, attack = false, hit = false, date) {
  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.225);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  drawFlyWings(-0.25, 0, 1.25, id, 0.0025 + attack * 0.0125, hit, ctx, date);
}

function drawMoth(ctx, color, id, attack = false, hit = false, date) {
  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.225);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  drawFlyWings(-0.25, 0, 1.25, id, 0.0025 + attack * 0.0125, hit, ctx, date);

  const rotation =
    1 + Math.sin(date * 0.0025 * (1 + attack * 1.5) + id * 0.2) * 0.1;

  setStyle(ctx, mixColors(colors.stingerBlack, "#FF0000", hit * 0.5), 0.1, 0);
  ctx.beginPath();
  ctx.moveTo(0.75, -0.3);
  ctx.quadraticCurveTo(1.3, -0.35, 1.45, -0.65 * rotation);
  ctx.moveTo(0.75, 0.3);
  ctx.quadraticCurveTo(1.3, 0.35, 1.45, 0.65 * rotation);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(1.45, -0.65 * rotation, 0.2, 0, TAU);
  ctx.arc(1.45, 0.65 * rotation, 0.2, 0, TAU);
  ctx.closePath();
  ctx.fill();
}

function drawMaggot(ctx = _ctx, friendly, hit = false) {
  setStyle(
    ctx,
    mixColors(
      friendly ? colors.playerYellow : colors.peach,
      "#FF0000",
      hit * 0.5,
    ),
    0.2,
  );
  ctx.beginPath();
  ctx.arc(-0.4, 0.2, 0.25, 0, TAU);
  ctx.arc(-0.4, -0.2, 0.25, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  setStyle(
    ctx,
    mixColors(
      friendly ? colors.playerYellow : colors.cumWhite,
      "#FF0000",
      hit * 0.5,
    ),
    0.2,
  );
  ctx.beginPath();
  ctx.ellipse(0, 0, 1, 0.7, 0, (Math.PI * 3) / 4, (Math.PI * 5) / 4, true);
  ctx.quadraticCurveTo(0, -0.2, 0, 0);
  ctx.quadraticCurveTo(0, 0.2, -0.6, 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 0.45);
  ctx.quadraticCurveTo(0.5, 0, 0, -0.45);
  ctx.stroke();
  ctx.closePath();

  ctx.fillStyle = ctx.strokeStyle;
  ctx.beginPath();
  ctx.arc(0.65, 0.15, 0.15, 0, TAU);
  ctx.arc(0.65, -0.15, 0.15, 0, TAU);
  ctx.closePath();
  ctx.fill();
}

function drawFirefly(ctx = _ctx, friendly, id, hit = false, date) {
  setStyle(
    ctx,
    mixColors(
      friendly ? colors.playerYellow : colors.fireFlyLight,
      "#FF0000",
      hit * 0.5,
    ),
    0.125,
  );
  ctx.beginPath();
  ctx.ellipse(-1 * 1.25, 0, 1 * 1.25, 0.75 * 1.25, 0, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  setStyle(
    ctx,
    mixColors(
      friendly ? colors.playerYellow : colors.fireFlyLight,
      "#FF0000",
      hit * 0.5,
    ),
    0.125,
  );
  ctx.beginPath();
  ctx.arc(-1 * 1.25, 0, 0.5 * 1.25, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  drawFlyWings(-0.25 * 1.25, 0, 1.25 * 1.25, id, 0.0025, hit, ctx, date);

  setStyle(
    ctx,
    mixColors(
      friendly ? colors.playerYellow : colors.ants,
      "#FF0000",
      hit * 0.5,
    ),
    0.225,
  );
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawBumbleBee(ctx = _ctx, id, hit = false, date) {
  setStyle(ctx, mixColors(colors.playerYellow, "#FF0000", hit * 0.5), 0.175);
  ctx.beginPath();
  ctx.ellipse(0, 0, 1, 0.825, 0, 0, TAU);
  ctx.closePath();
  ctx.fill();

  ctx.save();
  ctx.clip();

  ctx.beginPath();
  ctx.rect(-1, -1, 0.334, 2);
  ctx.rect(-0.334, -1, 0.334, 2);
  ctx.rect(0.334, -1, 0.334, 2);
  ctx.fillStyle = mixColors(colors.stingerBlack, "#FF0000", hit * 0.5);
  ctx.fill();

  ctx.restore();

  ctx.beginPath();
  ctx.ellipse(0, 0, 1, 0.825, 0, 0, TAU);
  ctx.closePath();
  ctx.stroke();

  const rotation = 1 + Math.sin(date / 334 + id * 0.2) * 0.1;

  setStyle(ctx, mixColors(colors.stingerBlack, "#FF0000", hit * 0.5), 0.1, 0);
  ctx.beginPath();
  ctx.moveTo(0.85, -0.15);
  ctx.quadraticCurveTo(1.25, -0.2, 1.4, -0.45 * rotation);
  ctx.moveTo(0.85, 0.15);
  ctx.quadraticCurveTo(1.25, 0.2, 1.4, 0.45 * rotation);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(1.4, -0.45 * rotation, 0.15, 0, TAU);
  ctx.arc(1.4, 0.45 * rotation, 0.15, 0, TAU);
  ctx.closePath();
  ctx.fill();
}

function drawSquareMob(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.diepSquare, "#FF0000", hit * 0.5), 0.15);
  polygon(ctx, 4, 0.925, 0);
  ctx.fill();
  ctx.stroke();
}

function drawTriangleMob(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.diepTriangle, "#FF0000", hit * 0.5), 0.15);
  polygon(ctx, 3, 0.925, 0);
  ctx.fill();
  ctx.stroke();
}

function drawPentagonMob(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.diepPentagon, "#FF0000", hit * 0.5), 0.15);
  polygon(ctx, 5, 0.925, 0);
  ctx.fill();
  ctx.stroke();
}

function drawHellBeetle(
  ctx = _ctx,
  color,
  id,
  hit = false,
  attack = false,
  date,
) {
  const pincerRot =
    Math.sin(date * (0.0085 + 0.0085 * attack) + id / 4) * 0.15 + Math.PI / 20;

  setStyle(
    ctx,
    mixColors(
      mixColors(colors.stingerBlack, color, 0.25),
      "#FF0000",
      hit * 0.5,
    ),
    0.1,
  );
  ctx.save();
  ctx.translate(1, -0.2);
  ctx.rotate(pincerRot);
  ctx.beginPath();
  ctx.lineTo(-0.2805, -0.1445);
  ctx.quadraticCurveTo(0.306, -0.374, 0.6885, -0.085);
  ctx.quadraticCurveTo(0.7905, -0.0085, 0.697, 0.0765);
  ctx.quadraticCurveTo(0.3655, 0, -0.2125, 0.204);
  ctx.closePath();
  ctx.fill();
  ctx.rotate(-pincerRot);
  ctx.translate(0, 0.4);
  ctx.rotate(-pincerRot);
  ctx.beginPath();
  ctx.lineTo(-0.2805, 0.1445);
  ctx.quadraticCurveTo(0.306, 0.374, 0.6885, 0.085);
  ctx.quadraticCurveTo(0.7905, 0.0085, 0.697, -0.0765);
  ctx.quadraticCurveTo(0.3655, 0, -0.2125, -0.204);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  drawBeetle(id, color, hit, ctx, attack, date);
}

function drawHellSpider(
  ctx = _ctx,
  color,
  id,
  hit = false,
  attack = fals,
  date,
) {
  const pincerRot =
    Math.sin(date * (0.0085 + 0.0085 * attack) + id / 4) * 0.15 + Math.PI / 20;

  setStyle(
    ctx,
    mixColors(
      mixColors(colors.stingerBlack, color, 0.25),
      "#FF0000",
      hit * 0.5,
    ),
    0.1,
  );
  ctx.save();
  ctx.translate(0.7, -0.2);
  ctx.rotate(pincerRot);
  ctx.beginPath();
  ctx.lineTo(-0.2805, -0.1445);
  ctx.quadraticCurveTo(0.306, -0.374, 0.6885, -0.085);
  ctx.quadraticCurveTo(0.7905, -0.0085, 0.697, 0.0765);
  ctx.quadraticCurveTo(0.3655, 0, -0.2125, 0.204);
  ctx.closePath();
  ctx.fill();
  ctx.rotate(-pincerRot);
  ctx.translate(0, 0.4);
  ctx.rotate(-pincerRot);
  ctx.beginPath();
  ctx.lineTo(-0.2805, 0.1445);
  ctx.quadraticCurveTo(0.306, 0.374, 0.6885, 0.085);
  ctx.quadraticCurveTo(0.7905, 0.0085, 0.697, -0.0765);
  ctx.quadraticCurveTo(0.3655, 0, -0.2125, -0.204);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Legs
  ctx.strokeStyle = mixColors(colors.stingerBlack, "#FF0000", hit * 0.5);
  ctx.lineWidth = 0.334;
  ctx.beginPath();
  for (let i = 0; i < 4; i++) {
    const rot =
      i * 0.52 -
      0.79 +
      Math.cos(2 + date * (0.0025 + attack * 0.0125) + i + id / 3) * 0.2;

    ctx.rotate(rot);
    ctx.moveTo(0, -2.2);
    ctx.quadraticCurveTo(0.2, -1, 0, 0);
    ctx.quadraticCurveTo(-0.2, 1, 0, 2.2);
    ctx.rotate(-rot);
  }
  ctx.stroke();
  ctx.closePath();

  // Body
  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.235);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawHellYellowjacket(
  ctx = _ctx,
  color,
  id,
  hit = false,
  attack = false,
  date,
) {
  const myColor = mixColors(color, "#FF0000", hit * 0.5);
  const myAltColor = mixColors(colors.stingerBlack, "#FF0000", hit * 0.5);
  const stingerRotation = attack
    ? Math.sin(date / 60 + id * 0.1) * 0.03
    : (date + id * 240) % (9000 + id * 8) > 8500 + id * 4
      ? Math.sin(date / 60 + id * 0.1) * 0.025
      : 0;

  setStyle(ctx, mixColors(myColor, "#000000", 0.2), 0.15, 0);
  ctx.beginPath();
  ctx.moveTo(-1.55, stingerRotation);
  ctx.lineTo(-0.25, -0.4);
  ctx.lineTo(-0.25, 0.4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  setStyle(ctx, myColor, 0.1);
  ctx.beginPath();
  ctx.ellipse(0, 0, 1, 0.7, 0, 0, TAU);
  ctx.closePath();
  ctx.fill();

  ctx.save();
  ctx.clip();

  ctx.beginPath();
  ctx.rect(-1, -1, 0.5, 2);
  ctx.rect(0.1, -1, 0.4, 2);
  ctx.fillStyle = myAltColor;
  ctx.fill();

  ctx.restore();

  ctx.beginPath();
  ctx.ellipse(0, 0, 1, 0.667, 0, 0, TAU);
  ctx.closePath();
  ctx.stroke();

  setStyle(ctx, myAltColor, 0.1, 0);

  ctx.beginPath();
  ctx.moveTo(0.85, 0.16);
  ctx.quadraticCurveTo(1.36, 0.18, 1.68, 0.49);
  ctx.quadraticCurveTo(1.26, 0.3, 0.85, 0.16);
  ctx.moveTo(0.85, -0.16);
  ctx.quadraticCurveTo(1.36, -0.18, 1.68, -0.49);
  ctx.quadraticCurveTo(1.26, -0.3, 0.85, -0.16);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wings
  const wingRotation =
    Math.sin(date * (0.0025 + attack * 0.0125) + id / 5) * 0.3 + Math.PI / 10;

  ctx.save();
  ctx.globalAlpha *= 0.3;
  ctx.translate(-0.25, 0);
  ctx.scale(1.25, 1.25);
  ctx.fillStyle = mixColors("#FFFFFF", "#FF0000", hit * 0.5);

  ctx.beginPath();
  ctx.rotate(wingRotation);
  ctx.moveTo(-0.2, -0.3);
  ctx.ellipse(-0.55, -0.25, 0.7, 0.4, 0, 0, TAU);
  ctx.rotate(-wingRotation * 2);
  ctx.moveTo(-0.2, 0.3);
  ctx.ellipse(-0.55, 0.25, 0.7, 0.4, 0, 0, TAU);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

const spiritColors = [
  colors.rockGray,
  colors.lighterBlack,
  colors.stingerBlack,
  mixColors(colors.ancient, colors.rockGray, 0.5),
  mixColors(colors.ancient, colors.lighterBlack, 0.5),
  mixColors(colors.ancient, colors.stingerBlack, 0.5),
  mixColors(colors.omega, colors.rockGray, 0.5),
  mixColors(colors.omega, colors.lighterBlack, 0.5),
  mixColors(colors.omega, colors.stingerBlack, 0.5),
  mixColors(colors.orange, colors.rockGray, 0.5),
  mixColors(colors.orange, colors.lighterBlack, 0.5),
  mixColors(colors.orange, colors.stingerBlack, 0.5),
  mixColors(colors.scorpionBrown, colors.rockGray, 0.5),
  mixColors(colors.scorpionBrown, colors.lighterBlack, 0.5),
  mixColors(colors.scorpionBrown, colors.stingerBlack, 0.5),
  mixColors(colors.irisPurple, colors.rockGray, 0.5),
  mixColors(colors.irisPurple, colors.lighterBlack, 0.5),
  mixColors(colors.irisPurple, colors.stingerBlack, 0.5),
];

const SpiritSpiral = new Path2D(
  "m0 0c-.011-.0114.0151-.0218.0222-.0215.0405.0016.0498.0542.0385.0844-.0263.0703-.1173.0806-.1764.0487-.1042-.0562-.1155-.1969-.0563-.2896.0909-.1422.2899-.1543.4206-.0622.1841.1298.1967.3948.067.5671-.1727.2295-.5101.2423-.7277.0709-.2782-.2192-.2911-.6351-.0741-.9012.269-.33.7691-.3427 1.0868-.0767.3825.3203.3973.9056.0833 1.2781",
);
function drawSpirit(ctx = _ctx, friendly, id, hit = false) {
  setStyle(
    ctx,
    mixColors(
      friendly
        ? mixColors(colors.playerYellow, colors.stingerBlack, 0.5)
        : spiritColors[id % spiritColors.length],
      "#FF0000",
      hit * 0.5,
    ),
    0.2,
  );

  ctx.save();

  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.globalAlpha = 0.5;
  ctx.fill();
  ctx.closePath();
  ctx.stroke(SpiritSpiral);
  ctx.rotate(Math.PI);
  ctx.stroke(SpiritSpiral);

  ctx.restore();
}

function drawStickbug(
  ctx = _ctx,
  id,
  color,
  altColor,
  altColor2,
  attack,
  hit = false,
  date,
) {
  setStyle(ctx, mixColors(altColor, "#FF0000", hit * 0.5), 0.2);

  // legs

  ctx.beginPath();

  for (let i = 0; i < 3; i++) {
    const legRot =
      Math.cos(date * (0.0025 + attack * 0.0125) + i + id) * (i - 0.5) * 0.1;
    ctx.moveTo(-1, 0.5);
    ctx.rotate(legRot);
    ctx.quadraticCurveTo(-1.5, 1.6, -1.75, 1.7);
    ctx.rotate(-legRot);

    ctx.moveTo(-1, -0.5);
    ctx.rotate(legRot);
    ctx.quadraticCurveTo(-1.5, -1.6, -1.75, -1.7);
    ctx.rotate(-legRot);

    ctx.translate(1, 0);
  }

  ctx.stroke();
  ctx.closePath();

  ctx.translate(-3, 0);

  // head

  setStyle(ctx, mixColors(altColor2, "#FF0000", hit * 0.5), 0.2);

  ctx.beginPath();
  ctx.arc(1, 0, 0.6, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  // body

  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.2);

  ctx.beginPath();
  ctx.moveTo(1.5, 0.75);
  ctx.quadraticCurveTo(0.5, 0, 1.5, -0.75);
  ctx.quadraticCurveTo(0.5, -1, -1, -0.75);
  ctx.quadraticCurveTo(-3.5, 0, -1, 0.75);
  ctx.quadraticCurveTo(0.5, 1, 1.5, 0.75);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}

function drawShrub(id, color, ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.125);

  for (let i = 9; i >= 7; i--) {
    polygon(ctx, i, 1 - 0.25 * (9 - i), 0);
    ctx.fill();
    ctx.stroke();
  }

  for (let i = 0; i < 5; i++) {
    const angle = Math.sin(i * 10000 + id) * TAU;
    const radius = Math.sin(i * 1000 + id) * 0.02 + 0.2;
    const d = Math.sin(i * 10000 + id) * 0.7;
    ctx.fillStyle = mixColors(
      mixColors(color, "#000000", 0.115 * Math.sin(1e3 * i + id) + 0.2),
      "#FF0000",
      hit * 0.5,
    );

    ctx.beginPath();
    ctx.arc(Math.cos(angle) * d, Math.sin(angle) * d, radius, 0, TAU);
    ctx.fill();
  }
}

const PumpkinPath = new Path2D(
  "M.7247-.3319C.6942-.3316.6609-.3288.6245-.3232.1584-.2507 0 0 0 0S.1584.2507.6245.3232C1.0907.3956 1.0457 0 1.0457 0S1.0839-.3362.7247-.3319Z",
);
function drawPumpkin(color, altColor, ctx, hit) {
  setStyle(ctx, mixColors(color, "#FF0000", hit * 0.5), 0.125);

  for (let i = 0; i < 10; i++) {
    ctx.fill(PumpkinPath);
    ctx.stroke(PumpkinPath);
    ctx.rotate(TAU / 10);
  }

  setStyle(ctx, mixColors(altColor, "#FF0000", hit * 0.5), 0.1);
  ctx.beginPath();
  polygon(ctx, 7, 0.25, 0);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
}

function drawJackOLantern(color, altColor, ctx, hit, date) {
  // Fire animation
  ctx.save();
  ctx.globalAlpha *= 0.5;
  ctx.fillStyle = mixColors(
    mixColors(color, "#000000", Math.sin(date) * 0.5 + 0.5),
    "#FF0000",
    hit * 0.5,
  );
  ctx.beginPath();
  for (let i = 0; i < 14; i++) {
    let a = (i * TAU) / 14,
      d = 0.75 + Math.sin(1 + date + i * Math.cos(8 + date / 1000) * 0.5);

    if (i === 0) {
      ctx.moveTo(Math.cos(a) * d, Math.sin(a) * d);
    } else {
      ctx.lineTo(Math.cos(a) * d, Math.sin(a) * d);
    }
  }

  ctx.closePath();
  ctx.fill();
  ctx.restore();

  drawPumpkin(color, altColor, ctx, hit);
}

const crabBodyColors = [
  colors.crabBodyOrange,
  colors.diepTriangle,
  colors.antHole,
];

function drawCrab(ctx = _ctx, friendly, id, attack, hit = false, date) {
  setStyle(ctx, mixColors(colors.crabLimbBrown, "#FF0000", hit * 0.5), 0.2);

  for (let i = 0; i < 4; i++) {
    ctx.lineWidth = 0.25;

    const legRot =
      Math.cos(2 + date * (0.0025 + attack * 0.0125) + id + i) * -0.4;
    const legAng = (TAU / 14) * (i - 1.5);

    ctx.beginPath();
    ctx.rotate(legAng);
    ctx.moveTo(0, 0.75);
    ctx.rotate(legRot);
    ctx.lineTo(0, 1.5);
    ctx.lineTo(0, 1.825);
    ctx.rotate(-legRot - legAng);
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.rotate(legAng);
    ctx.moveTo(0, -0.75);
    ctx.rotate(-legRot);
    ctx.lineTo(0, -1.5);
    ctx.lineTo(0, -1.825);
    ctx.rotate(legRot - legAng);
    ctx.stroke();
    ctx.closePath();
  }

  // claws

  const clawRot = Math.cos(date * (0.0025 + attack * 0.0125) + id) * -0.4;

  ctx.translate(0.75, -0.525);
  ctx.rotate(clawRot);
  ctx.scale(0.375, 0.375);

  ctx.translate(0.5, -0.5);

  ctx.beginPath();
  ctx.moveTo(-0.96, -0.31);
  ctx.bezierCurveTo(0.5, -0.91, 0.86, 0.23, 1, 0.54);
  ctx.lineTo(0.4, 0.09);
  ctx.lineTo(0.56, 0.75);
  ctx.bezierCurveTo(0.1, 0.33, -0.38, 0.02, -1, 0.22);
  ctx.bezierCurveTo(-0.95, 0.05, -0.86, -0.12, -0.96, -0.31);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  ctx.translate(-0.5, 0.5);

  ctx.scale(1 / 0.375, 1 / 0.375);
  ctx.rotate(-clawRot);
  ctx.translate(-0.75, 0.525);

  ctx.translate(0.75, 0.525);
  ctx.rotate(-clawRot);
  ctx.scale(0.375, 0.375);

  ctx.translate(0.5, 0.5);

  ctx.beginPath();
  ctx.moveTo(-0.96, 0.31);
  ctx.bezierCurveTo(0.5, 0.91, 0.86, -0.23, 1, -0.54);
  ctx.lineTo(0.4, -0.09);
  ctx.lineTo(0.56, -0.75);
  ctx.bezierCurveTo(0.1, -0.33, -0.38, -0.02, -1, -0.22);
  ctx.bezierCurveTo(-0.95, -0.05, -0.86, 0.12, -0.96, 0.31);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  ctx.translate(-0.5, -0.5);

  ctx.scale(1 / 0.375, 1 / 0.375);
  ctx.rotate(clawRot);
  ctx.translate(-0.75, -0.525);

  setStyle(
    ctx,
    mixColors(
      friendly
        ? colors.playerYellow
        : crabBodyColors[(id * 1000) % crabBodyColors.length],
      "#FF0000",
      hit * 0.5,
    ),
    0.2,
  );

  ctx.beginPath();
  ctx.ellipse(0, 0, 0.825, 1.125, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(0.375, 0.375);
  ctx.quadraticCurveTo(0, 0.1625, -0.375, 0.375);
  ctx.moveTo(0.375, -0.375);
  ctx.quadraticCurveTo(0, -0.1625, -0.375, -0.375);
  ctx.stroke();
  ctx.closePath();
}

function drawDiepTank(ctx = _ctx, hit = false) {
  setStyle(ctx, mixColors(colors.rockGray, "#FF0000", hit * 0.5), 0.2);
  ctx.fillRect(0, -0.4, 1.8, 0.8);
  ctx.strokeRect(0, -0.4, 1.8, 0.8);

  setStyle(ctx, mixColors(colors.diepBlue, "#FF0000", hit * 0.5), 0.2);

  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, TAU);
  ctx.fill();
  ctx.stroke();
}

const mobCache = new Map();

export function drawMob(
  id,
  index,
  rarity,
  hit = false,
  ctx = _ctx,
  attack = false,
  friend = false,
  rot = 0,
  extra = undefined,
  date = performance.now(),
) {
  if (options.cacheMobAssets) {
    const key = `${index}-${rarity}-${friend}`;
    let cached = mobCache.get(key);
    if (!cached) {
      const img = document.createElement("canvas");
      const _ctx = img.getContext("2d");

      const baseSize = 325;
      img.width = img.height = baseSize;
      _ctx.translate(baseSize / 2, baseSize / 2);
      _ctx.scale(baseSize / 6, baseSize / 6);

      _ctx.save();
      _ctx.lineCap = "round";
      _ctx.lineJoin = "round";

      mobRender(_ctx, id, index, rarity, hit, attack, friend, rot, extra, date);
      _ctx.restore();

      cached = img;
      mobCache.set(key, cached);
    }
    const drawSize = 6;
    ctx.drawImage(cached, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    return;
  }
  mobRender(ctx, id, index, rarity, hit, attack, friend, rot, extra, date);
}

function mobRender(
  ctx,
  id,
  index,
  rarity,
  hit,
  attack,
  friend,
  rot,
  extra,
  date = performance.now(),
) {
  if (state.mobConfigs[index].drawing) {
    const actions = state.mobConfigs[index].drawing.actions;
    for (const action of actions) {
      const [actionName, ...args] = action;
      const actionFunc = Drawing.reverseActions[actionName];

      if (!actionFunc) {
        throw new Error(`Unknown action: ${actionName} ${action}`);
      }

      switch (actionFunc) {
        case "circle":
          ctx.arc(args[0], args[1], args[2], 0, Math.PI * 2);
          break;
        case "line":
          ctx.moveTo(args[0], args[1]);
          ctx.lineTo(args[2], args[3]);
          break;
        case "fill":
          ctx.fillStyle = mixColors(args[0], "#FF0000", hit * 0.5);
          ctx.fill();
          break;
        case "stroke":
          ctx.strokeStyle = mixColors(
            mixColors(args[0], "#FF0000", hit * 0.5),
            "#000000",
            args[2],
          );
          ctx.lineWidth = args[1];
          ctx.stroke();
          break;
        case "paint":
          ctx.fillStyle = mixColors(args[0], "#FF0000", hit * 0.5);
          ctx.strokeStyle = mixColors(
            mixColors(args[0], "#FF0000", hit * 0.5),
            "#000000",
            args[2],
          );
          ctx.lineWidth = args[1];
          ctx.fill();
          ctx.stroke();
          break;
        case "polygon": {
          let arg2 = args[2];

          if (isNaN(arg2)) {
            if (typeof arg2 === "string" && arg2.startsWith("date_")) {
              const mult = parseFloat(arg2.split("_")[1]);
              arg2 = date * (isNaN(mult) ? 1 : mult);
            } else if (arg2 === "date") {
              arg2 = date;
            } else {
              arg2 = 0;
            }
          } else {
            arg2 = Number(arg2);
          }

          polygon(ctx, args[0], args[1], arg2);
          break;
        }
        case "spikeBall": {
          let arg2 = args[2];

          if (isNaN(arg2)) {
            if (typeof arg2 === "string" && arg2.startsWith("date_")) {
              const mult = parseFloat(arg2.split("_")[1]);
              arg2 = date * (isNaN(mult) ? 1 : mult);
            } else if (arg2 === "date") {
              arg2 = date;
            } else {
              arg2 = 0;
            }
          } else {
            arg2 = Number(arg2);
          }

          spikeBall(ctx, args[0], args[1], arg2);
          break;
        }
        case "dipPolygon": {
          let arg3 = args[3];

          if (isNaN(arg3)) {
            if (typeof arg3 === "string" && arg3.startsWith("date_")) {
              const mult = parseFloat(arg3.split("_")[1]);
              arg3 = date * (isNaN(mult) ? 1 : mult);
            } else if (arg3 === "date") {
              arg3 = date;
            } else {
              arg3 = 0;
            }
          } else {
            arg3 = Number(arg3);
          }

          dipPolygon(ctx, args[0], args[1], args[2], arg3);
          break;
        }
        case "opacity":
          ctx.globalAlpha = args[0];
          break;
        case "blur":
          ctx.shadowColor = args[0];
          ctx.shadowBlur = args[1];
          break;
        case "noBlur":
          ctx.shadowBlur = 0;
          break;
        case "ellipse": {
          let arg4 = args[4];

          if (isNaN(arg4)) {
            if (typeof arg4 === "string" && arg4.startsWith("date_")) {
              const mult = parseFloat(arg4.split("_")[1]);
              arg4 = date * (isNaN(mult) ? 1 : mult);
            } else if (arg4 === "date") {
              arg4 = date;
            } else {
              arg4 = 0;
            }
          } else {
            arg4 = Number(arg4);
          }

          ctx.ellipse(args[0], args[1], args[2], args[3], arg4, 0, Math.PI * 2);
          break;
        }
        default:
          ctx[actionFunc](...args);
          break;
      }
    }

    return;
  }

  switch (index) {
    case 0:
      drawLadybug(
        id,
        friend ? colors.playerYellow : colors.ladybugRed,
        hit,
        ctx,
        index,
        rarity,
      );
      break;
    case 1:
      drawRock(
        id,
        friend ? colors.playerYellow : colors.rockGray,
        rarity,
        hit,
        ctx,
      );
      break;
    case 2:
      drawBee(id, hit, ctx, date);
      break;
    case 3:
      drawSpider(
        ctx,
        id,
        friend ? colors.playerYellow : colors.spider,
        attack,
        hit,
        date,
      );
      break;
    case 4:
      drawBeetle(
        id,
        friend ? colors.playerYellow : colors.beetlePurple,
        hit,
        ctx,
        attack,
        date,
      );
      break;
    case 5:
      drawLeafbug(
        id,
        friend ? colors.playerYellow : colors.leafGreen,
        attack,
        hit,
        ctx,
        date,
      );
      break;
    case 6:
      drawRoach(hit, friend, ctx);
      break;
    case 7:
      drawHornet(
        id,
        friend ? colors.playerYellow : colors.hornet,
        colors.stingerBlack,
        hit,
        ctx,
        date,
      );
      break;
    case 8:
      drawMantis(
        id,
        friend ? colors.playerYellow : colors.peaGreen,
        attack,
        hit,
        ctx,
        date,
      );
      break;
    case 9:
      drawPupa(hit, friend ? colors.playerYellow : colors.peaGreen, ctx);
      break;
    case 10:
      drawSandstorm(
        id,
        friend ? colors.playerYellow : colors.sand,
        attack,
        hit,
        ctx,
        date,
      );
      break;
    case 11:
      drawScorpion(
        id,
        friend ? colors.playerYellow : colors.scorpionBrown,
        hit,
        ctx,
        date,
      );
      break;
    case 12:
      drawDemon(id, friend, hit, ctx, attack, date);
      break;
    case 13:
      drawJellyfish(
        id,
        friend ? colors.playerYellow : colors.white,
        attack,
        hit,
        ctx,
        date,
      );
      break;
    case 14:
      drawCactusMob(
        rarity,
        friend ? colors.playerYellow : colors.cactusGreen,
        hit,
        ctx,
      );
      break;
    case 15:
      drawBabyAnt(
        id,
        friend ? colors.playerYellow : colors.ants,
        attack,
        hit,
        ctx,
        date,
      );
      break;
    case 16:
      drawWorkerAnt(
        id,
        friend ? colors.playerYellow : colors.ants,
        attack,
        hit,
        ctx,
        date,
      );
      break;
    case 17:
      drawSoldierAnt(
        id,
        friend ? colors.playerYellow : colors.ants,
        attack,
        hit,
        ctx,
        date,
      );
      break;
    case 18:
      drawQueenAnt(
        id,
        friend ? colors.playerYellow : colors.ants,
        attack,
        hit,
        ctx,
        date,
      );
      break;
    case 19:
      drawAntHole(hit, friend ? colors.playerYellow : colors.antHole, ctx);
      break;
    case 20:
      drawBabyFireAnt(
        id,
        friend ? colors.playerYellow : colors.fireAnt,
        attack,
        hit,
        ctx,
        date,
      );
      break;
    case 21:
      drawWorkerFireAnt(
        id,
        friend ? colors.playerYellow : colors.fireAnt,
        attack,
        hit,
        ctx,
        date,
      );
      break;
    case 22:
      drawSoldierFireAnt(
        id,
        friend ? colors.playerYellow : colors.fireAnt,
        attack,
        hit,
        ctx,
        date,
      );
      break;
    case 23:
      drawQueenFireAnt(
        id,
        friend ? colors.playerYellow : colors.fireAnt,
        attack,
        hit,
        ctx,
        date,
      );
      break;
    case 24:
      drawFireAntHole(hit, friend ? colors.playerYellow : colors.fireAnt, ctx);
      break;
    case 25:
      drawBabyTermite(
        id,
        friend ? colors.playerYellow : colors.termite,
        attack,
        hit,
        ctx,
        date,
      );
      break;
    case 26:
      drawWorkerTermite(
        id,
        friend ? colors.playerYellow : colors.termite,
        attack,
        hit,
        ctx,
        date,
      );
      break;
    case 27:
      drawSoldierTermite(
        id,
        friend ? colors.playerYellow : colors.termite,
        attack,
        hit,
        ctx,
        date,
      );
      break;
    case 28:
      drawTermiteOvermind(
        id,
        friend ? colors.playerYellow : colors.termite,
        attack,
        hit,
        ctx,
        date,
      );
      break;
    case 29:
      drawTermiteMound(hit, friend, ctx);
      break;
    case 30: // Ant Egg
    case 31: // Queen Ant Egg
      basicPetal(ctx, hit, colors.peach);
      break;
    case 32: // Fire Ant Egg
    case 33: // Queen Fire Ant Egg
      basicPetal(ctx, hit, mixColors(colors.peach, colors.fireAnt, 0.2));
      break;
    case 34: // Termite Egg
      basicPetal(ctx, hit, mixColors(colors.peach, colors.termite, 0.5));
      break;
    case 35:
      drawLadybug(
        id,
        friend ? colors.playerYellow : colors.evilLadybugRed,
        hit,
        ctx,
        index,
        rarity,
      );
      break;
    case 36:
      drawLadybug(
        id,
        friend ? colors.playerYellow : colors.shinyLadybugGold,
        hit,
        ctx,
        index,
        rarity,
      );
      break;
    case 37:
      drawLadybug(
        id,
        friend ? colors.playerYellow : colors.lightningTeal,
        hit,
        ctx,
        index,
        rarity,
      );
      break;
    case 38:
      drawCentipedeHead(
        id,
        friend ? colors.playerYellow : colors.peaGreen,
        hit,
        ctx,
        date,
      );
      break;
    case 39:
      drawCentipedeSegment(
        friend ? colors.playerYellow : colors.peaGreen,
        hit,
        ctx,
      );
      break;
    case 40:
      drawCentipedeHead(
        id,
        friend ? colors.playerYellow : colors.sand,
        hit,
        ctx,
        date,
      );
      break;
    case 41:
      drawCentipedeSegment(
        friend ? colors.playerYellow : colors.sand,
        hit,
        ctx,
      );
      break;
    case 42:
      drawCentipedeHead(
        id,
        friend ? colors.playerYellow : colors.irisPurple,
        hit,
        ctx,
        date,
      );
      break;
    case 43:
      drawCentipedeSegment(
        friend ? colors.playerYellow : colors.irisPurple,
        hit,
        ctx,
      );
      break;
    case 44:
      drawDandelionCore(ctx, hit);
      break;
    case 45:
      drawSponge(id, friend, hit, ctx);
      break;
    case 46:
      drawBubbleMob(
        friend ? colors.playerYellow : colors.white,
        friend ? colors.playerYellow : colors.white,
        hit,
        ctx,
      );
      break;
    case 47:
      drawShellMob(ctx, friend ? colors.playerYellow : colors.peach, hit);
      break;
    case 48:
      drawLivingStarfish(
        ctx,
        friend ? colors.playerYellow : colors.starfish,
        hit,
        extra,
      );
      break;
    case 49:
      drawLeechLive(hit, ctx, extra, rot, attack, id, friend);
      break;
    case 50:
      drawMaggot(ctx, friend, hit);
      break;
    case 51:
      drawFirefly(ctx, friend, id, hit, date);
      break;
    case 52:
      drawBumbleBee(ctx, id, hit, date);
      break;
    case 53:
      drawMoth(
        ctx,
        friend ? colors.playerYellow : colors.spider,
        id,
        attack,
        hit,
        date,
      );
      break;
    case 54:
      drawFly(
        ctx,
        friend ? colors.playerYellow : colors.ants,
        id,
        attack,
        hit,
        date,
      );
      break;
    case 55:
      drawSquareMob(ctx, hit);
      break;
    case 56:
      drawTriangleMob(ctx, hit);
      break;
    case 57:
      drawPentagonMob(ctx, hit);
      break;
    case 58:
      drawHellBeetle(
        ctx,
        friend ? colors.playerYellow : colors.hellMobColor,
        id,
        hit,
        attack,
        date,
      );
      break;
    case 59:
      drawHellSpider(
        ctx,
        friend ? colors.playerYellow : colors.hellMobColor,
        id,
        hit,
        attack,
        date,
      );
      break;
    case 60:
      drawHellYellowjacket(
        ctx,
        friend ? colors.playerYellow : colors.hellMobColor,
        id,
        hit,
        attack,
        date,
      );
      break;
    case 61: // Termite Ant Egg Poop
      basicPetal(ctx, hit, mixColors(colors.peach, colors.termite, 0.5));
      break;
    case 62:
      drawSpirit(ctx, friend, id, hit);
      break;
    case 63:
      drawHornet(
        id,
        friend ? colors.playerYellow : colors.wasp,
        friend
          ? mixColors(colors.stingerBlack, colors.playerYellow, 0.1)
          : colors.waspDark,
        hit,
        ctx,
        date,
      );
      break;
    case 64:
      drawStickbug(
        ctx,
        id,
        friend ? colors.playerYellow : colors.peach,
        colors.spider,
        colors.uncommon,
        attack,
        hit,
        date,
      );
      break;
    case 65:
      drawShrub(id, friend ? colors.playerYellow : colors.shrubGreen, ctx, hit);
      break;
    case 66:
      drawCentipedeHead(
        id,
        friend ? colors.playerYellow : colors.hellMobColor,
        hit,
        ctx,
        date,
      );
      break;
    case 67:
      drawCentipedeSegment(
        friend ? colors.playerYellow : colors.hellMobColor,
        hit,
        ctx,
      );
      break;
    case 68: // Wilt Head
    case 69: // Wilt Segment
      drawShrub(
        id,
        mixColors(
          friend ? colors.playerYellow : colors.rockGray,
          "#000000",
          0.25 + Math.sin(id * 1000) * 0.125,
        ),
        ctx,
        hit,
      );
      break;
    case 70:
      drawPumpkin(
        friend ? colors.playerYellow : colors.ancient,
        colors.cactusGreen,
        ctx,
        hit,
      );
      break;
    case 71:
      drawJackOLantern(
        friend ? colors.playerYellow : colors.ancient,
        colors.cactusGreen,
        ctx,
        hit,
        date,
      );
      break;
    case 72:
      drawCrab(ctx, friend, id, attack, hit, date);
      break;
    case 73:
      drawDiepTank(ctx, hit);
      break;
  }
}

const UIMobCache = new Map();

export function drawUIMob(index, rarity, ctx = _ctx) {
  const key = `${index}-${rarity}`;
  let cached = UIMobCache.get(key);

  if (!cached) {
    const img = document.createElement("canvas");
    const _ctx = img.getContext("2d");

    const baseSize = 256;
    img.width = img.height = baseSize;

    _ctx.translate(baseSize / 2, baseSize / 2);
    _ctx.scale(baseSize / 7, baseSize / 7);

    _ctx.save();
    _ctx.lineCap = "round";
    _ctx.lineJoin = "round";

    switch (index) {
      case 48:
        drawStarfishRender(false, _ctx);
        break;
      case 49:
        drawLeechRender(_ctx);
        break;
      default:
        drawMob(0, index, rarity, false, _ctx, false, false, 0, undefined, 0);
        break;
    }

    _ctx.restore();

    cached = img;
    UIMobCache.set(key, cached);
  }

  const size = 7;
  ctx.drawImage(cached, -size / 2, -size / 2, size, size);
}
function formatNegativeOrPositive(number, type = 1) {
  if (type === 1) {
    return (number < 0 ? "-" : "") + formatLargeNumber(Math.abs(number));
  } else if (type === 2) {
    return (number < 0 ? "-" : "+") + formatLargeNumber(Math.abs(number));
  } else if (type === 3) {
    return formatLargeNumber(Math.abs(number));
  }
}
function createPetalTooltip(index, rarityIndex) {
  /** @type {PetalConfig} */
  const petal = state.petalConfigs[index];
  const tier = petal.tiers[rarityIndex];

  let width = 350,
    height =
      60 +
      drawWrappedText(petal.description, -10000, -10000, 15, width - 20) +
      30;

  height +=
    17.5 *
    ((tier.health > 0) +
      (tier.damage > 0) +
      (tier.extraHealth !== 0) +
      (tier.constantHeal !== 0) +
      (tier.damageReduction > 0 || tier.damageReduction < 0) +
      (tier.speedMultiplier !== 1) +
      (tier.extraSize !== 0) +
      (tier.extraRadians > 0) +
      (tier.healing > 0) +
      (petal.enemySpeedDebuff !== undefined) +
      (tier.poison !== undefined) +
      (tier.extraRange > 0) +
      (tier.spawnable !== undefined) +
      (tier.extraVision > 0 || tier.extraVision < 0) +
      (tier.pentagramAbility !== undefined) * 4 +
      (tier.lightning !== undefined) +
      (tier.extraPickupRange > 0) +
      (tier.healSpit > 0) +
      (tier.damageReflection !== undefined) +
      (tier.damageReflection?.cap > 0) +
      (tier.density !== 1) +
      (tier.deathDefying !== undefined) * 2 +
      (tier.absorbsDamage !== undefined) +
      (tier.shield > 0) +
      (tier.boost !== undefined) +
      (tier.healBack > 0 || tier.healBack < 0) +
      (tier.lightning?.charges > 1) +
      (petal.extraLighting > 0) +
      (petal.extraDamage !== undefined) * 2 +
      (tier.armor !== 0));

  const canvas = new OffscreenCanvas(width * 2, height * 2);
  const ctx = canvas.getContext("2d");

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.scale(2, 2);

  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, width / 20);
  ctx.globalAlpha = 0.334;
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  text(petal.name, 10, 10, 22.5, "#FFFFFF", ctx);
  text(
    state.tiers[rarityIndex].name,
    10,
    35,
    15,
    state.tiers[rarityIndex].color,
    ctx,
  );

  let timerString = petal.wearable
    ? "🎩"
    : (((petal.cooldown / 22.5) * 100) | 0) / 100 + "s ⟳";

  if (tier.count > 1) {
    timerString = tier.count + "x | " + timerString;
  }

  if (tier.spawnable?.timer > 0) {
    timerString += " + " + +tier.spawnable.timer.toFixed(2) + "s ⚡︎";
  }

  if (tier.boost !== undefined) {
    timerString += " + " + +tier.boost.delay.toFixed(2) + "s ⚡︎";
  }

  ctx.textAlign = "right";
  text(timerString, width - 10, 10, 17.5, "#FFFFFF", ctx);
  ctx.textAlign = "left";

  let newY =
    80 +
    drawWrappedText(petal.description, 10, 60, 15, width - 20, "#FFFFFF", ctx);

  if (tier.health > 0) {
    let x = 10 + text("Health: ", 10, newY, 15, colors.common, ctx);
    x += text(
      formatLargeNumber(+(tier.health * tier.count).toFixed(2)),
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    if (tier.count > 1) {
      x += text(
        " (" +
          formatLargeNumber(+tier.health.toFixed(2)) +
          " x " +
          tier.count +
          ")",
        x,
        newY,
        15,
        colors.white,
        ctx,
      );
    }
    newY += 17.5;
  }

  if (tier.damage > 0) {
    let x =
      10 +
      text(
        "Damage: ",
        10,
        newY,
        15,
        mixColors(colors.legendary, "#FFFFFF", 0.2),
        ctx,
      );
    x += text(
      formatLargeNumber(+(tier.damage * tier.count).toFixed(2)),
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    if (tier.count > 1) {
      x += text(
        " (" +
          formatLargeNumber(+tier.damage.toFixed(2)) +
          " x " +
          tier.count +
          ")",
        x,
        newY,
        15,
        colors.white,
        ctx,
      );
    }
    newY += 17.5;
  }

  if (tier.extraHealth !== 0) {
    let x =
      10 +
      text(
        "Extra Health: ",
        10,
        newY,
        15,
        mixColors(colors.epic, "#FFFFFF", 0.2),
        ctx,
      );
    x += text(
      formatNegativeOrPositive(+tier.extraHealth.toFixed(2)),
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  if (tier.constantHeal !== 0) {
    let x =
      10 +
      text(
        "Constant Heal: ",
        10,
        newY,
        15,
        mixColors(colors.common, "#FFFFFF", 0.2),
        ctx,
      );
    x += text(
      formatNegativeOrPositive(+(tier.constantHeal * 22.5).toFixed(2)) + "/s",
      x,
      newY,
      15,
      colors.white,
      ctx,
    );

    if (petal.healWhenUnder < 1) {
      x += text(" (", x, newY, 15, colors.white, ctx);
      x += text(
        "Under " + +(petal.healWhenUnder * 100).toFixed(2) + "% HP",
        x,
        newY,
        15,
        colors.rosePink,
        ctx,
      );
      text(")", x, newY, 15, colors.white, ctx);
    }

    newY += 17.5;
  }

  if (tier.damageReduction !== 0) {
    if (tier.damageReduction > 0) {
      let x =
        10 +
        text(
          "Damage Reduction: ",
          10,
          newY,
          15,
          mixColors(colors.ultra, "#FFFFFF", 0.2),
          ctx,
        );
      x += text(
        "-" +
          formatNegativeOrPositive(+(tier.damageReduction * 100).toFixed(2)) +
          "%",
        x,
        newY,
        15,
        colors.white,
        ctx,
      );
    } else {
      let x =
        10 +
        text(
          "Extra Damage Taken: ",
          10,
          newY,
          15,
          mixColors(colors.ultra, "#FFFFFF", 0.2),
          ctx,
        );
      x += text(
        "+" +
          formatNegativeOrPositive(
            +(tier.damageReduction * 100).toFixed(2),
            3,
          ) +
          "%",
        x,
        newY,
        15,
        colors.white,
        ctx,
      );
    }
    newY += 17.5;
  }

  if (tier.speedMultiplier !== 1) {
    let x =
      10 +
      text(
        "Speed: ",
        10,
        newY,
        15,
        mixColors(colors.mythic, "#FFFFFF", 0.2),
        ctx,
      );
    x += text(
      formatNegativeOrPositive(
        +((tier.speedMultiplier - 1) * 100).toFixed(2),
        2,
      ) + "%",
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  if (tier.extraSize !== 0) {
    let x =
      10 +
      text(
        "Extra Size: ",
        10,
        newY,
        15,
        mixColors(colors.ancient, "#FFFFFF", 0.2),
        ctx,
      );
    x += text(
      formatNegativeOrPositive(+tier.extraSize.toFixed(2), 2),
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  if (tier.extraRadians > 0) {
    let x =
      10 +
      text(
        "Radians: ",
        10,
        newY,
        15,
        mixColors(colors.super, "#FFFFFF", 0.2),
        ctx,
      );
    x += text(
      formatNegativeOrPositive((+tier.extraRadians * 22.5).toFixed(2), 2) +
        " rad/s",
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  if (tier.healing > 0) {
    let x = 10 + text("Heal: ", 10, newY, 15, colors.rosePink, ctx);
    x += text(
      formatNegativeOrPositive(+tier.healing.toFixed(2), 2),
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  if (petal.enemySpeedDebuff !== undefined) {
    let x = 10 + text("Speed Debuff: ", 10, newY, 15, colors.white, ctx);
    x += text(
      "-" +
        +((1 - petal.enemySpeedDebuff.speedMultiplier) * 100).toFixed(2) +
        "% for " +
        (petal.enemySpeedDebuff.duration / 22.5).toFixed(2) +
        "s",
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  if (tier.poison !== undefined) {
    let x = 10 + text("Poison: ", 10, newY, 15, colors.irisPurple, ctx);
    x += text(
      formatLargeNumber(+tier.poison.damage.toFixed(2)) +
        "/s for " +
        tier.poison.duration.toFixed(2) +
        "s",
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  if (tier.extraRange > 0 || tier.extraRange < 0) {
    let x = 10 + text("Range: ", 10, newY, 15, colors.orange, ctx);
    x += text(
      formatNegativeOrPositive(+tier.extraRange.toFixed(2), 2),
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  if (tier.spawnable !== undefined) {
    let x = 10 + text("Spawns: ", 10, newY, 15, colors.bubbleGrey, ctx);
    x += text(
      state.mobConfigs[tier.spawnable.index].name,
      x,
      newY,
      15,
      colors.peaGreen,
      ctx,
    );
    x += text(" (", x, newY, 15, colors.bubbleGrey, ctx);
    x += text(
      state.tiers[tier.spawnable.rarity].name,
      x,
      newY,
      15,
      state.tiers[tier.spawnable.rarity].color,
      ctx,
    );
    text(")", x, newY, 15, colors.bubbleGrey, ctx);

    newY += 17.5;
  }

  if (tier.extraVision > 0 || tier.extraVision < 0) {
    let x = 10 + text("Vision: ", 10, newY, 15, colors.orange, ctx);
    x += text(
      formatNegativeOrPositive(+tier.extraVision.toFixed(2), 2),
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  if (tier.pentagramAbility !== undefined) {
    text(
      "Spell: " +
        +(tier.pentagramAbility.cooldown / 22.5).toFixed(2) +
        "s ⚡︎, " +
        formatLargeNumber(+tier.pentagramAbility.range.toFixed(2)) +
        " range",
      10,
      newY,
      15,
      colors.evilLadybugRed,
      ctx,
    );
    newY += 17.5;

    text(
      "- Damage: " +
        formatLargeNumber(+tier.pentagramAbility.damage.toFixed(2)),
      20,
      newY,
      15,
      mixColors(colors.legendary, "#FFFFFF", 0.2),
      ctx,
    );
    newY += 17.5;

    text(
      "- Poison Inflicted: " +
        formatLargeNumber(+tier.pentagramAbility.poison.damage.toFixed(2)) +
        "/s for " +
        +tier.pentagramAbility.poison.duration.toFixed(2) +
        "s",
      20,
      newY,
      15,
      colors.irisPurple,
      ctx,
    );
    newY += 17.5;

    text(
      "- Speed Debuff: " +
        +((1 - tier.pentagramAbility.speedDebuff.multiplier) * 100).toFixed(2) +
        "% for " +
        +tier.pentagramAbility.speedDebuff.duration.toFixed(2) +
        "s",
      20,
      newY,
      15,
      colors.jellyfish,
      ctx,
    );
    newY += 17.5;
  }

  if (tier.lightning !== undefined) {
    let x = 10 + text("Lightning: ", 10, newY, 15, colors.lightningTeal, ctx);
    x += text(
      formatLargeNumber(+tier.lightning.damage.toFixed(2)),
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  if (tier.lightning?.charges > 1) {
    let x =
      10 +
      text(
        "Charges: ",
        10,
        newY,
        15,
        mixColors(colors.lightningTeal, "#FFFFFF", 0.4),
        ctx,
      );
    x += text(
      formatLargeNumber(+tier.lightning.charges),
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  if (tier.extraPickupRange > 0) {
    let x =
      10 +
      text(
        "Pickup Range: ",
        10,
        newY,
        15,
        mixColors(colors.rare, "#FFFFFF", 0.35),
        ctx,
      );
    x += text(
      formatNegativeOrPositive(+tier.extraPickupRange.toFixed(2), 2),
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  if (tier.healSpit > 0) {
    let x = 10 + text("Team Heal: ", 10, newY, 15, colors.rosePink, ctx);
    x += text(
      formatNegativeOrPositive(+tier.healSpit.toFixed(2), 2) +
        "/nearby teammate",
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  if (tier.damageReflection !== undefined) {
    let x =
      10 +
      text(
        "Damage Reflection: ",
        10,
        newY,
        15,
        mixColors(colors.legendary, "#FFFFFF", 0.2),
        ctx,
      );
    x += text(
      formatLargeNumber(+(tier.damageReflection.reflection * 100).toFixed(2)) +
        "%",
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;

    if (tier.damageReflection.cap > 0) {
      let y =
        10 +
        text(
          "Reflection Cap: ",
          10,
          newY,
          15,
          mixColors(colors.legendary, "#FFFFFF", 0.35),
          ctx,
        );
      y += text(
        +(+(tier.damageReflection.cap * 100).toFixed(2)) + "%",
        y,
        newY,
        15,
        colors.white,
        ctx,
      );
      newY += 17.5;
    }
  }

  if (tier.density !== 1) {
    let x =
      10 +
      text(
        "Density: ",
        10,
        newY,
        15,
        mixColors(colors.epic, "#FFFFFF", 0.2),
        ctx,
      );
    x += text(
      formatLargeNumber(+tier.density.toFixed(2)),
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  if (tier.deathDefying !== undefined) {
    let x =
      10 +
      text(
        "Resurrection Health: ",
        10,
        newY,
        15,
        mixColors(colors.mythic, "#FFFFFF", 0.2),
        ctx,
      );
    x += text(
      +(tier.deathDefying.health * 100).toFixed(2) + "%",
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    let y =
      10 +
      text(
        "Resurrection Immunity: ",
        10,
        newY + 17.5,
        15,
        mixColors(colors.super, "#FFFFFF", 0.2),
        ctx,
      );
    y += text(
      +tier.deathDefying.duration.toFixed(2) + "s",
      y,
      newY + 17.5,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5 * 2;
  }

  if (tier.absorbsDamage !== undefined) {
    let x =
      10 +
      text(
        "Absorption: ",
        10,
        newY,
        15,
        mixColors(colors.peaGreen, "#FFFFFF", 0.2),
        ctx,
      );
    x += text(
      formatLargeNumber(+tier.absorbsDamage.maxDamage.toFixed(2)) +
        " dmg over " +
        +tier.absorbsDamage.period.toFixed(2) +
        "s",
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  if (tier.shield > 0) {
    let x =
      10 +
      text(
        "Shield: ",
        10,
        newY,
        15,
        mixColors(colors.mythic, "#FFFFFF", 0.2),
        ctx,
      );
    x += text(
      formatLargeNumber(+tier.shield.toFixed(2)),
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  if (tier.boost !== undefined) {
    let x =
      10 +
      text(
        "Boost: ",
        10,
        newY,
        15,
        mixColors(colors.rare, "#FFFFFF", 0.2),
        ctx,
      );
    x += text(
      formatLargeNumber(+tier.boost.length.toFixed(2)),
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  if (tier.healBack > 0 || tier.healBack < 0) {
    if (tier.healBack > 0) {
      let x = 10 + text("Heal Back: ", 10, newY, 15, colors.inventory, ctx);
      x += text(
        formatLargeNumber(+(tier.damage * tier.healBack).toFixed(2)),
        x,
        newY,
        15,
        colors.white,
        ctx,
      );
    } else {
      let x = 10 + text("Self Damage: ", 10, newY, 15, "#A44343", ctx);
      x += text(
        formatNegativeOrPositive(+(tier.damage * tier.healBack).toFixed(2), 3),
        x,
        newY,
        15,
        colors.white,
        ctx,
      );
    }
    newY += 17.5;
  }

  if (petal.extraLighting > 0) {
    let x = 10 + text("Lighting: ", 10, newY, 15, colors.beeYellow, ctx);
    x += text(
      formatNegativeOrPositive(+petal.extraLighting.toFixed(2), 2),
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  if (petal.extraDamage !== undefined) {
    text(
      "If target is between " +
        petal.extraDamage.minHp.toFixed(2) * 100 +
        "% and " +
        petal.extraDamage.maxHp.toFixed(2) * 100 +
        "%:",
      10,
      newY,
      15,
      colors.legendary,
      ctx,
    );
    text(
      "Extra Damage: " +
        formatLargeNumber(
          tier.damage.toFixed(2) * petal.extraDamage.multiplier.toFixed(2),
        ),
      10,
      newY + 17.5,
      15,
      colors.legendary,
      ctx,
    );
    newY += 17.5 * 2;
  }

  if (tier.armor !== 0) {
    let x =
      10 +
      text(
        "Armor: ",
        10,
        newY,
        15,
        mixColors(colors.lighterBlack, "#FFFFFF", 0.2),
        ctx,
      );
    x += text(
      formatNegativeOrPositive(+tier.armor.toFixed(2)),
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  return canvas;
}

function createMobTooltip(index, rarityIndex) {
  /** @type {MobConfig} */
  const mob = state.mobConfigs[index];
  const tier = mob?.tiers[rarityIndex];

  let width = 350,
    height = 60 + 20;

  if (!tier) {
    height -= 15;

    const canvas = new OffscreenCanvas(width * 2, height * 2);
    const ctx = canvas.getContext("2d");

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.scale(2, 2);

    ctx.beginPath();
    ctx.roundRect(0, 0, width, height, width / 20);
    ctx.globalAlpha = 0.334;
    ctx.fillStyle = "#000000";
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    text("Bot", 10, 10, 22.5, "#FFFFFF", ctx);
    text(
      state.tiers[rarityIndex].name,
      10,
      35,
      15,
      state.tiers[rarityIndex].color,
      ctx,
    );

    return canvas;
  }

  let projectileConfig = state.petalConfigs[tier.projectile?.index];
  let projectileConfigTier = projectileConfig?.tiers[rarityIndex];

  height +=
    17.5 *
    ((tier.health > 0) +
      (tier.damage > 0) +
      (mob.healing > 0) +
      mob.drops.length +
      (mob.drops.length > 0) +
      (tier.damageReduction > 0 || tier.damageReduction < 0) +
      (tier.poison !== null) +
      (tier.lightning > 0) +
      (mob.damageReflection.reflection > 0) +
      (mob.damageReflection?.cap > 0) +
      tier.armor +
      (tier.projectile !== null) * 3 +
      (tier.projectile?.damage > 0) +
      Number.isFinite(tier.projectile?.health) +
      (projectileConfig?.enemySpeedDebuff !== undefined) +
      (projectileConfigTier?.poison !== undefined));

  const canvas = new OffscreenCanvas(width * 2, height * 2);
  const ctx = canvas.getContext("2d");

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.scale(2, 2);

  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, width / 20);
  ctx.globalAlpha = 0.334;
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  text(mob.name, 10, 10, 22.5, "#FFFFFF", ctx);
  text(
    state.tiers[rarityIndex].name,
    10,
    35,
    15,
    state.tiers[rarityIndex].color,
    ctx,
  );

  let newY = 70;

  if (tier.health > 0) {
    let x = 10 + text("Health: ", 10, newY, 15, colors.common, ctx);
    x += text(
      formatLargeNumber(+tier.health.toFixed(2)),
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    if (tier.count > 1) {
      x += text(
        " (" +
          formatLargeNumber(+tier.health.toFixed(2)) +
          " x " +
          tier.count +
          ")",
        x,
        newY,
        15,
        colors.white,
        ctx,
      );
    }
    newY += 17.5;
  }

  if (tier.damage > 0) {
    let x =
      10 +
      text(
        "Damage: ",
        10,
        newY,
        15,
        mixColors(colors.legendary, "#FFFFFF", 0.2),
        ctx,
      );
    x += text(
      formatLargeNumber(+tier.damage.toFixed(2)),
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    if (tier.count > 1) {
      x += text(
        " (" +
          formatLargeNumber(+tier.damage.toFixed(2)) +
          " x " +
          tier.count +
          ")",
        x,
        newY,
        15,
        colors.white,
        ctx,
      );
    }
    newY += 17.5;
  }

  if (mob.healing > 0) {
    let x =
      10 +
      text(
        "Constant Heal: ",
        10,
        newY,
        15,
        mixColors(colors.common, "#FFFFFF", 0.2),
        ctx,
      );
    x += text(
      formatNegativeOrPositive(+(tier.health * mob.healing * 22.5).toFixed(2)) +
        "/s",
      x,
      newY,
      15,
      colors.white,
      ctx,
    );

    newY += 17.5;
  }

  if (tier.damageReduction !== 0) {
    if (tier.damageReduction > 0) {
      let x =
        10 +
        text(
          "Damage Reduction: ",
          10,
          newY,
          15,
          mixColors(colors.ultra, "#FFFFFF", 0.2),
          ctx,
        );
      x += text(
        "-" +
          formatNegativeOrPositive(+(tier.damageReduction * 100).toFixed(2)) +
          "%",
        x,
        newY,
        15,
        colors.white,
        ctx,
      );
    } else {
      let x =
        10 +
        text(
          "Extra Damage Taken: ",
          10,
          newY,
          15,
          mixColors(colors.ultra, "#FFFFFF", 0.2),
          ctx,
        );
      x += text(
        "+" +
          formatNegativeOrPositive(
            +(tier.damageReduction * 100).toFixed(2),
            3,
          ) +
          "%",
        x,
        newY,
        15,
        colors.white,
        ctx,
      );
    }
    newY += 17.5;
  }

  if (tier.poison) {
    let x = 10 + text("Poison: ", 10, newY, 15, colors.irisPurple, ctx);
    x += text(
      formatLargeNumber(+tier.poison.damage.toFixed(2)) +
        "/s for " +
        tier.poison.duration.toFixed(2) +
        "s",
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  if (tier.lightning) {
    let x = 10 + text("Lightning: ", 10, newY, 15, colors.lightningTeal, ctx);
    x += text(
      formatLargeNumber(+tier.lightning.toFixed(2)),
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  if (mob.damageReflection.reflection > 0) {
    let x =
      10 +
      text(
        "Damage Reflection: ",
        10,
        newY,
        15,
        mixColors(colors.legendary, "#FFFFFF", 0.2),
        ctx,
      );
    x += text(
      formatLargeNumber(+(mob.damageReflection.reflection * 100).toFixed(2)) +
        "%",
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;

    if (mob.damageReflection.cap > 0) {
      let y =
        10 +
        text(
          "Reflection Cap: ",
          10,
          newY,
          15,
          mixColors(colors.legendary, "#FFFFFF", 0.35),
          ctx,
        );
      y += text(
        +(+(mob.damageReflection.cap * 100).toFixed(2)) + "%",
        y,
        newY,
        15,
        colors.white,
        ctx,
      );
      newY += 17.5;
    }
  }

  if (tier.armor) {
    let x =
      10 +
      text(
        "Armor: ",
        10,
        newY,
        15,
        mixColors(colors.lighterBlack, "#FFFFFF", 0.2),
        ctx,
      );
    x += text(
      formatNegativeOrPositive(+tier.armor.toFixed(2)),
      x,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  if (tier.projectile !== null) {
    let projectileName = state.petalConfigs[tier.projectile.index].name;
    if (projectileName.includes(".")) {
      projectileName = projectileName.split(".")[0];
    }

    text(
      "Projectile: ",
      10,
      newY,
      15,
      mixColors(colors.lighterBlack, "#FFFFFF", 0.5),
      ctx,
    );
    newY += 17.5;

    if (Number.isFinite(tier.projectile.health)) {
      let x =
        20 +
        text(
          "- Health: ",
          20,
          newY,
          15,
          mixColors(colors.common, "#FFFFFF", 0.1),
          ctx,
        );
      x += text(
        formatLargeNumber(+tier.projectile.health.toFixed(2)),
        x,
        newY,
        15,
        colors.white,
        ctx,
      );
      newY += 17.5;
    }

    if (tier.projectile.damage > 0) {
      let x =
        20 +
        text(
          "- Damage: ",
          20,
          newY,
          15,
          mixColors(colors.legendary, "#FFFFFF", 0.2),
          ctx,
        );
      x += text(
        formatLargeNumber(+tier.projectile.damage.toFixed(2)),
        x,
        newY,
        15,
        colors.white,
        ctx,
      );
      newY += 17.5;
    }

    if (projectileConfigTier.poison !== undefined) {
      let x =
        20 +
        text(
          "- Poison: ",
          20,
          newY,
          15,
          mixColors(colors.irisPurple, "#FFFFFF", 0.1),
          ctx,
        );
      x += text(
        formatLargeNumber(+projectileConfigTier.poison.damage.toFixed(2)) +
          "/s for " +
          projectileConfigTier.poison.duration.toFixed(2) +
          "s",
        x,
        newY,
        15,
        colors.white,
        ctx,
      );
      newY += 17.5;
    }

    if (projectileConfig.enemySpeedDebuff !== undefined) {
      let x = 20 + text("- Speed Debuff: ", 20, newY, 15, colors.white, ctx);
      x += text(
        "-" +
          +(
            (1 - projectileConfig.enemySpeedDebuff.speedMultiplier) *
            100
          ).toFixed(2) +
          "% for " +
          (projectileConfig.enemySpeedDebuff.duration / 22.5).toFixed(2) +
          "s",
        x,
        newY,
        15,
        colors.white,
        ctx,
      );
      newY += 17.5;
    }

    let y =
      20 +
      text(
        "- Type: ",
        20,
        newY,
        15,
        mixColors(colors.playerYellow, "#FFFFFF", 0.1),
        ctx,
      );
    y += text(projectileName, y, newY, 15, colors.white, ctx);
    newY += 17.5;

    let z =
      20 +
      text(
        "- Range: ",
        20,
        newY,
        15,
        mixColors(colors.rare, "#FFFFFF", 0.1),
        ctx,
      );
    z += text(
      +(tier.projectile.range / 22.5).toFixed(2) + "s",
      z,
      newY,
      15,
      colors.white,
      ctx,
    );
    newY += 17.5;
  }

  if (mob.drops.length > 0) {
    text("Drops: ", 10, newY, 15, colors.white, ctx);
    newY += 17.5;

    mob.drops.forEach((drop) => {
      let x =
        20 +
        text(
          "- " + state.petalConfigs[drop.index].name + ": ",
          20,
          newY,
          15,
          colors.white,
          ctx,
        );
      x += text(+(drop.chance * 100) + "%", x, newY, 15, colors.white, ctx);
      if (drop.minRarity > 0) {
        x += text(
          ", Minimum rarity: " + state.tiers[drop.minRarity].name,
          x,
          newY,
          15,
          colors.white,
          ctx,
        );
      }
      newY += 17.5;
    });
  }

  return canvas;
}

const cache = [];

export function petalTooltip(index, rarity) {
  if (!cache[index]) {
    cache[index] = [];
  }

  if (!cache[index][rarity]) {
    cache[index][rarity] = createPetalTooltip(index, rarity);
  }

  return cache[index][rarity];
}

const cache2 = [];

export function mobTooltip(index, rarity) {
  if (!cache2[index]) {
    cache2[index] = [];
  }

  if (!cache2[index][rarity]) {
    cache2[index][rarity] = createMobTooltip(index, rarity);
  }

  return cache2[index][rarity];
}

export const pentagram = (() => {
  const canv = new OffscreenCanvas(256, 256);
  const ctx = canv.getContext("2d");

  ctx.translate(128, 128);
  ctx.scale(124, 124);

  const p = new Path2D(
    "M0 1C.551 1 1 .551 1 0c0-.551-.449-1-1-1-.551 0-1 .449-1 1C-1 .551-.551 1 0 1zM0 .867c-.159 0-.308-.043-.436-.118l.431-.328L.436.749C.308.824.159.867 0 .867zM.318.469l-.195-.145L.245.235.318.469zM.283-.171l.261-.003-.215.156L.283-.171zM.034.197l-.04.029-.119-.085-.074-.055.079-.252.238-.002.077.244L.034.197zM-.135.325l-.183.139.07-.222.031.022L-.135.325zM-.333-.009l-.216-.154.263-.003L-.333-.009zM.867 0c0 .272-.126.515-.323.674l-.168-.535.467-.339C.859-.136.867-.069.867 0zM.801-.331l-.564.005-.161-.538C.404-.835.68-.623.801-.331zM-.001-.547l.07.223-.14.001L-.001-.547zM-.077-.864l-.162.543-.568.006C-.69-.615-.411-.834-.077-.864zM-.381.147l-.165.526c-.196-.159-.322-.402-.322-.673 0-.064.007-.126.02-.186L-.381.147z",
  );
  ctx.strokeStyle = "rgba(255, 128, 100, 1)";
  ctx.lineWidth = 0.05;
  ctx.stroke(p);

  return (ctx = _ctx, k = (performance.now() % 5000) / 5000) => {
    ctx.drawImage(canv, -1, -1, 2, 2);

    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 4) * Math.PI;
      const r =
        k * (Math.sin(i * 5 + k * i + performance.now() / 1000) * 0.05 + 1);

      // Curve between the octagon
      ctx.quadraticCurveTo(
        Math.cos(a + Math.PI / 8) * r,
        Math.sin(a + Math.PI / 8) * r,
        Math.cos(a + Math.PI / 4) * r,
        Math.sin(a + Math.PI / 4) * r,
      );
    }

    ctx.closePath();

    ctx.strokeStyle = "rgba(255, 128, 100, 1)";
    ctx.lineWidth = 0.075;
    ctx.stroke();
  };
})();
