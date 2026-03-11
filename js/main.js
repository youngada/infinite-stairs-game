/**
 * 무한의 계단 - 메인 진입점, 게임 루프, 상태 (세계 좌표 + 맞물린 계단)
 */

import {
  LOGICAL_WIDTH,
  LOGICAL_HEIGHT,
  JUMP_DURATION_MS,
  TIMER_BASE_SEC,
  TIMER_DECREASE_PER_FLOOR,
  TIMER_MIN_SEC,
  INITIAL_STAIRS_COUNT,
  STAIR_HEIGHT,
} from "./constants.js";
import { generateStairs, appendStair, getNextStairDirection } from "./stairs.js";
import { getCharacterScreenPosition, lerp } from "./character.js";
import { worldToScreen } from "./render.js";
import { render } from "./render.js";
import { setupInput } from "./input.js";
import { getHighScore, saveHighScore } from "./storage.js";

const FEET_OFFSET = STAIR_HEIGHT / 4; // 발 = 계단 윗면 중앙 - height/4

function getTimerMax(floor) {
  const sec = TIMER_BASE_SEC - floor * TIMER_DECREASE_PER_FLOOR;
  return Math.max(TIMER_MIN_SEC, sec);
}

const state = {
  gameState: "idle",
  stairs: [],
  stairLastDir: 1,
  stairRemaining: 0,
  character: {
    floor: 0,
    intendedDir: 1, // 1=오른쪽, -1=왼쪽. A키로만 바꿈, 스페이스는 이 방향으로 점프
    fromX: 0,
    fromY: -FEET_OFFSET,
    toX: 0,
    toY: -FEET_OFFSET,
    jumpT: 0,
    jumpDuration: 0,
    screenPos: { sx: 0, sy: 0, facingRight: true },
  },
  camera: { x: 0, y: 0 },
  timer: TIMER_BASE_SEC,
  timerMax: TIMER_BASE_SEC,
  score: 0,
  highScore: 0,
  lastTime: 0,
  catImage: null,
};

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

function worldToScreenChar(wx, wy) {
  return worldToScreen(wx, wy, state.camera.x, state.camera.y);
}

function updateUI() {}

function startGame() {
  const gen = generateStairs(INITIAL_STAIRS_COUNT);
  state.stairs = gen.stairs;
  state.stairLastDir = gen.lastDir;
  state.stairRemaining = gen.remaining;
  const first = state.stairs[0];

  state.character.floor = 0;
  state.character.intendedDir = 1;
  state.character.fromX = first.x;
  state.character.fromY = first.y - FEET_OFFSET;
  state.character.toX = first.x;
  state.character.toY = first.y - FEET_OFFSET;
  state.character.jumpT = 0;
  state.character.jumpDuration = 0;
  state.character.trail = [];
  state.camera.x = first.x;
  state.camera.y = first.y;
  state.timerMax = getTimerMax(0);
  state.timer = state.timerMax;
  state.score = 0;
  state.highScore = getHighScore();
  state.gameState = "playing";
  state.lastTime = performance.now();
  document.getElementById("idle-overlay")?.classList.add("hidden");
  updateUI();
}

function gameOver() {
  state.gameState = "gameover";
  state.highScore = saveHighScore(state.score);
  updateUI();
  const overlay = document.getElementById("gameover-overlay");
  const scoreEl = document.getElementById("gameover-score");
  if (overlay) {
    overlay.classList.remove("hidden");
    if (scoreEl) scoreEl.textContent = `SCORE: ${state.score}  HI: ${state.highScore}`;
  }
}

function onAction(action) {
  if (state.gameState === "gameover") return;
  if (state.gameState === "idle") {
    startGame();
    return;
  }
  if (state.gameState !== "playing") return;
  if (state.character.jumpDuration > 0 && state.character.jumpT < state.character.jumpDuration) return;

  // A = 방향 전환만 (점프 없음)
  if (action === "turn") {
    state.character.intendedDir = -state.character.intendedDir;
    return;
  }

  // 스페이스 = 점프만. 현재 의도 방향(intendedDir)과 다음 계단 방향이 일치해야 함
  if (action !== "climb") return;

  const nextDir = getNextStairDirection(state.stairs, state.character.floor);
  if (nextDir === null) {
    gameOver();
    return;
  }
  if (nextDir !== state.character.intendedDir) {
    gameOver();
    return;
  }

  const nextFloor = state.character.floor + 1;
  const nextStair = state.stairs[nextFloor];
  if (!nextStair) {
    gameOver();
    return;
  }

  const fromStair = state.stairs[state.character.floor];
  state.character.fromX = fromStair.x;
  state.character.fromY = fromStair.y - FEET_OFFSET;
  state.character.toX = nextStair.x;
  state.character.toY = nextStair.y - FEET_OFFSET;
  state.character.jumpT = 0;
  state.character.jumpDuration = JUMP_DURATION_MS;
  state.character.trail = [];
  state.character.floor = nextFloor;
  state.score = nextFloor;
  state.timerMax = getTimerMax(nextFloor);
  state.timer = state.timerMax;

  if (nextFloor >= state.stairs.length - 3) {
    const result = appendStair(state.stairs, state.stairLastDir, state.stairRemaining);
    state.stairs = result.stairs;
    state.stairLastDir = result.lastDir;
    state.stairRemaining = result.remaining;
  }
}

function onRestart() {
  const overlay = document.getElementById("gameover-overlay");
  if (overlay) overlay.classList.add("hidden");
  startGame();
}

function tick(now) {
  const dt = (now - state.lastTime) / 1000;
  state.lastTime = now;

  if (state.gameState === "playing") {
    state.timer = Math.max(0, state.timer - dt);
    if (state.timer <= 0) gameOver();
  }

  if (state.character.jumpDuration > 0) {
    state.character.jumpT += 16;
    if (state.character.jumpT >= state.character.jumpDuration) {
      state.character.jumpT = state.character.jumpDuration;
      state.camera.x = state.character.toX;
      state.camera.y = state.character.toY + FEET_OFFSET;
    } else {
      const t = state.character.jumpT / state.character.jumpDuration;
      state.camera.x = lerp(state.character.fromX, state.character.toX, t);
      state.camera.y = lerp(state.character.fromY, state.character.toY, t) + FEET_OFFSET;
    }
  }

  state.character.screenPos = getCharacterScreenPosition(
    {
      fromX: state.character.fromX,
      fromY: state.character.fromY,
      toX: state.character.toX,
      toY: state.character.toY,
      jumpT: state.character.jumpT,
      jumpDuration: state.character.jumpDuration,
      intendedDir: state.character.intendedDir,
    },
    worldToScreenChar
  );

  // 점프 잔상 (상태에 누적)
  if (
    state.character.jumpDuration > 0 &&
    state.character.jumpT > 0 &&
    state.character.jumpT < state.character.jumpDuration
  ) {
    state.character.trail = state.character.trail || [];
    state.character.trail.push({
      sx: state.character.screenPos.sx,
      sy: state.character.screenPos.sy,
      facingRight: state.character.screenPos.facingRight,
    });
    if (state.character.trail.length > 5) state.character.trail.shift();
  } else {
    state.character.trail = [];
  }

  render(ctx, state);
  updateUI();
  requestAnimationFrame(tick);
}

// 화면 크기 1.5배 (480x720), 내부 좌표는 320x480 유지 후 scale로 확대
canvas.width = 480;
canvas.height = 720;
state.highScore = getHighScore();
updateUI();

setupInput({ onAction, onRestart });
document.getElementById("btn-restart")?.addEventListener("click", onRestart);

const genInit = generateStairs(INITIAL_STAIRS_COUNT);
state.stairs = genInit.stairs;
state.stairLastDir = genInit.lastDir;
state.stairRemaining = genInit.remaining;
const firstStair = state.stairs[0];
state.camera.x = firstStair.x;
state.camera.y = firstStair.y;
state.character.fromX = firstStair.x;
state.character.fromY = firstStair.y - FEET_OFFSET;
state.character.toX = firstStair.x;
state.character.toY = firstStair.y - FEET_OFFSET;
state.character.screenPos = getCharacterScreenPosition(
  { ...state.character, jumpDuration: 0 },
  worldToScreenChar
);
const catImg = new Image();
catImg.onload = () => {
  state.catImage = makeWhiteTransparent(catImg);
};
catImg.src = "assets/cat.png";

/** 이미지에서 흰색(#FFFFFF) 픽셀을 투명하게 만든 캔버스 반환 */
function makeWhiteTransparent(img) {
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, w, h);
  const threshold = 250;
  for (let i = 0; i < data.data.length; i += 4) {
    const r = data.data[i];
    const g = data.data[i + 1];
    const b = data.data[i + 2];
    if (r >= threshold && g >= threshold && b >= threshold) {
      data.data[i + 3] = 0;
    }
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}

render(ctx, state);
state.lastTime = performance.now();
requestAnimationFrame(tick);
