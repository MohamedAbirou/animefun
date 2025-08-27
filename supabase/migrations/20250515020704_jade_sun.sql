/*
  # Quiz Feature Update

  1. Changes:
    - Add use_locker column to quizzes table
    - Add global_settings table for feature controls
    - Update quiz_results table structure

  2. Security:
    - Maintain existing RLS policies
    - Add policies for global settings
*/

-- Create global settings table
CREATE TABLE IF NOT EXISTS global_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add default settings
INSERT INTO global_settings (key, value)
VALUES (
  'locker_settings',
  '{
    "wallpapers_enabled": true,
    "quizzes_enabled": true,
    "games_enabled": true
  }'::jsonb
);

-- Enable RLS on global settings
ALTER TABLE global_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to global settings
CREATE POLICY "Anyone can read global settings"
  ON global_settings FOR SELECT
  TO public
  USING (true);

-- Allow approved admins to modify global settings
CREATE POLICY "Approved admins can modify global settings"
  ON global_settings FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid()
    AND approved = true
  ));

-- Add use_locker column to quizzes
ALTER TABLE quizzes
ADD COLUMN use_locker BOOLEAN DEFAULT true;

-- Update quiz_results table
ALTER TABLE quiz_results
DROP CONSTRAINT IF EXISTS quiz_results_quiz_id_fkey CASCADE;

ALTER TABLE quiz_results
ADD CONSTRAINT quiz_results_quiz_id_fkey
FOREIGN KEY (quiz_id)
REFERENCES quizzes(id)
ON DELETE CASCADE;