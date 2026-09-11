import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator, ShieldCheck, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-24 pb-32 md:pt-32 md:pb-40">
        <div className="absolute inset-0 bg-primary/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
        <div className="container relative z-10 mx-auto px-4 md:px-8 text-center max-w-4xl">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary mb-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <span className="flex h-2 w-2 rounded-full bg-primary me-2"></span>
            مستقبلك المالي يبدأ بخطة
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-[1.2] md:leading-[1.2] animate-in slide-in-from-bottom-6 fade-in duration-700 delay-100">
            خطط لثروتك بذكاء <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-secondary">
              وبدون تعقيد
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
            ثراء يساعدك على بناء خطة مالية شخصية تناسب أهدافك وعمرك، لتصل إلى الحرية المالية بخطوات واضحة ومدروسة.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-300">
            <Link href={isAuthenticated ? "/dashboard" : "/register"}>
              <Button size="lg" className="rounded-full px-8 h-14 text-lg w-full sm:w-auto shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1">
                ابدأ رحلتك الآن
                <ArrowLeft className="ms-2 h-5 w-5" />
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link href="/login">
                <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg w-full sm:w-auto border-border hover:bg-accent/50">
                  لدي حساب مسبقاً
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">ليش ثراء؟</h2>
            <p className="text-muted-foreground text-lg">بنينا ثراء ليكون مساحتك الشخصية الهادئة بعيداً عن زحمة الأرقام المعقدة</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-background rounded-3xl p-8 shadow-sm border border-border/50 hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Calculator className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">حاسبة ذكية</h3>
              <p className="text-muted-foreground leading-relaxed">
                حلل وضعك الحالي وتعرف على السيناريوهات المستقبلية لنمو ثروتك بناءً على معطياتك الخاصة.
              </p>
            </div>
            
            <div className="bg-background rounded-3xl p-8 shadow-sm border border-border/50 hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-6">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">أهداف مخصصة</h3>
              <p className="text-muted-foreground leading-relaxed">
                حدد أهدافك المستقبلية وسنساعدك في بناء خطة للوصول إليها بخطوات واقعية يمكن تحقيقها.
              </p>
            </div>
            
            <div className="bg-background rounded-3xl p-8 shadow-sm border border-border/50 hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">خطة أمان</h3>
              <p className="text-muted-foreground leading-relaxed">
                نبني لك صندوق طوارئ يتناسب مع التزاماتك ومصاريفك الشهرية لتكون دائماً في أمان.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Social Proof / Trust */}
      <section className="py-24 bg-primary text-primary-foreground text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <TrendingUp className="h-16 w-16 mx-auto mb-6 text-primary-foreground/80" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6 max-w-3xl mx-auto leading-tight">
            استثمر في مستقبلك اليوم، الغد قد يكون متأخراً
          </h2>
          <p className="text-primary-foreground/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            التخطيط المالي المبكر هو المفتاح الحقيقي للحرية المالية. انضم لآلاف الشباب الذين بدأوا بتخطيط مستقبلهم مع ثراء.
          </p>
          <Link href={isAuthenticated ? "/dashboard" : "/register"}>
            <Button size="lg" variant="secondary" className="rounded-full px-10 h-14 text-lg text-primary font-bold shadow-xl hover:shadow-2xl transition-all hover:scale-105">
              ابدأ الآن مجاناً
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
