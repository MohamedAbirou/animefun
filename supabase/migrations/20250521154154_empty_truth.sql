/*
  # Update users table RLS policies

  1. Changes
    - Drop existing restrictive policies
    - Add new policies that allow:
      - User registration (insert)
      - Users to read their own data
      - Admins to read all user data
  
  2. Security
    - Enable RLS on users table
    - Add policies for:
      - User registration
      - User data access
      - Admin data access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow all inserts" ON users;
DROP POLICY IF EXISTS "Enable user registration" ON users;
DROP POLICY IF EXISTS "Users can read own data" ON users;

-- Create new policies
CREATE POLICY "Enable user registration"
ON users
FOR INSERT
TO public
WITH CHECK (
  -- Allow registration during signup
  (auth.uid() = id) OR
  -- Allow admins to create users
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
    AND admin_profiles.approved = true
  )
);

CREATE POLICY "Users can read own data"
ON users
FOR SELECT
TO authenticated
USING (
  -- Users can read their own data
  auth.uid() = id OR
  -- Admins can read all user data
  EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
    AND admin_profiles.approved = true
  )
);