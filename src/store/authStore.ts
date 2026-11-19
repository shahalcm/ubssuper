// src/store/authStore.ts
import { create } from 'zustand';
import { User } from '@/types';
import { storage, secureStorage } from '@/utils/storage';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { unregisterDeviceToken } from '@/services/notifications/pushNotificationService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  hasSeenOnboarding: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  login: (phoneOrEmail: string, pass: string) => Promise<boolean>;
  register: (
    name: string,
    phone: string,
    email: string,
    password?: string,
    locationData?: {
      address?: {
        fullAddress?: string;
        houseNumber?: string;
        street?: string;
        locality?: string;
        city?: string;
        district?: string;
        state?: string;
        pincode?: string;
        country?: string;
      };
      location?: {
        type: 'Point';
        coordinates: [number, number];
      };
      locationSource?: 'gps' | 'pincode' | 'manual';
    }
  ) => Promise<boolean>;
  resetPassword: (phone: string, otp: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  loginAsGuest: () => Promise<void>;

  completeOnboarding: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: (reason?: string) => Promise<{ success: boolean; message: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isGuest: false,
  hasSeenOnboarding: false,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      const onboardingStatus = await storage.getItem<boolean>('has_seen_onboarding');
      const savedUser = await storage.getItem<User>('user_session');
      const isGuestMode = await storage.getItem<boolean>('is_guest_mode');
      const token = await secureStorage.getSecureToken('user_auth_token');

      if (token && !isGuestMode) {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Auth profile check timeout')), 2500)
          );
          const profile: any = await Promise.race([
            apiClient.get(ENDPOINTS.AUTH.ME),
            timeoutPromise,
          ]);
          if (profile && profile.userId) {
            const liveUser: User = {
              id: profile.userId,
              name: profile.fullName || 'Customer',
              email: profile.email || 'customer@ubssuper.com',
              phone: profile.phone || '+91 98765 43210',
              avatar: profile.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
              isGuest: false,
              memberSince: 'Oct 2026',
            };
            await storage.setItem('user_session', liveUser);
            set({
              hasSeenOnboarding: !!onboardingStatus,
              user: liveUser,
              isAuthenticated: true,
              isGuest: false,
              isLoading: false,
            });
            return;
          }
        } catch {
          // Fall back immediately to saved local user session if offline or slow
        }
      }


      set({
        hasSeenOnboarding: !!onboardingStatus,
        user: savedUser,
        isAuthenticated: !!savedUser,
        isGuest: !!isGuestMode,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  sendOtp: async (phone: string) => {
    try {
      const res: any = await apiClient.post(ENDPOINTS.AUTH.SEND_OTP, { phone });
      return {
        success: true,
        message: res?.message || 'OTP sent successfully via SMS',
      };
    } catch (e: any) {
      return {
        success: false,
        message: e.message || 'Failed to dispatch OTP SMS',
      };
    }
  },

  verifyOtp: async (phone: string, otp: string) => {
    set({ isLoading: true, error: null });
    try {
      const res: any = await apiClient.post(ENDPOINTS.AUTH.VERIFY_OTP, { phone, otp });
      const token = res?.tokens?.accessToken || res?.token;
      const refreshToken = res?.tokens?.refreshToken || res?.refreshToken;
      const u = res?.user;

      if (token) {
        await secureStorage.setSecureToken('user_auth_token', token);
      }
      if (refreshToken) {
        await secureStorage.setSecureToken('user_refresh_token', refreshToken);
      }

      const activeUser: User = {
        id: u?.userId || `usr-${phone.slice(-4)}`,
        name: u?.fullName || 'UBS Super Customer',
        phone: u?.phone || phone,
        email: u?.email || 'customer@ubssuper.com',
        avatar: u?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        isGuest: false,
        memberSince: 'Oct 2026',
      };

      await storage.setItem('user_session', activeUser);
      await storage.removeItem('is_guest_mode');
      set({ user: activeUser, isAuthenticated: true, isGuest: false, isLoading: false });
      return true;
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      throw e;
    }
  },


  login: async (phoneOrEmail, pass) => {
    set({ isLoading: true, error: null });
    try {
      const isEmail = phoneOrEmail.includes('@');
      const payload = isEmail
        ? { email: phoneOrEmail, password: pass }
        : { phone: phoneOrEmail, password: pass };

      const res: any = await apiClient.post(ENDPOINTS.AUTH.LOGIN, payload);
      const token = res?.tokens?.accessToken || res?.token;
      const refreshToken = res?.tokens?.refreshToken || res?.refreshToken;
      const u = res?.user;

      if (token) {
        await secureStorage.setSecureToken('user_auth_token', token);
      }
      if (refreshToken) {
        await secureStorage.setSecureToken('user_refresh_token', refreshToken);
      }

      const loggedUser: User = {
        id: u?.userId || 'usr-9901',
        name: u?.fullName || 'Customer',
        email: u?.email || (isEmail ? phoneOrEmail : 'customer@ubssuper.com'),
        phone: u?.phone || (!isEmail ? phoneOrEmail : '+91 98765 43210'),
        avatar: u?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        isGuest: false,
        memberSince: 'Oct 2026',
      };

      await storage.setItem('user_session', loggedUser);
      await storage.removeItem('is_guest_mode');
      set({ user: loggedUser, isAuthenticated: true, isGuest: false, isLoading: false });
      return true;
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      throw e;
    }
  },

  register: async (name, phone, email, password, locationData) => {
    set({ isLoading: true, error: null });
    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const payload: any = {
        fullName: name,
        phone: cleanPhone,
        email,
        password: password || 'Password@123',
        role: 'CUSTOMER',
      };

      if (locationData?.address) {
        payload.address = locationData.address;
      }
      if (locationData?.location) {
        payload.location = locationData.location;
      }
      if (locationData?.locationSource) {
        payload.locationSource = locationData.locationSource;
      }

      const res: any = await apiClient.post(ENDPOINTS.AUTH.REGISTER, payload);
      const token = res?.tokens?.accessToken || res?.token;
      const refreshToken = res?.tokens?.refreshToken || res?.refreshToken;
      const u = res?.user;

      if (token) {
        await secureStorage.setSecureToken('user_auth_token', token);
      }
      if (refreshToken) {
        await secureStorage.setSecureToken('user_refresh_token', refreshToken);
      }

      const newUser: User = {
        id: u?.userId || `usr-${Date.now()}`,
        name: u?.fullName || name,
        email: u?.email || email,
        phone: u?.phone || phone,
        avatar: u?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        isGuest: false,
        memberSince: 'Oct 2026',
      };

      await storage.setItem('user_session', newUser);
      await storage.removeItem('is_guest_mode');
      set({ user: newUser, isAuthenticated: true, isGuest: false, isLoading: false });
      return true;
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      throw e;
    }
  },

  resetPassword: async (phone: string, otp: string, newPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const res: any = await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, {
        phone: cleanPhone,
        otp,
        newPassword,
      });
      set({ isLoading: false });
      return {
        success: true,
        message: res?.message || 'Password successfully reset.',
      };
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      throw e;
    }
  },


  loginAsGuest: async () => {
    const guestUser: User = {
      id: 'usr-guest',
      name: 'Guest Explorer',
      email: 'guest@ubssuper.com',
      phone: '+91 00000 00000',
      isGuest: true,
    };
    await storage.setItem('is_guest_mode', true);
    set({ user: guestUser, isAuthenticated: true, isGuest: true });
  },

  completeOnboarding: async () => {
    await storage.setItem('has_seen_onboarding', true);
    set({ hasSeenOnboarding: true });
  },

  logout: async () => {
    try {
      await unregisterDeviceToken().catch(() => {});
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Local cleanup proceeds regardless
    }
    await storage.removeItem('user_session');
    await storage.removeItem('is_guest_mode');
    await secureStorage.deleteSecureToken('user_auth_token');
    await secureStorage.deleteSecureToken('user_refresh_token');
    set({ user: null, isAuthenticated: false, isGuest: false });
  },

  deleteAccount: async (reason?: string) => {
    set({ isLoading: true, error: null });
    try {
      const res: any = await apiClient.delete(ENDPOINTS.CUSTOMERS.DELETE_ACCOUNT, {
        data: { reason: reason || 'Customer requested in-app account deletion' },
      });
      await storage.removeItem('user_session');
      await storage.removeItem('is_guest_mode');
      await secureStorage.deleteSecureToken('user_auth_token');
      await secureStorage.deleteSecureToken('user_refresh_token');
      set({ user: null, isAuthenticated: false, isGuest: false, isLoading: false });
      return {
        success: true,
        message: res?.message || 'Your account and personal data have been permanently deleted.',
      };
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      throw e;
    }
  },
}));
