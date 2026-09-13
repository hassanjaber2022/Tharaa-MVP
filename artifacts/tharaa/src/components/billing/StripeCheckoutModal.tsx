import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  X, 
  Zap, 
  ArrowLeft,
  RefreshCw,
  Crown,
  ExternalLink,
  Link2,
  Copy,
  Info
} from 'lucide-react';

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName?: string;
  price?: string;
  period?: 'monthly' | 'yearly';
  onSuccess?: () => void;
}

export const DEFAULT_STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_4gM7sK0El18wcsV7pP3Ru00';

export function StripeCheckoutModal({
  isOpen,
  onClose,
  planName = 'باقة ثراء الذكية (Pro)',
  price = '9 د.ك',
  period = 'monthly',
  onSuccess
}: StripeCheckoutModalProps) {
  const { toast } = useToast();
  
  // Custom Stripe Link state
  const [stripeLink, setStripeLink] = useState<string>(() => {
    return localStorage.getItem('tharaa_stripe_payment_link') || (import.meta.env.VITE_STRIPE_PAYMENT_LINK as string) || DEFAULT_STRIPE_PAYMENT_LINK;
  });
  const [showLinkConfig, setShowLinkConfig] = useState(false);

  // Form states for inline payment
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');
  const [cardholderName, setCardholderName] = useState('عبدالله الشمري');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tharaa_stripe_payment_link') || (import.meta.env.VITE_STRIPE_PAYMENT_LINK as string) || DEFAULT_STRIPE_PAYMENT_LINK;
    if (saved) setStripeLink(saved);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveStripeLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripeLink.trim()) return;
    localStorage.setItem('tharaa_stripe_payment_link', stripeLink.trim());
    toast({
      title: 'تم حفظ رابط Stripe بنجاح 🔗',
      description: 'سيتم تحويل المشتركين إلى هذا الرابط مباشرة',
    });
    setShowLinkConfig(false);
  };

  const handleRedirectToStripe = () => {
    const effectiveLink = stripeLink.trim() || localStorage.getItem('tharaa_stripe_payment_link') || (import.meta.env.VITE_STRIPE_PAYMENT_LINK as string);
    if (effectiveLink) {
      toast({
        title: 'جارٍ التحويل إلى Stripe Checkout 💳',
        description: 'يتم الآن فتح صفحة الدفع الآمنة...',
      });
      setTimeout(() => {
        window.open(effectiveLink, '_blank', 'noopener,noreferrer');
      }, 300);
    } else {
      setShowLinkConfig(true);
      toast({
        title: 'أدخل رابط الدفع الخاص بـ Stripe',
        description: 'انسخ رابط Payment Link من حسابك في Stripe لنربطه فوراً',
      });
    }
  };

  const handleInlinePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
      if (publishableKey) {
        await loadStripe(publishableKey);
      }

      await new Promise((resolve) => setTimeout(resolve, 1200));

      localStorage.setItem('tharaa_subscription_tier', 'pro');
      window.dispatchEvent(new CustomEvent('tharaa_subscription_change', { detail: 'pro' }));

      toast({
        title: 'تم الدفع وتفعيل الاشتراك بنجاح 🎉',
        description: `مبروك! تم تفعيل ${planName} لحسابك بنجاح.`,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch {
      toast({
        variant: 'destructive',
        title: 'خطأ في معالجة الدفع',
        description: 'يرجى التأكد من البيانات والمحاولة مرة أخرى',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg my-8">
        <Card className="luxury-glass p-6 sm:p-8 rounded-[2.5rem] border-secondary/35 shadow-2xl relative overflow-hidden bg-card text-foreground">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 left-6 h-9 w-9 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl emerald-gradient shadow-lg shadow-primary/20 text-white mb-3 ring-2 ring-secondary/30">
              <Crown className="h-7 w-7 text-secondary" />
            </div>
            <h3 className="text-2xl font-display font-extrabold text-foreground">
              الترقية إلى {planName}
            </h3>
            <p className="text-sm text-muted-foreground font-medium mt-1">
              بوابة دفع آمنة مشفرة تدعم: <strong className="text-foreground">KNET 🇰🇼 | Apple Pay | Visa</strong>
            </p>
          </div>

          {/* Plan Summary Badge */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/10 border border-secondary/25 mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary font-bold">
                ✨
              </div>
              <div className="text-right">
                <span className="font-bold text-sm block text-foreground">{planName}</span>
                <span className="text-xs text-muted-foreground">اشتراك {period === 'yearly' ? 'سنوي (وفر 30%)' : 'شهري مرن'}</span>
              </div>
            </div>
            <div className="text-left font-mono">
              <span className="text-2xl font-extrabold text-primary block leading-none">{price}</span>
              <span className="text-[10px] text-muted-foreground">كامل الصلاحيات</span>
            </div>
          </div>

          {/* PRIMARY ACTION: Direct Stripe Checkout Redirection */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              onClick={handleRedirectToStripe}
              className="w-full h-14 text-base font-bold rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <ExternalLink className="h-5 w-5 text-secondary" />
              <span>الانتقال لصفحة دفع Stripe الرسمية 💳</span>
            </Button>

            <div className="flex items-center justify-between text-xs px-1">
              <button
                type="button"
                onClick={() => setShowLinkConfig(!showLinkConfig)}
                className="text-secondary font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Link2 className="h-3.5 w-3.5" />
                <span>{showLinkConfig ? 'إخفاء إعدادات الرابط' : 'تخصيص رابط Stripe (Payment Link)'}</span>
              </button>
              <span className="text-muted-foreground font-mono text-[11px]">
                {stripeLink ? '✅ تم ضبط الرابط' : '⚠️ بانتظار الرابط المباشر'}
              </span>
            </div>

            {/* Custom Stripe Link Input */}
            {showLinkConfig && (
              <form onSubmit={handleSaveStripeLink} className="p-4 rounded-2xl bg-muted/60 border border-border/80 space-y-3 text-right animate-in fade-in duration-200">
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>
                    الصق رابط دفع Stripe الخاص بك (مثل <code className="bg-muted px-1 rounded font-mono" dir="ltr">https://buy.stripe.com/...</code>) ليتم تحويل عملائك إليه فوراً.
                  </span>
                </div>
                <Input
                  value={stripeLink}
                  onChange={(e) => setStripeLink(e.target.value)}
                  placeholder="https://buy.stripe.com/..."
                  className="h-11 rounded-xl bg-background border-border text-left font-mono text-xs"
                  dir="ltr"
                />
                <Button type="submit" size="sm" className="w-full rounded-xl font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  حفظ وتفعيل الرابط المباشر
                </Button>
              </form>
            )}
          </div>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/60" /></div>
            <span className="relative bg-card px-3 text-xs font-bold text-muted-foreground">أو تجربة الدفع السريع المباشر</span>
          </div>

          {/* Fast simulated form */}
          <form onSubmit={handleInlinePayment} className="space-y-4 text-right">
            <div>
              <label className="text-xs font-bold text-foreground block mb-1.5 flex items-center justify-between">
                <span>رقم البطاقة (تجريبي)</span>
                <span className="text-[11px] text-muted-foreground font-mono">KNET • VISA • Mastercard</span>
              </label>
              <div className="relative flex items-center">
                <Input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  className="h-11 rounded-xl bg-background border-border text-left font-mono tracking-wider pl-11"
                  dir="ltr"
                  required
                />
                <CreditCard className="absolute left-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">تاريخ الانتهاء</label>
                <Input
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  className="h-11 rounded-xl bg-background border-border text-center font-mono"
                  dir="ltr"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground block mb-1.5">رمز CVC</label>
                <Input
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value)}
                  placeholder="888"
                  maxLength={4}
                  className="h-11 rounded-xl bg-background border-border text-center font-mono"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isProcessing}
              variant="outline"
              className="w-full h-12 text-sm font-bold rounded-2xl border-secondary/40 bg-secondary/10 hover:bg-secondary/20 text-foreground transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                <>
                  <Zap className="h-4 w-4 text-secondary" />
                  <span>تأكيد فوري وتفعيل باقة Pro التجريبية</span>
                </>
              )}
            </Button>
          </form>

          {/* Security Guarantee */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground pt-5 mt-4 border-t border-border/40">
            <span className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-secondary" />
              تشفير مصرفي آمن 256-bit
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-primary" />
              حساب ثراء معتمد
            </span>
          </div>

        </Card>
      </div>
    </div>
  );
}
