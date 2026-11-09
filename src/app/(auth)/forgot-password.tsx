// src/app/(auth)/forgot-password.tsx
import React, { useState, useEffect } from 'react';
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
  ArrowLeft,
  Phone,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react-native';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const sendOtp = useAuthStore((state) => state.sendOtp);
  const resetPassword = useAuthStore((state) => state.resetPassword);

  // Flow step: 1 = Enter Phone, 2 = Enter OTP & New Password, 3 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let interval: any = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // Step 1: Request OTP for password reset
  const handleRequestOtp = async () => {
    const cleaned = phone.replace(/\D/g, '').slice(-10);
    if (cleaned.length !== 10) {
      setError('Please enter a valid 10-digit registered mobile number.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await sendOtp(cleaned);
      if (res.success) {
        setStep(2);
        setTimer(60);
      } else {
        setError(res.message || 'Failed to dispatch verification OTP. Try again.');
      }
    } catch (e: any) {
      setError(e.message || 'Could not send reset code via SMS.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResendOtp = async () => {
    if (timer > 0) return;
    const cleaned = phone.replace(/\D/g, '').slice(-10);
    setError('');
    setLoading(true);
    try {
      const res = await sendOtp(cleaned);
      if (res.success) {
        setTimer(60);
      } else {
        setError(res.message || 'Failed to resend OTP.');
      }
    } catch (e: any) {
      setError(e.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm OTP & Reset Password
  const handleResetPassword = async () => {
    const cleanedOtp = otpCode.trim();
    if (cleanedOtp.length < 6) {
      setError('Please enter the 6-digit OTP code received by SMS.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const cleanedPhone = phone.replace(/\D/g, '').slice(-10);
      await resetPassword(cleanedPhone, cleanedOtp, newPassword);
      setStep(3);
    } catch (e: any) {
      setError(e.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
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
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (step === 2 ? setStep(1) : router.back())}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeft size={22} color={theme.textPrimary} />
          </TouchableOpacity>

          {/* STEP 1: ENTER PHONE */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <View style={styles.headerBox}>
                <View style={[styles.iconCircle, { backgroundColor: theme.primary + '18' }]}>
                  <KeyRound size={28} color={theme.primary} />
                </View>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Forgot Password?</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Enter your registered mobile number. We will dispatch a 6-digit verification code via SMS to reset your password.
                </Text>
              </View>

              {error ? (
                <View style={[styles.errorBox, { backgroundColor: theme.error + '14', borderColor: theme.error + '40' }]}>
                  <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.phoneInputRow}>
                <View style={[styles.countryCodeBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[styles.countryCodeText, { color: theme.textPrimary }]}>🇮🇳 +91</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <TextField
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter 10-digit mobile number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    leftIcon={<Phone size={18} color={theme.textMuted} />}
                    containerStyle={{ marginVertical: 0 }}
                  />
                </View>
              </View>

              <Button
                title="Send Verification OTP"
                size="lg"
                loading={loading}
                onPress={handleRequestOtp}
                style={{ marginTop: Spacing.xl }}
              />

              <Button
                title="Back to Login"
                variant="ghost"
                size="md"
                onPress={() => router.back()}
                style={{ marginTop: Spacing.md }}
              />
            </View>
          )}

          {/* STEP 2: VERIFY OTP & CREATE NEW PASSWORD */}
          {step === 2 && (
            <View style={styles.stepContainer}>
              <View style={styles.headerBox}>
                <View style={[styles.iconCircle, { backgroundColor: theme.primary + '18' }]}>
                  <Lock size={28} color={theme.primary} />
                </View>
                <Text style={[styles.title, { color: theme.textPrimary }]}>Set New Password</Text>
                <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                  Enter the 6-digit code sent to +91 {phone} and choose a strong new password.
                </Text>
              </View>

              {error ? (
                <View style={[styles.errorBox, { backgroundColor: theme.error + '14', borderColor: theme.error + '40' }]}>
                  <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
                </View>
              ) : null}

              <TextField
                label="6-Digit SMS Verification Code"
                value={otpCode}
                onChangeText={setOtpCode}
                placeholder="Enter 6-digit OTP"
                keyboardType="number-pad"
                maxLength={6}
                leftIcon={<KeyRound size={18} color={theme.textMuted} />}
              />

              <TextField
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Minimum 6 characters"
                secureTextEntry={!showNewPassword}
                leftIcon={<Lock size={18} color={theme.textMuted} />}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} color={theme.textMuted} />
                    ) : (
                      <Eye size={18} color={theme.textMuted} />
                    )}
                  </TouchableOpacity>
                }
              />

              <TextField
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter new password"
                secureTextEntry={!showConfirmPassword}
                leftIcon={<Lock size={18} color={theme.textMuted} />}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} color={theme.textMuted} />
                    ) : (
                      <Eye size={18} color={theme.textMuted} />
                    )}
                  </TouchableOpacity>
                }
              />

              <View style={styles.resendRow}>
                <Text style={[styles.resendText, { color: theme.textSecondary }]}>
                  Didn't receive code?
                </Text>
                <TouchableOpacity disabled={timer > 0} onPress={handleResendOtp} activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.resendAction,
                      { color: timer > 0 ? theme.textMuted : theme.primary },
                    ]}
                  >
                    {timer > 0 ? ` Resend in ${timer}s` : ' Resend OTP'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Button
                title="Reset & Update Password"
                size="lg"
                loading={loading}
                onPress={handleResetPassword}
                style={{ marginTop: Spacing.lg }}
              />
            </View>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 3 && (
            <View style={[styles.stepContainer, { alignItems: 'center', paddingTop: Spacing.xl }]}>
              <View style={[styles.iconCircle, { width: 72, height: 72, backgroundColor: '#DCFCE7', marginBottom: Spacing.lg }]}>
                <CheckCircle2 size={40} color="#16A34A" />
              </View>

              <Text style={[styles.title, { color: theme.textPrimary, textAlign: 'center' }]}>
                Password Reset Successful!
              </Text>

              <Text
                style={[
                  styles.subtitle,
                  { color: theme.textSecondary, textAlign: 'center', marginTop: Spacing.xs, marginBottom: Spacing.xl },
                ]}
              >
                Your account password has been updated. You can now log in using your new credentials.
              </Text>

              <Button
                title="Proceed to Login"
                size="lg"
                onPress={() => router.replace('/(auth)/login')}
                style={{ width: '100%' }}
              />
            </View>
          )}
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
  backButton: {
    alignSelf: 'flex-start',
    padding: Spacing.xs,
    marginBottom: Spacing.md,
    marginLeft: -Spacing.xs,
  },
  stepContainer: {
    width: '100%',
  },
  headerBox: {
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: Typography.sizes.sm + 1,
    lineHeight: 20,
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
  phoneInputRow: {
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
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  resendText: {
    fontSize: Typography.sizes.sm,
  },
  resendAction: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
});
