import * as React from 'react';
import { View } from 'react-native';

import { Check, ChevronRight, type IconProps } from './icons.tsx';
import { Pressable } from './pressable.tsx';
import { RowGap } from './row-gap.tsx';
import { SelectField, type SelectOption } from './select-field.tsx';
import { Switch } from './switch.tsx';
import { Text } from './text.tsx';
import { useRipple, useThemeColors } from '../provider.tsx';
import { cn } from '../utils.ts';

/**
 * The pieces every settings screen is built from.
 *
 * Settings used to be one screen that spelled out each card, row, switch and
 * chevron inline, which is why the same twelve lines of markup appeared a
 * dozen times over and drifted apart as they were edited. Splitting settings
 * across several screens would have multiplied that, so the row shapes live
 * here instead and a screen only says what its settings *are*.
 */

export type SettingsIcon = React.ComponentType<IconProps>;

/**
 * Corner radii for one row of a connected group.
 *
 * M3 Expressive draws a settings group as separate cards that still read as
 * one object: the group's outer corners stay large, and every corner facing a
 * neighbour tightens to the small step.
 */
export function groupRounding(index: number, count: number): string {
  if (count === 1) return 'rounded-3xl';
  if (index === 0) return 'rounded-t-3xl rounded-b-lg';
  if (index === count - 1) return 'rounded-t-lg rounded-b-3xl';
  return 'rounded-lg';
}

export function SettingsSection({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      {title ? (
        <Text variant="label" className="px-4">
          {title}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

/**
 * A run of rows drawn as one connected card group.
 *
 * Takes the rows as children rather than as data so a screen can drop one on a
 * condition (`{Platform.OS === 'android' ? <Row/> : null}`) and still get the
 * rounding right — a falsy child is discarded here, before the corners are
 * worked out, so a hidden row never leaves a flattened corner behind.
 */
export function SettingsGroup({ children }: { children: React.ReactNode }) {
  const rows = React.Children.toArray(children).filter(React.isValidElement);

  return (
    <View className="mx-4">
      {rows.map((row, index) => (
        <React.Fragment key={row.key ?? index}>
          {index > 0 ? <RowGap /> : null}
          <View
            className={cn(
              'overflow-hidden bg-surfaceContainerLow',
              groupRounding(index, rows.length),
            )}
          >
            {row}
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

function RowLabel({
  icon: Icon,
  leading,
  label,
  description,
  destructive,
}: {
  icon?: SettingsIcon;
  leading?: React.ReactNode;
  label: string;
  description?: string;
  destructive?: boolean;
}) {
  const colors = useThemeColors();

  return (
    <View className={cn('flex-1 flex-row gap-3', description ? 'items-start' : 'items-center')}>
      {leading ? (
        <View
          className="h-[18px] w-[18px] items-center justify-center"
          style={description ? { marginTop: 2 } : undefined}
        >
          {leading}
        </View>
      ) : Icon ? (
        <Icon
          size={18}
          color={destructive ? colors.error : colors.onSurfaceVariant}
          style={description ? { marginTop: 2 } : undefined}
        />
      ) : null}
      <View className="flex-1">
        <Text className={cn('text-[15px] font-medium', destructive && 'text-destructive')}>
          {label}
        </Text>
        {description ? <Text variant="caption">{description}</Text> : null}
      </View>
    </View>
  );
}

export interface SettingsNavRowProps {
  icon?: SettingsIcon;
  /** Custom leading content in the icon's place — an account's color dot. */
  leading?: React.ReactNode;
  label: string;
  description?: string;
  /** The current choice, shown at the row's trailing edge. */
  value?: string;
  onPress: () => void;
  accessibilityLabel?: string;
  /** For a row that removes something: red label, and no chevron to follow. */
  destructive?: boolean;
}

/** A row that opens something else — another screen, or a picker sheet. */
export function SettingsNavRow({
  icon,
  leading,
  label,
  description,
  value,
  onPress,
  accessibilityLabel,
  destructive,
}: SettingsNavRowProps) {
  const colors = useThemeColors();
  const ripple = useRipple();

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: ripple.onNeutral }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      className="flex-row items-center gap-3 px-4 py-3.5"
    >
      <RowLabel
        icon={icon}
        leading={leading}
        label={label}
        description={description}
        destructive={destructive}
      />
      {value ? (
        <Text variant="muted" numberOfLines={1} className="max-w-[45%]">
          {value}
        </Text>
      ) : null}
      {destructive ? null : <ChevronRight size={18} color={colors.onSurfaceVariant} />}
    </Pressable>
  );
}

export interface SettingsChoiceRowProps {
  /** Custom leading content — a calendar's color dot. */
  leading?: React.ReactNode;
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

/**
 * One option of a choice spelled out as rows rather than a menu, for options
 * that need a second line to tell apart: two calendars both called "Personal".
 */
export function SettingsChoiceRow({
  leading,
  label,
  description,
  selected,
  onPress,
  accessibilityLabel,
}: SettingsChoiceRowProps) {
  const colors = useThemeColors();
  const ripple = useRipple();

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: ripple.onNeutral }}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={accessibilityLabel ?? label}
      className="flex-row items-center gap-3 px-4 py-3.5"
    >
      <RowLabel leading={leading} label={label} description={description} />
      <View className="h-[18px] w-[18px]">
        {selected ? <Check size={18} color={colors.primary} /> : null}
      </View>
    </Pressable>
  );
}

export interface SettingsSwitchRowProps {
  icon?: SettingsIcon;
  /** Custom leading content in the icon's place — a calendar's color dot. */
  leading?: React.ReactNode;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export function SettingsSwitchRow({
  icon,
  leading,
  label,
  description,
  value,
  onValueChange,
  disabled,
  accessibilityLabel,
}: SettingsSwitchRowProps) {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3.5">
      <RowLabel icon={icon} leading={leading} label={label} description={description} />
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel ?? label}
      />
    </View>
  );
}

export interface SettingsSelectRowProps<T extends string> {
  icon?: SettingsIcon;
  label: string;
  description?: string;
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}

export function SettingsSelectRow<T extends string>({
  icon,
  label,
  description,
  value,
  options,
  onChange,
  accessibilityLabel,
}: SettingsSelectRowProps<T>) {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3.5">
      <RowLabel icon={icon} label={label} description={description} />
      <SelectField
        value={value}
        options={options}
        onChange={onChange}
        accessibilityLabel={accessibilityLabel ?? label}
      />
    </View>
  );
}

/**
 * A card holding something that is not a row — the theme picker's button
 * group, the accent swatches. Matches a group of one so custom content sits on
 * the same surface at the same inset as the rows above and below it.
 */
export function SettingsCard({ children }: { children: React.ReactNode }) {
  return <View className="mx-4 gap-4 rounded-3xl bg-surfaceContainerLow p-4">{children}</View>;
}
