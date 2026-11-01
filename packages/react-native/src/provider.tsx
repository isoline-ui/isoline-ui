import * as React from 'react';
import { Platform, View, type ViewProps, type StyleProp, type ViewStyle } from 'react-native';
import { vars } from 'nativewind';

import {
  resolveThemeColors,
  rippleColors,
  elevation,
  type IsolineTheme,
  type ThemeColors,
  type RippleColors,
} from './theme.ts';

import { resolvePlatform, type IsolinePlatform } from './platform.ts';
export type { IsolinePlatform } from './platform.ts';
export { elevation };
export interface IsolineSurfaceProps extends ViewProps {
  material?: 'auto' | 'glass' | 'solid';
  interactive?: boolean;
}
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
  platform: IsolinePlatform;
  surfaceComponent?: React.ComponentType<IsolineSurfaceProps>;
  theme: IsolineTheme;
  colors: ThemeColors;
  ripple: RippleColors;
  labels: IsolineLabels;
  haptics: IsolineHaptics;
}

const Context = React.createContext<UIContext | null>(null);
export interface IsolineProviderProps {
  /** Browser design preview; native devices always follow their OS. */
  platform?: IsolinePlatform;
  /** Supply MaterialSurface from @isoline-ui/native for native/browser glass. */
  surfaceComponent?: React.ComponentType<IsolineSurfaceProps>;
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
  platform,
  surfaceComponent,
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
      platform: resolvePlatform(Platform.OS, platform, parent?.platform),
      surfaceComponent: surfaceComponent ?? parent?.surfaceComponent,
      colors: resolveThemeColors(theme),
      ripple: rippleColors(theme.scheme),
      labels: { close: 'Close', ...parent?.labels, ...labels },
      haptics: { ...noHaptics, ...parent?.haptics, ...haptics },
    }),
    [theme, platform, surfaceComponent, labels, haptics, parent],
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

export function useIsolinePlatform() {
  return useUI().platform;
}
/** Surface adapter keeps optional Expo/native dependencies out of the UI package. */
export function Surface({
  material = 'auto',
  interactive,
  style,
  ...props
}: IsolineSurfaceProps) {
  const { surfaceComponent: Component, colors } = useUI();
  if (Component)
    return <Component material={material} interactive={interactive} style={style} {...props} />;
  return <View {...props} style={[{ backgroundColor: colors.surfaceContainer }, style]} />;
}

/** Reapply CSS variables inside web modal portals, outside the provider DOM node. */
export function ThemeScope({ style, ...props }: ViewProps) {
  const { theme } = useUI();
  return <View {...props} style={[vars(theme.tokens), style]} />;
}
