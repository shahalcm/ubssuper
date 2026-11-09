// src/localization/languageConfig.ts
export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isRTL: boolean;
  region: string;
}

export const RTL_LANGUAGES = ['ar', 'ur', 'fa', 'he'];

export const LANGUAGES: LanguageOption[] = [
  {
    "code": "en",
    "name": "English",
    "nativeName": "English",
    "flag": "🇬🇧",
    "isRTL": false,
    "region": "International"
  },
  {
    "code": "ar",
    "name": "Arabic",
    "nativeName": "العربية",
    "flag": "🇸🇦",
    "isRTL": true,
    "region": "Middle East"
  },
  {
    "code": "hi",
    "name": "Hindi",
    "nativeName": "हिन्दी",
    "flag": "🇮🇳",
    "isRTL": false,
    "region": "India"
  },
  {
    "code": "ml",
    "name": "Malayalam",
    "nativeName": "മലയാളം",
    "flag": "🇮🇳",
    "isRTL": false,
    "region": "India (Kerala)"
  },
  {
    "code": "fr",
    "name": "French",
    "nativeName": "Français",
    "flag": "🇫🇷",
    "isRTL": false,
    "region": "France"
  },
  {
    "code": "es",
    "name": "Spanish",
    "nativeName": "Español",
    "flag": "🇪🇸",
    "isRTL": false,
    "region": "Spain & Americas"
  },
  {
    "code": "de",
    "name": "German",
    "nativeName": "Deutsch",
    "flag": "🇩🇪",
    "isRTL": false,
    "region": "Germany"
  },
  {
    "code": "zh",
    "name": "Chinese",
    "nativeName": "中文",
    "flag": "🇨🇳",
    "isRTL": false,
    "region": "China"
  },
  {
    "code": "ja",
    "name": "Japanese",
    "nativeName": "日本語",
    "flag": "🇯🇵",
    "isRTL": false,
    "region": "Japan"
  },
  {
    "code": "ur",
    "name": "Urdu",
    "nativeName": "اردو",
    "flag": "🇵🇰",
    "isRTL": true,
    "region": "Pakistan & India"
  },
  {
    "code": "tr",
    "name": "Turkish",
    "nativeName": "Türkçe",
    "flag": "🇹🇷",
    "isRTL": false,
    "region": "Turkey"
  },
  {
    "code": "ru",
    "name": "Russian",
    "nativeName": "Русский",
    "flag": "🇷🇺",
    "isRTL": false,
    "region": "Russia"
  },
  {
    "code": "ko",
    "name": "Korean",
    "nativeName": "한국어",
    "flag": "🇰🇷",
    "isRTL": false,
    "region": "South Korea"
  },
  {
    "code": "pt",
    "name": "Portuguese",
    "nativeName": "Português",
    "flag": "🇵🇹",
    "isRTL": false,
    "region": "Portugal & Brazil"
  },
  {
    "code": "it",
    "name": "Italian",
    "nativeName": "Italiano",
    "flag": "🇮🇹",
    "isRTL": false,
    "region": "Italy"
  },
  {
    "code": "nl",
    "name": "Dutch",
    "nativeName": "Nederlands",
    "flag": "🇳🇱",
    "isRTL": false,
    "region": "Netherlands"
  },
  {
    "code": "bn",
    "name": "Bengali",
    "nativeName": "বাংলা",
    "flag": "🇧🇩",
    "isRTL": false,
    "region": "Bangladesh & India"
  },
  {
    "code": "ta",
    "name": "Tamil",
    "nativeName": "தமிழ்",
    "flag": "🇮🇳",
    "isRTL": false,
    "region": "India & Sri Lanka"
  },
  {
    "code": "te",
    "name": "Telugu",
    "nativeName": "తెలుగు",
    "flag": "🇮🇳",
    "isRTL": false,
    "region": "India"
  },
  {
    "code": "kn",
    "name": "Kannada",
    "nativeName": "ಕನ್ನಡ",
    "flag": "🇮🇳",
    "isRTL": false,
    "region": "India"
  },
  {
    "code": "mr",
    "name": "Marathi",
    "nativeName": "मराठी",
    "flag": "🇮🇳",
    "isRTL": false,
    "region": "India"
  },
  {
    "code": "gu",
    "name": "Gujarati",
    "nativeName": "ગુજરાતી",
    "flag": "🇮🇳",
    "isRTL": false,
    "region": "India"
  },
  {
    "code": "pa",
    "name": "Punjabi",
    "nativeName": "ਪੰਜਾਬੀ",
    "flag": "🇮🇳",
    "isRTL": false,
    "region": "India"
  },
  {
    "code": "id",
    "name": "Indonesian",
    "nativeName": "Bahasa Indonesia",
    "flag": "🇮🇩",
    "isRTL": false,
    "region": "Indonesia"
  },
  {
    "code": "th",
    "name": "Thai",
    "nativeName": "ไทย",
    "flag": "🇹🇭",
    "isRTL": false,
    "region": "Thailand"
  },
  {
    "code": "vi",
    "name": "Vietnamese",
    "nativeName": "Tiếng Việt",
    "flag": "🇻🇳",
    "isRTL": false,
    "region": "Vietnam"
  },
  {
    "code": "pl",
    "name": "Polish",
    "nativeName": "Polski",
    "flag": "🇵🇱",
    "isRTL": false,
    "region": "Poland"
  },
  {
    "code": "sv",
    "name": "Swedish",
    "nativeName": "Svenska",
    "flag": "🇸🇪",
    "isRTL": false,
    "region": "Sweden"
  },
  {
    "code": "no",
    "name": "Norwegian",
    "nativeName": "Norsk",
    "flag": "🇳🇴",
    "isRTL": false,
    "region": "Norway"
  },
  {
    "code": "da",
    "name": "Danish",
    "nativeName": "Dansk",
    "flag": "🇩🇰",
    "isRTL": false,
    "region": "Denmark"
  },
  {
    "code": "fi",
    "name": "Finnish",
    "nativeName": "Suomi",
    "flag": "🇫🇮",
    "isRTL": false,
    "region": "Finland"
  },
  {
    "code": "el",
    "name": "Greek",
    "nativeName": "Ελληνικά",
    "flag": "🇬🇷",
    "isRTL": false,
    "region": "Greece"
  },
  {
    "code": "he",
    "name": "Hebrew",
    "nativeName": "עברית",
    "flag": "🇮🇱",
    "isRTL": true,
    "region": "Israel"
  },
  {
    "code": "fa",
    "name": "Persian",
    "nativeName": "فارسی",
    "flag": "🇮🇷",
    "isRTL": true,
    "region": "Iran"
  },
  {
    "code": "ms",
    "name": "Malay",
    "nativeName": "Bahasa Melayu",
    "flag": "🇲🇾",
    "isRTL": false,
    "region": "Malaysia"
  }
];
