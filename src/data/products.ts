import { Product } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Elegant Silk Dress',
    price: 299,
    category: 'Dresses',
    images: [
      'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'Luxurious silk dress with flowing silhouette. Perfect for special occasions with its timeless elegance and sophisticated design.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Burgundy', 'Emerald'],
    featured: true
  },
  {
    id: '2',
    name: 'Premium Cotton Blazer',
    price: 189,
    category: 'Blazers',
    images: [
      'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'Tailored cotton blazer with modern cut. Versatile piece that transitions seamlessly from office to evening.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Charcoal', 'Navy', 'Camel', 'White'],
    featured: true
  },
  {
    id: '3',
    name: 'Cashmere Sweater',
    price: 245,
    category: 'Knitwear',
    images: [
      'https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1381553/pexels-photo-1381553.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'Ultra-soft cashmere sweater with ribbed details. A luxury essential that provides comfort and sophistication.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Cream', 'Grey', 'Blush', 'Black'],
    featured: false
  },
  {
    id: '4',
    name: 'Designer Midi Skirt',
    price: 159,
    category: 'Skirts',
    images: [
      'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1462640/pexels-photo-1462640.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'Elegant midi skirt with A-line silhouette. Features high-quality fabric and impeccable tailoring for a flattering fit.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Olive', 'Rust'],
    featured: true
  },
  {
    id: '5',
    name: 'Linen Shirt',
    price: 129,
    category: 'Shirts',
    images: [
      'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1040424/pexels-photo-1040424.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'Breathable linen shirt with relaxed fit. Perfect for warm weather styling with its natural texture and comfortable feel.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Light Blue', 'Sage', 'Sand'],
    featured: false
  },
  {
    id: '6',
    name: 'Evening Gown',
    price: 459,
    category: 'Dresses',
    images: [
      'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800',
      'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800'
    ],
    description: 'Stunning evening gown with intricate beadwork. Makes a statement at formal events with its dramatic silhouette.',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Deep Blue', 'Burgundy', 'Gold'],
    featured: true
  }
];