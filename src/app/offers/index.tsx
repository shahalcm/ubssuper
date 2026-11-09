// src/app/offers/index.tsx
import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { useCartStore } from '@/store/cartStore';
import { MOCK_COUPONS } from '@/services/mock/data';
import { Coupon, CategoryType } from '@/types';
import {
  ArrowLeft,
  Tag,
  Copy,
  Check,
  Percent,
  Sparkles,
  ShoppingBag,
  Utensils,
  Car,
  Building,
  Truck,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search,
  X,
  Zap,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = [
  { label: 'All Offers', value: 'all', icon: Sparkles },
  { label: 'Food', value: 'food', icon: Utensils },
  { label: 'Grocery', value: 'grocery', icon: ShoppingBag },
  { label: 'Taxi', value: 'taxi', icon: Car },
  { label: 'Hotels', value: 'hotels', icon: Building },
  { label: 'Logistics', value: 'logistics', icon: Truck },
];

export default function OffersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const applyCoupon = useCartStore((state) => state.applyCoupon);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const handleCopyCode = (coupon: Coupon) => {
    setCopiedCode(coupon.code);
    showToast(`✓ Promo code ${coupon.code} copied!`);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const handleApplyNow = (coupon: Coupon) => {
    applyCoupon(coupon);
    showToast(`✓ Coupon ${coupon.code} applied to your basket!`);
    setTimeout(() => {
      if (coupon.validCategory === 'food') {
        router.push('/(tabs)/food');
      } else if (coupon.validCategory === 'grocery') {
        router.push('/(tabs)/grocery');
      } else if (coupon.validCategory === 'taxi') {
        router.push('/taxi');
      } else if (coupon.validCategory === 'hotels') {
        router.push('/hotels');
      } else {
        router.push('/cart');
      }
    }, 1000);
  };

  const filteredCoupons = useMemo(() => {
    return MOCK_COUPONS.filter((coupon) => {
      if (activeCategory !== 'all' && coupon.validCategory !== 'all' && coupon.validCategory !== activeCategory) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = coupon.code.toLowerCase().includes(q);
        const matchesDesc = coupon.description.toLowerCase().includes(q);
        if (!matchesCode && !matchesDesc) return false;
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  const getCategoryConfig = (cat: string) => {
    switch (cat) {
      case 'food':
        return { color: '#EA580C', bg: '#FFEDD5', icon: <Utensils size={15} color="#EA580C" /> };
      case 'grocery':
        return { color: '#16A34A', bg: '#DCFCE7', icon: <ShoppingBag size={15} color="#16A34A" /> };
      case 'taxi':
        return { color: '#D97706', bg: '#FEF3C7', icon: <Car size={15} color="#D97706" /> };
      case 'hotels':
        return { color: '#2563EB', bg: '#DBEAFE', icon: <Building size={15} color="#2563EB" /> };
      case 'logistics':
        return { color: '#9333EA', bg: '#F3E8FF', icon: <Truck size={15} color="#9333EA" /> };
      default:
        return { color: '#16A34A', bg: '#DCFCE7', icon: <Percent size={15} color="#16A34A" /> };
    }
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
            Offers & Promo Codes
          </Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
            {MOCK_COUPONS.length} Active Vouchers & Instant Savings
          </Text>
        </View>

        <View style={[styles.superBadge, { backgroundColor: '#DCFCE7' }]}>
          <Sparkles size={12} color="#16A34A" style={{ marginRight: 3 }} />
          <Text style={styles.superBadgeText}>VIP Pass</Text>
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

      {/* 🌟 SEARCH BAR */}
      <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Search size={16} color={theme.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search offers by code or keyword..."
          placeholderTextColor={theme.textMuted}
          style={[styles.searchInput, { color: theme.textPrimary }]}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
            <X size={15} color={theme.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* 🌟 CATEGORY TABS */}
      <View style={{ maxHeight: 44 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.value;
            const Icon = cat.icon;
            const count =
              cat.value === 'all'
                ? MOCK_COUPONS.length
                : MOCK_COUPONS.filter(
                    (c) => c.validCategory === 'all' || c.validCategory === cat.value
                  ).length;

            return (
              <TouchableOpacity
                key={cat.value}
                activeOpacity={0.8}
                onPress={() => setActiveCategory(cat.value)}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected
                      ? (isDarkMode ? '#14532D30' : '#DCFCE7')
                      : theme.surface,
                    borderColor: isSelected ? '#16A34A' : theme.border,
                    borderWidth: isSelected ? 1.5 : 1,
                  },
                ]}
              >
                <Icon size={13} color={isSelected ? '#16A34A' : theme.textSecondary} />
                <Text
                  style={[
                    styles.categoryPillText,
                    {
                      color: isSelected ? '#15803D' : theme.textPrimary,
                      fontWeight: isSelected ? '800' : '600',
                    },
                  ]}
                >
                  {cat.label}
                </Text>
                <View
                  style={[
                    styles.countPill,
                    {
                      backgroundColor: isSelected
                        ? '#16A34A'
                        : (isDarkMode ? '#334155' : '#E2E8F0'),
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.countPillText,
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

      {/* 🌟 SCROLLABLE OFFERS FEED */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(Spacing.xxl, insets.bottom + 40) }]}
      >
        {/* 🌟 FLASH DEAL HERO BANNER */}
        <View style={styles.flashBanner}>
          <View style={styles.flashLeft}>
            <View style={styles.flashTag}>
              <Zap size={11} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 3 }} />
              <Text style={styles.flashTagText}>LIMITED TIME ONLY</Text>
            </View>
            <Text style={styles.flashTitle}>Flat 40% OFF Weekend Deal</Text>
            <Text style={styles.flashSub}>
              Use promo code <Text style={{ fontWeight: '900', color: '#FEF08A' }}>SUPERWELCOME</Text> for instant discount!
            </Text>
          </View>
          <View style={styles.flashBadgeCircle}>
            <Text style={styles.flashPercent}>40%</Text>
            <Text style={styles.flashOff}>OFF</Text>
          </View>
        </View>

        {/* 🌟 SECTION TITLE */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Available Coupons ({filteredCoupons.length})
          </Text>
          <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>
            Tap to copy code
          </Text>
        </View>

        {/* 🌟 COUPONS LIST */}
        {filteredCoupons.length > 0 ? (
          filteredCoupons.map((coupon) => {
            const isCopied = copiedCode === coupon.code;
            const validCat = coupon.validCategory || 'all';
            const config = getCategoryConfig(validCat);

            return (
              <View
                key={coupon.id}
                style={[
                  styles.couponCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  Shadows.small,
                ]}
              >
                {/* Coupon Top Header */}
                <View style={styles.couponTop}>
                  <View style={[styles.couponCategoryPill, { backgroundColor: config.bg }]}>
                    {config.icon}
                    <Text style={[styles.couponCategoryText, { color: config.color }]}>
                      {validCat.toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.expiryRow}>
                    <Clock size={11} color={theme.textMuted} style={{ marginRight: 3 }} />
                    <Text style={[styles.expiryText, { color: theme.textMuted }]}>
                      Valid till {coupon.expiryDate}
                    </Text>
                  </View>
                </View>

                {/* Coupon Description */}
                <Text style={[styles.couponDesc, { color: theme.textPrimary }]}>
                  {coupon.description}
                </Text>

                {/* Dashed Code & Action Row */}
                <View style={[styles.codeBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.codeLeft}>
                    <Tag size={14} color="#16A34A" style={{ marginRight: 6 }} />
                    <Text style={[styles.codeText, { color: theme.textPrimary }]}>
                      {coupon.code}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.copyBtn,
                      {
                        backgroundColor: isCopied ? '#16A34A' : '#DCFCE7',
                        borderColor: isCopied ? '#16A34A' : '#86EFAC',
                      },
                    ]}
                    activeOpacity={0.75}
                    onPress={() => handleCopyCode(coupon)}
                  >
                    {isCopied ? (
                      <>
                        <Check size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
                        <Text style={[styles.copyBtnText, { color: '#FFFFFF' }]}>COPIED</Text>
                      </>
                    ) : (
                      <>
                        <Copy size={12} color="#15803D" style={{ marginRight: 4 }} />
                        <Text style={[styles.copyBtnText, { color: '#15803D' }]}>COPY CODE</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Terms & Apply CTA */}
                <View style={[styles.couponFooter, { borderTopColor: theme.borderLight }]}>
                  <View style={styles.minOrderRow}>
                    <ShieldCheck size={12} color="#16A34A" style={{ marginRight: 4 }} />
                    <Text style={[styles.minOrderText, { color: theme.textSecondary }]}>
                      Min. order {formatCurrency(coupon.minOrderValue)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.applyNowBtn, { backgroundColor: '#16A34A' }]}
                    activeOpacity={0.8}
                    onPress={() => handleApplyNow(coupon)}
                  >
                    <Text style={styles.applyNowText}>Apply & Shop</Text>
                    <ArrowRight size={13} color="#FFFFFF" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        ) : (
          <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Tag size={36} color={theme.textMuted} style={{ marginBottom: 10 }} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
              No Offers Found
            </Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              No coupons matching this category or keyword.
            </Text>
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
    color: '#15803D',
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
  searchBar: {
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
  categoryScroll: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 4,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginRight: 8,
    ...Shadows.small,
  },
  categoryPillText: {
    fontSize: 11,
    marginHorizontal: 5,
  },
  countPill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  countPillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  flashBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#047857',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.md,
    ...Shadows.medium,
  },
  flashLeft: {
    flex: 1,
  },
  flashTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  flashTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  flashTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  flashSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    marginTop: 2,
  },
  flashBadgeCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEF08A',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  flashPercent: {
    color: '#065F46',
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  flashOff: {
    color: '#065F46',
    fontSize: 9,
    fontWeight: '900',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  sectionSub: {
    fontSize: 11,
  },
  couponCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  couponTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  couponCategoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  couponCategoryText: {
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryText: {
    fontSize: 10,
    fontWeight: '500',
  },
  couponDesc: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  codeBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: Spacing.xs + 4,
  },
  codeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  copyBtnText: {
    fontSize: 10,
    fontWeight: '900',
  },
  couponFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: Spacing.xs + 4,
    marginTop: 2,
  },
  minOrderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  minOrderText: {
    fontSize: 11,
    fontWeight: '600',
  },
  applyNowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  applyNowText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  emptyBox: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  emptySub: {
    fontSize: Typography.sizes.xs,
    marginTop: 4,
  },
});
