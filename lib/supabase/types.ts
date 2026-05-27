export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  is_pro: boolean;
  skin_id: string;
  created_at: string;
}

export interface Match {
  id: string;
  room_id: string | null;
  player_red_id: string | null;
  player_yellow_id: string | null;
  winner_id: string | null;
  is_vs_ai: boolean;
  ai_difficulty: "easy" | "medium" | "hard" | null;
  move_sequence: number[];
  total_moves: number | null;
  duration_secs: number | null;
  created_at: string;
}

export interface Move {
  id: number;
  match_id: string;
  move_number: number;
  player_id: string | null;
  column_idx: number;
  eval_score: number | null;
  is_blunder: boolean;
  best_col: number | null;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  wins: number;
  losses: number;
  draws: number;
  total_games: number;
  win_rate: number | null;
}
