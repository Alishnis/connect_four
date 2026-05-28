"use client";
import { useEffect, useState } from "react";
import GlowCard from "@/components/vaporwave/GlowCard";
import SkewButton from "@/components/vaporwave/SkewButton";
import CoachPanel from "@/components/analysis/CoachPanel";
import ScoreChart from "@/components/analysis/ScoreChart";
import { analyzeGame, type CoachReport } from "@/lib/game/coach";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function GPTCoach() {
  const [moveSequence, setMoveSequence] = useState<number[] | null>(null);
  const [winnerId, setWinnerId] = useState<1 | 2 | null>(null);
  const [playerNames, setPlayerNames] = useState<[string, string]>(["Player 1", "Player 2"]);
  const [report, setReport] = useState<CoachReport | null>(null);
  const { t, locale } = useLanguage();

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
        body: JSON.stringify({ moveSequence, winnerId, playerNames, locale }),
      });
      const data = await res.json();
      setGptAnalysis(data.analysis ?? t("gpt.unavailable"));
      setGptDone(true);
    } catch {
      setGptAnalysis(t("gpt.analysisFailed"));
      setGptDone(true);
    } finally {
      setGptLoading(false);
    }
  };

  if (!moveSequence || !report) {
    return (
      <GlowCard accentColor="cyan" className="mb-6">
        <p className="font-mono text-xs text-[#E0E0E0]/50">
          {t("gpt.noData")}
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
            {t("gpt.movesPlayed", { n: moveSequence.length })} &middot;{" "}
            {winnerId
              ? t("gpt.won", { name: winnerId === 1 ? playerNames[0] : playerNames[1] })
              : t("gpt.drawResult")}
          </div>
          {!gptDone && (
            <SkewButton
              variant="secondary"
              onClick={handleGptAnalyze}
              disabled={gptLoading}
              className="!px-4 !py-2 !text-xs"
            >
              {gptLoading ? t("gpt.thinking") : `🤖 ${t("gpt.title")}`}
            </SkewButton>
          )}
        </div>
      </GlowCard>

      {/* Score chart */}
      <GlowCard accentColor="cyan">
        <div className="font-mono text-xs uppercase tracking-widest text-[#00FFFF] mb-3">
          {t("analysis.evalByMoves")}
        </div>
        <ScoreChart moves={report.moves} />
        <div className="flex justify-between font-mono text-xs text-[#E0E0E0]/40 mt-1">
          <span>{t("analysis.p1adv")} ▲</span>
          <span>▼ {t("analysis.p2adv")}</span>
        </div>
      </GlowCard>

      {/* Local minimax analysis — only user's moves (player 1) */}
      <CoachPanel report={report} playerFilter={1} />

      {/* GPT Deep Analysis (optional) */}
      {gptLoading && (
        <GlowCard accentColor="cyan">
          <div className="font-mono text-xs text-[#10B981] animate-pulse">
            {t("gpt.analyzing")}
          </div>
        </GlowCard>
      )}
      {gptAnalysis && (
        <GlowCard accentColor="cyan">
          <div className="font-mono text-xs uppercase tracking-widest mb-3" style={{ color: "#10B981" }}>
            {t("gpt.deepAnalysis")}
          </div>
          <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-[#E0E0E0]">
            {gptAnalysis}
          </div>
        </GlowCard>
      )}
    </div>
  );
}
