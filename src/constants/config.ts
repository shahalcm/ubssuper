// src/constants/config.ts

export const APP_CONFIG = {
  name: 'UBS Super',
  tagline: 'Book food, hotels, taxis & more in one app.',
  version: '1.0.0',
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
  supportPhone: '+91 98765 43210',
  supportEmail: 'support@ubssuper.com',
};
