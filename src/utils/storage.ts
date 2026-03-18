import { Message, ChatSession } from '../types';

const STORAGE_KEYS = {
  API_KEY: 'ai_assistant_api_key',
  CHAT_SESSIONS: 'ai_assistant_chat_sessions',
  CURRENT_SESSION: 'ai_assistant_current_session',
  SELECTED_MODEL: 'ai_assistant_selected_model'
};

export class StorageService {
  // API Key management
  static saveApiKey(apiKey: string): void {
    localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
  }

  static getApiKey(): string | null {
    return localStorage.getItem(STORAGE_KEYS.API_KEY);
  }

  static clearApiKey(): void {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
  }

  // Model selection
  static saveSelectedModel(modelId: string): void {
    localStorage.setItem(STORAGE_KEYS.SELECTED_MODEL, modelId);
  }

  static getSelectedModel(): string | null {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_MODEL);
  }

  // Chat sessions management
  static saveChatSessions(sessions: ChatSession[]): void {
    localStorage.setItem(STORAGE_KEYS.CHAT_SESSIONS, JSON.stringify(sessions));
  }

  static getChatSessions(): ChatSession[] {
    const stored = localStorage.getItem(STORAGE_KEYS.CHAT_SESSIONS);
    if (!stored) return [];
    
    try {
      const sessions = JSON.parse(stored);
      // Convert date strings back to Date objects
      return sessions.map((session: any) => ({
        ...session,
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Error parsing chat sessions:', error);
      return [];
    }
  }

  static saveCurrentSession(sessionId: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionId);
  }

  static getCurrentSession(): string | null {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
  }

  static clearCurrentSession(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  }

  // Clear all data
  static clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
}