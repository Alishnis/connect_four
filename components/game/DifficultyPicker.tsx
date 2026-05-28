"use client";
import { motion } from "framer-motion";

export type Difficulty = "easy" | "medium" | "hard";

interface Props {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}

const levels: { value: Difficulty; label: string; color: string }[] = [
  { value: "easy",   label: "EASY",  color: "#00FFFF" },
  { value: "medium", label: "MED",   color: "#FF9900" },
  { value: "hard",   label: "HARD",  color: "#FF00FF" },
];

export default function DifficultyPicker({ value, onChange }: Props) {
  return (
    <div className="flex gap-1">
      {levels.map(level => (
        <motion.button
          key={level.value}
          onClick={() => onChange(level.value)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 py-2 px-1 font-mono text-xs uppercase tracking-widest cursor-pointer"
          style={{
            border: `2px solid ${level.color}`,
            background: value === level.value ? level.color : "transparent",
            color: value === level.value ? "#000" : level.color,
            boxShadow: value === level.value ? `0 0 15px ${level.color}` : "none",
            transition: "all 0.15s linear",
          }}
        >
          {level.label}
        </motion.button>
      ))}
    </div>
  );
}
