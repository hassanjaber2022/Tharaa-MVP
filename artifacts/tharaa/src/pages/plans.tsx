import { useListPlans, PlanStatus } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Calendar, 
  Plus, 
  FileText,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

export default function Plans() {
  const { data: plans, isLoading, error } = useListPlans();

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto py-12 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-48 bg-muted rounded-xl"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted rounded-3xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-5xl mx-auto py-12 px-4 text-center">
        <div className="bg-destructive/10 text-destructive p-6 rounded-2xl inline-block mb-4">
          حدث خطأ أثناء تحميل الخطط
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: PlanStatus) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600"><CheckCircle2 className="h-3 w-3" /> نشطة</span>;
      case 'paused':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600"><Clock className="h-3 w-3" /> متوقفة</span>;
      case 'archived':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground">مؤرشفة</span>;
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">خططي المحفوظة</h1>
          <p className="text-muted-foreground">راجع خططك واستراتيجياتك للمستقبل</p>
        </div>
        <Link href="/calculator">
          <Button className="rounded-xl" data-testid="button-new-plan">
            <Plus className="me-2 h-5 w-5" />
            خطة جديدة
          </Button>
        </Link>
      </div>

      {!plans || plans.length === 0 ? (
        <Card className="p-12 rounded-3xl border-dashed border-2 bg-muted/20 text-center flex flex-col items-center justify-center">
          <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h2 className="text-2xl font-bold mb-2">لا توجد خطط محفوظة</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            استخدم الحاسبة الذكية لإنشاء خطتك الأولى وحفظها للعودة إليها لاحقاً.
          </p>
          <Link href="/calculator">
            <Button size="lg" className="rounded-xl" data-testid="button-start-now">ابدأ الآن</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <Card key={plan.id} className="p-6 rounded-3xl border-border/50 shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="flex justify-between items-start mb-4">
                {getStatusBadge(plan.status)}
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                  plan.scenario === 'conservative' ? 'text-chart-3 bg-chart-3/10' : 
                  plan.scenario === 'balanced' ? 'text-secondary bg-secondary/10' : 'text-primary bg-primary/10'
                }`}>
                  {plan.scenario === 'conservative' ? 'متحفظ' : plan.scenario === 'balanced' ? 'متوازن' : 'نمو عالي'}
                </span>
              </div>
              
              <h3 className="text-xl font-bold mb-1 truncate">{plan.title || 'خطة بدون عنوان'}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mb-5">
                <Calendar className="h-3 w-3" />
                {format(new Date(plan.createdAt), 'dd MMM yyyy', { locale: arSA })}
              </p>
              
              <div className="space-y-3 mb-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">الهدف المتوقع</p>
                  <p className="font-bold">{formatCurrency(plan.estimatedValue)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">المساهمة</p>
                    <p className="font-semibold text-sm">{formatCurrency(plan.monthlyContribution)}/ش</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">المدة</p>
                    <p className="font-semibold text-sm">{plan.targetAge - plan.currentAge} سنة</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border/50">
                <Link href={`/plans/${plan.id}`} className="flex items-center text-sm font-medium text-primary group-hover:underline">
                  عرض التفاصيل
                  <ArrowLeft className="ms-2 h-4 w-4" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
