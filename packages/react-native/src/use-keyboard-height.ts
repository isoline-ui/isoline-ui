import * as React from 'react';
import { Keyboard, Platform } from 'react-native';
import { keyboardOcclusion } from './keyboard.ts';

/**
 * The on-screen keyboard's height in dp, or 0 while it is closed.
 *
 * Anything pinned to the bottom of the screen has to measure the keyboard
 * itself: `KeyboardAvoidingView` shrinks the layout it wraps, which does
 * nothing for a view positioned against the window's bottom edge, and
 * Android's own `adjustResize` stops resizing the window at all once the
 * app is edge-to-edge.
 */
export function useKeyboardHeight(): number {
  // Seeded from the keyboard's current metrics rather than starting at zero:
  // listeners only report what happens next, so anything mounted while the
  // keyboard is already open would sit at the bottom of the screen — behind
  // the keyboard — until the next time it happened to open.
  const [height, setHeight] = React.useState(() => Platform.OS === 'web' ? 0 : Keyboard.metrics?.()?.height ?? 0);

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const viewport = window.visualViewport;
      let frame = 0;
      const update = () => {
        const element = document.activeElement;
        const editing = element instanceof HTMLElement && (['INPUT','TEXTAREA'].includes(element.tagName) || element.isContentEditable);
        setHeight(keyboardOcclusion(window.innerHeight, viewport?.height ?? window.innerHeight, viewport?.offsetTop ?? 0, viewport?.scale ?? 1, editing));
      };
      const focus = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
      update();
      viewport?.addEventListener('resize', update);
      viewport?.addEventListener('scroll', update);
      window.addEventListener('resize', update);
      document.addEventListener('focusin', focus);
      document.addEventListener('focusout', focus);
      return () => {
        cancelAnimationFrame(frame);
        viewport?.removeEventListener('resize', update);
        viewport?.removeEventListener('scroll', update);
        window.removeEventListener('resize', update);
        document.removeEventListener('focusin', focus);
        document.removeEventListener('focusout', focus);
      };
    }
    // iOS gets the `will` pair so a view travels with the keyboard rather
    // than jumping after it; Android only ever emits the `did` pair.
    const shown = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => setHeight(event.endCoordinates.height),
    );
    const hidden = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setHeight(0),
    );

    return () => {
      shown.remove();
      hidden.remove();
    };
  }, []);

  return height;
}
