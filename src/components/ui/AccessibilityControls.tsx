import React, { useState, useEffect } from 'react';
import { Contrast, Mic, Volume2, Eye } from 'lucide-react';

interface AccessibilityControlsProps {
  className?: string;
}

const AccessibilityControls: React.FC<AccessibilityControlsProps> = ({ className = '' }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    // Apply high contrast mode
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
  };

  const toggleVoiceInput = () => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled) {
      // Announce voice input is enabled
      const utterance = new SpeechSynthesisUtterance('Voice input enabled');
      speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsListening(true);
      // Voice recognition logic would go here
      setTimeout(() => setIsListening(false), 3000); // Demo timeout
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* High Contrast Toggle */}
      <button
        onClick={toggleHighContrast}
        className={`p-2 rounded-lg transition-all duration-200 ${
          highContrast 
            ? 'bg-plum-800 text-white' 
            : 'bg-white/10 text-plum-700 hover:bg-white/20'
        }`}
        aria-label="Toggle high contrast mode"
        title="High Contrast Mode"
      >
        <Contrast className="w-4 h-4" />
      </button>

      {/* Voice Input Toggle */}
      <button
        onClick={toggleVoiceInput}
        className={`p-2 rounded-lg transition-all duration-200 ${
          voiceEnabled 
            ? 'bg-rosegold-500 text-white' 
            : 'bg-white/10 text-plum-700 hover:bg-white/20'
        }`}
        aria-label="Toggle voice input"
        title="Voice Input"
      >
        <Volume2 className="w-4 h-4" />
      </button>

      {/* Voice Listening Indicator */}
      {voiceEnabled && (
        <button
          onClick={startListening}
          className={`p-2 rounded-lg transition-all duration-200 ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-plum-600 text-white hover:bg-plum-700'
          }`}
          aria-label="Start voice input"
          title="Click to speak"
        >
          <Mic className="w-4 h-4" />
        </button>
      )}

      {/* Screen Reader Helper */}
      <button
        className="p-2 rounded-lg bg-white/10 text-plum-700 hover:bg-white/20 transition-all duration-200"
        aria-label="Screen reader assistance"
        title="Screen Reader Help"
      >
        <Eye className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AccessibilityControls;