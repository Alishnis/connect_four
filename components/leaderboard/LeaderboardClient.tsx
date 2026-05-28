"use client";

import { useState } from "react";
import GlowCard from "@/components/vaporwave/GlowCard";
import { countryToFlag } from "@/lib/geo/countryFlag";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useTheme } from "@/lib/theme";
import type { LeaderboardEntry } from "@/lib/supabase/types";

export type LeaderboardRow = LeaderboardEntry & { rank: number };

type Tab = "global" | "city";
type SortKey = "elo" | "wins" | "winRate" | "games";

interface Props {
  data: LeaderboardRow[];
}

export default function LeaderboardClient({ data }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("global");
  const [sortBy, setSortBy] = useState<SortKey>("elo");
  const { profile } = useAuth();
  const { theme } = useTheme();
  const light = theme === "light";
  const { t } = useLanguage();

  const userCity = profile?.city ?? null;

  const cityFiltered =
    activeTab === "city" && userCity
      ? data.filter((p) => p.city?.toLowerCase() === userCity.toLowerCase())
      : data;

  const filtered = [...cityFiltered].sort((a, b) => {
    switch (sortBy) {
      case "elo": return (b.elo_rating ?? 1000) - (a.elo_rating ?? 1000);
      case "wins": return b.wins - a.wins;
      case "winRate": return (b.win_rate ?? 0) - (a.win_rate ?? 0);
      case "games": return (b.total_games ?? 0) - (a.total_games ?? 0);
    }
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: "global", label: t("lb.global") },
    { key: "city", label: t("lb.myCity") },
  ];

  const rankColors: Record<number, string> = { 1: "#FF9900", 2: "#E0E0E0", 3: "#FF9900" };

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-2 justify-center mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-6 py-2 font-mono text-sm uppercase tracking-widest transition-all cursor-pointer"
            style={activeTab === tab.key
              ? { border: `2px solid ${light ? "#007088" : "#00FFFF"}`, background: light ? "rgba(0,112,136,0.1)" : "rgba(0,255,255,0.1)", color: light ? "#007088" : "#00FFFF" }
              : { border: `2px solid ${light ? "rgba(80,50,140,0.25)" : "#2D1B4E"}`, background: light ? "rgba(80,50,140,0.05)" : "transparent", color: light ? "#4A2080" : "#E0E0E0" }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sort buttons */}
      <div className="flex gap-2 justify-center mb-8 flex-wrap">
        <span className="font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest self-center mr-1">{t("lb.sortBy")}:</span>
        {([
          { key: "elo" as SortKey, label: "ELO" },
          { key: "wins" as SortKey, label: t("lb.wins") },
          { key: "winRate" as SortKey, label: "Win%" },
          { key: "games" as SortKey, label: t("lb.games") },
        ]).map((s) => (
          <button
            key={s.key}
            onClick={() => setSortBy(s.key)}
            className="px-3 py-1 font-mono text-xs uppercase tracking-widest transition-all cursor-pointer"
            style={sortBy === s.key
              ? { border: `1px solid ${light ? "#CC7700" : "#FF9900"}`, background: light ? "rgba(204,119,0,0.1)" : "rgba(255,153,0,0.15)", color: light ? "#CC7700" : "#FF9900" }
              : { border: `1px solid ${light ? "rgba(80,50,140,0.25)" : "#2D1B4E"}`, background: light ? "rgba(80,50,140,0.05)" : "transparent", color: light ? "#4A2080" : "#E0E0E0" }
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      <GlowCard accentColor="cyan" className="!p-0 overflow-hidden">
        {/* Terminal chrome */}
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{
            background: "rgba(0,255,255,0.05)",
            borderBottom: "1px solid rgba(0,255,255,0.2)",
          }}
        >
          <div className="w-3 h-3 rounded-full bg-[#FF00FF]" />
          <div className="w-3 h-3 rounded-full bg-[#00FFFF]" />
          <div className="w-3 h-3 rounded-full bg-[#FF9900]" />
          <span className="font-mono text-xs text-[#00FFFF]/60 ml-2 uppercase tracking-widest">
            {activeTab === "city" && userCity
              ? `${userCity.toLowerCase()}_rankings.db`
              : "global_rankings.db"}
          </span>
        </div>

        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="p-12 text-center font-mono text-[#E0E0E0]/40 uppercase tracking-widest">
              {t("lb.noData")}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #2D1B4E" }}>
                  <th className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest text-left">
                    #
                  </th>
                  <th className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest text-left">
                    {t("lb.player")}
                  </th>
                  <th className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest text-right">
                    ELO
                  </th>
                  <th className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest text-left hidden sm:table-cell">
                    {t("lb.city")}
                  </th>
                  <th className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest text-right">
                    {t("lb.wins")}
                  </th>
                  <th className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest text-right hidden sm:table-cell">
                    {t("lb.wl")}
                  </th>
                  <th className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest text-right">
                    {t("lb.winRate")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => {
                  const displayRank = activeTab === "city" ? idx + 1 : p.rank;
                  return (
                    <tr
                      key={p.id}
                      style={{ borderBottom: "1px solid #2D1B4E11" }}
                      className="hover:bg-[rgba(0,255,255,0.03)] transition-colors"
                    >
                      <td className="px-4 py-4">
                        <span
                          className="font-heading font-black text-lg"
                          style={{
                            color: rankColors[displayRank] ?? "#E0E0E0",
                            fontFamily: "Orbitron, sans-serif",
                          }}
                        >
                          {displayRank.toString().padStart(2, "0")}
                        </span>
                      </td>
                      <td
                        className="px-4 py-4 font-mono text-sm"
                        style={{ color: displayRank <= 3 ? "#FF00FF" : "#E0E0E0" }}
                      >
                        {p.username}
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-sm font-bold" style={{
                        color: (p.elo_rating ?? 1000) >= 1300 ? "#10B981" : (p.elo_rating ?? 1000) >= 1000 ? "#E0E0E0" : "#FF2D78",
                      }}>
                        {p.elo_rating ?? 1000}
                      </td>
                      <td className="px-4 py-4 hidden sm:table-cell">
                        <span className="font-mono text-sm text-[#E0E0E0]/60">
                          {countryToFlag(p.country)} {p.city ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-sm" style={{ color: "#00FFFF" }}>
                        {p.wins}
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-sm text-[#E0E0E0]/50 hidden sm:table-cell">
                        {p.wins}/{p.losses ?? 0}
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-sm text-[#FF9900]">
                        {p.win_rate != null ? `${p.win_rate}%` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </GlowCard>
    </>
  );
}
