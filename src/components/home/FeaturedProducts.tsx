import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Loader2 } from 'lucide-react';
import { itemsService } from '../../services/database';
import { Item } from '../../lib/supabase';

const FeaturedProducts: React.FC = () => {
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const loadFeaturedItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading featured items...');
        const data = await itemsService.getFeatured();
        console.log('Featured items loaded:', data.length);
        
        if (mounted) {
          setFeaturedItems(data);
        }
      } catch (err) {
        console.error('Error loading featured items:', err);
        if (mounted) {
          setError('Failed to load featured products');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadFeaturedItems();

    return () => {
      mounted = false;
    };
  }, []);

  const getColorStyle = (color: string) => {
    const colorMap: { [key: string]: string } = {
      'black': '#000000',
      'white': '#ffffff',
      'navy': '#001f3f',
      'burgundy': '#800020',
      'emerald': '#50c878',
      'charcoal': '#36454f',
      'camel': '#c19a6b',
      'cream': '#fffdd0',
      'grey': '#808080',
      'gray': '#808080',
      'blush': '#de5d83',
      'olive': '#808000',
      'rust': '#b7410e',
      'deep blue': '#003366',
      'rose gold': '#e8b4a0',
      'silver': '#c0c0c0',
      'deep purple': '#483d8b',
      'coral': '#ff7f50',
      'sky blue': '#87ceeb',
      'mint': '#98fb98',
      'forest green': '#228b22',
      'oatmeal': '#ddd8c7',
      'sage': '#9caf88',
      'sand': '#c2b280',
      'ivory': '#fffff0',
      'pink': '#ffc0cb',
      'light blue': '#add8e6',
      'tan': '#d2b48c',
      'brown': '#8b4513',
      'gold': '#ffd700'
    };
    
    return colorMap[color.toLowerCase()] || '#d1d5db';
  };

  const retryLoad = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await itemsService.getFeatured();
      setFeaturedItems(data);
    } catch (err) {
      setError('Failed to load featured products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trending Pieces
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our most popular items, each one carefully crafted and ready for your personal touch.
            </p>
          </div>
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
              <span className="text-gray-600">Loading featured products...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Products</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={retryLoad}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (featuredItems.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Featured Products</h3>
            <p className="text-gray-600">Check back soon for our latest featured items.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Trending Pieces
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our most popular items, each one carefully crafted and ready for your personal touch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredItems.map((item) => (
            <div key={item.id} className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              {/* Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800';
                  }}
                />
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                  <button className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors">
                    <Heart className="w-5 h-5 text-gray-700" />
                  </button>
                  <Link
                    to={`/product/${item.id}`}
                    className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    <Eye className="w-5 h-5 text-gray-700" />
                  </Link>
                </div>

                {/* Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Customizable
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="mb-2">
                  <span className="text-sm text-gray-500 uppercase tracking-wide">
                    {item.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
                  <Link to={`/product/${item.id}`}>
                    {item.name}
                  </Link>
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-gray-900">
                    ${item.price}
                  </div>
                  
                  <div className="flex space-x-1">
                    {item.colors.slice(0, 4).map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: getColorStyle(color) }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/shop"
            className="inline-flex items-center px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors duration-200"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;