// src/types/index.ts

export type CategoryType = 
  | 'taxi' 
  | 'grocery' 
  | 'food' 
  | 'hotels' 
  | 'logistics' 
  | 'doctors' 
  | 'marketplace' 
  | 'appliances';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  isGuest?: boolean;
  memberSince?: string;
}

export interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  houseNumber?: string;
  locality?: string;
  district?: string;
  country?: string;
  fullAddress?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: CategoryType;
  color: string;
  bgLight: string;
  subtitle?: string;
}

export interface Store {
  id: string;
  name: string;
  category: 'grocery' | 'restaurant' | 'hotel' | 'clinic';
  logo?: string;
  coverImage?: string;
  galleryImages?: string[];
  rating: number;
  ratingCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrderAmount: number;
  cuisines: string[];
  address: string;
  city: string;
  isOpen: boolean;
  distanceKm: number;
  distanceFormatted: string;
  storeDescription?: string;
  featuredOffer?: string;
  isPureVeg?: boolean;
  latitude?: number;
  longitude?: number;
  customerCare?: {
    phoneCountryCode?: string;
    phoneNumber?: string;
    email?: string;
    formattedPhone?: string;
  };
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  price: number;
  originalPrice?: number;
  unit: string; // e.g. '500g', '1 kg', '1 Pc'
  image: string;
  description: string;
  rating?: number;
  ratingCount?: number;
  isBestSeller?: boolean;
  isOrganic?: boolean;
  inStock: boolean;
  discountPercentage?: number;
  storeId?: string;
  partnerId?: string;
  isVeg?: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedOptions?: Record<string, string>;
  note?: string;
  storeId?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  coverImage?: string;
  galleryImages?: string[];
  rating: number;
  ratingCount: number;
  deliveryTime: string;
  cuisines: string[];
  priceLevel: string; // '$', '$$', '$$$'
  location: string;
  address?: string;
  isOpen: boolean;
  isPureVeg?: boolean;
  featuredOffer?: string;
  distance: string;
  distanceKm?: number;
  latitude?: number;
  longitude?: number;
  locationCoords?: { latitude: number; longitude: number };
  storeDescription?: string;
  deliveryFee?: number;
  minOrderAmount?: number;
  customerCare?: {
    phoneCountryCode?: string;
    phoneNumber?: string;
    email?: string;
    formattedPhone?: string;
  };
}

export interface Dish {
  id: string;
  restaurantId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  category: string;
  isVeg: boolean;
  isBestseller?: boolean;
  rating?: number;
  customizations?: {
    name: string;
    options: { name: string; price: number }[];
  }[];
}

export interface RideOption {
  id: string;
  name: string;
  type: 'bike' | 'auto' | 'mini' | 'sedan' | 'suv' | 'luxury';
  icon: string;
  eta: string;
  capacity: number;
  estimatedFare: number;
  description: string;
  category?: 'commute' | 'comfort' | 'family';
  tag?: string;
  originalFare?: number;
  luggage?: string;
  features?: string[];
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  rating: number;
  photo?: string;
  vehicleModel: string;
  vehicleNumber: string;
  vehicleColor?: string;
  tripsCount: number;
}

export interface RideBooking {
  id: string;
  pickup: string;
  destination: string;
  rideOption: RideOption;
  fare: number;
  status: 'idle' | 'searching' | 'driver_assigned' | 'driver_arriving' | 'in_progress' | 'completed' | 'cancelled';
  driver?: Driver;
  otp?: string;
  createdAt: string;
  paymentMethod?: 'wallet' | 'upi' | 'cash';
  promoCode?: string;
  discount?: number;
  distance?: string;
  duration?: string;
  ratingGiven?: number;
  tipAmount?: number;
}

export interface ScheduledRide {
  id: string;
  pickup: string;
  destination: string;
  date: string;
  time: string;
  rideOption: RideOption;
  estimatedFare: number;
  status: 'confirmed' | 'cancelled';
  notes?: string;
}

export interface Hotel {
  id: string;
  name: string;
  images: string[];
  location: string;
  city: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  originalPrice?: number;
  amenities: string[];
  overview: string;
  roomTypes: {
    id: string;
    title: string;
    price: number;
    capacity: string;
    features: string[];
  }[];
  policies: string[];
}

export interface LogisticsVehicle {
  id: string;
  name: string;
  type: 'two_wheeler' | 'three_wheeler' | 'mini_truck' | 'pickup' | 'large_truck';
  capacityKg: number;
  estimatedFare: number;
  eta: string;
  dimensions: string;
  icon: string;
}

export interface Shipment {
  id: string;
  pickupAddress: string;
  dropoffAddress: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  goodsCategory: string;
  weightKg: number;
  vehicle: LogisticsVehicle;
  fare: number;
  status: 'created' | 'driver_assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  createdAt: string;
  trackingNumber: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  location: string;
  experienceYears: number;
  consultationFee: number;
  rating: number;
  reviewCount: number;
  photo: string;
  bio: string;
  languages: string[];
  availableSlots: {
    date: string;
    times: string[];
  }[];
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorPhoto: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  type: 'in_person' | 'online';
  date: string;
  timeSlot: string;
  fee: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export interface MarketplaceListing {
  id: string;
  title: string;
  category: string;
  price: number;
  isNegotiable: boolean;
  images: string[];
  description: string;
  location: string;
  postedDate: string;
  sellerName: string;
  sellerPhone: string;
  sellerMemberSince: string;
  condition: 'Brand New' | 'Like New' | 'Used - Good' | 'Used - Fair';
}

export interface Appliance {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  specs: Record<string, string>;
  warrantyYears: number;
  inStock: boolean;
  description: string;
  installationAvailable: boolean;
  installationFee: number;
}

export type OrderStatus = 
  | 'placed' 
  | 'confirmed' 
  | 'processing' 
  | 'out_for_delivery' 
  | 'completed' 
  | 'cancelled';

export interface Order {
  id: string;
  category: CategoryType;
  itemsSummary: string;
  totalAmount: number;
  status: OrderStatus;
  date: string;
  deliveryAddress: string;
  paymentMethod: string;
  paymentStatus?: 'pending' | 'captured' | 'failed' | 'refunded' | string;
  itemCount?: number;
  currency?: string;
  createdAt?: string;
  items?: CartItem[];
  bookingDetails?: Record<string, any>;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  validCategory?: CategoryType | 'all';
  expiryDate: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  category: 'order' | 'ride' | 'promo' | 'account';
  isRead: boolean;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  messages: { sender: 'user' | 'support'; text: string; time: string }[];
}
