-- Fix: allow anonymous match creation for multiplayer without login
DROP POLICY IF EXISTS "Authenticated users can insert matches" ON matches;
CREATE POLICY "Anyone can insert matches" ON matches FOR INSERT WITH CHECK (true);

-- Fix: allow anonymous match updates (for player_yellow joining)
DROP POLICY IF EXISTS "Players can update own matches" ON matches;
CREATE POLICY "Anyone can update matches" ON matches FOR UPDATE USING (true);

-- Fix: leaderboard_view referenced m.status which doesn't exist
-- Use m.total_moves = 42 for draws detection instead
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT
  p.id, p.username, p.avatar_url, p.city, p.country, p.elo_rating,
  COUNT(CASE WHEN m.winner_id = p.id THEN 1 END)::INT AS wins,
  COUNT(CASE WHEN (m.player_red_id = p.id OR m.player_yellow_id = p.id) AND m.winner_id IS NOT NULL AND m.winner_id != p.id THEN 1 END)::INT AS losses,
  COUNT(CASE WHEN (m.player_red_id = p.id OR m.player_yellow_id = p.id) AND m.winner_id IS NULL AND m.total_moves = 42 THEN 1 END)::INT AS draws,
  COUNT(CASE WHEN m.player_red_id = p.id OR m.player_yellow_id = p.id THEN 1 END)::INT AS total_games,
  ROUND(
    COUNT(CASE WHEN m.winner_id = p.id THEN 1 END)::NUMERIC /
    NULLIF(COUNT(CASE WHEN m.player_red_id = p.id OR m.player_yellow_id = p.id THEN 1 END), 0) * 100, 1
  ) AS win_rate
FROM profiles p
LEFT JOIN matches m ON m.player_red_id = p.id OR m.player_yellow_id = p.id
GROUP BY p.id, p.username, p.avatar_url, p.city, p.country, p.elo_rating;

-- Enable Realtime on matches for broadcast channels
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
