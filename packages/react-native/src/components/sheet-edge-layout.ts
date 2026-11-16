import type { ViewStyle } from 'react-native';

/** Cover a panel lifted slightly above the window edge, without covering its padding. */
const EDGE_EXTENSION = 96;

export function sheetEdgeLayout(glass: boolean, backgroundColor: string) {
  const material: ViewStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: -EDGE_EXTENSION,
  };
  const extension: ViewStyle | undefined = glass
    ? undefined
    : {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: -EDGE_EXTENSION,
        height: EDGE_EXTENSION,
        backgroundColor,
      };
  return { material, extension };
}
