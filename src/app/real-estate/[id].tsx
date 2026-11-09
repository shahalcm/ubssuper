// src/app/real-estate/[id].tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  Share,
  Linking,
  Modal,
  TextInput,
  Alert,
  FlatList,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { realEstateService, RealEstateProperty } from '@/services/repositories/realEstateService';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Bed,
  Bath,
  Move,
  Building2,
  ShieldCheck,
  Calendar,
  Eye,
  CheckCircle2,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Home,
  Compass,
  X,
  Clock,
  Layers,
  ChevronLeft,
  Camera,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function PropertyDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [property, setProperty] = useState<RealEstateProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFullscreenGallery, setIsFullscreenGallery] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [isVisitModal, setIsVisitModal] = useState(false);
  const [visitName, setVisitName] = useState('');
  const [visitPhone, setVisitPhone] = useState('');
  const [visitDate, setVisitDate] = useState('Tomorrow, 10:30 AM');
  const [visitSubmitted, setVisitSubmitted] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const carouselRef = useRef<FlatList>(null);

  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    realEstateService
      .getPropertyById(id)
      .then((data) => {
        if (isMounted) {
          setProperty(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const images = property?.images && property.images.length > 0
    ? property.images
    : ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'];

  const handleShare = async () => {
    if (!property) return;
    try {
      await Share.share({
        title: property.title,
        message: `Check out this property on UBS Super: ${property.title} in ${property.location}, ${property.city} for ${formatCurrency(property.price)}!`,
      });
    } catch {
      // ignore
    }
  };

  const handleDirectCall = () => {
    if (!property?.contactPhone) return;
    const cleanNumber = property.contactPhone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {
      Alert.alert('Unable to make call', `Please dial manually: ${property.contactPhone}`);
    });
  };

  const handleWhatsApp = () => {
    if (!property?.contactPhone) return;
    const digitsOnly = property.contactPhone.replace(/[^0-9]/g, '');
    const phoneWithCountry = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly;
    const msg = encodeURIComponent(
      `Hello! I am interested in your property listed on UBS Super:\n"${property.title}" (${formatCurrency(property.price)}).\nIs it currently available for site visit?`
    );
    Linking.openURL(`https://wa.me/${phoneWithCountry}?text=${msg}`).catch(() => {
      Alert.alert('WhatsApp Not Available', `Please WhatsApp or SMS to: ${property.contactPhone}`);
    });
  };

  const handleOpenMaps = () => {
    if (!property) return;
    const query = encodeURIComponent(`${property.address || property.location}, ${property.city}, Kerala`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {
      Alert.alert('Map Error', 'Could not open map navigation');
    });
  };

  const handleScheduleVisitSubmit = () => {
    if (!visitName.trim() || !visitPhone.trim()) {
      Alert.alert('Required Fields', 'Please enter your name and phone number for the site visit');
      return;
    }
    setVisitSubmitted(true);
    setTimeout(() => {
      setIsVisitModal(false);
      setVisitSubmitted(false);
      Alert.alert('Visit Scheduled!', 'The property owner has received your visit request and will confirm shortly.');
    }, 1200);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading verified property details...
        </Text>
      </SafeAreaView>
    );
  }

  if (!property) {
    return (
      <SafeAreaView style={[styles.centerContainer, { backgroundColor: theme.background }]}>
        <Building2 size={48} color={theme.textMuted} style={{ marginBottom: 12 }} />
        <Text style={[styles.notFoundTitle, { color: theme.textPrimary }]}>Property Not Found</Text>
        <Text style={[styles.notFoundSub, { color: theme.textSecondary }]}>
          The property listing you are looking for may have been removed or is pending approval.
        </Text>
        <TouchableOpacity
          style={[styles.backHomeBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backHomeBtnText}>Go Back to Real Estate</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Calculate approximate rate per sq.ft if area is numeric
  const areaNumber = parseInt(property.area.replace(/[^0-9]/g, ''), 10);
  const pricePerSqFt = areaNumber && areaNumber > 0 ? Math.round(property.price / areaNumber) : null;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Floating Action Bar */}
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top + (Platform.OS === 'ios' ? 8 : 12),
            backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.92)',
            borderBottomColor: theme.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.circleActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.topBarTitle, { color: theme.textPrimary }]} numberOfLines={1}>
          {property.title}
        </Text>

        <View style={styles.topRightActions}>
          <TouchableOpacity
            style={[styles.circleActionBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={handleShare}
          >
            <Share2 size={18} color={theme.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.circleActionBtn,
              { backgroundColor: theme.surface, borderColor: theme.border, marginLeft: Spacing.sm },
            ]}
            onPress={() => setIsFavorite(!isFavorite)}
          >
            <Heart size={18} color={isFavorite ? '#EF4444' : theme.textPrimary} fill={isFavorite ? '#EF4444' : 'none'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + insets.bottom }]}
      >
        {/* =================================================================== */}
        {/* HERO IMAGE CAROUSEL & GALLERY */}
        {/* =================================================================== */}
        <View style={styles.heroSection}>
          <FlatList
            ref={carouselRef}
            data={images}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, idx) => `photo-${idx}`}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              setActivePhotoIndex(newIndex);
            }}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => {
                  setFullscreenIndex(index);
                  setIsFullscreenGallery(true);
                }}
                style={{ width: SCREEN_WIDTH, height: 320 }}
              >
                <Image source={{ uri: item }} style={styles.heroImage} resizeMode="cover" />
              </TouchableOpacity>
            )}
          />

          {/* Floating Top Badges */}
          <View style={styles.floatingBadgesRow}>
            <View
              style={[
                styles.floatingPill,
                { backgroundColor: property.listingType === 'sale' ? '#16A34A' : '#D97706' },
              ]}
            >
              <Text style={styles.floatingPillText}>
                {property.listingType === 'sale' ? 'FOR SALE' : 'FOR RENT'}
              </Text>
            </View>

            <View style={[styles.floatingPill, { backgroundColor: '#1E293B' }]}>
              <Text style={styles.floatingPillText}>{property.propertyType.toUpperCase()}</Text>
            </View>

            <View style={[styles.floatingPill, { backgroundColor: '#0284C7' }]}>
              <ShieldCheck size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
              <Text style={styles.floatingPillText}>VERIFIED</Text>
            </View>
          </View>

          {/* Floating Photo Counter & Fullscreen hint */}
          <TouchableOpacity
            style={styles.photoCountPill}
            onPress={() => {
              setFullscreenIndex(activePhotoIndex);
              setIsFullscreenGallery(true);
            }}
          >
            <Camera size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
            <Text style={styles.photoCountText}>
              {activePhotoIndex + 1} / {images.length} Photos
            </Text>
          </TouchableOpacity>

          {/* Dot Indicators */}
          <View style={styles.dotsRow}>
            {images.map((_, i) => (
              <View
                key={`dot-${i}`}
                style={[
                  styles.dot,
                  i === activePhotoIndex
                    ? [styles.activeDot, { backgroundColor: '#FFFFFF' }]
                    : { backgroundColor: 'rgba(255, 255, 255, 0.45)' },
                ]}
              />
            ))}
          </View>
        </View>

        {/* Thumbnail Preview Strip */}
        {images.length > 1 && (
          <View style={[styles.thumbnailStrip, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailScroll}>
              {images.map((img, idx) => (
                <TouchableOpacity
                  key={`thumb-${idx}`}
                  onPress={() => {
                    setActivePhotoIndex(idx);
                    carouselRef.current?.scrollToIndex({ index: idx, animated: true });
                  }}
                  style={[
                    styles.thumbnailWrap,
                    {
                      borderColor: activePhotoIndex === idx ? theme.primary : 'transparent',
                      borderWidth: activePhotoIndex === idx ? 2.5 : 1,
                    },
                  ]}
                >
                  <Image source={{ uri: img }} style={styles.thumbnailImg} resizeMode="cover" />
                  {idx === 0 && (
                    <View style={styles.coverBadge}>
                      <Text style={styles.coverBadgeText}>Cover</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* =================================================================== */}
        {/* PRICE & PRIMARY DETAILS CARD */}
        {/* =================================================================== */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadows.small]}>
          <View style={styles.priceRow}>
            <View>
              <Text style={[styles.priceTag, { color: theme.primary }]}>
                {formatCurrency(property.price)}
                {property.listingType === 'rent' && <Text style={{ fontSize: 16, fontWeight: '500' }}>/month</Text>}
              </Text>
              {pricePerSqFt && (
                <Text style={[styles.pricePerSqFtText, { color: theme.textSecondary }]}>
                  ≈ {formatCurrency(pricePerSqFt)} per sq.ft
                </Text>
              )}
            </View>

            <View style={[styles.statusTag, { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }]}>
              <Sparkles size={12} color="#16A34A" style={{ marginRight: 4 }} />
              <Text style={styles.statusTagText}>Listing Fee Paid</Text>
            </View>
          </View>

          <Text style={[styles.propertyTitleText, { color: theme.textPrimary }]}>
            {property.title}
          </Text>

          {/* Location row */}
          <TouchableOpacity style={styles.locationLinkRow} onPress={handleOpenMaps}>
            <MapPin size={16} color={theme.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.locationLinkText, { color: theme.textSecondary }]} numberOfLines={2}>
              {property.address ? `${property.address}, ` : ''}{property.location}, {property.city}, {property.state}
            </Text>
            <ExternalLink size={14} color={theme.primary} style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          {/* Views & Post Date Meta */}
          <View style={[styles.metaRow, { borderTopColor: theme.border }]}>
            <View style={styles.metaItem}>
              <Eye size={13} color={theme.textMuted} style={{ marginRight: 4 }} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {property.propertyId ? `ID: ${property.propertyId}` : 'Verified ID'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={13} color={theme.textMuted} style={{ marginRight: 4 }} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>Active Listing</Text>
            </View>
            <View style={styles.metaItem}>
              <CheckCircle2 size={13} color="#16A34A" style={{ marginRight: 4 }} />
              <Text style={[styles.metaText, { color: '#16A34A' }]}>Admin Approved</Text>
            </View>
          </View>
        </View>

        {/* =================================================================== */}
        {/* KEY HIGHLIGHTS / SPECS GRID */}
        {/* =================================================================== */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadows.small]}>
          <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>Property Highlights</Text>

          <View style={styles.specsGrid}>
            <View style={[styles.specBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Bed size={22} color={theme.primary} />
              <Text style={[styles.specBoxValue, { color: theme.textPrimary }]}>
                {property.bedrooms > 0 ? `${property.bedrooms} BHK` : 'Studio / Open'}
              </Text>
              <Text style={[styles.specBoxLabel, { color: theme.textSecondary }]}>Bedrooms</Text>
            </View>

            <View style={[styles.specBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Bath size={22} color={theme.primary} />
              <Text style={[styles.specBoxValue, { color: theme.textPrimary }]}>
                {property.bathrooms > 0 ? `${property.bathrooms} Baths` : '1 Bath'}
              </Text>
              <Text style={[styles.specBoxLabel, { color: theme.textSecondary }]}>Bathrooms</Text>
            </View>

            <View style={[styles.specBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Move size={22} color={theme.primary} />
              <Text style={[styles.specBoxValue, { color: theme.textPrimary }]}>{property.area}</Text>
              <Text style={[styles.specBoxLabel, { color: theme.textSecondary }]}>Super Built-up</Text>
            </View>

            <View style={[styles.specBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Home size={22} color={theme.primary} />
              <Text style={[styles.specBoxValue, { color: theme.textPrimary }]}>
                {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
              </Text>
              <Text style={[styles.specBoxLabel, { color: theme.textSecondary }]}>Type</Text>
            </View>

            <View style={[styles.specBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Compass size={22} color={theme.primary} />
              <Text style={[styles.specBoxValue, { color: theme.textPrimary }]}>East Facing</Text>
              <Text style={[styles.specBoxLabel, { color: theme.textSecondary }]}>Vastu Compliant</Text>
            </View>

            <View style={[styles.specBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Layers size={22} color={theme.primary} />
              <Text style={[styles.specBoxValue, { color: theme.textPrimary }]}>Ready to Move</Text>
              <Text style={[styles.specBoxLabel, { color: theme.textSecondary }]}>Possession</Text>
            </View>
          </View>
        </View>

        {/* =================================================================== */}
        {/* AMENITIES & FEATURES */}
        {/* =================================================================== */}
        {property.amenities && property.amenities.length > 0 && (
          <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadows.small]}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>Amenities & Features</Text>
              <Text style={[styles.amenityCountBadge, { color: theme.textSecondary }]}>
                {property.amenities.length} Included
              </Text>
            </View>

            <View style={styles.amenitiesWrap}>
              {property.amenities.map((amenity, idx) => (
                <View
                  key={`amenity-${idx}`}
                  style={[
                    styles.amenityPill,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                >
                  <CheckCircle2 size={14} color="#16A34A" style={{ marginRight: 6 }} />
                  <Text style={[styles.amenityPillText, { color: theme.textPrimary }]}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* =================================================================== */}
        {/* PROPERTY DESCRIPTION */}
        {/* =================================================================== */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadows.small]}>
          <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>Overview & Description</Text>
          <Text
            style={[styles.descriptionText, { color: theme.textSecondary }]}
            numberOfLines={isDescriptionExpanded ? undefined : 4}
          >
            {property.description ||
              'Well-constructed property in a prime neighborhood with close proximity to schools, hospitals, transit hubs, and commercial centers. Built with high quality materials and modern architectural finishes.'}
          </Text>

          <TouchableOpacity
            style={styles.expandTextBtn}
            onPress={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          >
            <Text style={[styles.expandTextBtnText, { color: theme.primary }]}>
              {isDescriptionExpanded ? 'Show Less ▲' : 'Read Full Description ▼'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* =================================================================== */}
        {/* LOCATION & CONNECTIVITY */}
        {/* =================================================================== */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadows.small]}>
          <Text style={[styles.cardHeaderTitle, { color: theme.textPrimary }]}>Location & Connectivity</Text>

          <View style={[styles.mapPlaceholderBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <MapPin size={28} color={theme.primary} style={{ marginBottom: 6 }} />
            <Text style={[styles.mapAddressTitle, { color: theme.textPrimary }]}>
              {property.location}, {property.city}
            </Text>
            <Text style={[styles.mapAddressSub, { color: theme.textSecondary }]}>
              {property.address || 'Accurate location provided upon direct owner contact'}
            </Text>

            <TouchableOpacity
              style={[styles.mapActionBtn, { backgroundColor: theme.primary }]}
              onPress={handleOpenMaps}
            >
              <ExternalLink size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.mapActionBtnText}>View on Google Maps</Text>
            </TouchableOpacity>
          </View>

          {/* Key Distance Highlights */}
          <View style={styles.nearbyList}>
            <View style={styles.nearbyItem}>
              <Text style={[styles.nearbyLabel, { color: theme.textSecondary }]}>✈️ International Airport:</Text>
              <Text style={[styles.nearbyVal, { color: theme.textPrimary }]}>24 km</Text>
            </View>
            <View style={styles.nearbyItem}>
              <Text style={[styles.nearbyLabel, { color: theme.textSecondary }]}>🏥 Super Specialty Hospital:</Text>
              <Text style={[styles.nearbyVal, { color: theme.textPrimary }]}>2.5 km</Text>
            </View>
            <View style={styles.nearbyItem}>
              <Text style={[styles.nearbyLabel, { color: theme.textSecondary }]}>🏫 Top English Medium School:</Text>
              <Text style={[styles.nearbyVal, { color: theme.textPrimary }]}>1.2 km</Text>
            </View>
            <View style={styles.nearbyItem}>
              <Text style={[styles.nearbyLabel, { color: theme.textSecondary }]}>🛒 Shopping Mall & Supermarket:</Text>
              <Text style={[styles.nearbyVal, { color: theme.textPrimary }]}>800 m</Text>
            </View>
          </View>
        </View>

        {/* =================================================================== */}
        {/* SELLER / AGENT PROFILE CARD */}
        {/* =================================================================== */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadows.small]}>
          <View style={styles.sellerRow}>
            <View style={[styles.sellerAvatar, { backgroundColor: theme.primary }]}>
              <Text style={styles.sellerAvatarText}>
                {(property.contactName || 'Owner').charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <View style={styles.sellerNameRow}>
                <Text style={[styles.sellerName, { color: theme.textPrimary }]}>
                  {property.contactName || 'Verified Property Owner'}
                </Text>
                <View style={[styles.sellerVerifiedBadge, { backgroundColor: '#DCFCE7' }]}>
                  <CheckCircle2 size={11} color="#16A34A" style={{ marginRight: 3 }} />
                  <Text style={styles.sellerVerifiedText}>Verified</Text>
                </View>
              </View>
              <Text style={[styles.sellerRole, { color: theme.textSecondary }]}>
                {property.postedBy || 'Direct Property Owner'} • Listed on UBS Super
              </Text>
              <Text style={[styles.sellerResponseTime, { color: theme.textMuted }]}>
                ⚡ Typically responds within 15 minutes
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.scheduleVisitBtn, { borderColor: theme.primary }]}
            onPress={() => setIsVisitModal(true)}
          >
            <Calendar size={16} color={theme.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.scheduleVisitBtnText, { color: theme.primary }]}>Schedule a Free Site Visit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* =================================================================== */}
      {/* STICKY BOTTOM ACTION BAR */}
      {/* =================================================================== */}
      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: insets.bottom + 8,
            backgroundColor: theme.card,
            borderTopColor: theme.border,
          },
          Shadows.large,
        ]}
      >
        <View style={styles.bottomPriceWrap}>
          <Text style={[styles.bottomPriceLabel, { color: theme.textSecondary }]}>Total Price</Text>
          <Text style={[styles.bottomPriceValue, { color: theme.primary }]} numberOfLines={1}>
            {formatCurrency(property.price)}
            {property.listingType === 'rent' && <Text style={{ fontSize: 13, fontWeight: '400' }}>/mo</Text>}
          </Text>
        </View>

        <View style={styles.bottomCtaRow}>
          <TouchableOpacity
            style={[styles.callBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={handleDirectCall}
          >
            <Phone size={18} color={theme.textPrimary} style={{ marginRight: 6 }} />
            <Text style={[styles.callBtnText, { color: theme.textPrimary }]}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.whatsappBtn, { backgroundColor: '#25D366' }]}
            onPress={handleWhatsApp}
          >
            <MessageCircle size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.whatsappBtnText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* =================================================================== */}
      {/* FULLSCREEN PHOTO GALLERY MODAL */}
      {/* =================================================================== */}
      <Modal visible={isFullscreenGallery} transparent animationType="fade">
        <View style={styles.fullscreenModal}>
          <SafeAreaView style={styles.fullscreenSafe}>
            {/* Header */}
            <View style={styles.fullscreenHeader}>
              <TouchableOpacity
                onPress={() => setIsFullscreenGallery(false)}
                style={styles.fullscreenCloseBtn}
              >
                <X size={22} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.fullscreenCounter}>
                {fullscreenIndex + 1} / {images.length}
              </Text>
              <TouchableOpacity onPress={handleShare} style={styles.fullscreenCloseBtn}>
                <Share2 size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Main Fullscreen Image */}
            <View style={styles.fullscreenImageContainer}>
              <Image
                source={{ uri: images[fullscreenIndex] }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />

              {/* Prev / Next controls */}
              {images.length > 1 && (
                <>
                  {fullscreenIndex > 0 && (
                    <TouchableOpacity
                      style={[styles.galleryNavBtn, { left: 16 }]}
                      onPress={() => setFullscreenIndex(fullscreenIndex - 1)}
                    >
                      <ChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                  {fullscreenIndex < images.length - 1 && (
                    <TouchableOpacity
                      style={[styles.galleryNavBtn, { right: 16 }]}
                      onPress={() => setFullscreenIndex(fullscreenIndex + 1)}
                    >
                      <ChevronRight size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>

            {/* Thumbnail Bottom Row */}
            <View style={styles.fullscreenThumbRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {images.map((img, idx) => (
                  <TouchableOpacity
                    key={`modal-thumb-${idx}`}
                    onPress={() => setFullscreenIndex(idx)}
                    style={[
                      styles.modalThumb,
                      { borderColor: fullscreenIndex === idx ? '#16A34A' : 'transparent' },
                    ]}
                  >
                    <Image source={{ uri: img }} style={styles.modalThumbImg} resizeMode="cover" />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      {/* =================================================================== */}
      {/* SCHEDULE SITE VISIT MODAL */}
      {/* =================================================================== */}
      <Modal visible={isVisitModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Schedule a Site Visit</Text>
                <Text style={[styles.modalSub, { color: theme.textSecondary }]}>
                  Meet the owner and inspect the property in person
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsVisitModal(false)} style={styles.modalCloseBtn}>
                <X size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalFieldGroup}>
              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Your Full Name *</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor={theme.textMuted}
                value={visitName}
                onChangeText={setVisitName}
              />
            </View>

            <View style={styles.modalFieldGroup}>
              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Contact Phone Number *</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="e.g. +91 98765 43210"
                placeholderTextColor={theme.textMuted}
                keyboardType="phone-pad"
                value={visitPhone}
                onChangeText={setVisitPhone}
              />
            </View>

            <View style={styles.modalFieldGroup}>
              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Preferred Date & Time</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.surface, color: theme.textPrimary, borderColor: theme.border }]}
                value={visitDate}
                onChangeText={setVisitDate}
              />
            </View>

            <View style={{ marginTop: 20 }}>
              <Button
                title={visitSubmitted ? 'Confirming Site Visit...' : 'Confirm Visit Appointment'}
                onPress={handleScheduleVisitSubmit}
                loading={visitSubmitted}
                variant="primary"
                size="lg"
              />
            </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  notFoundSub: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  backHomeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  backHomeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },

  // Top Bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  circleActionBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    flex: 1,
    marginHorizontal: Spacing.md,
    fontSize: 15,
    fontWeight: '700',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  scrollContent: {
    paddingTop: 80,
  },

  // Hero Section
  heroSection: {
    position: 'relative',
    height: 320,
    backgroundColor: '#0F172A',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: 320,
  },
  floatingBadgesRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  floatingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  floatingPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  photoCountPill: {
    position: 'absolute',
    bottom: 16,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 18,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    width: 18,
    height: 6,
    borderRadius: 3,
  },

  // Thumbnail Strip
  thumbnailStrip: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  thumbnailScroll: {
    paddingHorizontal: Spacing.lg,
    gap: 10,
  },
  thumbnailWrap: {
    width: 64,
    height: 48,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  coverBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(22, 163, 74, 0.9)',
    alignItems: 'center',
    paddingVertical: 1,
  },
  coverBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },

  // Section Cards
  sectionCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceTag: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  pricePerSqFtText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  statusTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  propertyTitleText: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 10,
  },
  locationLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  locationLinkText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Highlights Grid
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  amenityCountBadge: {
    fontSize: 12,
    fontWeight: '600',
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  specBox: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.lg * 2 - 20) / 3,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specBoxValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
    textAlign: 'center',
  },
  specBoxLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },

  // Amenities
  amenitiesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  amenityPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Description
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  expandTextBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  expandTextBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Location / Map
  mapPlaceholderBox: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 14,
  },
  mapAddressTitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  mapAddressSub: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  mapActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  mapActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  nearbyList: {
    gap: 8,
  },
  nearbyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nearbyLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  nearbyVal: {
    fontSize: 13,
    fontWeight: '700',
  },

  // Seller Card
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '700',
  },
  sellerVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: 6,
  },
  sellerVerifiedText: {
    color: '#16A34A',
    fontSize: 10,
    fontWeight: '700',
  },
  sellerRole: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  sellerResponseTime: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  scheduleVisitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  scheduleVisitBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Bottom Sticky Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  bottomPriceWrap: {
    flex: 1,
    marginRight: Spacing.md,
  },
  bottomPriceLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  bottomPriceValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  bottomCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  callBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  whatsappBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Fullscreen Modal
  fullscreenModal: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullscreenSafe: {
    flex: 1,
    justifyContent: 'space-between',
  },
  fullscreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  fullscreenCloseBtn: {
    padding: 8,
  },
  fullscreenCounter: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  fullscreenImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  galleryNavBtn: {
    position: 'absolute',
    top: '46%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenThumbRow: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  modalThumb: {
    width: 60,
    height: 44,
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 2,
    marginRight: 8,
  },
  modalThumbImg: {
    width: '100%',
    height: '100%',
  },

  // Site Visit Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSub: {
    fontSize: 13,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalFieldGroup: {
    marginBottom: Spacing.md,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  modalInput: {
    height: 46,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
  },
});
