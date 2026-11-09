// src/utils/legal.ts
import { Alert, Linking, Platform } from 'react-native';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { showCustomAlert } from '@/store/popupStore';

export const UBSSUPER_LEGAL_URLS = {
  PRIVACY_POLICY: 'https://www.ubssuper.com/privacy-policy',
  DELETE_ACCOUNT: 'https://www.ubssuper.com/delete-account',
  TERMS: 'https://www.ubssuper.com/terms',
  SUPPORT_EMAIL: 'support@ubssuper.com',
  SUPPORT_PHONE: '+919567103008',
};

/**
 * Safely open legal and compliance URLs via in-app browser or external browser fallback
 */
export async function openLegalUrl(url: string, title?: string): Promise<boolean> {
  try {
    if (Platform.OS !== 'web') {
      await openBrowserAsync(url, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
        controlsColor: '#16A34A',
        toolbarColor: '#FFFFFF',
      });
      return true;
    } else {
      window.open(url, '_blank');
      return true;
    }
  } catch (error) {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      }
    } catch {
      // Fallback alert with URL
    }

    showCustomAlert(
      title || 'Legal Document',
      `Could not open the browser automatically. Please visit:\n${url}`,
      [{ text: 'OK' }],
      { type: 'info' }
    );
    return false;
  }
}

export async function openPrivacyPolicy(): Promise<boolean> {
  return openLegalUrl(UBSSUPER_LEGAL_URLS.PRIVACY_POLICY, 'Privacy Policy');
}

export async function openDeleteAccountWebPage(): Promise<boolean> {
  return openLegalUrl(UBSSUPER_LEGAL_URLS.DELETE_ACCOUNT, 'Account Deletion');
}

export async function openTermsAndConditions(): Promise<boolean> {
  return openLegalUrl(UBSSUPER_LEGAL_URLS.TERMS, 'Terms & Conditions');
}
