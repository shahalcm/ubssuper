// src/app/language-select.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Search, 
  X, 
  ArrowLeft, 
  CheckCircle2, 
  Globe, 
  Sparkles 
} from 'lucide-react-native';
import { LANGUAGES, LanguageOption } from '@/localization/languageConfig';
import { useLanguageStore } from '@/localization/languageStore';
import { translate } from '@/localization/i18n';
import { useAuthStore } from '@/store/authStore';

export default function LanguageSelectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const isSettingsMode = params.mode === 'settings';
  const insets = useSafeAreaInsets();

  const currentLanguage = useLanguageStore((state) => state.currentLanguage);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const hasSeenOnboarding = useAuthStore((state) => state.hasSeenOnboarding);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [selectedCode, setSelectedCode] = useState<string>(currentLanguage || 'en');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Filter languages by English name, Native name, or code
  const filteredLanguages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.nativeName.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.region.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Selected language object for previewing translated text in real time
  const selectedLangObj = useMemo(() => {
    return LANGUAGES.find((l) => l.code === selectedCode) || LANGUAGES[0];
  }, [selectedCode]);

  // Dynamic preview of translated title and button
  const screenTitle = useMemo(() => {
    return translate('language.title', selectedCode);
  }, [selectedCode]);

  const screenSubtitle = useMemo(() => {
    return translate('language.subtitle', selectedCode);
  }, [selectedCode]);

  const continueButtonText = useMemo(() => {
    return isSettingsMode
      ? translate('language.saveChanges', selectedCode)
      : translate('language.continue', selectedCode);
  }, [selectedCode, isSettingsMode]);

  const handleApplyLanguage = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      await setLanguage(selectedCode);

      if (isSettingsMode) {
        router.back();
      } else {
        if (!hasSeenOnboarding) {
          router.replace('/(auth)/onboarding');
        } else if (!isAuthenticated) {
          router.replace('/(auth)/login');
        } else {
          router.replace('/(tabs)');
        }
      }
    } catch (e) {
      console.warn('[LanguageSelect] Error applying language:', e);
      setIsSaving(false);
    }
  };

  const renderItem = ({ item }: { item: LanguageOption }) => {
    const isSelected = item.code === selectedCode;

    return (
      <TouchableOpacity
        style={[
          styles.languageCard,
          isSelected ? styles.cardSelected : styles.cardUnselected,
        ]}
        onPress={() => setSelectedCode(item.code)}
        activeOpacity={0.7}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.flagEmoji}>{item.flag}</Text>
          <View style={styles.nameBlock}>
            <View style={styles.nativeNameRow}>
              <Text
                style={[
                  styles.nativeName,
                  isSelected && { color: '#15803D' },
                ]}
              >
                {item.nativeName}
              </Text>
              {item.isRTL && (
                <View style={styles.rtlBadge}>
                  <Text style={styles.rtlBadgeText}>RTL</Text>
                </View>
              )}
            </View>
            <Text style={styles.englishName}>
              {item.name} • <Text style={styles.codeText}>{item.code.toUpperCase()}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.selectionIndicator}>
          {isSelected ? (
            <CheckCircle2 size={24} color="#16A34A" />
          ) : (
            <View style={styles.emptyCircle} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header Container */}
      <View style={styles.header}>
        {isSettingsMode ? (
          <View style={styles.topNavRow}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={22} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.topNavTitle}>Language Settings</Text>
            <View style={{ width: 36 }} />
          </View>
        ) : (
          <View style={styles.brandingRow}>
            <View style={styles.brandBadge}>
              <Globe size={14} color="#16A34A" />
              <Text style={styles.brandBadgeText}>UBS GLOBAL ECOSYSTEM</Text>
            </View>
          </View>
        )}

        <View style={styles.titleBox}>
          <Text style={styles.title}>{screenTitle}</Text>
          <Text style={styles.subtitle}>{screenSubtitle}</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={18} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={translate('language.searchPlaceholder', selectedCode)}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={16} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Language List */}
      <FlatList
        data={filteredLanguages}
        keyExtractor={(item) => item.code}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        initialNumToRender={14}
        maxToRenderPerBatch={18}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Globe size={40} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>
              {translate('language.noResults', selectedCode)}
            </Text>
            <Text style={styles.emptySubtitle}>
              Try searching by language name in English or native script
            </Text>
          </View>
        }
      />

      {/* Floating Bottom Bar */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        <TouchableOpacity
          style={[styles.continueButton, isSaving && { opacity: 0.8 }]}
          onPress={handleApplyLanguage}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.continueButtonText}>
              {continueButtonText} ({selectedLangObj.nativeName})
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    padding: 6,
    marginLeft: -6,
  },
  topNavTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  brandingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    gap: 6,
  },
  brandBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.8,
  },
  titleBox: {
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 110,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1.5,
  },
  cardUnselected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  cardSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#16A34A',
    ...Platform.select({
      ios: {
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      default: {
        boxShadow: '0 2px 8px rgba(22, 163, 74, 0.12)',
      },
    }),
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagEmoji: {
    fontSize: 28,
    marginRight: 14,
  },
  nameBlock: {
    flex: 1,
  },
  nativeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nativeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  rtlBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rtlBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E',
  },
  englishName: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  codeText: {
    fontWeight: '600',
    color: '#9CA3AF',
  },
  selectionIndicator: {
    marginLeft: 12,
  },
  emptyCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    maxWidth: 260,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      default: {
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  continueButton: {
    backgroundColor: '#16A34A',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
