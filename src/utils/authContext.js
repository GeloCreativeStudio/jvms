'use client'

import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, getSession } from './supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const requireAuth = (router, isAuthenticated, loading) => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) {
        router.push('/login');
      }
    });

    initializeAuth();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const value = useMemo(() => ({
    signUp: async (data) => {
      const { error } = await supabase.auth.signUp(data);
      if (error) throw error;
    },
    signIn: async (data) => {
      const { error } = await supabase.auth.signInWithPassword(data);
      if (error) throw error;
      router.replace('/dashboard');
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/login');
    },
    user,
    loading,
    isAuthenticated: !!user,
    updateUser: (updatedUser) => {
      setUser(prevUser => ({
        ...prevUser,
        ...updatedUser,
        user_metadata: {
          ...prevUser.user_metadata,
          ...updatedUser.user_metadata
        }
      }));
    },
    deleteAccount: async () => {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;
      setUser(null);
      router.push('/login');
    },
    requireAuth,
  }), [user, loading, router]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};