import * as React from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Pressable } from './pressable.tsx';
import { effects, spatial } from '../motion.ts';
import { elevation } from '../provider.tsx';
import { useReducedMotion } from '../reduced-motion.ts';

/** How long the scrim takes to dim — matches the bottom sheet's own fade. */
const SCRIM_FADE_MS = 120;

/**
 * The open transition for a dialog: the scrim dims while the panel scales up
 * from its resting point and fades in, rather than sliding from an edge —
 * a dialog is anchored to the middle of the screen, so nothing here has an
 * edge to travel from.
 */
function useDialogTransition(visible: boolean) {
  const reducedMotion = useReducedMotion();
  const dim = useSharedValue(0);
  const scale = useSharedValue(0.85);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      dim.value = reducedMotion ? 1 : withTiming(1, { duration: SCRIM_FADE_MS });
      scale.value = reducedMotion ? 1 : withSpring(1, spatial.default);
      opacity.value = reducedMotion ? 1 : withSpring(1, effects.default);
      return;
    }

    // `Modal` unmounts its children as it hides, so there is nothing left to
    // animate out — this only rearms the transition for the next open.
    dim.value = 0;
    scale.value = 0.85;
    opacity.value = 0;
  }, [dim, scale, opacity, reducedMotion, visible]);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: dim.value }));
  const panelStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return { scrimStyle, panelStyle };
}

export interface DialogProps {
  visible: boolean;
  onClose: () => void;
  /** Runs once the dialog is actually on screen — for one that focuses an input. */
  onShow?: () => void;
  children: React.ReactNode;
}

/**
 * The app's Material 3 dialog: a scrim, and a panel centred on screen that
 * scales up into place. Used for a short, focused decision — naming
 * something, confirming an action — where a bottom sheet's list-of-options
 * shape would be the wrong read.
 */
export function Dialog({ visible, onClose, onShow, children }: DialogProps) {
  const { scrimStyle, panelStyle } = useDialogTransition(visible);
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      presentationStyle="overFullScreen"
      animationType="none"
      onRequestClose={onClose}
      onShow={onShow}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        enabled={Platform.OS === 'ios'}
      >
        <Animated.View
          style={[
            scrimStyle,
            { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
          ]}
          className="flex-1 items-center justify-center bg-black/60 px-6"
        >
          <Pressable className="absolute inset-0" onPress={onClose} accessible={false} />

          <Animated.View
            accessibilityViewIsModal
            onAccessibilityEscape={onClose}
            className="w-full max-w-sm rounded-[28px] bg-popover"
            style={[panelStyle, { maxHeight: '100%', elevation: elevation.level3 }]}
          >
            <ScrollView
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ padding: 24, gap: 16 }}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
            >
              {children}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** A dialog's row of text actions, right-aligned per M3. */
export function DialogActions({ children }: { children: React.ReactNode }) {
  return <View className="flex-row justify-end gap-2">{children}</View>;
}
