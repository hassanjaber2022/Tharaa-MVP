import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calculator, ShieldCheck, Target, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative overflow-hidden bg-background pt-20 pb-28 md:pt-28 md:pb-36">
        <div className="container relative z-10 mx-auto px-5 md:px-8 text-center max-w-5xl">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-card px-4 py-2 text-sm font-medium text-primary mb-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
            تخطيط مالي شخصي للشباب في الكويت
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-7 leading-[1.25] animate-in slide-in-from-bottom-6 fade-in duration-700 delay-100">
            قرار مالي أوضح يبدأ
            <span className="block text-primary mt-2">من أرقامك أنت</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-11 max-w-3xl mx-auto leading-relaxed animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
            رتّب دخلك والتزاماتك ومدخراتك بالدينار الكويتي، وشاهد مسارات مستقبلية توضيحية تساعدك على اختيار خطوة شهرية واقعية.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-700 delay-300">
            <Link href={isAuthenticated ? "/dashboard" : "/register"}>
              <Button size="lg" className="rounded-xl px-9 h-14 text-lg w-full sm:w-auto shadow-lg shadow-primary/15 transition-all hover:-translate-y-0.5" data-testid="button-hero-start">
                أنشئ خطتك الأولى
                <ArrowLeft className="ms-2 h-5 w-5" />
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link href="/login">
                <Button variant="outline" size="lg" className="rounded-xl px-9 h-14 text-lg w-full sm:w-auto border-border bg-card hover:bg-accent/50" data-testid="button-hero-login">
                  لدي حساب مسبقاً
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="py-24 bg-card/50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">ما الذي يقدمه لك ثراء؟</h2>
            <p className="text-muted-foreground text-lg">أدوات مباشرة لفهم وضعك، من دون مصطلحات معقدة أو وعود غير واقعية.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-background rounded-3xl p-8 shadow-sm border border-border/50 hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Calculator className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">حاسبة ذكية</h3>
              <p className="text-muted-foreground leading-relaxed">
                أدخل أرقامك مرة واحدة، ثم قارن سيناريوهات مستقبلية مبنية على مساهمتك الشهرية ومدتك.
              </p>
            </div>
            
            <div className="bg-background rounded-3xl p-8 shadow-sm border border-border/50 hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-6">
                <Target className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">أهداف مخصصة</h3>
              <p className="text-muted-foreground leading-relaxed">
                احفظ أكثر من خطة وقارن بينها كلما تغيّر دخلك أو هدفك أو المبلغ الذي تستطيع تخصيصه.
              </p>
            </div>
            
            <div className="bg-background rounded-3xl p-8 shadow-sm border border-border/50 hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">خطة أمان</h3>
              <p className="text-muted-foreground leading-relaxed">
                اعرف حجم الاحتياط المناسب بناءً على مصاريفك والتزاماتك، وتابع تقدّمك بصورة بسيطة.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-24 bg-primary text-primary-foreground text-center relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 relative z-10">
          <TrendingUp className="h-16 w-16 mx-auto mb-6 text-primary-foreground/80" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6 max-w-3xl mx-auto leading-tight">
            خطة توضيحية تساعدك على التفكير، لا وعد بنتيجة
          </h2>
          <p className="text-primary-foreground/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            النتائج تقديرية وتتغير بحسب افتراضات العائد والتضخم والرسوم. أنت تختار ما يناسب ظروفك وتستطيع تعديل خطتك متى شئت.
          </p>
          <Link href={isAuthenticated ? "/dashboard" : "/register"}>
            <Button size="lg" variant="secondary" className="rounded-xl px-10 h-14 text-lg text-primary font-bold shadow-xl transition-all hover:-translate-y-0.5">
              ابدأ بأرقامك
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
