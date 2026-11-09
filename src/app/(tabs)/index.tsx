// src/app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { useThemeStore } from '@/store/themeStore';
import { useCartStore } from '@/store/cartStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { useTaxiStore } from '@/store/taxiStore';
import { useLocationStore } from '@/store/locationStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { superAppService } from '@/services/repositories/superAppService';
import { StoreConflictModal } from '@/components/modals/StoreConflictModal';
import { Store } from '@/types';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Bell,
  ShoppingCart,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Heart,
  Star,
  Car,
  ShoppingBag,
  Utensils,
  Building2,
  Truck,
  Stethoscope,
  Tag,
  Tv,
  Percent,
  Clock,
  LayoutGrid,
  Plus,
  Navigation,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 8 Primary Services Grid matching the exact design
const SERVICES = [
  {
    id: 'taxi',
    name: 'Taxi',
    icon: Car,
    color: '#D97706',
    bg: '#FEF3C7',
    route: '/taxi',
  },
  {
    id: 'grocery',
    name: 'Grocery',
    icon: ShoppingBag,
    color: '#16A34A',
    bg: '#DCFCE7',
    route: '/(tabs)/grocery',
  },
  {
    id: 'food',
    name: 'Food',
    icon: Utensils,
    color: '#EA580C',
    bg: '#FFEDD5',
    route: '/(tabs)/food',
  },
  {
    id: 'hotels',
    name: 'Hotels',
    icon: Building2,
    color: '#2563EB',
    bg: '#DBEAFE',
    route: '/hotels',
  },
  {
    id: 'logistics',
    name: 'Logistics',
    icon: Truck,
    color: '#9333EA',
    bg: '#F3E8FF',
    route: '/logistics',
  },
  {
    id: 'doctors',
    name: 'Doctors',
    icon: Stethoscope,
    color: '#0D9488',
    bg: '#CCFBF1',
    route: '/doctors',
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    icon: Tag,
    color: '#DB2777',
    bg: '#FCE7F3',
    route: '/marketplace',
  },
  {
    id: 'appliances',
    name: 'Appliances',
    icon: Tv,
    color: '#4F46E5',
    bg: '#E0E7FF',
    route: '/appliances',
  },
];

// Store-First Default Mock Stores with Cloudinary / Professional Photography
const DEFAULT_RESTAURANTS: Store[] = [
  {
    id: 'partner-3',
    name: 'Malabar Kitchen & Grill',
    category: 'restaurant',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    rating: 4.8,
    ratingCount: 210,
    deliveryTime: '25-35 mins',
    deliveryFee: 25,
    minOrderAmount: 149,
    cuisines: ['Kerala Thalassery', 'Biriyani', 'Arabian'],
    address: 'Indiranagar 100ft Road',
    city: 'Bengaluru',
    isOpen: true,
    distanceKm: 0.8,
    distanceFormatted: '0.8 km',
    featuredOffer: '20% OFF',
    storeDescription: 'Authentic Malabar dum biriyani, crispy parotta, seafood curries, and charcoal grilled al faham.',
  },
  {
    id: 'r2',
    name: 'Burger Hub & Grille',
    category: 'restaurant',
    logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    rating: 4.5,
    ratingCount: 140,
    deliveryTime: '20-30 mins',
    deliveryFee: 30,
    minOrderAmount: 199,
    cuisines: ['Gourmet Burgers', 'Crispy Fries', 'Shakes'],
    address: 'Koramangala 5th Block',
    city: 'Bengaluru',
    isOpen: true,
    distanceKm: 1.4,
    distanceFormatted: '1.4 km',
    featuredOffer: 'Free Delivery',
    storeDescription: 'Handcrafted gourmet smash burgers, loaded fries, and thick shakes.',
  },
  {
    id: 'r3',
    name: 'Artisan Pizza Palace',
    category: 'restaurant',
    logo: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80',
    rating: 4.7,
    ratingCount: 180,
    deliveryTime: '30-40 mins',
    deliveryFee: 35,
    minOrderAmount: 249,
    cuisines: ['Wood-fired Pizza', 'Italian', 'Pasta'],
    address: 'HAL 2nd Stage, Indiranagar',
    city: 'Bengaluru',
    isOpen: true,
    distanceKm: 1.9,
    distanceFormatted: '1.9 km',
    storeDescription: 'Authentic Neapolitan sourdough pizzas baked in an imported Italian wood-fired oven.',
  },
];

const DEFAULT_GROCERY_STORES: Store[] = [
  {
    id: 'partner-1',
    name: 'FreshBasket Supermarket Flagship',
    category: 'grocery',
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
    coverImage: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
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
    coverImage: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80',
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
    storeDescription: 'Certified organic vegetables, cold-pressed oils, and farm dairy.',
  },
];

import { useTranslation } from '@/localization/i18n';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const { currentAddress, latitude, longitude, pincode } = useLocationStore();
  const cartCount = useCartStore((state) => state.getItemCount());
  const unreadCount = useNotificationsStore((state) => state.getUnreadCount());
  const activeBooking = useTaxiStore((state) => state.activeBooking);
  const addItem = useCartStore((state) => state.addItem);

  const [activeBannerDot, setActiveBannerDot] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [nearbyGroceryStores, setNearbyGroceryStores] = useState<Store[]>([]);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Store[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingStores(true);
    Promise.all([
      superAppService.getStores({ category: 'grocery', lat: latitude, lng: longitude }),
      superAppService.getStores({ category: 'restaurant', lat: latitude, lng: longitude }),
    ])
      .then(([groceries, foods]) => {
        if (!isMounted) return;
        if (Array.isArray(groceries) && groceries.length > 0) {
          setNearbyGroceryStores(groceries);
        } else {
          setNearbyGroceryStores(DEFAULT_GROCERY_STORES);
        }
        if (Array.isArray(foods) && foods.length > 0) {
          setNearbyRestaurants(foods);
        } else {
          setNearbyRestaurants(DEFAULT_RESTAURANTS);
        }
      })
      .catch(() => {
        if (isMounted) {
          setNearbyGroceryStores(DEFAULT_GROCERY_STORES);
          setNearbyRestaurants(DEFAULT_RESTAURANTS);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingStores(false);
      });

    return () => {
      isMounted = false;
    };
  }, [latitude, longitude, currentAddress]);

  const displayGroceries = nearbyGroceryStores.length > 0 ? nearbyGroceryStores : DEFAULT_GROCERY_STORES;
  const displayRestaurants = nearbyRestaurants.length > 0 ? nearbyRestaurants : DEFAULT_RESTAURANTS;

  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const handleQuickAddGrocery = (item: any) => {
    const rawPrice =
      typeof item.price === 'number'
        ? item.price
        : parseInt(String(item.price).replace(/[^0-9]/g, ''), 10) || 50;

    const added = addItem(
      {
        id: item.id || item.productId,
        name: item.name,
        category: 'Grocery',
        price: rawPrice,
        unit: item.unit || '1 unit',
        image: typeof item.image === 'string' ? item.image : '',
        description: item.description || item.name,
        inStock: true,
      },
      1
    );

    if (added) {
      showToast(`✓ Added ${item.name} to basket!`);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? theme.background : '#F8FAFC' }]}>
      <StatusBar style="light" />

      {/* 🌟 IN-APP TOAST NOTIFICATION */}
      {toastMessage && (
        <View style={[styles.toastContainer, { top: Math.max(insets.top, 16) + 48 }]}>
          <View style={styles.toastPill}>
            <CheckCircle2 size={14} color="#10B981" style={{ marginRight: 6 }} />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* 🌟 1. LUSH TOP GREEN GRADIENT HEADER */}
        <LinearGradient
          colors={['#047857', '#059669', '#10B981', '#34D399', '#A7F3D0', '#F8FAFC']}
          locations={[0, 0.22, 0.45, 0.68, 0.88, 1]}
          style={[styles.topGradient, { paddingTop: Math.max(insets.top, 16) + 8 }]}
        >
          {/* Header Row: UBSSuper Brand + Actions */}
          <View style={styles.headerRow}>
            <View style={styles.brandContainer}>
              <View style={styles.brandTitleWrap}>
                <Text style={styles.brandUBS}>UBS</Text>
                <Text style={styles.brandSuper}>Super</Text>
              </View>
              <Text style={styles.brandSubtitle}>{t('home.tagline')}</Text>
            </View>

            <View style={styles.headerActions}>
              {/* Location Pill */}
              <TouchableOpacity
                style={styles.locationPill}
                activeOpacity={0.8}
                onPress={() => router.push('/location-picker' as any)}
              >
                <View style={styles.locationPinCircle}>
                  <MapPin size={13} color="#FFFFFF" />
                </View>
                <Text style={styles.locationText} numberOfLines={1}>
                  {currentAddress?.split(',')[0] || 'Manjeri'}
                  {pincode ? ` (${pincode})` : ''}
                </Text>
                <ChevronDown size={14} color="#FFFFFF" style={{ marginLeft: 2 }} />
              </TouchableOpacity>

              {/* Notification Button */}
              <TouchableOpacity
                style={styles.headerCircleBtn}
                activeOpacity={0.8}
                onPress={() => router.push('/notifications')}
              >
                <Bell size={18} color="#FFFFFF" />
                <View style={styles.badgeRed}>
                  <Text style={styles.badgeRedText}>
                    {unreadCount > 0 ? unreadCount : 3}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Cart Button */}
              <TouchableOpacity
                style={styles.headerCircleBtn}
                activeOpacity={0.8}
                onPress={() => router.push('/cart')}
              >
                <ShoppingCart size={18} color="#FFFFFF" />
                <View style={styles.badgeRed}>
                  <Text style={styles.badgeRedText}>
                    {cartCount > 0 ? cartCount : 3}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Search Bar */}
          <TouchableOpacity
            style={styles.searchBar}
            activeOpacity={0.9}
            onPress={() => router.push('/search')}
          >
            <Search size={19} color="#64748B" style={styles.searchIcon} />
            <Text style={styles.searchPlaceholder} numberOfLines={1}>
              {t('home.searchPlaceholder')}
            </Text>
            <SlidersHorizontal size={18} color="#475569" style={styles.filterIcon} />
          </TouchableOpacity>

          {/* 🌟 2. HERO PROMO BANNER (Book Taxis Easily) */}
          <View style={styles.bannerContainer}>
            <View style={styles.bannerCard}>
              <View style={styles.bannerLeft}>
                <Text style={styles.bannerOverline}>{t('home.tagline')}</Text>
                <Text style={styles.bannerTitle}>{t('home.bookTaxisEasily')}</Text>
                <Text style={styles.bannerSubtitle}>
                  {t('home.safeAffordableRides')}
                </Text>
                <TouchableOpacity
                  style={styles.bannerCtaBtn}
                  activeOpacity={0.85}
                  onPress={() => router.push('/taxi')}
                >
                  <Text style={styles.bannerCtaText}>{t('home.bookRideNow')}</Text>
                  <ArrowRight size={13} color="#FFFFFF" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>

              <View style={styles.bannerRight}>
                <Image
                  source={require('@/../assets/images/home/taxi_banner.jpg')}
                  style={styles.bannerTaxiImg}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Banner Pagination Dots */}
            <View style={styles.dotsRow}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.bannerDot,
                    i === activeBannerDot ? styles.bannerDotActive : styles.bannerDotInactive,
                  ]}
                />
              ))}
            </View>
          </View>
        </LinearGradient>

        {/* 🌟 OPTIONAL: ACTIVE RIDE LIVE TRACKING (IF USER HAS ACTIVE RIDE) */}
        {activeBooking && activeBooking.status !== 'cancelled' && activeBooking.status !== 'completed' && (
          <TouchableOpacity
            style={styles.liveTripBanner}
            activeOpacity={0.9}
            onPress={() => router.push('/taxi/booking')}
          >
            <View style={styles.liveTripIcon}>
              <Navigation size={14} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.liveTripTitle}>
                {activeBooking.status === 'searching'
                  ? t('home.findingDriver')
                  : `${t('home.tripInProgress')} • ${activeBooking.rideOption.name}`}
              </Text>
              <Text style={styles.liveTripSub}>{t('home.trackLive')}</Text>
            </View>
            <Text style={styles.liveTripCta}>{t('home.trackLive')} →</Text>
          </TouchableOpacity>
        )}

        {/* 🌟 3. MAIN SERVICES CATEGORY GRID (8 SQUIRCLES) */}
        <View style={styles.servicesGrid}>
          {SERVICES.map((item) => {
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.serviceItem}
                activeOpacity={0.8}
                onPress={() => router.push(item.route as any)}
              >
                <View style={[styles.serviceIconWrap, { backgroundColor: item.bg }]}>
                  <Icon size={30} color={item.color} strokeWidth={2.2} />
                </View>
                <Text style={[styles.serviceLabel, { color: theme.textPrimary }]} numberOfLines={1}>
                  {t('home.' + item.id, item.name)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 🌟 4. QUICK ACTION BAR (Offers | Saved | Recent | See All) */}
        <View style={[styles.quickActionsCard, { backgroundColor: theme.card, borderColor: theme.borderLight }]}>
          <TouchableOpacity
            style={styles.quickActionItem}
            activeOpacity={0.75}
            onPress={() => router.push('/offers' as any)}
          >
            <View style={[styles.quickActionIconCircle, { backgroundColor: '#10B981' }]}>
              <Percent size={15} color="#FFFFFF" strokeWidth={3} />
            </View>
            <Text style={[styles.quickActionLabel, { color: theme.textPrimary }]}>{t('home.offers', 'Offers')}</Text>
          </TouchableOpacity>

          <View style={[styles.quickActionDivider, { backgroundColor: theme.borderLight }]} />

          <TouchableOpacity
            style={styles.quickActionItem}
            activeOpacity={0.75}
            onPress={() => router.push('/saved' as any)}
          >
            <View style={[styles.quickActionIconCircle, { backgroundColor: '#EF4444' }]}>
              <Heart size={15} color="#FFFFFF" fill="#FFFFFF" />
            </View>
            <Text style={[styles.quickActionLabel, { color: theme.textPrimary }]}>{t('home.saved', 'Saved')}</Text>
          </TouchableOpacity>

          <View style={[styles.quickActionDivider, { backgroundColor: theme.borderLight }]} />

          <TouchableOpacity
            style={styles.quickActionItem}
            activeOpacity={0.75}
            onPress={() => router.push('/orders')}
          >
            <View style={[styles.quickActionIconCircle, { backgroundColor: '#0D9488' }]}>
              <Clock size={15} color="#FFFFFF" strokeWidth={2.6} />
            </View>
            <Text style={[styles.quickActionLabel, { color: theme.textPrimary }]}>{t('home.recent', 'Recent')}</Text>
          </TouchableOpacity>

          <View style={[styles.quickActionDivider, { backgroundColor: theme.borderLight }]} />

          <TouchableOpacity
            style={styles.quickActionItem}
            activeOpacity={0.75}
            onPress={() => router.push('/(tabs)/more')}
          >
            <View style={styles.quickActionGridWrap}>
              <LayoutGrid size={22} color="#10B981" />
            </View>
            <Text style={[styles.quickActionLabel, { color: theme.textPrimary }]}>{t('home.seeAll', 'See All')}</Text>
          </TouchableOpacity>
        </View>

        {/* 🌟 5. NEARBY RESTAURANTS SECTION */}
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('home.nearbyRestaurants')}</Text>
            <View style={styles.locationSubtitleRow}>
              <MapPin size={13} color="#16A34A" />
              <Text style={[styles.locationSubtitleText, { color: theme.textSecondary }]}>
                {t('home.nearLocation', { location: currentAddress?.split(',')[0] || 'Manjeri' })}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.seeAllBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/food')}
          >
            <Text style={[styles.seeAllText, { color: theme.primary }]}>{t('home.seeAll', 'See All')}</Text>
            <ArrowRight size={14} color={theme.primary} style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.restaurantsScroll}
        >
          {displayRestaurants.map((item) => {
            const isFav = isFavorite(item.id);
            const coverUri = item.coverImage || item.logo || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80';
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.restaurantCard, { backgroundColor: theme.card, borderColor: theme.borderLight }]}
                activeOpacity={0.88}
                onPress={() => router.push(`/food/restaurant/${item.id}`)}
              >
                <View style={styles.restaurantImageWrap}>
                  <Image source={{ uri: coverUri }} style={styles.restaurantImage} resizeMode="cover" />

                  {item.featuredOffer && (
                    <View style={styles.restaurantDiscountBadge}>
                      <Text style={styles.restaurantDiscountText}>{item.featuredOffer}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.restaurantHeartBtn}
                    activeOpacity={0.8}
                    onPress={() => {
                      toggleFavorite(item.id);
                      showToast(isFav ? `Removed ${item.name} from Saved` : `❤️ Saved ${item.name}!`);
                    }}
                  >
                    <Heart
                      size={14}
                      color="#FFFFFF"
                      fill={isFav ? '#EF4444' : 'transparent'}
                    />
                  </TouchableOpacity>

                  {/* Rating and Distance Floating Overlays */}
                  <View style={styles.restaurantOverlayRow}>
                    <View style={styles.pillBadge}>
                      <Star size={11} color="#F59E0B" fill="#F59E0B" style={{ marginRight: 3 }} />
                      <Text style={styles.pillBadgeText}>{Number(item.rating || 4.7).toFixed(1)}</Text>
                    </View>
                    <View style={[styles.pillBadge, { marginLeft: 4 }]}>
                      <MapPin size={11} color="#16A34A" style={{ marginRight: 3 }} />
                      <Text style={styles.pillBadgeText}>{item.distanceFormatted || '1.2 km'}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.restaurantInfo}>
                  <Text style={[styles.restaurantName, { color: theme.textPrimary }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.restaurantCuisines, { color: theme.textSecondary }]} numberOfLines={1}>
                    {item.cuisines?.join(' • ') || item.storeDescription || 'Multi-Cuisine'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 🌟 6. NEARBY GROCERY STORES SECTION */}
        <View style={[styles.sectionHeaderRow, { marginTop: 22 }]}>
          <View>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              {t('home.topGroceryStores')}
            </Text>
            <Text style={[styles.locationSubtitleText, { color: theme.textSecondary, marginTop: 2 }]}>
              {t('home.freshProduce')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.seeAllBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/grocery')}
          >
            <Text style={[styles.seeAllText, { color: theme.primary }]}>{t('home.seeAll', 'See All')}</Text>
            <ArrowRight size={14} color={theme.primary} style={{ marginLeft: 3 }} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.restaurantsScroll}
        >
          {displayGroceries.map((store) => {
            const isFav = isFavorite(store.id);
            const coverUri = store.coverImage || store.logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
            return (
              <TouchableOpacity
                key={store.id}
                style={[styles.restaurantCard, { backgroundColor: theme.card, borderColor: theme.borderLight }]}
                activeOpacity={0.88}
                onPress={() => router.push(`/grocery/store/${store.id}` as any)}
              >
                <View style={styles.restaurantImageWrap}>
                  <Image source={{ uri: coverUri }} style={styles.restaurantImage} resizeMode="cover" />

                  {store.deliveryFee === 0 && (
                    <View style={[styles.restaurantDiscountBadge, { backgroundColor: '#16A34A' }]}>
                      <Text style={styles.restaurantDiscountText}>FREE DELIVERY</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.restaurantHeartBtn}
                    activeOpacity={0.8}
                    onPress={() => {
                      toggleFavorite(store.id);
                      showToast(isFav ? `Removed ${store.name} from Saved` : `❤️ Saved ${store.name}!`);
                    }}
                  >
                    <Heart
                      size={14}
                      color="#FFFFFF"
                      fill={isFav ? '#EF4444' : 'transparent'}
                    />
                  </TouchableOpacity>

                  {/* Rating and Distance Floating Overlays */}
                  <View style={styles.restaurantOverlayRow}>
                    <View style={styles.pillBadge}>
                      <Star size={11} color="#F59E0B" fill="#F59E0B" style={{ marginRight: 3 }} />
                      <Text style={styles.pillBadgeText}>{Number(store.rating || 4.8).toFixed(1)}</Text>
                    </View>
                    <View style={[styles.pillBadge, { marginLeft: 4 }]}>
                      <Clock size={11} color="#16A34A" style={{ marginRight: 3 }} />
                      <Text style={styles.pillBadgeText}>{store.deliveryTime || '20 mins'}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.restaurantInfo}>
                  <Text style={[styles.restaurantName, { color: theme.textPrimary }]} numberOfLines={1}>
                    {store.name}
                  </Text>
                  <Text style={[styles.restaurantCuisines, { color: theme.textSecondary }]} numberOfLines={1}>
                    {store.distanceFormatted} • {store.deliveryFee === 0 ? 'Free Delivery' : `₹${store.deliveryFee} Fee`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </ScrollView>

      {/* Store Conflict Modal */}
      <StoreConflictModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 80,
  },
  topGradient: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandContainer: {
    flex: 1,
  },
  brandTitleWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandUBS: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandSuper: {
    fontSize: 26,
    fontWeight: '800',
    fontStyle: 'italic',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 45, 25, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 6,
  },
  locationPinCircle: {
    marginRight: 4,
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    maxWidth: 75,
  },
  headerCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 45, 25, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    position: 'relative',
  },
  badgeRed: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#059669',
  },
  badgeRedText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '400',
  },
  filterIcon: {
    marginLeft: 8,
  },
  bannerContainer: {
    marginTop: 2,
  },
  bannerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    height: 142,
  },
  bannerLeft: {
    flex: 1.15,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  bannerOverline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.6,
  },
  bannerTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 15,
  },
  bannerCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 6.5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  bannerCtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  bannerRight: {
    flex: 1,
    overflow: 'hidden',
  },
  bannerTaxiImg: {
    width: '100%',
    height: '100%',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  bannerDot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  bannerDotActive: {
    width: 14,
    backgroundColor: '#059669',
  },
  bannerDotInactive: {
    width: 6,
    backgroundColor: '#CBD5E1',
  },
  liveTripBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  liveTripIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveTripTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  liveTripSub: {
    fontSize: 11,
    color: '#B45309',
  },
  liveTripCta: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  serviceItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 16,
  },
  serviceIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  serviceLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'center',
  },
  quickActionsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 2,
    marginBottom: 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  quickActionGridWrap: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickActionDivider: {
    width: 1,
    height: 28,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  locationSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationSubtitleText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 3,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  restaurantsScroll: {
    paddingLeft: 16,
    paddingRight: 6,
    gap: 12,
  },
  restaurantCard: {
    width: 174,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  restaurantImageWrap: {
    width: '100%',
    height: 118,
    position: 'relative',
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
  },
  restaurantDiscountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#16A34A',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  restaurantDiscountText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  restaurantHeartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restaurantOverlayRow: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pillBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  restaurantInfo: {
    padding: 10,
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: '700',
  },
  restaurantCuisines: {
    fontSize: 11,
    marginTop: 2,
  },
  groceriesScroll: {
    paddingLeft: 16,
    paddingRight: 6,
    gap: 10,
  },
  groceryCard: {
    width: 132,
    borderRadius: 14,
    borderWidth: 1,
    padding: 8,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  groceryHeartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 2,
  },
  groceryImageWrap: {
    width: '100%',
    height: 94,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  groceryImage: {
    width: '85%',
    height: '85%',
  },
  groceryInfo: {
    marginTop: 6,
  },
  groceryName: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  groceryUnit: {
    fontSize: 10.5,
    marginTop: 1,
  },
  groceryPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  groceryPrice: {
    fontSize: 13,
    fontWeight: '800',
  },
  groceryAddBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 99,
    alignItems: 'center',
  },
  toastPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
