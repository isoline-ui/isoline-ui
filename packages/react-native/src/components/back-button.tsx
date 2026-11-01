import { BackIcon } from './back-icon.tsx';
import { HEADER_ICON_BUTTON } from './icon-button.tsx';
import { Pressable } from './pressable.tsx';
import { Text } from './text.tsx';
import { useLabels } from '../provider.tsx';
import { useRipple, useThemeColors } from '../provider.tsx';

export interface BackButtonProps {
  onPress: () => void;
  /** What the row leads back to, e.g. "Inbox", "Settings". Defaults to "Back". */
  label?: string;
}

/**
 * The `< Back` row every screen opens with.
 *
 * The arrow is drawn at the header icon size, so it matches the bare back
 * arrow of the screens that use a top bar instead (the reader, compose).
 */
export function BackButton({ onPress, label }: BackButtonProps) {
  const colors = useThemeColors();
  const ripple = useRipple();
  const labels = useLabels();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      android_ripple={{ color: ripple.onNeutral }}
      accessibilityRole="button"
      className="h-12 flex-row items-center gap-2 self-start rounded-full pl-2 pr-3"
    >
      <BackIcon size={HEADER_ICON_BUTTON.iconSize} color={colors.onSurfaceVariant} />
      <Text variant="labelLarge" className="text-muted-foreground">
        {label ?? labels.back}
      </Text>
    </Pressable>
  );
}
