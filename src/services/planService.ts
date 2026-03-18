import { getAuthToken } from '../config/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export type PlanType = 'free' | 'premium';

export interface PlanResponse {
  plan: PlanType;
  imageCountToday: number;
  videoCountToday: number;
  imageLimit: number | null;
  videoLimit: number | null;
}

export async function fetchPlan(): Promise<{ data: PlanResponse | null; error: string | null }> {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { data: { plan: 'free', imageCountToday: 0, videoCountToday: 0, imageLimit: 20, videoLimit: 5 }, error: null };
    }
    const res = await fetch(`${API_BASE_URL}/api/user/plan`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { data: null, error: (err as { error?: string }).error || `HTTP ${res.status}` };
    }
    const data = (await res.json()) as PlanResponse;
    return { data, error: null };
  } catch (e) {
    console.error('fetchPlan:', e);
    return { data: null, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function setPlanApi(plan: PlanType): Promise<{ error: string | null }> {
  try {
    const token = await getAuthToken();
    if (!token) return { error: 'Не авторизован' };
    const res = await fetch(`${API_BASE_URL}/api/user/plan`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plan }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { error: (err as { error?: string }).error || `HTTP ${res.status}` };
    }
    return { error: null };
  } catch (e) {
    console.error('setPlanApi:', e);
    return { error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
