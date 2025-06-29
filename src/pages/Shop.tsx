import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Grid, List, Heart, Eye, Loader2 } from 'lucide-react';
import { itemsService } from '../services/database';
import { Item } from '../lib/supabase';

const Shop: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    let mounted = true;

    const loadItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading items...');
        const data = await itemsService.getAll();
        console.log('Items loaded:', data.length);
        
        if (mounted) {
          setItems(data);
        }
      } catch (err) {
        console.error('Error loading items:', err);
        if (mounted) {
          setError('Failed to load products. Please try again.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadItems();

    return () => {
      mounted = false;
    };
  }, []);

  const categories = ['All', ...Array.from(new Set(items.map(item => item.category)))];

  const filteredItems = items.filter(item => 
    selectedCategory === 'All' || item.category === selectedCategory
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    }
  });

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
      const data = await itemsService.getAll();
      setItems(data);
    } catch (err) {
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-amber-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading our beautiful collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={retryLoad}
            className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Shop Collection</h1>
          <p className="text-gray-600">Discover our curated selection of customizable fashion pieces.</p>
        </div>

        {/* Filters & Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Category Filter */}
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <span className="text-sm text-gray-500">
                {sortedItems.length} {sortedItems.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>

              {/* View Mode */}
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-amber-500 text-white' : 'text-gray-500'} transition-colors`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-amber-500 text-white' : 'text-gray-500'} transition-colors`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' 
            : 'space-y-6'
        }`}>
          {sortedItems.map((item) => (
            <div 
              key={item.id} 
              className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Image */}
              <div className={`relative overflow-hidden ${
                viewMode === 'list' ? 'w-48 aspect-square' : 'aspect-[3/4]'
              }`}>
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

                {/* Badges */}
                <div className="absolute top-4 left-4 space-y-2">
                  {item.featured && (
                    <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Featured
                    </span>
                  )}
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium block">
                    Customizable
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
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

                {viewMode === 'list' && (
                  <div className="mt-4 flex space-x-4">
                    <Link
                      to={`/product/${item.id}`}
                      className="flex-1 bg-amber-500 text-white text-center py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors"
                    >
                      Customize
                    </Link>
                    <Link
                      to={`/product/${item.id}`}
                      className="flex-1 bg-gray-900 text-white text-center py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {sortedItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try selecting a different category or adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;