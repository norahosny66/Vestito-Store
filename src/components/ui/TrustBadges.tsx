import React, { useState, useEffect } from 'react';
import { Shield, Users, Star, Zap } from 'lucide-react';

const TrustBadges: React.FC = () => {
  const [customerCount, setCustomerCount] = useState(1247);

  useEffect(() => {
    // Simulate live counter updates
    const interval = setInterval(() => {
      setCustomerCount(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-8">
      {/* Secure Checkout Badge */}
      <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
        <div className="relative">
          <Shield className="w-6 h-6 text-emerald-400" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Secure Checkout</p>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded text-white text-xs flex items-center justify-center font-bold">
              S
            </div>
            <span className="text-white/80 text-xs">256-bit SSL</span>
          </div>
        </div>
      </div>

      {/* Live Customer Counter */}
      <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
        <div className="relative">
          <Users className="w-6 h-6 text-rosegold-400" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
        <div>
          <p className="text-white font-semibold text-sm">
            <span className="font-mono">{customerCount.toLocaleString()}</span> perfect fits created
          </p>
          <p className="text-white/80 text-xs">Live counter</p>
        </div>
      </div>

      {/* Rating Badge */}
      <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
        <Star className="w-6 h-6 text-yellow-400 fill-current" />
        <div>
          <p className="text-white font-semibold text-sm">4.9/5 Rating</p>
          <p className="text-white/80 text-xs">2,847 reviews</p>
        </div>
      </div>

      {/* AI Powered Badge */}
      <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
        <Zap className="w-6 h-6 text-purple-400" />
        <div>
          <p className="text-white font-semibold text-sm">AI Powered</p>
          <p className="text-white/80 text-xs">Instant previews</p>
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;