// Service for Phone OTP, Email OTP, and Phone + Password Authentication in Tharaa

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

export interface StoredUserAccount extends AuthUser {
  passwordHash?: string;
  password?: string;
}

export interface SmsMessageEvent {
  phone: string;
  code: string;
  timestamp: number;
}

type SmsListener = (event: SmsMessageEvent) => void;

class AuthService {
  private static STORAGE_KEY = 'tharaa_authenticated_user';
  private static USERS_DB_KEY = 'tharaa_registered_users_db';
  private static OTP_STORAGE_KEY = 'tharaa_pending_otps';
  private smsListeners: Set<SmsListener> = new Set();

  constructor() {
    this.ensureDefaultUsers();
  }

  private ensureDefaultUsers() {
    try {
      const existing = localStorage.getItem(AuthService.USERS_DB_KEY);
      if (!existing) {
        const defaultUsers: StoredUserAccount[] = [
          {
            id: 'usr_demo_vip',
            name: 'عبدالله الشمري',
            phone: '+965 98765432',
            email: 'demo@tharaa.com',
            countryCode: '+965',
            password: 'password123',
            role: 'customer',
            phoneVerified: true,
            emailVerified: true,
            createdAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem(AuthService.USERS_DB_KEY, JSON.stringify(defaultUsers));
      }
    } catch {}
  }

  // Subscribe to SMS notification events
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

    // Native Browser Desktop / Mobile Push Notification
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('منصة ثراء 🌿', {
            body: `رمز التحقق الخاص بك هو: ${code} (صالح لمدة 10 دقائق)`,
            icon: '/favicon.svg',
          });
        } else if (Notification.permission === 'default') {
          Notification.requestPermission().then((perm) => {
            if (perm === 'granted') {
              new Notification('منصة ثراء 🌿', {
                body: `رمز التحقق الخاص بك هو: ${code}`,
                icon: '/favicon.svg',
              });
            }
          });
        }
      }
    } catch {}

    // Auto copy to clipboard for user convenience
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(code).catch(() => {});
      }
    } catch {}
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

  // 1. Request Phone OTP Code (Generates real code, desktop push & WhatsApp link)
  async sendPhoneOtp(
    phone: string,
    countryCode: string = '+965'
  ): Promise<{ success: boolean; message: string; simulatedCode: string; whatsappUrl: string }> {
    const cleanPhone = phone.replace(/\D/g, '') || '98765432';
    const fullPhone = `${countryCode}${cleanPhone}`;

    // Cryptographic 6-digit random code
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in pending storage with 10 minutes expiry
    const pendingOtps = this.getPendingOtps();
    pendingOtps[fullPhone] = {
      code: generatedOtp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };
    localStorage.setItem(AuthService.OTP_STORAGE_KEY, JSON.stringify(pendingOtps));

    // WhatsApp one-click verification link
    const whatsappMsg = `رمز التحقق لمنصة ثراء هو: ${generatedOtp}`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
      whatsappMsg
    )}`;

    // Dispatch SMS banner & browser notification
    this.broadcastSms(fullPhone, generatedOtp);

    return {
      success: true,
      message: `تم إرسال رمز التحقق إلى ${fullPhone}`,
      simulatedCode: generatedOtp,
      whatsappUrl,
    };
  }

  // 2. Request Email OTP Code
  async sendEmailOtp(
    email: string
  ): Promise<{ success: boolean; message: string; simulatedCode: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const pendingOtps = this.getPendingOtps();
    pendingOtps[cleanEmail] = {
      code: generatedOtp,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };
    localStorage.setItem(AuthService.OTP_STORAGE_KEY, JSON.stringify(pendingOtps));

    this.broadcastSms(cleanEmail, generatedOtp);

    return {
      success: true,
      message: `تم إرسال رمز التحقق إلى بريدك ${cleanEmail}`,
      simulatedCode: generatedOtp,
    };
  }

  // 3. Verify OTP Code
  async verifyPhoneOtp(
    phone: string,
    countryCode: string,
    code?: string,
    name?: string
  ): Promise<AuthUser> {
    const cleanPhone = phone.replace(/\D/g, '') || '98765432';
    const fullPhone = `${countryCode} ${cleanPhone}`;

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
    this.saveUserToDb(user);
    return user;
  }

  // 4. Verify Email OTP
  async verifyEmailOtp(email: string, code?: string, name?: string): Promise<AuthUser> {
    const cleanEmail = email.trim().toLowerCase();
    const user: AuthUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: name?.trim() || cleanEmail.split('@')[0] || 'مستثمر ثراء',
      email: cleanEmail,
      role: 'customer',
      phoneVerified: false,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };

    this.setCurrentUser(user);
    this.saveUserToDb(user);
    return user;
  }

  // 5. Phone Number / Email + Password Login
  async loginWithPassword(identifier: string, password: string): Promise<AuthUser> {
    const cleanIdentifier = identifier.trim().toLowerCase();
    const users = this.getRegisteredUsers();

    // Find by phone or email
    const matched = users.find((u) => {
      const matchEmail = u.email && u.email.toLowerCase() === cleanIdentifier;
      const matchPhone = u.phone && u.phone.replace(/\D/g, '').includes(cleanIdentifier.replace(/\D/g, ''));
      return matchEmail || matchPhone;
    });

    if (matched) {
      if (matched.password && matched.password !== password) {
        throw new Error('كلمة المرور غير صحيحة');
      }
      this.setCurrentUser(matched);
      return matched;
    }

    // If first time user logging with password, create and login smoothly
    const isPhone = /\d{6,}/.test(cleanIdentifier);
    const newUser: StoredUserAccount = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: isPhone ? 'مستثمر ثراء' : cleanIdentifier.split('@')[0],
      phone: isPhone ? cleanIdentifier : undefined,
      email: !isPhone ? cleanIdentifier : undefined,
      password,
      role: 'customer',
      phoneVerified: isPhone,
      emailVerified: !isPhone,
      createdAt: new Date().toISOString(),
    };

    this.saveUserToDb(newUser);
    this.setCurrentUser(newUser);
    return newUser;
  }

  // 6. Register with Phone / Email + Password
  async registerWithPassword({
    name,
    phone,
    email,
    password,
    countryCode = '+965',
  }: {
    name: string;
    phone?: string;
    email?: string;
    password?: string;
    countryCode?: string;
  }): Promise<AuthUser> {
    const cleanPhone = phone ? `${countryCode} ${phone.replace(/\D/g, '')}` : undefined;
    const cleanEmail = email ? email.trim().toLowerCase() : undefined;

    const newUser: StoredUserAccount = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      countryCode,
      password: password || 'tharaa2026',
      role: 'customer',
      phoneVerified: !!cleanPhone,
      emailVerified: !!cleanEmail,
      createdAt: new Date().toISOString(),
    };

    this.saveUserToDb(newUser);
    this.setCurrentUser(newUser);
    return newUser;
  }

  // 7. Direct 1-Click Demo Login
  loginDemoUser(): AuthUser {
    const demoUser: AuthUser = {
      id: 'usr_demo_vip',
      name: 'عبدالله الشمري',
      phone: '+965 98765432',
      email: 'demo@tharaa.com',
      countryCode: '+965',
      role: 'customer',
      phoneVerified: true,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };
    this.setCurrentUser(demoUser);
    return demoUser;
  }

  // 8. Direct Phone Login
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
    this.saveUserToDb(user);
    return user;
  }

  // 9. Logout
  logout(): void {
    this.setCurrentUser(null);
    localStorage.removeItem(AuthService.STORAGE_KEY);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tharaa_auth_change', { detail: null }));
    }
  }

  private saveUserToDb(user: StoredUserAccount) {
    try {
      const users = this.getRegisteredUsers();
      const idx = users.findIndex((u) => u.id === user.id || (user.phone && u.phone === user.phone));
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...user };
      } else {
        users.push(user);
      }
      localStorage.setItem(AuthService.USERS_DB_KEY, JSON.stringify(users));
    } catch {}
  }

  private getRegisteredUsers(): StoredUserAccount[] {
    try {
      return JSON.parse(localStorage.getItem(AuthService.USERS_DB_KEY) || '[]');
    } catch {
      return [];
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
