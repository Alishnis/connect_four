"use client";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LeaderboardHeader() {
  const { t } = useLanguage();

  return (
    <>
      <h1 className="font-heading font-black text-5xl text-center mb-2 text-glow-cyan" style={{ color: "#00FFFF", fontFamily: "Orbitron, sans-serif" }}>
        {t("lb.title")}
      </h1>
      <p className="font-mono text-center text-[#E0E0E0]/50 mb-12 uppercase tracking-widest text-sm">
        {t("lb.subtitle")}
      </p>
    </>
  );
}
