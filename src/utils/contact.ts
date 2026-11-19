// src/utils/contact.ts
import { Linking, Alert, Platform } from 'react-native';

export const UBS_OFFICIAL_CONTACT = {
  phone: '+91 95671 03008',
  phoneDial: '+919567103008',
  email: 'ubsglobal999@gmail.com',
  hours: '24/7 Customer Care',
  label: 'UBS Customer Care Hotline',
};

/**
 * Opens device dialer with the phone number pre-filled.
 * Gracefully handles scenarios where dialer is unavailable.
 */
export async function openDialer(phoneNumber: string = UBS_OFFICIAL_CONTACT.phone): Promise<void> {
  const sanitized = phoneNumber.replace(/[^\d+]/g, '');
  const url = `tel:${sanitized}`;

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      // Try opening directly as some Android/iOS versions return false for tel:
      await Linking.openURL(url);
    }
  } catch (error) {
    Alert.alert(
      'Phone Dialer Unavailable',
      `Could not open phone dialer automatically. Please call: ${phoneNumber}`,
      [{ text: 'OK' }]
    );
  }
}

/**
 * Opens default email client with recipient and subject pre-filled.
 * Gracefully handles scenarios where email client is unavailable.
 */
export async function openEmail(
  email: string = UBS_OFFICIAL_CONTACT.email,
  subject: string = 'UBS Super Customer Support Request'
): Promise<void> {
  const sanitized = email.trim();
  const url = `mailto:${sanitized}?subject=${encodeURIComponent(subject)}`;

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      await Linking.openURL(url);
    }
  } catch (error) {
    Alert.alert(
      'Email Client Unavailable',
      `Could not launch an email application automatically. Please email us directly at: ${email}`,
      [{ text: 'OK' }]
    );
  }
}

