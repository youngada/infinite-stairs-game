/**
 * 레트로 픽셀 상용급: 네온/밤하늘 배경, 입체감 계단, 팔다리 구분 캐릭터, 점프 잔상
 */

import {
  LOGICAL_WIDTH,
  LOGICAL_HEIGHT,
  PLATFORM_W,
  PLATFORM_H,
  CAT_SIZE,
  CAT_SPRITE_W,
  CAT_SPRITE_H,
} from "./constants.js";

const CENTER_X = LOGICAL_WIDTH / 2;
const CENTER_Y = 280;

// 네온/사이버펑크 팔레트
const BG_DARK = "#1a1a2e";
const BG_MID = "#2d2d44";
const BG_NEON = "#16213e";
const NEON_BLUE = "#0f3460";
const CITY_SILHOUETTE = "rgba(15, 25, 45, 0.85)";
const CLOUD_FILL = "rgba(100, 120, 180, 0.12)";

export function worldToScreen(wx, wy, camX, camY) {
  const sx = Math.round(CENTER_X + (wx - camX));
  const sy = Math.round(CENTER_Y + (wy - camY));
  return { sx, sy };
}

export function gridToScreen(wx, wy, camX, camY) {
  return worldToScreen(wx, wy, camX, camY);
}

function setPixelPerfect(ctx) {
  ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingQuality = "low";
}

/** 밤하늘 + 네온 블루 그라데이션, 도시 빌딩 실루엣, 초승달 */
function drawBackground(ctx) {
  const g = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
  g.addColorStop(0, BG_DARK);
  g.addColorStop(0.35, BG_MID);
  g.addColorStop(0.6, BG_NEON);
  g.addColorStop(1, NEON_BLUE);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  // 초승달 (우상단): 밝은 초승달 모양 — 반원 호 + 내부 채우기, 잘 보이게
  const moonX = 260;
  const moonY = 38;
  const moonR = 14;
  ctx.save();
  ctx.beginPath();
  ctx.arc(moonX + moonR, moonY + moonR, moonR, 0, Math.PI * 2);
  ctx.fillStyle = "#f5f0dc";
  ctx.fill();
  ctx.fillStyle = BG_MID;
  ctx.beginPath();
  ctx.arc(moonX + moonR + 6, moonY + moonR, moonR - 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#e8e4c9";
  ctx.fillRect(moonX + 4, moonY + 8, 6, 6);
  ctx.fillRect(moonX + 10, moonY + 4, 4, 4);
  ctx.fillStyle = "#faf5e8";
  ctx.fillRect(moonX + 6, moonY + 10, 4, 4);
  ctx.fillRect(moonX + 12, moonY + 6, 2, 2);

  // 후경 빌딩 (더 어둡고 작게)
  ctx.fillStyle = "rgba(10, 18, 35, 0.9)";
  const backHeights = [100, 140, 80, 120, 90, 130, 70];
  let bx = -10;
  for (let i = 0; i < 14; i++) {
    const bw = 20 + (i % 2) * 6;
    const bh = backHeights[i % backHeights.length];
    ctx.fillRect(bx, LOGICAL_HEIGHT - bh, bw, bh);
    bx += bw + 3;
  }

  // 전경 빌딩 (도시 느낌, 창문 빛 일부)
  ctx.fillStyle = CITY_SILHOUETTE;
  const heights = [100, 150, 70, 120, 90, 140, 60, 110, 85];
  let x = 0;
  for (let i = 0; i < 11; i++) {
    const w = 26 + (i % 3) * 6;
    const h = heights[i % heights.length] + (i % 2) * 15;
    ctx.fillRect(x, LOGICAL_HEIGHT - h, w, h);
    // 빌딩 창문 (아주 연한 노란 픽셀)
    ctx.fillStyle = "rgba(255, 248, 180, 0.25)";
    for (let wy = 2; wy < h - 4; wy += 10) {
      ctx.fillRect(x + 4, LOGICAL_HEIGHT - h + wy, 3, 4);
      ctx.fillRect(x + w - 10, LOGICAL_HEIGHT - h + wy + 5, 3, 4);
    }
    ctx.fillStyle = CITY_SILHOUETTE;
    x += w + 5;
  }
  ctx.fillRect(0, LOGICAL_HEIGHT - 36, LOGICAL_WIDTH, 36);

  // 구름 (픽셀 블록으로 선명하게 여러 개)
  const cloudColor = "rgba(180, 200, 230, 0.35)";
  const cloudHighlight = "rgba(220, 235, 255, 0.25)";
  function drawCloud(cx, cy, size) {
    const u = size;
    ctx.fillStyle = cloudColor;
    ctx.fillRect(cx, cy + u, u * 4, u * 2);
    ctx.fillRect(cx + u, cy, u * 2, u * 2);
    ctx.fillRect(cx + u * 2, cy - 2, u * 2, u * 2);
    ctx.fillRect(cx + u * 3, cy + u - 2, u * 2, u * 2);
    ctx.fillStyle = cloudHighlight;
    ctx.fillRect(cx + u, cy + 2, u, u);
    ctx.fillRect(cx + u * 2, cy + u + 2, u, u);
  }
  drawCloud(16, 72, 8);
  drawCloud(100, 128, 10);
  drawCloud(180, 52, 6);
  drawCloud(240, 160, 8);
  drawCloud(280, 88, 6);
  ctx.fillStyle = cloudColor;
  ctx.fillRect(60, 200, 72, 14);
  ctx.fillRect(76, 192, 44, 14);
  ctx.fillStyle = cloudHighlight;
  ctx.fillRect(76, 194, 20, 8);
  ctx.fillRect(100, 200, 16, 6);
}

/** 픽셀 노이즈용 의사난수 (인덱스 기반) */
function noise(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** 2D 측면 뷰 계단: 하이라이트(밝은 선) + 그림자 + 표면 노이즈 */
const STAIR_BASE = ["#3d5a80", "#4a6fa5", "#5c7caf", "#6b8cbe"];
const STAIR_HIGHLIGHT = "#7eb8e0";
const STAIR_SHADOW = "#1e3a5f";

function drawStairBlock(ctx, sx, sy, index) {
  const r = (n) => Math.round(n);
  const w = PLATFORM_W;
  const h = PLATFORM_H;
  const left = r(sx - w / 2);
  const top = r(sy - h / 2);

  const base = STAIR_BASE[index % STAIR_BASE.length];
  ctx.fillStyle = base;
  ctx.fillRect(left, top, w, h);

  // 표면 노이즈 (약간의 질감)
  for (let py = 0; py < h; py += 2) {
    for (let px = 0; px < w; px += 3) {
      if (noise(index * 7 + px * 0.1 + py * 0.2) > 0.65) {
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(left + px, top + py, 2, 2);
      } else if (noise(index * 11 + px * 0.15 + py) < 0.15) {
        ctx.fillStyle = "rgba(0,0,0,0.06)";
        ctx.fillRect(left + px, top + py, 2, 2);
      }
    }
  }

  // 그림자 (아래·오른쪽)
  ctx.fillStyle = STAIR_SHADOW;
  ctx.fillRect(left, top + h - 2, w, 2);
  ctx.fillRect(left + w - 2, top, 2, h);

  // 하이라이트 (위·왼쪽)
  ctx.fillStyle = STAIR_HIGHLIGHT;
  ctx.fillRect(left, top, w, 2);
  ctx.fillRect(left, top, 2, h);
}

function drawStairs(ctx, stairs, camX, camY, characterFloor) {
  const minI = Math.max(0, characterFloor - 3);
  const maxI = Math.min(stairs.length - 1, characterFloor + 22);
  for (let i = minI; i <= maxI; i++) {
    const s = stairs[i];
    const { sx, sy } = worldToScreen(s.x, s.y, camX, camY);
    drawStairBlock(ctx, sx, sy, i);
  }
}

/** 시암 고양이: 크림색 몸, 포인트(귀·주둥이·발·꼬리), 파란 눈 */
function drawCatCore(ctx, sx, sy, facingRight, alpha = 1) {
  ctx.save();
  if (alpha < 1) ctx.globalAlpha = alpha;
  ctx.translate(Math.round(sx), Math.round(sy));
  if (!facingRight) ctx.scale(-1, 1);
  const r = (n) => Math.round(n);
  const w = Math.round(CAT_SIZE / 2);
  const h = Math.round(CAT_SIZE);

  const CREAM = "#f5e6d3";
  const CREAM_DARK = "#e8d5c4";
  const POINT = "#5c4033";
  const POINT_DARK = "#3e2723";
  const EYE_BLUE = "#4fc3f7";
  const EYE_BLUE_DARK = "#29b6f6";

  // 몸통 (크림)
  ctx.fillStyle = CREAM;
  ctx.fillRect(r(-w + 2), r(-h + 10), r(w * 2 - 4), r(h - 16));
  ctx.fillStyle = CREAM_DARK;
  ctx.strokeRect(r(-w + 2), r(-h + 10), r(w * 2 - 4), r(h - 16));
  ctx.fillStyle = "#faf0e4";
  ctx.fillRect(r(-w + 4), r(-h + 12), r(w * 2 - 8), r(h - 20));

  // 배 (밝은 크림)
  ctx.fillStyle = "#fdf8f2";
  ctx.fillRect(r(-w + 6), r(-h + 18), r(w - 8), r(h - 26));

  // 머리 (크림)
  ctx.fillStyle = CREAM;
  ctx.fillRect(r(w - 10), r(-h + 0), 14, 14);
  ctx.fillStyle = CREAM_DARK;
  ctx.strokeRect(r(w - 10), r(-h + 0), 14, 14);

  // 귀 (포인트 색)
  ctx.fillStyle = POINT;
  ctx.fillRect(r(w - 4), r(-h - 2), 4, 4);
  ctx.fillRect(r(w + 4), r(-h - 2), 4, 4);
  ctx.fillRect(r(w - 8), r(-h + 2), 4, 4);
  ctx.fillRect(r(w + 6), r(-h + 2), 4, 4);
  ctx.fillStyle = POINT_DARK;
  ctx.strokeRect(r(w - 4), r(-h - 2), 4, 4);
  ctx.strokeRect(r(w + 4), r(-h - 2), 4, 4);

  // 주둥이·코 (포인트)
  ctx.fillStyle = POINT;
  ctx.fillRect(r(w), r(-h + 8), 8, 6);
  ctx.fillRect(r(w + 2), r(-h + 10), 4, 4);
  ctx.fillStyle = POINT_DARK;
  ctx.fillRect(r(w + 4), r(-h + 9), 2, 2);

  // 앞다리 (포인트 끝 + 크림)
  ctx.fillStyle = POINT;
  ctx.fillRect(r(w - 4), r(-h + 24), 4, 6);
  ctx.fillRect(r(w + 2), r(-h + 22), 4, 8);
  ctx.fillStyle = CREAM;
  ctx.fillRect(r(w - 4), r(-h + 20), 4, 4);
  ctx.fillRect(r(w + 2), r(-h + 18), 4, 4);
  ctx.fillStyle = POINT_DARK;
  ctx.strokeRect(r(w - 4), r(-h + 20), 4, 10);
  ctx.strokeRect(r(w + 2), r(-h + 18), 4, 12);

  // 뒷다리 (포인트 + 크림)
  ctx.fillStyle = POINT;
  ctx.fillRect(r(-w - 2), r(-h + 26), 5, 6);
  ctx.fillRect(r(-w + 8), r(-h + 28), 5, 4);
  ctx.fillStyle = CREAM;
  ctx.fillRect(r(-w - 2), r(-h + 22), 5, 4);
  ctx.fillRect(r(-w + 8), r(-h + 24), 5, 4);
  ctx.fillStyle = POINT_DARK;
  ctx.strokeRect(r(-w - 2), r(-h + 22), 5, 10);
  ctx.strokeRect(r(-w + 8), r(-h + 24), 5, 8);

  // 꼬리 (포인트)
  ctx.fillStyle = POINT;
  ctx.fillRect(r(-w - 8), r(-h + 14), 10, 5);
  ctx.fillRect(r(-w - 10), r(-h + 18), 12, 4);
  ctx.fillStyle = POINT_DARK;
  ctx.strokeRect(r(-w - 8), r(-h + 14), 10, 5);
  ctx.strokeRect(r(-w - 10), r(-h + 18), 12, 4);

  // 눈 (파란 시암 눈)
  ctx.fillStyle = EYE_BLUE_DARK;
  ctx.fillRect(r(w), r(-h + 4), 3, 3);
  ctx.fillRect(r(w + 6), r(-h + 3), 3, 3);
  ctx.fillStyle = EYE_BLUE;
  ctx.fillRect(r(w + 1), r(-h + 5), 2, 2);
  ctx.fillRect(r(w + 7), r(-h + 4), 2, 2);
  ctx.fillStyle = "#fff";
  ctx.fillRect(r(w + 2), r(-h + 4), 1, 1);
  ctx.fillRect(r(w + 8), r(-h + 3), 1, 1);

  ctx.restore();
}

/** 고양이 스프라이트: 흰 배경은 투명, 좌/우 방향에 맞게 반전, 픽셀아트 선명 유지 */
function drawCatSprite(ctx, sx, sy, facingRight, alpha, img) {
  const ready = img && (img instanceof HTMLCanvasElement || img.complete);
  if (!ready) return;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingQuality = "low";
  if (alpha < 1) ctx.globalAlpha = alpha;
  const w = CAT_SPRITE_W;
  const h = CAT_SPRITE_H;
  const x = Math.round(sx - w / 2);
  const y = Math.round(sy - h);
  ctx.translate(sx, sy);
  if (!facingRight) ctx.scale(-1, 1);
  ctx.translate(-sx, -sy);
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

function drawCat(ctx, sx, sy, facingRight) {
  drawCatCore(ctx, sx, sy, facingRight, 1);
}

function r(n) {
  return Math.round(n);
}

function drawTopUI(ctx, state) {
  const { score, highScore, timer, timerMax } = state;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.font = '10px "Press Start 2P", monospace';
  ctx.fillStyle = "#e0e0ff";
  ctx.strokeStyle = "#0f3460";
  ctx.lineWidth = 2;
  const scoreText = `SCORE: ${score}`;
  ctx.strokeText(scoreText, 6, 12);
  ctx.fillText(scoreText, 6, 12);
  const hiText = `HI: ${highScore}`;
  const hiW = ctx.measureText(hiText).width;
  ctx.strokeText(hiText, r(LOGICAL_WIDTH - hiW - 6), 12);
  ctx.fillText(hiText, r(LOGICAL_WIDTH - hiW - 6), 12);
  const barY = 18,
    barH = 14,
    barLeft = 8,
    barRight = LOGICAL_WIDTH - 8 - 16,
    barW = barRight - barLeft,
    cap = 4;
  ctx.fillStyle = "#1e3a5f";
  ctx.fillRect(barLeft, barY, barW + cap * 2, barH + 4);
  ctx.fillStyle = "#0f3460";
  ctx.strokeRect(barLeft, barY, barW + cap * 2, barH + 4);
  ctx.strokeRect(barLeft + cap, barY + 2, barW, barH);
  const pct = timerMax > 0 ? Math.max(0, timer / timerMax) : 0;
  const fillW = Math.round(barW * pct);
  ctx.fillStyle = "#4a90d9";
  if (fillW > 0) ctx.fillRect(barLeft + cap + 1, barY + 3, fillW, barH - 2);
  ctx.fillStyle = "#2d2d44";
  ctx.strokeRect(barLeft + cap + 1, barY + 3, barW - 2, barH - 2);
  ctx.font = '5px "Press Start 2P", monospace';
  ctx.fillStyle = "#b8d4e8";
  ctx.fillText("TIMER", barRight + 6, barY + 10);
  ctx.restore();
}

function drawBottomButtons(ctx) {
  const btnY = 408,
    btnW = 140,
    btnH = 56,
    leftX = 12,
    rightX = LOGICAL_WIDTH - 12 - btnW;
  function drawOneButton(x, y, isArrow) {
    ctx.fillStyle = "#3d2d5c";
    ctx.fillRect(r(x), r(y), btnW, btnH);
    ctx.strokeStyle = "#2d1f44";
    ctx.lineWidth = 1;
    ctx.strokeRect(r(x), r(y), btnW, btnH);
    ctx.fillStyle = "#7eb8e0";
    ctx.fillRect(r(x), r(y), btnW, 2);
    ctx.fillRect(r(x), r(y), 2, btnH);
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(r(x), r(y + btnH - 2), btnW, 2);
    ctx.fillRect(r(x + btnW - 2), r(y), 2, btnH);
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillStyle = "#e0e0ff";
    ctx.textAlign = "center";
    if (isArrow) {
      ctx.fillText("A", r(x + btnW / 2), r(y + 18));
      ctx.font = '5px "Press Start 2P", monospace';
      ctx.fillText("TURN ONLY", r(x + btnW / 2), r(y + 32));
    } else {
      ctx.fillText("SPACE", r(x + btnW / 2), r(y + 18));
      ctx.font = '5px "Press Start 2P", monospace';
      ctx.fillText("JUMP ONLY", r(x + btnW / 2), r(y + 32));
    }
    ctx.textAlign = "left";
  }
  drawOneButton(leftX, btnY, true);
  drawOneButton(rightX, btnY, false);
}

const SCALE = 480 / 320;
const SCALE_Y = 720 / 480;

export function render(ctx, state) {
  setPixelPerfect(ctx);
  ctx.save();
  ctx.scale(SCALE, SCALE_Y);
  drawBackground(ctx);
  const { stairs, character, camera } = state;
  const cx = camera.x,
    cy = camera.y;
  drawStairs(ctx, stairs, cx, cy, character.floor);

  const catImg = state.catImage;
  const drawChar = (sx, sy, face, alpha) => {
    if (catImg && catImg.complete) drawCatSprite(ctx, sx, sy, face, alpha, catImg);
    else drawCatCore(ctx, sx, sy, face, alpha);
  };

  const trail = character.trail || [];
  const alphas = [0.35, 0.22, 0.12, 0.06];
  for (let i = trail.length - 1; i >= 0; i--) {
    const t = trail[i];
    const a = alphas[trail.length - 1 - i] ?? 0.05;
    drawChar(t.sx, t.sy, t.facingRight, a);
  }

  const { sx, sy, facingRight } = character.screenPos;
  drawChar(sx, sy, facingRight, 1);
  drawTopUI(ctx, state);
  drawBottomButtons(ctx);
  ctx.restore();
}
