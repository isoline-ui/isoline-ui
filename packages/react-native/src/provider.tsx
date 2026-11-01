import * as React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { vars } from 'nativewind';

import {
  resolveThemeColors,
  rippleColors,
  elevation,
  type IsolineTheme,
  type ThemeColors,
  type RippleColors,
} from './theme.ts';

export { elevation };
export type { ThemeColors, RippleColors };
export interface IsolineLabels {
  close: string;
}
export interface IsolineHaptics {
  selectionHaptic: () => void;
  impactHaptic: (style: 'light' | 'medium') => void;
}

const noHaptics: IsolineHaptics = { selectionHaptic: () => {}, impactHaptic: () => {} };
interface UIContext {
  theme: IsolineTheme;
  colors: ThemeColors;
  ripple: RippleColors;
  labels: IsolineLabels;
  haptics: IsolineHaptics;
}

const Context = React.createContext<UIContext | null>(null);
export interface IsolineProviderProps {
  theme: IsolineTheme;
  labels?: Partial<IsolineLabels>;
  haptics?: Partial<IsolineHaptics>;
  children: React.ReactNode;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Supplies component contracts and CSS roles together. Preferences, translation,
 * font loading and native haptic implementations remain in the consuming app.
 * A nested provider inherits labels/haptics; its theme is explicit.
 */
export function IsolineProvider({
  theme,
  labels,
  haptics,
  children,
  className,
  style,
}: IsolineProviderProps) {
  const parent = React.useContext(Context);
  const value = React.useMemo<UIContext>(
    () => ({
      theme,
      colors: resolveThemeColors(theme),
      ripple: rippleColors(theme.scheme),
      labels: { close: 'Close', ...parent?.labels, ...labels },
      haptics: { ...noHaptics, ...parent?.haptics, ...haptics },
    }),
    [theme, labels, haptics, parent],
  );

  return (
    <Context.Provider value={value}>
      <View className={className} style={[{ flex: 1 }, vars(theme.tokens), style]}>
        {children}
      </View>
    </Context.Provider>
  );
}

function useUI() {
  const value = React.useContext(Context);
  if (!value) throw new Error('Isoline UI components must be inside IsolineProvider');
  return value;
}
export function useIsolineTheme() {
  return useUI().theme;
}
export function useThemeColors() {
  return useUI().colors;
}
export function useRipple() {
  return useUI().ripple;
}
export function useLabels() {
  return useUI().labels;
}
export function useHaptics() {
  return useUI().haptics;
}
