import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { 
  Sparkles, 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Target, 
  ShieldCheck, 
  TrendingUp, 
  PieChart, 
  CheckCircle2, 
  Flame, 
  Award, 
  Coins, 
  Compass, 
  Lock,
  Zap,
  Play,
  HelpCircle,
  Coffee
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function WelcomeInteractiveTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Interactive Live Playground states inside the Tour
  const [monthlySimSavings, setMonthlySimSavings] = useState(250);
  const annualReturnRate = 0.085; // 8.5% Sharia balanced return

  // Calculate compounding numbers live
  const calculateCompoundGrowth = (monthly: number, years: number) => {
    const r = annualReturnRate / 12;
    const n = years * 12;
    return Math.round(monthly * ((Math.pow(1 + r, n) - 1) / r));
  };

  const sim10Years = calculateCompoundGrowth(monthlySimSavings, 10);
  const sim20Years = calculateCompoundGrowth(monthlySimSavings, 20);
  const rawSavings20 = monthlySimSavings * 12 * 20;

  useEffect(() => {
    // Check if user has seen the interactive tour on this device
    const hasSeenTour = localStorage.getItem('tharaa_welcome_tour_seen');
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Listen for custom event to reopen tour from anywhere
    const handleOpenTour = () => {
      setStep(1);
      setIsOpen(true);
    };
    window.addEventListener('tharaa_open_tour', handleOpenTour);
    return () => window.removeEventListener('tharaa_open_tour', handleOpenTour);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('tharaa_welcome_tour_seen', 'true');
  };

  const handleStartPlan = () => {
    handleClose();
  };

  if (!isOpen) {
    // Sleek floating trigger button on the bottom corner to reopen anytime
    return (
      <button
        onClick={() => {
          setStep(1);
          setIsOpen(true);
        }}
        className="fixed bottom-6 left-6 z-40 luxury-glass px-4 py-2.5 rounded-full border border-secondary/40 shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 text-xs font-bold text-foreground bg-background/90 group cursor-pointer backdrop-blur-md"
        title="اكتشف منصة ثراء في جولة تفاعلية"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary"></span>
        </span>
        <Sparkles className="h-4 w-4 text-secondary group-hover:rotate-12 transition-transform" />
        <span>جولة تفاعلية في ثراء ✨</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-300 font-sans">
      
      {/* Tour Modal Container */}
      <div className="relative w-full max-w-2xl bg-card text-foreground rounded-[2.5rem] border border-secondary/40 shadow-2xl overflow-hidden p-6 sm:p-10 transition-all text-right">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-secondary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 left-6 h-10 w-10 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all z-20 cursor-pointer"
          title="إغلاق الجولة"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Step Progress Dots & Indicator */}
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <button
                key={s}
                onClick={() => setStep(s as any)}
                className={`h-2.5 transition-all duration-300 rounded-full cursor-pointer ${
                  step === s 
                    ? 'w-8 bg-secondary' 
                    : step > s 
                    ? 'w-2.5 bg-primary' 
                    : 'w-2.5 bg-muted'
                }`}
                title={`الانتقال إلى الخطوة ${s}`}
              />
            ))}
          </div>

          <span className="text-xs font-mono font-bold text-secondary bg-secondary/15 px-3 py-1 rounded-full">
            المحطة {step} من 4
          </span>
        </div>

        {/* SLIDE 1: الترحيب وفلسفة ثراء */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 relative z-10">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-secondary/20 text-secondary border border-secondary/40 shadow-lg shadow-secondary/15 mb-2">
              <Sparkles className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-foreground mb-3 leading-tight">
                يا هلا ومسهلا فيك بـ ثـراء! 🌿
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                أول منصة رقمية ذكية في الخليج مصممة لمساعدتك على <strong className="text-foreground">تحقيق الحرية والاستقلال المالي (FIRE)</strong>، وتحويل مدخراتك الصغيرة إلى أصول متنامية متوافقة بالكامل مع الشريعة الإسلامية.
              </p>
            </div>

            {/* Quick 3 Pillars */}
            <div className="grid sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 text-right">
                <Target className="h-5 w-5 text-primary mb-2" />
                <strong className="text-xs font-bold text-foreground block mb-1">سن تقاعدك الحقيقي</strong>
                <span className="text-[11px] text-muted-foreground">احسب متى يمكنك التوقف عن العمل دون قلق.</span>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 text-right">
                <ShieldCheck className="h-5 w-5 text-secondary mb-2" />
                <strong className="text-xs font-bold text-foreground block mb-1">أصول شرعية (AAOIFI)</strong>
                <span className="text-[11px] text-muted-foreground">صكوك، أسهم نقية، وصناديق ريت عقارية.</span>
              </div>

              <div className="p-4 rounded-2xl bg-muted/40 border border-border/70 text-right">
                <Zap className="h-5 w-5 text-primary mb-2" />
                <strong className="text-xs font-bold text-foreground block mb-1">تنبيهات المردود الذكية</strong>
                <span className="text-[11px] text-muted-foreground">تنبيه فوري إذا كانت أرقامك لا تحقق أرباحاً كافية.</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/40">
              <button
                onClick={handleClose}
                className="text-xs text-muted-foreground hover:text-foreground font-bold"
              >
                تخطي الجولة
              </button>

              <Button
                onClick={() => setStep(2)}
                className="h-12 px-7 rounded-2xl font-bold bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/25 flex items-center gap-2 cursor-pointer"
              >
                <span>اكتشف كيف تحسب حريتك المالية</span>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* SLIDE 2: مقياس الحرية المالية (FIRE) */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 relative z-10">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary/20 text-primary border border-primary/30 shadow-lg mb-2">
              <Target className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-foreground mb-3 leading-tight">
                ما هو مقياس الحرية المالية (FIRE)؟ 🎯
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                الحرية المالية لا تعني امتلاك الملايين صدفة، بل الوصول لرأس مال استثماري تغطي عوائده السنوية كامل مصاريفك المعيشية للأبد بدون راتب وظيفي.
              </p>
            </div>

            {/* Interactive Equation Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-primary/10 via-secondary/10 to-card border border-secondary/30 shadow-md">
              <div className="text-center space-y-2">
                <span className="text-xs font-bold text-secondary block">معادلة السحب الآمن المعتمدة عالمياً (4% Rule)</span>
                <div className="text-xl sm:text-2xl font-display font-extrabold text-foreground font-mono">
                  مصاريفك السنوية × 25 = <span className="text-primary">رقم حريتك المالية</span>
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                  مثال: إذا كانت مصاريفك 800 د.ك شهرياً (9,600 د.ك سنوياً)، فرقم حريتك هو <strong>240,000 د.ك</strong>. بمجرد الوصول له، لن تحتاج لأي راتب!
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/40">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="h-12 px-5 rounded-2xl font-bold border-border"
              >
                <ArrowRight className="h-4 w-4 ml-1" />
                <span>السابق</span>
              </Button>

              <Button
                onClick={() => setStep(3)}
                className="h-12 px-7 rounded-2xl font-bold bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/25 flex items-center gap-2 cursor-pointer"
              >
                <span>التالي: الذكاء المالي والشرعية</span>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* SLIDE 3: الذكاء المالي والاستثمار الشرعي */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 relative z-10">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-secondary/20 text-secondary border border-secondary/40 shadow-lg mb-2">
              <ShieldCheck className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-foreground mb-3 leading-tight">
                استثمار شرعي معتمد (AAOIFI) وذكاء استباقي 🛡️
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                لا نعتمد على التخمين! نوزع استثماراتك في أصول حقيقية مفروزة شرعياً وفق ضوابط هيئة المحاسبة والمراجعة للمؤسسات المالية الإسلامية:
              </p>
            </div>

            {/* Asset Allocation Showcase */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 text-right">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-foreground">أسهم عالمية نقية</span>
                  <span className="text-xs font-mono font-bold text-primary">45%</span>
                </div>
                <span className="text-[11px] text-muted-foreground">شركات كبرى متوافقة مع الضوابط الشرعية.</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-card border border-border/80 text-right">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-foreground">صكوك سيادية ومؤسسية</span>
                  <span className="text-xs font-mono font-bold text-secondary">30%</span>
                </div>
                <span className="text-[11px] text-muted-foreground">دخل دوري شبه ثابت مع حفظ لرأس المال.</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-card border border-border/80 text-right">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-foreground">صناديق ريت العقارية</span>
                  <span className="text-xs font-mono font-bold text-emerald-600">15%</span>
                </div>
                <span className="text-[11px] text-muted-foreground">عوائد إيجارية دورية من عقارات مدرة.</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-card border border-border/80 text-right">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-foreground">تنبيهات المردود الذكية</span>
                  <span className="text-xs font-bold text-amber-500">ميزة AI 🤖</span>
                </div>
                <span className="text-[11px] text-muted-foreground">ينبهك فوراً إذا كان فائضك ضعيفاً لتعظيمه.</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/40">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="h-12 px-5 rounded-2xl font-bold border-border"
              >
                <ArrowRight className="h-4 w-4 ml-1" />
                <span>السابق</span>
              </Button>

              <Button
                onClick={() => setStep(4)}
                className="h-12 px-7 rounded-2xl font-bold bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/25 flex items-center gap-2 cursor-pointer"
              >
                <span>التالي: جرّب المحاكي التفاعلي بنفسك</span>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* SLIDE 4: المحاكي التفاعلي الحي المباشر (Hands-On Simulator) */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 relative z-10">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 shadow-lg mb-2">
              <Coins className="h-8 w-8" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-foreground mb-2 leading-tight">
                جرّب بنفسك الآن: قوة النماء التراكمي! 🚀
              </h2>
              <p className="text-muted-foreground text-xs sm:text-sm">
                حرّك المؤشر وشاهد كيف تتحول مساهمتك الشهرية إلى ثروة استثمارية ضخمة بمعدل نمو 8.5% سنوياً:
              </p>
            </div>

            {/* Interactive Slider Box */}
            <div className="p-5 rounded-3xl bg-muted/50 border border-border/80 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">مبلغ الاستثمار الشهري التقديري:</span>
                <span className="text-2xl font-mono font-extrabold text-primary bg-primary/10 px-4 py-1 rounded-xl">
                  {formatCurrency(monthlySimSavings)} / شهرياً
                </span>
              </div>

              <Slider
                value={[monthlySimSavings]}
                min={50}
                max={1500}
                step={25}
                onValueChange={(val) => setMonthlySimSavings(val[0])}
                className="py-2"
              />

              {/* Compounding Visual Results */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-2xl bg-card border border-border text-center">
                  <span className="text-xs text-muted-foreground font-bold block mb-1">بعد 10 سنوات</span>
                  <div className="text-xl sm:text-2xl font-display font-extrabold text-foreground font-mono">
                    {formatCurrency(sim10Years)}
                  </div>
                  <span className="text-[10px] text-primary font-bold mt-1 block">تتضاعف 1.9x مرة</span>
                </div>

                <div className="p-4 rounded-2xl bg-primary text-white border border-secondary/40 text-center shadow-lg relative overflow-hidden">
                  <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-secondary/20 rounded-full blur-xl pointer-events-none" />
                  <span className="text-xs text-secondary font-bold block mb-1">بعد 20 سنة ✨</span>
                  <div className="text-xl sm:text-2xl font-display font-extrabold text-white font-mono">
                    {formatCurrency(sim20Years)}
                  </div>
                  <span className="text-[10px] text-white/80 mt-1 block">أصل ادخارك: {formatCurrency(rawSavings20)}</span>
                </div>
              </div>
            </div>

            {/* Finish & Start Plan CTA */}
            <div className="space-y-3 pt-2">
              <Link href="/onboarding" onClick={handleStartPlan}>
                <Button className="w-full h-14 text-base font-black rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-2xl shadow-secondary/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer">
                  <Sparkles className="h-5 w-5" />
                  <span>ابدأ خطتك المالية الحقيقية في دقيقة (مجاناً) 🌿</span>
                </Button>
              </Link>

              <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
                <span>🔒 بياناتك خاصة ومحفوظة محلياً</span>
                <button
                  onClick={handleClose}
                  className="hover:text-foreground font-bold underline cursor-pointer"
                >
                  الدخول المباشر للوحة التحكم
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
