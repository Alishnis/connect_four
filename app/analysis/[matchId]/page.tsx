import { analyzeGame } from "@/lib/game/coach";
import GPTGameContent from "./GPTGameContent";
import AnalysisContent from "./AnalysisContent";

interface Props {
  params: Promise<{ matchId: string }>;
}

// Fallback: demo analysis if Supabase not configured or match not found
const DEMO_SEQUENCE = [3,3,4,2,3,4,3,4,4,5,2,1,2,2,5,0,1,2];

export default async function AnalysisPage({ params }: Props) {
  const { matchId } = await params;

  // GPT game analysis — client-side via sessionStorage
  if (matchId === "gpt-game") {
    return <GPTGameContent />;
  }

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

  return <AnalysisContent report={report} isDemo={isDemo} matchId={matchId} />;
}
