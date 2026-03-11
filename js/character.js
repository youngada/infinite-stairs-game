/**
 * 캐릭터 위치 및 포물선 점프 (세계 좌표 기준, 발 = 계단 윗면 중앙 - height/4)
 */

import { JUMP_HEIGHT_WORLD } from "./constants.js";

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function parabola(t, height = JUMP_HEIGHT_WORLD) {
  return 4 * height * t * (1 - t);
}

/**
 * 현재 화면상 캐릭터 위치 (발 = 계단 윗면 currentX, currentY - height/4 에 닿도록 보정)
 * from/to 는 발 세계 좌표 (stair.y - height/4). 포물선은 세계 Y 에 적용 (위로 올라갔다 내려옴).
 * @param {object} state - { fromX, fromY, toX, toY, jumpT, jumpDuration }
 * @param {function} worldToScreen - (wx, wy) => { sx, sy }
 */
export function getCharacterScreenPosition(state, worldToScreen) {
  const { fromX, fromY, toX, toY, jumpT, jumpDuration, intendedDir = 1 } = state;
  const isJumping = jumpDuration > 0 && jumpT < jumpDuration;
  const facingRight = isJumping ? (toX >= fromX) : (intendedDir === 1);

  if (jumpDuration <= 0 || jumpT >= jumpDuration) {
    const p = worldToScreen(toX, toY);
    return { sx: p.sx, sy: p.sy, facingRight };
  }
  const t = Math.min(1, jumpT / jumpDuration);
  const worldX = lerp(fromX, toX, t);
  const worldY = lerp(fromY, toY, t) - parabola(t); // 위로 올라가는 포물선 (세계 Y 감소)
  const p = worldToScreen(worldX, worldY);
  return { sx: p.sx, sy: p.sy, facingRight };
}
