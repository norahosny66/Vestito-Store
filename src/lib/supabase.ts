import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallback for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iidpiqbdilfrydxhviwt.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZHBpcWJkaWxmcnlkeGh2aXd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNzY5NjcsImV4cCI6MjA2NjY1Mjk2N30._tYbzXPYowhKrwCQfACxAGbz4DPwty0Acp1y929Aiks';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // Enable session detection from URL for email verification
    flowType: 'pkce' // Use PKCE flow for better security
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-my-custom-header': 'fashion-app',
    },
  },
});

// Test connection on initialization with better error handling
const testConnection = async () => {
  try {
    console.log('🔗 Testing Supabase connection...');
    
    const { data, error } = await supabase
      .from('items')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.warn('⚠️ Supabase connection issue:', error.message);
      console.log('🔄 Using fallback data for better user experience');
    } else {
      console.log('✅ Supabase connected successfully');
    }
  } catch (error) {
    console.warn('⚠️ Supabase connection failed:', error);
    console.log('🔄 Application will use fallback data');
  }
};

// Add global error handler for auth errors
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('🔄 Token refreshed successfully');
  } else if (event === 'SIGNED_OUT') {
    console.log('👋 User signed out');
    // Clear any remaining session data
    localStorage.removeItem(`sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`);
  } else if (event === 'SIGNED_IN') {
    console.log('✅ User signed in successfully');
  }
});

testConnection();

// Database types
export interface User {
  id: string;
  first_name: string;
  second_name: string;
  email: string;
  created_at: string;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image_url: string;
  sizes: string[];
  colors: string[];
  featured: boolean;
  created_at: string;
}

export interface Customization {
  id: string;
  user_email: string;
  item_id: string;
  prompt: string;
  ai_image_url: string | null;
  deposit_paid: boolean;
  approved: boolean;
  created_at: string;
  items?: Item;
}

export interface Order {
  id: string;
  user_email: string;
  item_id?: string;
  customization_id?: string;
  total_price: number;
  status: string;
  shipping_address?: any;
  created_at: string;
  items?: Item;
  customizations?: Customization;
}

export interface CartItem {
  id: string;
  item_id: string;
  user_email: string;
  size: string;
  color: string;
  quantity: number;
  created_at: string;
  items?: Item;
}