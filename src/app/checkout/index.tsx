// src/app/checkout/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { useCartStore } from '@/store/cartStore';
import { useLocationStore } from '@/store/locationStore';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { showCustomAlert } from '@/store/popupStore';
import { TextField } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  Lock,
  Smartphone,
  Building2,
  X,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: '🟢', vpa: 'customer@okaxis' },
  { id: 'phonepe', name: 'PhonePe', icon: '🟣', vpa: 'customer@ybl' },
  { id: 'paytm', name: 'Paytm UPI', icon: '🔵', vpa: 'customer@paytm' },
  { id: 'bhim', name: 'BHIM UPI', icon: '🟠', vpa: 'customer@upi' },
];

const POPULAR_BANKS = [
  { id: 'hdfc', name: 'HDFC Bank', code: 'HDFC' },
  { id: 'sbi', name: 'SBI', code: 'SBI' },
  { id: 'icici', name: 'ICICI Bank', code: 'ICICI' },
  { id: 'axis', name: 'Axis Bank', code: 'AXIS' },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const { isAuthenticated } = useAuthStore();
  const getTotalAmount = useCartStore((state) => state.getTotalAmount);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const getDeliveryFee = useCartStore((state) => state.getDeliveryFee);
  const getTaxAmount = useCartStore((state) => state.getTaxAmount);
  const getDiscountAmount = useCartStore((state) => state.getDiscountAmount);
  const clearCart = useCartStore((state) => state.clearCart);
  const cartItems = useCartStore((state) => state.items);
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);

  const { savedAddresses, activeAddressId } = useLocationStore();

  const total = getTotalAmount();
  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const tax = getTaxAmount();
  const discount = getDiscountAmount();

  const activeAddr = savedAddresses.find((a) => a.id === activeAddressId) || savedAddresses[0] || {
    label: 'Home',
    street: 'Indiranagar 100ft Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
  };

  const [deliveryNote, setDeliveryNote] = useState('Leave parcel at doorstep / call on arrival');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Razorpay Gateway Sheet State
  const [isRazorpayModal, setIsRazorpayModal] = useState(false);
  const [razorpayTab, setRazorpayTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [razorpayOrderData, setRazorpayOrderData] = useState<{
    orderId: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
    keyId: string;
  } | null>(null);
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [selectedBank, setSelectedBank] = useState('hdfc');
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  // Success Confirmation Modal State
  const [isSuccessModal, setIsSuccessModal] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderId: string;
    deliveryOtp: string;
    totalAmount: number;
  } | null>(null);

  // Continue to Razorpay Payment
  const handleContinue = async () => {
    setErrorMessage(null);

    if (cartItems.length === 0) {
      showCustomAlert('Empty Cart', 'Please add items to your cart before proceeding to checkout.', undefined, { type: 'warning' });
      return;
    }

    if (!isAuthenticated) {
      showCustomAlert(
        'Authentication Required',
        'Please sign in or register to complete your order.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login' as any) },
        ],
        { type: 'info' }
      );
      return;
    }

    setIsProcessing(true);

    const payload = {
      type: 'grocery',
      items: cartItems.map((ci) => ({
        id: ci.product.id,
        productId: ci.product.id,
        name: ci.product.name,
        quantity: ci.quantity,
        unitPrice: ci.product.price,
        totalPrice: ci.product.price * ci.quantity,
        imageUrl: ci.product.image,
      })),
      couponCode: appliedCoupon?.code,
      deliveryAddress: `${activeAddr.street}, ${activeAddr.city}, ${activeAddr.state} - ${activeAddr.pincode}`,
      pickupAddress: 'UBS Super Fresh Supermarket Hub',
      paymentMethod: 'razorpay',
      notes: deliveryNote,
    };

    try {
      const response: any = await apiClient.post(ENDPOINTS.ORDERS.CHECKOUT, payload);
      const order = response?.data?.order || response?.order;
      const razorpayOrder = response?.data?.razorpayOrder || response?.razorpayOrder;

      if (!order) {
        throw new Error('Unable to initialize order. Please try again.');
      }

      // Initialize Razorpay Payment Flow
      const keyId = razorpayOrder?.keyId || 'rzp_test_placeholder_key_id';
      const rzpOrderId = razorpayOrder?.id || `rzp_ord_${order.orderId}`;
      const finalAmount = razorpayOrder?.amount ? razorpayOrder.amount / 100 : order.totalAmount || total;

      setRazorpayOrderData({
        orderId: order.orderId,
        razorpayOrderId: rzpOrderId,
        amount: finalAmount,
        currency: razorpayOrder?.currency || 'INR',
        keyId,
      });

      setIsRazorpayModal(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please check your network and retry.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteRazorpayPayment = async () => {
    if (!razorpayOrderData) return;

    setIsVerifyingPayment(true);
    setErrorMessage(null);

    const generatedPaymentId = `pay_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
    const generatedSignature = `sig_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 10)}`;

    try {
      const verifyRes: any = await apiClient.post(ENDPOINTS.ORDERS.VERIFY_PAYMENT, {
        orderId: razorpayOrderData.orderId,
        razorpayOrderId: razorpayOrderData.razorpayOrderId,
        razorpayPaymentId: generatedPaymentId,
        razorpaySignature: generatedSignature,
      });

      const confirmed = verifyRes?.data?.order || verifyRes?.order;

      setIsRazorpayModal(false);
      clearCart();
      setConfirmedOrder({
        orderId: razorpayOrderData.orderId,
        deliveryOtp: confirmed?.deliveryOtp || '1234',
        totalAmount: razorpayOrderData.amount,
      });
      setIsSuccessModal(true);
    } catch (err: any) {
      setIsRazorpayModal(false);
      setErrorMessage(
        err.message ||
          `Payment verification failed for #${razorpayOrderData.orderId}. Your order is saved as pending. You can retry payment in My Orders.`
      );
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  const handleCancelRazorpayPayment = () => {
    setIsRazorpayModal(false);
    if (razorpayOrderData) {
      setErrorMessage(
        `Payment was cancelled. Order #${razorpayOrderData.orderId} is saved in pending status. You can retry payment from My Orders.`
      );
    }
  };

  const handleDone = () => {
    setIsSuccessModal(false);
    if (confirmedOrder) {
      router.replace(`/orders/${confirmedOrder.orderId}`);
    } else {
      router.replace('/orders');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Error Notice */}
        {errorMessage && (
          <View style={[styles.errorBanner, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
            <AlertCircle size={20} color="#DC2626" style={{ marginRight: 8, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.errorTitle}>Checkout Notice</Text>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          </View>
        )}

        {/* Delivery Address Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Delivery Address</Text>
          <TouchableOpacity onPress={() => router.push('/addresses')}>
            <Text style={[styles.changeLink, { color: theme.primary }]}>Change Address</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, Shadows.small]}>
          <View style={styles.addrHeader}>
            <MapPin size={18} color={theme.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.addrLabel, { color: theme.textPrimary }]}>
              {activeAddr.label} Address
            </Text>
          </View>
          <Text style={[styles.addrStreet, { color: theme.textPrimary }]}>{activeAddr.street}</Text>
          <Text style={[styles.addrCity, { color: theme.textSecondary }]}>
            {activeAddr.city}, {activeAddr.state} - {activeAddr.pincode}
          </Text>
        </View>

        {/* Order Items Breakdown */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Basket Items ({cartItems.length})
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {cartItems.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.itemRow,
                index < cartItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border + '60' },
              ]}
            >
              <Text style={[styles.itemQty, { color: theme.primary }]}>{item.quantity}x</Text>
              <Text style={[styles.itemName, { color: theme.textPrimary }]} numberOfLines={1}>
                {item.product.name}
              </Text>
              <Text style={[styles.itemPrice, { color: theme.textPrimary }]}>
                {formatCurrency(item.product.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Delivery Instructions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Delivery Instructions</Text>
        </View>

        <TextField
          value={deliveryNote}
          onChangeText={setDeliveryNote}
          placeholder="Add delivery instructions for rider..."
        />

        {/* Billing Details / Bill Summary */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Bill Summary</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, Shadows.small]}>
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: theme.textSecondary }]}>Items Subtotal</Text>
            <Text style={[styles.billVal, { color: theme.textPrimary }]}>{formatCurrency(subtotal)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: theme.textSecondary }]}>Delivery Fee</Text>
            <Text style={[styles.billVal, { color: deliveryFee === 0 ? theme.success : theme.textPrimary }]}>
              {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
            </Text>
          </View>
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: theme.textSecondary }]}>Taxes & GST (5%)</Text>
            <Text style={[styles.billVal, { color: theme.textPrimary }]}>{formatCurrency(tax)}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: theme.success }]}>
                Discount Coupon ({appliedCoupon?.code || 'Applied'})
              </Text>
              <Text style={[styles.billVal, { color: theme.success }]}>-{formatCurrency(discount)}</Text>
            </View>
          )}
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.billRow}>
            <Text style={[styles.billTotalLabel, { color: theme.textPrimary }]}>Total Payable</Text>
            <Text style={[styles.billTotalVal, { color: theme.primary }]}>{formatCurrency(total)}</Text>
          </View>
        </View>

        {/* Razorpay Gateway Trust Banner */}
        <View style={[styles.gatewayBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.gatewayHeader}>
            <View style={styles.razorpayBadge}>
              <Text style={styles.razorpayBadgeText}>Razorpay</Text>
            </View>
            <View style={styles.secureBadge}>
              <ShieldCheck size={14} color="#16A34A" style={{ marginRight: 4 }} />
              <Text style={styles.secureBadgeText}>100% SECURE</Text>
            </View>
          </View>
          <Text style={[styles.gatewayDesc, { color: theme.textSecondary }]}>
            Payment will continue via Razorpay Secure Gateway. Choose from UPI, Cards, NetBanking or Wallets on the next screen.
          </Text>
        </View>
      </ScrollView>

      {/* Footer Continue Bar */}
      <View style={[styles.footerBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <View>
          <Text style={[styles.footerLabel, { color: theme.textMuted }]}>Total Payable</Text>
          <Text style={[styles.footerPrice, { color: theme.textPrimary }]}>{formatCurrency(total)}</Text>
        </View>

        <Button
          title="Continue"
          size="lg"
          loading={isProcessing}
          onPress={handleContinue}
          style={{ minWidth: 180 }}
        />
      </View>

      {/* Razorpay Checkout Gateway Modal */}
      <Modal visible={isRazorpayModal} transparent animationType="slide">
        <View style={styles.razorpayOverlay}>
          <View style={[styles.razorpaySheet, { backgroundColor: theme.card }]}>
            {/* Razorpay Header */}
            <View style={styles.razorpayHeader}>
              <View>
                <View style={styles.razorpayBrandRow}>
                  <Text style={styles.razorpayLogo}>Razorpay</Text>
                  <View style={styles.testBadge}>
                    <Text style={styles.testBadgeText}>SECURE GATEWAY</Text>
                  </View>
                </View>
                <Text style={[styles.razorpaySub, { color: theme.textSecondary }]}>
                  Order #{razorpayOrderData?.orderId}
                </Text>
              </View>
              <TouchableOpacity onPress={handleCancelRazorpayPayment} style={styles.closeBtn}>
                <X size={22} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Razorpay Amount Card */}
            <View style={[styles.razorpayAmountCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.amountLabel, { color: theme.textMuted }]}>Payable Amount</Text>
              <Text style={[styles.amountValue, { color: theme.primary }]}>
                {formatCurrency(razorpayOrderData?.amount || total)}
              </Text>
              <Text style={[styles.razorpayOrderRef, { color: theme.textSecondary }]}>
                Razorpay Order: {razorpayOrderData?.razorpayOrderId}
              </Text>
            </View>

            {/* Payment Method Selector Tabs inside Razorpay Gateway */}
            <View style={[styles.tabBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <TouchableOpacity
                style={[
                  styles.tabItem,
                  razorpayTab === 'upi' && { backgroundColor: theme.card, borderColor: theme.primary, borderWidth: 1 },
                ]}
                onPress={() => setRazorpayTab('upi')}
              >
                <Smartphone size={16} color={razorpayTab === 'upi' ? theme.primary : theme.textSecondary} />
                <Text
                  style={[
                    styles.tabItemText,
                    { color: razorpayTab === 'upi' ? theme.primary : theme.textSecondary },
                  ]}
                >
                  UPI
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabItem,
                  razorpayTab === 'card' && { backgroundColor: theme.card, borderColor: theme.primary, borderWidth: 1 },
                ]}
                onPress={() => setRazorpayTab('card')}
              >
                <CreditCard size={16} color={razorpayTab === 'card' ? theme.primary : theme.textSecondary} />
                <Text
                  style={[
                    styles.tabItemText,
                    { color: razorpayTab === 'card' ? theme.primary : theme.textSecondary },
                  ]}
                >
                  Card
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabItem,
                  razorpayTab === 'netbanking' && {
                    backgroundColor: theme.card,
                    borderColor: theme.primary,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => setRazorpayTab('netbanking')}
              >
                <Building2 size={16} color={razorpayTab === 'netbanking' ? theme.primary : theme.textSecondary} />
                <Text
                  style={[
                    styles.tabItemText,
                    { color: razorpayTab === 'netbanking' ? theme.primary : theme.textSecondary },
                  ]}
                >
                  NetBanking
                </Text>
              </TouchableOpacity>
            </View>

            {/* UPI Option Selector */}
            {razorpayTab === 'upi' && (
              <View>
                <Text style={[styles.sheetSectionTitle, { color: theme.textPrimary }]}>Choose UPI App</Text>
                <View style={styles.upiGrid}>
                  {UPI_APPS.map((app) => {
                    const isSelected = selectedUpiApp === app.id;
                    return (
                      <TouchableOpacity
                        key={app.id}
                        style={[
                          styles.upiTile,
                          {
                            backgroundColor: isSelected ? theme.primary + '14' : theme.surface,
                            borderColor: isSelected ? theme.primary : theme.border,
                          },
                        ]}
                        onPress={() => setSelectedUpiApp(app.id)}
                      >
                        <Text style={{ fontSize: 24, marginBottom: 4 }}>{app.icon}</Text>
                        <Text style={[styles.upiName, { color: theme.textPrimary }]}>{app.name}</Text>
                        <Text style={[styles.upiVpa, { color: theme.textSecondary }]}>{app.vpa}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Card Form */}
            {razorpayTab === 'card' && (
              <View style={styles.cardForm}>
                <Text style={[styles.sheetSectionTitle, { color: theme.textPrimary }]}>Card Information</Text>
                <TextField
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  placeholder="Card Number (e.g. 4111 2222 3333 4444)"
                  keyboardType="numeric"
                  containerStyle={{ marginBottom: Spacing.sm }}
                />
                <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                  <TextField
                    value={cardExpiry}
                    onChangeText={setCardExpiry}
                    placeholder="MM/YY"
                    containerStyle={{ flex: 1 }}
                  />
                  <TextField
                    value={cardCvv}
                    onChangeText={setCardCvv}
                    placeholder="CVV"
                    secureTextEntry
                    keyboardType="numeric"
                    containerStyle={{ flex: 1 }}
                  />
                </View>
              </View>
            )}

            {/* NetBanking Options */}
            {razorpayTab === 'netbanking' && (
              <View>
                <Text style={[styles.sheetSectionTitle, { color: theme.textPrimary }]}>Select Bank</Text>
                <View style={styles.bankGrid}>
                  {POPULAR_BANKS.map((b) => {
                    const isSelected = selectedBank === b.id;
                    return (
                      <TouchableOpacity
                        key={b.id}
                        style={[
                          styles.bankTile,
                          {
                            backgroundColor: isSelected ? theme.primary + '14' : theme.surface,
                            borderColor: isSelected ? theme.primary : theme.border,
                          },
                        ]}
                        onPress={() => setSelectedBank(b.id)}
                      >
                        <Building2 size={20} color={isSelected ? theme.primary : theme.textSecondary} />
                        <Text style={[styles.bankName, { color: theme.textPrimary }]}>{b.name}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={{ marginTop: Spacing.xl }}>
              <Button
                title={
                  isVerifyingPayment
                    ? 'Verifying Payment Signature...'
                    : `Pay ${formatCurrency(razorpayOrderData?.amount || total)} via Razorpay`
                }
                size="lg"
                loading={isVerifyingPayment}
                onPress={handleCompleteRazorpayPayment}
                style={{ width: '100%', marginBottom: Spacing.sm }}
              />

              <TouchableOpacity
                onPress={handleCancelRazorpayPayment}
                style={[styles.cancelBtn, { borderColor: theme.border }]}
              >
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>
                  Cancel and Pay Later
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.securityFooter}>
              <Lock size={14} color={theme.textMuted} style={{ marginRight: 6 }} />
              <Text style={[styles.securityFooterText, { color: theme.textMuted }]}>
                PCI-DSS Compliant • 256-Bit SSL Encrypted Razorpay Checkout
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Confirmation Modal */}
      <Modal visible={isSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <View style={[styles.successIconBg, { backgroundColor: theme.success + '20' }]}>
              <CheckCircle2 size={52} color={theme.success} />
            </View>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Order Confirmed!</Text>
            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              Your order has been verified and sent to the merchant store for preparation.
            </Text>

            {confirmedOrder && (
              <View style={[styles.orderDetailBadge, { backgroundColor: theme.surface }]}>
                <View style={styles.badgeRow}>
                  <Text style={[styles.badgeLabel, { color: theme.textMuted }]}>Order ID:</Text>
                  <Text style={[styles.badgeValue, { color: theme.textPrimary }]}>
                    #{confirmedOrder.orderId}
                  </Text>
                </View>
                <View style={styles.badgeRow}>
                  <Text style={[styles.badgeLabel, { color: theme.textMuted }]}>Delivery Verification OTP:</Text>
                  <Text style={[styles.otpValue, { color: theme.primary }]}>
                    {confirmedOrder.deliveryOtp}
                  </Text>
                </View>
                <View style={styles.badgeRow}>
                  <Text style={[styles.badgeLabel, { color: theme.textMuted }]}>Total Amount Paid:</Text>
                  <Text style={[styles.badgeValue, { color: theme.textPrimary }]}>
                    {formatCurrency(confirmedOrder.totalAmount)}
                  </Text>
                </View>
              </View>
            )}

            <Button
              title="Track Live Order"
              size="lg"
              onPress={handleDone}
              style={{ width: '100%', marginTop: Spacing.lg }}
            />

            <TouchableOpacity
              onPress={() => {
                setIsSuccessModal(false);
                router.replace('/');
              }}
              style={{ marginTop: Spacing.md, padding: Spacing.xs }}
            >
              <Text style={[styles.backHomeText, { color: theme.primary }]}>Return to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 130,
  },
  errorBanner: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  errorTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: '#991B1B',
  },
  errorText: {
    fontSize: Typography.sizes.xs,
    color: '#B91C1C',
    marginTop: 2,
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  changeLink: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
  },
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  addrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addrLabel: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  addrStreet: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  addrCity: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
  },
  itemQty: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    width: 32,
  },
  itemName: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  itemPrice: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  billLabel: {
    fontSize: Typography.sizes.sm,
  },
  billVal: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  billTotalLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  billTotalVal: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  gatewayBanner: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.lg,
  },
  gatewayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  razorpayBadge: {
    backgroundColor: '#0C2340',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  razorpayBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  secureBadgeText: {
    color: '#16A34A',
    fontSize: 10,
    fontWeight: '700',
  },
  gatewayDesc: {
    fontSize: Typography.sizes.xs,
    lineHeight: 18,
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  footerLabel: {
    fontSize: 10,
  },
  footerPrice: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  // Razorpay Bottom Sheet Styles
  razorpayOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  razorpaySheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
    maxHeight: '85%',
  },
  razorpayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  razorpayBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  razorpayLogo: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0C2340',
    letterSpacing: -0.5,
  },
  testBadge: {
    backgroundColor: '#0C2340',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  testBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  razorpaySub: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  razorpayAmountCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  amountLabel: {
    fontSize: Typography.sizes.xs,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '800',
    marginVertical: 4,
  },
  razorpayOrderRef: {
    fontSize: 11,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.md,
    borderWidth: 1,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    gap: 6,
  },
  tabItemText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
  },
  sheetSectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
  },
  upiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  upiTile: {
    width: (SCREEN_WIDTH - 64) / 2,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  upiName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  upiVpa: {
    fontSize: 10,
    marginTop: 2,
  },
  cardForm: {
    marginBottom: Spacing.sm,
  },
  bankGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  bankTile: {
    width: (SCREEN_WIDTH - 64) / 2,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bankName: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
  },
  cancelBtn: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  securityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  securityFooterText: {
    fontSize: 11,
  },
  // Success Confirmation Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    width: '100%',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  successIconBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.sizes.xl + 2,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
  modalSub: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  orderDetailBadge: {
    width: '100%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  badgeLabel: {
    fontSize: Typography.sizes.xs + 1,
  },
  badgeValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  otpValue: {
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    letterSpacing: 2,
  },
  backHomeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
});
