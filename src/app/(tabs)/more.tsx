// src/app/(tabs)/more.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import {
  Car,
  ShoppingBag,
  Utensils,
  Building,
  Building2,
  Truck,
  Stethoscope,
  Tag,
  Tv,
  Wallet,
  HelpCircle,
  User,
  Bell,
  MapPin,
  ShieldCheck,
  Moon,
  Sun,
  Search,
  X,
  ChevronRight,
  Sparkles,
  Flame,
  Zap,
  Award,
  ArrowUpRight,
  LogOut,
  LogIn,
  Gift,
  CheckCircle2,
  CreditCard,
  FileText,
  Compass,
  Globe,
} from 'lucide-react-native';
import { useTranslation } from '@/localization/i18n';
import { useLanguageStore } from '@/localization/languageStore';

interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  bgLight: string;
  route: string;
  badge?: string;
  category: 'mobility' | 'food_grocery' | 'lifestyle' | 'healthcare';
}

const ALL_SERVICES: ServiceItem[] = [
  // Mobility & Transport
  {
    id: 'srv-taxi',
    title: 'Taxi & Cab Rides',
    subtitle: 'Auto, Mini & Sedans in 3 mins',
    icon: Car,
    color: '#D97706',
    bgLight: '#FEF3C7',
    route: '/taxi',
    badge: '3 Mins',
    category: 'mobility',
  },
  {
    id: 'srv-logistics',
    title: 'Logistics & Courier',
    subtitle: 'Tempo, Trucks & Package Delivery',
    icon: Truck,
    color: '#9333EA',
    bgLight: '#F3E8FF',
    route: '/logistics',
    category: 'mobility',
  },

  // Food & Daily Essentials
  {
    id: 'srv-grocery',
    title: '15-Min Express Grocery',
    subtitle: 'Farm fresh fruits, dairy & staples',
    icon: ShoppingBag,
    color: '#16A34A',
    bgLight: '#DCFCE7',
    route: '/(tabs)/grocery',
    badge: '⚡ 15 Mins',
    category: 'food_grocery',
  },
  {
    id: 'srv-food',
    title: 'Food & Restaurant Delivery',
    subtitle: 'Biriyani, Arabian & top Kerala bites',
    icon: Utensils,
    color: '#F97316',
    bgLight: '#FFEDD5',
    route: '/(tabs)/food',
    badge: '🔥 Hot Deals',
    category: 'food_grocery',
  },

  // Lifestyle, Property & Stays
  {
    id: 'srv-real-estate',
    title: 'Real Estate & Properties',
    subtitle: 'Flats, luxury villas & plots for sale',
    icon: Building2,
    color: '#4F46E5',
    bgLight: '#EEF2FF',
    route: '/(tabs)/real-estate',
    badge: 'Verified',
    category: 'lifestyle',
  },
  {
    id: 'srv-hotels',
    title: 'Hotels & Resort Stays',
    subtitle: 'Instant booking with best rates',
    icon: Building,
    color: '#2563EB',
    bgLight: '#DBEAFE',
    route: '/hotels',
    category: 'lifestyle',
  },
  {
    id: 'srv-appliances',
    title: 'Home Electronics & ACs',
    subtitle: 'TVs, refrigerators & doorstep setup',
    icon: Tv,
    color: '#0891B2',
    bgLight: '#CFFAFE',
    route: '/appliances',
    category: 'lifestyle',
  },
  {
    id: 'srv-marketplace',
    title: 'Buy & Sell Marketplace',
    subtitle: 'Pre-owned cars, phones & goods',
    icon: Tag,
    color: '#EC4899',
    bgLight: '#FCE7F3',
    route: '/marketplace',
    category: 'lifestyle',
  },

  // Healthcare
  {
    id: 'srv-doctors',
    title: 'Doctor Consultations',
    subtitle: 'Book top specialists & hospitals',
    icon: Stethoscope,
    color: '#0D9488',
    bgLight: '#CCFBF1',
    route: '/doctors',
    badge: 'Specialists',
    category: 'healthcare',
  },
];

export default function MoreServicesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const getLanguageOption = useLanguageStore((state) => state.getLanguageOption);
  const currentLangObj = getLanguageOption();

  const unreadCount = useNotificationsStore((state) => state.getUnreadCount());

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'mobility' | 'food_grocery' | 'lifestyle' | 'healthcare'>('all');

  // Filter services based on search query and category tab
  const filteredServices = useMemo(() => {
    return ALL_SERVICES.filter((srv) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        srv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        srv.subtitle.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTab = selectedTab === 'all' || srv.category === selectedTab;
      return matchesSearch && matchesTab;
    });
  }, [searchQuery, selectedTab]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 🌟 1. TOP HUB BAR */}
      <View style={[styles.topBar, { backgroundColor: theme.background }]}>
        <View style={styles.topBarTitleRow}>
          <View style={styles.hubLogoPill}>
            <Compass size={16} color="#FFFFFF" />
          </View>
          <View>
            <Text style={[styles.topBarTitle, { color: theme.textPrimary }]}>UBS Super Hub</Text>
            <Text style={[styles.topBarSub, { color: theme.textSecondary }]}>{t('home.tagline')}</Text>
          </View>
        </View>

        <View style={styles.topBarActions}>
          <TouchableOpacity
            style={[styles.topIconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            activeOpacity={0.75}
            onPress={toggleTheme}
          >
            {isDarkMode ? <Sun size={17} color="#FBBF24" /> : <Moon size={17} color="#64748B" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topIconBtn, { backgroundColor: theme.surface, borderColor: theme.border, marginLeft: 8 }]}
            activeOpacity={0.75}
            onPress={() => router.push('/notifications')}
          >
            <Bell size={17} color={theme.textPrimary} />
            {unreadCount > 0 && (
              <View style={[styles.badgeDot, { backgroundColor: theme.error }]} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.topIconBtn, { backgroundColor: theme.surface, borderColor: theme.border, marginLeft: 8 }]}
            activeOpacity={0.75}
            onPress={() => router.push('/profile')}
          >
            <User size={17} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 🌟 2. USER PROFILE & WALLET COMMAND ISLAND */}
        <LinearGradient
          colors={isDarkMode ? ['#1E293B', '#0F172A'] : ['#F0FDF4', '#FFFFFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.profileCard,
            { borderColor: isDarkMode ? '#334155' : '#86EFAC' },
            Shadows.medium,
          ]}
        >
          {/* User Profile Header */}
          <View style={styles.profileHeaderRow}>
            <View style={styles.avatarWrapper}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary }]}>
                  <Text style={styles.avatarInitial}>{user?.name ? user.name[0].toUpperCase() : 'U'}</Text>
                </View>
              )}
              <View style={styles.onlineDot} />
            </View>

            <View style={styles.profileDetailsCol}>
              <View style={styles.nameRow}>
                <Text style={[styles.userName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {user?.name || 'Explorer'}
                </Text>
                <View style={styles.goldBadge}>
                  <Award size={10} color="#D97706" style={{ marginRight: 2 }} />
                  <Text style={styles.goldBadgeText}>Gold VIP</Text>
                </View>
              </View>
              <Text style={[styles.userContact, { color: theme.textSecondary }]}>
                {user?.phone || user?.email || '+91 98765 43210'}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.editProfileBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={() => router.push('/profile')}
            >
              <Text style={[styles.editProfileText, { color: theme.textPrimary }]}>Manage</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Shortcuts Ribbon */}
          <View style={[styles.statsRibbon, { backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF', borderColor: theme.border }]}>
            {/* My Orders */}
            <TouchableOpacity
              style={styles.statBox}
              activeOpacity={0.8}
              onPress={() => router.push('/orders')}
            >
              <View style={styles.statTitleRow}>
                <ShoppingBag size={13} color="#16A34A" style={{ marginRight: 4 }} />
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>My Orders</Text>
              </View>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>Track & History</Text>
              <Text style={[styles.statActionHint, { color: '#16A34A' }]}>View All →</Text>
            </TouchableOpacity>

            <View style={styles.statVerticalDivider} />

            {/* Saved Addresses */}
            <TouchableOpacity
              style={styles.statBox}
              activeOpacity={0.8}
              onPress={() => router.push('/addresses')}
            >
              <View style={styles.statTitleRow}>
                <MapPin size={13} color="#2563EB" style={{ marginRight: 4 }} />
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Addresses</Text>
              </View>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>Saved Places</Text>
              <Text style={[styles.statActionHint, { color: '#2563EB' }]}>Manage →</Text>
            </TouchableOpacity>

            <View style={styles.statVerticalDivider} />

            {/* Helpdesk */}
            <TouchableOpacity
              style={styles.statBox}
              activeOpacity={0.8}
              onPress={() => router.push('/support')}
            >
              <View style={styles.statTitleRow}>
                <HelpCircle size={13} color="#9333EA" style={{ marginRight: 4 }} />
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Support</Text>
              </View>
              <Text style={[styles.statValue, { color: theme.textPrimary }]}>24x7 Help</Text>
              <Text style={[styles.statActionHint, { color: '#9333EA' }]}>Get Help →</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* 🌟 3. SEARCH SERVICES BAR */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Search size={17} color={theme.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.searchInput, { color: theme.textPrimary }]}
              placeholder="Search 30+ services, bookings, tools..."
              placeholderTextColor={theme.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
                <X size={15} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 🌟 4. CATEGORY FILTER TABS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {[
            { id: 'all', label: 'All Services' },
            { id: 'mobility', label: '🚗 Rides & Porter' },
            { id: 'food_grocery', label: '🍔 Food & Grocery' },
            { id: 'lifestyle', label: '🏡 Property & Stays' },
            { id: 'healthcare', label: '🩺 Doctors & Health' },
          ].map((tab) => {
            const isSelected = selectedTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tabChip,
                  isSelected && styles.tabChipActive,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.surface,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setSelectedTab(tab.id as any)}
              >
                <Text
                  style={[
                    styles.tabChipText,
                    { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 🌟 5. PROMO / VIP PASS HERO BANNER */}
        {searchQuery.trim() === '' && selectedTab === 'all' && (
          <LinearGradient
            colors={['#065F46', '#047857', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoBanner}
          >
            <View style={styles.promoLeftCol}>
              <View style={styles.promoBadge}>
                <Award size={11} color="#FBBF24" style={{ marginRight: 4 }} />
                <Text style={styles.promoBadgeText}>UBSSUPER ONE PASS</Text>
              </View>
              <Text style={styles.promoTitle}>Unlimited Free Delivery & 10% Off Rides</Text>
              <Text style={styles.promoSub}>Save up to ₹800 every month across all services.</Text>
            </View>

            <TouchableOpacity
              style={styles.promoCtaBtn}
              activeOpacity={0.85}
              onPress={() => router.push('/offers')}
            >
              <Text style={styles.promoCtaText}>Join VIP</Text>
              <ArrowUpRight size={13} color="#047857" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </LinearGradient>
        )}

        {/* 🌟 6. ALL SERVICES GRID / LIST */}
        <View style={styles.sectionHeadingRow}>
          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
            {selectedTab === 'all'
              ? 'All Super App Modules'
              : selectedTab === 'mobility'
              ? 'Rides & Logistics'
              : selectedTab === 'food_grocery'
              ? 'Food & Instant Grocery'
              : selectedTab === 'lifestyle'
              ? 'Properties, Stays & Store'
              : 'Healthcare & Specialists'}
          </Text>
          <Text style={[styles.sectionCountText, { color: theme.textSecondary }]}>
            {filteredServices.length} {filteredServices.length === 1 ? 'module' : 'modules'}
          </Text>
        </View>

        {filteredServices.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No service found</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              Try searching with another keyword or switch category tab.
            </Text>
            <TouchableOpacity
              style={[styles.resetSearchBtn, { backgroundColor: theme.primary }]}
              onPress={() => {
                setSearchQuery('');
                setSelectedTab('all');
              }}
            >
              <Text style={styles.resetSearchBtnText}>Reset Search</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.servicesGrid}>
            {filteredServices.map((srv) => {
              const Icon = srv.icon;
              return (
                <TouchableOpacity
                  key={srv.id}
                  style={[
                    styles.serviceCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                    Shadows.small,
                  ]}
                  activeOpacity={0.82}
                  onPress={() => router.push(srv.route as any)}
                >
                  {/* Badge */}
                  {srv.badge && (
                    <View style={[styles.serviceBadge, { backgroundColor: srv.color }]}>
                      <Text style={styles.serviceBadgeText}>{srv.badge}</Text>
                    </View>
                  )}

                  {/* Icon Box */}
                  <View style={[styles.serviceIconWrap, { backgroundColor: isDarkMode ? srv.color + '22' : srv.bgLight }]}>
                    <Icon size={26} color={srv.color} />
                  </View>

                  {/* Title & Description */}
                  <View style={styles.serviceTextWrap}>
                    <Text style={[styles.serviceTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                      {srv.title}
                    </Text>
                    <Text style={[styles.serviceSubtitle, { color: theme.textSecondary }]} numberOfLines={2}>
                      {srv.subtitle}
                    </Text>
                  </View>

                  <View style={styles.serviceCardFooter}>
                    <Text style={[styles.openServiceText, { color: srv.color }]}>Explore</Text>
                    <ChevronRight size={13} color={srv.color} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* 🌟 7. QUICK UTILITIES STRIP */}
        <View style={styles.sectionHeadingRow}>
          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Quick Tools & Shortcuts</Text>
        </View>

        <View style={styles.quickToolsGrid}>
          {[
            { title: 'Promo Codes', icon: Gift, color: '#D97706', route: '/offers' },
            { title: 'Addresses', icon: MapPin, color: '#16A34A', route: '/addresses' },
            { title: 'Help & Support', icon: HelpCircle, color: '#2563EB', route: '/support' },
            { title: 'Safety & SOS', icon: ShieldCheck, color: '#DC2626', route: '/support' },
          ].map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.toolPill,
                  { backgroundColor: theme.card, borderColor: theme.border },
                  Shadows.small,
                ]}
                activeOpacity={0.8}
                onPress={() => router.push(tool.route as any)}
              >
                <View style={[styles.toolIconWrap, { backgroundColor: tool.color + '15' }]}>
                  <Icon size={18} color={tool.color} />
                </View>
                <Text style={[styles.toolTitle, { color: theme.textPrimary }]}>{tool.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 🌟 8. ACCOUNT, PREFERENCES & CONTROLS */}
        <View style={styles.sectionHeadingRow}>
          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Account & Settings</Text>
        </View>

        <View style={[styles.settingsCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadows.small]}>
          {/* Saved Addresses */}
          <TouchableOpacity
            style={[styles.settingsRow, { borderBottomColor: theme.border }]}
            activeOpacity={0.75}
            onPress={() => router.push('/addresses')}
          >
            <View style={styles.settingsRowLeft}>
              <View style={[styles.settingsIconWrap, { backgroundColor: '#16A34A15' }]}>
                <MapPin size={17} color="#16A34A" />
              </View>
              <View>
                <Text style={[styles.settingsRowTitle, { color: theme.textPrimary }]}>Saved Delivery Addresses</Text>
                <Text style={[styles.settingsRowSub, { color: theme.textSecondary }]}>Home, work and other locations</Text>
              </View>
            </View>
            <ChevronRight size={16} color={theme.textSecondary} />
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            style={[styles.settingsRow, { borderBottomColor: theme.border }]}
            activeOpacity={0.75}
            onPress={() => router.push('/notifications')}
          >
            <View style={styles.settingsRowLeft}>
              <View style={[styles.settingsIconWrap, { backgroundColor: '#2563EB15' }]}>
                <Bell size={17} color="#2563EB" />
              </View>
              <View>
                <Text style={[styles.settingsRowTitle, { color: theme.textPrimary }]}>Notifications & Alerts</Text>
                <Text style={[styles.settingsRowSub, { color: theme.textSecondary }]}>Order updates, rides & offers</Text>
              </View>
            </View>
            <ChevronRight size={16} color={theme.textSecondary} />
          </TouchableOpacity>

          {/* Change Language */}
          <TouchableOpacity
            style={[styles.settingsRow, { borderBottomColor: theme.border }]}
            activeOpacity={0.75}
            onPress={() => router.push('/language-select?mode=settings' as any)}
          >
            <View style={styles.settingsRowLeft}>
              <View style={[styles.settingsIconWrap, { backgroundColor: '#0D948815' }]}>
                <Globe size={17} color="#0D9488" />
              </View>
              <View>
                <Text style={[styles.settingsRowTitle, { color: theme.textPrimary }]}>{t('settings.changeLanguage')}</Text>
                <Text style={[styles.settingsRowSub, { color: theme.textSecondary }]}>
                  {currentLangObj.flag} {currentLangObj.nativeName} ({currentLangObj.name})
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color={theme.textSecondary} />
          </TouchableOpacity>

          {/* Dark Mode Switch */}
          <View style={[styles.settingsRow, { borderBottomColor: theme.border }]}>
            <View style={styles.settingsRowLeft}>
              <View style={[styles.settingsIconWrap, { backgroundColor: '#F59E0B15' }]}>
                {isDarkMode ? <Moon size={17} color="#F59E0B" /> : <Sun size={17} color="#D97706" />}
              </View>
              <View>
                <Text style={[styles.settingsRowTitle, { color: theme.textPrimary }]}>{t('settings.darkTheme')}</Text>
                <Text style={[styles.settingsRowSub, { color: theme.textSecondary }]}>
                  {isDarkMode ? 'Night theme enabled' : 'Clean daylight theme'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#E2E8F0', true: '#16A34A' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* 24x7 Helpdesk */}
          <TouchableOpacity
            style={[styles.settingsRow, { borderBottomColor: theme.border }]}
            activeOpacity={0.75}
            onPress={() => router.push('/support')}
          >
            <View style={styles.settingsRowLeft}>
              <View style={[styles.settingsIconWrap, { backgroundColor: '#9333EA15' }]}>
                <HelpCircle size={17} color="#9333EA" />
              </View>
              <View>
                <Text style={[styles.settingsRowTitle, { color: theme.textPrimary }]}>Help & Customer Support</Text>
                <Text style={[styles.settingsRowSub, { color: theme.textSecondary }]}>Live chat, FAQs & ticket status</Text>
              </View>
            </View>
            <ChevronRight size={16} color={theme.textSecondary} />
          </TouchableOpacity>

          {/* Login / Logout Action */}
          <TouchableOpacity
            style={styles.settingsRow}
            activeOpacity={0.75}
            onPress={() => {
              if (isAuthenticated) {
                logout();
              } else {
                router.push('/(auth)/login');
              }
            }}
          >
            <View style={styles.settingsRowLeft}>
              <View style={[styles.settingsIconWrap, { backgroundColor: isAuthenticated ? '#EF444415' : '#16A34A15' }]}>
                {isAuthenticated ? <LogOut size={17} color="#EF4444" /> : <LogIn size={17} color="#16A34A" />}
              </View>
              <View>
                <Text style={[styles.settingsRowTitle, { color: isAuthenticated ? '#EF4444' : '#16A34A', fontWeight: '700' }]}>
                  {isAuthenticated ? 'Sign Out of Account' : 'Sign In / Register'}
                </Text>
                <Text style={[styles.settingsRowSub, { color: theme.textSecondary }]}>
                  {isAuthenticated ? 'Switch or log out of this session' : 'Access your saved addresses & order history'}
                </Text>
              </View>
            </View>
            <ChevronRight size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* 🌟 9. TRUST SEAL & VERSION */}
        <View style={styles.footerBranding}>
          <ShieldCheck size={20} color="#16A34A" style={{ marginBottom: 4 }} />
          <Text style={[styles.brandingTitle, { color: theme.textPrimary }]}>UBS Super Kerala Ecosystem</Text>
          <Text style={[styles.brandingSub, { color: theme.textSecondary }]}>
            All-in-One Super App • 100% Encrypted & Safe • v2.5.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  topBarTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hubLogoPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs + 3,
  },
  topBarTitle: {
    fontSize: Typography.sizes.md + 1,
    fontWeight: Typography.weights.bold,
  },
  topBarSub: {
    fontSize: Typography.sizes.xs,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl * 2,
  },
  profileCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md + 2,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.lg,
    fontWeight: '800',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileDetailsCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    fontSize: Typography.sizes.md + 1,
    fontWeight: Typography.weights.bold,
    maxWidth: 160,
  },
  goldBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginLeft: 6,
  },
  goldBadgeText: {
    color: '#D97706',
    fontSize: 9,
    fontWeight: '800',
  },
  userContact: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  editProfileBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  editProfileText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '700',
  },
  statsRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  statValue: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
    marginVertical: 1,
  },
  statActionHint: {
    fontSize: 9,
    fontWeight: '700',
    color: '#16A34A',
  },
  statVerticalDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  searchSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xs + 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    height: '100%',
  },
  tabsScroll: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: 8,
  },
  tabChipActive: {
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  tabChipText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '700',
  },
  promoBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md + 2,
    marginVertical: Spacing.sm,
    ...Shadows.medium,
  },
  promoLeftCol: {
    flex: 1,
    marginRight: Spacing.md,
  },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  promoBadgeText: {
    color: '#FBBF24',
    fontSize: 9,
    fontWeight: '800',
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  promoSub: {
    color: '#DCFCE7',
    fontSize: 10,
    marginTop: 2,
  },
  promoCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
  },
  promoCtaText: {
    color: '#047857',
    fontSize: 11,
    fontWeight: '900',
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionHeading: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  sectionCountText: {
    fontSize: Typography.sizes.xs,
    fontWeight: '600',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
  },
  serviceCard: {
    width: '48.5%',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    position: 'relative',
    justifyContent: 'space-between',
  },
  serviceBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  serviceBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
  },
  serviceIconWrap: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  serviceTextWrap: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    marginBottom: 3,
  },
  serviceSubtitle: {
    fontSize: 10,
    lineHeight: 14,
  },
  serviceCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
  },
  openServiceText: {
    fontSize: 10,
    fontWeight: '800',
    marginRight: 2,
  },
  quickToolsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xs,
  },
  toolPill: {
    width: '23%',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  toolIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  toolTitle: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  settingsCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  settingsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  settingsIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  settingsRowTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  settingsRowSub: {
    fontSize: 10,
    marginTop: 1,
  },
  footerBranding: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  brandingTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  brandingSub: {
    fontSize: 9,
    marginTop: 2,
  },
  emptyBox: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  resetSearchBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  resetSearchBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
