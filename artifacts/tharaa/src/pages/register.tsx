import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Link } from 'wouter';
import { Target, ArrowRight } from 'lucide-react';
import { useRegister as useApiRegister } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetCurrentUserQueryKey } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';

const registerSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const registerMutation = useApiRegister({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetCurrentUserQueryKey(), data);
        setLocation('/onboarding');
        toast({
          title: 'تم إنشاء الحساب بنجاح',
          description: 'لنقم بإعداد ملفك المالي معاً',
        });
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'فشل إنشاء الحساب',
          description: error.response?.data?.error || 'يرجى المحاولة مرة أخرى',
        });
      }
    }
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({ data });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-secondary to-orange-400 shadow-2xl shadow-secondary/30 mb-8 transform rotate-6 hover:rotate-0 transition-transform duration-500">
            <Target className="h-10 w-10 text-secondary-foreground" />
          </div>
          <h1 className="text-4xl font-display font-bold mb-3 tracking-tight text-foreground">ابدأ رحلتك</h1>
          <p className="text-lg text-muted-foreground font-medium">
            أنشئ حسابك في ثراء وابنِ خطتك المالية اليوم
          </p>
        </div>

        <Card className="glass-card p-8 md:p-10 rounded-3xl border-white/20 dark:border-white/10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">الاسم الكامل</FormLabel>
                    <FormControl>
                      <Input 
                        autoComplete="name"
                        placeholder="أحمد عبدالله" 
                        className="h-14 rounded-2xl bg-background/50 focus:bg-background border-border/50 focus:border-primary px-4" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">البريد الإلكتروني</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        autoComplete="email"
                        placeholder="name@example.com" 
                        className="h-14 rounded-2xl bg-background/50 focus:bg-background border-border/50 focus:border-primary px-4 text-left" 
                        dir="ltr"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">كلمة المرور</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        autoComplete="new-password"
                        placeholder="••••••••" 
                        className="h-14 rounded-2xl bg-background/50 focus:bg-background border-border/50 focus:border-primary px-4 text-left font-sans" 
                        dir="ltr"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-14 text-lg font-bold rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-xl shadow-secondary/25 hover:shadow-secondary/40 transition-all hover:-translate-y-1 active:translate-y-0"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
                {!registerMutation.isPending && <ArrowRight className="mr-2 h-5 w-5 rtl:rotate-180" />}
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground font-medium">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-secondary-foreground font-bold hover:underline underline-offset-4 decoration-2">
                سجل الدخول
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
