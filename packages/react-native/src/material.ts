/** Shared across core controls and the optional native material adapter. */
export interface MaterialOptions {
  material?: 'auto' | 'glass' | 'solid';
  glassStyle?: 'regular' | 'clear';
  tintColor?: string;
  fallbackColor?: string;
  /** Enables material interaction, not an action handler. */
  interactive?: boolean;
}
/** Surface requests are platform-aware; explicit solid always wins. */
export function usesPlatformMaterial(
  platform: string,
  material: MaterialOptions['material'] = 'solid',
) {
  return platform === 'ios' && material !== 'solid';
}
