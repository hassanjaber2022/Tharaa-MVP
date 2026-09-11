import { useState } from 'react';
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
import { WalletCards, ArrowRight } from 'lucide-react';
import { useLogin as useApiLogin } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetCurrentUserQueryKey } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useApiLogin({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetCurrentUserQueryKey(), data);
        setLocation('/dashboard');
        toast({
          title: 'أهلاً بك مجدداً في ثراء',
          description: 'تم تسجيل الدخول بنجاح',
        });
      },
      onError: (error: any) => {
        toast({
          variant: 'destructive',
          title: 'فشل تسجيل الدخول',
          description: error.response?.data?.error || 'تأكد من البريد الإلكتروني وكلمة المرور',
        });
      }
    }
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({ data });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-primary to-emerald-500 shadow-2xl shadow-primary/30 mb-8 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
            <WalletCards className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-display font-bold mb-3 tracking-tight text-foreground">مرحباً بعودتك</h1>
          <p className="text-lg text-muted-foreground font-medium">
            تابع رحلتك نحو استقلالك المالي
          </p>
        </div>

        <Card className="glass-card p-8 md:p-10 rounded-3xl border-white/20 dark:border-white/10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-base font-semibold">كلمة المرور</FormLabel>
                      <a href="#" className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                        نسيت الكلمة؟
                      </a>
                    </div>
                    <FormControl>
                      <Input 
                        type="password" 
                        autoComplete="current-password"
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
                className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-1 active:translate-y-0"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'جاري الدخول...' : 'تسجيل الدخول'}
                {!loginMutation.isPending && <ArrowRight className="mr-2 h-5 w-5 rtl:rotate-180" />}
              </Button>
            </form>
          </Form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground font-medium">
              ليس لديك حساب؟{' '}
              <Link href="/register" className="text-primary font-bold hover:underline underline-offset-4 decoration-2">
                سجل الآن
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
