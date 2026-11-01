import {Platform} from 'react-native';
import {BottomSheet as NativeSheet, type BottomSheetProps} from './bottom-sheet-native.tsx';
import {BottomSheet as WebSheet} from './bottom-sheet-web.tsx';
export type {BottomSheetProps};
export function BottomSheet(props: BottomSheetProps) { return Platform.OS === 'web' ? <WebSheet {...props}/> : <NativeSheet {...props}/>; }
