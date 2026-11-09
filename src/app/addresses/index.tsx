// src/app/addresses/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { useLocationStore } from '@/store/locationStore';
import { TextField } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import {
  ArrowLeft,
  MapPin,
  Plus,
  Check,
  Navigation,
  Compass,
  X,
  Search,
} from 'lucide-react-native';

export default function SavedAddressesScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const { savedAddresses, activeAddressId, selectAddress, addSavedAddress } = useLocationStore();
  const [showAddModal, setShowAddModal] = useState(false);

  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Manjeri');
  const [state, setState] = useState('Kerala');
  const [pincode, setPincode] = useState('676121');

  const [isLocating, setIsLocating] = useState(false);
  const [isSearchingPin, setIsSearchingPin] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // 1. Detect via GPS
  const handleDetectLocation = async () => {
    setStatusMsg('');
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setStatusMsg('Location permission was denied. Please enter address manually.');
        setIsLocating(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const geocoded = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      if (geocoded && geocoded.length > 0) {
        const item = geocoded[0];
        const streetStr = [item.streetNumber || item.name, item.street, item.district]
          .filter(Boolean)
          .join(', ');
        setStreet(streetStr || 'Near Current Location');
        setCity(item.city || item.subregion || 'Manjeri');
        setState(item.region || 'Kerala');
        setPincode(item.postalCode || '676121');
        setStatusMsg('Location filled from GPS coordinates.');
      }
    } catch (e: any) {
      setStatusMsg(e.message || 'Could not detect GPS location.');
    } finally {
      setIsLocating(false);
    }
  };

  // 2. Lookup by PIN code
  const handlePincodeLookup = async () => {
    const cleanPin = pincode.replace(/\D/g, '').slice(0, 6);
    if (cleanPin.length !== 6) {
      setStatusMsg('Please enter a 6-digit PIN code to lookup.');
      return;
    }
    setStatusMsg('');
    setIsSearchingPin(true);
    try {
      const res: any = await apiClient.get(ENDPOINTS.CUSTOMERS.PINCODE(cleanPin));
      const data = res?.data || res;
      if (data && data.city) {
        setCity(data.city);
        setState(data.state);
        if (data.localities && data.localities[0] && !street) {
          setStreet(data.localities[0]);
        }
        setStatusMsg(`Resolved to ${data.city}, ${data.state}`);
      }
    } catch {
      setStatusMsg(`Could not resolve PIN ${cleanPin}. Enter details manually.`);
    } finally {
      setIsSearchingPin(false);
    }
  };

  const handleSaveAddress = () => {
    if (!street.trim()) {
      setStatusMsg('Please enter street or house details.');
      return;
    }
    addSavedAddress({
      label,
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
    });
    setShowAddModal(false);
    setStreet('');
    setStatusMsg('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Saved Addresses</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} activeOpacity={0.7}>
          <Plus size={22} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {savedAddresses.map((addr) => {
          const isSelected = activeAddressId === addr.id;
          return (
            <TouchableOpacity
              key={addr.id}
              style={[
                styles.card,
                {
                  backgroundColor: isSelected ? theme.primary + '12' : theme.card,
                  borderColor: isSelected ? theme.primary : theme.border,
                },
              ]}
              onPress={() => selectAddress(addr.id)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MapPin size={18} color={theme.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.label, { color: theme.textPrimary }]}>{addr.label}</Text>
                </View>

                {isSelected && (
                  <View style={[styles.checkBg, { backgroundColor: theme.primary }]}>
                    <Check size={12} color="#FFFFFF" />
                  </View>
                )}
              </View>

              <Text style={[styles.street, { color: theme.textPrimary }]}>{addr.street}</Text>
              <Text style={[styles.city, { color: theme.textSecondary }]}>
                {addr.city}, {addr.state} - {addr.pincode}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Select Location on Google Maps Button */}
        <TouchableOpacity
          style={[styles.mapPickerBtn, { backgroundColor: theme.primary }]}
          activeOpacity={0.88}
          onPress={() => router.push('/location-picker' as any)}
        >
          <Compass size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.mapPickerBtnText}>Select Location on Google Maps</Text>
        </TouchableOpacity>

        <Button
          title="+ Add Address Manually"
          variant="outline"
          size="lg"
          onPress={() => setShowAddModal(true)}
          style={{ marginTop: Spacing.sm }}
        />
      </ScrollView>

      {/* Add Address Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ width: '100%' }}
          >
            <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
              <View style={styles.modalHeaderRow}>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Add Delivery Address</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <X size={20} color={theme.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Quick GPS & Map Action Buttons */}
              <View style={{ flexDirection: 'row', gap: 10, marginVertical: Spacing.xs }}>
                <TouchableOpacity
                  style={[styles.gpsQuickBtn, { flex: 1, borderColor: theme.primary }]}
                  onPress={handleDetectLocation}
                  disabled={isLocating}
                  activeOpacity={0.8}
                >
                  {isLocating ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <Navigation size={16} color={theme.primary} />
                  )}
                  <Text style={[styles.gpsQuickBtnText, { color: theme.primary }]}>
                    {isLocating ? 'Detecting...' : 'Current GPS'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.gpsQuickBtn, { flex: 1, borderColor: theme.primary, backgroundColor: theme.primary + '12' }]}
                  onPress={() => {
                    setShowAddModal(false);
                    router.push('/location-picker' as any);
                  }}
                  activeOpacity={0.8}
                >
                  <Compass size={16} color={theme.primary} />
                  <Text style={[styles.gpsQuickBtnText, { color: theme.primary }]}>Pick on Map</Text>
                </TouchableOpacity>
              </View>

              {statusMsg ? (
                <Text style={[styles.statusMsg, { color: theme.primary }]}>{statusMsg}</Text>
              ) : null}

              <View style={styles.labelPicker}>
                {(['Home', 'Work', 'Other'] as const).map((l) => (
                  <TouchableOpacity
                    key={l}
                    style={[
                      styles.labelChip,
                      { backgroundColor: label === l ? theme.primary : theme.surface },
                    ]}
                    onPress={() => setLabel(l)}
                  >
                    <Text style={{ color: label === l ? '#FFFFFF' : theme.textPrimary, fontWeight: '700' }}>
                      {l}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextField
                label="House / Street / Landmark *"
                value={street}
                onChangeText={setStreet}
                placeholder="House No., Building, Road Name"
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <TextField
                    label="PIN Code *"
                    value={pincode}
                    onChangeText={setPincode}
                    keyboardType="numeric"
                    maxLength={6}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.pinSearchBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={handlePincodeLookup}
                  disabled={isSearchingPin}
                  activeOpacity={0.8}
                >
                  {isSearchingPin ? (
                    <ActivityIndicator size="small" color={theme.primary} />
                  ) : (
                    <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 12 }}>Lookup</Text>
                  )}
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <TextField label="City *" value={city} onChangeText={setCity} />
                </View>
                <View style={{ flex: 1 }}>
                  <TextField label="State *" value={state} onChangeText={setState} />
                </View>
              </View>

              <Button
                title="Save Address"
                size="lg"
                onPress={handleSaveAddress}
                style={{ width: '100%', marginTop: Spacing.md }}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
    padding: Spacing.lg,
  },
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  checkBg: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  street: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  city: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: Spacing.md,
  },
  modalCard: {
    width: '100%',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  gpsQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    marginVertical: Spacing.xs,
  },
  gpsQuickBtnText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '700',
  },
  statusMsg: {
    fontSize: 11,
    fontWeight: '600',
    marginVertical: 4,
  },
  labelPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  labelChip: {
    width: '30%',
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  pinSearchBtn: {
    height: 48,
    marginTop: 24,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
    shadowColor: '#16A34A',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  mapPickerBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.sm + 1,
    fontWeight: '800',
  },
});
