import { useState } from 'react';
import { Link } from 'wouter';
import { useListPlans } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, Target, Plus, ArrowLeft, Calendar, Sparkles, Trash2, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function Plans() {
  const { data: apiPlans, isLoading } = useListPlans();
  const { toast } = useToast();

  const [localPlans, setLocalPlans] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('tharaa_saved_plans') || '[]');
    } catch {
      return [];
    }
  });

  const safeLocalPlans = Array.isArray(localPlans) ? localPlans : [];
  const safeApiPlans = Array.isArray(apiPlans) ? apiPlans : [];
  const allPlans = [...safeLocalPlans, ...safeApiPlans];

  const handleDeleteLocalPlan = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = localPlans.filter((p) => p.id !== id);
    setLocalPlans(updated);
    localStorage.setItem('tharaa_saved_plans', JSON.stringify(updated));
    toast({ title: 'تم حذف الخطة', description: 'تمت إزالة الخطة من محفظتك' });
  };

  return (
    <div className="container max-w-screen-xl mx-auto py-8 md:py-12 px-4 pb-32">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/15 text-secondary text-xs font-bold mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>محفظة الخطط الاستثمارية</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-foreground">
            خططي ومساراتي المالية
          </h1>
          <p className="text-muted-foreground font-medium text-base md:text-lg mt-1">
            قارن بين سيناريوهات النمو وتابع الخطة الأنسب لظروفك الحالية
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/onboarding">
            <Button variant="outline" className="h-11 px-5 rounded-2xl font-bold border-secondary/40 bg-secondary/10 hover:bg-secondary/20 text-foreground flex items-center gap-1.5">
              <span>عدّل خطتك الحالية ✏️</span>
            </Button>
          </Link>

          <Link href="/calculator">
            <Button className="h-11 px-5 rounded-2xl font-bold bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20 flex items-center gap-1.5">
              <Plus className="h-4 w-4" />
              <span>إضافة خطة</span>
            </Button>
          </Link>
        </div>
      </div>

      {isLoading && allPlans.length === 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-[2.5rem]" />
          ))}
        </div>
      ) : allPlans.length === 0 ? (
        <Card className="luxury-glass p-12 text-center rounded-[2.5rem] border-dashed border-2 border-border/70 max-w-lg mx-auto">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-secondary/15 text-secondary mb-6">
            <Target className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">لا توجد خطط محفوظة حالياً</h2>
          <p className="text-muted-foreground font-medium mb-8 text-sm leading-relaxed">
            استخدم الحاسبة الذكية لاختبار تأثير الادخار الشهري وسيناريوهات السوق واحفظ مسارك الأنسب هنا.
          </p>
          <Link href="/calculator">
            <Button size="lg" className="rounded-2xl px-8 h-13 font-bold bg-primary text-white hover:bg-primary/90">
              افتح الحاسبة الذكية
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allPlans.map((plan) => (
            <Card
              key={plan.id}
              className="luxury-glass rounded-[2.5rem] p-7 border-border/70 hover:border-secondary/50 transition-all group flex flex-col justify-between shadow-md hover:shadow-xl"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    plan.scenario === 'growth'
                      ? 'bg-secondary/20 text-secondary'
                      : plan.scenario === 'balanced'
                      ? 'bg-primary/15 text-primary'
                      : 'bg-muted text-foreground'
                  }`}>
                    {plan.scenario === 'growth'
                      ? 'نمط نمو عالي 11.5%'
                      : plan.scenario === 'balanced'
                      ? 'نمط متوازن 8.5%'
                      : 'نمط متحفظ 5.5%'}
                  </span>

                  {Boolean(plan?.id && String(plan.id).startsWith('plan_')) && (
                    <button
                      onClick={(e) => handleDeleteLocalPlan(String(plan.id), e)}
                      title="حذف الخطة"
                      className="text-muted-foreground hover:text-destructive p-1 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <h3 className="text-xl font-display font-bold mb-1 text-foreground">
                  {plan.title || 'خطة ثراء المالية'}
                </h3>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium mb-6">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    أنشئت في {format(new Date(plan.createdAt || Date.now()), 'dd MMMM yyyy', { locale: arSA })}
                  </span>
                </div>

                <div className="space-y-3 mb-6 p-4 rounded-2xl bg-card/60 border border-border/60">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">الهدف الاسمي</span>
                    <strong className="font-display font-bold text-primary text-base">
                      {formatCurrency(plan.estimatedValue)}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">بالقوة الشرائية الحقيقية</span>
                    <strong className="font-display font-bold text-foreground text-base">
                      {formatCurrency(plan.estimatedRealValue || plan.estimatedValue * 0.65)}
                    </strong>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-border/40">
                    <span className="text-muted-foreground font-medium">المساهمة الشهرية</span>
                    <span className="font-mono font-bold text-secondary">
                      {formatCurrency(plan.monthlyContribution)}
                    </span>
                  </div>
                </div>
              </div>

              <Link href={`/plans/${plan.id}`}>
                <Button variant="outline" className="w-full rounded-xl h-11 text-xs font-bold border-border/80 group-hover:border-primary group-hover:text-primary transition-all">
                  عرض تفاصيل الخطة والتقرير
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}
