"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import type { CoachReport } from "@/lib/game/coach";
import type { Board } from "@/lib/game/constants";
import GlowCard from "@/components/vaporwave/GlowCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";

/** Parse tip text that may contain @@key@@vars@@ format from coachTips */
function parseTip(tipText: string, t: (key: string, vars?: Record<string, string | number>) => string): string {
  const match = tipText.match(/^@@(.+?)@@(.*?)@@$/);
  if (match) {
    const key = match[1];
    const varsJson = match[2];
    const vars = varsJson ? JSON.parse(varsJson) : undefined;
    return t(key, vars);
  }
  return tipText;
}

interface Props {
  report: CoachReport;
  playerFilter?: 1 | 2;
}

const ROWS = 6;
const COLS = 7;

// Find the row where a piece lands in a given column
function getLandingRow(board: Board, col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) return r;
  }
  return -1;
}

interface MiniBoardProps {
  board: Board;
  playedRow: number;
  playedCol: number;
  bestCol?: number; // highlighted as orange hint when different from playedCol
  player: 1 | 2;
}

function MiniBoard({ board, playedRow, playedCol, bestCol, player }: MiniBoardProps) {
  const playedColor = player === 1 ? "#FF2D78" : "#00CCFF";
  return (
    <div
      className="grid gap-[3px] p-2 rounded"
      style={{
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        background: "rgba(26,16,60,0.9)",
        border: "1px solid #2D1B4E",
        width: 196,
      }}
    >
      {/* Best column indicator */}
      {bestCol !== undefined && bestCol !== playedCol && (
        <>
          {Array.from({ length: COLS }, (_, c) => (
            <div key={`hint-${c}`} className="h-2 flex items-center justify-center">
              {c === bestCol && (
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#FF9900" }} />
              )}
            </div>
          ))}
        </>
      )}
      {Array.from({ length: ROWS }, (_, r) =>
        Array.from({ length: COLS }, (_, c) => {
          const val = board[r][c];
          const isPlayed = r === playedRow && c === playedCol;
          const isBestCol = bestCol !== undefined && bestCol !== playedCol && c === bestCol;
          return (
            <div
              key={`${r}-${c}`}
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: isPlayed
                  ? playedColor
                  : val === 1
                  ? "rgba(255,45,120,0.55)"
                  : val === 2
                  ? "rgba(0,204,255,0.55)"
                  : isBestCol
                  ? "rgba(255,153,0,0.15)"
                  : "rgba(255,255,255,0.04)",
                border: isPlayed
                  ? `2px solid ${playedColor}`
                  : isBestCol
                  ? "2px dashed #FF9900"
                  : "1px solid rgba(255,255,255,0.08)",
                boxShadow: isPlayed ? `0 0 8px ${playedColor}88` : "none",
                transition: "none",
              }}
            />
          );
        })
      )}
    </div>
  );
}

export default function CoachPanel({ report, playerFilter }: Props) {
  const [selectedMove, setSelectedMove] = useState<number | null>(null);
  const { t } = useLanguage();

  const moves = playerFilter ? report.moves.filter(m => m.player === playerFilter) : report.moves;
  const blunders = playerFilter ? report.blunders.filter(m => m.player === playerFilter) : report.blunders;
  const missedWins = playerFilter ? report.missedWins.filter(m => m.player === playerFilter) : report.missedWins;

  const inaccuracies = moves.filter(m => !m.isBlunder && !m.isMissedWin && m.evalDrop >= 10);
  const goodMoves = moves.filter(m => m.evalDrop < 10).length;
  const accuracyScore = moves.length > 0 ? Math.round((goodMoves / moves.length) * 100) : report.accuracyScore;

  let verdict = parseTip(report.verdict, t);
  if (playerFilter) {
    const totalErrors = blunders.length + missedWins.length + inaccuracies.length;
    if (totalErrors === 0) {
      verdict = t("verdict.flawless", { n: moves.length });
    } else if (blunders.length >= 3) {
      verdict = t("verdict.rough", { n: blunders.length });
    } else if (missedWins.length > 0) {
      verdict = t("verdict.missedWins", { n: missedWins.length });
    } else if (blunders.length > 0) {
      verdict = t("verdict.goodWithBlunders", { blunders: blunders.length, inaccuracies: inaccuracies.length });
    } else {
      verdict = t("verdict.goodWithInaccuracies", { n: inaccuracies.length });
    }
  }

  const verdictColor = accuracyScore >= 80 ? "#00FFFF" : accuracyScore >= 60 ? "#FF9900" : "#FF2D78";

  return (
    <div className="space-y-6">
      {/* Verdict */}
      <GlowCard accentColor="magenta">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-[#E0E0E0]/50 mb-1">{t("coach.verdict")}</div>
            <p className="font-mono text-sm text-[#E0E0E0] leading-relaxed max-w-lg">{verdict}</p>
          </div>
          <div className="text-center">
            <div className="font-heading font-black text-4xl" style={{ color: verdictColor, fontFamily: "Orbitron, sans-serif", textShadow: `0 0 20px ${verdictColor}` }}>
              {accuracyScore}%
            </div>
            <div className="font-mono text-xs uppercase tracking-widest text-[#E0E0E0]/50">{t("coach.accuracy")}</div>
          </div>
        </div>
        <div className="flex gap-6 mt-6 pt-4 flex-wrap" style={{ borderTop: "1px solid #2D1B4E" }}>
          {[
            { label: t("coach.moves"), value: moves.length, color: "#E0E0E0" },
            { label: t("coach.blunders"), value: blunders.length, color: "#FF2D78" },
            { label: t("coach.inaccuracies"), value: inaccuracies.length, color: "#FF9900" },
            { label: t("coach.missedWins"), value: missedWins.length, color: "#FF4500" },
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
        <div className="font-mono text-xs uppercase tracking-widest text-[#00FFFF] mb-4">{t("coach.timeline")}</div>
        <div className="flex flex-wrap gap-2">
          {moves.map((move, idx) => {
            const isLastMove = idx === moves.length - 1;
            const isBlunder = move.isBlunder;
            const isMissed = move.isMissedWin;
            const isInaccuracy = !isBlunder && !isMissed && move.evalDrop >= 10;
            const isSelected = selectedMove === move.moveNumber;

            // Last move: mark as winning (green) if this player won, or blunder (red) if they lost
            let flagColor: string;
            if (isLastMove && report.winningSide !== null) {
              flagColor = move.player === report.winningSide ? "#10B981" : "#FF2D78";
            } else {
              flagColor = isBlunder ? "#FF2D78" : isMissed ? "#FF4500" : isInaccuracy ? "#FF9900" : "#00FFFF";
            }
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

        {/* Legend */}
        <div className="flex gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-2 font-mono text-xs text-[#E0E0E0]/50">
            <div className="w-3 h-3 rounded-full" style={{ background: "#FF2D78" }} /> {t("legend.blunder")}
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#E0E0E0]/50">
            <div className="w-3 h-3 rounded-full" style={{ background: "#FF4500" }} /> {t("legend.missedWin")}
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#E0E0E0]/50">
            <div className="w-3 h-3 rounded-full" style={{ background: "#FF9900" }} /> {t("legend.inaccuracy")}
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#E0E0E0]/50">
            <div className="w-3 h-3 rounded-full" style={{ background: "#00FFFF" }} /> {t("legend.optimal")}
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#E0E0E0]/50">
            <div className="w-3 h-3 rounded-full" style={{ background: "#10B981" }} /> {t("legend.win")}
          </div>
        </div>

        {/* Selected move — board + details */}
        {selectedMove !== null && (() => {
          const move = moves.find(m => m.moveNumber === selectedMove);
          if (!move) return null;

          const row = getLandingRow(move.board, move.column);
          // Build board AFTER the move
          const boardAfter = move.board.map((r, ri) =>
            r.map((cell, ci) => (ri === row && ci === move.column ? move.player : cell))
          ) as Board;

          const isLastMoveDetail = move.moveNumber === moves[moves.length - 1]?.moveNumber;
          const isInaccuracy = !move.isBlunder && !move.isMissedWin && move.evalDrop >= 10;
          const showBestHint = (move.isBlunder || move.isMissedWin || isInaccuracy) && move.bestCol !== move.column && !(isLastMoveDetail && report.winningSide !== null);
          let flagColor: string;
          if (isLastMoveDetail && report.winningSide !== null) {
            flagColor = move.player === report.winningSide ? "#10B981" : "#FF2D78";
          } else {
            flagColor = move.isBlunder ? "#FF2D78" : move.isMissedWin ? "#FF4500" : isInaccuracy ? "#FF9900" : "#00FFFF";
          }

          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 pt-4"
              style={{ borderTop: "1px solid #2D1B4E" }}
            >
              <div className="flex gap-5 flex-wrap items-start">
                {/* Mini board */}
                <div>
                  <div className="font-mono text-xs text-[#E0E0E0]/40 mb-1 uppercase tracking-widest">
                    {t("coach.moveN", { n: move.moveNumber })}
                  </div>
                  <MiniBoard
                    board={boardAfter}
                    playedRow={row}
                    playedCol={move.column}
                    bestCol={showBestHint ? move.bestCol : undefined}
                    player={move.player}
                  />
                  {showBestHint && (
                    <div className="font-mono text-xs mt-1" style={{ color: "#FF9900" }}>
                      {t("coach.bestCol", { n: move.bestCol + 1 })}
                    </div>
                  )}
                </div>

                {/* Text details */}
                <div className="font-mono text-sm flex-1 pt-5">
                  <div className="mb-2" style={{ color: flagColor }}>
                    {isLastMoveDetail && report.winningSide !== null
                      ? move.player === report.winningSide ? t("coach.winMove") : t("coach.loseMove")
                      : move.isBlunder ? t("coach.blunder") : move.isMissedWin ? t("coach.missedWin") : isInaccuracy ? t("coach.inaccuracy") : t("coach.optimal")}
                  </div>
                  <div className="text-[#E0E0E0]/60 mb-1">
                    {t("coach.played")}: <span style={{ color: move.player === 1 ? "#FF2D78" : "#00CCFF" }}>{t("coach.col", { n: move.column + 1 })}</span>
                  </div>
                  <div className="text-[#E0E0E0]/60 mb-1">
                    {t("coach.best")}: <span style={{ color: "#FF9900" }}>{t("coach.col", { n: move.bestCol + 1 })}</span>
                  </div>
                  {move.isBlunder && (
                    <div className="text-[#FF2D78] mt-2 text-xs">
                      {t("coach.evalDrop", { n: move.evalDrop })}
                    </div>
                  )}
                  {move.isMissedWin && (
                    <div className="text-[#FF9900] mt-2 text-xs">
                      {t("coach.immWin", { n: move.bestCol + 1 })}
                    </div>
                  )}
                  {isInaccuracy && (
                    <div className="text-[#FF9900] mt-2 text-xs">
                      {t("coach.inaccDetail", { n: move.evalDrop, col: move.bestCol + 1 })}
                    </div>
                  )}
                  {!move.isBlunder && !move.isMissedWin && !isInaccuracy && (
                    <div className="text-[#00FFFF] mt-2 text-xs">
                      {t("coach.optimalMove")}
                    </div>
                  )}
                  {/* AI Coach tip */}
                  {move.tip && (
                    <div className="mt-3 pt-3" style={{ borderTop: "1px solid #2D1B4E" }}>
                      <div className="font-mono text-xs uppercase tracking-widest text-[#10B981] mb-1">{t("coach.tipLabel")}</div>
                      <p className="font-mono text-xs text-[#E0E0E0]/80 leading-relaxed">{parseTip(move.tip, t)}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })()}
      </GlowCard>

      {/* Blunders list */}
      {blunders.length > 0 && (
        <GlowCard accentColor="magenta">
          <div className="font-mono text-xs uppercase tracking-widest text-[#FF00FF] mb-4">{t("coach.criticalErrors")}</div>
          <div className="space-y-3">
            {blunders.map(b => (
              <div key={b.moveNumber} className="p-3 font-mono text-sm"
                style={{ background: "rgba(255,45,120,0.05)", border: "1px solid rgba(255,45,120,0.2)" }}>
                <span className="text-[#FF2D78]">{t("coach.moveN", { n: b.moveNumber })}</span>
                <span className="text-[#E0E0E0]/60"> — {t("coach.blunderEntry", { n: b.moveNumber, col: b.column + 1, best: b.bestCol + 1 })}</span>
                {b.isMissedWin && <span className="text-[#FF9900]"> {t("coach.missedWinNote")}</span>}
              </div>
            ))}
          </div>
        </GlowCard>
      )}
    </div>
  );
}
