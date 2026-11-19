// src/app/orders/[id].tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Dimensions,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { useCartStore } from '@/store/cartStore';
import { StatusTimeline, TimelineStep } from '@/components/ui/StatusTimeline';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MOCK_RECENT_ORDERS, MOCK_GROCERY_PRODUCTS } from '@/services/mock/data';
import { Order } from '@/types';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { RazorpayCheckoutModal } from '@/components/modals/RazorpayCheckoutModal';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  HelpCircle,
  Phone,
  Zap,
  CheckCircle2,
  Clock,
  RotateCcw,
  Download,
  Share2,
  Utensils,
  ShoppingBag,
  Car,
  Building,
  Truck,
  ShieldCheck,
  Star,
  ChevronRight,
  AlertCircle,
  Copy,
  Check,
  MessageSquare,
  FileText,
  Sparkles,
  Navigation,
  Mail,
  Headphones,
  X,
} from 'lucide-react-native';
import { openDialer, openEmail, UBS_OFFICIAL_CONTACT } from '@/utils/contact';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OrderDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const orderId = (params.id as string) || 'ORD-99412';

  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [liveOrder, setLiveOrder] = useState<any | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [isRetryingPayment, setIsRetryingPayment] = useState(false);
  const [isRazorpayRetryModal, setIsRazorpayRetryModal] = useState(false);
  const [retryRazorpayData, setRetryRazorpayData] = useState<any | null>(null);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const fetchLiveOrderDetail = async () => {
    setIsLoadingOrder(true);
    try {
      const res: any = await apiClient.get(ENDPOINTS.ORDERS.BY_ID(orderId));
      const data = res?.data || res;
      if (data && (data.orderId || data.id)) {
        setLiveOrder(data);
      }
    } catch {
      // Fallback to mock
    } finally {
      setIsLoadingOrder(false);
    }
  };

  const handleInitiateRetryPayment = async () => {
    setIsRetryingPayment(true);
    try {
      const res: any = await apiClient.post(`/orders/${orderId}/retry-payment`);
      const rzpData = res?.data?.razorpayOrder || res?.razorpayOrder;
      if (rzpData) {
        setRetryRazorpayData(rzpData);
        setIsRazorpayRetryModal(true);
      } else {
        Alert.alert('Payment Retry', 'Could not initialize payment retry. Please check network.');
      }
    } catch (err: any) {
      Alert.alert('Payment Error', err.message || 'Payment retry initialization failed');
    } finally {
      setIsRetryingPayment(false);
    }
  };

  const handleVerifyRetrySuccess = async (paymentResult: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => {
    try {
      await apiClient.post(ENDPOINTS.ORDERS.VERIFY_PAYMENT, {
        orderId,
        razorpayOrderId: paymentResult.razorpay_order_id,
        razorpayPaymentId: paymentResult.razorpay_payment_id,
        razorpaySignature: paymentResult.razorpay_signature,
      });
      setIsRazorpayRetryModal(false);
      showToast('Payment verified successfully!');
      fetchLiveOrderDetail();
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Cryptographic signature verification failed.');
    }
  };

  useEffect(() => {
    fetchLiveOrderDetail();
  }, [orderId]);

  const mockFallback =
    MOCK_RECENT_ORDERS.find((o) => o.id === orderId) || MOCK_RECENT_ORDERS[0];

  const order: Order = useMemo(() => {
    if (!liveOrder) return mockFallback;
    return {
      id: liveOrder.orderId || liveOrder.id || orderId,
      category: liveOrder.type || 'grocery',
      status:
        liveOrder.fulfillmentStatus === 'placed'
          ? 'confirmed'
          : liveOrder.fulfillmentStatus || 'confirmed',
      totalAmount: liveOrder.totalAmount || 0,
      currency: liveOrder.currency || 'INR',
      date: liveOrder.createdAt
        ? new Date(liveOrder.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : 'Today',
      createdAt: liveOrder.createdAt
        ? new Date(liveOrder.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : 'Today',
      itemsSummary:
        liveOrder.items?.map((it: any) => `${it.quantity}x ${it.name}`).join(', ') ||
        'Basket items',
      itemCount: liveOrder.items?.reduce((s: number, it: any) => s + (it.quantity || 1), 0) || 1,
      deliveryAddress:
        liveOrder.destinationAddress || liveOrder.deliveryAddress || 'Bengaluru, India',
      paymentMethod: liveOrder.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Razorpay Online',
      paymentStatus: liveOrder.paymentStatus || 'pending',
      bookingDetails: {
        storeName: liveOrder.partnerName || 'UBS Super Fresh Supermarket Hub',
        storeAddress: liveOrder.pickupAddress || 'UBS Super Fulfillment Center',
        otp: liveOrder.deliveryOtp || '1234',
        rating: 5,
        driverName: liveOrder.driverName || 'Rider Assigned',
        driverPhone: liveOrder.driverPhone || '9876543210',
      },
    };
  }, [liveOrder, mockFallback, orderId]);

  const isActive =
    order.status === 'out_for_delivery' ||
    order.status === 'processing' ||
    order.status === 'confirmed';
  const isCompleted = order.status === 'completed';
  const isCancelled = order.status === 'cancelled';
  const isPendingPayment = order.paymentStatus === 'pending';

  // 🌟 Interactive Rating & Feedback State
  const [userRating, setUserRating] = useState<number>(order.bookingDetails?.rating || 5);
  const [hasRated, setHasRated] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const handleCopyOrderId = () => {
    setIsCopied(true);
    showToast(`✓ Order ID #${order.id} copied!`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // 🌟 Dynamic Timeline Steps
  const getTimelineSteps = (): TimelineStep[] => {
    if (order.status === 'out_for_delivery') {
      return [
        {
          title: 'Order Placed & Confirmed',
          subtitle: 'Kitchen accepted & started cooking',
          time: '01:05 PM',
          completed: true,
          current: false,
        },
        {
          title: 'Quality Checked & Packed',
          subtitle: 'Tamper-evident thermal seal verified',
          time: '01:18 PM',
          completed: true,
          current: false,
        },
        {
          title: 'Out for Express Delivery',
          subtitle: `Driver ${order.bookingDetails?.driverName || 'Partner'} on transit via Calicut Road`,
          time: '01:25 PM',
          completed: true,
          current: true,
        },
        {
          title: 'Delivered at Doorstep',
          subtitle: 'Contactless drop with security PIN',
          time: order.bookingDetails?.eta || 'ETA 8 mins',
          completed: false,
          current: false,
        },
      ];
    }
    if (order.status === 'processing') {
      return [
        {
          title: 'Order Received & Verified',
          subtitle: 'Darkstore inventory locked',
          time: '01:10 PM',
          completed: true,
          current: false,
        },
        {
          title: 'Handpicking & Cold Packing',
          subtitle: 'Chilled items sorted at 4°C station',
          time: '01:15 PM',
          completed: true,
          current: true,
        },
        {
          title: 'Handover to Express Fleet',
          subtitle: 'Dispatch bay 04',
          time: '01:20 PM',
          completed: false,
          current: false,
        },
        {
          title: 'Delivered in 15 Mins',
          subtitle: 'Superfast doorstep delivery',
          time: '01:25 PM',
          completed: false,
          current: false,
        },
      ];
    }
    if (order.status === 'cancelled') {
      return [
        {
          title: 'Booking Initiated',
          subtitle: 'Ride request dispatched to nearest drivers',
          time: order.date,
          completed: true,
          current: false,
        },
        {
          title: 'Booking Cancelled',
          subtitle: order.bookingDetails?.cancellationReason || 'Cancelled due to severe rain',
          time: '10 mins later',
          completed: true,
          current: true,
        },
        {
          title: '100% Refund Credited',
          subtitle: 'Credited directly to UBS Super Wallet',
          time: 'Instant',
          completed: true,
          current: false,
        },
      ];
    }
    return [
      {
        title: 'Order Placed & Confirmed',
        subtitle: 'Digital receipt generated',
        time: '01:05 PM',
        completed: true,
        current: false,
      },
      {
        title: 'Prepared by Partner',
        subtitle: 'Hygiene standard compliant',
        time: '01:15 PM',
        completed: true,
        current: false,
      },
      {
        title: 'Dispatched in Express Fleet',
        subtitle: 'Optimal route via Manjeri bypass',
        time: '01:25 PM',
        completed: true,
        current: false,
      },
      {
        title: 'Successfully Delivered',
        subtitle: 'Received by customer',
        time: order.date,
        completed: true,
        current: true,
      },
    ];
  };

  const steps = getTimelineSteps();

  // 🌟 Service Title & Icon Configuration
  const getServiceHeader = () => {
    switch (order.category) {
      case 'food':
        return {
          title: order.bookingDetails?.restaurantName || 'Malabar Kitchen',
          subtitle: 'Authentic Malabar Food Delivery',
          icon: <Utensils size={18} color="#F97316" />,
          bgColor: '#FFEDD5',
          accent: '#F97316',
        };
      case 'grocery':
        return {
          title: order.bookingDetails?.storeName || 'Manjeri Darkstore',
          subtitle: '15-Min Express Cold-Chain Delivery',
          icon: <ShoppingBag size={18} color="#16A34A" />,
          bgColor: '#DCFCE7',
          accent: '#16A34A',
        };
      case 'taxi':
        return {
          title: order.bookingDetails?.vehicle || 'UBS Super Ride',
          subtitle: 'Doorstep Taxi Ride Service',
          icon: <Car size={18} color="#D97706" />,
          bgColor: '#FEF3C7',
          accent: '#D97706',
        };
      case 'hotels':
        return {
          title: order.bookingDetails?.hotelName || 'Hotel Booking',
          subtitle: 'Luxury Stay Booking Confirmation',
          icon: <Building size={18} color="#2563EB" />,
          bgColor: '#DBEAFE',
          accent: '#2563EB',
        };
      case 'logistics':
        return {
          title: 'Express Parcel Delivery',
          subtitle: 'Point-to-Point Logistics Transit',
          icon: <Truck size={18} color="#9333EA" />,
          bgColor: '#F3E8FF',
          accent: '#9333EA',
        };
      default:
        return {
          title: 'UBS Super Order',
          subtitle: 'Verified Service Booking',
          icon: <ShoppingBag size={18} color="#16A34A" />,
          bgColor: '#DCFCE7',
          accent: '#16A34A',
        };
    }
  };

  const service = getServiceHeader();

  // 🌟 Parse items from summary
  const itemsList = order.itemsSummary.split(',').map((it, i) => it.trim());

  // 🌟 Share Receipt
  const handleShareReceipt = async () => {
    try {
      await Share.share({
        title: `UBS Super Receipt #${order.id}`,
        message: `UBS Super Official Receipt for Order #${order.id} (${service.title}): Paid ${formatCurrency(
          order.totalAmount
        )} via ${order.paymentMethod}. Delivered to: ${order.deliveryAddress}. View full receipt: https://ubssuper.app/orders/${order.id}`,
      });
    } catch (e) {
      // User dismissed share
    }
  };

  // 🌟 Reorder Handler
  const handleReorder = () => {
    // Add sample items to cart
    if (order.category === 'grocery' && MOCK_GROCERY_PRODUCTS.length > 0) {
      useCartStore.getState().addItem(MOCK_GROCERY_PRODUCTS[0], 1);
    }
    showToast(`✓ Reorder placed for ${service.title}! Redirecting...`);
    setTimeout(() => {
      router.push('/cart');
    }, 1200);
  };

  // 🌟 Quick Rider Messages
  const handleQuickMessage = (msg: string) => {
    Alert.alert('Message Sent to Partner', `"${msg}" sent to ${order.bookingDetails?.driverName || 'Delivery Partner'}.`);
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* 🌟 FLOATING TOP NAVIGATION BAR */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.headerBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          activeOpacity={0.8}
        >
          <ArrowLeft size={19} color={theme.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Order Details</Text>
          <TouchableOpacity
            style={styles.orderIdCopyRow}
            activeOpacity={0.7}
            onPress={handleCopyOrderId}
          >
            <Text style={[styles.headerSub, { color: theme.textSecondary }]}>#{order.id}</Text>
            {isCopied ? (
              <Check size={11} color="#16A34A" style={{ marginLeft: 4 }} />
            ) : (
              <Copy size={11} color={theme.textMuted} style={{ marginLeft: 4 }} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: theme.surface, borderColor: theme.border, marginRight: 8 }]}
            activeOpacity={0.8}
            onPress={handleShareReceipt}
          >
            <Share2 size={17} color={theme.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            activeOpacity={0.8}
            onPress={() => router.push('/support')}
          >
            <HelpCircle size={17} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 🌟 IN-APP TOAST NOTIFICATION */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <View style={styles.toastPill}>
            <CheckCircle2 size={15} color="#10B981" style={{ marginRight: 6 }} />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}

      {/* 🌟 SCROLLABLE CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(Spacing.xxl * 2, insets.bottom + 50) },
        ]}
      >
        {/* 🌟 PENDING PAYMENT RETRY BANNER */}
        {isPendingPayment && (
          <View
            style={{
              backgroundColor: '#FEF3C7',
              borderColor: '#F59E0B',
              borderWidth: 1,
              borderRadius: BorderRadius.md,
              padding: Spacing.md,
              marginBottom: Spacing.md,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View style={{ flex: 1, marginRight: Spacing.sm }}>
              <Text style={{ fontSize: 14, fontWeight: Typography.weights.bold, color: '#92400E' }}>
                Payment Pending
              </Text>
              <Text style={{ fontSize: 12, fontWeight: Typography.weights.regular, color: '#B45309' }}>
                Order #{order.id} is pending payment. Click to complete payment via Razorpay.
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleInitiateRetryPayment}
              disabled={isRetryingPayment}
              style={{
                backgroundColor: '#16A34A',
                paddingHorizontal: Spacing.md,
                paddingVertical: Spacing.sm,
                borderRadius: BorderRadius.sm,
              }}
            >
              {isRetryingPayment ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontWeight: Typography.weights.semibold, fontSize: 13 }}>
                  Pay Now
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* 🌟 HERO SERVICE & STATUS OVERVIEW CARD */}
        <View
          style={[
            styles.heroStatusCard,
            {
              backgroundColor: theme.card,
              borderColor: isActive ? '#16A34A' : theme.border,
              borderWidth: isActive ? 1.5 : 1,
            },
            Shadows.medium,
          ]}
        >
          <View style={styles.statusCardTop}>
            <View style={[styles.serviceIconCircle, { backgroundColor: service.bgColor }]}>
              {service.icon}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.orderTitle, { color: theme.textPrimary }]}>{service.title}</Text>
              <Text style={[styles.orderSub, { color: theme.textSecondary }]}>{service.subtitle}</Text>
            </View>
            <Badge
              label={order.status.replace('_', ' ').toUpperCase()}
              variant={
                order.status === 'completed'
                  ? 'success'
                  : order.status === 'cancelled'
                  ? 'error'
                  : 'warning'
              }
            />
          </View>

          <View style={[styles.cardDivider, { backgroundColor: theme.borderLight }]} />

          <View style={styles.datePriceRow}>
            <View style={styles.metaCol}>
              <Text style={[styles.metaColLabel, { color: theme.textMuted }]}>Placed on</Text>
              <Text style={[styles.metaColVal, { color: theme.textPrimary }]}>{order.date}</Text>
            </View>
            <View style={styles.metaColRight}>
              <Text style={[styles.metaColLabel, { color: theme.textMuted }]}>Amount Paid</Text>
              <Text style={[styles.metaColValPrice, { color: '#16A34A' }]}>
                {formatCurrency(order.totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* 🌟 LIVE TRANSIT RADAR MAP SIMULATION (FOR ACTIVE ORDERS) */}
        {isActive && (
          <View
            style={[
              styles.radarCard,
              {
                backgroundColor: isDarkMode ? '#1E293B' : '#F0FDF4',
                borderColor: '#86EFAC',
              },
              Shadows.medium,
            ]}
          >
            {/* Radar Header */}
            <View style={styles.radarHeaderRow}>
              <View style={styles.radarPulseIndicator}>
                <View style={styles.pulseDot} />
                <Zap size={14} color="#16A34A" fill="#16A34A" style={{ marginRight: 4 }} />
                <Text style={styles.radarLiveBadgeText}>
                  LIVE TRACKING • {order.bookingDetails?.eta || 'ETA 8 MINS'}
                </Text>
              </View>

              <View style={styles.onTimePill}>
                <Sparkles size={11} color="#15803D" style={{ marginRight: 3 }} />
                <Text style={styles.onTimeText}>On Time Guarantee</Text>
              </View>
            </View>

            {/* Simulated Live Route Canvas */}
            <View style={styles.routeCanvas}>
              <View style={styles.routePoint}>
                <View style={[styles.routeIconCircle, { backgroundColor: service.bgColor }]}>
                  {service.icon}
                </View>
                <Text style={[styles.routePointLabel, { color: theme.textPrimary }]} numberOfLines={1}>
                  {service.title}
                </Text>
              </View>

              {/* Progress Line with Pulsing Delivery Vehicle */}
              <View style={styles.routeTrack}>
                <View style={[styles.routeTrackLine, { backgroundColor: '#BBF7D0' }]} />
                <View style={[styles.routeTrackActiveLine, { width: '70%', backgroundColor: '#16A34A' }]} />
                <View style={[styles.vehicleBeacon, { left: '68%' }]}>
                  <Navigation size={12} color="#FFFFFF" />
                </View>
              </View>

              <View style={styles.routePoint}>
                <View style={[styles.routeIconCircle, { backgroundColor: '#DCFCE7' }]}>
                  <MapPin size={16} color="#16A34A" />
                </View>
                <Text style={[styles.routePointLabel, { color: theme.textPrimary }]} numberOfLines={1}>
                  Doorstep
                </Text>
              </View>
            </View>

            {/* Delivery Safety PIN */}
            <View style={[styles.pinBox, { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF' }]}>
              <View>
                <Text style={[styles.pinBoxLabel, { color: theme.textSecondary }]}>
                  Secure Handover PIN
                </Text>
                <Text style={[styles.pinBoxSub, { color: theme.textMuted }]}>
                  Share with rider upon arrival
                </Text>
              </View>
              <View style={styles.pinCodePill}>
                <Text style={styles.pinCodeText}>4 8 9 2</Text>
              </View>
            </View>

            {/* Active Driver Profile & Quick Call */}
            {order.bookingDetails?.driverName && (
              <View
                style={[
                  styles.driverProfileBox,
                  {
                    backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                    borderColor: theme.border,
                  },
                ]}
              >
                <View style={styles.driverLeftCol}>
                  <View style={styles.driverAvatar}>
                    <Text style={styles.driverAvatarInitial}>
                      {order.bookingDetails.driverName.charAt(0)}
                    </Text>
                  </View>
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={[styles.driverName, { color: theme.textPrimary }]}>
                        {order.bookingDetails.driverName}
                      </Text>
                      <View style={styles.driverRatingPill}>
                        <Star size={9} color="#F59E0B" fill="#F59E0B" style={{ marginRight: 2 }} />
                        <Text style={styles.driverRatingText}>4.9</Text>
                      </View>
                    </View>
                    <Text style={[styles.driverVehicle, { color: theme.textSecondary }]}>
                      White Swift Dzire (KL-10-AZ-7890) • Vaccinated
                    </Text>
                  </View>
                </View>

                {order.bookingDetails.driverPhone && (
                  <TouchableOpacity
                    style={[styles.driverCallBtn, { backgroundColor: '#16A34A' }]}
                    activeOpacity={0.8}
                    onPress={() =>
                      Alert.alert(
                        'Calling Delivery Partner',
                        `Connecting to ${order.bookingDetails?.driverName} at ${order.bookingDetails?.driverPhone}...`
                      )
                    }
                  >
                    <Phone size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.driverCallBtnText}>Call</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Quick Delivery Instructions Chips */}
            <View style={styles.quickInstructionsRow}>
              <TouchableOpacity
                style={[styles.quickInstructionChip, { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF' }]}
                onPress={() => handleQuickMessage('Please ring the doorbell and leave at door')}
              >
                <Text style={[styles.quickInstructionText, { color: theme.textPrimary }]}>
                  🔔 Ring Doorbell
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickInstructionChip, { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF' }]}
                onPress={() => handleQuickMessage('Leave package with building security')}
              >
                <Text style={[styles.quickInstructionText, { color: theme.textPrimary }]}>
                  🛡️ Leave with Guard
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickInstructionChip, { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF' }]}
                onPress={() => handleQuickMessage('Call me when you reach Royal Mall')}
              >
                <Text style={[styles.quickInstructionText, { color: theme.textPrimary }]}>
                  📞 Call When Nearby
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 🌟 CANCELLATION & REFUND CARD (IF CANCELLED) */}
        {isCancelled && (
          <View style={styles.cancelledCard}>
            <View style={styles.cancelledHeaderRow}>
              <AlertCircle size={20} color="#DC2626" style={{ marginRight: 8 }} />
              <Text style={styles.cancelledTitle}>Booking Cancelled</Text>
            </View>
            <Text style={styles.cancelledReason}>
              {order.bookingDetails?.cancellationReason ||
                'This booking was cancelled. A 100% full refund has been credited immediately.'}
            </Text>

            <View style={styles.refundDetailsBox}>
              <View style={styles.refundRow}>
                <Text style={styles.refundLabel}>Refund Amount</Text>
                <Text style={styles.refundValue}>{formatCurrency(order.totalAmount)}</Text>
              </View>
              <View style={styles.refundRow}>
                <Text style={styles.refundLabel}>Refund Destination</Text>
                <Text style={styles.refundValueHighlight}>UBS Super Wallet (Instant)</Text>
              </View>
              <View style={styles.refundRow}>
                <Text style={styles.refundLabel}>Reference ID</Text>
                <Text style={styles.refundValue}>#RF-88491029</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewWalletBtn}
              activeOpacity={0.8}
              onPress={() => router.push('/wallet')}
            >
              <Text style={styles.viewWalletBtnText}>Check Wallet Balance</Text>
              <ChevronRight size={14} color="#991B1B" />
            </TouchableOpacity>
          </View>
        )}

        {/* 🌟 STATUS FULFILLMENT TIMELINE */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Fulfillment Progress
          </Text>
          <View style={styles.timelineStatusTag}>
            <ShieldCheck size={12} color="#16A34A" style={{ marginRight: 3 }} />
            <Text style={styles.timelineStatusTagText}>Live Tracking Verified</Text>
          </View>
        </View>

        <View style={[styles.timelineCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <StatusTimeline steps={steps} />
        </View>

        {/* 🌟 ITEMIZED ORDER RECEIPT */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Itemized Receipt</Text>
          <Text style={[styles.itemCountText, { color: theme.textSecondary }]}>
            {itemsList.length} items
          </Text>
        </View>

        <View style={[styles.receiptCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {itemsList.map((itemName, index) => (
            <View key={index} style={styles.receiptItemRow}>
              <View style={styles.itemBullet}>
                <Text style={styles.itemBulletText}>✓</Text>
              </View>
              <Text style={[styles.receiptItemName, { color: theme.textPrimary }]}>{itemName}</Text>
            </View>
          ))}

          <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

          {/* Breakdown Calculations */}
          <View style={styles.receiptMathRow}>
            <Text style={[styles.mathLabel, { color: theme.textSecondary }]}>Items Subtotal</Text>
            <Text style={[styles.mathVal, { color: theme.textPrimary }]}>
              {formatCurrency(Math.round(order.totalAmount * 0.9))}
            </Text>
          </View>

          <View style={styles.receiptMathRow}>
            <Text style={[styles.mathLabel, { color: theme.textSecondary }]}>Delivery Fee</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.strikeFee}>{formatCurrency(35)}</Text>
              <Text style={styles.freePill}>FREE</Text>
            </View>
          </View>

          <View style={styles.receiptMathRow}>
            <Text style={[styles.mathLabel, { color: theme.textSecondary }]}>
              Packaging & Chilled Bag
            </Text>
            <Text style={[styles.mathVal, { color: theme.textPrimary }]}>{formatCurrency(15)}</Text>
          </View>

          <View style={styles.receiptMathRow}>
            <Text style={[styles.mathLabel, { color: theme.textSecondary }]}>Taxes & GST (5%)</Text>
            <Text style={[styles.mathVal, { color: theme.textPrimary }]}>
              {formatCurrency(Math.round(order.totalAmount * 0.05))}
            </Text>
          </View>

          <View style={styles.receiptMathRow}>
            <Text style={[styles.savingsDiscountLabel, { color: '#16A34A' }]}>
              SuperPass Discount
            </Text>
            <Text style={styles.savingsDiscountVal}>-₹35</Text>
          </View>

          <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

          {/* Grand Total */}
          <View style={styles.grandTotalRow}>
            <View>
              <Text style={[styles.grandTotalLabel, { color: theme.textPrimary }]}>
                Total Amount Paid
              </Text>
              <Text style={[styles.paidViaSub, { color: theme.textSecondary }]}>
                Paid via {order.paymentMethod}
              </Text>
            </View>
            <Text style={[styles.grandTotalVal, { color: theme.textPrimary }]}>
              {formatCurrency(order.totalAmount)}
            </Text>
          </View>
        </View>

        {/* 🌟 DELIVERY DESTINATION */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Delivery Location
          </Text>
        </View>

        <View style={[styles.addressCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.addressLeftCol}>
            <View style={styles.addressPinCircle}>
              <MapPin size={17} color="#16A34A" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.addressTitle, { color: theme.textPrimary }]}>
                Home Address
              </Text>
              <Text style={[styles.addressSub, { color: theme.textSecondary }]}>
                {order.deliveryAddress}
              </Text>
              <Text style={[styles.addressNote, { color: theme.textMuted }]}>
                Contactless delivery instructions saved
              </Text>
            </View>
          </View>
        </View>

        {/* 🌟 RATING & REVIEW EXPERIENCE (FOR COMPLETED ORDERS) */}
        {isCompleted && (
          <View style={[styles.ratingBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.ratingTitle, { color: theme.textPrimary }]}>
              How was your experience with {service.title}?
            </Text>
            <Text style={[styles.ratingSub, { color: theme.textSecondary }]}>
              Your rating helps us improve partner quality
            </Text>

            <View style={styles.starsSelectorRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  style={styles.starBtn}
                  activeOpacity={0.7}
                  onPress={() => {
                    setUserRating(star);
                    setHasRated(true);
                    showToast(`🌟 Rated ${star} Stars! Thank you.`);
                  }}
                >
                  <Star
                    size={30}
                    color={star <= userRating ? '#F59E0B' : theme.border}
                    fill={star <= userRating ? '#F59E0B' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 🌟 REORDER / ACTION BUTTONS */}
        <View style={styles.bottomActionsCol}>
          {isCompleted && (
            <TouchableOpacity
              style={[styles.bigReorderBtn, { backgroundColor: '#16A34A' }]}
              activeOpacity={0.88}
              onPress={handleReorder}
            >
              <RotateCcw size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.bigReorderBtnText}>Reorder This {order.category.toUpperCase()}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.secondaryActionsRow}>
            <TouchableOpacity
              style={[styles.actionHalfBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              activeOpacity={0.8}
              onPress={() =>
                Alert.alert(
                  'Tax Invoice Downloaded',
                  `Official Tax Invoice for Order #${order.id} has been saved to your downloads.`
                )
              }
            >
              <Download size={15} color={theme.textPrimary} style={{ marginRight: 6 }} />
              <Text style={[styles.actionHalfBtnText, { color: theme.textPrimary }]}>
                Download Invoice
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionHalfBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              activeOpacity={0.8}
              onPress={() => setShowSupportModal(true)}
            >
              <HelpCircle size={15} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={[styles.actionHalfBtnText, { color: '#2563EB' }]}>
                Need Help
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Razorpay Retry Checkout Modal */}
      <RazorpayCheckoutModal
        visible={isRazorpayRetryModal}
        options={
          retryRazorpayData
            ? {
                keyId: retryRazorpayData.keyId,
                orderId: retryRazorpayData.id || retryRazorpayData.orderId,
                amount: retryRazorpayData.amount,
                amountInPaise: retryRazorpayData.amountInPaise || Math.round(retryRazorpayData.amount * 100),
                currency: retryRazorpayData.currency || 'INR',
                name: 'UBS Super Marketplace',
                description: `Payment for Order #${order.id}`,
                onSuccess: handleVerifyRetrySuccess,
                onFailure: (err) => Alert.alert('Payment Failed', err.message),
                onCancel: () => setIsRazorpayRetryModal(false),
              }
            : null
        }
        onClose={() => setIsRazorpayRetryModal(false)}
      />

      {/* Order Support Modal */}
      <Modal visible={showSupportModal} transparent animationType="fade">
        <View style={styles.supportModalOverlay}>
          <View style={[styles.supportModalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.supportModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Headphones size={20} color={theme.primary} />
                <Text style={[styles.supportModalTitle, { color: theme.textPrimary }]}>
                  Order Support & Care
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowSupportModal(false)}>
                <X size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.supportModalSub, { color: theme.textSecondary }]}>
              Need assistance with Order #{order.id}? Connect with our 24/7 UBS Customer Care desk.
            </Text>

            {/* Call Action */}
            <TouchableOpacity
              style={[styles.supportActionRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => {
                setShowSupportModal(false);
                openDialer(UBS_OFFICIAL_CONTACT.phone);
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.supportIconWrap, { backgroundColor: '#DCFCE7' }]}>
                <Phone size={18} color="#16A34A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.supportActionTitle, { color: theme.textPrimary }]}>Call UBS Hotline</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.primary, marginTop: 1 }}>
                  {UBS_OFFICIAL_CONTACT.phone}
                </Text>
              </View>
              <ChevronRight size={16} color={theme.textSecondary} />
            </TouchableOpacity>

            {/* Email Action */}
            <TouchableOpacity
              style={[styles.supportActionRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => {
                setShowSupportModal(false);
                openEmail(UBS_OFFICIAL_CONTACT.email, `Support Request for Order #${order.id}`);
              }}
              activeOpacity={0.8}
            >
              <View style={[styles.supportIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Mail size={18} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.supportActionTitle, { color: theme.textPrimary }]}>Email Customer Care</Text>
                <Text style={{ fontSize: 12, color: theme.textSecondary, marginTop: 1 }}>
                  {UBS_OFFICIAL_CONTACT.email}
                </Text>
              </View>
              <ChevronRight size={16} color={theme.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.faqLinkBtn, { borderColor: theme.border }]}
              onPress={() => {
                setShowSupportModal(false);
                router.push('/support');
              }}
            >
              <HelpCircle size={16} color={theme.textPrimary} style={{ marginRight: 6 }} />
              <Text style={[styles.faqLinkText, { color: theme.textPrimary }]}>Browse Support FAQs & Live Chat</Text>
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
    paddingVertical: Spacing.xs + 4,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  headerTitleCol: {
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.sizes.md + 1,
    fontWeight: Typography.weights.bold,
  },
  orderIdCopyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '700',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toastContainer: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    zIndex: 90,
    alignItems: 'center',
  },
  toastPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    ...Shadows.medium,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
  },
  heroStatusCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
  },
  statusCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  orderSub: {
    fontSize: 11,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    marginVertical: Spacing.sm + 2,
  },
  datePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaCol: {
    flex: 1,
  },
  metaColLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  metaColVal: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  metaColRight: {
    alignItems: 'flex-end',
  },
  metaColValPrice: {
    fontSize: 20,
    fontWeight: '900',
    marginTop: 1,
  },
  radarCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    marginBottom: Spacing.lg,
  },
  radarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  radarPulseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },
  radarLiveBadgeText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  onTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  onTimeText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '800',
  },
  routeCanvas: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: Spacing.xs,
    paddingHorizontal: 4,
  },
  routePoint: {
    alignItems: 'center',
    maxWidth: 75,
  },
  routeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    ...Shadows.small,
  },
  routePointLabel: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  routeTrack: {
    flex: 1,
    height: 30,
    justifyContent: 'center',
    position: 'relative',
    marginHorizontal: 8,
  },
  routeTrackLine: {
    height: 4,
    borderRadius: 2,
    width: '100%',
  },
  routeTrackActiveLine: {
    position: 'absolute',
    height: 4,
    borderRadius: 2,
  },
  vehicleBeacon: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    top: 3,
    ...Shadows.small,
  },
  pinBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.sm,
  },
  pinBoxLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  pinBoxSub: {
    fontSize: 9,
    marginTop: 1,
  },
  pinCodePill: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
  },
  pinCodeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  driverProfileBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginVertical: 4,
  },
  driverLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarInitial: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  driverName: {
    fontSize: 13,
    fontWeight: '800',
  },
  driverRatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
  },
  driverRatingText: {
    color: '#92400E',
    fontSize: 9,
    fontWeight: '800',
  },
  driverVehicle: {
    fontSize: 10,
    marginTop: 2,
  },
  driverCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    ...Shadows.small,
  },
  driverCallBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  quickInstructionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  quickInstructionChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginRight: 6,
    marginBottom: 4,
    ...Shadows.small,
  },
  quickInstructionText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cancelledCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
  },
  cancelledHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cancelledTitle: {
    color: '#991B1B',
    fontSize: 14,
    fontWeight: '800',
  },
  cancelledReason: {
    color: '#7F1D1D',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: Spacing.sm,
  },
  refundDetailsBox: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  refundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  refundLabel: {
    color: '#4B5563',
    fontSize: 11,
  },
  refundValue: {
    color: '#111827',
    fontSize: 11,
    fontWeight: '700',
  },
  refundValueHighlight: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '800',
  },
  viewWalletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  viewWalletBtnText: {
    color: '#991B1B',
    fontSize: 11,
    fontWeight: '800',
    marginRight: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs + 2,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  timelineStatusTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineStatusTagText: {
    color: '#16A34A',
    fontSize: 10,
    fontWeight: '700',
  },
  timelineCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  itemCountText: {
    fontSize: 11,
    fontWeight: '600',
  },
  receiptCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  receiptItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 5,
  },
  itemBullet: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 2,
  },
  itemBulletText: {
    color: '#15803D',
    fontSize: 9,
    fontWeight: '900',
  },
  receiptItemName: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  receiptMathRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  mathLabel: {
    fontSize: 12,
  },
  mathVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  strikeFee: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  freePill: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '800',
  },
  savingsDiscountLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  savingsDiscountVal: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '800',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  paidViaSub: {
    fontSize: 10,
    marginTop: 1,
  },
  grandTotalVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  addressCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  addressLeftCol: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressPinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  addressTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  addressSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 18,
  },
  addressNote: {
    fontSize: 10,
    marginTop: 4,
  },
  ratingBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  ratingTitle: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  ratingSub: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  starsSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  starBtn: {
    paddingHorizontal: 6,
  },
  bottomActionsCol: {
    marginTop: Spacing.sm,
  },
  bigReorderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.full,
    marginBottom: 10,
    ...Shadows.medium,
  },
  bigReorderBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionHalfBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  actionHalfBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  supportModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  supportModalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    ...Shadows.large,
  },
  supportModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  supportModalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  supportModalSub: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  supportActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: 12,
  },
  supportIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportActionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  faqLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
  faqLinkText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
