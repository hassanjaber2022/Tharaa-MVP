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
import { Wallet, Target, Activity } from 'lucide-react';

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

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: isLoadingProfile } = useGetProfile();
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      currentAge: 25,
      targetAge: 60,
      monthlyIncome: 10000,
      essentialExpenses: 3000,
      obligations: 1000,
      currentSavings: 5000,
      monthlyCapacity: 2000,
      desiredFutureIncome: 15000,
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
          title: 'تم حفظ الملف المالي',
          description: 'يمكنك الآن استخدام الحاسبة لإنشاء خطتك',
        });
        setLocation('/dashboard');
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

  if (isLoadingProfile) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-8 w-48 bg-muted rounded"></div>
          <div className="h-64 w-full max-w-2xl bg-muted rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4 pb-24">
      <div className="mb-10 text-center md:text-start">
        <h1 className="text-3xl font-bold mb-3">ملفك المالي</h1>
        <p className="text-muted-foreground text-lg">
          نحتاج لبعض التفاصيل لنساعدك في بناء خطة تناسبك. لا تقلق، بياناتك بأمان.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <Card className="p-6 md:p-8 rounded-3xl border-border/50 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <Wallet className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">الوضع المالي الحالي</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <FormField control={form.control} name="currentAge" render={({ field }) => (
                <FormItem>
                  <FormLabel>عمرك الحالي</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="monthlyIncome" render={({ field }) => (
                <FormItem>
                  <FormLabel>الدخل الشهري (ريال)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="essentialExpenses" render={({ field }) => (
                <FormItem>
                  <FormLabel>المصاريف الأساسية (إيجار، فواتير...)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="obligations" render={({ field }) => (
                <FormItem>
                  <FormLabel>الالتزامات والديون الشهرية</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="currentSavings" render={({ field }) => (
                <FormItem>
                  <FormLabel>المدخرات الحالية (إجمالي)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="monthlyCapacity" render={({ field }) => (
                <FormItem>
                  <FormLabel>القدرة الشهرية للادخار/الاستثمار</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormDescription>المبلغ الذي تستطيع توفيره شهرياً</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Card>

          <Card className="p-6 md:p-8 rounded-3xl border-border/50 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
              <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                <Target className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">الأهداف المستقبلية</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <FormField control={form.control} name="targetAge" render={({ field }) => (
                <FormItem>
                  <FormLabel>العمر المستهدف للحرية المالية</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="desiredFutureIncome" render={({ field }) => (
                <FormItem>
                  <FormLabel>الدخل الشهري المرغوب بعد التقاعد</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="emergencyMonths" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>تغطية صندوق الطوارئ (بالأشهر)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormDescription>ينصح بـ 3 إلى 6 أشهر من المصاريف الأساسية</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Card>

          <Card className="p-6 md:p-8 rounded-3xl border-border/50 shadow-sm">
            <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                <Activity className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">نمط الاستثمار</h2>
            </div>
            
            <FormField control={form.control} name="riskCategory" render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-base">ما هي شهيتك للمخاطرة؟</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="grid sm:grid-cols-3 gap-4"
                  >
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="conservative" className="peer sr-only" />
                      </FormControl>
                      <FormLabel className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer">
                        <span className="font-bold mb-1">متحفظ</span>
                        <span className="text-xs text-muted-foreground text-center">أولوية لحفظ رأس المال مع نمو بسيط</span>
                      </FormLabel>
                    </FormItem>
                    
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="balanced" className="peer sr-only" />
                      </FormControl>
                      <FormLabel className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer">
                        <span className="font-bold mb-1">متوازن</span>
                        <span className="text-xs text-muted-foreground text-center">موازنة بين النمو والمخاطر</span>
                      </FormLabel>
                    </FormItem>
                    
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="growth" className="peer sr-only" />
                      </FormControl>
                      <FormLabel className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer">
                        <span className="font-bold mb-1">نمو عالي</span>
                        <span className="text-xs text-muted-foreground text-center">مخاطر أعلى لفرص نمو أكبر مستقبلاً</span>
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </Card>

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              size="lg" 
              className="rounded-xl px-12 h-14 text-lg w-full sm:w-auto"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? 'جاري الحفظ...' : 'حفظ ومتابعة'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
