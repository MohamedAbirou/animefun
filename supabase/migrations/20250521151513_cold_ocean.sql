/*
  # Add users table insert policy

  1. Changes
    - Add RLS policy to allow user registration
    - Policy ensures users can only insert their own data
    - Maintains security by checking auth.uid() matches user id

  2. Security
    - Enables INSERT for authenticated and anonymous users
    - Restricts users to only insert their own data
    - Maintains existing RLS policies
*/

-- Add policy to allow user registration
CREATE POLICY "Enable user registration" 
ON public.users
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Ensure users can only insert their own data
  auth.uid() = id
);