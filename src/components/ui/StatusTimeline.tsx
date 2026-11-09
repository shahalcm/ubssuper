// src/components/ui/StatusTimeline.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { CheckCircle2, Circle } from 'lucide-react-native';

export interface TimelineStep {
  title: string;
  subtitle?: string;
  time?: string;
  completed: boolean;
  current: boolean;
}

interface StatusTimelineProps {
  steps: TimelineStep[];
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({ steps }) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <View key={index} style={styles.stepRow}>
            <View style={styles.iconColumn}>
              {step.completed ? (
                <CheckCircle2 size={20} color={theme.success} />
              ) : step.current ? (
                <View style={[styles.activeDot, { borderColor: theme.primary, backgroundColor: theme.primary + '20' }]}>
                  <View style={[styles.innerDot, { backgroundColor: theme.primary }]} />
                </View>
              ) : (
                <Circle size={18} color={theme.border} />
              )}
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: step.completed ? theme.success : theme.border },
                  ]}
                />
              )}
            </View>

            <View style={styles.contentColumn}>
              <View style={styles.headerRow}>
                <Text
                  style={[
                    styles.stepTitle,
                    { color: step.completed || step.current ? theme.textPrimary : theme.textMuted },
                    step.current && { fontWeight: Typography.weights.bold },
                  ]}
                >
                  {step.title}
                </Text>
                {step.time && (
                  <Text style={[styles.stepTime, { color: theme.textSecondary }]}>{step.time}</Text>
                )}
              </View>
              {step.subtitle && (
                <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>
                  {step.subtitle}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  iconColumn: {
    alignItems: 'center',
    width: 28,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  activeDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  contentColumn: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: Typography.sizes.sm + 1,
    fontWeight: Typography.weights.medium,
  },
  stepTime: {
    fontSize: Typography.sizes.xs,
  },
  stepSubtitle: {
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
});
