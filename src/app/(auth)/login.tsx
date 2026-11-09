// src/app/(auth)/login.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { TextField } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Smartphone,
  KeyRound,
  ArrowRight,
  Globe,
  Apple,
} from 'lucide-react-native';
import { useTranslation } from '@/localization/i18n';
import { openPrivacyPolicy } from '@/utils/legal';

type LoginMode = 'otp' | 'password';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const login = useAuthStore((state) => state.login);
  const sendOtp = useAuthStore((state) => state.sendOtp);
  const loginAsGuest = useAuthStore((state) => state.loginAsGuest);

  const [loginMode, setLoginMode] = useState<LoginMode>('otp');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Login via OTP
  const handleSendOtp = async () => {
    const cleaned = phoneNumber.replace(/\D/g, '').slice(-10);
    if (cleaned.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await sendOtp(cleaned);
      if (res.success) {
        router.push({
          pathname: '/(auth)/verify-otp',
          params: { phone: cleaned },
        });
      } else {
        setError(res.message || 'Failed to dispatch verification OTP. Try again.');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to send verification code via SMS.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Login via Password
  const handlePasswordLogin = async () => {
    const cleaned = phoneNumber.trim();
    if (!cleaned) {
      setError('Please enter your registered mobile number or email.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await login(cleaned, password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message || 'Invalid credentials. Please verify your phone and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    await loginAsGuest();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View style={styles.headerBox}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>UBS</Text>
            </View>
            <Text style={[styles.welcomeText, { color: theme.textPrimary }]}>
              Welcome to UBS Super
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Your all-in-one hyperlocal ecosystem for groceries, food, taxi, and services
            </Text>
          </View>

          {/* Login Method Segmented Switcher */}
          <View style={[styles.segmentContainer, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
            <TouchableOpacity
              style={[
                styles.segmentTab,
                loginMode === 'otp' && [styles.segmentActive, { backgroundColor: theme.primary }],
              ]}
              onPress={() => {
                setLoginMode('otp');
                setError('');
              }}
              activeOpacity={0.8}
            >
              <Smartphone
                size={16}
                color={loginMode === 'otp' ? '#FFFFFF' : theme.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.segmentText,
                  { color: loginMode === 'otp' ? '#FFFFFF' : theme.textSecondary },
                ]}
              >
                Login with OTP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentTab,
                loginMode === 'password' && [styles.segmentActive, { backgroundColor: theme.primary }],
              ]}
              onPress={() => {
                setLoginMode('password');
                setError('');
              }}
              activeOpacity={0.8}
            >
              <KeyRound
                size={16}
                color={loginMode === 'password' ? '#FFFFFF' : theme.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.segmentText,
                  { color: loginMode === 'password' ? '#FFFFFF' : theme.textSecondary },
                ]}
              >
                Login with Password
              </Text>
            </TouchableOpacity>
          </View>

          {/* Error Banner */}
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: theme.error + '14', borderColor: theme.error + '40' }]}>
              <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
            </View>
          ) : null}



          {/* Form Fields Based on Selected Login Mode */}
          {loginMode === 'otp' ? (
            // ================= MODE A: LOGIN WITH OTP =================
            <View style={styles.formSection}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
                Mobile Number
              </Text>
              <View style={styles.phoneInputContainer}>
                <View style={[styles.countryCodeBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[styles.countryCodeText, { color: theme.textPrimary }]}>🇮🇳 +91</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <TextField
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Enter 10-digit mobile number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    leftIcon={<Phone size={18} color={theme.textMuted} />}
                    containerStyle={{ marginVertical: 0 }}
                  />
                </View>
              </View>

              <View style={styles.infoBox}>
                <ShieldCheck size={16} color={theme.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                  We will send a 6-digit verification code via secure SMS to authenticate you.
                </Text>
              </View>

              <Button
                title="Send Verification OTP"
                size="lg"
                loading={loading}
                onPress={handleSendOtp}
                style={{ marginTop: Spacing.lg }}
              />
            </View>
          ) : (
            // ================= MODE B: LOGIN WITH PASSWORD =================
            <View style={styles.formSection}>
              <TextField
                label="Registered Phone or Email"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter 10-digit phone or email address"
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Phone size={18} color={theme.textMuted} />}
              />

              <TextField
                label={t('auth.password')}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter account password"
                secureTextEntry={!showPassword}
                leftIcon={<Lock size={18} color={theme.textMuted} />}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {showPassword ? (
                      <EyeOff size={18} color={theme.textMuted} />
                    ) : (
                      <Eye size={18} color={theme.textMuted} />
                    )}
                  </TouchableOpacity>
                }
              />

              <View style={styles.rowForgot}>
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/forgot-password')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.forgotText, { color: theme.primary }]}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <Button
                title="Sign In with Password"
                size="lg"
                loading={loading}
                onPress={handlePasswordLogin}
                style={{ marginTop: Spacing.md }}
              />
            </View>
          )}

          {/* Social / Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.line, { backgroundColor: theme.border }]} />
            <Text style={[styles.dividerText, { color: theme.textMuted }]}>
              {t('common.or') || 'OR'}
            </Text>
            <View style={[styles.line, { backgroundColor: theme.border }]} />
          </View>

          <Button
            title="Explore App as Guest"
            variant="outline"
            size="md"
            onPress={handleGuest}
            style={{ marginBottom: Spacing.lg }}
          />

          {/* Footer Register Link */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register')}
              activeOpacity={0.7}
            >
              <Text style={[styles.signUpText, { color: theme.primary }]}>
                {' '}
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Legal / Privacy Policy Footer */}
          <View style={{ alignItems: 'center', marginTop: Spacing.xl, paddingBottom: Spacing.sm }}>
            <TouchableOpacity onPress={() => openPrivacyPolicy()} activeOpacity={0.7}>
              <Text style={{ fontSize: 12, color: theme.textMuted, textDecorationLine: 'underline' }}>
                Privacy Policy • UBS Super
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  headerBox: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#16A34A', // UBS Primary Green
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 20,
    letterSpacing: -0.5,
  },
  welcomeText: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: Typography.sizes.sm + 1,
    lineHeight: 20,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  segmentActive: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
  },
  errorBox: {
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '600',
  },
  formSection: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countryCodeBox: {
    height: 48,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontWeight: '700',
    fontSize: Typography.sizes.sm,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  infoText: {
    fontSize: Typography.sizes.xs,
    lineHeight: 16,
    flex: 1,
  },
  rowForgot: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  forgotText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.semibold,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: Typography.sizes.xs,
    paddingHorizontal: Spacing.md,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  footerText: {
    fontSize: Typography.sizes.sm,
  },
  signUpText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
});
