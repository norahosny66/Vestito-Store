import React, { useState, useEffect } from 'react';
import { X, CreditCard, Lock, Loader2, CheckCircle } from 'lucide-react';
import { customizationsService, ordersService } from '../../services/database';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customizationId: string;
  userEmail: string;
  amount: number; // in dollars
  itemName: string;
  description: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customizationId,
  userEmail,
  amount,
  itemName,
  description
}) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Card form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      setCardholderName('');
      setError(null);
      setSuccess(false);
      setProcessing(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setProcessing(true);
    setError(null);

    try {
      // Validate required fields
      if (!cardNumber.trim() || !expiryDate.trim() || !cvv.trim() || !cardholderName.trim()) {
        throw new Error('Please fill in all payment information');
      }

      // Simulate payment processing
      console.log('Processing payment for customization:', customizationId);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if using test card number
      const isTestCard = cardNumber.replace(/\s/g, '') === '4242424242424242';
      
      if (!isTestCard) {
        throw new Error('Please use test card number: 4242 4242 4242 4242');
      }

      console.log('Payment successful, updating customization...');

      // Update customization as deposit paid
      const updateSuccess = await customizationsService.updateDepositPaid(customizationId, true);
      
      if (!updateSuccess) {
        console.warn('Failed to update customization, but continuing...');
      }

      // Create order record
      const totalPrice = amount * 2; // Full price (deposit is 50%)
      const orderResult = await ordersService.create({
        user_email: userEmail,
        customization_id: customizationId,
        total_price: totalPrice,
        status: 'deposit_paid'
      });

      console.log('Order created:', orderResult);

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);

    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  // Check if form is valid
  const isFormValid = cardNumber.trim() && expiryDate.trim() && cvv.trim() && cardholderName.trim();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Secure Payment</h2>
                <p className="text-gray-600">Pay deposit to start production</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={processing}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600">Your customization is now in production.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Item:</span>
                    <span className="font-medium">{itemName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customization:</span>
                    <span className="font-medium">AI Design + Handcrafting</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deposit (50%):</span>
                    <span className="font-medium">${amount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>Total Due Now:</span>
                      <span>${amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="John Doe"
                    required
                    disabled={processing}
                  />
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    required
                    disabled={processing}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Expiry Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="12/25"
                      maxLength={5}
                      required
                      disabled={processing}
                    />
                  </div>

                  {/* CVV */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="123"
                      maxLength={4}
                      required
                      disabled={processing}
                    />
                  </div>
                </div>

                {/* Security Notice */}
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <Lock className="w-4 h-4" />
                  <span>Your payment information is encrypted and secure</span>
                </div>

                {/* Test Card Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-700 text-sm">
                    <strong>Demo Mode:</strong> Use test card number <code>4242 4242 4242 4242</code> with any future expiry date and CVV.
                  </p>
                </div>

                {/* Submit Button - Fixed positioning and visibility */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={processing || !isFormValid}
                    className="w-full bg-green-500 text-white font-semibold py-4 px-6 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        <span>Pay ${amount.toFixed(2)} Securely</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Debug info for form validation */}
                {!isFormValid && (
                  <div className="text-xs text-gray-500 text-center">
                    Please fill in all fields to enable payment
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;