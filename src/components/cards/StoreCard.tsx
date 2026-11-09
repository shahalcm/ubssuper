// src/components/cards/StoreCard.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Store } from '@/types';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import {
  Star,
  Clock,
  MapPin,
  Bike,
  ChevronRight,
  ShoppingBag,
  Utensils,
  Sparkles,
} from 'lucide-react-native';

interface StoreCardProps {
  store: Store;
  onPress: () => void;
  accentColor?: string;
}

export const StoreCard: React.FC<StoreCardProps> = ({
  store,
  onPress,
  accentColor = '#16A34A',
}) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const isRestaurant = store.category === 'restaurant';
  const coverUrl = store.coverImage || store.logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80';
  const logoUrl = store.logo || store.coverImage;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
        Shadows.medium,
      ]}
      activeOpacity={0.88}
      onPress={onPress}
    >
      {/* Cover Image Container */}
      <View style={styles.coverWrapper}>
        <Image source={{ uri: coverUrl }} style={styles.coverImage} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(0,0,0,0.65)']}
          style={styles.gradientOverlay}
        />

        {/* Top Badges */}
        <View style={styles.topBadgeRow}>
          <View style={styles.categoryBadge}>
            {isRestaurant ? (
              <Utensils size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
            ) : (
              <ShoppingBag size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
            )}
            <Text style={styles.categoryBadgeText}>
              {isRestaurant ? 'Restaurant' : 'Supermarket'}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: store.isOpen ? '#16A34A' : '#DC2626' },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: store.isOpen ? '#86EFAC' : '#FCA5A5' }]} />
            <Text style={styles.statusText}>{store.isOpen ? 'OPEN' : 'CLOSED'}</Text>
          </View>
        </View>

        {/* Free Delivery / Featured Tag */}
        {store.deliveryFee === 0 && (
          <View style={styles.offerPill}>
            <Sparkles size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
            <Text style={styles.offerPillText}>FREE DELIVERY</Text>
          </View>
        )}
      </View>

      {/* Card Body */}
      <View style={styles.body}>
        {/* Header Row with Logo and Name */}
        <View style={styles.headerRow}>
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.logoImage} resizeMode="cover" />
          ) : (
            <View style={[styles.logoImage, styles.placeholderLogo, { backgroundColor: '#F0FDF4' }]}>
              {isRestaurant ? (
                <Utensils size={18} color="#16A34A" />
              ) : (
                <ShoppingBag size={18} color="#16A34A" />
              )}
            </View>
          )}

          <View style={styles.headerInfo}>
            <Text style={[styles.storeName, { color: theme.textPrimary }]} numberOfLines={1}>
              {store.name}
            </Text>
            {store.cuisines && store.cuisines.length > 0 ? (
              <Text style={[styles.storeSub, { color: theme.textSecondary }]} numberOfLines={1}>
                {store.cuisines.join(' • ')}
              </Text>
            ) : store.storeDescription ? (
              <Text style={[styles.storeSub, { color: theme.textSecondary }]} numberOfLines={1}>
                {store.storeDescription}
              </Text>
            ) : null}
          </View>

          {/* Rating Pill */}
          <View style={styles.ratingBadge}>
            <Star size={13} color="#EAB308" fill="#EAB308" />
            <Text style={styles.ratingText}>{Number(store.rating || 4.7).toFixed(1)}</Text>
          </View>
        </View>

        {/* Metadata Strip */}
        <View style={styles.metaStrip}>
          <View style={styles.metaItem}>
            <Clock size={13} color="#64748B" />
            <Text style={styles.metaText}>{store.deliveryTime || '25 mins'}</Text>
          </View>

          <Text style={styles.metaDot}>•</Text>

          <View style={styles.metaItem}>
            <MapPin size={13} color="#64748B" />
            <Text style={styles.metaText}>{store.distanceFormatted || '1.8 km'}</Text>
          </View>

          <Text style={styles.metaDot}>•</Text>

          <View style={styles.metaItem}>
            <Bike size={13} color="#64748B" />
            <Text style={[styles.metaText, store.deliveryFee === 0 && { color: '#16A34A', fontWeight: '700' }]}>
              {store.deliveryFee === 0 ? 'Free' : `₹${store.deliveryFee}`}
            </Text>
          </View>

          {store.minOrderAmount > 0 && (
            <>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>Min ₹{store.minOrderAmount}</Text>
            </>
          )}
        </View>

        {/* Action Button */}
        <View style={styles.actionRow}>
          <View style={[styles.viewStoreBtn, { backgroundColor: isRestaurant ? '#FFF7ED' : '#F0FDF4', borderColor: isRestaurant ? '#FED7AA' : '#DCFCE7' }]}>
            <Text style={[styles.viewStoreText, { color: isRestaurant ? '#C2410C' : '#15803D' }]}>
              {isRestaurant ? 'View Restaurant Menu' : 'Visit Store Catalog'}
            </Text>
            <ChevronRight size={16} color={isRestaurant ? '#C2410C' : '#15803D'} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  coverWrapper: {
    width: '100%',
    height: 156,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topBadgeRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
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
  offerPill: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  offerPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  body: {
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  placeholderLogo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  storeSub: {
    fontSize: 12,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#854D0E',
  },
  metaStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexWrap: 'wrap',
    gap: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  metaDot: {
    color: '#CBD5E1',
    fontSize: 10,
  },
  actionRow: {
    marginTop: 10,
  },
  viewStoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  viewStoreText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
