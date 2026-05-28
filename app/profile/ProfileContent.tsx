"use client";
import PerspectiveGrid from "@/components/vaporwave/PerspectiveGrid";
import GlowCard from "@/components/vaporwave/GlowCard";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface MatchData {
  id: string;
  created_at: string;
  is_vs_ai: boolean;
  ai_difficulty: string | null;
  room_id: string | null;
  total_moves: number | null;
  winner_id: string | null;
}

interface Props {
  username: string;
  email: string;
  cityDisplay: string;
  isPro: boolean;
  wins: number;
  losses: number;
  total: number;
  matches: MatchData[];
  userId: string;
}

export default function ProfileContent({ username, email, cityDisplay, isPro, wins, losses, total, matches, userId }: Props) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen relative pt-24 pb-16">
      <PerspectiveGrid />
      <div className="relative z-10 max-w-3xl mx-auto px-4">
        {/* Profile header */}
        <GlowCard accentColor="magenta" className="mb-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-heading font-black"
              style={{ background: "linear-gradient(135deg, #FF00FF, #00FFFF)", fontFamily: "Orbitron, sans-serif" }}>
              {username?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <h1 className="font-heading font-black text-3xl" style={{ color: "#FF00FF", fontFamily: "Orbitron, sans-serif" }}>
                {username ?? email}
              </h1>
              <div className="font-mono text-sm text-[#E0E0E0]/50">
                {cityDisplay} · {isPro ? "⚡ PRO" : t("profile.free")}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6" style={{ borderTop: "1px solid #2D1B4E" }}>
            {[
              { label: t("profile.wins"), value: wins, color: "#00FFFF" },
              { label: t("profile.losses"), value: losses, color: "#FF2D78" },
              { label: t("profile.total"), value: total, color: "#FF9900" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="font-heading font-black text-3xl" style={{ color: s.color, fontFamily: "Orbitron, sans-serif" }}>
                  {s.value}
                </div>
                <div className="font-mono text-xs uppercase tracking-widest text-[#E0E0E0]/50">{s.label}</div>
              </div>
            ))}
          </div>
        </GlowCard>

        {/* Match history */}
        <GlowCard accentColor="cyan" className="!p-0 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3" style={{ background: "rgba(0,255,255,0.05)", borderBottom: "1px solid rgba(0,255,255,0.2)" }}>
            <div className="w-3 h-3 rounded-full bg-[#FF00FF]" />
            <div className="w-3 h-3 rounded-full bg-[#00FFFF]" />
            <div className="w-3 h-3 rounded-full bg-[#FF9900]" />
            <span className="font-mono text-xs text-[#00FFFF]/60 ml-2 uppercase tracking-widest">match_history.log</span>
          </div>

          {!matches?.length ? (
            <div className="p-12 text-center font-mono text-[#E0E0E0]/40 uppercase tracking-widest">
              {t("profile.noMatches")} <Link href="/play" className="text-[#00FFFF] hover:underline">{t("profile.playNow")}</Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #2D1B4E" }}>
                  <th className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest text-left">{t("profile.date")}</th>
                  <th className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest text-left">{t("profile.mode")}</th>
                  <th className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest text-left">{t("profile.result")}</th>
                  <th className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest text-right">{t("profile.moves")}</th>
                </tr>
              </thead>
              <tbody>
                {matches.map(m => {
                  const result = m.winner_id === userId ? t("profile.victory") : m.winner_id ? t("profile.defeat") : t("profile.draw");
                  const resultColor = m.winner_id === userId ? "#00FFFF" : m.winner_id ? "#FF2D78" : "#FF9900";
                  return (
                    <tr key={m.id} style={{ borderBottom: "1px solid #2D1B4E11" }}
                      className="hover:bg-[rgba(0,255,255,0.03)] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/50">
                        {new Date(m.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs uppercase" style={{ color: "#E0E0E0" }}>
                        {m.is_vs_ai ? `vs AI [${m.ai_difficulty}]` : m.room_id ? t("profile.mp") : t("profile.local")}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm font-bold" style={{ color: resultColor }}>
                        {result}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-[#E0E0E0]/50">
                        {m.total_moves ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </GlowCard>
      </div>
    </div>
  );
}
