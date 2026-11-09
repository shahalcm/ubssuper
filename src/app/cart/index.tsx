// src/app/cart/index.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity 
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from '@/localization';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { TextField } from '@/components/ui/Input';
import { MOCK_COUPONS } from '@/services/mock/data';
import { ArrowLeft, Trash2, Plus, Minus, Tag, ShoppingBag, ShieldCheck } from 'lucide-react-native';

export default function CartScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const {
    items,
    updateQuantity,
    removeItem,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscountAmount,
    getDeliveryFee,
    getTaxAmount,
    getTotalAmount,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = () => {
    const found = MOCK_COUPONS.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (!found) {
      setCouponError('Invalid coupon code. Try "SUPERWELCOME"');
      return;
    }
    const success = applyCoupon(found);
    if (!success) {
      setCouponError(`Minimum order value is ${formatCurrency(found.minOrderValue)}`);
    } else {
      setCouponError('');
      setCouponCode('');
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t('cart.title', 'My Shopping Cart')}</Text>
          <View style={{ width: 24 }} />
        </View>

        <EmptyState
          icon={<ShoppingBag size={48} color={theme.primary} />}
          title={t('cart.emptyCart', 'Your Cart is Empty')}
          description={t('cart.emptyCartSub', "Looks like you haven't added any groceries or food items to your cart yet.")}
          buttonTitle={t('cart.startShopping', 'Start Shopping')}
          onButtonPress={() => router.replace('/(tabs)')}
        />
      </SafeAreaView>
    );
  }

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const delivery = getDeliveryFee();
  const tax = getTaxAmount();
  const total = getTotalAmount();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {t('cart.title', 'Shopping Cart')} ({items.length})
        </Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)')}>
          <ShoppingBag size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Cart Items List */}
        <View style={styles.itemsSection}>
          {items.map(({ product, quantity }) => (
            <View
              key={product.id}
              style={[
                styles.itemCard,
                { backgroundColor: theme.card, borderColor: theme.border },
                Shadows.small,
              ]}
            >
              <Image source={{ uri: product.image }} style={styles.itemImage} resizeMode="cover" />

              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.textPrimary }]} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={[styles.itemUnit, { color: theme.textSecondary }]}>{product.unit}</Text>
                <Text style={[styles.itemPrice, { color: theme.textPrimary }]}>
                  {formatCurrency(product.price * quantity)}
                </Text>
              </View>

              <View style={styles.qtyContainer}>
                <View style={[styles.qtyBox, { backgroundColor: theme.primary }]}>
                  <TouchableOpacity onPress={() => updateQuantity(product.id, quantity - 1)}>
                    <Minus size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{quantity}</Text>
                  <TouchableOpacity onPress={() => updateQuantity(product.id, quantity + 1)}>
                    <Plus size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => removeItem(product.id)} style={{ marginTop: 8 }}>
                  <Trash2 size={16} color={theme.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Coupon Code Section */}
        <View style={[styles.couponBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.couponHeader}>
            <Tag size={18} color={theme.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.couponTitle, { color: theme.textPrimary }]}>Apply Coupon Promo</Text>
          </View>

          {appliedCoupon ? (
            <View style={[styles.appliedBox, { backgroundColor: theme.success + '15' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.appliedCode, { color: theme.success }]}>
                  {appliedCoupon.code} APPLIED
                </Text>
                <Text style={[styles.appliedDesc, { color: theme.textSecondary }]}>
                  You saved {formatCurrency(discount)} on this order!
                </Text>
              </View>
              <TouchableOpacity onPress={removeCoupon}>
                <Text style={[styles.removeText, { color: theme.error }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.couponInputRow}>
              <TextField
                value={couponCode}
                onChangeText={setCouponCode}
                placeholder={t('cart.promoCode', 'Enter promo (e.g. SUPERWELCOME)')}
                containerStyle={{ flex: 1, marginRight: Spacing.sm }}
              />
              <Button title={t('cart.applyPromo', 'Apply')} size="sm" onPress={handleApplyCoupon} style={{ height: 48 }} />
            </View>
          )}

          {couponError ? <Text style={[styles.errorText, { color: theme.error }]}>{couponError}</Text> : null}
        </View>

        {/* Price Bill Breakdown */}
        <View style={[styles.billCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.billTitle, { color: theme.textPrimary }]}>{t('orders.orderDetails', 'Bill Summary')}</Text>

          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: theme.textSecondary }]}>{t('orders.subtotal', 'Item Subtotal')}</Text>
            <Text style={[styles.billVal, { color: theme.textPrimary }]}>{formatCurrency(subtotal)}</Text>
          </View>

          {discount > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, { color: theme.success }]}>{t('orders.discount', 'Coupon Discount')}</Text>
              <Text style={[styles.billVal, { color: theme.success }]}>-{formatCurrency(discount)}</Text>
            </View>
          )}

          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: theme.textSecondary }]}>{t('orders.deliveryFee', 'Delivery Fee')}</Text>
            <Text style={[styles.billVal, { color: delivery === 0 ? theme.success : theme.textPrimary }]}>
              {delivery === 0 ? t('cart.free', 'FREE') : formatCurrency(delivery)}
            </Text>
          </View>

          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: theme.textSecondary }]}>{t('orders.tax', 'Taxes & GST (5%)')}</Text>
            <Text style={[styles.billVal, { color: theme.textPrimary }]}>{formatCurrency(tax)}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.billRow}>
            <Text style={[styles.totalLabel, { color: theme.textPrimary }]}>{t('orders.total', 'To Pay')}</Text>
            <Text style={[styles.totalVal, { color: theme.primary }]}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Bar */}
      <View style={[styles.footerBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <View>
          <Text style={[styles.footerLabel, { color: theme.textMuted }]}>{t('orders.total', 'Total Amount')}</Text>
          <Text style={[styles.footerPrice, { color: theme.textPrimary }]}>{formatCurrency(total)}</Text>
        </View>

        <Button
          title={t('cart.proceedToCheckout', 'Proceed to Checkout')}
          size="lg"
          onPress={() => {
            const isAuth = useAuthStore.getState().isAuthenticated;
            if (!isAuth) {
              useCartStore.getState().openLoginModal();
              return;
            }
            router.push('/checkout');
          }}
          style={{ minWidth: 180 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 110,
  },
  itemsSection: {
    marginVertical: Spacing.md,
  },
  itemCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
  },
  itemInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  itemName: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  itemUnit: {
    fontSize: Typography.sizes.xs,
    marginVertical: 2,
  },
  itemPrice: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  qtyContainer: {
    alignItems: 'flex-end',
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  qtyText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: Typography.sizes.xs + 1,
    paddingHorizontal: 8,
  },
  couponBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  couponTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  appliedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  appliedCode: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
  },
  appliedDesc: {
    fontSize: Typography.sizes.xs,
  },
  removeText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  couponInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontSize: Typography.sizes.xs,
    marginTop: 4,
  },
  billCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  billTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  billLabel: {
    fontSize: Typography.sizes.xs + 1,
  },
  billVal: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xs + 2,
  },
  totalLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  totalVal: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
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
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  footerLabel: {
    fontSize: 10,
  },
  footerPrice: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
});
