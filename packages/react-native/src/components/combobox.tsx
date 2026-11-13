import * as React from 'react';
import { FlatList, View, TextInput } from 'react-native';
import { BottomSheet } from './bottom-sheet.tsx';
import { Pressable } from './pressable.tsx';
import { Text } from './text.tsx';
import { ListItem } from './list-item.tsx';
import { LoadingIndicator } from './loading-indicator.tsx';
import type { SelectFieldProps } from './select-field.tsx';
import { useThemeColors } from '../provider.tsx';

export interface ComboboxProps<T extends string> extends Omit<
  SelectFieldProps<T>,
  'menuMaterial'
> {
  searchLabel: string;
  emptyLabel: string;
  loading?: boolean;
  loadingLabel?: string;
  /** Supply both query and onQueryChange for server-side search. Options are then not filtered locally. */
  query?: string;
  onQueryChange?: (query: string) => void;
}
/** Searchable single selection; the app owns requests, cancellation and errors. */
export function Combobox<T extends string>({
  value,
  onChange,
  options,
  accessibilityLabel,
  label,
  placeholder = '',
  hint,
  error,
  disabled,
  loading = false,
  loadingLabel,
  searchLabel,
  emptyLabel,
  query: controlledQuery,
  onQueryChange,
  style,
  className,
  ...material
}: ComboboxProps<T>) {
  const colors = useThemeColors();
  const [open, setOpen] = React.useState(false);
  const [localQuery, setQuery] = React.useState('');
  const query = controlledQuery ?? localQuery;
  const input = React.useRef<React.ComponentRef<typeof TextInput>>(null);
  React.useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
  const selected = options.find((option) => option.id === value);
  const filtered =
    controlledQuery !== undefined
      ? options
      : options.filter((option) =>
          option.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
        );
  return (
    <View className={className} style={[{ gap: 6 }, style]}>
      {label ? <Text variant="label">{label}</Text> : null}
      <Pressable
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={error ?? hint}
        accessibilityValue={{ text: selected?.label ?? value ?? placeholder }}
        accessibilityState={{ expanded: open, disabled }}
        onPress={() => {
          setQuery('');
          setOpen(true);
        }}
        style={{
          minHeight: 48,
          padding: 12,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: error ? colors.error : colors.outline,
          opacity: disabled ? 0.4 : 1,
        }}
      >
        <Text>{selected?.label ?? value ?? placeholder}</Text>
      </Pressable>
      {error ? (
        <Text accessibilityLiveRegion="polite" style={{ color: colors.error }}>
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption">{hint}</Text>
      ) : null}
      <BottomSheet
        keyboardAware
        {...material}
        visible={open && !disabled}
        onClose={() => setOpen(false)}
        onShow={() => input.current?.focus()}
      >
        <Text variant="heading">{accessibilityLabel}</Text>
        <TextInput
          ref={input}
          value={query}
          onChangeText={(next) => {
            setQuery(next);
            onQueryChange?.(next);
          }}
          accessibilityLabel={searchLabel}
          placeholder={searchLabel}
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            minHeight: 48,
            padding: 12,
            marginVertical: 8,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.outline,
            color: colors.onSurface,
          }}
        />
        <View style={{ height: 280, flexShrink: 1 }} accessibilityState={{ busy: loading }}>
          {loading ? (
            <View style={{ gap: 8 }}>
              <LoadingIndicator size={24} accessibilityLabel={loadingLabel ?? searchLabel} />
              <Text accessibilityLiveRegion="polite">{loadingLabel ?? searchLabel}</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(option) => option.id}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={<Text accessibilityLiveRegion="polite">{emptyLabel}</Text>}
              renderItem={({ item }) => (
                <ListItem
                  title={item.label}
                  selected={item.id === value}
                  disabled={item.disabled}
                  accessibilityLabel={item.label}
                  onPress={() => {
                    onChange(item.id);
                    setOpen(false);
                  }}
                />
              )}
            />
          )}
        </View>
      </BottomSheet>
    </View>
  );
}
