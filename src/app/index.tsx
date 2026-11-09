// src/app/index.tsx
import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ActivityIndicator, 
  Animated, 
  Dimensions,
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { Colors } from '@/constants/colors';
import { APP_CONFIG } from '@/constants/config';
import { Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const LOGO_IMAGE = require('../../assets/images/logo.png');

import { useLanguageStore } from '@/localization/languageStore';
import { t } from '@/localization/i18n';

export default function SplashScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasSeenOnboarding = useAuthStore((state) => state.hasSeenOnboarding);
  const hasSelectedLanguage = useLanguageStore((state) => state.hasSelectedLanguage);

  const [statusMessage, setStatusMessage] = useState('Connecting to UBS Super Ecosystem...');

  // Smooth entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Run entrance sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(badgeAnim, {
        toValue: 1,
        duration: 900,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();

    const t1 = setTimeout(() => {
      setStatusMessage('Verifying secure session...');
    }, 800);

    const t2 = setTimeout(() => {
      setStatusMessage(t('home.welcome'));
    }, 1400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    const navigateNext = () => {
      if (!hasSelectedLanguage) {
        router.replace('/language-select' as any);
      } else if (!hasSeenOnboarding) {
        router.replace('/(auth)/onboarding');
      } else if (!isAuthenticated) {
        router.replace('/(auth)/login');
      } else {
        router.replace('/(tabs)');
      }
    };

    if (!isLoading) {
      const timer = setTimeout(navigateNext, 1600);
      return () => clearTimeout(timer);
    }

    // Fail-safe: Never leave the user stuck on the splash screen longer than 3 seconds
    const fallbackTimer = setTimeout(navigateNext, 3000);
    return () => clearTimeout(fallbackTimer);
  }, [isLoading, isAuthenticated, hasSeenOnboarding, hasSelectedLanguage]);


  return (
    <LinearGradient
      colors={
        isDarkMode
          ? ['#062A14', '#0A3F1F', '#04170B']
          : ['#FFFFFF', '#F0FDF4', '#DCFCE7']
      }
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Animated Brand Hero */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Official Logo Card */}
          <View style={[styles.logoCard, { backgroundColor: '#FFFFFF' }]}>
            <Image
              source={LOGO_IMAGE}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Ecosystem Tagline */}
          <Text
            style={[
              styles.tagline,
              { color: isDarkMode ? '#86EFAC' : '#15803D' },
            ]}
          >
            Your Everyday Super App
          </Text>

          {/* Micro Category Pills */}
          <Animated.View style={[styles.pillsRow, { opacity: badgeAnim }]}>
            {['Grocery', 'Taxi', 'Food', 'Logistics', 'Health'].map((service, index) => (
              <View
                key={service}
                style={[
                  styles.pill,
                  {
                    backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.15)' : 'rgba(22, 163, 74, 0.10)',
                    borderColor: isDarkMode ? 'rgba(34, 197, 94, 0.3)' : 'rgba(22, 163, 74, 0.25)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    { color: isDarkMode ? '#4ADE80' : '#166534' },
                  ]}
                >
                  {service}
                </Text>
              </View>
            ))}
          </Animated.View>
        </Animated.View>
      </View>

      {/* Loading Footer */}
      <View style={styles.footer}>
        <ActivityIndicator
          size="small"
          color={isDarkMode ? '#4ADE80' : '#16A34A'}
        />
        <Text
          style={[
            styles.statusText,
            { color: isDarkMode ? '#94A3B8' : '#475569' },
          ]}
        >
          {statusMessage}
        </Text>
        <Text
          style={[
            styles.versionText,
            { color: isDarkMode ? '#64748B' : '#94A3B8' },
          ]}
        >
          v{APP_CONFIG.version} • Secured with Central Hub
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xxl * 1.5,
    paddingHorizontal: Spacing.xl,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCard: {
    width: Math.min(SCREEN_WIDTH * 0.72, 280),
    height: Math.min(SCREEN_WIDTH * 0.72, 280),
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
      default: {
        boxShadow: '0 12px 32px rgba(22, 163, 74, 0.18)',
      },
    }),
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  tagline: {
    fontSize: Typography.sizes.md,
    fontWeight: '700',
    marginTop: Spacing.xl,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: 6,
    maxWidth: SCREEN_WIDTH * 0.85,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.md,
  },
  statusText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '500',
    marginTop: Spacing.sm,
    letterSpacing: 0.3,
  },
  versionText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 0.4,
  },
});
