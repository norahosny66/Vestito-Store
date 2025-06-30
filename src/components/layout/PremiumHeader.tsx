import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, User, Search, LogOut, Contrast } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import AuthModal from '../auth/AuthModal';
import AccessibilityControls from '../ui/AccessibilityControls';

const PremiumHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const { cartCount } = useCart();

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  if (user) {
    navigation.push(
      { name: 'My Orders', path: '/my-orders' },
      { name: 'My Customizations', path: '/my-customizations' }
    );
  }

  const isActive = (path: string) => location.pathname === path;

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-br from-plum-600 to-plum-500 rounded-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200 shadow-lg">
                <span className="text-white font-bold text-xl font-playfair">V</span>
              </div>
              <span className="text-2xl font-playfair font-bold text-plum-800 group-hover:text-plum-600 transition-colors">
                Vestito
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`text-lg font-medium transition-all duration-200 relative group ${
                    isActive(item.path)
                      ? 'text-plum-600'
                      : 'text-gray-700 hover:text-plum-600'
                  }`}
                >
                  {item.name}
                  <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-plum-600 to-rosegold-500 transition-all duration-200 group-hover:w-full ${
                    isActive(item.path) ? 'w-full' : ''
                  }`}></span>
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button className="p-3 text-gray-600 hover:text-plum-600 hover:bg-plum-50 rounded-xl transition-all duration-200">
                <Search className="w-6 h-6" />
              </button>

              {/* Accessibility Controls - Desktop */}
              <div className="hidden lg:block">
                <AccessibilityControls />
              </div>

              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="hidden md:flex items-center space-x-3 bg-plum-50 rounded-full px-4 py-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-plum-600 to-plum-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {(userProfile?.first_name || user.email?.charAt(0) || 'U').toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-plum-700">
                      {userProfile?.first_name || user.email?.split('@')[0]}
                    </span>
                  </div>
                  
                  <Link 
                    to="/admin" 
                    className="p-3 text-gray-600 hover:text-plum-600 hover:bg-plum-50 rounded-xl transition-all duration-200"
                  >
                    <User className="w-6 h-6" />
                  </Link>
                  
                  <button 
                    onClick={handleSignOut}
                    className="p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                    title="Sign Out"
                  >
                    <LogOut className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-3">
                  <button
                    onClick={() => handleAuthClick('signin')}
                    className="px-6 py-3 text-plum-700 font-medium hover:text-plum-600 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="px-6 py-3 bg-gradient-to-r from-plum-600 to-plum-500 text-white font-medium rounded-xl hover:from-plum-500 hover:to-plum-400 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Cart */}
              <Link 
                to="/cart" 
                className="relative p-3 text-gray-600 hover:text-plum-600 hover:bg-plum-50 rounded-xl transition-all duration-200 group"
              >
                <ShoppingBag className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rosegold-500 to-rosegold-400 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse-soft">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-3 text-gray-600 hover:text-plum-600 hover:bg-plum-50 rounded-xl transition-all duration-200"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-6 border-t border-gray-100 animate-slide-up">
              <nav className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`text-lg font-medium transition-colors duration-200 py-2 ${
                      isActive(item.path)
                        ? 'text-plum-600'
                        : 'text-gray-700 hover:text-plum-600'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {/* Mobile Accessibility Controls */}
                <div className="pt-4 border-t border-gray-200">
                  <AccessibilityControls />
                </div>
                
                {!user ? (
                  <div className="flex flex-col space-y-3 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        handleAuthClick('signin');
                        setIsMenuOpen(false);
                      }}
                      className="text-left text-lg font-medium text-gray-700 hover:text-plum-600 transition-colors py-2"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        handleAuthClick('signup');
                        setIsMenuOpen(false);
                      }}
                      className="text-left text-lg font-medium text-plum-600 hover:text-plum-700 transition-colors py-2"
                    >
                      Sign Up
                    </button>
                  </div>
                ) : (
                  <div className="pt-6 border-t border-gray-200">
                    <button
                      onClick={handleSignOut}
                      className="text-left text-lg font-medium text-gray-700 hover:text-red-600 transition-colors flex items-center space-x-3 py-2"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default PremiumHeader;