import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';
import { parseSystemPalette, type SystemPalette } from './dynamic-color.ts';

interface SystemColorsModule {
  getPalette(): unknown;
}
/** Missing native code and unsupported Android versions use the supplied app theme. */
export function getSystemPalette(): SystemPalette | null {
  if (Platform.OS !== 'android') return null;
  try {
    const module = requireOptionalNativeModule<SystemColorsModule>('IsolineSystemColors');
    return parseSystemPalette(module?.getPalette());
  } catch {
    return null;
  }
}
