"use client";
import { motion } from "framer-motion";
import { Player } from "@/lib/game/constants";
import type { TimeControl } from "@/lib/game/constants";
import { useSkin } from "@/lib/skins/SkinContext";
import TimerDisplay from "./TimerDisplay";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Props {
  currentPlayer: Player;
  playerNames?: [string, string];
  moveCount: number;
  status: string;
  timeControl?: TimeControl;
  timeLeft?: [number, number];
  moveTimeLeft?: number | null;
}

export default function ScoreBar({ currentPlayer, playerNames = ["PLAYER 1", "PLAYER 2"], moveCount, status, timeControl, timeLeft, moveTimeLeft }: Props) {
  const skin = useSkin();
  const { t } = useLanguage();

  return (
    <div className="mb-4 px-1">
    <div className="flex items-center justify-between">
      {/* Player 1 */}
      <div className={`flex items-center gap-2 ${currentPlayer === 1 && status === "playing" ? "opacity-100" : "opacity-40"}`}>
        <motion.div
          className="rounded-full"
          style={{ width: 20, height: 20, background: skin.player1.background, boxShadow: skin.player1.boxShadow }}
          animate={currentPlayer === 1 && status === "playing" ? { scale: [1, 1.3, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        />
        <span className="font-mono text-xs uppercase tracking-wider" style={{ color: skin.player1.background }}>
          {playerNames[0]}
        </span>
      </div>

      {/* Move counter */}
      <div className="text-center">
        <div className="font-mono text-xs text-[#E0E0E0]/50 uppercase tracking-widest">{t("game.move")}</div>
        <div className="font-heading font-bold text-xl" style={{ color: "#FF9900", fontFamily: "Orbitron, sans-serif" }}>
          {moveCount.toString().padStart(2, "0")}
        </div>
      </div>

      {/* Player 2 */}
      <div className={`flex items-center gap-2 ${currentPlayer === 2 && status === "playing" ? "opacity-100" : "opacity-40"}`}>
        <span className="font-mono text-xs uppercase tracking-wider" style={{ color: skin.player2.background }}>
          {playerNames[1]}
        </span>
        <motion.div
          className="rounded-full"
          style={{ width: 20, height: 20, background: skin.player2.background, boxShadow: skin.player2.boxShadow }}
          animate={currentPlayer === 2 && status === "playing" ? { scale: [1, 1.3, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      </div>
    </div>

      {/* Timer display */}
      {timeControl && timeControl.mode !== "classic" && timeLeft && (
        <TimerDisplay
          timeLeft={timeLeft}
          moveTimeLeft={moveTimeLeft ?? null}
          currentPlayer={currentPlayer}
          timeControl={timeControl}
          status={status}
        />
      )}
    </div>
  );
}
