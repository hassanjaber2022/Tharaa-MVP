import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Calculator as CalcIcon, 
  TrendingUp, 
  ShieldCheck, 
  Save, 
  Sparkles, 
  Award, 
  ChevronRight,
  Info,
  Layers,
  Clock,
  AlertTriangle,
  Crown,
  ExternalLink
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { getUserProfile, evaluateReturnYield } from '@/lib/user-profile';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function Calculator() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const userProfile = getUserProfile();

  // Inputs initialized from actual user profile
  const [currentAge, setCurrentAge] = useState(userProfile.currentAge || 28);
  const [targetAge, setTargetAge] = useState(userProfile.targetAge || 55);
  const [initialBalance, setInitialBalance] = useState(userProfile.currentSavings || 8000);
  const [monthlyContribution, setMonthlyContribution] = useState(userProfile.monthlyCapacity || 500);
  const [annualStepUp, setAnnualStepUp] = useState(3); // 3% step up per year
  const [activeScenario, setActiveScenario] = useState<'conservative' | 'balanced' | 'growth'>(userProfile.riskCategory || 'balanced');
  const [showRealValue, setShowRealValue] = useState(true); // inflation adjusted

  // Return rates per scenario
  const scenarioRates = {
    conservative: { rate: 0.055, name: 'متحفظ (صكوك)', desc: 'عوائد دورية شبه ثابتة بأقل تذبذب' },
    balanced: { rate: 0.085, name: 'متوازن (أسهم وصكوك)', desc: 'توازن مثالي بين النمو والاستقرار' },
    growth: { rate: 0.115, name: 'نمو عالي (أسهم نقية)', desc: 'أعلى إمكانات لمضاعفة رأس المال' },
  };

  const inflationRate = 0.025; // 2.5% inflation

  // Dynamic Yield Evaluation based on current inputs
  const yieldEvaluation = useMemo(() => {
    return evaluateReturnYield({
      monthlyIncome: userProfile.monthlyIncome || 1500,
      monthlySavings: monthlyContribution,
      annualExpenses: ((userProfile.essentialExpenses || 500) + (userProfile.obligations || 300)) * 12,
      currentSavings: initialBalance,
      yearsRemaining: Math.max(1, targetAge - currentAge),
      riskCategory: activeScenario,
    });
  }, [userProfile, monthlyContribution, initialBalance, targetAge, currentAge, activeScenario]);

  // Generate Year-by-Year compounding data
  const projection = useMemo(() => {
    const years = Math.max(1, targetAge - currentAge);
    const nominalRate = scenarioRates[activeScenario].rate;
    const realRate = (1 + nominalRate) / (1 + inflationRate) - 1;

    let nominalBal = initialBalance;
    let realBal = initialBalance;
    let totalInvested = initialBalance;
    let currentMonthly = monthlyContribution;

    const yearlyData = [];

    yearlyData.push({
      year: 0,
      age: currentAge,
      nominal: Math.round(nominalBal),
      real: Math.round(realBal),
      invested: Math.round(totalInvested),
    });

    for (let y = 1; y <= years; y++) {
      // 12 months compounding
      for (let m = 0; m < 12; m++) {
        nominalBal = nominalBal * (1 + nominalRate / 12) + currentMonthly;
        realBal = realBal * (1 + realRate / 12) + currentMonthly;
        totalInvested += currentMonthly;
      }
      // Annual step up
      currentMonthly = currentMonthly * (1 + annualStepUp / 100);

      yearlyData.push({
        year: y,
        age: currentAge + y,
        nominal: Math.round(nominalBal),
        real: Math.round(realBal),
        invested: Math.round(totalInvested),
      });
    }

    const finalNominal = Math.round(nominalBal);
    const finalReal = Math.round(realBal);
    const finalMonthlyIncome = Math.round((finalReal * 0.04) / 12); // Safe 4% rule

    return {
      yearlyData,
      finalNominal,
      finalReal,
      totalInvested: Math.round(totalInvested),
      finalMonthlyIncome,
      years,
    };
  }, [currentAge, targetAge, initialBalance, monthlyContribution, annualStepUp, activeScenario]);

  const handleSavePlan = () => {
    try {
      const existingPlans = JSON.parse(localStorage.getItem('tharaa_saved_plans') || '[]');
      const newPlan = {
        id: 'plan_' + Date.now(),
        title: `خطة نمو ${scenarioRates[activeScenario].name} - ${projection.years} سنة`,
        scenario: activeScenario,
        targetAge,
        currentAge,
        initialBalance,
        monthlyContribution,
        estimatedValue: projection.finalNominal,
        estimatedRealValue: projection.finalReal,
        estimatedMonthlyIncome: projection.finalMonthlyIncome,
        createdAt: new Date().toISOString(),
        status: 'active',
      };
      existingPlans.unshift(newPlan);
      localStorage.setItem('tharaa_saved_plans', JSON.stringify(existingPlans));

      toast({
        title: 'تم حفظ الخطة بنجاح 🌟',
        description: 'يمكنك مراجعتها وتعديلها متى شئت من قائمة "خططي"',
      });
      setLocation('/plans');
    } catch {
      toast({ variant: 'destructive', title: 'خطأ', description: 'تعذر حفظ الخطة' });
    }
  };

  return (
    <div className="container max-w-screen-xl mx-auto py-8 md:py-12 px-4 pb-32">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
            <Sparkles className="h-3.5 w-3.5 text-secondary" />
            <span>حاسبة الاستثمار المركب والحرية المالية</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-foreground">
            الحاسبة الذكية لمستقبلك المالي
          </h1>
          <p className="text-muted-foreground text-base md:text-lg font-medium mt-1">
            قارن أثر مساهمتك الشهرية وسيناريوهات النمو بالأرقام الواقعية
          </p>
        </div>

        <Button
          onClick={handleSavePlan}
          className="rounded-2xl h-13 px-8 text-base font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-xl shadow-secondary/20 flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          <span>حفظ هذه الخطة</span>
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="luxury-glass p-6 sm:p-8 rounded-[2rem] border-border/70 shadow-lg space-y-6">
            
            {/* Scenarios Switcher */}
            <div>
              <label className="text-sm font-bold text-foreground block mb-3">
                نمط المحفظة الاستثمارية
              </label>
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-muted/60 border border-border/60">
                {(['conservative', 'balanced', 'growth'] as const).map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => setActiveScenario(sc)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all text-center ${
                      activeScenario === sc
                        ? 'bg-card text-foreground shadow-sm ring-1 ring-border/80'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {sc === 'conservative' ? 'متحفظ 5.5%' : sc === 'balanced' ? 'متوازن 8.5%' : 'نمو 11.5%'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-secondary" />
                {scenarioRates[activeScenario].desc}
              </p>
            </div>

            {/* Ages */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">العمر الحالي</label>
                <Input
                  type="number"
                  value={currentAge}
                  min={18}
                  max={80}
                  onChange={(e) => setCurrentAge(Number(e.target.value))}
                  className="h-12 rounded-xl text-center font-bold font-mono text-base"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">سن التقاعد المستهدف</label>
                <Input
                  type="number"
                  value={targetAge}
                  min={currentAge + 1}
                  max={95}
                  onChange={(e) => setTargetAge(Number(e.target.value))}
                  className="h-12 rounded-xl text-center font-bold font-mono text-base text-primary"
                />
              </div>
            </div>

            {/* Monthly Contribution with Slider */}
            <div className="space-y-3 pt-2 border-t border-border/40">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-foreground">المساهمة الشهرية</label>
                <span className="text-xl font-display font-extrabold text-primary tabular-numbers">
                  {formatCurrency(monthlyContribution)}
                </span>
              </div>
              <Slider
                value={[monthlyContribution]}
                min={50}
                max={2500}
                step={25}
                onValueChange={(val) => setMonthlyContribution(val[0])}
                className="py-2"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                <span>50 د.ك</span>
                <span>1,250 د.ك</span>
                <span>2,500 د.ك</span>
              </div>
            </div>

            {/* Initial Investment */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <label className="text-sm font-bold text-foreground">الرصيد الابتدائي الحالي</label>
              <Input
                type="number"
                value={initialBalance}
                step={500}
                min={0}
                onChange={(e) => setInitialBalance(Number(e.target.value))}
                className="h-12 rounded-xl font-bold font-mono text-base"
              />
            </div>

            {/* Annual Step Up */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <div className="flex justify-between items-center text-sm">
                <label className="font-bold text-foreground">زيادة سنوية للمساهمة (مع العلاوة)</label>
                <span className="font-mono font-bold text-secondary">{annualStepUp}% سنوياً</span>
              </div>
              <Slider
                value={[annualStepUp]}
                min={0}
                max={10}
                step={1}
                onValueChange={(val) => setAnnualStepUp(val[0])}
              />
            </div>

          </Card>
        </div>

        {/* Results & Interactive Chart Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Dynamic Smart AI Return Yield Advisory Banner */}
          <div className={`p-5 rounded-2xl border transition-all ${
            yieldEvaluation.status === 'weak'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-200'
              : yieldEvaluation.status === 'moderate'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  yieldEvaluation.status === 'weak'
                    ? 'bg-rose-500/20 text-rose-600'
                    : yieldEvaluation.status === 'moderate'
                    ? 'bg-amber-500/20 text-amber-600'
                    : 'bg-emerald-500/20 text-emerald-600'
                }`}>
                  {yieldEvaluation.status === 'weak' ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : yieldEvaluation.status === 'moderate' ? (
                    <Info className="h-5 w-5" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-background/60">
                      مستشار المردود الذكي 🤖
                    </span>
                    <strong className="text-sm font-bold">
                      {yieldEvaluation.title}
                    </strong>
                  </div>
                  <p className="text-xs font-medium leading-relaxed opacity-90">
                    {yieldEvaluation.warningMessage}
                  </p>
                  {yieldEvaluation.optimizationTip && (
                    <p className="text-[11px] font-bold text-foreground mt-1.5 bg-background/50 p-2 rounded-lg border border-border/40 inline-block">
                      {yieldEvaluation.optimizationTip}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="button"
                onClick={() => {
                  const directLink = localStorage.getItem('tharaa_stripe_payment_link') || 'https://buy.stripe.com/test_4gM7sK0El18wcsV7pP3Ru00';
                  window.open(directLink, '_blank', 'noopener,noreferrer');
                }}
                size="sm"
                className="shrink-0 self-end sm:self-center rounded-xl font-bold text-xs h-9 bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Crown className="h-3.5 w-3.5" />
                <span>ترقية Pro عبر Stripe</span>
                <ExternalLink className="h-3 w-3 mr-0.5" />
              </Button>
            </div>
          </div>

          {/* Key Metric Highlights */}
          <div className="grid sm:grid-cols-3 gap-4">
            
            <div className="luxury-glass p-6 rounded-3xl border-primary/20 bg-primary/5 text-center">
              <span className="text-xs font-bold text-muted-foreground block mb-1">
                القيمة الاسمية المتوقعة
              </span>
              <div className="text-2xl sm:text-3xl font-display font-extrabold text-primary tabular-numbers">
                {formatCurrency(projection.finalNominal)}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                في سن {targetAge} ({projection.years} سنة)
              </span>
            </div>

            <div className="luxury-glass p-6 rounded-3xl border-secondary/30 text-center">
              <span className="text-xs font-bold text-secondary block mb-1">
                القوة الشرائية الحقيقية
              </span>
              <div className="text-2xl sm:text-3xl font-display font-extrabold text-foreground tabular-numbers">
                {formatCurrency(projection.finalReal)}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                بعد حسم التضخم (2.5%)
              </span>
            </div>

            <div className="luxury-glass p-6 rounded-3xl border-border text-center">
              <span className="text-xs font-bold text-muted-foreground block mb-1">
                دخل تقاعدي شهري مستدام
              </span>
              <div className="text-2xl sm:text-3xl font-display font-extrabold text-secondary tabular-numbers">
                {formatCurrency(projection.finalMonthlyIncome)}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 block">
                بقاعدة السحب الآمن (4%)
              </span>
            </div>

          </div>

          {/* Interactive Compounding Chart */}
          <Card className="luxury-glass p-6 sm:p-8 rounded-[2.5rem] border-border/70 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-display font-bold text-foreground">
                  مسار نمو الثروة التراكمي
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  مقارنة بين إجمالي مدخراتك الذاتية والقيمة الناتجة مع الاستثمار
                </p>
              </div>

              {/* Real vs Nominal toggle */}
              <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowRealValue(true)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    showRealValue ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  بالقوة الشرائية
                </button>
                <button
                  type="button"
                  onClick={() => setShowRealValue(false)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    !showRealValue ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
                >
                  الرقم الاسمي
                </button>
              </div>
            </div>

            {/* Recharts Area */}
            <div className="h-72 w-full dir-ltr" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projection.yearlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#CCA048" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#CCA048" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(150,150,150,0.15)" />
                  <XAxis
                    dataKey="age"
                    tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 11 }}
                    tickFormatter={(age) => `${age} سنة`}
                  />
                  <YAxis
                    tick={{ fill: 'currentColor', opacity: 0.6, fontSize: 11 }}
                    tickFormatter={(val) => `${Math.round(val / 1000)}k`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="p-3 bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-xl text-xs font-sans text-right" dir="rtl">
                          <strong className="block text-foreground mb-1">السن: {d.age} سنة</strong>
                          <span className="text-primary block font-bold">
                            قيمة الثروة: {formatCurrency(showRealValue ? d.real : d.nominal)}
                          </span>
                          <span className="text-secondary block font-bold">
                            إجمالي مدخراتك: {formatCurrency(d.invested)}
                          </span>
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={showRealValue ? 'real' : 'nominal'}
                    stroke="#10B981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorWealth)"
                  />
                  <Area
                    type="monotone"
                    dataKey="invested"
                    stroke="#CCA048"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#colorInvested)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground mt-4 pt-4 border-t border-border/40 font-medium">
              <span className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                مسار نمو الثروة بالمركب
              </span>
              <span className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-secondary" />
                أصل مدخراتك المتراكمة ({formatCurrency(projection.totalInvested)})
              </span>
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
}
