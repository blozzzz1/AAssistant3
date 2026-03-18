import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { PlanType } from '../types';
import { fetchPlan, setPlanApi } from '../services/planService';

interface PlanContextType {
  plan: PlanType;
  setPlan: (plan: PlanType) => void;
  isPremium: boolean;
  loading: boolean;
  refreshPlan: () => Promise<void>;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const PlanProvider: React.FC<{ children: React.ReactNode; userId: string | null }> = ({
  children,
  userId,
}) => {
  const [plan, setPlanState] = useState<PlanType>('free');
  const [loading, setLoading] = useState(true);

  const refreshPlan = useCallback(async () => {
    const { data } = await fetchPlan();
    if (data) setPlanState(data.plan);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!userId) {
      setPlanState('free');
      setLoading(false);
      return;
    }
    setLoading(true);
    refreshPlan();
  }, [userId, refreshPlan]);

  const setPlan = (newPlan: PlanType) => {
    if (!userId) return;
    setPlanApi(newPlan).then(({ error }) => {
      if (!error) setPlanState(newPlan);
    });
  };

  return (
    <PlanContext.Provider
      value={{
        plan,
        setPlan,
        isPremium: plan === 'premium',
        loading,
        refreshPlan,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};
