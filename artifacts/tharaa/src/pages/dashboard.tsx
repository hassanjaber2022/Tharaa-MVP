import { useState } from 'react';
import { Link } from 'wouter';
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
} from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

export default function Dashboard() {
  const [monthlyBoost, setMonthlyBoost] = useState(25);
  const { data: dashboard, isLoading, error } = useGetDashboard();
  const { data: profile } = useGetProfile();

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="animate-pulse space-y-8">
          <div className="h-12 w-64 bg-muted rounded-xl"></div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="h-40 bg-muted rounded-3xl"></div>
            <div className="h-40 bg-muted rounded-3xl"></div>
            <div className="h-40 bg-muted rounded-3xl"></div>
          </div>
          <div className="h-64 bg-muted rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="container max-w-6xl mx-auto py-12 px-4 text-center">
        <div className="bg-destructive/10 text-destructive p-6 rounded-2xl inline-block mb-4">
          حدث خطأ أثناء تحميل لوحة التحكم
        </div>
        <p className="text-muted-foreground">حاول تحديث الصفحة</p>
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

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">مرحباً، {user.name.split(' ')[0]}</h1>
          <p className="text-muted-foreground text-lg">إليك ملخص وضعك المالي اليوم</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/onboarding">
            <Button variant="outline" className="rounded-xl" data-testid="button-update-profile">تحديث الملف</Button>
          </Link>
          <Link href="/calculator">
            <Button className="rounded-xl" data-testid="button-open-calculator">الحاسبة الذكية</Button>
          </Link>
        </div>
      </div>

      {!profileComplete ? (
        <Card className="p-8 rounded-3xl border-primary/20 bg-primary/5 text-center mb-8">
          <Wallet className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">أكمل ملفك المالي لتبدأ</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            نحتاج لبعض التفاصيل حول وضعك الحالي وأهدافك لنتمكن من تقديم توصيات دقيقة.
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="rounded-xl px-8" data-testid="button-complete-profile">أكمل الملف الآن</Button>
          </Link>
        </Card>
      ) : !activePlan ? (
        <Card className="p-8 rounded-3xl border-secondary/20 bg-secondary/5 text-center mb-8">
          <Calculator className="h-12 w-12 text-secondary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">الملف مكتمل، ماذا بعد؟</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            استخدم الحاسبة الذكية لاستكشاف سيناريوهات نمو ثروتك وحفظ خطتك الأولى.
          </p>
          <Link href="/calculator">
            <Button size="lg" className="rounded-xl px-8 bg-secondary hover:bg-secondary/90 text-white" data-testid="button-start-calculator">
              افتح الحاسبة
            </Button>
          </Link>
        </Card>
      ) : null}

      {profileComplete && profile && (
        <Card className="mb-8 overflow-hidden rounded-3xl border-primary/15 bg-card shadow-sm">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 md:p-8">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-primary">
                    <Activity className="h-5 w-5" />
                    <span className="text-sm font-bold">نبضتك المالية</span>
                  </div>
                  <h2 className="text-2xl font-bold" data-testid="text-financial-pulse-label">
                    {pulseLabel}
                  </h2>
                </div>
                <div className="rounded-2xl bg-primary/8 px-4 py-3 text-center">
                  <span className="block text-2xl font-bold text-primary" data-testid="text-savings-rate">
                    {Math.round(savingsRate)}%
                  </span>
                  <span className="text-xs text-muted-foreground">من الدخل</span>
                </div>
              </div>

              <Progress
                value={pulseProgress}
                className="mb-3 h-3 bg-muted [&>div]:bg-primary"
                aria-label="التقدم نحو تخصيص عشرين بالمئة من الدخل"
              />
              <p className="text-sm leading-relaxed text-muted-foreground">
                تخصص حالياً {formatCurrency(profile.monthlyCapacity)} شهرياً. المؤشر يقارن هذه
                النسبة بمرجع عملي قدره 20%، وليس تقييماً ائتمانياً أو توصية استثمارية.
              </p>
            </div>

            <div className="border-t border-border/60 bg-primary/[0.035] p-6 md:p-8 lg:border-s lg:border-t-0">
              <div className="mb-5">
                <p className="mb-1 text-sm font-bold text-primary">جرّب خطوة صغيرة</p>
                <h3 className="text-xl font-bold">ماذا لو زدت مساهمتك الشهرية؟</h3>
              </div>

              <div className="mb-5 flex flex-wrap gap-2" aria-label="اختر قيمة الزيادة الشهرية">
                {[10, 25, 50].map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={monthlyBoost === amount ? 'default' : 'outline'}
                    size="sm"
                    className="h-10 min-w-20 rounded-xl"
                    onClick={() => setMonthlyBoost(amount)}
                    data-testid={`button-monthly-boost-${amount}`}
                    aria-pressed={monthlyBoost === amount}
                  >
                    <Plus className="me-1 h-4 w-4" />
                    {formatCurrency(amount, 0)}
                  </Button>
                ))}
              </div>

              <div className="mb-5 rounded-2xl border border-primary/10 bg-background p-4">
                <p className="text-sm text-muted-foreground">إضافة خلال سنة، قبل أي عائد</p>
                <p className="mt-1 text-2xl font-bold text-primary" data-testid="text-annual-boost">
                  {formatCurrency(monthlyBoost * 12)}
                </p>
              </div>

              <Link href="/calculator">
                <Button variant="outline" className="w-full rounded-xl" data-testid="button-try-boost-calculator">
                  جرّبها في الحاسبة
                  <ArrowLeft className="ms-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 rounded-3xl border-border/50 shadow-sm relative overflow-hidden">
          <div className="absolute -left-6 -top-6 h-24 w-24 bg-primary/5 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="font-medium text-muted-foreground">صندوق الطوارئ</h3>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold">{emergencyProgress}%</span>
            </div>
            <Progress value={emergencyProgress} className="h-2 mb-2 bg-muted [&>div]:bg-primary" />
            <p className="text-xs text-muted-foreground">من الهدف المحدد بناءً على مصاريفك</p>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-border/50 shadow-sm relative overflow-hidden">
          <div className="absolute -left-6 -top-6 h-24 w-24 bg-secondary/5 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="font-medium text-muted-foreground">الخطط المحفوظة</h3>
            <div className="h-10 w-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold">{planCount}</span>
              <span className="text-sm text-muted-foreground">خطة</span>
            </div>
            <Link href="/plans" className="text-xs text-secondary font-medium hover:underline inline-flex items-center">
              عرض جميع الخطط
              <ArrowLeft className="h-3 w-3 ms-1" />
            </Link>
          </div>
        </Card>

        <Card className="p-6 rounded-3xl border-border/50 shadow-sm relative overflow-hidden">
          <div className="absolute -left-6 -top-6 h-24 w-24 bg-emerald-500/5 rounded-full blur-xl"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <h3 className="font-medium text-muted-foreground">التوصية الحالية</h3>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium leading-relaxed">{recommendation}</p>
          </div>
        </Card>
      </div>

      {activePlan && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            الخطة النشطة
          </h2>
          <Card className="p-6 md:p-8 rounded-3xl border-border/50 shadow-sm">
            <div className="flex flex-col lg:flex-row justify-between gap-6 lg:items-center border-b border-border/50 pb-6 mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-1">{activePlan.title || 'خطة بدون عنوان'}</h3>
                <p className="text-sm text-muted-foreground">
                  تم التحديث: {format(new Date(activePlan.updatedAt), 'dd MMMM yyyy', { locale: arSA })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  مسار: {
                    activePlan.scenario === 'conservative' ? 'متحفظ' : 
                    activePlan.scenario === 'balanced' ? 'متوازن' : 'نمو عالي'
                  }
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary">
                  مساهمة: {formatCurrency(activePlan.monthlyContribution)} / شهر
                </span>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">الهدف المتوقع (اسمي)</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(activePlan.estimatedValue)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">الهدف (بالقوة الشرائية)</p>
                <p className="text-xl font-bold text-foreground">{formatCurrency(activePlan.estimatedRealValue)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">الدخل الشهري المتوقع</p>
                <p className="text-xl font-bold text-emerald-600">{formatCurrency(activePlan.estimatedMonthlyIncome)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">المدة المتبقية</p>
                <p className="text-xl font-bold text-foreground">{activePlan.targetAge - activePlan.currentAge} سنة</p>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border/50 flex justify-end">
              <Link href={`/plans/${activePlan.id}`}>
                <Button variant="outline" className="rounded-xl" data-testid={`button-view-plan-${activePlan.id}`}>عرض تفاصيل الخطة</Button>
              </Link>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
