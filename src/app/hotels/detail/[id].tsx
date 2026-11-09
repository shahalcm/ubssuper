// src/app/hotels/detail/[id].tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { MOCK_HOTELS } from '@/services/mock/data';
import { Rating } from '@/components/ui/Rating';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, MapPin, CheckCircle2, ShieldCheck } from 'lucide-react-native';

export default function HotelDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const hotelId = params.id as string;

  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const hotel = MOCK_HOTELS.find((h) => h.id === hotelId) || MOCK_HOTELS[0];
  const [selectedRoomId, setSelectedRoomId] = useState(hotel.roomTypes[0]?.id);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const selectedRoom = hotel.roomTypes.find((r) => r.id === selectedRoomId) || hotel.roomTypes[0];

  const handleBookNow = () => {
    setBookingSuccess(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {hotel.name}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Photo Gallery */}
        <Image source={{ uri: hotel.images[0] }} style={styles.mainImage} resizeMode="cover" />

        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{hotel.name}</Text>
          <View style={styles.locRow}>
            <MapPin size={14} color={theme.textSecondary} style={{ marginRight: 4 }} />
            <Text style={[styles.locText, { color: theme.textSecondary }]}>{hotel.location}</Text>
          </View>
          <Rating rating={hotel.rating} count={hotel.reviewCount} showBadge />

          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Overview</Text>
          <Text style={[styles.overview, { color: theme.textSecondary }]}>{hotel.overview}</Text>

          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {hotel.amenities.map((am, i) => (
              <View key={i} style={[styles.amenityChip, { backgroundColor: theme.surface }]}>
                <CheckCircle2 size={14} color={theme.blue} style={{ marginRight: 4 }} />
                <Text style={[styles.amenityText, { color: theme.textPrimary }]}>{am}</Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Select Room Type</Text>
          {hotel.roomTypes.map((room) => (
            <TouchableOpacity
              key={room.id}
              style={[
                styles.roomCard,
                {
                  backgroundColor: selectedRoomId === room.id ? theme.blue + '10' : theme.surface,
                  borderColor: selectedRoomId === room.id ? theme.blue : theme.border,
                },
              ]}
              onPress={() => setSelectedRoomId(room.id)}
            >
              <View style={styles.roomHeader}>
                <Text style={[styles.roomTitle, { color: theme.textPrimary }]}>{room.title}</Text>
                <Text style={[styles.roomPrice, { color: theme.blue }]}>
                  {formatCurrency(room.price)}/night
                </Text>
              </View>
              <Text style={[styles.roomCap, { color: theme.textSecondary }]}>{room.capacity}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Booking Bar */}
      <View style={[styles.footerBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <View>
          <Text style={[styles.footerLabel, { color: theme.textMuted }]}>Nightly Total</Text>
          <Text style={[styles.footerPrice, { color: theme.textPrimary }]}>
            {formatCurrency(selectedRoom.price)}
          </Text>
        </View>

        <Button
          title={bookingSuccess ? 'Booking Confirmed! 🎉' : 'Book Room Now'}
          size="lg"
          onPress={handleBookNow}
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
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  mainImage: {
    width: '100%',
    height: 220,
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  locText: {
    fontSize: Typography.sizes.xs + 1,
  },
  sectionHeading: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  overview: {
    fontSize: Typography.sizes.sm,
    lineHeight: 22,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.xs + 2,
    marginBottom: Spacing.xs + 2,
  },
  amenityText: {
    fontSize: Typography.sizes.xs,
  },
  roomCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.sm,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  roomPrice: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  roomCap: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
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
