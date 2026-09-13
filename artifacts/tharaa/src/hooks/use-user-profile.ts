import { useState, useEffect, useCallback } from 'react';
import { getUserProfile, saveUserProfile, UserFinancialProfile } from '@/lib/user-profile';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserFinancialProfile>(() => getUserProfile());

  const refreshProfile = useCallback(() => {
    setProfile(getUserProfile());
  }, []);

  useEffect(() => {
    refreshProfile();

    const handleUpdate = () => refreshProfile();
    window.addEventListener('tharaa_profile_update', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('tharaa_profile_update', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refreshProfile]);

  const updateProfile = useCallback((updates: Partial<UserFinancialProfile>) => {
    const saved = saveUserProfile(updates);
    setProfile(saved);
    return saved;
  }, []);

  // Computed Financial Metrics based on the exact user profile
  const monthlyIncome = profile.monthlyIncome;
  const monthlyExpenses = profile.essentialExpenses + profile.obligations;
  const monthlyCapacity = Math.max(50, profile.monthlyCapacity || (monthlyIncome - monthlyExpenses));
  const currentSavings = profile.currentSavings;
  const currentAge = profile.currentAge;
  const targetAge = profile.targetAge;
  const emergencyMonths = profile.emergencyMonths || 6;
  const riskCategory = profile.riskCategory || 'balanced';

  // FIRE Calculation (Freedom Number = Annual Expenses * 25)
  const annualExpenses = monthlyExpenses * 12;
  const freedomNumber = Math.max(10000, Math.round(annualExpenses * 25));
  const fireProgress = Math.min(100, Math.round((currentSavings / freedomNumber) * 100));

  // Compounding years to freedom: based on 8.0% annual Sharia return
  const monthlyRate = 0.08 / 12;
  let yearsToFreedom = 15;
  try {
    if (freedomNumber > currentSavings && monthlyCapacity > 0) {
      // Future Value formula solved for n periods
      const numerator = Math.log((freedomNumber * monthlyRate + monthlyCapacity) / (currentSavings * monthlyRate + monthlyCapacity));
      const denominator = Math.log(1 + monthlyRate);
      const months = Math.max(12, numerator / denominator);
      yearsToFreedom = Math.max(2, Math.round(months / 12));
    } else if (currentSavings >= freedomNumber) {
      yearsToFreedom = 0;
    }
  } catch {
    yearsToFreedom = 12;
  }

  const freedomAge = currentAge + yearsToFreedom;

  // Emergency Fund Metrics
  const emergencyTarget = monthlyExpenses * emergencyMonths;
  const emergencyProgress = emergencyTarget > 0 ? Math.min(100, Math.round((currentSavings / emergencyTarget) * 100)) : 100;
  const emergencyMonthsCovered = monthlyExpenses > 0 ? Number((currentSavings / monthlyExpenses).toFixed(1)) : 12;

  return {
    profile,
    updateProfile,
    refreshProfile,
    monthlyIncome,
    monthlyExpenses,
    monthlyCapacity,
    currentSavings,
    currentAge,
    targetAge,
    emergencyMonths,
    riskCategory,
    annualExpenses,
    freedomNumber,
    fireProgress,
    yearsToFreedom,
    freedomAge,
    emergencyTarget,
    emergencyProgress,
    emergencyMonthsCovered,
  };
}
