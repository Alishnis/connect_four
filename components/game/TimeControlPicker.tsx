"use client";
import { motion } from "framer-motion";
import type { TimeControlMode } from "@/lib/game/constants";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Props {
  value: TimeControlMode;
  onChange: (mode: TimeControlMode) => void;
}

export default function TimeControlPicker({ value, onChange }: Props) {
  const { t } = useLanguage();

  const modes: { value: TimeControlMode; labelKey: string; icon: string; color: string }[] = [
    { value: "classic", labelKey: "time.classic", icon: "♾️", color: "#00FFFF" },
    { value: "blitz",   labelKey: "time.blitz",   icon: "⚡", color: "#FF9900" },
    { value: "sprint",  labelKey: "time.sprint",  icon: "🏃", color: "#FF00FF" },
  ];

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
          {mode.icon} {t(mode.labelKey)}
        </motion.button>
      ))}
    </div>
  );
}
