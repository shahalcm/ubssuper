// src/app/taxi/history.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { useTaxiStore, PastRideItem } from '@/store/taxiStore';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Car,
  MapPin,
  CheckCircle,
  XCircle,
  Search,
  RotateCcw,
  Receipt,
  HelpCircle,
  Star,
  Download,
  Share2,
  Calendar,
  Navigation,
  ShieldCheck,
  Zap,
} from 'lucide-react-native';

const FILTER_TABS = ['All', 'Completed', 'Cancelled'] as const;

export default function TaxiHistoryScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const { pastRides, setPickup, setDestination } = useTaxiStore();

  const [activeFilter, setActiveFilter] = useState<'All' | 'Completed' | 'Cancelled'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceiptRide, setSelectedReceiptRide] = useState<PastRideItem | null>(null);

  // Filter rides based on tab and query
  const filteredRides = pastRides.filter((ride) => {
    if (activeFilter !== 'All' && ride.status !== activeFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ride.pickup.toLowerCase().includes(q) ||
        ride.destination.toLowerCase().includes(q) ||
        ride.driver.toLowerCase().includes(q) ||
        ride.id.toLowerCase().includes(q) ||
        ride.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleRebook = (ride: PastRideItem) => {
    setPickup(ride.pickup);
    setDestination(ride.destination);
    Alert.alert(
      'Route Selected',
      `Pickup and destination set from ${ride.id}.`,
      [
        {
          text: 'Book Ride Now',
          onPress: () => router.push('/taxi'),
        },
      ]
    );
  };

  const handleDownloadReceipt = () => {
    Alert.alert(
      'Receipt Downloaded',
      `Tax invoice for ${selectedReceiptRide?.id} has been saved to your downloads folder.`,
      [{ text: 'OK' }]
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
          Ride History & Receipts
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Stats Ribbon */}
        <View
          style={[
            styles.statsRibbon,
            { backgroundColor: theme.card, borderColor: theme.border },
            Shadows.small,
          ]}
        >
          <View style={styles.statCol}>
            <Text style={[styles.statValue, { color: theme.primary }]}>
              {pastRides.length}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Trips</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />

          <View style={styles.statCol}>
            <Text style={[styles.statValue, { color: '#2563EB' }]}>52.6 km</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Distance</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />

          <View style={styles.statCol}>
            <Text style={[styles.statValue, { color: '#16A34A' }]}>₹185</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Saved</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Search size={16} color={theme.textMuted} style={{ marginRight: Spacing.sm }} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search trips by destination, driver, or ID..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={{ color: theme.textMuted, fontSize: 12 }}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabsRow}>
          {FILTER_TABS.map((tab) => {
            const isSelected = activeFilter === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.card,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setActiveFilter(tab)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                  ]}
                >
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Ride History Cards List */}
        {filteredRides.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Car size={48} color={theme.textMuted} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No Trips Found
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              {searchQuery
                ? 'Try adjusting your search query.'
                : 'Your completed or cancelled rides will appear here.'}
            </Text>
          </View>
        ) : (
          filteredRides.map((ride) => {
            const isCompleted = ride.status === 'Completed';
            return (
              <View
                key={ride.id}
                style={[
                  styles.card,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  Shadows.small,
                ]}
              >
                {/* Header Row */}
                <View style={styles.topRow}>
                  <View style={styles.typeBadge}>
                    <Car size={14} color={theme.primary} style={{ marginRight: 4 }} />
                    <Text style={[styles.typeText, { color: theme.textPrimary }]}>
                      {ride.type}
                    </Text>
                  </View>

                  <View style={styles.fareContainer}>
                    {ride.fare > 0 ? (
                      <Text style={[styles.fare, { color: theme.textPrimary }]}>
                        {formatCurrency(ride.fare)}
                      </Text>
                    ) : (
                      <Text style={[styles.fare, { color: theme.textMuted }]}>₹0</Text>
                    )}
                    {ride.originalFare && ride.originalFare > ride.fare && (
                      <Text style={[styles.origFare, { color: theme.textMuted }]}>
                        {formatCurrency(ride.originalFare)}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Date & Trip ID */}
                <View style={styles.metaRow}>
                  <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                    {ride.date} • {ride.id}
                  </Text>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor: isCompleted ? '#DCFCE7' : '#FEE2E2',
                      },
                    ]}
                  >
                    {isCompleted ? (
                      <CheckCircle size={10} color="#15803D" style={{ marginRight: 3 }} />
                    ) : (
                      <XCircle size={10} color="#DC2626" style={{ marginRight: 3 }} />
                    )}
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: isCompleted ? '#15803D' : '#DC2626' },
                      ]}
                    >
                      {ride.status}
                    </Text>
                  </View>
                </View>

                {/* Route Visualizer */}
                <View
                  style={[
                    styles.locBox,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                >
                  <View style={styles.locRow}>
                    <Navigation size={12} color="#16A34A" style={{ marginRight: 6 }} />
                    <Text
                      style={[styles.locText, { color: theme.textPrimary }]}
                      numberOfLines={1}
                    >
                      {ride.pickup}
                    </Text>
                  </View>

                  <View style={styles.routeDistanceConnector}>
                    <View style={styles.dottedLine} />
                    <Text style={[styles.distanceBadge, { color: theme.textSecondary }]}>
                      {ride.distance} • {ride.duration}
                    </Text>
                  </View>

                  <View style={styles.locRow}>
                    <MapPin size={12} color="#DC2626" style={{ marginRight: 6 }} />
                    <Text
                      style={[styles.locText, { color: theme.textPrimary }]}
                      numberOfLines={1}
                    >
                      {ride.destination}
                    </Text>
                  </View>
                </View>

                {/* Driver & Rating Row */}
                <View style={styles.driverInfoRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.driverNameText, { color: theme.textPrimary }]}>
                      {ride.driver} ({ride.vehicleNumber})
                    </Text>
                    <Text style={[styles.paymentMethodText, { color: theme.textSecondary }]}>
                      Paid via {ride.paymentMethod}
                    </Text>
                  </View>

                  {ride.rating && (
                    <View style={styles.ratingBadge}>
                      <Star size={12} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.ratingText}>{ride.rating}.0</Text>
                    </View>
                  )}
                </View>

                {/* Action Buttons Row */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                    onPress={() => handleRebook(ride)}
                  >
                    <RotateCcw size={13} color={theme.primary} style={{ marginRight: 4 }} />
                    <Text style={[styles.actionBtnText, { color: theme.primary }]}>
                      Rebook Route
                    </Text>
                  </TouchableOpacity>

                  {isCompleted && (
                    <TouchableOpacity
                      style={[
                        styles.actionBtn,
                        { backgroundColor: theme.surface, borderColor: theme.border },
                      ]}
                      onPress={() => setSelectedReceiptRide(ride)}
                    >
                      <Receipt size={13} color={theme.textPrimary} style={{ marginRight: 4 }} />
                      <Text style={[styles.actionBtnText, { color: theme.textPrimary }]}>
                        Receipt
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                    ]}
                    onPress={() => {
                      Alert.alert(
                        'Trip Support',
                        `Need assistance with ${ride.id}? Contact our 24/7 Malabar helpline at 1800-425-8274.`
                      );
                    }}
                  >
                    <HelpCircle size={13} color={theme.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={[styles.actionBtnText, { color: theme.textSecondary }]}>
                      Help
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Digital Receipt Modal */}
      <Modal visible={!!selectedReceiptRide} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            {selectedReceiptRide && (
              <>
                <View style={styles.receiptHeader}>
                  <ShieldCheck size={28} color="#16A34A" />
                  <Text style={[styles.receiptTitle, { color: theme.textPrimary }]}>
                    Tax Invoice & Trip Receipt
                  </Text>
                  <Text style={[styles.receiptSub, { color: theme.textSecondary }]}>
                    UBS Super Mobility Pvt Ltd • Malappuram, Kerala
                  </Text>
                </View>

                <View
                  style={[
                    styles.receiptDetailsBox,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                >
                  <View style={styles.receiptLine}>
                    <Text style={[styles.receiptLineLabel, { color: theme.textSecondary }]}>
                      Trip ID
                    </Text>
                    <Text style={[styles.receiptLineVal, { color: theme.textPrimary }]}>
                      {selectedReceiptRide.id}
                    </Text>
                  </View>

                  <View style={styles.receiptLine}>
                    <Text style={[styles.receiptLineLabel, { color: theme.textSecondary }]}>
                      Vehicle & Driver
                    </Text>
                    <Text style={[styles.receiptLineVal, { color: theme.textPrimary }]}>
                      {selectedReceiptRide.driver} • {selectedReceiptRide.vehicleNumber}
                    </Text>
                  </View>

                  <View style={styles.receiptLine}>
                    <Text style={[styles.receiptLineLabel, { color: theme.textSecondary }]}>
                      Date & Time
                    </Text>
                    <Text style={[styles.receiptLineVal, { color: theme.textPrimary }]}>
                      {selectedReceiptRide.date}
                    </Text>
                  </View>

                  <View style={[styles.receiptDivider, { backgroundColor: theme.border }]} />

                  <View style={styles.receiptLine}>
                    <Text style={[styles.receiptLineLabel, { color: theme.textSecondary }]}>
                      Base Fare (First 2 km)
                    </Text>
                    <Text style={[styles.receiptLineVal, { color: theme.textPrimary }]}>
                      ₹40.00
                    </Text>
                  </View>

                  <View style={styles.receiptLine}>
                    <Text style={[styles.receiptLineLabel, { color: theme.textSecondary }]}>
                      Distance Fare ({selectedReceiptRide.distance})
                    </Text>
                    <Text style={[styles.receiptLineVal, { color: theme.textPrimary }]}>
                      {formatCurrency(Math.max(20, selectedReceiptRide.fare - 45))}
                    </Text>
                  </View>

                  <View style={styles.receiptLine}>
                    <Text style={[styles.receiptLineLabel, { color: theme.textSecondary }]}>
                      Safety & Insurance Fee
                    </Text>
                    <Text style={[styles.receiptLineVal, { color: theme.textPrimary }]}>
                      ₹5.00
                    </Text>
                  </View>

                  <View style={styles.receiptLine}>
                    <Text style={[styles.receiptLineLabel, { color: theme.textSecondary }]}>
                      Kerala GST (5%)
                    </Text>
                    <Text style={[styles.receiptLineVal, { color: theme.textPrimary }]}>
                      ₹{Math.round(selectedReceiptRide.fare * 0.05)}.00
                    </Text>
                  </View>

                  <View style={[styles.receiptDivider, { backgroundColor: theme.border }]} />

                  <View style={styles.receiptLine}>
                    <Text style={[styles.receiptTotalLabel, { color: theme.textPrimary }]}>
                      Total Amount Paid
                    </Text>
                    <Text style={[styles.receiptTotalVal, { color: theme.primary }]}>
                      {formatCurrency(selectedReceiptRide.fare)}
                    </Text>
                  </View>

                  <Text style={[styles.receiptPaidVia, { color: theme.textSecondary }]}>
                    Paid via {selectedReceiptRide.paymentMethod} • Ref: TXN-892104
                  </Text>
                </View>

                <View style={styles.receiptButtonsRow}>
                  <Button
                    title="Download PDF"
                    size="md"
                    onPress={handleDownloadReceipt}
                    style={{ flex: 1, marginRight: 8 }}
                  />
                  <Button
                    title="Close"
                    variant="secondary"
                    size="md"
                    onPress={() => setSelectedReceiptRide(null)}
                    style={{ flex: 1 }}
                  />
                </View>
              </>
            )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  statsRibbon: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statCol: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  statLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginVertical: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.xs + 1,
  },
  filterTabsRow: {
    flexDirection: 'row',
    marginVertical: Spacing.sm,
  },
  filterTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.xs,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: Typography.weights.bold,
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
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  fareContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fare: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  origFare: {
    fontSize: 11,
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  dateText: {
    fontSize: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  locBox: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginVertical: Spacing.xs + 2,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locText: {
    fontSize: 11,
    fontWeight: Typography.weights.medium,
    flex: 1,
  },
  routeDistanceConnector: {
    paddingLeft: 6,
    marginVertical: 2,
  },
  dottedLine: {
    width: 2,
    height: 8,
    borderLeftWidth: 1,
    borderColor: '#94A3B8',
    borderStyle: 'dashed',
  },
  distanceBadge: {
    fontSize: 9,
    marginTop: 1,
  },
  driverInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  driverNameText: {
    fontSize: 11,
    fontWeight: Typography.weights.semibold,
  },
  paymentMethodText: {
    fontSize: 10,
    marginTop: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    marginLeft: 3,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F030',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginRight: Spacing.xs + 2,
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: Typography.weights.bold,
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
  receiptHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  receiptTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginTop: 6,
  },
  receiptSub: {
    fontSize: 10,
    marginTop: 2,
  },
  receiptDetailsBox: {
    width: '100%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  receiptLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 3,
  },
  receiptLineLabel: {
    fontSize: 11,
  },
  receiptLineVal: {
    fontSize: 11,
    fontWeight: Typography.weights.semibold,
  },
  receiptDivider: {
    height: 1,
    marginVertical: Spacing.xs + 2,
  },
  receiptTotalLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  receiptTotalVal: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  receiptPaidVia: {
    fontSize: 9,
    marginTop: 6,
    textAlign: 'center',
  },
  receiptButtonsRow: {
    flexDirection: 'row',
    width: '100%',
  },
});
