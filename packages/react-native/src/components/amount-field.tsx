import * as React from 'react';
import { View, TextInput } from 'react-native';
import { TextField, type TextFieldProps } from './text-field.tsx';
import { Text } from './text.tsx';
import { parseLocalizedAmount } from '../amount.ts';

export interface AmountFieldProps extends Omit<TextFieldProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (value: string) => void;
  onAmountChange?: (amount: number | null) => void;
  currency?: string | null;
  locale?: string;
}
/** Preserve the editing string, including incomplete decimals; report numeric units separately. */
export const AmountField: React.ForwardRefExoticComponent<
  AmountFieldProps & React.RefAttributes<React.ElementRef<typeof TextInput>>
> = React.forwardRef<React.ComponentRef<typeof TextInput>, AmountFieldProps>(
  function AmountField(
    { value, onChangeText, onAmountChange, currency, locale = 'en-US', ...props },
    ref,
  ) {
    let symbol = currency ?? '';
    if (currency) {
      try {
        symbol =
          new Intl.NumberFormat(locale, { style: 'currency', currency })
            .formatToParts(0)
            .find((part) => part.type === 'currency')?.value ?? currency;
      } catch {}
    }
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <TextField
            {...props}
            ref={ref}
            value={value}
            keyboardType="decimal-pad"
            onChangeText={(text) => {
              onChangeText(text);
              onAmountChange?.(parseLocalizedAmount(text, locale));
            }}
          />
        </View>
        {symbol ? <Text accessibilityLabel={currency ?? undefined}>{symbol}</Text> : null}
      </View>
    );
  },
);
