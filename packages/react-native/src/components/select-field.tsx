import * as React from 'react';
import { Modal } from 'react-native';

import { Check, ChevronDown } from './icons.tsx';
import { Pressable } from './pressable.tsx';
import { Text } from './text.tsx';
import { elevation, useRipple, useThemeColors } from '../provider.tsx';
import { ThemeScope, useIsolinePlatform, useLabels } from '../provider.tsx';
import { cn } from '../utils.ts';

/**
 * A settings row's value picker: a pill showing the current choice that opens
 * a short list of the alternatives.
 *
 * Exists for a setting with more options than a `ButtonGroup` row can hold
 * without becoming a squeeze — a handful of named values, one of which is
 * always selected, is a poor fit for a `Switch` and too many labels for a
 * segmented control to stay legible on a phone width.
 */

export interface SelectOption<T extends string> {
  id: T;
  label: string;
}

export interface SelectFieldProps<T extends string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  accessibilityLabel: string;
}

export function SelectField<T extends string>({
  value,
  options,
  onChange,
  accessibilityLabel,
}: SelectFieldProps<T>) {
  const ios = useIsolinePlatform() === 'ios';
  const labels = useLabels();
  const [open, setOpen] = React.useState(false);
  const colors = useThemeColors();
  const ripple = useRipple();
  const selected = options.find((option) => option.id === value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        android_ripple={{ color: ripple.onNeutral }}
        style={
          ios
            ? {
                borderWidth: 0,
                borderRadius: 10,
                backgroundColor: colors.surfaceContainerHigh,
                minHeight: 44,
              }
            : { minHeight: 44 }
        }
        accessibilityState={{ expanded: open }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        className="flex-row items-center gap-1 rounded-full border border-outline px-3 py-2"
      >
        <Text className="text-sm font-medium">{selected?.label ?? value}</Text>
        <ChevronDown size={16} color={colors.onSurfaceVariant} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <ThemeScope style={{ flex: 1 }}>
          <Pressable
            className="flex-1 items-center justify-center bg-black/40 px-8"
            onPress={() => setOpen(false)}
            accessibilityLabel={labels.close}
          >
            {/* Swallows the close-on-backdrop press so tapping the menu itself does not dismiss it. */}
            <Pressable
              onPress={() => undefined}
              className="w-full max-w-xs overflow-hidden rounded-3xl bg-surfaceContainerHigh py-2"
              style={{ elevation: ios ? 0 : elevation.level3, borderRadius: ios ? 14 : 24 }}
            >
              {options.map((option) => {
                const isSelected = option.id === value;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => {
                      setOpen(false);
                      onChange(option.id);
                    }}
                    android_ripple={{ color: ripple.onNeutral }}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected: isSelected }}
                    className="flex-row items-center justify-between gap-3 px-5 py-3.5"
                  >
                    <Text
                      className={cn(
                        'text-[15px]',
                        isSelected ? 'font-semibold text-primary' : 'text-onSurface',
                      )}
                    >
                      {option.label}
                    </Text>
                    {isSelected ? <Check size={16} color={colors.primary} /> : null}
                  </Pressable>
                );
              })}
            </Pressable>
          </Pressable>
        </ThemeScope>
      </Modal>
    </>
  );
}
