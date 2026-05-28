import type { Board, Player } from "./constants";
import { ROWS, COLS, EMPTY } from "./constants";
import { dropDisc, checkWin, getValidColumns } from "./engine";

export interface MoveTip {
  text: string;
  category: "threat" | "fork" | "center" | "block" | "setup" | "win" | "blunder" | "neutral";
}

/** Count how many columns give `player` an immediate win */
function countThreats(board: Board, player: Player): number {
  const valid = getValidColumns(board);
  let threats = 0;
  for (const col of valid) {
    const result = dropDisc(board, col, player);
    if (!result) continue;
    if (checkWin(result.board, result.row, col)) threats++;
  }
  return threats;
}

/** Check if opponent has any winning column */
function opponentCanWinNext(board: Board, opponent: Player): number | null {
  const valid = getValidColumns(board);
  for (const col of valid) {
    const result = dropDisc(board, col, opponent);
    if (!result) continue;
    if (checkWin(result.board, result.row, col)) return col;
  }
  return null;
}

/** Check if placing at (row, col) creates 3 in a row with an open end */
function hasThreeInRow(board: Board, row: number, col: number, player: Player): boolean {
  const directions: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]];

  for (const [dr, dc] of directions) {
    let count = 1;
    // forward
    for (let i = 1; i < 4; i++) {
      const r = row + dr * i, c = col + dc * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) break;
      count++;
    }
    // backward
    for (let i = 1; i < 4; i++) {
      const r = row - dr * i, c = col - dc * i;
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || board[r][c] !== player) break;
      count++;
    }
    if (count >= 3) {
      // Check if there's an open end
      const fwdR = row + dr * count, fwdC = col + dc * count;
      const bwdR = row - dr, bwdC = col - dc;
      const fwdOpen = fwdR >= 0 && fwdR < ROWS && fwdC >= 0 && fwdC < COLS && board[fwdR][fwdC] === EMPTY;
      const bwdOpen = bwdR >= 0 && bwdR < ROWS && bwdC >= 0 && bwdC < COLS && board[bwdR][bwdC] === EMPTY;
      if (fwdOpen || bwdOpen) return true;
    }
  }
  return false;
}

/** Count total pieces on the board */
function countPieces(board: Board): number {
  let count = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== EMPTY) count++;
    }
  }
  return count;
}

// Helper: resolve a translation key with variables into a string
// Uses the same {var} interpolation as LanguageContext
function resolve(key: string, vars?: Record<string, string | number>): string {
  // We return a special format: key::json_vars so the UI can translate
  // Actually, since coach.ts calls this at analysis time (not render time),
  // and the tip is stored as a string, we need to return a translatable format.
  // We'll use the format: @@key@@vars_json@@ which CoachPanel can parse.
  if (vars) {
    return `@@${key}@@${JSON.stringify(vars)}@@`;
  }
  return `@@${key}@@@@`;
}

export function generateMoveTip(params: {
  board: Board;
  column: number;
  bestCol: number;
  player: Player;
  evalDrop: number;
  isBlunder: boolean;
  isMissedWin: boolean;
  isLastMove: boolean;
  wonGame: boolean;
  winningSide: Player | null;
}): MoveTip {
  const { board, column, bestCol, player, evalDrop, isBlunder, isMissedWin, isLastMove, wonGame, winningSide } = params;
  const opponent: Player = player === 1 ? 2 : 1;
  const pieces = countPieces(board);

  // 1. Won the game
  if (wonGame && winningSide === player) {
    return { text: resolve("tip.finalWin"), category: "win" };
  }

  // 2. Lost (last move of loser)
  if (isLastMove && winningSide !== null && winningSide !== player) {
    return { text: resolve("tip.lastLoss"), category: "blunder" };
  }

  // 3. Missed immediate win
  if (isMissedWin) {
    return {
      text: resolve("tip.missedWin", { col: bestCol + 1 }),
      category: "blunder",
    };
  }

  // Play the move to get the board after
  const result = dropDisc(board, column, player);
  if (!result) {
    return { text: resolve("tip.solid"), category: "neutral" };
  }
  const boardAfter = result.board;

  // 4. Didn't block opponent's threat
  const opponentWinCol = opponentCanWinNext(boardAfter, opponent);
  if (opponentWinCol !== null) {
    // Check if bestCol would have blocked
    const bestResult = dropDisc(board, bestCol, player);
    if (bestResult) {
      const afterBest = bestResult.board;
      const stillThreat = opponentCanWinNext(afterBest, opponent);
      if (stillThreat === null) {
        return {
          text: resolve("tip.unblocked", { col: opponentWinCol + 1 }),
          category: "threat",
        };
      }
    }
  }

  // 5. Created a fork (2+ winning threats)
  const threatsAfter = countThreats(boardAfter, player);
  if (threatsAfter >= 2) {
    return {
      text: resolve("tip.fork"),
      category: "fork",
    };
  }

  // 6. Blocked opponent's fork
  const threatsBefore = countThreats(board, opponent);
  if (threatsBefore >= 1) {
    const threatsAfterForOpponent = countThreats(boardAfter, opponent);
    if (threatsAfterForOpponent < threatsBefore) {
      return {
        text: resolve("tip.block"),
        category: "block",
      };
    }
  }

  // 7. Center column play in early game
  if (column === 3 && pieces < 10) {
    return {
      text: resolve("tip.center"),
      category: "center",
    };
  }

  // 8. Setup move (3 in a row with open end)
  if (hasThreeInRow(boardAfter, result.row, column, player)) {
    return {
      text: resolve("tip.setup"),
      category: "setup",
    };
  }

  // 9. Edge column in early game
  if ((column === 0 || column === 6) && pieces < 10) {
    return {
      text: resolve("tip.edge"),
      category: "blunder",
    };
  }

  // 10. Suboptimal move — analyze WHY the best column was better
  if (column !== bestCol && evalDrop >= 10) {
    const bestResult = dropDisc(board, bestCol, player);
    if (bestResult) {
      const bestBoard = bestResult.board;

      // Best move would have created a fork?
      const bestThreats = countThreats(bestBoard, player);
      if (bestThreats >= 2) {
        return {
          text: resolve("tip.bestFork", { col: bestCol + 1 }),
          category: "fork",
        };
      }

      // Best move would have set up 3 in a row?
      if (hasThreeInRow(bestBoard, bestResult.row, bestCol, player)) {
        return {
          text: resolve("tip.bestSetup", { col: bestCol + 1 }),
          category: "setup",
        };
      }

      // Best move was center and played was not?
      if (bestCol === 3 && column !== 3 && pieces < 14) {
        return {
          text: resolve("tip.bestCenter", { col: bestCol + 1 }),
          category: "center",
        };
      }

      // Best move blocked opponent threat that the actual move didn't?
      const opponentThreatAfterBest = opponentCanWinNext(bestBoard, opponent);
      const opponentThreatAfterActual = opponentCanWinNext(boardAfter, opponent);
      if (opponentThreatAfterActual !== null && opponentThreatAfterBest === null) {
        return {
          text: resolve("tip.bestBlock", { col: bestCol + 1 }),
          category: "threat",
        };
      }

      // Generic suboptimal with best column reference
      return {
        text: resolve("tip.bestGeneric", { col: bestCol + 1, score: evalDrop }),
        category: "blunder",
      };
    }
  }

  // 11. Generic blunder
  if (isBlunder) {
    return {
      text: resolve("tip.blunderGeneric", { score: evalDrop, col: bestCol + 1 }),
      category: "blunder",
    };
  }

  return { text: resolve("tip.solid"), category: "neutral" };
}
