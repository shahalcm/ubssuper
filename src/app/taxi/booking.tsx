// src/app/taxi/booking.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { useTaxiStore } from '@/store/taxiStore';
import { showCustomAlert } from '@/store/popupStore';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/services/api/client';
import { RazorpayCheckoutModal } from '@/components/modals/RazorpayCheckoutModal';
import { StatusTimeline, TimelineStep } from '@/components/ui/StatusTimeline';
import MapView, { Marker, Polyline } from '@/components/maps/MapViewWrapper';
import {
  Phone,
  ShieldCheck,
  ShieldAlert,
  Share2,
  ArrowLeft,
  Star,
  MapPin,
  Navigation,
  Car,
  MessageSquare,
  CheckCircle2,
  Clock,
  Compass,
  Zap,
  Info,
  DollarSign,
  Heart,
  Send,
} from 'lucide-react-native';

const QUICK_MESSAGES = [
  'I am waiting at the main entrance gate',
  'Please turn on AC',
  'I have 2 large luggage bags',
  'Please call when you arrive',
];

const DRIVER_COMPLIMENTS = [
  'Smooth Driving',
  'Spotless Clean Car',
  'Polite & Courteous',
  'Great Music',
  'AC on Point',
  'Quick Route',
];

const TIP_OPTIONS = [0, 20, 30, 50, 100];

export default function TaxiBookingScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const {
    activeBooking,
    pickupCoords,
    destinationCoords,
    routePolyline,
    cancelBooking,
    resetTaxi,
    updateBookingStatus,
    completeRide,
    checkActiveRideStatus,
  } = useTaxiStore();

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [selectedTip, setSelectedTip] = useState(20);
  const [selectedCompliments, setSelectedCompliments] = useState<string[]>([
    'Smooth Driving',
    'Spotless Clean Car',
  ]);
  const [chatMessages, setChatMessages] = useState<string[]>([
    'Driver: Hello! I am on my way to your pickup location.',
  ]);
  const [customMsg, setCustomMsg] = useState('');
  const [showChatModal, setShowChatModal] = useState(false);
  const [isRazorpayRideModal, setIsRazorpayRideModal] = useState(false);
  const [razorpayRideData, setRazorpayRideData] = useState<any | null>(null);
  const [isProcessingRidePayment, setIsProcessingRidePayment] = useState(false);


  // Poll backend for real-time ride status transitions (driver assigned, arrived, started, completed)
  useEffect(() => {
    if (!activeBooking || activeBooking.status === 'completed' || activeBooking.status === 'cancelled') {
      return;
    }
    checkActiveRideStatus();
    const interval = setInterval(() => {
      checkActiveRideStatus();
    }, 3500);
    return () => clearInterval(interval);
  }, [activeBooking?.id, activeBooking?.status]);

  if (!activeBooking) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.emptyBox}>
          <Car size={64} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            No Active Ride Found
          </Text>
          <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
            You do not have any ongoing cab or auto bookings right now.
          </Text>
          <Button
            title="Book a Ride Now"
            onPress={() => router.replace('/taxi')}
            style={{ marginTop: Spacing.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isSearching = activeBooking.status === 'searching';
  const isDriverAssigned = activeBooking.status === 'driver_assigned';
  const isDriverArriving = activeBooking.status === 'driver_arriving';
  const isInProgress = activeBooking.status === 'in_progress';
  const isCompleted = activeBooking.status === 'completed';
  const isCancelled = activeBooking.status === 'cancelled';

  const driver = activeBooking.driver;

  const steps: TimelineStep[] = [
    {
      title: 'Ride Requested',
      time: 'Just now',
      completed: true,
      current: false,
    },
    {
      title: isSearching ? 'Searching Nearby Drivers...' : 'Driver Assigned',
      subtitle: driver
        ? `${driver.name} accepted your trip`
        : 'Broadcasting to nearest vehicles',
      completed: !isSearching,
      current: isSearching,
    },
    {
      title: 'Driver Arrived at Pickup',
      subtitle: isDriverArriving ? 'Driver is waiting at your gate' : undefined,
      completed: isInProgress || isCompleted,
      current: isDriverAssigned || isDriverArriving,
    },
    {
      title: 'Trip in Progress',
      subtitle: isInProgress ? 'Heading towards destination' : undefined,
      completed: isCompleted,
      current: isInProgress,
    },
    {
      title: 'Destination Reached',
      completed: isCompleted,
      current: false,
    },
  ];

  const handleSendQuickMsg = (msg: string) => {
    setChatMessages((prev) => [...prev, `You: ${msg}`]);
    Alert.alert('Message Sent to Driver', `"${msg}" sent to ${driver?.name || 'driver'}`);
  };

  const handleSendCustomMsg = () => {
    if (!customMsg.trim()) return;
    setChatMessages((prev) => [...prev, `You: ${customMsg}`]);
    setCustomMsg('');
    Alert.alert('Message Sent', 'Driver has received your message.');
  };

  const toggleCompliment = (comp: string) => {
    if (selectedCompliments.includes(comp)) {
      setSelectedCompliments(selectedCompliments.filter((c) => c !== comp));
    } else {
      setSelectedCompliments([...selectedCompliments, comp]);
    }
  };

  const handleInitiateRidePayment = async () => {
    if (!activeBooking) return;

    if (activeBooking.paymentMethod === 'cash') {
      finalizeRideCompletion();
      return;
    }

    setIsProcessingRidePayment(true);
    try {
      const res: any = await apiClient.post(`/taxi/ride/${activeBooking.id}/payment/create-order`);
      const rzpData = res?.data || res;
      if (rzpData?.orderId) {
        setRazorpayRideData(rzpData);
        setIsRazorpayRideModal(true);
      } else {
        finalizeRideCompletion();
      }
    } catch {
      finalizeRideCompletion();
    } finally {
      setIsProcessingRidePayment(false);
    }
  };

  const handleVerifyRidePaymentSuccess = async (paymentResult: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => {
    try {
      await apiClient.post(`/taxi/ride/${activeBooking.id}/payment/verify`, {
        orderId: paymentResult.razorpay_order_id,
        paymentId: paymentResult.razorpay_payment_id,
        signature: paymentResult.razorpay_signature,
      });
      setIsRazorpayRideModal(false);
      finalizeRideCompletion();
    } catch (err: any) {
      Alert.alert('Verification Failed', err.message || 'Payment signature verification failed.');
    }
  };

  const finalizeRideCompletion = () => {
    completeRide(userRating, selectedTip);
    setShowRatingModal(false);
    resetTaxi();
    showCustomAlert(
      'Thank You for Riding with UBS Super!',
      `Trip receipt has been saved to your Ride History.\nTotal Paid: ${formatCurrency(
        activeBooking.fare + selectedTip
      )}`,
      [
        {
          text: 'View Receipt',
          onPress: () => router.replace('/taxi/history'),
        },
        {
          text: 'Return Home',
          onPress: () => router.replace('/(tabs)'),
        },
      ],
      { type: 'success' }
    );
  };

  const handleCompleteRating = () => {
    handleInitiateRidePayment();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            Trip #{activeBooking.id}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {activeBooking.rideOption.name}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/taxi/safety' as any)}
          style={styles.safetyHeaderBtn}
        >
          <ShieldAlert size={18} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Status Hero Card */}
        {isSearching ? (
          <View
            style={[
              styles.searchingCard,
              { backgroundColor: theme.card, borderColor: theme.border },
              Shadows.medium,
            ]}
          >
            {/* Radar Animation Visual */}
            <View style={styles.radarContainer}>
              <View style={[styles.radarRing3, { borderColor: theme.amber + '30' }]} />
              <View style={[styles.radarRing2, { borderColor: theme.amber + '60' }]} />
              <View style={[styles.radarCenter, { backgroundColor: theme.amber }]}>
                <Car size={24} color="#FFFFFF" />
              </View>
            </View>

            <Text style={[styles.searchingTitle, { color: theme.textPrimary }]}>
              Connecting to Nearby Drivers...
            </Text>
            <Text style={[styles.searchingSub, { color: theme.textSecondary }]}>
              Searching for nearest available {activeBooking.rideOption.name} within 3 km
            </Text>
            <View style={[styles.etaTag, { backgroundColor: theme.surface }]}>
              <Clock size={12} color={theme.amber} style={{ marginRight: 4 }} />
              <Text style={[styles.etaTagText, { color: theme.textPrimary }]}>
                Estimated match: 2-3 seconds
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.cancelSearchBtn, { borderColor: theme.border }]}
              onPress={() => {
                cancelBooking();
                router.back();
              }}
            >
              <Text style={styles.cancelSearchText}>Cancel Request</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Driver Assigned / In Transit Experience */
          <View>
            {/* START OTP Banner */}
            <View style={[styles.otpBanner, Shadows.small]}>
              <View style={styles.otpLeft}>
                <ShieldCheck size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <View>
                  <Text style={styles.otpLabel}>START PIN</Text>
                  <Text style={styles.otpCode}>{activeBooking.otp || '••••'}</Text>
                </View>
              </View>
              <View style={styles.otpRight}>
                <Text style={styles.otpHint}>
                  Share with driver only after verifying vehicle plate
                </Text>
              </View>
            </View>

            {/* Live Route Map Tracking Visual */}
            <View
              style={[
                styles.liveMapCard,
                { backgroundColor: isDarkMode ? '#0F172A' : '#F1F5F9', borderColor: theme.border },
                Shadows.medium,
              ]}
            >
              <MapView
                style={StyleSheet.absoluteFill}
                initialRegion={{
                  latitude: ((pickupCoords?.latitude || 11.2588) + (destinationCoords?.latitude || 11.3040)) / 2,
                  longitude: ((pickupCoords?.longitude || 75.7804) + (destinationCoords?.longitude || 75.7750)) / 2,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
              >
                {/* Pickup Marker */}
                <Marker
                  coordinate={pickupCoords || { latitude: 11.2588, longitude: 75.7804 }}
                  title="Pickup Point"
                >
                  <View style={{ alignItems: 'center' }}>
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#16A34A', alignItems: 'center', justifyContent: 'center' }}>
                      <Navigation size={12} color="#FFFFFF" />
                    </View>
                  </View>
                </Marker>

                {/* Destination Marker */}
                <Marker
                  coordinate={destinationCoords || { latitude: 11.3040, longitude: 75.7750 }}
                  title="Destination"
                >
                  <View style={{ alignItems: 'center' }}>
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#DC2626', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin size={12} color="#FFFFFF" />
                    </View>
                  </View>
                </Marker>

                {/* Driver Live Marker */}
                {driver && (
                  <Marker
                    coordinate={
                      isInProgress
                        ? destinationCoords || { latitude: 11.3040, longitude: 75.7750 }
                        : pickupCoords || { latitude: 11.2588, longitude: 75.7804 }
                    }
                    title={driver.name}
                  >
                    <View style={{ alignItems: 'center' }}>
                      <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#0B4DFF', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' }}>
                        <Car size={14} color="#FFFFFF" />
                      </View>
                      <View style={{ backgroundColor: '#0F172A', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 2 }}>
                        <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '800' }}>
                          {driver.vehicleNumber || 'UBS TAXI'}
                        </Text>
                      </View>
                    </View>
                  </Marker>
                )}

                {/* Route Polyline */}
                {routePolyline && routePolyline.length > 1 && (
                  <Polyline coordinates={routePolyline} strokeColor="#16A34A" strokeWidth={4} />
                )}
              </MapView>

              {/* Status pill on map */}
              <View style={[styles.mapStatusPill, Shadows.small]}>
                <View style={[styles.liveBlinker, { backgroundColor: '#16A34A' }]} />
                <Text style={styles.mapStatusPillText}>
                  {isInProgress
                    ? 'In Transit: ~19 mins to destination (48 km/h)'
                    : isDriverArriving
                    ? 'Driver Arrived at Pickup Gate'
                    : 'Driver Arriving in 3 mins • 1.2 km away'}
                </Text>
              </View>
            </View>

            {/* Driver Profile Card */}
            {driver && (
              <View
                style={[
                  styles.driverCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  Shadows.medium,
                ]}
              >
                <View style={styles.driverMainRow}>
                  <Image
                    source={{ uri: driver.photo }}
                    style={styles.driverPhoto}
                    resizeMode="cover"
                  />
                  <View style={styles.driverDetails}>
                    <View style={styles.driverNameRow}>
                      <Text style={[styles.driverName, { color: theme.textPrimary }]}>
                        {driver.name}
                      </Text>
                      <View style={styles.verifiedBadge}>
                        <ShieldCheck size={12} color="#15803D" />
                        <Text style={styles.verifiedText}>Verified</Text>
                      </View>
                    </View>

                    <View style={styles.ratingRow}>
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      <Text style={[styles.ratingNumber, { color: theme.textPrimary }]}>
                        {driver.rating}
                      </Text>
                      <Text style={[styles.ratingCount, { color: theme.textSecondary }]}>
                        ({driver.tripsCount} trips)
                      </Text>
                    </View>

                    <Text style={[styles.carModelText, { color: theme.textSecondary }]}>
                      {driver.vehicleModel} • {driver.vehicleColor}
                    </Text>
                  </View>

                  {/* Kerala Number Plate */}
                  <View style={styles.plateBox}>
                    <View style={styles.plateIndStripe}>
                      <Text style={styles.plateIndText}>IND</Text>
                    </View>
                    <Text style={styles.plateText}>{driver.vehicleNumber}</Text>
                  </View>
                </View>

                {/* Direct Action Buttons */}
                <View style={styles.driverActionButtons}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#DCFCE7' }]}
                    onPress={() => {
                      Alert.alert('Calling Driver', `Dialing ${driver.name} (${driver.phone})...`);
                    }}
                  >
                    <Phone size={16} color="#15803D" style={{ marginRight: 6 }} />
                    <Text style={[styles.actionBtnText, { color: '#15803D' }]}>Call Driver</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#EFF6FF' }]}
                    onPress={() => setShowChatModal(true)}
                  >
                    <MessageSquare size={16} color="#2563EB" style={{ marginRight: 6 }} />
                    <Text style={[styles.actionBtnText, { color: '#2563EB' }]}>Chat</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#FEF2F2' }]}
                    onPress={() => router.push('/taxi/safety' as any)}
                  >
                    <ShieldAlert size={16} color="#DC2626" style={{ marginRight: 6 }} />
                    <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>Safety SOS</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Quick Messages Rail */}
            {!isInProgress && (
              <View style={styles.quickMessagesSection}>
                <Text style={[styles.quickMsgHeading, { color: theme.textSecondary }]}>
                  QUICK MESSAGE TO DRIVER
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {QUICK_MESSAGES.map((msg, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.quickMsgPill,
                        { backgroundColor: theme.card, borderColor: theme.border },
                        Shadows.small,
                      ]}
                      onPress={() => handleSendQuickMsg(msg)}
                    >
                      <Text style={[styles.quickMsgText, { color: theme.textPrimary }]}>
                        {msg}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Trip Simulation Controls (Demo Helper) */}
            <View
              style={[
                styles.simulatorBox,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.simHeader}>
                <Zap size={14} color={theme.amber} style={{ marginRight: 4 }} />
                <Text style={[styles.simTitle, { color: theme.textPrimary }]}>
                  Trip Lifecycle Simulator
                </Text>
              </View>

              <View style={styles.simButtonsRow}>
                {isDriverAssigned && (
                  <Button
                    title="Simulate: Driver Arrived"
                    size="sm"
                    onPress={() => updateBookingStatus('driver_arriving')}
                    style={{ flex: 1, marginRight: 6 }}
                  />
                )}
                {isDriverArriving && (
                  <Button
                    title="Start Trip (PIN Verified)"
                    size="sm"
                    onPress={() => updateBookingStatus('in_progress')}
                    style={{ flex: 1, marginRight: 6 }}
                  />
                )}
                {isInProgress && (
                  <Button
                    title="Complete Trip (Reached)"
                    size="sm"
                    onPress={() => setShowRatingModal(true)}
                    style={{ flex: 1 }}
                  />
                )}
              </View>
            </View>
          </View>
        )}

        {/* Route Details Box */}
        <View
          style={[
            styles.routeBox,
            { backgroundColor: theme.card, borderColor: theme.border },
            Shadows.small,
          ]}
        >
          <View style={styles.routeRow}>
            <Navigation size={16} color="#16A34A" style={{ marginRight: Spacing.sm }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.routeLabel, { color: theme.textSecondary }]}>PICKUP</Text>
              <Text style={[styles.routeAddress, { color: theme.textPrimary }]}>
                {activeBooking.pickup}
              </Text>
            </View>
          </View>

          <View style={[styles.routeDivider, { backgroundColor: theme.border }]} />

          <View style={styles.routeRow}>
            <MapPin size={16} color="#DC2626" style={{ marginRight: Spacing.sm }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.routeLabel, { color: theme.textSecondary }]}>DESTINATION</Text>
              <Text style={[styles.routeAddress, { color: theme.textPrimary }]}>
                {activeBooking.destination}
              </Text>
            </View>
          </View>
        </View>

        {/* Fare Summary Breakdown */}
        <View
          style={[
            styles.fareBox,
            { backgroundColor: theme.card, borderColor: theme.border },
            Shadows.small,
          ]}
        >
          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: theme.textSecondary }]}>Ride Tier</Text>
            <Text style={[styles.fareVal, { color: theme.textPrimary }]}>
              {activeBooking.rideOption.name}
            </Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: theme.textSecondary }]}>Payment Mode</Text>
            <Text style={[styles.fareVal, { color: theme.textPrimary }]}>
              {activeBooking.paymentMethod === 'wallet'
                ? 'UBS Super Wallet'
                : activeBooking.paymentMethod === 'upi'
                ? 'Google Pay UPI'
                : 'Cash on Drop'}
            </Text>
          </View>

          {activeBooking.discount ? (
            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, { color: '#16A34A' }]}>
                Coupon Discount ({activeBooking.promoCode})
              </Text>
              <Text style={[styles.fareVal, { color: '#16A34A' }]}>
                -{formatCurrency(activeBooking.discount)}
              </Text>
            </View>
          ) : null}

          <View style={[styles.routeDivider, { backgroundColor: theme.border }]} />

          <View style={styles.fareRow}>
            <Text style={[styles.fareTotalLabel, { color: theme.textPrimary }]}>
              Total Payable Fare
            </Text>
            <Text style={[styles.fareTotalVal, { color: theme.primary }]}>
              {formatCurrency(activeBooking.fare)}
            </Text>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={{ marginVertical: Spacing.md }}>
          <Text style={[styles.timelineHeading, { color: theme.textPrimary }]}>
            Trip Progress
          </Text>
          <StatusTimeline steps={steps} />
        </View>

        {/* Finish / Rating Trigger */}
        {!isSearching && (
          <Button
            title="Complete Trip & Pay"
            size="lg"
            onPress={() => setShowRatingModal(true)}
            style={{ marginTop: Spacing.sm }}
          />
        )}

        {/* Cancel Booking */}
        <Button
          title="Cancel Booking"
          variant="danger"
          size="md"
          onPress={() => {
            showCustomAlert(
              'Cancel Trip?',
              'Are you sure you want to cancel this ride? No cancellation fees apply within 5 mins.',
              [
                { text: 'Keep Ride', style: 'cancel' },
                {
                  text: 'Yes, Cancel',
                  style: 'destructive',
                  onPress: () => {
                    cancelBooking();
                    router.back();
                  },
                },
              ],
              { type: 'destructive' }
            );
          }}
          style={{ marginTop: Spacing.md, marginBottom: Spacing.xxl }}
        />
      </ScrollView>

      {/* Driver Rating & Review Modal */}
      <Modal visible={showRatingModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Rate Your Trip
            </Text>
            <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
              How was your journey with {driver?.name}?
            </Text>

            {/* Stars Selector */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                  <Star
                    size={40}
                    color="#F59E0B"
                    fill={star <= userRating ? '#F59E0B' : 'transparent'}
                    style={{ marginHorizontal: 6 }}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Compliment Chips */}
            <Text style={[styles.complimentHeading, { color: theme.textSecondary }]}>
              WHAT WENT GREAT?
            </Text>
            <View style={styles.complimentsWrap}>
              {DRIVER_COMPLIMENTS.map((item) => {
                const isSelected = selectedCompliments.includes(item);
                return (
                  <TouchableOpacity
                    key={item}
                    style={[
                      styles.complimentChip,
                      {
                        backgroundColor: isSelected ? theme.primary + '18' : theme.surface,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => toggleCompliment(item)}
                  >
                    <Text
                      style={[
                        styles.complimentText,
                        { color: isSelected ? theme.primary : theme.textPrimary },
                      ]}
                    >
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Tip Driver Section */}
            <Text style={[styles.complimentHeading, { color: theme.textSecondary, marginTop: Spacing.md }]}>
              ADD A DRIVER TIP
            </Text>
            <View style={styles.tipRow}>
              {TIP_OPTIONS.map((tip) => (
                <TouchableOpacity
                  key={tip}
                  style={[
                    styles.tipChip,
                    {
                      backgroundColor: selectedTip === tip ? theme.primary : theme.surface,
                      borderColor: selectedTip === tip ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setSelectedTip(tip)}
                >
                  <Text
                    style={[
                      styles.tipText,
                      { color: selectedTip === tip ? '#FFFFFF' : theme.textPrimary },
                    ]}
                  >
                    {tip === 0 ? 'No Tip' : `+₹${tip}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Total Paid Summary */}
            <View style={[styles.finalFareReceipt, { backgroundColor: theme.surface }]}>
              <Text style={[styles.finalFareText, { color: theme.textSecondary }]}>
                Total Bill Amount:
              </Text>
              <Text style={[styles.finalFareAmount, { color: theme.primary }]}>
                {formatCurrency(activeBooking.fare + selectedTip)}
              </Text>
            </View>

            <Button
              title="Submit Rating & Receipt"
              size="lg"
              onPress={handleCompleteRating}
              style={{ width: '100%', marginTop: Spacing.md }}
            />
          </View>
        </View>
      </Modal>

      {/* Driver Chat Modal */}
      <Modal visible={showChatModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, maxHeight: '80%' }]}>
            <View style={styles.chatHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                Chat with {driver?.name}
              </Text>
              <TouchableOpacity onPress={() => setShowChatModal(false)}>
                <Text style={{ color: theme.primary, fontWeight: '700' }}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.chatScroll}>
              {chatMessages.map((m, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.chatBubble,
                    m.startsWith('You:')
                      ? [styles.chatBubbleUser, { backgroundColor: theme.primary }]
                      : [styles.chatBubbleDriver, { backgroundColor: theme.surface }],
                  ]}
                >
                  <Text
                    style={[
                      styles.chatBubbleText,
                      { color: m.startsWith('You:') ? '#FFFFFF' : theme.textPrimary },
                    ]}
                  >
                    {m}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={[styles.chatInputRow, { borderColor: theme.border }]}>
              <TextInput
                style={[styles.chatTextInput, { color: theme.textPrimary }]}
                placeholder="Type a message to driver..."
                placeholderTextColor={theme.textMuted}
                value={customMsg}
                onChangeText={setCustomMsg}
              />
              <TouchableOpacity
                onPress={handleSendCustomMsg}
                style={[styles.sendBtn, { backgroundColor: theme.primary }]}
              >
                <Send size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Razorpay Ride Payment Modal */}
      <RazorpayCheckoutModal
        visible={isRazorpayRideModal}
        options={
          razorpayRideData
            ? {
                keyId: razorpayRideData.keyId,
                orderId: razorpayRideData.orderId,
                amount: razorpayRideData.amount,
                amountInPaise: razorpayRideData.amountInPaise || Math.round(razorpayRideData.amount * 100),
                currency: razorpayRideData.currency || 'INR',
                name: 'UBS Super Taxi',
                description: `Trip Fare #${activeBooking.id}`,
                onSuccess: handleVerifyRidePaymentSuccess,
                onFailure: (err) => Alert.alert('Payment Failed', err.message),
                onCancel: () => setIsRazorpayRideModal(false),
              }
            : null
        }
        onClose={() => setIsRazorpayRideModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  headerSubtitle: {
    fontSize: 10,
    marginTop: 1,
  },
  safetyHeaderBtn: {
    padding: Spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.md,
  },
  emptySub: {
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  searchingCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  radarContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
    position: 'relative',
  },
  radarRing3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  radarRing2: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
  },
  radarCenter: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchingTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
  searchingSub: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: Spacing.md,
  },
  etaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  etaTagText: {
    fontSize: 11,
    fontWeight: Typography.weights.semibold,
  },
  cancelSearchBtn: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  cancelSearchText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    color: '#DC2626',
  },
  otpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#16A34A',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.sm,
  },
  otpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  otpLabel: {
    color: '#FFFFFFCC',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  otpCode: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.lg,
    fontWeight: '900',
    letterSpacing: 2,
  },
  otpRight: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: Spacing.sm,
  },
  otpHint: {
    color: '#FFFFFFE6',
    fontSize: 10,
    textAlign: 'right',
  },
  liveMapCard: {
    height: 140,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginVertical: Spacing.sm,
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapGridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '48%',
    height: 24,
    backgroundColor: '#94A3B830',
  },
  mapGridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '52%',
    width: 24,
    backgroundColor: '#94A3B830',
  },
  movingVehicleBeacon: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  carBeaconPulse: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  beaconPlateBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: 6,
  },
  beaconPlateText: {
    color: '#F8FAFC',
    fontSize: 9,
    fontWeight: '800',
  },
  mapStatusPill: {
    position: 'absolute',
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFFEE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    zIndex: 3,
  },
  liveBlinker: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  mapStatusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  driverCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  driverMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverPhoto: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  driverDetails: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverName: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
    marginLeft: 6,
  },
  verifiedText: {
    fontSize: 8,
    color: '#15803D',
    fontWeight: '700',
    marginLeft: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  ratingNumber: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    marginLeft: 3,
  },
  ratingCount: {
    fontSize: 10,
    marginLeft: 2,
  },
  carModelText: {
    fontSize: 11,
  },
  plateBox: {
    backgroundColor: '#FACC15',
    borderWidth: 1.5,
    borderColor: '#000000',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignItems: 'center',
  },
  plateIndStripe: {
    backgroundColor: '#000000',
    paddingHorizontal: 3,
    paddingVertical: 0.5,
    borderRadius: 2,
    marginBottom: 1,
  },
  plateIndText: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '900',
  },
  plateText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  driverActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.xs,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  quickMessagesSection: {
    marginBottom: Spacing.md,
  },
  quickMsgHeading: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  quickMsgPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  quickMsgText: {
    fontSize: 11,
    fontWeight: Typography.weights.medium,
  },
  simulatorBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  simHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  simTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  simButtonsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  routeBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  routeAddress: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.semibold,
    marginTop: 2,
  },
  routeDivider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  fareBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  fareLabel: {
    fontSize: 11,
  },
  fareVal: {
    fontSize: 11,
    fontWeight: Typography.weights.semibold,
  },
  fareTotalLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  fareTotalVal: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  timelineHeading: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
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
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  modalSub: {
    fontSize: Typography.sizes.xs,
    marginTop: 4,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    marginVertical: Spacing.sm,
  },
  complimentHeading: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: Spacing.xs,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  complimentsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%',
  },
  complimentChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: 6,
    marginBottom: 6,
  },
  complimentText: {
    fontSize: 10,
    fontWeight: Typography.weights.semibold,
  },
  tipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 4,
  },
  tipChip: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  tipText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
  finalFareReceipt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  finalFareText: {
    fontSize: Typography.sizes.xs,
  },
  finalFareAmount: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.md,
  },
  chatScroll: {
    width: '100%',
    maxHeight: 250,
  },
  chatBubble: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginVertical: 4,
    maxWidth: '85%',
  },
  chatBubbleUser: {
    alignSelf: 'flex-end',
  },
  chatBubbleDriver: {
    alignSelf: 'flex-start',
  },
  chatBubbleText: {
    fontSize: 12,
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.sm,
    width: '100%',
    marginTop: Spacing.md,
  },
  chatTextInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 12,
  },
  sendBtn: {
    padding: 8,
    borderRadius: BorderRadius.md,
  },
});
