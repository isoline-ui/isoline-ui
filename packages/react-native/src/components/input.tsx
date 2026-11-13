import * as React from 'react';
import { TextInput, View } from 'react-native';

import { PasswordVisibility } from './password-visibility.tsx';
import { Text } from './text.tsx';
import { useThemeColors } from '../provider.tsx';
import { cn } from '../utils.ts';

export type InputProps = React.ComponentProps<typeof TextInput> & {
  label?: string;
  /** Shown below the field in destructive color. */
  error?: string | null;
  hint?: string;
};

export const Input: React.ForwardRefExoticComponent<
  InputProps & React.RefAttributes<React.ElementRef<typeof TextInput>>
> = React.forwardRef<React.ElementRef<typeof TextInput>, InputProps>(function Input(
  {
    className,
    label,
    error,
    hint,
    accessibilityLabel,
    accessibilityHint,
    secureTextEntry,
    ...props
  },
  ref,
) {
  const colors = useThemeColors();
  // A masked field can be shown in the clear on request: a password typed on
  // a phone keyboard is easy to get wrong and impossible to check otherwise.
  const [revealed, setRevealed] = React.useState(false);

  return (
    <View className="gap-2">
      {label ? <Text variant="label">{label}</Text> : null}

      <View className="justify-center">
        <TextInput
          ref={ref}
          className={cn(
            'h-14 rounded-xl border border-input bg-surfaceContainerLowest px-5 text-base text-foreground',
            error && 'border-destructive',
            secureTextEntry && 'pr-14',
            className,
          )}
          // Mail addresses and passwords are the two things people mistype most;
          // never help them along with autocorrect or capitalisation.
          autoCapitalize={props.autoCapitalize ?? 'none'}
          autoCorrect={props.autoCorrect ?? false}
          placeholderTextColor={colors.onSurfaceVariant}
          // The visible label is a sibling Text, not a native <label>, so a screen
          // reader landing on the field itself hears nothing without this — and
          // the error/hint line is otherwise a separate node it may never reach.
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityHint={accessibilityHint ?? error ?? hint}
          {...props}
          secureTextEntry={secureTextEntry && !revealed}
        />

        {secureTextEntry ? (
          <PasswordVisibility
            revealed={revealed}
            onPress={() => setRevealed((value) => !value)}
          />
        ) : null}
      </View>

      {error ? (
        <Text accessibilityLiveRegion="polite" variant="caption" className="text-destructive">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption">{hint}</Text>
      ) : null}
    </View>
  );
});
