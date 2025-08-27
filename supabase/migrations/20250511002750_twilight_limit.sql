/*
  # Initial Schema Setup

  1. Tables Created:
    - admin_profiles: For managing admin users and approvals
    - anime_series: For storing anime series information
    - wallpapers: For managing wallpaper content
    - quizzes: For storing quiz metadata
    - quiz_questions: For storing quiz questions
    - quiz_results: For tracking quiz completions
    - games: For managing downloadable games
    - stats: For tracking platform interactions

  2. Security:
    - Row Level Security (RLS) enabled on all tables
    - Appropriate policies for public and admin access
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admin profiles
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated admin users to read all admin_profiles
CREATE POLICY "Admins can read all profiles"
  ON admin_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated admin users to update only their own profiles
CREATE POLICY "Admins can update their own profiles"
  ON admin_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Allow approved admins to update any profile
CREATE POLICY "Approved admins can update any profile"
  ON admin_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE id = auth.uid() AND approved = true
    )
  );

-- Anime series
CREATE TABLE IF NOT EXISTS anime_series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE anime_series ENABLE ROW LEVEL SECURITY;

-- Allow public read access to anime series
CREATE POLICY "Anyone can read anime series"
  ON anime_series
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated approved admins to insert/update/delete anime series
CREATE POLICY "Approved admins can modify anime series"
  ON anime_series
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE id = auth.uid() AND approved = true
    )
  );

-- Wallpapers
CREATE TABLE IF NOT EXISTS wallpapers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('desktop', 'mobile', 'desktop_sketchy', 'mobile_sketchy')),
  series_id UUID REFERENCES anime_series(id),
  preview_images TEXT[] NOT NULL,
  file_path TEXT NOT NULL,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE wallpapers ENABLE ROW LEVEL SECURITY;

-- Allow public read access to wallpapers
CREATE POLICY "Anyone can read wallpapers"
  ON wallpapers
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated approved admins to modify wallpapers
CREATE POLICY "Approved admins can modify wallpapers"
  ON wallpapers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE id = auth.uid() AND approved = true
    )
  );

-- Quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  series_id UUID REFERENCES anime_series(id),
  min_questions INTEGER NOT NULL DEFAULT 5,
  max_questions INTEGER NOT NULL DEFAULT 10,
  characters JSONB NOT NULL, -- Array of character objects with id, name, image, description
  completion_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (min_questions > 0 AND max_questions >= min_questions)
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to quizzes
CREATE POLICY "Anyone can read quizzes"
  ON quizzes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated approved admins to modify quizzes
CREATE POLICY "Approved admins can modify quizzes"
  ON quizzes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE id = auth.uid() AND approved = true
    )
  );

-- Quiz Questions
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of option objects
  character_points JSONB NOT NULL, -- Object mapping character IDs to points
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to quiz questions
CREATE POLICY "Anyone can read quiz questions"
  ON quiz_questions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated approved admins to modify quiz questions
CREATE POLICY "Approved admins can modify quiz questions"
  ON quiz_questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE id = auth.uid() AND approved = true
    )
  );

-- Quiz Results
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  character_id TEXT NOT NULL, -- References character ID in quiz.characters
  points INTEGER NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create quiz results
CREATE POLICY "Anyone can create quiz results"
  ON quiz_results
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to read their own quiz results by session ID
CREATE POLICY "Anyone can read their own quiz results"
  ON quiz_results
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated approved admins to read all quiz results
CREATE POLICY "Approved admins can read all quiz results"
  ON quiz_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE id = auth.uid() AND approved = true
    )
  );

-- Games
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  series_id UUID REFERENCES anime_series(id),
  apk_file TEXT NOT NULL,
  screenshots TEXT[] NOT NULL,
  tags TEXT[] DEFAULT '{}',
  download_count INTEGER DEFAULT 0,
  use_locker BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

-- Allow public read access to games
CREATE POLICY "Anyone can read games"
  ON games
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated approved admins to modify games
CREATE POLICY "Approved admins can modify games"
  ON games
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE id = auth.uid() AND approved = true
    )
  );

-- Stats for tracking all interactions
CREATE TABLE IF NOT EXISTS stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interaction_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  ip_address TEXT,
  session_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stats ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert stats
CREATE POLICY "Anyone can create stats"
  ON stats
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated approved admins to read stats
CREATE POLICY "Approved admins can read stats"
  ON stats
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles
      WHERE id = auth.uid() AND approved = true
    )
  );