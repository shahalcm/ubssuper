import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { SearchBar } from '@/components/ui/Input';
import { ProductCard } from '@/components/cards/ProductCard';
import { RestaurantCard } from '@/components/cards/RestaurantCard';
import { DoctorCard } from '@/components/cards/DoctorCard';
import { HotelCard } from '@/components/cards/HotelCard';
import { MarketplaceCard } from '@/components/cards/MarketplaceCard';
import { superAppService } from '@/services/repositories/superAppService';
import { ArrowLeft, Clock, X } from 'lucide-react-native';

const RECENT_SEARCHES = ['Biriyani', 'Mangoes', 'Auto Taxi', 'Doctor Anoop', 'iPhone 15'];
const CATEGORY_CHIPS = ['Grocery', 'Food', 'Hotels', 'Doctors', 'Marketplace'];

export default function GlobalSearchScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [query, setQuery] = useState('');
  const [selectedChip, setSelectedChip] = useState('All');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<{
    grocery: any[];
    food: any[];
    hotels: any[];
    doctors: any[];
    marketplace: any[];
  }>({ grocery: [], food: [], hotels: [], doctors: [], marketplace: [] });

  const q = query.toLowerCase().trim();

  useEffect(() => {
    if (!q) {
      setResults({ grocery: [], food: [], hotels: [], doctors: [], marketplace: [] });
      setSearching(false);
      return;
    }

    let isMounted = true;
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await superAppService.searchGlobal(q);
        if (isMounted) {
          setResults({
            grocery: res.grocery || [],
            food: res.food || [],
            hotels: res.hotels || [],
            doctors: res.doctors || [],
            marketplace: res.marketplace || [],
          });
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        if (isMounted) setSearching(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [q]);

  const groceryResults = results.grocery;
  const foodResults = results.food;
  const hotelResults = results.hotels;
  const doctorResults = results.doctors;
  const mpResults = results.marketplace;

  const hasResults =
    groceryResults.length > 0 ||
    foodResults.length > 0 ||
    hotelResults.length > 0 ||
    doctorResults.length > 0 ||
    mpResults.length > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: Spacing.xs }}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Search products, food, rides, doctors..."
            onClear={() => setQuery('')}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {!q ? (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recent Searches</Text>
            </View>

            <View style={styles.recentWrap}>
              {RECENT_SEARCHES.map((term) => (
                <TouchableOpacity
                  key={term}
                  style={[styles.recentChip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={() => setQuery(term)}
                >
                  <Clock size={12} color={theme.textMuted} style={{ marginRight: 4 }} />
                  <Text style={[styles.recentText, { color: theme.textPrimary }]}>{term}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : searching ? (
          <View style={[styles.emptyBox, { paddingVertical: Spacing.xl }]}>
            <ActivityIndicator size="large" color="#16A34A" />
            <Text style={[styles.emptySub, { color: theme.textSecondary, marginTop: Spacing.md }]}>
              Searching live across UBS Super...
            </Text>
          </View>
        ) : !hasResults ? (
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No results found</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              Try searching for "Biriyani", "Mangoes", "Doctor" or "iPhone"
            </Text>
          </View>
        ) : (
          <View>
            {groceryResults.length > 0 && (
              <View style={styles.resultBlock}>
                <Text style={[styles.blockTitle, { color: theme.textPrimary }]}>Grocery Products</Text>
                <FlatList
                  data={groceryResults}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={p => p.id}
                  renderItem={({ item }) => (
                    <ProductCard product={item} onPress={() => router.push(`/grocery/detail/${item.id}`)} />
                  )}
                />
              </View>
            )}

            {foodResults.length > 0 && (
              <View style={styles.resultBlock}>
                <Text style={[styles.blockTitle, { color: theme.textPrimary }]}>Restaurants</Text>
                {foodResults.map(rest => (
                  <RestaurantCard key={rest.id} restaurant={rest} onPress={() => router.push(`/food/restaurant/${rest.id}`)} />
                ))}
              </View>
            )}

            {doctorResults.length > 0 && (
              <View style={styles.resultBlock}>
                <Text style={[styles.blockTitle, { color: theme.textPrimary }]}>Doctors</Text>
                {doctorResults.map(doc => (
                  <DoctorCard key={doc.id} doctor={doc} onPress={() => router.push(`/doctors/profile/${doc.id}`)} />
                ))}
              </View>
            )}
          </View>
        )}
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
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  sectionHeader: {
    marginVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  recentWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.xs + 2,
    marginBottom: Spacing.xs + 2,
  },
  recentText: {
    fontSize: Typography.sizes.xs + 1,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
  },
  emptyTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  emptySub: {
    fontSize: Typography.sizes.xs + 1,
    marginTop: 4,
    textAlign: 'center',
  },
  resultBlock: {
    marginVertical: Spacing.md,
  },
  blockTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
  },
});
