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
  X
} from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, isAuthenticated, isLoading, logout, isLoggingOut } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/30 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 max-w-screen-2xl items-center px-4 md:px-8 mx-auto">
        <div className="flex gap-8 md:gap-12 items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/20 flex items-center justify-center transform transition-transform group-hover:scale-105">
              <span className="text-white font-display font-bold text-xl leading-none mt-1">ث</span>
            </div>
            <span className="font-display font-bold text-2xl hidden md:inline-block text-foreground tracking-tight">ثراء</span>
          </Link>

          {isAuthenticated && (
            <nav className="hidden md:flex gap-1 bg-muted/50 p-1.5 rounded-full border border-border/50">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  location === '/dashboard' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                الرئيسية
              </Link>
              <Link
                href="/calculator"
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  location === '/calculator' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <Calculator className="h-4 w-4" />
                الحاسبة
              </Link>
              <Link
                href="/plans"
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  location === '/plans' || location.startsWith('/plans/') ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <Wallet className="h-4 w-4" />
                خططي
              </Link>
            </nav>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <nav className="flex items-center gap-3">
            {isLoading ? (
              <div className="h-12 w-32 bg-muted animate-pulse rounded-full"></div>
            ) : !isAuthenticated ? (
              <>
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:block px-4 transition-colors">
                  دخول
                </Link>
                <Link href="/register">
                  <Button className="rounded-full px-8 h-11 font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                    حساب جديد
                  </Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-bold leading-none text-foreground">{user?.name}</span>
                  <span className="text-xs text-muted-foreground mt-1.5">{user?.email}</span>
                </div>
                <Link href="/settings">
                  <div className="h-11 w-11 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-display font-bold text-lg hover:bg-primary/20 transition-colors cursor-pointer ring-2 ring-transparent hover:ring-primary/30 ring-offset-2 ring-offset-background">
                    {user?.name?.charAt(0) || 'م'}
                  </div>
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => logout()} 
                  disabled={isLoggingOut}
                  title="تسجيل الخروج"
                  className="hidden sm:flex text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-11 w-11"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile menu toggle */}
          {isAuthenticated && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground rounded-full h-11 w-11"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="md:hidden border-b border-border/50 bg-background/95 backdrop-blur-xl px-4 py-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-2">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 text-base font-medium px-4 py-3 rounded-2xl transition-colors ${
                location === '/dashboard' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              الرئيسية
            </Link>
            <Link
              href="/calculator"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 text-base font-medium px-4 py-3 rounded-2xl transition-colors ${
                location === '/calculator' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Calculator className="h-5 w-5" />
              الحاسبة
            </Link>
            <Link
              href="/plans"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 text-base font-medium px-4 py-3 rounded-2xl transition-colors ${
                location === '/plans' || location.startsWith('/plans/') ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Wallet className="h-5 w-5" />
              خططي
            </Link>
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 text-base font-medium px-4 py-3 rounded-2xl transition-colors ${
                location === '/settings' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Settings className="h-5 w-5" />
              الإعدادات
            </Link>
            <div className="h-px bg-border/50 my-2"></div>
            <Button 
              variant="ghost" 
              className="justify-start px-4 py-6 text-base font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-2xl w-full"
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              disabled={isLoggingOut}
            >
              <LogOut className="h-5 w-5 ms-3" />
              تسجيل الخروج
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
