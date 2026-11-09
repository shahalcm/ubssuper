// src/components/cards/OrderCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Order } from '@/types';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Typography, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/localization';
import { Badge } from '@/components/ui/Badge';
import {
  ShoppingBag,
  Utensils,
  Car,
  Building,
  Truck,
  ChevronRight,
  Zap,
  RotateCcw,
  Star,
  MapPin,
  Clock,
  Phone,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react-native';

interface OrderCardProps {
  order: Order;
  onPress: () => void;
  onReorder?: (order: Order) => void;
  onTrack?: (order: Order) => void;
  onRate?: (order: Order) => void;
  onHelp?: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onPress,
  onReorder,
  onTrack,
  onRate,
  onHelp,
}) => {
  const { isDarkMode } = useThemeStore();
  const { t } = useTranslation();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const isActive = order.status === 'out_for_delivery' || order.status === 'processing' || order.status === 'confirmed';
  const isCancelled = order.status === 'cancelled';
  const isCompleted = order.status === 'completed';

  const getServiceConfig = () => {
    switch (order.category) {
      case 'food':
        return {
          icon: <Utensils size={17} color="#F97316" />,
          bgColor: '#FFEDD5',
          label: order.bookingDetails?.restaurantName || 'Food Delivery',
          accentColor: '#F97316',
        };
      case 'grocery':
        return {
          icon: <ShoppingBag size={17} color="#16A34A" />,
          bgColor: '#DCFCE7',
          label: order.bookingDetails?.storeName || 'Grocery Express',
          accentColor: '#16A34A',
        };
      case 'taxi':
        return {
          icon: <Car size={17} color="#D97706" />,
          bgColor: '#FEF3C7',
          label: order.bookingDetails?.vehicle || 'UBS Super Ride',
          accentColor: '#D97706',
        };
      case 'hotels':
        return {
          icon: <Building size={17} color="#2563EB" />,
          bgColor: '#DBEAFE',
          label: order.bookingDetails?.hotelName || 'Hotel Booking',
          accentColor: '#2563EB',
        };
      case 'logistics':
        return {
          icon: <Truck size={17} color="#9333EA" />,
          bgColor: '#F3E8FF',
          label: 'Parcel Express',
          accentColor: '#9333EA',
        };
      default:
        return {
          icon: <ShoppingBag size={17} color="#16A34A" />,
          bgColor: '#DCFCE7',
          label: 'UBS Super Service',
          accentColor: '#16A34A',
        };
    }
  };

  const service = getServiceConfig();

  const getStatusBadge = () => {
    if (order.status === 'out_for_delivery') {
      return (
        <View style={[styles.liveStatusPill, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}>
          <View style={styles.pulseDot} />
          <Zap size={11} color="#15803D" fill="#15803D" style={{ marginRight: 3 }} />
          <Text style={[styles.liveStatusText, { color: '#15803D' }]}>
            {t('orders.status.onTheWay', 'OUT FOR DELIVERY')} • {order.bookingDetails?.eta || 'ETA 8 Mins'}
          </Text>
        </View>
      );
    }
    if (order.status === 'processing') {
      return (
        <View style={[styles.liveStatusPill, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
          <View style={[styles.pulseDot, { backgroundColor: '#D97706' }]} />
          <Clock size={11} color="#B45309" style={{ marginRight: 3 }} />
          <Text style={[styles.liveStatusText, { color: '#B45309' }]}>
            {t('orders.status.preparing', 'PACKING & PREPARING')}
          </Text>
        </View>
      );
    }
    if (isCompleted) {
      return (
        <View style={[styles.statusPill, { backgroundColor: isDarkMode ? '#14532D20' : '#DCFCE7' }]}>
          <CheckCircle2 size={11} color="#16A34A" style={{ marginRight: 3 }} />
          <Text style={[styles.statusText, { color: '#15803D' }]}>{t('orders.status.delivered', 'DELIVERED')}</Text>
        </View>
      );
    }
    if (isCancelled) {
      return (
        <View style={[styles.statusPill, { backgroundColor: '#FEE2E2' }]}>
          <AlertCircle size={11} color="#DC2626" style={{ marginRight: 3 }} />
          <Text style={[styles.statusText, { color: '#DC2626' }]}>{t('orders.status.cancelled', 'CANCELLED')}</Text>
        </View>
      );
    }
    return <Badge label={t(`orders.status.${order.status}`, order.status.toUpperCase())} variant="info" />;
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: isActive
            ? '#16A34A'
            : isCancelled
            ? theme.border
            : theme.border,
          borderWidth: isActive ? 1.5 : 1,
        },
        isActive ? Shadows.medium : Shadows.small,
      ]}
      activeOpacity={0.88}
      onPress={onPress}
    >
      {/* 🌟 CARD HEADER */}
      <View style={styles.header}>
        <View style={styles.serviceRow}>
          <View style={[styles.iconBg, { backgroundColor: service.bgColor }]}>
            {service.icon}
          </View>
          <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
            <View style={styles.titleRow}>
              <Text style={[styles.providerName, { color: theme.textPrimary }]} numberOfLines={1}>
                {service.label}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={[styles.orderId, { color: theme.textSecondary }]}>#{order.id}</Text>
              <Text style={[styles.dotSep, { color: theme.textMuted }]}>•</Text>
              <Text style={[styles.date, { color: theme.textSecondary }]}>{order.date}</Text>
            </View>
          </View>
        </View>

        {getStatusBadge()}
      </View>

      {/* 🌟 ACTIVE RADAR BANNER */}
      {isActive && order.bookingDetails?.driverName && (
        <View
          style={[
            styles.driverBanner,
            {
              backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC',
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.driverLeft}>
            <View style={styles.driverAvatar}>
              <Text style={styles.driverAvatarInitial}>
                {order.bookingDetails.driverName.charAt(0)}
              </Text>
            </View>
            <View style={{ marginLeft: 8 }}>
              <Text style={[styles.driverName, { color: theme.textPrimary }]}>
                {order.bookingDetails.driverName}
              </Text>
              <Text style={[styles.driverSub, { color: theme.textSecondary }]}>
                Delivery Partner • {order.bookingDetails.eta || 'Approaching'}
              </Text>
            </View>
          </View>

          {order.bookingDetails.driverPhone && (
            <TouchableOpacity
              style={[styles.callBtn, { backgroundColor: '#DCFCE7' }]}
              activeOpacity={0.7}
              onPress={(e) => {
                e.stopPropagation?.();
                Alert.alert('Calling Partner', `Dialing ${order.bookingDetails?.driverName} at ${order.bookingDetails?.driverPhone}`);
              }}
            >
              <Phone size={13} color="#15803D" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 🌟 ITEM SUMMARY */}
      <Text style={[styles.summary, { color: theme.textPrimary }]} numberOfLines={2}>
        {order.itemsSummary}
      </Text>

      {/* 🌟 DESTINATION / ADDRESS */}
      <View style={styles.addressRow}>
        <MapPin size={12} color={theme.textMuted} style={{ marginRight: 5, marginTop: 1 }} />
        <Text style={[styles.addressText, { color: theme.textSecondary }]} numberOfLines={1}>
          {order.deliveryAddress}
        </Text>
      </View>

      {/* 🌟 CANCELLED / REFUND NOTICE */}
      {isCancelled && order.bookingDetails?.cancellationReason && (
        <View style={styles.refundBox}>
          <Text style={styles.refundText}>
            💡 {order.bookingDetails.cancellationReason}
          </Text>
        </View>
      )}

      {/* 🌟 CARD FOOTER WITH TOTAL & ACTIONS */}
      <View style={[styles.footer, { borderTopColor: theme.borderLight }]}>
        <View>
          <Text style={[styles.totalLabel, { color: theme.textMuted }]}>
            {order.paymentMethod}
          </Text>
          <Text style={[styles.totalAmount, { color: theme.textPrimary }]}>
            {formatCurrency(order.totalAmount)}
          </Text>
        </View>

        <View style={styles.footerActions}>
          {isActive ? (
            <TouchableOpacity
              style={[styles.trackBtn, { backgroundColor: '#16A34A' }]}
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation?.();
                if (onTrack) onTrack(order);
                else onPress();
              }}
            >
              <Zap size={13} color="#FFFFFF" fill="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.trackBtnText}>{t('orders.trackOrder', 'Track Live')}</Text>
            </TouchableOpacity>
          ) : isCompleted ? (
            <View style={styles.completedActionsRow}>
              {onRate && (
                <TouchableOpacity
                  style={[styles.actionOutlineBtn, { borderColor: theme.border }]}
                  activeOpacity={0.7}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    onRate(order);
                  }}
                >
                  <Star size={12} color="#F59E0B" fill="#F59E0B" style={{ marginRight: 3 }} />
                  <Text style={[styles.actionBtnText, { color: theme.textPrimary }]}>{t('common.rate', 'Rate')}</Text>
                </TouchableOpacity>
              )}

              {onReorder && (
                <TouchableOpacity
                  style={[styles.actionPrimaryBtn, { backgroundColor: '#16A34A' }]}
                  activeOpacity={0.8}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    onReorder(order);
                  }}
                >
                  <RotateCcw size={12} color="#FFFFFF" style={{ marginRight: 3 }} />
                  <Text style={styles.actionPrimaryBtnText}>{t('orders.reorder', 'Reorder')}</Text>
                </TouchableOpacity>
              )}

              <View style={styles.detailsBtn}>
                <ChevronRight size={18} color={theme.textMuted} />
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.actionOutlineBtn, { borderColor: theme.border }]}
              activeOpacity={0.7}
              onPress={(e) => {
                e.stopPropagation?.();
                if (onHelp) onHelp(order);
                else onPress();
              }}
            >
              <HelpCircle size={12} color={theme.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.actionBtnText, { color: theme.textSecondary }]}>{t('navigation.help', 'Need Help')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs + 2,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  iconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerName: {
    fontSize: 14,
    fontWeight: Typography.weights.bold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  orderId: {
    fontSize: 10,
    fontWeight: '700',
  },
  dotSep: {
    fontSize: 10,
    marginHorizontal: 4,
  },
  date: {
    fontSize: 10,
    fontWeight: '500',
  },
  liveStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
    marginRight: 4,
  },
  liveStatusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  driverBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginVertical: 6,
  },
  driverLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverAvatarInitial: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  driverName: {
    fontSize: 11,
    fontWeight: '700',
  },
  driverSub: {
    fontSize: 9,
    fontWeight: '500',
  },
  callBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: {
    fontSize: Typography.sizes.sm,
    lineHeight: 18,
    marginVertical: Spacing.xs,
    fontWeight: '500',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  addressText: {
    fontSize: 11,
    flex: 1,
  },
  refundBox: {
    backgroundColor: '#FEF2F2',
    padding: 8,
    borderRadius: BorderRadius.sm,
    marginVertical: 4,
  },
  refundText: {
    color: '#991B1B',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: Spacing.xs + 4,
    marginTop: Spacing.xs,
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: Typography.weights.bold,
  },
  footerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    ...Shadows.small,
  },
  trackBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  completedActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: 6,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actionPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginRight: 4,
  },
  actionPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  detailsBtn: {
    paddingLeft: 2,
  },
});
