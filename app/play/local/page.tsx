"use client";
import { useState, useCallback } from "react";
import { useGame } from "@/hooks/useGame";
import { useTimer } from "@/hooks/useTimer";
import Board from "@/components/game/Board";
import ScoreBar from "@/components/game/ScoreBar";
import GameOverModal from "@/components/game/GameOverModal";
import TimeControlPicker from "@/components/game/TimeControlPicker";
import PerspectiveGrid from "@/components/vaporwave/PerspectiveGrid";
import GlowCard from "@/components/vaporwave/GlowCard";
import SkewButton from "@/components/vaporwave/SkewButton";
import { DEFAULT_TIME_CONTROL, BLITZ_TIME_CONTROL, SPRINT_TIME_CONTROL } from "@/lib/game/constants";
import type { TimeControlMode, TimeControl } from "@/lib/game/constants";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LocalGamePage() {
  const { state, lastMove, makeMove, reset, timeoutLoss } = useGame();
  const [timeControlMode, setTimeControlMode] = useState<TimeControlMode>("classic");
  const router = useRouter();
  const { t } = useLanguage();

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

  const handleReset = useCallback(() => {
    reset();
    resetTimer();
  }, [reset, resetTimer]);

  return (
    <div className="min-h-screen relative pt-20">
      <PerspectiveGrid />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-8 px-4">
        <div className="w-full max-w-2xl">
          <h1 className="font-heading font-black text-2xl text-center mb-4" style={{ color: "#FF00FF", fontFamily: "Orbitron, sans-serif" }}>
            {t("game.local2p")}
          </h1>
          <div className="mb-4">
            <TimeControlPicker value={timeControlMode} onChange={(m) => { setTimeControlMode(m); handleReset(); }} />
          </div>
          <GlowCard accentColor="cyan" className="!p-4">
            <ScoreBar
              currentPlayer={state.currentPlayer}
              playerNames={[t("game.p1"), t("game.p2")]}
              moveCount={state.moveCount}
              status={state.status}
              timeControl={timeControl}
              timeLeft={timeLeft}
              moveTimeLeft={moveTimeLeft}
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
              <SkewButton variant="outline" onClick={handleReset} className="!px-4 !py-2 !text-xs">{t("game.newGame")}</SkewButton>
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
          timeoutLoser={state.timeoutLoser}
        />
      )}
    </div>
  );
}
