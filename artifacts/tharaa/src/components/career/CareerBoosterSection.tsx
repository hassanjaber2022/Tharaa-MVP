import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  ArrowUpRight, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  RefreshCw, 
  ExternalLink,
  DollarSign,
  ShieldCheck,
  Zap,
  Globe2
} from 'lucide-react';
import { 
  CAREER_FIELDS, 
  CareerField, 
  JobOpportunity, 
  fetchMatchingJobOpportunities,
  fetchLiveExchangeRates,
  CurrencyRates
} from '@/lib/career-api';
import { formatCurrency } from '@/lib/utils';

interface CareerBoosterSectionProps {
  initialCategory?: string;
  currentSavings?: number;
  currentMonthlySavings?: number;
  annualExpenses?: number;
  currentAge?: number;
  targetAge?: number;
  isCompact?: boolean;
}

export function CareerBoosterSection({
  initialCategory = 'software-development',
  currentSavings = 5000,
  currentMonthlySavings = 250,
  annualExpenses = 9600,
  currentAge = 32,
  targetAge = 50,
  isCompact = false,
}: CareerBoosterSectionProps) {
  const [selectedField, setSelectedField] = useState<string>(initialCategory);
  const [jobs, setJobs] = useState<JobOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [rates, setRates] = useState<CurrencyRates>({ USD: 1, KWD: 0.308, SAR: 3.75, AED: 3.67 });
  const [lastUpdated, setLastUpdated] = useState<string>('الآن');

  const loadJobs = async (category: string) => {
    setIsLoading(true);
    try {
      const [fetchedJobs, fetchedRates] = await Promise.all([
        fetchMatchingJobOpportunities({
          careerCategory: category,
          currentSavings,
          currentMonthlySavings,
          annualExpenses,
          currentAge,
          targetAge,
        }),
        fetchLiveExchangeRates(),
      ]);
      setJobs(fetchedJobs);
      setRates(fetchedRates);
      setLastUpdated(new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Error loading jobs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs(selectedField);
  }, [selectedField, currentSavings, currentMonthlySavings, annualExpenses, currentAge, targetAge]);

  return (
    <div className="space-y-6">
      {/* Header with 2-APIs Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl luxury-glass border border-secondary/35 bg-gradient-to-r from-card/80 via-primary/5 to-secondary/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Briefcase className="h-5 w-5" />
            </span>
            <h3 className="text-xl font-display font-extrabold text-foreground flex items-center gap-2">
              <span>مسرّع الدخل والتقاعد: شواغر حية لتخصصك</span>
              <span className="text-xs bg-secondary/20 text-secondary-foreground font-bold px-2.5 py-0.5 rounded-full border border-secondary/30">
                مربوط بـ 2 APIs ⚡
              </span>
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            نظام ذكي يربط شواغر العمل عن بُعد المعتمدة عالمياً (<span className="text-primary font-semibold">Remotive Job API</span>) بأسعار الصرف الحية (<span className="text-secondary font-semibold">Forex Exchange API</span>) لحساب أثر الدخل الإضافي على تسريع سن تقاعدك.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-muted-foreground block">سعر الصرف اللحظي:</span>
            <span className="text-xs font-mono font-bold text-foreground">
              $1 USD ≈ {rates.KWD.toFixed(3)} د.ك
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadJobs(selectedField)}
            disabled={isLoading}
            className="rounded-xl border-secondary/40 hover:bg-secondary/15 text-xs font-bold gap-1.5 h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
            <span>تحديث الفرص</span>
          </Button>
        </div>
      </div>

      {/* Field Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CAREER_FIELDS.map((field) => {
          const isActive = selectedField === field.apiCategory || selectedField === field.id;
          return (
            <button
              key={field.id}
              onClick={() => setSelectedField(field.apiCategory)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-[1.02]'
                  : 'bg-card/70 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-card/90'
              }`}
            >
              <span>{field.icon}</span>
              <span>{field.titleArabic}</span>
            </button>
          );
        })}
      </div>

      {/* Jobs Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4 py-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 rounded-3xl border border-border/40 luxury-glass animate-pulse space-y-4">
              <div className="h-5 bg-muted rounded-full w-2/3" />
              <div className="h-4 bg-muted/60 rounded-full w-1/2" />
              <div className="h-16 bg-muted/40 rounded-2xl" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="p-5 rounded-3xl border border-secondary/25 luxury-glass hover:border-secondary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Top Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-md">
                        {job.companyName}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Globe2 className="h-3 w-3 text-secondary" />
                        {job.location}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                      {job.title}
                    </h4>
                  </div>
                  <span className="px-2 py-1 rounded-xl bg-secondary/15 text-secondary-foreground text-[11px] font-bold border border-secondary/30 shrink-0">
                    دوام مرن / عن بُعد 🌍
                  </span>
                </div>

                {/* Salary & Live KWD Conversion */}
                <div className="p-3.5 rounded-2xl bg-card/90 border border-border/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">الدخل الشهري التقديري:</span>
                    <strong className="text-lg font-mono font-extrabold text-primary">
                      +{formatCurrency(job.monthlyIncomeKwd)}
                      <span className="text-xs font-normal text-muted-foreground mr-1">/ شهرياً</span>
                    </strong>
                  </div>
                  <div className="text-left font-mono">
                    <span className="text-[10px] text-muted-foreground block">القيمة بالدولار:</span>
                    <span className="text-xs font-bold text-secondary font-mono">
                      ~${job.monthlyIncomeUsd.toLocaleString()} USD
                    </span>
                  </div>
                </div>

                {/* Compound Financial Acceleration Card (The Killer Feature) */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-transparent border border-secondary/20 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-foreground">
                    <Zap className="h-4 w-4 text-secondary fill-secondary" />
                    <span>أثر هذا العمل الإضافي على خطتك المالية:</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-xl bg-card/60 border border-border/40">
                      <span className="text-[10px] text-muted-foreground block">اختصار سن التقاعد:</span>
                      <strong className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {job.yearsSavedToRetirement} سنوات أسرع 🚀
                      </strong>
                    </div>
                    <div className="p-2 rounded-xl bg-card/60 border border-border/40">
                      <span className="text-[10px] text-muted-foreground block">ثروتك الإضافية (10 سنين):</span>
                      <strong className="text-sm font-bold text-primary font-mono">
                        +{formatCurrency(job.extraWealth10Years)}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button: Apply Direct Link */}
              <div className="pt-4 border-t border-border/40 flex items-center justify-between mt-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {job.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="text-[10px] px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>

                <a
                  href={job.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 shadow-md shadow-primary/20 transition-all transform hover:scale-105"
                >
                  <span>التقديم على الشاغر</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Trust & Transparency Footnote */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground px-2">
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span>الشواغر يتم سحبها وفلترتها لحظياً عبر بروتوكولات التوظيف المفتوحة. التقديم يتم مباشرة لدى جهة العمل دون أي وسيط.</span>
        </span>
        <span className="font-mono text-secondary font-bold">آخر تحديث: {lastUpdated}</span>
      </div>
    </div>
  );
}
