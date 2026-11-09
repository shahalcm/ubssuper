// src/localization/i18n.ts
import { useCallback } from 'react';
import { useLanguageStore } from './languageStore';
import en from './locales/en.json';
import ar from './locales/ar.json';
import hi from './locales/hi.json';
import ml from './locales/ml.json';
import fr from './locales/fr.json';
import es from './locales/es.json';
import de from './locales/de.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ur from './locales/ur.json';
import tr from './locales/tr.json';
import ru from './locales/ru.json';
import ko from './locales/ko.json';
import pt from './locales/pt.json';
import it from './locales/it.json';
import nl from './locales/nl.json';
import bn from './locales/bn.json';
import ta from './locales/ta.json';
import te from './locales/te.json';
import kn from './locales/kn.json';
import mr from './locales/mr.json';
import gu from './locales/gu.json';
import pa from './locales/pa.json';
import id from './locales/id.json';
import th from './locales/th.json';
import vi from './locales/vi.json';
import pl from './locales/pl.json';
import sv from './locales/sv.json';
import no from './locales/no.json';
import da from './locales/da.json';
import fi from './locales/fi.json';
import el from './locales/el.json';
import he from './locales/he.json';
import fa from './locales/fa.json';
import ms from './locales/ms.json';

const translations: Record<string, any> = {
  en: en,
  ar: ar,
  hi: hi,
  ml: ml,
  fr: fr,
  es: es,
  de: de,
  zh: zh,
  ja: ja,
  ur: ur,
  tr: tr,
  ru: ru,
  ko: ko,
  pt: pt,
  it: it,
  nl: nl,
  bn: bn,
  ta: ta,
  te: te,
  kn: kn,
  mr: mr,
  gu: gu,
  pa: pa,
  id: id,
  th: th,
  vi: vi,
  pl: pl,
  sv: sv,
  no: no,
  da: da,
  fi: fi,
  el: el,
  he: he,
  fa: fa,
  ms: ms,
};

function getNestedValue(obj: any, path: string): string | undefined {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

function interpolate(template: string, params?: Record<string, any>): string {
  if (!params) return template;
  return template.replace(/\{\{?(\w+)\}?\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : '';
  });
}

/**
 * Direct non-hook translation function with optional fallback text and params
 */
export function t(
  key: string,
  fallbackOrParams?: string | Record<string, any>,
  params?: Record<string, any>
): string {
  const currentLang = useLanguageStore.getState().currentLanguage || 'en';
  return translate(key, currentLang, fallbackOrParams, params);
}

/**
 * Core translation resolver with English fallback and explicit fallback text support
 */
export function translate(
  key: string,
  langCode: string,
  fallbackOrParams?: string | Record<string, any>,
  params?: Record<string, any>
): string {
  const currentDict = translations[langCode] || translations['en'];
  const englishDict = translations['en'];

  let defaultText: string | undefined = undefined;
  let interpolations: Record<string, any> | undefined = undefined;

  if (typeof fallbackOrParams === 'string') {
    defaultText = fallbackOrParams;
    interpolations = params;
  } else {
    interpolations = fallbackOrParams;
  }

  let text = getNestedValue(currentDict, key);
  if (!text) {
    text = getNestedValue(englishDict, key);
  }
  if (!text) {
    if (defaultText !== undefined) {
      return interpolate(defaultText, interpolations);
    }
    const parts = key.split('.');
    return parts[parts.length - 1];
  }

  return interpolate(text, interpolations);
}

/**
 * Reactive translation hook for React Native components
 */
export function useTranslation() {
  const currentLanguage = useLanguageStore((state) => state.currentLanguage);
  const isRTL = useLanguageStore((state) => state.isRTL);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const translateFn = useCallback(
    (key: string, fallbackOrParams?: string | Record<string, any>, params?: Record<string, any>) => {
      return translate(key, currentLanguage, fallbackOrParams, params);
    },
    [currentLanguage]
  );

  return {
    t: translateFn,
    currentLanguage,
    isRTL,
    setLanguage,
  };
}
