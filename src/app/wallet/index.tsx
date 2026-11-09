// src/app/wallet/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { formatCurrency } from '@/utils/currency';
import { useThemeStore } from '@/store/themeStore';
import { useWalletStore } from '@/store/walletStore';
import { TextField } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Wallet, Plus, Tag, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';

export default function WalletScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const { balance, transactions, availableCoupons, addMoney } = useWalletStore();
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('500');

  const handleTopUpSubmit = () => {
    const val = parseFloat(topUpAmount);
    if (!isNaN(val) && val > 0) {
      addMoney(val);
      setShowTopUpModal(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>UBS Super Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Wallet Balance Card */}
        <View style={[styles.walletCard, { backgroundColor: theme.primary }]}>
          <View style={styles.cardHeader}>
            <View style={styles.walletIconBg}>
              <Wallet size={20} color="#16A34A" />
            </View>
            <Text style={styles.walletLabel}>UBS Super Pay Balance</Text>
          </View>

          <Text style={styles.balanceText}>{formatCurrency(balance)}</Text>
          <Text style={styles.subText}>Use balance for instant 1-click checkout</Text>

          <TouchableOpacity
            style={styles.addMoneyBtn}
            activeOpacity={0.8}
            onPress={() => setShowTopUpModal(true)}
          >
            <Plus size={16} color="#16A34A" style={{ marginRight: 4 }} />
            <Text style={styles.addMoneyText}>Add Money to Wallet</Text>
          </TouchableOpacity>
        </View>

        {/* Available Coupons */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Available Promos & Vouchers</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {availableCoupons.map((c) => (
            <View key={c.id} style={[styles.couponCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.codeRow}>
                <Tag size={16} color={theme.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.codeText, { color: theme.primary }]}>{c.code}</Text>
              </View>
              <Text style={[styles.cDesc, { color: theme.textPrimary }]}>{c.description}</Text>
              <Text style={[styles.cExp, { color: theme.textMuted }]}>Expires {c.expiryDate}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Transaction History */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recent Transactions</Text>
        </View>

        <View>
          {transactions.map((tx) => (
            <View
              key={tx.id}
              style={[
                styles.txCard,
                { backgroundColor: theme.card, borderColor: theme.border },
                Shadows.small,
              ]}
            >
              <View
                style={[
                  styles.txIconBg,
                  { backgroundColor: tx.type === 'credit' ? theme.success + '20' : theme.error + '20' },
                ]}
              >
                {tx.type === 'credit' ? (
                  <ArrowDownLeft size={18} color={theme.success} />
                ) : (
                  <ArrowUpRight size={18} color={theme.error} />
                )}
              </View>

              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Text style={[styles.txDesc, { color: theme.textPrimary }]}>{tx.description}</Text>
                <Text style={[styles.txDate, { color: theme.textMuted }]}>{tx.date}</Text>
              </View>

              <Text
                style={[
                  styles.txAmount,
                  { color: tx.type === 'credit' ? theme.success : theme.textPrimary },
                ]}
              >
                {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Top Up Modal */}
      <Modal visible={showTopUpModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Add Money to Wallet</Text>

            <TextField
              label="Amount to Add (₹)"
              value={topUpAmount}
              onChangeText={setTopUpAmount}
              keyboardType="numeric"
            />

            <View style={styles.presetRow}>
              {['200', '500', '1000', '2000'].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.presetChip, { backgroundColor: theme.surface }]}
                  onPress={() => setTopUpAmount(amt)}
                >
                  <Text style={[styles.presetText, { color: theme.textPrimary }]}>+₹{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button
              title="Proceed to Top-up"
              size="lg"
              onPress={handleTopUpSubmit}
              style={{ width: '100%', marginTop: Spacing.md }}
            />

            <Button
              title="Cancel"
              variant="ghost"
              size="md"
              onPress={() => setShowTopUpModal(false)}
              style={{ marginTop: Spacing.xs }}
            />
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
  walletCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginVertical: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs + 2,
  },
  walletLabel: {
    color: '#E2E8F0',
    fontSize: Typography.sizes.xs + 1,
    fontWeight: '700',
  },
  balanceText: {
    color: '#FFFFFF',
    fontSize: Typography.sizes.title + 4,
    fontWeight: '900',
    marginVertical: Spacing.xs,
  },
  subText: {
    color: '#DCFCE7',
    fontSize: Typography.sizes.xs,
    marginBottom: Spacing.md,
  },
  addMoneyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.lg,
  },
  addMoneyText: {
    color: '#16A34A',
    fontWeight: '800',
    fontSize: Typography.sizes.sm,
  },
  sectionHeader: {
    marginVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  couponCard: {
    width: 220,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginRight: Spacing.md,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  codeText: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  cDesc: {
    fontSize: Typography.sizes.xs,
    marginVertical: 4,
  },
  cExp: {
    fontSize: 9,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  txIconBg: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txDesc: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  txDate: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  txAmount: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
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
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.md,
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Spacing.md,
  },
  presetChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.md,
  },
  presetText: {
    fontSize: Typography.sizes.xs + 1,
    fontWeight: Typography.weights.bold,
  },
});
