import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { customizationsService } from '../services/database';
import { Customization } from '../lib/supabase';
import { Palette, Clock, CheckCircle, CreditCard, Eye, Download, Trash2, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import PaymentModal from '../components/payment/PaymentModal';

const MyCustomizations: React.FC = () => {
  const [customizations, setCustomizations] = useState<Customization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedCustomization, setSelectedCustomization] = useState<Customization | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCustomizations();
    }
  }, [user]);

  const loadCustomizations = async () => {
    if (!user) return;

    setLoading(true);
    const data = await customizationsService.getByUserEmail(user.email!);
    setCustomizations(data);
    setLoading(false);
  };

  const handleApprove = async (customization: Customization) => {
    try {
      const success = await customizationsService.updateApproval(customization.id, true);
      if (success) {
        // Show payment modal
        setSelectedCustomization(customization);
        setShowPayment(true);
      } else {
        alert('Failed to approve customization. Please try again.');
      }
    } catch (error) {
      console.error('Error approving customization:', error);
      alert('Error approving customization. Please try again.');
    }
  };

  const handleDelete = async (customizationId: string) => {
    if (!confirm('Are you sure you want to delete this customization? This action cannot be undone.')) {
      return;
    }

    try {
      // Note: We would need to add a delete method to the service
      // For now, we'll just show a message
      alert('Delete functionality would be implemented here. For demo purposes, customizations are preserved.');
    } catch (error) {
      console.error('Error deleting customization:', error);
      alert('Error deleting customization. Please try again.');
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setSelectedCustomization(null);
    loadCustomizations(); // Refresh the list
    alert('Payment successful! Your customization is now in production.');
  };

  const getStatusIcon = (customization: Customization) => {
    if (customization.deposit_paid) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (customization.approved) {
      return <CreditCard className="w-5 h-5 text-blue-500" />;
    } else {
      return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (customization: Customization) => {
    if (customization.deposit_paid) {
      return 'In Production';
    } else if (customization.approved) {
      return 'Awaiting Deposit';
    } else {
      return 'Pending Review';
    }
  };

  const getStatusColor = (customization: Customization) => {
    if (customization.deposit_paid) {
      return 'bg-green-100 text-green-800';
    } else if (customization.approved) {
      return 'bg-blue-100 text-blue-800';
    } else {
      return 'bg-yellow-100 text-yellow-800';
    }
  };

  const calculateDepositAmount = (basePrice: number) => {
    const customizationFee = 150;
    const handcraftingFee = 100;
    const totalPrice = basePrice + customizationFee + handcraftingFee;
    return totalPrice * 0.5; // 50% deposit
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view your customizations.</p>
          <Link to="/" className="text-amber-600 hover:text-amber-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your customizations...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">My Customizations</h1>
            <p className="text-gray-600">Track your custom design requests and their progress.</p>
          </div>

          {customizations.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Customizations Yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't created any custom designs yet. Browse our collection and start customizing!
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {customizations.map((customization) => (
                <div key={customization.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(customization)}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {customization.items?.name || 'Unknown Item'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {customization.items?.category}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(customization)}`}>
                        {getStatusText(customization)}
                      </span>
                    </div>

                    {/* Images */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {/* Original Image */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Original</h4>
                        <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={customization.items?.image_url}
                            alt="Original"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* AI Generated Image */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">AI Preview</h4>
                        <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden relative">
                          {customization.ai_image_url ? (
                            <>
                              <img
                                src={customization.ai_image_url.startsWith('data:') 
                                  ? customization.ai_image_url 
                                  : `data:image/png;base64,${customization.ai_image_url}`}
                                alt="AI Generated"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute top-2 right-2 space-x-1">
                                <button className="p-1 bg-white/90 rounded-full hover:bg-white transition-colors">
                                  <Eye className="w-3 h-3 text-gray-700" />
                                </button>
                                <button className="p-1 bg-white/90 rounded-full hover:bg-white transition-colors">
                                  <Download className="w-3 h-3 text-gray-700" />
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <p className="text-gray-500 text-sm">No preview available</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Prompt */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Your Request</h4>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 italic">"{customization.prompt}"</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Base Price:</span>
                        <span className="font-semibold ml-2">${customization.items?.price || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Created:</span>
                        <span className="font-semibold ml-2">
                          {new Date(customization.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Approved:</span>
                        <span className="font-semibold ml-2">
                          {customization.approved ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Deposit Paid:</span>
                        <span className="font-semibold ml-2">
                          {customization.deposit_paid ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-200">
                      {!customization.approved && !customization.deposit_paid && (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleApprove(customization)}
                            className="flex-1 bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Approve Design</span>
                          </button>
                          <button
                            onClick={() => handleDelete(customization.id)}
                            className="px-4 py-2 border border-red-300 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {customization.approved && !customization.deposit_paid && (
                        <button
                          onClick={() => {
                            setSelectedCustomization(customization);
                            setShowPayment(true);
                          }}
                          className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                        >
                          <DollarSign className="w-4 h-4" />
                          <span>Pay Deposit (${calculateDepositAmount(customization.items?.price || 0).toFixed(2)})</span>
                        </button>
                      )}

                      {customization.deposit_paid && (
                        <div className="text-center py-2">
                          <p className="text-green-600 font-medium">✓ In Production - You'll receive updates via email</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && selectedCustomization && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => {
            setShowPayment(false);
            setSelectedCustomization(null);
          }}
          onSuccess={handlePaymentSuccess}
          customizationId={selectedCustomization.id}
          userEmail={user?.email || ''}
          amount={calculateDepositAmount(selectedCustomization.items?.price || 0)}
          itemName={selectedCustomization.items?.name || 'Custom Item'}
          description={`Deposit for ${selectedCustomization.items?.name} customization`}
        />
      )}
    </>
  );
};

export default MyCustomizations;