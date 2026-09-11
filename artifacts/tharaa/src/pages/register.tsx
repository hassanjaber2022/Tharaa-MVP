import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister, getGetCurrentUserQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
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
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/api-error';

const registerSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetCurrentUserQueryKey(), data);
        toast({
          title: 'تم إنشاء الحساب بنجاح',
          description: 'أهلاً بك في ثراء!',
        });
        setLocation('/onboarding');
      },
      onError: (error: unknown) => {
        toast({
          variant: 'destructive',
          title: 'فشل إنشاء الحساب',
          description: getApiErrorMessage(error, 'تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى.'),
        });
      },
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate({ data });
  };

  return (
    <div className="container max-w-lg mx-auto flex items-center justify-center min-h-[calc(100vh-8rem)] py-12 px-4">
      <div className="w-full bg-card rounded-3xl p-8 shadow-sm border border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">أهلاً بك في ثراء</h1>
          <p className="text-muted-foreground">قم بإنشاء حسابك لتبدأ رحلتك المالية</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الاسم الكامل</FormLabel>
                  <FormControl>
                    <Input autoComplete="name" placeholder="أحمد محمد" {...field} />
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
                  <FormLabel>البريد الإلكتروني</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" placeholder="ahmed@example.com" dir="ltr" className="text-right" {...field} />
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
                  <FormLabel>كلمة المرور</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="new-password" placeholder="••••••••" dir="ltr" className="text-right" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-12 text-md rounded-xl mt-4" 
              disabled={registerMutation.isPending}
              data-testid="button-submit-register"
            >
              {registerMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
            </Button>
          </form>
        </Form>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          لديك حساب مسبقاً؟{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
