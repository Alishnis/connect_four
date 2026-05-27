"use client";
import { Board as BoardType } from "@/lib/game/constants";
import Cell from "./Cell";
import WinLine from "./WinLine";
import { motion } from "framer-motion";

interface Props {
  board: BoardType;
  onColumnClick: (col: number) => void;
  winCells: [number, number][] | null;
  currentPlayer: 1 | 2;
  disabled?: boolean;
  hintColumn?: number | null;
  lastMove?: { row: number; col: number } | null;
}

const COLS = 7;
const ROWS = 6;

export default function Board({ board, onColumnClick, winCells, currentPlayer, disabled, hintColumn, lastMove }: Props) {
  return (
    <div className="relative select-none">
      {/* Hint arrow */}
      {hintColumn !== null && hintColumn !== undefined && (
        <div className="flex justify-around mb-2">
          {Array.from({ length: COLS }, (_, c) => (
            <div key={c} className="flex-1 flex justify-center">
              {c === hintColumn && (
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="text-[#FF9900] text-xl"
                >
                  ▼
                </motion.div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Column hover areas */}
      <div className="relative">
        <div
          className="grid gap-1 p-3 relative"
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            background: "rgba(26, 16, 60, 0.9)",
            border: "2px solid #2D1B4E",
            boxShadow: "0 0 40px rgba(0,255,255,0.1), inset 0 0 40px rgba(0,0,0,0.5)",
          }}
        >
          {Array.from({ length: COLS }, (_, col) => (
            <motion.div
              key={col}
              className="cursor-pointer relative"
              whileHover={!disabled ? { backgroundColor: currentPlayer === 1 ? "rgba(255,0,255,0.1)" : "rgba(0,255,255,0.1)" } : {}}
              onClick={() => !disabled && onColumnClick(col)}
            >
              {Array.from({ length: ROWS }, (_, row) => (
                <Cell
                  key={row}
                  value={board[row][col]}
                  isWinCell={winCells?.some(([r, c]) => r === row && c === col) ?? false}
                  isLastMove={lastMove?.row === row && lastMove?.col === col}
                />
              ))}
            </motion.div>
          ))}
        </div>

        {/* Win line SVG overlay */}
        {winCells && <WinLine cells={winCells} />}
      </div>
    </div>
  );
}
