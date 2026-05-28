"use client";
import Link from "next/link";
import PerspectiveGrid from "@/components/vaporwave/PerspectiveGrid";
import SunOrb from "@/components/vaporwave/SunOrb";
import GlowCard from "@/components/vaporwave/GlowCard";
import SkewButton from "@/components/vaporwave/SkewButton";
import RankedCard from "./RankedCard";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function PlayPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="min-h-screen relative pt-24 pb-16">
      <PerspectiveGrid />
      <SunOrb />
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <h1 className="font-heading font-black text-5xl text-center mb-2 text-gradient" style={{ fontFamily: "Orbitron, sans-serif" }}>
          {t("play.title")}
        </h1>
        <p className="font-mono text-center text-[#E0E0E0]/60 mb-12 uppercase tracking-widest text-sm">
          {t("play.subtitle")}
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <GlowCard accentColor="magenta" className="text-center hover:-translate-y-1 transition-transform">
            <div className="text-4xl mb-4">🤖</div>
            <h2 className="font-heading font-bold text-xl mb-2" style={{ color: "#FF00FF", fontFamily: "Orbitron, sans-serif" }}>{t("play.vsAI")}</h2>
            <p className="font-mono text-sm text-[#E0E0E0]/60 mb-2">{t("play.vsAI.desc")}</p>
            <p className="font-mono text-xs text-[#FF9900]/60 mb-4">{t("play.vsAI.extra")}</p>
            <Link href="/play/ai">
              <SkewButton variant="primary" className="w-full justify-center">{t("play.start")}</SkewButton>
            </Link>
          </GlowCard>

          <GlowCard accentColor="cyan" className="text-center hover:-translate-y-1 transition-transform">
            <div className="text-4xl mb-4">🔗</div>
            <h2 className="font-heading font-bold text-xl mb-2" style={{ color: "#00FFFF", fontFamily: "Orbitron, sans-serif" }}>{t("play.vsFriend")}</h2>
            <p className="font-mono text-sm text-[#E0E0E0]/60 mb-2">{t("play.vsFriend.desc")}</p>
            <p className="font-mono text-xs text-[#FF9900]/60 mb-4">{t("play.vsFriend.extra")}</p>
            <Link href={user ? "/play/lobby" : "/login?redirect=/play/lobby"}>
              <SkewButton variant="secondary" className="w-full justify-center">{t("play.create")}</SkewButton>
            </Link>
            {!user && (
              <p className="font-mono text-xs text-[#FF9900]/80 mt-2">{t("play.loginRequired")}</p>
            )}
          </GlowCard>

          <GlowCard accentColor="magenta" className="text-center hover:-translate-y-1 transition-transform">
            <div className="text-4xl mb-4">👥</div>
            <h2 className="font-heading font-bold text-xl mb-2" style={{ color: "#FF9900", fontFamily: "Orbitron, sans-serif" }}>{t("play.local")}</h2>
            <p className="font-mono text-sm text-[#E0E0E0]/60 mb-2">{t("play.local.desc")}</p>
            <p className="font-mono text-xs text-[#FF9900]/60 mb-4">{t("play.local.extra")}</p>
            <Link href="/play/local">
              <SkewButton variant="outline" className="w-full justify-center">{t("play.start")}</SkewButton>
            </Link>
          </GlowCard>

          <RankedCard />
        </div>
      </div>
    </div>
  );
}
