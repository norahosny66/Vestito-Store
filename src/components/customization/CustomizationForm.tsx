import React, { useState } from 'react';
import { Wand2, Upload, Palette, Ruler, Shirt, Loader2 } from 'lucide-react';
import { generateCustomizedImage } from '../../services/togetherAI';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      
      // Show error to user
      alert(`Error generating customized design: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check your API key and try again.`);
    }
  };

  const customizationExamples = [
    "Make the sleeves longer and add lace details",
    "Change the color to lavender with gold accents",
    "Extend the dress to knee-length",
    "Add a belt and make it more fitted at the waist",
    "Convert to off-shoulder style with flowing fabric"
  ];

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

          {/* Customization Prompt */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-900">
              Describe Your Customization *
            </label>
            <textarea
              value={formData.prompt}
              onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
              placeholder="Describe in detail how you'd like us to modify this piece..."
              className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              required
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-500">
              Be as specific as possible. Include details about colors, measurements, style changes, etc.
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
                  disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.prompt.trim() || !formData.contactEmail.trim()}
              className="flex-1 px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
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