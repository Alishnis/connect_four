export const ROWS = 6;
export const COLS = 7;
export const WIN_LENGTH = 4;
export const EMPTY = 0;
export const RED = 1;
export const YELLOW = 2;

export type Player = 1 | 2;
export type Cell = 0 | 1 | 2;
export type Board = Cell[][];

export interface WinResult {
  winner: Player;
  cells: [number, number][];
}

export type TimeControlMode = "classic" | "blitz" | "sprint";

export interface TimeControl {
  mode: TimeControlMode;
  totalTime?: number;  // ms for blitz (60000 = 1 min)
  moveTime?: number;   // ms for sprint (10000 = 10 sec)
}

export const DEFAULT_TIME_CONTROL: TimeControl = { mode: "classic" };
export const BLITZ_TIME_CONTROL: TimeControl = { mode: "blitz", totalTime: 60000 };
export const SPRINT_TIME_CONTROL: TimeControl = { mode: "sprint", moveTime: 10000 };

export interface GameState {
  board: Board;
  currentPlayer: Player;
  status: "idle" | "playing" | "ai_thinking" | "game_over";
  winner: Player | null;
  winCells: [number, number][] | null;
  isDraw: boolean;
  moveCount: number;
  hintColumn: number | null;
  timeControl?: TimeControl;
  timeLeft?: [number, number];
  moveTimeLeft?: number | null;
  timeoutLoser?: Player | null;
}
