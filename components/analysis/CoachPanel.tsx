"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import type { CoachReport } from "@/lib/game/coach";
import GlowCard from "@/components/vaporwave/GlowCard";

interface Props {
  report: CoachReport;
}

export default function CoachPanel({ report }: Props) {
  const [selectedMove, setSelectedMove] = useState<number | null>(null);

  const verdictColor = report.accuracyScore >= 80 ? "#00FFFF" : report.accuracyScore >= 60 ? "#FF9900" : "#FF2D78";

  return (
    <div className="space-y-6">
      {/* Verdict */}
      <GlowCard accentColor="magenta">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-[#E0E0E0]/50 mb-1">AI Coach Verdict</div>
            <p className="font-mono text-sm text-[#E0E0E0] leading-relaxed max-w-lg">{report.verdict}</p>
          </div>
          <div className="text-center">
            <div className="font-heading font-black text-4xl" style={{ color: verdictColor, fontFamily: "Orbitron, sans-serif", textShadow: `0 0 20px ${verdictColor}` }}>
              {report.accuracyScore}%
            </div>
            <div className="font-mono text-xs uppercase tracking-widest text-[#E0E0E0]/50">Accuracy</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-6 mt-6 pt-4 flex-wrap" style={{ borderTop: "1px solid #2D1B4E" }}>
          {[
            { label: "Moves", value: report.totalMoves, color: "#E0E0E0" },
            { label: "Blunders", value: report.blunders.length, color: "#FF2D78" },
            { label: "Missed Wins", value: report.missedWins.length, color: "#FF9900" },
            { label: "Fork Spotted", value: report.hasFork ? "Yes" : "No", color: report.hasFork ? "#00FFFF" : "#E0E0E0" },
          ].map(s => (
            <div key={s.label}>
              <div className="font-heading font-bold text-xl" style={{ color: s.color, fontFamily: "Orbitron, sans-serif" }}>{s.value}</div>
              <div className="font-mono text-xs uppercase tracking-widest text-[#E0E0E0]/50">{s.label}</div>
            </div>
          ))}
        </div>
      </GlowCard>

      {/* Move timeline */}
      <GlowCard accentColor="cyan">
        <div className="font-mono text-xs uppercase tracking-widest text-[#00FFFF] mb-4">Move Timeline</div>
        <div className="flex flex-wrap gap-2">
          {report.moves.map(move => {
            const isBlunder = move.isBlunder;
            const isMissed = move.isMissedWin;
            const isSelected = selectedMove === move.moveNumber;
            const baseColor = move.player === 1 ? "#FF2D78" : "#00CCFF";
            const flagColor = isBlunder ? "#FF2D78" : isMissed ? "#FF9900" : baseColor;

            return (
              <motion.button
                key={move.moveNumber}
                onClick={() => setSelectedMove(isSelected ? null : move.moveNumber)}
                whileHover={{ scale: 1.1 }}
                className="w-9 h-9 font-mono text-xs flex items-center justify-center cursor-pointer"
                style={{
                  background: isSelected ? flagColor : "transparent",
                  border: `2px solid ${flagColor}`,
                  color: isSelected ? "#000" : flagColor,
                  boxShadow: isSelected ? `0 0 10px ${flagColor}` : "none",
                }}>
                {move.moveNumber}
              </motion.button>
            );
          })}
        </div>
        <div className="flex gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-2 font-mono text-xs text-[#E0E0E0]/50">
            <div className="w-3 h-3 rounded-full bg-[#FF2D78]" /> Blunder
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#E0E0E0]/50">
            <div className="w-3 h-3 rounded-full bg-[#FF9900]" /> Missed Win
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#E0E0E0]/50">
            <div className="w-3 h-3 rounded-full bg-[#00FFFF]" /> Good
          </div>
        </div>

        {/* Selected move detail */}
        {selectedMove !== null && (() => {
          const move = report.moves.find(m => m.moveNumber === selectedMove);
          if (!move) return null;
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 font-mono text-sm"
              style={{ background: "rgba(0,0,0,0.4)", border: "1px solid #2D1B4E" }}>
              <div className="text-[#00FFFF] mb-1">Move #{move.moveNumber} · {move.player === 1 ? "Player 1" : "Player 2"}</div>
              <div className="text-[#E0E0E0]/70">Played: Column {move.column + 1}</div>
              <div className="text-[#E0E0E0]/70">Best: Column {move.bestCol + 1}</div>
              {move.isBlunder && <div className="text-[#FF2D78] mt-1">⚠ Blunder — eval dropped {move.evalDrop} points</div>}
              {move.isMissedWin && <div className="text-[#FF9900] mt-1">★ You had a winning move here (Col {move.bestCol + 1})</div>}
              {!move.isBlunder && !move.isMissedWin && move.evalDrop < 10 && <div className="text-[#00FFFF] mt-1">✓ Optimal or near-optimal move</div>}
            </motion.div>
          );
        })()}
      </GlowCard>

      {/* Blunders list */}
      {report.blunders.length > 0 && (
        <GlowCard accentColor="magenta">
          <div className="font-mono text-xs uppercase tracking-widest text-[#FF00FF] mb-4">Critical Mistakes</div>
          <div className="space-y-3">
            {report.blunders.map(b => (
              <div key={b.moveNumber} className="p-3 font-mono text-sm"
                style={{ background: "rgba(255,45,120,0.05)", border: "1px solid rgba(255,45,120,0.2)" }}>
                <span className="text-[#FF2D78]">Move #{b.moveNumber}</span>
                <span className="text-[#E0E0E0]/60"> — played Col {b.column + 1}, best was Col {b.bestCol + 1}.</span>
                {b.isMissedWin && <span className="text-[#FF9900]"> This missed an immediate win.</span>}
              </div>
            ))}
          </div>
        </GlowCard>
      )}
    </div>
  );
}
