// src/localization/rtlManager.ts
import { I18nManager } from 'react-native';

export function updateRtlLayout(isRTL: boolean) {
  try {
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
    }
  } catch (err) {
    console.warn('[RTLManager] Could not toggle RTL:', err);
  }
}

export function getFlexDirection(isRTL: boolean, defaultDir: 'row' | 'row-reverse' = 'row') {
  if (isRTL) {
    return defaultDir === 'row' ? 'row-reverse' : 'row';
  }
  return defaultDir;
}

export function getTextAlign(isRTL: boolean, defaultAlign: 'left' | 'right' = 'left') {
  if (isRTL) {
    return defaultAlign === 'left' ? 'right' : 'left';
  }
  return defaultAlign;
}
