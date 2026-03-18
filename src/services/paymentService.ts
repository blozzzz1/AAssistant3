import { getAuthToken } from '../config/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export type PaymentMethod = 'card' | 'sbp';

export interface Transaction {
  id: string;
  plan: string;
  amount_cents: number;
  currency: string;
  payment_method: PaymentMethod;
  status: string;
  created_at: string;
}

export async function createPayment(
  plan: 'premium',
  paymentMethod: PaymentMethod
): Promise<{ transaction: Transaction | null; error: string | null }> {
  try {
    const token = await getAuthToken();
    if (!token) return { transaction: null, error: 'Не авторизован' };
    const res = await fetch(`${API_BASE_URL}/api/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plan, paymentMethod }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { transaction: null, error: (data as { error?: string }).error || `HTTP ${res.status}` };
    return { transaction: (data as { transaction: Transaction }).transaction, error: null };
  } catch (e) {
    console.error('createPayment:', e);
    return { transaction: null, error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function getTransactions(): Promise<{ transactions: Transaction[]; error: string | null }> {
  try {
    const token = await getAuthToken();
    if (!token) return { transactions: [], error: 'Не авторизован' };
    const res = await fetch(`${API_BASE_URL}/api/transactions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { transactions: [], error: (data as { error?: string }).error || `HTTP ${res.status}` };
    return { transactions: (data as { transactions: Transaction[] }).transactions || [], error: null };
  } catch (e) {
    console.error('getTransactions:', e);
    return { transactions: [], error: e instanceof Error ? e.message : 'Unknown error' };
  }
}

export async function cancelSubscription(): Promise<{ error: string | null }> {
  try {
    const token = await getAuthToken();
    if (!token) return { error: 'Не авторизован' };
    const res = await fetch(`${API_BASE_URL}/api/user/subscription/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { error: (data as { error?: string }).error || `HTTP ${res.status}` };
    return { error: null };
  } catch (e) {
    console.error('cancelSubscription:', e);
    return { error: e instanceof Error ? e.message : 'Unknown error' };
  }
}
