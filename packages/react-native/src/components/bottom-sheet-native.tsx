import * as React from 'react';
import {KeyboardAvoidingView, Modal, type DimensionValue} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ThemeScope, useIsolinePlatform} from '../provider.tsx';
import {SheetFrame} from './sheet-frame.tsx';
import {useSheet} from './sheet-transition.ts';
export interface BottomSheetProps {
 visible: boolean; onClose: () => void; maxHeight?: DimensionValue; onShow?: () => void; children: React.ReactNode;
}
export function BottomSheet({visible,onClose,maxHeight='90%',onShow,children}: BottomSheetProps) {
 const insets=useSafeAreaInsets();const ios=useIsolinePlatform()==='ios';const sheet=useSheet(visible,onClose);
 return <Modal visible={sheet.mounted} transparent presentationStyle="overFullScreen" animationType="none" onRequestClose={onClose} onShow={onShow}>
 <ThemeScope style={{flex:1}}><GestureHandlerRootView style={{flex:1}}><KeyboardAvoidingView style={{flex:1}} behavior="padding" enabled={ios}>
 <SheetFrame sheet={sheet} visible={visible} onClose={onClose} panelStyle={{paddingBottom:insets.bottom+16,maxHeight}}>{children}</SheetFrame>
 </KeyboardAvoidingView></GestureHandlerRootView></ThemeScope></Modal>;
}
