"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/lib/game/constants";
import SkewButton from "@/components/vaporwave/SkewButton";

interface Props {
  winner: Player | null;
  isDraw: boolean;
  onRematch: () => void;
  onHome: () => void;
  onAnalysis?: () => void;
  playerNames?: [string, string];
}

export default function GameOverModal({ winner, isDraw, onRematch, onHome, onAnalysis, playerNames = ["PLAYER 1", "PLAYER 2"] }: Props) {
  const title = isDraw ? "DRAW!" : `${winner === 1 ? playerNames[0] : playerNames[1]} WINS!`;
  const color = isDraw ? "#FF9900" : winner === 1 ? "#FF00FF" : "#00FFFF";

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: "rgba(9,0,20,0.7)", backdropFilter: "blur(4px)" }}
      >
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 200, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="w-full max-w-md mx-4 p-8 text-center"
          style={{
            background: "rgba(26, 16, 60, 0.97)",
            border: `2px solid ${color}`,
            boxShadow: `0 0 60px ${color}44`,
          }}
        >
          <div className="font-heading font-black text-4xl mb-2" style={{ color, fontFamily: "Orbitron, sans-serif", textShadow: `0 0 20px ${color}` }}>
            {title}
          </div>
          <div className="font-mono text-sm text-[#E0E0E0]/60 mb-8 uppercase tracking-widest">
            {isDraw ? "No one rules the grid today." : "The grid bows to the victor."}
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <SkewButton variant="primary" onClick={onRematch}>Rematch</SkewButton>
            <SkewButton variant="secondary" onClick={onHome}>Home</SkewButton>
            {onAnalysis && (
              <SkewButton variant="outline" onClick={onAnalysis}>Analyze</SkewButton>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
