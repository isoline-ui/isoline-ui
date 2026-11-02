import { Platform, View, Switch as RNSwitch } from 'react-native';
import { Pressable } from './pressable.tsx';

import { useIsolinePlatform, useThemeColors } from '../provider.tsx';

export interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
}

/** Native switch geometry on each OS, with the app's shared colour roles. */
export function Switch({ value, onValueChange, disabled, accessibilityLabel }: SwitchProps) {
  const colors = useThemeColors();
  const ios = useIsolinePlatform() === 'ios';

  if (Platform.OS === 'web')
    return (
      <Pressable
        accessibilityRole="switch"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ checked: value, disabled }}
        disabled={disabled}
        onPress={() => onValueChange(!value)}
        style={{
          minHeight: 44,
          minWidth: ios ? 51 : 52,
          justifyContent: 'center',
          opacity: disabled ? 0.4 : 1,
        }}
      >
        <View
          pointerEvents="none"
          style={{
            width: ios ? 51 : 52,
            height: ios ? 31 : 32,
            padding: ios ? 3 : 2,
            borderRadius: 16,
            borderWidth: ios ? 0 : 2,
            borderColor: value ? colors.primary : colors.outline,
            backgroundColor: value ? colors.primary : colors.outlineVariant,
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              width: ios ? 25 : 24,
              height: ios ? 25 : 24,
              borderRadius: 14,
              backgroundColor: ios
                ? '#fff'
                : value
                  ? colors.onPrimary
                  : colors.onSurfaceVariant,
              alignSelf: value ? 'flex-end' : 'flex-start',
            }}
          />
        </View>
      </Pressable>
    );

  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: colors.outlineVariant,
        true: ios ? colors.primary : colors.primaryContainer,
      }}
      thumbColor={ios ? undefined : value ? colors.primary : colors.onSurfaceVariant}
      ios_backgroundColor={colors.outlineVariant}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
