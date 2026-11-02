import * as React from 'react';
import { KeyboardAvoidingView, Modal, Platform, View, type DimensionValue } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable } from './pressable.tsx';
import { useSheetTransition } from './sheet-transition.ts';
import { Text } from './text.tsx';
import {
  Surface,
  type MaterialOptions,
  ThemeScope,
  useThemeColors,
  useIsolinePlatform,
  useLabels,
} from '../provider.tsx';
import { spatial } from '../motion.ts';
import { elevation } from '../provider.tsx';

const CLOSE_SHARE = 0.3;
const CLOSE_VELOCITY = 900;
const LEAVE_MS = 160;

export interface BottomSheetProps extends MaterialOptions {
  visible: boolean;
  onClose: () => void;
  /** Caps long lists; the default leaves space for the status bar. */
  maxHeight?: DimensionValue;
  /** Runs once the sheet is on screen, e.g. to focus an input. */
  onShow?: () => void;
  children: React.ReactNode;
}

/**
 * One branded sheet on both platforms. The handle owns the dismiss gesture
 * so it cannot steal scrolling, calendar swipes or drags inside the content.
 * On iOS the panel also follows the keyboard and supports VoiceOver Escape.
 */
export function BottomSheet({
  visible,
  onClose,
  maxHeight = '90%',
  onShow,
  children,
  material = 'solid',
  glassStyle,
  tintColor,
  fallbackColor,
  interactive = false,
}: BottomSheetProps) {
  const ios = useIsolinePlatform() === 'ios';
  const glass = ios && material !== 'solid';
  const insets = useSafeAreaInsets();
  const web = Platform.OS === 'web';
  const Box = (web ? View : Animated.View) as typeof Animated.View;
  const labels = useLabels();
  const colors = useThemeColors();
  const { scrimStyle, panelStyle, onPanelLayout, drag, height, reducedMotion } =
    useSheetTransition(visible);

  const pull = Gesture.Pan()
    .activeOffsetY([-8, 8])
    .onUpdate((event) => {
      drag.set(Math.max(0, event.translationY));
    })
    .onEnd((event) => {
      const closing =
        event.translationY > height.get() * CLOSE_SHARE ||
        (event.velocityY > CLOSE_VELOCITY && event.translationY > 0);
      if (!closing) {
        drag.set(reducedMotion ? 0 : withSpring(0, spatial.default));
        return;
      }
      if (reducedMotion) {
        runOnJS(onClose)();
        return;
      }
      drag.set(
        withTiming(height.get(), { duration: LEAVE_MS }, (finished) => {
          if (finished) runOnJS(onClose)();
        }),
      );
    })
    .onFinalize((_event, success) => {
      if (!success) drag.set(reducedMotion ? 0 : withSpring(0, spatial.default));
    });

  return (
    <Modal
      visible={visible}
      transparent
      presentationStyle="overFullScreen"
      animationType="none"
      onRequestClose={onClose}
      onShow={onShow}
    >
      <ThemeScope style={{ flex: 1 }}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior="padding"
            enabled={Platform.OS === 'ios'}
          >
            <Box
              style={[
                !web && scrimStyle,
                { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', paddingTop: insets.top + 8 },
              ]}
              className="flex-1 bg-black/60"
            >
              <Pressable
                testID="isoline-sheet-backdrop"
                className="flex-1"
                onPress={onClose}
                accessible={false}
              />

              <Box
                testID="isoline-sheet-panel"
                onLayout={onPanelLayout}
                accessibilityViewIsModal
                onAccessibilityEscape={onClose}
                className="rounded-t-[28px] bg-popover px-4"
                style={[
                  !web && panelStyle,
                  {
                    ...(glass
                      ? { backgroundColor: 'transparent' }
                      : web
                        ? { backgroundColor: colors.surfaceContainerLow }
                        : {}),
                    paddingHorizontal: 16,
                    paddingBottom: insets.bottom + 16,
                    maxHeight,
                    borderTopLeftRadius: ios ? 20 : 28,
                    borderTopRightRadius: ios ? 20 : 28,
                    elevation: elevation.level3,
                  },
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
                      borderTopLeftRadius: ios ? 20 : 28,
                      borderTopRightRadius: ios ? 20 : 28,
                    }}
                  />
                ) : null}
                <GestureDetector gesture={pull}>
                  <Pressable
                    onPress={onClose}
                    className="-mx-4 min-h-11 items-center justify-center"
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={labels.close}
                    onAccessibilityTap={onClose}
                    accessibilityActions={[{ name: 'activate' }]}
                    onAccessibilityAction={({ nativeEvent }) => {
                      if (nativeEvent.actionName === 'activate') onClose();
                    }}
                  >
                    <View className="h-1 w-9 rounded-full bg-outlineVariant" />
                  </Pressable>
                </GestureDetector>
                <Pressable
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel={labels.close}
                  className="self-end px-3 py-2"
                >
                  <Text style={{ color: colors.primary }}>{labels.close}</Text>
                </Pressable>
                {children}
              </Box>
            </Box>
          </KeyboardAvoidingView>
        </GestureHandlerRootView>
      </ThemeScope>
    </Modal>
  );
}
