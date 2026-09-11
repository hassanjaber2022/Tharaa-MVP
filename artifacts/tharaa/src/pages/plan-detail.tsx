import { useRoute } from 'wouter';
import { getGetPlanQueryKey, useGetPlan } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { ArrowRight, Target, Activity, Calendar, PiggyBank, ShieldAlert, LineChart } from 'lucide-react';

export default function PlanDetail() {
  const [, params] = useRoute('/plans/:id');
  const planId = params?.id;

  const { data: plan, isLoading, error } = useGetPlan(planId || '', {
    query: {
      enabled: !!planId,
      queryKey: getGetPlanQueryKey(planId || ''),
    }
  });

  if (isLoading) {
    return (
      <div className="container max-w-screen-xl mx-auto py-12 px-4">
        <div className="animate-pulse space-y-8">
          <div className="h-12 w-32 bg-muted rounded-full"></div>
          <div className="h-20 w-3/4 bg-muted rounded-2xl"></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-[400px] bg-muted rounded-3xl"></div>
            <div className="h-[400px] bg-muted rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="container max-w-screen-xl mx-auto py-20 px-4 text-center">
        <p className="text-destructive font-bold mb-4">تعذر تحميل تفاصيل الخطة</p>
        <Link href="/plans">
          <Button variant="outline" className="rounded-full">العودة للخطط</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-xl mx-auto py-10 px-4 pb-32">
      <Link href="/plans" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowRight className="h-4 w-4 ml-2" />
        العودة لجميع الخطط
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${
              plan.status === 'active' ? 'bg-primary/10 text-primary border border-primary/20' : 
              plan.status === 'paused' ? 'bg-secondary/10 text-secondary-foreground border border-secondary/20' : 
              'bg-muted text-muted-foreground'
            }`}>
              {plan.status === 'active' ? 'خطة نشطة' : plan.status === 'paused' ? 'متوقفة' : 'مؤرشفة'}
            </div>
            <span className="text-sm font-bold text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              تم الإنشاء في {format(new Date(plan.createdAt), 'dd MMMM yyyy', { locale: arSA })}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-foreground">
            {plan.title || 'خطة بدون عنوان'}
          </h1>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          {plan.status !== 'active' && (
            <Button className="flex-1 md:flex-none rounded-full h-12 px-8 font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
              تفعيل الخطة
            </Button>
          )}
          <Button variant="outline" className="flex-1 md:flex-none rounded-full h-12 px-8 font-bold border-border/50 bg-background/50 backdrop-blur-sm">
            تعديل
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="glass-card p-8 md:p-10 rounded-[2.5rem] lg:col-span-2 border-primary/10 bg-gradient-to-br from-background to-primary/5">
          <div className="flex items-center gap-3 mb-8">
            <Target className="h-7 w-7 text-primary" />
            <h2 className="text-2xl font-display font-bold">ملخص النتائج المتوقعة</h2>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            <div className="bg-background/80 rounded-2xl p-6 border border-border/50 shadow-sm">
              <p className="text-sm font-bold text-muted-foreground mb-2">الرصيد المستهدف (الاسمي)</p>
              <p className="text-3xl font-display font-bold text-foreground">{formatCurrency(plan.estimatedValue)}</p>
            </div>
            <div className="bg-background/80 rounded-2xl p-6 border border-border/50 shadow-sm">
              <p className="text-sm font-bold text-muted-foreground mb-2">الرصيد بالقوة الشرائية</p>
              <p className="text-3xl font-display font-bold text-foreground">{formatCurrency(plan.estimatedRealValue)}</p>
            </div>
            <div className="bg-primary/10 rounded-2xl p-6 border border-primary/20 shadow-sm sm:col-span-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-primary mb-1">الدخل الشهري المتوقع للتقاعد</p>
                <p className="text-sm text-primary/80 font-medium">بناءً على قاعدة السحب الآمن</p>
              </div>
              <p className="text-3xl font-display font-bold text-primary">{formatCurrency(plan.estimatedMonthlyIncome)}</p>
            </div>
          </div>
          
          <div className="space-y-6 pt-8 border-t border-border/50">
            <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
              <LineChart className="h-5 w-5 text-muted-foreground" />
              الافتراضات المستخدمة في الحساب
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-muted-foreground">التضخم السنوي</span>
                <span className="font-bold text-foreground">{plan.inflationRate}%</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-muted-foreground">معدل السحب</span>
                <span className="font-bold text-foreground">{plan.withdrawalRate}%</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-muted-foreground">الزيادة السنوية للمساهمة</span>
                <span className="font-bold text-foreground">{plan.annualStepUp}%</span>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="glass-card p-8 rounded-[2rem] border-secondary/20 bg-secondary/5">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="h-6 w-6 text-secondary-foreground" />
              <h2 className="text-xl font-display font-bold">المدخلات</h2>
            </div>
            
            <div className="space-y-5">
              <div className="flex justify-between items-center pb-4 border-b border-secondary/10">
                <span className="text-sm font-bold text-muted-foreground">الرصيد المبدئي</span>
                <span className="font-bold">{formatCurrency(plan.initialBalance)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-secondary/10">
                <span className="text-sm font-bold text-secondary-foreground">المساهمة الشهرية</span>
                <span className="font-bold text-secondary-foreground">{formatCurrency(plan.monthlyContribution)}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-secondary/10">
                <span className="text-sm font-bold text-muted-foreground">نمط الاستثمار</span>
                <span className="font-bold bg-background px-3 py-1 rounded-lg border border-border/50 text-sm">
                  {plan.scenario === 'conservative' ? 'متحفظ' : plan.scenario === 'balanced' ? 'متوازن' : 'نمو عالي'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-muted-foreground">فترة الخطة</span>
                <span className="font-bold text-foreground">{plan.targetAge - plan.currentAge} سنة</span>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-8 rounded-[2rem] border-blue-500/20 bg-blue-500/5">
            <div className="flex items-center gap-3 mb-4">
              <ShieldAlert className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-display font-bold">الطوارئ الموصى بها</h2>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-4">
              لهذه الخطة، نوصي بصندوق طوارئ يغطي مصاريفك الأساسية.
            </p>
            <div className="bg-background rounded-2xl p-4 border border-blue-500/20 text-center">
              <span className="block text-2xl font-display font-bold text-blue-600 mb-1">
                {formatCurrency(plan.emergencyTarget)}
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                تغطية {plan.emergencyMonths} أشهر
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
