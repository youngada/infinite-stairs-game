/**
 * 최고 점수 localStorage 단위 테스트 (목 업)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getHighScore, saveHighScore } from "../js/storage.js";

const KEY = "infiniteStairsHighScore";

describe("storage", () => {
  let storage = {};
  beforeEach(() => {
    storage = {};
    vi.stubGlobal("localStorage", {
      getItem: (k) => storage[k] ?? null,
      setItem: (k, v) => { storage[k] = String(v); },
    });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("getHighScore는 저장된 값이 없으면 0", () => {
    expect(getHighScore()).toBe(0);
  });

  it("getHighScore는 저장된 숫자 반환", () => {
    storage[KEY] = "42";
    expect(getHighScore()).toBe(42);
  });

  it("saveHighScore는 더 큰 값으로 갱신하고 반환", () => {
    expect(saveHighScore(10)).toBe(10);
    expect(getHighScore()).toBe(10);
    expect(saveHighScore(5)).toBe(10);
    expect(saveHighScore(20)).toBe(20);
  });
});
