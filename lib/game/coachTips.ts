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
    return { text: "Финальный ход — четыре в ряд! Победа!", category: "win" };
  }

  // 2. Lost (last move of loser)
  if (isLastMove && winningSide !== null && winningSide !== player) {
    return { text: "Последний ход не спас ситуацию.", category: "blunder" };
  }

  // 3. Missed immediate win
  if (isMissedWin) {
    return {
      text: `Колонка ${bestCol + 1} давала немедленную победу! Ты этого не заметил.`,
      category: "blunder",
    };
  }

  // Play the move to get the board after
  const result = dropDisc(board, column, player);
  if (!result) {
    return { text: "Солидный ход. Позиция стабильна.", category: "neutral" };
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
          text: `Соперник мог выиграть в колонке ${opponentWinCol + 1}. Нужно было блокировать!`,
          category: "threat",
        };
      }
    }
  }

  // 5. Created a fork (2+ winning threats)
  const threatsAfter = countThreats(boardAfter, player);
  if (threatsAfter >= 2) {
    return {
      text: "Отличный ход! Создана вилка — у соперника нет защиты.",
      category: "fork",
    };
  }

  // 6. Blocked opponent's fork
  const threatsBefore = countThreats(board, opponent);
  if (threatsBefore >= 1) {
    const threatsAfterForOpponent = countThreats(boardAfter, opponent);
    if (threatsAfterForOpponent < threatsBefore) {
      return {
        text: "Хорошая защита — заблокирована угроза соперника.",
        category: "block",
      };
    }
  }

  // 7. Center column play in early game
  if (column === 3 && pieces < 10) {
    return {
      text: "Центр — ключевая позиция. Контроль центра даёт преимущество.",
      category: "center",
    };
  }

  // 8. Setup move (3 in a row with open end)
  if (hasThreeInRow(boardAfter, result.row, column, player)) {
    return {
      text: "Строишь линию — три в ряд с открытым концом.",
      category: "setup",
    };
  }

  // 9. Edge column in early game
  if ((column === 0 || column === 6) && pieces < 10) {
    return {
      text: "Крайняя колонка в начале — слабый ход. Центр сильнее.",
      category: "blunder",
    };
  }

  // 10/11. Generic
  if (isBlunder) {
    return {
      text: `Потеря позиционного преимущества на ${evalDrop} очков.`,
      category: "blunder",
    };
  }

  return { text: "Солидный ход. Позиция стабильна.", category: "neutral" };
}
