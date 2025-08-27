/*
  # Admin Profiles Setup

  1. New Tables
    - `admin_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `approved` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for:
      - First admin creation
      - Profile reading
      - Profile updates
    - Add trigger for auto-approving first admin
*/

-- Create admin profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own admin profile" ON admin_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Admins can update their own profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Approved admins can update any profile" ON admin_profiles;

-- Allow anyone to create the first admin user, subsequent users must be authenticated
CREATE POLICY "First admin or authenticated users can create profiles"
  ON admin_profiles
  FOR INSERT
  TO public
  WITH CHECK (
    -- Allow first admin creation without auth
    NOT EXISTS (SELECT 1 FROM admin_profiles WHERE approved = true)
    OR
    -- Subsequent users must be authenticated and can only create their own profile
    (auth.uid() = id AND EXISTS (SELECT 1 FROM admin_profiles WHERE approved = true))
  );

-- First admin is automatically approved, subsequent users start as unapproved
CREATE OR REPLACE FUNCTION public.handle_admin_profile_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is the first admin user, automatically approve them
  IF NOT EXISTS (
    SELECT 1 FROM admin_profiles 
    WHERE approved = true 
    AND id != NEW.id
  ) THEN
    NEW.approved := true;
  ELSE
    NEW.approved := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS admin_profile_creation_trigger ON admin_profiles;
CREATE TRIGGER admin_profile_creation_trigger
  BEFORE INSERT ON admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_admin_profile_creation();

-- Allow admins to read all profiles
CREATE POLICY "Admins can read all profiles"
  ON admin_profiles
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid()
  ));

-- Allow admins to update their own basic info
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
  USING (EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = auth.uid() AND approved = true
  ));