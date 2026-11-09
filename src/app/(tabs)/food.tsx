// src/app/(tabs)/food.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { useLocationStore } from '@/store/locationStore';
import { AppHeader } from '@/components/ui/Header';
import { SearchBar } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { RestaurantCard } from '@/components/cards/RestaurantCard';
import { StoresMapView } from '@/components/maps/StoresMapView';
import { superAppService } from '@/services/repositories/superAppService';
import { Restaurant } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Flame,
  UtensilsCrossed,
  MapPin,
  ChevronDown,
  List as ListIcon,
  Map as MapIcon,
} from 'lucide-react-native';

const FOOD_CUISINES = ['All', 'Malabar', 'Biriyani', 'Arabian', 'Shawarma', 'Pizza', 'Burgers'];

export default function FoodHomeScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const { currentAddress, latitude, longitude } = useLocationStore();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    superAppService
      .getRestaurants({ lat: latitude, lng: longitude })
      .then((data) => {
        if (isMounted) setRestaurants(data as Restaurant[]);
      })
      .catch(() => {
        if (isMounted) setRestaurants([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [latitude, longitude]);

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesCuisine =
      selectedCuisine === 'All' || (r.cuisines && r.cuisines.includes(selectedCuisine));
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCuisine && matchesSearch;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Location Bar */}
      <TouchableOpacity
        style={[styles.locationBar, { backgroundColor: theme.card, borderColor: theme.border }]}
        activeOpacity={0.85}
        onPress={() => router.push('/location-picker' as any)}
      >
        <View style={styles.locationLeft}>
          <View style={styles.locationPinCircle}>
            <MapPin size={16} color="#EA580C" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.locationLabel, { color: theme.textSecondary }]}>
                DELIVERING FOOD TO
              </Text>
              <ChevronDown size={14} color="#64748B" style={{ marginLeft: 3 }} />
            </View>
            <Text style={[styles.locationAddress, { color: theme.textPrimary }]} numberOfLines={1}>
              {currentAddress || 'Manjeri, Malappuram'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Orange Hero Banner */}
        <LinearGradient
          colors={['#C2410C', '#EA580C', '#F97316']}
          style={styles.heroBanner}
        >
          <View style={styles.promoBadge}>
            <Flame size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.promoText}>HOT & FRESH</Text>
          </View>
          <Text style={styles.heroTitle}>Delicious Food, Delivered Fast</Text>
          <Text style={styles.heroSubtitle}>
            Biriyani, Al Faham, Shawarma & Gourmet delights at your door.
          </Text>
        </LinearGradient>

        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search restaurants or dishes..."
            onClear={() => setSearchQuery('')}
          />
        </View>

        {/* Cuisine Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cuisineScroll}
        >
          {FOOD_CUISINES.map((cui) => (
            <TouchableOpacity
              key={cui}
              style={[
                styles.cuiChip,
                {
                  backgroundColor: selectedCuisine === cui ? '#EA580C' : theme.surface,
                  borderColor: selectedCuisine === cui ? '#EA580C' : theme.border,
                },
              ]}
              onPress={() => setSelectedCuisine(cui)}
            >
              <Text
                style={[
                  styles.cuiText,
                  { color: selectedCuisine === cui ? '#FFFFFF' : theme.textPrimary },
                ]}
              >
                {cui}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Section Heading with Count & View Mode Toggle */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Popular Restaurants</Text>
            <Text style={[styles.count, { color: theme.textSecondary }]}>
              {filteredRestaurants.length} verified dining spots near you
            </Text>
          </View>

          {/* View Mode Toggle: List vs Map */}
          <View style={[styles.viewModeToggle, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.viewModeBtn, viewMode === 'list' && { backgroundColor: '#EA580C' }]}
              onPress={() => setViewMode('list')}
              activeOpacity={0.8}
            >
              <ListIcon size={14} color={viewMode === 'list' ? '#FFFFFF' : theme.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewModeBtn, viewMode === 'map' && { backgroundColor: '#EA580C' }]}
              onPress={() => setViewMode('map')}
              activeOpacity={0.8}
            >
              <MapIcon size={14} color={viewMode === 'map' ? '#FFFFFF' : theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 🗺️ Interactive Google Map View Mode */}
        {viewMode === 'map' && (
          <View style={styles.mapContainer}>
            <StoresMapView
              stores={filteredRestaurants}
              userCoords={{ latitude, longitude }}
              category="restaurant"
              onSelectStore={(rest) => router.push(`/food/restaurant/${rest.id}` as any)}
            />
          </View>
        )}

        {/* List of Restaurants */}
        <View style={{ paddingHorizontal: Spacing.lg }}>
          {loading ? (
            <View style={{ paddingVertical: Spacing.xl * 2, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#EA580C" />
            </View>
          ) : filteredRestaurants.length === 0 ? (
            <EmptyState
              icon={<UtensilsCrossed size={36} color={theme.textMuted} />}
              title="No restaurants available in this area"
              description="We are currently onboarding partners in your region. Check back soon!"
            />
          ) : (
            filteredRestaurants.map((rest) => (
              <RestaurantCard
                key={rest.id}
                restaurant={rest}
                onPress={() => router.push(`/food/restaurant/${rest.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  locationLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationPinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(234, 88, 12, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  locationAddress: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl * 2,
  },
  heroBanner: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
  },
  promoText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  heroSubtitle: {
    color: '#FFEDD5',
    fontSize: Typography.sizes.xs + 1,
    marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cuisineScroll: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  cuiChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.xs + 2,
  },
  cuiText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  count: {
    fontSize: Typography.sizes.xs,
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
  mapContainer: {
    height: 380,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
});
