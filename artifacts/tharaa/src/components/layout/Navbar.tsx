import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  LayoutDashboard, 
  Calculator, 
  Wallet,
  Menu,
  X,
  Moon,
  Sun,
  Globe,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { getInitialTheme, setTheme, getActiveCurrency, setActiveCurrency, Currency } from '@/lib/theme';

export function Navbar() {
  const { user, isAuthenticated, isLoading, logout, isLoggingOut } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [currentTheme, setCurrentThemeState] = useState<'light' | 'dark'>('light');
  const [currency, setCurrencyState] = useState<Currency>('KWD');

  useEffect(() => {
    const t = getInitialTheme();
    setCurrentThemeState(t);
    setTheme(t);
    setCurrencyState(getActiveCurrency());

    const handleCurrChange = () => setCurrencyState(getActiveCurrency());
    window.addEventListener('tharaa_currency_change', handleCurrChange);
    return () => window.removeEventListener('tharaa_currency_change', handleCurrChange);
  }, []);

  const toggleTheme = () => {
    const next = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentThemeState(next);
    setTheme(next);
  };

  const cycleCurrency = () => {
    const currencies: Currency[] = ['KWD', 'SAR', 'AED'];
    const next = currencies[(currencies.indexOf(currency) + 1) % currencies.length];
    setCurrencyState(next);
    setActiveCurrency(next);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/85 backdrop-blur-xl transition-colors duration-200">
      <div className="container flex h-16 max-w-screen-xl items-center justify-between px-4 md:px-8 mx-auto">
        
        {/* Right side: Brand Logo + Desktop Nav */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link href="/" className="flex items-center gap-2.5 group cursor-pointer shrink-0">
            <div className="h-9 w-9 rounded-xl overflow-hidden border border-secondary/35 flex items-center justify-center shadow-md shadow-primary/20 transform group-hover:scale-105 transition-all duration-300">
              <img src="/logo-white.jpg" alt="ثراء" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-xl tracking-tight text-foreground leading-none">
                ثـراء
              </span>
              <span className="text-[9px] text-muted-foreground font-semibold mt-0.5 hidden sm:block">
                للحرية المالية
              </span>
            </div>
          </Link>

          {/* Clean, proportional Desktop Nav for Authenticated Users */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1 bg-muted/60 p-1 rounded-2xl border border-border/50">
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  location === '/dashboard'
                    ? 'bg-card text-primary shadow-sm font-extrabold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5 text-secondary" />
                <span>الرئيسية</span>
              </Link>
              <Link
                href="/onboarding"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  location === '/onboarding'
                    ? 'bg-card text-primary shadow-sm font-extrabold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                }`}
              >
                <ClipboardList className="h-3.5 w-3.5 text-secondary" />
                <span>الاستبيان الذكي</span>
              </Link>
              <Link
                href="/calculator"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  location === '/calculator'
                    ? 'bg-card text-primary shadow-sm font-extrabold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                }`}
              >
                <Calculator className="h-3.5 w-3.5 text-primary" />
                <span>الحاسبة</span>
              </Link>
              <Link
                href="/plans"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  location === '/plans' || location.startsWith('/plans/')
                    ? 'bg-card text-primary shadow-sm font-extrabold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                }`}
              >
                <Wallet className="h-3.5 w-3.5 text-secondary" />
                <span>خططي</span>
              </Link>
            </nav>
          )}
        </div>

        {/* Left side: Controls (Tour, Currency, Theme, User, Logout) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Interactive Tour Trigger */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event('tharaa_open_tour'))}
            title="جولة تفاعلية تشرح مميزات المنصة"
            className="h-9 px-2.5 sm:px-3 rounded-xl border border-secondary/40 bg-secondary/10 hover:bg-secondary/20 text-xs font-bold text-foreground flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5 text-secondary" />
            <span className="hidden sm:inline">جولة تفاعلية ✨</span>
          </button>

          {/* Currency Switcher */}
          <button
            type="button"
            onClick={cycleCurrency}
            title="تبديل العملة"
            className="h-9 px-2 sm:px-2.5 rounded-xl border border-border/60 bg-muted/40 hover:bg-muted text-xs font-bold font-mono text-foreground flex items-center gap-1 transition-all cursor-pointer shrink-0"
          >
            <Globe className="h-3.5 w-3.5 text-secondary" />
            <span>{currency === 'KWD' ? 'د.ك' : currency === 'SAR' ? 'ر.س' : 'د.إ'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            title="تبديل المظهر"
            className="h-9 w-9 rounded-xl border border-border/60 bg-muted/40 hover:bg-muted text-foreground flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            {currentTheme === 'dark' ? (
              <Sun className="h-3.5 w-3.5 text-secondary" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-primary" />
            )}
          </button>

          {isLoading ? (
            <div className="h-9 w-20 bg-muted animate-pulse rounded-xl" />
          ) : !isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-xl px-3 h-9 text-xs font-bold text-foreground hover:bg-muted">
                  دخول
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="rounded-xl px-3.5 h-9 text-xs font-bold bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/20">
                  ابدأ رحلتك
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {/* Profile Avatar */}
              <Link 
                href="/settings" 
                title={user?.name || 'إعدادات الحساب'}
                className="h-9 w-9 rounded-xl emerald-gradient border border-secondary/40 text-white flex items-center justify-center font-display font-bold text-xs shadow-sm hover:scale-105 transition-all shrink-0 cursor-pointer"
              >
                {user?.name?.charAt(0) || 'ث'}
              </Link>

              {/* Logout Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                disabled={isLoggingOut}
                title="تسجيل الخروج من المنصة"
                className="h-9 px-2.5 rounded-xl text-xs font-bold border-destructive/30 text-destructive bg-destructive/10 hover:bg-destructive/20 flex items-center gap-1 transition-all cursor-pointer shrink-0"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">خروج</span>
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            className="md:hidden h-9 w-9 rounded-xl border border-border/60 bg-muted/40 flex items-center justify-center text-foreground cursor-pointer shrink-0"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-2xl px-5 py-4 space-y-3 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-1.5">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold ${
                    location === '/dashboard' ? 'bg-primary/10 text-primary font-extrabold' : 'text-foreground'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4 text-secondary" />
                  <span>الرئيسية</span>
                </Link>
                <Link
                  href="/onboarding"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold ${
                    location === '/onboarding' ? 'bg-primary/10 text-primary font-extrabold' : 'text-foreground'
                  }`}
                >
                  <ClipboardList className="h-4 w-4 text-secondary" />
                  <span>الاستبيان الذكي</span>
                </Link>
                <Link
                  href="/calculator"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold ${
                    location === '/calculator' ? 'bg-primary/10 text-primary font-extrabold' : 'text-foreground'
                  }`}
                >
                  <Calculator className="h-4 w-4 text-primary" />
                  <span>الحاسبة المالية</span>
                </Link>
                <Link
                  href="/plans"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold ${
                    location === '/plans' ? 'bg-primary/10 text-primary font-extrabold' : 'text-foreground'
                  }`}
                >
                  <Wallet className="h-4 w-4 text-secondary" />
                  <span>خططي وصناديقي</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-bold text-foreground hover:bg-muted"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-bold bg-primary text-white text-center"
                >
                  ابدأ رحلتك مجاناً
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
