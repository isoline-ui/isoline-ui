import * as React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { BackIcon } from './back-icon.tsx';
import { HEADER_ICON_BUTTON, IconButton } from './icon-button.tsx';
import { Text } from './text.tsx';
import {
  type MaterialOptions,
  useIsolinePlatform,
  useLabels,
  SurfaceGroup,
  useSurface,
  useIsolineTheme,
  useThemeColors,
} from '../provider.tsx';
import { cn } from '../utils.ts';

/**
 * The bar every screen below the tabs opens with: the back arrow 8 from the
 * edge, the screen's own buttons at the other end, and, when a screen wants
 * one, something small in between (a position, a step). One height, one
 * inset, so moving between screens moves nothing at the top. The status
 * bar's room is the screen's: it knows whether it draws under it.
 */
export interface TopBarProps extends MaterialOptions {
  onBack: () => void;
  backLabel?: string;
  center?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  /**
   * iOS only: the bar floats over the screen from its top edge, with the
   * content scrolling under it and fading out beneath the controls. The screen
   * then pads its content by `useTopBarInset()` instead of the status bar.
   */
  floating?: boolean;
}

/** The bar's height below the status bar. */
export const TOP_BAR_HEIGHT = 56;
/** Space between the bar's glass pieces, and how close they come before blending. */
const GLASS_GAP = 12;
const GLASS_BLEND = 8;
/** How far the scroll-edge fade reaches past the bar. */
const FADE = 20;
const CAPSULE = {
  minHeight: HEADER_ICON_BUTTON.size,
  borderRadius: HEADER_ICON_BUTTON.size / 2,
  paddingHorizontal: 16,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
} as const;

/**
 * Where a screen's content starts under a floating bar: below the status bar
 * and the bar on iOS. Elsewhere the bar takes its own room, so it is 0.
 */
export function useTopBarInset(floating = true) {
  const ios = useIsolinePlatform() === 'ios';
  const insets = useSafeAreaInsets();
  return ios && floating ? insets.top + TOP_BAR_HEIGHT : 0;
}

/** The scroll edge: the screen's ground, fading to clear below the bar. */
function EdgeFade({ color, height }: { color: string; height: number }) {
  const id = React.useId();
  const solid = (height - FADE * 2) / height;
  return (
    <Svg
      pointerEvents="none"
      width="100%"
      height={height}
      style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
    >
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.94} />
          <Stop offset={solid} stopColor={color} stopOpacity={0.8} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100%" height={height} fill={`url(#${id})`} />
    </Svg>
  );
}

export function TopBar({
  onBack,
  center,
  actions,
  backLabel,
  className,
  material = 'auto',
  glassStyle,
  tintColor,
  fallbackColor,
  interactive,
  floating = false,
}: TopBarProps) {
  const labels = useLabels();
  const ios = useIsolinePlatform() === 'ios';
  const Surface = useSurface();
  const colors = useThemeColors();
  const { tokens } = useIsolineTheme();
  // The screen's ground (`bg-background`), which is not a colour role.
  const ground = tokens['--background'] ? `hsl(${tokens['--background']})` : colors.surface;
  const insets = useSafeAreaInsets();
  // Liquid Glass belongs on the controls, not on a full-width band: a glass
  // bar under the status bar reads as a stray strip with a seam at its top.
  // On iOS the bar is transparent, the back button is its own glass disc and
  // the title and the actions each sit in a glass capsule.
  if (ios && material !== 'solid') {
    const glass = { material, glassStyle, tintColor, fallbackColor } as const;
    // One glass group, every piece a direct child of it: iOS melts glass
    // shapes into each other only inside a shared container. The gap is wider
    // than the blend distance, so at rest they stand apart; a pressed control
    // swells towards its neighbour and flows into it.
    const row = (
      <SurfaceGroup
        spacing={GLASS_BLEND}
        gap={GLASS_GAP}
        style={{
          minHeight: TOP_BAR_HEIGHT,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 8,
        }}
      >
        <IconButton
          {...HEADER_ICON_BUTTON}
          icon={BackIcon}
          onPress={onBack}
          accessibilityLabel={backLabel ?? labels.back}
          {...glass}
          interactive={interactive ?? true}
        />
        {/* Equal flexible room either side keeps the title centred. */}
        <View style={{ flex: 1 }} />
        {center ? (
          <Surface {...glass} style={[CAPSULE, { flexShrink: 1 }]}>
            {center}
          </Surface>
        ) : null}
        <View style={{ flex: 1 }} />
        {actions ? (
          <Surface
            {...glass}
            interactive={interactive ?? true}
            style={[CAPSULE, { paddingHorizontal: 0 }]}
          >
            {actions}
          </Surface>
        ) : (
          <View style={{ width: HEADER_ICON_BUTTON.size }} />
        )}
      </SurfaceGroup>
    );
    if (!floating) return <View className={className}>{row}</View>;
    return (
      <View
        className={className}
        pointerEvents="box-none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}
      >
        <EdgeFade color={ground} height={insets.top + TOP_BAR_HEIGHT + FADE} />
        <View pointerEvents="box-none" style={{ paddingTop: insets.top }}>
          {row}
        </View>
      </View>
    );
  }
  return (
    <Surface
      material={ios ? material : 'solid'}
      glassStyle={glassStyle}
      tintColor={tintColor}
      fallbackColor={fallbackColor}
      interactive={interactive}
      className={className}
      style={{
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
      }}
    >
      <IconButton
        {...HEADER_ICON_BUTTON}
        icon={BackIcon}
        onPress={onBack}
        accessibilityLabel={backLabel ?? labels.back}
      />
      <View className="flex-1 items-center px-2">{center}</View>
      {actions}
    </Surface>
  );
}

/**
 * A screen's name under its bar: the emphasized title, 16 from the edge, and
 * a line about it. The same on every screen, so a title is where the eye
 * expects it.
 */
export function ScreenTitle({
  title,
  caption,
  className,
}: {
  title: string;
  caption?: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={cn('gap-1 px-4', className)}>
      <Text variant="title">{title}</Text>
      {typeof caption === 'string' ? <Text variant="caption">{caption}</Text> : caption}
    </View>
  );
}
