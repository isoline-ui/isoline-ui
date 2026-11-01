import * as React from 'react';
import { View } from 'react-native';

import { Text } from './text.tsx';
import { cn } from '../utils.ts';

export interface BadgeProps {
  label: string;
  /**
   * Tints the pill and its text, for a badge that stands for something with a
   * colour of its own — a tag. Left unset, the badge is the neutral container
   * colour a folder name gets.
   */
  color?: string;
  className?: string;
}

/** A small pill label, such as a folder name sitting beside a message count. */
export function Badge({ label, color, className }: BadgeProps) {
  return (
    <View
      className={cn(
        'rounded-full px-2 py-0.5',
        color ? undefined : 'bg-surfaceContainerHigh',
        className,
      )}
      // The colour at low alpha, so a tinted badge reads as tinted rather than
      // as a solid swatch competing with the accent.
      style={color ? { backgroundColor: `${color}2A` } : undefined}
    >
      <Text
        variant="caption"
        className={cn(color ? undefined : 'text-onSurfaceVariant')}
        style={color ? { color } : undefined}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}
