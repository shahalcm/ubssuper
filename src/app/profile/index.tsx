// src/app/profile/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency } from '@/utils/currency';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/Input';
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  ShoppingBag, 
  Bell, 
  Moon, 
  Globe, 
  LogOut, 
  ChevronRight, 
  ShieldCheck,
  FileText,
  Trash2,
  AlertTriangle,
  ExternalLink as ExternalLinkIcon,
  HelpCircle,
} from 'lucide-react-native';

import { useTranslation } from '@/localization/i18n';
import { useLanguageStore } from '@/localization/languageStore';
import { openPrivacyPolicy, openDeleteAccountWebPage, openTermsAndConditions, UBSSUPER_LEGAL_URLS } from '@/utils/legal';
import { showCustomAlert } from '@/store/popupStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const getLanguageOption = useLanguageStore((state) => state.getLanguageOption);
  const currentLangObj = getLanguageOption();

  const { isDarkMode, toggleTheme } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const [name, setName] = useState(user?.name || 'Anas Rahmaan');
  const [email, setEmail] = useState(user?.email || 'anas@ubssuper.com');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');

  const handleLogoutConfirm = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace('/(auth)/login');
  };

  const handleDeleteAccountInApp = async () => {
    setDeleteError('');
    setIsDeleting(true);
    try {
      await deleteAccount('Customer initiated permanent account deletion from app settings');
      setIsDeleting(false);
      setDeleteSuccess(true);
      setTimeout(() => {
        setShowDeleteModal(false);
        router.replace('/(auth)/login');
      }, 2000);
    } catch (err: any) {
      setIsDeleting(false);
      setDeleteError(err.message || 'Failed to delete account. If you have active orders, please wait until completed.');
    }
  };

  const handleOpenWebDeletion = async () => {
    setShowDeleteModal(false);
    await openDeleteAccountWebPage();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Account & Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* User Card Header */}
        <View style={[styles.userCard, { backgroundColor: theme.card, borderColor: theme.border }, Shadows.medium]}>
          <Image
            source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' }}
            style={styles.avatar}
            resizeMode="cover"
          />

          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.textPrimary }]}>{user?.name || 'Anas Rahmaan'}</Text>
            <Text style={[styles.userContact, { color: theme.textSecondary }]}>{user?.phone || '+91 98765 43210'}</Text>
            <Text style={[styles.userEmail, { color: theme.textMuted }]}>{user?.email || 'anas@ubssuper.com'}</Text>
          </View>

          <TouchableOpacity style={[styles.editBtn, { backgroundColor: theme.primary + '15' }]} onPress={() => setShowEditModal(true)}>
            <Text style={[styles.editText, { color: theme.primary }]}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Section: ACCOUNT */}
        <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>ACCOUNT & ACTIVITY</Text>

        <View style={[styles.menuBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/orders')}>
            <ShoppingBag size={18} color={theme.primary} style={{ marginRight: Spacing.md }} />
            <Text style={[styles.menuText, { color: theme.textPrimary }]}>My Orders & Bookings</Text>
            <ChevronRight size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/addresses')}>
            <MapPin size={18} color={theme.primary} style={{ marginRight: Spacing.md }} />
            <Text style={[styles.menuText, { color: theme.textPrimary }]}>Saved Addresses</Text>
            <ChevronRight size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/notifications')}>
            <Bell size={18} color={theme.primary} style={{ marginRight: Spacing.md }} />
            <Text style={[styles.menuText, { color: theme.textPrimary }]}>Notifications Center</Text>
            <ChevronRight size={16} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Section: SETTINGS */}
        <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>SETTINGS & APP</Text>

        <View style={[styles.menuBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity style={styles.menuRow} onPress={toggleTheme}>
            <Moon size={18} color={theme.primary} style={{ marginRight: Spacing.md }} />
            <Text style={[styles.menuText, { color: theme.textPrimary }]}>Dark Theme</Text>
            <Text style={[styles.menuVal, { color: theme.textSecondary }]}>{isDarkMode ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/language-select?mode=settings' as any)}>
            <Globe size={18} color={theme.primary} style={{ marginRight: Spacing.md }} />
            <Text style={[styles.menuText, { color: theme.textPrimary }]}>{t('settings.changeLanguage')}</Text>
            <Text style={[styles.menuVal, { color: theme.textSecondary }]}>
              {currentLangObj.flag} {currentLangObj.nativeName} ({currentLangObj.code.toUpperCase()})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section: PRIVACY & LEGAL */}
        <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>PRIVACY & LEGAL</Text>

        <View style={[styles.menuBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity style={styles.menuRow} onPress={() => openPrivacyPolicy()}>
            <ShieldCheck size={18} color={theme.primary} style={{ marginRight: Spacing.md }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Privacy Policy</Text>
              <Text style={{ fontSize: 11, color: theme.textMuted }}>ubssuper.com/privacy-policy</Text>
            </View>
            <ExternalLinkIcon size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

          <TouchableOpacity style={styles.menuRow} onPress={() => openTermsAndConditions()}>
            <FileText size={18} color={theme.primary} style={{ marginRight: Spacing.md }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Terms & Conditions</Text>
              <Text style={{ fontSize: 11, color: theme.textMuted }}>User agreement & usage terms</Text>
            </View>
            <ExternalLinkIcon size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

          <TouchableOpacity style={styles.menuRow} onPress={() => router.push('/support')}>
            <HelpCircle size={18} color={theme.primary} style={{ marginRight: Spacing.md }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Help & Support</Text>
              <Text style={{ fontSize: 11, color: theme.textMuted }}>24x7 customer support & FAQs</Text>
            </View>
            <ChevronRight size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

          <TouchableOpacity style={styles.menuRow} onPress={() => {
            setDeleteError('');
            setShowDeleteModal(true);
          }}>
            <Trash2 size={18} color={theme.error} style={{ marginRight: Spacing.md }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuText, { color: theme.error, fontWeight: '700' }]}>Delete Account</Text>
              <Text style={{ fontSize: 11, color: theme.textMuted }}>Permanently remove personal account & data</Text>
            </View>
            <ChevronRight size={16} color={theme.error} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <Button
          title="Log Out of UBS Super"
          variant="danger"
          size="lg"
          icon={<LogOut size={18} color="#FFFFFF" style={{ marginRight: 6 }} />}
          onPress={() => {
            showCustomAlert(
              'Log Out of UBS Super?',
              'Are you sure you want to log out of your session?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log Out', style: 'destructive', onPress: handleLogoutConfirm },
              ],
              { type: 'destructive' }
            );
          }}
          style={{ marginTop: Spacing.xl, marginBottom: Spacing.xxl }}
        />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Edit Profile Details</Text>

            <TextField label="Full Name" value={name} onChangeText={setName} />
            <TextField label="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <TextField label="Email Address" value={email} onChangeText={setEmail} keyboardType="email-address" />

            <Button
              title="Save Changes"
              size="lg"
              onPress={() => setShowEditModal(false)}
              style={{ width: '100%', marginTop: Spacing.md }}
            />
          </View>
        </View>
      </Modal>

      {/* Account Deletion Confirmation Modal */}
      <Modal visible={showDeleteModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, maxWidth: 420 }]}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: theme.error + '18', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm }}>
              <AlertTriangle size={24} color={theme.error} />
            </View>

            <Text style={[styles.modalTitle, { color: theme.error, textAlign: 'center' }]}>
              Delete UBS Super Account
            </Text>

            <Text style={[styles.modalSub, { color: theme.textSecondary, textAlign: 'center', marginTop: 8 }]}>
              Account deletion permanently removes your personal profile, saved addresses, and active login sessions.
            </Text>

            <View style={{ backgroundColor: theme.surface, borderRadius: BorderRadius.md, padding: Spacing.sm + 2, marginVertical: Spacing.md, width: '100%' }}>
              <Text style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 18 }}>
                • <Text style={{ fontWeight: '700' }}>Personal Data:</Text> Your name, email, phone number, and delivery addresses will be wiped or anonymized.
              </Text>
              <Text style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 18, marginTop: 4 }}>
                • <Text style={{ fontWeight: '700' }}>Legal Retention:</Text> Past order invoices and financial records are retained as required by Indian GST & statutory accounting regulations.
              </Text>
              <Text style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 18, marginTop: 4 }}>
                • <Text style={{ fontWeight: '700' }}>Active Orders:</Text> Deletion requires all active grocery or food orders to be completed or cancelled first.
              </Text>
            </View>

            {deleteError ? (
              <View style={{ backgroundColor: theme.error + '15', borderWidth: 1, borderColor: theme.error + '40', borderRadius: BorderRadius.md, padding: Spacing.sm, width: '100%', marginBottom: Spacing.md }}>
                <Text style={{ color: theme.error, fontSize: 12, fontWeight: '600', textAlign: 'center' }}>
                  {deleteError}
                </Text>
              </View>
            ) : null}

            {deleteSuccess ? (
              <View style={{ backgroundColor: '#10B98115', borderWidth: 1, borderColor: '#10B98140', borderRadius: BorderRadius.md, padding: Spacing.sm, width: '100%', marginBottom: Spacing.md }}>
                <Text style={{ color: '#059669', fontSize: 12, fontWeight: '700', textAlign: 'center' }}>
                  Account successfully deleted. Redirecting...
                </Text>
              </View>
            ) : (
              <View style={{ width: '100%', gap: Spacing.sm }}>
                <Button
                  title={isDeleting ? 'Deleting Account...' : 'Continue with Permanent Deletion'}
                  variant="danger"
                  size="md"
                  loading={isDeleting}
                  onPress={handleDeleteAccountInApp}
                  style={{ width: '100%' }}
                />

                <Button
                  title="Open Official Web Deletion Page"
                  variant="outline"
                  size="md"
                  onPress={handleOpenWebDeletion}
                  icon={<ExternalLinkIcon size={14} color={theme.textPrimary} style={{ marginRight: 6 }} />}
                  style={{ width: '100%' }}
                />

                <Button
                  title="Cancel & Keep Account"
                  variant="secondary"
                  size="md"
                  onPress={() => setShowDeleteModal(false)}
                  style={{ width: '100%' }}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginVertical: Spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  userInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  userName: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  userContact: {
    fontSize: Typography.sizes.xs + 1,
    marginTop: 2,
  },
  userEmail: {
    fontSize: Typography.sizes.xs,
  },
  editBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  editText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
  },
  walletBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  walletTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  walletSub: {
    fontSize: Typography.sizes.xs,
  },
  sectionHeading: {
    fontSize: Typography.sizes.xs,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs + 2,
  },
  menuBox: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  menuText: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.medium,
    flex: 1,
  },
  menuVal: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
  },
  divider: {
    height: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    width: '100%',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
  },
  modalSub: {
    fontSize: Typography.sizes.sm,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
