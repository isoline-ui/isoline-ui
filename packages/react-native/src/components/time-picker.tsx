import * as React from 'react';
import { ScrollView, View } from 'react-native';
import { BottomSheet } from './bottom-sheet.tsx';
import { Text } from './text.tsx';
import { Button } from './button.tsx';
import { IconButton } from './icon-button.tsx';
import { X } from './icons.tsx';
import { Pressable } from './pressable.tsx';
import { useThemeColors, useHaptics } from '../provider.tsx';
import { useRadioNavigation } from './radio-navigation.ts';
import { validTime } from '../calendar.ts';

export interface TimeOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface TimeChipsProps {
  value: string | null;
  onChange: (time: string) => void;
  options: TimeOption[];
  disabled?: boolean;
}
export function TimeChips({ value, onChange, options, disabled }: TimeChipsProps) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((option) => (
        <Button
          key={option.value}
          label={option.label}
          size="s"
          variant={value === option.value ? 'default' : 'tonal'}
          accessibilityState={{
            selected: value === option.value,
            disabled: disabled || option.disabled,
          }}
          disabled={disabled || option.disabled || !validTime(option.value)}
          onPress={() => onChange(option.value)}
        />
      ))}
    </View>
  );
}
export interface TimeGridProps {
  value: string | null;
  onChange: (time: string) => void;
  hourLabel: string;
  minuteLabel: string;
  minuteStep?: number;
  disabled?: boolean;
}
function TimeRadioRow({
  label,
  values,
  selected,
  choose,
  disabled,
}: {
  label: string;
  values: number[];
  selected: number | null;
  choose: (value: number) => void;
  disabled?: boolean;
}) {
  const colors = useThemeColors();
  const { selectionHaptic } = useHaptics();
  const pick = (number: number) => {
    if (number !== selected) selectionHaptic();
    choose(number);
  };
  const navigation = useRadioNavigation(
    values.map((value) => ({ id: String(value), disabled })),
    selected === null ? null : String(selected),
    (id) => pick(Number(id)),
  );
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ gap: 4 }}>
      <Text variant="caption">{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
        {values.map((number) => (
          <Pressable
            key={number}
            {...navigation(String(number))}
            accessibilityRole="radio"
            accessibilityLabel={`${label} ${String(number).padStart(2, '0')}`}
            accessibilityState={{
              checked: number === selected,
              disabled,
            }}
            disabled={disabled}
            onPress={() => pick(number)}
            style={{
              minWidth: 44,
              minHeight: 44,
              borderRadius: 22,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor:
                selected === number ? colors.primary : colors.surfaceContainerHigh,
              opacity: disabled ? 0.4 : 1,
            }}
          >
            <Text style={{ color: selected === number ? colors.onPrimary : colors.onSurface }}>
              {String(number).padStart(2, '0')}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
export function TimeGrid({
  value,
  onChange,
  hourLabel,
  minuteLabel,
  minuteStep = 15,
  disabled,
}: TimeGridProps) {
  const [hour, minute] = validTime(value ?? '') ? value!.split(':').map(Number) : [9, 0];
  const step =
    Number.isInteger(minuteStep) && minuteStep > 0 && minuteStep <= 60 ? minuteStep : 15;
  const format = (h: number, m: number) =>
    `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  const minutes = Array.from(
    new Set([...Array.from({ length: Math.ceil(60 / step) }, (_, i) => i * step), minute]),
  ).sort((a, b) => a - b);
  return (
    <View style={{ gap: 12 }}>
      <TimeRadioRow
        label={hourLabel}
        values={Array.from({ length: 24 }, (_, i) => i)}
        selected={validTime(value ?? '') ? hour : null}
        choose={(h) => onChange(format(h, minute))}
        disabled={disabled}
      />
      <TimeRadioRow
        label={minuteLabel}
        values={minutes}
        selected={validTime(value ?? '') ? minute : null}
        choose={(m) => onChange(format(hour, m))}
        disabled={disabled}
      />
    </View>
  );
}
export interface TimePickerSheetProps extends TimeGridProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  confirmLabel: string;
  clearLabel?: string;
  onClear?: () => void;
  presets?: TimeOption[];
  onConfirm?: (time: string) => void;
}
export function TimePickerSheet({
  visible,
  onClose,
  title,
  confirmLabel,
  clearLabel,
  onClear,
  presets = [],
  onConfirm,
  ...grid
}: TimePickerSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ gap: 12 }}
      >
        <Text variant="heading">{title}</Text>
        <TimeChips
          value={grid.value}
          onChange={grid.onChange}
          options={presets}
          disabled={grid.disabled}
        />
        <TimeGrid {...grid} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {onClear && clearLabel ? (
            <Button
              label={clearLabel}
              disabled={grid.disabled}
              size="s"
              variant="ghost"
              onPress={() => {
                onClear();
                onClose();
              }}
            />
          ) : null}
          <Button
            label={confirmLabel}
            size="s"
            disabled={grid.disabled || !validTime(grid.value ?? '')}
            onPress={() => {
              if (grid.value && validTime(grid.value)) {
                onConfirm?.(grid.value);
                onClose();
              }
            }}
          />
        </View>
      </ScrollView>
    </BottomSheet>
  );
}
export interface TimeFieldProps extends Omit<
  TimePickerSheetProps,
  'visible' | 'onClose' | 'title' | 'onChange' | 'onClear'
> {
  label: string;
  emptyLabel: string;
  onChange: (time: string | null) => void;
}
export function TimeField({ label, emptyLabel, onChange, ...props }: TimeFieldProps) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(props.value);
  React.useEffect(() => {
    if (props.disabled) setOpen(false);
  }, [props.disabled]);
  return (
    <View style={{ gap: 4 }}>
      <Text variant="caption">{label}</Text>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Button
            label={props.value ?? emptyLabel}
            accessibilityLabel={label}
            variant="tonal"
            size="s"
            disabled={props.disabled}
            onPress={() => {
              setDraft(props.value);
              setOpen(true);
            }}
          />
        </View>
        {props.value && props.clearLabel ? (
          <IconButton
            icon={X}
            accessibilityLabel={props.clearLabel}
            disabled={props.disabled}
            onPress={() => onChange(null)}
          />
        ) : null}
      </View>
      <TimePickerSheet
        {...props}
        value={draft}
        title={label}
        visible={open}
        onClose={() => setOpen(false)}
        onChange={setDraft}
        onConfirm={onChange}
        onClear={() => onChange(null)}
      />
    </View>
  );
}
