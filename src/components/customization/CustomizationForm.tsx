import React, { useState } from 'react';
import { Wand2, Upload, Palette, Ruler, Shirt, Loader2, AlertTriangle, Settings, Mic, MicOff } from 'lucide-react';
import { generateCustomizedImage, checkTogetherAIConfig } from '../../services/togetherAI';

interface CustomizationFormProps {
  onSubmit: (customization: CustomizationData) => void;
  onClose: () => void;
  productImage: string;
  productName: string;
}

export interface CustomizationData {
  prompt: string;
  category: string;
  urgency: string;
  contactEmail: string;
  customizedImageData?: string;
}

const CustomizationForm: React.FC<CustomizationFormProps> = ({ 
  onSubmit, 
  onClose, 
  productImage, 
  productName 
}) => {
  const [formData, setFormData] = useState<CustomizationData>({
    prompt: '',
    category: 'design',
    urgency: 'standard',
    contactEmail: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [showApiKeyHelp, setShowApiKeyHelp] = useState(false);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Check Together AI configuration
  const { configured: isTogetherAIConfigured, message: configMessage } = checkTogetherAIConfig();

  // Check ElevenLabs configuration
  const checkElevenLabsConfig = () => {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    return apiKey && apiKey !== 'your_elevenlabs_api_key_here' && apiKey.length > 10;
  };

  const isVoiceConfigured = checkElevenLabsConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isTogetherAIConfigured) {
      setShowApiKeyHelp(true);
      return;
    }
    
    setIsSubmitting(true);
    setGenerationStatus('Generating your customized design...');
    
    try {
      // Generate customized image using Together AI
      const result = await generateCustomizedImage({
        prompt: formData.prompt,
        imageUrl: productImage
      });
      
      if (result.success && result.imageData) {
        setGenerationStatus('Design generated successfully!');
        
        // Add the generated image data to form data
        const customizationWithImage = {
          ...formData,
          customizedImageData: result.imageData
        };
        
        // Small delay to show success message
        setTimeout(() => {
          onSubmit(customizationWithImage);
          setIsSubmitting(false);
        }, 1000);
      } else {
        throw new Error(result.error || 'Failed to generate customized image');
      }
    } catch (error) {
      console.error('Customization error:', error);
      setGenerationStatus('');
      setIsSubmitting(false);
      
      // Show error to user with helpful message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('API key')) {
        setShowApiKeyHelp(true);
      } else {
        alert(`Error generating customized design: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`);
      }
    }
  };

  const startRecording = async () => {
    try {
      setVoiceError(null);
      
      // Check if voice is configured
      if (!isVoiceConfigured) {
        setVoiceError('Voice service not configured. Please use text input.');
        return;
      }
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create MediaRecorder instance
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);
      
      const chunks: Blob[] = [];
      setAudioChunks(chunks);
      
      // Set up event listeners
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        sendAudioToElevenLabs(chunks);
      };
      
      recorder.onerror = (event) => {
        console.error('Recording error:', event);
        setVoiceError('Recording failed. Please try again.');
        setIsRecording(false);
      };
      
      // Start recording
      recorder.start();
      setIsRecording(true);
      
      // Auto-stop after 15 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          setIsRecording(false);
        }
      }, 15000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setVoiceError('Microphone access denied or not available');
    }
  };

  const sendAudioToElevenLabs = async (chunks: Blob[]) => {
    if (chunks.length === 0) {
      setVoiceError('No speech detected. Please try speaking again.');
      return;
    }

    setIsTranscribing(true);
    setVoiceError(null);

    try {
      // Create audio blob
      const audioBlob = new Blob(chunks, { type: 'audio/webm' });
      
      // Create FormData
      const formData = new FormData();
      formData.append('audio_file', audioBlob, 'recording.webm');

      // Get ElevenLabs API key
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || 'sk_44b44548b0a9269f46517d67484e3c1b9a0f0af429304364';
      
      console.log('🎤 Sending audio to ElevenLabs for transcription...');
      console.log('🔑 Using API key:', apiKey.substring(0, 10) + '...');

      const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
        },
        body: formData,
      });

      console.log('📥 ElevenLabs response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ ElevenLabs API error:', errorText);
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('🎤 Transcription result:', result);

      if (result.text && result.text.trim()) {
        // Prefix the transcribed text with product context
        const prefixedText = `Make this ${productName} with ${result.text.trim()}`;
        
        // Update the prompt field
        setFormData(prev => ({ ...prev, prompt: prefixedText }));
        
        console.log('✅ Voice input processed successfully');
        
        // Show success message
        const successMessage = `Voice input successful! Added: "${result.text.trim()}"`;
        setVoiceError(null);
        
        // Optional: Auto-trigger AI generation if we have a valid prompt
        // setTimeout(() => {
        //   if (isTogetherAIConfigured) {
        //     handleSubmit(new Event('submit') as any);
        //   }
        // }, 500);
        
      } else {
        setVoiceError('No speech detected. Please try speaking again.');
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setVoiceError('Voice service unavailable. Please use text input.');
    } finally {
      setIsTranscribing(false);
      setAudioChunks([]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const customizationExamples = [
    "Make the sleeves longer and add lace details",
    "Change the color to lavender with gold accents",
    "Extend the dress to knee-length",
    "Add a belt and make it more fitted at the waist",
    "Convert to off-shoulder style with flowing fabric"
  ];

  // API Key Help Modal
  if (showApiKeyHelp) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">API Configuration Required</h2>
                  <p className="text-gray-600">Together AI API key is needed for AI customization</p>
                </div>
              </div>
              <button
                onClick={() => setShowApiKeyHelp(false)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">Configuration Issue</h3>
              <p className="text-red-700 text-sm">{configMessage}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">How to Fix This:</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Step 1: Get Your API Key</h4>
                  <ol className="text-blue-700 text-sm space-y-1 list-decimal list-inside">
                    <li>Visit <a href="https://api.together.xyz/settings/api-keys" target="_blank" rel="noopener noreferrer" className="underline">Together AI API Keys</a></li>
                    <li>Sign up or log in to your account</li>
                    <li>Create a new API key</li>
                    <li>Copy the API key (starts with something like "abc123...")</li>
                  </ol>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Step 2: Configure for Netlify</h4>
                  <ol className="text-green-700 text-sm space-y-1 list-decimal list-inside">
                    <li>Go to your <a href="https://app.netlify.com" target="_blank" rel="noopener noreferrer" className="underline">Netlify Dashboard</a></li>
                    <li>Select your site (vestitostore)</li>
                    <li>Go to Site settings → Environment variables</li>
                    <li>Add a new variable:
                      <div className="bg-white border rounded p-2 mt-1 font-mono text-xs">
                        <strong>Key:</strong> VITE_TOGETHER_API_KEY<br/>
                        <strong>Value:</strong> [your API key here]
                      </div>
                    </li>
                    <li>Save and redeploy your site</li>
                  </ol>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">Step 3: Test</h4>
                  <p className="text-amber-700 text-sm">
                    After adding the environment variable and redeploying, refresh this page and try the customization feature again.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setShowApiKeyHelp(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <a
                href="https://api.together.xyz/settings/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors text-center"
              >
                Get API Key
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Wand2 className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Customize Your Design</h2>
                <p className="text-gray-600">Tell us how you'd like to modify {productName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* API Configuration Status */}
          {!isTogetherAIConfigured && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-amber-600" />
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-800">Setup Required</h4>
                  <p className="text-amber-700 text-sm">{configMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowApiKeyHelp(true)}
                  className="px-3 py-1 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 transition-colors"
                >
                  Fix Now
                </button>
              </div>
            </div>
          )}

          {/* Voice Configuration Status */}
          {!isVoiceConfigured && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Mic className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-800">Voice Input Ready</h4>
                  <p className="text-blue-700 text-sm">Voice customization is configured and ready to use!</p>
                </div>
              </div>
            </div>
          )}

          {/* Voice Error Display */}
          {voiceError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <h4 className="font-semibold text-red-800">Voice Input Status</h4>
                  <p className="text-red-700 text-sm">{voiceError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Original Product Preview */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              Original Design
            </label>
            <div className="relative w-32 h-40 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={productImage}
                alt={productName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Customization Prompt with Voice Input */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              Describe Your Customization *
            </label>
            <div className="relative">
              <textarea
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                placeholder="Describe in detail how you'd like us to modify this piece..."
                className="w-full h-32 p-4 pr-16 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
                disabled={isSubmitting || isRecording || isTranscribing}
              />
              
              {/* Voice Input Button */}
              <div className="absolute bottom-4 right-4">
                {isTranscribing ? (
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isSubmitting || !isVoiceConfigured}
                    className={`p-3 rounded-full transition-all duration-200 ${
                      isRecording 
                        ? 'bg-red-500 text-white animate-pulse shadow-lg' 
                        : isVoiceConfigured
                        ? 'bg-plum-100 text-plum-600 hover:bg-plum-200'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                    title={
                      !isVoiceConfigured 
                        ? 'Voice input not configured' 
                        : isRecording 
                        ? 'Click to stop recording' 
                        : 'Describe your customization verbally'
                    }
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                )}
              </div>
            </div>
            
            {/* Voice Input Status */}
            {isRecording && (
              <div className="flex items-center space-x-2 text-sm text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>Recording... (auto-stops in 15s)</span>
              </div>
            )}
            
            {isTranscribing && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Converting speech to text...</span>
              </div>
            )}
            
            <p className="text-sm text-gray-500">
              Be as specific as possible. Include details about colors, measurements, style changes, etc.
              {isVoiceConfigured && (
                <>
                  <br />
                  <span className="text-plum-600 font-medium">💡 Try the microphone button to speak your customization!</span>
                </>
              )}
            </p>
          </div>

          {/* Example Prompts */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              Need Inspiration? Try These Examples:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {customizationExamples.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFormData({ ...formData, prompt: example })}
                  disabled={isSubmitting || isRecording || isTranscribing}
                  className="text-left p-3 text-sm bg-gray-50 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>

          {/* Customization Category */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              Type of Customization
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'design', label: 'Design Changes', icon: Palette },
                { id: 'fit', label: 'Fit Adjustments', icon: Ruler },
                { id: 'style', label: 'Style Modifications', icon: Shirt },
                { id: 'color', label: 'Color Changes', icon: Upload }
              ].map(({ id, label, icon: Icon }) => (
                <label key={id} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="category"
                    value={id}
                    checked={formData.category === id}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    disabled={isSubmitting || isRecording || isTranscribing}
                    className="text-amber-500 focus:ring-amber-500"
                  />
                  <Icon className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              Timeline Preference
            </label>
            <select
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
              disabled={isSubmitting || isRecording || isTranscribing}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="standard">Standard (5-7 business days) - Free</option>
              <option value="express">Express (2-3 business days) - +$50</option>
              <option value="rush">Rush (24-48 hours) - +$150</option>
            </select>
          </div>

          {/* Contact Email */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              Contact Email *
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="your.email@example.com"
              disabled={isSubmitting || isRecording || isTranscribing}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
            />
            <p className="text-sm text-gray-500">
              We'll send preview images and updates to this email address.
            </p>
          </div>

          {/* Generation Status */}
          {isSubmitting && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                <div>
                  <h4 className="font-semibold text-amber-800">AI Design Generation</h4>
                  <p className="text-sm text-amber-700">{generationStatus}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isRecording || isTranscribing}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.prompt.trim() || !formData.contactEmail.trim() || !isTogetherAIConfigured || isRecording || isTranscribing}
              className="flex-1 px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : !isTogetherAIConfigured ? (
                <span>Setup Required</span>
              ) : isRecording ? (
                <span>Recording...</span>
              ) : isTranscribing ? (
                <span>Processing Voice...</span>
              ) : (
                <span>Generate Custom Design</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomizationForm;