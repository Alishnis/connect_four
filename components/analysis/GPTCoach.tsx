"use client";
import { useEffect, useState } from "react";
import GlowCard from "@/components/vaporwave/GlowCard";
import SkewButton from "@/components/vaporwave/SkewButton";
import CoachPanel from "@/components/analysis/CoachPanel";
import ScoreChart from "@/components/analysis/ScoreChart";
import { analyzeGame, type CoachReport } from "@/lib/game/coach";

export default function GPTCoach() {
  const [moveSequence, setMoveSequence] = useState<number[] | null>(null);
  const [winnerId, setWinnerId] = useState<1 | 2 | null>(null);
  const [playerNames, setPlayerNames] = useState<[string, string]>(["Player 1", "Player 2"]);
  const [report, setReport] = useState<CoachReport | null>(null);

  // GPT deep analysis
  const [gptAnalysis, setGptAnalysis] = useState<string>("");
  const [gptLoading, setGptLoading] = useState(false);
  const [gptDone, setGptDone] = useState(false);

  useEffect(() => {
    const moves = sessionStorage.getItem("lastGameMoves");
    const winner = sessionStorage.getItem("lastGameWinner");
    const players = sessionStorage.getItem("lastGamePlayers");

    let parsedMoves: number[] | null = null;
    if (moves) {
      try { parsedMoves = JSON.parse(moves); } catch {}
    }
    if (winner && winner !== "null") {
      setWinnerId(parseInt(winner) as 1 | 2);
    }
    if (players) {
      try { setPlayerNames(JSON.parse(players)); } catch {}
    }
    if (parsedMoves && parsedMoves.length > 0) {
      setMoveSequence(parsedMoves);
      // Run local analysis immediately — no API needed
      const r = analyzeGame(parsedMoves);
      setReport(r);
    }
  }, []);

  const handleGptAnalyze = async () => {
    if (!moveSequence || gptLoading) return;
    setGptLoading(true);
    setGptAnalysis("");
    try {
      const res = await fetch("/api/coach-gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moveSequence, winnerId, playerNames }),
      });
      const data = await res.json();
      setGptAnalysis(data.analysis ?? "Анализ недоступен.");
      setGptDone(true);
    } catch {
      setGptAnalysis("Не удалось получить GPT анализ.");
      setGptDone(true);
    } finally {
      setGptLoading(false);
    }
  };

  if (!moveSequence || !report) {
    return (
      <GlowCard accentColor="cyan" className="mb-6">
        <p className="font-mono text-xs text-[#E0E0E0]/50">
          Нет данных о партии. Завершите игру, чтобы увидеть анализ.
        </p>
      </GlowCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header info */}
      <GlowCard accentColor="cyan" className="!py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="font-mono text-xs text-[#E0E0E0]/50 uppercase tracking-widest">
            {moveSequence.length} ходов &middot;{" "}
            {winnerId
              ? `${winnerId === 1 ? playerNames[0] : playerNames[1]} победил`
              : "Ничья"}
          </div>
          {!gptDone && (
            <SkewButton
              variant="secondary"
              onClick={handleGptAnalyze}
              disabled={gptLoading}
              className="!px-4 !py-2 !text-xs"
            >
              {gptLoading ? "GPT думает..." : "🤖 GPT углублённый анализ"}
            </SkewButton>
          )}
        </div>
      </GlowCard>

      {/* Score chart */}
      <GlowCard accentColor="cyan">
        <div className="font-mono text-xs uppercase tracking-widest text-[#00FFFF] mb-3">
          Оценка позиции по ходам
        </div>
        <ScoreChart moves={report.moves} />
        <div className="flex justify-between font-mono text-xs text-[#E0E0E0]/40 mt-1">
          <span>Преимущество Игрок 1 ▲</span>
          <span>▼ Преимущество Игрок 2</span>
        </div>
      </GlowCard>

      {/* Local minimax analysis — only user's moves (player 1) */}
      <CoachPanel report={report} playerFilter={1} />

      {/* GPT Deep Analysis (optional) */}
      {gptLoading && (
        <GlowCard accentColor="cyan">
          <div className="font-mono text-xs text-[#10B981] animate-pulse">
            🤖 GPT-4o анализирует партию на русском...
          </div>
        </GlowCard>
      )}
      {gptAnalysis && (
        <GlowCard accentColor="cyan">
          <div className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: "#10B981" }}>
            🤖 GPT-4o Углублённый разбор
          </div>
          <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-[#E0E0E0]">
            {gptAnalysis}
          </div>
        </GlowCard>
      )}
    </div>
  );
}
