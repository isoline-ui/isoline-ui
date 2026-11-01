import * as React from 'react';
import { TextInput, View } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Text } from './text.tsx';
import { effects, spatial } from '../motion.ts';
import { corner } from '../shape.ts';
import { useIsolinePlatform, useThemeColors } from '../provider.tsx';
import { cn } from '../utils.ts';

type TextInputInstance = React.ElementRef<typeof TextInput>;

/** The single-line field's height, `h-14`. */
const FIELD_HEIGHT = 56;

export type TextFieldProps = React.ComponentProps<typeof TextInput> & {
  label: string;
  /** Shown below the field in the error colour, which the border and label pick up too. */
  error?: string | null;
  /**
   * The `bg-*` class of whatever surface the field sits on. The floated
   * label needs an opaque patch behind it to mask the border line it
   * overlaps, and that patch has to match the surface underneath — it
   * defaults to the app's popover surface because every field so far lives
   * in a dialog or sheet.
   */
  notchClassName?: string;
};

/**
 * Material 3 Expressive outlined text field.
 *
 * The label rests inside the field, where a placeholder would sit, until
 * there is a reason to move it — focus, or a value — at which point it
 * floats up to overlap the border. Painting an opaque patch behind it there
 * is the cheap way to get the M3 "notch": the alternative is clipping the
 * border into two arcs, which this does not need.
 *
 * A placeholder is a hint for the empty field the reader is typing into, so
 * it only shows once the label has floated out of its way; while the label
 * rests inside the field the two would sit on top of each other.
 */
export const TextField: React.ForwardRefExoticComponent<
  TextFieldProps & React.RefAttributes<TextInputInstance>
> = React.forwardRef<TextInputInstance, TextFieldProps>(function TextField(
  {
    label,
    error,
    value,
    placeholder,
    style,
    className,
    notchClassName,
    onFocus,
    onBlur,
    accessibilityLabel,
    ...props
  },
  ref,
) {
  const ios = useIsolinePlatform() === 'ios';
  const colors = useThemeColors();
  const [focused, setFocused] = React.useState(false);
  const floated = focused || Boolean(value);

  const float = useSharedValue(floated ? 1 : 0);
  const focus = useSharedValue(focused ? 1 : 0);

  React.useEffect(() => {
    float.value = withSpring(floated ? 1 : 0, spatial.default);
  }, [floated, float]);

  React.useEffect(() => {
    focus.value = withSpring(focused ? 1 : 0, effects.default);
  }, [focused, focus]);

  const handleFocus = React.useCallback<NonNullable<TextFieldProps['onFocus']>>(
    (event) => {
      setFocused(true);
      onFocus?.(event);
    },
    [onFocus],
  );

  const handleBlur = React.useCallback<NonNullable<TextFieldProps['onBlur']>>(
    (event) => {
      setFocused(false);
      onBlur?.(event);
    },
    [onBlur],
  );

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? colors.error
      : interpolateColor(focus.value, [0, 1], [colors.outline, colors.primary]),
    borderWidth: interpolate(focus.value, [0, 1], [1, 2]),
  }));

  const labelWrapStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(float.value, [0, 1], [0, -FIELD_HEIGHT / 2]) },
      { scale: interpolate(float.value, [0, 1], [1, 0.75]) },
    ],
  }));

  const labelTextStyle = useAnimatedStyle(() => ({
    color: error
      ? colors.error
      : interpolateColor(focus.value, [0, 1], [colors.onSurfaceVariant, colors.primary]),
  }));

  if (ios)
    return (
      <View className="gap-1.5">
        <Text variant="label" style={{ color: error ? colors.error : colors.onSurfaceVariant }}>
          {label}
        </Text>
        <TextInput
          ref={ref}
          value={value}
          placeholder={placeholder}
          placeholderTextColor={colors.onSurfaceVariant}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={accessibilityLabel ?? label}
          className={cn('text-foreground', className)}
          style={[
            {
              minHeight: 44,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: colors.surfaceContainerHigh,
              borderWidth: 1,
              borderColor: error ? colors.error : focused ? colors.primary : 'transparent',
              fontSize: 17,
            },
            style,
          ]}
          {...props}
        />
        {error ? (
          <Text variant="caption" accessibilityRole="alert" style={{ color: colors.error }}>
            {error}
          </Text>
        ) : null}
      </View>
    );
  return (
    <View className="gap-1.5">
      <View className="relative">
        <TextInput
          ref={ref}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn('h-14 rounded px-4 pt-2 text-base text-foreground', className)}
          style={style}
          placeholder={floated ? placeholder : undefined}
          accessibilityLabel={accessibilityLabel ?? label}
          {...props}
        />

        <Animated.View
          pointerEvents="none"
          style={[borderStyle, { borderRadius: corner.extraSmall }]}
          className="absolute inset-0"
        />

        {/* The label rests centred on the first line, where the text goes,
            and floats by half the field's height onto the border. */}
        <View
          pointerEvents="none"
          style={{ height: FIELD_HEIGHT }}
          className="absolute left-3 top-0 justify-center"
        >
          <Animated.View
            style={[labelWrapStyle, { transformOrigin: 'left center' }]}
            className={cn('rounded px-1', notchClassName ?? 'bg-popover')}
          >
            <Animated.Text style={labelTextStyle} className="text-base">
              {label}
            </Animated.Text>
          </Animated.View>
        </View>
      </View>

      {error ? (
        <Text variant="caption" className="text-destructive">
          {error}
        </Text>
      ) : null}
    </View>
  );
});
