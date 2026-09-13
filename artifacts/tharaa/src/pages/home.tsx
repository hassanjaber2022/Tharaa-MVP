import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Target, 
  TrendingUp, 
  Coins, 
  Coffee, 
  CheckCircle2, 
  Award,
  Zap,
  BarChart3,
  Lock
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { formatCurrency } from '@/lib/utils';

export default function Home() {
  const { isAuthenticated } = useAuth();
  
  // Interactive Daily Habit Wealth Multiplier state
  const [dailySavings, setDailySavings] = useState(3); // 3 KWD/day default

  // Compounding math: PMT * (((1 + r)^n - 1) / r)
  // Monthly contribution = dailySavings * 30.4
  const monthlyCont = dailySavings * 30.4;
  const annualReturn = 0.08; // 8% expected halal balanced portfolio return
  const monthlyRate = annualReturn / 12;

  const calculateFutureValue = (years: number) => {
    const months = years * 12;
    const fv = monthlyCont * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    return Math.round(fv);
  };

  const val10Years = calculateFutureValue(10);
  const val20Years = calculateFutureValue(20);
  const rawSaved20Years = Math.round(monthlyCont * 12 * 20);

  return (
    <div className="flex flex-col min-h-screen bg-pattern overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="container relative z-10 mx-auto px-4 md:px-8 text-center max-w-5xl">
          
          {/* Tag Badge */}
          <div className="inline-flex items-center gap-2.5 rounded-full gold-badge px-5 py-2 text-xs font-bold mb-8 shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Sparkles className="h-4 w-4 text-secondary" />
            <span>المنصة الأولى للتخطيط المالي والحرية الاستثمارية في الخليج</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-extrabold text-foreground mb-8 leading-[1.2] tracking-tight">
            استقلالك المالي يبدأ
            <span className="block text-primary mt-2">من أرقامك الحقيقية اليوم</span>
          </h1>

          <p className="text-lg md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
            رتّب دخلك ومصاريفك، اكتشف <strong className="text-foreground">سن تقاعدك المبكر</strong>، وشاهد كيف تتضاعف مدخراتك الصغيرة إلى ثروة متوافقة مع الشريعة الإسلامية.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
            <Link href={isAuthenticated ? "/onboarding" : "/register"} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto rounded-2xl px-8 h-16 text-base sm:text-lg font-bold bg-primary text-white hover:bg-primary/90 shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95">
                احسب خطتك في دقيقة 🌿
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </Link>

            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => window.dispatchEvent(new Event('tharaa_open_tour'))}
              className="w-full sm:w-auto rounded-2xl px-6 h-16 text-base font-bold border-secondary/40 bg-secondary/10 hover:bg-secondary/20 text-foreground transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-105"
            >
              <Sparkles className="h-5 w-5 text-secondary" />
              <span>جولة تفاعلية تشرح الموقع ✨</span>
            </Button>

            {!isAuthenticated && (
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="ghost" size="lg" className="w-full sm:w-auto rounded-2xl px-6 h-16 text-base font-bold border border-border/80 bg-card/60 hover:bg-muted transition-all">
                  دخول
                </Button>
              </Link>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-bold text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-secondary" />
              تسجيل سريع برقم الهاتف (OTP)
            </span>
            <span className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              أصول استثمارية متوافقة مع الشريعة
            </span>
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-secondary" />
              تشفير مصرفي آمن 256-bit
            </span>
          </div>
        </div>
      </section>

      {/* 2. THE DAILY HABIT WEALTH MULTIPLIER (FEATURE HIGHLIGHT) */}
      <section className="py-20 bg-muted/30 border-y border-border/50 relative">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/15 text-secondary text-xs font-bold mb-3">
              <Coins className="h-3.5 w-3.5" />
              محاكي أثر المصاريف اليومية
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              ماذا لو حوّلت كوب قهوة يومي إلى استثمار؟
            </h2>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto mt-2">
              حرك المؤشر لترى كيف تصنع العوائد المركبة فارقاً هائلاً على المدى الطويل
            </p>
          </div>

          <div className="luxury-glass p-8 md:p-12 rounded-[2.5rem] border-secondary/30 relative">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              
              {/* Controls */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-foreground font-bold text-lg">
                    <Coffee className="h-5 w-5 text-secondary" />
                    <span>مبلغ التوفير اليومي:</span>
                  </div>
                  <span className="text-3xl font-display font-extrabold text-primary tabular-numbers">
                    {formatCurrency(dailySavings)} / يوم
                  </span>
                </div>

                <div className="py-4">
                  <Slider
                    value={[dailySavings]}
                    min={1}
                    max={15}
                    step={0.5}
                    onValueChange={(val) => setDailySavings(val[0])}
                    className="py-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground font-mono mt-2">
                    <span>1 د.ك (قهوة بسيطة)</span>
                    <span>7.5 د.ك (وجبة غداء)</span>
                    <span>15 د.ك (عشاء ومقهى)</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-background/80 border border-border/60 text-sm">
                  <span className="text-muted-foreground block mb-1">المساهمة الشهرية التقديرية:</span>
                  <strong className="text-xl font-display font-bold text-foreground">
                    {formatCurrency(Math.round(monthlyCont))} شهرياً
                  </strong>
                </div>
              </div>

              {/* Compounding Results Cards */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-background/90 border border-border/80 shadow-md">
                  <span className="text-xs font-bold text-muted-foreground block mb-1">بعد 10 سنوات</span>
                  <div className="text-2xl sm:text-3xl font-display font-extrabold text-foreground tabular-numbers mb-2">
                    {formatCurrency(val10Years)}
                  </div>
                  <span className="text-[11px] text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-full inline-block">
                    نمو مركب بـ 8% سنوياً
                  </span>
                </div>

                <div className="p-6 rounded-3xl emerald-gradient text-white border border-secondary/40 shadow-xl relative overflow-hidden">
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-secondary/20 rounded-full blur-xl pointer-events-none" />
                  <span className="text-xs font-bold text-secondary block mb-1">بعد 20 سنة ✨</span>
                  <div className="text-3xl sm:text-4xl font-display font-extrabold text-white tabular-numbers mb-2">
                    {formatCurrency(val20Years)}
                  </div>
                  <span className="text-[11px] text-white/80 block">
                    (أصل مدخراتك: {formatCurrency(rawSaved20Years)})
                  </span>
                </div>
              </div>

            </div>

            <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-muted-foreground font-medium">
                * الحسابات تقديرية مبنية على معدل نمو مركب سنوي بنسبة 8% بافتراض إعادة استثمار التوزيعات.
              </span>
              <Link href="/calculator">
                <Button size="sm" className="rounded-xl px-6 h-10 font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  خصص خطتك بالتفصيل
                  <ArrowLeft className="mr-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHARIA HALAL ASSET ALLOCATION PREVIEW */}
      <section className="py-24">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              حوكمة استثمارية نقية
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
              استثمار متوافق 100% مع الشريعة
            </h2>
            <p className="text-muted-foreground text-base md:text-lg mt-3 leading-relaxed">
              نوجهك لبناء محافظ متزنة تجمع بين الاستقرار والنمو، خالية من الفوائد الربوية ومبنية على أصول إنتاجية حقيقية.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="luxury-glass p-8 rounded-3xl border-border/70 hover:border-primary/40 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl mb-6 group-hover:scale-110 transition-transform">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">صكوك سيادية ومؤسسية</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                أداة دخل دوري شبه ثابتة تحل محل السندات التقليدية بضمان أصول ملموسة وعوائد متوقعة منتظمة.
              </p>
            </div>

            <div className="luxury-glass p-8 rounded-3xl border-secondary/30 hover:border-secondary/60 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center font-bold text-xl mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">أسهم عالمية نقية</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                شركات عالمية وخليجية مفروزة بدقة وفق معايير هيئة المحاسبة والمراجعة للمؤسسات المالية الإسلامية (AAOIFI).
              </p>
            </div>

            <div className="luxury-glass p-8 rounded-3xl border-border/70 hover:border-primary/40 transition-all group">
              <div className="h-12 w-12 rounded-2xl bg-accent/15 text-accent-foreground flex items-center justify-center font-bold text-xl mb-6 group-hover:scale-110 transition-transform">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">صناديق ريت العقارية</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                استثمار غير مباشر في عقارات مدرة للدخل توزع أرباحاً إيجارية حقيقية دون عناء الإدارة الفردية.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FINAL CTA */}
      <section className="py-20 pb-32">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <div className="emerald-gradient text-white rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl border border-secondary/30">
            <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
            <h2 className="text-3xl md:text-5xl font-display font-extrabold mb-6 leading-tight">
              أول خطوة تبدأ بأرقامك أنت
            </h2>
            <p className="text-white/80 text-base md:text-xl max-w-xl mx-auto mb-10 leading-relaxed">
              انضم إلى آلاف المستثمرين الذين صمموا خريطة طريق واضحة لاستقلالهم المالي وراحة بالهم.
            </p>
            <Link href={isAuthenticated ? "/dashboard" : "/register"}>
              <Button size="lg" className="rounded-2xl px-12 h-16 text-lg font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-2xl transition-all hover:scale-105">
                أنشئ خطتك المالية الآن
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
