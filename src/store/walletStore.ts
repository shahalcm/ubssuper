// src/store/walletStore.ts
import { create } from 'zustand';
import { Coupon } from '@/types';
import { MOCK_COUPONS } from '@/services/mock/data';

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'success' | 'pending';
}

interface WalletState {
  balance: number;
  transactions: WalletTransaction[];
  availableCoupons: Coupon[];
  addMoney: (amount: number) => void;
  deductMoney: (amount: number, description: string) => boolean;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  balance: 1450,
  transactions: [
    {
      id: 'tx-101',
      type: 'credit',
      amount: 500,
      description: 'Cashback reward added',
      date: '08 Oct 2026',
      status: 'success',
    },
    {
      id: 'tx-102',
      type: 'debit',
      amount: 260,
      description: 'Paid for Food order #ORD-89210',
      date: '09 Oct 2026',
      status: 'success',
    },
  ],
  availableCoupons: MOCK_COUPONS,

  addMoney: (amount) => {
    const newBalance = get().balance + amount;
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'credit',
      amount,
      description: 'Top-up via UPI',
      date: 'Today',
      status: 'success',
    };
    set({
      balance: newBalance,
      transactions: [newTx, ...get().transactions],
    });
  },

  deductMoney: (amount, description) => {
    const current = get().balance;
    if (current < amount) return false;

    const newBalance = current - amount;
    const newTx: WalletTransaction = {
      id: `tx-${Date.now()}`,
      type: 'debit',
      amount,
      description,
      date: 'Today',
      status: 'success',
    };
    set({
      balance: newBalance,
      transactions: [newTx, ...get().transactions],
    });
    return true;
  },
}));
