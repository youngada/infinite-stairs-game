/**
 * 게임 전역 상수 (픽셀 퍼펙트 레트로 해상도)
 */

// 캔버스 논리 해상도
export const LOGICAL_WIDTH = 320;
export const LOGICAL_HEIGHT = 480;

// 계단 배치 간격 (사이사이 공백 넓게)
export const STAIR_WIDTH = 88;
export const STAIR_HEIGHT = 52;
// 2D 플랫폼 그리기: 배치 간격보다 작게 해 계단 사이 공백 확보
export const PLATFORM_W = 48;
export const PLATFORM_H = 20;

// 지그재그: 한 방향 연속 1~8칸 (최대 8, 그 아래로 불규칙하게 난이도 상승)
export const STAIR_MIN_CONSECUTIVE = 1;
export const STAIR_MAX_CONSECUTIVE = 8;

// 캐릭터 픽셀 크기 (이미지 스프라이트 표시 크기)
export const CAT_SIZE = 28;
export const CAT_SPRITE_W = 48;
export const CAT_SPRITE_H = 48;

// 이동 타이머: 빨리 이동하지 않으면 게임오버. 레벨(층) 올라갈수록 시간 단축
export const TIMER_BASE_SEC = 8;
export const TIMER_DECREASE_PER_FLOOR = 0.35;
export const TIMER_MIN_SEC = 2.5;

// 포물선 점프 (세계 Y 오프셋)
export const JUMP_DURATION_MS = 280;
export const JUMP_HEIGHT_WORLD = 20;

// 초기 생성 계단 개수
export const INITIAL_STAIRS_COUNT = 40;

// 세계 좌표 x 범위 (지그재그가 벗어나지 않도록)
export const STAIR_X_MIN = -600;
export const STAIR_X_MAX = 600;

// localStorage 키
export const HIGH_SCORE_KEY = "infiniteStairsHighScore";

// 상단 UI
export const UI_TOP_HEIGHT = 44;
export const UI_FONT = '8px "Press Start 2P", monospace';
