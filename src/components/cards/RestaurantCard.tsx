// src/components/cards/RestaurantCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Restaurant } from '@/types';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { Rating } from '@/components/ui/Rating';
import { Clock, MapPin, Tag } from 'lucide-react-native';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onPress: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onPress }) => {
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
      <View style={styles.imageWrapper}>
        <Image source={{ uri: restaurant.image }} style={styles.image} resizeMode="cover" />
        {restaurant.featuredOffer && (
          <View style={[styles.offerBadge, { backgroundColor: theme.orange }]}>
            <Tag size={10} color="#FFFFFF" style={{ marginRight: 3 }} />
            <Text style={styles.offerText}>{restaurant.featuredOffer}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <Rating rating={restaurant.rating} showBadge />
        </View>

        <Text style={[styles.cuisines, { color: theme.textSecondary }]} numberOfLines={1}>
          {restaurant.cuisines.join(' • ')}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock size={12} color={theme.textMuted} style={{ marginRight: 3 }} />
            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
              {restaurant.deliveryTime}
            </Text>
          </View>

          <Text style={[styles.dot, { color: theme.textMuted }]}>•</Text>

          <View style={styles.metaItem}>
            <MapPin size={12} color={theme.textMuted} style={{ marginRight: 3 }} />
            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
              {restaurant.distance}
            </Text>
          </View>

          <Text style={[styles.dot, { color: theme.textMuted }]}>•</Text>

          <Text style={[styles.metaText, { color: theme.textSecondary }]}>
            {restaurant.location}
          </Text>
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
  imageWrapper: {
    position: 'relative',
    height: 140,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  offerBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  offerText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    flex: 1,
    marginRight: Spacing.sm,
  },
  cuisines: {
    fontSize: Typography.sizes.xs + 1,
    marginBottom: Spacing.xs + 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: Typography.sizes.xs,
  },
  dot: {
    marginHorizontal: 5,
    fontSize: 10,
  },
});
