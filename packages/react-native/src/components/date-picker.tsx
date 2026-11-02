import * as React from 'react';
import { Platform, View, ScrollView } from 'react-native';
import { Pressable } from './pressable.tsx';
import { Button } from './button.tsx';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { IconButton } from './icon-button.tsx';
import { X } from './icons.tsx';
import { Text } from './text.tsx';
import { BottomSheet } from './bottom-sheet.tsx';
import { useThemeColors, type MaterialOptions } from '../provider.tsx';
import { addDays, addMonths, monthDays, validDate, formatCalendarDate } from '../calendar.ts';

export interface CalendarLabels {
  previousMonth: string;
  nextMonth: string;
}
export interface CalendarMark {
  label: string;
  count?: number;
  color?: string;
}
export interface MonthCalendarProps {
  value: string | null;
  onChange: (date: string) => void;
  today: string;
  locale?: string;
  month?: string;
  onMonthChange?: (month: string) => void;
  firstDayOfWeek?: number;
  minDate?: string;
  maxDate?: string;
  disabledDates?: readonly string[];
  marks?: Record<string, CalendarMark>;
  labels: CalendarLabels;
  range?: { start: string; end: string } | null;
  renderDayAccessory?: (date: string, selected: boolean) => React.ReactNode;
}
/** Date arithmetic and marks are independent from agenda repositories or app clocks. */
export function MonthCalendar({
  value,
  onChange,
  today,
  locale,
  month: controlledMonth,
  onMonthChange,
  firstDayOfWeek = 1,
  minDate,
  maxDate,
  disabledDates = [],
  marks = {},
  labels,
  range,
  renderDayAccessory,
}: MonthCalendarProps) {
  const colors = useThemeColors();
  const initial = validDate(value ?? '') ? value! : today;
  const [localMonth, setMonth] = React.useState(initial.slice(0, 7));
  const month = controlledMonth ?? localMonth;
  const days = monthDays(month, firstDayOfWeek);
  const refs = React.useRef<Record<string, React.ComponentRef<typeof Pressable> | null>>({});
  const [pendingFocus, setPendingFocus] = React.useState<string | null>(null);
  const disabled = (date: string) =>
    Boolean(
      (minDate && date < minDate) ||
      (maxDate && date > maxDate) ||
      disabledDates.includes(date),
    );
  const navigate = (next: string) => {
    setMonth(next);
    onMonthChange?.(next);
  };
  React.useEffect(() => {
    if (pendingFocus && refs.current[pendingFocus]) {
      refs.current[pendingFocus]?.focus();
      setPendingFocus(null);
    }
  }, [month, pendingFocus]);
  const focusDate =
    days.find((date) => date === value && !disabled(date)) ??
    days.find((date) => date === today && !disabled(date)) ??
    days.find((date) => date.startsWith(month) && !disabled(date));
  const content = (
    <View style={{ gap: 8 }}>
      <View
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Button
          variant="ghost"
          size="s"
          label="‹"
          accessibilityLabel={labels.previousMonth}
          disabled={Boolean(minDate && addMonths(month, -1) < minDate.slice(0, 7))}
          onPress={() => navigate(addMonths(month, -1))}
        />
        <Text
          accessibilityRole="header"
          accessibilityLiveRegion="polite"
          style={{ fontWeight: '600' }}
        >
          {formatCalendarDate(`${month}-01`, locale, { month: 'long', year: 'numeric' })}
        </Text>
        <Button
          variant="ghost"
          size="s"
          label="›"
          accessibilityLabel={labels.nextMonth}
          disabled={Boolean(maxDate && addMonths(month, 1) > maxDate.slice(0, 7))}
          onPress={() => navigate(addMonths(month, 1))}
        />
      </View>
      <View style={{ flexDirection: 'row' }}>
        {days.slice(0, 7).map((date) => (
          <Text
            key={date}
            accessible={false}
            style={{ width: `${100 / 7}%`, textAlign: 'center', fontSize: 12 }}
          >
            {formatCalendarDate(date, locale, { weekday: 'short' })}
          </Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {days.map((date) => {
          const selected = date === value || date === range?.start || date === range?.end,
            unavailable = disabled(date),
            mark = marks[date];
          return (
            <Pressable
              key={date}
              ref={(node) => {
                refs.current[date] = node;
              }}
              tabIndex={date === focusDate ? 0 : -1}
              accessibilityRole="button"
              accessibilityLabel={`${formatCalendarDate(date, locale, { dateStyle: 'full' })}${mark ? `, ${mark.label}` : ''}`}
              accessibilityState={{ selected, disabled: unavailable }}
              disabled={unavailable}
              onPress={() => onChange(date)}
              {...(Platform.OS === 'web'
                ? {
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
                          'ArrowUp',
                          'ArrowDown',
                          'Home',
                          'End',
                          'PageUp',
                          'PageDown',
                        ].includes(key)
                      )
                        return;
                      event.preventDefault();
                      const weekday = days.indexOf(date) % 7;
                      const jump =
                        key === 'ArrowLeft'
                          ? -1
                          : key === 'ArrowRight'
                            ? 1
                            : key === 'ArrowUp'
                              ? -7
                              : key === 'ArrowDown'
                                ? 7
                                : key === 'Home'
                                  ? -weekday
                                  : key === 'End'
                                    ? 6 - weekday
                                    : key === 'PageUp'
                                      ? -28
                                      : 28;
                      let next = addDays(date, jump);
                      for (let count = 0; count < 366 && disabled(next); count++)
                        next = addDays(next, jump < 0 ? -1 : 1);
                      if (
                        disabled(next) ||
                        (minDate && next < minDate) ||
                        (maxDate && next > maxDate)
                      )
                        return;
                      if (!days.includes(next)) navigate(next.slice(0, 7));
                      setPendingFocus(next);
                    },
                  }
                : {})}
              style={{
                width: `${100 / 7}%`,
                minHeight: 44,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                borderRadius: 22,
                backgroundColor: selected
                  ? colors.primary
                  : range && date > range.start && date < range.end
                    ? colors.secondaryContainer
                    : 'transparent',
                borderWidth: date === today ? 1 : 0,
                borderColor: colors.primary,
                opacity: unavailable ? 0.3 : date.startsWith(month) ? 1 : 0.5,
              }}
            >
              <Text style={{ color: selected ? colors.onPrimary : colors.onSurface }}>
                {Number(date.slice(8))}
              </Text>
              {renderDayAccessory ? (
                renderDayAccessory(date, selected)
              ) : mark ? (
                <View
                  style={{
                    height: 4,
                    width: Math.min(20, Math.max(1, mark.count ?? 1) * 4),
                    backgroundColor: selected
                      ? colors.onPrimary
                      : (mark.color ?? colors.primary),
                    borderRadius: 2,
                  }}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
  const turn = (delta: number) => {
    const next = addMonths(month, delta);
    if ((minDate && next < minDate.slice(0, 7)) || (maxDate && next > maxDate.slice(0, 7)))
      return;
    navigate(next);
  };
  const swipe = Gesture.Race(
    Gesture.Fling()
      .direction(1)
      .runOnJS(true)
      .onEnd(() => turn(-1)),
    Gesture.Fling()
      .direction(2)
      .runOnJS(true)
      .onEnd(() => turn(1)),
  );
  return Platform.OS === 'web' ? (
    content
  ) : (
    <GestureDetector gesture={swipe}>{content}</GestureDetector>
  );
}
export interface WeekStripProps extends Pick<
  MonthCalendarProps,
  'value' | 'onChange' | 'today' | 'locale' | 'marks' | 'minDate' | 'maxDate'
> {
  startDate: string;
  renderDayAccessory?: MonthCalendarProps['renderDayAccessory'];
}
export function WeekStrip({
  startDate,
  value,
  onChange,
  today,
  locale,
  marks = {},
  minDate,
  maxDate,
  renderDayAccessory,
}: WeekStripProps) {
  const colors = useThemeColors();
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {Array.from({ length: 7 }, (_, i) => addDays(startDate, i)).map((date) => (
        <Pressable
          key={date}
          accessibilityRole="button"
          accessibilityLabel={`${formatCalendarDate(date, locale, { dateStyle: 'full' })}${marks[date] ? `, ${marks[date].label}` : ''}`}
          accessibilityState={{
            selected: date === value,
            disabled: Boolean((minDate && date < minDate) || (maxDate && date > maxDate)),
          }}
          disabled={Boolean((minDate && date < minDate) || (maxDate && date > maxDate))}
          onPress={() => onChange(date)}
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: 56,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: date === value ? colors.secondaryContainer : 'transparent',
            borderColor: colors.outline,
            borderWidth: date === today ? 1 : 0,
          }}
        >
          <Text style={{ fontSize: 11 }}>
            {formatCalendarDate(date, locale, { weekday: 'short' })}
          </Text>
          <Text>{Number(date.slice(8))}</Text>
          {renderDayAccessory ? (
            renderDayAccessory(date, date === value)
          ) : marks[date] ? (
            <View
              style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary }}
            />
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}
export interface QuickDateOption {
  value: string;
  label: string;
  disabled?: boolean;
}
export interface DayPickerProps extends MonthCalendarProps, MaterialOptions {
  quickDates?: QuickDateOption[];
  onClear?: () => void;
  clearLabel?: string;
}
export function DayPicker({
  quickDates = [],
  onClear,
  clearLabel,
  ...calendar
}: DayPickerProps) {
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {quickDates.map((option) => (
          <Button
            key={option.value}
            size="s"
            variant={calendar.value === option.value ? 'default' : 'tonal'}
            label={option.label}
            disabled={
              option.disabled ||
              !validDate(option.value) ||
              Boolean(
                (calendar.minDate && option.value < calendar.minDate) ||
                (calendar.maxDate && option.value > calendar.maxDate) ||
                calendar.disabledDates?.includes(option.value),
              )
            }
            onPress={() => calendar.onChange(option.value)}
          />
        ))}
      </View>
      <MonthCalendar {...calendar} />
      {onClear && clearLabel ? (
        <Button variant="ghost" size="s" label={clearLabel} onPress={onClear} />
      ) : null}
    </View>
  );
}
export interface DatePickerSheetProps extends MonthCalendarProps, MaterialOptions {
  visible: boolean;
  onClose: () => void;
  title: string;
  quickDates?: QuickDateOption[];
  onClear?: () => void;
  clearLabel?: string;
}
export function DatePickerSheet({
  visible,
  onClose,
  title,
  quickDates = [],
  onClear,
  clearLabel,
  material = 'solid',
  glassStyle,
  tintColor,
  fallbackColor,
  interactive,
  ...calendar
}: DatePickerSheetProps) {
  const select = (date: string) => {
    calendar.onChange(date);
    onClose();
  };
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      material={material}
      glassStyle={glassStyle}
      tintColor={tintColor}
      fallbackColor={fallbackColor}
      interactive={interactive}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={{ flexGrow: 0 }}
        contentContainerStyle={{ gap: 12 }}
      >
        <Text variant="heading">{title}</Text>
        <DayPicker
          {...calendar}
          onChange={select}
          quickDates={quickDates}
          clearLabel={clearLabel}
          onClear={
            onClear
              ? () => {
                  onClear();
                  onClose();
                }
              : undefined
          }
        />
      </ScrollView>
    </BottomSheet>
  );
}
export interface DateFieldProps extends Omit<
  DatePickerSheetProps,
  'visible' | 'onClose' | 'title' | 'onChange' | 'onClear'
> {
  label: string;
  emptyLabel: string;
  onChange: (date: string | null) => void;
  disabled?: boolean;
}
export function DateField({ label, emptyLabel, onChange, disabled, ...props }: DateFieldProps) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  return (
    <View style={{ gap: 4 }}>
      <Text variant="caption">{label}</Text>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Button
            variant="tonal"
            size="s"
            accessibilityLabel={label}
            disabled={disabled}
            label={props.value ? formatCalendarDate(props.value, props.locale) : emptyLabel}
            onPress={() => setOpen(true)}
          />
        </View>
        {props.value && props.clearLabel ? (
          <IconButton
            icon={X}
            accessibilityLabel={props.clearLabel}
            disabled={disabled}
            onPress={() => onChange(null)}
          />
        ) : null}
      </View>
      <DatePickerSheet
        {...props}
        title={label}
        visible={open}
        onClose={() => setOpen(false)}
        onChange={onChange}
        onClear={() => onChange(null)}
      />
    </View>
  );
}
