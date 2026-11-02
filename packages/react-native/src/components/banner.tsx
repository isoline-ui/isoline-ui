import * as React from 'react';
import { View } from 'react-native';
import { Text } from './text.tsx';
import { Button } from './button.tsx';
import { IconButton } from './icon-button.tsx';
import { X, type IconProps } from './icons.tsx';
import { useThemeColors } from '../provider.tsx';

export interface BannerProps {
  message: string;
  title?: string;
  tone?: 'neutral' | 'info' | 'error';
  icon?: React.ComponentType<IconProps>;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss?: () => void;
  dismissLabel?: string;
}
export function Banner({
  message,
  title,
  tone = 'neutral',
  icon: Icon,
  actionLabel,
  onAction,
  onDismiss,
  dismissLabel,
}: BannerProps) {
  const colors = useThemeColors();
  const backgroundColor =
    tone === 'error'
      ? colors.errorContainer
      : tone === 'info'
        ? colors.primaryContainer
        : colors.surfaceContainerHigh;
  const color =
    tone === 'error'
      ? colors.onErrorContainer
      : tone === 'info'
        ? colors.onPrimaryContainer
        : colors.onSurface;
  return (
    <View
      accessibilityLiveRegion={tone === 'error' ? 'assertive' : 'polite'}
      style={{ borderRadius: 16, padding: 12, gap: 8, backgroundColor }}
    >
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        {Icon ? <Icon size={24} color={color} /> : null}
        <View style={{ flex: 1, gap: 4 }}>
          {title ? <Text style={{ color, fontWeight: '600' }}>{title}</Text> : null}
          <Text style={{ color }}>{message}</Text>
        </View>
        {onDismiss && dismissLabel ? (
          <IconButton icon={X} accessibilityLabel={dismissLabel} onPress={onDismiss} />
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Button variant="ghost" size="s" label={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  );
}
export const InlineNotice = Banner;
