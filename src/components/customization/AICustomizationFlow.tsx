import React, { useState } from 'react';
import { Wand2, Mic, RotateCcw, CheckCircle, Loader2 } from 'lucide-react';
import { Item } from '../../lib/supabase';
import BeforeAfterSlider from '../ui/BeforeAfterSlider';
import SkeletonLoader from '../ui/SkeletonLoader';
import ConfettiEffect from '../ui/ConfettiEffect';

interface AICustomizationFlowProps {
  selectedItem: Item | null;
  onComplete: (customization: any) => void;
}

const AICustomizationFlow: React.FC<AICustomizationFlowProps> = ({
  selectedItem,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const examplePrompts = [
    "Add sleeves + scoliosis support",
    "Make it more fitted around the waist",
    "Convert to off-shoulder style",
    "Add lace details and extend length",
    "Change to a more casual, relaxed fit"
  ];

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsListening(true);
      // Simulate voice recognition
      setTimeout(() => {
        setPrompt("Add sleeves and make it more fitted");
        setIsListening(false);
      }, 2000);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || !selectedItem) return;

    setIsGenerating(true);
    setCurrentStep(3);

    // Simulate AI generation
    setTimeout(() => {
      setGeneratedImage('https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800');
      setIsGenerating(false);
      setCurrentStep(4);
    }, 3000);
  };

  const handleTweak = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setGeneratedImage('https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800');
      setIsGenerating(false);
    }, 2000);
  };

  const handleApprove = () => {
    setShowConfetti(true);
    setTimeout(() => {
      onComplete({
        prompt,
        originalImage: selectedItem?.image_url,
        generatedImage,
        approved: true
      });
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <ConfettiEffect trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center space-x-4">
          {[1, 2, 3, 4].map((step) => (
            <React.Fragment key={step}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                currentStep >= step 
                  ? 'bg-gradient-to-r from-plum-600 to-plum-500 text-white shadow-lg' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > step ? <CheckCircle className="w-6 h-6" /> : step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-1 transition-all duration-300 ${
                  currentStep > step ? 'bg-plum-500' : 'bg-gray-200'
                }`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step 1: Product Selection */}
      {currentStep === 1 && (
        <div className="text-center space-y-8 animate-slide-up">
          <h2 className="text-4xl font-playfair font-bold text-plum-800">Choose Your Base</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select a product to customize with AI-powered design tools
          </p>
          
          {selectedItem && (
            <div className="max-w-md mx-auto">
              <div className="group relative bg-white rounded-3xl shadow-xl overflow-hidden transform hover:scale-105 hover:rotate-1 transition-all duration-500 hover:shadow-2xl">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-plum-800 mb-2">{selectedItem.name}</h3>
                  <p className="text-gray-600 mb-4">{selectedItem.category}</p>
                  <div className="text-2xl font-bold text-plum-600">${selectedItem.price}</div>
                </div>
                <div className="absolute top-4 right-4 bg-rosegold-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Selected
                </div>
              </div>
              
              <button
                onClick={() => setCurrentStep(2)}
                className="mt-8 px-8 py-4 bg-gradient-to-r from-plum-600 to-plum-500 text-white font-semibold rounded-2xl hover:from-plum-500 hover:to-plum-400 transition-all duration-300 transform hover:scale-105"
              >
                Customize This Item
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Describe Your Dream Fit */}
      {currentStep === 2 && (
        <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-playfair font-bold text-plum-800">Describe Your Dream Fit</h2>
            <p className="text-xl text-gray-600">
              Tell our AI exactly how you want to customize this piece
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="space-y-6">
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Example: Add sleeves + scoliosis support, make it more fitted around the waist..."
                  className="w-full h-32 p-6 border-2 border-gray-200 rounded-2xl focus:border-plum-500 focus:ring-4 focus:ring-plum-100 transition-all duration-200 resize-none text-lg font-inter"
                  aria-label="Describe your customization"
                />
                
                {/* Voice Input Button */}
                <button
                  onClick={handleVoiceInput}
                  className={`absolute bottom-4 right-4 p-3 rounded-full transition-all duration-200 ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-plum-100 text-plum-600 hover:bg-plum-200'
                  }`}
                  aria-label="Voice input"
                  title="Click to speak your customization"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>

              {/* Example Prompts */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Try these examples:</p>
                <div className="flex flex-wrap gap-2">
                  {examplePrompts.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(example)}
                      className="px-4 py-2 bg-plum-50 text-plum-700 rounded-full text-sm hover:bg-plum-100 transition-colors"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                className="w-full py-4 bg-gradient-to-r from-rosegold-500 to-rosegold-400 text-white font-semibold text-lg rounded-2xl hover:from-rosegold-400 hover:to-rosegold-300 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3"
              >
                <Wand2 className="w-6 h-6" />
                <span>Generate AI Preview</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: AI Generation Loading */}
      {currentStep === 3 && isGenerating && (
        <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-playfair font-bold text-plum-800">AI is Creating Your Design</h2>
            <p className="text-xl text-gray-600">
              Our AI is analyzing your request and generating a custom preview...
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <SkeletonLoader variant="weaving" className="h-96 rounded-2xl" />
            
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-2 text-plum-600">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">Processing your customization...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Preview & Approval */}
      {currentStep === 4 && !isGenerating && generatedImage && (
        <div className="max-w-6xl mx-auto space-y-8 animate-slide-up">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-playfair font-bold text-plum-800">Your Custom Design</h2>
            <p className="text-xl text-gray-600">
              Slide to compare the original with your AI-customized version
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Before/After Slider */}
              <div className="space-y-4">
                <BeforeAfterSlider
                  beforeImage={selectedItem?.image_url || ''}
                  afterImage={generatedImage}
                  beforeLabel="Original"
                  afterLabel="AI Customized"
                  className="aspect-[3/4]"
                />
              </div>

              {/* Details & Actions */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-plum-800">Your Request</h3>
                  <div className="bg-plum-50 p-4 rounded-2xl">
                    <p className="text-plum-700 italic">"{prompt}"</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-plum-800">What's Next?</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-rosegold-500 rounded-full"></div>
                      <span>Handcrafted by our artisans</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-rosegold-500 rounded-full"></div>
                      <span>Quality control & finishing</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-rosegold-500 rounded-full"></div>
                      <span>Shipped to your door</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-rosegold-50 p-6 rounded-2xl">
                  <div className="text-center space-y-2">
                    <p className="text-2xl font-bold text-plum-800">$549</p>
                    <p className="text-sm text-gray-600">Base price + customization</p>
                    <p className="text-sm text-rosegold-600 font-medium">50% deposit required</p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleTweak}
                    disabled={isGenerating}
                    className="flex-1 py-3 border-2 border-plum-300 text-plum-700 font-semibold rounded-2xl hover:bg-plum-50 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <RotateCcw className="w-5 h-5" />
                    )}
                    <span>Tweak Design</span>
                  </button>
                  
                  <button
                    onClick={handleApprove}
                    className="flex-1 py-3 bg-gradient-to-r from-plum-600 to-plum-500 text-white font-semibold rounded-2xl hover:from-plum-500 hover:to-plum-400 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Approve & Order</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AICustomizationFlow;