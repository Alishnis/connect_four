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

export interface GameState {
  board: Board;
  currentPlayer: Player;
  status: "idle" | "playing" | "ai_thinking" | "game_over";
  winner: Player | null;
  winCells: [number, number][] | null;
  isDraw: boolean;
  moveCount: number;
  hintColumn: number | null;
}
