import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  LayoutDashboard, 
  Calculator, 
  Wallet,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const { user, isAuthenticated, isLoading, logout, isLoggingOut } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-8 mx-auto">
        <div className="flex gap-6 md:gap-10 items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg leading-none mt-1">ث</span>
            </div>
            <span className="font-bold text-xl hidden md:inline-block text-primary">ثراء</span>
          </Link>

          {isAuthenticated && (
            <nav className="hidden md:flex gap-6">
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === '/dashboard' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                الرئيسية
              </Link>
              <Link
                href="/calculator"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === '/calculator' ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                الحاسبة
              </Link>
            </nav>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <nav className="flex items-center gap-2">
            {isLoading ? (
              <div className="h-10 w-24 bg-muted animate-pulse rounded-full"></div>
            ) : !isAuthenticated ? (
              <>
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground hidden sm:block px-4">
                  تسجيل الدخول
                </Link>
                <Link href="/register">
                  <Button className="rounded-full px-6">حساب جديد</Button>
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium leading-none">{user?.name}</span>
                  <span className="text-xs text-muted-foreground mt-1">{user?.email}</span>
                </div>
                <div className="h-9 w-9 rounded-full bg-accent text-primary flex items-center justify-center font-bold">
                  {user?.name?.charAt(0) || 'م'}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => logout()} 
                  disabled={isLoggingOut}
                  title="تسجيل الخروج"
                  className="hidden sm:flex text-muted-foreground hover:text-destructive"
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
              className="md:hidden text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-4">
          <nav className="flex flex-col space-y-3">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 text-sm font-medium px-2 py-2 rounded-md ${
                location === '/dashboard' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              الرئيسية
            </Link>
            <Link
              href="/calculator"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 text-sm font-medium px-2 py-2 rounded-md ${
                location === '/calculator' ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
              }`}
            >
              <Calculator className="h-4 w-4" />
              الحاسبة
            </Link>
            <Button 
              variant="ghost" 
              className="justify-start px-2 py-2 text-muted-foreground hover:text-destructive w-full"
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4 ms-2" />
              تسجيل الخروج
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
