"use client";
import { motion } from "framer-motion";
import { Player } from "@/lib/game/constants";

interface Props {
  currentPlayer: Player;
  playerNames?: [string, string];
  moveCount: number;
  status: string;
}

export default function ScoreBar({ currentPlayer, playerNames = ["PLAYER 1", "PLAYER 2"], moveCount, status }: Props) {
  return (
    <div className="flex items-center justify-between mb-4 px-1">
      {/* Player 1 */}
      <div className={`flex items-center gap-2 ${currentPlayer === 1 && status === "playing" ? "opacity-100" : "opacity-40"}`}>
        <motion.div
          className="rounded-full"
          style={{ width: 20, height: 20, background: "#FF2D78", boxShadow: "0 0 10px #FF00FF" }}
          animate={currentPlayer === 1 && status === "playing" ? { scale: [1, 1.3, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        />
        <span className="font-mono text-xs uppercase tracking-wider" style={{ color: "#FF2D78" }}>
          {playerNames[0]}
        </span>
      </div>

      {/* Move counter */}
      <div className="text-center">
        <div className="font-mono text-xs text-[#E0E0E0]/50 uppercase tracking-widest">Move</div>
        <div className="font-heading font-bold text-xl" style={{ color: "#FF9900", fontFamily: "Orbitron, sans-serif" }}>
          {moveCount.toString().padStart(2, "0")}
        </div>
      </div>

      {/* Player 2 */}
      <div className={`flex items-center gap-2 ${currentPlayer === 2 && status === "playing" ? "opacity-100" : "opacity-40"}`}>
        <span className="font-mono text-xs uppercase tracking-wider" style={{ color: "#00CCFF" }}>
          {playerNames[1]}
        </span>
        <motion.div
          className="rounded-full"
          style={{ width: 20, height: 20, background: "#00CCFF", boxShadow: "0 0 10px #00FFFF" }}
          animate={currentPlayer === 2 && status === "playing" ? { scale: [1, 1.3, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      </div>
    </div>
  );
}
