import * as React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import {
  Surface,
  useIsolinePlatform,
  useThemeColors,
  useRipple,
  type MaterialOptions,
} from '../provider.tsx';
import { Pressable } from './pressable.tsx';
import { Text } from './text.tsx';
import type { IconProps } from './icons.tsx';
export interface FloatingActionButtonProps extends MaterialOptions {
  icon: React.ComponentType<IconProps>;
  accessibilityLabel: string;
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  size?: 56 | 64;
  style?: StyleProp<ViewStyle>;
}
/** A reusable floating action; screen placement and navigation remain consumer-owned. */
export function FloatingActionButton({
  icon: Icon,
  accessibilityLabel,
  onPress,
  label,
  disabled,
  size = 64,
  style,
  material = 'solid',
  glassStyle,
  tintColor,
  fallbackColor,
  interactive = true,
}: FloatingActionButtonProps) {
  const colors = useThemeColors();
  const ripple = useRipple();
  const glass = useIsolinePlatform() === 'ios' && material !== 'solid';
  const Container = glass ? Surface : View;
  const color = glass ? colors.primary : colors.onPrimaryContainer;
  return (
    <Container
      {...(glass ? { material, glassStyle, tintColor, fallbackColor, interactive } : {})}
      style={[
        {
          borderRadius: size / 2,
          ...(!glass ? { backgroundColor: colors.primaryContainer } : {}),
          minWidth: size,
          height: size,
        },
        style,
      ]}
    >
      <Pressable
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        onPress={onPress}
        android_ripple={{ color: ripple.onTonal }}
        style={{
          minWidth: size,
          height: size,
          paddingHorizontal: label ? 20 : 0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          borderRadius: size / 2,
          opacity: disabled ? 0.4 : 1,
        }}
      >
        <Icon size={26} color={color} />
        {label ? <Text style={{ color, fontWeight: '600' }}>{label}</Text> : null}
      </Pressable>
    </Container>
  );
}
