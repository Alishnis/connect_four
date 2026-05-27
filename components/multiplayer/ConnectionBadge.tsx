"use client";
import { motion } from "framer-motion";
import type { MultiplayerStatus } from "@/hooks/useMultiplayer";

interface Props {
  status: MultiplayerStatus;
}

const config: Record<MultiplayerStatus, { label: string; color: string }> = {
  waiting: { label: "Waiting for opponent...", color: "#FF9900" },
  playing: { label: "Live", color: "#00FFFF" },
  reconnecting: { label: "Reconnecting...", color: "#FF2D78" },
  game_over: { label: "Game Over", color: "#E0E0E0" },
};

export default function ConnectionBadge({ status }: Props) {
  const { label, color } = config[status];
  return (
    <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest" style={{ color }}>
      <motion.div
        className="w-2 h-2 rounded-full"
        style={{ background: color }}
        animate={{ opacity: status === "waiting" || status === "reconnecting" ? [1, 0.2, 1] : 1 }}
        transition={{ repeat: Infinity, duration: 1 }}
      />
      {label}
    </div>
  );
}
