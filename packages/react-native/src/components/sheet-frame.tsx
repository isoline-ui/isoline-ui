import * as React from 'react';
import {
  ScrollView,
  View,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import { Text } from './text.tsx';
import { Pressable } from './pressable.tsx';
import type { Sheet, SheetScrollContextValue } from './sheet-transition.ts';
import {
  Surface,
  type MaterialOptions,
  useLabels,
  useIsolineTheme,
  useIsolinePlatform,
} from '../provider.tsx';
import { elevation, useThemeColors } from '../provider.tsx';

/** M3's scrim: black at 32%, enough to set the sheet apart, not to hide the photo under it. */
const SCRIM = 'rgba(0, 0, 0, 0.32)';
/** M3's widest bottom sheet; on a tablet or in landscape it stands centred. */
const MAX_WIDTH = 640;

const SheetScrollContext = React.createContext<SheetScrollContextValue | null>(null);

/**
 * What a sheet shows while it leaves: the content it had when it was last
 * visible. A sheet's content is often built from the very thing closing it
 * clears (the pin that was tapped, the spec being edited), and without this
 * the panel would empty out and collapse on its way down.
 */
function useKeptChildren(visible: boolean, children: React.ReactNode) {
  const [kept, setKept] = React.useState(children);
  if (visible && kept !== children) setKept(children);
  return visible ? children : kept;
}

/**
 * The scrim, the panel and its handle — everything `BottomSheet` and
 * `PanelSheet` share, so the two look and move as one kind of sheet. Each
 * places it differently: one in a `Modal`, one inside the screen, lifted by
 * the keyboard (`lift`).
 */
export function SheetFrame({
  sheet,
  dismissible = true,
  visible,
  onClose: onCloseProp,
  lift,
  panelStyle,
  children,
  dragFrom,
  material = 'solid',
  glassStyle,
  tintColor,
  fallbackColor,
  interactive = false,
}: {
  dismissible?: boolean;
  dragFrom?: 'handle' | 'panel';
  sheet: Sheet;
  visible: boolean;
  onClose: () => void;
  lift?: StyleProp<AnimatedStyle<ViewStyle>>;
  panelStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
  children: React.ReactNode;
} & MaterialOptions) {
  const onClose = () => {
    if (dismissible) onCloseProp();
  };
  const labels = useLabels();
  const theme = useIsolineTheme();
  const ios = useIsolinePlatform() === 'ios';
  const glass = ios && material !== 'solid';
  const colors = useThemeColors();
  const shown = useKeptChildren(visible, children);

  const wholePanel = (dragFrom ?? theme.sheetGesture ?? 'handle') === 'panel';
  return (
    // Once closed it takes no more touches, though it is still sliding away.
    <View className="flex-1" pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View
        style={[sheet.scrimStyle, { backgroundColor: SCRIM }]}
        className="absolute inset-0"
      >
        <Pressable className="flex-1" onPress={onClose} accessibilityLabel={labels.close} />
      </Animated.View>

      {/* The scrim is a sibling, never a parent: its opacity would fade the panel with it. */}
      <Animated.View
        style={lift}
        pointerEvents="box-none"
        className="absolute inset-0 items-center justify-end"
      >
        <GestureDetector gesture={dismissible && wholePanel ? sheet.pull : Gesture.Native()}>
          <Animated.View
            onLayout={sheet.onPanelLayout}
            accessibilityViewIsModal
            onAccessibilityEscape={onClose}
            className={
              ios
                ? 'w-full rounded-t-[20px] bg-surfaceContainerLow px-4 pt-2'
                : 'w-full rounded-t-4xl bg-surfaceContainerLow px-4 pt-3'
            }
            style={[
              sheet.panelStyle,
              {
                maxWidth: MAX_WIDTH,
                elevation: elevation.level1,
                ...(glass ? { backgroundColor: 'transparent' } : {}),
              },
              panelStyle,
            ]}
          >
            {glass ? (
              <Surface
                material={material}
                glassStyle={glassStyle}
                tintColor={tintColor}
                fallbackColor={fallbackColor}
                interactive={interactive}
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderTopLeftRadius: ios ? 20 : 32,
                  borderTopRightRadius: ios ? 20 : 32,
                }}
              />
            ) : null}
            {/* Below the panel, out of sight until a pull up lifts it off the edge. */}
            <View
              pointerEvents="none"
              className="absolute left-0 right-0 top-full h-24 bg-surfaceContainerLow"
            />

            {/* The handle closes the sheet when tapped, and is how TalkBack does. */}
            {dismissible ? (
              <GestureDetector gesture={wholePanel ? Gesture.Native() : sheet.pull}>
                <Pressable
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel={labels.close}
                  className="-mx-4 -mt-3 items-center py-3"
                >
                  <View
                    className="h-1 w-8 rounded-full"
                    style={{ backgroundColor: colors.onSurfaceVariant, opacity: 0.4 }}
                  />
                </Pressable>
              </GestureDetector>
            ) : null}

            {ios && dismissible ? (
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={labels.close}
                className="min-h-11 self-end justify-center px-2"
              >
                <Text style={{ color: colors.primary, fontWeight: '600' }}>{labels.close}</Text>
              </Pressable>
            ) : null}
            <SheetScrollContext.Provider value={sheet.scrollContext}>
              {shown}
            </SheetScrollContext.Provider>
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </View>
  );
}

/**
 * A vertical list inside a sheet. It scrolls first and lets the sheet's pull
 * take over at its top, as Android's own sheets do; a plain `ScrollView`
 * would fight the pull for every vertical swipe. Sideways rows of chips can
 * stay plain `ScrollView`s: the pull gives way to a sideways swipe.
 */
export function SheetScrollView({
  onScroll,
  onLayout,
  onContentSizeChange,
  ...props
}: ScrollViewProps) {
  const context = React.useContext(SheetScrollContext);
  const id = React.useId();
  const viewport = React.useRef(0);
  const content = React.useRef(0);
  const native = React.useMemo(
    () =>
      context
        ? Gesture.Native().simultaneousWithExternalGesture(context.pull)
        : Gesture.Native(),
    [context],
  );

  const report = React.useCallback(
    (patch: Partial<{ y: number; scrollable: boolean }>) => {
      if (!context) return;
      context.scrolls.modify((scrolls) => {
        'worklet';
        const previous = scrolls[id] ?? { y: 0, scrollable: false };
        scrolls[id] = { ...previous, ...patch };
        return scrolls;
      });
    },
    [context, id],
  );

  React.useEffect(() => {
    if (!context) return;
    return () => {
      context.scrolls.modify((scrolls) => {
        'worklet';
        delete scrolls[id];
        return scrolls;
      });
    };
  }, [context, id]);

  return (
    <GestureDetector gesture={native}>
      <ScrollView
        scrollEventThrottle={16}
        // The sheet moving is the feedback; a stretch on the list as well would be two.
        overScrollMode="never"
        onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
          report({ y: event.nativeEvent.contentOffset.y });
          onScroll?.(event);
        }}
        onLayout={(event: LayoutChangeEvent) => {
          viewport.current = event.nativeEvent.layout.height;
          report({ scrollable: content.current > viewport.current + 1 });
          onLayout?.(event);
        }}
        onContentSizeChange={(width: number, height: number) => {
          content.current = height;
          report({ scrollable: content.current > viewport.current + 1 });
          onContentSizeChange?.(width, height);
        }}
        {...props}
      />
    </GestureDetector>
  );
}
