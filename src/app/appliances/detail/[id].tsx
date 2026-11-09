// src/app/appliances/detail/[id].tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { useCartStore } from '@/store/cartStore';
import { MOCK_APPLIANCES } from '@/services/mock/data';
import { Rating } from '@/components/ui/Rating';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, ShieldCheck, Wrench } from 'lucide-react-native';

export default function ApplianceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const applianceId = params.id as string;

  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const appliance = MOCK_APPLIANCES.find((a) => a.id === applianceId) || MOCK_APPLIANCES[0];
  const addItem = useCartStore((state) => state.addItem);

  const [addInstallation, setAddInstallation] = useState(true);

  const handleAddToCart = () => {
    const mockProduct = {
      id: appliance.id,
      name: appliance.name,
      category: 'appliances',
      price: appliance.price + (addInstallation ? appliance.installationFee : 0),
      originalPrice: appliance.originalPrice,
      unit: '1 Unit',
      image: appliance.images[0],
      description: appliance.description,
      inStock: true,
    };
    addItem(mockProduct, 1);
    router.push('/cart');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {appliance.name}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: appliance.images[0] }} style={styles.image} resizeMode="contain" />

        <View style={styles.content}>
          <Text style={[styles.brand, { color: theme.indigo }]}>{appliance.brand}</Text>
          <Text style={[styles.name, { color: theme.textPrimary }]}>{appliance.name}</Text>
          <Rating rating={appliance.rating} count={appliance.reviewCount} showBadge />

          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: theme.textPrimary }]}>
              {formatCurrency(appliance.price)}
            </Text>
            {appliance.originalPrice && (
              <Text style={[styles.originalPrice, { color: theme.textMuted }]}>
                {formatCurrency(appliance.originalPrice)}
              </Text>
            )}
          </View>

          {/* Installation Add-on Toggle */}
          {appliance.installationAvailable && (
            <View style={[styles.installBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Wrench size={20} color={theme.indigo} style={{ marginRight: Spacing.sm }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.installTitle, { color: theme.textPrimary }]}>Professional Installation</Text>
                <Text style={[styles.installSub, { color: theme.textSecondary }]}>
                  {appliance.installationFee === 0 ? 'FREE Doorstep Installation' : `Fee: ${formatCurrency(appliance.installationFee)}`}
                </Text>
              </View>
              <Switch
                value={addInstallation}
                onValueChange={setAddInstallation}
                trackColor={{ false: theme.border, true: theme.indigo }}
              />
            </View>
          )}

          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Technical Specifications</Text>
          <View style={[styles.specsBox, { backgroundColor: theme.surface }]}>
            {Object.entries(appliance.specs).map(([key, val]) => (
              <View key={key} style={styles.specRow}>
                <Text style={[styles.specKey, { color: theme.textSecondary }]}>{key}</Text>
                <Text style={[styles.specVal, { color: theme.textPrimary }]}>{val}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Warranty & Support</Text>
          <View style={styles.warrantyRow}>
            <ShieldCheck size={18} color={theme.success} style={{ marginRight: 6 }} />
            <Text style={[styles.warrantyText, { color: theme.textPrimary }]}>
              {appliance.warrantyYears} Years Manufacturer Warranty included.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer Bar */}
      <View style={[styles.footerBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <View>
          <Text style={[styles.footerLabel, { color: theme.textMuted }]}>Total Amount</Text>
          <Text style={[styles.footerPrice, { color: theme.textPrimary }]}>
            {formatCurrency(appliance.price + (addInstallation ? appliance.installationFee : 0))}
          </Text>
        </View>

        <Button
          title="Add Appliance to Cart"
          size="lg"
          onPress={handleAddToCart}
          style={{ minWidth: 180 }}
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
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  image: {
    width: '100%',
    height: 220,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: Spacing.lg,
  },
  brand: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  name: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginVertical: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: Spacing.sm,
  },
  price: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
  },
  originalPrice: {
    fontSize: Typography.sizes.md,
    textDecorationLine: 'line-through',
    marginLeft: Spacing.sm,
  },
  installBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginVertical: Spacing.md,
  },
  installTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  installSub: {
    fontSize: Typography.sizes.xs,
  },
  sectionHeading: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  specsBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  specKey: {
    fontSize: Typography.sizes.xs + 1,
  },
  specVal: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
  },
  warrantyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  warrantyText: {
    fontSize: Typography.sizes.xs + 1,
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  footerLabel: {
    fontSize: 10,
  },
  footerPrice: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
});
