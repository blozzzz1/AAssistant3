import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { AuthService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current user on mount
    checkUser();

    // Subscribe to auth changes
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    const { user: newUser, error } = await AuthService.signUp(email, password);
    if (newUser) {
      setUser(newUser);
    }
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { user: signedInUser, error } = await AuthService.signIn(email, password);
    if (signedInUser) {
      setUser(signedInUser);
    }
    return { error };
  };

  const signOut = async () => {
    await AuthService.signOut();
    setUser(null);
  };

  const deleteAccount = async () => {
    const { error } = await AuthService.deleteAccount();
    if (!error) {
      setUser(null);
    }
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

