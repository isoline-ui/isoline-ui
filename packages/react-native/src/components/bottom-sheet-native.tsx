import * as React from 'react';
import { KeyboardAvoidingView, Modal, Platform, View, type DimensionValue } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type MaterialOptions, ThemeScope, useIsolinePlatform } from '../provider.tsx';
import { KeyboardInsetView } from './keyboard-inset-view.tsx';
import { SheetFrame } from './sheet-frame.tsx';
import { useSheet } from './sheet-transition.ts';
export interface BottomSheetProps extends MaterialOptions {
  visible: boolean;
  dismissible?: boolean;
  /** Reserve Android keyboard space for searchable modal content; iOS keeps native avoidance. */
  keyboardAware?: boolean;
  onClose: () => void;
  maxHeight?: DimensionValue;
  onShow?: () => void;
  children: React.ReactNode;
}
export function BottomSheet({
  visible,
  dismissible = true,
  keyboardAware = false,
  onClose,
  maxHeight = '90%',
  onShow,
  children,
  ...materialOptions
}: BottomSheetProps) {
  const requestClose = () => {
    if (dismissible) onClose();
  };
  const insets = useSafeAreaInsets();
  const ios = useIsolinePlatform() === 'ios';
  const sheet = useSheet(visible, requestClose);
  const Inset = keyboardAware && Platform.OS === 'android' ? KeyboardInsetView : View;
  return (
    <Modal
      visible={sheet.mounted}
      transparent
      presentationStyle="overFullScreen"
      animationType="none"
      onRequestClose={requestClose}
      onShow={onShow}
    >
      <ThemeScope style={{ flex: 1 }}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled={ios}>
            <Inset style={{ flex: 1 }}>
              <SheetFrame
                {...materialOptions}
                sheet={sheet}
                visible={visible}
                onClose={requestClose}
                dismissible={dismissible}
                panelStyle={{ paddingBottom: insets.bottom + 16, maxHeight }}
              >
                {children}
              </SheetFrame>
            </Inset>
          </KeyboardAvoidingView>
        </GestureHandlerRootView>
      </ThemeScope>
    </Modal>
  );
}
