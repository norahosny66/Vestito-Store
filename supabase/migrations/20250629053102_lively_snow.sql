/*
  # Check and Create Cart Items Policy

  1. Policy Management
    - Check if "Users can read own cart items" policy exists on cart_items table
    - Only create if it doesn't exist
    - Use user_id = auth.uid() rule as specified

  2. Safety
    - Prevents duplicate policy creation errors
    - Ensures proper RLS configuration
*/

-- Function to check if a policy exists
DO $$
BEGIN
  -- Check if the policy "Users can read own cart items" exists on cart_items table
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'cart_items' 
    AND policyname = 'Users can read own cart items'
  ) THEN
    -- Create the policy with the specified rule: user_id = auth.uid()
    -- Note: Since cart_items uses user_email, we'll need to adjust the rule
    -- to match the actual column structure
    EXECUTE 'CREATE POLICY "Users can read own cart items" ON cart_items FOR SELECT TO authenticated USING (auth.jwt() ->> ''email'' = user_email)';
    
    RAISE NOTICE 'Policy "Users can read own cart items" created successfully';
  ELSE
    RAISE NOTICE 'Policy "Users can read own cart items" already exists, skipping creation';
  END IF;
END $$;

-- Alternative approach if you want to use user_id = auth.uid() rule:
-- This would require adding a user_id column to cart_items table

/*
-- Add user_id column to cart_items if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cart_items' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE cart_items ADD COLUMN user_id uuid REFERENCES auth.users(id);
    RAISE NOTICE 'Added user_id column to cart_items table';
  END IF;
END $$;

-- Check and create policy with user_id = auth.uid() rule
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'cart_items' 
    AND policyname = 'Users can read own cart items'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can read own cart items" ON cart_items FOR SELECT TO authenticated USING (user_id = auth.uid())';
    RAISE NOTICE 'Policy "Users can read own cart items" created with user_id = auth.uid() rule';
  ELSE
    RAISE NOTICE 'Policy "Users can read own cart items" already exists, skipping creation';
  END IF;
END $$;
*/

-- Verify the policy was created or already exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'cart_items' 
    AND policyname = 'Users can read own cart items'
  ) THEN
    RAISE NOTICE '✅ Policy "Users can read own cart items" is now active on cart_items table';
  ELSE
    RAISE WARNING '❌ Policy "Users can read own cart items" was not found after creation attempt';
  END IF;
END $$;