import PerspectiveGrid from "@/components/vaporwave/PerspectiveGrid";
import LeaderboardClient from "@/components/leaderboard/LeaderboardClient";
import type { LeaderboardRow } from "@/components/leaderboard/LeaderboardClient";
import type { LeaderboardEntry } from "@/lib/supabase/types";

const MOCK_DATA: LeaderboardRow[] = [
  { id: "1", rank: 1, username: "GRIDLORD_99", city: "Almaty", country: "KZ", wins: 247, losses: 70, draws: 5, total_games: 322, win_rate: 76.7, avatar_url: null },
  { id: "2", rank: 2, username: "NEON_HUNTER", city: "Tokyo", country: "JP", wins: 231, losses: 80, draws: 3, total_games: 314, win_rate: 73.6, avatar_url: null },
  { id: "3", rank: 3, username: "CYBER_QUEEN", city: "Seoul", country: "KR", wins: 198, losses: 82, draws: 8, total_games: 288, win_rate: 68.8, avatar_url: null },
  { id: "4", rank: 4, username: "DROP_MASTER", city: "Berlin", country: "DE", wins: 185, losses: 85, draws: 2, total_games: 272, win_rate: 68.0, avatar_url: null },
  { id: "5", rank: 5, username: "VOID_WALKER", city: "Almaty", country: "KZ", wins: 172, losses: 84, draws: 6, total_games: 262, win_rate: 65.6, avatar_url: null },
  { id: "6", rank: 6, username: "PIXEL_STORM", city: "New York", country: "US", wins: 165, losses: 90, draws: 4, total_games: 259, win_rate: 63.7, avatar_url: null },
  { id: "7", rank: 7, username: "RETRO_FORGE", city: "London", country: "GB", wins: 154, losses: 92, draws: 7, total_games: 253, win_rate: 60.9, avatar_url: null },
  { id: "8", rank: 8, username: "DISC_PHANTOM", city: "Istanbul", country: "TR", wins: 148, losses: 95, draws: 3, total_games: 246, win_rate: 60.2, avatar_url: null },
  { id: "9", rank: 9, username: "SYNTH_WAVE", city: "Paris", country: "FR", wins: 140, losses: 98, draws: 5, total_games: 243, win_rate: 57.6, avatar_url: null },
  { id: "10", rank: 10, username: "GRID_GHOST", city: "Dubai", country: "AE", wins: 133, losses: 100, draws: 2, total_games: 235, win_rate: 56.6, avatar_url: null },
];

async function getLeaderboard(): Promise<LeaderboardRow[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT")) {
    return MOCK_DATA;
  }
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase.from("leaderboard_view").select("*").limit(20);
    if (data?.length) {
      return data.map((d: LeaderboardEntry, i: number) => ({ ...d, rank: i + 1 }));
    }
  } catch {
    // Supabase not configured — fall through to mock data
  }
  return MOCK_DATA;
}

export default async function LeaderboardPage() {
  const data = await getLeaderboard();

  return (
    <div className="min-h-screen relative pt-24 pb-16">
      <PerspectiveGrid />
      <div className="relative z-10 max-w-3xl mx-auto px-4">
        <h1 className="font-heading font-black text-5xl text-center mb-2 text-glow-cyan" style={{ color: "#00FFFF", fontFamily: "Orbitron, sans-serif" }}>
          LEADERBOARD
        </h1>
        <p className="font-mono text-center text-[#E0E0E0]/50 mb-12 uppercase tracking-widest text-sm">
          Глобальный рейтинг · Обновляется в реальном времени
        </p>

        <LeaderboardClient data={data} />
      </div>
    </div>
  );
}
