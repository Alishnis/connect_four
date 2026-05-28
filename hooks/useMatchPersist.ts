"use client";
import { useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface SaveMatchParams {
  playerRedId: string | null;
  playerYellowId: string | null;
  winnerId: string | null;
  isDraw: boolean;
  isVsAi: boolean;
  aiDifficulty?: "easy" | "medium" | "hard";
  moveSequence: number[];
  totalMoves: number;
  durationSecs: number;
  timeControl?: string;
}

export function useMatchPersist() {
  const supabase = createClient();

  const saveMatch = useCallback(async (params: SaveMatchParams): Promise<string | null> => {
    const { data, error } = await supabase.from("matches").insert({
      player_red_id: params.playerRedId,
      player_yellow_id: params.playerYellowId,
      winner_id: params.winnerId,
      is_vs_ai: params.isVsAi,
      ai_difficulty: params.aiDifficulty ?? null,
      move_sequence: params.moveSequence,
      total_moves: params.totalMoves,
      duration_secs: params.durationSecs,
      time_control: params.timeControl ?? "classic",
    }).select("id").single();

    if (error) { console.error("Failed to save match:", error); return null; }
    return data?.id ?? null;
  }, []);

  return { saveMatch };
}
