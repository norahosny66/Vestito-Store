import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ordersService } from '../services/database';
import { Order } from '../lib/supabase';
import { Package, Clock, CheckCircle, Truck, Eye, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;

    setLoading(true);
    const data = await ordersService.getByUserEmail(user.email!);
    setOrders(data);
    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'paid':
      case 'deposit_paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Payment Pending';
      case 'paid':
        return 'Paid';
      case 'deposit_paid':
        return 'Deposit Paid - In Production';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
      case 'deposit_paid':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const downloadCustomizationImage = (order: Order) => {
    if (order.customizations?.ai_image_url) {
      const link = document.createElement('a');
      link.href = order.customizations.ai_image_url.startsWith('data:') 
        ? order.customizations.ai_image_url 
        : `data:image/png;base64,${order.customizations.ai_image_url}`;
      link.download = `custom-design-${order.id.slice(-8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view your orders.</p>
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
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Orders</h1>
          <p className="text-gray-600">Track your orders and view order history.</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <div className="mt-1">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {order.customization_id ? 'Custom Design' : 'Regular Order'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{getStatusText(order.status)}</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900 mt-2">
                        ${order.total_price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-gray-200 pt-4">
                    {order.customization_id && order.customizations ? (
                      // Custom Design Order
                      <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={order.customizations.items?.image_url || 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800'}
                              alt={order.customizations.items?.name || 'Custom Item'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              Custom Design: {order.customizations.items?.name || 'Unknown Item'}
                            </h4>
                            <p className="text-sm text-gray-500">{order.customizations.items?.category}</p>
                            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <p className="text-sm text-amber-800">
                                <strong>Your Customization:</strong> "{order.customizations.prompt}"
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <button 
                              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            {order.customizations.ai_image_url && (
                              <button 
                                onClick={() => downloadCustomizationImage(order)}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                title="Download AI Preview"
                              >
                                <Download className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* AI Generated Preview */}
                        {order.customizations.ai_image_url && (
                          <div className="mt-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">AI-Generated Preview:</h5>
                            <div className="w-32 h-40 bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={order.customizations.ai_image_url.startsWith('data:') 
                                  ? order.customizations.ai_image_url 
                                  : `data:image/png;base64,${order.customizations.ai_image_url}`}
                                alt="AI Generated Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : order.items ? (
                      // Regular Order
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={order.items.image_url}
                            alt={order.items.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{order.items.name}</h4>
                          <p className="text-sm text-gray-500">{order.items.category}</p>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        <p>Order details not available</p>
                      </div>
                    )}
                  </div>

                  {/* Order Actions */}
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      {order.status === 'shipped' && (
                        <p>Tracking: <span className="font-medium">1Z999AA1234567890</span></p>
                      )}
                      {order.status === 'delivered' && (
                        <p className="text-green-600">✓ Delivered successfully</p>
                      )}
                      {order.status === 'deposit_paid' && (
                        <p className="text-blue-600">✓ Deposit paid - Your item is in production</p>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        View Details
                      </button>
                      {(order.status === 'delivered' || order.status === 'completed') && (
                        <button className="px-4 py-2 text-sm font-medium text-amber-600 border border-amber-300 rounded-lg hover:bg-amber-50 transition-colors">
                          Reorder
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;