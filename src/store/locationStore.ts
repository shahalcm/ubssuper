// src/store/locationStore.ts
import { create } from 'zustand';
import { Address } from '@/types';
import { APP_CONFIG } from '@/constants/config';
import { storage } from '@/utils/storage';
import { apiClient } from '@/services/api/client';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}

interface LocationState {
  currentAddress: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  pincode: string;
  district?: string;
  locality?: string;
  street?: string;
  locationSource: 'gps' | 'pincode' | 'manual';
  savedAddresses: Address[];
  activeAddressId: string | null;

  // Actions
  setAddress: (addressStr: string) => void;
  setLocation: (
    data: {
      latitude: number;
      longitude: number;
      address: string;
      city?: string;
      state?: string;
      pincode?: string;
      district?: string;
      locality?: string;
      street?: string;
    },
    source?: 'gps' | 'pincode' | 'manual'
  ) => void;
  addSavedAddress: (addr: Omit<Address, 'id'>) => void;
  selectAddress: (id: string) => void;
  syncLocationWithBackend: () => Promise<void>;
  loadSavedAddresses: () => Promise<void>;
}

const DEFAULT_COORDS = {
  latitude: 11.1217,
  longitude: 76.1283,
};

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    label: 'Home',
    street: 'Calicut Road, Near Bus Stand',
    city: 'Manjeri',
    state: 'Kerala',
    pincode: '676121',
    landmark: 'Opposite Royal Mall',
    latitude: 11.1217,
    longitude: 76.1283,
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Work',
    street: 'IT Park, Kinfra Techno Industrial Park',
    city: 'Kozhikode',
    state: 'Kerala',
    pincode: '673635',
    latitude: 11.1442,
    longitude: 75.8924,
    isDefault: false,
  },
];

export const useLocationStore = create<LocationState>((set, get) => ({
  currentAddress: `${APP_CONFIG.defaultLocation.area}, ${APP_CONFIG.defaultLocation.city}`,
  latitude: DEFAULT_COORDS.latitude,
  longitude: DEFAULT_COORDS.longitude,
  city: APP_CONFIG.defaultLocation.city || 'Manjeri',
  state: APP_CONFIG.defaultLocation.state || 'Kerala',
  pincode: APP_CONFIG.defaultLocation.pincode || '676121',
  locationSource: 'manual',
  savedAddresses: DEFAULT_ADDRESSES,
  activeAddressId: 'addr-1',

  setAddress: (addressStr) => {
    set({ currentAddress: addressStr });
  },

  setLocation: (data, source = 'manual') => {
    set({
      currentAddress: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city || get().city,
      state: data.state || get().state,
      pincode: data.pincode || get().pincode,
      district: data.district,
      locality: data.locality,
      street: data.street,
      locationSource: source,
    });

    // Save to persistent local storage
    storage.setItem('ubssuper_current_location', {
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      district: data.district,
      locality: data.locality,
      street: data.street,
      locationSource: source,
    });

    // Attempt to sync with backend in background
    get().syncLocationWithBackend().catch(() => null);
  },

  addSavedAddress: (addr) => {
    const newAddr: Address = {
      ...addr,
      id: `addr-${Date.now()}`,
    };
    const updated = [...get().savedAddresses, newAddr];
    set({ savedAddresses: updated });
    storage.setItem('ubssuper_saved_addresses', updated);

    // If authenticated, sync with backend address book
    apiClient.post('/customers/addresses', {
      label: addr.label || 'Home',
      addressLine: addr.fullAddress || addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.pincode,
      landmark: addr.landmark,
      latitude: addr.latitude || get().latitude,
      longitude: addr.longitude || get().longitude,
      isDefault: !!addr.isDefault,
    }).catch(() => null);
  },

  selectAddress: (id) => {
    const found = get().savedAddresses.find((a) => a.id === id);
    if (found) {
      set({
        activeAddressId: id,
        currentAddress: found.fullAddress || `${found.street}, ${found.city}`,
        city: found.city,
        state: found.state,
        pincode: found.pincode,
        latitude: found.latitude || get().latitude,
        longitude: found.longitude || get().longitude,
        locationSource: 'manual',
      });

      get().syncLocationWithBackend().catch(() => null);
    }
  },

  syncLocationWithBackend: async () => {
    try {
      const state = get();
      await apiClient.put('/users/location', {
        fullAddress: state.currentAddress,
        street: state.street,
        locality: state.locality,
        city: state.city,
        district: state.district,
        state: state.state,
        pincode: state.pincode,
        latitude: state.latitude,
        longitude: state.longitude,
        locationSource: state.locationSource,
      });
    } catch {
      // Guest users or offline network ignore error
    }
  },

  loadSavedAddresses: async () => {
    try {
      const cachedLoc = await storage.getItem<any>('ubssuper_current_location');
      if (cachedLoc && cachedLoc.latitude && cachedLoc.longitude) {
        set({
          currentAddress: cachedLoc.address || get().currentAddress,
          latitude: cachedLoc.latitude,
          longitude: cachedLoc.longitude,
          city: cachedLoc.city || get().city,
          state: cachedLoc.state || get().state,
          pincode: cachedLoc.pincode || get().pincode,
          locationSource: cachedLoc.locationSource || 'manual',
        });
      }

      const cachedAddresses = await storage.getItem<Address[]>('ubssuper_saved_addresses');
      if (Array.isArray(cachedAddresses) && cachedAddresses.length > 0) {
        set({ savedAddresses: cachedAddresses });
      }
    } catch {
      // Storage load fallback
    }
  },
}));
