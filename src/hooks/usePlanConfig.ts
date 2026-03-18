import { useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 минут

type CachedPlanConfig = {
  freeChatModelIds: string[];
  freeImageLimit: number;
  freeVideoLimit: number;
  fetchedAt: number;
};

let planConfigCache: CachedPlanConfig | null = null;

function getCached(): CachedPlanConfig | null {
  if (!planConfigCache) return null;
  if (Date.now() - planConfigCache.fetchedAt > CACHE_TTL_MS) {
    planConfigCache = null;
    return null;
  }
  return planConfigCache;
}

function setCached(data: Omit<CachedPlanConfig, 'fetchedAt'>) {
  planConfigCache = {
    ...data,
    fetchedAt: Date.now(),
  };
}

/** Сбрасывает кэш (например после смены настроек в админке). */
export function invalidatePlanConfigCache() {
  planConfigCache = null;
}

export function usePlanConfig() {
  const [freeChatModelIds, setFreeChatModelIds] = useState<string[]>(() => getCached()?.freeChatModelIds ?? []);
  const [freeImageLimit, setFreeImageLimit] = useState(() => getCached()?.freeImageLimit ?? 20);
  const [freeVideoLimit, setFreeVideoLimit] = useState(() => getCached()?.freeVideoLimit ?? 5);
  const [loading, setLoading] = useState(() => !getCached());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = getCached();
    if (cached) {
      setFreeChatModelIds(cached.freeChatModelIds);
      setFreeImageLimit(cached.freeImageLimit);
      setFreeVideoLimit(cached.freeVideoLimit);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/api/settings/plan-config`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const ids = Array.isArray(data.freeChatModelIds) ? data.freeChatModelIds : [];
        const imgLimit = typeof data.freeImageLimit === 'number' ? data.freeImageLimit : 20;
        const vidLimit = typeof data.freeVideoLimit === 'number' ? data.freeVideoLimit : 5;
        if (!cancelled) {
          setCached({ freeChatModelIds: ids, freeImageLimit: imgLimit, freeVideoLimit: vidLimit });
          setFreeChatModelIds(ids);
          setFreeImageLimit(imgLimit);
          setFreeVideoLimit(vidLimit);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Unknown error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    freeChatModelIds,
    freeImageLimit,
    freeVideoLimit,
    loading,
    error,
  };
}
