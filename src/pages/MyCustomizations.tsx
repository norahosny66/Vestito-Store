import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { customizationsService } from '../services/database';
import { Customization } from '../lib/supabase';
import { Palette, Clock, CheckCircle, CreditCard, Eye, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyCustomizations: React.FC = () => {
  const [customizations, setCustomizations] = useState<Customization[]>([]);
  const [loading, setLoading] = useState(true);
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
                  <div className="grid grid-cols-2 gap-4 text-sm">
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
                  {customization.approved && !customization.deposit_paid && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <button className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
                        Pay Deposit ($274.50)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCustomizations;