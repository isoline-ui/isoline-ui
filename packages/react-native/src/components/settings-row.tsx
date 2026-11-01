import * as React from 'react';
import { View } from 'react-native';

import { ChevronRight, type IconProps } from './icons.tsx';
import { Pressable } from './pressable.tsx';
import { Switch } from './switch.tsx';
import { Text } from './text.tsx';
import { useRipple, useThemeColors } from '../provider.tsx';
import { cn } from '../utils.ts';

/** A row in a settings card: a symbol in its own tinted circle, a label and what it is set to. */
export function SettingsRow({
  icon: Icon,
  label,
  description,
  onPress,
  value,
  onValueChange,
  first,
}: {
  icon?: React.ComponentType<IconProps>;
  label: string;
  description?: string;
  onPress?: () => void;
  /** A switch instead of a chevron. */
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  first?: boolean;
}) {
  const colors = useThemeColors();
  const ripple = useRipple();
  const toggle = value !== undefined && onValueChange;
  return (
    <Pressable
      onPress={toggle ? () => onValueChange(!value) : onPress}
      disabled={!toggle && !onPress}
      android_ripple={{ color: ripple.onNeutral }}
      accessibilityRole={toggle ? 'switch' : 'button'}
      accessibilityState={toggle ? { checked: value } : undefined}
      className={cn(
        'min-h-16 flex-row items-center gap-4 px-4 py-3',
        !first && 'border-t border-border',
      )}
    >
      {Icon ? (
        <View className="h-10 w-10 items-center justify-center rounded-full bg-secondaryContainer">
          <Icon size={20} color={colors.onSecondaryContainer} />
        </View>
      ) : null}
      <View className="flex-1 gap-0.5">
        <Text variant="subject">{label}</Text>
        {description ? <Text variant="muted">{description}</Text> : null}
      </View>
      {toggle ? (
        <Switch value={value} onValueChange={onValueChange} accessibilityLabel={label} />
      ) : onPress ? (
        <ChevronRight size={20} color={colors.outline} />
      ) : null}
    </Pressable>
  );
}
