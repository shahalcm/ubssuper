// src/app/location-picker.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Keyboard,
  Platform,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from '@/components/maps/MapViewWrapper';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { useLocationStore } from '@/store/locationStore';
import {
  locationService,
  PlaceSuggestion,
  GeocodedAddress,
  DEFAULT_COORDINATES,
} from '@/services/locationService';
import { TextField } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Search,
  Navigation,
  MapPin,
  Check,
  X,
  Edit3,
  Building,
  AlertCircle,
  Compass,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LocationPickerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const mapRef = useRef<MapView>(null);
  const locationStore = useLocationStore();

  // Coordinates & Map Region
  const [region, setRegion] = useState<Region>({
    latitude: locationStore.latitude || DEFAULT_COORDINATES.latitude,
    longitude: locationStore.longitude || DEFAULT_COORDINATES.longitude,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
  });

  const [markerCoords, setMarkerCoords] = useState<{ latitude: number; longitude: number }>({
    latitude: locationStore.latitude || DEFAULT_COORDINATES.latitude,
    longitude: locationStore.longitude || DEFAULT_COORDINATES.longitude,
  });

  // Address details of the selected point
  const [selectedAddress, setSelectedAddress] = useState<GeocodedAddress | null>(null);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [isLocatingGPS, setIsLocatingGPS] = useState<boolean>(false);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);

  // Search autocomplete state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState<boolean>(false);
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);

  // Manual Edit Details Modal state
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [manualHouseNumber, setManualHouseNumber] = useState<string>('');
  const [manualStreet, setManualStreet] = useState<string>('');
  const [manualLocality, setManualLocality] = useState<string>('');
  const [manualCity, setManualCity] = useState<string>('');
  const [manualPincode, setManualPincode] = useState<string>('');
  const [manualState, setManualState] = useState<string>('');

  // Status/Error notification
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Reverse geocode initial location on mount
  useEffect(() => {
    fetchAddressForCoords(markerCoords.latitude, markerCoords.longitude);
  }, []);

  // Fetch address for coordinates with debouncing
  const fetchAddressForCoords = async (lat: number, lng: number) => {
    try {
      setIsGeocoding(true);
      setErrorMessage('');
      const addr = await locationService.reverseGeocode(lat, lng);
      setSelectedAddress(addr);
      setManualHouseNumber(addr.houseNumber || '');
      setManualStreet(addr.street || '');
      setManualLocality(addr.locality || '');
      setManualCity(addr.city || 'Manjeri');
      setManualPincode(addr.pincode || '676121');
      setManualState(addr.state || 'Kerala');
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not fetch address details for this pin.');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Handler: User drags the map marker
  const handleMarkerDragEnd = (e: any) => {
    const coords = e.nativeEvent.coordinate;
    setMarkerCoords(coords);
    fetchAddressForCoords(coords.latitude, coords.longitude);
  };

  // Handler: User taps directly on map
  const handleMapPress = (e: any) => {
    if (isSearchActive) {
      setIsSearchActive(false);
      Keyboard.dismiss();
      return;
    }
    const coords = e.nativeEvent.coordinate;
    setMarkerCoords(coords);
    mapRef.current?.animateToRegion(
      {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      },
      300
    );
    fetchAddressForCoords(coords.latitude, coords.longitude);
  };

  // Handler: "Use Current Location" (GPS) Button
  const handleUseCurrentLocation = async () => {
    try {
      setIsLocatingGPS(true);
      setErrorMessage('');
      const coords = await locationService.getCurrentLocation();
      setMarkerCoords({ latitude: coords.latitude, longitude: coords.longitude });

      const newRegion: Region = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 400);

      await fetchAddressForCoords(coords.latitude, coords.longitude);
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to detect device GPS location.');
    } finally {
      setIsLocatingGPS(false);
    }
  };

  // Handler: Search query change with debounced Google Places Autocomplete
  const handleSearchChange = async (text: string) => {
    setSearchQuery(text);
    if (text.trim().length < 2) {
      setSuggestions([]);
      setIsSearchingPlaces(false);
      return;
    }

    try {
      setIsSearchingPlaces(true);
      const results = await locationService.searchPlacesAutocomplete(text, markerCoords);
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearchingPlaces(false);
    }
  };

  // Handler: Select a place from autocomplete suggestions
  const handleSelectPlace = async (item: PlaceSuggestion) => {
    Keyboard.dismiss();
    setIsSearchActive(false);
    setSearchQuery(item.primaryText);
    setSuggestions([]);

    try {
      setIsGeocoding(true);
      const details = await locationService.getPlaceDetails(item.placeId);
      if (details) {
        setMarkerCoords({ latitude: details.latitude, longitude: details.longitude });
        setSelectedAddress(details);
        setManualHouseNumber(details.houseNumber || '');
        setManualStreet(details.street || '');
        setManualLocality(details.locality || '');
        setManualCity(details.city || 'Manjeri');
        setManualPincode(details.pincode || '676121');
        setManualState(details.state || 'Kerala');

        const newRegion: Region = {
          latitude: details.latitude,
          longitude: details.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 400);
      }
    } catch {
      setErrorMessage('Could not load details for selected place.');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Handler: Confirm Selected Location
  const handleConfirmLocation = () => {
    setIsConfirming(true);
    const fullAddress =
      selectedAddress?.fullAddress ||
      [manualHouseNumber, manualStreet, manualLocality, manualCity, `${manualState} ${manualPincode}`]
        .filter(Boolean)
        .join(', ');

    locationStore.setLocation(
      {
        latitude: markerCoords.latitude,
        longitude: markerCoords.longitude,
        address: fullAddress,
        city: manualCity || selectedAddress?.city || 'Manjeri',
        state: manualState || selectedAddress?.state || 'Kerala',
        pincode: manualPincode || selectedAddress?.pincode || '676121',
        district: selectedAddress?.district,
        locality: manualLocality || selectedAddress?.locality,
        street: manualStreet || selectedAddress?.street,
      },
      'gps'
    );

    setIsConfirming(false);
    router.back();
  };

  // Handler: Save manual adjustments
  const handleSaveManualModal = () => {
    const fullAddr = [manualHouseNumber, manualStreet, manualLocality, manualCity, `${manualState} ${manualPincode}`]
      .filter(Boolean)
      .join(', ');

    if (selectedAddress) {
      setSelectedAddress({
        ...selectedAddress,
        fullAddress: fullAddr,
        houseNumber: manualHouseNumber,
        street: manualStreet,
        locality: manualLocality,
        city: manualCity,
        pincode: manualPincode,
        state: manualState,
      });
    }
    setShowManualModal(false);
  };

  return (
    <View style={styles.container}>
      {/* 🗺️ 1. Google Map View */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        onPress={handleMapPress}
      >
        <Marker
          coordinate={markerCoords}
          draggable
          onDragEnd={handleMarkerDragEnd}
          title="Delivery Location"
          description={selectedAddress?.fullAddress || 'Selected Point'}
        >
          {/* Custom Animated Pin */}
          <View style={styles.pinContainer}>
            <View style={styles.pinBubble}>
              <Text style={styles.pinBubbleText} numberOfLines={1}>
                {selectedAddress?.locality || selectedAddress?.city || 'Deliver Here'}
              </Text>
            </View>
            <View style={styles.pinMarkerWrapper}>
              <View style={styles.pinCircle}>
                <MapPin size={18} color="#FFFFFF" />
              </View>
              <View style={styles.pinStem} />
            </View>
            <View style={styles.pinShadow} />
          </View>
        </Marker>
      </MapView>

      {/* 🔝 2. Header & Search Floating Bar */}
      <SafeAreaView style={styles.topOverlay} edges={['top']}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={[styles.roundBtn, { backgroundColor: theme.card }, Shadows.medium]}
            activeOpacity={0.8}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color={theme.textPrimary} />
          </TouchableOpacity>

          {/* Search Input Box */}
          <View style={[styles.searchBox, { backgroundColor: theme.card }, Shadows.medium]}>
            <Search size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Search area, landmark, or apartment..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={handleSearchChange}
              onFocus={() => setIsSearchActive(true)}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearchChange('')}>
                <X size={16} color={theme.textMuted} />
              </TouchableOpacity>
            )}
            {isSearchingPlaces && <ActivityIndicator size="small" color={theme.primary} style={{ marginLeft: 6 }} />}
          </View>
        </View>

        {/* Autocomplete Dropdown List */}
        {isSearchActive && suggestions.length > 0 && (
          <View style={[styles.suggestionsCard, { backgroundColor: theme.card }, Shadows.large]}>
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.placeId}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.suggestionItem, { borderBottomColor: theme.borderLight }]}
                  onPress={() => handleSelectPlace(item)}
                  activeOpacity={0.7}
                >
                  <MapPin size={16} color={theme.primary} style={{ marginTop: 2, marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.suggestionMain, { color: theme.textPrimary }]}>{item.primaryText}</Text>
                    {item.secondaryText ? (
                      <Text style={[styles.suggestionSub, { color: theme.textMuted }]} numberOfLines={1}>
                        {item.secondaryText}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {/* Error Alert Banner */}
        {errorMessage ? (
          <View style={styles.errorBanner}>
            <AlertCircle size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.errorText} numberOfLines={2}>
              {errorMessage}
            </Text>
            <TouchableOpacity onPress={() => setErrorMessage('')}>
              <X size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : null}
      </SafeAreaView>

      {/* 🎯 3. Floating Current Location GPS Button */}
      <View style={styles.rightActionFloat}>
        <TouchableOpacity
          style={[styles.gpsFloatBtn, { backgroundColor: theme.card }, Shadows.large]}
          activeOpacity={0.85}
          onPress={handleUseCurrentLocation}
          disabled={isLocatingGPS}
        >
          {isLocatingGPS ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <Navigation size={22} color={theme.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* 📌 4. Bottom Selected Address Sheet */}
      <View style={[styles.bottomSheet, { backgroundColor: theme.card, paddingBottom: insets.bottom + 16 }, Shadows.large]}>
        <View style={styles.dragHandle} />

        <View style={styles.sheetHeader}>
          <View style={styles.sheetTitleCol}>
            <Text style={[styles.sheetOverline, { color: theme.textMuted }]}>DELIVERING TO</Text>
            <Text style={[styles.sheetTitle, { color: theme.textPrimary }]} numberOfLines={1}>
              {selectedAddress?.locality || selectedAddress?.city || 'Pinpoint Location'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.editDetailsBtn, { borderColor: theme.primary }]}
            activeOpacity={0.75}
            onPress={() => setShowManualModal(true)}
          >
            <Edit3 size={13} color={theme.primary} style={{ marginRight: 4 }} />
            <Text style={[styles.editDetailsText, { color: theme.primary }]}>Edit Details</Text>
          </TouchableOpacity>
        </View>

        {/* Address Card */}
        <View style={[styles.addressDetailBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <MapPin size={20} color={theme.primary} style={{ marginTop: 2, marginRight: 10 }} />
          <View style={{ flex: 1 }}>
            {isGeocoding ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <ActivityIndicator size="small" color={theme.primary} />
                <Text style={{ fontSize: 13, color: theme.textMuted }}>Resolving address...</Text>
              </View>
            ) : (
              <>
                <Text style={[styles.fullAddressText, { color: theme.textPrimary }]}>
                  {selectedAddress?.fullAddress || 'Select a point on Google Maps'}
                </Text>
                <View style={styles.metaRow}>
                  {selectedAddress?.city ? (
                    <Text style={[styles.metaChip, { color: theme.textSecondary }]}>
                      City: {selectedAddress.city}
                    </Text>
                  ) : null}
                  {selectedAddress?.pincode ? (
                    <Text style={[styles.metaChip, { color: theme.textSecondary }]}>
                      PIN: {selectedAddress.pincode}
                    </Text>
                  ) : null}
                </View>
              </>
            )}
          </View>
        </View>

        {/* Confirm Button */}
        <Button
          title={isConfirming ? 'Saving Location...' : 'Confirm Delivery Location'}
          size="lg"
          onPress={handleConfirmLocation}
          disabled={isConfirming || isGeocoding}
          style={styles.confirmBtn}
        />
      </View>

      {/* 📝 5. Manual Edit Address Modal */}
      <Modal visible={showManualModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }, Shadows.large]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Edit Delivery Address</Text>
              <TouchableOpacity onPress={() => setShowManualModal(false)}>
                <X size={20} color={theme.textMuted} />
              </TouchableOpacity>
            </View>

            <TextField
              label="Flat / House / Building *"
              value={manualHouseNumber}
              onChangeText={setManualHouseNumber}
              placeholder="e.g. Flat 402, Rose Villa"
            />

            <TextField
              label="Street / Road / Landmark *"
              value={manualStreet}
              onChangeText={setManualStreet}
              placeholder="e.g. Calicut Road, Near Bus Stand"
            />

            <TextField
              label="Area / Locality"
              value={manualLocality}
              onChangeText={setManualLocality}
              placeholder="e.g. Down Hill, Indiranagar"
            />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <TextField label="City *" value={manualCity} onChangeText={setManualCity} />
              </View>
              <View style={{ flex: 1 }}>
                <TextField
                  label="PIN Code *"
                  value={manualPincode}
                  onChangeText={setManualPincode}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
            </View>

            <Button
              title="Save Changes"
              size="lg"
              onPress={handleSaveManualModal}
              style={{ marginTop: Spacing.md }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: Spacing.md,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: Platform.OS === 'android' ? 8 : 4,
  },
  roundBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    fontWeight: '500',
  },
  suggestionsCard: {
    maxHeight: 240,
    marginTop: 8,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  suggestionMain: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  suggestionSub: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    marginTop: 8,
  },
  errorText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  pinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinBubble: {
    backgroundColor: '#15803D',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  pinBubbleText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  pinMarkerWrapper: {
    alignItems: 'center',
  },
  pinCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  pinStem: {
    width: 4,
    height: 10,
    backgroundColor: '#15803D',
  },
  pinShadow: {
    width: 14,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  rightActionFloat: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: 270,
    zIndex: 5,
  },
  gpsFloatBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: BorderRadius.xl * 1.3,
    borderTopRightRadius: BorderRadius.xl * 1.3,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    zIndex: 10,
  },
  dragHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sheetTitleCol: {
    flex: 1,
  },
  sheetOverline: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sheetTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  editDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  editDetailsText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
  addressDetailBox: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  fullAddressText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  metaChip: {
    fontSize: 11,
    fontWeight: '600',
  },
  confirmBtn: {
    width: '100%',
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
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
});
