import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, supabase } from '../supabase';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

// Provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Sign up function
  async function signup(email, password) {
    try {
      const { data, error } = await auth.signUp(email, password);
      
      // Return the response directly so the component can handle it
      return { data, error };
    } catch (err) {
      console.error('Error in signup function:', err);
      return { data: null, error: err };
    }
  }

  // Login function
  async function login(email, password) {
    return auth.signIn(email, password);
  }

  // Logout function
  async function logout() {
    return auth.signOut();
  }

  // Update profile function
  async function updateUserProfile(user, data) {
    return auth.updateProfile(user, data);
  }

  // Set up auth state listener
  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const session = await auth.getSession();
        setCurrentUser(session?.user || null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Context value
  const value = {
    currentUser,
    signup,
    login,
    logout,
    updateUserProfile,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}