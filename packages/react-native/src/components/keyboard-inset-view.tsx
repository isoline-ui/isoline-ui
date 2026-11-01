import * as React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useKeyboardHeight } from '../use-keyboard-height.ts';

/**
 * A view that gives up the part of the screen the on-screen keyboard covers.
 *
 * Edge-to-edge (the default since Expo SDK 54) stops Android's `adjustResize`
 * from shrinking the window, and `KeyboardAvoidingView` cannot be relied on to
 * take over: its `height` mode measures the keyboard against a frame that no
 * longer ends where the keyboard begins, and leaves the layout full height.
 * A scroll view inside it then ends behind the keyboard, so its lower fields
 * can neither be seen nor scrolled to. Padding by the measured keyboard height
 * shrinks the scroll view's viewport instead, which also lets Android scroll a
 * focused field into view.
 */
export function KeyboardInsetView({ style, ...props }: ViewProps) {
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  // Android reports the keyboard above its navigation bar. On iOS the
  // keyboard already includes the home-indicator area.
  const paddingBottom =
    keyboardHeight > 0 ? keyboardHeight + (Platform.OS === 'android' ? insets.bottom : 0) : 0;

  return <View style={[style, { paddingBottom }]} {...props} />;
}
