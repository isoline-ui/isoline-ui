import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { Text } from './text.tsx';
import { useThemeColors } from '../provider.tsx';

export interface FormFieldProps extends ViewProps {
  label: string;
  /** Localized visible required marker, for example “(required)”. */
  requiredLabel?: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}
/** Visual field grouping. Give the control the same accessible label and hint. */
export function FormField({
  label,
  requiredLabel,
  hint,
  error,
  children,
  style,
  ...props
}: FormFieldProps) {
  const colors = useThemeColors();
  return (
    <View {...props} style={[{ gap: 6 }, style]}>
      <Text variant="label">
        {label}
        {requiredLabel ? ` ${requiredLabel}` : ''}
      </Text>
      {children}
      {error ? (
        <Text accessibilityLiveRegion="polite" style={{ color: colors.error }}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption">{hint}</Text>
      ) : null}
    </View>
  );
}
