import { randomUUID } from 'crypto';
import { supabaseAdmin } from '../config/supabase';
import { ChatSession, Message, DatabaseChatSession } from '../types';

export class ChatService {
  static async createSession(
    userId: string,
    title: string,
    selectedModel: string
  ): Promise<{ session: ChatSession | null; error: string | null }> {
    try {
      const now = new Date();
      const session: ChatSession = {
        id: randomUUID(),
        title,
        messages: [],
        selectedModel,
        createdAt: now,
        updatedAt: now,
        userId,
      };

      // Use RPC function to bypass RLS (SECURITY DEFINER)
      const { data, error } = await supabaseAdmin.rpc('create_chat_session', {
        p_id: session.id,
        p_user_id: userId,
        p_title: session.title,
        p_selected_model: session.selectedModel,
        p_messages: session.messages,
      });

      if (error) {
        // Fallback to direct insert if RPC doesn't exist
        const { error: insertError } = await supabaseAdmin
          .from('chat_sessions')
          .insert({
            id: session.id,
            user_id: userId,
            title: session.title,
            selected_model: session.selectedModel,
            messages: JSON.stringify(session.messages),
            created_at: (session.createdAt instanceof Date ? session.createdAt : new Date(session.createdAt)).toISOString(),
            updated_at: (session.updatedAt instanceof Date ? session.updatedAt : new Date(session.updatedAt)).toISOString(),
          });

        if (insertError) {
          console.error('Error creating session:', insertError);
          return { session: null, error: insertError.message };
        }
        // Return the session we created via fallback
        return { session, error: null };
      }

      // RPC function returns the created session
      if (data && (Array.isArray(data) ? data.length > 0 : data)) {
        const row = Array.isArray(data) ? data[0] : data;
        const createdSession: ChatSession = {
          id: row.id,
          title: row.title,
          messages: row.messages || [],
          selectedModel: row.selected_model,
          createdAt: new Date(row.created_at),
          updatedAt: new Date(row.updated_at),
          userId: row.user_id,
        };
        return { session: createdSession, error: null };
      }

      return { session, error: null };
    } catch (error) {
      console.error('Error creating session:', error);
      return { session: null, error: 'An unexpected error occurred' };
    }
  }

  static async updateSession(session: ChatSession): Promise<{ error: string | null }> {
    try {
      if (!session.userId) {
        return { error: 'User ID is required' };
      }

      // Use RPC function to bypass RLS (SECURITY DEFINER)
      const { error } = await supabaseAdmin.rpc('update_chat_session', {
        p_id: session.id,
        p_user_id: session.userId,
        p_title: session.title,
        p_selected_model: session.selectedModel,
        p_messages: session.messages,
      });

      if (error) {
        // Fallback to direct update if RPC doesn't exist
        const { error: updateError } = await supabaseAdmin
          .from('chat_sessions')
          .update({
            title: session.title,
            selected_model: session.selectedModel,
            messages: JSON.stringify(session.messages),
            updated_at: new Date().toISOString(),
          })
          .eq('id', session.id);

        if (updateError) {
          console.error('Error updating session:', updateError);
          return { error: updateError.message };
        }
      }

      if (error) {
        console.error('Error updating session:', error);
        return { error: error.message };
      }

      return { error: null };
    } catch (error) {
      console.error('Error updating session:', error);
      return { error: 'An unexpected error occurred' };
    }
  }

  static async deleteSession(sessionId: string, userId: string): Promise<{ error: string | null }> {
    try {
      // Use RPC function to bypass RLS (SECURITY DEFINER)
      const { data, error } = await supabaseAdmin.rpc('delete_chat_session', {
        p_id: sessionId,
        p_user_id: userId,
      });

      if (error) {
        // Fallback to direct delete if RPC doesn't exist
        const { error: deleteError } = await supabaseAdmin
          .from('chat_sessions')
          .delete()
          .eq('id', sessionId)
          .eq('user_id', userId);

        if (deleteError) {
          console.error('Error deleting session:', deleteError);
          return { error: deleteError.message };
        }
      } else if (data === false) {
        return { error: 'Session not found or unauthorized' };
      }

      return { error: null };
    } catch (error) {
      console.error('Error deleting session:', error);
      return { error: 'An unexpected error occurred' };
    }
  }

  /** Список сессий без сообщений (снижает egress PostgREST). Сообщения подгружаются по getSession(id). */
  static async getUserSessions(userId: string): Promise<{ sessions: ChatSession[]; error: string | null }> {
    try {
      const { data, error } = await supabaseAdmin
        .from('chat_sessions')
        .select('id, user_id, title, selected_model, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching sessions:', error);
        return { sessions: [], error: error.message };
      }

      const sessions: ChatSession[] = (data || []).map((row: any) => ({
        id: row.id,
        title: row.title ?? '',
        messages: [], // подгружаются по GET /api/chat/sessions/:id при открытии сессии
        selectedModel: row.selected_model ?? 'openai/gpt-oss-120b',
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        userId: row.user_id,
      }));

      return { sessions, error: null };
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return { sessions: [], error: 'An unexpected error occurred' };
    }
  }

  static async getSession(sessionId: string, userId: string): Promise<{ session: ChatSession | null; error: string | null }> {
    try {
      // Use RPC function to bypass RLS (SECURITY DEFINER)
      const { data, error } = await supabaseAdmin.rpc('get_chat_session', {
        p_id: sessionId,
        p_user_id: userId,
      });

      if (error) {
        // Fallback to direct select if RPC doesn't exist
        const { data: fallbackData, error: fallbackError } = await supabaseAdmin
          .from('chat_sessions')
          .select('*')
          .eq('id', sessionId)
          .eq('user_id', userId)
          .single();

        if (fallbackError) {
          console.error('Error fetching session:', fallbackError);
          return { session: null, error: fallbackError.message };
        }

        if (!fallbackData) {
          return { session: null, error: 'Session not found' };
        }

        let messages: Message[] = [];
        if (fallbackData.messages) {
          if (typeof fallbackData.messages === 'string') {
            messages = JSON.parse(fallbackData.messages);
          } else {
            messages = fallbackData.messages;
          }
        }

        const session: ChatSession = {
          id: fallbackData.id,
          title: fallbackData.title,
          messages: messages.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
          })),
          selectedModel: fallbackData.selected_model,
          createdAt: new Date(fallbackData.created_at),
          updatedAt: new Date(fallbackData.updated_at),
          userId: fallbackData.user_id,
        };

        return { session, error: null };
      }

      if (error) {
        console.error('Error fetching session:', error);
        const err = error as unknown;
        return { session: null, error: err instanceof Error ? err.message : String(err) };
      }

      if (!data || (Array.isArray(data) ? data.length === 0 : false)) {
        return { session: null, error: 'Session not found' };
      }

      const row = Array.isArray(data) ? data[0] : data;
      let messages: Message[] = [];
      if (row.messages) {
        if (typeof row.messages === 'string') {
          messages = JSON.parse(row.messages);
        } else {
          messages = row.messages;
        }
      }

      const session: ChatSession = {
        id: row.id,
        title: row.title,
        messages: messages.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        })),
        selectedModel: row.selected_model,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        userId: row.user_id,
      };

      return { session, error: null };
    } catch (error) {
      console.error('Error fetching session:', error);
      return { session: null, error: 'An unexpected error occurred' };
    }
  }
}

