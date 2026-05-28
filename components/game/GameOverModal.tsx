"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Player } from "@/lib/game/constants";
import SkewButton from "@/components/vaporwave/SkewButton";
import type { CoinReward } from "@/lib/coins/rewards";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/** Parse @@key@@vars@@ format */
function resolveI18n(text: string, t: (key: string, vars?: Record<string, string | number>) => string): string {
  const match = text.match(/^@@(.+?)@@(.*?)@@$/);
  if (match) {
    const key = match[1];
    const varsJson = match[2];
    const vars = varsJson ? JSON.parse(varsJson) : undefined;
    return t(key, vars);
  }
  return text;
}

interface Props {
  winner: Player | null;
  isDraw: boolean;
  onRematch: () => void;
  onHome: () => void;
  onAnalysis?: () => void;
  playerNames?: [string, string];
  coinReward?: CoinReward | null;
  timeoutLoser?: Player | null;
  eloChange?: number;
}

export default function GameOverModal({ winner, isDraw, onRematch, onHome, onAnalysis, playerNames = ["PLAYER 1", "PLAYER 2"], coinReward, timeoutLoser, eloChange }: Props) {
  const { t } = useLanguage();
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
          <div className="font-mono text-sm text-[#E0E0E0]/60 mb-4 uppercase tracking-widest">
            {timeoutLoser
              ? t("gameover.timeout")
              : isDraw
                ? t("gameover.draw")
                : t("gameover.win")}
          </div>

          {/* Coin reward display */}
          {coinReward && coinReward.total > 0 && (
            <motion.div
              className="mb-6 py-3 px-4"
              style={{
                background: "rgba(255, 153, 0, 0.1)",
                border: "1px solid #FF990044",
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                className="font-heading font-bold text-2xl"
                style={{ color: "#FF9900", fontFamily: "Orbitron, sans-serif" }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: 2, duration: 0.4, delay: 0.8 }}
              >
                +{coinReward.total} NC
              </motion.div>
              <div className="font-mono text-xs text-[#E0E0E0]/50 mt-1">
                {resolveI18n(coinReward.reason, t)}
                {coinReward.streakBonus > 0 && (
                  <span style={{ color: "#FF9900" }}>
                    {" "}({t("gameover.streak")} +{coinReward.streakBonus})
                  </span>
                )}
              </div>
            </motion.div>
          )}

          {/* ELO change display */}
          {eloChange !== undefined && (
            <motion.div
              className="mb-6 py-3 px-4"
              style={{
                background: eloChange >= 0 ? "rgba(0, 255, 128, 0.1)" : "rgba(255, 45, 120, 0.1)",
                border: `1px solid ${eloChange >= 0 ? "#00FF8044" : "#FF2D7844"}`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.div
                className="font-heading font-bold text-2xl"
                style={{
                  color: eloChange >= 0 ? "#00FF80" : "#FF2D78",
                  fontFamily: "Orbitron, sans-serif",
                  textShadow: `0 0 20px ${eloChange >= 0 ? "#00FF8066" : "#FF2D7866"}`,
                }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: 2, duration: 0.4, delay: 1 }}
              >
                {eloChange >= 0 ? "+" : ""}{eloChange} ELO
              </motion.div>
              <div className="font-mono text-xs text-[#E0E0E0]/50 mt-1">
                {eloChange >= 0 ? t("ranked.eloUp") : t("ranked.eloDown")}
              </div>
            </motion.div>
          )}

          <div className="flex gap-4 justify-center flex-wrap">
            <SkewButton variant="primary" onClick={onRematch}>{t("gameover.rematch")}</SkewButton>
            <SkewButton variant="secondary" onClick={onHome}>{t("gameover.home")}</SkewButton>
            {onAnalysis && (
              <SkewButton variant="outline" onClick={onAnalysis}>{t("gameover.analysis")}</SkewButton>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
