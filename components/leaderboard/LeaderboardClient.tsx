"use client";

import { useState } from "react";
import GlowCard from "@/components/vaporwave/GlowCard";
import { countryToFlag } from "@/lib/geo/countryFlag";
import { useAuth } from "@/hooks/useAuth";
import type { LeaderboardEntry } from "@/lib/supabase/types";

export type LeaderboardRow = LeaderboardEntry & { rank: number };

type Tab = "global" | "city";

interface Props {
  data: LeaderboardRow[];
}

export default function LeaderboardClient({ data }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("global");
  const { profile } = useAuth();

  const userCity = profile?.city ?? null;

  const filtered =
    activeTab === "city" && userCity
      ? data.filter((p) => p.city?.toLowerCase() === userCity.toLowerCase())
      : data;

  const tabs: { key: Tab; label: string }[] = [
    { key: "global", label: "Глобальный" },
    { key: "city", label: "Мой город" },
  ];

  const rankColors: Record<number, string> = { 1: "#FF9900", 2: "#E0E0E0", 3: "#FF9900" };

  return (
    <>
      {/* Filter tabs */}
      <div className="flex gap-2 justify-center mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-6 py-2 font-mono text-sm uppercase tracking-widest transition-all cursor-pointer"
            style={{
              border: `2px solid ${activeTab === tab.key ? "#00FFFF" : "#2D1B4E"}`,
              background: activeTab === tab.key ? "rgba(0,255,255,0.1)" : "transparent",
              color: activeTab === tab.key ? "#00FFFF" : "#E0E0E0",
            }}
          >
            {tab.label}
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
              Нет данных для твоего города
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #2D1B4E" }}>
                  <th className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest text-left">
                    #
                  </th>
                  <th className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest text-left">
                    Игрок
                  </th>
                  <th className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest text-left">
                    Город
                  </th>
                  <th className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest text-right">
                    Победы
                  </th>
                  <th className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest text-right hidden sm:table-cell">
                    П/П
                  </th>
                  <th className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest text-right">
                    %Побед
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
                      <td className="px-4 py-4">
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
