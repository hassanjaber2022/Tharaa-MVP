import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  useGetProfile, 
  useProjectCalculator, 
  useCreatePlan,
  getListPlansQueryKey
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Calculator as CalcIcon, LineChart, Target, Save, ArrowLeft, Loader2, Link } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const calculatorSchema = z.object({
  currentAge: z.coerce.number().min(18).max(99),
  targetAge: z.coerce.number().min(19).max(100),
  initialBalance: z.coerce.number().min(0),
  monthlyContribution: z.coerce.number().min(0),
  matchedContribution: z.coerce.number().min(0),
  annualStepUp: z.coerce.number().min(0).max(100),
  annualFee: z.coerce.number().min(0).max(20),
  inflationRate: z.coerce.number().min(0).max(30),
  withdrawalRate: z.coerce.number().min(0).max(20),
});

type CalculatorFormValues = z.infer<typeof calculatorSchema>;

export default function Calculator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: profile } = useGetProfile();
  
  const form = useForm<CalculatorFormValues>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      currentAge: 25,
      targetAge: 55,
      initialBalance: 0,
      monthlyContribution: 200,
      matchedContribution: 0,
      annualStepUp: 2,
      annualFee: 0.5,
      inflationRate: 2.5,
      withdrawalRate: 4,
    },
  });

  const initialized = useRef(false);
  useEffect(() => {
    if (profile && !initialized.current) {
      form.reset({
        currentAge: profile.currentAge,
        targetAge: profile.targetAge,
        initialBalance: profile.currentSavings,
        monthlyContribution: profile.monthlyCapacity,
        matchedContribution: 0,
        annualStepUp: 2,
        annualFee: 0.5,
        inflationRate: 2.5,
        withdrawalRate: 4,
      });
      initialized.current = true;
    }
  }, [profile, form]);

  const [activeScenario, setActiveScenario] = useState<'conservative' | 'balanced' | 'growth'>('balanced');
  
  // Real-time calculation
  const formValues = form.watch();
  
  const { data: result, isPending: isCalculating } = useProjectCalculator({
    mutation: { mutationKey: ['projectCalculator', JSON.stringify(formValues)] }
  });

  // Auto-calculate on changes with a slight debounce
  const calculateRef = useRef<any>(null);
  const projectMutation = useProjectCalculator({});
  
  useEffect(() => {
    if (calculateRef.current) clearTimeout(calculateRef.current);
    calculateRef.current = setTimeout(() => {
      // Basic validation check before calling
      if (formValues.targetAge > formValues.currentAge) {
        projectMutation.mutate({ data: formValues });
      }
    }, 500);
    return () => clearTimeout(calculateRef.current);
  }, [JSON.stringify(formValues)]);

  const calcData = projectMutation.data;

  const createPlanMutation = useCreatePlan({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListPlansQueryKey() });
        toast({
          title: 'تم حفظ الخطة بنجاح',
          description: 'يمكنك مراجعتها من لوحة التحكم',
        });
        setLocation(`/plans/${data.id}`);
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'فشل حفظ الخطة',
          description: error.response?.data?.error || 'حاول مرة أخرى',
        });
      }
    }
  });

  const handleSavePlan = () => {
    createPlanMutation.mutate({
      data: {
        ...formValues,
        scenario: activeScenario,
        emergencyMonths: profile?.emergencyMonths || 6,
        title: `خطة التقاعد عند ${formValues.targetAge}`,
      }
    });
  };

  const selectedProjection = calcData?.scenarios.find(s => s.key === activeScenario);

  return (
    <div className="container max-w-screen-xl mx-auto py-12 px-4 pb-32">
      <div className="mb-10 text-center md:text-start flex flex-col items-center md:items-start">
        <div className="h-16 w-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-6">
          <CalcIcon className="h-8 w-8" />
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4 text-foreground">
          الحاسبة الذكية
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
          استكشف كيف تنمو ثروتك بمرور الزمن. غيّر المتغيرات ولاحظ التأثير المستقبلي.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-6">
          <Form {...form}>
            <form className="space-y-6">
              
              <Card className="glass-card p-6 rounded-[2rem]">
                <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  الأساسيات
                </h3>
                
                <div className="space-y-6">
                  <FormField control={form.control} name="currentAge" render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-2">
                        <FormLabel className="text-base font-bold">العمر الحالي</FormLabel>
                        <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">{field.value} سنة</span>
                      </div>
                      <FormControl>
                        <Slider 
                          min={18} max={80} step={1} 
                          value={[field.value]} 
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="my-4"
                        />
                      </FormControl>
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="targetAge" render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-2">
                        <FormLabel className="text-base font-bold">عمر التقاعد</FormLabel>
                        <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">{field.value} سنة</span>
                      </div>
                      <FormControl>
                        <Slider 
                          min={field.value < formValues.currentAge ? formValues.currentAge + 1 : 25} max={100} step={1} 
                          value={[field.value]} 
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="my-4"
                        />
                      </FormControl>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="initialBalance" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold">الرصيد المبدئي (د.ك)</FormLabel>
                      <FormControl>
                        <Input type="number" className="h-12 rounded-xl text-lg bg-background/50 border-border/50 focus:border-primary" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="monthlyContribution" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold text-primary">المساهمة الشهرية (د.ك)</FormLabel>
                      <FormControl>
                        <Input type="number" className="h-12 rounded-xl text-lg bg-primary/5 border-primary/20 focus:border-primary" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              </Card>

              <Card className="glass-card p-6 rounded-[2rem]">
                <h3 className="text-xl font-display font-bold mb-6 text-foreground">افتراضات متقدمة</h3>
                
                <div className="space-y-6">
                  <FormField control={form.control} name="inflationRate" render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-2">
                        <FormLabel className="text-sm font-bold">التضخم السنوي</FormLabel>
                        <span className="text-sm text-muted-foreground">{field.value}%</span>
                      </div>
                      <FormControl>
                        <Slider min={0} max={10} step={0.5} value={[field.value]} onValueChange={(v) => field.onChange(v[0])} />
                      </FormControl>
                    </FormItem>
                  )} />
                  
                  <FormField control={form.control} name="withdrawalRate" render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-2">
                        <FormLabel className="text-sm font-bold">معدل السحب الآمن</FormLabel>
                        <span className="text-sm text-muted-foreground">{field.value}%</span>
                      </div>
                      <FormControl>
                        <Slider min={2} max={8} step={0.5} value={[field.value]} onValueChange={(v) => field.onChange(v[0])} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              </Card>

            </form>
          </Form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="glass-card flex-1 p-6 md:p-8 rounded-[2rem] border-primary/10 overflow-hidden flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h2 className="text-2xl font-display font-bold mb-1">النمو المتوقع</h2>
                <p className="text-muted-foreground font-medium text-sm">التأثير المركب لمدخراتك حتى عمر {formValues.targetAge}</p>
              </div>

              {/* Scenario Toggles */}
              <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-border/50 self-stretch md:self-auto">
                <Button 
                  variant={activeScenario === 'conservative' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setActiveScenario('conservative')}
                  className={`rounded-xl font-bold ${activeScenario === 'conservative' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  متحفظ
                </Button>
                <Button 
                  variant={activeScenario === 'balanced' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setActiveScenario('balanced')}
                  className={`rounded-xl font-bold ${activeScenario === 'balanced' ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  متوازن
                </Button>
                <Button 
                  variant={activeScenario === 'growth' ? 'default' : 'ghost'} 
                  size="sm" 
                  onClick={() => setActiveScenario('growth')}
                  className={`rounded-xl font-bold ${activeScenario === 'growth' ? 'bg-secondary text-secondary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  نمو عالي
                </Button>
              </div>
            </div>

            {!calcData ? (
              <div className="flex-1 min-h-[300px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : selectedProjection ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="bg-background/60 p-4 rounded-2xl border border-border/50">
                    <p className="text-xs font-bold text-muted-foreground mb-1">الرصيد النهائي</p>
                    <p className="text-xl font-display font-bold text-foreground">{formatCurrency(selectedProjection.nominalValue)}</p>
                  </div>
                  <div className="bg-background/60 p-4 rounded-2xl border border-border/50">
                    <p className="text-xs font-bold text-muted-foreground mb-1">القوة الشرائية الحقيقية</p>
                    <p className="text-xl font-display font-bold text-foreground">{formatCurrency(selectedProjection.realValue)}</p>
                  </div>
                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20">
                    <p className="text-xs font-bold text-muted-foreground mb-1">دخل التقاعد الشهري</p>
                    <p className="text-xl font-display font-bold text-primary">{formatCurrency(selectedProjection.monthlyIncome)}</p>
                  </div>
                  <div className="bg-background/60 p-4 rounded-2xl border border-border/50">
                    <p className="text-xs font-bold text-muted-foreground mb-1">العائد المتوقع</p>
                    <p className="text-xl font-display font-bold text-foreground">{selectedProjection.annualRate}%</p>
                  </div>
                </div>

                <div className="flex-1 min-h-[350px] w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={selectedProjection.yearlyValues}
                      margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="year" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                        width={60}
                      />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'القيمة']}
                        labelFormatter={(label) => `عمر ${label}`}
                        contentStyle={{ 
                          borderRadius: '16px', 
                          border: 'none', 
                          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                          backgroundColor: 'hsl(var(--card))',
                          color: 'hsl(var(--foreground))',
                          fontFamily: 'inherit',
                          fontWeight: 'bold',
                          direction: 'rtl'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={
                          activeScenario === 'conservative' ? 'hsl(var(--foreground))' :
                          activeScenario === 'balanced' ? 'hsl(var(--primary))' :
                          'hsl(var(--secondary))'
                        } 
                        strokeWidth={4}
                        dot={false}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : null}
          </Card>

          <div className="flex justify-end gap-4 mt-auto">
            <Link href="/dashboard">
              <Button variant="ghost" className="h-14 px-8 rounded-full font-bold">
                إلغاء
              </Button>
            </Link>
            <Button 
              onClick={handleSavePlan}
              disabled={!calcData || createPlanMutation.isPending}
              className="h-14 px-10 rounded-full font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all text-lg"
            >
              {createPlanMutation.isPending ? 'جاري الحفظ...' : 'حفظ كخطة نشطة'}
              {!createPlanMutation.isPending && <Save className="mr-2 h-5 w-5" />}
            </Button>
          </div>
          
          {calcData?.disclosure && (
            <p className="text-xs text-muted-foreground/60 text-center leading-relaxed">
              {calcData.disclosure} هذه الأرقام هي مجرد أمثلة توضيحية ولا تشكل نصيحة استثمارية.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
