"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { createGameChannel, type GameEvent } from "@/lib/realtime/gameChannel";
import { createBoard, dropDisc, checkWin, checkDraw } from "@/lib/game/engine";
import type { Board, Player } from "@/lib/game/constants";

export type MultiplayerStatus = "waiting" | "playing" | "reconnecting" | "game_over";

interface MultiplayerState {
  board: Board;
  currentPlayer: Player;
  myPlayer: Player | null;
  status: MultiplayerStatus;
  winner: Player | null;
  winCells: [number, number][] | null;
  isDraw: boolean;
  moveCount: number;
  opponentId: string | null;
  lastMove: { row: number; col: number } | null;
}

export function useMultiplayer(roomId: string, matchId: string) {
  const [state, setState] = useState<MultiplayerState>({
    board: createBoard(),
    currentPlayer: 1,
    myPlayer: null,
    status: "waiting",
    winner: null,
    winCells: null,
    isDraw: false,
    moveCount: 0,
    opponentId: null,
    lastMove: null,
  });

  const channelRef = useRef<ReturnType<typeof createGameChannel> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const supabase = createClient();
    const storageKey = `room_role_${roomId}`;

    async function init() {
      // Determine player role
      let myPlayer: Player = 1;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        myPlayer = parseInt(stored) as Player;
      } else {
        // Check if room already has red player
        const res = await fetch(`/api/rooms?roomId=${roomId}`);
        const data = await res.json();
        const { data: { user } } = await supabase.auth.getUser();
        if (data.player_red_id && data.player_red_id !== user?.id) {
          myPlayer = 2; // join as yellow
          localStorage.setItem(storageKey, "2");
          // Update match to add player_yellow
          if (user?.id) {
            await supabase.from("matches").update({ player_yellow_id: user.id }).eq("room_id", roomId);
          }
        } else {
          myPlayer = 1;
          localStorage.setItem(storageKey, "1");
        }
      }

      setState(prev => ({ ...prev, myPlayer }));

      // Set up Realtime channel
      const ch = createGameChannel(roomId);
      channelRef.current = ch;

      ch.subscribe((event: GameEvent) => {
        if (event.type === "move") {
          // Skip own moves — already applied locally in makeMove()
          if (event.player === myPlayer) return;
          setState(prev => {
            if (prev.status !== "playing") return prev;
            const result = dropDisc(prev.board, event.column, event.player);
            if (!result) return prev;
            const winResult = checkWin(result.board, result.row, event.column);
            if (winResult) {
              return { ...prev, board: result.board, status: "game_over", winner: winResult.winner, winCells: winResult.cells, moveCount: prev.moveCount + 1, lastMove: { row: result.row, col: event.column } };
            }
            if (checkDraw(result.board)) {
              return { ...prev, board: result.board, status: "game_over", isDraw: true, moveCount: prev.moveCount + 1, lastMove: { row: result.row, col: event.column } };
            }
            return { ...prev, board: result.board, currentPlayer: event.player === 1 ? 2 : 1, moveCount: prev.moveCount + 1, lastMove: { row: result.row, col: event.column } };
          });
        } else if (event.type === "player_joined") {
          setState(prev => ({ ...prev, status: "playing", opponentId: event.playerId }));
        } else if (event.type === "resign") {
          const winner: Player = event.player === 1 ? 2 : 1;
          setState(prev => ({ ...prev, status: "game_over", winner }));
        } else if (event.type === "rematch") {
          setState(prev => ({ ...prev, board: createBoard(), currentPlayer: 1, status: "playing", winner: null, winCells: null, isDraw: false, moveCount: 0, lastMove: null }));
        } else if (event.type === "timeout") {
          const winner: Player = event.loser === 1 ? 2 : 1;
          setState(prev => ({ ...prev, status: "game_over", winner }));
        }
      });

      ch.channel.subscribe(async (channelStatus) => {
        if (channelStatus === "SUBSCRIBED") {
          // Announce join
          ch.send({ type: "player_joined", playerId: (await supabase.auth.getUser()).data.user?.id ?? null });
          // If we're player 2, start the game
          if (myPlayer === 2) {
            setState(prev => ({ ...prev, status: "playing" }));
          }
        } else if (channelStatus === "CHANNEL_ERROR" || channelStatus === "TIMED_OUT") {
          setState(prev => ({ ...prev, status: "reconnecting" }));
        }
      });
    }

    init();

    return () => {
      channelRef.current?.unsubscribe();
      localStorage.removeItem(storageKey);
    };
  }, [roomId]);

  const makeMove = useCallback((col: number) => {
    const { currentPlayer, myPlayer, status, board } = stateRef.current;
    if (status !== "playing" || currentPlayer !== myPlayer) return;

    const result = dropDisc(board, col, currentPlayer);
    if (!result) return;

    // Apply locally
    setState(prev => {
      const winResult = checkWin(result.board, result.row, col);
      if (winResult) {
        return { ...prev, board: result.board, status: "game_over", winner: winResult.winner, winCells: winResult.cells, moveCount: prev.moveCount + 1, lastMove: { row: result.row, col } };
      }
      if (checkDraw(result.board)) {
        return { ...prev, board: result.board, status: "game_over", isDraw: true, moveCount: prev.moveCount + 1, lastMove: { row: result.row, col } };
      }
      return { ...prev, board: result.board, currentPlayer: currentPlayer === 1 ? 2 : 1, moveCount: prev.moveCount + 1, lastMove: { row: result.row, col } };
    });

    // Broadcast to opponent
    channelRef.current?.send({
      type: "move",
      column: col,
      player: currentPlayer,
      moveNumber: stateRef.current.moveCount + 1,
    });
  }, []);

  const resign = useCallback(() => {
    const { myPlayer } = stateRef.current;
    if (!myPlayer) return;
    channelRef.current?.send({ type: "resign", player: myPlayer });
    const winner: Player = myPlayer === 1 ? 2 : 1;
    setState(prev => ({ ...prev, status: "game_over", winner }));
  }, []);

  const rematch = useCallback(() => {
    channelRef.current?.send({ type: "rematch" });
    setState(prev => ({ ...prev, board: createBoard(), currentPlayer: 1, status: "playing", winner: null, winCells: null, isDraw: false, moveCount: 0, lastMove: null }));
  }, []);

  const sendEvent = useCallback((event: GameEvent) => {
    channelRef.current?.send(event);
  }, []);

  return { state, makeMove, resign, rematch, sendEvent };
}
