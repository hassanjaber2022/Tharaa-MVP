import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useGetDashboard, useGetProfile } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import {
  Wallet,
  Calculator,
  Target,
  ShieldCheck,
  TrendingUp,
  ArrowLeft,
  FileText,
  Activity,
  Plus,
  Flame,
  Award,
  Sparkles,
  CalendarCheck,
  Home as HomeIcon,
  GraduationCap,
  PieChart,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Crown,
  Coins,
  Rocket,
  Zap,
  SlidersHorizontal,
  ArrowUpRight,
  Layers,
  AlertTriangle,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/use-user-profile';
import { evaluateReturnYield } from '@/lib/user-profile';
import { StripeCheckoutModal } from '@/components/billing/StripeCheckoutModal';
import { CareerBoosterSection } from '@/components/career/CareerBoosterSection';

interface GoalVault {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  icon: 'home' | 'shield' | 'education' | 'wealth';
  deadlineYears: number;
}

const DEFAULT_VAULTS: GoalVault[] = [
  { id: '1', title: 'صندوق الأمان والطوارئ (6 أشهر)', targetAmount: 7200, currentAmount: 4800, icon: 'shield', deadlineYears: 1 },
  { id: '2', title: 'دفعة بيت العمر', targetAmount: 65000, currentAmount: 18500, icon: 'home', deadlineYears: 6 },
  { id: '3', title: 'صندوق تعليم الأبناء', targetAmount: 25000, currentAmount: 8200, icon: 'education', deadlineYears: 10 },
  { id: '4', title: 'محفظة النمو والحرية المالية', targetAmount: 150000, currentAmount: 34000, icon: 'wealth', deadlineYears: 15 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: dashboard, isLoading, error } = useGetDashboard();
  const { data: profile } = useGetProfile();

  // Reactive Financial Profile based on actual user input from Onboarding/Settings
  const {
    profile: userProfile,
    monthlyIncome,
    monthlyExpenses,
    monthlyCapacity,
    currentSavings,
    currentAge,
    targetAge,
    riskCategory,
    annualExpenses,
    freedomNumber,
    fireProgress,
    yearsToFreedom,
    freedomAge,
    emergencyTarget,
    emergencyProgress,
  } = useUserProfile();

  const yieldEvaluation = evaluateReturnYield({
    monthlyIncome,
    monthlySavings: monthlyCapacity,
    annualExpenses,
    currentSavings,
    yearsRemaining: Math.max(1, targetAge - currentAge),
    riskCategory,
  });

  // Goals Vault state (re-reads whenever userProfile changes or tharaa_vaults_update fires)
  const [vaults, setVaults] = useState<GoalVault[]>(() => {
    try {
      const saved = localStorage.getItem('tharaa_goal_vaults');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_VAULTS;
  });

  useEffect(() => {
    const handleVaultsUpdate = () => {
      try {
        const saved = localStorage.getItem('tharaa_goal_vaults');
        if (saved) setVaults(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('tharaa_profile_update', handleVaultsUpdate);
    window.addEventListener('tharaa_vaults_update', handleVaultsUpdate);
    return () => {
      window.removeEventListener('tharaa_profile_update', handleVaultsUpdate);
      window.removeEventListener('tharaa_vaults_update', handleVaultsUpdate);
    };
  }, []);

  // Streaks state
  const [checkIns, setCheckIns] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('tharaa-daily-check-ins') || '[]');
    } catch {
      return [];
    }
  });

  const [monthlyBoost, setMonthlyBoost] = useState(25);

  const todayKey = new Date().toLocaleDateString('sv-SE');
  const checkedInToday = checkIns.includes(todayKey);

  const completeDailyChallenge = () => {
    if (checkedInToday) return;
    const next = [...checkIns, todayKey];
    setCheckIns(next);
    localStorage.setItem('tharaa-daily-check-ins', JSON.stringify(next));
  };

  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('success') === 'true' || params.get('session_id')) {
        localStorage.setItem('tharaa_subscription_tier', 'pro');
        window.dispatchEvent(new CustomEvent('tharaa_subscription_change', { detail: 'pro' }));
        toast({
          title: 'ألف مبروك! تم تفعيل ثراء بلس (Pro) بنجاح 🌟',
          description: 'شكراً لاشتراكك عبر Stripe! تم تفعيل كامل المزايا وحسابات التقاعد المتقدمة لحسابك.',
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [toast]);

  // Interactive Widgets State & Calculation
  const [isStripeOpen, setIsStripeOpen] = useState(false);
  const [dailySaveKuwait, setDailySaveKuwait] = useState(3);
  const [extraZakatAssets, setExtraZakatAssets] = useState(0);

  const monthlySavedFromDaily = dailySaveKuwait * 30;
  const rateMonthly = 0.085 / 12;
  const future10Years = Math.round(monthlySavedFromDaily * ((Math.pow(1 + rateMonthly, 120) - 1) / rateMonthly));
  const future20Years = Math.round(monthlySavedFromDaily * ((Math.pow(1 + rateMonthly, 240) - 1) / rateMonthly));

  const totalZakatBase = currentSavings + extraZakatAssets;
  const isNisabReached = totalZakatBase >= 1800;
  const zakatDue = isNisabReached ? Math.round(totalZakatBase * 0.025) : 0;

  // Interactive Feature 1: Lump-Sum Freedom Booster
  const [lumpSumBooster, setLumpSumBooster] = useState(1500);
  const boosterGrowth15 = Math.round(lumpSumBooster * Math.pow(1 + 0.085, 15));
  const monthsCutOff = Math.max(1, Math.round((lumpSumBooster / Math.max(150, monthlyCapacity)) * 1.5));
  const yearsCutOffFormatted = (monthsCutOff / 12).toFixed(1);

  // Interactive Feature 2: Kuwaiti Salary Budget Lab
  const [budgetStrategy, setBudgetStrategy] = useState<'balanced' | 'aggressive' | 'security'>('balanced');
  const budgetRatios = {
    balanced: { name: 'المتوازن الكويتي (50 / 30 / 20)', needs: 50, wants: 30, invest: 20, desc: 'توازن ممتاز بين مصاريف المعيشة ومتعة الحياة ونمو المحفظة' },
    aggressive: { name: 'المستثمر الطموح (40 / 20 / 40)', needs: 40, wants: 20, invest: 40, desc: 'ضغط الصرف الترفيهي لمضاعفة سرعة بلوغ الاستقلال المالي' },
    security: { name: 'العائلي المحافظ (60 / 20 / 20)', needs: 60, wants: 20, invest: 20, desc: 'تغطية واسعة للالتزامات الأسرية مع بناء حصن استثماري آمن' },
  }[budgetStrategy];

  const needsAmount = Math.round(monthlyIncome * (budgetRatios.needs / 100));
  const wantsAmount = Math.round(monthlyIncome * (budgetRatios.wants / 100));
  const investAmount = Math.round(monthlyIncome * (budgetRatios.invest / 100));

  return (
    <div className="container max-w-screen-xl mx-auto py-8 md:py-12 px-4 pb-32">
      <StripeCheckoutModal
        isOpen={isStripeOpen}
        onClose={() => setIsStripeOpen(false)}
      />

      {/* 1. TOP HEADER & WELCOME */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-bold mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>لوحة التحكم المالية الشخصية</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-foreground">
            أهلاً، {user?.name?.split(' ')[0] || 'مستثمر ثراء'} 👋
          </h1>
          <p className="text-muted-foreground text-base md:text-lg font-medium mt-1">
            إليك نظرة شاملة على نبضتك المالية ومسار استقلالك اليوم
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/onboarding">
            <Button className="rounded-2xl h-12 px-5 font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-secondary" />
              <span>عدّل خطتك ومعطياتك ✏️</span>
            </Button>
          </Link>

          <Button
            onClick={() => {
              const directLink = localStorage.getItem('tharaa_stripe_payment_link') || (import.meta.env.VITE_STRIPE_PAYMENT_LINK as string) || 'https://buy.stripe.com/test_4gM7sK0El18wcsV7pP3Ru00';
              window.open(directLink, '_blank', 'noopener,noreferrer');
            }}
            className="rounded-2xl h-12 px-5 font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg shadow-secondary/20 transition-all hover:scale-105 flex items-center gap-2 cursor-pointer"
          >
            <Crown className="h-4 w-4" />
            <span>ترقية لـ ثراء بلس (Pro)</span>
          </Button>

          <Link href="/calculator">
            <Button className="rounded-2xl h-12 px-6 font-bold bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:scale-105 flex items-center gap-2">
              <Calculator className="h-4 w-4 text-secondary" />
              <span>الحاسبة المتقدمة</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 1.5 DYNAMIC SMART AI RETURN YIELD ADVISORY BANNER */}
      <div className={`p-6 rounded-[2rem] border mb-8 transition-all relative overflow-hidden ${
        yieldEvaluation.status === 'weak'
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200'
          : yieldEvaluation.status === 'moderate'
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
              yieldEvaluation.status === 'weak'
                ? 'bg-rose-500/20 text-rose-600'
                : yieldEvaluation.status === 'moderate'
                ? 'bg-amber-500/20 text-amber-600'
                : 'bg-emerald-500/20 text-emerald-600'
            }`}>
              {yieldEvaluation.status === 'weak' ? (
                <AlertTriangle className="h-6 w-6" />
              ) : yieldEvaluation.status === 'moderate' ? (
                <Info className="h-6 w-6" />
              ) : (
                <Sparkles className="h-6 w-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-background/60">
                  مستشار ثراء الذكي 🤖
                </span>
                <strong className="text-base font-display font-extrabold">
                  {yieldEvaluation.title}
                </strong>
              </div>
              <p className="text-xs sm:text-sm font-medium leading-relaxed opacity-90 max-w-3xl">
                {yieldEvaluation.warningMessage}
              </p>
              {yieldEvaluation.optimizationTip && (
                <p className="text-xs font-bold text-foreground mt-2 bg-background/50 p-2.5 rounded-xl border border-border/40 inline-block">
                  {yieldEvaluation.optimizationTip}
                </p>
              )}
            </div>
          </div>

          {/* Clean targeted link with zero duplication */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <Link href="/onboarding">
              <Button size="sm" className="rounded-xl font-bold text-xs h-9 bg-primary text-white hover:bg-primary/90 shadow-sm flex items-center gap-1.5">
                <span>عدّل خطتك ومصاريفك ✏️</span>
                <ArrowLeft className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. FINANCIAL FREEDOM (FIRE) MASTER CARD */}
      <Card className="luxury-glass p-8 md:p-10 rounded-[2.5rem] border-secondary/30 relative overflow-hidden mb-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid lg:grid-cols-3 gap-8 items-center relative z-10">
          {/* Freedom Age Badge */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 text-secondary font-bold text-sm">
              <Award className="h-5 w-5" />
              <span>مقياس الحرية والاستقلال المالي (FIRE)</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-foreground leading-tight">
              سن حريتك المالية المتوقع: <span className="text-primary">{freedomAge} سنة</span>
            </h2>

            <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed max-w-2xl">
              رقم حريتك المالية هو <strong className="text-foreground">{formatCurrency(freedomNumber)}</strong>. عند وصول استثماراتك إلى هذا الرقم، ستغطي عوائدك السنوية مصاريفك المعيشية بالكامل دون الحاجة لأي راتب وظيفي.
            </p>

            {/* Progress Bar */}
            <div className="space-y-2 pt-3">
              <div className="flex justify-between text-sm font-bold">
                <span className="text-muted-foreground">التقدم نحو رقم الحرية المالية ({formatCurrency(currentSavings)})</span>
                <span className="text-secondary">{fireProgress}% مكتمل</span>
              </div>
              <Progress value={fireProgress} className="h-3.5 bg-muted rounded-full [&>div]:emerald-gradient" />
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 lg:border-r border-border/60 lg:pr-8">
            <div className="p-5 rounded-2xl bg-card/80 border border-border/80 text-center">
              <Clock className="h-5 w-5 text-secondary mx-auto mb-2" />
              <span className="text-xs text-muted-foreground font-bold block">سنوات متبقية</span>
              <strong className="text-2xl font-display font-bold text-foreground">
                {yearsToFreedom} سنة
              </strong>
            </div>

            <div className="p-5 rounded-2xl bg-card/80 border border-border/80 text-center">
              <TrendingUp className="h-5 w-5 text-primary mx-auto mb-2" />
              <span className="text-xs text-muted-foreground font-bold block">الادخار الشهري</span>
              <strong className="text-2xl font-display font-bold text-foreground">
                {formatCurrency(monthlyCapacity)}
              </strong>
            </div>

            <div className="col-span-2 p-4 rounded-2xl bg-primary/10 border border-primary/20 text-center">
              <span className="text-xs text-primary font-bold block mb-0.5">مؤشر الاستدامة المالية</span>
              <span className="text-sm font-semibold text-foreground">
                أنت تدخر {Math.round((monthlyCapacity / monthlyIncome) * 100)}% من دخلك الشهري
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 2.5 INTERACTIVE KUWAITI WIDGETS: DAILY COFFEE SAVINGS & QUICK ZAKAT CALCULATOR */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Widget 1: وفرك اليومي وتضاعف الثروة */}
        <Card className="luxury-glass p-7 rounded-[2.5rem] border-secondary/30 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center font-bold">
                  ☕
                </div>
                <div>
                  <h3 className="text-lg font-display font-extrabold text-foreground">
                    وفّرت قهوتك أو مطعمك اليوم؟
                  </h3>
                  <span className="text-xs text-muted-foreground">شاهد كيف يصنع التوفير اليومي ثروة خليجية</span>
                </div>
              </div>
              <span className="text-xs font-bold text-secondary bg-secondary/15 px-3 py-1 rounded-full font-mono">
                {dailySaveKuwait} د.ك / يوم
              </span>
            </div>

            <div className="space-y-4 py-2">
              <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                <span>جم ودّك توفر باليوم؟</span>
                <span className="text-primary font-mono text-sm font-extrabold">{dailySaveKuwait * 30} د.ك بالشهر</span>
              </div>
              <Slider
                value={[dailySaveKuwait]}
                min={1}
                max={15}
                step={1}
                onValueChange={(v) => setDailySaveKuwait(v[0])}
                className="py-2"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>1 د.ك (قهوة)</span>
                <span>5 د.ك (غدا)</span>
                <span>10 د.ك (طلعة)</span>
                <span>15 د.ك</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 text-center">
                <span className="text-[11px] text-muted-foreground block">بعد 10 سنين تصبح:</span>
                <strong className="text-xl font-mono font-black text-foreground block mt-0.5">
                  {formatCurrency(future10Years)}
                </strong>
              </div>
              <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-center">
                <span className="text-[11px] text-primary font-bold block">بعد 20 سنة تصبح:</span>
                <strong className="text-xl font-mono font-black text-primary block mt-0.5">
                  {formatCurrency(future20Years)}
                </strong>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-4 pt-3 border-t border-border/40 text-center font-medium">
            💡 الاستثمار التراكمي بمعدل 8.5% يحول الدنانير الصغيرة المنسية إلى استقلال مالي حقيقي.
          </p>
        </Card>

        {/* Widget 2: حاسبة زكاة المال ونماء البركة */}
        <Card className="luxury-glass p-7 rounded-[2.5rem] border-primary/25 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                  <Coins className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-extrabold text-foreground">
                    حاسبة زكاة المال والبركة
                  </h3>
                  <span className="text-xs text-muted-foreground">تطهير للمال ونماء حقيقي لثروتك (2.5%)</span>
                </div>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                متوافق مع الشريعة 🌿
              </span>
            </div>

            <div className="space-y-3 py-1">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-muted-foreground">وعاء السيولة والمدخرات الحالية:</span>
                <span className="font-mono text-foreground">{formatCurrency(currentSavings)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-muted-foreground">ذهب واستثمارات إضافية قابلة للزكاة:</span>
                <span className="font-mono text-secondary">+{formatCurrency(extraZakatAssets)}</span>
              </div>
              <Slider
                value={[extraZakatAssets]}
                min={0}
                max={50000}
                step={500}
                onValueChange={(v) => setExtraZakatAssets(v[0])}
                className="py-2"
              />
            </div>

            <div className="p-4 rounded-2xl bg-secondary/15 border border-secondary/30 mt-3 text-center">
              <span className="text-xs font-bold text-secondary-foreground block mb-1">
                مقدار الزكاة الواجب إخراجها لهذا الحول:
              </span>
              <strong className="text-3xl font-display font-black text-primary block font-mono">
                {isNisabReached ? formatCurrency(zakatDue) : 'لم يبلغ النصاب (أقل من 1,800 د.ك)'}
              </strong>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-4 pt-3 border-t border-border/40">
            <span>النصاب المقدر: ما يعادل 85 جرام ذهب</span>
            <span className="text-primary font-bold">«خُذْ مِنْ أَمْوَالِهِمْ صَدَقَةً تُطَهِّرُهُمْ»</span>
          </div>
        </Card>
      </div>

      {/* 2.8 INTERACTIVE WEALTH ACCELERATORS: FREEDOM BOOSTER & SALARY BUDGET LAB */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Interactive Feature A: صاروخ تسريع موعد الحرية المالية */}
        <Card className="luxury-glass p-7 rounded-[2.5rem] border-secondary/30 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center font-bold">
                  <Rocket className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-extrabold text-foreground">
                    صاروخ تسريع موعد تقاعدك وحريتك 🚀
                  </h3>
                  <span className="text-xs text-muted-foreground">شاهد أثر ضخ دفعة استثنائية (بونص، دعم، بيع أصل)</span>
                </div>
              </div>
              <span className="text-xs font-bold text-secondary bg-secondary/15 px-3 py-1 rounded-full font-mono">
                +{formatCurrency(lumpSumBooster)} دفعة
              </span>
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-2 py-2">
              {[500, 1000, 2500, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setLumpSumBooster(amt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    lumpSumBooster === amt
                      ? 'bg-secondary text-secondary-foreground shadow-md scale-105'
                      : 'bg-muted/70 text-foreground hover:bg-muted'
                  }`}
                >
                  +{formatCurrency(amt)}
                </button>
              ))}
            </div>

            <div className="space-y-2 py-2">
              <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                <span>حجم الدفعة المستثمرة:</span>
                <span className="text-foreground font-mono text-sm font-extrabold">{formatCurrency(lumpSumBooster)}</span>
              </div>
              <Slider
                value={[lumpSumBooster]}
                min={200}
                max={10000}
                step={100}
                onValueChange={(v) => setLumpSumBooster(v[0])}
                className="py-2"
              />
            </div>

            {/* Impact Result Cards */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="p-3.5 rounded-2xl bg-secondary/15 border border-secondary/30 text-center">
                <span className="text-[11px] text-secondary-foreground font-bold block">يختصر من رحلتك للحرية:</span>
                <strong className="text-xl font-display font-black text-secondary-foreground block mt-0.5">
                  {yearsCutOffFormatted} سنة
                </strong>
                <span className="text-[10px] text-muted-foreground">({monthsCutOff} شهر مبكر)</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 text-center">
                <span className="text-[11px] text-muted-foreground block">تصبح بعد 15 سنة (8.5%):</span>
                <strong className="text-xl font-mono font-black text-primary block mt-0.5">
                  {formatCurrency(boosterGrowth15)}
                </strong>
                <span className="text-[10px] text-emerald-600 font-bold">تتضاعف {(boosterGrowth15 / lumpSumBooster).toFixed(1)}x مرات</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-4 pt-3 border-t border-border/40 text-center font-medium">
            ⚡ دينار اليوم في الأصول الحقيقية يسبق عشرات الدنانير لاحقاً بفضل النمو التراكمي.
          </p>
        </Card>

        {/* Interactive Feature B: مختبر تقسيم الراتب الشهري الذكي */}
        <Card className="luxury-glass p-7 rounded-[2.5rem] border-primary/25 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-2xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                  <SlidersHorizontal className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-extrabold text-foreground">
                    توزيع راتبك الذكي ({formatCurrency(monthlyIncome)})
                  </h3>
                  <span className="text-xs text-muted-foreground">اختر النمط واكتشف الحسبة المثالية لميزانيتك</span>
                </div>
              </div>
            </div>

            {/* Strategy Selectors */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setBudgetStrategy('balanced')}
                className={`p-2.5 rounded-2xl text-xs font-bold transition-all border text-center ${
                  budgetStrategy === 'balanced'
                    ? 'bg-primary text-white border-primary shadow-md scale-102'
                    : 'bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                ⚖️ متوازن
                <span className="block text-[10px] opacity-80 mt-0.5">50 / 30 / 20</span>
              </button>

              <button
                type="button"
                onClick={() => setBudgetStrategy('aggressive')}
                className={`p-2.5 rounded-2xl text-xs font-bold transition-all border text-center ${
                  budgetStrategy === 'aggressive'
                    ? 'bg-secondary text-secondary-foreground border-secondary shadow-md scale-102'
                    : 'bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                🚀 طموح
                <span className="block text-[10px] opacity-80 mt-0.5">40 / 20 / 40</span>
              </button>

              <button
                type="button"
                onClick={() => setBudgetStrategy('security')}
                className={`p-2.5 rounded-2xl text-xs font-bold transition-all border text-center ${
                  budgetStrategy === 'security'
                    ? 'bg-card text-foreground border-primary/40 shadow-md scale-102'
                    : 'bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                🛡️ عائلي
                <span className="block text-[10px] opacity-80 mt-0.5">60 / 20 / 20</span>
              </button>
            </div>

            {/* Segmented ratio bar */}
            <div className="h-3 rounded-full overflow-hidden flex mb-4 shadow-inner">
              <div style={{ width: `${budgetRatios.needs}%` }} className="bg-slate-400" title={`أساسيات ${budgetRatios.needs}%`} />
              <div style={{ width: `${budgetRatios.wants}%` }} className="bg-secondary" title={`وناسة ${budgetRatios.wants}%`} />
              <div style={{ width: `${budgetRatios.invest}%` }} className="bg-primary" title={`استثمار ${budgetRatios.invest}%`} />
            </div>

            {/* 3 Distributed stats cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-2xl bg-card border border-border/80 text-center">
                <span className="text-[10px] text-muted-foreground font-bold block">🏠 الأساسيات</span>
                <strong className="text-sm font-mono font-black text-foreground block mt-1">
                  {formatCurrency(needsAmount)}
                </strong>
                <span className="text-[10px] text-muted-foreground">({budgetRatios.needs}%)</span>
              </div>

              <div className="p-3 rounded-2xl bg-secondary/10 border border-secondary/20 text-center">
                <span className="text-[10px] text-secondary font-bold block">✨ الوناسة</span>
                <strong className="text-sm font-mono font-black text-foreground block mt-1">
                  {formatCurrency(wantsAmount)}
                </strong>
                <span className="text-[10px] text-secondary">({budgetRatios.wants}%)</span>
              </div>

              <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-center">
                <span className="text-[10px] text-primary font-bold block">📈 استثمار ثراء</span>
                <strong className="text-sm font-mono font-black text-primary block mt-1">
                  {formatCurrency(investAmount)}
                </strong>
                <span className="text-[10px] text-primary font-bold">({budgetRatios.invest}%)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/40 text-center text-xs">
            <span className="text-muted-foreground font-medium">
              💡 {budgetRatios.desc} — استقطع حصة الاستثمار فور نزول الراتب.
            </span>
          </div>
        </Card>
      </div>

      {/* 2.9 LIVE CAREER & SIDE-INCOME ACCELERATOR (2 APIs CONNECTED) */}
      <div className="mb-12">
        <CareerBoosterSection
          initialCategory={typeof window !== 'undefined' ? localStorage.getItem('tharaa_user_career') || 'software-development' : 'software-development'}
          currentSavings={currentSavings}
          currentMonthlySavings={monthlyCapacity}
          annualExpenses={annualExpenses}
          currentAge={currentAge}
          targetAge={targetAge}
        />
      </div>

      {/* 3. SMART GOAL VAULTS (صناديق الأهداف الذكية) */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground flex items-center gap-2.5">
              <Target className="h-6 w-6 text-secondary" />
              صناديق الأهداف المالية الذكية
            </h2>
            <p className="text-sm text-muted-foreground mt-1">تتبع مسار كل هدف مالي وموعد تحقيقه بدقة</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {vaults.map((vault) => {
            const pct = Math.min(100, Math.round((vault.currentAmount / vault.targetAmount) * 100));
            return (
              <Card key={vault.id} className="luxury-glass p-6 rounded-3xl border-border/70 hover:border-secondary/50 transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                      {vault.icon === 'home' && <HomeIcon className="h-6 w-6 text-secondary" />}
                      {vault.icon === 'shield' && <ShieldCheck className="h-6 w-6 text-primary" />}
                      {vault.icon === 'education' && <GraduationCap className="h-6 w-6 text-secondary" />}
                      {vault.icon === 'wealth' && <TrendingUp className="h-6 w-6 text-primary" />}
                    </div>
                    <span className="text-xs font-mono font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                      {vault.deadlineYears} سنة
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-foreground mb-1 line-clamp-1">
                    {vault.title}
                  </h3>
                  <div className="text-2xl font-display font-extrabold text-foreground tabular-numbers mb-4">
                    {formatCurrency(vault.currentAmount)}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/40">
                  <div className="flex justify-between text-xs font-bold text-muted-foreground">
                    <span>الهدف: {formatCurrency(vault.targetAmount)}</span>
                    <span className="text-primary">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2 bg-muted rounded-full" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 4. HALAL SHARIA PORTFOLIO ALLOCATION & BOOST CHALLENGE */}
      <div className="grid lg:grid-cols-3 gap-8 mb-12">
        
        {/* Sharia Asset Allocation Breakdown */}
        <Card className="luxury-glass p-8 rounded-[2.5rem] lg:col-span-2 border-border/70 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <PieChart className="h-6 w-6 text-primary" />
                <h3 className="text-xl font-display font-bold text-foreground">
                  التوزيع النموذجي للمحفظة المتوافقة مع الشريعة
                </h3>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                نمط متوازن (8% عائد سنوي متوقع)
              </span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              بناءً على ملفك المالي، نوصي بتوزيع استثماراتك على أصول حقيقية مفروزة شرعياً لتقليل التذبذب وتعظيم النمو التراكمي:
            </p>

            {/* Asset Allocation Bar */}
            <div className="h-4 rounded-full overflow-hidden flex mb-6 shadow-inner">
              <div style={{ width: '45%' }} className="bg-primary" title="أسهم نقية 45%" />
              <div style={{ width: '30%' }} className="bg-secondary" title="صكوك سيادية 30%" />
              <div style={{ width: '15%' }} className="bg-emerald-400" title="ريت عقاري 15%" />
              <div style={{ width: '10%' }} className="bg-muted-foreground" title="سيولة ومرابحة 10%" />
            </div>

            {/* Legend items */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card/60 border border-border/60">
                <div className="h-3.5 w-3.5 rounded-full bg-primary" />
                <div>
                  <strong className="text-sm block text-foreground">أسهم عالمية نقية (45%)</strong>
                  <span className="text-xs text-muted-foreground">شركات متوافقة مع معايير AAOIFI</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card/60 border border-border/60">
                <div className="h-3.5 w-3.5 rounded-full bg-secondary" />
                <div>
                  <strong className="text-sm block text-foreground">صكوك سيادية ومؤسسية (30%)</strong>
                  <span className="text-xs text-muted-foreground">أداة دخل دوري شبه ثابتة</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card/60 border border-border/60">
                <div className="h-3.5 w-3.5 rounded-full bg-emerald-400" />
                <div>
                  <strong className="text-sm block text-foreground">صناديق ريت العقارية (15%)</strong>
                  <span className="text-xs text-muted-foreground">توزيعات إيجارية دورية</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-card/60 border border-border/60">
                <div className="h-3.5 w-3.5 rounded-full bg-muted-foreground" />
                <div>
                  <strong className="text-sm block text-foreground">سيولة ومرابحة قصيرة (10%)</strong>
                  <span className="text-xs text-muted-foreground">للطوارئ والفرص السريعة</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-secondary" />
              مفروزة ومعتمدة وفق الرقابة الشرعية
            </span>
            <Link href="/calculator" className="text-secondary font-bold hover:underline flex items-center gap-1">
              تعديل نسب المحفظة
              <ChevronLeft className="h-3.5 w-3.5" />
            </Link>
          </div>
        </Card>

        {/* Daily Streak & Financial Habit Card */}
        <Card className="luxury-glass p-8 rounded-[2.5rem] border-secondary/30 shadow-lg flex flex-col justify-between text-center relative overflow-hidden">
          <div className="space-y-4">
            <div className="h-16 w-16 rounded-3xl bg-secondary/15 border border-secondary/30 text-secondary flex items-center justify-center mx-auto mb-2">
              <Flame className="h-8 w-8 text-secondary" />
            </div>

            <div>
              <span className="text-4xl font-display font-extrabold text-foreground">
                {checkIns.length} أيام
              </span>
              <h4 className="font-display font-bold text-lg text-foreground mt-1">
                سلسلة الالتزام المالي
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto mt-2">
                الانضباط اليومي في مراجعة مصاريفك هو الفارق الحقيقي بين الثراء العشوائي والاستقلال المستدام.
              </p>
            </div>

            <div className="pt-2">
              <Button
                onClick={completeDailyChallenge}
                disabled={checkedInToday}
                className="w-full rounded-2xl h-13 font-bold bg-primary text-white hover:bg-primary/90 shadow-md transition-all"
              >
                {checkedInToday ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 ml-2 text-secondary" />
                    تم تسجيل خطوة اليوم!
                  </>
                ) : (
                  <>
                    <CalendarCheck className="h-4 w-4 ml-2" />
                    سجّل خطوة مالية اليوم
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick boost advice */}
          <div className="mt-6 p-4 rounded-2xl bg-muted/60 text-right text-xs space-y-1">
            <strong className="text-foreground font-bold block">💡 نصيحة ثراء لليوم:</strong>
            <p className="text-muted-foreground leading-relaxed">
              توجيه 15 د.ك إضافية شهرياً إلى محفظة الصكوك سيقدم موعد حريتك المالية بنحو 8 أشهر!
            </p>
          </div>
        </Card>

      </div>

    </div>
  );
}
