import * as React from 'react';
import { Platform, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import {
  Surface,
  useIsolinePlatform,
  useThemeColors,
  type MaterialOptions,
} from '../provider.tsx';
import { Text } from './text.tsx';
import { Pressable } from './pressable.tsx';
import { Button } from './button.tsx';
import { WavyProgress, type WavyProgressProps } from './wavy-progress.tsx';

export interface UndoBarProps extends MaterialOptions {
  message: string;
  actionLabel: string;
  dismissLabel: string;
  onUndo: () => void;
  onDismiss: () => void;
  /** Time supplied by the app's undo clock. This component never executes/expiries undo entries. */
  remainingMs: number;
  totalMs: number;
  progress?: WavyProgressProps['progress'];
  paused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  collapsed?: boolean;
  onExpand?: () => void;
  countLabel?: string;
  showDismissButton?: boolean;
}
/** A feedback surface only; queue, expiry, collapse policy and screen clearance belong to the app. */
export function UndoBar({
  message,
  actionLabel,
  dismissLabel,
  onUndo,
  onDismiss,
  remainingMs,
  totalMs,
  progress: suppliedProgress,
  paused,
  onPause,
  onResume,
  collapsed,
  onExpand,
  countLabel,
  showDismissButton = true,
  material = 'solid',
  glassStyle,
  tintColor,
  fallbackColor,
  interactive,
}: UndoBarProps) {
  const colors = useThemeColors();
  const glass = useIsolinePlatform() === 'ios' && material !== 'solid';
  const swipe = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .runOnJS(true)
    .onBegin(() => onPause?.())
    .onEnd((event) => {
      if (Math.abs(event.translationX) > 96 || Math.abs(event.velocityX) > 800) onDismiss();
    })
    .onFinalize(() => onResume?.());
  const progress = totalMs > 0 ? Math.max(0, Math.min(1, remainingMs / totalMs)) : 0;
  return (
    <GestureDetector gesture={swipe}>
      <Surface
        material={glass ? material : 'solid'}
        glassStyle={glassStyle}
        tintColor={tintColor}
        fallbackColor={fallbackColor}
        interactive={interactive}
        style={{ padding: 12, borderRadius: 24, gap: 6 }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={message}
          accessibilityActions={[{ name: 'dismiss', label: dismissLabel }]}
          onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === 'dismiss') onDismiss();
          }}
          onPress={onExpand}
          onPressIn={onPause}
          onPressOut={onResume}
          {...(Platform.OS === 'web'
            ? {
                onKeyDown: (
                  event: Parameters<
                    NonNullable<React.ComponentProps<typeof Pressable>['onKeyDown']>
                  >[0],
                ) => {
                  if (event.nativeEvent.key === 'Escape') {
                    event.preventDefault();
                    onDismiss();
                  }
                },
              }
            : {})}
          style={{ minHeight: 44, justifyContent: 'center' }}
        >
          {!collapsed ? (
            <Text accessibilityLiveRegion="polite">{message}</Text>
          ) : (
            <Text>{countLabel ?? actionLabel}</Text>
          )}
          {countLabel ? <Text variant="caption">{countLabel}</Text> : null}
        </Pressable>
        <WavyProgress
          progress={suppliedProgress ?? progress}
          animated={!paused}
          color={colors.primary}
          trackColor={colors.surfaceContainerHighest}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Button
            size="s"
            variant="ghost"
            label={actionLabel}
            accessibilityLabel={`${actionLabel}: ${message}`}
            onPress={onUndo}
            onPressIn={onPause}
            onPressOut={onResume}
            accessibilityActions={[{ name: 'dismiss', label: dismissLabel }]}
            onAccessibilityAction={(event) => {
              if (event.nativeEvent.actionName === 'dismiss') onDismiss();
            }}
          />
          {showDismissButton ? (
            <Button size="s" variant="ghost" label={dismissLabel} onPress={onDismiss} />
          ) : null}
        </View>
      </Surface>
    </GestureDetector>
  );
}
