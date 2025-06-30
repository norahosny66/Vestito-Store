import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import PremiumHeader from './components/layout/PremiumHeader';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import MyCustomizations from './pages/MyCustomizations';
import MyOrders from './pages/MyOrders';
import Cart from './pages/Cart';
import Admin from './pages/Admin';
import AuthCallback from './pages/AuthCallback';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col font-inter">
            <PremiumHeader />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/my-customizations" element={<MyCustomizations />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/about" element={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-plum-50 to-rosegold-50"><h1 className="text-4xl font-playfair font-bold text-plum-800">About Us - Coming Soon</h1></div>} />
                <Route path="/contact" element={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-plum-50 to-rosegold-50"><h1 className="text-4xl font-playfair font-bold text-plum-800">Contact - Coming Soon</h1></div>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;