import * as React from 'react';
import {
  Modal,
  ScrollView,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Surface,
  ThemeScope,
  useIsolinePlatform,
  useLabels,
  type MaterialOptions,
} from '../provider.tsx';
import { Pressable } from './pressable.tsx';
import { placePopover, type AnchorRect } from './popover-layout.ts';
export type { AnchorRect } from './popover-layout.ts';
export type PopoverAnchorRef = React.RefObject<React.ComponentRef<typeof View> | null>;
export interface PopoverProps extends MaterialOptions {
  visible: boolean;
  onClose: () => void;
  anchorRef?: PopoverAnchorRef;
  anchor?: AnchorRect;
  placement?: 'top' | 'bottom';
  width?: number;
  accessibilityLabel: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onShow?: () => void;
}
/** Controlled anchored surface. Native Modal provides back dismissal; web adds focus trapping/Escape. */
export function Popover({
  visible,
  onClose,
  anchorRef,
  anchor,
  placement = 'bottom',
  width = 300,
  accessibilityLabel,
  children,
  style,
  onShow,
  material = 'auto',
  glassStyle,
  tintColor,
  fallbackColor,
  interactive = false,
}: PopoverProps) {
  const window = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const labels = useLabels();
  const ios = useIsolinePlatform() === 'ios';
  const [measured, setMeasured] = React.useState<AnchorRect | null>(null);
  const [height, setHeight] = React.useState(0);
  React.useEffect(() => {
    if (!visible) {
      setMeasured(null);
      return;
    }
    let active = true;
    if (anchor) return;
    if (anchorRef?.current)
      anchorRef.current.measureInWindow((x, y, width, height) => {
        if (active) setMeasured({ x, y, width, height });
      });
    else setMeasured({ x: window.width / 2, y: window.height / 2, width: 0, height: 0 });
    return () => {
      active = false;
    };
  }, [visible, anchor, anchorRef, window.width, window.height]);
  const target = anchor ?? measured;
  const layout = placePopover(
    target ?? { x: 0, y: 0, width: 0, height: 0 },
    { width, height },
    { ...window, ...insets },
    placement,
  );
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      onShow={onShow}
    >
      <ThemeScope style={{ flex: 1 }}>
        <Pressable
          testID="popover-backdrop"
          accessibilityLabel={labels.close}
          accessibilityRole="button"
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,0.2)',
          }}
        />
        <View
          testID="isoline-popover-panel"
          accessibilityViewIsModal
          onAccessibilityEscape={onClose}
          accessibilityLabel={accessibilityLabel}
          style={{
            position: 'absolute',
            left: layout.left,
            top: layout.top,
            width: layout.width,
            maxHeight: layout.maxHeight,
            opacity: target ? 1 : 0,
          }}
        >
          <Surface
            material={ios ? material : 'solid'}
            glassStyle={glassStyle}
            tintColor={tintColor}
            fallbackColor={fallbackColor}
            interactive={interactive}
            style={[{ borderRadius: 20, maxHeight: layout.maxHeight }, style]}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={{ flexGrow: 0, maxHeight: Math.max(0, layout.maxHeight - 2) }}
              onContentSizeChange={(_width, h) => setHeight(h)}
              contentContainerStyle={{ padding: 12 }}
            >
              {children}
            </ScrollView>
          </Surface>
        </View>
      </ThemeScope>
    </Modal>
  );
}
