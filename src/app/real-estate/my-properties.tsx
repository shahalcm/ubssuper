// src/app/real-estate/my-properties.tsx
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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { realEstateService, RealEstateProperty } from '@/services/repositories/realEstateService';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Building2,
  Plus,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  Camera,
  Eye,
} from 'lucide-react-native';

export default function MyPropertiesScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [properties, setProperties] = useState<RealEstateProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadMyProperties = async () => {
    try {
      const list = await realEstateService.getMyProperties();
      setProperties(list);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMyProperties();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadMyProperties();
  };

  const renderPaymentBadge = (status?: string, isPaid?: boolean) => {
    if (isPaid || status === 'paid') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
          <CheckCircle2 size={11} color="#16A34A" style={{ marginRight: 3 }} />
          <Text style={[styles.statusBadgeText, { color: '#166534' }]}>Paid & Verified</Text>
        </View>
      );
    }
    if (status === 'failed') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
          <XCircle size={11} color="#EF4444" style={{ marginRight: 3 }} />
          <Text style={[styles.statusBadgeText, { color: '#991B1B' }]}>Payment Failed</Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
        <Clock size={11} color="#D97706" style={{ marginRight: 3 }} />
        <Text style={[styles.statusBadgeText, { color: '#92400E' }]}>Payment Pending</Text>
      </View>
    );
  };

  const renderApprovalBadge = (approvalStatus: string) => {
    if (approvalStatus === 'approved') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
          <CheckCircle2 size={11} color="#16A34A" style={{ marginRight: 3 }} />
          <Text style={[styles.statusBadgeText, { color: '#166534' }]}>Approved & Live</Text>
        </View>
      );
    }
    if (approvalStatus === 'rejected') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: '#FEE2E2' }]}>
          <AlertTriangle size={11} color="#EF4444" style={{ marginRight: 3 }} />
          <Text style={[styles.statusBadgeText, { color: '#991B1B' }]}>Rejected</Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
        <Clock size={11} color="#D97706" style={{ marginRight: 3 }} />
        <Text style={[styles.statusBadgeText, { color: '#92400E' }]}>Under Admin Review</Text>
      </View>
    );
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>My Properties</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Track listing fee payments & admin approvals
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/real-estate/add-property' as any)}
        >
          <Plus size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.addBtnText}>Add New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.emptySub, { color: theme.textSecondary, marginTop: 12 }]}>
              Loading your properties...
            </Text>
          </View>
        ) : properties.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Building2 size={48} color={theme.textMuted} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No Properties Listed Yet</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              List your villas, apartments, or plots with our dynamic Pay Per Property system to reach verified buyers across Kerala.
            </Text>
            <View style={{ marginTop: 20 }}>
              <Button
                title="+ Add Your First Property"
                onPress={() => router.push('/real-estate/add-property' as any)}
                variant="primary"
                size="md"
              />
            </View>
          </View>
        ) : (
          properties.map((prop) => (
            <TouchableOpacity
              key={prop.id || prop.propertyId}
              activeOpacity={0.92}
              onPress={() => router.push(`/real-estate/${prop.id || prop.propertyId}` as any)}
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, Shadows.medium]}
            >
              {/* Image & Type */}
              <View style={styles.imageBox}>
                <Image
                  source={{
                    uri:
                      prop.images?.[0] ||
                      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
                  }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <View style={styles.purposePill}>
                  <Text style={styles.purposePillText}>
                    {prop.listingType === 'sale' ? 'For Sale' : 'For Rent'} • {prop.propertyType?.toUpperCase()}
                  </Text>
                </View>

                {/* Photo Count Badge */}
                <View style={styles.photoCountBadge}>
                  <Camera size={11} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.photoCountBadgeText}>
                    {prop.images?.length || 1} {prop.images?.length === 1 ? 'Photo' : 'Photos'}
                  </Text>
                </View>
              </View>

              {/* Details */}
              <View style={styles.body}>
                <View style={styles.rowBetween}>
                  <Text style={[styles.priceText, { color: theme.primary }]}>
                    {formatCurrency(prop.price)}
                    {prop.listingType === 'rent' && <Text style={{ fontSize: 12, fontWeight: '400' }}>/mo</Text>}
                  </Text>
                  <Text style={[styles.propIdText, { color: theme.textMuted }]}>#{prop.propertyId}</Text>
                </View>

                <Text style={[styles.titleText, { color: theme.textPrimary }]} numberOfLines={2}>
                  {prop.title}
                </Text>

                <View style={styles.locRow}>
                  <MapPin size={12} color={theme.textMuted} style={{ marginRight: 4 }} />
                  <Text style={[styles.locText, { color: theme.textSecondary }]} numberOfLines={1}>
                    {prop.location}, {prop.city}
                  </Text>
                </View>

                {/* Status Badges Row */}
                <View style={[styles.statusRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View>
                    <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Listing Fee</Text>
                    <View style={{ marginTop: 3 }}>
                      {renderPaymentBadge(prop.status, prop.isPaid)}
                    </View>
                  </View>

                  <View style={styles.vertDivider} />

                  <View>
                    <Text style={[styles.statusLabel, { color: theme.textSecondary }]}>Approval</Text>
                    <View style={{ marginTop: 3 }}>
                      {renderApprovalBadge(prop.approvalStatus)}
                    </View>
                  </View>
                </View>

                {/* Action buttons */}
                <View style={{ marginTop: 12, gap: 8 }}>
                  {!prop.isPaid && (
                    <Button
                      title="Complete Listing Fee Payment →"
                      onPress={() => router.push('/real-estate/add-property' as any)}
                      variant="primary"
                      size="sm"
                    />
                  )}

                  <TouchableOpacity
                    style={[styles.viewDetailsLink, { borderColor: theme.border, backgroundColor: theme.surface }]}
                    onPress={() => router.push(`/real-estate/${prop.id || prop.propertyId}` as any)}
                  >
                    <Eye size={14} color={theme.primary} style={{ marginRight: 6 }} />
                    <Text style={[styles.viewDetailsLinkText, { color: theme.primary }]}>
                      View Customer Detail Screen & Photos
                    </Text>
                    <ChevronRight size={14} color={theme.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    marginRight: Spacing.md,
    padding: 4,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  centerBox: {
    paddingTop: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    padding: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  imageBox: {
    position: 'relative',
    height: 150,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  purposePill: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  purposePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  body: {
    padding: Spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  propIdText: {
    fontSize: 11,
    fontWeight: '600',
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    marginVertical: 4,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locText: {
    fontSize: 12,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  vertDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E2E8F0',
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
  viewDetailsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  viewDetailsLinkText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
});
