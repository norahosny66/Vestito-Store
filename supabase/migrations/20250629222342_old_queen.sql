/*
  # Fix User table RLS policy for sign-up

  1. Policy Changes
    - Drop the existing restrictive INSERT policy that prevents sign-up
    - Create a new INSERT policy that allows authenticated users to create their profile
    - The policy ensures users can only insert a profile with their own authenticated email

  2. Security
    - Maintains security by ensuring users can only create profiles for their own email
    - Uses auth.jwt() to get the authenticated user's email from the JWT token
    - Only allows INSERT operations for authenticated users
*/

-- Drop the existing INSERT policy that's too restrictive
DROP POLICY IF EXISTS "Users can insert own data" ON public."User";

-- Create a new INSERT policy that allows authenticated users to create their profile
CREATE POLICY "Users can insert own profile"
  ON public."User"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = email);