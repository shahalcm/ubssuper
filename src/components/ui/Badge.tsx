// src/components/ui/Badge.tsx
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography, BorderRadius, Spacing } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  style,
}) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: theme.success + '20', text: theme.success };
      case 'warning':
        return { bg: theme.warning + '20', text: theme.warning };
      case 'error':
        return { bg: theme.error + '20', text: theme.error };
      case 'info':
        return { bg: theme.info + '20', text: theme.info };
      case 'secondary':
        return { bg: theme.surface, text: theme.textSecondary };
      case 'primary':
      default:
        return { bg: theme.primary + '20', text: theme.primary };
    }
  };

  const { bg, text } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
  },
});
