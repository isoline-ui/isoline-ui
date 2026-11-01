import * as React from 'react';
import { View } from 'react-native';

import { BackIcon } from './back-icon.tsx';
import { HEADER_ICON_BUTTON, IconButton } from './icon-button.tsx';
import { Text } from './text.tsx';
import { useLabels, useSurface } from '../provider.tsx';
import { cn } from '../utils.ts';

/**
 * The bar every screen below the tabs opens with: the back arrow 8 from the
 * edge, the screen's own buttons at the other end, and, when a screen wants
 * one, something small in between (a position, a step). One height, one
 * inset, so moving between screens moves nothing at the top. The status
 * bar's room is the screen's: it knows whether it draws under it.
 */
export interface TopBarProps {
  onBack: () => void;
  backLabel?: string;
  center?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}
export function TopBar({ onBack, center, actions, backLabel, className }: TopBarProps) {
  const labels = useLabels();
  const Surface = useSurface();
  return (
    <View className={cn('h-14 flex-row items-center px-2', className)}>
      <Surface
        pointerEvents="none"
        style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
        fallbackColor="transparent"
      />
      <IconButton
        {...HEADER_ICON_BUTTON}
        icon={BackIcon}
        onPress={onBack}
        accessibilityLabel={backLabel ?? labels.back}
      />
      <View className="flex-1 items-center px-2">{center}</View>
      {actions}
    </View>
  );
}

/**
 * A screen's name under its bar: the emphasized title, 16 from the edge, and
 * a line about it. The same on every screen, so a title is where the eye
 * expects it.
 */
export function ScreenTitle({
  title,
  caption,
  className,
}: {
  title: string;
  caption?: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={cn('gap-1 px-4', className)}>
      <Text variant="title">{title}</Text>
      {typeof caption === 'string' ? <Text variant="caption">{caption}</Text> : caption}
    </View>
  );
}
