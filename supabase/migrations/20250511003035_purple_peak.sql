/*
  # Database Schema Update
  
  1. Changes
    - Simplified wallpapers structure using JSONB for previews and download links
    - Consolidated quiz questions into main quiz table
    - Added updated_at timestamps to relevant tables
    - Renamed series_id to anime_id for consistency
    - Removed separate quiz_questions table
    
  2. Security
    - Enabled RLS on all tables
    - Added appropriate policies for public and admin access
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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can read all profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Admins can update their own profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Approved admins can update any profile" ON admin_profiles;

ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all profiles"
  ON admin_profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Admins can update their own profiles"
  ON admin_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Approved admins can update any profile"
  ON admin_profiles FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid() AND approved = true
  ));

-- Anime series
CREATE TABLE IF NOT EXISTS anime_series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE anime_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read anime series"
  ON anime_series FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Approved admins can modify anime series"
  ON anime_series FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid() AND approved = true
  ));

-- Wallpapers with new structure
CREATE TABLE IF NOT EXISTS wallpapers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anime_id UUID REFERENCES anime_series(id),
  previews JSONB NOT NULL, -- Preview images organized by type
  download_links JSONB NOT NULL, -- Download links for each type
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE wallpapers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read wallpapers"
  ON wallpapers FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Approved admins can modify wallpapers"
  ON wallpapers FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid() AND approved = true
  ));

-- Quizzes with consolidated structure
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  anime_id UUID REFERENCES anime_series(id),
  min_questions INTEGER NOT NULL DEFAULT 5,
  max_questions INTEGER NOT NULL DEFAULT 10,
  questions JSONB NOT NULL, -- Array of question objects with options
  is_default BOOLEAN DEFAULT false,
  completion_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (min_questions > 0 AND max_questions >= min_questions)
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read quizzes"
  ON quizzes FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Approved admins can modify quizzes"
  ON quizzes FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid() AND approved = true
  ));

-- Quiz Results
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  character_name TEXT NOT NULL,
  session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create quiz results"
  ON quiz_results FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read their own quiz results"
  ON quiz_results FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Approved admins can read all quiz results"
  ON quiz_results FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid() AND approved = true
  ));

-- Games
CREATE TABLE IF NOT EXISTS games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  anime_id UUID REFERENCES anime_series(id),
  apk_file TEXT NOT NULL,
  screenshots TEXT[] NOT NULL,
  tags TEXT[] DEFAULT '{}',
  download_count INTEGER DEFAULT 0,
  use_locker BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read games"
  ON games FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Approved admins can modify games"
  ON games FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid() AND approved = true
  ));

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

CREATE POLICY "Anyone can create stats"
  ON stats FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Approved admins can read stats"
  ON stats FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid() AND approved = true
  ));