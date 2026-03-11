/**
 * 계단 생성 로직 단위 테스트 (맞물림 세계 좌표)
 */
import { describe, it, expect } from "vitest";
import {
  generateStairs,
  appendStair,
  getNextStairDirection,
  HALF_W,
  HALF_H,
} from "../js/stairs.js";
import {
  STAIR_MIN_CONSECUTIVE,
  STAIR_MAX_CONSECUTIVE,
  STAIR_X_MIN,
  STAIR_X_MAX,
} from "../js/constants.js";

describe("generateStairs", () => {
  it("첫 계단 (0,0), 지정한 개수만큼 생성", () => {
    const result = generateStairs(20);
    expect(result.stairs).toHaveLength(20);
    expect(result.stairs[0]).toEqual({ x: 0, y: 0 });
  });

  it("매 층 이전 계단 끝에서 맞물림: dx = ±width/2, dy = -height/2", () => {
    const result = generateStairs(50);
    for (let i = 1; i < result.stairs.length; i++) {
      const dx = result.stairs[i].x - result.stairs[i - 1].x;
      const dy = result.stairs[i].y - result.stairs[i - 1].y;
      expect(Math.abs(dx)).toBe(HALF_W);
      expect(dy).toBe(-HALF_H);
    }
  });

  it("한 방향 연속 칸 수가 1~8 범위 (경계 제외)", () => {
    const result = generateStairs(100);
    let run = 1;
    let dir = result.stairs[1].x - result.stairs[0].x;
    for (let i = 2; i < result.stairs.length; i++) {
      const d = result.stairs[i].x - result.stairs[i - 1].x;
      if (d === dir) {
        run++;
      } else {
        const lastX = result.stairs[i - 1].x;
        const margin = HALF_W * 2;
        const atBoundary =
          lastX <= STAIR_X_MIN + margin || lastX >= STAIR_X_MAX - margin;
        if (!atBoundary) {
          expect(run).toBeGreaterThanOrEqual(STAIR_MIN_CONSECUTIVE);
          expect(run).toBeLessThanOrEqual(STAIR_MAX_CONSECUTIVE);
        }
        run = 1;
        dir = d;
      }
    }
  });

  it("lastDir, remaining 반환하여 appendStair에 넘길 수 있음", () => {
    const result = generateStairs(15);
    expect(typeof result.lastDir).toBe("number");
    expect([1, -1]).toContain(result.lastDir);
    expect(typeof result.remaining).toBe("number");
    expect(result.remaining).toBeGreaterThanOrEqual(0);
  });
});

describe("appendStair", () => {
  it("규칙 준수하여 한 칸 추가 (맞물림: dx=±width/2, dy=-height/2)", () => {
    const stairs = [{ x: 0, y: 0 }, { x: HALF_W, y: -HALF_H }];
    const { stairs: next, lastDir, remaining } = appendStair(stairs, 1, 3);
    expect(next.length).toBe(3);
    expect(next[2].y).toBe(-HALF_H * 2);
    const dx = next[2].x - next[1].x;
    expect(Math.abs(dx)).toBe(HALF_W);
  });
});

describe("getNextStairDirection", () => {
  it("다음 계단이 오른쪽이면 1", () => {
    const stairs = [{ x: 0, y: 0 }, { x: HALF_W, y: -HALF_H }];
    expect(getNextStairDirection(stairs, 0)).toBe(1);
  });

  it("다음 계단이 왼쪽이면 -1", () => {
    const stairs = [{ x: HALF_W, y: -HALF_H }, { x: 0, y: -HALF_H * 2 }];
    expect(getNextStairDirection(stairs, 0)).toBe(-1);
  });

  it("다음 계단 없으면 null", () => {
    const stairs = [{ x: 0, y: 0 }];
    expect(getNextStairDirection(stairs, 0)).toBeNull();
  });
});
