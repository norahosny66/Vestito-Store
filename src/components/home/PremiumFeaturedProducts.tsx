import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Wand2, ArrowRight } from 'lucide-react';
import { itemsService } from '../../services/database';
import { Item } from '../../lib/supabase';
import SkeletonLoader from '../ui/SkeletonLoader';

const PremiumFeaturedProducts: React.FC = () => {
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const loadFeaturedItems = async () => {
      try {
        setLoading(true);
        const data = await itemsService.getFeatured();
        
        if (mounted) {
          setFeaturedItems(data);
        }
      } catch (err) {
        console.error('Error loading featured items:', err);
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

  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <SkeletonLoader className="h-12 w-64 mx-auto mb-4" />
            <SkeletonLoader className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <SkeletonLoader key={i} variant="card" className="h-96" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-plum-100 text-plum-700 px-6 py-3 rounded-full">
            <Wand2 className="w-5 h-5" />
            <span className="font-medium">AI Customizable</span>
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-playfair font-bold text-plum-800">
            Trending Pieces
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our most popular items, each one ready for your personal touch with 
            <span className="text-plum-600 font-medium"> AI-powered customization</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredItems.map((item) => (
            <div 
              key={item.id} 
              className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-rotate-1"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800';
                  }}
                />
                
                {/* Overlay Actions */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
                  hoveredItem === item.id ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                    <div className="flex space-x-3">
                      <button className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 transform hover:scale-110">
                        <Heart className="w-5 h-5 text-plum-600" />
                      </button>
                      <Link
                        to={`/product/${item.id}`}
                        className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 transform hover:scale-110"
                      >
                        <Eye className="w-5 h-5 text-plum-600" />
                      </Link>
                    </div>
                    
                    <Link
                      to={`/product/${item.id}`}
                      className="px-6 py-3 bg-gradient-to-r from-rosegold-500 to-rosegold-400 text-white font-semibold rounded-full hover:from-rosegold-400 hover:to-rosegold-300 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                    >
                      <Wand2 className="w-4 h-4" />
                      <span>Customize</span>
                    </Link>
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-6 left-6 space-y-2">
                  <span className="bg-gradient-to-r from-plum-600 to-plum-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    AI Customizable
                  </span>
                  {item.featured && (
                    <span className="block bg-gradient-to-r from-rosegold-500 to-rosegold-400 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                      Trending
                    </span>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-8">
                <div className="mb-3">
                  <span className="text-sm text-plum-500 uppercase tracking-wide font-medium">
                    {item.category}
                  </span>
                </div>
                
                <h3 className="text-2xl font-playfair font-semibold text-plum-800 mb-3 group-hover:text-plum-600 transition-colors">
                  <Link to={`/product/${item.id}`}>
                    {item.name}
                  </Link>
                </h3>
                
                <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-plum-800 font-playfair">
                    ${item.price}
                  </div>
                  
                  <div className="flex space-x-1">
                    {item.colors.slice(0, 4).map((color, index) => (
                      <div
                        key={index}
                        className="w-5 h-5 rounded-full border-2 border-white shadow-md transform hover:scale-125 transition-transform"
                        style={{ backgroundColor: getColorStyle(color) }}
                        title={color}
                      />
                    ))}
                    {item.colors.length > 4 && (
                      <div className="w-5 h-5 rounded-full border-2 border-white shadow-md bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-600 font-medium">+{item.colors.length - 4}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link
            to="/shop"
            className="inline-flex items-center px-10 py-4 bg-gradient-to-r from-plum-600 to-plum-500 text-white font-semibold text-lg rounded-2xl hover:from-plum-500 hover:to-plum-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl space-x-3"
          >
            <span>Explore All Products</span>
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PremiumFeaturedProducts;