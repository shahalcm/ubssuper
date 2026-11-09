// src/app/appliances/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { SearchBar } from '@/components/ui/Input';
import { MOCK_APPLIANCES } from '@/services/mock/data';
import { Rating } from '@/components/ui/Rating';
import { ArrowLeft, Tv, ShieldCheck } from 'lucide-react-native';

const BRANDS = ['All', 'Samsung', 'LG', 'Whirlpool', 'Sony'];

export default function AppliancesHomeScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');

  const filteredAppliances = MOCK_APPLIANCES.filter((a) => {
    const matchesBrand = selectedBrand === 'All' || a.brand === selectedBrand;
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Home Appliances</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search Smart TVs, Refrigerators, ACs..."
            onClear={() => setSearchQuery('')}
          />
        </View>

        {/* Brands Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandScroll}>
          {BRANDS.map((b) => (
            <TouchableOpacity
              key={b}
              style={[
                styles.chip,
                {
                  backgroundColor: selectedBrand === b ? theme.indigo : theme.surface,
                  borderColor: selectedBrand === b ? theme.indigo : theme.border,
                },
              ]}
              onPress={() => setSelectedBrand(b)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: selectedBrand === b ? '#FFFFFF' : theme.textPrimary },
                ]}
              >
                {b}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Featured Appliances</Text>
        </View>

        <View style={{ paddingHorizontal: Spacing.lg }}>
          {filteredAppliances.map((app) => (
            <TouchableOpacity
              key={app.id}
              style={[
                styles.card,
                { backgroundColor: theme.card, borderColor: theme.border },
                Shadows.medium,
              ]}
              onPress={() => router.push(`/appliances/detail/${app.id}`)}
            >
              <Image source={{ uri: app.images[0] }} style={styles.image} resizeMode="contain" />

              <View style={styles.info}>
                <Text style={[styles.brand, { color: theme.indigo }]}>{app.brand}</Text>
                <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={2}>
                  {app.name}
                </Text>

                <Rating rating={app.rating} count={app.reviewCount} />

                <View style={styles.priceRow}>
                  <Text style={[styles.price, { color: theme.textPrimary }]}>
                    {formatCurrency(app.price)}
                  </Text>
                  {app.originalPrice && (
                    <Text style={[styles.originalPrice, { color: theme.textMuted }]}>
                      {formatCurrency(app.originalPrice)}
                    </Text>
                  )}
                </View>

                <View style={styles.warrantyBadge}>
                  <ShieldCheck size={12} color={theme.success} style={{ marginRight: 4 }} />
                  <Text style={[styles.warrantyText, { color: theme.success }]}>
                    {app.warrantyYears} Years Brand Warranty
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl * 2,
  },
  searchSection: {
    paddingHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
  },
  brandScroll: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.xs + 2,
  },
  chipText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  card: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  image: {
    width: 100,
    height: 110,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  brand: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
    marginVertical: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: 4,
  },
  price: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  originalPrice: {
    fontSize: Typography.sizes.xs,
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  warrantyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  warrantyText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
});
