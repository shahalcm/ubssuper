// src/app/(tabs)/grocery.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { useLocationStore } from '@/store/locationStore';
import { useCartStore } from '@/store/cartStore';
import { StoreCard } from '@/components/cards/StoreCard';
import { StoreConflictModal } from '@/components/modals/StoreConflictModal';
import { StoresMapView } from '@/components/maps/StoresMapView';
import { superAppService } from '@/services/repositories/superAppService';
import { Store } from '@/types';
import {
  MapPin,
  ChevronDown,
  Search,
  X,
  SlidersHorizontal,
  Clock,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  Store as StoreIcon,
  Check,
  ShieldCheck,
  Map as MapIcon,
  List as ListIcon,
} from 'lucide-react-native';

const QUICK_FILTERS = [
  { id: 'all', label: 'All Stores' },
  { id: 'open_now', label: 'Open Now' },
  { id: 'free_delivery', label: 'Free Delivery' },
  { id: 'top_rated', label: 'Top Rated 4.5+' },
  { id: 'express', label: 'Under 25 Mins' },
];

type SortType = 'distance' | 'rating' | 'deliveryTime' | 'minOrder';

export default function GroceryHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const { currentAddress, latitude, longitude } = useLocationStore();
  const cartCount = useCartStore((state) => state.getItemCount());
  const cartSubtotal = useCartStore((state) => state.getSubtotal());
  const cartStoreName = useCartStore((state) => state.storeName);

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortType>('distance');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    loadStores();
  }, [sortBy, activeFilter, latitude, longitude]);

  const loadStores = async () => {
    try {
      setLoading(true);
      const params: any = {
        category: 'grocery',
        sort: sortBy,
        isOpen: activeFilter === 'open_now' ? true : undefined,
        deliveryAvailable: true,
        lat: latitude,
        lng: longitude,
      };

      const res = await superAppService.getStores(params);
      if (res && res.length > 0) {
        setStores(res);
      } else {
        // Fallback default rich stores
        setStores([
          {
            id: 'partner-1',
            name: 'FreshBasket Supermarket Flagship',
            category: 'grocery',
            logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
            coverImage: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
            galleryImages: [
              'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
              'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=800&q=80',
            ],
            rating: 4.8,
            ratingCount: 156,
            deliveryTime: '20-25 mins',
            deliveryFee: 30,
            minOrderAmount: 199,
            cuisines: ['Fresh Farm Produce', 'Organic Dairy', 'Pantry'],
            address: 'Plot 42, 12th Main Road, Indiranagar',
            city: 'Bengaluru',
            isOpen: true,
            distanceKm: 1.2,
            distanceFormatted: '1.2 km',
            storeDescription: 'Premier neighborhood supermarket offering fresh organic produce, gourmet farm dairy, and 20-minute express doorstep delivery.',
          },
          {
            id: 'partner-2',
            name: 'Green Leaf Organic Mart',
            category: 'grocery',
            logo: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=400&q=80',
            coverImage: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1200&q=80',
            galleryImages: [
              'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80',
            ],
            rating: 4.9,
            ratingCount: 94,
            deliveryTime: '15-20 mins',
            deliveryFee: 0,
            minOrderAmount: 249,
            cuisines: ['100% Organic', 'Cold Pressed Oils', 'Hydroponics'],
            address: '88 Koramangala 4th Block',
            city: 'Bengaluru',
            isOpen: true,
            distanceKm: 2.1,
            distanceFormatted: '2.1 km',
            storeDescription: 'Certified organic grains, pesticide-free vegetables, cold-pressed oils, and farm fresh dairy.',
          },
        ]);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStores();
  };

  // Filter stores locally for search query and quick chips
  const filteredStores = useMemo(() => {
    return stores.filter((s) => {
      // Search
      const matchSearch =
        !searchQuery.trim() ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.cuisines && s.cuisines.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (s.storeDescription && s.storeDescription.toLowerCase().includes(searchQuery.toLowerCase()));

      // Quick filter
      if (activeFilter === 'open_now' && !s.isOpen) return false;
      if (activeFilter === 'free_delivery' && s.deliveryFee > 0) return false;
      if (activeFilter === 'top_rated' && s.rating < 4.5) return false;

      return matchSearch;
    });
  }, [stores, searchQuery, activeFilter]);

  const handleSelectStore = (store: Store) => {
    router.push(`/grocery/store/${store.id}` as any);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Top Location Bar with direct Google Maps Picker navigation */}
      <TouchableOpacity
        style={[styles.locationBar, { backgroundColor: theme.card, borderColor: theme.border }]}
        activeOpacity={0.85}
        onPress={() => router.push('/location-picker' as any)}
      >
        <View style={styles.locationLeft}>
          <View style={styles.locationPinCircle}>
            <MapPin size={18} color="#16A34A" />
          </View>
          <View style={styles.locationTextContainer}>
            <View style={styles.locationTitleRow}>
              <Text style={[styles.locationLabel, { color: theme.textSecondary }]}>
                DELIVERING GROCERIES TO
              </Text>
              <ChevronDown size={14} color="#64748B" />
            </View>
            <Text style={[styles.locationAddress, { color: theme.textPrimary }]} numberOfLines={1}>
              {currentAddress || 'Manjeri, Malappuram'}
            </Text>
          </View>
        </View>

        <View style={styles.expressTag}>
          <Clock size={12} color="#166534" style={{ marginRight: 3 }} />
          <Text style={styles.expressTagText}>15-25 Mins</Text>
        </View>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Store Discovery Hero Banner */}
        <LinearGradient
          colors={['#14532D', '#16A34A', '#22C55E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <View style={styles.heroPill}>
            <Sparkles size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.heroPillText}>STORE-FIRST MARKETPLACE</Text>
          </View>
          <Text style={styles.heroTitle}>Shop From Local Supermarkets</Text>
          <Text style={styles.heroSub}>
            Choose a nearby grocery store or organic mart to browse their exclusive stock and pricing.
          </Text>

          <View style={styles.heroTrustRow}>
            <View style={styles.trustItem}>
              <ShieldCheck size={14} color="#DCFCE7" />
              <Text style={styles.trustText}>Verified Partners</Text>
            </View>
            <View style={styles.trustItem}>
              <Sparkles size={14} color="#DCFCE7" />
              <Text style={styles.trustText}>Handpicked Fresh</Text>
            </View>
            <View style={styles.trustItem}>
              <Clock size={14} color="#DCFCE7" />
              <Text style={styles.trustText}>Express Delivery</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Search size={18} color="#94A3B8" style={{ marginRight: 10 }} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search grocery stores, supermarkets, organic marts..."
              placeholderTextColor="#94A3B8"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {QUICK_FILTERS.map((f) => {
            const isSelected = activeFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.filterChip,
                  isSelected
                    ? { backgroundColor: '#16A34A', borderColor: '#16A34A' }
                    : { backgroundColor: theme.card, borderColor: theme.border },
                ]}
                onPress={() => setActiveFilter(f.id)}
                activeOpacity={0.8}
              >
                {isSelected && <Check size={12} color="#FFFFFF" style={{ marginRight: 4 }} />}
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected ? { color: '#FFFFFF', fontWeight: '700' } : { color: theme.textSecondary },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section Heading with Count, View Mode Toggle & Sort */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Nearby Grocery Stores
            </Text>
            <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>
              {filteredStores.length} verified supermarkets near you
            </Text>
          </View>

          {/* View Mode & Sort Controls */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {/* View Mode Toggle: List vs Map */}
            <View style={[styles.viewModeToggle, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <TouchableOpacity
                style={[styles.viewModeBtn, viewMode === 'list' && { backgroundColor: '#16A34A' }]}
                onPress={() => setViewMode('list')}
                activeOpacity={0.8}
              >
                <ListIcon size={14} color={viewMode === 'list' ? '#FFFFFF' : theme.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewModeBtn, viewMode === 'map' && { backgroundColor: '#16A34A' }]}
                onPress={() => setViewMode('map')}
                activeOpacity={0.8}
              >
                <MapIcon size={14} color={viewMode === 'map' ? '#FFFFFF' : theme.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Sort Selector */}
            <View style={styles.sortContainer}>
              <TouchableOpacity
                style={[styles.sortBtn, sortBy === 'distance' && styles.sortBtnActive]}
                onPress={() => setSortBy('distance')}
              >
                <Text style={[styles.sortBtnText, sortBy === 'distance' && styles.sortBtnTextActive]}>
                  Nearest
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortBtn, sortBy === 'rating' && styles.sortBtnActive]}
                onPress={() => setSortBy('rating')}
              >
                <Text style={[styles.sortBtnText, sortBy === 'rating' && styles.sortBtnTextActive]}>
                  Rating
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 🗺️ Interactive Google Map View Mode */}
        {viewMode === 'map' && (
          <View style={{ height: 380, marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, borderRadius: BorderRadius.xl, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
            <StoresMapView
              stores={filteredStores}
              userCoords={{ latitude, longitude }}
              category="grocery"
              onSelectStore={handleSelectStore}
            />
          </View>
        )}

        {/* Nearby Stores List */}
        {loading && !refreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#16A34A" />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Finding nearby grocery supermarkets...
            </Text>
          </View>
        ) : filteredStores.length > 0 ? (
          <View style={styles.storeList}>
            {filteredStores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                onPress={() => handleSelectStore(store)}
                accentColor="#16A34A"
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <StoreIcon size={44} color="#94A3B8" />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No Grocery Stores Found
            </Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              Try adjusting your search terms or filter chips.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Mini Cart Bar */}
      {cartCount > 0 && (
        <View style={[styles.floatingCartContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TouchableOpacity
            style={styles.floatingCartBar}
            activeOpacity={0.9}
            onPress={() => router.push('/cart' as any)}
          >
            <View style={styles.cartBarLeft}>
              <View style={styles.cartIconCircle}>
                <ShoppingBag size={18} color="#16A34A" />
              </View>
              <View>
                <Text style={styles.cartBarCount}>
                  {cartCount} items {cartStoreName ? `• ${cartStoreName}` : ''}
                </Text>
                <Text style={styles.cartBarTotal}>Total {formatCurrency(cartSubtotal)}</Text>
              </View>
            </View>

            <View style={styles.cartBarRight}>
              <Text style={styles.cartBarCta}>View Cart</Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Store Conflict Modal */}
      <StoreConflictModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationPinCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  locationAddress: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  expressTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  expressTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroBanner: {
    margin: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  heroPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  heroPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  heroSub: {
    color: '#DCFCE7',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  heroTrustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  searchSection: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterScroll: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  sortContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
  },
  viewModeToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    padding: 2,
  },
  viewModeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  sortBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sortBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  sortBtnTextActive: {
    color: '#16A34A',
    fontWeight: '800',
  },
  storeList: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    marginTop: 4,
  },
  floatingCartContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    backgroundColor: 'transparent',
  },
  floatingCartBar: {
    backgroundColor: '#15803D',
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  cartBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBarCount: {
    fontSize: 11,
    color: '#DCFCE7',
    fontWeight: '600',
  },
  cartBarTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cartBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cartBarCta: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
