// src/app/(tabs)/real-estate.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { AppHeader } from '@/components/ui/Header';
import { SearchBar } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { realEstateService, RealEstateProperty, PropertyListingFee } from '@/services/repositories/realEstateService';
import {
  MapPin,
  Bed,
  Bath,
  Move,
  Plus,
  Building2,
  Sparkles,
  ShieldCheck,
  FolderHeart,
  ChevronRight,
  Camera,
} from 'lucide-react-native';

export default function RealEstateScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [filterType, setFilterType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<RealEstateProperty[]>([]);
  const [listingFee, setListingFee] = useState<PropertyListingFee | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [feeData, propsData] = await Promise.all([
        realEstateService.getListingFee(),
        realEstateService.getProperties({
          search: searchQuery,
          listingType: filterType,
        }),
      ]);
      setListingFee(feeData);
      setProperties(propsData);
    } catch {
      // Handled gracefully in service fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterType, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const activeFeeAmount = listingFee?.isEnabled ? listingFee.amount : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <AppHeader title="Real Estate & Homes" subtitle="Villas, Apartments & Plots across Kerala" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Dynamic Pay Per Listing Banner */}
        <View style={[styles.heroBanner, { backgroundColor: isDarkMode ? '#0F172A' : '#F0FDF4', borderColor: '#BBF7D0' }]}>
          <View style={styles.heroLeft}>
            <View style={styles.heroBadgeRow}>
              <Sparkles size={13} color="#16A34A" style={{ marginRight: 4 }} />
              <Text style={styles.heroBadgeText}>PAY PER LISTING SYSTEM</Text>
            </View>
            <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
              Sell or Rent Your Property Fast
            </Text>
            <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
              {activeFeeAmount === 0
                ? 'FREE promotional listing period active!'
                : `Official listing fee: ${formatCurrency(activeFeeAmount)} per property`}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.addPropertyCta, { backgroundColor: theme.primary }]}
            activeOpacity={0.85}
            onPress={() => router.push('/real-estate/add-property' as any)}
          >
            <Plus size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.addPropertyCtaText}>+ List Property</Text>
          </TouchableOpacity>
        </View>

        {/* Action Shortcut Bar: My Properties */}
        <TouchableOpacity
          style={[styles.myPropsShortcut, { backgroundColor: theme.card, borderColor: theme.border }, Shadows.small]}
          activeOpacity={0.8}
          onPress={() => router.push('/real-estate/my-properties' as any)}
        >
          <View style={styles.myPropsLeft}>
            <View style={[styles.shortcutIconWrap, { backgroundColor: '#16A34A15' }]}>
              <FolderHeart size={18} color="#16A34A" />
            </View>
            <View>
              <Text style={[styles.shortcutTitle, { color: theme.textPrimary }]}>My Listed Properties</Text>
              <Text style={[styles.shortcutSubtitle, { color: theme.textSecondary }]}>
                Track payment verification & admin approval status
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={theme.textMuted} />
        </TouchableOpacity>

        {/* Search */}
        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search villas in Manjeri, Kochi, Calicut..."
            onClear={() => setSearchQuery('')}
          />
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {['All', 'For Sale', 'For Rent'].map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.chip,
                {
                  backgroundColor: filterType === f ? theme.blue : theme.surface,
                  borderColor: filterType === f ? theme.blue : theme.border,
                },
              ]}
              onPress={() => setFilterType(f)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: filterType === f ? '#FFFFFF' : theme.textPrimary },
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.listHeader}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Verified Properties</Text>
          <Text style={[styles.count, { color: theme.textSecondary }]}>{properties.length} Available</Text>
        </View>

        {/* Properties List */}
        <View style={{ paddingHorizontal: Spacing.lg }}>
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={theme.primary} />
            </View>
          ) : properties.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Building2 size={40} color={theme.textMuted} style={{ marginBottom: 10 }} />
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Properties Listed Yet</Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                Real properties listed by verified owners will appear here. Be the first to list!
              </Text>
              <TouchableOpacity
                style={[styles.emptyCtaBtn, { backgroundColor: theme.primary }]}
                onPress={() => router.push('/real-estate/add-property' as any)}
                activeOpacity={0.8}
              >
                <Plus size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.emptyCtaText}>List Your Property</Text>
              </TouchableOpacity>
            </View>
          ) : (
            properties.map((prop) => (
              <TouchableOpacity
                key={prop.id || prop.propertyId}
                activeOpacity={0.9}
                onPress={() => router.push(`/real-estate/${prop.id || prop.propertyId}` as any)}
                style={[
                  styles.card,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  Shadows.medium,
                ]}
              >
                <View style={styles.imageBox}>
                  <Image
                    source={{
                      uri:
                        prop.images?.[0] ||
                        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
                    }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                  <View style={styles.badgeBox}>
                    <Badge
                      label={prop.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                      variant={prop.listingType === 'sale' ? 'primary' : 'warning'}
                    />
                  </View>

                  {/* Multi-Photo Count Badge */}
                  <View style={styles.photoCountBadge}>
                    <Camera size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
                    <Text style={styles.photoCountBadgeText}>
                      {prop.images?.length || 1} {prop.images?.length === 1 ? 'Photo' : 'Photos'}
                    </Text>
                  </View>
                </View>

                <View style={styles.content}>
                  <Text style={[styles.price, { color: theme.textPrimary }]}>
                    {formatCurrency(prop.price)}
                    {prop.listingType === 'rent' && <Text style={{ fontSize: 12, fontWeight: '400' }}>/mo</Text>}
                  </Text>

                  <Text style={[styles.propTitle, { color: theme.textPrimary }]} numberOfLines={2}>
                    {prop.title}
                  </Text>

                  <View style={styles.locRow}>
                    <MapPin size={12} color={theme.textMuted} style={{ marginRight: 3 }} />
                    <Text style={[styles.locText, { color: theme.textSecondary }]} numberOfLines={1}>
                      {prop.location}, {prop.city}
                    </Text>
                  </View>

                  <View style={[styles.specsRow, { backgroundColor: theme.surface }]}>
                    <View style={styles.specItem}>
                      <Bed size={14} color={theme.blue} style={{ marginRight: 4 }} />
                      <Text style={[styles.specText, { color: theme.textSecondary }]}>{prop.bedrooms} Beds</Text>
                    </View>

                    <View style={styles.specItem}>
                      <Bath size={14} color={theme.blue} style={{ marginRight: 4 }} />
                      <Text style={[styles.specText, { color: theme.textSecondary }]}>{prop.bathrooms} Baths</Text>
                    </View>

                    <View style={styles.specItem}>
                      <Move size={14} color={theme.blue} style={{ marginRight: 4 }} />
                      <Text style={[styles.specText, { color: theme.textSecondary }]}>{prop.area}</Text>
                    </View>
                  </View>

                  {/* Footer CTA Link */}
                  <View style={[styles.cardFooterRow, { borderTopColor: theme.border }]}>
                    <Text style={[styles.viewDetailsText, { color: theme.primary }]}>
                      View Full Details & Photos
                    </Text>
                    <ChevronRight size={14} color={theme.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl * 2,
  },
  heroBanner: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLeft: {
    flex: 1,
    marginRight: 10,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  addPropertyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: BorderRadius.full,
  },
  addPropertyCtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  myPropsShortcut: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  myPropsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shortcutIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  shortcutTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  shortcutSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  searchSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  chip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  chipText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  count: {
    fontSize: Typography.sizes.xs,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  imageBox: {
    position: 'relative',
    height: 160,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeBox: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  content: {
    padding: Spacing.md,
  },
  price: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  propTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginVertical: 4,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  locText: {
    fontSize: Typography.sizes.xs,
  },
  specsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyBox: {
    padding: 30,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptySub: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
  },
  emptyCtaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  photoCountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
