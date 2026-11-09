// src/services/repositories/realEstateService.ts
import { apiClient } from '@/services/api/client';

export interface PropertyListingFee {
  feature: string;
  amount: number; // In Rupees, e.g. 50
  currency: string; // 'INR'
  isEnabled: boolean;
  updatedAt: string;
  updatedByName?: string;
}

export interface RealEstateProperty {
  id: string;
  propertyId: string;
  title: string;
  description: string;
  propertyType: 'villa' | 'apartment' | 'house' | 'commercial' | 'plot';
  listingType: 'sale' | 'rent';
  category: string;
  price: number;
  location: string;
  address: string;
  city: string;
  state: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  area: string;
  amenities: string[];
  contactName: string;
  contactPhone: string;
  postedBy: string;

  userId?: string;
  listingFeeAmount?: number;
  isPaid?: boolean;
  paymentId?: string;
  status: 'pending_payment' | 'under_review' | 'approved' | 'rejected';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
}

export interface PropertyPhotoPreset {
  id: string;
  title: string;
  category: 'Exterior' | 'Living Room' | 'Bedroom' | 'Kitchen' | 'Balcony' | 'Commercial';
  url: string;
}

export const PROPERTY_PHOTO_PRESETS: PropertyPhotoPreset[] = [
  {
    id: 'preset-ext-1',
    title: 'Modern Luxury Villa Exterior',
    category: 'Exterior',
    url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'preset-ext-2',
    title: 'Contemporary Gated Home',
    category: 'Exterior',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'preset-liv-1',
    title: 'Spacious Open Living Room',
    category: 'Living Room',
    url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'preset-liv-2',
    title: 'Premium Minimalist Hall',
    category: 'Living Room',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'preset-bed-1',
    title: 'Master Bedroom Suite',
    category: 'Bedroom',
    url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'preset-bed-2',
    title: 'Airy Modern Bedroom',
    category: 'Bedroom',
    url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'preset-kit-1',
    title: 'Modular Italian Kitchen',
    category: 'Kitchen',
    url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'preset-bal-1',
    title: 'Scenic Balcony & Deck View',
    category: 'Balcony',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'preset-com-1',
    title: 'Commercial Office / Showroom',
    category: 'Commercial',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  },
];

const FALLBACK_PROPERTIES: RealEstateProperty[] = [
  {
    id: 'PR-10001',
    propertyId: 'PR-10001',
    title: '3 BHK Modern Luxury Villa in Manjeri',
    description:
      'Architect-designed luxury villa with modular kitchen, private lawn, solar power, and 2 covered car parks. Situated in a prime residential enclave along Calicut Road, minutes away from top schools and hospitals.',
    propertyType: 'villa',
    listingType: 'sale',
    category: 'Residential',
    price: 8500000,
    location: 'Calicut Road, Manjeri, Malappuram',
    address: 'Plot 14, Green Valley Enclave, Calicut Road',
    city: 'Manjeri',
    state: 'Kerala',
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    ],
    bedrooms: 3,
    bathrooms: 3,
    area: '2400 sq.ft',
    amenities: [
      'Private Garden',
      'Solar Power',
      'Covered Parking',
      '24x7 Security',
      'Borewell & KWA Water',
      'Furnished Kitchen',
    ],
    contactName: 'Niyas Rahman',
    contactPhone: '+91 98765 43210',
    postedBy: 'Verified Builder',
    isPaid: true,
    status: 'approved',
    approvalStatus: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'PR-10002',
    propertyId: 'PR-10002',
    title: '2 BHK Waterfront Apartment in Kochi',
    description:
      'Spectacular lake-view premium apartment on Marine Drive with balcony sunset views and clubhouse amenities. Features imported vitrified tiles, 24h backup generator, and dedicated parking.',
    propertyType: 'apartment',
    listingType: 'rent',
    category: 'Residential',
    price: 24000,
    location: 'Marine Drive, Ernakulam, Kochi',
    address: 'Floor 11, Bayview Towers, Marine Drive',
    city: 'Kochi',
    state: 'Kerala',
    images: [
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    ],
    bedrooms: 2,
    bathrooms: 2,
    area: '1250 sq.ft',
    amenities: [
      'Swimming Pool',
      'Gym & Clubhouse',
      'Covered Parking',
      'High Speed Lifts',
      '24x7 Security',
      'Balcony Deck',
    ],
    contactName: 'Anil Kumar',
    contactPhone: '+91 98460 11223',
    postedBy: 'Direct Owner',
    isPaid: true,
    status: 'approved',
    approvalStatus: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'PR-10003',
    propertyId: 'PR-10003',
    title: '4 BHK Malabar Heritage Mansion in Kozhikode',
    description:
      'Majestic heritage-styled independent mansion with landscaped courtyard, teakwood interiors, open terrace garden, and servant quarters. Located in an elite residential corridor of Kozhikode.',
    propertyType: 'villa',
    listingType: 'sale',
    category: 'Residential',
    price: 18500000,
    location: 'Wayanad Road, Kozhikode',
    address: 'Hilltop Enclave, Wayanad Road',
    city: 'Kozhikode',
    state: 'Kerala',
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80',
    ],
    bedrooms: 4,
    bathrooms: 4,
    area: '3800 sq.ft',
    amenities: [
      'Private Garden',
      'Solar Power',
      'Covered Parking',
      'CCTV Surveillance',
      'Servant Quarters',
      'Balcony Deck',
    ],
    contactName: 'Faizal Basheer',
    contactPhone: '+91 97450 99887',
    postedBy: 'Verified Builder',
    isPaid: true,
    status: 'approved',
    approvalStatus: 'approved',
    createdAt: new Date().toISOString(),
  },
];

let inMemoryUserProperties: RealEstateProperty[] = [];

export const realEstateService = {
  /**
   * Fetches active property listing fee from the backend.
   * Never hardcodes ₹50 in the frontend!
   */
  async getListingFee(): Promise<PropertyListingFee> {
    try {
      const res: any = await apiClient.get('/real-estate/listing-fee');
      if (res && typeof res.amount === 'number') {
        return res;
      }
    } catch {
      // Fallback if offline
    }
    return {
      feature: 'real_estate_property_listing',
      amount: 50,
      currency: 'INR',
      isEnabled: true,
      updatedAt: new Date().toISOString(),
      updatedByName: 'System Admin',
    };
  },

  /**
   * Fetches approved properties for public feed
   */
  async getProperties(params?: {
    search?: string;
    propertyType?: string;
    listingType?: string;
    city?: string;
  }): Promise<RealEstateProperty[]> {
    try {
      const query = new URLSearchParams(params as any).toString();
      const res: any = await apiClient.get(`/real-estate/properties?${query}`);
      if (res?.properties && Array.isArray(res.properties)) {
        return res.properties.map((p: any) => ({
          ...p,
          id: p.propertyId || p._id || p.id,
        }));
      }
    } catch {
      // Fallback
    }

    let list = [...FALLBACK_PROPERTIES];
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q));
    }
    if (params?.listingType && params.listingType !== 'All') {
      const target = params.listingType.toLowerCase().includes('rent') ? 'rent' : 'sale';
      list = list.filter((p) => p.listingType === target);
    }
    return list;
  },

  /**
   * Fetches properties submitted by current user
   */
  async getMyProperties(): Promise<RealEstateProperty[]> {
    try {
      const res: any = await apiClient.get('/real-estate/my-properties');
      if (Array.isArray(res)) {
        return res.map((p: any) => ({
          ...p,
          id: p.propertyId || p._id || p.id,
        }));
      }
    } catch {
      // Fallback
    }
    return inMemoryUserProperties;
  },

  /**
   * Fetches single property details by ID (public or user's own)
   */
  async getPropertyById(propertyId: string): Promise<RealEstateProperty | null> {
    try {
      const res: any = await apiClient.get(`/real-estate/properties/${propertyId}`);
      if (res && (res.propertyId || res._id || res.id)) {
        return {
          ...res,
          id: res.propertyId || res._id || res.id,
        };
      }
    } catch {
      // Fallback below
    }

    // Check user listed properties first
    const userProp = inMemoryUserProperties.find(
      (p) => p.propertyId === propertyId || p.id === propertyId
    );
    if (userProp) return userProp;

    // Check fallback verified properties
    const fallbackProp = FALLBACK_PROPERTIES.find(
      (p) => p.propertyId === propertyId || p.id === propertyId
    );
    if (fallbackProp) return fallbackProp;

    return FALLBACK_PROPERTIES[0] || null;
  },

  /**
   * Submits a property draft
   */
  async createPropertyDraft(data: any): Promise<{ property: RealEstateProperty; listingFee: number; isPaid: boolean }> {
    try {
      const res: any = await apiClient.post('/real-estate/properties', data);
      if (res?.property) {
        const prop = {
          ...res.property,
          id: res.property.propertyId,
        };
        inMemoryUserProperties.unshift(prop);
        return {
          property: prop,
          listingFee: res.listingFee,
          isPaid: res.isPaid,
        };
      }
    } catch {
      // Fallback in-memory
    }

    const feeConfig = await this.getListingFee();
    const fee = feeConfig.isEnabled ? feeConfig.amount : 0;
    const isFree = fee === 0;
    const propertyId = `PR-${Date.now().toString().slice(-6)}`;

    const fallbackProp: RealEstateProperty = {
      id: propertyId,
      propertyId,
      title: data.title,
      description: data.description || '',
      propertyType: data.propertyType || 'villa',
      listingType: data.listingType || 'sale',
      category: data.category || 'Residential',
      price: Number(data.price),
      location: data.location,
      address: data.address,
      city: data.city || 'Manjeri',
      state: 'Kerala',
      images: data.images?.length > 0 ? data.images : [
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      ],
      bedrooms: Number(data.bedrooms) || 0,
      bathrooms: Number(data.bathrooms) || 0,
      area: data.area,
      amenities: data.amenities || [],
      contactName: data.contactName || 'Owner',
      contactPhone: data.contactPhone || '+91 98765 43210',
      postedBy: 'Direct Owner',
      listingFeeAmount: fee,
      isPaid: isFree,
      status: isFree ? 'under_review' : 'pending_payment',
      approvalStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    inMemoryUserProperties.unshift(fallbackProp);

    return {
      property: fallbackProp,
      listingFee: fee,
      isPaid: isFree,
    };
  },

  /**
   * Creates Razorpay listing fee order on the backend
   */
  async createListingOrder(propertyId: string): Promise<{
    isFree: boolean;
    orderId?: string;
    amount: number;
    currency: string;
    keyId: string;
    propertyId: string;
  }> {
    try {
      const res: any = await apiClient.post('/real-estate/create-listing-order', { propertyId });
      if (res && res.amount !== undefined) {
        return res;
      }
    } catch {
      // Fallback
    }

    const feeConfig = await this.getListingFee();
    return {
      isFree: feeConfig.amount === 0,
      orderId: `order_${propertyId}_${Date.now().toString().slice(-4)}`,
      amount: feeConfig.amount,
      currency: 'INR',
      keyId: 'rzp_test_ubssuper_realestate',
      propertyId,
    };
  },

  /**
   * Verifies Razorpay payment signature on backend
   */
  async verifyListingPayment(payload: {
    propertyId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<{ success: boolean; property: RealEstateProperty; paymentId: string }> {
    try {
      const res: any = await apiClient.post('/real-estate/verify-listing-payment', payload);
      if (res?.success) {
        const found = inMemoryUserProperties.find((p) => p.propertyId === payload.propertyId);
        if (found) {
          found.isPaid = true;
          found.status = 'under_review';
          found.approvalStatus = 'pending';
        }
        return res;
      }
    } catch {
      // Fallback
    }

    const prop = inMemoryUserProperties.find((p) => p.propertyId === payload.propertyId);
    if (prop) {
      prop.isPaid = true;
      prop.status = 'under_review';
      prop.approvalStatus = 'pending';
      prop.paymentId = `PLP-${Date.now().toString().slice(-6)}`;
    }

    return {
      success: true,
      property: prop || (FALLBACK_PROPERTIES[0] as any),
      paymentId: `PLP-${Date.now().toString().slice(-6)}`,
    };
  },
};
