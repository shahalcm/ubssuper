// src/store/popupStore.ts
import { create } from 'zustand';

export type PopupType = 'success' | 'error' | 'warning' | 'info' | 'confirm' | 'destructive';

export interface PopupButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export interface PopupOptions {
  type?: PopupType;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  buttons?: PopupButton[];
  autoCloseMs?: number;
}

interface PopupState {
  isOpen: boolean;
  type: PopupType;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  buttons?: PopupButton[];
  showPopup: (options: PopupOptions) => void;
  hidePopup: () => void;
}

export const usePopupStore = create<PopupState>((set) => ({
  isOpen: false,
  type: 'info',
  title: '',
  message: '',
  confirmText: 'OK',
  cancelText: undefined,
  onConfirm: undefined,
  onCancel: undefined,
  buttons: undefined,

  showPopup: (options) => {
    set({
      isOpen: true,
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText,
      onConfirm: options.onConfirm,
      onCancel: options.onCancel,
      buttons: options.buttons,
    });
  },

  hidePopup: () => {
    set({
      isOpen: false,
      onConfirm: undefined,
      onCancel: undefined,
      buttons: undefined,
    });
  },
}));

/**
 * Global helper callable from anywhere (inside or outside React components)
 */
export function showPopup(options: PopupOptions) {
  usePopupStore.getState().showPopup(options);
}

/**
 * Drop-in custom replacement for React Native's default Alert.alert
 */
export function showCustomAlert(
  title: string,
  message?: string,
  buttons?: PopupButton[],
  options?: { type?: PopupType }
) {
  let detectedType: PopupType = options?.type || 'info';

  const lowerTitle = (title || '').toLowerCase();
  const lowerMsg = (message || '').toLowerCase();

  if (
    lowerTitle.includes('error') ||
    lowerTitle.includes('failed') ||
    lowerTitle.includes('denied') ||
    lowerMsg.includes('error') ||
    lowerMsg.includes('failed')
  ) {
    detectedType = 'error';
  } else if (
    lowerTitle.includes('success') ||
    lowerTitle.includes('confirmed') ||
    lowerTitle.includes('saved') ||
    lowerTitle.includes('thank you') ||
    lowerTitle.includes('verified')
  ) {
    detectedType = 'success';
  } else if (
    lowerTitle.includes('warning') ||
    lowerTitle.includes('cancel') ||
    lowerTitle.includes('missing') ||
    lowerTitle.includes('invalid')
  ) {
    detectedType = 'warning';
  } else if (
    lowerTitle.includes('delete') ||
    lowerTitle.includes('logout') ||
    lowerTitle.includes('sign out') ||
    lowerTitle.includes('sos') ||
    lowerTitle.includes('emergency')
  ) {
    detectedType = 'destructive';
  }

  usePopupStore.getState().showPopup({
    type: detectedType,
    title,
    message,
    buttons,
  });
}
