import * as React from 'react';
import { Platform, BackHandler, useWindowDimensions, View } from 'react-native';
import { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SheetFrame, SheetScrollView } from './sheet-frame.tsx';
import { useSheet } from './sheet-transition.ts';
import { BottomSheet as WebSheet } from './bottom-sheet-web.tsx';
import { type MaterialOptions, elevation } from '../provider.tsx';

/** Room left above a sheet that has grown to the top, so the scrim still shows. */
const TOP_GAP = 24;

/**
 * A bottom sheet for typing into: the same frame as `BottomSheet`, drawn
 * inside the screen rather than in a `Modal`.
 *
 * Android draws edge to edge, so nothing resizes a window for the keyboard
 * any more; a sheet has to lift itself. Reanimated reads the keyboard's
 * height for the app's own window, and a `Modal` is a window of its own — so
 * a sheet with a text field lives here, rendered last in its screen, and
 * rides up on the keyboard as it opens. Its content scrolls once the keyboard
 * leaves it too little room. Sheets without a text field use `BottomSheet`.
 */
function NativePanelSheet({
  visible,
  onClose,
  children,
  ...materialOptions
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
} & MaterialOptions) {
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const keyboard = useAnimatedKeyboard();
  const sheet = useSheet(visible, onClose);

  React.useEffect(() => {
    if (!visible) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [visible, onClose]);

  const lift = useAnimatedStyle(() => ({
    transform: [{ translateY: -keyboard.height.value }],
  }));
  const panel = useAnimatedStyle(() => ({
    // Under the keyboard the gesture inset is covered anyway.
    paddingBottom: keyboard.height.value > 0 ? 12 : insets.bottom + 16,
    maxHeight: window.height - keyboard.height.value - insets.top - TOP_GAP,
  }));

  if (!sheet.mounted) return null;

  return (
    // Above the screen's own elevated views: on Android, elevation also orders.
    <View className="absolute inset-0" style={{ zIndex: 50, elevation: elevation.level3 }}>
      <SheetFrame
        {...materialOptions}
        sheet={sheet}
        visible={visible}
        onClose={onClose}
        lift={lift}
        panelStyle={panel}
      >
        <SheetScrollView
          keyboardShouldPersistTaps="handled"
          style={{ flexGrow: 0, marginHorizontal: -16 }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        >
          {children}
        </SheetScrollView>
      </SheetFrame>
    </View>
  );
}

export interface PanelSheetProps extends MaterialOptions {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
export function PanelSheet(props: PanelSheetProps) {
  return Platform.OS === 'web' ? <WebSheet {...props} /> : <NativePanelSheet {...props} />;
}
