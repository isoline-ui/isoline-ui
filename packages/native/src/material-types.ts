import type { ViewProps } from 'react-native';
export interface MaterialSurfaceProps extends ViewProps {
  /** auto uses native glass on supported iOS; other platforms use a tonal surface. */
  material?: 'auto' | 'glass' | 'solid';
  fallbackColor?: string;
  tintColor?: string;
  glassStyle?: 'regular' | 'clear';
  /** Native glass interaction; does not add an onPress handler. */
  interactive?: boolean;
}
