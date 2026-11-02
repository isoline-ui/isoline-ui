import * as React from 'react';
import { View } from 'react-native';
import { ChevronDown } from './icons.tsx';
import { Popover } from './popover.tsx';
import { ContextMenuRows } from './context-menu.tsx';
import { Pressable } from './pressable.tsx';
import { Text } from './text.tsx';
import {
  Surface,
  useIsolinePlatform,
  useThemeColors,
  useRipple,
  type MaterialOptions,
} from '../provider.tsx';
export interface SelectOption<T extends string> {
  id: T;
  label: string;
  disabled?: boolean;
}
export interface SelectFieldProps<T extends string> extends MaterialOptions {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  accessibilityLabel: string;
  menuMaterial?: MaterialOptions['material'];
  disabled?: boolean;
}
export function SelectField<T extends string>({
  value,
  options,
  onChange,
  accessibilityLabel,
  disabled,
  material = 'solid',
  menuMaterial = 'auto',
  glassStyle,
  tintColor,
  fallbackColor,
  interactive = false,
}: SelectFieldProps<T>) {
  const platform = useIsolinePlatform();
  const ios = platform === 'ios';
  const glass = ios && material !== 'solid';
  const colors = useThemeColors();
  const ripple = useRipple();
  const [open, setOpen] = React.useState(false);
  const anchor = React.useRef<React.ComponentRef<typeof View>>(null);
  const selected = options.find((option) => option.id === value);
  const Container = glass ? Surface : View;
  return (
    <View ref={anchor} collapsable={false}>
      <Container
        {...(glass ? { material, glassStyle, tintColor, fallbackColor, interactive } : {})}
        style={{ borderRadius: ios ? 10 : 24 }}
      >
        <Pressable
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ expanded: open, disabled }}
          onPress={() => setOpen(true)}
          android_ripple={{ color: ripple.onNeutral }}
          style={{
            minHeight: 44,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: ios ? 10 : 24,
            borderWidth: ios ? 0 : 1,
            borderColor: colors.outline,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            ...(!glass && ios ? { backgroundColor: colors.surfaceContainerHigh } : {}),
            opacity: disabled ? 0.4 : 1,
          }}
        >
          <Text style={{ fontSize: 15, color: colors.onSurface }}>
            {selected?.label ?? value}
          </Text>
          <ChevronDown size={16} color={colors.onSurfaceVariant} />
        </Pressable>
      </Container>
      <Popover
        visible={open}
        onClose={() => setOpen(false)}
        anchorRef={anchor}
        accessibilityLabel={accessibilityLabel}
        material={menuMaterial}
        glassStyle={glassStyle}
        tintColor={tintColor}
        fallbackColor={fallbackColor}
      >
        <ContextMenuRows
          items={options.map((option) => ({
            ...option,
            selected: option.id === value,
            onPress: () => onChange(option.id),
          }))}
          onClose={() => setOpen(false)}
        />
      </Popover>
    </View>
  );
}
