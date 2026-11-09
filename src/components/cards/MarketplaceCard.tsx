// src/components/cards/MarketplaceCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MarketplaceListing } from '@/types';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { MapPin, Heart } from 'lucide-react-native';

interface MarketplaceCardProps {
  item: MarketplaceListing;
  onPress: () => void;
}

export const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ item, onPress }) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
        Shadows.small,
      ]}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.images[0] }} style={styles.image} resizeMode="cover" />
        {item.isNegotiable && (
          <View style={[styles.negBadge, { backgroundColor: theme.purple }]}>
            <Text style={styles.negText}>Negotiable</Text>
          </View>
        )}
        <TouchableOpacity style={styles.favoriteBtn} activeOpacity={0.7}>
          <Heart size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={[styles.price, { color: theme.textPrimary }]}>
          {formatCurrency(item.price)}
        </Text>
        <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.locationRow}>
            <MapPin size={12} color={theme.textMuted} style={{ marginRight: 3 }} />
            <Text style={[styles.locationText, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
          <Text style={[styles.dateText, { color: theme.textMuted }]}>{item.postedDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  imageContainer: {
    position: 'relative',
    height: 125,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
  },
  negBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  negText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: Spacing.sm,
  },
  price: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  title: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.medium,
    marginVertical: 4,
    height: 32,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 10,
    flex: 1,
  },
  dateText: {
    fontSize: 9,
  },
});
