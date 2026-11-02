import * as React from 'react';
import { AccessibilityInfo } from 'react-native';
import { isLiquidGlassAvailable, isGlassEffectAPIAvailable } from 'expo-glass-effect';
/** Fail closed until accessibility preferences are known; newer events win. */
export function useNativeGlassAvailable() {
  const [reduceTransparency, setReduceTransparency] = React.useState(true);
  React.useEffect(() => {
    let current = true;
    const sub = AccessibilityInfo.addEventListener('reduceTransparencyChanged', (value) => {
      current = false;
      setReduceTransparency(value);
    });
    void AccessibilityInfo.isReduceTransparencyEnabled().then(
      (value) => {
        if (current) setReduceTransparency(value);
      },
      () => {},
    );
    return () => {
      current = false;
      sub.remove();
    };
  }, []);
  return !reduceTransparency && isGlassEffectAPIAvailable() && isLiquidGlassAvailable();
}
