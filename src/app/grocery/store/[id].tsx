// src/app/grocery/store/[id].tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { useCartStore } from '@/store/cartStore';
import { StoreConflictModal } from '@/components/modals/StoreConflictModal';
import { superAppService } from '@/services/repositories/superAppService';
import { Store, Product } from '@/types';
import {
  ArrowLeft,
  Share2,
  Search,
  X,
  Star,
  Clock,
  MapPin,
  Bike,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Images,
  Phone,
  Mail,
} from 'lucide-react-native';
import { openDialer, openEmail, UBS_OFFICIAL_CONTACT } from '@/utils/contact';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function GroceryStoreDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const storeId = (params.id as string) || 'partner-1';

  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Cart store
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const cartCount = useCartStore((state) => state.getItemCount());
  const cartSubtotal = useCartStore((state) => state.getSubtotal());
  const currentCartStoreId = useCartStore((state) => state.storeId);

  useEffect(() => {
    loadStoreData();
  }, [storeId]);

  const loadStoreData = async () => {
    try {
      setLoading(true);
      const storeData = await superAppService.getStoreById(storeId);
      const storeProducts = await superAppService.getStoreProducts(storeId);

      if (storeData) {
        setStore(storeData);
      } else {
        // Fallback default store
        setStore({
          id: storeId,
          name: 'FreshBasket Supermarket Flagship',
          category: 'grocery',
          logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
          coverImage: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
          galleryImages: [
            'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
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
          storeDescription: 'Premier neighborhood supermarket offering fresh organic produce, farm dairy, and 20-minute express doorstep delivery.',
        });
      }

      setProducts(storeProducts);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!store) return;
    try {
      await Share.share({
        message: `Order fresh groceries from ${store.name} on UBS Super! Rapid doorstep delivery in ${store.deliveryTime}.`,
      });
    } catch {
      // Ignored
    }
  };

  // Distinct categories available in this store
  const storeCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  // Filtered products strictly for this store
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const getItemQuantityInCart = (productId: string) => {
    const item = cartItems.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (product: Product) => {
    if (!store) return;
    addItem(product, 1, {
      id: store.id,
      name: store.name,
      type: 'grocery',
      logo: store.logo,
      deliveryFee: store.deliveryFee,
    });
  };

  if (loading || !store) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading store catalog...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isCurrentStoreInCart = currentCartStoreId === store.id;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Top Floating Navigation Header */}
      <View style={styles.topNavRow}>
        <TouchableOpacity
          style={styles.navCircleBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.topNavActions}>
          <TouchableOpacity
            style={styles.navCircleBtn}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Share2 size={18} color="#1E293B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navCircleBtn, cartCount > 0 && styles.navCartActive]}
            onPress={() => router.push('/cart' as any)}
            activeOpacity={0.8}
          >
            <ShoppingBag size={18} color={cartCount > 0 ? '#FFFFFF' : '#1E293B'} />
            {cartCount > 0 && (
              <View style={styles.navCartBadge}>
                <Text style={styles.navCartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Cover Photo Hero Banner */}
        <View style={styles.heroBannerContainer}>
          <Image
            source={{ uri: store.coverImage || store.logo }}
            style={styles.heroCoverImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
            style={styles.heroGradient}
          />

          <View style={styles.heroBadgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: store.isOpen ? '#16A34A' : '#DC2626' }]}>
              <View style={[styles.statusDot, { backgroundColor: store.isOpen ? '#86EFAC' : '#FCA5A5' }]} />
              <Text style={styles.statusText}>{store.isOpen ? 'OPEN FOR ORDERS' : 'STORE CLOSED'}</Text>
            </View>

            {store.deliveryFee === 0 && (
              <View style={styles.freeDelBadge}>
                <Sparkles size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
                <Text style={styles.freeDelText}>FREE DELIVERY</Text>
              </View>
            )}
          </View>
        </View>

        {/* Store Profile Card */}
        <View style={[styles.storeInfoCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadows.medium]}>
          <View style={styles.storeHeaderRow}>
            {store.logo && (
              <Image source={{ uri: store.logo }} style={styles.storeLogo} resizeMode="cover" />
            )}
            <View style={styles.storeTitleWrapper}>
              <Text style={[styles.storeTitle, { color: theme.textPrimary }]} numberOfLines={2}>
                {store.name}
              </Text>
              <Text style={[styles.storeSubtitle, { color: theme.textSecondary }]}>
                {store.address ? `${store.address}, ${store.city}` : store.city}
              </Text>
            </View>

            <View style={styles.ratingBadge}>
              <Star size={14} color="#EAB308" fill="#EAB308" />
              <Text style={styles.ratingText}>{Number(store.rating || 4.8).toFixed(1)}</Text>
              <Text style={styles.ratingSub}>({store.ratingCount || 120}+)</Text>
            </View>
          </View>

          {store.storeDescription ? (
            <Text style={[styles.storeDescription, { color: theme.textSecondary }]}>
              {store.storeDescription}
            </Text>
          ) : null}

          {/* Operational Metrics Pills */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Clock size={14} color="#16A34A" />
              <Text style={styles.metricVal}>{store.deliveryTime || '20-25 mins'}</Text>
            </View>

            <Text style={styles.metricDot}>•</Text>

            <View style={styles.metricItem}>
              <MapPin size={14} color="#16A34A" />
              <Text style={styles.metricVal}>{store.distanceFormatted || '1.2 km'}</Text>
            </View>

            <Text style={styles.metricDot}>•</Text>

            <View style={styles.metricItem}>
              <Bike size={14} color="#16A34A" />
              <Text style={[styles.metricVal, store.deliveryFee === 0 && { color: '#16A34A', fontWeight: '700' }]}>
                {store.deliveryFee === 0 ? 'Free Delivery' : `₹${store.deliveryFee} Fee`}
              </Text>
            </View>

            {store.minOrderAmount > 0 && (
              <>
                <Text style={styles.metricDot}>•</Text>
                <View style={styles.metricItem}>
                  <CheckCircle size={14} color="#64748B" />
                  <Text style={styles.metricVal}>Min ₹{store.minOrderAmount}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Contact Store Customer Care Section */}
        {(() => {
          const isStoreCareCustom = !!(
            store.customerCare &&
            ((store.customerCare.phoneNumber && store.customerCare.phoneNumber.trim().length > 0) ||
              (store.customerCare.email && store.customerCare.email.trim().length > 0))
          );
          const storePhone = isStoreCareCustom && store.customerCare?.phoneNumber
            ? `${store.customerCare.phoneCountryCode || '+91'} ${store.customerCare.phoneNumber}`
            : UBS_OFFICIAL_CONTACT.phone;
          const storeEmail = isStoreCareCustom && store.customerCare?.email
            ? store.customerCare.email
            : UBS_OFFICIAL_CONTACT.email;

          return (
            <View style={[styles.contactStoreCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.contactStoreHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Phone size={15} color="#16A34A" />
                  <Text style={[styles.contactStoreHeading, { color: theme.textPrimary }]}>
                    Contact Store
                  </Text>
                </View>
                <View style={[styles.contactCareBadge, { backgroundColor: isStoreCareCustom ? '#DCFCE7' : '#EFF6FF' }]}>
                  <Text style={[styles.contactCareBadgeText, { color: isStoreCareCustom ? '#15803D' : '#1D4ED8' }]}>
                    {isStoreCareCustom ? 'Verified Store Support' : 'UBS Customer Care Fallback'}
                  </Text>
                </View>
              </View>

              <View style={styles.contactStoreButtonsRow}>
                {/* Clickable Phone Number */}
                <TouchableOpacity
                  style={[styles.contactStoreBtn, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}
                  onPress={() => openDialer(storePhone)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.contactBtnIconWrap, { backgroundColor: '#DCFCE7' }]}>
                    <Phone size={14} color="#16A34A" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactBtnLabel}>Store Phone</Text>
                    <Text style={styles.contactBtnValue} numberOfLines={1}>{storePhone}</Text>
                  </View>
                </TouchableOpacity>

                {/* Clickable Email Address */}
                <TouchableOpacity
                  style={[styles.contactStoreBtn, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
                  onPress={() => openEmail(storeEmail, `Customer inquiry regarding ${store.name}`)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.contactBtnIconWrap, { backgroundColor: '#DBEAFE' }]}>
                    <Mail size={14} color="#2563EB" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactBtnLabel}>Store Email</Text>
                    <Text style={styles.contactBtnValue} numberOfLines={1}>{storeEmail}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          );
        })()}

        {/* Store Photo Gallery Carousel (If photos uploaded by partner) */}
        {store.galleryImages && store.galleryImages.length > 0 && (
          <View style={styles.gallerySection}>
            <View style={styles.galleryHeader}>
              <Images size={16} color="#16A34A" style={{ marginRight: 6 }} />
              <Text style={[styles.galleryTitle, { color: theme.textPrimary }]}>
                Store Photos & Aisles ({store.galleryImages.length})
              </Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleryScroll}
            >
              {store.galleryImages.map((img, idx) => (
                <View key={`store-gallery-${idx}`} style={styles.galleryImageCard}>
                  <Image source={{ uri: img }} style={styles.galleryImage} resizeMode="cover" />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* In-Store Search Bar */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Search size={18} color="#94A3B8" style={{ marginRight: 10 }} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search products in ${store.name}...`}
              placeholderTextColor="#94A3B8"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Store Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {storeCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryPill,
                  isSelected
                    ? { backgroundColor: '#16A34A', borderColor: '#16A34A' }
                    : { backgroundColor: theme.card, borderColor: theme.border },
                ]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    isSelected ? { color: '#FFFFFF', fontWeight: '700' } : { color: theme.textSecondary },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Isolated Store Product Catalog */}
        <View style={styles.catalogSection}>
          <View style={styles.catalogHeader}>
            <Text style={[styles.catalogTitle, { color: theme.textPrimary }]}>
              {selectedCategory === 'All' ? 'All Store Products' : selectedCategory}
            </Text>
            <Text style={[styles.catalogCount, { color: theme.textSecondary }]}>
              {filteredProducts.length} items available
            </Text>
          </View>

          {filteredProducts.length > 0 ? (
            <View style={styles.productGrid}>
              {filteredProducts.map((product) => {
                const qtyInCart = getItemQuantityInCart(product.id);
                return (
                  <View
                    key={product.id}
                    style={[
                      styles.productCard,
                      { backgroundColor: theme.card, borderColor: theme.border },
                      Shadows.small,
                    ]}
                  >
                    {/* Image with discount badge */}
                    <View style={styles.productImgContainer}>
                      <Image source={{ uri: product.image }} style={styles.productImg} resizeMode="cover" />
                      {product.discountPercentage && product.discountPercentage > 0 ? (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>{product.discountPercentage}% OFF</Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Product Body */}
                    <View style={styles.productBody}>
                      <Text style={[styles.productName, { color: theme.textPrimary }]} numberOfLines={2}>
                        {product.name}
                      </Text>
                      <Text style={[styles.productUnit, { color: theme.textSecondary }]}>
                        {product.unit || '1 unit'}
                      </Text>

                      {/* Pricing Row */}
                      <View style={styles.priceRow}>
                        <Text style={[styles.sellingPrice, { color: theme.textPrimary }]}>
                          {formatCurrency(product.price)}
                        </Text>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <Text style={styles.originalPrice}>
                            {formatCurrency(product.originalPrice)}
                          </Text>
                        )}
                      </View>

                      {/* Quantity Stepper / Add Button */}
                      <View style={styles.addBtnContainer}>
                        {qtyInCart > 0 ? (
                          <View style={styles.stepperRow}>
                            <TouchableOpacity
                              style={styles.stepBtn}
                              onPress={() => updateQuantity(product.id, qtyInCart - 1)}
                            >
                              <Minus size={14} color="#16A34A" />
                            </TouchableOpacity>
                            <Text style={styles.stepQty}>{qtyInCart}</Text>
                            <TouchableOpacity
                              style={styles.stepBtn}
                              onPress={() => updateQuantity(product.id, qtyInCart + 1)}
                            >
                              <Plus size={14} color="#16A34A" />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={[
                              styles.addBtn,
                              !product.inStock && styles.outOfStockBtn,
                            ]}
                            disabled={!product.inStock}
                            onPress={() => handleAddToCart(product)}
                            activeOpacity={0.8}
                          >
                            <Plus size={14} color={product.inStock ? '#16A34A' : '#94A3B8'} style={{ marginRight: 4 }} />
                            <Text style={[styles.addBtnText, !product.inStock && { color: '#94A3B8' }]}>
                              {product.inStock ? 'ADD' : 'OUT OF STOCK'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <ShoppingBag size={42} color="#CBD5E1" />
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                No Products Found
              </Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                Try searching for another item or choose a different category.
              </Text>
            </View>
          )}
        </View>
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
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} in cart
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

      {/* Store Conflict Modal Component */}
      <StoreConflictModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  topNavRow: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 12,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topNavActions: {
    flexDirection: 'row',
    gap: 10,
  },
  navCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  navCartActive: {
    backgroundColor: '#16A34A',
  },
  navCartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EA580C',
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  scrollContent: {
    paddingBottom: 110,
  },
  heroBannerContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  heroCoverImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroBadgeRow: {
    position: 'absolute',
    bottom: 12,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  freeDelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  freeDelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  storeInfoCard: {
    marginHorizontal: Spacing.md,
    marginTop: -20,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    zIndex: 10,
  },
  storeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeLogo: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  storeTitleWrapper: {
    flex: 1,
    marginLeft: 12,
  },
  storeTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  storeSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  ratingBadge: {
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#854D0E',
  },
  ratingSub: {
    fontSize: 10,
    color: '#A16207',
  },
  storeDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexWrap: 'wrap',
    gap: 6,
  },
  contactStoreCard: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  contactStoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  contactStoreHeading: {
    fontSize: 14,
    fontWeight: '800',
  },
  contactCareBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  contactCareBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  contactStoreButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  contactStoreBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  contactBtnIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactBtnLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  contactBtnValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  metricDot: {
    color: '#CBD5E1',
    fontSize: 10,
  },
  gallerySection: {
    marginTop: Spacing.lg,
  },
  galleryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: 8,
  },
  galleryTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  galleryScroll: {
    paddingHorizontal: Spacing.md,
    gap: 10,
  },
  galleryImageCard: {
    width: 140,
    height: 94,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  searchSection: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
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
  categoryScroll: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 13,
  },
  catalogSection: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
  },
  catalogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  catalogTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  catalogCount: {
    fontSize: 12,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productCard: {
    width: (SCREEN_WIDTH - Spacing.md * 2 - 12) / 2,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
  },
  productImgContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  productImg: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#16A34A',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  productBody: {
    padding: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    height: 36,
  },
  productUnit: {
    fontSize: 11,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  sellingPrice: {
    fontSize: 14,
    fontWeight: '800',
  },
  originalPrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  addBtnContainer: {
    marginTop: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingVertical: 6,
    borderRadius: 6,
  },
  outOfStockBtn: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  stepBtn: {
    padding: 4,
  },
  stepQty: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16A34A',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
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
