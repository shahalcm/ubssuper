// src/components/cards/ProductCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Product } from '@/types';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { Rating } from '@/components/ui/Rating';
import { Plus, Minus, Heart, Zap, Sparkles } from 'lucide-react-native';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  horizontal?: boolean;
  style?: StyleProp<ViewStyle>;
  cardWidth?: number | string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  horizontal = false,
  style,
  cardWidth,
}) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const isFav = useFavoritesStore((state) => state.isFavorite(product.id));
  const toggleFav = useFavoritesStore((state) => state.toggleFavorite);

  const cartItem = cartItems.find((i) => i.product.id === product.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const savings =
    product.originalPrice && product.originalPrice > product.price
      ? product.originalPrice - product.price
      : 0;

  return (
    <TouchableOpacity
      style={[
        horizontal ? styles.horizontalCard : styles.card,
        cardWidth ? { width: cardWidth as any } : null,
        { backgroundColor: theme.card, borderColor: theme.border },
        Shadows.small,
        style,
      ]}
      activeOpacity={0.88}
      onPress={onPress}
    >
      {/* Top Badges Row */}
      <View style={styles.topBadgesRow}>
        {product.discountPercentage ? (
          <View style={[styles.discountBadge, { backgroundColor: '#EF4444' }]}>
            <Text style={styles.discountText}>{product.discountPercentage}% OFF</Text>
          </View>
        ) : product.isOrganic ? (
          <View style={[styles.organicBadge, { backgroundColor: '#10B981' }]}>
            <Sparkles size={9} color="#FFFFFF" style={{ marginRight: 2 }} />
            <Text style={styles.organicText}>ORGANIC</Text>
          </View>
        ) : (
          <View />
        )}

        <TouchableOpacity
          style={[styles.heartBtn, { backgroundColor: theme.surface + 'EE' }]}
          activeOpacity={0.7}
          onPress={(e) => {
            e.stopPropagation?.();
            toggleFav(product.id);
          }}
        >
          <Heart
            size={14}
            color={isFav ? '#EF4444' : theme.textSecondary}
            fill={isFav ? '#EF4444' : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image }}
          style={horizontal ? styles.horizontalImage : styles.image}
          resizeMode="cover"
        />
        {/* Delivery ETA Pill */}
        <View style={styles.etaPill}>
          <Zap size={10} color="#F59E0B" fill="#F59E0B" style={{ marginRight: 2 }} />
          <Text style={styles.etaText}>12 MINS</Text>
        </View>
      </View>

      {/* Info Container */}
      <View style={styles.infoContainer}>
        <View style={styles.unitRow}>
          <Text style={[styles.unit, { color: theme.textSecondary }]}>{product.unit}</Text>
          {product.isOrganic && !product.discountPercentage && (
            <Text style={styles.subOrganic}>Pure Farm</Text>
          )}
        </View>

        <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={2}>
          {product.name}
        </Text>

        {product.rating && (
          <View style={styles.ratingRow}>
            <Rating rating={product.rating} count={product.ratingCount} size={11} />
          </View>
        )}

        {/* Footer with Price and Stepper */}
        <View style={styles.footerRow}>
          <View style={styles.priceColumn}>
            <View style={styles.priceLine}>
              <Text style={[styles.price, { color: theme.textPrimary }]}>
                {formatCurrency(product.price)}
              </Text>
              {product.originalPrice && (
                <Text style={[styles.originalPrice, { color: theme.textMuted }]}>
                  {formatCurrency(product.originalPrice)}
                </Text>
              )}
            </View>
            {savings > 0 && (
              <Text style={styles.saveTag}>Save {formatCurrency(savings)}</Text>
            )}
          </View>

          {quantity > 0 ? (
            <View
              style={[
                styles.quantityControl,
                { backgroundColor: theme.primary, borderColor: theme.primary },
              ]}
            >
              <TouchableOpacity
                style={styles.qtyBtn}
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation?.();
                  updateQuantity(product.id, quantity - 1);
                }}
              >
                <Minus size={13} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                activeOpacity={0.7}
                onPress={(e) => {
                  e.stopPropagation?.();
                  updateQuantity(product.id, quantity + 1);
                }}
              >
                <Plus size={13} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.addBtn,
                {
                  backgroundColor: isDarkMode ? '#14532D' : '#F0FDF4',
                  borderColor: theme.primary,
                },
              ]}
              activeOpacity={0.75}
              onPress={(e) => {
                e.stopPropagation?.();
                addItem(product, 1);
              }}
            >
              <Plus size={12} color={theme.primary} style={{ marginRight: 2 }} />
              <Text style={[styles.addBtnText, { color: theme.primary }]}>ADD</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 165,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    position: 'relative',
  },
  horizontalCard: {
    flexDirection: 'row',
    width: '100%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    padding: Spacing.xs,
  },
  topBadgesRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  organicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  organicText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  heartBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#F8FAFC',
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: '#F1F5F9',
  },
  horizontalImage: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F1F5F9',
  },
  etaPill: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  etaText: {
    color: '#F8FAFC',
    fontSize: 9,
    fontWeight: '700',
  },
  infoContainer: {
    padding: Spacing.sm,
    flex: 1,
    justifyContent: 'space-between',
  },
  unitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unit: {
    fontSize: 10,
    fontWeight: Typography.weights.semibold,
  },
  subOrganic: {
    fontSize: 9,
    fontWeight: '700',
    color: '#10B981',
  },
  name: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    marginVertical: 3,
    lineHeight: 18,
    minHeight: 36,
  },
  ratingRow: {
    marginBottom: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  priceColumn: {
    flex: 1,
    marginRight: 4,
  },
  priceLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  originalPrice: {
    fontSize: 10,
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  saveTag: {
    fontSize: 9,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm + 2,
    borderWidth: 1.2,
  },
  addBtnText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.sm + 2,
    borderWidth: 1,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  qtyBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: Typography.sizes.xs + 1,
    paddingHorizontal: 6,
    minWidth: 18,
    textAlign: 'center',
  },
});
