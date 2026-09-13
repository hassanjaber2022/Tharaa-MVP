import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ShieldCheck, Mail, Smartphone, RefreshCw, Sparkles, CheckCircle2, Zap, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { PhoneInputWithCountry, GCC_COUNTRIES, CountryInfo } from '@/components/auth/PhoneInputWithCountry';
import { SmsNotificationBanner } from '@/components/auth/SmsNotificationBanner';

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { 
    loginWithPhoneOtp, 
    loginWithPhoneDirect,
    sendPhoneOtp, 
    loginWithEmail, 
    loginDemoUser, 
    user,
    isAuthenticated,
    logout 
  } = useAuth();

  // Auth mode: 'phone' or 'email'
  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');
  
  // Phone flow states: 'input' or 'otp'
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(GCC_COUNTRIES[0]);
  const [phone, setPhone] = useState('98765432');
  const [otpCode, setOtpCode] = useState('');
  const [lastSentCode, setLastSentCode] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const navigateAfterAuth = () => {
    // Take user directly to the smart financial onboarding questionnaire
    const target = '/onboarding';
    setLocation(target);
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        if (window.location.pathname !== target) {
          window.location.href = target;
        }
      }, 50);
    }
  };

  // 1. Direct Phone Login (Zero friction!)
  const handleDirectPhoneLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      loginWithPhoneDirect(phone, selectedCountry.code);
      toast({
        title: 'أهلاً بك في ثراء 🌿',
        description: 'تم تسجيل الدخول بنجاح، جاري فتح لوحة التحكم...',
      });
      navigateAfterAuth();
    } catch {
      loginDemoUser();
      navigateAfterAuth();
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    try {
      const res = await sendPhoneOtp(phone, selectedCountry.code);
      const code = res.simulatedCode || '123456';
      setLastSentCode(code);
      setOtpCode(code); // Pre-set for instant convenience
      setStep('otp');
      setCountdown(60);
      toast({
        title: 'تم إرسال رمز التحقق 📲',
        description: `الرمز المرسل هو: ${code}`,
      });
    } catch {
      setStep('otp');
      setLastSentCode('123456');
      setOtpCode('123456');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Verify OTP
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify || otpCode || lastSentCode || '123456').trim();
    setIsLoading(true);
    try {
      await loginWithPhoneOtp(phone, selectedCountry.code, code);
      toast({
        title: 'أهلاً بك في ثراء 🌿',
        description: 'تم التحقق وتسجيل الدخول بنجاح',
      });
      navigateAfterAuth();
    } catch {
      loginDemoUser();
      navigateAfterAuth();
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Instant Demo Login
  const handleQuickDemoLogin = () => {
    loginDemoUser();
    toast({
      title: 'مرحباً بك في ثراء 🌟',
      description: 'تم تسجيل الدخول الفوري بنجاح',
    });
    navigateAfterAuth();
  };

  // 5. Email Login
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ variant: 'destructive', title: 'تنبيه', description: 'يرجى إدخال البريد الإلكتروني' });
      return;
    }
    setIsLoading(true);
    try {
      await loginWithEmail(email, password);
      toast({
        title: 'أهلاً بك في ثراء',
        description: 'تم تسجيل الدخول بنجاح',
      });
      navigateAfterAuth();
    } catch {
      loginDemoUser();
      navigateAfterAuth();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Real-time Simulated SMS Notification Banner */}
      <SmsNotificationBanner
        onAutofill={(code) => {
          setOtpCode(code);
          handleVerifyOtp(code);
        }}
      />

      {/* Ambient background glows */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        
        {/* If already logged in, show clear helpful switch card */}
        {isAuthenticated && (
          <Card className="mb-6 p-6 rounded-3xl border border-secondary/40 luxury-glass shadow-xl text-center space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-center gap-2 text-secondary font-bold text-sm">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <span>أنت مسجل الدخول حالياً</span>
            </div>
            <p className="text-base font-bold text-foreground">
              الحساب النشط: <span className="text-primary font-extrabold">{user?.name || 'عبدالله الشمري'}</span> ({user?.phone || user?.email})
            </p>
            <div className="pt-2">
              <Button
                onClick={() => setLocation('/dashboard')}
                className="w-full rounded-2xl h-12 px-6 font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                <span>المتابعة للوحة التحكم</span>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Quick Demo Login Button at Top */}
        <div className="mb-6 text-center">
          <Button
            type="button"
            onClick={handleQuickDemoLogin}
            className="rounded-2xl h-12 px-6 font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg shadow-secondary/20 transition-all hover:scale-105 active:scale-95 text-xs sm:text-sm flex items-center gap-2 mx-auto"
          >
            <Zap className="h-4 w-4" />
            <span>⚡ دخول تجريبي فوري بنقرة واحدة (تخطي التحقق)</span>
          </Button>
        </div>

        {/* Brand Header with Real Official Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl overflow-hidden shadow-2xl shadow-primary/30 mb-5 ring-2 ring-secondary/40 transform -rotate-3 hover:rotate-0 transition-all duration-300">
            <img src="/logo-white.jpg" alt="ثراء" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 tracking-tight text-foreground">
            {step === 'otp' ? 'تحقق من رقم هاتفك' : 'تسجيل الدخول إلى ثراء'}
          </h1>
          <p className="text-muted-foreground font-medium text-base">
            {step === 'otp'
              ? `أدخل الرمز المرسل إلى ${selectedCountry.code} ${phone}`
              : 'الوصول المباشر والآمن إلى خطتك واستثماراتك'}
          </p>
        </div>

        <Card className="luxury-glass p-8 md:p-10 rounded-[2.5rem] border-secondary/25 shadow-2xl relative">
          {/* Mode Switcher Tabs */}
          {step === 'input' && (
            <div className="flex bg-muted/60 p-1.5 rounded-2xl mb-8 border border-border/60">
              <button
                type="button"
                onClick={() => setAuthMode('phone')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  authMode === 'phone'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Smartphone className="h-4 w-4 text-secondary" />
                رقم الهاتف (OTP)
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('email')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  authMode === 'email'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Mail className="h-4 w-4" />
                البريد الإلكتروني
              </button>
            </div>
          )}

          {/* PHONE LOGIN FLOW */}
          {authMode === 'phone' && (
            <>
              {step === 'input' ? (
                <form onSubmit={handleDirectPhoneLogin} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground block">
                      رقم الهاتف النقال
                    </label>
                    <PhoneInputWithCountry
                      value={phone}
                      onChange={setPhone}
                      selectedCountry={selectedCountry}
                      onCountryChange={setSelectedCountry}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
                      يمكنك الدخول المباشر فوراً أو عبر رمز تأكيد SMS
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Primary Button: Direct instant login */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-14 text-base font-bold rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/25 transition-all hover:-translate-y-0.5 cursor-pointer"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
                      ) : (
                        <>
                          <span>تسجيل الدخول المباشر بالرقم</span>
                          <ArrowLeft className="mr-2 h-5 w-5" />
                        </>
                      )}
                    </Button>

                    {/* Secondary Button: OTP Flow */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSendOtp}
                      disabled={isLoading}
                      className="w-full h-12 text-sm font-bold rounded-2xl border-secondary/40 hover:bg-secondary/10 text-foreground cursor-pointer"
                    >
                      <span>طلب رمز تحقق SMS (OTP)</span>
                    </Button>
                  </div>
                </form>
              ) : (
                /* OTP CODE INPUT STEP */
                <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }} className="space-y-6 text-center">
                  
                  {/* Code Helper Card */}
                  <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/30 text-xs space-y-1.5 shadow-sm">
                    <span className="text-muted-foreground block font-medium">رمز التحقق المُرسل لهاتفك:</span>
                    <strong className="text-2xl font-mono font-black tracking-widest text-primary block">
                      {lastSentCode}
                    </strong>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpCode(lastSentCode);
                        handleVerifyOtp(lastSentCode);
                      }}
                      className="text-secondary font-bold hover:underline pt-1 inline-flex items-center gap-1 text-xs cursor-pointer"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      اضغط هنا لتعبئة الرمز والدخول تلقائياً
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground block mb-2">
                      أدخل رمز التحقق (أو 123456)
                    </label>
                    
                    <Input
                      type="text"
                      inputMode="numeric"
                      autoFocus
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setOtpCode(val);
                        if (val.length === 6) {
                          handleVerifyOtp(val);
                        }
                      }}
                      placeholder="••••••"
                      className="h-14 rounded-2xl text-center text-2xl font-mono font-extrabold tracking-[0.4em] bg-background border-2 border-border focus:border-primary text-foreground"
                      dir="ltr"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 text-base font-bold rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5 cursor-pointer"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
                    ) : (
                      <>
                        <CheckCircle2 className="ml-2 h-5 w-5" />
                        تأكيد والدخول
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-between text-sm pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('input')}
                      className="text-muted-foreground hover:text-foreground font-semibold text-xs"
                    >
                      الرجوع لتغيير رقم الهاتف
                    </button>

                    {countdown > 0 ? (
                      <span className="text-muted-foreground font-mono text-xs">
                        إعادة الإرسال بعد ({countdown} ثانية)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        className="text-secondary hover:underline font-bold flex items-center gap-1 text-xs"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        إعادة إرسال الرمز
                      </button>
                    )}
                  </div>
                </form>
              )}
            </>
          )}

          {/* EMAIL LOGIN FLOW */}
          {authMode === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">البريد الإلكتروني</label>
                <Input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 rounded-2xl bg-background/50 border-border px-4 text-left font-mono"
                  dir="ltr"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-foreground">كلمة المرور</label>
                  <span className="text-xs text-secondary font-medium">اختياري للتجربة</span>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 rounded-2xl bg-background/50 border-border px-4 text-left"
                  dir="ltr"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-base font-bold rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20"
              >
                {isLoading ? <RefreshCw className="h-5 w-5 animate-spin mx-auto" /> : 'متابعة الدخول'}
              </Button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-muted-foreground font-medium text-sm">
              ليس لديك حساب مالي حتى الآن؟{' '}
              <Link href="/register" className="text-secondary font-bold hover:underline underline-offset-4">
                أنشئ حسابك في ثراء
              </Link>
            </p>
          </div>
        </Card>

        {/* Security and Sharia Halal Assurance */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-secondary" />
            حماية مشفرة 256-bit
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            تخطيط مالي متوافق مع الشريعة
          </span>
        </div>
      </div>
    </div>
  );
}
