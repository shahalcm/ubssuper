// src/components/ui/Input.tsx
import React from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TextInputProps, 
  TouchableOpacity, 
  ViewStyle 
} from 'react-native';
import { Colors } from '@/constants/colors';
import { Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useThemeStore } from '@/store/themeStore';
import { Search, X } from 'lucide-react-native';

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  ...props
}) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: theme.textPrimary }]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          { 
            backgroundColor: theme.surface, 
            borderColor: error ? theme.error : theme.border 
          },
        ]}
      >
        {leftIcon && <View style={styles.leftIconWrapper}>{leftIcon}</View>}
        <TextInput
          placeholderTextColor={theme.textMuted}
          style={[
            styles.input,
            { color: theme.textPrimary },
            style,
          ]}
          {...props}
        />
        {rightIcon && <View style={styles.rightIconWrapper}>{rightIcon}</View>}
      </View>
      {error && <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>}
    </View>
  );
};

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  onPress?: () => void;
  editable?: boolean;
  containerStyle?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search groceries, food, rides, hotels...',
  onClear,
  onPress,
  editable = true,
  containerStyle,
}) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const content = (
    <View
      style={[
        styles.searchWrapper,
        { backgroundColor: theme.surface, borderColor: theme.border },
        containerStyle,
      ]}
    >
      <Search size={18} color={theme.textSecondary} style={styles.searchIcon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textMuted}
        editable={editable}
        pointerEvents={editable ? 'auto' : 'none'}
        style={[styles.searchInput, { color: theme.textPrimary }]}
      />
      {value.length > 0 && onClear && (
        <TouchableOpacity onPress={onClear} activeOpacity={0.7} style={styles.clearBtn}>
          <X size={16} color={theme.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );

  if (onPress && !editable) {
    return (
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: Spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: Typography.sizes.md,
    height: '100%',
  },
  leftIconWrapper: {
    marginRight: Spacing.sm,
  },
  rightIconWrapper: {
    marginLeft: Spacing.sm,
  },
  errorText: {
    fontSize: Typography.sizes.xs,
    marginTop: 4,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 46,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.sm + 1,
  },
  clearBtn: {
    padding: Spacing.xs,
  },
});
