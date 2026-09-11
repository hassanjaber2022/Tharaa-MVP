import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  useGetProfile, 
  useUpdateProfile, 
  getGetProfileQueryKey
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
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { Wallet, Target, Activity, Settings as SettingsIcon, Save } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

const profileSchema = z.object({
  currentAge: z.coerce.number().min(18, 'يجب أن يكون العمر 18 على الأقل').max(99, 'يجب أن يكون العمر أقل من 99'),
  targetAge: z.coerce.number().min(19, 'يجب أن يكون العمر 19 على الأقل').max(100, 'يجب أن يكون العمر أقل من 100'),
  monthlyIncome: z.coerce.number().min(0, 'لا يمكن أن يكون الدخل بالسالب'),
  essentialExpenses: z.coerce.number().min(0, 'لا يمكن أن تكون المصاريف بالسالب'),
  obligations: z.coerce.number().min(0, 'لا يمكن أن تكون الالتزامات بالسالب'),
  currentSavings: z.coerce.number().min(0, 'لا يمكن أن تكون المدخرات بالسالب'),
  monthlyCapacity: z.coerce.number().min(0, 'لا يمكن أن تكون القدرة على الادخار بالسالب'),
  desiredFutureIncome: z.coerce.number().min(0, 'لا يمكن أن يكون الدخل المستهدف بالسالب'),
  emergencyMonths: z.coerce.number().min(1, 'شهر واحد على الأقل').max(24, '24 شهر كحد أقصى'),
  riskCategory: z.enum(['conservative', 'balanced', 'growth'] as const),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function Settings() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: isLoadingProfile } = useGetProfile();

  useEffect(() => {
    if (!isLoadingProfile && !profile) {
      setLocation('/onboarding');
    }
  }, [isLoadingProfile, profile, setLocation]);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      currentAge: 25,
      targetAge: 55,
      monthlyIncome: 1200,
      essentialExpenses: 400,
      obligations: 200,
      currentSavings: 1500,
      monthlyCapacity: 400,
      desiredFutureIncome: 1500,
      emergencyMonths: 6,
      riskCategory: 'balanced',
    },
  });

  const initialized = useRef(false);

  useEffect(() => {
    if (profile && !initialized.current) {
      form.reset({
        currentAge: profile.currentAge,
        targetAge: profile.targetAge,
        monthlyIncome: profile.monthlyIncome,
        essentialExpenses: profile.essentialExpenses,
        obligations: profile.obligations,
        currentSavings: profile.currentSavings,
        monthlyCapacity: profile.monthlyCapacity,
        desiredFutureIncome: profile.desiredFutureIncome,
        emergencyMonths: profile.emergencyMonths,
        riskCategory: profile.riskCategory,
      });
      initialized.current = true;
    }
  }, [profile, form]);

  const updateProfileMutation = useUpdateProfile({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetProfileQueryKey(), data);
        toast({
          title: 'تم تحديث الإعدادات',
          description: 'تم حفظ تفاصيل ملفك المالي بنجاح',
        });
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'فشل حفظ البيانات',
          description: error.response?.data?.error || 'يرجى المحاولة مرة أخرى',
        });
      },
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate({ data });
  };

  const income = form.watch("monthlyIncome") || 0;
  const expenses = form.watch("essentialExpenses") || 0;
  const obligations = form.watch("obligations") || 0;
  const suggestedCapacity = Math.max(0, income - expenses - obligations);

  if (isLoadingProfile) {
    return (
      <div className="container mx-auto py-16 flex justify-center">
        <div className="animate-pulse flex flex-col items-center gap-6">
          <div className="h-10 w-64 bg-muted rounded-full"></div>
          <div className="h-[600px] w-full max-w-4xl bg-muted/50 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <SettingsIcon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight mb-1">الإعدادات المالية</h1>
            <p className="text-muted-foreground font-medium">
              تحديث بياناتك يحسن من دقة التوصيات والخطط المحسوبة
            </p>
          </div>
        </div>
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          className="h-12 px-8 rounded-full shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all text-base font-bold"
          disabled={updateProfileMutation.isPending || !form.formState.isDirty}
        >
          {updateProfileMutation.isPending ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          {!updateProfileMutation.isPending && <Save className="mr-2 h-5 w-5" />}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <Card className="glass-card p-6 md:p-10 rounded-3xl">
            <div className="flex items-center gap-4 mb-8 border-b border-border/50 pb-6">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-600">
                <Wallet className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-display font-bold">المؤشرات الحالية</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              <FormField control={form.control} name="currentAge" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">عمرك الحالي</FormLabel>
                  <FormControl><Input className="h-12 rounded-xl text-lg bg-muted/50" type="number" inputMode="numeric" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="monthlyIncome" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">الدخل الشهري (د.ك)</FormLabel>
                  <FormControl><Input className="h-12 rounded-xl text-lg bg-muted/50" type="number" inputMode="numeric" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="essentialExpenses" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">المصاريف الأساسية (د.ك)</FormLabel>
                  <FormControl><Input className="h-12 rounded-xl text-lg bg-muted/50" type="number" inputMode="numeric" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="obligations" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">الالتزامات والديون (د.ك)</FormLabel>
                  <FormControl><Input className="h-12 rounded-xl text-lg bg-muted/50" type="number" inputMode="numeric" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="currentSavings" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">المدخرات الحالية (د.ك)</FormLabel>
                  <FormControl><Input className="h-12 rounded-xl text-lg bg-muted/50" type="number" inputMode="numeric" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="monthlyCapacity" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">القدرة على الادخار شهرياً (د.ك)</FormLabel>
                  <FormControl><Input className="h-12 rounded-xl text-lg bg-muted/50" type="number" inputMode="numeric" {...field} /></FormControl>
                  <FormDescription className="text-sm mt-2">
                    الفائض المحسوب:{' '}
                    <strong className="font-bold text-primary">
                      {formatCurrency(suggestedCapacity)}
                    </strong>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Card>

          <Card className="glass-card p-6 md:p-10 rounded-3xl">
            <div className="flex items-center gap-4 mb-8 border-b border-border/50 pb-6">
              <div className="p-3 bg-secondary/20 rounded-xl text-secondary-foreground">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-display font-bold">الأهداف والاستقرار</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              <FormField control={form.control} name="targetAge" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">عمر الحرية المالية</FormLabel>
                  <FormControl><Input className="h-12 rounded-xl text-lg bg-muted/50" type="number" inputMode="numeric" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="desiredFutureIncome" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">الدخل الشهري المرغوب (د.ك)</FormLabel>
                  <FormControl><Input className="h-12 rounded-xl text-lg bg-muted/50" type="number" inputMode="numeric" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="emergencyMonths" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-base font-semibold">تغطية صندوق الطوارئ (أشهر)</FormLabel>
                  <FormControl><Input className="h-12 rounded-xl text-lg bg-muted/50" type="number" inputMode="numeric" {...field} /></FormControl>
                  <FormDescription className="text-sm mt-2">يُنصح بـ 3 إلى 6 أشهر من المصاريف الأساسية</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Card>

          <Card className="glass-card p-6 md:p-10 rounded-3xl">
            <div className="flex items-center gap-4 mb-8 border-b border-border/50 pb-6">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600">
                <Activity className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-display font-bold">نمط الاستثمار</h2>
            </div>
            
            <FormField control={form.control} name="riskCategory" render={({ field }) => (
              <FormItem className="space-y-6">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid sm:grid-cols-3 gap-4"
                  >
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="conservative" className="peer sr-only" />
                      </FormControl>
                      <FormLabel className="flex flex-col items-center justify-center rounded-2xl border-2 border-border/50 bg-background/50 p-6 hover:bg-muted peer-data-[state=checked]:border-emerald-500 peer-data-[state=checked]:bg-emerald-500/5 cursor-pointer transition-all">
                        <span className="font-display font-bold text-lg mb-2">متحفظ</span>
                        <span className="text-sm text-muted-foreground text-center font-medium leading-relaxed">أولوية لحفظ رأس المال مع نمو بسيط</span>
                      </FormLabel>
                    </FormItem>
                    
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="balanced" className="peer sr-only" />
                      </FormControl>
                      <FormLabel className="flex flex-col items-center justify-center rounded-2xl border-2 border-border/50 bg-background/50 p-6 hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all">
                        <span className="font-display font-bold text-lg mb-2">متوازن</span>
                        <span className="text-sm text-muted-foreground text-center font-medium leading-relaxed">موازنة بين النمو والمخاطر</span>
                      </FormLabel>
                    </FormItem>
                    
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="growth" className="peer sr-only" />
                      </FormControl>
                      <FormLabel className="flex flex-col items-center justify-center rounded-2xl border-2 border-border/50 bg-background/50 p-6 hover:bg-muted peer-data-[state=checked]:border-orange-500 peer-data-[state=checked]:bg-orange-500/5 cursor-pointer transition-all">
                        <span className="font-display font-bold text-lg mb-2">نمو عالي</span>
                        <span className="text-sm text-muted-foreground text-center font-medium leading-relaxed">مخاطر أعلى لفرص نمو أكبر مستقبلاً</span>
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </Card>

        </form>
      </Form>
    </div>
  );
}
