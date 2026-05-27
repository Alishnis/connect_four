"use client";
import { useCallback, useEffect, useState } from "react";
import { useGame } from "@/hooks/useGame";
import Board from "@/components/game/Board";
import ScoreBar from "@/components/game/ScoreBar";
import GameOverModal from "@/components/game/GameOverModal";
import DifficultyPicker from "@/components/game/DifficultyPicker";
import PerspectiveGrid from "@/components/vaporwave/PerspectiveGrid";
import GlowCard from "@/components/vaporwave/GlowCard";
import SkewButton from "@/components/vaporwave/SkewButton";
import { useRouter } from "next/navigation";

type Difficulty = "easy" | "medium" | "hard";

export default function AIGamePage() {
  const { state, lastMove, makeMove, setAIThinking, setHint, reset, forceMove } = useGame();
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [showHint, setShowHint] = useState(false);
  const router = useRouter();

  // AI makes its move after human plays (AI is always player 2)
  useEffect(() => {
    if (state.currentPlayer !== 2 || state.status !== "playing") return;

    setAIThinking(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch("/api/ai-move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ board: state.board, difficulty, aiPlayer: 2 }),
        });
        const { column } = await res.json();
        forceMove(column, 2);
      } finally {
        setAIThinking(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [state.currentPlayer, state.status]);

  const handleHint = useCallback(async () => {
    if (showHint) {
      setShowHint(false);
      setHint(null);
      return;
    }
    setShowHint(true);
    const res = await fetch("/api/ai-move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ board: state.board, difficulty: "hard", aiPlayer: 1 }),
    });
    const { column } = await res.json();
    setHint(column);
  }, [showHint, state.board, setHint]);

  const handleReset = () => {
    reset();
    setShowHint(false);
    setHint(null);
  };

  return (
    <div className="min-h-screen relative pt-20">
      <PerspectiveGrid />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-8 px-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-heading font-black text-2xl" style={{ color: "#FF00FF", fontFamily: "Orbitron, sans-serif" }}>
              VS AI
            </h1>
            <div className="w-64">
              <DifficultyPicker value={difficulty} onChange={(d) => { setDifficulty(d); handleReset(); }} />
            </div>
          </div>

          <GlowCard accentColor="cyan" className="!p-4">
            <ScoreBar
              currentPlayer={state.currentPlayer}
              playerNames={["YOU", `AI [${difficulty.toUpperCase()}]`]}
              moveCount={state.moveCount}
              status={state.status}
            />

            {/* AI thinking indicator */}
            {state.status === "ai_thinking" && (
              <div className="text-center mb-2 font-mono text-xs text-[#FF9900] uppercase tracking-widest animate-pulse">
                ⚡ Calculating optimal move...
              </div>
            )}

            <Board
              board={state.board}
              onColumnClick={(col) => {
                if (state.currentPlayer === 1 && state.status === "playing") {
                  makeMove(col);
                  setHint(null);
                  setShowHint(false);
                }
              }}
              winCells={state.winCells}
              currentPlayer={state.currentPlayer}
              disabled={state.currentPlayer !== 1 || state.status !== "playing"}
              hintColumn={state.hintColumn}
              lastMove={lastMove}
            />

            {/* Controls */}
            <div className="flex gap-3 mt-4 justify-center">
              <SkewButton variant="secondary" onClick={handleHint} className="!px-4 !py-2 !text-xs">
                {showHint ? "Hide Hint" : "Hint (2 left)"}
              </SkewButton>
              <SkewButton variant="outline" onClick={handleReset} className="!px-4 !py-2 !text-xs">
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
          onRematch={handleReset}
          onHome={() => router.push("/play")}
          onAnalysis={() => router.push("/analysis/demo")}
          playerNames={["YOU", "AI"]}
        />
      )}
    </div>
  );
}
