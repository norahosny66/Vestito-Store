import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, User } from '../lib/supabase';

interface AuthContextType {
  user: SupabaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, secondName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Clear all session data completely
  const clearSessionData = async () => {
    try {
      console.log('🧹 Clearing all session data...');
      
      // Clear Supabase session
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clear local storage items related to Supabase
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log('🗑️ Removed localStorage key:', key);
      });
      
      // Clear session storage as well
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
          sessionKeysToRemove.push(key);
        }
      }
      
      sessionKeysToRemove.forEach(key => {
        sessionStorage.removeItem(key);
        console.log('🗑️ Removed sessionStorage key:', key);
      });
      
      // Reset state
      setUser(null);
      setUserProfile(null);
      
      console.log('✅ Session data cleared successfully');
    } catch (error) {
      console.error('Error clearing session data:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Get initial session with comprehensive error handling
    const getSession = async () => {
      try {
        console.log('🔍 Getting initial session...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('❌ Auth session error:', error.message);
          
          // Check for refresh token errors
          if (error.message.includes('Invalid Refresh Token') || 
              error.message.includes('Refresh Token Not Found') ||
              error.message.includes('refresh_token_not_found')) {
            console.log('🔄 Detected refresh token error, clearing session...');
            await clearSessionData();
            if (mounted) {
              setLoading(false);
            }
            return;
          }
        }
        
        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchUserProfile(session.user.email!);
          }
        }
      } catch (error) {
        console.warn('❌ Auth initialization error:', error);
        // If there's any error during initialization, clear everything
        await clearSessionData();
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth changes with better error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event);
      
      if (!mounted) return;
      
      try {
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
          console.log('👋 User signed out or token refresh failed');
          setUser(null);
          setUserProfile(null);
        } else if (session?.user) {
          console.log('👤 User signed in:', session.user.email);
          setUser(session.user);
          await fetchUserProfile(session.user.email!);
        } else {
          setUser(null);
          setUserProfile(null);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Error handling auth state change:', error);
        await clearSessionData();
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (email: string) => {
    try {
      console.log('👤 Fetching user profile for:', email);
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000);
      });

      const queryPromise = supabase
        .from('User')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        console.warn('⚠️ Error fetching user profile:', error.message);
        return;
      }

      setUserProfile(data);
      console.log('✅ User profile loaded successfully');
    } catch (error) {
      console.warn('⚠️ Error fetching user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, secondName: string) => {
    try {
      console.log('📝 Signing up user:', email);
      
      // Clear any existing session first
      await clearSessionData();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign up error:', error.message);
        return { error };
      }

      // Create user profile
      if (data.user) {
        try {
          console.log('👤 Creating user profile...');
          const { error: profileError } = await supabase
            .from('User')
            .insert([
              {
                email: data.user.email!,
                first_name: firstName,
                second_name: secondName,
              }
            ]);

          if (profileError) {
            console.error('❌ Error creating user profile:', profileError.message);
            return { error: profileError };
          }
          
          console.log('✅ User profile created successfully');
        } catch (profileError) {
          console.error('❌ Profile creation failed:', profileError);
          return { error: profileError };
        }
      }

      console.log('✅ Sign up successful');
      return { error: null };
    } catch (error) {
      console.error('❌ Sign up failed:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 Signing in user:', email);
      
      // Clear any existing session first to prevent conflicts
      await clearSessionData();
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error.message);
      } else {
        console.log('✅ Sign in successful');
      }

      return { error };
    } catch (error) {
      console.error('❌ Sign in failed:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('👋 Signing out user...');
      
      // Use comprehensive session clearing
      await clearSessionData();
      
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.warn('⚠️ Sign out error (continuing anyway):', error);
      // Even if sign out fails, clear local state
      setUser(null);
      setUserProfile(null);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};