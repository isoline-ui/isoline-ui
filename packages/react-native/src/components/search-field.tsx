import * as React from 'react';
import { TextInput, View } from 'react-native';

import { IconButton } from './icon-button.tsx';
import { Search, X } from './icons.tsx';
import { useThemeColors } from '../provider.tsx';
import { cn } from '../utils.ts';

export interface SearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  accessibilityLabel: string;
  /** Label for the clear button, which only appears once something is typed. */
  clearAccessibilityLabel: string;
  /** Opens the keyboard on mount — for a screen whose only job is this field. */
  autoFocus?: boolean;
  className?: string;
}

/**
 * The app's filter-as-you-type field: a pill with a leading magnifier and a
 * clear button that appears only once there is something to clear.
 *
 * Deliberately not built on `Input`, which is the form control — a labelled
 * box with room underneath for an error. A filter box has no label, no
 * validation and no submit; it just narrows the list under it.
 */
export function SearchField({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  clearAccessibilityLabel,
  autoFocus = false,
  className,
}: SearchFieldProps) {
  const colors = useThemeColors();

  return (
    <View
      className={cn(
        'h-12 flex-row items-center gap-2 rounded-full bg-surfaceContainerHigh pl-4 pr-1.5',
        className,
      )}
    >
      <Search size={18} color={colors.onSurfaceVariant} />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        placeholder={placeholder}
        placeholderTextColor={colors.onSurfaceVariant}
        className="h-12 flex-1 p-0 text-base text-foreground"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel={accessibilityLabel}
      />

      {value.length > 0 ? (
        <IconButton
          icon={X}
          onPress={() => onChangeText('')}
          size={36}
          iconSize={18}
          accessibilityLabel={clearAccessibilityLabel}
        />
      ) : null}
    </View>
  );
}
