import React, { useState, useEffect } from 'react';
import { Users, Package, Palette, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { customizationsService, ordersService } from '../services/database';
import { Customization, Order } from '../lib/supabase';
import { Link } from 'react-router-dom';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'customizations'>('overview');
  const [customizations, setCustomizations] = useState<Customization[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Check if user should have admin access
  const isAdmin = user?.email === 'admin@ateliercouture.com' || 
                  user?.email?.includes('admin') || 
                  user?.email === 'admin@example.com';

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // Load all customizations and orders for admin view
      const [customizationsData, ordersData] = await Promise.all([
        customizationsService.getAll(),
        ordersService.getAll()
      ]);
      
      setCustomizations(customizationsData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    totalOrders: orders.length,
    pendingCustomizations: customizations.filter(c => !c.approved).length,
    monthlyRevenue: orders.reduce((sum, order) => sum + order.total_price, 0),
    completedOrders: orders.filter(o => o.status === 'delivered' || o.status === 'completed').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'deposit_paid': return 'bg-green-100 text-green-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'deposit_paid': return <CheckCircle className="w-4 h-4" />;
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Package className="w-4 h-4" />;
      case 'shipped': return <Package className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to access the admin panel.</p>
          <Link to="/" className="text-amber-600 hover:text-amber-700">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Customer Account</h1>
          <p className="text-gray-600 mb-6">
            You're signed in as a customer. Access your personal dashboard below.
          </p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              For demo purposes, use an email containing "admin" to access the admin panel.
            </p>
            <div className="flex space-x-4 justify-center">
              <Link
                to="/my-orders"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                View My Orders
              </Link>
              <Link
                to="/my-customizations"
                className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
              >
                View My Customizations
              </Link>
              <Link
                to="/shop"
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your custom orders and track business performance.</p>
          <div className="mt-2 text-sm text-green-600">
            ✓ Signed in as Administrator ({user.email})
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200">
            {[
              { key: 'overview', label: 'Overview', icon: TrendingUp },
              { key: 'customizations', label: 'Customizations', icon: Palette },
              { key: 'orders', label: 'Orders', icon: Package }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === key
                    ? 'border-b-2 border-amber-500 text-amber-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Pending Customizations</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingCustomizations}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <Palette className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Completed Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status.replace('_', ' ')}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Order #{order.id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.customization_id ? 'Custom Design' : 'Regular Order'} • {order.user_email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${order.total_price.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customizations Tab */}
        {activeTab === 'customizations' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Customization Requests</h3>
              <p className="text-gray-600 mt-1">Manage customer customization requests and approvals.</p>
            </div>
            <div className="p-6">
              {customizations.length === 0 ? (
                <div className="text-center py-12">
                  <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Customizations</h4>
                  <p className="text-gray-600">No customization requests found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customizations.map((customization) => (
                    <div key={customization.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <img
                              src={customization.items?.image_url}
                              alt={customization.items?.name}
                              className="w-16 h-20 object-cover rounded-lg"
                            />
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {customization.items?.name || 'Unknown Item'}
                              </h4>
                              <p className="text-sm text-gray-500">{customization.user_email}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                Base Price: ${customization.items?.price || 0}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 italic mb-2">"{customization.prompt}"</p>
                          <p className="text-xs text-gray-500">
                            Created: {new Date(customization.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="ml-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            customization.deposit_paid 
                              ? 'bg-green-100 text-green-800'
                              : customization.approved 
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {customization.deposit_paid 
                              ? 'In Production'
                              : customization.approved 
                              ? 'Awaiting Deposit'
                              : 'Pending Review'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Order Management</h3>
              <p className="text-gray-600 mt-1">Track and manage customer orders.</p>
            </div>
            <div className="p-6">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Orders</h4>
                  <p className="text-gray-600">No orders found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            {/* Show image from either regular item or customization */}
                            <img
                              src={order.items?.image_url || order.customizations?.items?.image_url || 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800'}
                              alt={order.items?.name || order.customizations?.items?.name || 'Order Item'}
                              className="w-16 h-20 object-cover rounded-lg"
                            />
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                Order #{order.id.slice(-8).toUpperCase()}
                              </h4>
                              <p className="text-sm text-gray-500">{order.user_email}</p>
                              <p className="text-sm text-gray-600">
                                {order.customization_id ? (
                                  <>
                                    <span className="font-medium">Custom:</span> {order.customizations?.items?.name}
                                    <br />
                                    <span className="italic">"{order.customizations?.prompt}"</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="font-medium">Item:</span> {order.items?.name}
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            Created: {new Date(order.created_at).toLocaleDateString()} • 
                            Type: {order.customization_id ? 'Custom Design' : 'Regular Order'}
                          </p>
                        </div>
                        <div className="ml-4 text-right">
                          <p className="font-semibold text-gray-900 mb-2">${order.total_price.toFixed(2)}</p>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;