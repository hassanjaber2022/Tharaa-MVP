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

  const { data: apiUser, isLoading: isApiLoading } = useGetCurrentUser({
    query: {
      retry: false,
      enabled: false,
      queryKey: getGetCurrentUserQueryKey(),
    },
  });

  // Single source of truth is local user
  const activeUser = localUser;

  const loginWithPhoneOtp = useCallback(
    async (phone: string, countryCode: string, code?: string, name?: string) => {
      const user = await authService.verifyPhoneOtp(phone, countryCode, code, name);
      setLocalUser(user);
      queryClient.setQueryData(getGetCurrentUserQueryKey(), user);
      return user;
    },
    [queryClient]
  );

  const loginWithPhoneDirect = useCallback(
    (phone: string, countryCode: string, name?: string) => {
      const user = authService.loginWithPhoneDirect(phone, countryCode, name);
      setLocalUser(user);
      queryClient.setQueryData(getGetCurrentUserQueryKey(), user);
      return user;
    },
    [queryClient]
  );

  const sendPhoneOtp = useCallback(async (phone: string, countryCode: string) => {
    return await authService.sendPhoneOtp(phone, countryCode);
  }, []);

  const loginDemoUser = useCallback(() => {
    const user = authService.loginDemoUser();
    setLocalUser(user);
    queryClient.setQueryData(getGetCurrentUserQueryKey(), user);
    return user;
  }, [queryClient]);

  const loginWithEmail = useCallback(
    async (email: string, password?: string) => {
      const user = await authService.loginWithEmail(email, password);
      setLocalUser(user);
      queryClient.setQueryData(getGetCurrentUserQueryKey(), user);
      return user;
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    // 1. Instant local logout
    authService.logout();
    setLocalUser(null);
    queryClient.removeQueries({ queryKey: getGetCurrentUserQueryKey() });
    queryClient.setQueryData(getGetCurrentUserQueryKey(), null);
    queryClient.clear();

    // 2. Immediate toast
    toast({
      title: 'تم تسجيل الخروج بنجاح 👋',
      description: 'نراك قريباً في ثراء',
    });

    // 3. Navigate cleanly to login page
    setLocation('/login');
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      setTimeout(() => {
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }, 100);
    }

    // 4. Optional background server logout without blocking UI
    try {
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {}
  }, [queryClient, setLocation, toast]);

  return {
    user: activeUser,
    isLoading: false,
    isAuthenticated: !!activeUser,
    loginWithPhoneOtp,
    loginWithPhoneDirect,
    sendPhoneOtp,
    loginDemoUser,
    loginWithEmail,
    logout,
    isLoggingOut: false,
  };
}
