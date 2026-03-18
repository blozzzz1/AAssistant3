const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export interface UserInfo {
  id: string;
  email: string;
  createdAt: Date;
  lastSignInAt?: Date;
  isBlocked: boolean;
  blockReason?: string;
  blockUntil?: Date;
  isAdmin: boolean;
  adminRole?: 'admin' | 'super_admin';
}

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  updatedAt: Date;
  updatedBy?: string;
}

export interface ModelSetting {
  id: string;
  modelId: string;
  isEnabled: boolean;
  reason?: string;
  disabledBy?: string;
  disabledAt?: Date;
  enabledBy?: string;
  enabledAt?: Date;
  updatedAt: Date;
}

export interface UserActivity {
  id: string;
  userId: string;
  actionType: string;
  actionDetails?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface Admin {
  id: string;
  userId: string;
  role: 'admin' | 'super_admin';
  createdAt: Date;
  createdBy?: string;
  updatedAt: Date;
}

export class AdminService {
  private static async getAuthToken(): Promise<string | null> {
    try {
      const { supabase } = await import('../config/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private static async getAuthHeaders(): Promise<HeadersInit> {
    const token = await this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  static async getAllUsers(limit: number = 50, offset: number = 0): Promise<{ users: UserInfo[]; total: number; error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/admin/users?limit=${limit}&offset=${offset}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { users: [], total: 0, error: errorText || `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { users: data.users || [], total: data.total || 0, error: null };
    } catch (error) {
      console.error('Error getting users:', error);
      return { users: [], total: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getUserById(userId: string): Promise<{ user: UserInfo | null; error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { user: null, error: errorText || `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { user: data.user || null, error: null };
    } catch (error) {
      console.error('Error getting user:', error);
      return { user: null, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async blockUser(userId: string, reason?: string, blockedUntil?: Date): Promise<{ error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/block`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason, blockedUntil }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { error: errorText || `HTTP ${response.status}` };
      }

      return { error: null };
    } catch (error) {
      console.error('Error blocking user:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async unblockUser(userId: string): Promise<{ error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/unblock`, {
        method: 'POST',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { error: errorText || `HTTP ${response.status}` };
      }

      return { error: null };
    } catch (error) {
      console.error('Error unblocking user:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getSystemSettings(): Promise<{ settings: SystemSetting[]; error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { settings: [], error: errorText || `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { settings: data.settings || [], error: null };
    } catch (error) {
      console.error('Error getting system settings:', error);
      return { settings: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async updateSystemSetting(key: string, value: any): Promise<{ error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/admin/settings/${key}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { error: errorText || `HTTP ${response.status}` };
      }

      return { error: null };
    } catch (error) {
      console.error('Error updating system setting:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getPlanConfig(): Promise<{
    freeChatModelIds: string[];
    freeImageLimit: number;
    freeVideoLimit: number;
    error: string | null;
  }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/admin/plan-config`, { method: 'GET', headers });
      if (!response.ok) {
        const errorText = await response.text();
        return {
          freeChatModelIds: [],
          freeImageLimit: 20,
          freeVideoLimit: 5,
          error: errorText || `HTTP ${response.status}`,
        };
      }
      const data = await response.json();
      return {
        freeChatModelIds: Array.isArray(data.freeChatModelIds) ? data.freeChatModelIds : [],
        freeImageLimit: typeof data.freeImageLimit === 'number' ? data.freeImageLimit : 20,
        freeVideoLimit: typeof data.freeVideoLimit === 'number' ? data.freeVideoLimit : 5,
        error: null,
      };
    } catch (error) {
      console.error('Error getting plan config:', error);
      return {
        freeChatModelIds: [],
        freeImageLimit: 20,
        freeVideoLimit: 5,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  static async updatePlanConfig(data: {
    freeChatModelIds?: string[];
    freeImageLimit?: number;
    freeVideoLimit?: number;
  }): Promise<{ error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/admin/plan-config`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorText = await response.text();
        return { error: errorText || `HTTP ${response.status}` };
      }
      return { error: null };
    } catch (error) {
      console.error('Error updating plan config:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getModelSettings(): Promise<{ settings: ModelSetting[]; error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/admin/models`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { settings: [], error: errorText || `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { settings: data.settings || [], error: null };
    } catch (error) {
      console.error('Error getting model settings:', error);
      return { settings: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async updateModelSetting(modelId: string, isEnabled: boolean, reason?: string): Promise<{ error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/admin/models/${modelId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ isEnabled, reason }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { error: errorText || `HTTP ${response.status}` };
      }

      return { error: null };
    } catch (error) {
      console.error('Error updating model setting:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getActivityLogs(userId?: string, limit: number = 100, offset: number = 0): Promise<{ logs: UserActivity[]; total: number; error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const url = `${API_BASE_URL}/api/admin/activity?limit=${limit}&offset=${offset}${userId ? `&userId=${userId}` : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { logs: [], total: 0, error: errorText || `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { logs: data.logs || [], total: data.total || 0, error: null };
    } catch (error) {
      console.error('Error getting activity logs:', error);
      return { logs: [], total: 0, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getAdmins(): Promise<{ admins: Admin[]; error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/admin/admins`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { admins: [], error: errorText || `HTTP ${response.status}` };
      }

      const data = await response.json();
      return { admins: data.admins || [], error: null };
    } catch (error) {
      console.error('Error getting admins:', error);
      return { admins: [], error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async addAdmin(userId: string, role: 'admin' | 'super_admin'): Promise<{ error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/admin/admins`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId, role }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { error: errorText || `HTTP ${response.status}` };
      }

      return { error: null };
    } catch (error) {
      console.error('Error adding admin:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async removeAdmin(userId: string): Promise<{ error: string | null }> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/admin/admins/${userId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return { error: errorText || `HTTP ${response.status}` };
      }

      return { error: null };
    } catch (error) {
      console.error('Error removing admin:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async isAdmin(): Promise<boolean> {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/admin/users?limit=1`, {
        method: 'GET',
        headers,
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
