import { apiRequest } from '../config/api';
import { ChatSession } from '../types';

export class ChatService {
  static async createSession(userId: string, title: string, selectedModel: string): Promise<{ session: ChatSession | null; error: string | null }> {
    try {
      const response = await apiRequest<{ session: ChatSession }>('/api/chat/sessions', {
        method: 'POST',
        body: JSON.stringify({ title, selectedModel }),
      });

      if (!response || !response.session) {
        return { 
          session: null, 
          error: 'Invalid response from server' 
        };
      }

      // Ensure dates are properly converted
      const session: ChatSession = {
        ...response.session,
        messages: response.session.messages || [],
        createdAt: response.session.createdAt ? new Date(response.session.createdAt) : new Date(),
        updatedAt: response.session.updatedAt ? new Date(response.session.updatedAt) : new Date(),
      };

      return { session, error: null };
    } catch (error) {
      console.error('Error creating session:', error);
      return { 
        session: null, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }

  static async updateSession(session: ChatSession): Promise<{ error: string | null }> {
    try {
      await apiRequest(`/api/chat/sessions/${session.id}`, {
        method: 'PUT',
        body: JSON.stringify(session),
      });

      return { error: null };
    } catch (error) {
      console.error('Error updating session:', error);
      return { 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }

  static async deleteSession(sessionId: string): Promise<{ error: string | null }> {
    try {
      await apiRequest(`/api/chat/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      return { error: null };
    } catch (error) {
      console.error('Error deleting session:', error);
      return { 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }

  static async getUserSessions(userId: string): Promise<{ sessions: ChatSession[]; error: string | null }> {
    try {
      const response = await apiRequest<{ sessions: ChatSession[] }>('/api/chat/sessions');

      // Convert date strings to Date objects
      const sessions = response.sessions.map(session => ({
        ...session,
        messages: session.messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        })),
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
      }));

      return { sessions, error: null };
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return { 
        sessions: [], 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }

  static async getSession(sessionId: string): Promise<{ session: ChatSession | null; error: string | null }> {
    try {
      const response = await apiRequest<{ session: ChatSession }>(`/api/chat/sessions/${sessionId}`);

      // Convert date strings to Date objects
      const session = {
        ...response.session,
        messages: (response.session.messages || []).map(msg => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        })),
        createdAt: new Date(response.session.createdAt),
        updatedAt: new Date(response.session.updatedAt),
      };

      return { session, error: null };
    } catch (error) {
      console.error('Error fetching session:', error);
      return { 
        session: null, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    }
  }
}

