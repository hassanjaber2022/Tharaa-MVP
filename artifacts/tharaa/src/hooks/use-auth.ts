import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetCurrentUser,
  getGetCurrentUserQueryKey,
} from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { authService, AuthUser } from '@/lib/auth-service';

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [localUser, setLocalUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  // Global cross-component synchronization listener
  useEffect(() => {
    const handleAuthChange = () => {
      setLocalUser(authService.getCurrentUser());
    };

    window.addEventListener('tharaa_auth_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('tharaa_auth_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const { data: apiUser } = useGetCurrentUser({
    query: {
      retry: false,
      enabled: false,
      queryKey: getGetCurrentUserQueryKey(),
    },
  });

  const activeUser = localUser;

  // 1. Login with Phone OTP
  const loginWithPhoneOtp = useCallback(
    async (phone: string, countryCode: string, code?: string, name?: string) => {
      const user = await authService.verifyPhoneOtp(phone, countryCode, code, name);
      setLocalUser(user);
      queryClient.setQueryData(getGetCurrentUserQueryKey(), user);
      return user;
    },
    [queryClient]
  );

  // 2. Login with Email OTP
  const loginWithEmailOtp = useCallback(
    async (email: string, code?: string, name?: string) => {
      const user = await authService.verifyEmailOtp(email, code, name);
      setLocalUser(user);
      queryClient.setQueryData(getGetCurrentUserQueryKey(), user);
      return user;
    },
    [queryClient]
  );

  // 3. Send Phone OTP
  const sendPhoneOtp = useCallback(async (phone: string, countryCode: string) => {
    return await authService.sendPhoneOtp(phone, countryCode);
  }, []);

  // 4. Send Email OTP
  const sendEmailOtp = useCallback(async (email: string) => {
    return await authService.sendEmailOtp(email);
  }, []);

  // 5. Phone / Email + Password Login
  const loginWithPassword = useCallback(
    async (identifier: string, password: string) => {
      const user = await authService.loginWithPassword(identifier, password);
      setLocalUser(user);
      queryClient.setQueryData(getGetCurrentUserQueryKey(), user);
      return user;
    },
    [queryClient]
  );

  // 6. Register with Phone / Email + Password
  const registerWithPassword = useCallback(
    async (params: {
      name: string;
      phone?: string;
      email?: string;
      password?: string;
      countryCode?: string;
    }) => {
      const user = await authService.registerWithPassword(params);
      setLocalUser(user);
      queryClient.setQueryData(getGetCurrentUserQueryKey(), user);
      return user;
    },
    [queryClient]
  );

  // 7. Direct Phone Login
  const loginWithPhoneDirect = useCallback(
    (phone: string, countryCode: string, name?: string) => {
      const user = authService.loginWithPhoneDirect(phone, countryCode, name);
      setLocalUser(user);
      queryClient.setQueryData(getGetCurrentUserQueryKey(), user);
      return user;
    },
    [queryClient]
  );

  // 8. Demo User Login
  const loginDemoUser = useCallback(() => {
    const user = authService.loginDemoUser();
    setLocalUser(user);
    queryClient.setQueryData(getGetCurrentUserQueryKey(), user);
    return user;
  }, [queryClient]);

  // 9. Legacy / Simple Email Login
  const loginWithEmail = useCallback(
    async (email: string, password?: string) => {
      const user = password
        ? await authService.loginWithPassword(email, password)
        : await authService.verifyEmailOtp(email);
      setLocalUser(user);
      queryClient.setQueryData(getGetCurrentUserQueryKey(), user);
      return user;
    },
    [queryClient]
  );

  // 10. Logout
  const logout = useCallback(() => {
    authService.logout();
    setLocalUser(null);
    queryClient.removeQueries({ queryKey: getGetCurrentUserQueryKey() });
    queryClient.setQueryData(getGetCurrentUserQueryKey(), null);
    queryClient.clear();

    toast({
      title: 'تم تسجيل الخروج بنجاح 👋',
      description: 'نراك قريباً في ثراء',
    });

    setLocation('/login');
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }, 100);
    }

    try {
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {}
  }, [queryClient, setLocation, toast]);

  return {
    user: activeUser,
    isLoading: false,
    isAuthenticated: !!activeUser,
    loginWithPhoneOtp,
    loginWithEmailOtp,
    sendPhoneOtp,
    sendEmailOtp,
    loginWithPassword,
    registerWithPassword,
    loginWithPhoneDirect,
    loginDemoUser,
    loginWithEmail,
    logout,
    isLoggingOut: false,
  };
}
