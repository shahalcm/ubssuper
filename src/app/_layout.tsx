// src/app/_layout.tsx
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useCartStore } from '@/store/cartStore';
import { useLanguageStore } from '@/localization/languageStore';
import { LoginRequiredModal } from '@/components/modals/LoginRequiredModal';
import { StoreConflictModal } from '@/components/modals/StoreConflictModal';
import { PopupMessageModal } from '@/components/modals/PopupMessageModal';
import { Colors } from '@/constants/colors';

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

export default function RootLayout() {
  const initializeAuth = useAuthStore((state) => state.initialize);
  const loadTheme = useThemeStore((state) => state.loadTheme);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const initializeLanguage = useLanguageStore((state) => state.initializeLanguage);

  const isLoginModalOpen = useCartStore((state) => state.isLoginModalOpen);
  const closeLoginModal = useCartStore((state) => state.closeLoginModal);

  useEffect(() => {
    Promise.all([
      initializeLanguage(),
      initializeAuth(),
      loadTheme(),
    ]).finally(() => {
      SplashScreen.hideAsync().catch(() => {});
    });
  }, []);

  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <StatusBar style={isDarkMode ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.background },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="language-select" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
          </Stack>

          <LoginRequiredModal
            visible={isLoginModalOpen}
            onClose={closeLoginModal}
          />
          <StoreConflictModal />
          <PopupMessageModal />
        </SafeAreaProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

