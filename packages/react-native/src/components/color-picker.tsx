import * as React from 'react';
import { View } from 'react-native';
import { Pressable } from './pressable.tsx';
import { Text } from './text.tsx';
import { Check } from './icons.tsx';
import { BottomSheet } from './bottom-sheet.tsx';
import { useThemeColors, type MaterialOptions } from '../provider.tsx';
import { useRadioNavigation } from './radio-navigation.ts';

export interface ColorSwatch {
  value: string;
  label: string;
  color?: string;
  disabled?: boolean;
}
export interface ColorSwatchPickerProps {
  value: string | null;
  onChange: (value: string) => void;
  swatches: ColorSwatch[];
  accessibilityLabel: string;
}
export function ColorSwatchPicker({
  value,
  onChange,
  swatches,
  accessibilityLabel,
}: ColorSwatchPickerProps) {
  const colors = useThemeColors();
  const navigation = useRadioNavigation(
    swatches.map((swatch) => ({ id: swatch.value, disabled: swatch.disabled })),
    value,
    onChange,
  );
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}
    >
      {swatches.map((swatch) => (
        <Pressable
          {...navigation(swatch.value)}
          key={swatch.value}
          accessibilityRole="radio"
          accessibilityLabel={swatch.label}
          disabled={swatch.disabled}
          accessibilityState={{ checked: value === swatch.value, disabled: swatch.disabled }}
          onPress={() => onChange(swatch.value)}
          style={{
            width: 48,
            height: 48,
            padding: 4,
            borderWidth: 2,
            borderRadius: 24,
            borderColor: value === swatch.value ? colors.primary : 'transparent',
            opacity: swatch.disabled ? 0.4 : 1,
          }}
        >
          <View
            style={{
              flex: 1,
              borderRadius: 20,
              backgroundColor: swatch.color ?? swatch.value,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {value === swatch.value ? (
              <View style={{ borderRadius: 12, backgroundColor: colors.surface, padding: 2 }}>
                <Check size={18} color={colors.onSurface} />
              </View>
            ) : null}
          </View>
        </Pressable>
      ))}
    </View>
  );
}
export interface ColorPickerSheetProps extends ColorSwatchPickerProps, MaterialOptions {
  visible: boolean;
  onClose: () => void;
  title: string;
}
export function ColorPickerSheet({
  visible,
  onClose,
  title,
  material = 'solid',
  glassStyle,
  tintColor,
  fallbackColor,
  interactive,
  ...props
}: ColorPickerSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      material={material}
      glassStyle={glassStyle}
      tintColor={tintColor}
      fallbackColor={fallbackColor}
      interactive={interactive}
    >
      <Text variant="heading">{title}</Text>
      <ColorSwatchPicker
        {...props}
        onChange={(value) => {
          props.onChange(value);
          onClose();
        }}
      />
    </BottomSheet>
  );
}
