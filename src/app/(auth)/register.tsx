import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useLocationStore } from '@/store/locationStore';
import { useThemeStore } from '@/store/themeStore';
import { TextField } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { openPrivacyPolicy, openTermsAndConditions } from '@/utils/legal';
import {
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Navigation,
  Search,
  CheckCircle2,
  CheckSquare,
  Square,
  Building,
  Edit2,
  X,
  Compass,
} from 'lucide-react-native';
import { useTranslation } from '@/localization/i18n';

interface LocationDataState {
  fullAddress: string;
  houseNumber?: string;
  street?: string;
  locality?: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
  country: string;
  coordinates?: [number, number]; // [longitude, latitude]
  source: 'gps' | 'pincode' | 'manual';
}

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const register = useAuthStore((state) => state.register);
  const locationStore = useLocationStore();
  const setStoreAddress = useLocationStore((state) => state.setAddress);
  const addSavedAddress = useLocationStore((state) => state.addSavedAddress);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Location Selection State
  const [selectedLocation, setSelectedLocation] = useState<LocationDataState | null>(null);
  const [locationMode, setLocationMode] = useState<'none' | 'gps' | 'pincode' | 'manual'>('none');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Sync selected location if user used location-picker
  useEffect(() => {
    if (locationStore.latitude && locationStore.longitude && locationStore.currentAddress) {
      setSelectedLocation({
        fullAddress: locationStore.currentAddress,
        houseNumber: locationStore.street,
        street: locationStore.street,
        locality: locationStore.locality,
        city: locationStore.city,
        district: locationStore.district,
        state: locationStore.state,
        pincode: locationStore.pincode,
        country: 'India',
        coordinates: [locationStore.longitude, locationStore.latitude],
        source: locationStore.locationSource || 'gps',
      });
    }
  }, [locationStore.latitude, locationStore.longitude, locationStore.currentAddress]);

  // PIN code lookup form state
  const [pincodeInput, setPincodeInput] = useState('');
  const [isSearchingPin, setIsSearchingPin] = useState(false);
  const [pincodeLocalities, setPincodeLocalities] = useState<string[]>([]);
  const [selectedLocality, setSelectedLocality] = useState('');
  const [pincodeResult, setPincodeResult] = useState<any>(null);

  // Manual address form state
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualHouse, setManualHouse] = useState('');
  const [manualStreet, setManualStreet] = useState('');
  const [manualLocality, setManualLocality] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualDistrict, setManualDistrict] = useState('');
  const [manualState, setManualState] = useState('');
  const [manualPincode, setManualPincode] = useState('');

  // Submission state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ================= 1. USE CURRENT LOCATION (GPS) =================
  const handleUseCurrentLocation = async () => {
    setLocationError('');
    setIsLocating(true);
    setLocationMode('gps');

    try {
      // 1. Request foreground permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission was denied. You can enter your PIN code or address manually.');
        setIsLocating(false);
        return;
      }

      // 2. Fetch current GPS position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      // 3. Reverse geocode to readable address
      const geocoded = await Location.reverseGeocodeAsync({ latitude, longitude });

      if (geocoded && geocoded.length > 0) {
        const item = geocoded[0];
        const house = item.streetNumber || item.name || '';
        const street = item.street || '';
        const locality = item.district || item.subregion || '';
        const city = item.city || item.subregion || 'Manjeri';
        const district = item.subregion || item.city || '';
        const state = item.region || 'Kerala';
        const pincode = item.postalCode || '676121';
        const country = item.country || 'India';

        const fullAddr = [house, street, locality, city, `${state} ${pincode}`]
          .filter(Boolean)
          .join(', ');

        const locData: LocationDataState = {
          fullAddress: fullAddr,
          houseNumber: house,
          street,
          locality,
          city,
          district,
          state,
          pincode,
          country,
          coordinates: [longitude, latitude], // Longitude first (GeoJSON standard)
          source: 'gps',
        };

        setSelectedLocation(locData);
      } else {
        // Fallback with coordinates
        const locData: LocationDataState = {
          fullAddress: `GPS Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          city: 'Kerala',
          state: 'Kerala',
          pincode: '676121',
          country: 'India',
          coordinates: [longitude, latitude],
          source: 'gps',
        };
        setSelectedLocation(locData);
      }
    } catch (err: any) {
      setLocationError(err.message || 'Unable to retrieve current GPS location. Try entering your PIN code.');
    } finally {
      setIsLocating(false);
    }
  };

  // ================= 2. MANUAL PIN CODE LOOKUP =================
  const handleSearchPincode = async () => {
    const cleanPin = pincodeInput.replace(/\D/g, '').slice(0, 6);
    if (cleanPin.length !== 6) {
      setLocationError('Please enter a valid 6-digit Indian postal PIN code.');
      return;
    }

    setLocationError('');
    setIsSearchingPin(true);

    try {
      // Query backend lookup endpoint
      const res: any = await apiClient.get(ENDPOINTS.CUSTOMERS.PINCODE(cleanPin));
      const data = res?.data || res;

      if (data && data.city) {
        setPincodeResult(data);
        setPincodeLocalities(data.localities || []);
        const defaultLocality = data.localities && data.localities[0] ? data.localities[0] : '';
        setSelectedLocality(defaultLocality);

        const fullAddr = [defaultLocality, data.city, `${data.state} - ${data.pincode}`]
          .filter(Boolean)
          .join(', ');

        setSelectedLocation({
          fullAddress: fullAddr,
          locality: defaultLocality,
          city: data.city,
          district: data.district,
          state: data.state,
          pincode: data.pincode,
          country: data.country || 'India',
          coordinates: data.coordinates || [76.1283, 11.1217],
          source: 'pincode',
        });
      } else {
        setLocationError(`PIN code ${cleanPin} not found. Please check digits or enter address manually.`);
      }
    } catch (err: any) {
      setLocationError(err.message || `No location details found for PIN ${cleanPin}. Enter address manually.`);
    } finally {
      setIsSearchingPin(false);
    }
  };

  const handleSelectPincodeLocality = (loc: string) => {
    setSelectedLocality(loc);
    if (pincodeResult) {
      const fullAddr = [loc, pincodeResult.city, `${pincodeResult.state} - ${pincodeResult.pincode}`]
        .filter(Boolean)
        .join(', ');

      setSelectedLocation({
        fullAddress: fullAddr,
        locality: loc,
        city: pincodeResult.city,
        district: pincodeResult.district,
        state: pincodeResult.state,
        pincode: pincodeResult.pincode,
        country: pincodeResult.country || 'India',
        coordinates: pincodeResult.coordinates || [76.1283, 11.1217],
        source: 'pincode',
      });
    }
  };

  // ================= 3. MANUAL ADDRESS SUBMISSION =================
  const handleSaveManualAddress = () => {
    if (!manualCity.trim() || !manualState.trim() || !manualPincode.trim()) {
      setLocationError('City, State, and PIN code are required for manual address.');
      return;
    }

    const fullAddr = [
      manualHouse.trim(),
      manualStreet.trim(),
      manualLocality.trim(),
      manualCity.trim(),
      `${manualState.trim()} - ${manualPincode.trim()}`,
    ]
      .filter(Boolean)
      .join(', ');

    setSelectedLocation({
      fullAddress: fullAddr,
      houseNumber: manualHouse.trim(),
      street: manualStreet.trim(),
      locality: manualLocality.trim(),
      city: manualCity.trim(),
      district: manualDistrict.trim() || manualCity.trim(),
      state: manualState.trim(),
      pincode: manualPincode.trim(),
      country: 'India',
      source: 'manual',
    });

    setShowManualModal(false);
    setLocationError('');
  };

  // ================= SUBMIT REGISTRATION =================
  const handleRegister = async () => {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (confirmPassword && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service to continue.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const locationPayload = selectedLocation
        ? {
            address: {
              fullAddress: selectedLocation.fullAddress,
              houseNumber: selectedLocation.houseNumber,
              street: selectedLocation.street,
              locality: selectedLocation.locality,
              city: selectedLocation.city,
              district: selectedLocation.district,
              state: selectedLocation.state,
              pincode: selectedLocation.pincode,
              country: selectedLocation.country,
            },
            location: selectedLocation.coordinates
              ? {
                  type: 'Point' as const,
                  coordinates: selectedLocation.coordinates,
                }
              : undefined,
            locationSource: selectedLocation.source,
          }
        : undefined;

      await register(name.trim(), cleanPhone, email.trim(), password, locationPayload);

      // Seed local location store
      if (selectedLocation) {
        setStoreAddress(selectedLocation.fullAddress);
        addSavedAddress({
          label: 'Home',
          street: selectedLocation.street || selectedLocation.fullAddress,
          city: selectedLocation.city,
          state: selectedLocation.state,
          pincode: selectedLocation.pincode,
          isDefault: true,
        });
      }

      router.push({
        pathname: '/(auth)/verify-otp',
        params: { phone: cleanPhone },
      });
    } catch (e: any) {
      setError(e.message || 'Registration failed. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerBox}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>UBS</Text>
            </View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>
              {t('auth.createAccount')}
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Join UBS Super to order groceries, food, book rides, and discover local businesses
            </Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: theme.error + '14', borderColor: theme.error + '40' }]}>
              <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
            </View>
          ) : null}

          {/* SECTION 1: PERSONAL DETAILS */}
          <View style={styles.formGroup}>
            <TextField
              label={t('auth.fullName')}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Rahul Sharma"
              leftIcon={<User size={18} color={theme.textMuted} />}
            />

            <Text style={[styles.fieldLabel, { color: theme.textPrimary }]}>
              Mobile Number
            </Text>
            <View style={styles.phoneRow}>
              <View style={[styles.countryCodeBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.countryCodeText, { color: theme.textPrimary }]}>🇮🇳 +91</Text>
              </View>
              <View style={{ flex: 1 }}>
                <TextField
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="10-digit mobile number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  leftIcon={<Phone size={18} color={theme.textMuted} />}
                  containerStyle={{ marginVertical: 0 }}
                />
              </View>
            </View>

            <TextField
              label="Email Address (Optional)"
              value={email}
              onChangeText={setEmail}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={18} color={theme.textMuted} />}
            />

            <TextField
              label={t('auth.password')}
              value={password}
              onChangeText={setPassword}
              placeholder="Create strong password (min 6 chars)"
              secureTextEntry={!showPassword}
              leftIcon={<Lock size={18} color={theme.textMuted} />}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color={theme.textMuted} />
                  ) : (
                    <Eye size={18} color={theme.textMuted} />
                  )}
                </TouchableOpacity>
              }
            />

            <TextField
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter password"
              secureTextEntry={!showConfirmPassword}
              leftIcon={<Lock size={18} color={theme.textMuted} />}
              rightIcon={
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} color={theme.textMuted} />
                  ) : (
                    <Eye size={18} color={theme.textMuted} />
                  )}
                </TouchableOpacity>
              }
            />
          </View>

          {/* SECTION 2: LOCATION & DELIVERY ADDRESS */}
          <View style={styles.locationSection}>
            <View style={styles.sectionHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Compass size={18} color={theme.primary} />
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                  Your Location (Optional)
                </Text>
              </View>
              <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>
                Choose GPS location, enter PIN code, or enter address manually
              </Text>
            </View>

            {locationError ? (
              <View style={[styles.errorBox, { backgroundColor: theme.error + '14', borderColor: theme.error + '40', marginVertical: 6 }]}>
                <Text style={[styles.errorText, { color: theme.error }]}>{locationError}</Text>
              </View>
            ) : null}

            {/* If location is already selected, display confirmation card */}
            {selectedLocation ? (
              <View
                style={[
                  styles.selectedCard,
                  { backgroundColor: isDarkMode ? '#064E3B' : '#ECFDF5', borderColor: '#10B981' },
                ]}
              >
                <View style={styles.selectedCardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={18} color="#059669" />
                    <Text style={styles.selectedTitle}>Selected Delivery Address</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedLocation(null);
                      setLocationMode('none');
                    }}
                    style={styles.changeBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.changeBtnText}>Change</Text>
                  </TouchableOpacity>

                </View>

                <Text style={[styles.selectedAddressText, { color: isDarkMode ? '#D1FAE5' : '#065F46' }]}>
                  {selectedLocation.fullAddress}
                </Text>

                <View style={styles.sourceBadgeRow}>
                  <View style={styles.sourceBadge}>
                    <Text style={styles.sourceBadgeText}>
                      Source: {selectedLocation.source.toUpperCase()}
                    </Text>
                  </View>
                  {selectedLocation.pincode && (
                    <Text style={[styles.pincodeTag, { color: isDarkMode ? '#A7F3D0' : '#047857' }]}>
                      PIN: {selectedLocation.pincode}
                    </Text>
                  )}
                </View>
              </View>
            ) : (
              // Location options buttons
              <View style={styles.locationOptionsContainer}>
                {/* 1. Use Current Location (GPS) */}
                <TouchableOpacity
                  style={[
                    styles.locationOptionBtn,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.primary,
                      borderWidth: 1.5,
                    },
                  ]}
                  onPress={handleUseCurrentLocation}
                  disabled={isLocating}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconCircle, { backgroundColor: theme.primary + '18' }]}>
                    {isLocating ? (
                      <ActivityIndicator size="small" color={theme.primary} />
                    ) : (
                      <Navigation size={20} color={theme.primary} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionMainText, { color: theme.textPrimary }]}>
                      {isLocating ? 'Detecting GPS Location...' : 'Use Current GPS Location'}
                    </Text>
                    <Text style={[styles.optionSubText, { color: theme.textSecondary }]}>
                      Detect latitude & longitude via device GPS
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* 2. Select on Google Map */}
                <TouchableOpacity
                  style={[
                    styles.locationOptionBtn,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      borderWidth: 1,
                      marginTop: 8,
                    },
                  ]}
                  onPress={() => router.push('/location-picker' as any)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconCircle, { backgroundColor: '#22C55E18' }]}>
                    <Compass size={20} color="#16A34A" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionMainText, { color: theme.textPrimary }]}>
                      Select on Google Map
                    </Text>
                    <Text style={[styles.optionSubText, { color: theme.textSecondary }]}>
                      Search places or drop a precise map pin
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* OR Divider */}
                <View style={styles.subDivider}>
                  <View style={[styles.line, { backgroundColor: theme.border }]} />
                  <Text style={[styles.subDividerText, { color: theme.textMuted }]}>OR ENTER BY PIN CODE</Text>
                  <View style={[styles.line, { backgroundColor: theme.border }]} />
                </View>

                {/* 2. Enter PIN Code */}
                <View style={styles.pincodeRow}>
                  <View style={{ flex: 1 }}>
                    <TextField
                      value={pincodeInput}
                      onChangeText={(val) => {
                        setPincodeInput(val);
                        if (val.replace(/\D/g, '').length === 6) {
                          setLocationMode('pincode');
                        }
                      }}
                      placeholder="Enter 6-digit PIN code"
                      keyboardType="number-pad"
                      maxLength={6}
                      leftIcon={<MapPin size={18} color={theme.textMuted} />}
                      containerStyle={{ marginVertical: 0 }}
                    />
                  </View>
                  <TouchableOpacity
                    style={[styles.searchPinBtn, { backgroundColor: theme.primary }]}
                    onPress={handleSearchPincode}
                    disabled={isSearchingPin}
                    activeOpacity={0.8}
                  >
                    {isSearchingPin ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.searchPinBtnText}>Lookup</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Localities selection dropdown/chips if multiple localities returned */}
                {pincodeLocalities.length > 1 && (
                  <View style={styles.localityBox}>
                    <Text style={[styles.localityLabel, { color: theme.textSecondary }]}>
                      Select Locality / Post Office:
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                      {pincodeLocalities.map((loc, i) => (
                        <TouchableOpacity
                          key={i}
                          style={[
                            styles.localityChip,
                            selectedLocality === loc
                              ? { backgroundColor: theme.primary }
                              : { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 },
                          ]}
                          onPress={() => handleSelectPincodeLocality(loc)}
                        >
                          <Text
                            style={{
                              fontSize: Typography.sizes.xs,
                              fontWeight: '600',
                              color: selectedLocality === loc ? '#FFFFFF' : theme.textPrimary,
                            }}
                          >
                            {loc}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* 3. Enter Address Manually */}
                <TouchableOpacity
                  style={styles.manualEntryLink}
                  onPress={() => setShowManualModal(true)}
                  activeOpacity={0.7}
                >
                  <Building size={16} color={theme.primary} style={{ marginRight: 6 }} />
                  <Text style={[styles.manualEntryText, { color: theme.primary }]}>
                    Enter Complete Address Manually
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Terms & Conditions (Explicit un-preselected consent) */}
          <View style={styles.termsRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setAgreeTerms(!agreeTerms)}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              {agreeTerms ? (
                <CheckSquare size={20} color={theme.primary} />
              ) : (
                <Square size={20} color={theme.border} />
              )}
            </TouchableOpacity>
            <Text style={[styles.termsText, { color: theme.textSecondary, flex: 1, marginLeft: 8 }]}>
              I agree to the{' '}
              <Text
                style={{ color: theme.primary, fontWeight: '700' }}
                onPress={() => openTermsAndConditions()}
              >
                Terms of Service
              </Text>
            </Text>
          </View>

          {/* Privacy Policy Reference */}
          <View style={{ marginTop: 6, marginBottom: 10, paddingHorizontal: 4 }}>
            <Text style={{ fontSize: 12, color: theme.textMuted, lineHeight: 18 }}>
              By creating an account, you acknowledge that you have read our{' '}
              <Text
                style={{ color: theme.primary, fontWeight: '700', textDecorationLine: 'underline' }}
                onPress={() => openPrivacyPolicy()}
              >
                Privacy Policy
              </Text>
              .
            </Text>
          </View>

          {/* Submit Button */}
          <Button
            title={loading ? 'Creating Account...' : 'Create Account & Continue'}
            size="lg"
            loading={loading}
            onPress={handleRegister}
            style={{ marginTop: Spacing.xs }}
          />

          {/* Footer Link */}
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              {t('auth.alreadyHaveAccount')}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={[styles.loginText, { color: theme.primary }]}>
                {' '}
                {t('auth.login')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL: MANUAL ADDRESS ENTRY */}
      <Modal visible={showManualModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ width: '100%' }}
          >
            <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  Enter Address Manually
                </Text>
                <TouchableOpacity onPress={() => setShowManualModal(false)}>
                  <X size={20} color={theme.textMuted} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
                <TextField
                  label="House / Flat / Building No."
                  value={manualHouse}
                  onChangeText={setManualHouse}
                  placeholder="e.g. 4B Hillside Palms"
                />

                <TextField
                  label="Street / Road Name"
                  value={manualStreet}
                  onChangeText={setManualStreet}
                  placeholder="e.g. Court Road, Kachery Padi"
                />

                <TextField
                  label="Locality / Area"
                  value={manualLocality}
                  onChangeText={setManualLocality}
                  placeholder="e.g. Near Bus Stand"
                />

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label="City *"
                      value={manualCity}
                      onChangeText={setManualCity}
                      placeholder="e.g. Manjeri"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label="District"
                      value={manualDistrict}
                      onChangeText={setManualDistrict}
                      placeholder="e.g. Malappuram"
                    />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label="State *"
                      value={manualState}
                      onChangeText={setManualState}
                      placeholder="e.g. Kerala"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextField
                      label="PIN Code *"
                      value={manualPincode}
                      onChangeText={setManualPincode}
                      placeholder="e.g. 676121"
                      keyboardType="numeric"
                      maxLength={6}
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={{ marginTop: Spacing.md }}>
                <Button title="Save Address" size="lg" onPress={handleSaveManualAddress} />
              </View>
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
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  headerBox: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#16A34A', // UBS Primary Green
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: Typography.sizes.sm + 1,
    lineHeight: 20,
  },
  errorBox: {
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: Spacing.xs,
  },
  fieldLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.xs,
  },
  countryCodeBox: {
    height: 48,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontWeight: '700',
    fontSize: Typography.sizes.sm,
  },
  locationSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  sectionSub: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  locationOptionsContainer: {
    gap: 10,
  },
  locationOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionMainText: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  optionSubText: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  subDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  line: {
    flex: 1,
    height: 1,
  },
  subDividerText: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 10,
    letterSpacing: 0.5,
  },
  pincodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchPinBtn: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchPinBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: Typography.sizes.sm,
  },
  localityBox: {
    marginTop: 4,
  },
  localityLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  chipScroll: {
    flexDirection: 'row',
  },
  localityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginRight: 6,
  },
  manualEntryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 4,
  },
  manualEntryText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '700',
  },
  selectedCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
  },
  selectedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  selectedTitle: {
    fontWeight: '800',
    fontSize: Typography.sizes.xs + 1,
    color: '#059669',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  changeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
  },
  changeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  selectedAddressText: {
    fontSize: Typography.sizes.sm,
    lineHeight: 18,
    fontWeight: '600',
  },
  sourceBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(5, 150, 105, 0.2)',
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#059669',
  },
  sourceBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 9,
    letterSpacing: 0.5,
  },
  pincodeTag: {
    fontSize: 11,
    fontWeight: '700',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  termsText: {
    fontSize: Typography.sizes.xs,
    marginLeft: Spacing.xs + 2,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
  },
  footerText: {
    fontSize: Typography.sizes.sm,
  },
  loginText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: Spacing.md,
  },
  modalCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },

  modalHeader: {
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
