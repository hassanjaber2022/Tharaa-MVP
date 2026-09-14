import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Target, 
  Wallet, 
  TrendingUp,
  Activity,
  Flame,
  Award,
  Crown,
  AlertTriangle,
  Info,
  ExternalLink,
  FileText,
  PieChart,
  Bell,
  Zap,
  Lock,
  Check,
  Percent,
  Briefcase
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { 
  saveUserProfile, 
  UserFinancialProfile, 
  evaluateReturnYield, 
  calculateFutureWealth 
} from '@/lib/user-profile';
import { DEFAULT_STRIPE_PAYMENT_LINK } from '@/components/billing/StripeCheckoutModal';
import { CareerBoosterSection } from '@/components/career/CareerBoosterSection';
import { CAREER_FIELDS } from '@/lib/career-api';

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form states with realistic default values for Kuwait & GCC
  const [currentAge, setCurrentAge] = useState(28);
  const [targetAge, setTargetAge] = useState(52);
  const [monthlyIncome, setMonthlyIncome] = useState(1500);
  const [essentialExpenses, setEssentialExpenses] = useState(500);
  const [obligations, setObligations] = useState(300);
  const [currentSavings, setCurrentSavings] = useState(8000);
  const [emergencyMonths, setEmergencyMonths] = useState(6);
  const [riskCategory, setRiskCategory] = useState<'conservative' | 'balanced' | 'growth'>('balanced');
  const [careerCategory, setCareerCategory] = useState<string>(
    () => (typeof window !== 'undefined' ? localStorage.getItem('tharaa_user_career') || 'software-development' : 'software-development')
  );

  // Real financial calculations based strictly on user input
  const totalMonthlyExpenses = essentialExpenses + obligations;
  const calculatedSavingsCapacity = Math.max(0, monthlyIncome - totalMonthlyExpenses);
  const savingsRate = monthlyIncome > 0 ? Math.round((calculatedSavingsCapacity / monthlyIncome) * 100) : 0;
  const expenseRatio = monthlyIncome > 0 ? Math.round((totalMonthlyExpenses / monthlyIncome) * 100) : 0;
  const yearsRemaining = Math.max(1, targetAge - currentAge);
  const annualExpenses = totalMonthlyExpenses * 12;
  const freedomNumber = annualExpenses * 25; // 4% FIRE Rule

  // Comprehensive Yield Evaluation Helper
  const yieldEvaluation = evaluateReturnYield({
    monthlyIncome,
    monthlySavings: calculatedSavingsCapacity,
    annualExpenses,
    currentSavings,
    yearsRemaining,
    riskCategory,
  });

  // Projected freedom age calculation (Compound interest model)
  const monthlyRate = yieldEvaluation.rate / 12;
  let estimatedYearsToFreedom = 14;
  try {
    if (freedomNumber > currentSavings && calculatedSavingsCapacity > 0) {
      const num = Math.log((freedomNumber * monthlyRate + calculatedSavingsCapacity) / (currentSavings * monthlyRate + calculatedSavingsCapacity));
      const den = Math.log(1 + monthlyRate);
      estimatedYearsToFreedom = Math.max(2, Math.round(num / den / 12));
    } else if (currentSavings >= freedomNumber) {
      estimatedYearsToFreedom = 0;
    }
  } catch {
    estimatedYearsToFreedom = 14;
  }
  const calculatedFreedomAge = currentAge + estimatedYearsToFreedom;

  // SMART AI ALERT 1: Age & Horizon Warning/Advantage
  const getStep1Alert = () => {
    if (yearsRemaining <= 6 && currentSavings < annualExpenses * 2) {
      return {
        type: 'warning',
        title: '⚠️ تنبيه انخفاض المردود: سن التقاعد قريب جداً مقارنة برأس المال!',
        text: `المتبقي ${yearsRemaining} سنوات فقط حتى سن تقاعدك المطلوب (${targetAge} سنة). الوقت قصير جداً للاستفادة من قوة النمو التراكمي، مما يضعف عوائد المحفظة. ننصح بزيادة الادخار الشهري فوراً أو تمديد سن التقاعد لـ 55 لتعظيم المردود وتأمين مصاريفك.`
      };
    }
    if (yearsRemaining >= 18) {
      return {
        type: 'success',
        title: '🌟 ميزة تنافسية خارقة: عامل الوقت في صالحك بقوة!',
        text: `أمامك ${yearsRemaining} سنة من أثر النماء التراكمي المركب. كل 100 د.ك تستثمرها شهرياً اليوم ستتضاعف لقرابة 6.4 أضعاف بحلول سن تقاعدك، مما يعطيك أعلى مردود استثماري ممكن.`
      };
    }
    return {
      type: 'info',
      title: '🎯 خط زمني متوازن ومناسب لبناء الثروة',
      text: `فترة ${yearsRemaining} سنة كافية لبناء محفظة أصول شرعية حقيقية توفر لك عائداً شهرياً مستداماً يغطي تكاليف معيشتك.`
    };
  };

  // SMART AI ALERT 2: Cashflow & Return Yield Warning
  const getStep2Alert = () => {
    if (calculatedSavingsCapacity < 100 || expenseRatio >= 85) {
      return {
        type: 'danger',
        title: '🚨 تحذير مالي حرج: المردود الاستثماري سيكون ضعيفاً جداً!',
        text: `المصاريف والالتزامات تلتهم ${expenseRatio}% من دخلك، والفائض المتبقي للادخار (${calculatedSavingsCapacity} د.ك) منخفض جداً. بهذا المعدل، نمو المحفظة سيكون أبطأ من معدل التضخم السنوي (2.8%) ولن يحقق مردوداً مجدياً.`,
        tip: `💡 الحل الذكي: اقتطاع 10% إلى 15% من المصاريف غير الأساسية سيرفع مدخراتك ويضيف أكثر من ${Math.round(yieldEvaluation.extraGain).toLocaleString()} د.ك لثروتك عند التقاعد!`
      };
    }
    if (calculatedSavingsCapacity >= 100 && calculatedSavingsCapacity < 250) {
      return {
        type: 'warning',
        title: '💡 تنبيه تحسين المردود: مردود مقبول مع فرصة لمضاعفة الأرباح!',
        text: `قدرتك الحالية (${calculatedSavingsCapacity} د.ك - ${savingsRate}% من الراتب) بداية مقبولة، لكن رفعها بـ 100 د.ك فقط شهرياً سيختصر 4 سنوات من مسار تقاعدك ويضيف قرابة ${Math.round(yieldEvaluation.extraGain).toLocaleString()} د.ك لثروتك بفضل النماء التراكمي.`,
        tip: null
      };
    }
    if (savingsRate >= 30) {
      return {
        type: 'success',
        title: `💎 مؤشر ادخار استثنائي ومردود قوي جداً (${savingsRate}%)!`,
        text: `أنت في الفئة الذهبية المستعدة للاستقلال المالي السريع. استثمارك لـ ${calculatedSavingsCapacity} د.ك شهرياً يضمن لك مردوداً يفوق التضخم بـ 5.7% سنوياً ويؤسس ثروة مستدامة.`,
        tip: null
      };
    }
    return {
      type: 'info',
      title: '📊 توازن مالي سليم',
      text: `أنت تدخر ${savingsRate}% من راتبك، وهو معدل صحي يمكنك البناء عليه لتعظيم أرباحك وتنمية رأس مالك بأمان.`,
      tip: null
    };
  };

  // SMART AI ALERT 3: Investment Style vs Horizon
  const getStep3Alert = () => {
    if (riskCategory === 'conservative' && yearsRemaining >= 10) {
      return {
        type: 'warning',
        title: '⚠️ تنبيه فوات العوائد: أفقك الزمني طويل والنمط المتحفظ يقلل مردودك!',
        text: `لديك ${yearsRemaining} سنة حتى التقاعد، واختيارك للنمط المتحفظ (عائد 5.5%) يفوّت عليك أكثر من +40% عوائد إضافية يوفرها النمط المتوازن (8.5%) بنفس مبالغ الاستثمار ودون مخاطرة غير مدروسة.`
      };
    }
    if (riskCategory === 'growth' && yearsRemaining <= 5) {
      return {
        type: 'warning',
        title: '⚠️ تنبيه حماية رأس المال: سن تقاعدك قريب والنمو العالي عالي التذبذب!',
        text: `باقي ${yearsRemaining} سنوات فقط على التقاعد؛ أسهم النمو عالية التذبذب وقد تعرض رأس مالك لتقلبات السوق قبل حاجتك للأموال. نوصي بالنمط المتوازن أو المتحفظ لتأمين المكاسب.`
      };
    }
    return {
      type: 'success',
      title: '✅ توافق استثماري ممتاز مع أفقك الزمني',
      text: `اختيار متناسق تماماً مع خطتك الزمنية لتحقيق أفضل توازن بين تنمية الأصول والحفاظ على رأس المال.`
    };
  };

  const step1Alert = getStep1Alert();
  const step2Alert = getStep2Alert();
  const step3Alert = getStep3Alert();

  const handleFinish = (andRedirectToStripe = false) => {
    const profileData: UserFinancialProfile = {
      currentAge,
      targetAge,
      monthlyIncome,
      essentialExpenses,
      obligations,
      currentSavings,
      monthlyCapacity: Math.max(50, calculatedSavingsCapacity),
      desiredFutureIncome: monthlyIncome,
      emergencyMonths,
      riskCategory,
    };

    saveUserProfile(profileData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('tharaa_user_career', careerCategory);
    }

    if (andRedirectToStripe) {
      const stripeUrl = localStorage.getItem('tharaa_stripe_payment_link') || (import.meta.env.VITE_STRIPE_PAYMENT_LINK as string) || DEFAULT_STRIPE_PAYMENT_LINK;
      toast({
        title: 'تم حفظ بياناتك بنجاح 🌟',
        description: 'يتم الآن نقلك لصفحة دفع Stripe الرسمية لتفعيل باقة Pro...',
      });
      window.open(stripeUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => {
        setLocation('/dashboard');
      }, 500);
      return;
    }

    toast({
      title: 'كفو عليك! تم إنشاء خطتك المالية بنجاح 🌟',
      description: 'حيّاك بلوحة تحكمك.. استمتع بتحليلاتك المالية الدقيقة.',
    });

    setLocation('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] py-10 px-4 flex items-center justify-center relative overflow-hidden bg-background text-foreground font-sans">
      {/* Ambient Lighting */}
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl overflow-hidden shadow-xl shadow-primary/20 mb-3 ring-2 ring-secondary/40">
            <img src="/logo-white.jpg" alt="ثراء" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-foreground">
            يا هلا ومسهلا فيك بـ ثـراء! 🌿
          </h1>
          <p className="text-muted-foreground font-medium text-sm sm:text-base mt-2 max-w-lg mx-auto leading-relaxed">
            نموذج مالي ذكي ودقيق يقيس أثر مدخراتك ومردودك الاستثماري الفعلي بلغة كويتية واضحة.
          </p>

          {/* Stepper Progress Bar */}
          <div className="flex items-center justify-center gap-2.5 mt-5 max-w-xs mx-auto">
            <div className={`h-2 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 flex-1 rounded-full transition-all duration-300 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 flex-1 rounded-full transition-all duration-300 ${step >= 4 ? 'bg-secondary' : 'bg-muted'}`} />
          </div>
          <span className="text-xs font-bold text-secondary mt-2 block font-mono">
            الخطوة {step} من 4: {
              step === 1 ? 'العمر وسن التقاعد' :
              step === 2 ? 'المعاش والمصاريف والمردود' :
              step === 3 ? 'نمط الاستثمار الشرعي' :
              'ملخص خطتك ومزايا اشتراك ثراء بلس'
            }
          </span>
        </div>

        {/* Master Glass Card */}
        <Card className="luxury-glass p-6 sm:p-10 rounded-[2.5rem] border-secondary/30 shadow-2xl relative bg-card text-foreground">
          
          {/* STEP 1: العمر وسن التقاعد */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-right">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-base font-bold text-foreground">
                    جم عمرك الحين؟
                  </label>
                  <span className="text-2xl font-extrabold font-mono text-primary bg-primary/10 px-4 py-1 rounded-xl">
                    {currentAge} سنة
                  </span>
                </div>
                <Slider
                  value={[currentAge]}
                  min={18}
                  max={70}
                  step={1}
                  onValueChange={(val) => {
                    setCurrentAge(val[0]);
                    if (val[0] >= targetAge) setTargetAge(val[0] + 5);
                  }}
                  className="py-4"
                />
                <div className="flex gap-2 justify-end pt-1">
                  {[22, 25, 28, 32, 38, 45].map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => {
                        setCurrentAge(age);
                        if (age >= targetAge) setTargetAge(age + 5);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg font-mono font-bold transition-colors ${
                        currentAge === age ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-base font-bold text-foreground">
                    بأي عمر ودّك تتقاعد وترتاح من الشغل؟
                  </label>
                  <span className="text-2xl font-extrabold font-mono text-secondary bg-secondary/15 px-4 py-1 rounded-xl">
                    {targetAge} سنة
                  </span>
                </div>
                <Slider
                  value={[targetAge]}
                  min={currentAge + 1}
                  max={75}
                  step={1}
                  onValueChange={(val) => setTargetAge(val[0])}
                  className="py-4"
                />
                <div className="flex gap-2 justify-end pt-2">
                  {[45, 50, 52, 55, 60].filter(a => a > currentAge).map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => setTargetAge(age)}
                      className={`text-xs px-2.5 py-1 rounded-lg font-mono font-bold transition-colors ${
                        targetAge === age ? 'bg-secondary text-secondary-foreground font-extrabold' : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>

              {/* اختيار مجال وتخصص العمل لربطه بالـ 2 APIs للوظائف */}
              <div className="pt-4 border-t border-border/50">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-base font-bold text-foreground">
                    شنو مجال وتخصص عملك الحالي؟ 💼
                  </label>
                  <span className="text-xs text-secondary font-bold font-mono">
                    فرص دخل إضافي حية ⚡
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  سنعرض لك شواغر عن بُعد حقيقية تناسب خبرتك لتسريع سن تقاعدك (مربوطة بـ 2 APIs).
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CAREER_FIELDS.map((f) => {
                    const isSel = careerCategory === f.apiCategory;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setCareerCategory(f.apiCategory)}
                        className={`p-3 rounded-2xl border text-xs font-bold transition-all text-right cursor-pointer flex flex-col gap-1 ${
                          isSel
                            ? 'border-primary bg-primary/15 text-primary shadow-sm scale-[1.02]'
                            : 'border-border/60 bg-card hover:bg-muted/60 text-muted-foreground'
                        }`}
                      >
                        <span className="text-xl">{f.icon}</span>
                        <span className="text-foreground leading-snug">{f.titleArabic}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Smart Alert for Step 1 */}
              <div className={`p-4 rounded-2xl border text-right transition-all ${
                step1Alert.type === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  : step1Alert.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                  : 'bg-primary/10 border-primary/25 text-foreground'
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  {step1Alert.type === 'warning' ? <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" /> : <Sparkles className="h-4 w-4 text-secondary shrink-0" />}
                  <span>{step1Alert.title}</span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  {step1Alert.text}
                </p>
              </div>

              <Button
                type="button"
                onClick={() => setStep(2)}
                className="w-full h-14 text-base font-bold rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/25 transition-all hover:-translate-y-0.5 mt-2"
              >
                <span>التالي: معاشك ومصاريفك</span>
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {/* STEP 2: المعاش والمصاريف الشهرية وتنبيهات المردود */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300 text-right">
              
              {/* الراتب الشهري */}
              <div>
                <label className="text-sm font-bold text-foreground block mb-2">
                  جم صافي معاشك أو دخلك الشهري؟ (د.ك)
                </label>
                <div className="relative flex items-center">
                  <Input
                    type="number"
                    value={monthlyIncome || ''}
                    onChange={(e) => setMonthlyIncome(Number(e.target.value) || 0)}
                    className="h-14 rounded-2xl bg-background border-border text-lg font-mono font-bold pl-12"
                    dir="ltr"
                  />
                  <span className="absolute left-4 text-xs font-bold text-muted-foreground font-mono">د.ك</span>
                </div>
                <div className="flex gap-2 justify-end pt-1.5">
                  {[1000, 1400, 1800, 2500, 3200].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setMonthlyIncome(val)}
                      className="text-xs px-2.5 py-1 rounded-lg font-mono font-bold bg-muted hover:bg-muted/80 text-muted-foreground"
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* المصاريف والالتزامات */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1.5">
                    المصاريف الأساسية (معيشة، فواتير، تسوق)
                  </label>
                  <Input
                    type="number"
                    value={essentialExpenses || ''}
                    onChange={(e) => setEssentialExpenses(Number(e.target.value) || 0)}
                    className="h-12 rounded-xl bg-background border-border font-mono font-bold"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground block mb-1.5">
                    الالتزامات (إيجار، أقساط، قروض)
                  </label>
                  <Input
                    type="number"
                    value={obligations || ''}
                    onChange={(e) => setObligations(Number(e.target.value) || 0)}
                    className="h-12 rounded-xl bg-background border-border font-mono font-bold"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* المدخرات الحالية */}
              <div>
                <label className="text-sm font-bold text-foreground block mb-1.5">
                  جم عندك كاش ومدخرات متوفرة حالياً؟ (د.ك)
                </label>
                <Input
                  type="number"
                  value={currentSavings || ''}
                  onChange={(e) => setCurrentSavings(Number(e.target.value) || 0)}
                  className="h-12 rounded-xl bg-background border-border text-base font-mono font-bold"
                  dir="ltr"
                />
              </div>

              {/* الحسبة التلقائية المباشرة */}
              <div className="p-4 rounded-2xl bg-card border border-border/80 space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-muted-foreground">فائضك الفعلي القابل للاستثمار شهرياً:</span>
                  <span className={`font-mono text-base font-black ${calculatedSavingsCapacity >= 200 ? 'text-primary' : 'text-amber-600'}`}>
                    {formatCurrency(calculatedSavingsCapacity)} ({savingsRate}% من الراتب)
                  </span>
                </div>
                <div className="flex justify-between items-center font-bold">
                  <span className="text-muted-foreground">رقم حريتك المالية المطلوب لتقاعدك:</span>
                  <span className="font-mono text-secondary text-base font-black">
                    {formatCurrency(freedomNumber)}
                  </span>
                </div>
              </div>

              {/* DYNAMIC SMART ALERT FOR RETURN YIELD (تنبيه ذكي إذا المردود ضعيف) */}
              <div className={`p-4 rounded-2xl border text-right transition-all ${
                step2Alert.type === 'danger'
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-950 dark:text-rose-200'
                  : step2Alert.type === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-900 dark:text-amber-200'
                  : step2Alert.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                  : 'bg-primary/10 border-primary/25 text-foreground'
              }`}>
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm mb-1">
                  {step2Alert.type === 'danger' ? (
                    <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0" />
                  ) : step2Alert.type === 'warning' ? (
                    <Info className="h-4 w-4 text-amber-500 shrink-0" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />
                  )}
                  <span>{step2Alert.title}</span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  {step2Alert.text}
                </p>
                {step2Alert.tip && (
                  <div className="mt-2.5 p-2.5 bg-background/80 rounded-xl border border-border/60 text-xs font-semibold text-foreground">
                    {step2Alert.tip}
                  </div>
                )}
              </div>

              {/* تسريع التقاعد ومضاعفة الدخل عبر 2 APIs للوظائف والعملات */}
              <div className="pt-4 border-t border-border/50">
                <CareerBoosterSection
                  initialCategory={careerCategory}
                  currentSavings={currentSavings}
                  currentMonthlySavings={calculatedSavingsCapacity}
                  annualExpenses={annualExpenses}
                  currentAge={currentAge}
                  targetAge={targetAge}
                  isCompact={true}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="h-14 px-6 rounded-2xl font-bold border-border"
                >
                  <ArrowRight className="ml-1 h-5 w-5" />
                  <span>رجوع</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 h-14 text-base font-bold rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/25 transition-all hover:-translate-y-0.5"
                >
                  <span>التالي: نمط الاستثمار الشرعي</span>
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: نمط الاستثمار الشرعي وتنبيهات التوافق الزمني */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-right">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  شلون تحب توزع محفظتك واستثماراتك؟
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  جميع الخيارات مفروزة ومطابقة للمعايير الشرعية المعتمدة دولياً (AAOIFI):
                </p>
              </div>

              <div className="grid gap-3.5">
                {/* 1. متحفظ */}
                <button
                  type="button"
                  onClick={() => setRiskCategory('conservative')}
                  className={`p-5 rounded-2xl border-2 text-right transition-all flex items-start gap-4 ${
                    riskCategory === 'conservative'
                      ? 'border-primary bg-primary/10 shadow-md scale-[1.01]'
                      : 'border-border/70 hover:border-border hover:bg-muted/40'
                  }`}
                >
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                    riskCategory === 'conservative' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-foreground">متحفظ (أمان عالي وصكوك)</span>
                      <span className="text-xs font-mono font-bold text-primary">عائد متوقع 5.5%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      تركيز على الصكوك السيادية والمرابحة مع حفظ كامل لرأس المال بأقل تذبذب ممكن.
                    </p>
                  </div>
                </button>

                {/* 2. متوازن */}
                <button
                  type="button"
                  onClick={() => setRiskCategory('balanced')}
                  className={`p-5 rounded-2xl border-2 text-right transition-all flex items-start gap-4 ${
                    riskCategory === 'balanced'
                      ? 'border-secondary bg-secondary/10 shadow-md scale-[1.01]'
                      : 'border-border/70 hover:border-border hover:bg-muted/40'
                  }`}
                >
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                    riskCategory === 'balanced' ? 'bg-secondary text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    <Activity className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-foreground">متوازن (الخيار الذهبي للغالبية ⭐)</span>
                      <span className="text-xs font-mono font-bold text-secondary">عائد متوقع 8.5%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      مزيج متناسق بين أسهم الشركات العالمية النقية، صناديق العقار (ريت)، والصكوك.
                    </p>
                  </div>
                </button>

                {/* 3. نمو عالي */}
                <button
                  type="button"
                  onClick={() => setRiskCategory('growth')}
                  className={`p-5 rounded-2xl border-2 text-right transition-all flex items-start gap-4 ${
                    riskCategory === 'growth'
                      ? 'border-emerald-600 bg-emerald-600/10 shadow-md scale-[1.01]'
                      : 'border-border/70 hover:border-border hover:bg-muted/40'
                  }`}
                >
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                    riskCategory === 'growth' ? 'bg-emerald-600 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-base text-foreground">نمو عالي وجريء</span>
                      <span className="text-xs font-mono font-bold text-emerald-600">عائد متوقع 11.5%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      تركيز أكبر على أسهم التكنولوجيا والنمو العالمي للوصول لحريتك المالية بوقت أسرع.
                    </p>
                  </div>
                </button>
              </div>

              {/* Dynamic Alert for Step 3 */}
              <div className={`p-4 rounded-2xl border text-right transition-all ${
                step3Alert.type === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
              }`}>
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm mb-1">
                  {step3Alert.type === 'warning' ? (
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  )}
                  <span>{step3Alert.title}</span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  {step3Alert.text}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="h-14 px-6 rounded-2xl font-bold border-border"
                >
                  <ArrowRight className="ml-1 h-5 w-5" />
                  <span>رجوع</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex-1 h-14 text-base font-bold rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/25 transition-all hover:-translate-y-0.5"
                >
                  <span>عرض النتيجة ومميزات ثراء بلس</span>
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: ملخص الخطة الحقيقي + مميزات اشتراك ثراء بلس + زر الدفع عبر Stripe */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-right">
              
              {/* Real Forecast Results */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/15 via-secondary/10 to-card border border-secondary/30 shadow-lg text-center space-y-3">
                <span className="inline-block px-3.5 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-bold">
                  نتيجة استبيانك المالي الحقيقي 🎯
                </span>
                
                <h3 className="text-2xl sm:text-3xl font-display font-black text-foreground">
                  سن حريتك المالية المتوقع: <span className="text-primary font-mono">{calculatedFreedomAge} سنة</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-3 pt-2 max-w-md mx-auto text-right">
                  <div className="p-3 bg-card/80 rounded-2xl border border-border/80">
                    <span className="text-[11px] text-muted-foreground block font-bold">رقم حريتك المالية</span>
                    <strong className="text-sm sm:text-base font-mono text-secondary">
                      {formatCurrency(freedomNumber)}
                    </strong>
                  </div>
                  <div className="p-3 bg-card/80 rounded-2xl border border-border/80">
                    <span className="text-[11px] text-muted-foreground block font-bold">رأس المال المتوقع</span>
                    <strong className="text-sm sm:text-base font-mono text-primary">
                      {formatCurrency(yieldEvaluation.projectedWealth)}
                    </strong>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed pt-1">
                  بناءً على استثمار <strong className="text-foreground font-mono">{formatCurrency(calculatedSavingsCapacity)}</strong> شهرياً بمعدل نمو شرعي <strong className="text-primary font-mono">{(yieldEvaluation.rate * 100).toFixed(1)}%</strong>.
                </p>
              </div>

              {/* THARAA PRO SUBSCRIPTION FEATURES SHOWCASE */}
              <div className="p-6 rounded-3xl bg-gradient-to-b from-secondary/15 to-secondary/5 border-2 border-secondary/40 shadow-xl space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="h-11 w-11 rounded-2xl bg-secondary text-secondary-foreground flex items-center justify-center font-bold shadow-md">
                      <Crown className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-display font-extrabold text-base sm:text-lg text-foreground">
                        مميزات اشتراك باقة ثراء بلس (Tharaa Pro)
                      </h4>
                      <span className="text-xs text-muted-foreground">أدوات مالية ذكية ومتقدمة لتعظيم مردودك</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-base sm:text-lg font-black text-primary font-mono bg-primary/10 px-3 py-1 rounded-xl block">
                      9 د.ك / شهرياً
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">~$29 USD</span>
                  </div>
                </div>

                {/* 5 Distinct Exclusive Pro Features */}
                <div className="grid gap-2.5 pt-2">
                  <div className="flex items-start gap-3 text-xs text-foreground bg-card/85 p-3 rounded-2xl border border-border/60">
                    <PieChart className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-foreground mb-0.5">توزيع المحفظة الشرعية التفصيلي (AAOIFI):</strong>
                      <span className="text-muted-foreground">نسب استثمار مخصصة بالدينار في الصكوك، الأسهم النقية، وصناديق الريت العقارية.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs text-foreground bg-card/85 p-3 rounded-2xl border border-border/60">
                    <Bell className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-foreground mb-0.5">تنبيهات الذكاء المالي الدورية لإعادة التوازن:</strong>
                      <span className="text-muted-foreground">إشعارات فورية عند صعود أو هبوط الأسواق لاقتناص أفضل الفرص وتأمين المكاسب.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs text-foreground bg-card/85 p-3 rounded-2xl border border-border/60">
                    <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-foreground mb-0.5">تقرير PDF مالي استثماري شامل:</strong>
                      <span className="text-muted-foreground">ملف احترافي قابل للتحميل والطباعة يوثق خطتك ومسار حريتك المالية بدقة.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs text-foreground bg-card/85 p-3 rounded-2xl border border-border/60">
                    <Zap className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-foreground mb-0.5">مستشار مالي ذكي 24/7 دون قيود:</strong>
                      <span className="text-muted-foreground">استشر الذكاء المالي بأي وقت لتعديل خطتك أو محاكاة قرارات الشراء والاستثمار.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs text-foreground bg-card/85 p-3 rounded-2xl border border-border/60">
                    <Award className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-foreground mb-0.5">حاسبة الزكاة الذكية الدورية:</strong>
                      <span className="text-muted-foreground">حساب تلقائي دقيق لمقدار الزكاة الواجب إخراجها على أصولك ونقدك سنوياً.</span>
                    </div>
                  </div>
                </div>

                {/* DIRECT STRIPE CHECKOUT BUTTON */}
                <div className="pt-3">
                  <Button
                    type="button"
                    onClick={() => handleFinish(true)}
                    className="w-full h-15 text-base sm:text-lg font-black rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-2xl shadow-secondary/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2.5 cursor-pointer py-4"
                  >
                    <ExternalLink className="h-5 w-5 shrink-0" />
                    <span>الاشتراك في ثراء بلس والدفع عبر Stripe (9 د.ك) 💳</span>
                  </Button>
                  <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground mt-2.5">
                    <Lock className="h-3 w-3 text-secondary" />
                    <span>دفع مشفر وآمن 100% مدعوم بـ Stripe | يدعم Apple Pay، البطاقات الائتمانية و KNET</span>
                  </div>
                </div>
              </div>

              {/* Free Plan / Continue Button */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(3)}
                  className="h-14 px-6 rounded-2xl font-bold border-border"
                >
                  <ArrowRight className="ml-1 h-5 w-5" />
                  <span>رجوع</span>
                </Button>
                <Button
                  type="button"
                  onClick={() => handleFinish(false)}
                  className="flex-1 h-14 text-sm sm:text-base font-bold rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/25 transition-all hover:scale-[1.01]"
                >
                  <Sparkles className="ml-2 h-5 w-5 text-secondary" />
                  <span>المتابعة بالخطة الأساسية ودخول لوحة التحكم 🚀</span>
                </Button>
              </div>

            </div>
          )}

        </Card>

        {/* Footnote */}
        <p className="text-center text-xs text-muted-foreground mt-6 font-medium">
          💡 جميع بياناتك وأرقامك محفوظة محلياً وتقدر تعدلها بأي وقت عبر صفحة <strong className="text-foreground">الإعدادات</strong>.
        </p>

      </div>
    </div>
  );
}
