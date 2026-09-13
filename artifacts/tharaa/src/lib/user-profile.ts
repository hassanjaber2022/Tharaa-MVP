export interface UserFinancialProfile {
  currentAge: number;
  targetAge: number;
  monthlyIncome: number;
  essentialExpenses: number;
  obligations: number;
  currentSavings: number;
  monthlyCapacity: number;
  desiredFutureIncome: number;
  emergencyMonths: number;
  riskCategory: 'conservative' | 'balanced' | 'growth';
}

export const DEFAULT_USER_PROFILE: UserFinancialProfile = {
  currentAge: 28,
  targetAge: 52,
  monthlyIncome: 1500,
  essentialExpenses: 500,
  obligations: 300,
  currentSavings: 8000,
  monthlyCapacity: 700,
  desiredFutureIncome: 1500,
  emergencyMonths: 6,
  riskCategory: 'balanced',
};

const STORAGE_KEY = 'tharaa_user_profile';
const PROFILE_COMPLETED_KEY = 'tharaa_profile_completed';
const VAULTS_KEY = 'tharaa_goal_vaults';

export function getUserProfile(): UserFinancialProfile {
  if (typeof window === 'undefined') return DEFAULT_USER_PROFILE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.monthlyIncome === 'number' && parsed.monthlyIncome > 0) {
        return {
          ...DEFAULT_USER_PROFILE,
          ...parsed,
          monthlyCapacity: parsed.monthlyCapacity || Math.max(150, parsed.monthlyIncome - ((parsed.essentialExpenses || 0) + (parsed.obligations || 0))),
        };
      }
    }
  } catch (err) {
    console.warn('Error reading tharaa_user_profile:', err);
  }
  return DEFAULT_USER_PROFILE;
}

export function saveUserProfile(profile: Partial<UserFinancialProfile>): UserFinancialProfile {
  const current = getUserProfile();
  const updated: UserFinancialProfile = {
    ...current,
    ...profile,
  };

  // Recalculate capacity
  const totalExpenses = (updated.essentialExpenses || 0) + (updated.obligations || 0);
  updated.monthlyCapacity = Math.max(100, updated.monthlyIncome - totalExpenses);
  if (!updated.desiredFutureIncome) {
    updated.desiredFutureIncome = updated.monthlyIncome;
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      localStorage.setItem(PROFILE_COMPLETED_KEY, 'true');

      // Generate dynamic matching goal vaults based on the real profile
      const annualExpenses = totalExpenses * 12;
      const freedomTarget = Math.round(annualExpenses * 25);
      const emergencyTarget = totalExpenses * (updated.emergencyMonths || 6);

      const dynamicVaults = [
        {
          id: '1',
          title: `صندوق الأمان والطوارئ (${updated.emergencyMonths || 6} أشهر)`,
          targetAmount: emergencyTarget,
          currentAmount: Math.min(updated.currentSavings, emergencyTarget),
          icon: 'shield',
          deadlineYears: 1,
        },
        {
          id: '2',
          title: 'دفعة بيت العمر',
          targetAmount: Math.max(45000, Math.round(updated.monthlyIncome * 35)),
          currentAmount: Math.round(updated.currentSavings * 0.4),
          icon: 'home',
          deadlineYears: 6,
        },
        {
          id: '3',
          title: 'صندوق تعليم الأبناء والأسرة',
          targetAmount: Math.max(20000, Math.round(updated.monthlyIncome * 15)),
          currentAmount: Math.round(updated.currentSavings * 0.2),
          icon: 'education',
          deadlineYears: 10,
        },
        {
          id: '4',
          title: 'محفظة النمو والحرية المالية',
          targetAmount: freedomTarget,
          currentAmount: updated.currentSavings,
          icon: 'wealth',
          deadlineYears: Math.max(5, (updated.targetAge || 52) - (updated.currentAge || 28)),
        },
      ];

      localStorage.setItem(VAULTS_KEY, JSON.stringify(dynamicVaults));
      window.dispatchEvent(new Event('tharaa_profile_update'));
      window.dispatchEvent(new CustomEvent('tharaa_vaults_update', { detail: dynamicVaults }));
    } catch (err) {
      console.warn('Error saving tharaa_user_profile:', err);
    }
  }

  return updated;
}

/**
 * Real compound interest future value calculation
 */
export function calculateFutureWealth(
  initialSavings: number,
  monthlySavings: number,
  annualRate: number,
  years: number
): number {
  if (years <= 0) return initialSavings;
  const monthlyRate = annualRate / 12;
  const totalMonths = Math.round(years * 12);
  
  if (monthlyRate === 0) {
    return initialSavings + (monthlySavings * totalMonths);
  }
  
  const compoundFactor = Math.pow(1 + monthlyRate, totalMonths);
  const futureLumpSum = initialSavings * compoundFactor;
  const futureAnnuity = monthlySavings * ((compoundFactor - 1) / monthlyRate);
  
  return Math.round(futureLumpSum + futureAnnuity);
}

/**
 * Qualitative & Quantitative Analysis of Financial Return Yield
 */
export function evaluateReturnYield(params: {
  monthlyIncome: number;
  monthlySavings: number;
  annualExpenses: number;
  currentSavings: number;
  yearsRemaining: number;
  riskCategory: 'conservative' | 'balanced' | 'growth';
}) {
  const { monthlyIncome, monthlySavings, annualExpenses, currentSavings, yearsRemaining, riskCategory } = params;
  
  const rateMap = {
    conservative: 0.055,
    balanced: 0.085,
    growth: 0.115,
  };
  const rate = rateMap[riskCategory] || 0.085;
  
  const freedomNumber = annualExpenses * 25;
  const projectedWealth = calculateFutureWealth(currentSavings, monthlySavings, rate, yearsRemaining);
  const savingsRate = monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 100) : 0;
  
  // Potential with extra 100 KWD/month
  const wealthWithExtra100 = calculateFutureWealth(currentSavings, monthlySavings + 100, rate, yearsRemaining);
  const extraGain = wealthWithExtra100 - projectedWealth;

  let status: 'weak' | 'moderate' | 'strong' | 'exceptional' = 'moderate';
  let title = '';
  let warningMessage = '';
  let optimizationTip = '';

  if (monthlySavings < 100 || savingsRate < 12) {
    status = 'weak';
    title = '🚨 تنبيه ضعف المردود المالي: المدخرات الحالية غير كافية';
    warningMessage = `فائضك الشهري (${monthlySavings} د.ك) يعادل ${savingsRate}% فقط من راتبك. بهذا المعدل، نمو المحفظة سيكون بطيئاً جداً ولن يتفوق على معدل التضخم، مما يهدد تأمين تقاعد مريح.`;
    optimizationTip = `اقتطاع 10% إلى 15% إضافية من المصاريف الاستهلاكية لرفع الادخار إلى ${Math.round(monthlyIncome * 0.15)} د.ك شهرياً سيضيف أكثر من ${Math.round(extraGain).toLocaleString()} د.ك لثروتك!`;
  } else if (savingsRate >= 12 && savingsRate < 22) {
    status = 'moderate';
    title = '💡 مردود متوازن: في المسار السليم مع إمكانية مضاعفة العائد';
    warningMessage = `أنت تدخر ${savingsRate}% من راتبك (${monthlySavings} د.ك). المحفظة ستنمو بشكل جيد، ولكن يمكنك اختصار سنوات التقاعد بشكل ملحوظ.`;
    optimizationTip = `إضافة 100 د.ك إضافية شهرياً ستزيد محفظتك النهائية بقيمة ${Math.round(extraGain).toLocaleString()} د.ك بفضل النماء التراكمي.`;
  } else if (savingsRate >= 22 && savingsRate < 35) {
    status = 'strong';
    title = '🔥 مردود استثماري قوي ومثالي للاستقلال المالي';
    warningMessage = `ادخار واستثمار ${savingsRate}% (${monthlySavings} د.ك) يضعك في المسار الذهبي للتفوق على التضخم وبناء رقم الحرية (${freedomNumber.toLocaleString()} د.ك) في وقت قياسي.`;
    optimizationTip = `استمر على هذا الالتزام واحرص على إعادة توازن المحفظة سنوياً لتأمين الأرباح.`;
  } else {
    status = 'exceptional';
    title = '💎 مردود استثنائي: أنت في نخبة المستثمرين الجادين!';
    warningMessage = `أنت تستثمر ${savingsRate}% من دخلك. هذا المعدل الاستثنائي يتيح لك تحقيق التقاعد المبكر قبل السن المستهدف وتأسيس ثروة عائلية مستدامة.`;
    optimizationTip = `فكر في تنويع الأصول عبر صكوك سيادية وأسهم نمو وتوزيعات أرباح لحماية هذه الثروة الكبيرة.`;
  }

  return {
    status,
    title,
    warningMessage,
    optimizationTip,
    rate,
    savingsRate,
    freedomNumber,
    projectedWealth,
    extraGain,
    isGap: projectedWealth < freedomNumber,
    gapAmount: Math.max(0, freedomNumber - projectedWealth),
    surplusAmount: Math.max(0, projectedWealth - freedomNumber),
  };
}

