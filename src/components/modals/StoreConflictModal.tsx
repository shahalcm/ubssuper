// src/components/modals/StoreConflictModal.tsx
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
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { AlertTriangle, X, ShoppingBag } from 'lucide-react-native';
import { useCartStore } from '@/store/cartStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const StoreConflictModal: React.FC = () => {
  const { conflictModal, setConflictModal } = useCartStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (conflictModal?.isOpen) {
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
  }, [conflictModal?.isOpen]);

  if (!conflictModal || !conflictModal.isOpen) return null;

  const handleCancel = () => {
    setConflictModal(null);
  };

  const handleConfirm = () => {
    if (conflictModal.onConfirm) {
      conflictModal.onConfirm();
    }
    setConflictModal(null);
  };

  return (
    <Modal visible={conflictModal.isOpen} transparent animationType="none" onRequestClose={handleCancel}>
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
            onPress={handleCancel}
            style={[
              styles.closeBtn,
              { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#F1F5F9' },
            ]}
            activeOpacity={0.7}
          >
            <X size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
          </TouchableOpacity>

          {/* Glowing Warning Icon */}
          <View style={styles.iconHeroContainer}>
            <View style={styles.glowRingOuter}>
              <View style={[styles.glowRingInner, { backgroundColor: isDarkMode ? 'rgba(234, 88, 12, 0.20)' : '#FFEDD5' }]}>
                <AlertTriangle size={32} color="#EA580C" strokeWidth={2.4} />
              </View>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: theme.textPrimary }]}>Replace Cart Items?</Text>

          {/* Message */}
          <Text style={[styles.message, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
            Your cart already contains items from{' '}
            <Text style={{ fontWeight: '700', color: theme.textPrimary }}>
              {conflictModal.currentStoreName}
            </Text>
            . Would you like to clear your cart and start a new order from{' '}
            <Text style={{ fontWeight: '700', color: '#16A34A' }}>
              {conflictModal.newStoreName}
            </Text>
            ?
          </Text>

          {/* Buttons Row */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              onPress={handleCancel}
              style={[
                styles.btn,
                styles.cancelBtn,
                { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' },
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.cancelBtnText, { color: isDarkMode ? '#CBD5E1' : '#475569' }]}>
                Keep Current
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              style={[styles.btn, styles.confirmBtn, styles.primaryBtnShadow]}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmBtnText}>Clear & Add</Text>
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
    backgroundColor: 'rgba(234, 88, 12, 0.14)',
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
    paddingHorizontal: 6,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    width: '100%',
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  cancelBtn: {
    borderWidth: 0,
  },
  cancelBtnText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  confirmBtn: {
    backgroundColor: '#EA580C',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
  },
  primaryBtnShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#EA580C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
