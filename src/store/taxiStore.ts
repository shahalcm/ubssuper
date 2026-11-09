// src/store/taxiStore.ts
import { create } from 'zustand';
import { RideBooking, RideOption, Driver, ScheduledRide } from '@/types';
import { MOCK_RIDE_OPTIONS } from '@/services/mock/data';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { locationService } from '@/services/locationService';

export interface PastRideItem {
  id: string;
  pickup: string;
  destination: string;
  fare: number;
  originalFare?: number;
  date: string;
  driver: string;
  driverPhoto?: string;
  vehicleModel: string;
  vehicleNumber: string;
  type: string;
  status: 'Completed' | 'Cancelled';
  paymentMethod: string;
  rating?: number;
  distance: string;
  duration: string;
}

export const INITIAL_PAST_RIDES: PastRideItem[] = [];

// Helper mapping for vehicle metadata
const VEHICLE_METADATA: Record<string, { icon: string; capacity: number; category: 'commute' | 'comfort' | 'family'; tag?: string; luggage: string; features: string[] }> = {
  bike: { icon: 'bike', capacity: 1, category: 'commute', tag: 'Fastest', luggage: 'Small bag', features: ['Helmet provided', 'Beat traffic', 'Solo ride'] },
  auto: { icon: 'auto', capacity: 3, category: 'commute', tag: 'Popular', luggage: '2 Bags', features: ['Verified meter rate', 'No surge', 'Everyday choice'] },
  mini: { icon: 'mini', capacity: 4, category: 'commute', luggage: '2 Bags', features: ['AC Hatchback', 'Pocket friendly', 'City travel'] },
  sedan: { icon: 'sedan', capacity: 4, category: 'comfort', tag: 'Top Rated', luggage: '3 Bags', features: ['Premium AC Sedan', 'Quiet ride', 'Top captains'] },
  suv: { icon: 'suv', capacity: 6, category: 'family', tag: 'Spacious', luggage: '4 Bags', features: ['6-Seater Innova/Ertiga', 'Extra legroom', 'Airport luggage'] },
  luxury: { icon: 'luxury', capacity: 4, category: 'comfort', tag: 'Executive', luggage: '3 Bags', features: ['Luxury Chauffeur', 'Leather seats', 'VIP travel'] },
};

interface TaxiState {
  pickupLocation: string;
  pickupCoords: { latitude: number; longitude: number } | null;
  destinationLocation: string;
  destinationCoords: { latitude: number; longitude: number } | null;

  routeDistanceKm: number;
  routeDurationMinutes: number;
  routePolyline: Array<{ latitude: number; longitude: number }>;

  rideOptions: RideOption[];
  selectedOption: RideOption | null;
  isLoadingEstimates: boolean;

  activeBooking: RideBooking | null;
  paymentMethod: 'wallet' | 'upi' | 'cash';
  appliedPromo: { code: string; discountPercent: number; maxDiscount: number } | null;
  scheduledRides: ScheduledRide[];
  pastRides: PastRideItem[];
  nearbyDrivers: any[];
  isLoadingDrivers: boolean;
  isLocatingGps: boolean;

  fetchCurrentGpsLocation: () => Promise<{ latitude: number; longitude: number } | null>;
  setPickup: (loc: string, coords?: { latitude: number; longitude: number }) => void;
  setDestination: (loc: string, coords?: { latitude: number; longitude: number }) => void;
  selectOption: (opt: RideOption) => void;
  setPaymentMethod: (method: 'wallet' | 'upi' | 'cash') => void;
  applyPromo: (code: string) => boolean;
  removePromo: () => void;
  fetchFareEstimates: () => Promise<void>;
  fetchNearbyDrivers: (coords?: { latitude: number; longitude: number }, vehicleType?: string) => Promise<any[]>;
  startBooking: () => Promise<void>;
  checkActiveRideStatus: () => Promise<RideBooking | null>;
  updateBookingStatus: (status: RideBooking['status']) => void;
  cancelBooking: () => void;
  completeRide: (rating: number, tip: number) => void;
  scheduleRide: (data: Omit<ScheduledRide, 'id' | 'status'>) => void;
  cancelScheduledRide: (id: string) => void;
  resetTaxi: () => void;
}

export const useTaxiStore = create<TaxiState>((set, get) => ({
  pickupLocation: 'Current Location',
  pickupCoords: { latitude: 11.2588, longitude: 75.7804 }, // Kozhikode default
  destinationLocation: '',
  destinationCoords: null,

  routeDistanceKm: 0,
  routeDurationMinutes: 0,
  routePolyline: [],

  rideOptions: MOCK_RIDE_OPTIONS,
  selectedOption: MOCK_RIDE_OPTIONS[1], // Default Auto
  isLoadingEstimates: false,

  activeBooking: null,
  paymentMethod: 'cash',
  appliedPromo: null,
  scheduledRides: [],
  pastRides: INITIAL_PAST_RIDES,
  nearbyDrivers: [],
  isLoadingDrivers: false,
  isLocatingGps: false,

  fetchCurrentGpsLocation: async () => {
    try {
      set({ isLocatingGps: true });
      const coords = await locationService.getCurrentLocation();
      const geocoded = await locationService.reverseGeocode(coords.latitude, coords.longitude);

      const latLng = { latitude: coords.latitude, longitude: coords.longitude };
      const address = geocoded.fullAddress || `Current Location (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`;

      set({
        pickupLocation: address,
        pickupCoords: latLng,
        isLocatingGps: false,
      });

      // Recalculate route and estimates if destination already chosen
      if (get().destinationCoords) {
        get().fetchFareEstimates();
      }

      // Fetch nearby drivers around the fresh GPS coordinate
      get().fetchNearbyDrivers(latLng, get().selectedOption?.type);

      return latLng;
    } catch {
      set({ isLocatingGps: false });
      return null;
    }
  },

  setPickup: (loc, coords) => {
    set({
      pickupLocation: loc,
      ...(coords ? { pickupCoords: coords } : {}),
    });

    if (coords && get().destinationCoords) {
      get().fetchFareEstimates();
    }
    if (coords) {
      get().fetchNearbyDrivers(coords, get().selectedOption?.type);
    }
  },

  setDestination: (loc, coords) => {
    set({
      destinationLocation: loc,
      ...(coords ? { destinationCoords: coords } : {}),
    });

    if (coords && get().pickupCoords) {
      get().fetchFareEstimates();
    }
  },

  selectOption: (opt) => {
    set({ selectedOption: opt });
    get().fetchNearbyDrivers(get().pickupCoords || undefined, opt.type);
  },

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  applyPromo: (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'TAXISWIFT' || clean === 'FIRSTTRIP' || clean === 'SAVE20' || clean === 'UBSSUPER') {
      set({ appliedPromo: { code: clean, discountPercent: 20, maxDiscount: 50 } });
      return true;
    }
    return false;
  },

  removePromo: () => set({ appliedPromo: null }),

  fetchFareEstimates: async () => {
    const { pickupCoords, destinationCoords } = get();
    if (!pickupCoords || !destinationCoords) return;

    try {
      set({ isLoadingEstimates: true });

      const payload = {
        pickup: { latitude: pickupCoords.latitude, longitude: pickupCoords.longitude },
        destination: { latitude: destinationCoords.latitude, longitude: destinationCoords.longitude },
      };

      const res: any = await apiClient.post(ENDPOINTS.TAXI.ESTIMATE, payload);
      const data = res?.data || res;

      if (data && Array.isArray(data.estimates) && data.estimates.length > 0) {
        const mappedOptions: RideOption[] = data.estimates.map((est: any) => {
          const typeKey = (est.vehicleType || est.id || 'sedan').toLowerCase();
          const meta = VEHICLE_METADATA[typeKey] || VEHICLE_METADATA.sedan;

          return {
            id: est.id || typeKey,
            name: est.name || `UBS ${est.vehicleType}`,
            type: typeKey as any,
            icon: meta.icon,
            eta: `${est.etaMinutes || 3} mins away`,
            capacity: meta.capacity,
            estimatedFare: est.fare,
            originalFare: Math.round(est.fare * 1.15),
            description: est.description || `${meta.capacity} seats • AC • Instant pickup`,
            category: meta.category,
            tag: meta.tag,
            luggage: meta.luggage,
            features: meta.features,
          };
        });

        const currentSelected = get().selectedOption;
        const matchingSelected = mappedOptions.find((o) => o.type === currentSelected?.type) || mappedOptions[1] || mappedOptions[0];

        set({
          rideOptions: mappedOptions,
          selectedOption: matchingSelected,
          routeDistanceKm: data.distanceKm || 0,
          routeDurationMinutes: data.durationMinutes || 0,
          routePolyline: data.points || [],
          isLoadingEstimates: false,
        });
      } else {
        set({ isLoadingEstimates: false });
      }
    } catch {
      set({ isLoadingEstimates: false });
    }
  },

  fetchNearbyDrivers: async (coords, vehicleType) => {
    try {
      set({ isLoadingDrivers: true });
      const currentCoords = coords || get().pickupCoords || { latitude: 11.2588, longitude: 75.7804 };
      const vType = vehicleType || get().selectedOption?.type || 'all';

      const queryParams = new URLSearchParams({
        lat: currentCoords.latitude.toString(),
        lng: currentCoords.longitude.toString(),
        vehicleType: vType,
      });

      const res: any = await apiClient.get(`${ENDPOINTS.TAXI.NEARBY}?${queryParams.toString()}`);
      const drivers = Array.isArray(res) ? res : res?.data || [];
      set({ nearbyDrivers: drivers, isLoadingDrivers: false });
      return drivers;
    } catch {
      set({ nearbyDrivers: [], isLoadingDrivers: false });
      return [];
    }
  },

  startBooking: async () => {
    const {
      pickupLocation,
      pickupCoords,
      destinationLocation,
      destinationCoords,
      selectedOption,
      paymentMethod,
      appliedPromo,
      routeDistanceKm,
      routeDurationMinutes,
    } = get();
    if (!selectedOption) return;

    let discount = 0;
    if (appliedPromo) {
      discount = Math.min(
        Math.round((selectedOption.estimatedFare * appliedPromo.discountPercent) / 100),
        appliedPromo.maxDiscount
      );
    }
    const finalFare = Math.max(20, selectedOption.estimatedFare - discount);
    const localId = `RIDE-${Date.now().toString().slice(-6)}`;

    const pCoords = pickupCoords || { latitude: 11.2588, longitude: 75.7804 };
    const dCoords = destinationCoords || { latitude: 11.3040, longitude: 75.7750 };

    const booking: RideBooking = {
      id: localId,
      pickup: pickupLocation,
      destination: destinationLocation,
      rideOption: selectedOption,
      fare: finalFare,
      status: 'searching',
      createdAt: 'Just now',
      paymentMethod,
      promoCode: appliedPromo?.code,
      discount,
      distance: routeDistanceKm ? `${routeDistanceKm} km` : `${selectedOption.eta || '3 mins'} away`,
      duration: routeDurationMinutes ? `${routeDurationMinutes} mins` : '15 mins',
    };

    set({ activeBooking: booking });

    try {
      const res: any = await apiClient.post(ENDPOINTS.TAXI.BOOK, {
        pickupAddress: pickupLocation,
        destinationAddress: destinationLocation,
        pickupLocation: [pCoords.longitude, pCoords.latitude],
        destinationLocation: [dCoords.longitude, dCoords.latitude],
        vehicleType: selectedOption.type,
        vehicleClass: selectedOption.type,
        paymentMethod: paymentMethod || 'cash',
      });

      const rideData = res?.ride || res?.data || res;
      const rideId = rideData?.rideId || localId;
      const pickupOtp = rideData?.pickupOtp || res?.otp || '';

      const current = get().activeBooking;
      if (current) {
        set({
          activeBooking: {
            ...current,
            id: rideId,
            otp: pickupOtp,
            status: 'searching',
          },
        });
      }
    } catch {
      const current = get().activeBooking;
      if (current) {
        set({
          activeBooking: {
            ...current,
            id: localId,
            status: 'searching',
          },
        });
      }
    }
  },

  checkActiveRideStatus: async () => {
    const current = get().activeBooking;
    if (!current || !current.id) return null;

    try {
      const res: any = await apiClient.get(ENDPOINTS.TAXI.RIDE(current.id));
      const ride = res?.ride || res?.data || res;
      if (!ride) return current;

      const rawStatus = ride.status;
      let uiStatus: RideBooking['status'] = current.status;

      if (rawStatus === 'requested') uiStatus = 'searching';
      else if (rawStatus === 'accepted') uiStatus = 'driver_assigned';
      else if (rawStatus === 'arriving' || rawStatus === 'arrived') uiStatus = 'driver_arriving';
      else if (rawStatus === 'trip_started') uiStatus = 'in_progress';
      else if (rawStatus === 'completed') uiStatus = 'completed';
      else if (rawStatus === 'cancelled') uiStatus = 'cancelled';

      const backendDriver = res?.driver || ride.driver;
      let assignedDriver: Driver | undefined = current.driver;

      if (backendDriver) {
        assignedDriver = {
          id: backendDriver.driverId || 'drv',
          name: backendDriver.name || backendDriver.fullName || 'Taxi Driver',
          phone: backendDriver.phone || '',
          rating: backendDriver.rating || 5.0,
          vehicleModel: backendDriver.vehicleModel || current.rideOption.name,
          vehicleNumber: backendDriver.vehicleNumber || backendDriver.registrationNumber || '',
          photo: backendDriver.photo || undefined,
          tripsCount: backendDriver.totalRides || 100,
        };
      }

      const updatedBooking: RideBooking = {
        ...current,
        status: uiStatus,
        driver: assignedDriver,
        otp: ride.pickupOtp || current.otp,
        fare: ride.fare?.totalFare || current.fare,
      };

      set({ activeBooking: updatedBooking });
      return updatedBooking;
    } catch {
      return current;
    }
  },

  updateBookingStatus: (status) => {
    const current = get().activeBooking;
    if (current) {
      set({
        activeBooking: {
          ...current,
          status,
        },
      });
    }
  },

  cancelBooking: () => {
    const current = get().activeBooking;
    if (current) {
      if (current.id) {
        apiClient.post(ENDPOINTS.TAXI.CANCEL(current.id), { reason: 'Customer requested cancellation' }).catch(() => {});
      }

      const cancelledRide: PastRideItem = {
        id: current.id,
        pickup: current.pickup,
        destination: current.destination,
        fare: 0,
        date: 'Today, Just now',
        driver: current.driver ? current.driver.name : 'Unassigned',
        vehicleModel: current.driver ? current.driver.vehicleModel : current.rideOption.name,
        vehicleNumber: current.driver ? current.driver.vehicleNumber : '',
        type: current.rideOption.name,
        status: 'Cancelled',
        paymentMethod: current.paymentMethod === 'wallet' ? 'UBS Super Wallet' : current.paymentMethod === 'upi' ? 'UPI' : 'Cash',
        distance: current.distance || '',
        duration: '0 mins',
      };

      set((state) => ({
        activeBooking: {
          ...current,
          status: 'cancelled',
        },
        pastRides: [cancelledRide, ...state.pastRides],
      }));
    }
  },

  completeRide: (rating: number, tip: number) => {
    const current = get().activeBooking;
    if (current) {
      const completedItem: PastRideItem = {
        id: current.id,
        pickup: current.pickup,
        destination: current.destination,
        fare: current.fare + tip,
        originalFare: current.rideOption.originalFare,
        date: 'Today, Just now',
        driver: current.driver ? current.driver.name : 'UBS Super Driver',
        driverPhoto: current.driver?.photo,
        vehicleModel: current.driver ? current.driver.vehicleModel : current.rideOption.name,
        vehicleNumber: current.driver ? current.driver.vehicleNumber : '',
        type: current.rideOption.name,
        status: 'Completed',
        paymentMethod: current.paymentMethod === 'wallet' ? 'UBS Super Wallet' : current.paymentMethod === 'upi' ? 'UPI' : 'Cash',
        rating,
        distance: current.distance || '',
        duration: current.duration || '15 mins',
      };

      set((state) => ({
        activeBooking: {
          ...current,
          status: 'completed',
          ratingGiven: rating,
          tipAmount: tip,
        },
        pastRides: [completedItem, ...state.pastRides],
      }));
    }
  },

  scheduleRide: (data) => {
    const newScheduled: ScheduledRide = {
      id: `SCH-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'confirmed',
      ...data,
    };
    set((state) => ({
      scheduledRides: [newScheduled, ...state.scheduledRides],
    }));
  },

  cancelScheduledRide: (id) => {
    set((state) => ({
      scheduledRides: state.scheduledRides.filter((r) => r.id !== id),
    }));
  },

  resetTaxi: () => {
    set({
      activeBooking: null,
      selectedOption: MOCK_RIDE_OPTIONS[1],
      routeDistanceKm: 0,
      routeDurationMinutes: 0,
      routePolyline: [],
    });
  },
}));
