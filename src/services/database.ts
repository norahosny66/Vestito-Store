import { supabase, Item, Customization, Order, CartItem } from '../lib/supabase';

// Fallback data for when database is not available
const fallbackItems: Item[] = [
  {
    id: '1',
    name: 'Elegant Silk Dress',
    price: 299,
    description: 'Luxurious silk dress with flowing silhouette. Perfect for special occasions with its timeless elegance and sophisticated design.',
    category: 'Dresses',
    image_url: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Burgundy', 'Emerald'],
    featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Premium Cotton Blazer',
    price: 189,
    description: 'Tailored cotton blazer with modern cut. Versatile piece that transitions seamlessly from office to evening.',
    category: 'Blazers',
    image_url: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=800',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Charcoal', 'Navy', 'Camel', 'White'],
    featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Cashmere Sweater',
    price: 245,
    description: 'Ultra-soft cashmere sweater with ribbed details. A luxury essential that provides comfort and sophistication.',
    category: 'Knitwear',
    image_url: 'https://images.pexels.com/photos/1381556/pexels-photo-1381556.jpeg?auto=compress&cs=tinysrgb&w=800',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Cream', 'Grey', 'Blush', 'Black'],
    featured: false,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Designer Midi Skirt',
    price: 159,
    description: 'Elegant midi skirt with A-line silhouette. Features high-quality fabric and impeccable tailoring for a flattering fit.',
    category: 'Skirts',
    image_url: 'https://images.pexels.com/photos/1462637/pexels-photo-1462637.jpeg?auto=compress&cs=tinysrgb&w=800',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Navy', 'Olive', 'Rust'],
    featured: true,
    created_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Linen Shirt',
    price: 129,
    description: 'Breathable linen shirt with relaxed fit. Perfect for warm weather styling with its natural texture and comfortable feel.',
    category: 'Shirts',
    image_url: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['White', 'Light Blue', 'Sage', 'Sand'],
    featured: false,
    created_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Evening Gown',
    price: 459,
    description: 'Stunning evening gown with intricate beadwork. Makes a statement at formal events with its dramatic silhouette.',
    category: 'Dresses',
    image_url: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Deep Blue', 'Burgundy', 'Gold'],
    featured: true,
    created_at: new Date().toISOString()
  }
];

// Helper function to create timeout promise
const createTimeoutPromise = (ms: number) => {
  return new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Database timeout')), ms);
  });
};

// Items service
export const itemsService = {
  async getAll(): Promise<Item[]> {
    try {
      console.log('Fetching all items...');
      
      const queryPromise = supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      const { data, error } = await Promise.race([
        queryPromise,
        createTimeoutPromise(8000)
      ]);

      if (error) {
        console.warn('Database error, using fallback data:', error.message);
        return fallbackItems;
      }

      console.log('Database query successful, items found:', data?.length || 0);
      return data && data.length > 0 ? data : fallbackItems;
    } catch (error) {
      console.warn('Network/timeout error, using fallback data:', error);
      return fallbackItems;
    }
  },

  async getById(id: string): Promise<Item | null> {
    try {
      console.log('Fetching item by ID:', id);
      
      const queryPromise = supabase
        .from('items')
        .select('*')
        .eq('id', id)
        .single();

      const { data, error } = await Promise.race([
        queryPromise,
        createTimeoutPromise(5000)
      ]);

      if (error) {
        console.warn('Database error, using fallback data:', error.message);
        return fallbackItems.find(item => item.id === id) || null;
      }

      return data;
    } catch (error) {
      console.warn('Network/timeout error, using fallback data:', error);
      return fallbackItems.find(item => item.id === id) || null;
    }
  },

  async getFeatured(): Promise<Item[]> {
    try {
      console.log('Fetching featured items...');
      
      const queryPromise = supabase
        .from('items')
        .select('*')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      const { data, error } = await Promise.race([
        queryPromise,
        createTimeoutPromise(5000)
      ]);

      if (error) {
        console.warn('Database error, using fallback data:', error.message);
        return fallbackItems.filter(item => item.featured);
      }

      console.log('Featured items query successful, items found:', data?.length || 0);
      return data && data.length > 0 ? data : fallbackItems.filter(item => item.featured);
    } catch (error) {
      console.warn('Network/timeout error, using fallback data:', error);
      return fallbackItems.filter(item => item.featured);
    }
  },

  async getByCategory(category: string): Promise<Item[]> {
    try {
      const queryPromise = supabase
        .from('items')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      const { data, error } = await Promise.race([
        queryPromise,
        createTimeoutPromise(5000)
      ]);

      if (error) {
        console.warn('Database error, using fallback data:', error.message);
        return fallbackItems.filter(item => item.category === category);
      }

      return data || fallbackItems.filter(item => item.category === category);
    } catch (error) {
      console.warn('Network/timeout error, using fallback data:', error);
      return fallbackItems.filter(item => item.category === category);
    }
  },

  async getCategories(): Promise<string[]> {
    try {
      const queryPromise = supabase
        .from('items')
        .select('category')
        .order('category');

      const { data, error } = await Promise.race([
        queryPromise,
        createTimeoutPromise(5000)
      ]);

      if (error) {
        console.warn('Database error, using fallback data:', error.message);
        return [...new Set(fallbackItems.map(item => item.category))];
      }

      const categories = [...new Set(data?.map(item => item.category) || [])];
      return categories.length > 0 ? categories : [...new Set(fallbackItems.map(item => item.category))];
    } catch (error) {
      console.warn('Network/timeout error, using fallback data:', error);
      return [...new Set(fallbackItems.map(item => item.category))];
    }
  }
};

// Cart service
export const cartService = {
  async addToCart(cartItem: {
    item_id: string;
    user_email: string;
    size: string;
    color: string;
    quantity: number;
  }): Promise<CartItem | null> {
    try {
      console.log('Adding item to cart:', cartItem);
      
      // Check if item already exists in cart with timeout
      const existingQuery = supabase
        .from('cart_items')
        .select('*')
        .eq('item_id', cartItem.item_id)
        .eq('user_email', cartItem.user_email)
        .eq('size', cartItem.size)
        .eq('color', cartItem.color)
        .single();

      const { data: existingItem } = await Promise.race([
        existingQuery,
        createTimeoutPromise(3000)
      ]).catch(() => ({ data: null }));

      if (existingItem) {
        // Update quantity
        const updateQuery = supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + cartItem.quantity })
          .eq('id', existingItem.id)
          .select()
          .single();

        const { data, error } = await Promise.race([
          updateQuery,
          createTimeoutPromise(3000)
        ]);

        if (error) {
          console.error('Error updating cart item:', error);
          return null;
        }
        return data;
      } else {
        // Add new item
        const insertQuery = supabase
          .from('cart_items')
          .insert([cartItem])
          .select()
          .single();

        const { data, error } = await Promise.race([
          insertQuery,
          createTimeoutPromise(3000)
        ]);

        if (error) {
          console.error('Error adding to cart:', error);
          return null;
        }
        return data;
      }
    } catch (error) {
      console.error('Error in addToCart:', error);
      return null;
    }
  },

  async getCartItems(userEmail: string): Promise<CartItem[]> {
    try {
      console.log('Fetching cart items for user:', userEmail);
      
      const queryPromise = supabase
        .from('cart_items')
        .select(`
          *,
          items (
            id,
            name,
            price,
            image_url,
            category
          )
        `)
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      const { data, error } = await Promise.race([
        queryPromise,
        createTimeoutPromise(5000)
      ]);

      if (error) {
        console.error('Error fetching cart items:', error);
        return [];
      }

      console.log('Cart items fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getCartItems:', error);
      return [];
    }
  },

  async updateQuantity(id: string, quantity: number): Promise<boolean> {
    try {
      const queryPromise = supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', id);

      const { error } = await Promise.race([
        queryPromise,
        createTimeoutPromise(3000)
      ]);

      if (error) {
        console.error('Error updating quantity:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in updateQuantity:', error);
      return false;
    }
  },

  async removeFromCart(id: string): Promise<boolean> {
    try {
      const queryPromise = supabase
        .from('cart_items')
        .delete()
        .eq('id', id);

      const { error } = await Promise.race([
        queryPromise,
        createTimeoutPromise(3000)
      ]);

      if (error) {
        console.error('Error removing from cart:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in removeFromCart:', error);
      return false;
    }
  },

  async clearCart(userEmail: string): Promise<boolean> {
    try {
      const queryPromise = supabase
        .from('cart_items')
        .delete()
        .eq('user_email', userEmail);

      const { error } = await Promise.race([
        queryPromise,
        createTimeoutPromise(3000)
      ]);

      if (error) {
        console.error('Error clearing cart:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in clearCart:', error);
      return false;
    }
  }
};

// Customizations service
export const customizationsService = {
  async create(customization: {
    user_email: string;
    item_id: string;
    prompt: string;
    ai_image_url?: string;
  }): Promise<Customization | null> {
    try {
      console.log('Creating customization:', customization);
      
      const queryPromise = supabase
        .from('customizations')
        .insert([customization])
        .select()
        .single();

      const { data, error } = await Promise.race([
        queryPromise,
        createTimeoutPromise(5000)
      ]);

      if (error) {
        console.error('Error creating customization:', error);
        // For demo purposes, create a mock customization
        return {
          id: `mock_${Date.now()}`,
          user_email: customization.user_email,
          item_id: customization.item_id,
          prompt: customization.prompt,
          ai_image_url: customization.ai_image_url || null,
          deposit_paid: false,
          approved: false,
          created_at: new Date().toISOString()
        };
      }

      return data;
    } catch (error) {
      console.error('Error in create customization:', error);
      return {
        id: `mock_${Date.now()}`,
        user_email: customization.user_email,
        item_id: customization.item_id,
        prompt: customization.prompt,
        ai_image_url: customization.ai_image_url || null,
        deposit_paid: false,
        approved: false,
        created_at: new Date().toISOString()
      };
    }
  },

  async getByUserEmail(userEmail: string): Promise<Customization[]> {
    try {
      console.log('Fetching customizations for user:', userEmail);
      
      const queryPromise = supabase
        .from('customizations')
        .select(`
          *,
          items (
            id,
            name,
            price,
            image_url,
            category
          )
        `)
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      const { data, error } = await Promise.race([
        queryPromise,
        createTimeoutPromise(5000)
      ]);

      if (error) {
        console.error('Error fetching user customizations:', error);
        return [];
      }

      console.log('Customizations fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getByUserEmail customizations:', error);
      return [];
    }
  },

  async updateApproval(id: string, approved: boolean): Promise<boolean> {
    try {
      const queryPromise = supabase
        .from('customizations')
        .update({ approved })
        .eq('id', id);

      const { error } = await Promise.race([
        queryPromise,
        createTimeoutPromise(3000)
      ]);

      if (error) {
        console.error('Error updating customization approval:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateApproval:', error);
      return false;
    }
  },

  async updateDepositPaid(id: string, depositPaid: boolean): Promise<boolean> {
    try {
      const queryPromise = supabase
        .from('customizations')
        .update({ deposit_paid: depositPaid })
        .eq('id', id);

      const { error } = await Promise.race([
        queryPromise,
        createTimeoutPromise(3000)
      ]);

      if (error) {
        console.error('Error updating deposit status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateDepositPaid:', error);
      return false;
    }
  },

  async updateAiImageUrl(id: string, aiImageUrl: string): Promise<boolean> {
    try {
      const queryPromise = supabase
        .from('customizations')
        .update({ ai_image_url: aiImageUrl })
        .eq('id', id);

      const { error } = await Promise.race([
        queryPromise,
        createTimeoutPromise(3000)
      ]);

      if (error) {
        console.error('Error updating AI image URL:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateAiImageUrl:', error);
      return false;
    }
  }
};

// Orders service
export const ordersService = {
  async create(order: {
    user_email: string;
    item_id?: string;
    customization_id?: string;
    total_price: number;
    status?: string;
    shipping_address?: any;
  }): Promise<Order | null> {
    try {
      console.log('Creating order:', order);
      
      const queryPromise = supabase
        .from('orders')
        .insert([{ ...order, status: order.status || 'pending' }])
        .select()
        .single();

      const { data, error } = await Promise.race([
        queryPromise,
        createTimeoutPromise(5000)
      ]);

      if (error) {
        console.error('Error creating order:', error);
        // For demo purposes, create a mock order
        return {
          id: `order_${Date.now()}`,
          user_email: order.user_email,
          item_id: order.item_id,
          customization_id: order.customization_id,
          total_price: order.total_price,
          status: order.status || 'pending',
          shipping_address: order.shipping_address,
          created_at: new Date().toISOString()
        };
      }

      return data;
    } catch (error) {
      console.error('Error in create order:', error);
      return {
        id: `order_${Date.now()}`,
        user_email: order.user_email,
        item_id: order.item_id,
        customization_id: order.customization_id,
        total_price: order.total_price,
        status: order.status || 'pending',
        shipping_address: order.shipping_address,
        created_at: new Date().toISOString()
      };
    }
  },

  async getByUserEmail(userEmail: string): Promise<Order[]> {
    try {
      console.log('Fetching orders for user:', userEmail);
      
      const queryPromise = supabase
        .from('orders')
        .select(`
          *,
          items (
            id,
            name,
            price,
            image_url,
            category
          )
        `)
        .eq('user_email', userEmail)
        .order('created_at', { ascending: false });

      const { data, error } = await Promise.race([
        queryPromise,
        createTimeoutPromise(5000)
      ]);

      if (error) {
        console.error('Error fetching user orders:', error);
        return [];
      }

      console.log('Orders fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Error in getByUserEmail orders:', error);
      return [];
    }
  },

  async updateStatus(id: string, status: string): Promise<boolean> {
    try {
      const queryPromise = supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

      const { error } = await Promise.race([
        queryPromise,
        createTimeoutPromise(3000)
      ]);

      if (error) {
        console.error('Error updating order status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateStatus:', error);
      return false;
    }
  }
};