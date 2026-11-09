// src/app/marketplace/create.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { TextField } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Camera, Tag, MapPin } from 'lucide-react-native';

export default function CreateMarketplaceListingScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Mobiles');
  const [price, setPrice] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [location, setLocation] = useState('Manjeri, Malappuram');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.back();
    }, 1000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Create Classified Listing</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Mock Photo Upload Box */}
        <TouchableOpacity
          style={[styles.uploadBox, { backgroundColor: theme.surface, borderColor: theme.border }]}
          activeOpacity={0.8}
        >
          <Camera size={32} color={theme.primary} style={{ marginBottom: 6 }} />
          <Text style={[styles.uploadText, { color: theme.textPrimary }]}>+ Upload Product Photos</Text>
          <Text style={[styles.uploadSub, { color: theme.textMuted }]}>Add up to 5 clear photos</Text>
        </TouchableOpacity>

        <TextField
          label="Item Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. iPhone 15 Pro Max 256GB"
        />

        <TextField
          label="Category"
          value={category}
          onChangeText={setCategory}
          placeholder="Mobiles, Vehicles, Electronics"
        />

        <TextField
          label="Price (₹)"
          value={price}
          onChangeText={setPrice}
          placeholder="e.g. 25000"
          keyboardType="numeric"
        />

        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>Price is Negotiable</Text>
          <Switch
            value={isNegotiable}
            onValueChange={setIsNegotiable}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>

        <TextField
          label="Location"
          value={location}
          onChangeText={setLocation}
          leftIcon={<MapPin size={18} color={theme.textMuted} />}
        />

        <TextField
          label="Detailed Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe item condition, warranty, usage..."
          multiline
          numberOfLines={4}
          style={{ height: 90, textAlignVertical: 'top' }}
        />

        <Button
          title="Post Listing Now"
          size="lg"
          loading={loading}
          onPress={handleSubmit}
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
  uploadBox: {
    height: 130,
    borderRadius: BorderRadius.xl,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.md,
  },
  uploadText: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  uploadSub: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  switchLabel: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.semibold,
  },
});
