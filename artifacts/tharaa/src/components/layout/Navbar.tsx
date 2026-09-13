import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  LayoutDashboard, 
  Calculator, 
  Wallet,
  Settings,
  Menu,
  X,
  Moon,
  Sun,
  Flame,
  Globe,
  Sparkles
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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-2xl transition-colors duration-200">
      <div className="container flex h-20 max-w-screen-xl items-center justify-between px-4 md:px-8 mx-auto">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-8 lg:gap-12">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="h-11 w-11 rounded-2xl overflow-hidden border border-secondary/35 flex items-center justify-center shadow-lg shadow-primary/20 transform group-hover:scale-105 transition-all duration-300">
              <img src="/logo-white.jpg" alt="ثراء" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-2xl tracking-tight text-foreground leading-none">
                ثـراء
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold tracking-wide mt-1 hidden sm:block">
                للحرية والاستثمار المالي
              </span>
            </div>
          </Link>

          {/* Desktop Nav for Authenticated Users */}
          {isAuthenticated && (
            <nav className="hidden md:flex gap-1.5 bg-muted/60 p-1.5 rounded-full border border-border/60">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  location === '/dashboard'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 text-secondary" />
                الرئيسية
              </Link>
              <Link
                href="/onboarding"
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  location === '/onboarding'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                }`}
              >
                <Sparkles className="h-4 w-4 text-secondary" />
                الاستبيان والنموذج الذكي
              </Link>
              <Link
                href="/calculator"
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  location === '/calculator'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                }`}
              >
                <Calculator className="h-4 w-4 text-primary" />
                الحاسبة والحرية المالية
              </Link>
              <Link
                href="/plans"
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  location === '/plans' || location.startsWith('/plans/')
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                }`}
              >
                <Wallet className="h-4 w-4 text-secondary" />
                خططي وصناديقي
              </Link>
            </nav>
          )}
        </div>

        {/* Action controls (Theme, Currency, User Profile) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Switcher */}
          <button
            onClick={cycleCurrency}
            title="تغيير العملة المعروضة"
            className="h-10 px-3 rounded-full border border-border/60 bg-muted/40 hover:bg-muted text-xs font-bold font-mono text-foreground flex items-center gap-1.5 transition-all"
          >
            <Globe className="h-3.5 w-3.5 text-secondary" />
            <span>{currency === 'KWD' ? 'د.ك' : currency === 'SAR' ? 'ر.س' : 'د.إ'}</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            title="تبديل المظهر"
            className="h-10 w-10 rounded-full border border-border/60 bg-muted/40 hover:bg-muted text-foreground flex items-center justify-center transition-all hover:scale-105"
          >
            {currentTheme === 'dark' ? (
              <Sun className="h-4 w-4 text-secondary" />
            ) : (
              <Moon className="h-4 w-4 text-primary" />
            )}
          </button>

          {isLoading ? (
            <div className="h-10 w-24 bg-muted animate-pulse rounded-full" />
          ) : !isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="rounded-full px-3 sm:px-4 h-10 text-xs sm:text-sm font-bold text-foreground hover:bg-muted">
                  دخول
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="rounded-full px-4 sm:px-6 h-10 sm:h-11 text-xs sm:text-sm font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105">
                  ابدأ رحلتك
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/settings" className="flex items-center gap-2 p-1 rounded-full hover:bg-muted/50 transition-colors">
                <div className="h-10 w-10 rounded-full emerald-gradient border border-secondary/40 text-white flex items-center justify-center font-display font-bold text-sm shadow-md">
                  {user?.name?.charAt(0) || 'ث'}
                </div>
                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-bold text-foreground leading-none">{user?.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono mt-0.5" dir="ltr">
                    {(user as any)?.phone || user?.email}
                  </span>
                </div>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                disabled={isLoggingOut}
                title="تسجيل الخروج من المنصة"
                className="h-10 px-3 sm:px-4 rounded-2xl text-xs font-bold border-destructive/30 text-destructive bg-destructive/10 hover:bg-destructive/20 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              >
                <LogOut className="h-4 w-4" />
                <span>تسجيل الخروج</span>
              </Button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden h-10 w-10 rounded-full border border-border/60 bg-muted/40 flex items-center justify-center text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-2xl px-6 py-6 space-y-4 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-bold ${
                    location === '/dashboard' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <LayoutDashboard className="h-5 w-5 text-secondary" />
                  لوحة التحكم
                </Link>
                <Link
                  href="/onboarding"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-bold ${
                    location === '/onboarding' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <Sparkles className="h-5 w-5 text-secondary" />
                  الاستبيان والنموذج الذكي
                </Link>
                <Link
                  href="/calculator"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-bold ${
                    location === '/calculator' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <Calculator className="h-5 w-5 text-primary" />
                  حاسبة الحرية المالية
                </Link>
                <Link
                  href="/plans"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-bold ${
                    location === '/plans' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <Wallet className="h-5 w-5 text-secondary" />
                  خططي وأهدافي
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-bold text-foreground hover:bg-muted"
                >
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  الملف المالي والإعدادات
                </Link>
                <div className="pt-2 border-t border-border/50">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>تسجيل الخروج من ثراء</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-3.5 rounded-2xl text-base font-bold bg-muted/60 text-foreground"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center py-3.5 rounded-2xl text-base font-bold bg-primary text-white shadow-lg"
                >
                  فتح حساب جديد
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
