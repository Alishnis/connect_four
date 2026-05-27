"use client";
import { motion } from "framer-motion";

interface Props {
  cells: [number, number][];
}

const CELL_SIZE = 60;
const GAP = 4;
const PADDING = 12;

export default function WinLine({ cells }: Props) {
  if (cells.length < 2) return null;

  const sorted = [...cells].sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  // Calculate center points
  const x1 = PADDING + first[1] * (CELL_SIZE + GAP) + CELL_SIZE / 2;
  const y1 = PADDING + first[0] * (CELL_SIZE + GAP) + CELL_SIZE / 2;
  const x2 = PADDING + last[1] * (CELL_SIZE + GAP) + CELL_SIZE / 2;
  const y2 = PADDING + last[0] * (CELL_SIZE + GAP) + CELL_SIZE / 2;

  const totalWidth = 7 * (CELL_SIZE + GAP) + PADDING * 2;
  const totalHeight = 6 * (CELL_SIZE + GAP) + PADDING * 2;

  const length = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      width={totalWidth}
      height={totalHeight}
    >
      <motion.line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#FF9900"
        strokeWidth={6}
        strokeLinecap="round"
        filter="drop-shadow(0 0 8px #FF9900) drop-shadow(0 0 16px #FF00FF)"
        strokeDasharray={length}
        strokeDashoffset={length}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </svg>
  );
}
