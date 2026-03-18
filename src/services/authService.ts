import { supabase } from '../config/supabase';
import { User } from '../types';

export class AuthService {
  static async signUp(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Failed to create user' };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        createdAt: new Date(data.user.created_at),
      };

      return { user, error: null };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' };
    }
  }

  static async signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (!data.user) {
        return { user: null, error: 'Failed to sign in' };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email!,
        createdAt: new Date(data.user.created_at),
      };

      return { user, error: null };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' };
    }
  }

  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email!,
        createdAt: new Date(user.created_at),
      };
    } catch (error) {
      return null;
    }
  }

  static async deleteAccount(): Promise<{ error: string | null }> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { error: 'No user logged in' };
      }

      // Delete user account (this will cascade delete chat_sessions due to FK constraint)
      const { error } = await supabase.rpc('delete_user');
      
      if (error) {
        // If RPC function doesn't exist, try admin API (requires service role key)
        // For now, we'll just sign out and let admin handle deletion
        await this.signOut();
        return { error: 'Account deletion requested. Please contact support to complete the process.' };
      }

      return { error: null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  }

  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email!,
          createdAt: new Date(session.user.created_at),
        });
      } else {
        callback(null);
      }
    });
  }
}

