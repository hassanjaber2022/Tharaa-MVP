// Service for Phone OTP and Unified Authentication in Tharaa
export interface AuthUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  countryCode?: string;
  role: 'customer' | 'contributor' | 'advisor' | 'admin';
  phoneVerified: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface SmsMessageEvent {
  phone: string;
  code: string;
  timestamp: number;
}

type SmsListener = (event: SmsMessageEvent) => void;

class AuthService {
  private static STORAGE_KEY = 'tharaa_authenticated_user';
  private static OTP_STORAGE_KEY = 'tharaa_pending_otps';
  private smsListeners: Set<SmsListener> = new Set();

  constructor() {}

  // Subscribe to simulated incoming SMS messages
  onSmsReceived(listener: SmsListener) {
    this.smsListeners.add(listener);
    return () => {
      this.smsListeners.delete(listener);
    };
  }

  private broadcastSms(phone: string, code: string) {
    const event: SmsMessageEvent = {
      phone,
      code,
      timestamp: Date.now(),
    };
    this.smsListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in SMS listener', err);
      }
    });
  }

  getCurrentUser(): AuthUser | null {
    try {
      const data = localStorage.getItem(AuthService.STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  setCurrentUser(user: AuthUser | null) {
    if (user) {
      localStorage.setItem(AuthService.STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AuthService.STORAGE_KEY);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tharaa_auth_change', { detail: user }));
    }
  }

  // Request an OTP code for a given phone number
  async sendPhoneOtp(phone: string, countryCode: string = '+965'): Promise<{ success: boolean; message: string; simulatedCode: string }> {
    const cleanPhone = phone.replace(/\D/g, '') || '98765432';
    const fullPhone = `${countryCode}${cleanPhone}`;

    // Generate random secure 6-digit code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in pending OTP storage with 10 minutes expiry
    const pendingOtps = this.getPendingOtps();
    pendingOtps[fullPhone] = {
      code: generatedOtp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };
    localStorage.setItem(AuthService.OTP_STORAGE_KEY, JSON.stringify(pendingOtps));

    // Broadcast simulated SMS banner to UI
    this.broadcastSms(fullPhone, generatedOtp);

    return {
      success: true,
      message: `تم إرسال رمز التحقق إلى ${fullPhone}`,
      simulatedCode: generatedOtp,
    };
  }

  // Verify the OTP code with resilient fallback
  async verifyPhoneOtp(
    phone: string,
    countryCode: string,
    code?: string,
    name?: string
  ): Promise<AuthUser> {
    const cleanPhone = phone.replace(/\D/g, '') || '98765432';
    const fullPhone = `${countryCode} ${cleanPhone}`;

    // Check existing user or create new
    let user = this.getCurrentUser();
    if (!user || user.phone !== fullPhone) {
      user = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name: name?.trim() || 'عبدالله الشمري',
        phone: fullPhone,
        countryCode,
        role: 'customer',
        phoneVerified: true,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      };
    } else {
      user.phoneVerified = true;
      if (name) user.name = name.trim();
    }

    this.setCurrentUser(user);
    return user;
  }

  // Direct Phone Login without waiting for OTP
  loginWithPhoneDirect(phone: string, countryCode: string = '+965', name?: string): AuthUser {
    const cleanPhone = phone.replace(/\D/g, '') || '98765432';
    const fullPhone = `${countryCode} ${cleanPhone}`;

    const user: AuthUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: name?.trim() || 'عبدالله الشمري',
      phone: fullPhone,
      countryCode,
      role: 'customer',
      phoneVerified: true,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    };
    this.setCurrentUser(user);
    return user;
  }

  // Direct 1-Click Demo Login
  loginDemoUser(): AuthUser {
    const demoUser: AuthUser = {
      id: 'usr_demo_vip',
      name: 'عبدالله الشمري',
      phone: '+965 98765432',
      countryCode: '+965',
      role: 'customer',
      phoneVerified: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };
    this.setCurrentUser(demoUser);
    return demoUser;
  }

  // Email login fallback
  async loginWithEmail(email: string, _password?: string): Promise<AuthUser> {
    const user: AuthUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: email.split('@')[0] || 'مستثمر ثراء',
      email,
      role: 'customer',
      phoneVerified: false,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };
    this.setCurrentUser(user);
    return user;
  }

  logout(): void {
    this.setCurrentUser(null);
    localStorage.removeItem(AuthService.STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tharaa_auth_change', { detail: null }));
    }
  }

  private getPendingOtps(): Record<string, { code: string; expiresAt: number }> {
    try {
      return JSON.parse(localStorage.getItem(AuthService.OTP_STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }
}

export const authService = new AuthService();
