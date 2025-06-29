/*
  # Fix Database Schema Issues

  This migration ensures all required tables, columns, and relationships exist
  and resolves the current schema inconsistencies.

  1. Schema Fixes
    - Ensure items table has featured column
    - Recreate cart_items table with proper foreign key
    - Add missing indexes and constraints
    - Insert sample data

  2. Security
    - Ensure RLS is enabled on all tables
    - Recreate all necessary policies
*/

-- First, ensure the items table exists with all required columns
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  sizes text[] DEFAULT '{}',
  colors text[] DEFAULT '{}',
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add featured column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'items' AND column_name = 'featured'
  ) THEN
    ALTER TABLE items ADD COLUMN featured boolean DEFAULT false;
  END IF;
END $$;

-- Drop and recreate cart_items table to ensure proper foreign key relationship
DROP TABLE IF EXISTS cart_items CASCADE;

CREATE TABLE cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL,
  user_email text NOT NULL,
  size text NOT NULL,
  color text NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_cart_items_item_id FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Ensure User table exists
CREATE TABLE IF NOT EXISTS "User" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  second_name text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Ensure customizations table exists
CREATE TABLE IF NOT EXISTS customizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  item_id uuid,
  prompt text NOT NULL,
  ai_image_url text,
  deposit_paid boolean DEFAULT false,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_customizations_item_id FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Ensure orders table exists
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  item_id uuid,
  customization_id uuid,
  total_price decimal(10,2) NOT NULL,
  status text DEFAULT 'pending',
  shipping_address jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_orders_item_id FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL,
  CONSTRAINT fk_orders_customization_id FOREIGN KEY (customization_id) REFERENCES customizations(id) ON DELETE SET NULL
);

-- Enable Row Level Security on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can read items" ON items;
DROP POLICY IF EXISTS "Users can read own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can read own data" ON "User";
DROP POLICY IF EXISTS "Users can insert own data" ON "User";
DROP POLICY IF EXISTS "Users can update own data" ON "User";
DROP POLICY IF EXISTS "Users can read own customizations" ON customizations;
DROP POLICY IF EXISTS "Users can insert own customizations" ON customizations;
DROP POLICY IF EXISTS "Users can update own customizations" ON customizations;
DROP POLICY IF EXISTS "Users can read own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;

-- Create policies for items table (public read access)
CREATE POLICY "Anyone can read items"
  ON items
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policies for cart_items table
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

-- Create policies for User table
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

-- Create policies for customizations table
CREATE POLICY "Users can read own customizations"
  ON customizations
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert own customizations"
  ON customizations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can update own customizations"
  ON customizations
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = user_email);

-- Create policies for orders table
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_email ON cart_items(user_email);
CREATE INDEX IF NOT EXISTS idx_cart_items_item_id ON cart_items(item_id);
CREATE INDEX IF NOT EXISTS idx_items_featured ON items(featured);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_customizations_user_email ON customizations(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);

-- Add unique constraint to prevent duplicate items by name
CREATE UNIQUE INDEX IF NOT EXISTS idx_items_name_unique ON items(name);

-- Clear existing items and insert fresh sample data
DELETE FROM items;

INSERT INTO items (name, price, description, category, image_url, sizes, colors, featured) VALUES
('Elegant Silk Dress', 299.00, 'Luxurious silk dress with flowing silhouette. Perfect for special occasions with its timeless elegance and sophisticated design.', 'Dresses', 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Navy', 'Burgundy', 'Emerald'], true),
('Premium Cotton Blazer', 189.00, 'Tailored cotton blazer with modern cut. Versatile piece that transitions seamlessly from office to evening.', 'Blazers', 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Charcoal', 'Navy', 'Camel', 'White'], true),
('Cashmere Sweater', 245.00, 'Ultra-soft cashmere sweater with ribbed details. A luxury essential that provides comfort and sophistication.', 'Knitwear', 'https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Cream', 'Grey', 'Blush', 'Black'], false),
('Designer Midi Skirt', 159.00, 'Elegant midi skirt with A-line silhouette. Features high-quality fabric and impeccable tailoring for a flattering fit.', 'Skirts', 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Navy', 'Olive', 'Rust'], true),
('Linen Shirt', 129.00, 'Breathable linen shirt with relaxed fit. Perfect for warm weather styling with its natural texture and comfortable feel.', 'Shirts', 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['White', 'Light Blue', 'Sage', 'Sand'], false),
('Evening Gown', 459.00, 'Stunning evening gown with intricate beadwork. Makes a statement at formal events with its dramatic silhouette.', 'Dresses', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Deep Blue', 'Burgundy', 'Gold'], true),
('Cocktail Dress', 225.00, 'Sophisticated cocktail dress perfect for evening events. Features elegant draping and premium fabric construction.', 'Dresses', 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Rose Gold', 'Silver', 'Deep Purple'], true),
('Leather Jacket', 349.00, 'Premium leather jacket with modern styling. A timeless piece that adds edge to any outfit.', 'Outerwear', 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Brown', 'Tan'], false);