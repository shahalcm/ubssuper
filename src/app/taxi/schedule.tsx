// src/app/taxi/schedule.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { useTaxiStore } from '@/store/taxiStore';
import { MOCK_RIDE_OPTIONS } from '@/services/mock/data';
import { TextField } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Navigation,
  ShieldCheck,
  CheckCircle2,
  Plane,
  Car,
  Sparkles,
  Info,
} from 'lucide-react-native';

const DATE_OPTIONS = [
  { label: 'Today', sub: 'Oct 28', value: 'Today, Oct 28' },
  { label: 'Tomorrow', sub: 'Oct 29', value: 'Tomorrow, Oct 29' },
  { label: 'Thursday', sub: 'Oct 30', value: 'Thursday, Oct 30' },
  { label: 'Friday', sub: 'Oct 31', value: 'Friday, Oct 31' },
];

const POPULAR_TIME_SLOTS = [
  { time: '05:30 AM', label: 'Early Flight', icon: Plane },
  { time: '07:00 AM', label: 'Morning Commute', icon: Car },
  { time: '11:30 AM', label: 'Mid-Day', icon: Clock },
  { time: '04:00 PM', label: 'Evening', icon: Clock },
  { time: '08:30 PM', label: 'Night Return', icon: Clock },
  { time: '11:00 PM', label: 'Late Flight', icon: Plane },
];

export default function TaxiScheduleScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const {
    pickupLocation,
    destinationLocation,
    setPickup,
    setDestination,
    scheduleRide,
    scheduledRides,
    cancelScheduledRide,
  } = useTaxiStore();

  const [selectedDate, setSelectedDate] = useState(DATE_OPTIONS[1].value);
  const [selectedTime, setSelectedTime] = useState('06:30 AM');
  const [selectedVehicle, setSelectedVehicle] = useState(MOCK_RIDE_OPTIONS[3]); // Sedan
  const [tripNotes, setTripNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'new' | 'view'>('new');

  const handleConfirmSchedule = () => {
    scheduleRide({
      pickup: pickupLocation,
      destination: destinationLocation,
      date: selectedDate,
      time: selectedTime,
      rideOption: selectedVehicle,
      estimatedFare: selectedVehicle.estimatedFare,
      notes: tripNotes,
    });

    Alert.alert(
      'Ride Scheduled Successfully!',
      `Your ${selectedVehicle.name} has been reserved for ${selectedDate} at ${selectedTime}.\n\nYour driver details will be sent 20 minutes before pickup.`,
      [
        {
          text: 'View Scheduled Rides',
          onPress: () => setActiveTab('view'),
        },
        {
          text: 'Done',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Schedule a Ride
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs: Plan New / My Scheduled */}
      <View style={[styles.tabsRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'new' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setActiveTab('new')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'new' ? '#FFFFFF' : theme.textSecondary },
            ]}
          >
            Plan Advance Ride
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabItem,
            activeTab === 'view' && { backgroundColor: theme.primary },
          ]}
          onPress={() => setActiveTab('view')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'view' ? '#FFFFFF' : theme.textSecondary },
            ]}
          >
            My Bookings ({scheduledRides.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'new' ? (
          <>
            {/* Promo Assurance Banner */}
            <View style={[styles.promiseBanner, Shadows.small]}>
              <View style={styles.sparkleIcon}>
                <Sparkles size={18} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.promiseTitle}>Guaranteed Price & On-Time Arrival</Text>
                <Text style={styles.promiseDesc}>
                  Locked-in fare with zero surge pricing. Driver assigned 20 mins prior.
                </Text>
              </View>
            </View>

            {/* Pick & Drop Addresses */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.card, borderColor: theme.border },
                Shadows.small,
              ]}
            >
              <Text style={[styles.cardSectionTitle, { color: theme.textPrimary }]}>
                Trip Details
              </Text>
              <TextField
                label="Pickup Address"
                value={pickupLocation}
                onChangeText={setPickup}
                placeholder="Pickup address"
                leftIcon={<Navigation size={18} color={theme.primary} />}
              />
              <TextField
                label="Destination"
                value={destinationLocation}
                onChangeText={setDestination}
                placeholder="Where are you heading?"
                leftIcon={<MapPin size={18} color={theme.amber} />}
              />
            </View>

            {/* Select Date */}
            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Select Date</Text>
            <View style={styles.datesRow}>
              {DATE_OPTIONS.map((item) => {
                const isSelected = selectedDate === item.value;
                return (
                  <TouchableOpacity
                    key={item.value}
                    style={[
                      styles.dateCard,
                      {
                        backgroundColor: isSelected
                          ? theme.primary + '18'
                          : theme.card,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                      Shadows.small,
                    ]}
                    onPress={() => setSelectedDate(item.value)}
                  >
                    <Calendar
                      size={16}
                      color={isSelected ? theme.primary : theme.textSecondary}
                    />
                    <Text
                      style={[
                        styles.dateLabel,
                        { color: isSelected ? theme.primary : theme.textPrimary },
                      ]}
                    >
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.dateSub,
                        { color: isSelected ? theme.primary : theme.textSecondary },
                      ]}
                    >
                      {item.sub}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Select Time Slot */}
            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Pickup Time</Text>
            <View style={styles.timesGrid}>
              {POPULAR_TIME_SLOTS.map((slot) => {
                const isSelected = selectedTime === slot.time;
                const SlotIcon = slot.icon;
                return (
                  <TouchableOpacity
                    key={slot.time}
                    style={[
                      styles.timeChip,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.card,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                      Shadows.small,
                    ]}
                    onPress={() => setSelectedTime(slot.time)}
                  >
                    <SlotIcon
                      size={14}
                      color={isSelected ? '#FFFFFF' : theme.textSecondary}
                      style={{ marginRight: 6 }}
                    />
                    <View>
                      <Text
                        style={[
                          styles.timeText,
                          { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                        ]}
                      >
                        {slot.time}
                      </Text>
                      <Text
                        style={[
                          styles.timeSubText,
                          { color: isSelected ? '#FFFFFFCC' : theme.textMuted },
                        ]}
                      >
                        {slot.label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Select Vehicle */}
            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Choose Vehicle Tier</Text>
            <View style={styles.vehiclesList}>
              {MOCK_RIDE_OPTIONS.slice(1, 5).map((veh) => {
                const isSelected = selectedVehicle.id === veh.id;
                return (
                  <TouchableOpacity
                    key={veh.id}
                    style={[
                      styles.vehicleRow,
                      {
                        backgroundColor: isSelected
                          ? theme.primary + '14'
                          : theme.card,
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                      Shadows.small,
                    ]}
                    onPress={() => setSelectedVehicle(veh)}
                  >
                    <View style={styles.vehMain}>
                      <Text style={[styles.vehName, { color: theme.textPrimary }]}>
                        {veh.name}
                      </Text>
                      <Text style={[styles.vehMeta, { color: theme.textSecondary }]}>
                        {veh.capacity} seats • {veh.luggage || '2 bags'}
                      </Text>
                    </View>
                    <View style={styles.vehFareCol}>
                      <Text
                        style={[
                          styles.vehFare,
                          { color: isSelected ? theme.primary : theme.textPrimary },
                        ]}
                      >
                        {formatCurrency(veh.estimatedFare)}
                      </Text>
                      {isSelected && (
                        <CheckCircle2 size={16} color={theme.primary} style={{ marginTop: 2 }} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Special Instructions / Flight Note */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.card, borderColor: theme.border, marginTop: Spacing.md },
                Shadows.small,
              ]}
            >
              <TextField
                label="Flight / Train / Special Instructions (Optional)"
                value={tripNotes}
                onChangeText={setTripNotes}
                placeholder="e.g. Flight 6E-204 landing at CCJ, need AC"
              />
            </View>

            {/* Guarantee Pill */}
            <View
              style={[
                styles.safetyNotice,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <ShieldCheck size={18} color="#16A34A" style={{ marginRight: Spacing.sm }} />
              <Text style={[styles.safetyNoticeText, { color: theme.textSecondary }]}>
                Free cancellation up to 30 minutes before scheduled pickup time.
              </Text>
            </View>

            {/* Confirm CTA */}
            <Button
              title={`Confirm Schedule • ${formatCurrency(selectedVehicle.estimatedFare)}`}
              size="lg"
              onPress={handleConfirmSchedule}
              style={{ marginTop: Spacing.lg, marginBottom: Spacing.xxl }}
            />
          </>
        ) : (
          /* View Scheduled Rides Tab */
          <View>
            {scheduledRides.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Calendar size={48} color={theme.textMuted} />
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                  No Upcoming Scheduled Rides
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                  Plan rides ahead of time for stress-free airport and daily journeys.
                </Text>
                <Button
                  title="Schedule a Ride"
                  size="md"
                  onPress={() => setActiveTab('new')}
                  style={{ marginTop: Spacing.md }}
                />
              </View>
            ) : (
              scheduledRides.map((ride) => (
                <View
                  key={ride.id}
                  style={[
                    styles.scheduledCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    Shadows.small,
                  ]}
                >
                  <View style={styles.schTopRow}>
                    <View style={styles.schBadge}>
                      <Text style={styles.schBadgeText}>CONFIRMED</Text>
                    </View>
                    <Text style={[styles.schFare, { color: theme.primary }]}>
                      {formatCurrency(ride.estimatedFare)}
                    </Text>
                  </View>

                  <View style={styles.schTimeRow}>
                    <Calendar size={14} color={theme.primary} style={{ marginRight: 6 }} />
                    <Text style={[styles.schDateText, { color: theme.textPrimary }]}>
                      {ride.date} • {ride.time}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.schRouteBox,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                  >
                    <View style={styles.schPinRow}>
                      <Navigation size={12} color={theme.primary} style={{ marginRight: 6 }} />
                      <Text style={[styles.schLocText, { color: theme.textPrimary }]} numberOfLines={1}>
                        {ride.pickup}
                      </Text>
                    </View>
                    <View style={styles.schPinRow}>
                      <MapPin size={12} color={theme.amber} style={{ marginRight: 6 }} />
                      <Text style={[styles.schLocText, { color: theme.textPrimary }]} numberOfLines={1}>
                        {ride.destination}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.schBottomRow}>
                    <Text style={[styles.schVehicle, { color: theme.textSecondary }]}>
                      Vehicle: {ride.rideOption.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert('Cancel Scheduled Ride?', 'Are you sure you want to cancel this booking?', [
                          { text: 'Keep Ride', style: 'cancel' },
                          {
                            text: 'Cancel Ride',
                            style: 'destructive',
                            onPress: () => cancelScheduledRide(ride.id),
                          },
                        ]);
                      }}
                    >
                      <Text style={styles.schCancelText}>Cancel Ride</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
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
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  tabsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    padding: 4,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  tabItem: {
    flex: 1,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  tabText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  promiseBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  sparkleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FDE68A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  promiseTitle: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
    color: '#92400E',
  },
  promiseDesc: {
    fontSize: 10,
    color: '#B45309',
    marginTop: 2,
  },
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  cardSectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  sectionHeading: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateCard: {
    width: '23%',
    paddingVertical: Spacing.sm,
    paddingHorizontal: 4,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
    marginTop: 4,
  },
  dateSub: {
    fontSize: 9,
    marginTop: 2,
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeChip: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.xs + 2,
  },
  timeText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
  },
  timeSubText: {
    fontSize: 9,
    marginTop: 1,
  },
  vehiclesList: {
    marginTop: 4,
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.xs + 2,
  },
  vehMain: {
    flex: 1,
  },
  vehName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  vehMeta: {
    fontSize: 10,
    marginTop: 2,
  },
  vehFareCol: {
    alignItems: 'flex-end',
  },
  vehFare: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  safetyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  safetyNoticeText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xl,
  },
  scheduledCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  schTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  schBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  schBadgeText: {
    color: '#15803D',
    fontSize: 9,
    fontWeight: '800',
  },
  schFare: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  schTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  schDateText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  schRouteBox: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  schPinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  schLocText: {
    fontSize: 11,
    flex: 1,
  },
  schBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  schVehicle: {
    fontSize: 11,
  },
  schCancelText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: Typography.weights.bold,
  },
});
