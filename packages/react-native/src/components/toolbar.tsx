import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { Surface, useIsolinePlatform } from '../provider.tsx';
import { Text } from './text.tsx';
import { cn } from '../utils.ts';

export interface ToolbarProps extends ViewProps {
  /** Floating navigation uses glass on supported iOS when a surface adapter is supplied. */
  material?: 'auto' | 'glass' | 'solid';
}
export function Toolbar({ material = 'auto', style, className, ...props }: ToolbarProps) {
  const ios = useIsolinePlatform() === 'ios';
  return (
    <Surface
      {...props}
      material={ios ? material : 'solid'}
      className={cn('flex-row items-center justify-between gap-3', className)}
      style={[
        {
          minHeight: 56,
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: ios ? 28 : 20,
        },
        style,
      ]}
    />
  );
}
export interface NavigationBarProps extends ToolbarProps {
  title: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}
export function NavigationBar({ title, leading, trailing, ...props }: NavigationBarProps) {
  const ios = useIsolinePlatform() === 'ios';
  return (
    <Toolbar {...props}>
      <View style={{ minWidth: 44 }}>{leading}</View>
      <Text
        accessibilityRole="header"
        variant="subject"
        style={{ flex: 1, textAlign: ios ? 'center' : 'left' }}
      >
        {title}
      </Text>
      <View style={{ minWidth: 44, alignItems: 'flex-end' }}>{trailing}</View>
    </Toolbar>
  );
}
