/*
  # Add users table insert policy

  1. Changes
    - Add RLS policy to allow admin user registration
    - Policy checks for admin role in user metadata during registration

  2. Security
    - Only allows inserts when the user has an admin role in their metadata
    - Maintains existing RLS policies
*/

-- Add policy to allow admin user registration
CREATE POLICY "Enable admin registration"
ON public.users
FOR INSERT
TO authenticated, anon
WITH CHECK (
  -- Allow inserts when the user being created has admin role in metadata
  (auth.jwt() ->> 'role')::text = 'admin'
  OR
  -- Also allow Supabase service role for system operations
  (auth.jwt() ->> 'role')::text = 'service_role'
);