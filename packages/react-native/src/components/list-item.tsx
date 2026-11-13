import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { Pressable } from './pressable.tsx';
import { Text } from './text.tsx';
import { useThemeColors } from '../provider.tsx';

export interface ListItemProps extends ViewProps {
  title: string;
  description?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
}
/** A static row can contain trailing actions. An actionable row must not nest controls. */
export function ListItem({
  title,
  description,
  leading,
  trailing,
  onPress,
  disabled,
  selected,
  style,
  accessibilityLabel,
  ...props
}: ListItemProps) {
  const colors = useThemeColors();
  const content = (
    <>
      {leading}
      <View style={{ flex: 1, gap: 4 }}>
        <Text>{title}</Text>
        {description ? <Text variant="caption">{description}</Text> : null}
      </View>
      {trailing}
    </>
  );
  const appearance = [
    {
      minHeight: 56,
      padding: 12,
      gap: 12,
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      borderRadius: 12,
      opacity: disabled ? 0.4 : 1,
      backgroundColor: selected ? colors.secondaryContainer : 'transparent',
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
      accessibilityLabel={accessibilityLabel ?? [title, description].filter(Boolean).join(', ')}
      accessibilityState={{ disabled, selected }}
    >
      {content}
    </Pressable>
  ) : (
    <View {...props} style={appearance} accessibilityLabel={accessibilityLabel}>
      {content}
    </View>
  );
}
