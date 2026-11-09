// src/components/modals/PopupMessageModal.tsx
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
import { usePopupStore, PopupType } from '@/store/popupStore';
import { useThemeStore } from '@/store/themeStore';
import { Colors } from '@/constants/colors';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  ShieldAlert,
  HelpCircle,
  X,
  Sparkles,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TypeConfig {
  icon: any;
  iconColor: string;
  badgeBg: string;
  glowRing: string;
  defaultBtnBg: string;
  accentGradientText?: string;
}

const TYPE_CONFIGS: Record<PopupType, TypeConfig> = {
  success: {
    icon: CheckCircle2,
    iconColor: '#16A34A',
    badgeBg: '#DCFCE7',
    glowRing: 'rgba(22, 163, 74, 0.15)',
    defaultBtnBg: '#16A34A',
  },
  error: {
    icon: AlertCircle,
    iconColor: '#EF4444',
    badgeBg: '#FEE2E2',
    glowRing: 'rgba(239, 68, 68, 0.15)',
    defaultBtnBg: '#EF4444',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: '#F59E0B',
    badgeBg: '#FEF3C7',
    glowRing: 'rgba(245, 158, 11, 0.18)',
    defaultBtnBg: '#D97706',
  },
  destructive: {
    icon: ShieldAlert,
    iconColor: '#DC2626',
    badgeBg: '#FEE2E2',
    glowRing: 'rgba(220, 38, 38, 0.20)',
    defaultBtnBg: '#DC2626',
  },
  info: {
    icon: Info,
    iconColor: '#2563EB',
    badgeBg: '#DBEAFE',
    glowRing: 'rgba(37, 99, 235, 0.15)',
    defaultBtnBg: '#2563EB',
  },
  confirm: {
    icon: HelpCircle,
    iconColor: '#0D9488',
    badgeBg: '#CCFBF1',
    glowRing: 'rgba(13, 148, 136, 0.15)',
    defaultBtnBg: '#0D9488',
  },
};

export const PopupMessageModal: React.FC = () => {
  const {
    isOpen,
    type,
    title,
    message,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    buttons,
    hidePopup,
  } = usePopupStore();

  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  if (!isOpen) return null;

  const config = TYPE_CONFIGS[type] || TYPE_CONFIGS.info;
  const IconComponent = config.icon;

  const handleClose = () => {
    hidePopup();
    if (onCancel) onCancel();
  };

  const handleConfirm = () => {
    hidePopup();
    if (onConfirm) onConfirm();
  };

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.backdrop}>
        {/* Animated Card Container */}
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.06)',
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
            Shadows.large,
          ]}
        >
          {/* Top-Right Dismiss Button */}
          <TouchableOpacity
            style={[
              styles.dismissBtn,
              { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#F1F5F9' },
            ]}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <X size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
          </TouchableOpacity>

          {/* Hero Icon with Dual-Layer Glow Rings */}
          <View style={styles.iconHeroContainer}>
            <View style={[styles.glowRingOuter, { backgroundColor: config.glowRing }]}>
              <View
                style={[
                  styles.glowRingInner,
                  {
                    backgroundColor: isDarkMode ? config.iconColor + '20' : config.badgeBg,
                  },
                ]}
              >
                <IconComponent size={34} color={config.iconColor} strokeWidth={2.4} />
              </View>
            </View>
          </View>

          {/* Text Details */}
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={2}>
              {title}
            </Text>

            {Boolean(message) && (
              <Text
                style={[
                  styles.message,
                  { color: isDarkMode ? '#94A3B8' : '#475569' },
                ]}
              >
                {message}
              </Text>
            )}
          </View>

          {/* Dynamic Action Buttons */}
          <View style={styles.actionContainer}>
            {buttons && buttons.length > 0 ? (
              <View
                style={
                  buttons.length === 2 ? styles.doubleButtonsRow : styles.stackedButtonsCol
                }
              >
                {buttons.map((btn, index) => {
                  const isCancel = btn.style === 'cancel';
                  const isDestructive = btn.style === 'destructive';
                  const isPrimary = !isCancel;

                  const btnBg = isDestructive
                    ? '#DC2626'
                    : isCancel
                    ? isDarkMode
                      ? '#1E293B'
                      : '#F1F5F9'
                    : config.defaultBtnBg;

                  const textColor = isCancel
                    ? isDarkMode
                      ? '#CBD5E1'
                      : '#475569'
                    : '#FFFFFF';

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.actionBtn,
                        buttons.length === 2 && styles.halfActionBtn,
                        { backgroundColor: btnBg },
                        isPrimary && styles.primaryBtnShadow,
                      ]}
                      activeOpacity={0.82}
                      onPress={() => {
                        hidePopup();
                        if (btn.onPress) btn.onPress();
                      }}
                    >
                      <Text style={[styles.actionBtnText, { color: textColor }]}>
                        {btn.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View
                style={
                  cancelText ? styles.doubleButtonsRow : styles.singleButtonWrap
                }
              >
                {Boolean(cancelText) && (
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      styles.halfActionBtn,
                      {
                        backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                      },
                    ]}
                    activeOpacity={0.8}
                    onPress={handleClose}
                  >
                    <Text
                      style={[
                        styles.actionBtnText,
                        { color: isDarkMode ? '#CBD5E1' : '#475569' },
                      ]}
                    >
                      {cancelText}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    Boolean(cancelText) && styles.halfActionBtn,
                    { backgroundColor: config.defaultBtnBg },
                    styles.primaryBtnShadow,
                  ]}
                  activeOpacity={0.85}
                  onPress={handleConfirm}
                >
                  <Text style={[styles.actionBtnText, { color: '#FFFFFF' }]}>
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
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
  dismissBtn: {
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
  textContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  message: {
    fontSize: 14.5,
    lineHeight: 21,
    textAlign: 'center',
    fontWeight: '400',
  },
  actionContainer: {
    width: '100%',
  },
  singleButtonWrap: {
    width: '100%',
  },
  doubleButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
  },
  stackedButtonsCol: {
    flexDirection: 'column',
    gap: 10,
    width: '100%',
  },
  actionBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    width: '100%',
  },
  halfActionBtn: {
    flex: 1,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  primaryBtnShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
