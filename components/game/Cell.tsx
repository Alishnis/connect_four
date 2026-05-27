"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Cell as CellType } from "@/lib/game/constants";

interface Props {
  value: CellType;
  isWinCell: boolean;
  isLastMove: boolean;
}

const CELL_SIZE = 60;

export default function Cell({ value, isWinCell, isLastMove }: Props) {
  const colors = {
    0: { bg: "rgba(255,255,255,0.04)", shadow: "inset 0 0 10px rgba(0,0,0,0.5)" },
    1: { bg: "#FF2D78", shadow: isWinCell ? "0 0 20px #FF00FF, 0 0 40px #FF00FF" : "0 0 10px #FF00FF" },
    2: { bg: "#00CCFF", shadow: isWinCell ? "0 0 20px #00FFFF, 0 0 40px #00FFFF" : "0 0 10px #00FFFF" },
  };

  const style = colors[value];

  return (
    <div
      className="flex items-center justify-center"
      style={{ height: CELL_SIZE, width: "100%" }}
    >
      <AnimatePresence>
        <motion.div
          key={value !== 0 ? `disc-${Date.now()}` : "empty"}
          className="rounded-full"
          style={{
            width: CELL_SIZE - 8,
            height: CELL_SIZE - 8,
            background: style.bg,
            boxShadow: style.shadow,
          }}
          initial={value !== 0 ? { y: -400, scale: 0.8 } : false}
          animate={value !== 0 ? {
            y: 0,
            scale: isWinCell ? [1, 1.15, 1] : 1,
          } : {}}
          transition={value !== 0 ? {
            y: { type: "spring", stiffness: 300, damping: 25 },
            scale: isWinCell ? { repeat: Infinity, duration: 0.8 } : {},
          } : {}}
        />
      </AnimatePresence>
    </div>
  );
}
