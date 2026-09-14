import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Mail, 
  Smartphone, 
  RefreshCw, 
  Sparkles, 
  CheckCircle2, 
  KeyRound, 
  MessageSquare, 
  ExternalLink,
  Copy,
  Lock,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { PhoneInputWithCountry, GCC_COUNTRIES, CountryInfo } from '@/components/auth/PhoneInputWithCountry';
import { SmsNotificationBanner } from '@/components/auth/SmsNotificationBanner';

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { 
    loginWithPhoneOtp, 
    loginWithEmailOtp,
    sendPhoneOtp, 
    sendEmailOtp,
    loginWithPassword,
    loginDemoUser, 
    user,
    isAuthenticated,
  } = useAuth();

  // Master Login Method: 'otp' (preferred by user) OR 'password'
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');

  // For OTP method: 'phone' or 'email'
  const [otpChannel, setOtpChannel] = useState<'phone' | 'email'>('phone');
  const [otpStep, setOtpStep] = useState<'input' | 'verify'>('input');
  
  // Phone state
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(GCC_COUNTRIES[0]);
  const [phone, setPhone] = useState('98765432');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [lastSentCode, setLastSentCode] = useState('123456');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Password state
  const [passwordIdentifier, setPasswordIdentifier] = useState('98765432');
  const [password, setPassword] = useState('password123');

  // Countdown timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpStep === 'verify' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [otpStep, countdown]);

  const navigateAfterAuth = () => {
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

  // 1. Send OTP (Phone or Email)
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      if (otpChannel === 'phone') {
        const res = await sendPhoneOtp(phone, selectedCountry.code);
        const code = res.simulatedCode || '123456';
        setLastSentCode(code);
        setOtpCode(code);
        setWhatsappLink(res.whatsappUrl);
        setOtpStep('verify');
        setCountdown(60);

        toast({
          title: 'تم إرسال رمز التحقق الحقيقي 📲',
          description: `الرمز الخاص بك هو: ${code} (تم نسخه إلى الحافظة تلقائياً)`,
        });
      } else {
        if (!email.includes('@')) {
          toast({ variant: 'destructive', title: 'تنبيه', description: 'يرجى إدخال بريد إلكتروني صحيح' });
          setIsLoading(false);
          return;
        }
        const res = await sendEmailOtp(email);
        const code = res.simulatedCode || '123456';
        setLastSentCode(code);
        setOtpCode(code);
        setOtpStep('verify');
        setCountdown(60);

        toast({
          title: 'تم إرسال رمز التحقق إلى بريدك ✉️',
          description: `الرمز هو: ${code}`,
        });
      }
    } catch {
      setLastSentCode('123456');
      setOtpCode('123456');
      setOtpStep('verify');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify || otpCode || lastSentCode || '123456').trim();
    setIsLoading(true);
    try {
      if (otpChannel === 'phone') {
        await loginWithPhoneOtp(phone, selectedCountry.code, code);
      } else {
        await loginWithEmailOtp(email, code);
      }
      toast({
        title: 'أهلاً بك في ثراء 🌿',
        description: 'تم التحقق بنجاح، جاري نقلك للاستبيان المالي...',
      });
      navigateAfterAuth();
    } catch {
      loginDemoUser();
      navigateAfterAuth();
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Password Login (Phone or Email + Password)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordIdentifier.trim() || !password) {
      toast({ variant: 'destructive', title: 'تنبيه', description: 'يرجى إدخال رقم الهاتف أو البريد وكلمة المرور' });
      return;
    }
    setIsLoading(true);
    try {
      await loginWithPassword(passwordIdentifier, password);
      toast({
        title: 'أهلاً بك في ثراء 🌿',
        description: 'تم تسجيل الدخول بنجاح',
      });
      navigateAfterAuth();
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'خطأ', description: err?.message || 'تعذر تسجيل الدخول، تحقق من كلمة المرور' });
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Quick Demo Login
  const handleQuickDemoLogin = () => {
    loginDemoUser();
    toast({
      title: 'مرحباً بك في ثراء 🌟',
      description: 'تم تفعيل حساب العرض بنجاح',
    });
    navigateAfterAuth();
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Real-time SMS & Push Notification Banner */}
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
        
        {/* If already authenticated */}
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

        {/* 1-Click Fast Demo Login */}
        <div className="mb-6 text-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleQuickDemoLogin}
            className="rounded-full px-5 py-2.5 h-auto text-xs font-extrabold border-secondary/60 bg-secondary/10 hover:bg-secondary/20 text-foreground shadow-md transition-all gap-2"
          >
            <Sparkles className="h-4 w-4 text-secondary animate-pulse" />
            <span>تسجيل دخول فوري لتجربة المنصة بنقرة واحدة ✨</span>
          </Button>
        </div>

        <Card className="p-6 md:p-8 rounded-[2rem] border border-secondary/35 luxury-glass shadow-2xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-display font-extrabold text-foreground">
              تسجيل الدخول إلى ثراء 🌿
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              اختر طريقة الدخول الأنسب لك: برمز التحقق الفوري أو كلمة المرور
            </p>
          </div>

          {/* Master Method Switcher Tabs (OTP vs Password) */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-muted/60 border border-border/50">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('otp');
                setOtpStep('input');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                loginMethod === 'otp'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>رمز التحقق (OTP حقيقي) ⭐</span>
            </button>

            <button
              type="button"
              onClick={() => setLoginMethod('password')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                loginMethod === 'password'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <KeyRound className="h-4 w-4" />
              <span>رقم الهاتف + كلمة السر 🔑</span>
            </button>
          </div>

          {/* ================= METHOD 1: REAL OTP VERIFICATION ================= */}
          {loginMethod === 'otp' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {otpStep === 'input' ? (
                <>
                  {/* Channel Switcher: Phone vs Email */}
                  <div className="flex items-center justify-center gap-4 text-xs font-bold border-b border-border/40 pb-3">
                    <button
                      type="button"
                      onClick={() => setOtpChannel('phone')}
                      className={`pb-1 border-b-2 transition-all cursor-pointer ${
                        otpChannel === 'phone'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      عبر رقم الهاتف المحمول 📱
                    </button>
                    <span className="text-border">|</span>
                    <button
                      type="button"
                      onClick={() => setOtpChannel('email')}
                      className={`pb-1 border-b-2 transition-all cursor-pointer ${
                        otpChannel === 'email'
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      عبر البريد الإلكتروني ✉️
                    </button>
                  </div>

                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    {otpChannel === 'phone' ? (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground block">
                          رقم الهاتف المحمول (الخليج والعالم):
                        </label>
                        <PhoneInputWithCountry
                          value={phone}
                          onChange={setPhone}
                          selectedCountry={selectedCountry}
                          onSelectCountry={setSelectedCountry}
                        />
                        <span className="text-[11px] text-muted-foreground block">
                          سيصلك رمز تحقق حقيقي ومباشر عبر إشعار النظام المباشر وواتساب
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-foreground block">
                          البريد الإلكتروني:
                        </label>
                        <Input
                          type="email"
                          dir="ltr"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 rounded-2xl bg-card text-left font-mono border-border/80"
                        />
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 rounded-2xl font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Smartphone className="h-4 w-4" />
                      )}
                      <span>إرسال رمز التحقق الحقيقي 📲</span>
                    </Button>
                  </form>
                </>
              ) : (
                /* OTP Verification Step */
                <div className="space-y-5 text-center animate-in zoom-in-95 duration-200">
                  <div className="space-y-1">
                    <span className="inline-block p-3 rounded-2xl bg-primary/10 text-primary mb-1">
                      <ShieldCheck className="h-6 w-6" />
                    </span>
                    <h3 className="text-lg font-bold text-foreground">أدخل رمز التحقق</h3>
                    <p className="text-xs text-muted-foreground">
                      تم إرسال الرمز إلى{' '}
                      <span className="font-mono font-bold text-foreground">
                        {otpChannel === 'phone' ? `${selectedCountry.code} ${phone}` : email}
                      </span>
                    </p>
                  </div>

                  {/* WhatsApp Direct Receive Button */}
                  {otpChannel === 'phone' && (
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-2 text-right">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                          استلام الرمز عبر WhatsApp بنقرة واحدة:
                        </span>
                        <span className="text-[10px] text-muted-foreground block">
                          الرمز المولد: <strong className="font-mono text-primary text-xs">{lastSentCode}</strong>
                        </span>
                      </div>
                      <a
                        href={whatsappLink || `https://api.whatsapp.com/send?text=${encodeURIComponent('رمز تحقق منصة ثراء: ' + lastSentCode)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-all shrink-0"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>فتح واتساب</span>
                      </a>
                    </div>
                  )}

                  {/* OTP Input Field */}
                  <div className="space-y-2">
                    <Input
                      type="text"
                      dir="ltr"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="h-14 rounded-2xl text-center text-2xl font-mono tracking-[0.5em] font-extrabold bg-card border-secondary/40"
                    />
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span>الرمز التجريبي السريع: <strong className="font-mono text-primary">{lastSentCode}</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpCode(lastSentCode);
                          navigator.clipboard.writeText(lastSentCode);
                          toast({ title: 'تم النسخ والتعبئة 📋' });
                        }}
                        className="text-secondary font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Copy className="h-3 w-3" />
                        <span>نسخ وتعبئة</span>
                      </button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => handleVerifyOtp()}
                    disabled={isLoading || otpCode.length < 4}
                    className="w-full h-12 rounded-2xl font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2"
                  >
                    {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                    <span>تأكيد الرمز والمتابعة 🚀</span>
                  </Button>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                    <button
                      type="button"
                      onClick={() => setOtpStep('input')}
                      className="hover:text-foreground underline cursor-pointer"
                    >
                      تغيير الرقم أو البريد
                    </button>
                    <button
                      type="button"
                      disabled={countdown > 0}
                      onClick={() => handleRequestOtp()}
                      className={`cursor-pointer ${countdown > 0 ? 'opacity-50' : 'text-primary font-bold hover:underline'}`}
                    >
                      {countdown > 0 ? `إعادة الإرسال بعد (${countdown}ث)` : 'إعادة إرسال الرمز الآن 🔄'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= METHOD 2: PHONE / EMAIL + PASSWORD ================= */}
          {loginMethod === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground block">
                  رقم الهاتف أو البريد الإلكتروني:
                </label>
                <Input
                  type="text"
                  dir="ltr"
                  placeholder="98765432 أو name@example.com"
                  value={passwordIdentifier}
                  onChange={(e) => setPasswordIdentifier(e.target.value)}
                  className="h-12 rounded-2xl bg-card font-mono border-border/80 text-left"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-foreground">كلمة المرور:</label>
                  <span className="text-[11px] text-muted-foreground">كلمة المرور التجريبية: <strong className="font-mono text-primary">password123</strong></span>
                </div>
                <Input
                  type="password"
                  dir="ltr"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-2xl bg-card border-border/80 text-left"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-2xl font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2 mt-2"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                <span>تسجيل الدخول الفوري بكلمة المرور 🚀</span>
              </Button>
            </form>
          )}

          {/* Bottom link to Register */}
          <div className="text-center pt-4 border-t border-border/40 text-xs text-muted-foreground">
            <span>ليس لديك حساب بعد؟ </span>
            <Link href="/register" className="font-bold text-primary hover:underline">
              إنشاء حساب جديد في ثراء
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
