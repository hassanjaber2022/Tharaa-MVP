import { useRoute } from 'wouter';
import { getGetPlanQueryKey, useGetPlan } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { ArrowRight, Target, Activity, Calendar, PiggyBank, ShieldCheck, Printer, Award, TrendingUp } from 'lucide-react';

export default function PlanDetail() {
  const [, params] = useRoute('/plans/:id');
  const planId = params?.id;

  const { data: apiPlan, isLoading } = useGetPlan(planId || '', {
    query: {
      enabled: Boolean(planId && !String(planId).startsWith('plan_')),
      queryKey: getGetPlanQueryKey(planId || ''),
    }
  });

  // Local plan fallback
  const localPlan = (() => {
    try {
      const plans = JSON.parse(localStorage.getItem('tharaa_saved_plans') || '[]');
      return plans.find((p: any) => p.id === planId) || null;
    } catch {
      return null;
    }
  })();

  const plan = apiPlan || localPlan;

  if (isLoading && !localPlan) {
    return (
      <div className="container max-w-screen-xl mx-auto py-12 px-4">
        <div className="h-64 bg-muted animate-pulse rounded-3xl" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="container max-w-screen-xl mx-auto py-20 px-4 text-center">
        <p className="text-destructive font-bold mb-4">تعذر العثور على الخطة المطلوبة</p>
        <Link href="/plans">
          <Button variant="outline" className="rounded-2xl">العودة للخطط</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-xl mx-auto py-8 md:py-12 px-4 pb-32">
      <div className="flex items-center justify-between mb-8">
        <Link href="/plans" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
          <ArrowRight className="h-4 w-4 ml-2" />
          العودة لجميع الخطط
        </Link>

        <Button
          onClick={() => window.print()}
          variant="outline"
          className="rounded-xl h-10 px-4 text-xs font-bold border-border bg-card/60 hover:bg-muted flex items-center gap-2"
        >
          <Printer className="h-4 w-4 text-secondary" />
          طباعة التقرير المالي
        </Button>
      </div>

      {/* Plan Header Card */}
      <Card className="luxury-glass p-8 md:p-10 rounded-[2.5rem] border-secondary/30 mb-8 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-primary/15 text-primary">
                {plan.scenario === 'growth' ? 'نمط نمو عالي' : plan.scenario === 'balanced' ? 'نمط متوازن' : 'نمط متحفظ'}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                كود الخطة: #{plan.id.slice(-6)}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-display font-extrabold text-foreground mb-2">
              {plan.title || 'خطة ثراء للتقاعد والاستثمار'}
            </h1>
            <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-secondary" />
              تاريخ الإنشاء: {format(new Date(plan.createdAt || Date.now()), 'dd MMMM yyyy', { locale: arSA })}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card/90 border border-secondary/30 text-center">
            <span className="text-xs font-bold text-muted-foreground block mb-1">المساهمة الشهرية</span>
            <strong className="text-3xl font-display font-extrabold text-primary tabular-numbers">
              {formatCurrency(plan.monthlyContribution)}
            </strong>
          </div>
        </div>
      </Card>

      {/* Numerical Metrics Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="luxury-glass p-6 rounded-3xl border-border/70 text-center">
          <Target className="h-6 w-6 text-primary mx-auto mb-2" />
          <span className="text-xs font-bold text-muted-foreground block mb-1">الهدف الاسمي المتوقع</span>
          <strong className="text-2xl font-display font-bold text-foreground">
            {formatCurrency(plan.estimatedValue)}
          </strong>
        </Card>

        <Card className="luxury-glass p-6 rounded-3xl border-secondary/30 text-center">
          <ShieldCheck className="h-6 w-6 text-secondary mx-auto mb-2" />
          <span className="text-xs font-bold text-secondary block mb-1">بالقوة الشرائية الحقيقية</span>
          <strong className="text-2xl font-display font-bold text-foreground">
            {formatCurrency(plan.estimatedRealValue || plan.estimatedValue * 0.65)}
          </strong>
        </Card>

        <Card className="luxury-glass p-6 rounded-3xl border-border/70 text-center">
          <TrendingUp className="h-6 w-6 text-primary mx-auto mb-2" />
          <span className="text-xs font-bold text-muted-foreground block mb-1">الدخل التقاعدي الشهري المتوقع</span>
          <strong className="text-2xl font-display font-bold text-primary">
            {formatCurrency(plan.estimatedMonthlyIncome || Math.round((plan.estimatedValue * 0.65 * 0.04) / 12))}
          </strong>
        </Card>

        <Card className="luxury-glass p-6 rounded-3xl border-border/70 text-center">
          <Award className="h-6 w-6 text-secondary mx-auto mb-2" />
          <span className="text-xs font-bold text-muted-foreground block mb-1">المدة الزمنية حتى الهدف</span>
          <strong className="text-2xl font-display font-bold text-foreground">
            {(plan.targetAge || 55) - (plan.currentAge || 28)} سنة
          </strong>
        </Card>
      </div>

      {/* Report Summary Card for Printing */}
      <Card className="luxury-glass p-8 rounded-[2.5rem] border-border/70">
        <h3 className="text-xl font-display font-bold text-foreground mb-4">
          التوصية التنفيذية للمحفظة
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">
          تمت صياغة هذه الخطة وفق مبادئ الاستثمار الإسلامي طويل الأجل. نوصي بالالتزام بالاستقطاع الشهري التلقائي من حسابك البنكي في بداية كل شهر، مع مراجعة سنوية لتعديل المساهمة بما يتوافق مع أي زيادة في راتبك أو علاوتك السنوية.
        </p>

        <div className="p-4 rounded-2xl bg-muted/60 flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span>جهة التخطيط: منصة ثراء المالية الرقمية</span>
          <span className="font-mono">معايير الشريعة: AAOIFI Sharia Governance</span>
        </div>
      </Card>
    </div>
  );
}
