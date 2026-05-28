"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import GlowCard from "@/components/vaporwave/GlowCard";
import SkewButton from "@/components/vaporwave/SkewButton";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function RankedCard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <GlowCard accentColor="cyan" className="text-center hover:-translate-y-1 transition-transform">
      <div className="text-4xl mb-4">🏆</div>
      <h2 className="font-heading font-bold text-xl mb-2" style={{ color: "#00FFFF", fontFamily: "Orbitron, sans-serif" }}>{t("play.ranked")}</h2>
      <p className="font-mono text-sm text-[#E0E0E0]/60 mb-2">{t("play.ranked.desc")}</p>
      <p className="font-mono text-xs text-[#FF9900]/60 mb-4">⚡ ELO</p>
      <Link href={user ? "/play/ranked" : "/login?redirect=/play/ranked"}>
        <SkewButton variant="secondary" className="w-full justify-center">{t("play.findMatch")}</SkewButton>
      </Link>
      {!user && (
        <p className="font-mono text-xs text-[#FF9900]/80 mt-2">{t("play.loginRequired")}</p>
      )}
    </GlowCard>
  );
}
