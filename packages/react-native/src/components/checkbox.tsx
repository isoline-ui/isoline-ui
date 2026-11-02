import * as React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useThemeColors, useHaptics, useIsolinePlatform } from '../provider.tsx';
import { Pressable } from './pressable.tsx';
import { Check } from './icons.tsx';
import { Text } from './text.tsx';

export interface CheckboxProps {
  checked: boolean | 'mixed';
  onCheckedChange: (checked: boolean) => void;
  accessibilityLabel: string;
  label?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}
/** Controlled selection; storage and selection of a collection remain caller-owned. */
export function Checkbox({
  checked,
  onCheckedChange,
  accessibilityLabel,
  label,
  disabled,
  style,
}: CheckboxProps) {
  const colors = useThemeColors();
  const ios = useIsolinePlatform() === 'ios';
  const { selectionHaptic } = useHaptics();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => {
        selectionHaptic();
        onCheckedChange(checked !== true);
      }}
      style={[
        {
          minHeight: 44,
          minWidth: 44,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: ios || checked ? 12 : 6,
          borderWidth: 2,
          borderColor: checked ? colors.primary : colors.outline,
          backgroundColor: checked ? colors.primary : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked === 'mixed' ? (
          <View style={{ width: 12, height: 2, backgroundColor: colors.onPrimary }} />
        ) : checked ? (
          <Check size={18} color={colors.onPrimary} />
        ) : null}
      </View>
      {label ? <Text style={{ flexShrink: 1 }}>{label}</Text> : null}
    </Pressable>
  );
}
