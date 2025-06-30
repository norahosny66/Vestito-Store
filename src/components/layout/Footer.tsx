import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, Heart, Sparkles } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-plum-900 via-plum-800 to-plum-900 text-white relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-rosegold-400 to-rosegold-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-plum-400 to-plum-500 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-rosegold-300 to-plum-400 rounded-full blur-2xl opacity-30"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-rosegold-400 to-rosegold-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl font-playfair">V</span>
              </div>
              <span className="text-2xl font-playfair font-bold">Vestito</span>
            </div>
            <p className="text-white/80 leading-relaxed">
              Crafting bespoke fashion pieces with AI-powered customization and unparalleled attention to detail. 
              <span className="text-rosegold-300 font-medium"> Fashion that adapts to YOU.</span>
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="p-3 bg-white/10 backdrop-blur-sm rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 transform hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-3 bg-white/10 backdrop-blur-sm rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 transform hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="p-3 bg-white/10 backdrop-blur-sm rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 transform hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-playfair font-semibold text-rosegold-300">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/shop" 
                  className="text-white/80 hover:text-rosegold-300 transition-colors duration-200 flex items-center space-x-2 group"
                >
                  <span>Shop All</span>
                  <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-white/80 hover:text-rosegold-300 transition-colors duration-200"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/customization" 
                  className="text-white/80 hover:text-rosegold-300 transition-colors duration-200 flex items-center space-x-2 group"
                >
                  <span>AI Customization</span>
                  <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link 
                  to="/size-guide" 
                  className="text-white/80 hover:text-rosegold-300 transition-colors duration-200"
                >
                  Size Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-6">
            <h3 className="text-xl font-playfair font-semibold text-rosegold-300">Customer Care</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/contact" 
                  className="text-white/80 hover:text-rosegold-300 transition-colors duration-200"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/shipping" 
                  className="text-white/80 hover:text-rosegold-300 transition-colors duration-200"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link 
                  to="/returns" 
                  className="text-white/80 hover:text-rosegold-300 transition-colors duration-200"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link 
                  to="/faq" 
                  className="text-white/80 hover:text-rosegold-300 transition-colors duration-200"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-xl font-playfair font-semibold text-rosegold-300">Get in Touch</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 group">
                <div className="p-2 bg-rosegold-500/20 rounded-lg group-hover:bg-rosegold-500/30 transition-colors">
                  <Mail className="w-5 h-5 text-rosegold-400" />
                </div>
                <span className="text-white/80 group-hover:text-white transition-colors">hello@vestito.com</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="p-2 bg-rosegold-500/20 rounded-lg group-hover:bg-rosegold-500/30 transition-colors">
                  <Phone className="w-5 h-5 text-rosegold-400" />
                </div>
                <span className="text-white/80 group-hover:text-white transition-colors">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 group">
                <div className="p-2 bg-rosegold-500/20 rounded-lg group-hover:bg-rosegold-500/30 transition-colors">
                  <MapPin className="w-5 h-5 text-rosegold-400" />
                </div>
                <span className="text-white/80 group-hover:text-white transition-colors">123 Fashion Ave, NYC</span>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <h4 className="font-semibold text-white mb-3">Stay Updated</h4>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-rosegold-400"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-rosegold-500 to-rosegold-400 text-white rounded-lg hover:from-rosegold-400 hover:to-rosegold-300 transition-all duration-200 transform hover:scale-105">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <p className="text-white/60">
              © 2025 Vestito. All rights reserved.
            </p>
            <Heart className="w-4 h-4 text-rosegold-400 animate-pulse" />
          </div>
          
          <div className="flex items-center space-x-6">
            <Link 
              to="/privacy" 
              className="text-white/60 hover:text-rosegold-300 text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms" 
              className="text-white/60 hover:text-rosegold-300 text-sm transition-colors"
            >
              Terms of Service
            </Link>
            <a 
              href="https://bolt.new" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full text-xs font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Built with Bolt.new
            </a>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 pt-8 border-t border-white/20">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            <div className="flex items-center space-x-2 text-white/80">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2 text-white/80">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm">AI Powered</span>
            </div>
            <div className="flex items-center space-x-2 text-white/80">
              <div className="w-2 h-2 bg-rosegold-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Handcrafted Quality</span>
            </div>
            <div className="flex items-center space-x-2 text-white/80">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-sm">30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;