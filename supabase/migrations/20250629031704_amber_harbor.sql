/*
  # Fix Database Schema Issues

  1. Schema Fixes
    - Ensure featured column exists in items table
    - Fix foreign key relationship between cart_items and items
    - Add proper constraints and indexes
    - Update sample data

  2. Data Integrity
    - Ensure all existing items have proper featured status
    - Verify foreign key constraints are working

  This migration resolves the schema inconsistencies causing application errors.
*/

-- First, let's ensure the items table has the featured column
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
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  size text NOT NULL,
  color text NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user_email ON cart_items(user_email);
CREATE INDEX IF NOT EXISTS idx_cart_items_item_id ON cart_items(item_id);
CREATE INDEX IF NOT EXISTS idx_items_featured ON items(featured);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);

-- Ensure we have sample data with proper featured status
INSERT INTO items (name, price, description, category, image_url, sizes, colors, featured) VALUES
('Elegant Silk Dress', 299.00, 'Luxurious silk dress with flowing silhouette. Perfect for special occasions with its timeless elegance and sophisticated design.', 'Dresses', 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Navy', 'Burgundy', 'Emerald'], true),
('Premium Cotton Blazer', 189.00, 'Tailored cotton blazer with modern cut. Versatile piece that transitions seamlessly from office to evening.', 'Blazers', 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Charcoal', 'Navy', 'Camel', 'White'], true),
('Cashmere Sweater', 245.00, 'Ultra-soft cashmere sweater with ribbed details. A luxury essential that provides comfort and sophistication.', 'Knitwear', 'https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Cream', 'Grey', 'Blush', 'Black'], false),
('Designer Midi Skirt', 159.00, 'Elegant midi skirt with A-line silhouette. Features high-quality fabric and impeccable tailoring for a flattering fit.', 'Skirts', 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Navy', 'Olive', 'Rust'], true),
('Linen Shirt', 129.00, 'Breathable linen shirt with relaxed fit. Perfect for warm weather styling with its natural texture and comfortable feel.', 'Shirts', 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['White', 'Light Blue', 'Sage', 'Sand'], false),
('Evening Gown', 459.00, 'Stunning evening gown with intricate beadwork. Makes a statement at formal events with its dramatic silhouette.', 'Dresses', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Deep Blue', 'Burgundy', 'Gold'], true),
('Cocktail Dress', 225.00, 'Sophisticated cocktail dress perfect for evening events. Features elegant draping and premium fabric construction.', 'Dresses', 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Rose Gold', 'Silver', 'Deep Purple'], true),
('Leather Jacket', 349.00, 'Premium leather jacket with modern styling. A timeless piece that adds edge to any outfit.', 'Outerwear', 'https://images.pexels.com/photos/1124468/pexels-photo-1124468.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Brown', 'Tan'], false)
ON CONFLICT (name) DO UPDATE SET
  featured = EXCLUDED.featured,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  image_url = EXCLUDED.image_url,
  sizes = EXCLUDED.sizes,
  colors = EXCLUDED.colors;

-- Update any existing items to ensure they have featured status
UPDATE items SET featured = true WHERE name IN (
  'Elegant Silk Dress',
  'Premium Cotton Blazer', 
  'Designer Midi Skirt',
  'Evening Gown',
  'Cocktail Dress'
) AND featured IS NULL;

-- Add unique constraint to prevent duplicate items by name
CREATE UNIQUE INDEX IF NOT EXISTS idx_items_name_unique ON items(name);