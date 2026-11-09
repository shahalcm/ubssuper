// src/app/hotels/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { TextField } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { HotelCard } from '@/components/cards/HotelCard';
import { MOCK_HOTELS } from '@/services/mock/data';
import { ArrowLeft, MapPin, Calendar, Users } from 'lucide-react-native';

export default function HotelSearchScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [destination, setDestination] = useState('Kozhikode, Kerala');
  const [checkInDate, setCheckInDate] = useState('15 Oct 2026');
  const [guestsCount, setGuestsCount] = useState('2 Guests, 1 Room');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Hotels & Stays</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search Input Box */}
        <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TextField
            label="Destination City or Hotel"
            value={destination}
            onChangeText={setDestination}
            placeholder="e.g. Kozhikode, Munnar, Kochi"
            leftIcon={<MapPin size={18} color={theme.blue} />}
          />

          <View style={styles.rowTwo}>
            <View style={{ flex: 1, marginRight: Spacing.xs }}>
              <TextField
                label="Check-in Date"
                value={checkInDate}
                onChangeText={setCheckInDate}
                leftIcon={<Calendar size={18} color={theme.blue} />}
              />
            </View>

            <View style={{ flex: 1, marginLeft: Spacing.xs }}>
              <TextField
                label="Guests & Rooms"
                value={guestsCount}
                onChangeText={setGuestsCount}
                leftIcon={<Users size={18} color={theme.blue} />}
              />
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Top Stays in Kerala</Text>
          <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>Instant Confirmation</Text>
        </View>

        <View>
          {MOCK_HOTELS.map((hotel) => (
            <HotelCard
              key={hotel.id}
              hotel={hotel}
              onPress={() => router.push(`/hotels/detail/${hotel.id}`)}
            />
          ))}
        </View>
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
  searchBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginVertical: Spacing.md,
  },
  rowTwo: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  sectionSub: {
    fontSize: Typography.sizes.xs,
  },
});
