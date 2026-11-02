import * as React from 'react';
import { View } from 'react-native';
import { useThemeColors, useIsolinePlatform } from '../provider.tsx';
import { Button, type ButtonProps } from './button.tsx';
import { Text } from './text.tsx';
import type { IconProps } from './icons.tsx';

export interface ActionChipProps extends Omit<
  ButtonProps,
  'children' | 'icon' | 'label' | 'variant' | 'size'
> {
  label: string;
  icon?: React.ComponentType<IconProps>;
  tone?: 'neutral' | 'primary' | 'secondary' | 'tertiary';
}
export function ActionChip({
  label,
  icon: Icon,
  tone = 'neutral',
  style,
  ...props
}: ActionChipProps) {
  const colors = useThemeColors();
  const glass =
    useIsolinePlatform() === 'ios' &&
    props.material !== undefined &&
    props.material !== 'solid';
  const backgroundColor = glass
    ? 'transparent'
    : tone === 'neutral'
      ? colors.surfaceContainerHigh
      : colors[`${tone}Container`];
  const color = glass
    ? colors.primary
    : tone === 'neutral'
      ? colors.onSurface
      : colors[
          tone === 'primary'
            ? 'onPrimaryContainer'
            : tone === 'secondary'
              ? 'onSecondaryContainer'
              : 'onTertiaryContainer'
        ];
  return (
    <Button
      {...props}
      size="s"
      variant="tonal"
      accessibilityLabel={props.accessibilityLabel ?? label}
      style={(state) => [
        { backgroundColor, minHeight: 48 },
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {Icon ? <Icon size={20} color={color} /> : null}
        <Text style={{ color, fontWeight: '600' }}>{label}</Text>
      </View>
    </Button>
  );
}
