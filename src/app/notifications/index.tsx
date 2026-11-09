// src/app/notifications/index.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { useNotificationsStore } from '@/store/notificationsStore';
import { NotificationItem } from '@/types';
import {
  ArrowLeft,
  Bell,
  CheckCheck,
  Trash2,
  ShoppingBag,
  Car,
  Tag,
  Wallet,
  ShieldCheck,
  Clock,
  Sparkles,
  ChevronRight,
  X,
  Check,
  Settings,
  AlertCircle,
  Truck,
} from 'lucide-react-native';

type CategoryFilter = 'all' | 'order' | 'ride' | 'promo' | 'account';

export default function NotificationsScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    getUnreadCount,
  } = useNotificationsStore();

  const [selectedFilter, setSelectedFilter] = useState<CategoryFilter>('all');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Preference switches state
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [rideAlerts, setRideAlerts] = useState(true);
  const [promoAlerts, setPromoAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  const unreadCount = getUnreadCount();

  const triggerToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 2200);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
    triggerToast('All notifications marked as read');
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to delete all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => {
            clearAll();
            triggerToast('All notifications cleared');
          },
        },
      ]
    );
  };

  // Filtered list
  const filteredNotifications = useMemo(() => {
    if (selectedFilter === 'all') return notifications;
    return notifications.filter((n) => n.category === selectedFilter);
  }, [notifications, selectedFilter]);

  // Handle navigation from notification CTA
  const handleNotificationAction = (item: NotificationItem) => {
    markAsRead(item.id);
    switch (item.category) {
      case 'order':
        router.push('/orders');
        break;
      case 'ride':
        router.push('/taxi');
        break;
      case 'promo':
        router.push('/(tabs)/grocery');
        break;
      case 'account':
        router.push('/wallet');
        break;
      default:
        break;
    }
  };

  // Render Icon helper
  const getCategoryDetails = (category: NotificationItem['category']) => {
    switch (category) {
      case 'order':
        return {
          icon: ShoppingBag,
          color: '#16A34A',
          bgColor: isDarkMode ? '#14532D25' : '#DCFCE7',
          label: 'Order Update',
          cta: 'Track Order',
        };
      case 'ride':
        return {
          icon: Car,
          color: '#D97706',
          bgColor: isDarkMode ? '#78350F25' : '#FEF3C7',
          label: 'Taxi Ride',
          cta: 'View Ride',
        };
      case 'promo':
        return {
          icon: Tag,
          color: '#9333EA',
          bgColor: isDarkMode ? '#581C8725' : '#F3E8FF',
          label: 'Special Offer',
          cta: 'Shop Deals',
        };
      case 'account':
        return {
          icon: Wallet,
          color: '#2563EB',
          bgColor: isDarkMode ? '#1E3A8A25' : '#DBEAFE',
          label: 'Account & Wallet',
          cta: 'View Wallet',
        };
      default:
        return {
          icon: Bell,
          color: '#64748B',
          bgColor: isDarkMode ? '#33415525' : '#F1F5F9',
          label: 'General',
          cta: 'View Details',
        };
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.container, { backgroundColor: theme.background }]}>
      {/* 🌟 1. TOP HEADER BAR */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.headerBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            activeOpacity={0.75}
          >
            <ArrowLeft size={18} color={theme.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Notifications</Text>
            {unreadCount > 0 ? (
              <View style={[styles.unreadBadgePill, { backgroundColor: '#EF4444' }]}>
                <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
              </View>
            ) : (
              <Text style={[styles.allReadSub, { color: theme.textSecondary }]}>All caught up</Text>
            )}
          </View>
        </View>

        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: theme.surface, borderColor: theme.border, marginRight: 8 }]}
              activeOpacity={0.75}
              onPress={handleMarkAllRead}
            >
              <CheckCheck size={18} color="#16A34A" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: theme.surface, borderColor: theme.border, marginRight: 8 }]}
            activeOpacity={0.75}
            onPress={() => setShowSettingsModal(true)}
          >
            <Settings size={18} color={theme.textPrimary} />
          </TouchableOpacity>

          {notifications.length > 0 && (
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
              activeOpacity={0.75}
              onPress={handleClearAll}
            >
              <Trash2 size={17} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Toast Feedback */}
      {feedbackToast && (
        <View style={[styles.toastContainer, { backgroundColor: isDarkMode ? '#1E293B' : '#0F172A' }]}>
          <Check size={14} color="#22C55E" style={{ marginRight: 6 }} />
          <Text style={styles.toastText}>{feedbackToast}</Text>
        </View>
      )}

      {/* 🌟 2. UNREAD STATUS BANNER */}
      <View
        style={[
          styles.statusBanner,
          {
            backgroundColor: unreadCount > 0 ? (isDarkMode ? '#14532D20' : '#ECFDF5') : (isDarkMode ? '#1E293B' : '#F8FAFC'),
            borderColor: unreadCount > 0 ? '#86EFAC' : theme.border,
          },
        ]}
      >
        <View style={styles.statusLeft}>
          {unreadCount > 0 ? (
            <Sparkles size={16} color="#16A34A" style={{ marginRight: 6 }} />
          ) : (
            <CheckCheck size={16} color="#2563EB" style={{ marginRight: 6 }} />
          )}
          <Text style={[styles.statusText, { color: theme.textPrimary }]}>
            {unreadCount > 0 ? (
              <Text>
                You have <Text style={{ fontWeight: '800', color: '#16A34A' }}>{unreadCount} unread</Text>{' '}
                {unreadCount === 1 ? 'alert' : 'alerts'}
              </Text>
            ) : (
              'You are all caught up! No unread notifications.'
            )}
          </Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markReadActionText}>Mark read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 🌟 3. CATEGORY FILTER TABS */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'order', label: '📦 Orders', count: notifications.filter((n) => n.category === 'order').length },
            { id: 'ride', label: '🚕 Rides', count: notifications.filter((n) => n.category === 'ride').length },
            { id: 'promo', label: '🏷️ Deals', count: notifications.filter((n) => n.category === 'promo').length },
            { id: 'account', label: '👤 Account', count: notifications.filter((n) => n.category === 'account').length },
          ].map((tab) => {
            const isSelected = selectedFilter === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.surface,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => setSelectedFilter(tab.id as CategoryFilter)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    { color: isSelected ? '#FFFFFF' : theme.textPrimary },
                  ]}
                >
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View
                    style={[
                      styles.chipCountPill,
                      {
                        backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipCountText,
                        { color: isSelected ? '#FFFFFF' : theme.textSecondary },
                      ]}
                    >
                      {tab.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 🌟 4. NOTIFICATIONS CARDS LIST */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Spacing.xxl * 2 }]}
      >
        {filteredNotifications.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={{ fontSize: 44, marginBottom: 8 }}>
              {selectedFilter === 'order'
                ? '📦'
                : selectedFilter === 'ride'
                ? '🚕'
                : selectedFilter === 'promo'
                ? '🏷️'
                : '🔔'}
            </Text>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No notifications</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              {selectedFilter === 'all'
                ? "You don't have any notifications right now."
                : `No ${selectedFilter} notifications found.`}
            </Text>
            {selectedFilter !== 'all' && (
              <TouchableOpacity
                style={[styles.resetFilterBtn, { backgroundColor: theme.primary }]}
                onPress={() => setSelectedFilter('all')}
              >
                <Text style={styles.resetFilterBtnText}>Show All Notifications</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredNotifications.map((item) => {
            const details = getCategoryDetails(item.category);
            const Icon = details.icon;

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: item.isRead
                      ? theme.card
                      : isDarkMode
                      ? '#14532D15'
                      : '#F0FDF4',
                    borderColor: item.isRead ? theme.border : '#86EFAC',
                  },
                  Shadows.small,
                ]}
                activeOpacity={0.88}
                onPress={() => handleNotificationAction(item)}
              >
                <View style={styles.cardMainRow}>
                  {/* Category Icon */}
                  <View style={[styles.categoryIconWrap, { backgroundColor: details.bgColor }]}>
                    <Icon size={20} color={details.color} />
                  </View>

                  {/* Notification Content */}
                  <View style={styles.cardContentCol}>
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.categoryBadgeWrap}>
                        <Text style={[styles.categoryTagText, { color: details.color }]}>
                          {details.label}
                        </Text>
                        {!item.isRead && <View style={styles.unreadDot} />}
                      </View>

                      {/* Delete notification single item */}
                      <TouchableOpacity
                        style={styles.deleteItemBtn}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          deleteNotification(item.id);
                        }}
                      >
                        <X size={14} color={theme.textMuted} />
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.title, { color: theme.textPrimary }]}>
                      {item.title}
                    </Text>

                    <Text style={[styles.message, { color: theme.textSecondary }]}>
                      {item.message}
                    </Text>

                    {/* Footer Row: Timestamp & Action Pill */}
                    <View style={styles.cardFooterRow}>
                      <View style={styles.timeWrap}>
                        <Clock size={11} color={theme.textMuted} style={{ marginRight: 4 }} />
                        <Text style={[styles.date, { color: theme.textMuted }]}>{item.date}</Text>
                      </View>

                      <View style={styles.actionPill}>
                        <Text style={[styles.actionPillText, { color: details.color }]}>
                          {details.cta}
                        </Text>
                        <ChevronRight size={13} color={details.color} />
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* 🌟 5. NOTIFICATION SETTINGS MODAL */}
      <Modal
        visible={showSettingsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalDismissArea}
            activeOpacity={1}
            onPress={() => setShowSettingsModal(false)}
          />

          <View style={[styles.settingsModalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.modalHandleBar} />

            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={[styles.modalHeaderTitle, { color: theme.textPrimary }]}>
                  Notification Preferences
                </Text>
                <Text style={[styles.modalHeaderSub, { color: theme.textSecondary }]}>
                  Choose which alerts you want to receive
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowSettingsModal(false)}
                style={[styles.modalCloseBtn, { backgroundColor: theme.surface }]}
              >
                <X size={16} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Switch rows */}
            <View style={styles.switchesList}>
              <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.switchTitle, { color: theme.textPrimary }]}>
                    Order & Delivery Status
                  </Text>
                  <Text style={[styles.switchDesc, { color: theme.textSecondary }]}>
                    Real-time updates on food & grocery orders
                  </Text>
                </View>
                <Switch
                  value={orderAlerts}
                  onValueChange={setOrderAlerts}
                  trackColor={{ false: '#E2E8F0', true: '#16A34A' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.switchTitle, { color: theme.textPrimary }]}>
                    Taxi & Ride Tracking
                  </Text>
                  <Text style={[styles.switchDesc, { color: theme.textSecondary }]}>
                    Driver arrival, ride OTP & receipts
                  </Text>
                </View>
                <Switch
                  value={rideAlerts}
                  onValueChange={setRideAlerts}
                  trackColor={{ false: '#E2E8F0', true: '#16A34A' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.switchTitle, { color: theme.textPrimary }]}>
                    Deals & Promotions
                  </Text>
                  <Text style={[styles.switchDesc, { color: theme.textSecondary }]}>
                    Discounts, flash sales & cashback offers
                  </Text>
                </View>
                <Switch
                  value={promoAlerts}
                  onValueChange={setPromoAlerts}
                  trackColor={{ false: '#E2E8F0', true: '#16A34A' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View style={styles.switchRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.switchTitle, { color: theme.textPrimary }]}>
                    Security & Wallet Alerts
                  </Text>
                  <Text style={[styles.switchDesc, { color: theme.textSecondary }]}>
                    Wallet top-ups and login notifications
                  </Text>
                </View>
                <Switch
                  value={securityAlerts}
                  onValueChange={setSecurityAlerts}
                  trackColor={{ false: '#E2E8F0', true: '#16A34A' }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveSettingsBtn, { backgroundColor: '#16A34A' }]}
              activeOpacity={0.85}
              onPress={() => {
                setShowSettingsModal(false);
                triggerToast('Preferences saved successfully');
              }}
            >
              <Text style={styles.saveSettingsBtnText}>Save Preferences</Text>
            </TouchableOpacity>
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
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    marginLeft: Spacing.sm + 2,
  },
  headerTitle: {
    fontSize: Typography.sizes.md + 2,
    fontWeight: Typography.weights.bold,
  },
  unreadBadgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
    marginTop: 2,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  allReadSub: {
    fontSize: Typography.sizes.xs,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 3,
    borderRadius: BorderRadius.full,
    position: 'absolute',
    top: 70,
    zIndex: 999,
    ...Shadows.medium,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  statusBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs + 2,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: Typography.weights.medium,
  },
  markReadActionText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '800',
  },
  filterSection: {
    marginBottom: Spacing.xs,
  },
  filterScroll: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipActive: {
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chipCountPill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 5,
  },
  chipCountText: {
    fontSize: 9,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
  },
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  categoryIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  cardContentCol: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginLeft: 6,
  },
  deleteItemBtn: {
    padding: 3,
  },
  title: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
    lineHeight: 18,
    marginBottom: 3,
  },
  message: {
    fontSize: Typography.sizes.xs + 1,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 10,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '800',
    marginRight: 2,
  },
  emptyBox: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: Spacing.lg,
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
  resetFilterBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  resetFilterBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  settingsModalCard: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  modalHandleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  modalHeaderTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  modalHeaderSub: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchesList: {
    marginBottom: Spacing.lg,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  switchTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  switchDesc: {
    fontSize: 10,
    marginTop: 2,
  },
  saveSettingsBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  saveSettingsBtnText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.md,
    fontWeight: '800',
  },
});
