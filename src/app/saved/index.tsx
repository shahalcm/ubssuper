import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useCartStore } from '@/store/cartStore';
import { superAppService } from '@/services/repositories/superAppService';
import { Product, Restaurant } from '@/types';
import {
  ArrowLeft,
  Heart,
  Star,
  MapPin,
  Utensils,
  ShoppingBag,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SavedTab = 'all' | 'restaurants' | 'groceries';

export default function SavedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [activeTab, setActiveTab] = useState<SavedTab>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [allGroceries, setAllGroceries] = useState<Product[]>([]);

  const favoriteIds = useFavoritesStore((state) => state.favoriteIds);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [groceries, restaurants] = await Promise.all([
          superAppService.getGroceryProducts(),
          superAppService.getRestaurants(),
        ]);
        if (isMounted) {
          setAllGroceries(groceries || []);
          setAllRestaurants(restaurants || []);
        }
      } catch (err) {
        console.error('Failed to load saved items:', err);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  // Saved Restaurants
  const savedRestaurants = allRestaurants.filter((r) => isFavorite(r.id));
  // Saved Groceries
  const savedGroceries = allGroceries.filter((g) => isFavorite(g.id));

  const totalSavedCount = savedRestaurants.length + savedGroceries.length;

  // Recommended items if empty
  const recommendedRestaurants = allRestaurants.slice(0, 2);
  const recommendedGroceries = allGroceries.slice(0, 3);

  const handleAddGrocery = (product: Product) => {
    addItem(product, 1);
    showToast(`✓ Added ${product.name} to basket!`);
  };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* 🌟 HEADER */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.headerBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          activeOpacity={0.8}
        >
          <ArrowLeft size={19} color={theme.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            Saved & Wishlist
          </Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
            {totalSavedCount} Saved Favorites
          </Text>
        </View>

        <View style={[styles.superBadge, { backgroundColor: '#FEE2E2' }]}>
          <Heart size={12} color="#EF4444" fill="#EF4444" style={{ marginRight: 3 }} />
          <Text style={styles.superBadgeText}>{totalSavedCount}</Text>
        </View>
      </View>

      {/* 🌟 IN-APP TOAST */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <View style={styles.toastPill}>
            <Check size={14} color="#10B981" style={{ marginRight: 6 }} />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}

      {/* 🌟 SEGMENT TABS */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[
            styles.tabPill,
            activeTab === 'all' && [styles.tabPillActive, { backgroundColor: theme.primary }],
          ]}
          onPress={() => setActiveTab('all')}
        >
          <Text
            style={[
              styles.tabPillText,
              { color: activeTab === 'all' ? '#FFFFFF' : theme.textSecondary },
            ]}
          >
            All Saved ({totalSavedCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabPill,
            activeTab === 'restaurants' && [
              styles.tabPillActive,
              { backgroundColor: '#EA580C' },
            ],
          ]}
          onPress={() => setActiveTab('restaurants')}
        >
          <Text
            style={[
              styles.tabPillText,
              { color: activeTab === 'restaurants' ? '#FFFFFF' : theme.textSecondary },
            ]}
          >
            Restaurants ({savedRestaurants.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabPill,
            activeTab === 'groceries' && [
              styles.tabPillActive,
              { backgroundColor: '#16A34A' },
            ],
          ]}
          onPress={() => setActiveTab('groceries')}
        >
          <Text
            style={[
              styles.tabPillText,
              { color: activeTab === 'groceries' ? '#FFFFFF' : theme.textSecondary },
            ]}
          >
            Groceries ({savedGroceries.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🌟 SCROLL CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(Spacing.xxl, insets.bottom + 40) },
        ]}
      >
        {totalSavedCount > 0 ? (
          <>
            {/* 🌟 SAVED RESTAURANTS SECTION */}
            {(activeTab === 'all' || activeTab === 'restaurants') && savedRestaurants.length > 0 && (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionTitleRow}>
                    <Utensils size={15} color="#EA580C" style={{ marginRight: 6 }} />
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                      Saved Restaurants ({savedRestaurants.length})
                    </Text>
                  </View>
                </View>

                {savedRestaurants.map((res) => (
                  <TouchableOpacity
                    key={res.id}
                    style={[
                      styles.restaurantCard,
                      { backgroundColor: theme.card, borderColor: theme.border },
                      Shadows.small,
                    ]}
                    activeOpacity={0.88}
                    onPress={() => router.push(`/food/restaurant/${res.id}`)}
                  >
                    <Image source={{ uri: res.image }} style={styles.restaurantImg} resizeMode="cover" />

                    <View style={styles.restaurantBody}>
                      <View style={styles.resTitleRow}>
                        <Text style={[styles.resName, { color: theme.textPrimary }]} numberOfLines={1}>
                          {res.name}
                        </Text>
                        <TouchableOpacity
                          style={styles.heartBtn}
                          onPress={() => {
                            toggleFavorite(res.id);
                            showToast(`Removed ${res.name} from Saved`);
                          }}
                        >
                          <Heart size={16} color="#EF4444" fill="#EF4444" />
                        </TouchableOpacity>
                      </View>

                      <Text style={[styles.resCuisines, { color: theme.textSecondary }]} numberOfLines={1}>
                        {res.cuisines.join(' • ')}
                      </Text>

                      <View style={styles.resMetaRow}>
                        <View style={styles.ratingBadge}>
                          <Star size={11} color="#F59E0B" fill="#F59E0B" style={{ marginRight: 2 }} />
                          <Text style={styles.ratingBadgeText}>{res.rating}</Text>
                        </View>
                        <Text style={[styles.resDot, { color: theme.textMuted }]}>•</Text>
                        <Text style={[styles.resDistance, { color: theme.textSecondary }]}>{res.distance}</Text>
                        <Text style={[styles.resDot, { color: theme.textMuted }]}>•</Text>
                        <Text style={[styles.resTime, { color: theme.textSecondary }]}>{res.deliveryTime}</Text>
                      </View>

                      <View style={styles.resActionRow}>
                        <TouchableOpacity
                          style={[styles.viewMenuBtn, { backgroundColor: '#EA580C' }]}
                          onPress={() => router.push(`/food/restaurant/${res.id}`)}
                        >
                          <Text style={styles.viewMenuBtnText}>Order Food</Text>
                          <ArrowRight size={12} color="#FFFFFF" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* 🌟 SAVED GROCERIES SECTION */}
            {(activeTab === 'all' || activeTab === 'groceries') && savedGroceries.length > 0 && (
              <View style={styles.sectionBlock}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionTitleRow}>
                    <ShoppingBag size={15} color="#16A34A" style={{ marginRight: 6 }} />
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                      Saved Grocery Items ({savedGroceries.length})
                    </Text>
                  </View>
                </View>

                {savedGroceries.map((prod) => (
                  <TouchableOpacity
                    key={prod.id}
                    style={[
                      styles.groceryCard,
                      { backgroundColor: theme.card, borderColor: theme.border },
                      Shadows.small,
                    ]}
                    activeOpacity={0.88}
                    onPress={() => router.push(`/grocery/detail/${prod.id}`)}
                  >
                    <Image source={{ uri: prod.image }} style={styles.groceryImg} resizeMode="cover" />

                    <View style={styles.groceryBody}>
                      <View style={styles.resTitleRow}>
                        <Text style={[styles.groceryName, { color: theme.textPrimary }]} numberOfLines={1}>
                          {prod.name}
                        </Text>
                        <TouchableOpacity
                          style={styles.heartBtn}
                          onPress={() => {
                            toggleFavorite(prod.id);
                            showToast(`Removed ${prod.name} from Saved`);
                          }}
                        >
                          <Heart size={16} color="#EF4444" fill="#EF4444" />
                        </TouchableOpacity>
                      </View>

                      <Text style={[styles.groceryUnit, { color: theme.textSecondary }]}>
                        {prod.unit} • {prod.category}
                      </Text>

                      <View style={styles.groceryPriceRow}>
                        <Text style={[styles.groceryPrice, { color: theme.textPrimary }]}>
                          {formatCurrency(prod.price)}
                        </Text>
                        {prod.originalPrice && (
                          <Text style={[styles.groceryOrigPrice, { color: theme.textMuted }]}>
                            {formatCurrency(prod.originalPrice)}
                          </Text>
                        )}

                        <TouchableOpacity
                          style={[styles.addBtn, { backgroundColor: '#16A34A' }]}
                          activeOpacity={0.8}
                          onPress={() => handleAddGrocery(prod)}
                        >
                          <Plus size={14} color="#FFFFFF" style={{ marginRight: 2 }} />
                          <Text style={styles.addBtnText}>Add</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        ) : (
          /* 🌟 EMPTY STATE WITH SUGGESTIONS */
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyCircle, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}>
              <Heart size={36} color="#94A3B8" />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No Saved Items Yet
            </Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              Tap the heart icon on any restaurant, dish, or grocery product to save it here for quick access!
            </Text>

            {/* Suggestions to save */}
            <View style={styles.suggestionsCard}>
              <Text style={[styles.suggestionsHeading, { color: theme.textPrimary }]}>
                Trending Spots to Save:
              </Text>

              {recommendedRestaurants.map((r) => (
                <View
                  key={r.id}
                  style={[styles.suggestRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.suggestTitle, { color: theme.textPrimary }]}>{r.name}</Text>
                    <Text style={[styles.suggestSub, { color: theme.textSecondary }]}>{r.cuisines.join(', ')}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.quickSaveBtn, { backgroundColor: '#FEE2E2' }]}
                    onPress={() => {
                      toggleFavorite(r.id);
                      showToast(`❤️ Saved ${r.name} to Favorites!`);
                    }}
                  >
                    <Heart size={14} color="#EF4444" fill="#EF4444" style={{ marginRight: 4 }} />
                    <Text style={styles.quickSaveText}>Save</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
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
  headerSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  superBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  superBadgeText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '800',
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
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
  },
  tabPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    marginRight: 8,
  },
  tabPillActive: {
    ...Shadows.small,
  },
  tabPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  sectionBlock: {
    marginBottom: Spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs + 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  restaurantCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.sm + 4,
  },
  restaurantImg: {
    width: 100,
    height: 105,
  },
  restaurantBody: {
    flex: 1,
    padding: Spacing.sm + 2,
    justifyContent: 'space-between',
  },
  resTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resName: {
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
    marginRight: 6,
  },
  heartBtn: {
    padding: 4,
  },
  resCuisines: {
    fontSize: 11,
    marginTop: 1,
  },
  resMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  ratingBadgeText: {
    color: '#92400E',
    fontSize: 10,
    fontWeight: '800',
  },
  resDot: {
    marginHorizontal: 4,
    fontSize: 10,
  },
  resDistance: {
    fontSize: 11,
  },
  resTime: {
    fontSize: 11,
  },
  resActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  viewMenuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  viewMenuBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  groceryCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.sm + 4,
    alignItems: 'center',
  },
  groceryImg: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    margin: 8,
  },
  groceryBody: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingRight: Spacing.sm + 2,
  },
  groceryName: {
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  groceryUnit: {
    fontSize: 11,
    marginTop: 2,
  },
  groceryPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  groceryPrice: {
    fontSize: 14,
    fontWeight: '800',
  },
  groceryOrigPrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
    marginLeft: 6,
    flex: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    marginLeft: 'auto',
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
    paddingHorizontal: Spacing.xl,
  },
  suggestionsCard: {
    width: '100%',
    marginTop: Spacing.xl,
  },
  suggestionsHeading: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: Spacing.xs + 2,
  },
  suggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: 8,
  },
  suggestTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  suggestSub: {
    fontSize: 11,
    marginTop: 2,
  },
  quickSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  quickSaveText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '800',
  },
});
