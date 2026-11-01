import {
  type AnimatedStyle,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { spatial } from '../motion.ts';

/** How far a card gives under the finger: enough to feel, not enough to look like a jump. */
const PRESSED_SCALE = 0.97;

/**
 * A card or tile giving a little under the finger and springing back on
 * release, as Material 3 Expressive's components do — on top of the ripple,
 * which only colours. Spread `handlers` on the Pressable and put `style` on
 * the animated view around it. Under "Remove animations" the spring is
 * Reanimated's, so the system's setting already stills it.
 */
export interface SquishFeedback {
  style: AnimatedStyle<{ transform: { scale: number }[] }>;
  handlers: { onPressIn: () => void; onPressOut: () => void };
}

export function useSquish(): SquishFeedback {
  const pressed = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.value === 1 ? PRESSED_SCALE : 1, spatial.fast) }],
  }));
  return {
    style,
    handlers: {
      onPressIn: () => {
        pressed.value = 1;
      },
      onPressOut: () => {
        pressed.value = 0;
      },
    },
  };
}
