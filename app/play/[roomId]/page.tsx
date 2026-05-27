"use client";
import { use } from "react";
import { useRouter } from "next/navigation";
import { useMultiplayer } from "@/hooks/useMultiplayer";
import Board from "@/components/game/Board";
import ScoreBar from "@/components/game/ScoreBar";
import GameOverModal from "@/components/game/GameOverModal";
import RoomLobby from "@/components/multiplayer/RoomLobby";
import ConnectionBadge from "@/components/multiplayer/ConnectionBadge";
import PerspectiveGrid from "@/components/vaporwave/PerspectiveGrid";
import GlowCard from "@/components/vaporwave/GlowCard";
import SkewButton from "@/components/vaporwave/SkewButton";

interface Props {
  params: Promise<{ roomId: string }>;
}

export default function MultiplayerRoomPage({ params }: Props) {
  const { roomId } = use(params);
  const { state, makeMove, resign, rematch } = useMultiplayer(roomId, roomId);
  const router = useRouter();

  const isMyTurn = state.currentPlayer === state.myPlayer && state.status === "playing";

  if (state.status === "waiting") {
    return (
      <div className="min-h-screen relative pt-20">
        <PerspectiveGrid />
        <div className="relative z-10">
          <RoomLobby roomId={roomId} status={state.status} myPlayer={state.myPlayer} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pt-20">
      <PerspectiveGrid />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-8 px-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h1
              className="font-heading font-black text-2xl"
              style={{ color: "#FF00FF", fontFamily: "Orbitron, sans-serif" }}
            >
              ROOM {roomId}
            </h1>
            <ConnectionBadge status={state.status} />
          </div>

          <GlowCard accentColor="cyan" className="!p-4">
            <ScoreBar
              currentPlayer={state.currentPlayer}
              playerNames={["PLAYER 1", "PLAYER 2"]}
              moveCount={state.moveCount}
              status={state.status}
            />

            {!isMyTurn && state.status === "playing" && (
              <div className="text-center mb-2 font-mono text-xs text-[#E0E0E0]/50 uppercase tracking-widest animate-pulse">
                Opponent&apos;s turn...
              </div>
            )}
            {isMyTurn && (
              <div
                className="text-center mb-2 font-mono text-xs uppercase tracking-widest"
                style={{ color: state.myPlayer === 1 ? "#FF2D78" : "#00CCFF" }}
              >
                Your turn
              </div>
            )}

            <Board
              board={state.board}
              onColumnClick={makeMove}
              winCells={state.winCells}
              currentPlayer={state.currentPlayer}
              disabled={!isMyTurn}
              lastMove={state.lastMove}
            />

            <div className="flex gap-3 mt-4 justify-center">
              <SkewButton variant="outline" onClick={resign} className="!px-4 !py-2 !text-xs">
                Resign
              </SkewButton>
            </div>
          </GlowCard>
        </div>
      </div>

      {state.status === "game_over" && (
        <GameOverModal
          winner={state.winner}
          isDraw={state.isDraw}
          onRematch={rematch}
          onHome={() => router.push("/play")}
          playerNames={["PLAYER 1", "PLAYER 2"]}
        />
      )}
    </div>
  );
}
