import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Play, Volume2, VolumeX } from 'lucide-react';
import AccessibilityControls from '../ui/AccessibilityControls';
import TrustBadges from '../ui/TrustBadges';

const PremiumHero: React.FC = () => {
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    // Preload video for better performance
    const video = document.createElement('video');
    video.src = 'https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1c9a91a5d&profile_id=139&oauth2_token_id=57447761';
    video.onloadeddata = () => setIsVideoLoaded(true);
  }, []);

  const toggleMute = () => {
    setIsVideoMuted(!isVideoMuted);
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-plum-900 via-plum-800 to-plum-700">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-plum-900/80 via-plum-800/60 to-transparent z-10"></div>
        {isVideoLoaded ? (
          <video
            autoPlay
            loop
            muted={isVideoMuted}
            playsInline
            className="w-full h-full object-cover opacity-40"
          >
            <source src="https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1c9a91a5d&profile_id=139&oauth2_token_id=57447761" type="video/mp4" />
          </video>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-plum-800 to-plum-900 animate-pulse"></div>
        )}
      </div>

      {/* Accessibility Controls */}
      <div className="absolute top-6 right-6 z-30">
        <AccessibilityControls />
      </div>

      {/* Video Controls */}
      <div className="absolute bottom-6 right-6 z-30">
        <button
          onClick={toggleMute}
          className="p-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all duration-200"
          aria-label={isVideoMuted ? 'Unmute video' : 'Mute video'}
        >
          {isVideoMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            {/* Floating Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full border border-white/20 animate-float">
              <Sparkles className="w-5 h-5 text-rosegold-400" />
              <span className="font-medium">AI-Powered Custom Design</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-playfair font-bold leading-tight">
                <span className="block text-white">Fashion that</span>
                <span className="block bg-gradient-to-r from-rosegold-400 via-rosegold-300 to-rosegold-500 bg-clip-text text-transparent animate-fade-in">
                  adapts to YOU
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed font-inter">
                Create custom clothing with AI-powered design tools. 
                <span className="text-rosegold-300 font-medium"> Perfect fit, perfect style, perfectly you.</span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Link
                to="/shop"
                className="group relative px-12 py-6 bg-gradient-to-r from-rosegold-500 to-rosegold-400 text-white font-semibold text-lg rounded-2xl hover:from-rosegold-400 hover:to-rosegold-300 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl animate-pulse-soft"
              >
                <span className="relative z-10 flex items-center space-x-3">
                  <span>Customize Now</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>

              <button className="group flex items-center space-x-3 text-white hover:text-rosegold-300 transition-colors">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/20 transition-all">
                  <Play className="w-6 h-6 ml-1" />
                </div>
                <span className="font-medium text-lg">Watch How It Works</span>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 max-w-4xl mx-auto">
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-white font-playfair">10s</div>
                <div className="text-white/80 font-inter">AI Preview Time</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-white font-playfair">98%</div>
                <div className="text-white/80 font-inter">Perfect Fit Rate</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-white font-playfair">24h</div>
                <div className="text-white/80 font-inter">Production Start</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <TrustBadges />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-rosegold-400/20 to-transparent rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-br from-plum-400/20 to-transparent rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
    </section>
  );
};

export default PremiumHero;