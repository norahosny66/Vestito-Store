import React, { useState, useEffect } from 'react';
import { Check, X, Download, Heart } from 'lucide-react';
import { base64ToImageUrl } from '../../services/togetherAI';
import PaymentModal from '../payment/PaymentModal';

interface PreviewModalProps {
  isOpen: boolean;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
  productName: string;
  customizationPrompt: string;
  customizedImageData?: string;
  originalImage: string;
  customizationId?: string;
  userEmail?: string;
  basePrice?: number;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onApprove,
  onReject,
  onClose,
  productName,
  customizationPrompt,
  customizedImageData,
  originalImage,
  customizationId,
  userEmail,
  basePrice = 299
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [customizedImageUrl, setCustomizedImageUrl] = useState<string>('');
  const [showPayment, setShowPayment] = useState(false);

  const customizationFee = 150;
  const handcraftingFee = 100;
  const totalPrice = basePrice + customizationFee + handcraftingFee;
  const depositAmount = totalPrice * 0.5;

  useEffect(() => {
    if (customizedImageData) {
      const imageUrl = base64ToImageUrl(customizedImageData);
      setCustomizedImageUrl(imageUrl);
      
      // Cleanup function to revoke the object URL when component unmounts
      return () => {
        if (imageUrl) {
          URL.revokeObjectURL(imageUrl);
        }
      };
    }
  }, [customizedImageData]);

  if (!isOpen) return null;

  const handleApprove = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    
    // Show payment modal instead of calling onApprove directly
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    onApprove();
  };

  const handleDownload = () => {
    if (customizedImageUrl) {
      const link = document.createElement('a');
      link.href = customizedImageUrl;
      link.download = `customized-${productName.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">AI-Generated Design Preview</h2>
                <p className="text-gray-600">Review your customized {productName}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Comparison */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {/* Original Image */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900 text-center">Original</h3>
                    <div className="relative aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden">
                      <img
                        src={originalImage}
                        alt="Original Design"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Customized Image */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-900 text-center">AI Customized</h3>
                    <div className="relative aspect-[3/4] bg-gray-100 rounded-2xl overflow-hidden">
                      {customizedImageUrl ? (
                        <>
                          <img
                            src={customizedImageUrl}
                            alt="Customized Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-4 right-4 space-x-2">
                            <button 
                              onClick={handleDownload}
                              className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                              title="Download customized image"
                            >
                              <Download className="w-4 h-4 text-gray-700" />
                            </button>
                            <button className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
                              <Heart className="w-4 h-4 text-gray-700" />
                            </button>
                          </div>
                          <div className="absolute bottom-4 left-4">
                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                              AI Generated
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <p className="text-gray-500">No customized image available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 text-center">
                  This AI-generated preview shows how your customization might look. The final handcrafted product may vary slightly.
                </p>
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Customization Request</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 italic">"{customizationPrompt}"</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">What's Next?</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span>Our artisans will handcraft your piece based on this AI preview</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span>Quality control and finishing touches applied</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span>Professional photography of your finished piece</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span>Careful packaging and shipping to your address</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">Production Process</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Approve this AI preview to proceed with handcrafting</li>
                    <li>• Pay a 50% deposit to begin production</li>
                    <li>• Receive progress updates via email</li>
                    <li>• Final payment due upon completion</li>
                  </ul>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Base Price:</span>
                    <span className="font-semibold">${basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">AI Customization Fee:</span>
                    <span className="font-semibold">${customizationFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Handcrafting Fee:</span>
                    <span className="font-semibold">${handcraftingFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <span className="text-lg font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Deposit Required:</span>
                      <span>${depositAmount.toFixed(2)} (50%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={onReject}
                className="flex-1 flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-5 h-5 mr-2" />
                Request Changes
              </button>
              <button
                onClick={handleApprove}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Check className="w-5 h-5 mr-2" />
                {isLoading ? 'Processing...' : 'Approve & Pay Deposit'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && customizationId && userEmail && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
          customizationId={customizationId}
          userEmail={userEmail}
          amount={depositAmount}
          itemName={productName}
          description={`Deposit for ${productName} customization`}
        />
      )}
    </>
  );
};

export default PreviewModal;