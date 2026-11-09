// src/components/cards/RideOptionCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { RideOption } from '@/types';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { 
  Car, 
  Navigation, 
  Shield, 
  Truck, 
  User, 
  Luggage, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Crown 
} from 'lucide-react-native';

interface RideOptionCardProps {
  option: RideOption;
  isSelected: boolean;
  onSelect: () => void;
}

export const RideOptionCard: React.FC<RideOptionCardProps> = ({
  option,
  isSelected,
  onSelect,
}) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const renderIcon = () => {
    const size = 24;
    const color = isSelected ? theme.primary : theme.textPrimary;
    switch (option.type) {
      case 'bike':
        return <Navigation size={size} color={color} />;
      case 'auto':
        return <Zap size={size} color={color} />;
      case 'mini':
        return <Car size={size} color={color} />;
      case 'sedan':
        return <Shield size={size} color={color} />;
      case 'suv':
        return <Truck size={size} color={color} />;
      case 'luxury':
        return <Crown size={size} color="#F59E0B" />;
      default:
        return <Car size={size} color={color} />;
    }
  };

  const getBadgeColor = () => {
    if (option.type === 'bike' || option.tag?.includes('FAST')) {
      return { bg: '#FEF3C7', text: '#D97706' };
    }
    if (option.type === 'auto' || option.tag?.includes('VALUE')) {
      return { bg: '#DCFCE7', text: '#15803D' };
    }
    if (option.type === 'luxury' || option.tag?.includes('LUXURY')) {
      return { bg: '#EDE9FE', text: '#7C3AED' };
    }
    return { bg: theme.primary + '18', text: theme.primary };
  };

  const badgeStyle = getBadgeColor();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isSelected ? (isDarkMode ? '#064E3B30' : '#F0FDF4') : theme.card,
          borderColor: isSelected ? theme.primary : theme.border,
        },
        isSelected ? Shadows.medium : Shadows.small,
      ]}
      activeOpacity={0.85}
      onPress={onSelect}
    >
      {/* Top Banner Tag */}
      {option.tag && (
        <View style={styles.tagWrapper}>
          <View style={[styles.tagBadge, { backgroundColor: badgeStyle.bg }]}>
            <Text style={[styles.tagText, { color: badgeStyle.text }]}>{option.tag}</Text>
          </View>
        </View>
      )}

      <View style={styles.mainRow}>
        {/* Vehicle Icon Container */}
        <View
          style={[
            styles.iconBg,
            {
              backgroundColor: isSelected
                ? theme.primary + '20'
                : isDarkMode
                ? '#1E293B'
                : '#F1F5F9',
              borderColor: isSelected ? theme.primary : 'transparent',
            },
          ]}
        >
          {renderIcon()}
        </View>

        {/* Details Column */}
        <View style={styles.details}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: theme.textPrimary }]}>{option.name}</Text>
            {isSelected && (
              <CheckCircle2 size={16} color={theme.primary} style={{ marginLeft: 6 }} />
            )}
          </View>

          {/* ETA & Capacity Meta Row */}
          <View style={styles.metaRow}>
            <View style={styles.etaPill}>
              <View style={[styles.liveDot, { backgroundColor: theme.primary }]} />
              <Clock size={11} color={theme.primary} style={{ marginRight: 3 }} />
              <Text style={[styles.etaText, { color: theme.primary }]}>{option.eta}</Text>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.pillItem}>
              <User size={11} color={theme.textSecondary} style={{ marginRight: 2 }} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {option.capacity}
              </Text>
            </View>

            {option.luggage && (
              <>
                <View style={styles.metaDivider} />
                <View style={styles.pillItem}>
                  <Luggage size={11} color={theme.textSecondary} style={{ marginRight: 2 }} />
                  <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                    {option.luggage}
                  </Text>
                </View>
              </>
            )}
          </View>

          <Text style={[styles.desc, { color: theme.textMuted }]} numberOfLines={1}>
            {option.description}
          </Text>
        </View>

        {/* Fare Container */}
        <View style={styles.fareContainer}>
          <Text style={[styles.fare, { color: isSelected ? theme.primary : theme.textPrimary }]}>
            {formatCurrency(option.estimatedFare)}
          </Text>
          {option.originalFare && (
            <Text style={[styles.originalFare, { color: theme.textMuted }]}>
              {formatCurrency(option.originalFare)}
            </Text>
          )}
          <Text style={[styles.fareSubtitle, { color: theme.textMuted }]}>
            No surge
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    marginBottom: Spacing.sm + 4,
    padding: Spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  tagWrapper: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBg: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    flexWrap: 'wrap',
  },
  etaPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  etaText: {
    fontSize: 11,
    fontWeight: Typography.weights.semibold,
  },
  metaDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
    marginHorizontal: 6,
  },
  pillItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    fontWeight: Typography.weights.medium,
  },
  desc: {
    fontSize: 11,
    marginTop: 1,
  },
  fareContainer: {
    alignItems: 'flex-end',
    marginLeft: Spacing.sm,
  },
  fare: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  originalFare: {
    fontSize: 11,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  fareSubtitle: {
    fontSize: 9,
    marginTop: 1,
  },
});
