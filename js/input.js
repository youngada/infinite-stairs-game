/**
 * 키보드 및 버튼 입력 처리
 */

/**
 * @typedef {'climb' | 'turn'} InputAction
 */

/**
 * 입력 리스너 등록
 * @param {object} opts
 * @param {function(InputAction): void} opts.onAction - climb | turn
 * @param {function(): void} [opts.onRestart]
 */
export function setupInput(opts) {
  const { onAction, onRestart } = opts;

  const btnClimb = document.getElementById("btn-climb");
  const btnTurn = document.getElementById("btn-turn");

  if (btnClimb) {
    btnClimb.addEventListener("click", () => onAction("climb"));
  }
  if (btnTurn) {
    btnTurn.addEventListener("click", () => onAction("turn"));
  }

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      onAction("climb");
    } else if (e.code === "KeyA") {
      e.preventDefault();
      onAction("turn");
    } else if (e.code === "KeyR" && onRestart) {
      e.preventDefault();
      onRestart();
    }
  });
}
