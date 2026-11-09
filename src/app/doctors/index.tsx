// src/app/doctors/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { SearchBar } from '@/components/ui/Input';
import { DoctorCard } from '@/components/cards/DoctorCard';
import { MOCK_DOCTORS } from '@/services/mock/data';
import { ArrowLeft, Stethoscope, Heart, Eye, Baby, Activity } from 'lucide-react-native';

const DOCTOR_CATEGORIES = [
  { name: 'Cardiologist', icon: Heart },
  { name: 'Pediatrician', icon: Baby },
  { name: 'Dentist', icon: Activity },
  { name: 'General Physician', icon: Stethoscope },
];

export default function DoctorsHomeScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  const filteredDoctors = MOCK_DOCTORS.filter((d) => {
    const matchesCat = selectedCat === 'All' || d.specialty === selectedCat;
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Doctor Consultations</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search doctors, specialties, hospitals..."
            onClear={() => setSearchQuery('')}
          />
        </View>

        {/* Categories Grid */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Specialties</Text>
        </View>

        <View style={styles.catGrid}>
          {DOCTOR_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSel = selectedCat === cat.name;
            return (
              <TouchableOpacity
                key={cat.name}
                style={[
                  styles.catCard,
                  {
                    backgroundColor: isSel ? theme.teal : theme.surface,
                    borderColor: isSel ? theme.teal : theme.border,
                  },
                ]}
                onPress={() => setSelectedCat(isSel ? 'All' : cat.name)}
              >
                <Icon size={20} color={isSel ? '#FFFFFF' : theme.teal} style={{ marginBottom: 4 }} />
                <Text style={[styles.catName, { color: isSel ? '#FFFFFF' : theme.textPrimary }]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Top Doctors Near You</Text>
        </View>

        <View>
          {filteredDoctors.map((doc) => (
            <DoctorCard
              key={doc.id}
              doctor={doc}
              onPress={() => router.push(`/doctors/profile/${doc.id}`)}
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
  searchSection: {
    marginVertical: Spacing.md,
  },
  sectionHeader: {
    marginVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  catCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  catName: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
    marginLeft: Spacing.xs,
  },
});
