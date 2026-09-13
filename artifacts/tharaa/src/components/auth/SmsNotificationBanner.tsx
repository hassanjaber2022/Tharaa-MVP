import React, { useEffect, useState } from 'react';
import { authService, SmsMessageEvent } from '@/lib/auth-service';
import { MessageSquare, Copy, Check, X, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SmsNotificationBanner({ onAutofill }: { onAutofill?: (code: string) => void }) {
  const [activeSms, setActiveSms] = useState<SmsMessageEvent | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = authService.onSmsReceived((event) => {
      setActiveSms(event);
      setCopied(false);
      
      // Auto-hide after 18 seconds if not clicked
      const timer = setTimeout(() => {
        setActiveSms((current) => (current?.timestamp === event.timestamp ? null : current));
      }, 18000);
      return () => clearTimeout(timer);
    });

    return unsubscribe;
  }, []);

  if (!activeSms) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(activeSms.code);
    setCopied(true);
    if (onAutofill) {
      onAutofill(activeSms.code);
    }
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-md animate-in slide-in-from-top-6 duration-400 ease-out">
      <div className="luxury-glass p-4 rounded-3xl border-secondary/40 shadow-2xl bg-card/95 backdrop-blur-2xl ring-1 ring-secondary/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-secondary uppercase tracking-wider">رسالة نصية SMS</span>
                <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">الآن</span>
              </div>
              <h4 className="text-sm font-bold text-foreground">من: Tharaa (ثراء المالي)</h4>
            </div>
          </div>
          <button
            onClick={() => setActiveSms(null)}
            className="text-muted-foreground hover:text-foreground rounded-full p-1 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 bg-muted/60 dark:bg-muted/40 p-3.5 rounded-2xl border border-border/50">
          <p className="text-xs text-muted-foreground mb-1.5">
            إلى الهاتف: <span className="font-mono font-bold text-foreground" dir="ltr">{activeSms.phone}</span>
          </p>
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm text-foreground leading-relaxed">
              رمز التحقق الخاص بك هو:{' '}
              <strong className="text-lg font-mono font-extrabold tracking-widest text-primary px-2 py-0.5 bg-background rounded-lg border border-primary/20">
                {activeSms.code}
              </strong>
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <ShieldAlert className="h-3 w-3 text-secondary" />
            صالح لمدة 5 دقائق. لا تشارك هذا الرمز مع أي شخص.
          </p>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleCopy}
            className="flex-1 rounded-xl h-9 text-xs font-bold bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 ml-1.5 text-secondary" />
                تم النسخ والتعبئة
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 ml-1.5" />
                نسخ وتعبئة الرمز تلقائياً
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setActiveSms(null)}
            className="rounded-xl h-9 text-xs text-muted-foreground hover:text-foreground"
          >
            إغلاق
          </Button>
        </div>
      </div>
    </div>
  );
}
