// src/store/cartStore.ts
import { create } from 'zustand';
import { CartItem, Product, CategoryType, Coupon } from '@/types';
import { storage } from '@/utils/storage';
import { useAuthStore } from './authStore';

export interface StoreInfo {
  id: string;
  name: string;
  type?: 'grocery' | 'food';
  logo?: string;
  deliveryFee?: number;
}

export interface AddItemResult {
  success: boolean;
  conflict?: boolean;
  currentStoreName?: string;
  newStoreName?: string;
  clearAndAdd?: () => void;
}

export interface ConflictModalState {
  isOpen: boolean;
  currentStoreName: string;
  newStoreName: string;
  onConfirm: () => void;
}

interface CartState {
  items: CartItem[];
  activeCategory: CategoryType | null;
  appliedCoupon: Coupon | null;
  deliveryInstruction: string;
  isLoginModalOpen: boolean;
  
  // Single-Store Isolation tracking
  storeId: string | null;
  storeName: string | null;
  storeType: 'grocery' | 'food' | null;
  storeLogo: string | null;
  storeDeliveryFee: number | null;

  // Global Conflict Dialog State
  conflictModal: ConflictModalState | null;
  setConflictModal: (modal: ConflictModalState | null) => void;

  openLoginModal: () => void;
  closeLoginModal: () => void;
  addItem: (product: Product, quantity?: number, storeInfo?: StoreInfo) => AddItemResult;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon) => boolean;
  removeCoupon: () => void;
  setDeliveryInstruction: (instruction: string) => void;
  
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getDeliveryFee: () => number;
  getTaxAmount: () => number;
  getTotalAmount: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  activeCategory: null,
  appliedCoupon: null,
  deliveryInstruction: '',
  isLoginModalOpen: false,

  storeId: null,
  storeName: null,
  storeType: null,
  storeLogo: null,
  storeDeliveryFee: null,

  conflictModal: null,
  setConflictModal: (modal) => set({ conflictModal: modal }),

  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),

  addItem: (product, quantity = 1, storeInfo) => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      set({ isLoginModalOpen: true });
      return { success: false };
    }

    const { items, storeId: currentStoreId, storeName: currentStoreName } = get();

    // Determine target store
    const targetStoreId = storeInfo?.id || product.storeId || product.partnerId;
    const targetStoreName = storeInfo?.name || 'Selected Business';

    // Single-store validation: if cart has items from a different store, trigger conflict
    if (items.length > 0 && currentStoreId && targetStoreId && currentStoreId !== targetStoreId) {
      const clearAndAddFn = () => {
        const newItems: CartItem[] = [{ id: `cart-${product.id}`, product, quantity, storeId: targetStoreId }];
        set({
          items: newItems,
          storeId: targetStoreId,
          storeName: targetStoreName,
          storeType: storeInfo?.type || (product.category === 'Food' || product.category === 'food' ? 'food' : 'grocery'),
          storeLogo: storeInfo?.logo || null,
          storeDeliveryFee: storeInfo?.deliveryFee ?? null,
          activeCategory: (product.category as CategoryType) || 'grocery',
          conflictModal: null,
        });
        storage.setItem('ubssuper_cart', newItems);
      };

      set({
        conflictModal: {
          isOpen: true,
          currentStoreName: currentStoreName || 'Current Store',
          newStoreName: targetStoreName,
          onConfirm: clearAndAddFn,
        },
      });

      return {
        success: false,
        conflict: true,
        currentStoreName: currentStoreName || 'Current Store',
        newStoreName: targetStoreName,
        clearAndAdd: clearAndAddFn,
      };
    }

    const existingIndex = items.findIndex(item => item.product.id === product.id);
    let updatedItems: CartItem[];

    if (existingIndex > -1) {
      updatedItems = [...items];
      updatedItems[existingIndex].quantity += quantity;
    } else {
      updatedItems = [...items, { id: `cart-${product.id}`, product, quantity, storeId: targetStoreId }];
    }

    set({
      items: updatedItems,
      activeCategory: (product.category as CategoryType) || 'grocery',
      storeId: currentStoreId || targetStoreId || null,
      storeName: currentStoreName || targetStoreName || null,
      storeType: get().storeType || storeInfo?.type || (product.category === 'Food' || product.category === 'food' ? 'food' : 'grocery'),
      storeLogo: get().storeLogo || storeInfo?.logo || null,
      storeDeliveryFee: get().storeDeliveryFee ?? storeInfo?.deliveryFee ?? null,
    });

    storage.setItem('ubssuper_cart', updatedItems);
    return { success: true };
  },

  removeItem: (productId) => {
    const { items } = get();
    const updatedItems = items.filter(item => item.product.id !== productId);
    if (updatedItems.length === 0) {
      set({
        items: [],
        storeId: null,
        storeName: null,
        storeType: null,
        storeLogo: null,
        storeDeliveryFee: null,
        appliedCoupon: null,
      });
      storage.removeItem('ubssuper_cart');
    } else {
      set({ items: updatedItems });
      storage.setItem('ubssuper_cart', updatedItems);
    }
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    const { items } = get();
    const updatedItems = items.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    );
    set({ items: updatedItems });
    storage.setItem('ubssuper_cart', updatedItems);
  },

  clearCart: () => {
    set({
      items: [],
      appliedCoupon: null,
      deliveryInstruction: '',
      storeId: null,
      storeName: null,
      storeType: null,
      storeLogo: null,
      storeDeliveryFee: null,
      conflictModal: null,
    });
    storage.removeItem('ubssuper_cart');
  },

  applyCoupon: (coupon) => {
    const subtotal = get().getSubtotal();
    if (subtotal < coupon.minOrderValue) {
      return false;
    }
    set({ appliedCoupon: coupon });
    return true;
  },

  removeCoupon: () => {
    set({ appliedCoupon: null });
  },

  setDeliveryInstruction: (instruction) => {
    set({ deliveryInstruction: instruction });
  },

  getSubtotal: () => {
    return get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  },

  getDiscountAmount: () => {
    const { appliedCoupon } = get();
    const subtotal = get().getSubtotal();
    if (!appliedCoupon) return 0;

    if (appliedCoupon.discountType === 'flat') {
      return appliedCoupon.discountValue;
    } else {
      const percentageDiscount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscount && percentageDiscount > appliedCoupon.maxDiscount) {
        return appliedCoupon.maxDiscount;
      }
      return percentageDiscount;
    }
  },

  getDeliveryFee: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    const { storeDeliveryFee } = get();
    if (subtotal > 500) return 0; // Free delivery above 500
    if (storeDeliveryFee !== null && storeDeliveryFee !== undefined) {
      return storeDeliveryFee;
    }
    return 35; // Default delivery fee
  },

  getTaxAmount: () => {
    const subtotal = get().getSubtotal();
    return Math.round(subtotal * 0.05); // 5% GST
  },

  getTotalAmount: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    const discount = get().getDiscountAmount();
    const delivery = get().getDeliveryFee();
    const tax = get().getTaxAmount();
    return Math.max(0, subtotal - discount + delivery + tax);
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
