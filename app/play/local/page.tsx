"use client";
import { useGame } from "@/hooks/useGame";
import Board from "@/components/game/Board";
import ScoreBar from "@/components/game/ScoreBar";
import GameOverModal from "@/components/game/GameOverModal";
import PerspectiveGrid from "@/components/vaporwave/PerspectiveGrid";
import GlowCard from "@/components/vaporwave/GlowCard";
import SkewButton from "@/components/vaporwave/SkewButton";
import { useRouter } from "next/navigation";

export default function LocalGamePage() {
  const { state, lastMove, makeMove, reset } = useGame();
  const router = useRouter();

  return (
    <div className="min-h-screen relative pt-20">
      <PerspectiveGrid />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-8 px-4">
        <div className="w-full max-w-2xl">
          <h1 className="font-heading font-black text-2xl text-center mb-6" style={{ color: "#FF00FF", fontFamily: "Orbitron, sans-serif" }}>
            LOCAL 2P
          </h1>
          <GlowCard accentColor="cyan" className="!p-4">
            <ScoreBar
              currentPlayer={state.currentPlayer}
              playerNames={["PLAYER 1", "PLAYER 2"]}
              moveCount={state.moveCount}
              status={state.status}
            />
            <Board
              board={state.board}
              onColumnClick={makeMove}
              winCells={state.winCells}
              currentPlayer={state.currentPlayer}
              disabled={state.status !== "playing"}
              lastMove={lastMove}
            />
            <div className="flex gap-3 mt-4 justify-center">
              <SkewButton variant="outline" onClick={reset} className="!px-4 !py-2 !text-xs">New Game</SkewButton>
            </div>
          </GlowCard>
        </div>
      </div>
      {state.status === "game_over" && (
        <GameOverModal
          winner={state.winner}
          isDraw={state.isDraw}
          onRematch={reset}
          onHome={() => router.push("/play")}
        />
      )}
    </div>
  );
}
