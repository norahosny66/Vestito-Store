import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem } from '../lib/supabase';
import { cartService } from '../services/database';
import { useAuth } from './AuthContext';

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  loading: boolean;
  addToCart: (item: {
    item_id: string;
    size: string;
    color: string;
    quantity: number;
  }) => Promise<boolean>;
  updateQuantity: (id: string, quantity: number) => Promise<boolean>;
  removeFromCart: (id: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    let mounted = true;

    if (user) {
      const loadCart = async () => {
        if (!mounted) return;
        
        setLoading(true);
        try {
          const items = await cartService.getCartItems(user.email!);
          if (mounted) {
            setCartItems(items);
          }
        } catch (error) {
          console.error('Error loading cart:', error);
          if (mounted) {
            setCartItems([]);
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

      loadCart();
    } else {
      setCartItems([]);
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [user]);

  const refreshCart = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const items = await cartService.getCartItems(user.email!);
      setCartItems(items);
    } catch (error) {
      console.error('Error refreshing cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item: {
    item_id: string;
    size: string;
    color: string;
    quantity: number;
  }) => {
    if (!user) return false;

    try {
      const result = await cartService.addToCart({
        ...item,
        user_email: user.email!
      });

      if (result) {
        await refreshCart();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      const success = await cartService.updateQuantity(id, quantity);
      if (success) {
        await refreshCart();
      }
      return success;
    } catch (error) {
      console.error('Error updating quantity:', error);
      return false;
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      const success = await cartService.removeFromCart(id);
      if (success) {
        await refreshCart();
      }
      return success;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  };

  const clearCart = async () => {
    if (!user) return false;

    try {
      const success = await cartService.clearCart(user.email!);
      if (success) {
        setCartItems([]);
      }
      return success;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  };

  const value = {
    cartItems,
    cartCount,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};