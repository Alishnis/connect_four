"use client";
import { useState, useCallback, useRef } from "react";
import { calculateReward, type CoinReward } from "@/lib/coins/rewards";
import { addLocalCoins } from "@/lib/skins/localStore";
import { createClient } from "@/lib/supabase/client";

interface UseCoinRewardParams {
  won: boolean;
  isMultiplayer: boolean;
  userId?: string | null;
}

export function useCoinReward() {
  const [reward, setReward] = useState<CoinReward | null>(null);
  const [awarding, setAwarding] = useState(false);
  const awardedRef = useRef(false);

  const awardCoins = useCallback(
    async ({ won, isMultiplayer, userId }: UseCoinRewardParams) => {
      // Prevent double-awarding
      if (awardedRef.current) return;
      awardedRef.current = true;

      setAwarding(true);

      // Get win streak from localStorage
      const streakKey = "neongrid_win_streak";
      let winStreak = 0;
      if (typeof window !== "undefined") {
        winStreak = parseInt(localStorage.getItem(streakKey) ?? "0", 10);
        if (won) {
          winStreak += 1;
          localStorage.setItem(streakKey, String(winStreak));
        } else {
          localStorage.setItem(streakKey, "0");
        }
      }

      const coinReward = calculateReward({ won, isMultiplayer, winStreak: won ? winStreak - 1 : 0 });
      setReward(coinReward);

      // Try Supabase first, fallback to localStorage
      if (userId) {
        try {
          const supabase = createClient();
          // Use raw SQL increment via RPC or a direct update
          const { data: profile } = await supabase
            .from("profiles")
            .select("coins")
            .eq("id", userId)
            .single();

          if (profile) {
            await supabase
              .from("profiles")
              .update({ coins: (profile.coins ?? 0) + coinReward.total })
              .eq("id", userId);
          }
        } catch {
          // Fallback to localStorage if Supabase fails
          addLocalCoins(coinReward.total);
        }
      } else {
        addLocalCoins(coinReward.total);
      }

      setAwarding(false);
    },
    []
  );

  const resetReward = useCallback(() => {
    setReward(null);
    awardedRef.current = false;
  }, []);

  return { reward, awarding, awardCoins, resetReward };
}
