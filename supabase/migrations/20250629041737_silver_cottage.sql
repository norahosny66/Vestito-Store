/*
  # Fix Database Schema - UUID Type Consistency

  1. Problem Resolution
    - Drop all tables that have foreign key dependencies
    - Recreate all tables with consistent UUID types
    - Ensure proper foreign key relationships
    - Re-add all policies and indexes

  2. Tables Recreated
    - items (with uuid id)
    - cart_items (with uuid item_id foreign key)
    - customizations (with uuid item_id foreign key)
    - orders (with uuid item_id and customization_id foreign keys)
    - User (unchanged, already has uuid)

  3. Security
    - Re-enable RLS on all tables
    - Recreate all policies
    - Add performance indexes
*/

-- Drop all dependent tables first (in reverse dependency order)
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customizations CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS items CASCADE;

-- Recreate items table with UUID primary key
CREATE TABLE items (
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

-- Recreate cart_items table with proper UUID foreign key
CREATE TABLE cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  size text NOT NULL,
  color text NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now()
);

-- Recreate customizations table with proper UUID foreign key
CREATE TABLE customizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  ai_image_url text,
  deposit_paid boolean DEFAULT false,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Recreate orders table with proper UUID foreign keys
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  item_id uuid REFERENCES items(id) ON DELETE SET NULL,
  customization_id uuid REFERENCES customizations(id) ON DELETE SET NULL,
  total_price decimal(10,2) NOT NULL,
  status text DEFAULT 'pending',
  shipping_address jsonb,
  created_at timestamptz DEFAULT now()
);

-- Ensure User table exists (should already exist from previous migrations)
CREATE TABLE IF NOT EXISTS "User" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  second_name text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

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
CREATE INDEX idx_cart_items_user_email ON cart_items(user_email);
CREATE INDEX idx_cart_items_item_id ON cart_items(item_id);
CREATE INDEX idx_items_featured ON items(featured);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_customizations_user_email ON customizations(user_email);
CREATE INDEX idx_customizations_item_id ON customizations(item_id);
CREATE INDEX idx_orders_user_email ON orders(user_email);
CREATE INDEX idx_orders_item_id ON orders(item_id);
CREATE INDEX idx_orders_customization_id ON orders(customization_id);

-- Add unique constraint to prevent duplicate items by name
CREATE UNIQUE INDEX idx_items_name_unique ON items(name);

-- Insert sample items data
INSERT INTO items (name, price, description, category, image_url, sizes, colors, featured) VALUES
('Elegant Silk Dress', 299.00, 'Luxurious silk dress with flowing silhouette. Perfect for special occasions with its timeless elegance and sophisticated design.', 'Dresses', 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Navy', 'Burgundy', 'Emerald'], true),
('Premium Cotton Blazer', 189.00, 'Tailored cotton blazer with modern cut. Versatile piece that transitions seamlessly from office to evening.', 'Blazers', 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Charcoal', 'Navy', 'Camel', 'White'], true),
('Cashmere Sweater', 245.00, 'Ultra-soft cashmere sweater with ribbed details. A luxury essential that provides comfort and sophistication.', 'Knitwear', 'https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Cream', 'Grey', 'Blush', 'Black'], false),
('Designer Midi Skirt', 159.00, 'Elegant midi skirt with A-line silhouette. Features high-quality fabric and impeccable tailoring for a flattering fit.', 'Skirts', 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Navy', 'Olive', 'Rust'], true),
('Linen Shirt', 129.00, 'Breathable linen shirt with relaxed fit. Perfect for warm weather styling with its natural texture and comfortable feel.', 'Shirts', 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['White', 'Light Blue', 'Sage', 'Sand'], false),
('Evening Gown', 459.00, 'Stunning evening gown with intricate beadwork. Makes a statement at formal events with its dramatic silhouette.', 'Dresses', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Deep Blue', 'Burgundy', 'Gold'], true),
('Cocktail Dress', 225.00, 'Sophisticated cocktail dress perfect for evening events. Features elegant draping and premium fabric construction.', 'Dresses', 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Rose Gold', 'Silver', 'Deep Purple'], true),
('Leather Jacket', 349.00, 'Premium leather jacket with modern styling. A timeless piece that adds edge to any outfit.', 'Outerwear', 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Brown', 'Tan'], false),
('Wool Coat', 349.00, 'Classic wool coat with timeless design and superior warmth. Features a flattering silhouette with belt detail.', 'Outerwear', 'https://images.pexels.com/photos/1462640/pexels-photo-1462640.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Camel', 'Grey', 'Navy'], false),
('Silk Blouse', 189.00, 'Luxurious silk blouse with elegant drape and sophisticated styling. Perfect for professional settings.', 'Shirts', 'https://images.pexels.com/photos/1381553/pexels-photo-1381553.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Ivory', 'Blush', 'Navy', 'Black'], true);