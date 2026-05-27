import { Board, Player, ROWS, COLS, WIN_LENGTH, EMPTY } from "./constants";
import { dropDisc, checkWin, checkDraw, getValidColumns, boardToHash } from "./engine";

const MOVE_ORDER = [3, 2, 4, 1, 5, 0, 6];
const transpositionTable = new Map<string, { score: number; depth: number }>();

function scoreWindow(window: number[], player: Player): number {
  const opp = player === 1 ? 2 : 1;
  const myCount = window.filter(c => c === player).length;
  const oppCount = window.filter(c => c === opp).length;
  const emptyCount = window.filter(c => c === EMPTY).length;

  if (myCount === 4) return 100;
  if (oppCount === 4) return -100;
  if (myCount === 3 && emptyCount === 1) return 5;
  if (oppCount === 3 && emptyCount === 1) return -4;
  if (myCount === 2 && emptyCount === 2) return 2;
  return 0;
}

function scoreBoard(board: Board, player: Player): number {
  let score = 0;
  // Center column bonus
  const centerCol = board.map(r => r[3]);
  score += centerCol.filter(c => c === player).length * 3;

  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - WIN_LENGTH; c++) {
      score += scoreWindow(board[r].slice(c, c + WIN_LENGTH), player);
    }
  }
  // Vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - WIN_LENGTH; r++) {
      const window = Array.from({ length: WIN_LENGTH }, (_, i) => board[r + i][c]);
      score += scoreWindow(window, player);
    }
  }
  // Diagonal \
  for (let r = 0; r <= ROWS - WIN_LENGTH; r++) {
    for (let c = 0; c <= COLS - WIN_LENGTH; c++) {
      const window = Array.from({ length: WIN_LENGTH }, (_, i) => board[r + i][c + i]);
      score += scoreWindow(window, player);
    }
  }
  // Diagonal /
  for (let r = WIN_LENGTH - 1; r < ROWS; r++) {
    for (let c = 0; c <= COLS - WIN_LENGTH; c++) {
      const window = Array.from({ length: WIN_LENGTH }, (_, i) => board[r - i][c + i]);
      score += scoreWindow(window, player);
    }
  }
  return score;
}

function isTerminal(board: Board): boolean {
  if (checkDraw(board)) return true;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== EMPTY) {
        // Check from this cell if it's part of a win
        for (const [dr, dc] of [[0,1],[1,0],[1,1],[1,-1]] as [number,number][]) {
          const cells = [[r, c]];
          for (let i = 1; i < WIN_LENGTH; i++) {
            const nr = r + dr * i, nc = c + dc * i;
            if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || board[nr][nc] !== board[r][c]) break;
            cells.push([nr, nc]);
          }
          if (cells.length >= WIN_LENGTH) return true;
        }
      }
    }
  }
  return false;
}

function minimax(board: Board, depth: number, alpha: number, beta: number, maximizing: boolean, aiPlayer: Player): number {
  const hash = boardToHash(board) + (maximizing ? "M" : "m") + depth;
  const cached = transpositionTable.get(hash);
  if (cached && cached.depth >= depth) return cached.score;

  const validCols = getValidColumns(board);

  if (depth === 0 || validCols.length === 0 || isTerminal(board)) {
    if (isTerminal(board)) {
      if (checkDraw(board)) return 0;
      return maximizing ? -10000 - depth : 10000 + depth;
    }
    const score = scoreBoard(board, aiPlayer);
    transpositionTable.set(hash, { score, depth });
    return score;
  }

  const humanPlayer = aiPlayer === 1 ? 2 : 1;
  let best = maximizing ? -Infinity : Infinity;

  for (const col of MOVE_ORDER.filter(c => validCols.includes(c))) {
    const result = dropDisc(board, col, maximizing ? aiPlayer : humanPlayer);
    if (!result) continue;

    const score = minimax(result.board, depth - 1, alpha, beta, !maximizing, aiPlayer);
    if (maximizing) {
      best = Math.max(best, score);
      alpha = Math.max(alpha, score);
    } else {
      best = Math.min(best, score);
      beta = Math.min(beta, score);
    }
    if (beta <= alpha) break;
  }

  transpositionTable.set(hash, { score: best, depth });
  return best;
}

export interface AIResult {
  column: number;
  evalScore: number;
}

export function getBestMove(board: Board, difficulty: "easy" | "medium" | "hard", aiPlayer: Player = 2): AIResult {
  transpositionTable.clear();
  const validCols = getValidColumns(board);
  if (validCols.length === 0) return { column: 0, evalScore: 0 };

  // Easy: random move 50% of the time
  if (difficulty === "easy" && Math.random() < 0.5) {
    return { column: validCols[Math.floor(Math.random() * validCols.length)], evalScore: 0 };
  }

  const maxDepth = difficulty === "easy" ? 2 : difficulty === "medium" ? 5 : 8;
  let bestCol = MOVE_ORDER.find(c => validCols.includes(c)) ?? validCols[0];
  let bestScore = -Infinity;

  for (const col of MOVE_ORDER.filter(c => validCols.includes(c))) {
    const result = dropDisc(board, col, aiPlayer);
    if (!result) continue;
    const score = minimax(result.board, maxDepth - 1, -Infinity, Infinity, false, aiPlayer);
    if (score > bestScore) {
      bestScore = score;
      bestCol = col;
    }
  }

  return { column: bestCol, evalScore: bestScore };
}
