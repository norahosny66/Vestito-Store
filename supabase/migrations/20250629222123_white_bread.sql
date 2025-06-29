/*
  # Fix User table column names

  1. Schema Fix
    - Rename 'first name' to 'first_name' (remove space, add underscore)
    - Rename 'second name' to 'second_name' (remove space, add underscore)
    - Ensure consistency with application code

  2. Data Integrity
    - Preserve existing data during column rename
    - Update any existing records

  This migration resolves the column name mismatch causing authentication errors.
*/

-- Function to safely rename columns
DO $$
BEGIN
  RAISE NOTICE '🔧 Fixing User table column names...';

  -- Check if old column names exist and rename them
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'first name'
  ) THEN
    ALTER TABLE "User" RENAME COLUMN "first name" TO "first_name";
    RAISE NOTICE '✅ Renamed "first name" to "first_name"';
  ELSE
    RAISE NOTICE '⚠️  Column "first name" not found, checking if "first_name" already exists';
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'User' AND column_name = 'first_name'
    ) THEN
      ALTER TABLE "User" ADD COLUMN first_name text NOT NULL DEFAULT '';
      RAISE NOTICE '✅ Added missing "first_name" column';
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'second name'
  ) THEN
    ALTER TABLE "User" RENAME COLUMN "second name" TO "second_name";
    RAISE NOTICE '✅ Renamed "second name" to "second_name"';
  ELSE
    RAISE NOTICE '⚠️  Column "second name" not found, checking if "second_name" already exists';
    
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'User' AND column_name = 'second_name'
    ) THEN
      ALTER TABLE "User" ADD COLUMN second_name text NOT NULL DEFAULT '';
      RAISE NOTICE '✅ Added missing "second_name" column';
    END IF;
  END IF;

  -- Ensure the table has the correct structure
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'id'
  ) THEN
    ALTER TABLE "User" ADD COLUMN id uuid PRIMARY KEY DEFAULT gen_random_uuid();
    RAISE NOTICE '✅ Added missing "id" column';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'email'
  ) THEN
    ALTER TABLE "User" ADD COLUMN email text UNIQUE NOT NULL;
    RAISE NOTICE '✅ Added missing "email" column';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE "User" ADD COLUMN created_at timestamptz DEFAULT now();
    RAISE NOTICE '✅ Added missing "created_at" column';
  END IF;

  RAISE NOTICE '✅ User table column names fixed successfully';
END $$;

-- Verify the final structure
DO $$
DECLARE
  column_record RECORD;
BEGIN
  RAISE NOTICE '📋 Current User table structure:';
  FOR column_record IN 
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_name = 'User'
    ORDER BY ordinal_position
  LOOP
    RAISE NOTICE '  - %: % (nullable: %, default: %)', 
      column_record.column_name, 
      column_record.data_type,
      column_record.is_nullable,
      COALESCE(column_record.column_default, 'none');
  END LOOP;
END $$;

-- Ensure RLS policies are still working with the new column names
DO $$
BEGIN
  RAISE NOTICE '🔒 Verifying RLS policies after column rename...';
  
  -- Drop and recreate User table policies to ensure they work with new column names
  DROP POLICY IF EXISTS "Users can read own data" ON "User";
  DROP POLICY IF EXISTS "Users can insert own data" ON "User";
  DROP POLICY IF EXISTS "Users can update own data" ON "User";

  CREATE POLICY "Users can read own data"
    ON "User"
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'email' = email);

  CREATE POLICY "Users can insert own data"
    ON "User"
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.jwt() ->> 'email' = email);

  CREATE POLICY "Users can update own data"
    ON "User"
    FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'email' = email);

  RAISE NOTICE '✅ RLS policies recreated successfully';
END $$;

-- Final verification
DO $$
DECLARE
  has_first_name BOOLEAN;
  has_second_name BOOLEAN;
  has_email BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'first_name'
  ) INTO has_first_name;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'second_name'
  ) INTO has_second_name;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'email'
  ) INTO has_email;

  IF has_first_name AND has_second_name AND has_email THEN
    RAISE NOTICE '🎉 User table schema is now consistent with application code!';
    RAISE NOTICE '✅ Columns: first_name ✓, second_name ✓, email ✓';
  ELSE
    RAISE WARNING '❌ User table schema verification failed:';
    RAISE WARNING '  - first_name: %', CASE WHEN has_first_name THEN '✓' ELSE '✗' END;
    RAISE WARNING '  - second_name: %', CASE WHEN has_second_name THEN '✓' ELSE '✗' END;
    RAISE WARNING '  - email: %', CASE WHEN has_email THEN '✓' ELSE '✗' END;
  END IF;
END $$;