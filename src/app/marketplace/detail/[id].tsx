// src/app/marketplace/detail/[id].tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { MOCK_MARKETPLACE } from '@/services/mock/data';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, MapPin, Phone, MessageSquare, ShieldAlert, User } from 'lucide-react-native';

export default function MarketplaceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const itemId = params.id as string;

  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const item = MOCK_MARKETPLACE.find((m) => m.id === itemId) || MOCK_MARKETPLACE[0];

  const handleCall = () => {
    Alert.alert('Call Seller', `Dialing seller ${item.sellerName} at ${item.sellerPhone}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          Item Details
        </Text>
        <TouchableOpacity onPress={() => Alert.alert('Reported', 'Thank you for reporting this listing.')}>
          <ShieldAlert size={20} color={theme.error} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: item.images[0] }} style={styles.image} resizeMode="cover" />

        <View style={styles.content}>
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.textPrimary }]}>
              {formatCurrency(item.price)}
            </Text>
            {item.isNegotiable && <Badge label="Negotiable Price" variant="primary" />}
          </View>

          <Text style={[styles.title, { color: theme.textPrimary }]}>{item.title}</Text>

          <View style={styles.metaRow}>
            <MapPin size={14} color={theme.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.metaText, { color: theme.textSecondary }]}>
              {item.location} • Posted {item.postedDate}
            </Text>
          </View>

          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Item Condition</Text>
          <View style={[styles.conditionChip, { backgroundColor: theme.surface }]}>
            <Text style={[styles.conditionText, { color: theme.primary }]}>{item.condition}</Text>
          </View>

          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Description</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {item.description}
          </Text>

          {/* Seller Card */}
          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Seller Information</Text>
          <View style={[styles.sellerCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.avatar, { backgroundColor: theme.primary + '20' }]}>
              <User size={24} color={theme.primary} />
            </View>

            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={[styles.sellerName, { color: theme.textPrimary }]}>{item.sellerName}</Text>
              <Text style={[styles.sellerMember, { color: theme.textSecondary }]}>
                Member since {item.sellerMemberSince}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action CTA Bar */}
      <View style={[styles.footerBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TouchableOpacity style={[styles.chatBtn, { backgroundColor: theme.surface }]} onPress={handleCall}>
          <MessageSquare size={18} color={theme.textPrimary} style={{ marginRight: 6 }} />
          <Text style={[styles.chatText, { color: theme.textPrimary }]}>Chat</Text>
        </TouchableOpacity>

        <Button
          title="Call Seller Now"
          size="lg"
          icon={<Phone size={18} color="#FFFFFF" style={{ marginRight: 6 }} />}
          onPress={handleCall}
          style={{ flex: 1, marginLeft: Spacing.md }}
        />
      </View>
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
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  image: {
    width: '100%',
    height: 240,
  },
  content: {
    padding: Spacing.lg,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginVertical: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  metaText: {
    fontSize: Typography.sizes.xs + 1,
  },
  sectionHeading: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  conditionChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
  },
  conditionText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
  },
  description: {
    fontSize: Typography.sizes.sm,
    lineHeight: 22,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.xs,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  sellerMember: {
    fontSize: Typography.sizes.xs,
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    height: 48,
    borderRadius: BorderRadius.md,
  },
  chatText: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
});
