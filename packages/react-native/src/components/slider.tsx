import * as React from 'react';
import { Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useThemeColors, useIsolinePlatform, useHaptics } from '../provider.tsx';
import { Pressable } from './pressable.tsx';
import { Text } from './text.tsx';
import { sliderValue } from '../selection.ts';

export interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  onSlidingComplete?: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  hapticStep?: number;
  disabled?: boolean;
  accessibilityLabel: string;
  valueLabel?: string;
  leadingLabel?: string;
  trailingLabel?: string;
  style?: StyleProp<ViewStyle>;
  activeColor?: string;
  trackColor?: string;
  thumbColor?: string;
}
export function Slider({
  value,
  onValueChange,
  onSlidingComplete,
  minimumValue = 0,
  maximumValue = 1,
  step = 0,
  hapticStep,
  disabled,
  accessibilityLabel,
  valueLabel,
  leadingLabel,
  trailingLabel,
  style,
  activeColor,
  trackColor,
  thumbColor,
}: SliderProps) {
  const colors = useThemeColors();
  const { selectionHaptic } = useHaptics();
  const lastHaptic = React.useRef<number | null>(null);
  const ios = useIsolinePlatform() === 'ios';
  const thumbWidth = ios ? 24 : 6;
  const trackHeight = ios ? 4 : 12;
  const [width, setWidth] = React.useState(1);
  const current = sliderValue(value, minimumValue, maximumValue, step);
  const fraction =
    maximumValue > minimumValue ? (current - minimumValue) / (maximumValue - minimumValue) : 0;
  const fromX = (x: number) =>
    sliderValue(
      minimumValue + Math.max(0, Math.min(1, x / width)) * (maximumValue - minimumValue),
      minimumValue,
      maximumValue,
      step,
    );
  const change = (next: number, finish = false) => {
    if (disabled) return;
    const result = sliderValue(next, minimumValue, maximumValue, step);
    if (hapticStep && hapticStep > 0) {
      const tick = Math.round((result - minimumValue) / hapticStep);
      if (tick !== lastHaptic.current) {
        lastHaptic.current = tick;
        selectionHaptic();
      }
    }
    onValueChange(result);
    if (finish) onSlidingComplete?.(result);
  };
  const delta = step > 0 ? step : (maximumValue - minimumValue) / 100;
  const gesture = Gesture.Pan()
    .enabled(!disabled)
    .minDistance(0)
    .runOnJS(true)
    .onBegin((event) => change(fromX(event.x)))
    .onUpdate((event) => change(fromX(event.x)))
    .onEnd((event) => change(fromX(event.x), true));
  return (
    <View style={[{ gap: 4, opacity: disabled ? 0.4 : 1 }, style]}>
      {leadingLabel || trailingLabel ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="caption">{leadingLabel}</Text>
          <Text variant="caption">{trailingLabel}</Text>
        </View>
      ) : null}
      <GestureDetector gesture={gesture}>
        <Pressable
          disabled={disabled}
          accessibilityRole="adjustable"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ disabled }}
          accessibilityValue={{
            min: minimumValue,
            max: maximumValue,
            now: current,
            text: valueLabel,
          }}
          accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
          onAccessibilityAction={(event) =>
            change(
              current + (event.nativeEvent.actionName === 'increment' ? delta : -delta),
              true,
            )
          }
          {...(Platform.OS === 'web'
            ? {
                role: 'slider',
                'aria-valuemin': minimumValue,
                'aria-valuemax': maximumValue,
                'aria-valuenow': current,
                'aria-valuetext': valueLabel,
                onKeyDown: (
                  event: Parameters<
                    NonNullable<React.ComponentProps<typeof Pressable>['onKeyDown']>
                  >[0],
                ) => {
                  const key = event.nativeEvent.key;
                  if (
                    ![
                      'ArrowLeft',
                      'ArrowRight',
                      'ArrowDown',
                      'ArrowUp',
                      'Home',
                      'End',
                      'PageUp',
                      'PageDown',
                    ].includes(key)
                  )
                    return;
                  event.preventDefault();
                  change(
                    key === 'Home'
                      ? minimumValue
                      : key === 'End'
                        ? maximumValue
                        : current +
                          (['ArrowUp', 'ArrowRight', 'PageUp'].includes(key) ? 1 : -1) *
                            delta *
                            (key.startsWith('Page') ? 10 : 1),
                    true,
                  );
                },
              }
            : {})}
          onLayout={(event) => setWidth(Math.max(1, event.nativeEvent.layout.width))}
          style={{ height: 44, minWidth: 80, justifyContent: 'center' }}
        >
          <View
            style={{
              height: trackHeight,
              borderRadius: 6,
              backgroundColor: trackColor ?? colors.surfaceContainerHighest,
            }}
          >
            <View
              style={{
                height: trackHeight,
                width: `${fraction * 100}%`,
                backgroundColor: activeColor ?? colors.primary,
                borderRadius: 6,
              }}
            />
          </View>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: fraction * Math.max(0, width - thumbWidth),
              width: thumbWidth,
              height: ios ? 24 : 36,
              borderRadius: ios ? 12 : 3,
              backgroundColor: thumbColor ?? activeColor ?? colors.primary,
            }}
          />
        </Pressable>
      </GestureDetector>
    </View>
  );
}
