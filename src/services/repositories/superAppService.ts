// src/services/repositories/superAppService.ts
import { 
  MOCK_CATEGORIES, 
  MOCK_HERO_BANNERS, 
  MOCK_RIDE_OPTIONS,
  MOCK_LOGISTICS_VEHICLES
} from '@/services/mock/data';
import { apiClient } from '@/services/api/client';
import { ENDPOINTS } from '@/services/api/endpoints';
import { Store, Product, Restaurant } from '@/types';

export const superAppService = {
  // Home & Global
  async getCategories() {
    try {
      const res: any = await apiClient.get('/content/status');
      if (res?.categories && Array.isArray(res.categories)) {
        return res.categories;
      }
    } catch {
      // Fallback
    }
    return MOCK_CATEGORIES;
  },

  async getHeroBanners() {
    try {
      const liveBanners: any = await apiClient.get(ENDPOINTS.CONTENT.BANNERS);
      if (Array.isArray(liveBanners) && liveBanners.length > 0) {
        return liveBanners.map((b: any, index: number) => ({
          id: b.bannerId || `b-${index}`,
          title: b.title || 'UBS Super Special Offer',
          subtitle: b.subtitle || 'Experience lightning fast services across Kerala',
          ctaText: 'Explore Now',
          category: b.targetCategory || b.targetScreen || 'grocery',
          bgGradient: index % 2 === 0 ? ['#15803D', '#16A34A'] : ['#C2410C', '#F97316'],
          badge: 'Featured',
          imageUrl: b.imageUrl,
        }));
      }
    } catch {
      // Fallback
    }
    return MOCK_HERO_BANNERS;
  },

  async searchGlobal(query: string) {
    const q = query.toLowerCase().trim();
    if (!q) return { grocery: [], food: [], hotels: [], doctors: [], marketplace: [], appliances: [] };

    try {
      const grocery = await this.getGroceryProducts();
      const restaurants = await this.getRestaurants();
      const hotels = await this.getHotels();
      const doctors = await this.getDoctors();

      return {
        grocery: grocery.filter((p: any) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)),
        food: restaurants.filter((r: any) => r.name.toLowerCase().includes(q) || (r.cuisines && r.cuisines.some((c: string) => c.toLowerCase().includes(q)))),
        hotels: hotels.filter((h: any) => h.name.toLowerCase().includes(q) || (h.city && h.city.toLowerCase().includes(q))),
        doctors: doctors.filter((d: any) => d.name.toLowerCase().includes(q) || (d.specialty && d.specialty.toLowerCase().includes(q))),
        marketplace: [],
        appliances: [],
      };
    } catch {
      return { grocery: [], food: [], hotels: [], doctors: [], marketplace: [], appliances: [] };
    }
  },

  // Store-First Discovery (Grocery & Restaurants)
  async getStores(params: {
    category?: 'grocery' | 'restaurant';
    lat?: number;
    lng?: number;
    search?: string;
    sort?: string;
    cuisine?: string;
    isOpen?: boolean;
    deliveryAvailable?: boolean;
  } = {}): Promise<Store[]> {
    try {
      const queryParts: string[] = [];
      if (params.category) queryParts.push(`category=${params.category}`);
      if (params.lat !== undefined) queryParts.push(`lat=${params.lat}`);
      if (params.lng !== undefined) queryParts.push(`lng=${params.lng}`);
      if (params.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
      if (params.sort) queryParts.push(`sort=${params.sort}`);
      if (params.cuisine) queryParts.push(`cuisine=${encodeURIComponent(params.cuisine)}`);
      if (params.isOpen !== undefined) queryParts.push(`isOpen=${params.isOpen}`);
      if (params.deliveryAvailable !== undefined) queryParts.push(`deliveryAvailable=${params.deliveryAvailable}`);

      const queryString = queryParts.length ? `?${queryParts.join('&')}` : '';
      const res: any = await apiClient.get(`/content/stores${queryString}`);

      if (Array.isArray(res)) {
        return res.map((s: any) => ({
          id: s.id || s.partnerId,
          name: s.name || s.businessName,
          category: s.category || params.category || 'grocery',
          logo: s.logo || s.logoUrl,
          coverImage: s.coverImage || s.bannerImage,
          galleryImages: s.galleryImages || [],
          rating: s.rating || 4.7,
          ratingCount: s.ratingCount || 120,
          deliveryTime: s.deliveryTime || `${s.estimatedDeliveryMinutes || 25} mins`,
          deliveryFee: s.deliveryFee !== undefined ? s.deliveryFee : 30,
          minOrderAmount: s.minOrderAmount || 199,
          cuisines: s.cuisines || [],
          address: s.address || '',
          city: s.city || 'Kerala',
          isOpen: s.isOpen !== false,
          distanceKm: s.distanceKm || 1.8,
          distanceFormatted: s.distanceFormatted || '1.8 km',
          storeDescription: s.storeDescription || s.description || '',
          featuredOffer: s.deliveryFee === 0 ? 'FREE Delivery' : (s.minOrderAmount ? `Min order ₹${s.minOrderAmount}` : undefined),
          isPureVeg: s.isPureVeg,
          latitude: s.latitude ?? s.location?.coordinates?.[1],
          longitude: s.longitude ?? s.location?.coordinates?.[0],
          customerCare: s.customerCare || undefined,
          location: s.location || (s.latitude && s.longitude ? { type: 'Point', coordinates: [s.longitude, s.latitude] } : undefined),
        }));
      }
    } catch {
      // Backend fallback
    }

    return [];
  },

  async getStoreById(storeId: string, coords?: { lat?: number; lng?: number }): Promise<Store | null> {
    try {
      const q = coords?.lat !== undefined ? `?lat=${coords.lat}&lng=${coords.lng}` : '';
      const s: any = await apiClient.get(`/content/stores/${storeId}${q}`);
      if (s && (s.id || s.partnerId || s.name || s.businessName)) {
        return {
          id: s.id || s.partnerId || storeId,
          name: s.name || s.businessName,
          category: s.category || 'grocery',
          logo: s.logo || s.logoUrl,
          coverImage: s.coverImage || s.bannerImage,
          galleryImages: s.galleryImages || [],
          rating: s.rating || 4.8,
          ratingCount: s.ratingCount || 150,
          deliveryTime: s.deliveryTime || `${s.estimatedDeliveryMinutes || 25} mins`,
          deliveryFee: s.deliveryFee !== undefined ? s.deliveryFee : 30,
          minOrderAmount: s.minOrderAmount || 199,
          cuisines: s.cuisines || [],
          address: s.address || '',
          city: s.city || 'Kerala',
          isOpen: s.isOpen !== false,
          distanceKm: s.distanceKm || 1.8,
          distanceFormatted: s.distanceFormatted || '1.8 km',
          storeDescription: s.storeDescription || s.description || '',
          featuredOffer: s.deliveryFee === 0 ? 'FREE Delivery' : undefined,
          isPureVeg: s.isPureVeg,
          latitude: s.latitude ?? s.location?.coordinates?.[1],
          longitude: s.longitude ?? s.location?.coordinates?.[0],
          customerCare: s.customerCare || undefined,
          location: s.location || (s.latitude && s.longitude ? { type: 'Point', coordinates: [s.longitude, s.latitude] } : undefined),
        };
      }
    } catch {
      // Fallback
    }
    return null;
  },

  async getStoreProducts(storeId: string, category?: string, search?: string): Promise<Product[]> {
    try {
      const queryParts: string[] = [];
      if (category && category !== 'All') queryParts.push(`category=${encodeURIComponent(category)}`);
      if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
      const q = queryParts.length ? `?${queryParts.join('&')}` : '';

      const res: any = await apiClient.get(`/content/stores/${storeId}/products${q}`);
      if (Array.isArray(res)) {
        return res.map((p: any) => ({
          id: p.productId || p._id || p.id,
          storeId: p.partnerId || storeId,
          partnerId: p.partnerId || storeId,
          name: p.name,
          category: p.category || 'General',
          subCategory: p.subCategory,
          price: p.sellingPrice || p.price,
          originalPrice: p.mrp || p.originalPrice || p.price,
          unit: p.unit || '1 unit',
          image: p.imageUrl || p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
          description: p.description || '',
          inStock: p.inStock !== false && (p.stockQuantity === undefined || p.stockQuantity > 0),
          rating: p.rating || 4.8,
          ratingCount: p.ratingCount || 120,
          discountPercentage: p.discountPercentage || (p.mrp && p.sellingPrice && p.mrp > p.sellingPrice ? Math.round(((p.mrp - p.sellingPrice) / p.mrp) * 100) : 0),
          isVeg: p.isVeg,
        }));
      }
    } catch {
      // Fallback
    }
    return [];
  },

  // Grocery Products (Fallback & Product details)
  async getGroceryProducts(category?: string) {
    try {
      const liveProducts: any = await apiClient.get('/partners/grocery/products');
      if (Array.isArray(liveProducts)) {
        const mapped = liveProducts.map((p: any) => ({
          id: p.productId || p._id || p.id,
          storeId: p.partnerId,
          partnerId: p.partnerId,
          name: p.name,
          category: p.category || 'Grocery',
          price: p.sellingPrice || p.price,
          originalPrice: p.mrp || p.originalPrice || p.price,
          unit: p.unit || '1 unit',
          image: p.imageUrl || p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
          description: p.description || '',
          inStock: p.inStock !== false && (p.stockQuantity === undefined || p.stockQuantity > 0),
          rating: p.rating || 4.8,
          ratingCount: p.ratingCount || 120,
          discountPercentage: p.discountPercentage,
          isVeg: p.isVeg,
        }));
        if (!category || category === 'All') return mapped;
        return mapped.filter((p: any) => p.category === category);
      }
    } catch {
      // Backend offline or empty
    }

    return [];
  },

  async getGroceryProductById(id: string) {
    try {
      const liveProduct: any = await apiClient.get(`/partners/grocery/products/${id}`);
      if (liveProduct && liveProduct.name) {
        return {
          id: liveProduct.productId || liveProduct.id,
          storeId: liveProduct.partnerId,
          partnerId: liveProduct.partnerId,
          name: liveProduct.name,
          category: liveProduct.category,
          price: liveProduct.sellingPrice || liveProduct.price,
          originalPrice: liveProduct.mrp || liveProduct.price,
          unit: liveProduct.unit || '1 unit',
          image: liveProduct.imageUrl || liveProduct.image,
          description: liveProduct.description || '',
          inStock: liveProduct.inStock !== false,
          rating: liveProduct.rating || 4.8,
          ratingCount: liveProduct.ratingCount || 120,
          isVeg: liveProduct.isVeg,
        };
      }
    } catch {
      // Fallback
    }
    return null;
  },

  // Food / Restaurants (uses real partner stores with photos)
  async getRestaurants(coords?: { lat?: number; lng?: number }) {
    const stores = await this.getStores({ category: 'restaurant', lat: coords?.lat, lng: coords?.lng });
    if (stores.length > 0) {
      return stores.map((s) => ({
        id: s.id,
        name: s.name,
        image: s.logo || s.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
        coverImage: s.coverImage,
        galleryImages: s.galleryImages,
        rating: s.rating,
        ratingCount: s.ratingCount,
        deliveryTime: s.deliveryTime,
        cuisines: s.cuisines.length > 0 ? s.cuisines : ['Multi-Cuisine', 'South Indian'],
        priceLevel: '$$',
        location: s.city || 'Kerala',
        address: s.address,
        isOpen: s.isOpen,
        isPureVeg: !!s.isPureVeg,
        distance: s.distanceFormatted,
        distanceKm: s.distanceKm,
        latitude: s.latitude,
        longitude: s.longitude,
        locationCoords: s.latitude && s.longitude ? { latitude: s.latitude, longitude: s.longitude } : undefined,
        storeDescription: s.storeDescription,
        deliveryFee: s.deliveryFee,
        minOrderAmount: s.minOrderAmount,
      }));
    }
    return [];
  },

  async getRestaurantById(id: string) {
    const s = await this.getStoreById(id);
    if (s) {
      return {
        id: s.id,
        name: s.name,
        image: s.logo || s.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
        coverImage: s.coverImage,
        galleryImages: s.galleryImages,
        rating: s.rating,
        ratingCount: s.ratingCount,
        deliveryTime: s.deliveryTime,
        cuisines: s.cuisines.length > 0 ? s.cuisines : ['Multi-Cuisine'],
        priceLevel: '$$',
        location: s.city || 'Kerala',
        isOpen: s.isOpen,
        isPureVeg: !!s.isPureVeg,
        distance: s.distanceFormatted,
        storeDescription: s.storeDescription,
        deliveryFee: s.deliveryFee,
        minOrderAmount: s.minOrderAmount,
        customerCare: s.customerCare || undefined,
      };
    }
    return null;
  },

  async getStoreCustomerCare(storeId: string) {
    try {
      const res: any = await apiClient.get(`/content/stores/${storeId}/customer-care`);
      return res?.data || res;
    } catch {
      return null;
    }
  },

  async getDishesByRestaurant(restaurantId: string) {
    const products = await this.getStoreProducts(restaurantId);
    if (products.length > 0) {
      return products.map((d: any) => ({
        id: d.id,
        restaurantId,
        name: d.name,
        price: d.price,
        originalPrice: d.originalPrice || d.price,
        image: d.image,
        description: d.description || '',
        category: d.category || 'Main Course',
        isVeg: d.isVeg !== false,
        rating: d.rating || 4.6,
      }));
    }
    return [];
  },

  // Taxi Fare Options (Real Multiclass Fare from Deployed Backend)
  async getRideOptions(pickupCoords = [77.5946, 12.9716], destCoords = [77.6387, 12.9784]) {
    try {
      const estimate: any = await apiClient.post(ENDPOINTS.TAXI.ESTIMATE, {
        pickupLocation: pickupCoords,
        destinationLocation: destCoords,
      });

      if (estimate && estimate.estimates && Array.isArray(estimate.estimates)) {
        return estimate.estimates.map((est: any) => {
          const matchedMock = MOCK_RIDE_OPTIONS.find(m => m.type.toLowerCase() === est.vehicleClass.toLowerCase());
          return {
            id: `opt-${est.vehicleClass}`,
            name: matchedMock?.name || `UBS Super ${est.vehicleClass.toUpperCase()}`,
            type: est.vehicleClass as any,
            icon: matchedMock?.icon || 'car',
            eta: `${est.estimatedMinutes} mins`,
            capacity: matchedMock?.capacity || 4,
            estimatedFare: est.estimatedFare,
            originalFare: Math.round(est.estimatedFare * 1.15),
            description: matchedMock?.description || `Affordable ${est.vehicleClass} ride`,
            tag: matchedMock?.tag,
            features: matchedMock?.features,
          };
        });
      }
    } catch {
      // Offline fallback
    }
    return MOCK_RIDE_OPTIONS;
  },

  // Hotels
  async getHotels() {
    try {
      const liveHotels: any = await apiClient.get('/content/hotels');
      if (Array.isArray(liveHotels)) {
        return liveHotels.map((h: any) => ({
          id: h.hotelId || h._id || h.id,
          name: h.name || h.hotelName,
          city: h.city || 'Kerala',
          location: h.address || h.location || 'Kerala',
          image: h.imageUrl || h.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
          rating: h.rating || 4.7,
          pricePerNight: h.pricePerNight || h.price || 1999,
          amenities: h.amenities || ['Free WiFi', 'AC', 'Breakfast Included'],
          availableRooms: h.availableRooms || 5,
        }));
      }
    } catch {
      // Fallback
    }
    return [];
  },

  async getHotelById(id: string) {
    try {
      const hotels = await this.getHotels();
      return hotels.find((h: any) => h.id === id) || null;
    } catch {
      return null;
    }
  },

  // Logistics
  async getLogisticsVehicles() {
    return MOCK_LOGISTICS_VEHICLES;
  },

  // Doctors
  async getDoctors() {
    try {
      const liveDoctors: any = await apiClient.get('/content/doctors');
      if (Array.isArray(liveDoctors)) {
        return liveDoctors.map((d: any) => ({
          id: d.doctorId || d._id || d.id,
          name: d.name || `Dr. ${d.doctorName}`,
          specialty: d.specialty || 'General Physician',
          qualification: d.qualification || 'MBBS, MD',
          experience: d.experienceYears ? `${d.experienceYears} yrs exp` : '10+ yrs exp',
          consultationFee: d.consultationFee || 400,
          rating: d.rating || 4.8,
          clinicName: d.clinicName || 'City Clinic',
          location: d.city || 'Kerala',
          image: d.imageUrl || d.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80',
        }));
      }
    } catch {
      // Fallback
    }
    return [];
  },

  async getDoctorById(id: string) {
    try {
      const doctors = await this.getDoctors();
      return doctors.find((d: any) => d.id === id) || null;
    } catch {
      return null;
    }
  },

  // Marketplace
  async getMarketplaceListings() {
    return [];
  },

  async getMarketplaceListingById(id: string) {
    return null;
  },

  // Appliances
  async getAppliances() {
    return [];
  },

  async getApplianceById(id: string) {
    return null;
  },

  // Orders
  async getRecentOrders() {
    try {
      const liveOrders: any = await apiClient.get(ENDPOINTS.ORDERS.MY_ORDERS);
      if (Array.isArray(liveOrders)) {
        return liveOrders.map((o: any) => ({
          id: o.orderId || o.id,
          type: o.type || 'grocery',
          partnerName: o.partnerName || 'Merchant Partner',
          totalAmount: o.totalAmount,
          status: o.fulfillmentStatus || 'placed',
          createdAt: o.createdAt || new Date().toISOString(),
          items: o.items || [],
        }));
      }
    } catch {
      // Offline fallback
    }
    return [];
  },
};
