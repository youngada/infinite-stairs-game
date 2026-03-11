/**
 * 최고 점수 localStorage 저장/로드
 */

import { HIGH_SCORE_KEY } from "./constants.js";

/**
 * 최고 점수 조회
 * @returns {number}
 */
export function getHighScore() {
  try {
    const v = localStorage.getItem(HIGH_SCORE_KEY);
    if (v == null) return 0;
    const n = parseInt(v, 10);
    return Number.isNaN(n) ? 0 : Math.max(0, n);
  } catch {
    return 0;
  }
}

/**
 * 최고 점수 저장 (현재 점수와 비교 후 더 크면 저장)
 * @param {number} score
 * @returns {number} 저장된 최고 점수
 */
export function saveHighScore(score) {
  const prev = getHighScore();
  const next = Math.max(prev, Math.floor(score));
  try {
    localStorage.setItem(HIGH_SCORE_KEY, String(next));
  } catch (_) {}
  return next;
}
