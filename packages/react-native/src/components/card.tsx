import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { Pressable } from './pressable.tsx';
import { useThemeColors } from '../provider.tsx';

export interface CardProps extends ViewProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  /** Makes the whole card one action. Do not nest interactive controls in an actionable card. */
  onPress?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}
export function Card({
  header,
  footer,
  children,
  onPress,
  disabled,
  style,
  accessibilityLabel,
  ...props
}: CardProps) {
  const colors = useThemeColors();
  const content = (
    <>
      {header}
      {children}
      {footer}
    </>
  );
  const appearance = [
    {
      padding: 16,
      gap: 12,
      borderRadius: 20,
      backgroundColor: colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      opacity: disabled ? 0.4 : 1,
    },
    style,
  ];
  return onPress ? (
    <Pressable
      {...props}
      style={appearance}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
    >
      {content}
    </Pressable>
  ) : (
    <View {...props} accessibilityLabel={accessibilityLabel} style={appearance}>
      {content}
    </View>
  );
}
