// src/app/taxi/index.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { useTaxiStore } from '@/store/taxiStore';
import { RideOptionCard } from '@/components/cards/RideOptionCard';
import { Button } from '@/components/ui/Button';
import { showCustomAlert } from '@/store/popupStore';
import MapView, { Marker, Polyline } from '@/components/maps/MapViewWrapper';
import { locationService, PlaceSuggestion } from '@/services/locationService';
import {
  MapPin,
  Navigation,
  ArrowLeft,
  Clock,
  ArrowUpDown,
  ShieldCheck,
  Calendar,
  Wallet,
  Tag,
  Check,
  Compass,
  Car,
  Sparkles,
  ChevronRight,
  Zap,
  LocateFixed,
  X,
  Search,
  Bike,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const QUICK_DESTINATIONS = [
  {
    label: 'Calicut Airport (CCJ)',
    full: 'Calicut International Airport (CCJ), Karipur, Kerala',
    coords: { latitude: 11.1368, longitude: 75.9553 },
    icon: '✈️',
  },
  {
    label: 'Kozhikode Railway',
    full: 'Kozhikode Railway Station, Main Terminal, Palayam',
    coords: { latitude: 11.2483, longitude: 75.7839 },
    icon: '🚉',
  },
  {
    label: 'Kozhikode Beach',
    full: 'Kozhikode Beach Road, Mananchira, Kozhikode',
    coords: { latitude: 11.2588, longitude: 75.7684 },
    icon: '🏖️',
  },
  {
    label: 'HiLITE Mall',
    full: 'HiLITE Mall, NH Bypass, Poovangal, Kozhikode',
    coords: { latitude: 11.2552, longitude: 75.8329 },
    icon: '🛍️',
  },
  {
    label: 'Aster MIMS',
    full: 'Aster MIMS Hospital, Mini Bypass Rd, Govindapuram',
    coords: { latitude: 11.2407, longitude: 75.8035 },
    icon: '🏥',
  },
  {
    label: 'Cyberpark Calicut',
    full: 'Cyberpark SEZ, Nellikkode, Kozhikode',
    coords: { latitude: 11.2778, longitude: 75.8453 },
    icon: '🏢',
  },
  {
    label: 'Manjeri Central',
    full: 'KSRTC Bus Station, Manjeri Central, Malappuram',
    coords: { latitude: 11.1217, longitude: 76.1283 },
    icon: '🚌',
  },
];

const CATEGORY_TABS = [
  { id: 'all', label: 'All Rides' },
  { id: 'commute', label: 'Commute' },
  { id: 'comfort', label: 'Comfort' },
  { id: 'family', label: 'Family & XL' },
];

export default function TaxiHomeScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const mapRef = useRef<any>(null);

  const {
    pickupLocation,
    pickupCoords,
    destinationLocation,
    destinationCoords,
    routeDistanceKm,
    routeDurationMinutes,
    routePolyline,
    rideOptions,
    selectedOption,
    paymentMethod,
    appliedPromo,
    nearbyDrivers,
    isLoadingDrivers,
    isLoadingEstimates,
    isLocatingGps,
    fetchCurrentGpsLocation,
    setPickup,
    setDestination,
    selectOption,
    setPaymentMethod,
    applyPromo,
    removePromo,
    fetchNearbyDrivers,
    startBooking,
  } = useTaxiStore();

  const [activeCategory, setActiveCategory] = useState<'all' | 'commute' | 'comfort' | 'family'>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [inputPromoCode, setInputPromoCode] = useState('');

  // Autocomplete search states
  const [activeSearchField, setActiveSearchField] = useState<'pickup' | 'destination' | null>(null);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const searchTimeoutRef = useRef<any>(null);

  // Initialize GPS pickup location on screen mount
  useEffect(() => {
    fetchCurrentGpsLocation();
  }, []);

  // Fetch nearby drivers whenever coordinates or vehicle category changes
  useEffect(() => {
    if (pickupCoords) {
      fetchNearbyDrivers(pickupCoords, selectedOption?.type);
    }
  }, [selectedOption?.type, pickupCoords?.latitude, pickupCoords?.longitude]);

  // Animate map camera whenever pickup or destination changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (pickupCoords && destinationCoords) {
      // Fit to both coordinates
      const midLat = (pickupCoords.latitude + destinationCoords.latitude) / 2;
      const midLng = (pickupCoords.longitude + destinationCoords.longitude) / 2;
      const latDelta = Math.max(0.04, Math.abs(pickupCoords.latitude - destinationCoords.latitude) * 1.5);
      const lngDelta = Math.max(0.04, Math.abs(pickupCoords.longitude - destinationCoords.longitude) * 1.5);

      mapRef.current.animateToRegion?.({
        latitude: midLat,
        longitude: midLng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      }, 600);
    } else if (pickupCoords) {
      mapRef.current.animateToRegion?.({
        latitude: pickupCoords.latitude,
        longitude: pickupCoords.longitude,
        latitudeDelta: 0.025,
        longitudeDelta: 0.025,
      }, 600);
    }
  }, [pickupCoords?.latitude, pickupCoords?.longitude, destinationCoords?.latitude, destinationCoords?.longitude]);

  // Handle autocomplete search debounced input
  const handleSearchTextChange = (text: string, field: 'pickup' | 'destination') => {
    if (field === 'pickup') {
      setPickup(text);
    } else {
      setDestination(text);
    }

    setActiveSearchField(field);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (text.trim().length < 2) {
      setSuggestions([]);
      setIsSearchingPlaces(false);
      return;
    }

    setIsSearchingPlaces(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const bias = pickupCoords || undefined;
        const results = await locationService.searchPlacesAutocomplete(text, bias);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearchingPlaces(false);
      }
    }, 320);
  };

  // Select place suggestion
  const handleSelectSuggestion = async (item: PlaceSuggestion) => {
    setSuggestions([]);
    setIsSearchingPlaces(false);

    try {
      const details = await locationService.getPlaceDetails(item.placeId);
      const chosenCoords = details
        ? { latitude: details.latitude, longitude: details.longitude }
        : { latitude: 11.2588, longitude: 75.7804 };

      const addressText = details?.fullAddress || item.fullText;

      if (activeSearchField === 'pickup') {
        setPickup(addressText, chosenCoords);
      } else {
        setDestination(addressText, chosenCoords);
      }
    } catch {
      if (activeSearchField === 'pickup') {
        setPickup(item.fullText);
      } else {
        setDestination(item.fullText);
      }
    } finally {
      setActiveSearchField(null);
    }
  };

  // Swap pickup & destination
  const handleSwapLocations = () => {
    const tempLoc = pickupLocation;
    const tempCoords = pickupCoords;
    setPickup(destinationLocation, destinationCoords || undefined);
    setDestination(tempLoc, tempCoords || undefined);
  };

  const handleSelectQuickDest = (item: typeof QUICK_DESTINATIONS[0]) => {
    setActiveSearchField(null);
    setSuggestions([]);
    setDestination(item.full, item.coords);
  };

  const handleRecenterGps = async () => {
    const coords = await fetchCurrentGpsLocation();
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion?.({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 500);
    }
  };

  const handlePickupMarkerDragEnd = async (e: any) => {
    const newCoords = e.nativeEvent?.coordinate;
    if (!newCoords) return;

    const latLng = { latitude: newCoords.latitude, longitude: newCoords.longitude };
    try {
      const geo = await locationService.reverseGeocode(latLng.latitude, latLng.longitude);
      setPickup(geo.fullAddress || `Pinned Point (${latLng.latitude.toFixed(4)}, ${latLng.longitude.toFixed(4)})`, latLng);
    } catch {
      setPickup(`Pinned Location (${latLng.latitude.toFixed(4)}, ${latLng.longitude.toFixed(4)})`, latLng);
    }
  };

  const handleBookNow = async () => {
    if (!pickupLocation || !destinationLocation) {
      showCustomAlert(
        'Missing Destination',
        'Please enter your drop-off point or pick from popular destinations.',
        undefined,
        { type: 'warning' }
      );
      return;
    }
    await startBooking();
    router.push('/taxi/booking');
  };

  // Filter ride options based on category tab
  const filteredOptions = rideOptions.filter((opt) => {
    if (activeCategory === 'all') return true;
    return opt.category === activeCategory;
  });

  // Calculate discounted fare
  const currentFare = selectedOption?.estimatedFare || 140;
  let promoDiscount = 0;
  if (appliedPromo) {
    promoDiscount = Math.min(
      Math.round((currentFare * appliedPromo.discountPercent) / 100),
      appliedPromo.maxDiscount
    );
  }
  const finalCalculatedFare = Math.max(20, currentFare - promoDiscount);

  // Map region fallback
  const initialRegion = {
    latitude: pickupCoords?.latitude || 11.2588,
    longitude: pickupCoords?.longitude || 75.7804,
    latitudeDelta: 0.045,
    longitudeDelta: 0.045,
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>UBS Super Cabs</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Express rides across Malabar & Kerala
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => router.push('/taxi/schedule' as any)}
            style={styles.iconBtn}
          >
            <Calendar size={20} color={theme.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/taxi/safety' as any)}
            style={[styles.iconBtn, { marginLeft: 8 }]}
          >
            <ShieldCheck size={20} color="#16A34A" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/taxi/history')}
            style={[styles.iconBtn, { marginLeft: 8 }]}
          >
            <Clock size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Real Interactive Google Map */}
        <View
          style={[
            styles.mapContainer,
            { backgroundColor: isDarkMode ? '#0F172A' : '#E2E8F0', borderColor: theme.border },
            Shadows.medium,
          ]}
        >
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={initialRegion}
            showsUserLocation={true}
            showsMyLocationButton={false}
          >
            {/* Pickup Marker (Draggable) */}
            {pickupCoords && (
              <Marker
                coordinate={pickupCoords}
                draggable
                onDragEnd={handlePickupMarkerDragEnd}
                title="Pickup Point"
                description={pickupLocation}
              >
                <View style={styles.markerContainer}>
                  <View style={[styles.pinBadge, { backgroundColor: '#16A34A' }]}>
                    <Navigation size={13} color="#FFFFFF" />
                  </View>
                  <View style={styles.pinTip} />
                </View>
              </Marker>
            )}

            {/* Destination Marker */}
            {destinationCoords && (
              <Marker
                coordinate={destinationCoords}
                title="Destination"
                description={destinationLocation}
              >
                <View style={styles.markerContainer}>
                  <View style={[styles.pinBadge, { backgroundColor: '#DC2626' }]}>
                    <MapPin size={13} color="#FFFFFF" />
                  </View>
                  <View style={[styles.pinTip, { borderTopColor: '#DC2626' }]} />
                </View>
              </Marker>
            )}

            {/* Live Driver Markers */}
            {nearbyDrivers.map((driver, idx) => {
              const driverCoords = { latitude: driver.latitude, longitude: driver.longitude };
              const isBike = driver.vehicleType === 'Bike';
              return (
                <Marker
                  key={driver.driverId || idx}
                  coordinate={driverCoords}
                  title={`${driver.fullName} (${driver.vehicleType})`}
                  description={`${driver.vehicleModel} • ${driver.distanceKm || '1.2'} km away`}
                >
                  <View style={styles.driverMarkerBadge}>
                    {isBike ? (
                      <Bike size={12} color="#FFFFFF" />
                    ) : (
                      <Car size={12} color="#FFFFFF" />
                    )}
                  </View>
                </Marker>
              );
            })}

            {/* Route Polyline connecting Pickup to Destination */}
            {routePolyline && routePolyline.length > 1 && (
              <Polyline
                coordinates={routePolyline}
                strokeColor="#16A34A"
                strokeWidth={4.5}
                lineDashPattern={[0]}
              />
            )}
          </MapView>

          {/* Floating Route Telemetry HUD */}
          {routeDistanceKm > 0 && (
            <View style={[styles.mapTelemetryPill, Shadows.small]}>
              <Compass size={13} color="#16A34A" style={{ marginRight: 6 }} />
              <Text style={styles.mapTelemetryText}>
                {routeDistanceKm} km • ~{routeDurationMinutes} mins drive
              </Text>
            </View>
          )}

          {/* Floating Recenter GPS Button */}
          <TouchableOpacity
            style={[styles.recenterGpsBtn, Shadows.medium]}
            onPress={handleRecenterGps}
            activeOpacity={0.8}
          >
            {isLocatingGps ? (
              <ActivityIndicator size="small" color="#16A34A" />
            ) : (
              <LocateFixed size={20} color="#16A34A" />
            )}
          </TouchableOpacity>
        </View>

        {/* Location Inputs with Places Autocomplete */}
        <View
          style={[
            styles.locationCard,
            { backgroundColor: theme.card, borderColor: theme.border },
            Shadows.medium,
          ]}
        >
          {/* Pickup row */}
          <View style={styles.inputRow}>
            <View style={[styles.inputIconCircle, { backgroundColor: '#DCFCE7' }]}>
              <Navigation size={16} color="#15803D" />
            </View>
            <View style={styles.inputTextContainer}>
              <Text style={[styles.inputMetaLabel, { color: theme.textSecondary }]}>
                PICKUP POINT
              </Text>
              <TextInput
                style={[styles.textInput, { color: theme.textPrimary }]}
                value={pickupLocation}
                onChangeText={(t) => handleSearchTextChange(t, 'pickup')}
                onFocus={() => setActiveSearchField('pickup')}
                placeholder="Enter pickup address"
                placeholderTextColor={theme.textMuted}
              />
            </View>
            <TouchableOpacity
              onPress={handleRecenterGps}
              style={[styles.gpsQuickBtn, { backgroundColor: theme.surface }]}
              disabled={isLocatingGps}
            >
              {isLocatingGps ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Text style={[styles.gpsQuickText, { color: theme.primary }]}>GPS</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Intermediate separator with Swap button */}
          <View style={styles.swapDividerRow}>
            <View style={[styles.inputDividerLine, { backgroundColor: theme.border }]} />
            <TouchableOpacity
              onPress={handleSwapLocations}
              style={[
                styles.swapButton,
                { backgroundColor: theme.card, borderColor: theme.border },
                Shadows.small,
              ]}
              activeOpacity={0.7}
            >
              <ArrowUpDown size={14} color={theme.primary} />
            </TouchableOpacity>
            <View style={[styles.inputDividerLine, { backgroundColor: theme.border }]} />
          </View>

          {/* Destination row */}
          <View style={styles.inputRow}>
            <View style={[styles.inputIconCircle, { backgroundColor: '#FEE2E2' }]}>
              <MapPin size={16} color="#DC2626" />
            </View>
            <View style={styles.inputTextContainer}>
              <Text style={[styles.inputMetaLabel, { color: theme.textSecondary }]}>
                DESTINATION
              </Text>
              <TextInput
                style={[styles.textInput, { color: theme.textPrimary }]}
                value={destinationLocation}
                onChangeText={(t) => handleSearchTextChange(t, 'destination')}
                onFocus={() => setActiveSearchField('destination')}
                placeholder="Where to? Airport, Station, Beach..."
                placeholderTextColor={theme.textMuted}
              />
            </View>
            {Boolean(destinationLocation) && (
              <TouchableOpacity
                onPress={() => setDestination('')}
                style={styles.clearInputBtn}
              >
                <X size={15} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Live Autocomplete Suggestions Dropdown */}
          {activeSearchField && (isSearchingPlaces || suggestions.length > 0) && (
            <View
              style={[
                styles.suggestionsDropdown,
                { backgroundColor: theme.card, borderColor: theme.border },
                Shadows.large,
              ]}
            >
              {isSearchingPlaces && (
                <View style={styles.searchingRow}>
                  <ActivityIndicator size="small" color={theme.primary} />
                  <Text style={[styles.searchingText, { color: theme.textSecondary }]}>
                    Searching matching places...
                  </Text>
                </View>
              )}

              {suggestions.map((item) => (
                <TouchableOpacity
                  key={item.placeId}
                  style={[styles.suggestionItem, { borderBottomColor: theme.border }]}
                  onPress={() => handleSelectSuggestion(item)}
                  activeOpacity={0.7}
                >
                  <MapPin size={15} color={theme.primary} style={{ marginTop: 2, marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.suggPrimaryText, { color: theme.textPrimary }]} numberOfLines={1}>
                      {item.primaryText}
                    </Text>
                    {Boolean(item.secondaryText) && (
                      <Text style={[styles.suggSecondaryText, { color: theme.textSecondary }]} numberOfLines={1}>
                        {item.secondaryText}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Quick Destinations Rail */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: Spacing.sm }]}>
          Popular Destinations
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickDestRail}
        >
          {QUICK_DESTINATIONS.map((dest, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.quickDestCard,
                { backgroundColor: theme.card, borderColor: theme.border },
                Shadows.small,
              ]}
              onPress={() => handleSelectQuickDest(dest)}
              activeOpacity={0.7}
            >
              <Text style={styles.quickDestIcon}>{dest.icon}</Text>
              <Text style={[styles.quickDestLabel, { color: theme.textPrimary }]} numberOfLines={1}>
                {dest.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Vehicle Category Tabs */}
        <View style={styles.categoryTabsContainer}>
          {CATEGORY_TABS.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setActiveCategory(cat.id as any)}
                style={[
                  styles.categoryTab,
                  {
                    backgroundColor: isActive ? theme.primary : theme.card,
                    borderColor: isActive ? theme.primary : theme.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    { color: isActive ? '#FFFFFF' : theme.textSecondary, fontWeight: isActive ? '700' : '500' },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Ride Options List with Dynamic Backend Rates */}
        <View style={styles.optionsHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Choose a Ride Tier</Text>
          {isLoadingEstimates && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={{ fontSize: 12, color: theme.primary, fontWeight: '600' }}>
                Calculating fares...
              </Text>
            </View>
          )}
        </View>

        <View style={styles.optionsList}>
          {filteredOptions.map((option) => (
            <RideOptionCard
              key={option.id}
              option={option}
              isSelected={selectedOption?.id === option.id}
              onSelect={() => selectOption(option)}
            />
          ))}
        </View>

        {/* Payment & Promo Bar */}
        <View
          style={[
            styles.paymentBar,
            { backgroundColor: theme.card, borderColor: theme.border },
            Shadows.small,
          ]}
        >
          <TouchableOpacity
            style={styles.paymentSelectBtn}
            onPress={() => setShowPaymentModal(true)}
            activeOpacity={0.7}
          >
            <Wallet size={18} color={theme.primary} />
            <Text style={[styles.paymentMethodText, { color: theme.textPrimary }]}>
              {paymentMethod === 'wallet'
                ? 'UBS Wallet'
                : paymentMethod === 'upi'
                ? 'UPI AutoPay'
                : 'Cash to Driver'}
            </Text>
            <ChevronRight size={14} color={theme.textSecondary} />
          </TouchableOpacity>

          <View style={[styles.barDivider, { backgroundColor: theme.border }]} />

          <TouchableOpacity
            style={styles.promoSelectBtn}
            onPress={() => setShowPromoModal(true)}
            activeOpacity={0.7}
          >
            <Tag size={16} color={appliedPromo ? '#16A34A' : theme.textSecondary} />
            <Text
              style={[
                styles.promoText,
                { color: appliedPromo ? '#16A34A' : theme.textSecondary, fontWeight: appliedPromo ? '700' : '500' },
              ]}
              numberOfLines={1}
            >
              {appliedPromo ? appliedPromo.code : 'Coupons'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Booking CTA Button */}
        <Button
          title={`Book ${selectedOption?.name || 'Ride'} • ${formatCurrency(finalCalculatedFare)}`}
          onPress={handleBookNow}
          variant="primary"
          size="lg"
          style={styles.bookNowBtn}
        />
      </ScrollView>

      {/* Payment Method Selector Modal */}
      <Modal visible={showPaymentModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                Select Payment Mode
              </Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <X size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.paymentList}>
              {[
                { id: 'cash', label: 'Cash on Arrival', desc: 'Pay captain directly via Cash or personal UPI QR' },
                { id: 'upi', label: 'UPI Instant / PhonePe / GPay', desc: 'Direct fast mobile bank transfer' },
                { id: 'wallet', label: 'UBS Super Wallet', desc: 'Balance: ₹850 • 1-tap instant settlement' },
              ].map((m) => {
                const isSelected = paymentMethod === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.paymentOptionItem,
                      {
                        borderColor: isSelected ? theme.primary : theme.border,
                        backgroundColor: isSelected ? theme.primary + '10' : theme.surface,
                      },
                    ]}
                    onPress={() => {
                      setPaymentMethod(m.id as any);
                      setShowPaymentModal(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.paymentOptionTitle, { color: theme.textPrimary }]}>
                        {m.label}
                      </Text>
                      <Text style={[styles.paymentOptionDesc, { color: theme.textSecondary }]}>
                        {m.desc}
                      </Text>
                    </View>
                    {isSelected && <Check size={18} color={theme.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Promo Code Modal */}
      <Modal visible={showPromoModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Apply Promo Code</Text>
              <TouchableOpacity onPress={() => setShowPromoModal(false)}>
                <X size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.promoInputRow}>
              <TextInput
                style={[
                  styles.promoInput,
                  { color: theme.textPrimary, borderColor: theme.border, backgroundColor: theme.surface },
                ]}
                placeholder="Enter coupon code (e.g. SAVE20)"
                placeholderTextColor={theme.textMuted}
                value={inputPromoCode}
                onChangeText={setInputPromoCode}
                autoCapitalize="characters"
              />
              <Button
                title="Apply"
                onPress={() => {
                  const ok = applyPromo(inputPromoCode);
                  if (ok) {
                    showCustomAlert('Coupon Applied!', '20% discount (up to ₹50) applied to your trip.', undefined, { type: 'success' });
                    setShowPromoModal(false);
                    setInputPromoCode('');
                  } else {
                    showCustomAlert('Invalid Code', 'Please enter a valid coupon code like SAVE20 or FIRSTTRIP.', undefined, { type: 'warning' });
                  }
                }}
                variant="primary"
                size="md"
              />
            </View>
          </View>
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
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11.5,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl + 20,
  },
  mapContainer: {
    width: '100%',
    height: 220,
    borderRadius: 22,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.md,
  },
  markerContainer: {
    alignItems: 'center',
  },
  pinBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  pinTip: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#16A34A',
  },
  driverMarkerBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0B4DFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  mapTelemetryPill: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  mapTelemetryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  recenterGpsBtn: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  locationCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: Spacing.md,
    position: 'relative',
    zIndex: 50,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  inputIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  inputTextContainer: {
    flex: 1,
  },
  inputMetaLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  textInput: {
    fontSize: 14,
    fontWeight: '600',
    padding: 0,
    margin: 0,
  },
  gpsQuickBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 6,
  },
  gpsQuickText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  clearInputBtn: {
    padding: 6,
  },
  swapDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  inputDividerLine: {
    flex: 1,
    height: 1,
  },
  swapButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    borderRadius: 16,
    borderWidth: 1.5,
    marginTop: 6,
    maxHeight: 220,
    overflow: 'hidden',
    zIndex: 100,
  },
  searchingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  searchingText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  suggPrimaryText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  suggSecondaryText: {
    fontSize: 11.5,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  quickDestRail: {
    paddingRight: Spacing.md,
    gap: 8,
    marginBottom: Spacing.md,
  },
  quickDestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  quickDestIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  quickDestLabel: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  categoryTabsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryTabText: {
    fontSize: 12,
  },
  optionsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  optionsList: {
    gap: 10,
    marginBottom: Spacing.md,
  },
  paymentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: Spacing.lg,
  },
  paymentSelectBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentMethodText: {
    fontSize: 13,
    fontWeight: '700',
  },
  barDivider: {
    width: 1,
    height: 22,
    marginHorizontal: 10,
  },
  promoSelectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  promoText: {
    fontSize: 13,
  },
  bookNowBtn: {
    borderRadius: 16,
    height: 54,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  paymentList: {
    gap: 10,
    marginBottom: 16,
  },
  paymentOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  paymentOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  paymentOptionDesc: {
    fontSize: 11.5,
  },
  promoInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  promoInput: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '700',
  },
});
