// src/components/maps/StoresMapView.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from './MapViewWrapper';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { Store, Restaurant } from '@/types';
import { DEFAULT_COORDINATES } from '@/services/locationService';
import {
  MapPin,
  Star,
  Clock,
  Bike,
  Navigation,
  ArrowRight,
  ShoppingBag,
  Utensils,
  X,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StoresMapViewProps {
  stores: (Store | (Restaurant & { category?: string }))[];
  userCoords?: { latitude: number; longitude: number };
  category: 'grocery' | 'restaurant';
  onSelectStore: (store: any) => void;
  style?: any;
}

export const StoresMapView: React.FC<StoresMapViewProps> = ({
  stores,
  userCoords,
  category,
  onSelectStore,
  style,
}) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const mapRef = useRef<MapView>(null);
  const isRestaurant = category === 'restaurant';
  const primaryBrandColor = isRestaurant ? '#EA580C' : '#16A34A';

  // Filter stores that have valid coordinates
  const validStores = stores.filter((s) => {
    const lat = s.latitude ?? (s as any).location?.coordinates?.[1] ?? (s as any).locationCoords?.latitude;
    const lng = s.longitude ?? (s as any).location?.coordinates?.[0] ?? (s as any).locationCoords?.longitude;
    return typeof lat === 'number' && !isNaN(lat) && typeof lng === 'number' && !isNaN(lng);
  });

  const centerLat = userCoords?.latitude || DEFAULT_COORDINATES.latitude;
  const centerLng = userCoords?.longitude || DEFAULT_COORDINATES.longitude;

  const [selectedStore, setSelectedStore] = useState<any | null>(null);

  // Initial region centered on user coordinates
  const initialRegion: Region = {
    latitude: centerLat,
    longitude: centerLng,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  useEffect(() => {
    if (validStores.length > 0 && !selectedStore) {
      setSelectedStore(validStores[0]);
    }
  }, [validStores.length]);

  const handleSelectMarker = (store: any) => {
    setSelectedStore(store);
    const lat = store.latitude ?? store.location?.coordinates?.[1] ?? store.locationCoords?.latitude;
    const lng = store.longitude ?? store.location?.coordinates?.[0] ?? store.locationCoords?.longitude;

    if (lat && lng) {
      mapRef.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        350
      );
    }
  };

  const handleRecenter = () => {
    mapRef.current?.animateToRegion(
      {
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      },
      350
    );
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
      >
        {/* User Location Marker */}
        {userCoords && (
          <Marker
            coordinate={{ latitude: userCoords.latitude, longitude: userCoords.longitude }}
            title="You are here"
          >
            <View style={styles.userPinContainer}>
              <View style={styles.userPinCircle}>
                <View style={styles.userPinDot} />
              </View>
            </View>
          </Marker>
        )}

        {/* Store / Restaurant Markers */}
        {validStores.map((store) => {
          const lat = store.latitude ?? (store as any).location?.coordinates?.[1] ?? (store as any).locationCoords?.latitude;
          const lng = store.longitude ?? (store as any).location?.coordinates?.[0] ?? (store as any).locationCoords?.longitude;
          const isSelected = selectedStore?.id === store.id;

          return (
            <Marker
              key={store.id}
              coordinate={{ latitude: lat, longitude: lng }}
              onPress={() => handleSelectMarker(store)}
              tracksViewChanges={false}
            >
              <View style={[styles.markerContainer, isSelected && styles.markerContainerSelected]}>
                <View
                  style={[
                    styles.markerBadge,
                    {
                      backgroundColor: isSelected ? primaryBrandColor : '#FFFFFF',
                      borderColor: primaryBrandColor,
                    },
                    Shadows.medium,
                  ]}
                >
                  {isRestaurant ? (
                    <Utensils size={14} color={isSelected ? '#FFFFFF' : primaryBrandColor} />
                  ) : (
                    <ShoppingBag size={14} color={isSelected ? '#FFFFFF' : primaryBrandColor} />
                  )}
                  <Text
                    style={[
                      styles.markerRating,
                      { color: isSelected ? '#FFFFFF' : '#1E293B' },
                    ]}
                  >
                    ★ {store.rating?.toFixed(1) || '4.8'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.markerArrow,
                    { borderTopColor: isSelected ? primaryBrandColor : '#FFFFFF' },
                  ]}
                />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Recenter Button */}
      <TouchableOpacity
        style={[styles.recenterBtn, { backgroundColor: theme.card }, Shadows.medium]}
        activeOpacity={0.85}
        onPress={handleRecenter}
      >
        <Navigation size={18} color={primaryBrandColor} />
      </TouchableOpacity>

      {/* Selected Store / Restaurant Bottom Preview Card */}
      {selectedStore && (
        <View style={[styles.previewCard, { backgroundColor: theme.card }, Shadows.large]}>
          <TouchableOpacity
            style={styles.cardCloseBtn}
            onPress={() => setSelectedStore(null)}
          >
            <X size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cardContent}
            activeOpacity={0.9}
            onPress={() => onSelectStore(selectedStore)}
          >
            <Image
              source={{
                uri:
                  selectedStore.coverImage ||
                  selectedStore.logo ||
                  selectedStore.image ||
                  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
              }}
              style={styles.storeThumb}
              resizeMode="cover"
            />

            <View style={styles.storeInfo}>
              <View style={styles.storeNameRow}>
                <Text style={[styles.storeName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {selectedStore.name}
                </Text>
              </View>

              <Text style={[styles.cuisinesText, { color: theme.textSecondary }]} numberOfLines={1}>
                {selectedStore.cuisines?.slice(0, 3).join(' • ') || (isRestaurant ? 'Malabar, Multi-Cuisine' : 'Supermarket, Daily Essentials')}
              </Text>

              <View style={styles.metaBadgeRow}>
                <View style={styles.ratingPill}>
                  <Star size={11} color="#EAB308" fill="#EAB308" style={{ marginRight: 3 }} />
                  <Text style={styles.ratingText}>{selectedStore.rating?.toFixed(1) || '4.8'}</Text>
                </View>

                {selectedStore.distanceFormatted || selectedStore.distance ? (
                  <View style={styles.metaPill}>
                    <MapPin size={11} color={theme.textMuted} style={{ marginRight: 2 }} />
                    <Text style={[styles.metaText, { color: theme.textMuted }]}>
                      {selectedStore.distanceFormatted || selectedStore.distance}
                    </Text>
                  </View>
                ) : null}

                {selectedStore.deliveryTime ? (
                  <View style={styles.metaPill}>
                    <Clock size={11} color={theme.textMuted} style={{ marginRight: 2 }} />
                    <Text style={[styles.metaText, { color: theme.textMuted }]}>
                      {selectedStore.deliveryTime}
                    </Text>
                  </View>
                ) : null}
              </View>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: primaryBrandColor }]}
                activeOpacity={0.85}
                onPress={() => onSelectStore(selectedStore)}
              >
                <Text style={styles.actionBtnText}>
                  {isRestaurant ? 'View Menu & Order' : 'Shop Products'}
                </Text>
                <ArrowRight size={13} color="#FFFFFF" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  userPinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userPinCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#16A34A',
  },
  userPinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerContainerSelected: {
    transform: [{ scale: 1.15 }],
  },
  markerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  markerRating: {
    fontSize: 11,
    fontWeight: '800',
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignSelf: 'center',
  },
  recenterBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  previewCard: {
    position: 'absolute',
    bottom: 16,
    left: 14,
    right: 14,
    borderRadius: BorderRadius.xl,
    padding: Spacing.sm,
    zIndex: 10,
  },
  cardCloseBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 15,
    padding: 4,
  },
  cardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  storeThumb: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.lg,
  },
  storeInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 18,
  },
  storeName: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  cuisinesText: {
    fontSize: 11,
    fontWeight: '500',
  },
  metaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EAB308',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    marginTop: 2,
    alignSelf: 'flex-start',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
