"use client";
import { motion } from "framer-motion";
import type { MultiplayerStatus } from "@/hooks/useMultiplayer";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Props {
  status: MultiplayerStatus;
}

const CONFIG: Record<MultiplayerStatus, { labelKey: string; color: string }> = {
  waiting: { labelKey: "conn.waiting", color: "#FF9900" },
  playing: { labelKey: "conn.live", color: "#00FFFF" },
  reconnecting: { labelKey: "conn.reconnecting", color: "#FF2D78" },
  game_over: { labelKey: "conn.gameOver", color: "#E0E0E0" },
};

export default function ConnectionBadge({ status }: Props) {
  const { t } = useLanguage();
  const { labelKey, color } = CONFIG[status];
  return (
    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest" style={{ color }}>
      <motion.div
        className="w-2 h-2 rounded-full"
        style={{ background: color }}
        animate={{ opacity: status === "waiting" || status === "reconnecting" ? [1, 0.2, 1] : 1 }}
        transition={{ repeat: Infinity, duration: 1 }}
      />
      {t(labelKey)}
    </div>
  );
}
