// src/components/modals/LoginRequiredModal.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { Button } from '@/components/ui/Button';
import { Lock, X, Sparkles } from 'lucide-react-native';
import { useTranslation } from '@/localization/i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LoginRequiredModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  returnRoute?: string;
}

export const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({
  visible,
  onClose,
  title,
  message,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const modalTitle = title || t('auth.login');
  const modalMessage = message || t('auth.welcomeSubtitle');

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.85);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const handleLogin = () => {
    onClose();
    router.push('/(auth)/login' as any);
  };

  const handleRegister = () => {
    onClose();
    router.push('/(auth)/register' as any);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
              borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)',
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
            Shadows.large,
          ]}
        >
          {/* Top Dismiss Button */}
          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.closeBtn,
              { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#F1F5F9' },
            ]}
            activeOpacity={0.7}
          >
            <X size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
          </TouchableOpacity>

          {/* Hero Icon with Dual-Layer Glow Rings */}
          <View style={styles.iconHeroContainer}>
            <View style={styles.glowRingOuter}>
              <View style={[styles.glowRingInner, { backgroundColor: isDarkMode ? 'rgba(22, 163, 74, 0.20)' : '#DCFCE7' }]}>
                <Lock size={32} color="#16A34A" strokeWidth={2.4} />
              </View>
            </View>
          </View>

          {/* Title & Message */}
          <Text style={[styles.title, { color: theme.textPrimary }]}>{modalTitle}</Text>
          <Text style={[styles.message, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
            {modalMessage}
          </Text>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <Button
              title={t('auth.login')}
              size="lg"
              onPress={handleLogin}
              style={styles.primaryBtn}
            />

            <Button
              title={t('auth.createAccount')}
              variant="outline"
              size="lg"
              onPress={handleRegister}
              style={styles.secondaryBtn}
            />

            <TouchableOpacity onPress={onClose} style={styles.cancelBtn} activeOpacity={0.7}>
              <Text style={[styles.cancelText, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: Math.min(SCREEN_WIDTH - 40, 390),
    borderRadius: 28,
    borderWidth: 1.5,
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 22,
    alignItems: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.22,
        shadowRadius: 28,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  iconHeroContainer: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRingOuter: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: 'rgba(22, 163, 74, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRingInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  message: {
    fontSize: 14.5,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  primaryBtn: {
    width: '100%',
    borderRadius: 14,
    height: 48,
  },
  secondaryBtn: {
    width: '100%',
    borderRadius: 14,
    height: 48,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 2,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
