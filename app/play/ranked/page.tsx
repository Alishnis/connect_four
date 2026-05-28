"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useMatchmaking } from "@/hooks/useMatchmaking";
import PerspectiveGrid from "@/components/vaporwave/PerspectiveGrid";
import SunOrb from "@/components/vaporwave/SunOrb";
import GlowCard from "@/components/vaporwave/GlowCard";
import SkewButton from "@/components/vaporwave/SkewButton";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function RankedContent() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const elo = profile?.elo_rating ?? 1000;
  const { t } = useLanguage();

  const { status, searchTime, error, eloRange, joinQueue, leaveQueue } = useMatchmaking(
    user?.id,
    elo
  );

  if (loading) {
    return (
      <div className="min-h-screen relative pt-24 pb-16">
        <PerspectiveGrid />
        <SunOrb />
        <div className="relative z-10 flex items-center justify-center min-h-[60vh]">
          <div className="font-mono text-[#E0E0E0]/60 animate-pulse uppercase tracking-widest">
            {t("ranked.loading")}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen relative pt-24 pb-16">
        <PerspectiveGrid />
        <SunOrb />
        <div className="relative z-10 max-w-md mx-auto px-4 flex flex-col items-center justify-center min-h-[60vh]">
          <GlowCard accentColor="magenta" className="text-center w-full">
            <div className="text-5xl mb-4">🔒</div>
            <h1
              className="font-heading font-black text-3xl mb-4"
              style={{ color: "#FF00FF", fontFamily: "Orbitron, sans-serif" }}
            >
              {t("ranked.loginRequired")}
            </h1>
            <p className="font-mono text-sm text-[#E0E0E0]/60 mb-6">
              {t("ranked.loginDesc")}
            </p>
            <Link href="/login">
              <SkewButton variant="primary" className="w-full justify-center">
                {t("nav.login")}
              </SkewButton>
            </Link>
          </GlowCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pt-24 pb-16">
      <PerspectiveGrid />
      <SunOrb />
      <div className="relative z-10 max-w-md mx-auto px-4">
        <h1
          className="font-heading font-black text-5xl text-center mb-2 text-gradient"
          style={{ fontFamily: "Orbitron, sans-serif" }}
        >
          {t("ranked.title")}
        </h1>
        <p className="font-mono text-center text-[#E0E0E0]/60 mb-10 uppercase tracking-widest text-sm">
          {t("ranked.subtitle")}
        </p>

        {/* ELO Card */}
        <GlowCard accentColor="cyan" className="text-center mb-6">
          <div className="font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest mb-1">
            {t("ranked.yourRating")}
          </div>
          <div
            className="font-heading font-black text-5xl"
            style={{
              color: "#00FFFF",
              fontFamily: "Orbitron, sans-serif",
              textShadow: "0 0 30px #00FFFF66",
            }}
          >
            {elo}
          </div>
          <div className="font-mono text-xs text-[#E0E0E0]/40 mt-1">ELO</div>
        </GlowCard>

        {/* Search / Queue */}
        {status === "idle" && (
          <GlowCard accentColor="magenta" className="text-center">
            <div className="text-5xl mb-4">🏆</div>
            <p className="font-mono text-sm text-[#E0E0E0]/60 mb-6">
              {t("ranked.queueDesc")}
            </p>
            <SkewButton variant="primary" onClick={joinQueue} className="w-full justify-center">
              {t("ranked.findOpponent")}
            </SkewButton>
          </GlowCard>
        )}

        {status === "searching" && (
          <GlowCard accentColor="magenta" className="text-center">
            {/* Animated searching indicator */}
            <div className="mb-6">
              <div className="relative w-20 h-20 mx-auto">
                <div
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ background: "rgba(255, 0, 255, 0.15)" }}
                />
                <div
                  className="absolute inset-2 rounded-full animate-ping"
                  style={{ background: "rgba(255, 0, 255, 0.2)", animationDelay: "0.3s" }}
                />
                <div
                  className="absolute inset-4 rounded-full animate-ping"
                  style={{ background: "rgba(255, 0, 255, 0.25)", animationDelay: "0.6s" }}
                />
                <div
                  className="absolute inset-0 flex items-center justify-center text-4xl"
                >
                  ⚔️
                </div>
              </div>
            </div>

            <h2
              className="font-heading font-bold text-xl mb-2 animate-pulse"
              style={{ color: "#FF00FF", fontFamily: "Orbitron, sans-serif" }}
            >
              {t("ranked.searching")}
            </h2>

            <div className="font-mono text-sm text-[#E0E0E0]/60 mb-1">
              {t("ranked.searchTime")}:{" "}
              <span style={{ color: "#FF9900" }}>{formatTime(searchTime)}</span>
            </div>

            <div className="font-mono text-xs text-[#E0E0E0]/40 mb-6">
              {t("ranked.eloRange")}: {elo - eloRange} — {elo + eloRange}
            </div>

            <SkewButton variant="outline" onClick={leaveQueue} className="w-full justify-center">
              {t("ranked.cancelSearch")}
            </SkewButton>
          </GlowCard>
        )}

        {status === "found" && (
          <GlowCard accentColor="cyan" className="text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h2
              className="font-heading font-bold text-xl mb-2"
              style={{ color: "#00FFFF", fontFamily: "Orbitron, sans-serif" }}
            >
              {t("ranked.found")}
            </h2>
            <p className="font-mono text-sm text-[#E0E0E0]/60 animate-pulse">
              {t("ranked.connecting")}
            </p>
          </GlowCard>
        )}

        {status === "error" && (
          <GlowCard accentColor="magenta" className="text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2
              className="font-heading font-bold text-xl mb-2"
              style={{ color: "#FF2D78", fontFamily: "Orbitron, sans-serif" }}
            >
              {t("ranked.error")}
            </h2>
            <p className="font-mono text-sm text-[#E0E0E0]/60 mb-4">
              {error ?? t("ranked.errorDesc")}
            </p>
            <SkewButton variant="primary" onClick={joinQueue} className="w-full justify-center">
              {t("ranked.retry")}
            </SkewButton>
          </GlowCard>
        )}

        {/* Back link */}
        <div className="text-center mt-6">
          <Link href="/play" className="font-mono text-xs text-[#E0E0E0]/40 hover:text-[#FF00FF] transition-colors uppercase tracking-widest">
            {t("ranked.back")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RankedPage() {
  return <RankedContent />;
}
