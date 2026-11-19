// src/app/support/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { APP_CONFIG } from '@/constants/config';
import { TextField } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, HelpCircle, MessageSquare, Phone, Mail, ChevronDown, ChevronUp, Send, ShieldCheck, FileText, Trash2, ExternalLink } from 'lucide-react-native';
import { openPrivacyPolicy, openDeleteAccountWebPage, openTermsAndConditions } from '@/utils/legal';
import { openDialer, openEmail, UBS_OFFICIAL_CONTACT } from '@/utils/contact';

const FAQS = [
  { q: 'How do I track my taxi or food delivery order?', a: 'You can view real-time status in the "My Orders" tab or on the active booking screen with live status updates.' },
  { q: 'What payment methods does UBS Super support?', a: 'UBS Super supports UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, UBS Super Wallet, and Cash on Delivery.' },
  { q: 'How do refunds work for cancelled rides or orders?', a: 'Refunds are automatically processed to your UBS Super Wallet instantly or credited back to your original payment method within 3-5 business days.' },
  { q: 'Can I book multiple services simultaneously?', a: 'Yes! UBS Super is an all-in-one Super App. You can order food, book a taxi ride, and buy groceries at the same time.' },
];

export default function HelpSupportScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'agent', text: 'Hello! I am UBS Super AI Support assistant. How can I help you today?' },
  ]);

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = { sender: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { sender: 'agent', text: 'Thank you for reaching out! Our customer support representative in Kozhikode has been notified.' },
      ]);
    }, 1000);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Help & Customer Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Contact Shortcuts */}
        <View style={styles.contactRow}>
          <TouchableOpacity
            style={[styles.contactCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => openDialer(UBS_OFFICIAL_CONTACT.phone)}
            activeOpacity={0.7}
          >
            <Phone size={24} color={theme.primary} style={{ marginBottom: 6 }} />
            <Text style={[styles.contactTitle, { color: theme.textPrimary }]}>Call Hotline</Text>
            <Text style={[styles.contactSub, { color: theme.primary, fontWeight: '700' }]}>{UBS_OFFICIAL_CONTACT.phone}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.contactCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => openEmail(UBS_OFFICIAL_CONTACT.email, 'UBS Super Support Inquiry')}
            activeOpacity={0.7}
          >
            <Mail size={24} color={theme.blue} style={{ marginBottom: 6 }} />
            <Text style={[styles.contactTitle, { color: theme.textPrimary }]}>Email Support</Text>
            <Text style={[styles.contactSub, { color: theme.textSecondary }]} numberOfLines={1}>{UBS_OFFICIAL_CONTACT.email}</Text>
          </TouchableOpacity>
        </View>

        {/* Live Chat Action Bar */}
        <TouchableOpacity
          style={[styles.chatBarBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => setShowChatModal(true)}
          activeOpacity={0.8}
        >
          <View style={styles.chatBarLeft}>
            <View style={[styles.chatIconBox, { backgroundColor: '#DCFCE7' }]}>
              <MessageSquare size={20} color="#16A34A" />
            </View>
            <View>
              <Text style={[styles.chatBarTitle, { color: theme.textPrimary }]}>24x7 Live Agent Support</Text>
              <Text style={[styles.chatBarSub, { color: theme.textSecondary }]}>Instant chat assistance with UBS support team</Text>
            </View>
          </View>
          <Send size={16} color="#16A34A" />
        </TouchableOpacity>

        {/* FAQs Accordion */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Frequently Asked Questions</Text>
        </View>

        {FAQS.map((faq, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.faqCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => setExpandedIndex(isExpanded ? null : index)}
            >
              <View style={styles.faqHeader}>
                <Text style={[styles.faqQ, { color: theme.textPrimary }]}>{faq.q}</Text>
                {isExpanded ? <ChevronUp size={18} color={theme.textSecondary} /> : <ChevronDown size={18} color={theme.textSecondary} />}
              </View>

              {isExpanded && (
                <Text style={[styles.faqA, { color: theme.textSecondary }]}>{faq.a}</Text>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Legal & Compliance Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Legal & Account Policies</Text>
        </View>

        <View style={[styles.faqCard, { backgroundColor: theme.card, borderColor: theme.border, padding: Spacing.sm }]}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.sm }}
            onPress={() => openPrivacyPolicy()}
          >
            <ShieldCheck size={18} color={theme.primary} style={{ marginRight: 10 }} />
            <Text style={{ flex: 1, fontSize: 14, color: theme.textPrimary, fontWeight: '600' }}>Privacy Policy</Text>
            <ExternalLink size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <View style={{ height: 1, backgroundColor: theme.borderLight }} />

          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.sm }}
            onPress={() => openTermsAndConditions()}
          >
            <FileText size={18} color={theme.primary} style={{ marginRight: 10 }} />
            <Text style={{ flex: 1, fontSize: 14, color: theme.textPrimary, fontWeight: '600' }}>Terms & Conditions</Text>
            <ExternalLink size={16} color={theme.textMuted} />
          </TouchableOpacity>

          <View style={{ height: 1, backgroundColor: theme.borderLight }} />

          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', padding: Spacing.sm }}
            onPress={() => openDeleteAccountWebPage()}
          >
            <Trash2 size={18} color={theme.error} style={{ marginRight: 10 }} />
            <Text style={{ flex: 1, fontSize: 14, color: theme.error, fontWeight: '600' }}>Account Deletion Guide</Text>
            <ExternalLink size={16} color={theme.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.footerInfo}>
          <Text style={[styles.infoTitle, { color: theme.textPrimary }]}>UBS Global Customer Care</Text>
          <TouchableOpacity onPress={() => openDialer(UBS_OFFICIAL_CONTACT.phone)} style={{ paddingVertical: 4 }}>
            <Text style={[styles.infoSub, { color: theme.primary, fontWeight: '700' }]}>
              📞 Phone: {UBS_OFFICIAL_CONTACT.phone}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openEmail(UBS_OFFICIAL_CONTACT.email)} style={{ paddingVertical: 4 }}>
            <Text style={[styles.infoSub, { color: theme.primary, fontWeight: '700' }]}>
              ✉️ Email: {UBS_OFFICIAL_CONTACT.email}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.infoSub, { color: theme.textMuted, marginTop: 4 }]}>
            Hours: {UBS_OFFICIAL_CONTACT.hours} • Location: Manjeri, Malappuram, Kerala
          </Text>
        </View>
      </ScrollView>

      {/* Live Chat Modal */}
      <Modal visible={showChatModal} transparent animationType="slide">
        <SafeAreaView style={[styles.chatModalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setShowChatModal(false)} style={styles.backBtn}>
              <ArrowLeft size={20} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Live Agent Support</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.chatScroll} contentContainerStyle={{ padding: Spacing.md }}>
            {chatMessages.map((msg, i) => (
              <View
                key={i}
                style={[
                  styles.msgBubble,
                  msg.sender === 'user' ? styles.userBubble : [styles.agentBubble, { backgroundColor: theme.surface }],
                  msg.sender === 'user' && { backgroundColor: theme.primary },
                ]}
              >
                <Text style={{ color: msg.sender === 'user' ? '#FFFFFF' : theme.textPrimary, fontSize: 14 }}>
                  {msg.text}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={[styles.chatInputRow, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
            <TextField
              value={chatInput}
              onChangeText={setChatInput}
              placeholder="Type your message here..."
              containerStyle={{ flex: 1, marginRight: Spacing.sm }}
            />
            <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.primary }]} onPress={handleSendChat}>
              <Send size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
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
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Spacing.md,
  },
  contactCard: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  contactSub: {
    fontSize: Typography.sizes.xs,
    textAlign: 'center',
    marginTop: 2,
  },
  chatBarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  chatBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  chatIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBarTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  chatBarSub: {
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeader: {
    marginVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
  },
  faqCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQ: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
    flex: 1,
    marginRight: Spacing.sm,
  },
  faqA: {
    fontSize: Typography.sizes.xs + 1,
    lineHeight: 20,
    marginTop: Spacing.sm,
  },
  footerInfo: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  infoTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.bold,
  },
  infoSub: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
    textAlign: 'center',
  },
  chatModalContainer: {
    flex: 1,
  },
  chatScroll: {
    flex: 1,
  },
  msgBubble: {
    maxWidth: '80%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
  },
  agentBubble: {
    alignSelf: 'flex-start',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
