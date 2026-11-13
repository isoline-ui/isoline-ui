import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { Pressable } from './pressable.tsx';
import { Text } from './text.tsx';
import { useThemeColors, useHaptics } from '../provider.tsx';
import { useRadioNavigation } from './radio-navigation.ts';

export interface RadioItemProps extends Omit<ViewProps, 'children'> {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}
export interface RadioGroupProps extends ViewProps {
  value: string | null;
  onValueChange: (value: string) => void;
  accessibilityLabel: string;
  disabled?: boolean;
  children: React.ReactNode;
}
type RadioContextValue = {
  value: string | null;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  navigation: ReturnType<typeof useRadioNavigation>;
};
const RadioContext = React.createContext<RadioContextValue | null>(null);
/** Place uniquely valued RadioItem children directly inside this controlled group. */
export function RadioGroup({
  value,
  onValueChange,
  disabled,
  children,
  style,
  ...props
}: RadioGroupProps) {
  const { selectionHaptic } = useHaptics();
  const choose = (next: string) => {
    if (value !== next) selectionHaptic();
    onValueChange(next);
  };
  const items = React.Children.toArray(children)
    .filter(
      (child): child is React.ReactElement<RadioItemProps> =>
        React.isValidElement(child) && child.type === RadioItem,
    )
    .map((child) => ({ id: child.props.value, disabled: disabled || child.props.disabled }));
  const navigation = useRadioNavigation(items, value, choose);
  return (
    <RadioContext.Provider value={{ value, onValueChange: choose, disabled, navigation }}>
      <View {...props} accessibilityRole="radiogroup" style={[{ gap: 8 }, style]}>
        {children}
      </View>
    </RadioContext.Provider>
  );
}
export function RadioItem({
  value,
  label,
  description,
  disabled: itemDisabled,
  style,
  ...props
}: RadioItemProps) {
  const context = React.useContext(RadioContext);
  if (!context) throw new Error('RadioItem must be inside RadioGroup');
  const colors = useThemeColors();
  const disabled = context.disabled || itemDisabled;
  const checked = context.value === value;
  return (
    <Pressable
      {...props}
      {...context.navigation(value)}
      accessibilityRole="radio"
      accessibilityLabel={[label, description].filter(Boolean).join(', ')}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => context.onValueChange(value)}
      style={[
        {
          minHeight: 44,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: checked ? colors.primary : colors.outline,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {checked ? (
          <View
            style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary }}
          />
        ) : null}
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text>{label}</Text>
        {description ? <Text variant="caption">{description}</Text> : null}
      </View>
    </Pressable>
  );
}
