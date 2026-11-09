// src/components/ui/Header.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { useLocationStore } from '@/store/locationStore';
import { useCartStore } from '@/store/cartStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { MapPin, Bell, ShoppingBag, ChevronDown, User as UserIcon } from 'lucide-react-native';

interface HeaderProps {
  showLocation?: boolean;
  showCart?: boolean;
  showBell?: boolean;
  showProfile?: boolean;
  title?: string;
  subtitle?: string;
}

export const AppHeader: React.FC<HeaderProps> = ({
  showLocation = true,
  showCart = true,
  showBell = true,
  showProfile = true,
  title,
  subtitle,
}) => {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const currentAddress = useLocationStore((state) => state.currentAddress);
  const cartItemCount = useCartStore((state) => state.getItemCount());
  const unreadNotifications = useNotificationsStore((state) => state.getUnreadCount());

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {title ? (
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>}
        </View>
      ) : showLocation ? (
        <TouchableOpacity
          style={styles.locationContainer}
          activeOpacity={0.7}
          onPress={() => router.push('/addresses')}
        >
          <View style={[styles.pinBg, { backgroundColor: theme.primary + '18' }]}>
            <MapPin size={18} color={theme.primary} />
          </View>
          <View style={styles.locationTextContainer}>
            <View style={styles.locationRow}>
              <Text style={[styles.locationLabel, { color: theme.textPrimary }]} numberOfLines={1}>
                {currentAddress}
              </Text>
              <ChevronDown size={14} color={theme.textSecondary} style={{ marginLeft: 2 }} />
            </View>
            <Text style={[styles.subLocation, { color: theme.textSecondary }]}>
              Deliver here
            </Text>
          </View>
        </TouchableOpacity>
      ) : <View style={{ flex: 1 }} />}

      <View style={styles.actionsRow}>
        {showBell && (
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.surface }]}
            activeOpacity={0.8}
            onPress={() => router.push('/notifications')}
          >
            <Bell size={20} color={theme.textPrimary} />
            {unreadNotifications > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.error }]}>
                <Text style={styles.badgeText}>{unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {showCart && (
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.surface, marginLeft: Spacing.xs }]}
            activeOpacity={0.8}
            onPress={() => router.push('/cart')}
          >
            <ShoppingBag size={20} color={theme.textPrimary} />
            {cartItemCount > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                <Text style={styles.badgeText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {showProfile && (
          <TouchableOpacity
            style={[styles.profileAvatar, { backgroundColor: theme.primary + '20', marginLeft: Spacing.xs }]}
            activeOpacity={0.8}
            onPress={() => router.push('/profile')}
          >
            <UserIcon size={18} color={theme.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  pinBg: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs + 2,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
    maxWidth: 160,
  },
  subLocation: {
    fontSize: Typography.sizes.xs,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  subtitle: {
    fontSize: Typography.sizes.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  profileAvatar: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
