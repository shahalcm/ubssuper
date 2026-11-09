// src/components/ui/Rating.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { Star } from 'lucide-react-native';

interface RatingProps {
  rating: number;
  count?: number;
  showBadge?: boolean;
  size?: number;
}

export const Rating: React.FC<RatingProps> = ({
  rating,
  count,
  showBadge = false,
  size = 14,
}) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  if (showBadge) {
    return (
      <View style={[styles.badgeContainer, { backgroundColor: theme.success }]}>
        <Text style={styles.badgeText}>{rating.toFixed(1)}</Text>
        <Star size={size ? Math.max(10, size - 3) : 10} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Star size={size} color="#F59E0B" fill="#F59E0B" />
      <Text style={[styles.ratingText, { color: theme.textPrimary }]}>{rating.toFixed(1)}</Text>
      {count !== undefined && (
        <Text style={[styles.countText, { color: theme.textSecondary }]}>({count})</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
    marginLeft: 3,
  },
  countText: {
    fontSize: Typography.sizes.xs,
    marginLeft: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
});
