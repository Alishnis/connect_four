"use client";
import { useState, useCallback } from "react";
import { createBoard, dropDisc, checkWin, checkDraw } from "@/lib/game/engine";
import { GameState, Player } from "@/lib/game/constants";

const initialState = (): GameState => ({
  board: createBoard(),
  currentPlayer: 1,
  status: "playing",
  winner: null,
  winCells: null,
  isDraw: false,
  moveCount: 0,
  hintColumn: null,
});

export function useGame() {
  const [state, setState] = useState<GameState>(initialState);
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null);

  const makeMove = useCallback((col: number): boolean => {
    setState(prev => {
      if (prev.status !== "playing") return prev;
      const result = dropDisc(prev.board, col, prev.currentPlayer);
      if (!result) return prev;

      const { board, row } = result;
      setLastMove({ row, col });

      const winResult = checkWin(board, row, col);
      if (winResult) {
        return { ...prev, board, status: "game_over", winner: winResult.winner, winCells: winResult.cells, moveCount: prev.moveCount + 1 };
      }
      if (checkDraw(board)) {
        return { ...prev, board, status: "game_over", isDraw: true, moveCount: prev.moveCount + 1 };
      }
      return { ...prev, board, currentPlayer: prev.currentPlayer === 1 ? 2 : 1, moveCount: prev.moveCount + 1 };
    });
    return true;
  }, []);

  const setAIThinking = useCallback((thinking: boolean) => {
    setState(prev => ({ ...prev, status: thinking ? "ai_thinking" : "playing" }));
  }, []);

  const setHint = useCallback((col: number | null) => {
    setState(prev => ({ ...prev, hintColumn: col }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState());
    setLastMove(null);
  }, []);

  const forceMove = useCallback((col: number, player: Player) => {
    setState(prev => {
      const result = dropDisc(prev.board, col, player);
      if (!result) return prev;
      const { board, row } = result;
      setLastMove({ row, col });
      const winResult = checkWin(board, row, col);
      if (winResult) {
        return { ...prev, board, status: "game_over", winner: winResult.winner, winCells: winResult.cells, moveCount: prev.moveCount + 1 };
      }
      if (checkDraw(board)) {
        return { ...prev, board, status: "game_over", isDraw: true, moveCount: prev.moveCount + 1 };
      }
      return { ...prev, board, currentPlayer: player === 1 ? 2 : 1, moveCount: prev.moveCount + 1 };
    });
  }, []);

  return { state, lastMove, makeMove, setAIThinking, setHint, reset, forceMove };
}
