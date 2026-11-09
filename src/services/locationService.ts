// src/services/locationService.ts
import * as Location from 'expo-location';
import { apiClient } from './api/client';
import { ENDPOINTS } from './api/endpoints';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

export interface GeocodedAddress {
  fullAddress: string;
  houseNumber?: string;
  street?: string;
  locality?: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface PlaceSuggestion {
  placeId: string;
  primaryText: string;
  secondaryText: string;
  fullText: string;
}

export interface LocationPermissionResult {
  granted: boolean;
  canAskAgain: boolean;
  status: Location.PermissionStatus;
  message?: string;
}

// Default fallback to central UBSSuper hub (Manjeri, Malappuram, Kerala)
export const DEFAULT_COORDINATES: LocationCoordinates = {
  latitude: 11.1217,
  longitude: 76.1283,
};

// Access the Google Maps API key from environment
const GOOGLE_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// In-memory cache for autocomplete and geocode to reduce repeated network calls and minimize billing
const autocompleteCache = new Map<string, { data: PlaceSuggestion[]; timestamp: number }>();
const geocodeCache = new Map<string, { data: GeocodedAddress; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

export const locationService = {
  /**
   * Request foreground location permissions from the user with clear diagnostics
   */
  async requestPermissions(): Promise<LocationPermissionResult> {
    try {
      const existing = await Location.getForegroundPermissionsAsync();
      if (existing.granted) {
        return {
          granted: true,
          canAskAgain: existing.canAskAgain,
          status: existing.status,
        };
      }

      const res = await Location.requestForegroundPermissionsAsync();
      return {
        granted: res.granted,
        canAskAgain: res.canAskAgain,
        status: res.status,
        message: res.granted
          ? undefined
          : 'Location permission was denied. You can still enter your address or PIN code manually.',
      };
    } catch (err: any) {
      return {
        granted: false,
        canAskAgain: false,
        status: Location.PermissionStatus.DENIED,
        message: err.message || 'Error requesting location permission.',
      };
    }
  },

  /**
   * Get device current GPS coordinates with balanced accuracy to preserve battery
   */
  async getCurrentLocation(): Promise<LocationCoordinates> {
    // 1. Check if location services (GPS) are enabled on the device
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      throw new Error('Location services (GPS) are turned off on your device. Please turn them on in settings, or enter your address manually.');
    }

    // 2. Check permissions
    const perm = await this.requestPermissions();
    if (!perm.granted) {
      throw new Error('Location permission is required to detect your current position. Please grant permission or choose location manually.');
    }

    // 3. Request current position with balanced accuracy & timeout
    try {
      const positionPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // 10 second timeout promise
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Location request timed out. Please check your signal or select location manually.')), 10000)
      );

      const pos = await Promise.race([positionPromise, timeoutPromise]);
      return {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
    } catch (error: any) {
      // Fallback to last known position before failing
      try {
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown) {
          return {
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
            accuracy: lastKnown.coords.accuracy,
          };
        }
      } catch {
        // Ignore fallback error
      }
      throw error;
    }
  },

  /**
   * Reverse geocode coordinates to human-readable structured address
   * Uses Google Geocoding API if key is present, with automatic fallback to Expo Location
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodedAddress> {
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    const cached = geocodeCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    // Try Google Geocoding API first
    if (GOOGLE_MAPS_KEY) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_KEY}`;
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
            const primary = data.results[0];
            const components: any[] = primary.address_components || [];

            const getComp = (type: string, useShort = false) => {
              const c = components.find((item) => item.types.includes(type));
              return c ? (useShort ? c.short_name : c.long_name) : '';
            };

            const houseNumber = getComp('premise') || getComp('street_number');
            const street = getComp('route') || getComp('sublocality_level_2');
            const locality = getComp('sublocality') || getComp('sublocality_level_1') || getComp('neighborhood');
            const city = getComp('locality') || getComp('administrative_area_level_2') || 'Kerala';
            const district = getComp('administrative_area_level_3') || getComp('administrative_area_level_2');
            const state = getComp('administrative_area_level_1') || 'Kerala';
            const pincode = getComp('postal_code') || '676121';
            const country = getComp('country') || 'India';

            const formatted: GeocodedAddress = {
              fullAddress: primary.formatted_address || [houseNumber, street, locality, city, state, pincode].filter(Boolean).join(', '),
              houseNumber,
              street,
              locality,
              city,
              district,
              state,
              pincode,
              country,
              latitude,
              longitude,
            };

            geocodeCache.set(cacheKey, { data: formatted, timestamp: Date.now() });
            return formatted;
          }
        }
      } catch {
        // Fallback to Expo Location
      }
    }

    // Fallback using expo-location native reverse geocode
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results && results.length > 0) {
        const item = results[0];
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

        const formatted: GeocodedAddress = {
          fullAddress: fullAddr || `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
          houseNumber: house,
          street,
          locality,
          city,
          district,
          state,
          pincode,
          country,
          latitude,
          longitude,
        };

        geocodeCache.set(cacheKey, { data: formatted, timestamp: Date.now() });
        return formatted;
      }
    } catch (e: any) {
      // Fallback minimal
    }

    return {
      fullAddress: `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
      city: 'Kerala',
      state: 'Kerala',
      pincode: '676121',
      country: 'India',
      latitude,
      longitude,
    };
  },

  /**
   * Search places using Google Places Autocomplete API with Indian country restriction
   * Debounced and cached to prevent excessive billing
   */
  async searchPlacesAutocomplete(
    query: string,
    locationBias?: { latitude: number; longitude: number }
  ): Promise<PlaceSuggestion[]> {
    const trimmed = query.trim();
    if (trimmed.length < 2) return [];

    const cacheKey = `autocomplete_${trimmed.toLowerCase()}`;
    const cached = autocompleteCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    if (!GOOGLE_MAPS_KEY) {
      return [];
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        trimmed
      )}&components=country:in&key=${GOOGLE_MAPS_KEY}`;

      if (locationBias) {
        url += `&location=${locationBias.latitude},${locationBias.longitude}&radius=30000`;
      }

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'OK' && Array.isArray(data.predictions)) {
          const suggestions: PlaceSuggestion[] = data.predictions.map((p: any) => ({
            placeId: p.place_id,
            primaryText: p.structured_formatting?.main_text || p.description,
            secondaryText: p.structured_formatting?.secondary_text || '',
            fullText: p.description,
          }));

          autocompleteCache.set(cacheKey, { data: suggestions, timestamp: Date.now() });
          return suggestions;
        }
      }
    } catch {
      // Fallback
    }

    return [];
  },

  /**
   * Get coordinates and details for a selected Google Place
   */
  async getPlaceDetails(placeId: string): Promise<GeocodedAddress | null> {
    if (!GOOGLE_MAPS_KEY || !placeId) return null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
        placeId
      )}&fields=geometry,formatted_address,address_components,name&key=${GOOGLE_MAPS_KEY}`;

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'OK' && data.result?.geometry?.location) {
          const result = data.result;
          const lat = result.geometry.location.lat;
          const lng = result.geometry.location.lng;
          const components: any[] = result.address_components || [];

          const getComp = (type: string, useShort = false) => {
            const c = components.find((item) => item.types.includes(type));
            return c ? (useShort ? c.short_name : c.long_name) : '';
          };

          return {
            fullAddress: result.formatted_address || result.name || '',
            houseNumber: getComp('street_number') || getComp('premise'),
            street: getComp('route') || getComp('sublocality_level_2'),
            locality: getComp('sublocality') || getComp('sublocality_level_1') || getComp('neighborhood'),
            city: getComp('locality') || getComp('administrative_area_level_2') || 'Kerala',
            district: getComp('administrative_area_level_3') || getComp('administrative_area_level_2'),
            state: getComp('administrative_area_level_1') || 'Kerala',
            pincode: getComp('postal_code') || '676121',
            country: getComp('country') || 'India',
            latitude: lat,
            longitude: lng,
          };
        }
      }
    } catch {
      // Error handling
    }

    return null;
  },

  /**
   * Lookup Indian 6-digit PIN code using backend endpoint
   */
  async lookupPincode(pincode: string) {
    const cleanPin = pincode.replace(/\D/g, '').slice(0, 6);
    if (cleanPin.length !== 6) {
      throw new Error('PIN code must be a 6-digit number.');
    }

    const res: any = await apiClient.get(ENDPOINTS.CUSTOMERS.PINCODE(cleanPin));
    const data = res?.data || res;
    if (data && data.city) {
      return {
        pincode: cleanPin,
        city: data.city,
        district: data.district,
        state: data.state,
        country: data.country || 'India',
        localities: data.localities || [],
        coordinates: data.coordinates || [76.1283, 11.1217],
      };
    }

    throw new Error(`Location not found for PIN code ${cleanPin}.`);
  },
};
