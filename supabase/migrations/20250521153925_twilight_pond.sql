/*
  # Fix Users Table RLS Policies

  1. Changes:
    - Add RLS policy to allow user registration
    - Enable public access for user creation
    - Maintain security by restricting users to their own records

  2. Security:
    - Allow both anonymous and authenticated users to create accounts
    - Users can only create their own records
    - Maintain existing security constraints
*/

-- Enable RLS on users table if not already enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to register (create their own record)
CREATE POLICY "Enable user registration"
ON public.users
FOR INSERT
TO anon, authenticated
WITH CHECK (auth.uid() = id);

-- Allow users to read their own data
CREATE POLICY "Users can read own data"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);