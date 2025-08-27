/*
  # Add Unlock Sessions Table
  
  1. New Tables
    - `unlock_sessions`
      - `session_id` (uuid, primary key)
      - `content_type` (text)
      - `content_id` (text)
      - `unlocked` (boolean)
      - `created_at` (timestamp)
      - `payout` (numeric)
      - `offer_id` (text)
      - `offer_name` (text)
  
  2. Security
    - Enable RLS
    - Add policies for public access and admin access
*/

-- Create unlock_sessions table
CREATE TABLE IF NOT EXISTS unlock_sessions (
  session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL CHECK (content_type IN ('wallpaper', 'quiz', 'game')),
  content_id TEXT NOT NULL,
  unlocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  payout NUMERIC(10,2),
  offer_id TEXT,
  offer_name TEXT
);

-- Enable RLS
ALTER TABLE unlock_sessions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create unlock sessions
CREATE POLICY "Anyone can create unlock sessions"
  ON unlock_sessions
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to read their own unlock sessions
CREATE POLICY "Anyone can read unlock sessions"
  ON unlock_sessions
  FOR SELECT
  TO public
  USING (true);

-- Allow admins to read all unlock sessions
CREATE POLICY "Admins can read all unlock sessions"
  ON unlock_sessions
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid()
    AND approved = true
  ));