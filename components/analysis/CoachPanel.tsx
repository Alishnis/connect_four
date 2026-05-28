"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import type { CoachReport } from "@/lib/game/coach";
import type { Board } from "@/lib/game/constants";
import GlowCard from "@/components/vaporwave/GlowCard";

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

  const moves = playerFilter ? report.moves.filter(m => m.player === playerFilter) : report.moves;
  const blunders = playerFilter ? report.blunders.filter(m => m.player === playerFilter) : report.blunders;
  const missedWins = playerFilter ? report.missedWins.filter(m => m.player === playerFilter) : report.missedWins;

  const inaccuracies = moves.filter(m => !m.isBlunder && !m.isMissedWin && m.evalDrop >= 10);
  const goodMoves = moves.filter(m => m.evalDrop < 10).length;
  const accuracyScore = moves.length > 0 ? Math.round((goodMoves / moves.length) * 100) : report.accuracyScore;

  let verdict = report.verdict;
  if (playerFilter) {
    const totalErrors = blunders.length + missedWins.length + inaccuracies.length;
    if (totalErrors === 0) {
      verdict = `Безупречно. ${moves.length} ходов, ноль ошибок.`;
    } else if (blunders.length >= 3) {
      verdict = `Тяжёлая игра — ${blunders.length} грубых ошибок. Изучи выделенные ходы.`;
    } else if (missedWins.length > 0) {
      verdict = `У тебя было ${missedWins.length} победный шанс — ты его упустил.`;
    } else if (blunders.length > 0) {
      verdict = `Хорошая игра: ${blunders.length} ошибок и ${inaccuracies.length} неточностей.`;
    } else {
      verdict = `Хорошая игра: ${inaccuracies.length} неточностей. Есть куда расти.`;
    }
  }

  const verdictColor = accuracyScore >= 80 ? "#00FFFF" : accuracyScore >= 60 ? "#FF9900" : "#FF2D78";

  return (
    <div className="space-y-6">
      {/* Verdict */}
      <GlowCard accentColor="magenta">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-[#E0E0E0]/50 mb-1">Вердикт тренера</div>
            <p className="font-mono text-sm text-[#E0E0E0] leading-relaxed max-w-lg">{verdict}</p>
          </div>
          <div className="text-center">
            <div className="font-heading font-black text-4xl" style={{ color: verdictColor, fontFamily: "Orbitron, sans-serif", textShadow: `0 0 20px ${verdictColor}` }}>
              {accuracyScore}%
            </div>
            <div className="font-mono text-xs uppercase tracking-widest text-[#E0E0E0]/50">Точность</div>
          </div>
        </div>
        <div className="flex gap-6 mt-6 pt-4 flex-wrap" style={{ borderTop: "1px solid #2D1B4E" }}>
          {[
            { label: "Ходы", value: moves.length, color: "#E0E0E0" },
            { label: "Грубые ошибки", value: blunders.length, color: "#FF2D78" },
            { label: "Неточности", value: inaccuracies.length, color: "#FF9900" },
            { label: "Пропущенные победы", value: missedWins.length, color: "#FF4500" },
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
        <div className="font-mono text-xs uppercase tracking-widest text-[#00FFFF] mb-4">Хронология</div>
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
            <div className="w-3 h-3 rounded-full" style={{ background: "#FF2D78" }} /> Ошибка
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#E0E0E0]/50">
            <div className="w-3 h-3 rounded-full" style={{ background: "#FF4500" }} /> Упущена победа
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#E0E0E0]/50">
            <div className="w-3 h-3 rounded-full" style={{ background: "#FF9900" }} /> Неточность
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#E0E0E0]/50">
            <div className="w-3 h-3 rounded-full" style={{ background: "#00FFFF" }} /> Оптимально
          </div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#E0E0E0]/50">
            <div className="w-3 h-3 rounded-full" style={{ background: "#10B981" }} /> Победа
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
                    Ход #{move.moveNumber}
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
                      ● Лучший: Кол. {move.bestCol + 1}
                    </div>
                  )}
                </div>

                {/* Text details */}
                <div className="font-mono text-sm flex-1 pt-5">
                  <div className="mb-2" style={{ color: flagColor }}>
                    {isLastMoveDetail && report.winningSide !== null
                      ? move.player === report.winningSide ? "🏆 Победный ход" : "💀 Проигрышный ход"
                      : move.isBlunder ? "⚠ Грубая ошибка" : move.isMissedWin ? "★ Упущена победа" : isInaccuracy ? "~ Неточность" : "✓ Оптимально"}
                  </div>
                  <div className="text-[#E0E0E0]/60 mb-1">
                    Сыграно: <span style={{ color: move.player === 1 ? "#FF2D78" : "#00CCFF" }}>Кол. {move.column + 1}</span>
                  </div>
                  <div className="text-[#E0E0E0]/60 mb-1">
                    Лучший: <span style={{ color: "#FF9900" }}>Кол. {move.bestCol + 1}</span>
                  </div>
                  {move.isBlunder && (
                    <div className="text-[#FF2D78] mt-2 text-xs">
                      Оценка упала на {move.evalDrop} пт ниже оптимала
                    </div>
                  )}
                  {move.isMissedWin && (
                    <div className="text-[#FF9900] mt-2 text-xs">
                      Кол. {move.bestCol + 1} — немедленная победа
                    </div>
                  )}
                  {isInaccuracy && (
                    <div className="text-[#FF9900] mt-2 text-xs">
                      {move.evalDrop} пт ниже оптимала — лучше: Кол. {move.bestCol + 1}
                    </div>
                  )}
                  {!move.isBlunder && !move.isMissedWin && !isInaccuracy && (
                    <div className="text-[#00FFFF] mt-2 text-xs">
                      Оптимальный ход
                    </div>
                  )}
                  {/* AI Coach tip */}
                  {move.tip && (
                    <div className="mt-3 pt-3" style={{ borderTop: "1px solid #2D1B4E" }}>
                      <div className="font-mono text-xs uppercase tracking-widest text-[#10B981] mb-1">Совет тренера</div>
                      <p className="font-mono text-xs text-[#E0E0E0]/80 leading-relaxed">{move.tip}</p>
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
          <div className="font-mono text-xs uppercase tracking-widest text-[#FF00FF] mb-4">Критические ошибки</div>
          <div className="space-y-3">
            {blunders.map(b => (
              <div key={b.moveNumber} className="p-3 font-mono text-sm"
                style={{ background: "rgba(255,45,120,0.05)", border: "1px solid rgba(255,45,120,0.2)" }}>
                <span className="text-[#FF2D78]">Ход #{b.moveNumber}</span>
                <span className="text-[#E0E0E0]/60"> — сыграно Кол. {b.column + 1}, лучший был Кол. {b.bestCol + 1}.</span>
                {b.isMissedWin && <span className="text-[#FF9900]"> Упущена немедленная победа.</span>}
              </div>
            ))}
          </div>
        </GlowCard>
      )}
    </div>
  );
}
