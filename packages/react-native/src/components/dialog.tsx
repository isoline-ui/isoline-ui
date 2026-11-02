import * as React from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DialogActionContext } from './dialog-context.ts';
import { Pressable } from './pressable.tsx';
import { effects, spatial } from '../motion.ts';
import {
  Surface,
  type MaterialOptions,
  ThemeScope,
  useThemeColors,
  useIsolinePlatform,
  elevation,
} from '../provider.tsx';
import { useReducedMotion } from '../reduced-motion.ts';

/** How long the scrim takes to dim — matches the bottom sheet's own fade. */
const SCRIM_FADE_MS = 120;

/**
 * The open transition for a dialog: the scrim dims while the panel scales up
 * from its resting point and fades in, rather than sliding from an edge —
 * a dialog is anchored to the middle of the screen, so nothing here has an
 * edge to travel from.
 */
function useDialogTransition(visible: boolean, preserveOpacity: boolean) {
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
    opacity: preserveOpacity ? 1 : opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return { scrimStyle, panelStyle };
}

export interface DialogProps extends MaterialOptions {
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
export function Dialog({
  visible,
  onClose,
  onShow,
  children,
  material = 'solid',
  glassStyle,
  tintColor,
  fallbackColor,
  interactive = false,
}: DialogProps) {
  const ios = useIsolinePlatform() === 'ios';
  const glass = ios && material !== 'solid';
  const { scrimStyle, panelStyle } = useDialogTransition(visible, glass);
  const insets = useSafeAreaInsets();
  const web = Platform.OS === 'web';
  const Box = (web ? View : Animated.View) as typeof Animated.View;
  const colors = useThemeColors();

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
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior="padding"
          enabled={Platform.OS === 'ios'}
        >
          <Box
            style={[
              {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 24,
                paddingTop: insets.top + 24,
                paddingBottom: insets.bottom + 24,
              },
            ]}
            className="flex-1 items-center justify-center px-6"
          >
            <Box
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                },
                !web && scrimStyle,
              ]}
            />
            <Pressable
              testID="isoline-dialog-backdrop"
              className="absolute inset-0"
              onPress={onClose}
              accessible={false}
            />

            <Box
              testID="isoline-dialog-panel"
              accessibilityViewIsModal
              onAccessibilityEscape={onClose}
              className="w-full max-w-sm rounded-[28px] bg-popover"
              style={[
                !web && panelStyle,
                {
                  width: '100%',
                  ...(glass
                    ? { backgroundColor: 'transparent' }
                    : web
                      ? { backgroundColor: colors.surfaceContainerLow }
                      : {}),
                  maxHeight: '100%',
                  elevation: ios ? 0 : elevation.level3,
                  borderRadius: ios ? 14 : 28,
                  maxWidth: ios ? 320 : 384,
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
                    right: 0,
                    bottom: 0,
                    left: 0,
                    borderRadius: ios ? 14 : 28,
                  }}
                />
              ) : null}
              <ScrollView
                style={{ flexGrow: 0 }}
                contentContainerStyle={{ padding: 24, gap: 16 }}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              >
                {children}
              </ScrollView>
            </Box>
          </Box>
        </KeyboardAvoidingView>
      </ThemeScope>
    </Modal>
  );
}

/** A dialog's row of text actions, right-aligned per M3. */
export function DialogActions({ children }: { children: React.ReactNode }) {
  const ios = useIsolinePlatform() === 'ios';
  return (
    <DialogActionContext.Provider value={ios}>
      <View className={ios ? 'flex-row justify-center' : 'flex-row justify-end gap-2'}>
        {children}
      </View>
    </DialogActionContext.Provider>
  );
}
