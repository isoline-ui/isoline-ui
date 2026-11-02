import { View } from 'react-native';
import { Eye, EyeOff } from './icons.tsx';
import { Pressable } from './pressable.tsx';
import { useLabels, useRipple, useThemeColors } from '../provider.tsx';

/** Shared affordance for both input styles; credential policy remains caller-owned. */
export function PasswordVisibility({
  revealed,
  onPress,
}: {
  revealed: boolean;
  onPress: () => void;
}) {
  const labels = useLabels();
  const colors = useThemeColors();
  const ripple = useRipple();
  const Icon = revealed ? EyeOff : Eye;
  return (
    <View
      style={{ position: 'absolute', right: 4, top: 0, bottom: 0, justifyContent: 'center' }}
    >
      <Pressable
        onPress={onPress}
        android_ripple={{ color: ripple.onNeutral, borderless: true }}
        accessibilityRole="button"
        accessibilityLabel={revealed ? labels.hidePassword : labels.showPassword}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={20} color={colors.onSurfaceVariant} />
      </Pressable>
    </View>
  );
}
