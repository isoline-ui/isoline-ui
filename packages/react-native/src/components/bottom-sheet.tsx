import * as React from 'react';
import { KeyboardAvoidingView, Modal, Platform, View, type DimensionValue } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable } from './pressable.tsx';
import { useSheetTransition } from './sheet-transition.ts';
import { useLabels } from '../provider.tsx';
import { spatial } from '../motion.ts';
import { elevation } from '../provider.tsx';

const CLOSE_SHARE = 0.3;
const CLOSE_VELOCITY = 900;
const LEAVE_MS = 160;

export interface BottomSheetProps {
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
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const labels = useLabels();
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
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          enabled={Platform.OS === 'ios'}
        >
          <Animated.View
            style={[scrimStyle, { paddingTop: insets.top + 8 }]}
            className="flex-1 bg-black/60"
          >
            <Pressable className="flex-1" onPress={onClose} accessible={false} />

            <Animated.View
              onLayout={onPanelLayout}
              accessibilityViewIsModal
              onAccessibilityEscape={onClose}
              className="rounded-t-[28px] bg-popover px-4"
              style={[
                panelStyle,
                {
                  paddingBottom: insets.bottom + 16,
                  maxHeight,
                  elevation: elevation.level3,
                },
              ]}
            >
              <GestureDetector gesture={pull}>
                <View
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
                </View>
              </GestureDetector>
              {children}
            </Animated.View>
          </Animated.View>
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </Modal>
  );
}
