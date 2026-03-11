/**
 * 캐릭터 포물선/보간 단위 테스트
 */
import { describe, it, expect } from "vitest";
import { lerp, parabola, getCharacterScreenPosition } from "../js/character.js";

describe("lerp", () => {
  it("t=0이면 from, t=1이면 to", () => {
    expect(lerp(0, 10, 0)).toBe(0);
    expect(lerp(0, 10, 1)).toBe(10);
  });
  it("t=0.5이면 중간", () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });
});

describe("parabola", () => {
  it("t=0, t=1에서 0", () => {
    expect(parabola(0, 10)).toBe(0);
    expect(parabola(1, 10)).toBe(0);
  });
  it("t=0.5에서 최대 높이", () => {
    expect(parabola(0.5, 10)).toBe(10);
  });
});

describe("getCharacterScreenPosition", () => {
  const identity = (gx, gy) => ({ sx: gx * 10, sy: gy * 10 });

  it("점프 완료 시 목표 위치와 facingRight 반환", () => {
    const pos = getCharacterScreenPosition(
      { fromX: 0, fromY: 0, toX: 1, toY: 1, jumpT: 100, jumpDuration: 100 },
      identity
    );
    expect(pos.sx).toBe(10);
    expect(pos.sy).toBe(10);
    expect(pos.facingRight).toBe(true);
  });

  it("왼쪽으로 점프 중일 때 facingRight false", () => {
    const pos = getCharacterScreenPosition(
      { fromX: 2, fromY: 0, toX: 1, toY: 1, jumpT: 50, jumpDuration: 100 },
      identity
    );
    expect(pos.facingRight).toBe(false);
  });
});
