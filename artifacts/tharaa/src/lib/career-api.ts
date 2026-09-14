// Career & Wealth Acceleration Service (Connecting Remotive Job API + ExchangeRate API)

export interface JobOpportunity {
  id: string | number;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  category: string;
  categoryArabic: string;
  location: string;
  rawSalary: string;
  monthlyIncomeUsd: number;
  monthlyIncomeKwd: number;
  monthlyIncomeSar: number;
  yearsSavedToRetirement: number;
  extraWealth10Years: number;
  extraWealth20Years: number;
  applicationUrl: string;
  tags: string[];
}

export interface CareerField {
  id: string;
  titleArabic: string;
  apiCategory: string;
  icon: string;
  description: string;
  averageMonthlyIncomeKwd: number;
}

export const CAREER_FIELDS: CareerField[] = [
  {
    id: 'tech',
    titleArabic: 'التقنية والبرمجة والذكاء الاصطناعي',
    apiCategory: 'software-development',
    icon: '💻',
    description: 'تطوير التطبيقات، هندسة البرمجيات، والحلول السحابية',
    averageMonthlyIncomeKwd: 450,
  },
  {
    id: 'finance',
    titleArabic: 'المالية والمحاسبة والاستثمار',
    apiCategory: 'finance',
    icon: '📊',
    description: 'التحليل المالي، التدقيق المحاسبي، وإدارة المخاطر',
    averageMonthlyIncomeKwd: 400,
  },
  {
    id: 'marketing',
    titleArabic: 'التسويق الرقمي وإدارة المحتوى',
    apiCategory: 'marketing',
    icon: '📣',
    description: 'إدارة الحملات الرقمية، صناعة المحتوى، وSEO',
    averageMonthlyIncomeKwd: 320,
  },
  {
    id: 'design',
    titleArabic: 'التصميم وتجربة المستخدم (UI/UX)',
    apiCategory: 'design',
    icon: '🎨',
    description: 'تصميم الواجهات، الهويات البصرية، والتصميم الجرافيكي',
    averageMonthlyIncomeKwd: 350,
  },
  {
    id: 'business',
    titleArabic: 'إدارة الأعمال وتطوير المبيعات',
    apiCategory: 'sales',
    icon: '🤝',
    description: 'إدارة الحسابات، المبيعات الاستراتيجية، وتوسيع الأسواق',
    averageMonthlyIncomeKwd: 380,
  },
  {
    id: 'consulting',
    titleArabic: 'الاستشارات والتدريب والترجمة',
    apiCategory: 'writing',
    icon: '📚',
    description: 'الاستشارات المتخصصة، التدريب التنفيذي، والترجمة والبحث',
    averageMonthlyIncomeKwd: 300,
  },
  {
    id: 'operations',
    titleArabic: 'العمليات والخدمات المساندة والعمل الحر',
    apiCategory: 'all-others',
    icon: '⚡',
    description: 'إدارة العمليات، الدعم المتخصص، والمشاريع المرنة',
    averageMonthlyIncomeKwd: 280,
  },
];

// Fallback jobs database in case of network throttle or offline testing
const FALLBACK_JOBS: Record<string, Partial<JobOpportunity>[]> = {
  'software-development': [
    {
      id: 'dev_1',
      title: 'Full-Stack Software Consultant (Remote)',
      companyName: 'Apex Cloud Solutions',
      location: 'Worldwide Remote',
      rawSalary: '$40k - $65k / year',
      monthlyIncomeUsd: 1200,
      applicationUrl: 'https://remotive.com/remote-jobs/software-development',
      tags: ['React', 'TypeScript', 'Node.js'],
    },
    {
      id: 'dev_2',
      title: 'AI Prompt Engineer & Evaluator',
      companyName: 'DataSynth AI',
      location: 'Middle East & Global',
      rawSalary: '$35 - $50 / hour',
      monthlyIncomeUsd: 1500,
      applicationUrl: 'https://remotive.com/remote-jobs/software-development',
      tags: ['AI Models', 'Python', 'Evaluation'],
    },
    {
      id: 'dev_3',
      title: 'Part-Time Backend API Architect',
      companyName: 'FinFlow Global',
      location: 'Remote GCC',
      rawSalary: '$30,000 / year',
      monthlyIncomeUsd: 950,
      applicationUrl: 'https://remotive.com/remote-jobs/software-development',
      tags: ['PostgreSQL', 'APIs', 'Security'],
    },
  ],
  finance: [
    {
      id: 'fin_1',
      title: 'Sharia Financial Analyst & Advisor',
      companyName: 'Noor Capital Advisory',
      location: 'GCC Remote',
      rawSalary: '$35k - $55k',
      monthlyIncomeUsd: 1300,
      applicationUrl: 'https://remotive.com/remote-jobs/finance',
      tags: ['AAOIFI', 'Valuation', 'Sukuk'],
    },
    {
      id: 'fin_2',
      title: 'Freelance Financial Modeling Consultant',
      companyName: 'Cedar Equities',
      location: 'Worldwide',
      rawSalary: '$45 / hour',
      monthlyIncomeUsd: 1100,
      applicationUrl: 'https://remotive.com/remote-jobs/finance',
      tags: ['Excel Modeling', 'Budgets', 'SaaS'],
    },
    {
      id: 'fin_3',
      title: 'Remote Corporate Tax & Compliance Specialist',
      companyName: 'Vanguard Global Audits',
      location: 'Middle East',
      rawSalary: '$28k - $42k',
      monthlyIncomeUsd: 900,
      applicationUrl: 'https://remotive.com/remote-jobs/finance',
      tags: ['IFRS', 'VAT', 'Auditing'],
    },
  ],
  marketing: [
    {
      id: 'mkt_1',
      title: 'Growth & Performance Marketing Manager',
      companyName: 'Pulse Brand Media',
      location: 'Remote Worldwide',
      rawSalary: '$30k - $48k',
      monthlyIncomeUsd: 1050,
      applicationUrl: 'https://remotive.com/remote-jobs/marketing',
      tags: ['Google Ads', 'Meta', 'Analytics'],
    },
    {
      id: 'mkt_2',
      title: 'B2B Content Strategist & Copywriter',
      companyName: 'Elevate Tech',
      location: 'Remote',
      rawSalary: '$30 / hour',
      monthlyIncomeUsd: 850,
      applicationUrl: 'https://remotive.com/remote-jobs/marketing',
      tags: ['Arabic/English', 'SEO', 'Thought Leadership'],
    },
  ],
  design: [
    {
      id: 'des_1',
      title: 'Senior Product UI/UX Designer',
      companyName: 'DesignCraft Studio',
      location: 'Remote',
      rawSalary: '$35k - $60k',
      monthlyIncomeUsd: 1200,
      applicationUrl: 'https://remotive.com/remote-jobs/design',
      tags: ['Figma', 'Design Systems', 'Mobile'],
    },
    {
      id: 'des_2',
      title: 'Brand Identity & Presentation Specialist',
      companyName: 'Aura Creative Co',
      location: 'Worldwide Remote',
      rawSalary: '$25k - $40k',
      monthlyIncomeUsd: 900,
      applicationUrl: 'https://remotive.com/remote-jobs/design',
      tags: ['Branding', 'Motion', 'Pitch Decks'],
    },
  ],
  sales: [
    {
      id: 'sal_1',
      title: 'Enterprise Account Executive (GCC)',
      companyName: 'OmniCloud SaaS',
      location: 'Remote Kuwait & GCC',
      rawSalary: '$40k base + Commission',
      monthlyIncomeUsd: 1400,
      applicationUrl: 'https://remotive.com/remote-jobs/sales',
      tags: ['B2B Sales', 'CRM', 'Contracts'],
    },
  ],
  writing: [
    {
      id: 'wri_1',
      title: 'Executive Ghostwriter & Research Analyst',
      companyName: 'Strategic Horizons',
      location: 'Remote Worldwide',
      rawSalary: '$40 / hour',
      monthlyIncomeUsd: 950,
      applicationUrl: 'https://remotive.com/remote-jobs/writing',
      tags: ['Research', 'Whitepapers', 'Finance'],
    },
  ],
  'all-others': [
    {
      id: 'ops_1',
      title: 'Executive Virtual Operations Associate',
      companyName: 'Global Team Services',
      location: 'Worldwide Remote',
      rawSalary: '$24k - $36k',
      monthlyIncomeUsd: 800,
      applicationUrl: 'https://remotive.com/remote-jobs/all-others',
      tags: ['Coordination', 'Tools', 'Management'],
    },
  ],
};

// 1. Fetch live currency rates from API 2 (open.er-api.com)
export interface CurrencyRates {
  KWD: number;
  SAR: number;
  AED: number;
  USD: number;
}

let cachedRates: CurrencyRates | null = null;
let lastRatesFetchTime = 0;

export async function fetchLiveExchangeRates(): Promise<CurrencyRates> {
  if (cachedRates && Date.now() - lastRatesFetchTime < 30 * 60 * 1000) {
    return cachedRates;
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to fetch exchange rates');
    const data = await res.json();
    if (data && data.rates) {
      cachedRates = {
        USD: 1,
        KWD: data.rates.KWD || 0.308,
        SAR: data.rates.SAR || 3.75,
        AED: data.rates.AED || 3.67,
      };
      lastRatesFetchTime = Date.now();
      return cachedRates;
    }
  } catch (err) {
    console.warn('Using fallback currency rates due to network:', err);
  }

  return {
    USD: 1,
    KWD: 0.308,
    SAR: 3.75,
    AED: 3.67,
  };
}

// 2. Parse raw salary string into estimated monthly USD addition
function parseEstimatedMonthlyUsd(rawSalary: string, defaultEstimate: number = 1000): number {
  if (!rawSalary) return defaultEstimate;
  const s = rawSalary.toLowerCase();

  if (s.includes('/hour') || s.includes('/hr') || s.includes('hour')) {
    const numbers = s.match(/\d+(\.\d+)?/g);
    if (numbers && numbers.length > 0) {
      const avgHourly = numbers.reduce((acc, v) => acc + parseFloat(v), 0) / numbers.length;
      return Math.round(avgHourly * 25);
    }
  }

  if (s.includes('k') || s.includes(',') || s.includes('year') || s.includes('annually')) {
    const clean = s.replace(/k/g, '000').replace(/,/g, '');
    const numbers = clean.match(/\d{4,6}/g);
    if (numbers && numbers.length > 0) {
      const avgYearly = numbers.reduce((acc, v) => acc + parseFloat(v), 0) / numbers.length;
      return Math.round((avgYearly / 12) * 0.35);
    }
  }

  return defaultEstimate;
}

// 3. Calculate FIRE acceleration impact (Years saved to financial freedom)
export function calculateFireAccelerationImpact({
  currentSavings,
  currentMonthlySavings,
  additionalMonthlyIncomeKwd,
  annualExpenses,
  currentAge,
  targetAge,
  annualReturnRate = 0.085,
}: {
  currentSavings: number;
  currentMonthlySavings: number;
  additionalMonthlyIncomeKwd: number;
  annualExpenses: number;
  currentAge: number;
  targetAge: number;
  annualReturnRate?: number;
}) {
  const freedomTarget = Math.max(10000, annualExpenses * 25);
  const monthlyRate = annualReturnRate / 12;

  const calcYears = (monthlyContribution: number): number => {
    if (monthlyContribution <= 0) return 30;
    try {
      const numerator = Math.log(
        (freedomTarget * monthlyRate + monthlyContribution) /
          (currentSavings * monthlyRate + monthlyContribution)
      );
      const denominator = Math.log(1 + monthlyRate);
      const years = numerator / denominator / 12;
      return isNaN(years) || years < 0 ? 25 : Math.min(35, Math.max(1, years));
    } catch {
      return 20;
    }
  };

  const yearsWithout = calcYears(Math.max(50, currentMonthlySavings));
  const yearsWith = calcYears(Math.max(50, currentMonthlySavings + additionalMonthlyIncomeKwd));
  const yearsSaved = Math.max(1, Math.round((yearsWithout - yearsWith) * 10) / 10);

  const months10 = 120;
  const months20 = 240;
  const extraWealth10Years = Math.round(
    additionalMonthlyIncomeKwd * ((Math.pow(1 + monthlyRate, months10) - 1) / monthlyRate)
  );
  const extraWealth20Years = Math.round(
    additionalMonthlyIncomeKwd * ((Math.pow(1 + monthlyRate, months20) - 1) / monthlyRate)
  );

  return {
    yearsSaved,
    extraWealth10Years,
    extraWealth20Years,
    projectedFreedomAgeWithJob: Math.max(currentAge + 2, Math.round(currentAge + yearsWith)),
    projectedFreedomAgeWithout: Math.max(currentAge + 3, Math.round(currentAge + yearsWithout)),
  };
}

// 4. Main Fetcher: Connected Job Opportunities with Live Currency and Financial Calculations
export async function fetchMatchingJobOpportunities({
  careerCategory,
  currentSavings = 5000,
  currentMonthlySavings = 250,
  annualExpenses = 9600,
  currentAge = 32,
  targetAge = 50,
}: {
  careerCategory?: string;
  currentSavings?: number;
  currentMonthlySavings?: number;
  annualExpenses?: number;
  currentAge?: number;
  targetAge?: number;
}): Promise<JobOpportunity[]> {
  const rates = await fetchLiveExchangeRates();

  const activeCategory = careerCategory || 'software-development';
  const categoryMeta = CAREER_FIELDS.find(
    (c) => c.apiCategory === activeCategory || c.id === activeCategory
  ) || CAREER_FIELDS[0];

  const targetApiCategory = categoryMeta.apiCategory;

  let rawJobsList: any[] = [];

  try {
    const url = `https://remotive.com/api/remote-jobs?category=${encodeURIComponent(
      targetApiCategory
    )}&limit=6`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.jobs) && data.jobs.length > 0) {
        rawJobsList = data.jobs;
      }
    }
  } catch (err) {
    console.warn('Could not fetch from Remotive API directly, using fallback:', err);
  }

  if (rawJobsList.length < 3) {
    const fallback = FALLBACK_JOBS[targetApiCategory] || FALLBACK_JOBS['software-development'];
    rawJobsList = [...rawJobsList, ...fallback];
  }

  const enrichedJobs: JobOpportunity[] = rawJobsList.slice(0, 5).map((job: any, idx: number) => {
    const rawSalary = job.salary || '';
    const monthlyIncomeUsd =
      job.monthlyIncomeUsd ||
      parseEstimatedMonthlyUsd(rawSalary, categoryMeta.averageMonthlyIncomeKwd * 3.25);

    const monthlyIncomeKwd = Math.round(monthlyIncomeUsd * rates.KWD);
    const monthlyIncomeSar = Math.round(monthlyIncomeUsd * rates.SAR);

    const impact = calculateFireAccelerationImpact({
      currentSavings,
      currentMonthlySavings,
      additionalMonthlyIncomeKwd: monthlyIncomeKwd,
      annualExpenses,
      currentAge,
      targetAge,
    });

    return {
      id: job.id || `job_${targetApiCategory}_${idx}`,
      title: job.title || 'Senior Remote Specialist',
      companyName: job.company_name || job.companyName || 'Global Enterprise',
      companyLogoUrl: job.company_logo || job.company_logo_url || job.companyLogoUrl,
      category: targetApiCategory,
      categoryArabic: categoryMeta.titleArabic,
      location: job.candidate_required_location || job.location || 'Worldwide Remote (عن بُعد)',
      rawSalary: rawSalary || `$${Math.round(monthlyIncomeUsd)} / شهر`,
      monthlyIncomeUsd,
      monthlyIncomeKwd,
      monthlyIncomeSar,
      yearsSavedToRetirement: impact.yearsSaved,
      extraWealth10Years: impact.extraWealth10Years,
      extraWealth20Years: impact.extraWealth20Years,
      applicationUrl: job.url || job.applicationUrl || 'https://remotive.com',
      tags: Array.isArray(job.tags) && job.tags.length > 0 ? job.tags.slice(0, 3) : ['عن بُعد', 'دخل إضافي', 'دوام مرن'],
    };
  });

  return enrichedJobs;
}
