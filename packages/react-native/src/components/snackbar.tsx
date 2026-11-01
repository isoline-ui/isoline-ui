import * as React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Text } from './text.tsx';
import { Pressable } from './pressable.tsx';
import { elevation } from '../provider.tsx';
export interface SnackbarProps {
  message: string;
  bottom?: number;
  actionLabel?: string;
  onAction?: () => void;
}
/** Visibility, replacement, duration and undo state belong to the caller. */
export function Snackbar({ message, bottom = 12, actionLabel, onAction }: SnackbarProps) {
  return (
    <View pointerEvents="box-none" className="absolute left-0 right-0 px-4" style={{ bottom }}>
      <Animated.View
        entering={FadeInDown.springify().damping(20)}
        exiting={FadeOutDown.duration(120)}
        accessibilityLiveRegion="polite"
        className="min-h-12 flex-row items-center gap-2 rounded-2xl bg-inverseSurface py-1.5 pl-4 pr-1.5"
        style={{ elevation: elevation.level3 }}
      >
        <Text className="flex-1 py-2 text-sm text-inverseOnSurface">{message}</Text>
        {onAction && actionLabel ? (
          <Pressable
            onPress={onAction}
            accessibilityRole="button"
            className="h-10 justify-center rounded-full px-3"
          >
            <Text className="text-sm font-bold text-inversePrimary">{actionLabel}</Text>
          </Pressable>
        ) : null}
      </Animated.View>
    </View>
  );
}
