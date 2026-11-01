import { Platform, Switch as RNSwitch } from 'react-native';

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

  return (
    <RNSwitch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: colors.outlineVariant,
        true: ios ? colors.primary : colors.primaryContainer,
      }}
      thumbColor={
        ios
          ? Platform.OS === 'web'
            ? '#fff'
            : undefined
          : value
            ? colors.primary
            : colors.onSurfaceVariant
      }
      ios_backgroundColor={colors.outlineVariant}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
