// src/app/(auth)/verify-otp.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  NativeSyntheticEvent,
  TextInputKeyPressEventData
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/localization/i18n';

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const phone = (params.phone as string) || '';

  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const verifyOtp = useAuthStore((state) => state.verifyOtp);
  const sendOtp = useAuthStore((state) => state.sendOtp);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  const inputRefs = useRef<Array<TextInput | null>>([]);

  const requestOtp = async () => {
    if (!phone) {
      setErrorMessage('Missing phone number. Please go back and enter your mobile number.');
      return;
    }
    try {
      const res = await sendOtp(phone);
      if (!res.success) {
        setErrorMessage(res.message || 'SMS delivery failed. Check your network or contact support.');
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to dispatch verification code via SMS.');
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);


  const handleChangeText = (val: string, index: number) => {
    const cleaned = val.replace(/\D/g, '');

    // Multi-digit paste or SMS autofill
    if (cleaned.length >= 4) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = cleaned[i] || '';
      }
      setOtp(newOtp);
      const targetIdx = Math.min(cleaned.length, 5);
      inputRefs.current[targetIdx]?.focus();
      return;
    }

    // Single digit input
    const char = cleaned.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    // Auto-advance to next input box
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleVerify = async () => {
    const code = otp.join('').trim();
    if (code.length < 6) {
      setErrorMessage('Please enter the complete 6-digit verification code received by SMS.');
      return;
    }
    setErrorMessage('');
    setLoading(true);
    try {
      await verifyOtp(phone, code);
      router.replace('/(tabs)');
    } catch (e: any) {
      setErrorMessage(e.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer === 0) {
      setTimer(60);
      setErrorMessage('');
      await requestOtp();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <ArrowLeft size={22} color={theme.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerBox}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>{t('auth.verifyOtp')}</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {t('auth.otpSubtitle')} <Text style={{ color: theme.textPrimary, fontWeight: '700' }}>{phone || 'your phone'}</Text>
            </Text>
            {errorMessage ? (
              <Text style={{ color: Colors.light.error, marginTop: Spacing.sm, fontSize: 13, fontWeight: '600' }}>
                {errorMessage}
              </Text>
            ) : null}
          </View>

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.otpInput,
                  { 
                    backgroundColor: theme.surface, 
                    borderColor: focusedIndex === index 
                      ? theme.primary 
                      : (digit ? theme.primary : theme.border),
                    borderWidth: focusedIndex === index ? 2 : 1.5,
                    color: theme.textPrimary,
                  },
                ]}
                maxLength={6}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                selectTextOnFocus
                value={digit}
                onFocus={() => setFocusedIndex(index)}
                onBlur={() => {
                  if (focusedIndex === index) setFocusedIndex(-1);
                }}
                onChangeText={(val) => handleChangeText(val, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>

          <Button
            title={t('auth.verifyAndProceed')}
            size="lg"
            loading={loading}
            onPress={handleVerify}
            style={styles.verifyBtn}
          />

          <View style={styles.resendRow}>
            <Text style={[styles.resendText, { color: theme.textSecondary }]}>{t('auth.didNotReceive')}</Text>
            <TouchableOpacity disabled={timer > 0} onPress={handleResend} activeOpacity={0.7}>
              <Text
                style={[
                  styles.resendAction,
                  { color: timer > 0 ? theme.textMuted : theme.primary },
                ]}
              >
                {timer > 0 ? ` ${t('common.resendIn', { seconds: timer })}` : ` ${t('auth.resendOtp')}`}
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: Spacing.xs,
    marginBottom: Spacing.md,
    marginLeft: -Spacing.xs,
  },
  headerBox: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.sizes.sm + 1,
    lineHeight: 20,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.lg,
    gap: 8,
  },
  otpInput: {
    flex: 1,
    maxWidth: 50,
    height: 56,
    borderRadius: BorderRadius.md,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 22,
    fontWeight: '700',
    padding: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    includeFontPadding: false,
  },
  verifyBtn: {
    marginTop: Spacing.xl,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },
  resendText: {
    fontSize: Typography.sizes.sm,
  },
  resendAction: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
});
