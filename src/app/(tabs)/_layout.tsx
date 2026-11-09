// src/app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { useCartStore } from '@/store/cartStore';
import { 
  Home, 
  ShoppingBag, 
  Utensils, 
  Building2, 
  Grid 
} from 'lucide-react-native';

import { useTranslation } from '@/localization/i18n';

export default function TabsLayout() {
  const { t } = useTranslation();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const cartCount = useCartStore((state) => state.getItemCount());

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.tabActive,
        tabBarInactiveTintColor: theme.tabInactive,
        tabBarStyle: {
          backgroundColor: theme.tabBarBg,
          borderTopColor: theme.tabBarBorder,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('navigation.home'),
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrap}>
              {focused && <View style={[styles.topActiveIndicator, { backgroundColor: theme.primary }]} />}
              <Home size={22} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="grocery"
        options={{
          title: t('home.grocery'),
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrap}>
              {focused && <View style={[styles.topActiveIndicator, { backgroundColor: theme.primary }]} />}
              <ShoppingBag size={22} color={color} />
              {cartCount > 0 && (
                <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="food"
        options={{
          title: t('home.food'),
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrap}>
              {focused && <View style={[styles.topActiveIndicator, { backgroundColor: theme.primary }]} />}
              <Utensils size={22} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="real-estate"
        options={{
          title: t('navigation.realEstate', 'Real Estate'),
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrap}>
              {focused && <View style={[styles.topActiveIndicator, { backgroundColor: theme.primary }]} />}
              <Building2 size={22} color={color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          title: t('navigation.more'),
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconWrap}>
              {focused && <View style={[styles.topActiveIndicator, { backgroundColor: theme.primary }]} />}
              <Grid size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 44,
    height: 28,
  },
  topActiveIndicator: {
    position: 'absolute',
    top: -8,
    width: 32,
    height: 3,
    borderRadius: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
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
    fontWeight: '800',
  },
});
