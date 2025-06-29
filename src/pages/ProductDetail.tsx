import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, Share2, Truck, Shield, RotateCcw, Star, ShoppingCart, Check } from 'lucide-react';
import { itemsService, customizationsService, ordersService } from '../services/database';
import { Item } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import CustomizationForm, { CustomizationData } from '../components/customization/CustomizationForm';
import PreviewModal from '../components/customization/PreviewModal';
import AuthModal from '../components/auth/AuthModal';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [customizationData, setCustomizationData] = useState<CustomizationData | null>(null);
  const [currentCustomizationId, setCurrentCustomizationId] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  
  const { user } = useAuth();
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      loadItem();
    }
  }, [id]);

  const loadItem = async () => {
    if (!id) return;
    
    setLoading(true);
    const data = await itemsService.getById(id);
    setItem(data);
    
    // Set default selections
    if (data) {
      if (data.sizes && data.sizes.length > 0) {
        setSelectedSize(data.sizes[0]);
      }
      if (data.colors && data.colors.length > 0) {
        setSelectedColor(data.colors[0]);
      }
    }
    
    setLoading(false);
  };

  const handleCustomizeClick = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowCustomization(true);
  };

  const handleAddToCart = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!selectedSize || !selectedColor) {
      alert('Please select size and color');
      return;
    }

    const success = await addToCart({
      item_id: id!,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity
    });

    if (success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    } else {
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const handleCustomizationSubmit = async (data: CustomizationData) => {
    if (!user || !item) return;

    try {
      // Create customization record in database
      const customization = await customizationsService.create({
        user_email: user.email!,
        item_id: item.id,
        prompt: data.prompt,
        ai_image_url: data.customizedImageData ? 'base64_data' : undefined
      });

      if (customization) {
        setCurrentCustomizationId(customization.id);
        
        // If we have AI image data, update the record
        if (data.customizedImageData) {
          await customizationsService.updateAiImageUrl(customization.id, data.customizedImageData);
        }
      }

      setCustomizationData(data);
      setShowCustomization(false);
      setShowPreview(true);
    } catch (error) {
      console.error('Error saving customization:', error);
      alert('Error saving customization. Please try again.');
    }
  };

  const handleApprove = async () => {
    if (!currentCustomizationId || !item) return;

    try {
      // Update customization as approved
      await customizationsService.updateApproval(currentCustomizationId, true);

      setShowPreview(false);
      
      // Show success message
      alert('Customization approved! Your order is now in production and you will receive updates via email.');
      
      // Redirect to My Customizations page
      window.location.href = '/my-customizations';
    } catch (error) {
      console.error('Error approving customization:', error);
      alert('Error processing approval. Please try again.');
    }
  };

  const handleReject = () => {
    setShowPreview(false);
    setShowCustomization(true);
  };

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link to="/shop" className="text-amber-600 hover:text-amber-700">
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  // Create images array from the single image_url
  const images = [item.image_url];

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
            <Link to="/" className="hover:text-gray-700">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-gray-700">Shop</Link>
            <span>/</span>
            <span className="text-gray-900">{item.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden">
                <img
                  src={images[selectedImage]}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${
                        selectedImage === index ? 'border-amber-500' : 'border-transparent'
                      }`}
                    >
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">
                  {item.category}
                </p>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {item.name}
                </h1>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="text-3xl font-bold text-gray-900">
                    ${item.price}
                  </div>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-sm text-gray-500 ml-2">(127 reviews)</span>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Size Selection */}
              {item.sizes && item.sizes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Size
                  </h3>
                  <div className="grid grid-cols-5 gap-3">
                    {item.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 px-4 border rounded-lg text-sm font-medium transition-colors ${
                          selectedSize === size
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {item.colors && item.colors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Color
                  </h3>
                  <div className="flex space-x-3">
                    {item.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          selectedColor === color
                            ? 'border-amber-500 scale-110'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: getColorStyle(color) }}
                        title={color}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">Selected: {selectedColor || 'None'}</p>
                </div>
              )}

              {/* Quantity Selection */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Quantity
                </h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleCustomizeClick}
                  className="w-full bg-amber-500 text-white font-semibold py-4 px-8 rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Customize with AI
                </button>
                
                <button 
                  onClick={handleAddToCart}
                  disabled={!selectedSize || !selectedColor}
                  className="w-full bg-gray-900 text-white font-semibold py-4 px-8 rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>Add to Cart - ${(item.price * quantity).toFixed(2)}</span>
                    </>
                  )}
                </button>

                <div className="flex space-x-4">
                  <button className="flex-1 flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Heart className="w-5 h-5 mr-2" />
                    Save
                  </button>
                  <button className="flex-1 flex items-center justify-center py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Truck className="w-5 h-5" />
                  <span>Free shipping on orders over $200</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <RotateCcw className="w-5 h-5" />
                  <span>30-day returns & exchanges</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Shield className="w-5 h-5" />
                  <span>Authentic materials & craftsmanship</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customization Form Modal */}
      {showCustomization && (
        <CustomizationForm
          onSubmit={handleCustomizationSubmit}
          onClose={() => setShowCustomization(false)}
          productImage={images[selectedImage]}
          productName={item.name}
        />
      )}

      {/* Preview Modal */}
      {showPreview && customizationData && (
        <PreviewModal
          isOpen={showPreview}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setShowPreview(false)}
          productName={item.name}
          customizationPrompt={customizationData.prompt}
          customizedImageData={customizationData.customizedImageData}
          originalImage={images[selectedImage]}
          customizationId={currentCustomizationId}
          userEmail={user?.email}
          basePrice={item.price}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signin"
      />
    </>
  );
};

export default ProductDetail;