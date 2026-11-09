// src/components/ui/Button.tsx
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacityProps, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  onPress,
  ...rest
}) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.md,
    };

    // Size
    if (size === 'sm') {
      base.paddingVertical = Spacing.xs + 2;
      base.paddingHorizontal = Spacing.md;
    } else if (size === 'lg') {
      base.paddingVertical = Spacing.lg - 2;
      base.paddingHorizontal = Spacing.xl;
    } else {
      base.paddingVertical = Spacing.md - 2;
      base.paddingHorizontal = Spacing.lg;
    }

    // Variant
    switch (variant) {
      case 'secondary':
        base.backgroundColor = theme.surface;
        base.borderWidth = 1;
        base.borderColor = theme.border;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = theme.primary;
        break;
      case 'danger':
        base.backgroundColor = theme.error;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
      case 'primary':
      default:
        base.backgroundColor = theme.primary;
        break;
    }

    if (disabled || loading) {
      base.opacity = 0.6;
    }

    return base;
  };

  const getTextStyle = (): TextStyle => {
    let color = theme.textWhite;
    if (variant === 'secondary') color = theme.textPrimary;
    if (variant === 'outline' || variant === 'ghost') color = theme.primary;
    if (variant === 'danger') color = theme.textWhite;

    let fontSize = Typography.sizes.md;
    if (size === 'sm') fontSize = Typography.sizes.sm;
    if (size === 'lg') fontSize = Typography.sizes.lg;

    return {
      color,
      fontSize,
      fontWeight: Typography.weights.semibold,
      marginLeft: icon ? Spacing.xs : 0,
    };
  };

  return (
    <TouchableOpacity
      style={[getContainerStyle(), style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      onPress={onPress}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' || variant === 'ghost' ? theme.primary : '#FFFFFF'} />
      ) : (
        <>
          {icon}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};
