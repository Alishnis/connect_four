import { createBoard, dropDisc, checkWin, getValidColumns } from "./engine";
import { getBestMove } from "./ai";
import type { Board, Player } from "./constants";

export interface MoveAnalysis {
  moveNumber: number;
  player: Player;
  column: number;
  evalScore: number;
  bestCol: number;
  evalDrop: number;
  isBlunder: boolean;
  isMissedWin: boolean;
  board: Board; // board state BEFORE this move
}

export interface CoachReport {
  moves: MoveAnalysis[];
  blunders: MoveAnalysis[];
  missedWins: MoveAnalysis[];
  hasFork: boolean;
  forkMoveNumber: number | null;
  accuracyScore: number;
  verdict: string;
  winningSide: Player | null;
  totalMoves: number;
}

function evalBoard(board: Board, player: Player): number {
  const valid = getValidColumns(board);
  if (valid.length === 0) return 0;
  const result = getBestMove(board, "easy", player);
  return result.evalScore;
}

function hasForkAvailable(board: Board, player: Player): boolean {
  const valid = getValidColumns(board);
  let winningMoves = 0;
  for (const col of valid) {
    const result = dropDisc(board, col, player);
    if (!result) continue;
    const win = checkWin(result.board, result.row, col);
    if (win) winningMoves++;
    if (winningMoves >= 2) return true;
  }
  return false;
}

export function analyzeGame(moveSequence: number[]): CoachReport {
  let board = createBoard();
  const analyses: MoveAnalysis[] = [];
  let currentPlayer: Player = 1;
  let winningSide: Player | null = null;
  let forkMoveNumber: number | null = null;

  for (let i = 0; i < moveSequence.length; i++) {
    const col = moveSequence[i];
    const boardBefore = board.map(r => [...r]) as Board;

    // Get AI's recommended move and eval
    const ai = getBestMove(boardBefore, "medium", currentPlayer);
    const bestCol = ai.column;

    // Eval the actual move played
    const result = dropDisc(boardBefore, col, currentPlayer);
    if (!result) { currentPlayer = currentPlayer === 1 ? 2 : 1; continue; }

    // evalScore always from Player 1's perspective for consistent chart display
    // positive = P1 winning, negative = P2 winning
    const evalFromCurrentPlayer = evalBoard(result.board, currentPlayer);
    const evalAfterActual = currentPlayer === 1 ? evalFromCurrentPlayer : -evalFromCurrentPlayer;

    // evalDrop: how much worse than optimal (from current player's perspective, for blunder detection)
    const evalDrop = ai.evalScore - evalFromCurrentPlayer;
    const isBlunder = evalDrop > 50;

    // Check for missed immediate win
    let isMissedWin = false;
    if (col !== bestCol) {
      const bestResult = dropDisc(boardBefore, bestCol, currentPlayer);
      if (bestResult) {
        const win = checkWin(bestResult.board, bestResult.row, bestCol);
        if (win) isMissedWin = true;
      }
    }

    // Check if this position had a fork
    if (!forkMoveNumber && hasForkAvailable(boardBefore, currentPlayer)) {
      forkMoveNumber = i + 1;
    }

    // Check win
    const win = checkWin(result.board, result.row, col);
    if (win) winningSide = win.winner;

    analyses.push({
      moveNumber: i + 1,
      player: currentPlayer,
      column: col,
      evalScore: evalAfterActual,
      bestCol,
      evalDrop,
      isBlunder,
      isMissedWin,
      board: boardBefore,
    });

    board = result.board;
    currentPlayer = currentPlayer === 1 ? 2 : 1;
  }

  const blunders = analyses.filter(a => a.isBlunder);
  const missedWins = analyses.filter(a => a.isMissedWin);

  // Accuracy: percentage of moves that matched AI recommendation (or were close)
  const goodMoves = analyses.filter(a => a.evalDrop < 20).length;
  const accuracyScore = analyses.length > 0 ? Math.round((goodMoves / analyses.length) * 100) : 100;

  // Verdict
  let verdict = "";
  if (blunders.length === 0 && missedWins.length === 0) {
    verdict = `Flawless execution. ${moveSequence.length} moves, zero critical errors.`;
  } else if (blunders.length >= 3) {
    verdict = `Rough game — ${blunders.length} blunders. Study the highlighted moves to improve.`;
  } else if (missedWins.length > 0) {
    verdict = `You had ${missedWins.length} winning opportunit${missedWins.length > 1 ? "ies" : "y"} and didn't take ${missedWins.length > 1 ? "them" : "it"}.`;
  } else {
    verdict = `Solid game with ${blunders.length} blunder${blunders.length > 1 ? "s" : ""}. Almost perfect.`;
  }

  return {
    moves: analyses,
    blunders,
    missedWins,
    hasFork: forkMoveNumber !== null,
    forkMoveNumber,
    accuracyScore,
    verdict,
    winningSide,
    totalMoves: moveSequence.length,
  };
}
