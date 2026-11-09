// src/app/logistics/tracking.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { StatusTimeline, TimelineStep } from '@/components/ui/StatusTimeline';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Package, Truck, ShieldCheck, Phone } from 'lucide-react-native';

export default function LogisticsTrackingScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const trackingSteps: TimelineStep[] = [
    { title: 'Booking Created', subtitle: 'Order #LOG-99201', time: '10:00 AM', completed: true, current: false },
    { title: 'Driver Assigned', subtitle: 'Driver Suresh Kumar (Ace KL-10-BX-1122)', time: '10:05 AM', completed: true, current: false },
    { title: 'Picked Up from Manjeri', subtitle: 'Package inspected and loaded', time: '10:25 AM', completed: true, current: false },
    { title: 'In Transit to Kozhikode', subtitle: 'Estimated arrival in 35 mins', completed: false, current: true },
    { title: 'Delivered', subtitle: 'Proof of signature required', completed: false, current: false },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Shipment Tracking</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Tracking Card Header */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }, Shadows.medium]}>
          <View style={styles.topRow}>
            <View>
              <Text style={[styles.waybillLabel, { color: theme.textSecondary }]}>WAYBILL / TRACKING NO</Text>
              <Text style={[styles.waybillNo, { color: theme.textPrimary }]}>UBS-LOG-99201-KL</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: theme.purple + '20' }]}>
              <Text style={[styles.statusText, { color: theme.purple }]}>IN TRANSIT</Text>
            </View>
          </View>

          <View style={[styles.driverBox, { backgroundColor: theme.surface }]}>
            <Truck size={20} color={theme.purple} style={{ marginRight: Spacing.sm }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.driverName, { color: theme.textPrimary }]}>Suresh Kumar (Mini Truck)</Text>
              <Text style={[styles.driverVehicle, { color: theme.textSecondary }]}>KL-10-BX-1122</Text>
            </View>
            <TouchableOpacity style={[styles.callBtn, { backgroundColor: theme.purple }]}>
              <Phone size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineSection}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Tracking Status</Text>
          <StatusTimeline steps={trackingSteps} />
        </View>

        <Button
          title="Back to Super App Home"
          size="lg"
          onPress={() => router.replace('/(tabs)')}
          style={{ marginTop: Spacing.lg, marginBottom: Spacing.xl }}
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
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginVertical: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  waybillLabel: {
    fontSize: 9,
    fontWeight: '700',
  },
  waybillNo: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  driverBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  driverName: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  driverVehicle: {
    fontSize: Typography.sizes.xs,
  },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineSection: {
    marginVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
  },
});
