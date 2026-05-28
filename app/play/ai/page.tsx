"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGame } from "@/hooks/useGame";
import { useCoinReward } from "@/hooks/useCoinReward";
import { useAuth } from "@/hooks/useAuth";
import Board from "@/components/game/Board";
import ScoreBar from "@/components/game/ScoreBar";
import GameOverModal from "@/components/game/GameOverModal";
import DifficultyPicker, { type Difficulty } from "@/components/game/DifficultyPicker";
import TimeControlPicker from "@/components/game/TimeControlPicker";
import PerspectiveGrid from "@/components/vaporwave/PerspectiveGrid";
import GlowCard from "@/components/vaporwave/GlowCard";
import SkewButton from "@/components/vaporwave/SkewButton";
import { SkinProvider } from "@/lib/skins/SkinContext";
import { getLocalActiveSkin } from "@/lib/skins/localStore";
import { useTimer } from "@/hooks/useTimer";
import { DEFAULT_TIME_CONTROL, BLITZ_TIME_CONTROL, SPRINT_TIME_CONTROL } from "@/lib/game/constants";
import type { TimeControlMode, TimeControl } from "@/lib/game/constants";
import { useRouter } from "next/navigation";

function AIGameContent() {
  const { state, lastMove, makeMove, setAIThinking, setHint, reset, forceMove, timeoutLoss } = useGame();
  const { reward, awardCoins, resetReward } = useCoinReward();
  const { user } = useAuth();
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [timeControlMode, setTimeControlMode] = useState<TimeControlMode>("classic");
  const [showHint, setShowHint] = useState(false);
  const moveHistoryRef = useRef<number[]>([]);
  const router = useRouter();

  const timeControlMap: Record<TimeControlMode, TimeControl> = {
    classic: DEFAULT_TIME_CONTROL,
    blitz: BLITZ_TIME_CONTROL,
    sprint: SPRINT_TIME_CONTROL,
  };
  const timeControl = timeControlMap[timeControlMode];

  const { timeLeft, moveTimeLeft, resetTimer } = useTimer({
    timeControl,
    currentPlayer: state.currentPlayer,
    gameStatus: state.status,
    onTimeout: timeoutLoss,
  });

  // Save game result to sessionStorage when game ends
  useEffect(() => {
    if (state.status === "game_over" && moveHistoryRef.current.length > 0) {
      sessionStorage.setItem("lastGameMoves", JSON.stringify(moveHistoryRef.current));
      sessionStorage.setItem("lastGameWinner", String(state.winner ?? "null"));
      sessionStorage.setItem("lastGamePlayers", JSON.stringify(["ВЫ", `ИИ [${difficulty.toUpperCase()}]`]));
    }
  }, [state.status, state.winner]);

  // Award coins when game ends
  useEffect(() => {
    if (state.status === "game_over") {
      const won = state.winner === 1;
      awardCoins({ won, isMultiplayer: false, userId: user?.id });
    }
  }, [state.status]);

  // AI makes its move after human plays (AI is always player 2)
  useEffect(() => {
    if (state.currentPlayer !== 2 || state.status === "game_over") return;

    const board = state.board;
    const diff = difficulty;

    setAIThinking(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch("/api/ai-move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ board, difficulty: diff, aiPlayer: 2 }),
        });
        const { column } = await res.json();
        moveHistoryRef.current = [...moveHistoryRef.current, column];
        forceMove(column, 2);
      } finally {
        setAIThinking(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentPlayer]);

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
    resetReward();
    resetTimer();
    setShowHint(false);
    setHint(null);
    moveHistoryRef.current = [];
  };

  const handleAnalysis = () => {
    router.push("/analysis/gpt-game");
  };

  return (
    <div className="min-h-screen relative pt-20">
      <PerspectiveGrid />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-8 px-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-heading font-black text-2xl" style={{ color: "#FF00FF", fontFamily: "Orbitron, sans-serif" }}>
              ПРОТИВ ИИ
            </h1>
            <div className="w-64">
              <DifficultyPicker value={difficulty} onChange={(d) => { setDifficulty(d); handleReset(); }} />
            </div>
          </div>
          <div className="mb-4">
            <TimeControlPicker value={timeControlMode} onChange={(m) => { setTimeControlMode(m); handleReset(); }} />
          </div>

          <GlowCard accentColor="cyan" className="!p-2 sm:!p-4">
            <ScoreBar
              currentPlayer={state.currentPlayer}
              playerNames={["ВЫ", `ИИ [${difficulty.toUpperCase()}]`]}
              moveCount={state.moveCount}
              status={state.status}
              timeControl={timeControl}
              timeLeft={timeLeft}
              moveTimeLeft={moveTimeLeft}
            />

            {/* AI thinking indicator */}
            {state.status === "ai_thinking" && (
              <div className="text-center mb-2 font-mono text-xs uppercase tracking-widest animate-pulse"
                style={{ color: "#FF9900" }}>
                ⚡ Вычисляю лучший ход...
              </div>
            )}

            <Board
              board={state.board}
              onColumnClick={(col) => {
                if (state.currentPlayer === 1 && state.status === "playing") {
                  moveHistoryRef.current = [...moveHistoryRef.current, col];
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
                {showHint ? "Скрыть" : "Подсказка (2 ост.)"}
              </SkewButton>
              <SkewButton variant="outline" onClick={handleReset} className="!px-4 !py-2 !text-xs">
                Сдаться
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
          onAnalysis={handleAnalysis}
          playerNames={["ВЫ", "ИИ"]}
          coinReward={reward}
          timeoutLoser={state.timeoutLoser}
        />
      )}
    </div>
  );
}

export default function AIGamePage() {
  const { profile } = useAuth();
  const [skinId, setSkinId] = useState("classic");

  useEffect(() => {
    const id = profile?.skin_id ?? getLocalActiveSkin();
    setSkinId(id);
  }, [profile]);

  return (
    <SkinProvider skinId={skinId}>
      <AIGameContent />
    </SkinProvider>
  );
}
