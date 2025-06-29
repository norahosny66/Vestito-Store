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

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('Auth session error:', error.message);
        }
        
        if (mounted) {
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchUserProfile(session.user.email!);
          }
        }
      } catch (error) {
        console.warn('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (mounted) {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserProfile(session.user.email!);
        } else {
          setUserProfile(null);
        }
        
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
      console.log('Fetching user profile for:', email);
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000);
      });

      const queryPromise = supabase
        .from('User')
        .select('*')
        .eq('email', email)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no rows gracefully

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        console.warn('Error fetching user profile:', error.message);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.warn('Error fetching user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, secondName: string) => {
    try {
      console.log('Signing up user:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      // Create user profile
      if (data.user) {
        try {
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
            console.error('Error creating user profile:', profileError.message);
            // Return the profile error to indicate failure
            return { error: profileError };
          }
        } catch (profileError) {
          console.error('Profile creation failed:', profileError);
          // Return the profile error to indicate failure
          return { error: profileError };
        }
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in user:', email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');
      
      // Clear local state first
      setUser(null);
      setUserProfile(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('Sign out error:', error.message);
      }
      
      console.log('User signed out successfully');
    } catch (error) {
      console.warn('Sign out failed:', error);
      // Clear local state even if sign out fails
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