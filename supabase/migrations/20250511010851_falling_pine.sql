/*
  # Fix admin profiles RLS policies

  1. Changes:
    - Add insert policy for admin_profiles table to allow registration
*/

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert their own admin profile"
  ON admin_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);