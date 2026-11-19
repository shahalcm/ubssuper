// src/constants/config.ts
import Constants from 'expo-constants';

export const APP_CONFIG = {
  name: 'UBS Super',
  tagline: 'Book food, hotels, taxis & more in one app.',
  version: Constants.expoConfig?.version || '1.0.7',
  defaultCurrency: 'INR',
  currencySymbol: '₹',
  defaultLocale: 'en-IN',
  defaultLocation: {
    city: 'Manjeri',
    area: 'Calicut Road',
    district: 'Malappuram',
    state: 'Kerala',
    pincode: '676121',
    fullAddress: 'Calicut Road, Manjeri, Malappuram, Kerala 676121',
  },
  sampleLocations: [
    { name: 'Manjeri', detail: 'Calicut Road, Manjeri, Malappuram' },
    { name: 'Malappuram', detail: 'Down Hill, Malappuram' },
    { name: 'Kozhikode', detail: 'Mavoor Road, Kozhikode' },
    { name: 'Kochi', detail: 'MG Road, Ernakulam, Kochi' },
  ],
  supportPhone: '+91 95671 03008',
  supportEmail: 'ubsglobal999@gmail.com',
};
