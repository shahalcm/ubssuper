// src/components/cards/CategoryCard.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Category } from '@/types';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { 
  Car, 
  ShoppingBag, 
  Utensils, 
  Building, 
  Truck, 
  Stethoscope, 
  Tag, 
  Tv 
} from 'lucide-react-native';

interface CategoryCardProps {
  category: Category;
  badge?: string;
  onPress: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, badge, onPress }) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const renderIcon = () => {
    const size = 26;
    const color = category.color;
    switch (category.type) {
      case 'taxi':
        return <Car size={size} color={color} />;
      case 'grocery':
        return <ShoppingBag size={size} color={color} />;
      case 'food':
        return <Utensils size={size} color={color} />;
      case 'hotels':
        return <Building size={size} color={color} />;
      case 'logistics':
        return <Truck size={size} color={color} />;
      case 'doctors':
        return <Stethoscope size={size} color={color} />;
      case 'marketplace':
        return <Tag size={size} color={color} />;
      case 'appliances':
        return <Tv size={size} color={color} />;
      default:
        return <ShoppingBag size={size} color={color} />;
    }
  };

  const getBadgeText = () => {
    if (badge) return badge;
    switch (category.type) {
      case 'taxi': return '3 MINS';
      case 'grocery': return '15 MINS';
      case 'food': return 'OFFERS';
      case 'hotels': return 'STAYS';
      case 'doctors': return 'TOP';
      case 'marketplace': return 'BUY/SELL';
      default: return null;
    }
  };

  const badgeText = getBadgeText();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
        Shadows.small,
      ]}
      activeOpacity={0.82}
      onPress={onPress}
    >
      {badgeText && (
        <View style={[styles.badgePill, { backgroundColor: category.color }]}>
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
      )}

      <View style={[styles.iconBg, { backgroundColor: category.bgLight }]}>
        {renderIcon()}
      </View>
      <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
        {category.name}
      </Text>
      {category.subtitle && (
        <Text style={[styles.subtitle, { color: theme.textSecondary }]} numberOfLines={1}>
          {category.subtitle}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '23%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
    position: 'relative',
    overflow: 'visible',
  },
  badgePill: {
    position: 'absolute',
    top: -6,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.sm,
    zIndex: 10,
    elevation: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  iconBg: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs + 2,
  },
  name: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 9,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: Typography.weights.medium,
  },
});
