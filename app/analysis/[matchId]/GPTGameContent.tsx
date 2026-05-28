"use client";
import Link from "next/link";
import PerspectiveGrid from "@/components/vaporwave/PerspectiveGrid";
import GPTCoach from "@/components/analysis/GPTCoach";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function GPTGameContent() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen relative pt-24 pb-16">
      <PerspectiveGrid />
      <div className="relative z-10 max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <h1 className="font-heading font-black text-4xl" style={{ color: "#10B981", fontFamily: "Orbitron, sans-serif" }}>
              {t("analysis.gptCoach")}
            </h1>
            <p className="font-mono text-xs text-[#E0E0E0]/50 uppercase tracking-widest">
              {t("analysis.title")}
            </p>
          </div>
          <Link href="/play/ai" className="font-mono text-sm text-[#00FFFF] hover:underline uppercase tracking-wider">
            &larr; {t("analysis.newGame")}
          </Link>
        </div>
        <GPTCoach />
      </div>
    </div>
  );
}
