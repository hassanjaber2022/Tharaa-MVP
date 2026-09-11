import { Link } from 'wouter';
import { useListPlans } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Wallet, Target, Plus, ArrowLeft, MoreHorizontal, Calendar, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

export default function Plans() {
  const { data: plans, isLoading, error } = useListPlans();

  if (isLoading) {
    return (
      <div className="container max-w-screen-xl mx-auto py-12 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-12 w-64 bg-muted rounded-xl mb-8"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-muted rounded-[2rem]"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-screen-xl mx-auto py-20 px-4 text-center">
        <p className="text-destructive font-bold mb-4">حدث خطأ أثناء تحميل الخطط</p>
      </div>
    );
  }

  return (
    <div className="container max-w-screen-xl mx-auto py-12 px-4 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-display font-bold tracking-tight text-foreground">خططي المالية</h1>
          </div>
          <p className="text-muted-foreground font-medium text-lg">
            قم بإدارة وتتبع جميع السيناريوهات التي حفظتها
          </p>
        </div>
        
        <Link href="/calculator">
          <Button className="h-12 px-8 rounded-full font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all text-base bg-primary hover:bg-primary/90">
            <Plus className="ml-2 h-5 w-5" />
            خطة جديدة
          </Button>
        </Link>
      </div>

      {!plans || plans.length === 0 ? (
        <Card className="glass-card p-12 text-center rounded-[2rem] border-dashed border-2 border-border">
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-muted/50 mb-6">
            <Target className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-3">لا توجد خطط محفوظة</h2>
          <p className="text-muted-foreground font-medium mb-8 max-w-md mx-auto">
            استخدم الحاسبة الذكية لاستكشاف نمو ثروتك واحفظ أفضل السيناريوهات للرجوع إليها هنا.
          </p>
          <Link href="/calculator">
            <Button size="lg" className="rounded-full px-10 h-14 font-bold text-lg">
              جرب الحاسبة الآن
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="glass-card rounded-[2rem] overflow-hidden flex flex-col hover:border-primary/30 transition-colors group">
              <div className="p-6 md:p-8 flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                    plan.status === 'active' ? 'bg-primary text-white shadow-sm shadow-primary/20' : 
                    plan.status === 'paused' ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {plan.status === 'active' ? 'نشطة' : plan.status === 'paused' ? 'متوقفة' : 'مؤرشفة'}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground group-hover:text-foreground">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>
                
                <h3 className="text-2xl font-display font-bold mb-2 line-clamp-1">{plan.title || 'خطة مالية'}</h3>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium mb-8">
                  <Calendar className="h-4 w-4" />
                  <span>أنشئت في {format(new Date(plan.createdAt), 'MMMM yyyy', { locale: arSA })}</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center pb-4 border-b border-border/50">
                    <span className="text-sm font-bold text-muted-foreground">الهدف الاسمي</span>
                    <span className="text-lg font-display font-bold">{formatCurrency(plan.estimatedValue)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-border/50">
                    <span className="text-sm font-bold text-muted-foreground">المساهمة الشهرية</span>
                    <span className="text-lg font-display font-bold">{formatCurrency(plan.monthlyContribution)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-muted-foreground">النمط</span>
                    <span className="text-sm font-bold bg-muted px-3 py-1 rounded-lg">
                      {plan.scenario === 'conservative' ? 'متحفظ' : plan.scenario === 'balanced' ? 'متوازن' : 'نمو عالي'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-primary/5 p-4 border-t border-primary/10 flex justify-end">
                <Link href={`/plans/${plan.id}`} className="w-full">
                  <Button variant="ghost" className="w-full justify-between rounded-xl h-12 font-bold hover:bg-primary/10 hover:text-primary">
                    التفاصيل
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
