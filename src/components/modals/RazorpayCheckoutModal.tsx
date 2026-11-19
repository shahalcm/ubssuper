// src/components/modals/RazorpayCheckoutModal.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { API_BASE_URL } from '@/services/api/client';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { ShieldCheck, Lock, X, AlertCircle, Zap, CreditCard, ChevronRight } from 'lucide-react-native';

export interface RazorpayCheckoutOptions {
  keyId: string;
  orderId: string;
  amount: number; // in Rupees/major currency
  amountInPaise: number;
  currency: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess: (data: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onFailure: (error: { message: string }) => void;
  onCancel: () => void;
}

interface Props {
  visible: boolean;
  options: RazorpayCheckoutOptions | null;
  onClose: () => void;
}

export function RazorpayCheckoutModal({ visible, options, onClose }: Props) {
  const [isOpeningBrowser, setIsOpeningBrowser] = useState(false);

  useEffect(() => {
    if (!visible || !options) return;

    if (Platform.OS === 'web') {
      // Dynamic injection of official Razorpay standard checkout script on web
      const scriptId = 'razorpay-checkout-js';
      let script = document.getElementById(scriptId) as HTMLScriptElement;

      const launchRazorpay = () => {
        if ((window as any).Razorpay) {
          const rzp = new (window as any).Razorpay({
            key: options.keyId,
            amount: options.amountInPaise,
            currency: options.currency || 'INR',
            name: options.name || 'UBS Super Ecosystem',
            description: options.description || 'Order Payment',
            order_id: options.orderId,
            prefill: options.prefill || {},
            theme: { color: '#16A34A' },
            handler: (response: any) => {
              options.onSuccess({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });
            },
            modal: {
              ondismiss: () => {
                options.onCancel();
              },
            },
          });
          rzp.open();
        } else {
          options.onFailure({ message: 'Razorpay checkout script failed to load' });
        }
      };

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = launchRazorpay;
        script.onerror = () => options.onFailure({ message: 'Could not load Razorpay gateway' });
        document.body.appendChild(script);
      } else {
        launchRazorpay();
      }
    }
  }, [visible, options]);

  const handleLaunchNativeGateway = async () => {
    if (!options) return;
    setIsOpeningBrowser(true);

    try {
      const redirectUri = 'ubssuper://payment-complete';
      const queryParams = new URLSearchParams({
        keyId: options.keyId,
        orderId: options.orderId,
        amountInPaise: String(options.amountInPaise),
        currency: options.currency || 'INR',
        name: options.name,
        description: options.description,
        redirectUrl: redirectUri,
        prefillName: options.prefill?.name || '',
        prefillEmail: options.prefill?.email || '',
        prefillContact: options.prefill?.contact || '',
      });
      const checkoutUrl = `${API_BASE_URL}/payments/checkout-page?${queryParams.toString()}`;

      const res = await WebBrowser.openAuthSessionAsync(checkoutUrl, redirectUri);

      setIsOpeningBrowser(false);

      if (res.type === 'success' && res.url) {
        const urlParams = new URLSearchParams(res.url.split('?')[1] || '');
        const paymentId = urlParams.get('razorpay_payment_id');
        const orderId = urlParams.get('razorpay_order_id') || options.orderId;
        const signature = urlParams.get('razorpay_signature');
        const status = urlParams.get('status');

        if (paymentId && signature) {
          options.onSuccess({
            razorpay_payment_id: paymentId,
            razorpay_order_id: orderId,
            razorpay_signature: signature,
          });
        } else if (status === 'cancelled') {
          options.onCancel();
        } else {
          options.onFailure({ message: urlParams.get('error') || 'Payment incomplete or cancelled' });
        }
      } else if (res.type === 'cancel' || res.type === 'dismiss') {
        options.onCancel();
      }
    } catch (err: any) {
      setIsOpeningBrowser(false);
      Alert.alert('Gateway Notice', err.message || 'Could not launch in-app browser');
    }
  };

  const handleSimulateTestPayment = () => {
    if (!options) return;
    options.onSuccess({
      razorpay_payment_id: `pay_test_${Date.now().toString().slice(-6)}`,
      razorpay_order_id: options.orderId,
      razorpay_signature: 'simulated_valid_signature',
    });
  };

  if (!visible || !options) return null;

  // On Web, the script creates its own iframe popup
  if (Platform.OS === 'web') {
    return null;
  }

  // Native Mobile UI Gateway Sheet
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.shieldWrap}>
                <ShieldCheck size={20} color="#16A34A" />
              </View>
              <View>
                <Text style={styles.title}>Razorpay Trusted Checkout</Text>
                <Text style={styles.subtitle}>256-Bit Bank Grade SSL Encryption</Text>
              </View>
            </View>
            <TouchableOpacity onPress={options.onCancel} style={styles.closeBtn}>
              <X size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={styles.body}>
            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>Total Payable Amount</Text>
              <Text style={styles.amountText}>
                {options.currency === 'INR' ? '₹' : options.currency + ' '}
                {options.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
              <Text style={styles.orderIdBadge}>Order Ref: #{options.orderId}</Text>
            </View>

            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Lock size={16} color="#16A34A" />
                <Text style={styles.infoText}>
                  Payment processed securely via Razorpay Payment Gateway.
                </Text>
              </View>
              <View style={styles.infoRow}>
                <AlertCircle size={16} color="#64748B" />
                <Text style={styles.infoTextSub}>
                  UPI (GPay / PhonePe / Paytm), Cards, and Net Banking supported.
                </Text>
              </View>
            </View>

            {/* Launch Razorpay Live Gateway Button */}
            <TouchableOpacity
              style={styles.payLiveBtn}
              onPress={handleLaunchNativeGateway}
              disabled={isOpeningBrowser}
              activeOpacity={0.85}
            >
              {isOpeningBrowser ? (
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
              ) : (
                <Zap size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              )}
              <Text style={styles.payLiveBtnText}>
                {isOpeningBrowser ? 'Opening Razorpay Gateway...' : 'Pay via UPI, Cards or NetBanking'}
              </Text>
              <ChevronRight size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>

            {/* Test Simulation Helper for Developer Sandbox */}
            <TouchableOpacity
              style={styles.simulateBtn}
              onPress={handleSimulateTestPayment}
              activeOpacity={0.7}
            >
              <Text style={styles.simulateBtnText}>Instant Sandbox Verify (Test Mode)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl + 20,
    ...Shadows.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  shieldWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: Typography.weights.semibold,
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: Typography.weights.regular,
    color: '#64748B',
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  body: {
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  amountBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  amountLabel: {
    fontSize: 13,
    fontWeight: Typography.weights.medium,
    color: '#64748B',
    marginBottom: 4,
  },
  amountText: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: '#16A34A',
    marginBottom: 6,
  },
  orderIdBadge: {
    fontSize: 12,
    fontWeight: Typography.weights.medium,
    color: '#0284C7',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  infoCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: Spacing.md,
    gap: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    fontWeight: Typography.weights.medium,
    color: '#166534',
    flex: 1,
  },
  infoTextSub: {
    fontSize: 12,
    fontWeight: Typography.weights.regular,
    color: '#64748B',
    flex: 1,
  },
  payLiveBtn: {
    backgroundColor: '#16A34A',
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...Shadows.small,
  },
  payLiveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: Typography.weights.bold,
  },
  simulateBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  simulateBtnText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: Typography.weights.medium,
    textDecorationLine: 'underline',
  },
});

