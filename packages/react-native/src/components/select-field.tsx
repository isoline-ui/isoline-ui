import * as React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
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
  /** null displays the placeholder; non-null IDs must exist in options. */
  value: T | null;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  accessibilityLabel: string;
  label?: string;
  placeholder?: string;
  hint?: string;
  error?: string | null;
  menuMaterial?: MaterialOptions['material'];
  disabled?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
}
export function SelectField<T extends string>({
  value,
  options,
  onChange,
  accessibilityLabel,
  label,
  placeholder = '',
  hint,
  error,
  disabled,
  className,
  style,
  material = 'solid',
  menuMaterial = 'auto',
  glassStyle,
  tintColor,
  fallbackColor,
  interactive = false,
}: SelectFieldProps<T>) {
  const ios = useIsolinePlatform() === 'ios';
  const glass = ios && material !== 'solid';
  const colors = useThemeColors();
  const ripple = useRipple();
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  const anchor = React.useRef<React.ComponentRef<typeof View>>(null);
  const selected = options.find((option) => option.id === value);
  const Container = glass ? Surface : View;
  return (
    <View className={className} style={[{ gap: 6 }, style]}>
      {label ? <Text variant="label">{label}</Text> : null}
      <View ref={anchor} collapsable={false}>
        <Container
          {...(glass ? { material, glassStyle, tintColor, fallbackColor, interactive } : {})}
          style={{ borderRadius: ios ? 10 : 24 }}
        >
          <Pressable
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            accessibilityValue={{ text: selected?.label ?? placeholder }}
            accessibilityHint={error ?? hint}
            accessibilityState={{ expanded: open, disabled }}
            onPress={() => setOpen(true)}
            android_ripple={{ color: ripple.onNeutral }}
            style={{
              minHeight: 44,
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: ios ? 10 : 24,
              borderWidth: error || !ios ? 1 : 0,
              borderColor: error ? colors.error : colors.outline,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              ...(!glass && ios ? { backgroundColor: colors.surfaceContainerHigh } : {}),
              opacity: disabled ? 0.4 : 1,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 15,
                color: selected ? colors.onSurface : colors.onSurfaceVariant,
              }}
            >
              {selected?.label ?? value ?? placeholder}
            </Text>
            <ChevronDown size={16} color={colors.onSurfaceVariant} />
          </Pressable>
        </Container>
        <Popover
          visible={open && !disabled}
          onClose={() => setOpen(false)}
          anchorRef={anchor}
          accessibilityLabel={accessibilityLabel}
          material={menuMaterial}
          glassStyle={glassStyle}
          tintColor={tintColor}
          fallbackColor={fallbackColor}
          interactive={interactive}
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
