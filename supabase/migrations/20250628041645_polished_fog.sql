/*
  # Populate Sample Product Data

  1. Sample Items
    - Add diverse fashion items across multiple categories
    - Include high-quality Pexels images
    - Set proper pricing and descriptions
    - Mark featured items for homepage display

  2. Categories
    - Dresses
    - Blazers
    - Knitwear
    - Skirts
    - Shirts
    - Outerwear
    - Accessories
*/

-- Clear existing data first (if any)
DELETE FROM customizations;
DELETE FROM orders;
DELETE FROM items;

-- Insert comprehensive sample items data
INSERT INTO items (name, price, description, category, image_url, sizes, colors, featured) VALUES
-- Dresses
('Elegant Silk Dress', 299.00, 'Luxurious silk dress with flowing silhouette. Perfect for special occasions with its timeless elegance and sophisticated design. Features a flattering A-line cut that suits all body types.', 'Dresses', 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Navy', 'Burgundy', 'Emerald'], true),

('Evening Gown', 459.00, 'Stunning evening gown with intricate beadwork and flowing train. Makes a statement at formal events with its dramatic silhouette and luxurious fabric. Hand-finished details throughout.', 'Dresses', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Deep Blue', 'Burgundy', 'Gold'], true),

('Casual Summer Dress', 149.00, 'Light and breezy summer dress perfect for warm weather. Features a comfortable fit with adjustable straps and a flattering midi length. Made from sustainable cotton blend.', 'Dresses', 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['White', 'Coral', 'Sky Blue', 'Mint'], false),

('Cocktail Dress', 229.00, 'Sophisticated cocktail dress with modern cut and elegant details. Perfect for semi-formal events and dinner parties. Features subtle shimmer fabric that catches the light beautifully.', 'Dresses', 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Rose Gold', 'Silver', 'Deep Purple'], true),

-- Blazers & Jackets
('Premium Cotton Blazer', 189.00, 'Tailored cotton blazer with modern cut and structured shoulders. Versatile piece that transitions seamlessly from office to evening. Features functional pockets and premium buttons.', 'Blazers', 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Charcoal', 'Navy', 'Camel', 'White'], true),

('Wool Coat', 349.00, 'Classic wool coat with timeless design and superior warmth. Features a flattering silhouette with belt detail and premium wool blend fabric. Perfect for cold weather styling.', 'Outerwear', 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Camel', 'Grey', 'Navy'], false),

('Leather Jacket', 279.00, 'Edgy leather jacket with modern styling and premium craftsmanship. Features asymmetrical zip closure and multiple pockets. Made from ethically sourced genuine leather.', 'Outerwear', 'https://images.pexels.com/photos/1040424/pexels-photo-1040424.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Brown', 'Burgundy'], true),

-- Knitwear
('Cashmere Sweater', 245.00, 'Ultra-soft cashmere sweater with ribbed details and relaxed fit. A luxury essential that provides comfort and sophistication. Features crew neck and long sleeves.', 'Knitwear', 'https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Cream', 'Grey', 'Blush', 'Black'], false),

('Wool Cardigan', 179.00, 'Cozy wool cardigan with button closure and patch pockets. Perfect for layering and adds warmth without bulk. Features a flattering length and soft texture.', 'Knitwear', 'https://images.pexels.com/photos/1381553/pexels-photo-1381553.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Oatmeal', 'Forest Green', 'Rust', 'Navy'], false),

('Turtleneck Sweater', 129.00, 'Classic turtleneck sweater in soft merino wool blend. Versatile piece that works for both casual and professional settings. Features a comfortable fit and timeless design.', 'Knitwear', 'https://images.pexels.com/photos/1462640/pexels-photo-1462640.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'White', 'Camel', 'Burgundy'], true),

-- Skirts
('Designer Midi Skirt', 159.00, 'Elegant midi skirt with A-line silhouette and premium fabric. Features high-quality construction and impeccable tailoring for a flattering fit. Perfect for office or evening wear.', 'Skirts', 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Black', 'Navy', 'Olive', 'Rust'], true),

('Pleated Skirt', 119.00, 'Feminine pleated skirt with flowing movement and comfortable waistband. Features a versatile length that works for multiple occasions. Made from wrinkle-resistant fabric.', 'Skirts', 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Blush', 'Sage', 'Cream', 'Charcoal'], false),

-- Shirts & Tops
('Linen Shirt', 129.00, 'Breathable linen shirt with relaxed fit and natural texture. Perfect for warm weather styling with its lightweight feel and comfortable drape. Features mother-of-pearl buttons.', 'Shirts', 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['White', 'Light Blue', 'Sage', 'Sand'], false),

('Silk Blouse', 189.00, 'Luxurious silk blouse with elegant drape and sophisticated styling. Features a flattering cut with subtle details. Perfect for professional settings or special occasions.', 'Shirts', 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['Ivory', 'Blush', 'Navy', 'Black'], true),

('Cotton Button-Down', 89.00, 'Classic cotton button-down shirt with crisp finish and tailored fit. A wardrobe essential that pairs well with everything. Features quality construction and timeless styling.', 'Shirts', 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['XS', 'S', 'M', 'L', 'XL'], ARRAY['White', 'Light Blue', 'Pink', 'Striped'], false),

-- Accessories
('Designer Handbag', 299.00, 'Elegant leather handbag with sophisticated design and premium craftsmanship. Features multiple compartments and adjustable strap. Perfect for both day and evening use.', 'Accessories', 'https://images.pexels.com/photos/1040424/pexels-photo-1040424.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['One Size'], ARRAY['Black', 'Brown', 'Tan', 'Navy'], false),

('Silk Scarf', 79.00, 'Luxurious silk scarf with beautiful print and soft texture. Versatile accessory that can be worn multiple ways. Features hand-rolled edges and vibrant colors.', 'Accessories', 'https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg?auto=compress&cs=tinysrgb&w=800', ARRAY['One Size'], ARRAY['Floral', 'Geometric', 'Abstract', 'Solid'], false);