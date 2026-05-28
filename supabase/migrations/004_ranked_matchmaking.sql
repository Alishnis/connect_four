ALTER TABLE profiles ADD COLUMN IF NOT EXISTS elo_rating INT DEFAULT 1000;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS is_ranked BOOLEAN DEFAULT FALSE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS elo_change_red INT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS elo_change_yellow INT;

CREATE TABLE IF NOT EXISTS matchmaking_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  elo_rating INT NOT NULL DEFAULT 1000,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE matchmaking_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Queue viewable by authenticated" ON matchmaking_queue FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can join queue" ON matchmaking_queue FOR INSERT WITH CHECK (auth.uid() = player_id);
CREATE POLICY "Users can leave queue" ON matchmaking_queue FOR DELETE USING (auth.uid() = player_id);

CREATE OR REPLACE VIEW leaderboard_view AS
SELECT
  p.id, p.username, p.avatar_url, p.city, p.country, p.elo_rating,
  COUNT(CASE WHEN m.winner_id = p.id THEN 1 END)::INT AS wins,
  COUNT(CASE WHEN (m.player_red_id = p.id OR m.player_yellow_id = p.id) AND m.winner_id IS NOT NULL AND m.winner_id != p.id THEN 1 END)::INT AS losses,
  COUNT(CASE WHEN (m.player_red_id = p.id OR m.player_yellow_id = p.id) AND m.winner_id IS NULL AND m.status = 'finished' THEN 1 END)::INT AS draws,
  COUNT(CASE WHEN m.player_red_id = p.id OR m.player_yellow_id = p.id THEN 1 END)::INT AS total_games,
  ROUND(
    COUNT(CASE WHEN m.winner_id = p.id THEN 1 END)::NUMERIC /
    NULLIF(COUNT(CASE WHEN m.player_red_id = p.id OR m.player_yellow_id = p.id THEN 1 END), 0) * 100, 1
  ) AS win_rate
FROM profiles p
LEFT JOIN matches m ON m.player_red_id = p.id OR m.player_yellow_id = p.id
GROUP BY p.id, p.username, p.avatar_url, p.city, p.country, p.elo_rating;
