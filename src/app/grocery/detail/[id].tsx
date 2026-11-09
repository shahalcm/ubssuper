import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Share,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useLocationStore } from '@/store/locationStore';
import { superAppService } from '@/services/repositories/superAppService';
import { ProductCard } from '@/components/cards/ProductCard';
import { Rating } from '@/components/ui/Rating';
import { Product } from '@/types';
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  ShieldCheck,
  Zap,
  Heart,
  Share2,
  Clock,
  Sparkles,
  Truck,
  CheckCircle2,
  RotateCcw,
  Leaf,
  Check,
  MapPin,
  Star,
  ThumbsUp,
  ArrowRight,
  Camera,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ProductVariant {
  id: string;
  name: string;
  unit: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  badge?: string;
}

interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  date: string;
  verified: boolean;
  comment: string;
  helpfulCount: number;
}

const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    name: 'Aswin Kumar',
    rating: 5,
    date: 'Today, 11:20 AM',
    verified: true,
    comment: 'Arrived in just 11 minutes in Manjeri! Perfectly chilled, super fresh and crisp. Quality is noticeably superior to local open stalls.',
    helpfulCount: 24,
  },
  {
    id: 'rev-2',
    name: 'Fathima Zahra',
    rating: 5,
    date: 'Yesterday',
    verified: true,
    comment: 'The cold chain packaging is genuinely impressive. Freshness and hygienic sealing are 10/10. Will definitely order again!',
    helpfulCount: 18,
  },
  {
    id: 'rev-3',
    name: 'Dr. Rahul Menon',
    rating: 4,
    date: '3 days ago',
    verified: true,
    comment: 'Great organic produce at transparent prices. Delivery rider was courteous and placed the delivery contactless as instructed.',
    helpfulCount: 12,
  },
];

export default function ProductDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const productId = params.id as string;

  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        let p = await superAppService.getGroceryProductById(productId);
        if (!p) {
          const all = await superAppService.getGroceryProducts();
          p = all.find((item: any) => item.id === productId) || null;
        }
        if (isMounted) {
          setProduct(p);
          if (p) {
            const sim = await superAppService.getGroceryProducts(p.category);
            if (isMounted) {
              setSimilarProducts(sim.filter((item: any) => item.id !== p.id).slice(0, 4));
            }
          }
        }
      } catch (err) {
        console.error('Failed to load grocery product:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const cartItems = useCartStore((state) => state.items);
  const cartCount = useCartStore((state) => state.getItemCount());
  const cartTotal = useCartStore((state) => state.getTotalAmount());
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const isFav = useFavoritesStore((state) => (product ? state.isFavorite(product.id) : false));
  const toggleFav = useFavoritesStore((state) => state.toggleFavorite);

  const currentAddress = useLocationStore((state) => state.currentAddress);

  // 🌟 Gallery and Active Image State
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // 🌟 Selected Pack Variant State
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  // 🌟 Toast Feedback Banner State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color="#16A34A" />
        <Text style={{ marginTop: Spacing.md, color: theme.textSecondary, fontSize: 14 }}>
          Loading fresh product details...
        </Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            justifyContent: 'center',
            alignItems: 'center',
            padding: Spacing.xl,
          },
        ]}
      >
        <ShoppingBag size={48} color={theme.textMuted} style={{ marginBottom: Spacing.md }} />
        <Text
          style={{
            fontSize: Typography.sizes.lg,
            fontWeight: '700',
            color: theme.textPrimary,
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          Product Not Found
        </Text>
        <Text
          style={{
            fontSize: Typography.sizes.sm,
            color: theme.textSecondary,
            marginBottom: Spacing.xl,
            textAlign: 'center',
          }}
        >
          No products available right now. This item may have been moved or is currently out of stock.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ backgroundColor: '#16A34A', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Back to Products</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 🌟 Generate Dynamic Variants based on Product Unit & Price
  const getProductVariants = (prod: Product): ProductVariant[] => {
    const basePrice = prod.price;
    const baseUnit = prod.unit || '1 Unit';
    const origPrice = prod.originalPrice || Math.round(basePrice * 1.25);

    if (baseUnit.toLowerCase().includes('kg')) {
      return [
        {
          id: 'var-1',
          name: 'Standard',
          unit: '1 kg',
          price: basePrice,
          originalPrice: origPrice,
          discountPercentage: Math.round(((origPrice - basePrice) / origPrice) * 100),
        },
        {
          id: 'var-2',
          name: 'Family Pack',
          unit: '2 kg',
          price: Math.round(basePrice * 1.9),
          originalPrice: Math.round(origPrice * 2),
          discountPercentage: Math.round((((origPrice * 2) - Math.round(basePrice * 1.9)) / (origPrice * 2)) * 100),
          badge: 'SAVE 10%',
        },
        {
          id: 'var-3',
          name: 'Bulk Saver',
          unit: '5 kg',
          price: Math.round(basePrice * 4.5),
          originalPrice: Math.round(origPrice * 5),
          discountPercentage: Math.round((((origPrice * 5) - Math.round(basePrice * 4.5)) / (origPrice * 5)) * 100),
          badge: 'BEST VALUE',
        },
      ];
    } else if (baseUnit.toLowerCase().includes('500g') || baseUnit.toLowerCase().includes('500 g')) {
      return [
        {
          id: 'var-1',
          name: 'Standard',
          unit: '500 g',
          price: basePrice,
          originalPrice: origPrice,
          discountPercentage: Math.round(((origPrice - basePrice) / origPrice) * 100),
        },
        {
          id: 'var-2',
          name: 'Value Pack',
          unit: '1 kg',
          price: Math.round(basePrice * 1.88),
          originalPrice: Math.round(origPrice * 2),
          discountPercentage: Math.round((((origPrice * 2) - Math.round(basePrice * 1.88)) / (origPrice * 2)) * 100),
          badge: 'SAVE 12%',
        },
        {
          id: 'var-3',
          name: 'Family Pack',
          unit: '2 kg',
          price: Math.round(basePrice * 3.6),
          originalPrice: Math.round(origPrice * 4),
          discountPercentage: Math.round((((origPrice * 4) - Math.round(basePrice * 3.6)) / (origPrice * 4)) * 100),
          badge: 'BEST VALUE',
        },
      ];
    } else if (baseUnit.toLowerCase().includes('l') || baseUnit.toLowerCase().includes('litre') || baseUnit.toLowerCase().includes('liter')) {
      return [
        {
          id: 'var-1',
          name: 'Regular',
          unit: '1 L',
          price: basePrice,
          originalPrice: origPrice,
          discountPercentage: Math.round(((origPrice - basePrice) / origPrice) * 100),
        },
        {
          id: 'var-2',
          name: 'Twin Pack',
          unit: '2 L (2 × 1L)',
          price: Math.round(basePrice * 1.92),
          originalPrice: Math.round(origPrice * 2),
          discountPercentage: Math.round((((origPrice * 2) - Math.round(basePrice * 1.92)) / (origPrice * 2)) * 100),
          badge: 'SAVE ₹8',
        },
        {
          id: 'var-3',
          name: 'Weekly Saver',
          unit: '5 L Can',
          price: Math.round(basePrice * 4.6),
          originalPrice: Math.round(origPrice * 5),
          discountPercentage: Math.round((((origPrice * 5) - Math.round(basePrice * 4.6)) / (origPrice * 5)) * 100),
          badge: 'BEST VALUE',
        },
      ];
    } else {
      return [
        {
          id: 'var-1',
          name: 'Single Unit',
          unit: baseUnit,
          price: basePrice,
          originalPrice: origPrice,
          discountPercentage: Math.round(((origPrice - basePrice) / origPrice) * 100),
        },
        {
          id: 'var-2',
          name: 'Pack of 2',
          unit: `2 × ${baseUnit}`,
          price: Math.round(basePrice * 1.9),
          originalPrice: Math.round(origPrice * 2),
          discountPercentage: Math.round((((origPrice * 2) - Math.round(basePrice * 1.9)) / (origPrice * 2)) * 100),
          badge: 'SAVE 10%',
        },
        {
          id: 'var-3',
          name: 'Super Saver',
          unit: `4 × ${baseUnit}`,
          price: Math.round(basePrice * 3.65),
          originalPrice: Math.round(origPrice * 4),
          discountPercentage: Math.round((((origPrice * 4) - Math.round(basePrice * 3.65)) / (origPrice * 4)) * 100),
          badge: 'POPULAR',
        },
      ];
    }
  };

  const variants = getProductVariants(product);
  const currentVariant = variants[selectedVariantIndex] || variants[0];

  // Unique product identifier for current variant
  const activeProductId =
    selectedVariantIndex === 0 ? product.id : `${product.id}-v${selectedVariantIndex}`;

  const cartItem = cartItems.find((i) => i.product.id === activeProductId);
  const quantity = cartItem ? cartItem.quantity : 0;

  const currentPrice = currentVariant.price;
  const currentOrigPrice = currentVariant.originalPrice;
  const currentSavings =
    currentOrigPrice && currentOrigPrice > currentPrice
      ? currentOrigPrice - currentPrice
      : 0;

  // 🌟 Construct 3 Multi-Angle Gallery Images
  const getGalleryImages = (prod: Product): string[] => {
    const list = [prod.image];
    const cat = prod.category.toLowerCase();
    if (cat.includes('fruit') || cat.includes('veg')) {
      list.push('https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80');
      list.push('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80');
    } else if (cat.includes('dairy') || cat.includes('egg')) {
      list.push('https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?auto=format&fit=crop&w=600&q=80');
      list.push('https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=600&q=80');
    } else if (cat.includes('bakery')) {
      list.push('https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80');
      list.push('https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=80');
    } else {
      list.push('https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80');
      list.push('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80');
    }
    return list;
  };

  const galleryImages = getGalleryImages(product);

  // 🌟 Nutrition Facts based on category
  const getNutritionFacts = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('fruit') || cat.includes('veg')) {
      return [
        { label: 'Energy', value: '34 kcal', highlight: false },
        { label: 'Protein', value: '1.2 g', highlight: false },
        { label: 'Carbs', value: '7.8 g', highlight: false },
        { label: 'Dietary Fiber', value: '2.6 g', highlight: true },
        { label: 'Vitamin C', value: '28% RDA', highlight: true },
        { label: 'Natural Sugars', value: '3.9 g', highlight: false },
      ];
    } else if (cat.includes('dairy') || cat.includes('egg')) {
      return [
        { label: 'Energy', value: '62 kcal', highlight: false },
        { label: 'Protein', value: '3.6 g', highlight: true },
        { label: 'Calcium', value: '130 mg', highlight: true },
        { label: 'Healthy Fats', value: '3.4 g', highlight: false },
        { label: 'Carbs', value: '4.8 g', highlight: false },
        { label: 'Vitamin D', value: '18% RDA', highlight: true },
      ];
    } else if (cat.includes('bakery')) {
      return [
        { label: 'Energy', value: '265 kcal', highlight: false },
        { label: 'Carbohydrates', value: '48 g', highlight: false },
        { label: 'Protein', value: '8.4 g', highlight: true },
        { label: 'Dietary Fiber', value: '4.2 g', highlight: true },
        { label: 'Total Fats', value: '3.1 g', highlight: false },
        { label: 'Iron', value: '14% RDA', highlight: false },
      ];
    } else {
      return [
        { label: 'Energy', value: '120 kcal', highlight: false },
        { label: 'Protein', value: '4.2 g', highlight: true },
        { label: 'Carbohydrates', value: '18 g', highlight: false },
        { label: 'Dietary Fiber', value: '2.8 g', highlight: false },
        { label: 'Healthy Fats', value: '3.5 g', highlight: false },
        { label: 'Sodium', value: '85 mg', highlight: false },
      ];
    }
  };

  const nutritionFacts = getNutritionFacts(product.category);

  // 🌟 Add & Quantity Handlers
  const handleAddToCart = () => {
    const productToAdd: Product = {
      ...product,
      id: activeProductId,
      name:
        selectedVariantIndex === 0
          ? product.name
          : `${product.name} (${currentVariant.unit})`,
      unit: currentVariant.unit,
      price: currentVariant.price,
      originalPrice: currentVariant.originalPrice,
      discountPercentage: currentVariant.discountPercentage,
    };
    addItem(productToAdd, 1);
    showToast(`✓ Added ${currentVariant.unit} to Basket`);
  };

  const handlePlus = () => {
    updateQuantity(activeProductId, quantity + 1);
  };

  const handleMinus = () => {
    if (quantity > 0) {
      updateQuantity(activeProductId, quantity - 1);
    }
  };

  // 🌟 Share Handler
  const handleShare = async () => {
    try {
      await Share.share({
        title: product.name,
        message: `Order ${product.name} (${currentVariant.unit}) on UBS Super for only ${formatCurrency(
          currentVariant.price
        )}! Superfast 12-15 min express delivery in Manjeri: https://ubssuper.app/grocery/${product.id}`,
      });
    } catch (e) {
      // User dismissed share
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 🌟 FLOATING HEADER */}
      <View
        style={[
          styles.floatingHeader,
          {
            paddingTop: Math.max(Spacing.sm, insets.top + 6),
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={[
            styles.headerCircleBtn,
            {
              backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.92)',
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
            },
          ]}
          activeOpacity={0.8}
        >
          <ArrowLeft size={19} color={theme.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerRightRow}>
          <TouchableOpacity
            style={[
              styles.headerCircleBtn,
              {
                backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.92)',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                marginRight: 8,
              },
            ]}
            activeOpacity={0.8}
            onPress={handleShare}
          >
            <Share2 size={17} color={theme.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.headerCircleBtn,
              {
                backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.92)',
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                marginRight: 8,
              },
            ]}
            activeOpacity={0.8}
            onPress={() => {
              toggleFav(product.id);
              showToast(isFav ? 'Removed from Wishlist' : '❤️ Saved to Wishlist');
            }}
          >
            <Heart
              size={18}
              color={isFav ? '#EF4444' : theme.textPrimary}
              fill={isFav ? '#EF4444' : 'transparent'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerCartPill, { backgroundColor: '#16A34A' }]}
            activeOpacity={0.85}
            onPress={() => router.push('/cart')}
          >
            <ShoppingBag size={17} color="#FFFFFF" />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 🌟 IN-APP TOAST NOTIFICATION */}
      {toastMessage && (
        <View style={[styles.toastContainer, { top: insets.top + 54 }]}>
          <View style={styles.toastPill}>
            <CheckCircle2 size={15} color="#10B981" style={{ marginRight: 6 }} />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        </View>
      )}

      {/* 🌟 SCROLLABLE CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 125 }]}
      >
        {/* 🌟 HERO PRODUCT GALLERY */}
        <View
          style={[
            styles.heroWrapper,
            {
              backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
              paddingTop: insets.top + 48,
            },
          ]}
        >
          <Image
            source={{ uri: galleryImages[activeImageIndex] }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Top Badges on Hero */}
          <View style={[styles.heroBadgesRow, { top: insets.top + 56 }]}>
            {currentVariant.discountPercentage ? (
              <View style={[styles.discountBadge, { backgroundColor: '#EF4444' }]}>
                <Text style={styles.discountText}>{currentVariant.discountPercentage}% OFF</Text>
              </View>
            ) : null}

            {product.isOrganic && (
              <View style={[styles.organicBadge, { backgroundColor: '#10B981' }]}>
                <Leaf size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
                <Text style={styles.organicText}>100% ORGANIC</Text>
              </View>
            )}
          </View>

          {/* Bottom Express Pill */}
          <View style={styles.heroEtaPill}>
            <Zap size={13} color="#F59E0B" fill="#F59E0B" style={{ marginRight: 4 }} />
            <Text style={styles.heroEtaText}>⚡ 12-15 Mins Express Delivery</Text>
          </View>

          {/* Photo Angle Counter */}
          <View style={styles.heroCounterPill}>
            <Camera size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.heroCounterText}>
              {activeImageIndex + 1}/{galleryImages.length}
            </Text>
          </View>
        </View>

        {/* 🌟 THUMBNAIL SELECTOR STRIP */}
        <View style={[styles.thumbnailStrip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {galleryImages.map((imgUri, index) => {
            const isActive = activeImageIndex === index;
            return (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => setActiveImageIndex(index)}
                style={[
                  styles.thumbnailBtn,
                  {
                    borderColor: isActive ? '#16A34A' : theme.border,
                    borderWidth: isActive ? 2.5 : 1,
                  },
                ]}
              >
                <Image source={{ uri: imgUri }} style={styles.thumbnailImg} resizeMode="cover" />
              </TouchableOpacity>
            );
          })}
          <View style={styles.thumbnailHint}>
            <Text style={[styles.thumbnailHintText, { color: theme.textSecondary }]}>
              Tap to inspect fresh angles & quality seals
            </Text>
          </View>
        </View>

        {/* 🌟 MAIN PRODUCT BODY */}
        <View style={styles.content}>
          {/* Category & Verified Harvest Row */}
          <View style={styles.metaRow}>
            <View style={[styles.categoryBadge, { backgroundColor: isDarkMode ? '#14532D30' : '#DCFCE7' }]}>
              <Text style={styles.categoryBadgeText}>{product.category}</Text>
            </View>
            <View style={styles.verifiedRow}>
              <CheckCircle2 size={13} color="#16A34A" style={{ marginRight: 4 }} />
              <Text style={styles.verifiedText}>Darkstore Verified Harvest</Text>
            </View>
          </View>

          {/* Product Title */}
          <Text style={[styles.title, { color: theme.textPrimary }]}>{product.name}</Text>

          {/* Rating & Review Counter */}
          <View style={styles.ratingSection}>
            <Rating rating={product.rating || 4.8} count={product.ratingCount || 340} showBadge size={14} />
            <View style={[styles.ratingTagPill, { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' }]}>
              <Text style={[styles.ratingTagText, { color: theme.textSecondary }]}>
                #1 Best Seller in Manjeri
              </Text>
            </View>
          </View>

          {/* Price & Savings Display */}
          <View style={styles.priceRow}>
            <View style={styles.priceLeft}>
              <Text style={[styles.price, { color: theme.textPrimary }]}>
                {formatCurrency(currentPrice)}
              </Text>
              {currentOrigPrice && currentOrigPrice > currentPrice && (
                <Text style={[styles.originalPrice, { color: theme.textMuted }]}>
                  {formatCurrency(currentOrigPrice)}
                </Text>
              )}
            </View>

            {currentSavings > 0 && (
              <View style={[styles.savingsBadge, { backgroundColor: '#DCFCE7' }]}>
                <Sparkles size={11} color="#15803D" style={{ marginRight: 3 }} />
                <Text style={styles.savingsBadgeText}>
                  Save {formatCurrency(currentSavings)}
                </Text>
              </View>
            )}
          </View>

          <Text style={[styles.taxInclusiveText, { color: theme.textSecondary }]}>
            (Inclusive of all taxes • Fresh batch packed today)
          </Text>

          {/* 🌟 12-15 MIN EXPRESS DELIVERY & LOCATION CARD */}
          <View
            style={[
              styles.deliveryCard,
              {
                backgroundColor: isDarkMode ? '#14532D20' : '#F0FDF4',
                borderColor: isDarkMode ? '#166534' : '#BBF7D0',
              },
            ]}
          >
            <View style={styles.deliveryCardHeader}>
              <View style={styles.deliveryPulseRow}>
                <View style={styles.pulseDot} />
                <Zap size={15} color="#16A34A" fill="#16A34A" style={{ marginRight: 6 }} />
                <Text style={[styles.deliveryCardTitle, { color: theme.textPrimary }]}>
                  Delivery in 12-15 Minutes
                </Text>
              </View>
              <View style={styles.darkstoreBadge}>
                <Text style={styles.darkstoreBadgeText}>Darkstore 0.8 km</Text>
              </View>
            </View>

            <View style={styles.deliveryAddressRow}>
              <MapPin size={13} color={theme.textSecondary} style={{ marginRight: 6, marginTop: 2 }} />
              <Text style={[styles.deliveryAddressText, { color: theme.textSecondary }]} numberOfLines={1}>
                Delivering to {currentAddress || 'Calicut Road, Manjeri'}
              </Text>
            </View>

            <View style={styles.deliveryTimerRow}>
              <Clock size={13} color="#D97706" style={{ marginRight: 6 }} />
              <Text style={[styles.deliveryTimerText, { color: theme.textSecondary }]}>
                Order in next <Text style={{ color: '#D97706', fontWeight: '800' }}>18 mins</Text> for delivery by{' '}
                <Text style={{ fontWeight: '800', color: theme.textPrimary }}>3:15 PM</Text>
              </Text>
            </View>
          </View>

          {/* 🌟 PACK SIZE / VARIANT SELECTOR */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionRowBetween}>
              <Text style={[styles.sectionHeading, { color: theme.textPrimary, marginTop: 0 }]}>
                Select Pack Size
              </Text>
              <Text style={styles.variantSelectedSub}>
                Selected: {currentVariant.unit}
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.variantsScroll}
            >
              {variants.map((v, idx) => {
                const isSelected = selectedVariantIndex === idx;
                return (
                  <TouchableOpacity
                    key={v.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedVariantIndex(idx)}
                    style={[
                      styles.variantCard,
                      {
                        backgroundColor: isSelected
                          ? isDarkMode
                            ? '#14532D30'
                            : '#F0FDF4'
                          : theme.surface,
                        borderColor: isSelected ? '#16A34A' : theme.border,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    {v.badge && (
                      <View
                        style={[
                          styles.variantBadge,
                          { backgroundColor: isSelected ? '#16A34A' : '#EF4444' },
                        ]}
                      >
                        <Text style={styles.variantBadgeText}>{v.badge}</Text>
                      </View>
                    )}
                    <Text style={[styles.variantUnit, { color: theme.textPrimary }]}>{v.unit}</Text>
                    <Text style={[styles.variantName, { color: theme.textSecondary }]}>{v.name}</Text>
                    <View style={styles.variantPriceRow}>
                      <Text style={[styles.variantPrice, { color: theme.textPrimary }]}>
                        {formatCurrency(v.price)}
                      </Text>
                      {v.originalPrice && (
                        <Text style={[styles.variantOriginalPrice, { color: theme.textMuted }]}>
                          {formatCurrency(v.originalPrice)}
                        </Text>
                      )}
                    </View>
                    {isSelected && (
                      <View style={styles.variantCheckCircle}>
                        <Check size={11} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* 🌟 FOUR PILLARS OF TRUST */}
          <View style={styles.pillarsGrid}>
            <View style={[styles.pillarBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.pillarIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Leaf size={18} color="#16A34A" />
              </View>
              <Text style={[styles.pillarTitle, { color: theme.textPrimary }]}>100% Farm Fresh</Text>
              <Text style={[styles.pillarSubtitle, { color: theme.textSecondary }]}>
                Directly harvested daily
              </Text>
            </View>

            <View style={[styles.pillarBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.pillarIconCircle, { backgroundColor: '#DBEAFE' }]}>
                <Truck size={18} color="#2563EB" />
              </View>
              <Text style={[styles.pillarTitle, { color: theme.textPrimary }]}>Cold Chain Stored</Text>
              <Text style={[styles.pillarSubtitle, { color: theme.textSecondary }]}>
                Packed at 4°C chilled
              </Text>
            </View>

            <View style={[styles.pillarBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.pillarIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <RotateCcw size={18} color="#D97706" />
              </View>
              <Text style={[styles.pillarTitle, { color: theme.textPrimary }]}>Instant Returns</Text>
              <Text style={[styles.pillarSubtitle, { color: theme.textSecondary }]}>
                Zero questions asked
              </Text>
            </View>

            <View style={[styles.pillarBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.pillarIconCircle, { backgroundColor: '#F3E8FF' }]}>
                <ShieldCheck size={18} color="#9333EA" />
              </View>
              <Text style={[styles.pillarTitle, { color: theme.textPrimary }]}>Tamper Sealed</Text>
              <Text style={[styles.pillarSubtitle, { color: theme.textSecondary }]}>
                Hygienic biodegradable
              </Text>
            </View>
          </View>

          {/* 🌟 PRODUCT DESCRIPTION */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
              About the Product
            </Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              {product.description} Sourced directly from local farmer cooperatives in Nilgiris and Wayanad, ensuring optimal natural sweetness, vibrant texture, and high nutritional density with zero harmful artificial ripening agents.
            </Text>
          </View>

          {/* 🌟 NUTRITIONAL BREAKDOWN (PER 100G) */}
          <View style={[styles.nutritionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.nutritionHeaderRow}>
              <View>
                <Text style={[styles.sectionHeading, { color: theme.textPrimary, marginTop: 0 }]}>
                  Nutritional Value
                </Text>
                <Text style={[styles.nutritionSub, { color: theme.textSecondary }]}>
                  Approx. values per 100g serving
                </Text>
              </View>
              <View style={[styles.nutritionPill, { backgroundColor: '#DCFCE7' }]}>
                <Sparkles size={11} color="#16A34A" style={{ marginRight: 3 }} />
                <Text style={styles.nutritionPillText}>Healthy Choice</Text>
              </View>
            </View>

            <View style={styles.nutritionGrid}>
              {nutritionFacts.map((item, i) => (
                <View
                  key={i}
                  style={[
                    styles.nutritionItem,
                    {
                      backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC',
                      borderColor: item.highlight ? '#16A34A' : theme.border,
                      borderWidth: item.highlight ? 1.5 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.nutritionValue,
                      { color: item.highlight ? '#16A34A' : theme.textPrimary },
                    ]}
                  >
                    {item.value}
                  </Text>
                  <Text style={[styles.nutritionLabel, { color: theme.textSecondary }]}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 🌟 SPECIFICATIONS & ORIGIN */}
          <View style={[styles.specsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.sectionHeading, { color: theme.textPrimary, marginTop: 0, marginBottom: Spacing.sm }]}>
              Product Specifications
            </Text>
            <View style={[styles.specRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.specKey, { color: theme.textSecondary }]}>Country of Origin</Text>
              <Text style={[styles.specVal, { color: theme.textPrimary }]}>India (Kerala / Nilgiris)</Text>
            </View>
            <View style={[styles.specRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.specKey, { color: theme.textSecondary }]}>Shelf Life</Text>
              <Text style={[styles.specVal, { color: theme.textPrimary }]}>4 to 6 Days from delivery</Text>
            </View>
            <View style={[styles.specRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.specKey, { color: theme.textSecondary }]}>Storage Condition</Text>
              <Text style={[styles.specVal, { color: theme.textPrimary }]}>Store below 7°C in refrigerator</Text>
            </View>
            <View style={[styles.specRow, { borderBottomColor: theme.border }]}>
              <Text style={[styles.specKey, { color: theme.textSecondary }]}>FSSAI License</Text>
              <Text style={[styles.specVal, { color: '#16A34A', fontWeight: '800' }]}>
                ✓ 11223344000891 (Certified)
              </Text>
            </View>
            <View style={[styles.specRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.specKey, { color: theme.textSecondary }]}>Marketed By</Text>
              <Text style={[styles.specVal, { color: theme.textPrimary }]}>
                UBS Super Express Darkstore, Manjeri
              </Text>
            </View>
          </View>

          {/* 🌟 CUSTOMER REVIEWS & RATINGS */}
          <View style={styles.reviewsSection}>
            <View style={styles.sectionRowBetween}>
              <Text style={[styles.sectionHeading, { color: theme.textPrimary, marginTop: 0 }]}>
                Customer Reviews
              </Text>
              <View style={styles.verifiedCountPill}>
                <CheckCircle2 size={12} color="#16A34A" style={{ marginRight: 4 }} />
                <Text style={styles.verifiedCountText}>1,248 Verified Buyers</Text>
              </View>
            </View>

            {/* Overall Score Box */}
            <View style={[styles.scoreSummaryBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.scoreLeft}>
                <Text style={[styles.bigRatingNum, { color: theme.textPrimary }]}>
                  {product.rating || 4.8}
                </Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} color="#F59E0B" fill="#F59E0B" style={{ marginRight: 2 }} />
                  ))}
                </View>
                <Text style={[styles.scoreSubText, { color: theme.textSecondary }]}>Out of 5 Stars</Text>
              </View>

              <View style={styles.ratingBarsCol}>
                {[
                  { star: '5 ★', percent: '84%' },
                  { star: '4 ★', percent: '12%' },
                  { star: '3 ★', percent: '3%' },
                  { star: '2 ★', percent: '1%' },
                ].map((bar, i) => (
                  <View key={i} style={styles.barRow}>
                    <Text style={[styles.barStarText, { color: theme.textSecondary }]}>{bar.star}</Text>
                    <View style={[styles.barTrack, { backgroundColor: isDarkMode ? '#334155' : '#E2E8F0' }]}>
                      <View style={[styles.barFill, { width: bar.percent as any, backgroundColor: '#F59E0B' }]} />
                    </View>
                    <Text style={[styles.barPercentText, { color: theme.textMuted }]}>{bar.percent}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Verified Review Cards */}
            {MOCK_REVIEWS.map((rev) => (
              <View
                key={rev.id}
                style={[styles.reviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <View style={styles.reviewCardHeader}>
                  <View style={styles.reviewerAvatar}>
                    <Text style={styles.reviewerInitial}>{rev.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={styles.reviewerNameRow}>
                      <Text style={[styles.reviewerName, { color: theme.textPrimary }]}>{rev.name}</Text>
                      {rev.verified && (
                        <View style={styles.verifiedBuyerTag}>
                          <CheckCircle2 size={10} color="#16A34A" style={{ marginRight: 2 }} />
                          <Text style={styles.verifiedBuyerText}>Verified</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.reviewDate, { color: theme.textMuted }]}>{rev.date}</Text>
                  </View>

                  <View style={styles.reviewRatingPill}>
                    <Text style={styles.reviewRatingNum}>{rev.rating}</Text>
                    <Star size={10} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
                  </View>
                </View>

                <Text style={[styles.reviewComment, { color: theme.textSecondary }]}>
                  {rev.comment}
                </Text>

                <View style={styles.reviewFooterRow}>
                  <TouchableOpacity style={styles.helpfulBtn} activeOpacity={0.7}>
                    <ThumbsUp size={12} color={theme.textMuted} style={{ marginRight: 4 }} />
                    <Text style={[styles.helpfulText, { color: theme.textMuted }]}>
                      Helpful ({rev.helpfulCount})
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* 🌟 FREQUENTLY BOUGHT TOGETHER */}
          {similarProducts.length > 0 && (
            <View style={styles.similarSection}>
              <View style={styles.sectionRowBetween}>
                <Text style={[styles.sectionHeading, { color: theme.textPrimary, marginTop: 0 }]}>
                  Frequently Bought Together
                </Text>
                <Text style={styles.sectionHeadingSub}>Pairs Well</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.similarScroll}
              >
                {similarProducts.map((simProduct) => (
                  <ProductCard
                    key={simProduct.id}
                    product={simProduct}
                    cardWidth={160}
                    style={{ marginRight: Spacing.md }}
                    onPress={() => router.push(`/grocery/detail/${simProduct.id}`)}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 🌟 STICKY HIGH-CONVERSION BOTTOM CART BAR */}
      <View
        style={[
          styles.footerBar,
          {
            backgroundColor: theme.card,
            borderTopColor: theme.border,
            paddingBottom: Math.max(Spacing.md, insets.bottom + 4),
          },
        ]}
      >
        <View style={styles.footerPriceCol}>
          <Text style={[styles.footerVariantLabel, { color: theme.textSecondary }]}>
            {currentVariant.unit} • {quantity > 0 ? `${quantity} in basket` : 'Pack price'}
          </Text>
          <View style={styles.footerPriceRow}>
            <Text style={[styles.footerPriceValue, { color: theme.textPrimary }]}>
              {formatCurrency(currentPrice * (quantity > 0 ? quantity : 1))}
            </Text>
            {currentOrigPrice && (
              <Text style={[styles.footerOrigPrice, { color: theme.textMuted }]}>
                {formatCurrency(currentOrigPrice * (quantity > 0 ? quantity : 1))}
              </Text>
            )}
          </View>
          {currentSavings > 0 && (
            <Text style={styles.footerSavingsText}>
              Save {formatCurrency(currentSavings * (quantity > 0 ? quantity : 1))}
            </Text>
          )}
        </View>

        {quantity > 0 ? (
          <View style={styles.footerActionsRight}>
            <View style={[styles.quantityControl, { backgroundColor: '#16A34A' }]}>
              <TouchableOpacity
                style={styles.qtyBtn}
                activeOpacity={0.7}
                onPress={handleMinus}
              >
                <Minus size={17} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                activeOpacity={0.7}
                onPress={handlePlus}
              >
                <Plus size={17} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.viewCartBtn, { backgroundColor: '#15803D' }]}
              activeOpacity={0.85}
              onPress={() => router.push('/cart')}
            >
              <ShoppingBag size={16} color="#FFFFFF" style={{ marginRight: 5 }} />
              <Text style={styles.viewCartBtnText}>View Cart</Text>
              <ArrowRight size={15} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.addBigBtn, { backgroundColor: '#16A34A' }]}
            activeOpacity={0.88}
            onPress={handleAddToCart}
          >
            <ShoppingBag size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.addBigBtnText}>Add to Basket</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  headerCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerCartPill: {
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    position: 'relative',
    ...Shadows.medium,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    minWidth: 17,
    height: 17,
    borderRadius: 8.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    paddingHorizontal: 2,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  toastContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 60,
    alignItems: 'center',
  },
  toastPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
    ...Shadows.medium,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 125,
  },
  heroWrapper: {
    width: '100%',
    height: 350,
    position: 'relative',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroBadgesRow: {
    position: 'absolute',
    left: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginRight: 6,
    ...Shadows.small,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  organicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    ...Shadows.small,
  },
  organicText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  heroEtaPill: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    ...Shadows.small,
  },
  heroEtaText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
  },
  heroCounterPill: {
    position: 'absolute',
    bottom: Spacing.md,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  heroCounterText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '700',
  },
  thumbnailStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
  },
  thumbnailBtn: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginRight: 10,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  thumbnailHint: {
    flex: 1,
    marginLeft: 4,
  },
  thumbnailHintText: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  categoryBadgeText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    lineHeight: 30,
    marginBottom: Spacing.xs,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  ratingTagPill: {
    marginLeft: Spacing.md,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  ratingTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 2,
  },
  priceLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
  },
  originalPrice: {
    fontSize: Typography.sizes.md,
    textDecorationLine: 'line-through',
    marginLeft: Spacing.sm,
  },
  savingsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  savingsBadgeText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '800',
  },
  taxInclusiveText: {
    fontSize: 10,
    marginTop: 3,
    marginBottom: Spacing.md,
  },
  deliveryCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  deliveryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  deliveryPulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#16A34A',
    marginRight: 6,
  },
  deliveryCardTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  darkstoreBadge: {
    backgroundColor: 'rgba(22, 163, 74, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  darkstoreBadgeText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '800',
  },
  deliveryAddressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  deliveryAddressText: {
    fontSize: Typography.sizes.xs,
    flex: 1,
    fontWeight: '500',
  },
  deliveryTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryTimerText: {
    fontSize: Typography.sizes.xs,
  },
  sectionBlock: {
    marginBottom: Spacing.lg,
  },
  sectionRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs + 2,
  },
  sectionHeading: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  sectionHeadingSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  variantSelectedSub: {
    fontSize: 11,
    fontWeight: '800',
    color: '#16A34A',
  },
  variantsScroll: {
    paddingVertical: Spacing.xs,
  },
  variantCard: {
    width: 125,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginRight: 10,
    position: 'relative',
    ...Shadows.small,
  },
  variantBadge: {
    position: 'absolute',
    top: -7,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  variantBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  variantUnit: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
    marginTop: 4,
  },
  variantName: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
    marginBottom: 6,
  },
  variantPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  variantPrice: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
  },
  variantOriginalPrice: {
    fontSize: 10,
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  variantCheckCircle: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  pillarBox: {
    width: '48.5%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: 10,
    alignItems: 'center',
    ...Shadows.small,
  },
  pillarIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  pillarTitle: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  pillarSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  description: {
    fontSize: Typography.sizes.sm,
    lineHeight: 22,
    marginTop: 4,
  },
  nutritionCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  nutritionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  nutritionSub: {
    fontSize: 11,
    marginTop: 2,
  },
  nutritionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  nutritionPillText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '800',
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '31%',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: 8,
  },
  nutritionValue: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  nutritionLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  specsCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
  },
  specKey: {
    fontSize: 11,
    fontWeight: '600',
  },
  specVal: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
  },
  reviewsSection: {
    marginBottom: Spacing.lg,
  },
  verifiedCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  scoreSummaryBox: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  scoreLeft: {
    alignItems: 'center',
    paddingRight: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
    minWidth: 90,
  },
  bigRatingNum: {
    fontSize: 32,
    fontWeight: '900',
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 2,
    marginBottom: 4,
  },
  scoreSubText: {
    fontSize: 10,
    fontWeight: '600',
  },
  ratingBarsCol: {
    flex: 1,
    paddingLeft: Spacing.md,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  barStarText: {
    fontSize: 10,
    fontWeight: '700',
    width: 24,
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  barPercentText: {
    fontSize: 10,
    fontWeight: '600',
    width: 28,
    textAlign: 'right',
  },
  reviewCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm + 2,
    ...Shadows.small,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerInitial: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  reviewerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewerName: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 6,
  },
  verifiedBuyerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  verifiedBuyerText: {
    color: '#15803D',
    fontSize: 8,
    fontWeight: '800',
  },
  reviewDate: {
    fontSize: 10,
    marginTop: 1,
  },
  reviewRatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reviewRatingNum: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  reviewComment: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  reviewFooterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  helpfulBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpfulText: {
    fontSize: 10,
    fontWeight: '600',
  },
  similarSection: {
    marginTop: Spacing.xs,
  },
  similarScroll: {
    paddingVertical: Spacing.sm,
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md - 2,
    borderTopWidth: 1,
    ...Shadows.large,
  },
  footerPriceCol: {
    justifyContent: 'center',
  },
  footerVariantLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  footerPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 1,
  },
  footerPriceValue: {
    fontSize: 22,
    fontWeight: Typography.weights.bold,
  },
  footerOrigPrice: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  footerSavingsText: {
    color: '#16A34A',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 1,
  },
  footerActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginRight: 8,
  },
  qtyBtn: {
    padding: 6,
  },
  qtyText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: Typography.sizes.md,
    paddingHorizontal: Spacing.sm + 2,
  },
  viewCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    ...Shadows.small,
  },
  viewCartBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.sm,
    fontWeight: '800',
  },
  addBigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: BorderRadius.full,
    minWidth: 180,
    ...Shadows.medium,
  },
  addBigBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.md,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
