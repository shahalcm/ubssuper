// src/app/doctors/profile/[id].tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { MOCK_DOCTORS } from '@/services/mock/data';
import { Rating } from '@/components/ui/Rating';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Calendar, Stethoscope, Clock, CheckCircle2 } from 'lucide-react-native';

export default function DoctorProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const doctorId = params.id as string;

  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const doctor = MOCK_DOCTORS.find((d) => d.id === doctorId) || MOCK_DOCTORS[0];

  const [selectedSlot, setSelectedSlot] = useState(doctor.availableSlots[0]?.times[0]);
  const [consultType, setConsultType] = useState<'in_person' | 'online'>('in_person');
  const [confirmed, setConfirmed] = useState(false);

  const handleBookAppointment = () => {
    setConfirmed(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          Doctor Profile
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Doctor Main Box */}
        <View style={styles.docHeaderBox}>
          <Image source={{ uri: doctor.photo }} style={styles.photo} resizeMode="cover" />
          <Text style={[styles.name, { color: theme.textPrimary }]}>{doctor.name}</Text>
          <Text style={[styles.specialty, { color: theme.teal }]}>{doctor.specialty}</Text>
          <Text style={[styles.hospital, { color: theme.textSecondary }]}>{doctor.hospital}</Text>
          <Rating rating={doctor.rating} count={doctor.reviewCount} showBadge />
        </View>

        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Biography</Text>
        <Text style={[styles.bio, { color: theme.textSecondary }]}>{doctor.bio}</Text>

        {/* Consultation Mode */}
        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Consultation Type</Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[
              styles.typeChip,
              {
                backgroundColor: consultType === 'in_person' ? theme.teal : theme.surface,
                borderColor: consultType === 'in_person' ? theme.teal : theme.border,
              },
            ]}
            onPress={() => setConsultType('in_person')}
          >
            <Text style={[styles.typeText, { color: consultType === 'in_person' ? '#FFFFFF' : theme.textPrimary }]}>
              🏥 In-Person Visit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typeChip,
              {
                backgroundColor: consultType === 'online' ? theme.teal : theme.surface,
                borderColor: consultType === 'online' ? theme.teal : theme.border,
              },
            ]}
            onPress={() => setConsultType('online')}
          >
            <Text style={[styles.typeText, { color: consultType === 'online' ? '#FFFFFF' : theme.textPrimary }]}>
              📹 Video Consult
            </Text>
          </TouchableOpacity>
        </View>

        {/* Available Time Slots */}
        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Select Available Slot</Text>
        <View style={styles.slotsGrid}>
          {doctor.availableSlots[0]?.times.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.slotChip,
                {
                  backgroundColor: selectedSlot === time ? theme.teal + '20' : theme.surface,
                  borderColor: selectedSlot === time ? theme.teal : theme.border,
                },
              ]}
              onPress={() => setSelectedSlot(time)}
            >
              <Clock size={14} color={selectedSlot === time ? theme.teal : theme.textMuted} style={{ marginRight: 4 }} />
              <Text
                style={[
                  styles.slotText,
                  { color: selectedSlot === time ? theme.teal : theme.textPrimary },
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footerBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <View>
          <Text style={[styles.footerFeeLabel, { color: theme.textMuted }]}>Consultation Fee</Text>
          <Text style={[styles.footerFeeValue, { color: theme.textPrimary }]}>
            {formatCurrency(doctor.consultationFee)}
          </Text>
        </View>

        <Button
          title={confirmed ? 'Appointment Booked! 🎉' : 'Confirm Appointment'}
          size="lg"
          onPress={handleBookAppointment}
          style={{ minWidth: 160 }}
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100,
  },
  docHeaderBox: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  photo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: Spacing.sm,
  },
  name: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  specialty: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
    marginVertical: 2,
  },
  hospital: {
    fontSize: Typography.sizes.xs + 1,
    marginBottom: Spacing.xs,
  },
  sectionHeading: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  bio: {
    fontSize: Typography.sizes.sm,
    lineHeight: 22,
  },
  typeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Spacing.xs,
  },
  typeChip: {
    width: '48%',
    paddingVertical: Spacing.md - 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: Spacing.xs,
  },
  slotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    marginRight: Spacing.xs + 2,
    marginBottom: Spacing.xs + 2,
  },
  slotText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
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
  footerFeeLabel: {
    fontSize: 10,
  },
  footerFeeValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
});
