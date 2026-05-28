export interface CoinReward {
  base: number;
  streakBonus: number;
  total: number;
  reason: string;
}

export function calculateReward(params: {
  won: boolean;
  isMultiplayer: boolean;
  winStreak: number;
}): CoinReward {
  const { won, isMultiplayer, winStreak } = params;

  // Base reward for completing any game
  let base = 5;
  let reason = "Завершение игры";

  if (won) {
    if (isMultiplayer) {
      base = 25;
      reason = "Победа в мультиплеере";
    } else {
      base = 10;
      reason = "Победа против ИИ";
    }
  }

  // Win streak bonus: +5 per consecutive win, max +25
  const streakBonus = won ? Math.min(winStreak * 5, 25) : 0;

  return {
    base,
    streakBonus,
    total: base + streakBonus,
    reason,
  };
}
