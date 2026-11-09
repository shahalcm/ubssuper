// src/app/orders/index.tsx
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { useCartStore } from '@/store/cartStore';
import { OrderCard } from '@/components/cards/OrderCard';
import { MOCK_RECENT_ORDERS } from '@/services/mock/data';
import { Order, CategoryType } from '@/types';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import {
  ArrowLeft,
  Search,
  X,
  HelpCircle,
  Zap,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShoppingBag,
  Utensils,
  Car,
  Building,
  Truck,
  Sparkles,
  Calendar,
  AlertCircle,
  ChevronRight,
  TrendingUp,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type StatusFilter = 'all' | 'active' | 'completed' | 'cancelled';

interface CategoryTab {
  label: string;
  value: string;
  icon: (color: string) => React.ReactNode;
}

const CATEGORY_TABS: CategoryTab[] = [
  {
    label: 'All Services',
    value: 'all',
    icon: (color) => <Sparkles size={14} color={color} />,
  },
  {
    label: 'Food',
    value: 'food',
    icon: (color) => <Utensils size={14} color={color} />,
  },
  {
    label: 'Grocery',
    value: 'grocery',
    icon: (color) => <ShoppingBag size={14} color={color} />,
  },
  {
    label: 'Rides',
    value: 'taxi',
    icon: (color) => <Car size={14} color={color} />,
  },
  {
    label: 'Hotels',
    value: 'hotels',
    icon: (color) => <Building size={14} color={color} />,
  },
  {
    label: 'Logistics',
    value: 'logistics',
    icon: (color) => <Truck size={14} color={color} />,
  },
];

export default function UnifiedOrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // 🌟 Filter States
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // 🌟 In-App Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [liveOrders, setLiveOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res: any = await apiClient.get(ENDPOINTS.ORDERS.MY_ORDERS);
      const data = res?.data || res;
      if (Array.isArray(data) && data.length > 0) {
        const mapped: Order[] = data.map((bo: any) => ({
          id: bo.orderId || bo.id,
          category: bo.type || 'grocery',
          status: bo.fulfillmentStatus === 'placed' ? 'confirmed' : bo.fulfillmentStatus || 'confirmed',
          totalAmount: bo.totalAmount || 0,
          currency: bo.currency || 'INR',
          date: bo.createdAt
            ? new Date(bo.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : 'Today',
          createdAt: bo.createdAt
            ? new Date(bo.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : 'Today',
          itemsSummary:
            bo.items?.map((it: any) => `${it.quantity}x ${it.name}`).join(', ') || 'Basket items',
          itemCount: bo.items?.reduce((s: number, it: any) => s + (it.quantity || 1), 0) || 1,
          deliveryAddress: bo.destinationAddress || bo.deliveryAddress || 'Bengaluru, India',
          paymentMethod: bo.paymentMethod === 'cash' ? 'Cash on Delivery' : 'Razorpay Online',
          paymentStatus: bo.paymentStatus || 'pending',
          bookingDetails: {
            storeName: bo.partnerName || 'UBS Super Fresh Supermarket Hub',
            storeAddress: bo.pickupAddress || 'UBS Super Fulfillment Center',
            otp: bo.deliveryOtp,
          },
        }));
        setLiveOrders(mapped);
      }
    } catch {
      // Offline fallback
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const allOrders = useMemo(() => {
    if (liveOrders.length > 0) {
      return liveOrders;
    }
    return MOCK_RECENT_ORDERS;
  }, [liveOrders]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  // 🌟 Counts Calculation
  const activeOrdersCount = useMemo(() => {
    return allOrders.filter(
      (o) =>
        o.status === 'out_for_delivery' ||
        o.status === 'processing' ||
        o.status === 'confirmed'
    ).length;
  }, [allOrders]);

  const completedOrdersCount = useMemo(() => {
    return allOrders.filter((o) => o.status === 'completed').length;
  }, [allOrders]);

  const cancelledOrdersCount = useMemo(() => {
    return allOrders.filter((o) => o.status === 'cancelled').length;
  }, [allOrders]);

  // 🌟 Filtered Orders
  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      // 1. Status Filter
      if (statusFilter === 'active') {
        const isActive =
          order.status === 'out_for_delivery' ||
          order.status === 'processing' ||
          order.status === 'confirmed';
        if (!isActive) return false;
      } else if (statusFilter === 'completed') {
        if (order.status !== 'completed') return false;
      } else if (statusFilter === 'cancelled') {
        if (order.status !== 'cancelled') return false;
      }

      // 2. Category Filter
      if (categoryFilter !== 'all' && order.category !== categoryFilter) {
        return false;
      }

      // 3. Search Query Filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const matchesId = order.id.toLowerCase().includes(query);
        const matchesItems = order.itemsSummary.toLowerCase().includes(query);
        const matchesAddress = order.deliveryAddress.toLowerCase().includes(query);
        const matchesRestaurant =
          order.bookingDetails?.restaurantName?.toLowerCase().includes(query);
        const matchesStore =
          order.bookingDetails?.storeName?.toLowerCase().includes(query);
        const matchesDriver =
          order.bookingDetails?.driverName?.toLowerCase().includes(query);
        const matchesHotel =
          order.bookingDetails?.hotelName?.toLowerCase().includes(query);

        if (
          !matchesId &&
          !matchesItems &&
          !matchesAddress &&
          !matchesRestaurant &&
          !matchesStore &&
          !matchesDriver &&
          !matchesHotel
        ) {
          return false;
        }
      }

      return true;
    });
  }, [statusFilter, categoryFilter, searchQuery]);

  // 🌟 Handlers
  const handleReorder = (order: Order) => {
    showToast(`✓ Items from #${order.id} re-added to basket!`);
  };

  const handleRate = (order: Order) => {
    Alert.alert(
      'Rate Your Experience',
      `How was your ${order.category.toUpperCase()} order #${order.id}?`,
      [
        { text: '⭐⭐⭐⭐ 4 Stars', onPress: () => showToast('⭐ Rated 4 Stars!') },
        { text: '⭐⭐⭐⭐⭐ 5 Stars', onPress: () => showToast('🌟 Thank you for 5 Stars!') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* 🌟 ELEVATED HEADER */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.headerBtn,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
          activeOpacity={0.8}
        >
          <ArrowLeft size={19} color={theme.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            My Orders & Bookings
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {allOrders.length} SuperApp Bookings Recorded
          </Text>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={[
              styles.headerBtn,
              {
                backgroundColor: isSearchVisible
                  ? (isDarkMode ? '#14532D30' : '#DCFCE7')
                  : theme.surface,
                borderColor: isSearchVisible ? '#16A34A' : theme.border,
                marginRight: 8,
              },
            ]}
            activeOpacity={0.8}
            onPress={() => {
              setIsSearchVisible(!isSearchVisible);
              if (isSearchVisible) setSearchQuery('');
            }}
          >
            <Search
              size={17}
              color={isSearchVisible ? '#16A34A' : theme.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.headerBtn,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
            activeOpacity={0.8}
            onPress={() => router.push('/support')}
          >
            <HelpCircle size={17} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 🌟 EXPANDABLE SEARCH BAR */}
      {isSearchVisible && (
        <View
          style={[
            styles.searchBarWrapper,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Search size={16} color={theme.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by food, store, ride, or order ID..."
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.textPrimary }]}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <X size={15} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 🌟 IN-APP TOAST FEEDBACK */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <View style={styles.toastPill}>
            <CheckCircle2 size={15} color="#10B981" style={{ marginRight: 6 }} />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}

      {/* 🌟 PRIMARY STATUS SEGMENTED BAR */}
      <View style={[styles.statusSegmentRow, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          style={[
            styles.segmentBtn,
            statusFilter === 'all' && [
              styles.segmentBtnActive,
              { backgroundColor: theme.primary },
            ],
          ]}
          onPress={() => setStatusFilter('all')}
        >
          <Text
            style={[
              styles.segmentBtnText,
              { color: statusFilter === 'all' ? '#FFFFFF' : theme.textSecondary },
            ]}
          >
            All ({MOCK_RECENT_ORDERS.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentBtn,
            statusFilter === 'active' && [
              styles.segmentBtnActive,
              { backgroundColor: '#16A34A' },
            ],
          ]}
          onPress={() => setStatusFilter('active')}
        >
          <View style={styles.activeDotLabelRow}>
            {activeOrdersCount > 0 && <View style={styles.activePulseDot} />}
            <Text
              style={[
                styles.segmentBtnText,
                { color: statusFilter === 'active' ? '#FFFFFF' : theme.textSecondary },
              ]}
            >
              Active ({activeOrdersCount})
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentBtn,
            statusFilter === 'completed' && [
              styles.segmentBtnActive,
              { backgroundColor: theme.primary },
            ],
          ]}
          onPress={() => setStatusFilter('completed')}
        >
          <Text
            style={[
              styles.segmentBtnText,
              { color: statusFilter === 'completed' ? '#FFFFFF' : theme.textSecondary },
            ]}
          >
            Completed ({completedOrdersCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.segmentBtn,
            statusFilter === 'cancelled' && [
              styles.segmentBtnActive,
              { backgroundColor: '#EF4444' },
            ],
          ]}
          onPress={() => setStatusFilter('cancelled')}
        >
          <Text
            style={[
              styles.segmentBtnText,
              { color: statusFilter === 'cancelled' ? '#FFFFFF' : theme.textSecondary },
            ]}
          >
            Cancelled ({cancelledOrdersCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🌟 SERVICE CATEGORY FILTER CHIPS */}
      <View style={{ maxHeight: 44 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabsScroll}
        >
          {CATEGORY_TABS.map((tab) => {
            const isSelected = categoryFilter === tab.value;
            const count =
              tab.value === 'all'
                ? allOrders.length
                : allOrders.filter((o) => o.category === tab.value).length;

            return (
              <TouchableOpacity
                key={tab.value}
                activeOpacity={0.8}
                onPress={() => setCategoryFilter(tab.value)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: isSelected
                      ? (isDarkMode ? '#14532D30' : '#DCFCE7')
                      : theme.surface,
                    borderColor: isSelected ? '#16A34A' : theme.border,
                    borderWidth: isSelected ? 1.5 : 1,
                  },
                ]}
              >
                {tab.icon(isSelected ? '#16A34A' : theme.textSecondary)}
                <Text
                  style={[
                    styles.categoryChipText,
                    {
                      color: isSelected ? '#15803D' : theme.textPrimary,
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
                <View
                  style={[
                    styles.categoryCountBadge,
                    {
                      backgroundColor: isSelected
                        ? '#16A34A'
                        : (isDarkMode ? '#334155' : '#E2E8F0'),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryCountText,
                      { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 🌟 SCROLLABLE ORDERS FEED */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await fetchOrders();
              setRefreshing(false);
            }}
            colors={['#16A34A']}
            tintColor={theme.primary}
          />
        }
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(Spacing.xxl * 2, insets.bottom + 60) },
        ]}
      >
        {/* 🌟 LIVE ACTIVE ORDERS CALLOUT (When on 'all' or 'active' and active orders exist) */}
        {activeOrdersCount > 0 && statusFilter !== 'completed' && statusFilter !== 'cancelled' && (
          <TouchableOpacity
            style={[
              styles.liveCalloutCard,
              {
                backgroundColor: isDarkMode ? '#14532D20' : '#F0FDF4',
                borderColor: isDarkMode ? '#166534' : '#86EFAC',
              },
            ]}
            activeOpacity={0.88}
            onPress={() => setStatusFilter('active')}
          >
            <View style={styles.liveCalloutLeft}>
              <View style={styles.livePulseCircle}>
                <Zap size={16} color="#16A34A" fill="#16A34A" />
              </View>
              <View style={{ marginLeft: 10, flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.liveCalloutTitle, { color: theme.textPrimary }]}>
                    {activeOrdersCount} Active Bookings in Transit
                  </Text>
                </View>
                <Text style={[styles.liveCalloutSub, { color: theme.textSecondary }]}>
                  Food Order arriving in 8m • Grocery Order packing
                </Text>
              </View>
            </View>
            <View style={styles.liveCalloutArrow}>
              <ChevronRight size={16} color="#16A34A" />
            </View>
          </TouchableOpacity>
        )}

        {/* 🌟 ORDERS LIST */}
        {filteredOrders.length > 0 ? (
          <View>
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onPress={() => router.push(`/orders/${order.id}`)}
                onTrack={() => router.push(`/orders/${order.id}`)}
                onReorder={handleReorder}
                onRate={handleRate}
                onHelp={() => router.push('/support')}
              />
            ))}
          </View>
        ) : (
          /* 🌟 EMPTY STATE */
          <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.emptyIconCircle, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}>
              <AlertCircle size={32} color={theme.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No Orders or Bookings Found
            </Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              {searchQuery.length > 0
                ? `No orders matching "${searchQuery}". Try clearing your search term.`
                : 'You do not have any orders under this filter selection.'}
            </Text>

            <TouchableOpacity
              style={[styles.emptyBtn, { backgroundColor: '#16A34A' }]}
              activeOpacity={0.8}
              onPress={() => {
                setStatusFilter('all');
                setCategoryFilter('all');
                setSearchQuery('');
                setIsSearchVisible(false);
              }}
            >
              <RotateCcw size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.emptyBtnText}>Reset All Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 🌟 BOTTOM SUMMARY STATS RIBBON */}
        <View
          style={[
            styles.statsRibbon,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.statCol}>
            <Text style={[styles.statNum, { color: '#16A34A' }]}>{activeOrdersCount}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active Now</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statCol}>
            <Text style={[styles.statNum, { color: theme.textPrimary }]}>
              {completedOrdersCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <View style={styles.statCol}>
            <Text style={[styles.statNum, { color: '#2563EB' }]}>₹380</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Saved</Text>
          </View>
        </View>
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
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.sizes.md + 2,
    fontWeight: Typography.weights.bold,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
    paddingHorizontal: 12,
    height: 42,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    ...Shadows.small,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
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
  statusSegmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
    marginHorizontal: 3,
  },
  segmentBtnActive: {
    ...Shadows.small,
  },
  segmentBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  activeDotLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  categoryTabsScroll: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginRight: 8,
    ...Shadows.small,
  },
  categoryChipText: {
    fontSize: 11,
    marginHorizontal: 5,
  },
  categoryCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  categoryCountText: {
    fontSize: 9,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  liveCalloutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  liveCalloutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  livePulseCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveCalloutTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  liveCalloutSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  liveCalloutArrow: {
    paddingLeft: 6,
  },
  emptyBox: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: Typography.sizes.xs + 1,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
  },
  emptyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  statsRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statNum: {
    fontSize: 16,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
});
