/*
  # Create Fashion Customizer Database Schema

  1. New Tables
    - `User` - User authentication and profile data
      - `id` (uuid, primary key)
      - `first_name` (text)
      - `second_name` (text)
      - `email` (text, unique)
      - `created_at` (timestamp)
    
    - `items` - Product catalog
      - `id` (uuid, primary key)
      - `name` (text)
      - `price` (decimal)
      - `description` (text)
      - `category` (text)
      - `image_url` (text)
      - `sizes` (text array)
      - `colors` (text array)
      - `featured` (boolean)
      - `created_at` (timestamp)
    
    - `customizations` - User customization requests
      - `id` (uuid, primary key)
      - `user_email` (text)
      - `item_id` (uuid, foreign key)
      - `prompt` (text)
      - `ai_image_url` (text)
      - `deposit_paid` (boolean)
      - `approved` (boolean)
      - `created_at` (timestamp)
    
    - `orders` - Order tracking
      - `id` (uuid, primary key)
      - `user_email` (text)
      - `total_price` (decimal)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  second_name text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create items table
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

-- Create customizations table
CREATE TABLE IF NOT EXISTS customizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  ai_image_url text,
  deposit_paid boolean DEFAULT false,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  total_price decimal(10,2) NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE customizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

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

-- Create policies for items table (public read access)
CREATE POLICY "Anyone can read items"
  ON items
  FOR SELECT
  TO anon, authenticated
  USING (true);

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

-- Insert sample items data
INSERT INTO items (name, price, description, category, image_url, sizes, colors, featured) VALUES
('Elegant Silk Dress', 299.00, 'Luxurious silk dress with flowing silhouette. Perfect for special occasions with its timeless elegance and sophisticated design.', 'Dresses', 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Navy', 'Burgundy', 'Emerald'], true),
('Premium Cotton Blazer', 189.00, 'Tailored cotton blazer with modern cut. Versatile piece that transitions seamlessly from office to evening.', 'Blazers', 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Charcoal', 'Navy', 'Camel', 'White'], true),
('Cashmere Sweater', 245.00, 'Ultra-soft cashmere sweater with ribbed details. A luxury essential that provides comfort and sophistication.', 'Knitwear', 'https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Cream', 'Grey', 'Blush', 'Black'], false),
('Designer Midi Skirt', 159.00, 'Elegant midi skirt with A-line silhouette. Features high-quality fabric and impeccable tailoring for a flattering fit.', 'Skirts', 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Navy', 'Olive', 'Rust'], true),
('Linen Shirt', 129.00, 'Breathable linen shirt with relaxed fit. Perfect for warm weather styling with its natural texture and comfortable feel.', 'Shirts', 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['White', 'Light Blue', 'Sage', 'Sand'], false),
('Evening Gown', 459.00, 'Stunning evening gown with intricate beadwork. Makes a statement at formal events with its dramatic silhouette.', 'Dresses', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Deep Blue', 'Burgundy', 'Gold'], true);