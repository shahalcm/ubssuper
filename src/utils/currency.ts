// src/utils/currency.ts
import { APP_CONFIG } from '@/constants/config';

export function formatCurrency(amount: number, currency = APP_CONFIG.defaultCurrency): string {
  const symbol = currency === 'INR' ? APP_CONFIG.currencySymbol : '$';
  const formattedNumber = Math.round(amount).toLocaleString('en-IN');
  return `${symbol}${formattedNumber}`;
}
