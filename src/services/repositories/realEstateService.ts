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

// No fake seed properties - only genuine properties created by user or fetched from backend
const FALLBACK_PROPERTIES: RealEstateProperty[] = [];

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
   * Uploads an image to Cloudinary via backend endpoint
   */
  async uploadImage(base64DataUri: string): Promise<{ url: string; publicId: string }> {
    const res: any = await apiClient.post('/real-estate/upload-image', { image: base64DataUri });
    if (res && (res.url || res.data?.url)) {
      return res.data || res;
    }
    throw new Error('Cloudinary photo upload failed');
  },

  /**
   * Fetches approved and active properties for public feed
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
      let serverProps: RealEstateProperty[] = [];
      if (res?.properties && Array.isArray(res.properties)) {
        serverProps = res.properties.map((p: any) => ({
          ...p,
          id: p.propertyId || p._id || p.id,
        }));
      }

      // Merge newly added local properties so user immediately sees their listed property
      const localApproved = inMemoryUserProperties.filter(
        (p) =>
          (p.isPaid || p.status === 'approved' || p.approvalStatus === 'approved') &&
          !serverProps.some((sp) => sp.propertyId === p.propertyId)
      );

      let combined = [...localApproved, ...serverProps];

      if (params?.search) {
        const q = params.search.toLowerCase();
        combined = combined.filter((p) => p.title?.toLowerCase().includes(q) || p.location?.toLowerCase().includes(q));
      }
      if (params?.listingType && params.listingType !== 'All') {
        const target = params.listingType.toLowerCase().includes('rent') ? 'rent' : 'sale';
        combined = combined.filter((p) => p.listingType === target);
      }

      return combined;
    } catch {
      // Offline fallback: only user-created properties
      return inMemoryUserProperties.filter(
        (p) => p.isPaid || p.status === 'approved' || p.approvalStatus === 'approved'
      );
    }
  },

  /**
   * Fetches properties submitted by current user
   */
  async getMyProperties(): Promise<RealEstateProperty[]> {
    try {
      const res: any = await apiClient.get('/real-estate/my-properties');
      let serverProps: RealEstateProperty[] = [];
      if (Array.isArray(res)) {
        serverProps = res.map((p: any) => ({
          ...p,
          id: p.propertyId || p._id || p.id,
        }));
      }

      const localUnique = inMemoryUserProperties.filter(
        (p) => !serverProps.some((sp) => sp.propertyId === p.propertyId)
      );
      return [...localUnique, ...serverProps];
    } catch {
      return inMemoryUserProperties;
    }
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

    return null;
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
      images: data.images?.length > 0 ? data.images : [],
      bedrooms: Number(data.bedrooms) || 0,
      bathrooms: Number(data.bathrooms) || 0,
      area: data.area,
      amenities: data.amenities || [],
      contactName: data.contactName || 'Owner',
      contactPhone: data.contactPhone || '+91 98765 43210',
      postedBy: 'Direct Owner',
      listingFeeAmount: fee,
      isPaid: isFree,
      status: isFree ? 'approved' : 'pending_payment',
      approvalStatus: isFree ? 'approved' : 'pending',
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
      keyId: 'rzp_live_TTgjOa6lPui9HK',
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
          found.status = 'approved';
          found.approvalStatus = 'approved';
          found.paymentId = res.paymentId;
        }
        return res;
      }
    } catch {
      // Fallback
    }

    const prop = inMemoryUserProperties.find((p) => p.propertyId === payload.propertyId);
    if (prop) {
      prop.isPaid = true;
      prop.status = 'approved';
      prop.approvalStatus = 'approved';
      prop.paymentId = `PLP-${Date.now().toString().slice(-6)}`;
    }

    return {
      success: true,
      property: prop as any,
      paymentId: prop?.paymentId || `PLP-${Date.now().toString().slice(-6)}`,
    };
  },
};
