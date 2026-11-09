// src/app/taxi/safety.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { Button } from '@/components/ui/Button';
import {
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  PhoneCall,
  Share2,
  Mic,
  Users,
  Lock,
  HeartHandshake,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react-native';

export default function TaxiSafetyScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [autoShareNight, setAutoShareNight] = useState(true);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(5);
  const [contacts, setContacts] = useState([
    { id: '1', name: 'Family Emergency (Home)', phone: '+91 94471 00000', relationship: 'Primary' },
    { id: '2', name: 'Rahul (Friend)', phone: '+91 98950 11111', relationship: 'Secondary' },
  ]);

  const triggerSos = () => {
    setShowSosModal(true);
    setSosCountdown(5);
  };

  const handleShareTrip = () => {
    Alert.alert(
      'Live Trip Link Shared',
      'A secure live GPS tracking link with vehicle details (KL-10-AZ-7890) has been broadcasted to your emergency contacts.',
      [{ text: 'Great', style: 'default' }]
    );
  };

  const toggleAudioRecording = () => {
    setIsRecordingAudio(!isRecordingAudio);
    Alert.alert(
      !isRecordingAudio ? 'Audio Recording Started' : 'Recording Stopped & Encrypted',
      !isRecordingAudio
        ? 'Your ride audio is now being securely encrypted and stored on device for safety verification.'
        : 'Audio session safely encrypted and saved.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Safety Toolkit</Text>
          <View style={styles.headerBadge}>
            <ShieldCheck size={12} color="#16A34A" />
            <Text style={styles.headerBadgeText}>24/7 Active Shield</Text>
          </View>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Emergency SOS Banner */}
        <TouchableOpacity
          style={[styles.sosCard, Shadows.large]}
          activeOpacity={0.9}
          onPress={triggerSos}
        >
          <View style={styles.sosIconContainer}>
            <ShieldAlert size={36} color="#DC2626" />
          </View>
          <View style={styles.sosTextContainer}>
            <Text style={styles.sosTitle}>EMERGENCY SOS (112)</Text>
            <Text style={styles.sosSubtitle}>
              Tap to instantly alert Police Emergency & broadcast GPS location
            </Text>
          </View>
          <View style={styles.sosArrowBadge}>
            <Text style={styles.sosArrowText}>SOS</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Safety Actions Grid */}
        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
          Ride Safety Tools
        </Text>

        <View style={styles.toolGrid}>
          {/* Share Live Trip */}
          <TouchableOpacity
            style={[
              styles.toolCard,
              { backgroundColor: theme.card, borderColor: theme.border },
              Shadows.small,
            ]}
            onPress={handleShareTrip}
          >
            <View style={[styles.toolIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Share2 size={22} color="#2563EB" />
            </View>
            <Text style={[styles.toolTitle, { color: theme.textPrimary }]}>Share Live Trip</Text>
            <Text style={[styles.toolDesc, { color: theme.textSecondary }]}>
              Send live vehicle route to family via WhatsApp
            </Text>
          </TouchableOpacity>

          {/* 24/7 Safety Helpline */}
          <TouchableOpacity
            style={[
              styles.toolCard,
              { backgroundColor: theme.card, borderColor: theme.border },
              Shadows.small,
            ]}
            onPress={() => {
              Alert.alert('Calling UBS Super Safety Line', 'Dialing 24/7 Support: 1800-425-8274');
            }}
          >
            <View style={[styles.toolIconWrap, { backgroundColor: '#FEF2F2' }]}>
              <PhoneCall size={22} color="#DC2626" />
            </View>
            <Text style={[styles.toolTitle, { color: theme.textPrimary }]}>Safety Hotline</Text>
            <Text style={[styles.toolDesc, { color: theme.textSecondary }]}>
              Connect to 24/7 incident response in &lt; 30s
            </Text>
          </TouchableOpacity>

          {/* Audio Safety Recording */}
          <TouchableOpacity
            style={[
              styles.toolCard,
              { backgroundColor: theme.card, borderColor: theme.border },
              Shadows.small,
            ]}
            onPress={toggleAudioRecording}
          >
            <View
              style={[
                styles.toolIconWrap,
                { backgroundColor: isRecordingAudio ? '#FEE2E2' : '#F3E8FF' },
              ]}
            >
              <Mic size={22} color={isRecordingAudio ? '#DC2626' : '#9333EA'} />
            </View>
            <Text style={[styles.toolTitle, { color: theme.textPrimary }]}>
              {isRecordingAudio ? 'Recording Active' : 'Record Audio'}
            </Text>
            <Text style={[styles.toolDesc, { color: theme.textSecondary }]}>
              {isRecordingAudio ? 'Tap to stop & save' : 'Encrypted in-cabin audio recorder'}
            </Text>
          </TouchableOpacity>

          {/* RideCheck Anomaly Detection */}
          <View
            style={[
              styles.toolCard,
              { backgroundColor: theme.card, borderColor: theme.border },
              Shadows.small,
            ]}
          >
            <View style={[styles.toolIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <CheckCircle size={22} color="#059669" />
            </View>
            <Text style={[styles.toolTitle, { color: theme.textPrimary }]}>RideCheck™</Text>
            <Text style={[styles.toolDesc, { color: theme.textSecondary }]}>
              Auto-detects off-route turns or long unexpected stops
            </Text>
          </View>
        </View>

        {/* Night Safety Auto-Share Toggle */}
        <View
          style={[
            styles.toggleCard,
            { backgroundColor: theme.card, borderColor: theme.border },
            Shadows.small,
          ]}
        >
          <View style={styles.toggleTextCol}>
            <Text style={[styles.toggleTitle, { color: theme.textPrimary }]}>
              Night Ride Auto-Share (After 8 PM)
            </Text>
            <Text style={[styles.toggleSubtitle, { color: theme.textSecondary }]}>
              Automatically send live tracking SMS to primary contact for all night rides.
            </Text>
          </View>
          <Switch
            value={autoShareNight}
            onValueChange={setAutoShareNight}
            trackColor={{ false: '#CBD5E1', true: theme.primary }}
          />
        </View>

        {/* Emergency Contacts Section */}
        <View style={styles.contactsHeaderRow}>
          <Text style={[styles.sectionHeading, { color: theme.textPrimary, marginBottom: 0 }]}>
            Trusted Contacts ({contacts.length})
          </Text>
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Add Contact', 'You can select from your address book.');
            }}
          >
            <Text style={[styles.addContactText, { color: theme.primary }]}>+ Add Contact</Text>
          </TouchableOpacity>
        </View>

        {contacts.map((contact) => (
          <View
            key={contact.id}
            style={[
              styles.contactCard,
              { backgroundColor: theme.card, borderColor: theme.border },
              Shadows.small,
            ]}
          >
            <View style={[styles.contactAvatar, { backgroundColor: theme.primary + '18' }]}>
              <Users size={18} color={theme.primary} />
            </View>
            <View style={styles.contactDetails}>
              <Text style={[styles.contactName, { color: theme.textPrimary }]}>
                {contact.name}
              </Text>
              <Text style={[styles.contactPhone, { color: theme.textSecondary }]}>
                {contact.phone}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: theme.surface }]}>
              <Text style={[styles.badgeText, { color: theme.textPrimary }]}>
                {contact.relationship}
              </Text>
            </View>
          </View>
        ))}

        {/* UBS Super 4-Pillar Safety Guarantee */}
        <Text style={[styles.sectionHeading, { color: theme.textPrimary, marginTop: Spacing.lg }]}>
          Our Safety Commitment
        </Text>

        <View
          style={[
            styles.guaranteeBox,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.pillarItem}>
            <ShieldCheck size={20} color={theme.primary} style={{ marginRight: Spacing.sm }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.pillarTitle, { color: theme.textPrimary }]}>
                100% Background Verified Drivers
              </Text>
              <Text style={[styles.pillarDesc, { color: theme.textSecondary }]}>
                All drivers undergo Kerala Police verification and biometric identity clearance.
              </Text>
            </View>
          </View>

          <View style={[styles.pillarDivider, { backgroundColor: theme.border }]} />

          <View style={styles.pillarItem}>
            <Lock size={20} color={theme.amber} style={{ marginRight: Spacing.sm }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.pillarTitle, { color: theme.textPrimary }]}>
                Mandatory Start OTP Protection
              </Text>
              <Text style={[styles.pillarDesc, { color: theme.textSecondary }]}>
                Never board the wrong vehicle. Trip begins only when driver inputs your private 4-digit code.
              </Text>
            </View>
          </View>

          <View style={[styles.pillarDivider, { backgroundColor: theme.border }]} />

          <View style={styles.pillarItem}>
            <HeartHandshake size={20} color="#059669" style={{ marginRight: Spacing.sm }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.pillarTitle, { color: theme.textPrimary }]}>
                In-Ride Accidental Coverage
              </Text>
              <Text style={[styles.pillarDesc, { color: theme.textSecondary }]}>
                Every passenger is insured up to ₹5,00,000 from pickup to drop-off.
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* SOS Alert Modal */}
      <Modal visible={showSosModal} transparent animationType="fade">
        <View style={styles.sosModalOverlay}>
          <View style={[styles.sosModalCard, { backgroundColor: theme.card }]}>
            <View style={styles.sosModalHeader}>
              <AlertTriangle size={32} color="#DC2626" />
              <Text style={styles.sosModalTitle}>POLICE EMERGENCY 112</Text>
            </View>

            <Text style={[styles.sosModalMsg, { color: theme.textPrimary }]}>
              Initiating emergency response. Kerala Police Dispatch and your emergency contacts
              will be sent your live GPS coordinates immediately.
            </Text>

            <View style={styles.sosTimerCircle}>
              <Text style={styles.sosTimerText}>LIVE</Text>
            </View>

            <Button
              title="Confirm Emergency Dispatch"
              variant="danger"
              size="lg"
              onPress={() => {
                setShowSosModal(false);
                Alert.alert('Emergency Alert Sent', 'Police Emergency 112 has been notified with your current GPS location.');
              }}
              style={{ width: '100%', marginBottom: Spacing.sm }}
            />

            <Button
              title="Cancel (False Alarm)"
              variant="secondary"
              size="md"
              onPress={() => setShowSosModal(false)}
              style={{ width: '100%' }}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  headerBadgeText: {
    fontSize: 9,
    color: '#15803D',
    fontWeight: '700',
    marginLeft: 3,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl * 2,
  },
  sosCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#EF4444',
    borderRadius: BorderRadius.xl,
    padding: Spacing.md + 2,
    marginVertical: Spacing.md,
  },
  sosIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  sosTextContainer: {
    flex: 1,
  },
  sosTitle: {
    color: '#991B1B',
    fontSize: Typography.sizes.md,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sosSubtitle: {
    color: '#B91C1C',
    fontSize: 11,
    marginTop: 2,
  },
  sosArrowBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  sosArrowText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  sectionHeading: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  toolCard: {
    width: '48.5%',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  toolIconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  toolTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  toolDesc: {
    fontSize: 10,
    marginTop: 3,
    lineHeight: 14,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  toggleTextCol: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  toggleTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  toggleSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  contactsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  addContactText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  contactPhone: {
    fontSize: 11,
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: Typography.weights.semibold,
  },
  guaranteeBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  pillarItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.xs,
  },
  pillarTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  pillarDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  pillarDivider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  sosModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  sosModalCard: {
    width: '100%',
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
  },
  sosModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sosModalTitle: {
    color: '#DC2626',
    fontSize: Typography.sizes.lg,
    fontWeight: '900',
    marginLeft: Spacing.xs,
  },
  sosModalMsg: {
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.lg,
  },
  sosTimerCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FEE2E2',
    borderWidth: 3,
    borderColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  sosTimerText: {
    color: '#DC2626',
    fontSize: Typography.sizes.md,
    fontWeight: '900',
  },
});
