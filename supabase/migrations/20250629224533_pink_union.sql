/*
  # Fix Sign-up and Email Verification Flow

  1. Updates
    - Ensure User table has proper structure for email verification flow
    - Update RLS policies to work with email verification
    - Add proper constraints and indexes

  2. Security
    - Maintain RLS protection while allowing profile creation after verification
    - Ensure data integrity during the verification process
*/

-- Ensure User table has the correct structure
DO $$
BEGIN
  -- Make sure all required columns exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'id'
  ) THEN
    ALTER TABLE "User" ADD COLUMN id uuid PRIMARY KEY DEFAULT gen_random_uuid();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE "User" ADD COLUMN first_name text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'second_name'
  ) THEN
    ALTER TABLE "User" ADD COLUMN second_name text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'email'
  ) THEN
    ALTER TABLE "User" ADD COLUMN email text UNIQUE NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE "User" ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;

  RAISE NOTICE '✅ User table structure verified';
END $$;

-- Enable RLS on User table
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can read own data" ON "User";
DROP POLICY IF EXISTS "Users can insert own data" ON "User";
DROP POLICY IF EXISTS "Users can insert own profile" ON "User";
DROP POLICY IF EXISTS "Users can update own data" ON "User";

-- Create policies that work with email verification flow
CREATE POLICY "Users can read own data"
  ON "User"
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = email);

-- Allow authenticated users to insert their profile (after email verification)
CREATE POLICY "Users can insert own profile"
  ON "User"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = email);

CREATE POLICY "Users can update own data"
  ON "User"
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = email);

-- Add unique constraint on email if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'User_email_key' AND table_name = 'User'
  ) THEN
    ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE (email);
    RAISE NOTICE '✅ Added unique constraint on email';
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);

-- Verify the setup
DO $$
DECLARE
  policy_count INTEGER;
  constraint_count INTEGER;
BEGIN
  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public' AND tablename = 'User';

  -- Count constraints
  SELECT COUNT(*) INTO constraint_count
  FROM information_schema.table_constraints
  WHERE table_name = 'User' AND constraint_type = 'UNIQUE';

  RAISE NOTICE '📊 User table verification:';
  RAISE NOTICE '  - RLS Policies: %', policy_count;
  RAISE NOTICE '  - Unique Constraints: %', constraint_count;

  IF policy_count >= 3 AND constraint_count >= 1 THEN
    RAISE NOTICE '🎉 User table is properly configured for email verification flow!';
  ELSE
    RAISE WARNING '⚠️ User table configuration may need attention';
  END IF;
END $$;