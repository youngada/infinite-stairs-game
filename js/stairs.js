/**
 * 계단 생성: No Gaps. 이전 계단 '끝'에서 다음 계단이 시작되도록 맞물림.
 * 오른쪽: nextX = currentX + width/2, nextY = currentY - height/2
 * 왼쪽:  nextX = currentX - width/2, nextY = currentY - height/2
 */

import {
  STAIR_WIDTH,
  STAIR_HEIGHT,
  STAIR_MIN_CONSECUTIVE,
  STAIR_MAX_CONSECUTIVE,
  INITIAL_STAIRS_COUNT,
  STAIR_X_MIN,
  STAIR_X_MAX,
} from "./constants.js";

/**
 * @typedef {{ x: number, y: number }} Stair  세계 좌표 (계단 윗면 중앙)
 */

/** 90%는 1~4칸(방향전환 자주), 10%만 5~8칸 */
function randomConsecutive() {
  if (Math.random() < 0.1) {
    return 5 + Math.floor(Math.random() * 4);
  }
  return 1 + Math.floor(Math.random() * 4);
}

export const HALF_W = STAIR_WIDTH / 2;
export const HALF_H = STAIR_HEIGHT / 2;

/**
 * 초기 계단 생성. 첫 계단 (0, 0), 이후 대각선으로 딱 맞물려 연결.
 * @param {number} count - 생성할 계단 개수
 * @returns {{ stairs: Stair[], lastDir: number, remaining: number }}
 */
export function generateStairs(count = INITIAL_STAIRS_COUNT) {
  const stairs = [{ x: 0, y: 0 }];
  let x = 0;
  let y = 0;
  let remaining = randomConsecutive();
  let dir = Math.random() < 0.5 ? -1 : 1; // -1: 왼쪽, 1: 오른쪽

  for (let i = 1; i < count; i++) {
    x += dir * HALF_W;
    y -= HALF_H;
    if (x < STAIR_X_MIN) {
      x = STAIR_X_MIN + HALF_W;
      dir = 1;
      remaining = randomConsecutive();
    } else if (x > STAIR_X_MAX) {
      x = STAIR_X_MAX - HALF_W;
      dir = -1;
      remaining = randomConsecutive();
    }
    if (x === stairs[stairs.length - 1].x) {
      x += dir * HALF_W;
      if (x < STAIR_X_MIN) x = STAIR_X_MIN + HALF_W;
      if (x > STAIR_X_MAX) x = STAIR_X_MAX - HALF_W;
    }
    stairs.push({ x, y });
    remaining--;
    if (remaining <= 0) {
      dir = -dir;
      remaining = randomConsecutive();
    }
  }
  return { stairs, lastDir: dir, remaining };
}

/**
 * 계단 한 칸 추가 (맞물림 공식 유지)
 */
export function appendStair(stairs, lastDir, remaining) {
  const last = stairs[stairs.length - 1];
  if (!last) return { stairs, lastDir, remaining };

  let nextRemaining = remaining - 1;
  let nextDir = lastDir;
  if (nextRemaining <= 0) {
    nextDir = -lastDir;
    nextRemaining = randomConsecutive();
  }

  let x = last.x + nextDir * HALF_W;
  let y = last.y - HALF_H;
  if (x < STAIR_X_MIN) {
    x = STAIR_X_MIN + HALF_W;
    nextDir = 1;
    nextRemaining = randomConsecutive();
  } else if (x > STAIR_X_MAX) {
    x = STAIR_X_MAX - HALF_W;
    nextDir = -1;
    nextRemaining = randomConsecutive();
  }
  if (x === last.x) {
    x += nextDir * HALF_W;
    if (x < STAIR_X_MIN) x = STAIR_X_MIN + HALF_W;
    if (x > STAIR_X_MAX) x = STAIR_X_MAX - HALF_W;
  }

  stairs.push({ x, y });
  return { stairs, lastDir: nextDir, remaining: nextRemaining };
}

/**
 * 다음 계단 방향 (오른쪽 1, 왼쪽 -1)
 * @param {Stair[]} stairs
 * @param {number} currentFloor - 현재 층 인덱스
 * @returns { -1 | 1 | null }
 */
export function getNextStairDirection(stairs, currentFloor) {
  const next = stairs[currentFloor + 1];
  const curr = stairs[currentFloor];
  if (!next || !curr) return null;
  const dx = next.x - curr.x;
  if (dx > 0) return 1;
  if (dx < 0) return -1;
  return null;
}
