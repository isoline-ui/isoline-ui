import * as React from 'react';
import { Platform, View } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Text } from './text.tsx';
import { Pressable } from './pressable.tsx';
import {
  Surface,
  useIsolinePlatform,
  useThemeColors,
  elevation,
  type MaterialOptions,
} from '../provider.tsx';
export interface SnackbarProps extends MaterialOptions {
  message: string;
  bottom?: number;
  actionLabel?: string;
  onAction?: () => void;
}
/** Visibility, duration and undo state belong to the caller. Solid is the reading-safe default. */
export function Snackbar({
  message,
  bottom = 12,
  actionLabel,
  onAction,
  material = 'solid',
  glassStyle,
  tintColor,
  fallbackColor,
  interactive = false,
}: SnackbarProps) {
  const colors = useThemeColors();
  const glass = useIsolinePlatform() === 'ios' && material !== 'solid';
  const web = Platform.OS === 'web';
  const Box = (glass ? Surface : web ? View : Animated.View) as typeof Animated.View;
  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 0, right: 0, paddingHorizontal: 16, bottom }}
    >
      <Box
        {...(glass
          ? { material, glassStyle, tintColor, fallbackColor, interactive }
          : !web
            ? {
                entering: FadeInDown.springify().damping(20),
                exiting: FadeOutDown.duration(120),
              }
            : {})}
        accessibilityLiveRegion="polite"
        style={{
          minHeight: 48,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          borderRadius: 16,
          paddingVertical: 6,
          paddingLeft: 16,
          paddingRight: 6,
          elevation: elevation.level3,
          ...(!glass ? { backgroundColor: colors.inverseSurface } : {}),
        }}
      >
        <Text
          style={{
            flex: 1,
            fontSize: 14,
            color: glass ? colors.onSurface : colors.inverseOnSurface,
          }}
        >
          {message}
        </Text>
        {onAction && actionLabel ? (
          <Pressable
            onPress={onAction}
            accessibilityRole="button"
            style={{
              minHeight: 44,
              justifyContent: 'center',
              borderRadius: 22,
              paddingHorizontal: 12,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: glass ? colors.primary : colors.inversePrimary,
              }}
            >
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </Box>
    </View>
  );
}
