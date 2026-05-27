-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  avatar_url  TEXT,
  city        TEXT,
  country     TEXT,
  is_pro      BOOLEAN DEFAULT FALSE,
  skin_id     TEXT DEFAULT 'classic',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id           TEXT UNIQUE,
  player_red_id     UUID REFERENCES profiles(id),
  player_yellow_id  UUID REFERENCES profiles(id),
  winner_id         UUID REFERENCES profiles(id),
  is_vs_ai          BOOLEAN DEFAULT FALSE,
  ai_difficulty     TEXT CHECK (ai_difficulty IN ('easy','medium','hard')),
  move_sequence     INT[] NOT NULL DEFAULT '{}',
  total_moves       INT,
  duration_secs     INT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Moves table (for AI coach analysis)
CREATE TABLE IF NOT EXISTS moves (
  id          BIGSERIAL PRIMARY KEY,
  match_id    UUID REFERENCES matches(id) ON DELETE CASCADE,
  move_number INT NOT NULL,
  player_id   UUID REFERENCES profiles(id),
  column_idx  INT NOT NULL CHECK (column_idx BETWEEN 0 AND 6),
  eval_score  INT,
  is_blunder  BOOLEAN DEFAULT FALSE,
  best_col    INT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard view
CREATE OR REPLACE VIEW leaderboard_view AS
SELECT
  p.id,
  p.username,
  p.avatar_url,
  p.city,
  p.country,
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
GROUP BY p.id, p.username, p.avatar_url, p.city, p.country
ORDER BY wins DESC;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE moves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Matches are viewable by everyone" ON matches FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert matches" ON matches FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Players can update own matches" ON matches FOR UPDATE USING (auth.uid() = player_red_id OR auth.uid() = player_yellow_id);

CREATE POLICY "Moves are viewable by everyone" ON moves FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert moves" ON moves FOR INSERT WITH CHECK (auth.role() = 'authenticated');
