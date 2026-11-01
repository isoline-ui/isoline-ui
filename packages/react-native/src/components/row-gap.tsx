import { View } from 'react-native';

/**
 * The space a card list leaves between two rows.
 *
 * Every list that renders rows as separate rounded cards passes this as its
 * `ItemSeparatorComponent`, so the rhythm is one value rather than a number
 * repeated per screen. Taller cards that need to breathe more — the
 * Screener's — space themselves.
 */
export function RowGap() {
  return <View className="h-[3px]" />;
}
