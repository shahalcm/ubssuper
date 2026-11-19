// src/app/real-estate/add-property.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import * as ImagePicker from 'expo-image-picker';
import {
  realEstateService,
  PropertyListingFee,
  PROPERTY_PHOTO_PRESETS,
  PropertyPhotoPreset,
} from '@/services/repositories/realEstateService';
import { RazorpayCheckoutModal, RazorpayCheckoutOptions } from '@/components/modals/RazorpayCheckoutModal';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Home,
  Tag,
  MapPin,
  Bed,
  Bath,
  Move,
  Phone,
  User,
  X,
  CreditCard,
  Zap,
  Clock,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Plus,
  Trash2,
  Link as LinkIcon,
  Eye,
  Layers,
} from 'lucide-react-native';

const PROPERTY_TYPES = [
  { id: 'villa', label: 'Villa' },
  { id: 'apartment', label: 'Apartment' },
  { id: 'house', label: 'House' },
  { id: 'commercial', label: 'Commercial' },
  { id: 'plot', label: 'Plot' },
];

const AMENITY_OPTIONS = [
  'Covered Parking',
  'Private Garden',
  'Solar Power',
  'Swimming Pool',
  'Gym & Clubhouse',
  '24x7 Security',
  'Borewell & KWA Water',
  'Balcony Deck',
  'Furnished Kitchen',
];

export default function AddPropertyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const user = useAuthStore((state) => state.user);

  // Dynamic listing fee state
  const [listingFee, setListingFee] = useState<PropertyListingFee | null>(null);
  const [loadingFee, setLoadingFee] = useState(true);

  // Property form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('villa');
  const [listingType, setListingType] = useState<'sale' | 'rent'>('sale');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('Calicut Road, Manjeri');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Manjeri');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('3');
  const [area, setArea] = useState('2200 sq.ft');
  const [amenities, setAmenities] = useState<string[]>(['Covered Parking', 'Solar Power']);
  const [contactName, setContactName] = useState(user?.name || 'Direct Owner');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+91 98765 43210');
  const [images, setImages] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isPhotoPickerModal, setIsPhotoPickerModal] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [activePresetCategory, setActivePresetCategory] = useState<string>('All');

  // Flow & Payment states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'review' | 'success'>('form');
  const [createdProperty, setCreatedProperty] = useState<any>(null);

  // Razorpay Checkout Modal State
  const [isRazorpayModal, setIsRazorpayModal] = useState(false);
  const [razorpayOptions, setRazorpayOptions] = useState<RazorpayCheckoutOptions | null>(null);

  // Fetch active listing fee from backend on mount
  useEffect(() => {
    let isMounted = true;
    realEstateService
      .getListingFee()
      .then((fee) => {
        if (isMounted) {
          setListingFee(fee);
          setLoadingFee(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingFee(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleAmenity = (item: string) => {
    if (amenities.includes(item)) {
      setAmenities(amenities.filter((a) => a !== item));
    } else {
      setAmenities([...amenities, item]);
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Gallery access is needed to upload property photos.');
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
        base64: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setIsUploadingPhoto(true);
        const uploadedUrls: string[] = [];
        for (const asset of res.assets) {
          if (asset.base64) {
            try {
              const cloudRes = await realEstateService.uploadImage(`data:image/jpeg;base64,${asset.base64}`);
              uploadedUrls.push(cloudRes.url);
            } catch {
              uploadedUrls.push(asset.uri);
            }
          } else {
            uploadedUrls.push(asset.uri);
          }
        }
        setImages((prev) => [...prev, ...uploadedUrls]);
        setIsUploadingPhoto(false);
        setIsPhotoPickerModal(false);
      }
    } catch (err: any) {
      setIsUploadingPhoto(false);
      Alert.alert('Gallery Error', err.message || 'Could not access device gallery');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is needed to capture property photos.');
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        base64: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setIsUploadingPhoto(true);
        const asset = res.assets[0];
        let photoUrl = asset.uri;
        if (asset.base64) {
          try {
            const cloudRes = await realEstateService.uploadImage(`data:image/jpeg;base64,${asset.base64}`);
            photoUrl = cloudRes.url;
          } catch {
            // keep uri fallback
          }
        }
        setImages((prev) => [...prev, photoUrl]);
        setIsUploadingPhoto(false);
        setIsPhotoPickerModal(false);
      }
    } catch (err: any) {
      setIsUploadingPhoto(false);
      Alert.alert('Camera Error', err.message || 'Could not open camera');
    }
  };

  const handleAddPresetPhoto = (url: string) => {
    if (images.includes(url)) {
      Alert.alert('Already Added', 'This photo is already added to your property gallery.');
      return;
    }
    setImages((prev) => [...prev, url]);
    setIsPhotoPickerModal(false);
  };

  const handleAddCustomUrl = () => {
    if (!customPhotoUrl.trim()) {
      Alert.alert('Enter Image URL', 'Please paste a valid web image URL (e.g. https://...)');
      return;
    }
    setImages((prev) => [...prev, customPhotoUrl.trim()]);
    setCustomPhotoUrl('');
    setIsPhotoPickerModal(false);
  };

  const handleRemovePhoto = (index: number) => {
    if (images.length <= 1) {
      Alert.alert('Keep At Least 1 Photo', 'Properties must have at least one photo for customers to see.');
      return;
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetCoverPhoto = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [chosen] = copy.splice(index, 1);
      copy.unshift(chosen);
      return copy;
    });
  };

  const activeFeeAmount = listingFee?.isEnabled ? listingFee.amount : 0;
  const isFreeListing = activeFeeAmount === 0;

  // Validate form and proceed to Review / Fee Summary
  const handleProceedToReview = () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a property title');
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid property price');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Required Field', 'Please enter the street address');
      return;
    }
    if (!area.trim()) {
      Alert.alert('Required Field', 'Please enter property area (e.g. 2400 sq.ft)');
      return;
    }
    if (images.length === 0) {
      Alert.alert('Photos Required', 'Please add at least one photo so customers can see your property.');
      return;
    }
    setStep('review');
  };

  // Submit property draft and launch payment
  const handleInitiatePaymentAndSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create property draft on backend with images
      const draftRes = await realEstateService.createPropertyDraft({
        title,
        description,
        propertyType,
        listingType,
        price: Number(price),
        location,
        address,
        city,
        bedrooms: Number(bedrooms) || 0,
        bathrooms: Number(bathrooms) || 0,
        area,
        amenities,
        contactName,
        contactPhone,
        images,
      });

      setCreatedProperty(draftRes.property);

      // 2. If listing is free, transition immediately to success
      if (draftRes.isPaid || isFreeListing) {
        setIsSubmitting(false);
        setStep('success');
        return;
      }

      // 3. Create Razorpay Order with server-side validated fee
      const orderData = await realEstateService.createListingOrder(draftRes.property.propertyId);

      setRazorpayOptions({
        keyId: orderData.keyId,
        orderId: orderData.orderId || `order_${draftRes.property.propertyId}`,
        amount: orderData.amount,
        amountInPaise: Math.round(orderData.amount * 100),
        currency: orderData.currency || 'INR',
        name: 'UBS Super Real Estate',
        description: `Listing Fee for ${title}`,
        prefill: {
          name: contactName,
          contact: contactPhone,
        },
        onSuccess: async (paymentResult) => {
          setIsSubmitting(true);
          try {
            const verifyRes = await realEstateService.verifyListingPayment({
              propertyId: draftRes.property.propertyId,
              razorpayOrderId: paymentResult.razorpay_order_id,
              razorpayPaymentId: paymentResult.razorpay_payment_id,
              razorpaySignature: paymentResult.razorpay_signature,
            });

            setIsSubmitting(false);
            setIsRazorpayModal(false);

            if (verifyRes.success) {
              setCreatedProperty(verifyRes.property);
              setStep('success');
            } else {
              Alert.alert('Verification Notice', 'Payment verification could not be confirmed immediately.');
            }
          } catch (err: any) {
            setIsSubmitting(false);
            setIsRazorpayModal(false);
            Alert.alert('Verification Error', err.message || 'Payment verification failed.');
          }
        },
        onFailure: (err) => {
          setIsRazorpayModal(false);
          Alert.alert('Payment Failed', err.message || 'Payment could not be completed.');
        },
        onCancel: () => {
          setIsRazorpayModal(false);
        },
      });

      setIsSubmitting(false);
      setIsRazorpayModal(true);
    } catch (err: any) {
      setIsSubmitting(false);
      Alert.alert('Submission Error', err.message || 'Could not initiate listing fee payment');
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            {step === 'form' ? 'Add Property Listing' : step === 'review' ? 'Review & Listing Fee' : 'Listing Submitted'}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {step === 'form'
              ? 'Kerala Real Estate Marketplace'
              : step === 'review'
              ? 'Pay Per Property Listing System'
              : 'Under Review by Admin'}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* =================================================================== */}
        {/* STEP 1: PROPERTY DETAILS FORM */}
        {/* =================================================================== */}
        {step === 'form' && (
          <View>
            {/* Dynamic Fee Notice Pill */}
            <View style={[styles.feeBanner, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
              <Sparkles size={16} color="#16A34A" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.feeBannerTitle}>
                  Dynamic Property Listing Fee:{' '}
                  {loadingFee ? (
                    'Fetching...'
                  ) : isFreeListing ? (
                    'FREE Special Promotion'
                  ) : (
                    formatCurrency(activeFeeAmount)
                  )}
                </Text>
                <Text style={styles.feeBannerSub}>
                  Managed securely via Admin Panel • Verified on Razorpay
                </Text>
              </View>
            </View>

            {/* Listing Type: For Sale / For Rent */}
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Listing Purpose</Text>
            <View style={styles.tabRow}>
              {(['sale', 'rent'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeTab,
                    listingType === t && { backgroundColor: theme.primary, borderColor: theme.primary },
                    { borderColor: theme.border },
                  ]}
                  onPress={() => setListingType(t)}
                >
                  <Text
                    style={[
                      styles.typeTabText,
                      listingType === t ? { color: '#FFFFFF', fontWeight: '700' } : { color: theme.textPrimary },
                    ]}
                  >
                    {t === 'sale' ? '🏷️ For Sale' : '🔑 For Rent'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Property Type Chips */}
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Property Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {PROPERTY_TYPES.map((pt) => {
                const isSelected = propertyType === pt.id;
                return (
                  <TouchableOpacity
                    key={pt.id}
                    style={[
                      styles.chip,
                      isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                      { borderColor: theme.border, backgroundColor: isSelected ? theme.primary : theme.surface },
                    ]}
                    onPress={() => setPropertyType(pt.id)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected ? { color: '#FFFFFF', fontWeight: '700' } : { color: theme.textPrimary },
                      ]}
                    >
                      {pt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Property Photos Section */}
            <View style={styles.photoSectionHeaderRow}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 2 }]}>
                  Property Photos *
                </Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                  {images.length} photos added • Seen by customers across UBS Super
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.addPhotoSmallBtn, { backgroundColor: theme.primary }]}
                onPress={() => setIsPhotoPickerModal(true)}
              >
                <Plus size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.addPhotoSmallBtnText}>+ Add Photo</Text>
              </TouchableOpacity>
            </View>

            {/* Photos Horizontal Scroll / Grid */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoStripContainer}>
              {images.map((imgUri, index) => (
                <View key={`photo-item-${index}`} style={[styles.photoCard, { borderColor: theme.border }]}>
                  <Image source={{ uri: imgUri }} style={styles.photoThumbnail} resizeMode="cover" />

                  {/* Top Badges */}
                  <View style={styles.photoBadgeOverlay}>
                    {index === 0 ? (
                      <View style={styles.coverPill}>
                        <Sparkles size={9} color="#FFFFFF" style={{ marginRight: 2 }} />
                        <Text style={styles.coverPillText}>Cover Photo</Text>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.setCoverBtn}
                        onPress={() => handleSetCoverPhoto(index)}
                      >
                        <Text style={styles.setCoverBtnText}>Make Cover</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.deletePhotoBtn}
                      onPress={() => handleRemovePhoto(index)}
                    >
                      <X size={12} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {/* Add Photo Card */}
              <TouchableOpacity
                style={[styles.addPhotoCard, { borderColor: theme.primary, backgroundColor: theme.surface }]}
                onPress={() => setIsPhotoPickerModal(true)}
              >
                <View style={[styles.cameraIconCircle, { backgroundColor: theme.primary + '15' }]}>
                  <Camera size={22} color={theme.primary} />
                </View>
                <Text style={[styles.addPhotoCardText, { color: theme.primary }]}>+ Add Photos</Text>
                <Text style={[styles.addPhotoCardSub, { color: theme.textMuted }]}>Gallery / Presets</Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Quick Architectural Presets Shortcut Bar */}
            <View style={[styles.presetBarWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.presetBarHeader}>
                <Sparkles size={13} color="#16A34A" style={{ marginRight: 5 }} />
                <Text style={[styles.presetBarTitle, { color: theme.textPrimary }]}>Quick Architectural Presets</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetChipsRow}>
                {PROPERTY_PHOTO_PRESETS.slice(0, 6).map((preset) => {
                  const isAdded = images.includes(preset.url);
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={[
                        styles.presetChip,
                        {
                          backgroundColor: isAdded ? '#16A34A18' : theme.card,
                          borderColor: isAdded ? '#16A34A' : theme.border,
                        },
                      ]}
                      onPress={() => handleAddPresetPhoto(preset.url)}
                    >
                      <Image source={{ uri: preset.url }} style={styles.presetChipThumb} />
                      <Text
                        style={[
                          styles.presetChipText,
                          { color: isAdded ? '#16A34A' : theme.textPrimary, fontWeight: isAdded ? '700' : '500' },
                        ]}
                      >
                        {isAdded ? '✓ ' : '+ '}
                        {preset.category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Basic Info */}
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Property Information</Text>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Property Title *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="e.g. 3 BHK Luxury Villa in Manjeri"
                placeholderTextColor={theme.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Expected Price (₹) {listingType === 'rent' ? '/month' : ''} *
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="e.g. 8500000"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Description</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="Describe features, nearby landmarks, quality of construction..."
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Specs Row */}
            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1, marginRight: Spacing.sm }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Bedrooms</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
                  keyboardType="numeric"
                  value={bedrooms}
                  onChangeText={setBedrooms}
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1, marginRight: Spacing.sm }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Bathrooms</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
                  keyboardType="numeric"
                  value={bathrooms}
                  onChangeText={setBathrooms}
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Area *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
                  placeholder="2400 sq.ft"
                  placeholderTextColor={theme.textMuted}
                  value={area}
                  onChangeText={setArea}
                />
              </View>
            </View>

            {/* Location */}
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Location & Address</Text>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Locality / Area *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="e.g. Calicut Road, Manjeri, Malappuram"
                placeholderTextColor={theme.textMuted}
                value={location}
                onChangeText={setLocation}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Full Address *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="Plot/Door No, Street Name, Landmark"
                placeholderTextColor={theme.textMuted}
                value={address}
                onChangeText={setAddress}
              />
            </View>

            {/* Amenities */}
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Amenities & Features</Text>
            <View style={styles.amenitiesWrap}>
              {AMENITY_OPTIONS.map((a) => {
                const isSelected = amenities.includes(a);
                return (
                  <TouchableOpacity
                    key={a}
                    style={[
                      styles.amenityChip,
                      isSelected && { backgroundColor: theme.primary + '15', borderColor: theme.primary },
                      { borderColor: theme.border },
                    ]}
                    onPress={() => toggleAmenity(a)}
                  >
                    <Text
                      style={[
                        styles.amenityText,
                        isSelected ? { color: theme.primary, fontWeight: '700' } : { color: theme.textSecondary },
                      ]}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {a}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Contact Details */}
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Contact Information</Text>

            <View style={styles.row}>
              <View style={[styles.fieldGroup, { flex: 1, marginRight: Spacing.sm }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Contact Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
                  value={contactName}
                  onChangeText={setContactName}
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Phone Number</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
                  value={contactPhone}
                  onChangeText={setContactPhone}
                />
              </View>
            </View>

            {/* Submit CTA */}
            <View style={styles.submitWrap}>
              <Button
                title={`Review & Pay Listing Fee (${isFreeListing ? 'FREE' : formatCurrency(activeFeeAmount)})`}
                onPress={handleProceedToReview}
                variant="primary"
                size="lg"
                icon={<ArrowLeft size={18} color="#FFFFFF" style={{ transform: [{ rotate: '180deg' }] }} />}
              />
            </View>
          </View>
        )}

        {/* =================================================================== */}
        {/* STEP 2: REVIEW & DYNAMIC LISTING FEE PAYMENT SUMMARY */}
        {/* =================================================================== */}
        {step === 'review' && (
          <View>
            {/* Property Summary Card */}
            <View style={[styles.reviewCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadows.medium]}>
              <Image source={{ uri: images[0] }} style={styles.reviewImage} resizeMode="cover" />

              {/* Multi-Photo Preview Strip in Review */}
              {images.length > 1 && (
                <View style={[styles.reviewPhotoStrip, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 12, paddingVertical: 8 }}>
                    {images.map((img, idx) => (
                      <View key={`rev-thumb-${idx}`} style={styles.reviewThumbWrap}>
                        <Image source={{ uri: img }} style={styles.reviewThumbImg} resizeMode="cover" />
                        {idx === 0 && (
                          <View style={styles.coverBadgeMini}>
                            <Text style={styles.coverBadgeMiniText}>Cover</Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={styles.reviewBody}>
                <View style={styles.badgeRow}>
                  <View style={[styles.typeBadge, { backgroundColor: theme.primary + '15' }]}>
                    <Text style={[styles.typeBadgeText, { color: theme.primary }]}>
                      {listingType === 'sale' ? 'For Sale' : 'For Rent'} • {propertyType.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.reviewTitle, { color: theme.textPrimary }]}>{title}</Text>
                <Text style={[styles.reviewPrice, { color: theme.primary }]}>
                  {formatCurrency(Number(price))}
                  {listingType === 'rent' && <Text style={{ fontSize: 13, fontWeight: '400' }}>/mo</Text>}
                </Text>

                <View style={styles.reviewLocRow}>
                  <MapPin size={14} color={theme.textMuted} style={{ marginRight: 4 }} />
                  <Text style={[styles.reviewLoc, { color: theme.textSecondary }]}>
                    {location}, {city}
                  </Text>
                </View>

                <View style={[styles.specsBar, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.specBarText, { color: theme.textPrimary }]}>{bedrooms} Beds</Text>
                  <Text style={{ color: theme.border }}>•</Text>
                  <Text style={[styles.specBarText, { color: theme.textPrimary }]}>{bathrooms} Baths</Text>
                  <Text style={{ color: theme.border }}>•</Text>
                  <Text style={[styles.specBarText, { color: theme.textPrimary }]}>{area}</Text>
                </View>
              </View>
            </View>

            {/* Professional Payment Summary */}
            <View style={[styles.paymentSummaryCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadows.medium]}>
              <View style={styles.paySummaryHeader}>
                <CreditCard size={20} color="#16A34A" style={{ marginRight: 8 }} />
                <Text style={[styles.paySummaryTitle, { color: theme.textPrimary }]}>
                  Property Listing Fee
                </Text>
              </View>

              <View style={styles.summaryLine}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Property:</Text>
                <Text style={[styles.summaryValue, { color: theme.textPrimary }]} numberOfLines={1}>
                  {title}
                </Text>
              </View>

              <View style={styles.summaryLine}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Listing Fee:</Text>
                <Text style={[styles.summaryValue, { color: theme.primary, fontWeight: '800', fontSize: 16 }]}>
                  {isFreeListing ? '₹0 (Free Promotion)' : formatCurrency(activeFeeAmount)}
                </Text>
              </View>

              <View style={styles.summaryLine}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Payment Status:</Text>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>Pending</Text>
                </View>
              </View>

              <View style={styles.summaryLine}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Currency:</Text>
                <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>INR (₹)</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.instructionsBox}>
                <ShieldCheck size={16} color="#16A34A" style={{ marginRight: 8 }} />
                <Text style={[styles.instructionsText, { color: theme.textSecondary }]}>
                  Fee is dynamically determined by Admin policy. Each successful payment authorizes 1 property listing. Once verified on Razorpay, your property moves to Admin Approval.
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.backOutlineBtn, { borderColor: theme.border }]}
                onPress={() => setStep('form')}
              >
                <Text style={[styles.backOutlineText, { color: theme.textPrimary }]}>← Edit Details</Text>
              </TouchableOpacity>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <Button
                  title={
                    isFreeListing
                      ? 'Submit Property (Free)'
                      : `Pay ${formatCurrency(activeFeeAmount)} & Submit Property`
                  }
                  onPress={handleInitiatePaymentAndSubmit}
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  icon={<ShieldCheck size={18} color="#FFFFFF" />}
                />
              </View>
            </View>
          </View>
        )}

        {/* =================================================================== */}
        {/* STEP 3: SUBMISSION & CONFIRMATION SCREEN */}
        {/* =================================================================== */}
        {step === 'success' && (
          <View style={[styles.successCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadows.medium]}>
            <View style={styles.successIconCircle}>
              <CheckCircle2 size={48} color="#16A34A" />
            </View>

            <Text style={[styles.successTitle, { color: theme.textPrimary }]}>
              Property Listing Submitted!
            </Text>
            <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>
              {isFreeListing
                ? 'Your property has been submitted free of charge and is now under Admin Review.'
                : 'Payment verified successfully via Razorpay. Your listing has been sent for Admin Review.'}
            </Text>

            <View style={[styles.receiptBox, { backgroundColor: theme.surface }]}>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptKey, { color: theme.textSecondary }]}>Property ID:</Text>
                <Text style={[styles.receiptVal, { color: theme.textPrimary }]}>
                  {createdProperty?.propertyId || 'PR-10004'}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptKey, { color: theme.textSecondary }]}>Listing Fee Paid:</Text>
                <Text style={[styles.receiptVal, { color: '#16A34A', fontWeight: '800' }]}>
                  {formatCurrency(createdProperty?.listingFeeAmount || activeFeeAmount)}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptKey, { color: theme.textSecondary }]}>Payment Status:</Text>
                <Text style={[styles.receiptVal, { color: '#16A34A' }]}>Paid & Verified ✓</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={[styles.receiptKey, { color: theme.textSecondary }]}>Approval Status:</Text>
                <Text style={[styles.receiptVal, { color: '#D97706' }]}>Under Review ⏳</Text>
              </View>
            </View>

            <View style={styles.successActions}>
              <Button
                title="View Full Property Detail Screen →"
                onPress={() => router.replace(`/real-estate/${createdProperty?.propertyId || createdProperty?.id || 'PR-10001'}` as any)}
                variant="primary"
                size="md"
              />
              <View style={{ height: 10 }} />
              <Button
                title="Manage in My Properties"
                onPress={() => router.replace('/real-estate/my-properties' as any)}
                variant="outline"
                size="md"
              />
              <View style={{ height: 10 }} />
              <Button
                title="Back to Real Estate Hub"
                onPress={() => router.replace('/(tabs)/real-estate' as any)}
                variant="ghost"
                size="md"
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* =================================================================== */}
      {/* PHOTO PICKER & PRESET MODAL */}
      {/* =================================================================== */}
      <Modal visible={isPhotoPickerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.photoModalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Add Property Photos</Text>
                <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
                  High-res photos help buyers explore your property in full detail
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsPhotoPickerModal(false)} style={styles.closeBtn}>
                <X size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Quick Upload Action Buttons */}
            <View style={styles.photoActionButtonsRow}>
              <TouchableOpacity
                style={[styles.uploadOptionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={handlePickFromGallery}
                disabled={isUploadingPhoto}
              >
                <View style={[styles.uploadIconCircle, { backgroundColor: '#16A34A18' }]}>
                  {isUploadingPhoto ? (
                    <ActivityIndicator size="small" color="#16A34A" />
                  ) : (
                    <ImageIcon size={22} color="#16A34A" />
                  )}
                </View>
                <Text style={[styles.uploadOptionTitle, { color: theme.textPrimary }]}>
                  {isUploadingPhoto ? 'Uploading...' : 'Device Gallery'}
                </Text>
                <Text style={[styles.uploadOptionSub, { color: theme.textMuted }]}>
                  {isUploadingPhoto ? 'Saving to Cloudinary' : 'Choose from device'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.uploadOptionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={handleTakePhoto}
                disabled={isUploadingPhoto}
              >
                <View style={[styles.uploadIconCircle, { backgroundColor: '#2563EB18' }]}>
                  <Camera size={22} color="#2563EB" />
                </View>
                <Text style={[styles.uploadOptionTitle, { color: theme.textPrimary }]}>Camera</Text>
                <Text style={[styles.uploadOptionSub, { color: theme.textMuted }]}>Take instant photo</Text>
              </TouchableOpacity>
            </View>

            {/* Custom URL Input */}
            <View style={[styles.urlInputBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <LinkIcon size={16} color={theme.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.urlTextInput, { color: theme.textPrimary }]}
                placeholder="Or paste image URL (https://...)"
                placeholderTextColor={theme.textMuted}
                value={customPhotoUrl}
                onChangeText={setCustomPhotoUrl}
              />
              <TouchableOpacity
                style={[styles.urlAddBtn, { backgroundColor: theme.primary }]}
                onPress={handleAddCustomUrl}
              >
                <Text style={styles.urlAddBtnText}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* Architectural Presets Section */}
            <View style={{ marginTop: Spacing.md }}>
              <View style={styles.presetSectionHeader}>
                <Sparkles size={14} color="#16A34A" style={{ marginRight: 6 }} />
                <Text style={[styles.presetSectionTitle, { color: theme.textPrimary }]}>
                  Curated Architecture Presets (1-Tap Add)
                </Text>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 220, marginTop: 8 }}
                contentContainerStyle={styles.presetsGridContainer}
              >
                {PROPERTY_PHOTO_PRESETS.map((preset) => {
                  const isAlreadyAdded = images.includes(preset.url);
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={[
                        styles.presetCard,
                        {
                          backgroundColor: theme.surface,
                          borderColor: isAlreadyAdded ? '#16A34A' : theme.border,
                          borderWidth: isAlreadyAdded ? 2 : 1,
                        },
                      ]}
                      onPress={() => handleAddPresetPhoto(preset.url)}
                    >
                      <Image source={{ uri: preset.url }} style={styles.presetCardImage} resizeMode="cover" />
                      <View style={styles.presetCardOverlay}>
                        <Text style={styles.presetCardTag}>{preset.category}</Text>
                        <Text style={styles.presetCardAction}>
                          {isAlreadyAdded ? '✓ Added' : '+ Add Photo'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      {/* =================================================================== */}
      {/* REAL RAZORPAY CHECKOUT MODAL */}
      {/* =================================================================== */}
      <RazorpayCheckoutModal
        visible={isRazorpayModal}
        options={razorpayOptions}
        onClose={() => setIsRazorpayModal(false)}
      />
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    marginRight: Spacing.md,
    padding: 4,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  feeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  feeBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
  },
  feeBannerSub: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginRight: 8,
  },
  typeTabText: {
    fontSize: 13,
  },
  chipScroll: {
    marginBottom: Spacing.md,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 12,
  },
  fieldGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 70,
  },
  row: {
    flexDirection: 'row',
  },
  amenitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  amenityChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 12,
  },
  submitWrap: {
    marginTop: Spacing.lg,
  },

  // Review screen styles
  reviewCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  reviewImage: {
    width: '100%',
    height: 180,
  },
  reviewBody: {
    padding: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reviewTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  reviewPrice: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginVertical: 4,
  },
  reviewLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewLoc: {
    fontSize: 13,
  },
  specsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  specBarText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Payment summary card
  paymentSummaryCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  paySummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  paySummaryTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    maxWidth: '65%',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: Spacing.md,
  },
  instructionsBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionsText: {
    fontSize: 11,
    lineHeight: 16,
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backOutlineBtn: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  backOutlineText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Success Card
  successCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  successTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },
  receiptBox: {
    width: '100%',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  receiptKey: {
    fontSize: 12,
  },
  receiptVal: {
    fontSize: 12,
    fontWeight: '600',
  },
  successActions: {
    width: '100%',
  },

  // Razorpay Sheet
  razorpayOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  razorpaySheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.xl,
  },
  razorpayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  razorpayBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  razorpayLogo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0C2340',
    letterSpacing: -0.5,
  },
  trustedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: 8,
  },
  trustedPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#047857',
  },
  razorpaySub: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  razorpayAmountCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  razorpayAmountLabel: {
    fontSize: 11,
  },
  razorpayAmountVal: {
    fontSize: 28,
    fontWeight: '800',
    marginVertical: 4,
  },
  razorpayOrderRef: {
    fontSize: 10,
  },
  paymentSheetHeading: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  payMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    padding: 12,
    marginBottom: 10,
  },
  payMethodTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  payMethodSub: {
    fontSize: 11,
    marginTop: 2,
  },
  modalCta: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  securityFooterText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
  },

  // Photo Section Styles
  photoSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addPhotoSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  addPhotoSmallBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  photoStripContainer: {
    gap: 12,
    paddingVertical: 4,
  },
  photoCard: {
    width: 140,
    height: 105,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
  },
  photoBadgeOverlay: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(22, 163, 74, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  coverPillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  setCoverBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  setCoverBtnText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  deletePhotoBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoCard: {
    width: 120,
    height: 105,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  cameraIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  addPhotoCardText: {
    fontSize: 12,
    fontWeight: '700',
  },
  addPhotoCardSub: {
    fontSize: 9,
    marginTop: 2,
  },
  presetBarWrap: {
    marginTop: 10,
    marginBottom: Spacing.md,
    padding: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  presetBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  presetBarTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  presetChipsRow: {
    gap: 8,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  presetChipThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  presetChipText: {
    fontSize: 11,
  },

  // Review Photo Strip
  reviewPhotoStrip: {
    borderBottomWidth: 1,
  },
  reviewThumbWrap: {
    width: 54,
    height: 40,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  reviewThumbImg: {
    width: '100%',
    height: '100%',
  },
  coverBadgeMini: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#16A34A',
    alignItems: 'center',
  },
  coverBadgeMiniText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },

  // Photo Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  photoModalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  photoActionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.md,
  },
  uploadOptionBtn: {
    flex: 1,
    padding: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  uploadIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  uploadOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  uploadOptionSub: {
    fontSize: 11,
    marginTop: 2,
  },
  urlInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 46,
  },
  urlTextInput: {
    flex: 1,
    fontSize: 13,
    height: '100%',
  },
  urlAddBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  urlAddBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  presetSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  presetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  presetsGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 20,
  },
  presetCard: {
    width: '48%',
    height: 105,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  presetCardImage: {
    width: '100%',
    height: '100%',
  },
  presetCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presetCardTag: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  presetCardAction: {
    color: '#4ADE80',
    fontSize: 10,
    fontWeight: '800',
  },
});
