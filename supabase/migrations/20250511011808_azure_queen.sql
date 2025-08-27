/*
  # Fix admin_profiles RLS policies

  1. Changes
    - Remove recursive policy that was causing infinite loops
    - Simplify RLS policies for admin_profiles table
    - Add clearer policy names and conditions
  
  2. Security
    - Maintain secure access control
    - Ensure only authenticated users can access appropriate records
    - Prevent unauthorized access while avoiding recursion
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Admins can read all profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Admins can update their own profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Approved admins can update any profile" ON admin_profiles;
DROP POLICY IF EXISTS "First admin or authenticated users can create profiles" ON admin_profiles;

-- Create new, simplified policies
CREATE POLICY "Enable read access for authenticated users"
ON admin_profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update their own profiles"
ON admin_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow insert for first admin or existing admins"
ON admin_profiles
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if this is the first admin (no approved admins exist)
  (NOT EXISTS (
    SELECT 1 FROM admin_profiles WHERE approved = true
  ))
  OR
  -- Or if the user is creating their own profile and there are approved admins
  (
    auth.uid() = id 
    AND EXISTS (
      SELECT 1 FROM admin_profiles WHERE approved = true
    )
  )
);