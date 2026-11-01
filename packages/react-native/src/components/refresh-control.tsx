import {
  RefreshControl as RNRefreshControl,
  type RefreshControlProps as RNRefreshControlProps,
} from 'react-native';

import { useThemeColors } from '../provider.tsx';

export type RefreshControlProps = RNRefreshControlProps;

/**
 * RN's `RefreshControl`, pre-colored with the app's role tokens for the
 * current scheme.
 *
 * Every other prop is forwarded, and that is load-bearing rather than
 * politeness. On Android a `ScrollView` does not render its `refreshControl`
 * beside the list: it clones the element with the scroll view itself as
 * `children` and the list's layout style, and renders that clone as the
 * outer view. A wrapper that accepts only `refreshing` and `onRefresh` drops
 * both — which takes the entire list, empty state and footer included, out of
 * the tree and leaves a blank screen under the header. Keep this a
 * pass-through; anything it swallows, the list loses.
 */
export function RefreshControl({
  tintColor,
  colors,
  progressBackgroundColor,
  ...rest
}: RefreshControlProps) {
  const theme = useThemeColors();

  return (
    <RNRefreshControl
      {...rest}
      tintColor={tintColor ?? theme.onSurfaceVariant}
      colors={colors ?? [theme.primary]}
      progressBackgroundColor={progressBackgroundColor ?? theme.surfaceContainerHigh}
    />
  );
}
