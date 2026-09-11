import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useGetDashboard, useGetProfile } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  Medal,
  Gift,
  CheckCircle2,
  Sparkles,
  CalendarCheck,
} from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

function calculateDailyStreak(checkIns: string[]) {
  const completed = new Set(checkIns);
  let streak = 0;
  const cursor = new Date();

  if (!completed.has(cursor.toLocaleDateString('sv-SE'))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (completed.has(cursor.toLocaleDateString('sv-SE'))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export default function Dashboard() {
  const [monthlyBoost, setMonthlyBoost] = useState(25);
  const [checkIns, setCheckIns] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('tharaa-daily-check-ins') || '[]');
    } catch {
      return [];
    }
  });
  const [, setLocation] = useLocation();
  const { data: dashboard, isLoading, error } = useGetDashboard();
  const { data: profile } = useGetProfile();

  useEffect(() => {
    if (dashboard && !dashboard.profileComplete) {
      setLocation('/onboarding');
    }
  }, [dashboard, setLocation]);

  if (isLoading) {
    return (
      <div className="container max-w-screen-xl mx-auto py-12 px-4">
        <div className="animate-pulse space-y-8">
          <div className="h-16 w-1/3 bg-muted rounded-2xl"></div>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="h-48 bg-muted rounded-3xl md:col-span-3"></div>
            <div className="h-48 bg-muted rounded-3xl"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="h-40 bg-muted rounded-3xl"></div>
            <div className="h-40 bg-muted rounded-3xl"></div>
            <div className="h-40 bg-muted rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="container max-w-screen-xl mx-auto py-20 px-4 text-center">
        <div className="bg-destructive/10 text-destructive p-8 rounded-3xl inline-block mb-6">
          حدث خطأ أثناء تحميل لوحة التحكم
        </div>
        <p className="text-muted-foreground font-medium">حاول تحديث الصفحة لاحقاً</p>
      </div>
    );
  }

  const { user, profileComplete, activePlan, emergencyProgress, planCount, recommendation } = dashboard;
  const savingsRate = profile?.monthlyIncome
    ? Math.max(0, Math.min(100, (profile.monthlyCapacity / profile.monthlyIncome) * 100))
    : 0;
  
  const pulseProgress = Math.min(100, (savingsRate / 20) * 100);
  const pulseLabel =
    savingsRate >= 20
      ? 'مساحة ادخار قوية'
      : savingsRate >= 10
        ? 'بداية متوازنة'
        : savingsRate > 0
          ? 'خطوة قابلة للنمو'
          : 'ابدأ بمبلغ بسيط';

  const todayKey = new Date().toLocaleDateString('sv-SE');
  const checkedInToday = checkIns.includes(todayKey);
  const streakDays = calculateDailyStreak(checkIns);
  const hasFirstPlanBadge = planCount > 0;
  const hasEmergencyBadge = emergencyProgress >= 100;
  const rewardTarget = 500;
  const partnerRewardProgress = Math.min(100, ((profile?.currentSavings || 0) / rewardTarget) * 100);

  const completeDailyChallenge = () => {
    if (checkedInToday) return;
    const next = [...checkIns, todayKey];
    setCheckIns(next);
    localStorage.setItem('tharaa-daily-check-ins', JSON.stringify(next));
  };

  return (
    <div className="container max-w-screen-xl mx-auto py-10 px-4 pb-32">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-3 tracking-tight text-foreground">
            أهلاً، {user.name.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground text-lg font-medium">ملخص أدائك المالي لهذا اليوم</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/calculator">
            <Button className="rounded-full px-8 h-12 font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all text-base bg-primary hover:bg-primary/90">
              <Calculator className="ml-2 h-5 w-5" />
              الحاسبة الذكية
            </Button>
          </Link>
        </div>
      </div>

      {!profileComplete ? (
        <Card className="glass-card p-10 rounded-[2rem] border-primary/20 text-center mb-10 relative overflow-hidden">
          <div className="absolute -left-10 -top-10 h-40 w-40 bg-primary/10 rounded-full blur-3xl"></div>
          <Wallet className="h-16 w-16 text-primary mx-auto mb-6 relative z-10" />
          <h2 className="text-3xl font-display font-bold mb-3 relative z-10">أكمل ملفك المالي لتبدأ</h2>
          <p className="text-muted-foreground font-medium mb-8 max-w-lg mx-auto relative z-10 text-lg">
            نحتاج لبعض التفاصيل حول وضعك الحالي وأهدافك لنتمكن من تقديم خطط دقيقة ومخصصة لك.
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="rounded-full px-12 h-14 text-lg font-bold shadow-xl shadow-primary/20 relative z-10">أكمل الملف الآن</Button>
          </Link>
        </Card>
      ) : !activePlan ? (
        <Card className="glass-card p-10 rounded-[2rem] border-secondary/20 text-center mb-10 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 bg-secondary/10 rounded-full blur-3xl"></div>
          <Target className="h-16 w-16 text-secondary-foreground mx-auto mb-6 relative z-10" />
          <h2 className="text-3xl font-display font-bold mb-3 relative z-10">ملفك جاهز! ماذا بعد؟</h2>
          <p className="text-muted-foreground font-medium mb-8 max-w-lg mx-auto relative z-10 text-lg">
            استخدم الحاسبة الذكية لاستكشاف مسارات نمو ثروتك، وقم بحفظ خطتك الأولى لتفعيل لوحة التحكم.
          </p>
          <Link href="/calculator">
            <Button size="lg" className="rounded-full px-12 h-14 text-lg font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-xl shadow-secondary/20 relative z-10">
              افتح الحاسبة الذكية
            </Button>
          </Link>
        </Card>
      ) : null}

      {profileComplete && profile && (
        <div className="grid lg:grid-cols-4 gap-6 mb-10">
          
          {/* Main Pulse Card */}
          <Card className="glass-card lg:col-span-3 overflow-hidden rounded-[2rem] border-primary/20 p-0">
            <div className="grid md:grid-cols-[1.2fr_0.8fr] h-full">
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="mb-8 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-3 flex items-center gap-2 text-primary font-bold">
                      <Activity className="h-5 w-5" />
                      <span>نبضتك المالية</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                      {pulseLabel}
                    </h2>
                  </div>
                  <div className="rounded-2xl bg-primary/10 px-5 py-4 text-center border border-primary/20 shadow-inner">
                    <span className="block text-3xl font-display font-bold text-primary">
                      {Math.round(savingsRate)}%
                    </span>
                    <span className="text-sm font-medium text-primary/80 mt-1 block">من الدخل</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-bold text-muted-foreground">
                    <span>مؤشر القدرة (الهدف 20%)</span>
                    <span className="text-primary">{Math.round(pulseProgress)}%</span>
                  </div>
                  <Progress
                    value={pulseProgress}
                    className="h-4 bg-muted/50 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-primary rounded-full"
                  />
                  <p className="text-sm font-medium leading-relaxed text-muted-foreground/80 pt-2">
                    أنت تخصص <strong className="text-foreground">{formatCurrency(profile.monthlyCapacity)}</strong> شهرياً. هذا المؤشر يقيس قدرتك الحالية لبناء خطة مستدامة.
                  </p>
                </div>
              </div>

              {/* Monthly Boost Side-panel */}
              <div className="border-t md:border-t-0 md:border-r border-border/50 bg-primary/5 p-8 md:p-10 flex flex-col justify-center">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-secondary-foreground" />
                    <p className="text-sm font-bold text-secondary-foreground">تحدي الشهر</p>
                  </div>
                  <h3 className="text-xl font-display font-bold text-foreground">ماذا لو زدت ادخارك قليلاً؟</h3>
                </div>

                <div className="mb-8 flex flex-wrap gap-2">
                  {[10, 25, 50].map((amount) => (
                    <Button
                      key={amount}
                      type="button"
                      variant={monthlyBoost === amount ? 'default' : 'outline'}
                      className={`h-12 flex-1 rounded-xl font-bold transition-all ${
                        monthlyBoost === amount 
                          ? 'bg-primary text-white shadow-md shadow-primary/20' 
                          : 'bg-background hover:bg-primary/10 hover:text-primary border-primary/20'
                      }`}
                      onClick={() => setMonthlyBoost(amount)}
                    >
                      <Plus className="mr-1.5 h-4 w-4" />
                      {amount} د.ك
                    </Button>
                  ))}
                </div>

                <div className="mb-8 rounded-2xl bg-background/80 border border-primary/10 p-5 shadow-sm text-center">
                  <p className="text-sm font-medium text-muted-foreground mb-1">حصيلة الزيادة في سنة (بدون عوائد)</p>
                  <p className="text-3xl font-display font-bold text-primary">
                    {formatCurrency(monthlyBoost * 12)}
                  </p>
                </div>

                <Link href="/calculator">
                  <Button className="w-full h-12 rounded-xl font-bold bg-background text-primary border-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-colors">
                    احسب تأثيرها مستقبلاً
                    <ArrowLeft className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Streaks & Gamification Side */}
          <div className="flex flex-col gap-6">
            <Card className="glass-card flex-1 p-6 rounded-[2rem] border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent relative overflow-hidden flex flex-col justify-center items-center text-center">
              <Flame className="h-12 w-12 text-orange-500 mb-3" />
              <h3 className="text-4xl font-display font-bold text-orange-600 mb-1">{streakDays} أيام</h3>
              <p className="font-bold text-foreground mb-1">سلسلة خطواتك اليومية</p>
              <p className="text-sm font-medium text-muted-foreground mb-4">
                سجّل خطوة مالية أنجزتها اليوم على هذا الجهاز
              </p>
              <Button
                type="button"
                size="sm"
                className="rounded-full"
                variant={checkedInToday ? 'outline' : 'default'}
                disabled={checkedInToday}
                onClick={completeDailyChallenge}
                data-testid="button-daily-check-in"
              >
                <CalendarCheck className="ml-2 h-4 w-4" />
                {checkedInToday ? 'تم تسجيل خطوة اليوم' : 'سجّل خطوة اليوم'}
              </Button>
            </Card>
            
            <Card className="glass-card flex-1 p-6 rounded-[2rem] border-secondary/30 relative overflow-hidden flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="h-6 w-6 text-secondary-foreground" />
                <h3 className="font-bold text-foreground">مكافآت الشركاء قريباً</h3>
              </div>
              <p className="text-sm font-medium text-muted-foreground mb-4">
                مثال تجريبي: قهوة مجانية من مقهى شريك عند وصول مدخراتك إلى {formatCurrency(rewardTarget)}.
              </p>
              <Progress value={partnerRewardProgress} className="h-2.5 mb-2 bg-muted [&>div]:bg-secondary" />
              <div className="flex justify-between gap-3 text-xs font-bold text-secondary-foreground">
                <span>{Math.round(partnerRewardProgress)}%</span>
                <span>لا توجد قسيمة فعلية حالياً</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Card className="glass-card p-8 rounded-[2rem] border-border/50 relative overflow-hidden group hover:border-primary/30 transition-colors">
          <div className="absolute -left-6 -top-6 h-32 w-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="font-bold text-lg text-muted-foreground">صندوق الطوارئ</h3>
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-display font-bold">{Math.round(emergencyProgress)}%</span>
            </div>
            <Progress value={emergencyProgress} className="h-2.5 mb-3 bg-muted [&>div]:bg-blue-500" />
            <p className="text-sm font-medium text-muted-foreground">نسبة التغطية من الهدف</p>
          </div>
        </Card>

        <Card className="glass-card p-8 rounded-[2rem] border-border/50 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
          <div className="absolute -left-6 -top-6 h-32 w-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="font-bold text-lg text-muted-foreground">الخطط المحفوظة</h3>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-display font-bold">{planCount}</span>
              <span className="font-bold text-muted-foreground">خطط</span>
            </div>
            <Link href="/plans" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors inline-flex items-center bg-emerald-500/10 px-4 py-2 rounded-lg">
              عرض التفاصيل
              <ArrowLeft className="h-4 w-4 ml-1.5" />
            </Link>
          </div>
        </Card>

        <Card className="glass-card p-8 rounded-[2rem] border-border/50 relative overflow-hidden group hover:border-accent/30 transition-colors">
          <div className="absolute -left-6 -top-6 h-32 w-32 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="font-bold text-lg text-muted-foreground">توصية اليوم</h3>
            <div className="h-12 w-12 rounded-2xl bg-accent/10 text-accent-foreground flex items-center justify-center">
              <Target className="h-6 w-6" />
            </div>
          </div>
          <div className="relative z-10 h-[calc(100%-4rem)] flex items-center">
            <p className="text-base font-bold leading-relaxed text-foreground">{recommendation}</p>
          </div>
        </Card>
      </div>

      {/* Badges Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
          <Medal className="h-6 w-6 text-secondary-foreground" />
          شارات الإنجاز
        </h2>
        <div className="flex flex-wrap gap-4">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${profileComplete ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-muted border-border/50 text-muted-foreground opacity-50'}`}>
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-bold">الملف مكتمل</span>
          </div>
          <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${hasFirstPlanBadge ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-muted border-border/50 text-muted-foreground opacity-50'}`}>
            <FileText className="h-5 w-5" />
            <span className="font-bold">أول خطة</span>
          </div>
          <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl border ${hasEmergencyBadge ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' : 'bg-muted border-border/50 text-muted-foreground opacity-50'}`}>
            <ShieldCheck className="h-5 w-5" />
            <span className="font-bold">صندوق الطوارئ</span>
          </div>
        </div>
      </div>

      {/* Active Plan Detail */}
      {activePlan && (
        <div className="mb-10">
          <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            مسارك النشط
          </h2>
          <Card className="glass-card p-8 md:p-10 rounded-[2.5rem] border-primary/15 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
            
            <div className="flex flex-col lg:flex-row justify-between gap-8 lg:items-center border-b border-border/50 pb-8 mb-8 relative z-10">
              <div>
                <h3 className="text-3xl font-display font-bold mb-2 text-foreground">{activePlan.title || 'خطة بدون عنوان'}</h3>
                <p className="text-sm font-medium text-muted-foreground">
                  آخر تحديث: {format(new Date(activePlan.updatedAt), 'dd MMMM yyyy', { locale: arSA })}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-background border border-primary/20 text-primary shadow-sm">
                  النمط: {
                    activePlan.scenario === 'conservative' ? 'متحفظ' : 
                    activePlan.scenario === 'balanced' ? 'متوازن' : 'نمو عالي'
                  }
                </span>
                <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-background border border-secondary/30 text-secondary-foreground shadow-sm">
                  مساهمة: {formatCurrency(activePlan.monthlyContribution)} / شهر
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              <div className="bg-background/50 rounded-2xl p-5 border border-border/30">
                <p className="text-sm font-bold text-muted-foreground mb-2">الهدف المتوقع (اسمي)</p>
                <p className="text-2xl font-display font-bold text-foreground">{formatCurrency(activePlan.estimatedValue)}</p>
              </div>
              <div className="bg-background/50 rounded-2xl p-5 border border-border/30">
                <p className="text-sm font-bold text-muted-foreground mb-2">الهدف (بالقوة الشرائية)</p>
                <p className="text-2xl font-display font-bold text-foreground">{formatCurrency(activePlan.estimatedRealValue)}</p>
              </div>
              <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                <p className="text-sm font-bold text-muted-foreground mb-2">الدخل الشهري المتوقع</p>
                <p className="text-2xl font-display font-bold text-primary">{formatCurrency(activePlan.estimatedMonthlyIncome)}</p>
              </div>
              <div className="bg-background/50 rounded-2xl p-5 border border-border/30">
                <p className="text-sm font-bold text-muted-foreground mb-2">المدة المتبقية</p>
                <p className="text-2xl font-display font-bold text-foreground">{activePlan.targetAge - activePlan.currentAge} سنة</p>
              </div>
            </div>
            
            <div className="mt-10 flex justify-end relative z-10">
              <Link href={`/plans/${activePlan.id}`}>
                <Button className="rounded-xl h-12 px-8 font-bold bg-background text-foreground border border-border hover:bg-muted shadow-sm">
                  عرض تفاصيل الخطة
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
