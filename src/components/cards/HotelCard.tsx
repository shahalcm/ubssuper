// src/components/cards/HotelCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Hotel } from '@/types';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { Rating } from '@/components/ui/Rating';
import { MapPin } from 'lucide-react-native';

interface HotelCardProps {
  hotel: Hotel;
  onPress: () => void;
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, onPress }) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

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
      <Image source={{ uri: hotel.images[0] }} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
            {hotel.name}
          </Text>
          <Rating rating={hotel.rating} count={hotel.reviewCount} />
        </View>

        <View style={styles.locationRow}>
          <MapPin size={14} color={theme.textSecondary} style={{ marginRight: 4 }} />
          <Text style={[styles.locationText, { color: theme.textSecondary }]} numberOfLines={1}>
            {hotel.location}
          </Text>
        </View>

        <View style={styles.footerRow}>
          <View>
            <Text style={[styles.price, { color: theme.textPrimary }]}>
              {formatCurrency(hotel.pricePerNight)}
              <Text style={[styles.perNight, { color: theme.textSecondary }]}> / night</Text>
            </Text>
            {hotel.originalPrice && (
              <Text style={[styles.originalPrice, { color: theme.textMuted }]}>
                {formatCurrency(hotel.originalPrice)}
              </Text>
            )}
          </View>

          <View style={[styles.bookBadge, { backgroundColor: theme.blue }]}>
            <Text style={styles.bookText}>Book Now</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    flex: 1,
    marginRight: Spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  locationText: {
    fontSize: Typography.sizes.xs + 1,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: Spacing.sm,
  },
  price: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  perNight: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.regular,
  },
  originalPrice: {
    fontSize: Typography.sizes.xs,
    textDecorationLine: 'line-through',
  },
  bookBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
  },
  bookText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
  },
});
