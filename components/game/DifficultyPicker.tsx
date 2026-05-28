"use client";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export type Difficulty = "easy" | "medium" | "hard";

interface Props {
  value: Difficulty;
  onChange: (d: Difficulty) => void;
}

const levels: { value: Difficulty; labelKey: string; color: string }[] = [
  { value: "easy",   labelKey: "diff.easy",   color: "#00FFFF" },
  { value: "medium", labelKey: "diff.medium", color: "#FF9900" },
  { value: "hard",   labelKey: "diff.hard",   color: "#FF00FF" },
];

export default function DifficultyPicker({ value, onChange }: Props) {
  const { t } = useLanguage();

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
          {t(level.labelKey)}
        </motion.button>
      ))}
    </div>
  );
}
