import { useEffect } from 'react';
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
import { Wallet, Target, Activity, ArrowRight, Sparkles } from 'lucide-react';
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

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: isLoadingProfile } = useGetProfile();

  useEffect(() => {
    if (!isLoadingProfile && profile) {
      setLocation('/dashboard');
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

  const updateProfileMutation = useUpdateProfile({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetProfileQueryKey(), data);
        toast({
          title: 'رائع، تم الحفظ!',
          description: 'خطوتك الأولى نحو الحرية المالية اكتملت.',
        });
        setLocation('/dashboard');
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'حدث خطأ',
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
      <div className="mb-12 text-center md:text-start flex flex-col items-center md:items-start">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-5 py-2 text-sm font-bold text-secondary-foreground shadow-sm">
          <Sparkles className="h-4 w-4" />
          إعداد الملف المالي · يستغرق حوالي 3 دقائق
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-4 text-foreground">
          لنصمم مستقبلك المالي
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
          أدخل تقديراتك الحالية، يمكنك التعديل لاحقاً. لا بأس إذا لم تكن الأرقام دقيقة تماماً، الأهم هو أن تبدأ.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          
          <Card className="glass-card p-8 md:p-10 rounded-3xl border-primary/20">
            <div className="flex items-center gap-4 mb-8 border-b border-border/50 pb-6">
              <div className="p-4 bg-primary rounded-2xl text-primary-foreground shadow-lg shadow-primary/30">
                <Wallet className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold">نقطة الانطلاق</h2>
                <p className="text-muted-foreground font-medium mt-1">الوضع المالي الحالي</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-8">
              <FormField control={form.control} name="currentAge" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">عمرك الحالي</FormLabel>
                  <FormControl><Input className="h-14 rounded-2xl text-lg bg-background/50 border-border/50 focus:border-primary px-4" type="number" inputMode="numeric" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="monthlyIncome" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">الدخل الشهري (د.ك)</FormLabel>
                  <FormControl><Input className="h-14 rounded-2xl text-lg bg-background/50 border-border/50 focus:border-primary px-4" type="number" inputMode="numeric" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="essentialExpenses" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">المصاريف الأساسية (إيجار، فواتير...) (د.ك)</FormLabel>
                  <FormControl><Input className="h-14 rounded-2xl text-lg bg-background/50 border-border/50 focus:border-primary px-4" type="number" inputMode="numeric" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="obligations" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">الالتزامات والديون الشهرية (د.ك)</FormLabel>
                  <FormControl><Input className="h-14 rounded-2xl text-lg bg-background/50 border-border/50 focus:border-primary px-4" type="number" inputMode="numeric" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="currentSavings" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">المدخرات الحالية المتوفرة (د.ك)</FormLabel>
                  <FormControl><Input className="h-14 rounded-2xl text-lg bg-background/50 border-border/50 focus:border-primary px-4" type="number" inputMode="numeric" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="monthlyCapacity" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold text-primary">القدرة الشهرية للادخار والاستثمار (د.ك)</FormLabel>
                  <FormControl><Input className="h-14 rounded-2xl text-lg bg-primary/5 border-primary/20 focus:border-primary px-4" type="number" inputMode="numeric" {...field} /></FormControl>
                  <FormDescription className="text-sm font-medium mt-2">
                    المبلغ الفائض المحسوب تلقائياً:{' '}
                    <strong className="font-bold text-primary">
                      {formatCurrency(suggestedCapacity)}
                    </strong>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Card>

          <Card className="glass-card p-8 md:p-10 rounded-3xl border-secondary/20">
            <div className="flex items-center gap-4 mb-8 border-b border-border/50 pb-6">
              <div className="p-4 bg-secondary rounded-2xl text-secondary-foreground shadow-lg shadow-secondary/30">
                <Target className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold">الوجهة</h2>
                <p className="text-muted-foreground font-medium mt-1">الأهداف والتطلعات المستقبلية</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-8">
              <FormField control={form.control} name="targetAge" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">العمر المستهدف للتقاعد / الحرية المالية</FormLabel>
                  <FormControl><Input className="h-14 rounded-2xl text-lg bg-background/50 border-border/50 focus:border-primary px-4" type="number" inputMode="numeric" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="desiredFutureIncome" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">الدخل الشهري المرغوب وقتها (د.ك)</FormLabel>
                  <FormControl><Input className="h-14 rounded-2xl text-lg bg-background/50 border-border/50 focus:border-primary px-4" type="number" inputMode="numeric" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              
              <FormField control={form.control} name="emergencyMonths" render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="text-base font-semibold">حجم صندوق الطوارئ (بالأشهر)</FormLabel>
                  <FormControl><Input className="h-14 rounded-2xl text-lg bg-background/50 border-border/50 focus:border-primary px-4" type="number" inputMode="numeric" {...field} /></FormControl>
                  <FormDescription className="text-sm font-medium mt-2">كم شهر تود أن تغطي مدخرات الطوارئ من مصاريفك الأساسية؟ (ينصح بـ 3-6 أشهر)</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </Card>

          <Card className="glass-card p-8 md:p-10 rounded-3xl border-accent/20">
            <div className="flex items-center gap-4 mb-8 border-b border-border/50 pb-6">
              <div className="p-4 bg-accent rounded-2xl text-accent-foreground shadow-lg shadow-accent/30">
                <Activity className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold">الأسلوب</h2>
                <p className="text-muted-foreground font-medium mt-1">نمط الاستثمار وشهية المخاطرة</p>
              </div>
            </div>
            
            <FormField control={form.control} name="riskCategory" render={({ field }) => (
              <FormItem className="space-y-6">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid sm:grid-cols-3 gap-6"
                  >
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="conservative" className="peer sr-only" />
                      </FormControl>
                      <FormLabel className="flex flex-col items-center justify-center rounded-3xl border-2 border-border/50 bg-background/50 p-8 hover:bg-muted peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/5 cursor-pointer transition-all hover:scale-[1.02]">
                        <span className="font-display font-bold text-xl mb-3">متحفظ</span>
                        <span className="text-sm text-muted-foreground text-center font-medium leading-relaxed">التركيز على حفظ رأس المال مع نمو آمن ومستقر</span>
                      </FormLabel>
                    </FormItem>
                    
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="balanced" className="peer sr-only" />
                      </FormControl>
                      <FormLabel className="flex flex-col items-center justify-center rounded-3xl border-2 border-border/50 bg-background/50 p-8 hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all hover:scale-[1.02]">
                        <span className="font-display font-bold text-xl mb-3">متوازن</span>
                        <span className="text-sm text-muted-foreground text-center font-medium leading-relaxed">مزيج معتدل يوازن بين فرص النمو والمخاطر</span>
                      </FormLabel>
                    </FormItem>
                    
                    <FormItem>
                      <FormControl>
                        <RadioGroupItem value="growth" className="peer sr-only" />
                      </FormControl>
                      <FormLabel className="flex flex-col items-center justify-center rounded-3xl border-2 border-border/50 bg-background/50 p-8 hover:bg-muted peer-data-[state=checked]:border-secondary peer-data-[state=checked]:bg-secondary/5 cursor-pointer transition-all hover:scale-[1.02]">
                        <span className="font-display font-bold text-xl mb-3">نمو عالي</span>
                        <span className="text-sm text-muted-foreground text-center font-medium leading-relaxed">مخاطر أعلى من أجل تعظيم فرص النمو المستقبلية</span>
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </Card>

          <div className="flex justify-center md:justify-end pt-8">
            <Button 
              type="submit" 
              className="rounded-full px-12 h-16 text-xl font-bold w-full md:w-auto shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? 'جاري الحفظ...' : 'ابدأ رحلتك'}
              {!updateProfileMutation.isPending && <ArrowRight className="mr-3 h-6 w-6 rtl:rotate-180" />}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
