// src/components/cards/DoctorCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Doctor } from '@/types';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { Rating } from '@/components/ui/Rating';
import { Calendar, Stethoscope } from 'lucide-react-native';

interface DoctorCardProps {
  doctor: Doctor;
  onPress: () => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onPress }) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const nextSlot = doctor.availableSlots[0]?.times[0] || '10:00 AM';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
        Shadows.small,
      ]}
      activeOpacity={0.88}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <Image source={{ uri: doctor.photo }} style={styles.photo} resizeMode="cover" />

        <View style={styles.info}>
          <View style={styles.headerRow}>
            <Text style={[styles.name, { color: theme.textPrimary }]} numberOfLines={1}>
              {doctor.name}
            </Text>
            <Rating rating={doctor.rating} count={doctor.reviewCount} />
          </View>

          <View style={styles.specialtyRow}>
            <Stethoscope size={12} color={theme.teal} style={{ marginRight: 4 }} />
            <Text style={[styles.specialty, { color: theme.teal }]}>{doctor.specialty}</Text>
            <Text style={[styles.exp, { color: theme.textSecondary }]}> • {doctor.experienceYears} yrs exp</Text>
          </View>

          <Text style={[styles.hospital, { color: theme.textSecondary }]} numberOfLines={1}>
            {doctor.hospital}
          </Text>

          <Text style={[styles.fee, { color: theme.textPrimary }]}>
            Fee: <Text style={{ fontWeight: '700' }}>{formatCurrency(doctor.consultationFee)}</Text>
          </Text>
        </View>
      </View>

      <View style={[styles.slotRow, { backgroundColor: theme.surface }]}>
        <Calendar size={14} color={theme.teal} style={{ marginRight: 6 }} />
        <Text style={[styles.slotText, { color: theme.textSecondary }]}>
          Next Available: <Text style={{ color: theme.teal, fontWeight: '700' }}>Today, {nextSlot}</Text>
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    padding: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
  },
  photo: {
    width: 76,
    height: 86,
    borderRadius: BorderRadius.md,
    backgroundColor: '#E2E8F0',
  },
  info: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    flex: 1,
    marginRight: Spacing.xs,
  },
  specialtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  specialty: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
  },
  exp: {
    fontSize: Typography.sizes.xs,
  },
  hospital: {
    fontSize: Typography.sizes.xs,
    marginBottom: 4,
  },
  fee: {
    fontSize: Typography.sizes.xs + 1,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm + 2,
  },
  slotText: {
    fontSize: Typography.sizes.xs,
  },
});
