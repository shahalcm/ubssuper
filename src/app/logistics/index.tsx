// src/app/logistics/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { TextField } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MOCK_LOGISTICS_VEHICLES } from '@/services/mock/data';
import { ArrowLeft, MapPin, Truck, Package, Clock } from 'lucide-react-native';

export default function LogisticsHomeScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [pickup, setPickup] = useState('Manjeri Industrial Area, Malappuram');
  const [dropoff, setDropoff] = useState('Kozhikode Port Road, Calicut');
  const [goodsDesc, setGoodsDesc] = useState('Electronic Goods & Box Packaging');
  const [weightKg, setWeightKg] = useState('15');
  const [selectedVehicle, setSelectedVehicle] = useState(MOCK_LOGISTICS_VEHICLES[0]);

  const handleCreateShipment = () => {
    router.push('/logistics/tracking');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>UBS Super Logistics</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={[styles.heroBox, { backgroundColor: theme.purple }]}>
          <Package size={28} color="#FFFFFF" style={{ marginBottom: 6 }} />
          <Text style={styles.heroTitle}>Send Anything, Anywhere in Kerala</Text>
          <Text style={styles.heroSubtitle}>Instant goods delivery with doorstep pickup.</Text>
        </View>

        {/* Form Inputs */}
        <View style={[styles.formBox, { backgroundColor: theme.card, borderColor: theme.border }, Shadows.medium]}>
          <TextField
            label="Pickup Address"
            value={pickup}
            onChangeText={setPickup}
            leftIcon={<MapPin size={18} color={theme.purple} />}
          />

          <TextField
            label="Drop-off Address"
            value={dropoff}
            onChangeText={setDropoff}
            leftIcon={<MapPin size={18} color={theme.orange} />}
          />

          <TextField
            label="Goods Description"
            value={goodsDesc}
            onChangeText={setGoodsDesc}
            placeholder="e.g. Furniture, Documents, Appliances"
            leftIcon={<Package size={18} color={theme.textMuted} />}
          />

          <TextField
            label="Package Weight (Kg)"
            value={weightKg}
            onChangeText={setWeightKg}
            keyboardType="numeric"
          />
        </View>

        {/* Vehicle Selection */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Choose Goods Vehicle</Text>
        </View>

        {MOCK_LOGISTICS_VEHICLES.map((veh) => (
          <TouchableOpacity
            key={veh.id}
            style={[
              styles.vehicleCard,
              {
                backgroundColor: selectedVehicle.id === veh.id ? theme.purple + '12' : theme.card,
                borderColor: selectedVehicle.id === veh.id ? theme.purple : theme.border,
              },
            ]}
            onPress={() => setSelectedVehicle(veh)}
          >
            <View style={[styles.vehIconBg, { backgroundColor: theme.surface }]}>
              <Truck size={24} color={theme.purple} />
            </View>

            <View style={styles.vehDetails}>
              <Text style={[styles.vehName, { color: theme.textPrimary }]}>{veh.name}</Text>
              <Text style={[styles.vehMeta, { color: theme.textSecondary }]}>
                Max {veh.capacityKg} kg • {veh.dimensions}
              </Text>
              <Text style={[styles.vehEta, { color: theme.purple }]}>{veh.eta}</Text>
            </View>

            <Text style={[styles.vehFare, { color: theme.textPrimary }]}>
              {formatCurrency(veh.estimatedFare)}
            </Text>
          </TouchableOpacity>
        ))}

        <Button
          title={`Dispatch Shipment (${formatCurrency(selectedVehicle.estimatedFare)})`}
          size="lg"
          onPress={handleCreateShipment}
          style={{ marginTop: Spacing.md, marginBottom: Spacing.xl }}
        />
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  heroBox: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginVertical: Spacing.md,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  heroSubtitle: {
    color: '#F3E8FF',
    fontSize: Typography.sizes.xs + 1,
  },
  formBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  vehIconBg: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  vehDetails: {
    flex: 1,
  },
  vehName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  vehMeta: {
    fontSize: Typography.sizes.xs,
    marginVertical: 2,
  },
  vehEta: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  vehFare: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
});
