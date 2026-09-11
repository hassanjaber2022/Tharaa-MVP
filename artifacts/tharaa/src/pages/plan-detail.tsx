import { useRoute, Link } from 'wouter';
import {
  getGetPlanQueryKey,
  useGetPlan,
  PlanStatus,
} from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowRight, 
  Calendar, 
  Target, 
  TrendingUp, 
  Wallet,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

export default function PlanDetail() {
  const [, params] = useRoute('/plans/:id');
  const id = params?.id || '';
  
  const { data: plan, isLoading, error } = useGetPlan(id, {
    query: {
      enabled: !!id,
      queryKey: getGetPlanQueryKey(id),
    }
  });

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 bg-muted rounded-xl"></div>
          <div className="h-48 bg-muted rounded-3xl"></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-64 bg-muted rounded-3xl"></div>
            <div className="h-64 bg-muted rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-destructive/10 text-destructive p-6 rounded-2xl inline-block mb-4">
          تعذر تحميل تفاصيل الخطة
        </div>
        <p className="text-muted-foreground mb-6">قد تكون الخطة غير موجودة أو محذوفة</p>
        <Link href="/dashboard">
          <Button variant="outline" className="rounded-xl" data-testid="button-return-home">العودة للرئيسية</Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: PlanStatus) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> نشطة</span>;
      case 'paused':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600"><Clock className="h-3.5 w-3.5" /> متوقفة</span>;
      case 'archived':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground">مؤرشفة</span>;
    }
  };

  const scenarioName = plan.scenario === 'conservative' ? 'متحفظ' : plan.scenario === 'balanced' ? 'متوازن' : 'نمو عالي';
  const scenarioColor = plan.scenario === 'conservative' ? 'text-chart-3 bg-chart-3/10' : plan.scenario === 'balanced' ? 'text-secondary bg-secondary/10' : 'text-primary bg-primary/10';

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 pb-24">
      <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6">
        <ArrowRight className="me-2 h-4 w-4" />
        العودة للوحة التحكم
      </Link>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{plan.title || 'خطة بدون عنوان'}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            تم الإنشاء: {format(new Date(plan.createdAt), 'dd MMMM yyyy', { locale: arSA })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(plan.status)}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${scenarioColor}`}>
            مسار: {scenarioName}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Results Card */}
        <Card className="p-6 md:p-8 rounded-3xl border-primary/20 shadow-sm bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Target className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">الهدف المتوقع</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">القيمة الاسمية المتوقعة</p>
              <p className="text-3xl font-bold text-foreground">{formatCurrency(plan.estimatedValue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">القيمة الشرائية الحقيقية (بعد التضخم)</p>
              <p className="text-xl font-bold text-emerald-600">{formatCurrency(plan.estimatedRealValue)}</p>
            </div>
            <div className="pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-1">الدخل الشهري المتوقع عند التقاعد</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(plan.estimatedMonthlyIncome)}</p>
            </div>
          </div>
        </Card>

        {/* Inputs Card */}
        <Card className="p-6 md:p-8 rounded-3xl border-border/50 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-secondary/10 rounded-xl text-secondary">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold">معطيات الخطة</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">الرصيد الابتدائي</p>
              <p className="font-bold">{formatCurrency(plan.initialBalance)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">المساهمة الشهرية</p>
              <p className="font-bold">{formatCurrency(plan.monthlyContribution)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">المدة</p>
              <p className="font-bold">{plan.targetAge - plan.currentAge} سنة</p>
              <p className="text-xs text-muted-foreground">من {plan.currentAge} إلى {plan.targetAge}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">الزيادة السنوية</p>
              <p className="font-bold">{plan.annualStepUp}%</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 md:p-8 rounded-3xl border-border/50 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-xl font-bold">صندوق الطوارئ المرتبط</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-muted-foreground mb-2 max-w-lg leading-relaxed">
              بناءً على مصاريفك الأساسية، تم تحديد هدف صندوق الطوارئ لضمان استقرار خطتك الاستثمارية وعدم الاضطرار للسحب منها.
            </p>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-3xl font-bold text-foreground">{formatCurrency(plan.emergencyTarget)}</span>
              <span className="text-sm text-muted-foreground">تغطية {plan.emergencyMonths} أشهر</span>
            </div>
          </div>
          <div className="shrink-0 p-6 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex flex-col items-center justify-center w-full sm:w-auto">
            <Wallet className="h-10 w-10 text-emerald-500 mb-3" />
            <span className="font-bold text-emerald-700">شبكة الأمان</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
