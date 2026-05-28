import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import PerspectiveGrid from "@/components/vaporwave/PerspectiveGrid";
import GlowCard from "@/components/vaporwave/GlowCard";
import Link from "next/link";
import { countryToFlag } from "@/lib/geo/countryFlag";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/profile");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .or(`player_red_id.eq.${user.id},player_yellow_id.eq.${user.id}`)
    .order("created_at", { ascending: false })
    .limit(20);

  const wins = matches?.filter(m => m.winner_id === user.id).length ?? 0;
  const total = matches?.length ?? 0;
  const losses = matches?.filter(m => m.winner_id && m.winner_id !== user.id).length ?? 0;

  const cityDisplay = profile?.city
    ? `${countryToFlag(profile.country)} ${profile.city}`
    : "🌐 Global";

  return (
    <div className="min-h-screen relative pt-24 pb-16">
      <PerspectiveGrid />
      <div className="relative z-10 max-w-3xl mx-auto px-4">
        {/* Profile header */}
        <GlowCard accentColor="magenta" className="mb-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-heading font-black"
              style={{ background: "linear-gradient(135deg, #FF00FF, #00FFFF)", fontFamily: "Orbitron, sans-serif" }}>
              {profile?.username?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div>
              <h1 className="font-heading font-black text-3xl" style={{ color: "#FF00FF", fontFamily: "Orbitron, sans-serif" }}>
                {profile?.username ?? user.email}
              </h1>
              <div className="font-mono text-sm text-[#E0E0E0]/50">
                {cityDisplay} · {profile?.is_pro ? "⚡ PRO" : "Бесплатный"}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6" style={{ borderTop: "1px solid #2D1B4E" }}>
            {[
              { label: "Победы", value: wins, color: "#00FFFF" },
              { label: "Поражения", value: losses, color: "#FF2D78" },
              { label: "Всего", value: total, color: "#FF9900" },
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
              Нет матчей. <Link href="/play" className="text-[#00FFFF] hover:underline">Играть →</Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid #2D1B4E" }}>
                  <th className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest text-left">Дата</th>
                  <th className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest text-left">Режим</th>
                  <th className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest text-left">Результат</th>
                  <th className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/40 uppercase tracking-widest text-right">Ходы</th>
                </tr>
              </thead>
              <tbody>
                {matches.map(m => {
                  const result = m.winner_id === user.id ? "ПОБЕДА" : m.winner_id ? "ПОРАЖЕНИЕ" : "НИЧЬЯ";
                  const resultColor = result === "ПОБЕДА" ? "#00FFFF" : result === "ПОРАЖЕНИЕ" ? "#FF2D78" : "#FF9900";
                  return (
                    <tr key={m.id} style={{ borderBottom: "1px solid #2D1B4E11" }}
                      className="hover:bg-[rgba(0,255,255,0.03)] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[#E0E0E0]/50">
                        {new Date(m.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs uppercase" style={{ color: "#E0E0E0" }}>
                        {m.is_vs_ai ? `vs AI [${m.ai_difficulty}]` : m.room_id ? "Мультиплеер" : "Локальная"}
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
