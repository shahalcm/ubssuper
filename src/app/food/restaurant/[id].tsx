// src/app/food/restaurant/[id].tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  Modal,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { MOCK_RESTAURANTS, MOCK_DISHES } from '@/services/mock/data';
import { superAppService } from '@/services/repositories/superAppService';
import { StoreConflictModal } from '@/components/modals/StoreConflictModal';
import { Dish } from '@/types';
import {
  ArrowLeft,
  ShoppingBag,
  Heart,
  Share2,
  Search,
  X,
  Star,
  Clock,
  MapPin,
  Plus,
  Minus,
  Tag,
  Flame,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MENU_CATEGORIES = [
  'All',
  'Biriyani Specials',
  'Arabian Charcoal',
  'Curries & Parotta',
  'Starters & Snacks',
  'Beverages & Desserts',
];

export default function RestaurantDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const restaurantId = params.id as string;

  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [liveRestaurant, setLiveRestaurant] = useState<any>(null);
  const [liveDishes, setLiveDishes] = useState<Dish[]>([]);

  useEffect(() => {
    superAppService.getRestaurantById(restaurantId).then((res) => {
      if (res) setLiveRestaurant(res);
    }).catch(() => {});

    superAppService.getDishesByRestaurant(restaurantId).then((dishes) => {
      if (dishes && dishes.length > 0) setLiveDishes(dishes as any);
    }).catch(() => {});
  }, [restaurantId]);

  const restaurant = liveRestaurant ||
    MOCK_RESTAURANTS.find((r) => r.id === restaurantId) || MOCK_RESTAURANTS[0];

  // All dishes for this restaurant
  const allDishes = useMemo(() => {
    if (liveDishes.length > 0) return liveDishes;
    return MOCK_DISHES.filter(
      (d) => d.restaurantId === restaurant.id || d.restaurantId === 'r1'
    );
  }, [liveDishes, restaurant.id]);

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const cartCount = useCartStore((state) => state.getItemCount());
  const cartSubtotal = useCartStore((state) => state.getSubtotal());

  const isFav = useFavoritesStore((state) => state.isFavorite(restaurant.id));
  const toggleFav = useFavoritesStore((state) => state.toggleFavorite);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [vegOnlyFilter, setVegOnlyFilter] = useState<boolean>(false);
  const [nonVegFilter, setNonVegFilter] = useState<boolean>(false);
  const [bestsellerOnly, setBestsellerOnly] = useState<boolean>(false);
  const [selectedDishModal, setSelectedDishModal] = useState<Dish | null>(null);
  const [couponAppliedNotice, setCouponAppliedNotice] = useState<boolean>(false);

  // Handle share
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Order delicious food from ${restaurant.name} on UBS Super! Get 20% OFF today.`,
      });
    } catch {
      // Ignored
    }
  };

  const handleApplyCoupon = () => {
    setCouponAppliedNotice(true);
    setTimeout(() => setCouponAppliedNotice(false), 2400);
  };

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return allDishes.filter((dish) => {
      // Category match
      const matchesCategory =
        selectedCategory === 'All' || dish.category === selectedCategory;

      // Search match
      const matchesSearch =
        searchQuery.trim() === '' ||
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Veg / Non-veg match
      let matchesDiet = true;
      if (vegOnlyFilter) matchesDiet = dish.isVeg;
      if (nonVegFilter) matchesDiet = !dish.isVeg;

      // Bestseller match
      let matchesBestseller = true;
      if (bestsellerOnly) matchesBestseller = !!dish.isBestseller;

      return matchesCategory && matchesSearch && matchesDiet && matchesBestseller;
    });
  }, [allDishes, selectedCategory, searchQuery, vegOnlyFilter, nonVegFilter, bestsellerOnly]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 🌟 1. FIXED FLOATING HEADER BAR */}
      <SafeAreaView edges={['top']} style={styles.floatingHeaderBar}>
        <TouchableOpacity
          style={styles.floatingActionCircle}
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <ArrowLeft size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.floatingHeaderRight}>
          <TouchableOpacity
            style={styles.floatingActionCircle}
            activeOpacity={0.8}
            onPress={() => toggleFav(restaurant.id)}
          >
            <Heart
              size={18}
              color={isFav ? '#EF4444' : '#FFFFFF'}
              fill={isFav ? '#EF4444' : 'transparent'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.floatingActionCircle, { marginLeft: 8 }]}
            activeOpacity={0.8}
            onPress={handleShare}
          >
            <Share2 size={17} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.floatingActionCircle, { marginLeft: 8, backgroundColor: '#16A34A' }]}
            activeOpacity={0.8}
            onPress={() => router.push('/cart')}
          >
            <ShoppingBag size={17} color="#FFFFFF" />
            {cartCount > 0 && (
              <View style={styles.cartCountPill}>
                <Text style={styles.cartCountPillText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* 🌟 2. MAIN SCROLL VIEW (COVER IMAGE SCROLLS NATURALLY WITH ZERO CLIPPING) */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollBody,
          { paddingBottom: cartCount > 0 ? 120 : 60 },
        ]}
      >
        {/* Cover Image inside ScrollView */}
        <View style={styles.heroWrapper}>
          <Image
            source={{ uri: restaurant.coverImage || restaurant.image }}
            style={styles.heroCoverImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(0,0,0,0.55)']}
            style={styles.heroOverlayGradient}
          />
        </View>

        {/* 🌟 3. ELEVATED RESTAURANT PROFILE ISLAND CARD */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: theme.card, borderColor: theme.border },
            Shadows.medium,
          ]}
        >
          <View style={styles.profileTopRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.restaurantTitle, { color: theme.textPrimary }]}>
                {restaurant.name}
              </Text>
              <Text style={[styles.cuisinesText, { color: theme.textSecondary }]}>
                {restaurant.cuisines.join(' • ')}
              </Text>
            </View>

            {/* Rating Box */}
            <View style={styles.ratingBadgeBox}>
              <View style={styles.ratingBadgeRow}>
                <Text style={styles.ratingBadgeText}>{restaurant.rating.toFixed(1)}</Text>
                <Star size={11} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 3 }} />
              </View>
              <Text style={styles.ratingCountSub}>{restaurant.ratingCount}+ ratings</Text>
            </View>
          </View>

          {/* Key Metrics Chips Row */}
          <View style={[styles.metricsRow, { borderColor: theme.borderLight }]}>
            <View style={styles.metricItem}>
              <Clock size={14} color="#16A34A" style={{ marginRight: 5 }} />
              <Text style={[styles.metricText, { color: theme.textPrimary }]}>
                {restaurant.deliveryTime}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <MapPin size={14} color="#2563EB" style={{ marginRight: 5 }} />
              <Text style={[styles.metricText, { color: theme.textPrimary }]}>
                {restaurant.distance || '0.8 km'}
              </Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <View style={styles.liveOpenDot} />
              <Text style={[styles.metricText, { color: '#16A34A', fontWeight: '800' }]}>
                Open Now
              </Text>
            </View>
          </View>

          {/* Deals & Coupons Pill */}
          <TouchableOpacity
            style={[
              styles.couponBar,
              { backgroundColor: isDarkMode ? '#14532D25' : '#ECFDF5', borderColor: '#86EFAC' },
            ]}
            activeOpacity={0.8}
            onPress={handleApplyCoupon}
          >
            <View style={styles.couponLeftContent}>
              <Tag size={13} color="#15803D" style={{ marginRight: 6 }} />
              <Text style={[styles.couponText, { color: '#15803D' }]} numberOfLines={1}>
                {couponAppliedNotice
                  ? '🎉 CODE MALABAR50 APPLIED!'
                  : 'FLAT ₹50 OFF above ₹249 • MALABAR50'}
              </Text>
            </View>
            <View style={styles.applyBtnPill}>
              <Text style={styles.applyCouponAction}>
                {couponAppliedNotice ? 'APPLIED' : 'APPLY'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 🌟 4. SEARCH DISHES IN RESTAURANT */}
        <View style={styles.searchSection}>
          <View
            style={[
              styles.menuSearchBar,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <Search size={16} color={theme.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.menuSearchInput, { color: theme.textPrimary }]}
              placeholder={`Search in ${restaurant.name} menu...`}
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                <X size={14} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 🌟 5. DIET & MUST-TRY FILTER CHIPS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dietFilterScroll}
        >
          {/* Veg Only Toggle */}
          <TouchableOpacity
            style={[
              styles.dietChip,
              vegOnlyFilter && styles.vegActiveChip,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
            onPress={() => {
              setVegOnlyFilter(!vegOnlyFilter);
              if (nonVegFilter) setNonVegFilter(false);
            }}
          >
            <View style={styles.vegIconSmall}>
              <View style={[styles.innerVegDot, { backgroundColor: '#16A34A' }]} />
            </View>
            <Text
              style={[
                styles.dietChipText,
                { color: vegOnlyFilter ? '#FFFFFF' : theme.textPrimary },
              ]}
            >
              Veg Only
            </Text>
          </TouchableOpacity>

          {/* Non Veg Toggle */}
          <TouchableOpacity
            style={[
              styles.dietChip,
              nonVegFilter && styles.nonVegActiveChip,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
            onPress={() => {
              setNonVegFilter(!nonVegFilter);
              if (vegOnlyFilter) setVegOnlyFilter(false);
            }}
          >
            <View style={[styles.vegIconSmall, { borderColor: '#DC2626' }]}>
              <View style={[styles.innerVegDot, { backgroundColor: '#DC2626' }]} />
            </View>
            <Text
              style={[
                styles.dietChipText,
                { color: nonVegFilter ? '#FFFFFF' : theme.textPrimary },
              ]}
            >
              Non-Veg
            </Text>
          </TouchableOpacity>

          {/* Bestseller Filter */}
          <TouchableOpacity
            style={[
              styles.dietChip,
              bestsellerOnly && styles.bestsellerActiveChip,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
            onPress={() => setBestsellerOnly(!bestsellerOnly)}
          >
            <Flame
              size={12}
              color={bestsellerOnly ? '#FFFFFF' : '#F59E0B'}
              fill={bestsellerOnly ? '#FFFFFF' : '#F59E0B'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.dietChipText,
                { color: bestsellerOnly ? '#FFFFFF' : theme.textPrimary },
              ]}
            >
              Bestsellers
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* 🌟 6. HORIZONTAL MENU CATEGORIES TABS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabsScroll}
        >
          {MENU_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.surface,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 🌟 7. DISHES SECTION HEADER */}
        <View style={styles.dishesHeader}>
          <Text style={[styles.dishesSectionTitle, { color: theme.textPrimary }]}>
            {selectedCategory === 'All' ? 'Recommended Menu' : selectedCategory}
          </Text>
          <Text style={[styles.dishesCountText, { color: theme.textSecondary }]}>
            {filteredDishes.length} items
          </Text>
        </View>

        {/* 🌟 8. DISH CARDS LIST */}
        <View style={styles.dishesListContainer}>
          {filteredDishes.length === 0 ? (
            <View style={[styles.emptyDishesBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>🍲</Text>
              <Text style={[styles.emptyDishesTitle, { color: theme.textPrimary }]}>
                No dishes match your filters
              </Text>
              <Text style={[styles.emptyDishesSub, { color: theme.textSecondary }]}>
                Try clearing your search query or removing veg/non-veg filters.
              </Text>
              <TouchableOpacity
                style={[styles.resetFiltersBtn, { backgroundColor: theme.primary }]}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setVegOnlyFilter(false);
                  setNonVegFilter(false);
                  setBestsellerOnly(false);
                }}
              >
                <Text style={styles.resetFiltersBtnText}>Show Full Menu</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredDishes.map((dish) => {
              const cartItem = cartItems.find((i) => i.product.id === dish.id);
              const quantity = cartItem ? cartItem.quantity : 0;

              const mockProduct = {
                id: dish.id,
                name: dish.name,
                category: 'food',
                price: dish.price,
                originalPrice: dish.originalPrice,
                unit: '1 Portion',
                image: dish.image,
                description: dish.description,
                inStock: true,
              };

              return (
                <TouchableOpacity
                  key={dish.id}
                  style={[
                    styles.dishCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    Shadows.small,
                  ]}
                  activeOpacity={0.88}
                  onPress={() => setSelectedDishModal(dish)}
                >
                  {/* Left Column: Details */}
                  <View style={styles.dishDetailsCol}>
                    {/* Diet & Bestseller Row */}
                    <View style={styles.dishTagRow}>
                      <View
                        style={[
                          styles.vegSymbolBox,
                          { borderColor: dish.isVeg ? '#16A34A' : '#DC2626' },
                        ]}
                      >
                        <View
                          style={[
                            styles.vegSymbolInner,
                            { backgroundColor: dish.isVeg ? '#16A34A' : '#DC2626' },
                          ]}
                        />
                      </View>

                      {dish.isBestseller && (
                        <View style={styles.bestsellerPill}>
                          <Flame size={10} color="#D97706" fill="#D97706" style={{ marginRight: 2 }} />
                          <Text style={styles.bestsellerPillText}>BESTSELLER</Text>
                        </View>
                      )}
                    </View>

                    {/* Title */}
                    <Text style={[styles.dishTitle, { color: theme.textPrimary }]} numberOfLines={2}>
                      {dish.name}
                    </Text>

                    {/* Price Row with Slashed MRP */}
                    <View style={styles.dishPriceRow}>
                      <Text style={[styles.dishPrice, { color: theme.textPrimary }]}>
                        {formatCurrency(dish.price)}
                      </Text>
                      {dish.originalPrice && (
                        <Text style={[styles.dishOriginalPrice, { color: theme.textMuted }]}>
                          {formatCurrency(dish.originalPrice)}
                        </Text>
                      )}
                    </View>

                    {/* Rating Pill */}
                    {dish.rating && (
                      <View style={styles.dishRatingRow}>
                        <Star size={11} color="#F59E0B" fill="#F59E0B" />
                        <Text style={[styles.dishRatingText, { color: theme.textPrimary }]}>
                          {dish.rating.toFixed(1)}
                        </Text>
                        <Text style={[styles.dishRatingVotes, { color: theme.textSecondary }]}>
                          (120+)
                        </Text>
                      </View>
                    )}

                    {/* Description */}
                    <Text
                      style={[styles.dishDescription, { color: theme.textSecondary }]}
                      numberOfLines={2}
                    >
                      {dish.description}
                    </Text>
                  </View>

                  {/* Right Column: Food Image & Add Button */}
                  <View style={styles.dishImageCol}>
                    <Image
                      source={{ uri: dish.image }}
                      style={styles.dishFoodImage}
                      resizeMode="cover"
                    />

                    {/* ADD / Quantity Stepper Button */}
                    <View style={styles.addBtnContainer}>
                      {quantity > 0 ? (
                        <View
                          style={[
                            styles.quantityBox,
                            { backgroundColor: '#16A34A', borderColor: '#15803D' },
                          ]}
                        >
                          <TouchableOpacity
                            style={styles.stepperTouch}
                            activeOpacity={0.7}
                            onPress={(e) => {
                              e.stopPropagation?.();
                              updateQuantity(dish.id, quantity - 1);
                            }}
                          >
                            <Minus size={13} color="#FFFFFF" />
                          </TouchableOpacity>
                          <Text style={styles.quantityNumberText}>{quantity}</Text>
                          <TouchableOpacity
                            style={styles.stepperTouch}
                            activeOpacity={0.7}
                            onPress={(e) => {
                              e.stopPropagation?.();
                              updateQuantity(dish.id, quantity + 1);
                            }}
                          >
                            <Plus size={13} color="#FFFFFF" />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.standaloneAddBtn,
                            { backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF', borderColor: '#16A34A' },
                          ]}
                          activeOpacity={0.8}
                          onPress={(e) => {
                            e.stopPropagation?.();
                            addItem(mockProduct, 1, {
                              id: restaurant.id,
                              name: restaurant.name,
                              type: 'food',
                              logo: restaurant.image,
                              deliveryFee: restaurant.deliveryFee,
                            });
                          }}
                        >
                          <Text style={styles.standaloneAddText}>ADD</Text>
                          <Plus size={11} color="#16A34A" style={{ marginLeft: 2 }} />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={[styles.customisableHint, { color: theme.textSecondary }]}>
                      Customisable
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* 🌟 9. RESTAURANT FSSAI & HYGIENE FOOTER */}
        <View style={[styles.hygieneCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <ShieldCheck size={18} color="#16A34A" style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.hygieneTitle, { color: theme.textPrimary }]}>
              UBS Super Hygiene Assured Kitchen
            </Text>
            <Text style={[styles.hygieneSub, { color: theme.textSecondary }]}>
              FSSAI Lic. No. 11319004000412 • Temperature-monitored kitchen staff.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 🌟 10. DISH DETAIL BOTTOM SHEET MODAL */}
      <Modal
        visible={!!selectedDishModal}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedDishModal(null)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalDismissArea}
            activeOpacity={1}
            onPress={() => setSelectedDishModal(null)}
          />

          {selectedDishModal && (
            <View
              style={[
                styles.modalContentCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              {/* Close Handle */}
              <View style={styles.modalHandleBar} />

              <Image
                source={{ uri: selectedDishModal.image }}
                style={styles.modalImage}
                resizeMode="cover"
              />

              <View style={styles.modalBody}>
                <View style={styles.modalTagRow}>
                  <View
                    style={[
                      styles.vegSymbolBox,
                      { borderColor: selectedDishModal.isVeg ? '#16A34A' : '#DC2626' },
                    ]}
                  >
                    <View
                      style={[
                        styles.vegSymbolInner,
                        { backgroundColor: selectedDishModal.isVeg ? '#16A34A' : '#DC2626' },
                      ]}
                    />
                  </View>
                  {selectedDishModal.isBestseller && (
                    <View style={styles.bestsellerPill}>
                      <Flame size={10} color="#D97706" fill="#D97706" style={{ marginRight: 2 }} />
                      <Text style={styles.bestsellerPillText}>BESTSELLER</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  {selectedDishModal.name}
                </Text>

                <Text style={[styles.modalPrice, { color: theme.textPrimary }]}>
                  {formatCurrency(selectedDishModal.price)}
                </Text>

                <Text style={[styles.modalDescription, { color: theme.textSecondary }]}>
                  {selectedDishModal.description}
                </Text>

                <TouchableOpacity
                  style={[styles.modalAddBtn, { backgroundColor: '#16A34A' }]}
                  activeOpacity={0.85}
                  onPress={() => {
                    const mockProduct = {
                      id: selectedDishModal.id,
                      name: selectedDishModal.name,
                      category: 'food',
                      price: selectedDishModal.price,
                      originalPrice: selectedDishModal.originalPrice,
                      unit: '1 Portion',
                      image: selectedDishModal.image,
                      description: selectedDishModal.description,
                      inStock: true,
                    };
                    addItem(mockProduct, 1, {
                      id: restaurant.id,
                      name: restaurant.name,
                      type: 'food',
                      logo: restaurant.image,
                      deliveryFee: restaurant.deliveryFee,
                    });
                    setSelectedDishModal(null);
                  }}
                >
                  <Text style={styles.modalAddBtnText}>Add Item to Order</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* 🌟 11. FLOATING MINI-CART CHECKOUT BAR */}
      {cartCount > 0 && (
        <View
          style={[
            styles.floatingCartWrap,
            { bottom: Platform.OS === 'ios' ? insets.bottom + 12 : 18 },
          ]}
        >
          <TouchableOpacity
            style={styles.floatingCartPill}
            activeOpacity={0.9}
            onPress={() => router.push('/cart')}
          >
            <LinearGradient
              colors={['#15803D', '#16A34A', '#22C55E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.floatingCartGradient}
            >
              <View style={styles.floatingCartLeft}>
                <View style={styles.floatingCartBagIconWrap}>
                  <ShoppingBag size={18} color="#FFFFFF" />
                  <View style={styles.floatingCartCountBadge}>
                    <Text style={styles.floatingCartCountText}>{cartCount}</Text>
                  </View>
                </View>

                <View>
                  <Text style={styles.floatingCartTotalText}>
                    {formatCurrency(cartSubtotal)}
                  </Text>
                  <Text style={styles.floatingCartSubText}>
                    {cartCount} {cartCount === 1 ? 'item' : 'items'} from {restaurant.name}
                  </Text>
                </View>
              </View>

              <View style={styles.floatingCartRight}>
                <Text style={styles.floatingCartActionText}>View Cart</Text>
                <ArrowRight size={16} color="#FFFFFF" style={{ marginLeft: 4 }} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Store Conflict Modal */}
      <StoreConflictModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingHeaderBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
  },
  floatingActionCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  floatingHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartCountPill: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    paddingHorizontal: 2,
  },
  cartCountPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  scrollBody: {
    paddingTop: 0,
  },
  heroWrapper: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  heroCoverImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlayGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  profileCard: {
    marginHorizontal: Spacing.lg,
    marginTop: -30,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg + 2,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    zIndex: 10,
  },
  profileTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs + 2,
  },
  restaurantTitle: {
    fontSize: Typography.sizes.xl + 2,
    fontWeight: Typography.weights.bold,
    lineHeight: 28,
  },
  cuisinesText: {
    fontSize: Typography.sizes.xs + 1,
    marginTop: 3,
    fontWeight: '500',
  },
  ratingBadgeBox: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    minWidth: 56,
  },
  ratingBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBadgeText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.sm,
    fontWeight: '900',
  },
  ratingCountSub: {
    color: '#DCFCE7',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: Spacing.sm + 2,
    marginTop: Spacing.xs,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.semibold,
  },
  metricDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  liveOpenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },
  couponBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm + 2,
  },
  couponLeftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  couponText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  applyBtnPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  applyCouponAction: {
    fontSize: 11,
    fontWeight: '900',
    color: '#15803D',
  },
  searchSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  menuSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  menuSearchInput: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    height: '100%',
  },
  dietFilterScroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  dietChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: 8,
  },
  vegActiveChip: {
    backgroundColor: '#16A34A',
    borderColor: '#15803D',
  },
  nonVegActiveChip: {
    backgroundColor: '#DC2626',
    borderColor: '#B91C1C',
  },
  bestsellerActiveChip: {
    backgroundColor: '#D97706',
    borderColor: '#B45309',
  },
  vegIconSmall: {
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    borderRadius: 2,
  },
  innerVegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dietChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  categoryTabsScroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryPillActive: {
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryPillText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '700',
  },
  dishesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  dishesSectionTitle: {
    fontSize: Typography.sizes.md + 1,
    fontWeight: Typography.weights.bold,
  },
  dishesCountText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
  },
  dishesListContainer: {
    paddingHorizontal: Spacing.lg,
  },
  dishCard: {
    flexDirection: 'row',
    padding: Spacing.md + 2,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  dishDetailsCol: {
    flex: 1,
    paddingRight: Spacing.md,
    justifyContent: 'space-between',
  },
  dishTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  vegSymbolBox: {
    width: 15,
    height: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    borderRadius: 2,
  },
  vegSymbolInner: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  bestsellerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  bestsellerPillText: {
    color: '#D97706',
    fontSize: 9,
    fontWeight: '900',
  },
  dishTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    lineHeight: 20,
    marginVertical: 2,
  },
  dishPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 2,
  },
  dishPrice: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  dishOriginalPrice: {
    fontSize: Typography.sizes.xs + 1,
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  dishRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  dishRatingText: {
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 3,
  },
  dishRatingVotes: {
    fontSize: 10,
    marginLeft: 3,
  },
  dishDescription: {
    fontSize: Typography.sizes.xs,
    lineHeight: 18,
    marginTop: 4,
  },
  dishImageCol: {
    alignItems: 'center',
    width: 106,
  },
  dishFoodImage: {
    width: 106,
    height: 106,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#F1F5F9',
  },
  addBtnContainer: {
    marginTop: -16,
    zIndex: 10,
  },
  standaloneAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    ...Shadows.medium,
    minWidth: 84,
  },
  standaloneAddText: {
    color: '#16A34A',
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '900',
  },
  quantityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 3,
    ...Shadows.medium,
  },
  stepperTouch: {
    padding: 4,
  },
  quantityNumberText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: Typography.sizes.xs + 1,
    paddingHorizontal: 8,
    minWidth: 16,
    textAlign: 'center',
  },
  customisableHint: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyDishesBox: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  emptyDishesTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginBottom: 4,
  },
  emptyDishesSub: {
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  resetFiltersBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  resetFiltersBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  hygieneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  hygieneTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  hygieneSub: {
    fontSize: 9,
    marginTop: 2,
    lineHeight: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalContentCard: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: Spacing.xl,
  },
  modalHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignSelf: 'center',
    marginVertical: 8,
  },
  modalImage: {
    width: '100%',
    height: 200,
  },
  modalBody: {
    padding: Spacing.lg,
  },
  modalTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  modalPrice: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginVertical: 4,
  },
  modalDescription: {
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
    marginTop: 4,
    marginBottom: Spacing.lg,
  },
  modalAddBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  modalAddBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.md,
    fontWeight: '800',
  },
  floatingCartWrap: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 999,
  },
  floatingCartPill: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    ...Shadows.large,
  },
  floatingCartGradient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md + 2,
    paddingVertical: Spacing.sm + 2,
  },
  floatingCartLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  floatingCartBagIconWrap: {
    position: 'relative',
    marginRight: Spacing.sm,
  },
  floatingCartCountBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: '#FFFFFF',
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  floatingCartCountText: {
    color: '#15803D',
    fontSize: 9,
    fontWeight: '900',
  },
  floatingCartTotalText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  floatingCartSubText: {
    color: '#DCFCE7',
    fontSize: 10,
    fontWeight: '600',
  },
  floatingCartRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  floatingCartActionText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '800',
  },
});
