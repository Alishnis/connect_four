import { notFound } from "next/navigation";
import PerspectiveGrid from "@/components/vaporwave/PerspectiveGrid";
import GlowCard from "@/components/vaporwave/GlowCard";
import CoachPanel from "@/components/analysis/CoachPanel";
import ScoreChart from "@/components/analysis/ScoreChart";
import { analyzeGame } from "@/lib/game/coach";
import Link from "next/link";

interface Props {
  params: Promise<{ matchId: string }>;
}

// Fallback: demo analysis if Supabase not configured or match not found
const DEMO_SEQUENCE = [3,3,4,2,3,4,3,4,4,5,2,1,2,2,5,0,1,2];

export default async function AnalysisPage({ params }: Props) {
  const { matchId } = await params;
  let moveSequence: number[] = DEMO_SEQUENCE;
  let isDemo = true;

  // Try to fetch from Supabase if env vars set
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR_PROJECT")) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const { data } = await supabase.from("matches").select("move_sequence").eq("id", matchId).single();
      if (data?.move_sequence?.length) {
        moveSequence = data.move_sequence;
        isDemo = false;
      }
    } catch {
      // Supabase not configured — show demo
    }
  }

  const report = analyzeGame(moveSequence);

  return (
    <div className="min-h-screen relative pt-24 pb-16">
      <PerspectiveGrid />
      <div className="relative z-10 max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div>
            <h1 className="font-heading font-black text-4xl text-glow-magenta" style={{ color: "#FF00FF", fontFamily: "Orbitron, sans-serif" }}>
              AI COACH
            </h1>
            <p className="font-mono text-xs text-[#E0E0E0]/50 uppercase tracking-widest">
              {isDemo ? "Demo analysis" : `Match ${matchId.slice(0, 8)}...`}
            </p>
          </div>
          <Link href="/play" className="font-mono text-sm text-[#00FFFF] hover:underline uppercase tracking-wider">
            &larr; New Game
          </Link>
        </div>

        {isDemo && (
          <GlowCard accentColor="cyan" className="mb-6">
            <p className="font-mono text-xs text-[#FF9900]">
              ⚡ Demo mode — configure Supabase to analyze your real games.
            </p>
          </GlowCard>
        )}

        {/* Score chart */}
        <GlowCard accentColor="cyan" className="mb-6">
          <div className="font-mono text-xs uppercase tracking-widest text-[#00FFFF] mb-3">Evaluation Over Time</div>
          <ScoreChart moves={report.moves} />
          <div className="flex justify-between font-mono text-xs text-[#E0E0E0]/40 mt-1">
            <span>Player 1 advantage ▲</span>
            <span>▼ Player 2 advantage</span>
          </div>
        </GlowCard>

        <CoachPanel report={report} />
      </div>
    </div>
  );
}
