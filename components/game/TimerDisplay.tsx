"use client";
import { motion } from "framer-motion";
import type { Player, TimeControl } from "@/lib/game/constants";

interface Props {
  timeLeft: [number, number];
  moveTimeLeft: number | null;
  currentPlayer: Player;
  timeControl: TimeControl;
  status: string;
}

function formatBlitz(ms: number): string {
  if (!isFinite(ms)) return "--:--";
  const totalSecs = Math.max(0, Math.ceil(ms / 1000));
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

function formatSprint(ms: number): string {
  if (ms === null || ms === undefined) return "--.-";
  const secs = Math.max(0, ms / 1000);
  return secs.toFixed(1);
}

export default function TimerDisplay({ timeLeft, moveTimeLeft, currentPlayer, timeControl, status }: Props) {
  if (timeControl.mode === "classic") return null;

  if (timeControl.mode === "blitz") {
    return (
      <div className="flex items-center justify-between mt-2 px-1">
        <BlitzClock
          ms={timeLeft[0]}
          active={currentPlayer === 1 && status === "playing"}
          color="#FF2D78"
        />
        <div className="font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest">
          БЛИЦ ⚡
        </div>
        <BlitzClock
          ms={timeLeft[1]}
          active={currentPlayer === 2 && (status === "playing" || status === "ai_thinking")}
          color="#00CCFF"
        />
      </div>
    );
  }

  if (timeControl.mode === "sprint") {
    const ms = moveTimeLeft ?? 0;
    const isLow = ms < 5000;
    const isWarning = ms < 10000 && ms >= 5000;
    const color = isLow ? "#FF2D78" : isWarning ? "#FF9900" : "#00FFFF";

    return (
      <div className="flex flex-col items-center mt-2">
        <div className="font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest mb-1">
          СПРИНТ 🏃
        </div>
        <motion.div
          className="font-bold text-3xl"
          style={{
            color,
            fontFamily: "Orbitron, sans-serif",
            textShadow: isLow ? `0 0 20px ${color}, 0 0 40px ${color}` : `0 0 10px ${color}`,
          }}
          animate={
            isLow
              ? { scale: [1, 1.1, 1], opacity: [1, 0.7, 1] }
              : isWarning
                ? { scale: [1, 1.05, 1] }
                : {}
          }
          transition={{ repeat: Infinity, duration: isLow ? 0.5 : 1 }}
        >
          {formatSprint(ms)}
        </motion.div>
      </div>
    );
  }

  return null;
}

function BlitzClock({ ms, active, color }: { ms: number; active: boolean; color: string }) {
  const isLow = ms < 10000;
  const isCritical = ms < 5000;
  const displayColor = isLow ? "#FF2D78" : color;

  return (
    <motion.div
      className="font-bold text-xl"
      style={{
        color: displayColor,
        fontFamily: "Orbitron, sans-serif",
        textShadow: isCritical
          ? `0 0 20px ${displayColor}, 0 0 40px ${displayColor}`
          : active
            ? `0 0 10px ${displayColor}`
            : "none",
      }}
      animate={
        active && isCritical
          ? { scale: [1, 1.1, 1], opacity: [1, 0.6, 1] }
          : active && isLow
            ? { scale: [1, 1.05, 1] }
            : active
              ? { opacity: [1, 0.7, 1] }
              : {}
      }
      transition={{ repeat: Infinity, duration: isCritical ? 0.4 : isLow ? 0.8 : 1.5 }}
    >
      {formatBlitz(ms)}
    </motion.div>
  );
}
