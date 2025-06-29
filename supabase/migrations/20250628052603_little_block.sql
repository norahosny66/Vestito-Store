/*
  # Add cart items table

  1. New Tables
    - `cart_items` - Shopping cart functionality
      - `id` (uuid, primary key)
      - `item_id` (uuid, foreign key)
      - `user_email` (text)
      - `size` (text)
      - `color` (text)
      - `quantity` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on cart_items table
    - Add policies for authenticated users
*/

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid REFERENCES items(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  size text NOT NULL,
  color text NOT NULL,
  quantity integer DEFAULT 1,
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