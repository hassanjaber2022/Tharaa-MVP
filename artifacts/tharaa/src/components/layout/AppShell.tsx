import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { WelcomeInteractiveTour } from '@/components/interactive/WelcomeInteractiveTour';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      <div className="fixed inset-0 pointer-events-none bg-mesh z-0 opacity-50"></div>
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 w-full">
          {children}
        </main>
        <WelcomeInteractiveTour />
        <footer className="border-t border-border/30 bg-background/50 backdrop-blur-sm py-8 md:py-0">
          <div className="container flex flex-col items-center justify-between gap-6 md:h-24 md:flex-row px-4 md:px-8 mx-auto">
            <div className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
              <div className="h-6 w-6 rounded-md bg-primary text-white flex items-center justify-center">
                <span className="font-display font-bold text-xs">ث</span>
              </div>
              <p className="text-center text-sm font-medium text-muted-foreground md:text-left">
                © {new Date().getFullYear()} ثراء. رفيقك المالي.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">الشروط والأحكام</a>
              <a href="#" className="hover:text-primary transition-colors">الخصوصية</a>
              <a href="#" className="hover:text-primary transition-colors">المساعدة</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
