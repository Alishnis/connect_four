import { ROWS, COLS, WIN_LENGTH, EMPTY, Board, Cell, Player, WinResult } from "./constants";

export function createBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY) as Cell[]);
}

export function dropDisc(board: Board, col: number, player: Player): { board: Board; row: number } | null {
  if (col < 0 || col >= COLS) return null;
  for (let row = ROWS - 1; row >= 0; row--) {
    if (board[row][col] === EMPTY) {
      const newBoard = board.map(r => [...r]) as Board;
      newBoard[row][col] = player;
      return { board: newBoard, row };
    }
  }
  return null; // column full
}

export function checkWin(board: Board, lastRow: number, lastCol: number): WinResult | null {
  const player = board[lastRow][lastCol] as Player;
  if (!player) return null;

  const directions: [number, number][] = [[0,1],[1,0],[1,1],[1,-1]];

  for (const [dr, dc] of directions) {
    const cells: [number, number][] = [[lastRow, lastCol]];

    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = lastRow + dr * i, c = lastCol + dc * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) break;
      cells.push([r, c]);
    }
    for (let i = 1; i < WIN_LENGTH; i++) {
      const r = lastRow - dr * i, c = lastCol - dc * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) break;
      cells.push([r, c]);
    }

    if (cells.length >= WIN_LENGTH) {
      return { winner: player, cells: cells.slice(0, WIN_LENGTH) };
    }
  }
  return null;
}

export function checkDraw(board: Board): boolean {
  return board[0].every(cell => cell !== EMPTY);
}

export function getValidColumns(board: Board): number[] {
  return Array.from({ length: COLS }, (_, i) => i).filter(c => board[0][c] === EMPTY);
}

export function boardToHash(board: Board): string {
  return board.flat().join("");
}
