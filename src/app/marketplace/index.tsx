// src/app/marketplace/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { SearchBar } from '@/components/ui/Input';
import { MarketplaceCard } from '@/components/cards/MarketplaceCard';
import { MOCK_MARKETPLACE } from '@/services/mock/data';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Plus, Tag } from 'lucide-react-native';

const MP_CATEGORIES = ['All', 'Mobiles', 'Vehicles', 'Furniture', 'Electronics'];

export default function MarketplaceHomeScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  const filteredItems = MOCK_MARKETPLACE.filter((m) => {
    const matchesCat = selectedCat === 'All' || m.category === selectedCat;
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>OLX-Style Marketplace</Text>
        <TouchableOpacity onPress={() => router.push('/marketplace/create')}>
          <Plus size={22} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search iPhones, bikes, furniture in Kerala..."
            onClear={() => setSearchQuery('')}
          />
        </View>

        {/* Categories scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {MP_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.chip,
                {
                  backgroundColor: selectedCat === cat ? theme.purple : theme.surface,
                  borderColor: selectedCat === cat ? theme.purple : theme.border,
                },
              ]}
              onPress={() => setSelectedCat(cat)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: selectedCat === cat ? '#FFFFFF' : theme.textPrimary },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Create Post Banner */}
        <View style={[styles.postBanner, { backgroundColor: theme.purple + '15', borderColor: theme.purple }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.postTitle, { color: theme.textPrimary }]}>Selling something?</Text>
            <Text style={[styles.postSub, { color: theme.textSecondary }]}>
              Post your unused phones, bikes & furniture for free.
            </Text>
          </View>
          <Button
            title="+ Sell Item"
            size="sm"
            onPress={() => router.push('/marketplace/create')}
          />
        </View>

        <View style={styles.listHeader}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Fresh Classified Listings</Text>
        </View>

        <View style={styles.grid}>
          {filteredItems.map((item) => (
            <MarketplaceCard
              key={item.id}
              item={item}
              onPress={() => router.push(`/marketplace/detail/${item.id}`)}
            />
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
  catScroll: {
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
  postBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  postTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  postSub: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  listHeader: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
});
