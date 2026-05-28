"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Cell as CellType } from "@/lib/game/constants";
import { useSkin } from "@/lib/skins/SkinContext";

interface Props {
  value: CellType;
  isWinCell: boolean;
  isLastMove: boolean;
}

export default function Cell({ value, isWinCell, isLastMove }: Props) {
  const skin = useSkin();

  const getStyle = () => {
    if (value === 0) {
      return {
        bg: "rgba(255,255,255,0.04)",
        shadow: "inset 0 0 10px rgba(0,0,0,0.5)",
        radius: "50%",
        animation: undefined as string | undefined,
      };
    }

    const playerStyle = value === 1 ? skin.player1 : skin.player2;
    const winGlow = isWinCell
      ? `${playerStyle.boxShadow}, ${playerStyle.boxShadow.replace(/\d+px/g, (m) => `${parseInt(m) * 2}px`)}`
      : playerStyle.boxShadow;

    return {
      bg: playerStyle.background,
      shadow: winGlow,
      radius: playerStyle.borderRadius ?? "50%",
      animation: playerStyle.animation,
    };
  };

  const style = getStyle();

  return (
    <div className="flex items-center justify-center w-full" style={{ aspectRatio: "1 / 1" }}>
      <AnimatePresence>
        <motion.div
          key={value !== 0 ? `disc-${Date.now()}` : "empty"}
          className={`${style.animation ?? ""}`}
          style={{
            width: "85%",
            height: "85%",
            background: style.bg,
            boxShadow: style.shadow,
            borderRadius: style.radius,
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
