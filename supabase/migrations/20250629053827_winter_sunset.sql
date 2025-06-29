/*
  # Check and Create RLS Policy for User Table

  1. Policy Check
    - Check if "Users can read own data" policy exists on User table
    - Only create if it doesn't already exist
    - Use proper authentication rule

  2. Security
    - Ensure RLS is enabled on User table
    - Create policy with auth.jwt() ->> 'email' = email rule
    - Provide clear feedback about policy status

  This migration safely ensures the User table has the required RLS policy.
*/

-- Function to check if a policy exists and create it if needed
DO $$
BEGIN
  -- First ensure RLS is enabled on User table
  ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
  RAISE NOTICE 'RLS enabled on User table';

  -- Check if the policy "Users can read own data" exists on User table
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'User' 
    AND policyname = 'Users can read own data'
  ) THEN
    -- Create the policy since it doesn't exist
    CREATE POLICY "Users can read own data"
      ON "User"
      FOR SELECT
      TO authenticated
      USING (auth.jwt() ->> 'email' = email);
    
    RAISE NOTICE '✅ Policy "Users can read own data" created successfully on User table';
  ELSE
    RAISE NOTICE '⚠️  Policy "Users can read own data" already exists on User table, skipping creation';
  END IF;

  -- Also check and create other essential User table policies
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'User' 
    AND policyname = 'Users can insert own data'
  ) THEN
    CREATE POLICY "Users can insert own data"
      ON "User"
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.jwt() ->> 'email' = email);
    
    RAISE NOTICE '✅ Policy "Users can insert own data" created successfully on User table';
  ELSE
    RAISE NOTICE '⚠️  Policy "Users can insert own data" already exists on User table, skipping creation';
  END IF;

  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'User' 
    AND policyname = 'Users can update own data'
  ) THEN
    CREATE POLICY "Users can update own data"
      ON "User"
      FOR UPDATE
      TO authenticated
      USING (auth.jwt() ->> 'email' = email);
    
    RAISE NOTICE '✅ Policy "Users can update own data" created successfully on User table';
  ELSE
    RAISE NOTICE '⚠️  Policy "Users can update own data" already exists on User table, skipping creation';
  END IF;

END $$;

-- Verify all policies are now active
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE schemaname = 'public' 
  AND tablename = 'User' 
  AND policyname IN ('Users can read own data', 'Users can insert own data', 'Users can update own data');

  IF policy_count = 3 THEN
    RAISE NOTICE '🎉 All User table policies are now active (3/3)';
  ELSE
    RAISE WARNING '❌ Only % out of 3 expected User table policies are active', policy_count;
  END IF;
END $$;

-- Display current User table policies for verification
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  RAISE NOTICE '📋 Current User table policies:';
  FOR policy_record IN 
    SELECT policyname, cmd, permissive, roles
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'User'
    ORDER BY policyname
  LOOP
    RAISE NOTICE '  - %: % (%) for %', 
      policy_record.policyname, 
      policy_record.cmd, 
      policy_record.permissive, 
      array_to_string(policy_record.roles, ', ');
  END LOOP;
END $$;