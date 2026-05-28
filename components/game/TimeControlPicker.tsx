"use client";
import { motion } from "framer-motion";
import type { TimeControlMode } from "@/lib/game/constants";

interface Props {
  value: TimeControlMode;
  onChange: (mode: TimeControlMode) => void;
}

const modes: { value: TimeControlMode; label: string; icon: string; color: string }[] = [
  { value: "classic", label: "КЛАССИКА", icon: "♾️", color: "#00FFFF" },
  { value: "blitz",   label: "БЛИЦ",    icon: "⚡", color: "#FF9900" },
  { value: "sprint",  label: "СПРИНТ",  icon: "🏃", color: "#FF00FF" },
];

export default function TimeControlPicker({ value, onChange }: Props) {
  return (
    <div className="flex gap-1">
      {modes.map(mode => (
        <motion.button
          key={mode.value}
          onClick={() => onChange(mode.value)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 py-2 px-1 font-mono text-xs uppercase tracking-widest cursor-pointer"
          style={{
            border: `2px solid ${mode.color}`,
            background: value === mode.value ? mode.color : "transparent",
            color: value === mode.value ? "#000" : mode.color,
            boxShadow: value === mode.value ? `0 0 15px ${mode.color}` : "none",
            transition: "all 0.15s linear",
          }}
        >
          {mode.icon} {mode.label}
        </motion.button>
      ))}
    </div>
  );
}
