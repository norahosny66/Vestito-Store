/*
  # Fix Database Schema Issues

  1. Add missing featured column to items table
  2. Ensure cart_items table exists with proper structure
  3. Add missing columns to orders table
  4. Fix any missing relationships

  This migration addresses the schema inconsistencies causing the application errors.
*/

-- Add featured column to items table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'items' AND column_name = 'featured'
  ) THEN
    ALTER TABLE items ADD COLUMN featured boolean DEFAULT false;
  END IF;
END $$;

-- Ensure cart_items table exists with proper structure
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  size text NOT NULL,
  color text NOT NULL,
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Add missing columns to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'item_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN item_id uuid REFERENCES items(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customization_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN customization_id uuid REFERENCES customizations(id) ON DELETE SET NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'shipping_address'
  ) THEN
    ALTER TABLE orders ADD COLUMN shipping_address jsonb;
  END IF;
END $$;

-- Enable Row Level Security on cart_items if not already enabled
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Create policies for cart_items table (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS "Users can read own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;

CREATE POLICY "Users can read own cart items"
  ON cart_items
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert own cart items"
  ON cart_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can update own cart items"
  ON cart_items
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can delete own cart items"
  ON cart_items
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'email' = user_email);

-- Update existing items to have featured status
UPDATE items SET featured = true WHERE name IN (
  'Elegant Silk Dress',
  'Premium Cotton Blazer', 
  'Designer Midi Skirt',
  'Evening Gown',
  'Cocktail Dress',
  'Leather Jacket',
  'Turtleneck Sweater',
  'Silk Blouse'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_items_featured ON items(featured);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_email ON cart_items(user_email);
CREATE INDEX IF NOT EXISTS idx_customizations_user_email ON customizations(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);