import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useGetProfile,
  useProjectCalculator,
  useCreatePlan,
  getListPlansQueryKey,
  getGetDashboardQueryKey,
  CalculatorResult,
  PlanInputScenario,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { Calculator as CalcIcon, LineChart, Save, RefreshCw } from 'lucide-react';
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

const calcSchema = z.object({
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

type CalcFormValues = z.infer<typeof calcSchema>;

export default function Calculator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [result, setResult] = useState<CalculatorResult | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<PlanInputScenario>('balanced');
  const [planTitle, setPlanTitle] = useState('');

  const { data: profile } = useGetProfile();

  const form = useForm<CalcFormValues>({
    resolver: zodResolver(calcSchema),
    defaultValues: {
      currentAge: 25,
      targetAge: 60,
      initialBalance: 0,
      monthlyContribution: 1000,
      matchedContribution: 0,
      annualStepUp: 0,
      annualFee: 0.5,
      inflationRate: 2.5,
      withdrawalRate: 4.0,
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        currentAge: profile.currentAge,
        targetAge: profile.targetAge,
        initialBalance: profile.currentSavings,
        monthlyContribution: profile.monthlyCapacity,
        matchedContribution: 0,
        annualStepUp: 0,
        annualFee: 0.5,
        inflationRate: 2.5,
        withdrawalRate: 4.0,
      });
      // Optionally auto-calculate on load if profile exists
    }
  }, [profile, form]);

  const calcMutation = useProjectCalculator({
    mutation: {
      onSuccess: (data) => {
        setResult(data);
      },
      onError: () => {
        toast({
          variant: 'destructive',
          title: 'خطأ',
          description: 'تعذر إجراء الحسابات، تحقق من المدخلات.',
        });
      },
    },
  });

  const savePlanMutation = useCreatePlan({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getListPlansQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        toast({
          title: 'تم حفظ الخطة بنجاح',
          description: 'يمكنك مراجعتها من لوحة التحكم',
        });
        setLocation(`/plans/${data.id}`);
      },
      onError: (err: any) => {
        toast({
          variant: 'destructive',
          title: 'فشل حفظ الخطة',
          description: err.response?.data?.error || 'حاول مرة أخرى',
        });
      },
    },
  });

  const onSubmit = (data: CalcFormValues) => {
    calcMutation.mutate({ data });
  };

  const handleSavePlan = () => {
    if (!result) return;
    const data = form.getValues();
    savePlanMutation.mutate({
      data: {
        ...data,
        scenario: selectedScenario,
        emergencyMonths: profile?.emergencyMonths || 6,
        title: planTitle || 'خطة التقاعد الأساسية',
      },
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Prepare chart data
  const chartData = result?.scenarios[0].yearlyValues.map((yv, index) => {
    const dataPoint: any = { year: yv.year };
    result.scenarios.forEach(sc => {
      dataPoint[sc.key] = sc.yearlyValues[index].value;
    });
    return dataPoint;
  }) || [];

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 pb-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <CalcIcon className="h-8 w-8 text-primary" />
          الحاسبة الاستثمارية
        </h1>
        <p className="text-muted-foreground text-lg">
          اكتشف كيف ينمو رأس مالك بمرور الوقت عبر مسارات استثمارية مختلفة.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Inputs Column */}
        <div className="lg:col-span-4">
          <Card className="p-6 rounded-3xl border-border/50 shadow-sm sticky top-24">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="space-y-4">
                  <h3 className="font-bold border-b border-border pb-2">البيانات الأساسية</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="currentAge" render={({ field }) => (
                      <FormItem>
                        <FormLabel>العمر الحالي</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="targetAge" render={({ field }) => (
                      <FormItem>
                        <FormLabel>عمر التقاعد</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="initialBalance" render={({ field }) => (
                    <FormItem>
                      <FormLabel>الرصيد الابتدائي (ريال)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="monthlyContribution" render={({ field }) => (
                    <FormItem>
                      <FormLabel>المساهمة الشهرية (ريال)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>

                <div className="space-y-4 pt-2">
                  <h3 className="font-bold border-b border-border pb-2">إعدادات متقدمة</h3>
                  
                  <FormField control={form.control} name="annualStepUp" render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between">
                        <FormLabel>الزيادة السنوية للمساهمة</FormLabel>
                        <span className="text-sm font-bold text-primary">{field.value}%</span>
                      </div>
                      <FormControl>
                        <Slider 
                          min={0} max={20} step={1} 
                          value={[field.value]} 
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="py-2"
                        />
                      </FormControl>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="inflationRate" render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between">
                        <FormLabel>معدل التضخم المتوقع</FormLabel>
                        <span className="text-sm font-bold text-primary">{field.value}%</span>
                      </div>
                      <FormControl>
                        <Slider 
                          min={0} max={10} step={0.5} 
                          value={[field.value]} 
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="py-2"
                        />
                      </FormControl>
                    </FormItem>
                  )} />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="annualFee" render={({ field }) => (
                      <FormItem>
                        <FormLabel>رسوم الإدارة %</FormLabel>
                        <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="withdrawalRate" render={({ field }) => (
                      <FormItem>
                        <FormLabel>معدل السحب %</FormLabel>
                        <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-md"
                  disabled={calcMutation.isPending}
                >
                  {calcMutation.isPending ? (
                    <RefreshCw className="me-2 h-5 w-5 animate-spin" />
                  ) : (
                    <LineChart className="me-2 h-5 w-5" />
                  )}
                  احسب النتائج
                </Button>
              </form>
            </Form>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-8">
          {!result ? (
            <Card className="h-full min-h-[400px] flex items-center justify-center border-dashed border-2 rounded-3xl bg-muted/20">
              <div className="text-center text-muted-foreground p-8">
                <CalcIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">في انتظار إدخال البيانات</h3>
                <p>أدخل بياناتك في القائمة الجانبية واضغط على "احسب النتائج" لرؤية التوقعات</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Chart */}
              <Card className="p-6 rounded-3xl border-border/50 shadow-sm">
                <h3 className="text-xl font-bold mb-6">نمو الثروة المتوقع عبر الزمن</h3>
                <div className="h-[400px] w-full" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="year" 
                        tick={{ fill: 'hsl(var(--muted-foreground))' }} 
                        axisLine={false} 
                        tickLine={false} 
                      />
                      <YAxis 
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={false} 
                        tickLine={false}
                        width={60}
                      />
                      <Tooltip 
                        formatter={(value: number, name: string) => {
                          const label = result.scenarios.find(s => s.key === name)?.label || name;
                          return [formatCurrency(value), label];
                        }}
                        labelFormatter={(label) => `عمر: ${label}`}
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          borderRadius: '12px', 
                          border: '1px solid hsl(var(--border))',
                          direction: 'rtl'
                        }}
                      />
                      <Legend 
                        formatter={(value) => result.scenarios.find(s => s.key === value)?.label || value}
                        wrapperStyle={{ paddingTop: '20px', direction: 'rtl' }}
                      />
                      <Line type="monotone" dataKey="growth" stroke="hsl(var(--primary))" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="balanced" stroke="hsl(var(--secondary))" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="conservative" stroke="hsl(var(--chart-3))" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Scenarios Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {result.scenarios.map((scenario) => {
                  const isSelected = selectedScenario === scenario.key;
                  let colorClass = 'border-chart-3 bg-chart-3/5';
                  if (scenario.key === 'growth') colorClass = 'border-primary bg-primary/5';
                  if (scenario.key === 'balanced') colorClass = 'border-secondary bg-secondary/5';

                  return (
                    <Card 
                      key={scenario.key}
                      className={`p-5 rounded-3xl cursor-pointer transition-all border-2 ${
                        isSelected ? colorClass : 'border-transparent hover:border-border'
                      }`}
                      onClick={() => setSelectedScenario(scenario.key)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-bold text-lg">{scenario.label}</h4>
                        <span className={`text-sm font-bold px-2 py-1 rounded-md ${
                          scenario.key === 'growth' ? 'bg-primary/10 text-primary' : 
                          scenario.key === 'balanced' ? 'bg-secondary/10 text-secondary' : 
                          'bg-chart-3/10 text-chart-3'
                        }`}>
                          {scenario.annualRate}%
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">إجمالي المتوقع</p>
                          <p className="font-bold text-lg">{formatCurrency(scenario.nominalValue)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">القوة الشرائية الحقيقية</p>
                          <p className="font-bold text-md text-emerald-600">{formatCurrency(scenario.realValue)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">الدخل الشهري المتوقع</p>
                          <p className="font-bold text-md">{formatCurrency(scenario.monthlyIncome)}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Save Plan Action */}
              <Card className="p-6 rounded-3xl border-border/50 bg-muted/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1 w-full">
                  <h4 className="font-bold mb-2">حفظ الخطة المحددة</h4>
                  <p className="text-sm text-muted-foreground mb-3">اختر السيناريو الأنسب لك من الأعلى واحفظ الخطة لمتابعتها لاحقاً.</p>
                  <Input 
                    placeholder="اسم الخطة (مثال: خطة التقاعد المبكر)" 
                    value={planTitle}
                    onChange={(e) => setPlanTitle(e.target.value)}
                    className="max-w-sm bg-background"
                  />
                </div>
                <Button 
                  onClick={handleSavePlan}
                  size="lg"
                  className="rounded-xl shrink-0 w-full sm:w-auto h-12"
                  disabled={savePlanMutation.isPending}
                >
                  <Save className="me-2 h-5 w-5" />
                  {savePlanMutation.isPending ? 'جاري الحفظ...' : 'حفظ الخطة'}
                </Button>
              </Card>
              
              <div className="text-xs text-muted-foreground text-center bg-card p-4 rounded-xl border border-border/50">
                {result.disclosure}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
