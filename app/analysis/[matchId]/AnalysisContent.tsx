"use client";
import Link from "next/link";
import PerspectiveGrid from "@/components/vaporwave/PerspectiveGrid";
import GlowCard from "@/components/vaporwave/GlowCard";
import CoachPanel from "@/components/analysis/CoachPanel";
import ScoreChart from "@/components/analysis/ScoreChart";
import type { CoachReport } from "@/lib/game/coach";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Props {
  report: CoachReport;
  isDemo: boolean;
  matchId: string;
}

export default function AnalysisContent({ report, isDemo, matchId }: Props) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen relative pt-24 pb-16">
      <PerspectiveGrid />
      <div className="relative z-10 max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <h1 className="font-heading font-black text-4xl text-glow-magenta" style={{ color: "#FF00FF", fontFamily: "Orbitron, sans-serif" }}>
              AI COACH
            </h1>
            <p className="font-mono text-xs text-[#E0E0E0]/50 uppercase tracking-widest">
              {isDemo ? t("analysis.demoAnalysis") : `${t("analysis.matchPrefix")} ${matchId.slice(0, 8)}...`}
            </p>
          </div>
          <Link href="/play" className="font-mono text-sm text-[#00FFFF] hover:underline uppercase tracking-wider">
            &larr; {t("analysis.newGame")}
          </Link>
        </div>

        {isDemo && (
          <GlowCard accentColor="cyan" className="mb-6">
            <p className="font-mono text-xs text-[#FF9900]">
              {t("analysis.demo")}
            </p>
          </GlowCard>
        )}

        {/* Score chart */}
        <GlowCard accentColor="cyan" className="mb-6">
          <div className="font-mono text-xs uppercase tracking-widest text-[#00FFFF] mb-3">{t("analysis.evalTitle")}</div>
          <ScoreChart moves={report.moves} />
          <div className="flex justify-between font-mono text-xs text-[#E0E0E0]/40 mt-1">
            <span>{t("analysis.p1adv")} ▲</span>
            <span>▼ {t("analysis.p2adv")}</span>
          </div>
        </GlowCard>

        <CoachPanel report={report} />
      </div>
    </div>
  );
}
