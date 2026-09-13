import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ShieldCheck, RefreshCw, CheckCircle2, User, Sparkles, Smartphone, Mail, Zap, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { PhoneInputWithCountry, GCC_COUNTRIES, CountryInfo } from '@/components/auth/PhoneInputWithCountry';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { SmsNotificationBanner } from '@/components/auth/SmsNotificationBanner';

export default function Register() {
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

  const [authMode, setAuthMode] = useState<'phone' | 'email'>('phone');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  
  // Form fields
  const [name, setName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(GCC_COUNTRIES[0]);
  const [phone, setPhone] = useState('98765432');
  const [otpCode, setOtpCode] = useState('');
  const [lastSentCode, setLastSentCode] = useState('123456');
  const [email, setEmail] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const navigateToOnboarding = () => {
    setLocation('/onboarding');
    if (typeof window !== 'undefined' && window.location.pathname !== '/onboarding') {
      setTimeout(() => {
        if (window.location.pathname !== '/onboarding') {
          window.location.href = '/onboarding';
        }
      }, 80);
    }
  };

  // 1. Direct Phone Registration
  const handleDirectRegister = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      toast({ variant: 'destructive', title: 'تنبيه', description: 'يرجى إدخال اسمك الكريم' });
      return;
    }
    setIsLoading(true);
    try {
      loginWithPhoneDirect(phone, selectedCountry.code, name);
      toast({
        title: 'تم إنشاء حسابك بنجاح 🎉',
        description: 'مرحباً بك في ثراء، لنبدأ بتحديد أهدافك المالية',
      });
      navigateToOnboarding();
    } catch {
      loginDemoUser();
      navigateToOnboarding();
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      toast({ variant: 'destructive', title: 'تنبيه', description: 'يرجى إدخال اسمك الكريم' });
      return;
    }
    if (!phone.trim()) {
      toast({ variant: 'destructive', title: 'تنبيه', description: 'يرجى إدخال رقم الهاتف' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendPhoneOtp(phone, selectedCountry.code);
      const code = res.simulatedCode || '123456';
      setLastSentCode(code);
      setOtpCode(code);
      setStep('otp');
      setCountdown(60);
      toast({
        title: 'تم إرسال رمز التحقق 📲',
        description: `أرسلنا رمز التحقق إلى ${selectedCountry.code} ${phone}`,
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
      await loginWithPhoneOtp(phone, selectedCountry.code, code, name);
      toast({
        title: 'تم إنشاء حسابك بنجاح 🎉',
        description: 'مرحباً بك في ثراء، لنبدأ بتحديد أهدافك المالية',
      });
      navigateToOnboarding();
    } catch {
      loginDemoUser();
      navigateToOnboarding();
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Email Submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({ variant: 'destructive', title: 'تنبيه', description: 'يرجى تعبئة الاسم والبريد' });
      return;
    }
    setIsLoading(true);
    try {
      await loginWithEmail(email);
      toast({
        title: 'تم إنشاء الحساب بنجاح',
        description: 'مرحباً بك في ثراء',
      });
      navigateToOnboarding();
    } catch {
      loginDemoUser();
      navigateToOnboarding();
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

      {/* Ambient glows */}
      <div className="absolute top-1/3 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

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

        <div className="mb-6 text-center">
          <Button
            type="button"
            onClick={() => {
              loginDemoUser();
              toast({
                title: 'مرحباً بك في ثراء 🌟',
                description: 'تم الدخول الفوري بحساب تجريبي بنجاح',
              });
              setLocation('/dashboard');
            }}
            className="rounded-2xl h-12 px-6 font-bold bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg shadow-secondary/20 transition-all hover:scale-105 active:scale-95 text-xs sm:text-sm flex items-center gap-2 mx-auto"
          >
            <Zap className="h-4 w-4" />
            <span>⚡ دخول تجريبي فوري بنقرة واحدة (تخطي التحقق)</span>
          </Button>
        </div>

        {/* Brand Header with Official Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-3xl overflow-hidden shadow-2xl shadow-primary/30 mb-5 ring-2 ring-secondary/40 transform rotate-3 hover:rotate-0 transition-all duration-300">
            <img src="/logo-white.jpg" alt="ثراء" className="h-full w-full object-cover" />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 tracking-tight text-foreground">
            {step === 'otp' ? 'تأكيد رقم هاتفك' : 'ابدأ رحلة ثرائك المالي'}
          </h1>
          <p className="text-muted-foreground font-medium text-base">
            {step === 'otp'
              ? `أدخل رمز التأكيد المرسل إلى ${selectedCountry.code} ${phone}`
              : 'خطوتك الأولى نحو خطة استثمارية متزنة واستقلال مالي مستدام'}
          </p>
        </div>

        <Card className="luxury-glass p-8 md:p-10 rounded-[2.5rem] border-secondary/25 shadow-2xl relative">
          {/* Method Switcher */}
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
                التسجيل برقم الهاتف (OTP)
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

          {/* PHONE REGISTRATION FLOW */}
          {authMode === 'phone' && (
            <>
              {step === 'input' ? (
                <form onSubmit={handleDirectRegister} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground block">
                      الاسم الكامل
                    </label>
                    <div className="relative flex items-center">
                      <Input
                        type="text"
                        placeholder="مثال: عبدالله الشمري"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-14 rounded-2xl bg-card/80 border-border px-4 text-base"
                        required
                      />
                      <User className="absolute left-4 h-4 w-4 text-muted-foreground/50 pointer-events-none" />
                    </div>
                  </div>

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
                      يمكنك إنشاء الحساب مباشرة أو عبر رمز تأكيد SMS
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Primary Button: Direct Registration */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-14 text-base font-bold rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/25 transition-all hover:-translate-y-0.5 cursor-pointer"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-5 w-5 animate-spin mx-auto" />
                      ) : (
                        <>
                          <span>إنشاء الحساب والمتابعة فوراً</span>
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
                /* OTP VERIFICATION STEP */
                <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }} className="space-y-6 text-center">
                  {/* Code Helper Card */}
                  <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/30 text-xs space-y-1.5 shadow-sm">
                    <span className="text-muted-foreground block font-medium">رمز التحقق المُرسل:</span>
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
                    <label className="text-sm font-bold text-foreground block mb-4">
                      رمز التأكيد المكون من 6 أرقام
                    </label>
                    <div className="flex justify-center dir-ltr" dir="ltr">
                      <InputOTP
                        maxLength={6}
                        value={otpCode}
                        onChange={(value) => {
                          setOtpCode(value);
                          if (value.length === 6) {
                            handleVerifyOtp(value);
                          }
                        }}
                      >
                        <InputOTPGroup className="gap-2 sm:gap-3">
                          <InputOTPSlot index={0} className="h-14 w-11 sm:w-13 text-xl font-bold font-mono rounded-2xl border-border bg-background" />
                          <InputOTPSlot index={1} className="h-14 w-11 sm:w-13 text-xl font-bold font-mono rounded-2xl border-border bg-background" />
                          <InputOTPSlot index={2} className="h-14 w-11 sm:w-13 text-xl font-bold font-mono rounded-2xl border-border bg-background" />
                          <InputOTPSlot index={3} className="h-14 w-11 sm:w-13 text-xl font-bold font-mono rounded-2xl border-border bg-background" />
                          <InputOTPSlot index={4} className="h-14 w-11 sm:w-13 text-xl font-bold font-mono rounded-2xl border-border bg-background" />
                          <InputOTPSlot index={5} className="h-14 w-11 sm:w-13 text-xl font-bold font-mono rounded-2xl border-border bg-background" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
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
                        تأكيد وإنشاء الحساب
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-between text-sm pt-2">
                    <button
                      type="button"
                      onClick={() => setStep('input')}
                      className="text-muted-foreground hover:text-foreground font-semibold text-xs cursor-pointer"
                    >
                      تعديل البيانات
                    </button>

                    {countdown > 0 ? (
                      <span className="text-muted-foreground font-mono text-xs">
                        إعادة الإرسال بعد ({countdown} ثانية)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        className="text-secondary hover:underline font-bold flex items-center gap-1 text-xs cursor-pointer"
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

          {/* EMAIL REGISTRATION FALLBACK */}
          {authMode === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">الاسم الكامل</label>
                <Input
                  type="text"
                  placeholder="محمد العتيبي"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 rounded-2xl bg-card/80 border-border px-4"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">البريد الإلكتروني</label>
                <Input
                  type="email"
                  placeholder="name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 rounded-2xl bg-card/80 border-border px-4 text-left font-mono"
                  dir="ltr"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 text-base font-bold rounded-2xl bg-primary text-white hover:bg-primary/90 shadow-xl shadow-primary/20"
              >
                {isLoading ? <RefreshCw className="h-5 w-5 animate-spin mx-auto" /> : 'متابعة إنشاء الحساب'}
              </Button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-border/50 text-center">
            <p className="text-muted-foreground font-medium text-sm">
              لديك حساب مسجل بالفعل؟{' '}
              <Link href="/login" className="text-secondary font-bold hover:underline underline-offset-4">
                تسجيل الدخول هنا
              </Link>
            </p>
          </div>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-secondary" />
            حماية الخصوصية 100%
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-primary" />
            تخطيط مالي خليجي متوافق مع الشريعة
          </span>
        </div>
      </div>
    </div>
  );
}
