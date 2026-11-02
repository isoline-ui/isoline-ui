import * as React from 'react';
import { Platform, View } from 'react-native';
import { LegacyFabMenu } from './fab-menu-legacy.tsx';
import { Plus, type IconProps } from './icons.tsx';
import { FloatingActionButton } from './floating-action-button.tsx';
import { Popover } from './popover.tsx';
import { ContextMenuRows } from './context-menu.tsx';
import {
  useHaptics,
  useLabels,
  useIsolinePlatform,
  type MaterialOptions,
} from '../provider.tsx';
export interface FabMenuAction {
  id: string;
  label: string;
  icon: React.ComponentType<IconProps>;
  run: () => void;
  disabled?: boolean;
  destructive?: boolean;
}
export interface FabMenuProps extends MaterialOptions {
  /** Material of the anchored menu, independent of the floating trigger. */
  menuMaterial?: MaterialOptions['material'];
  bottom: number;
  label: string;
  actions: FabMenuAction[];
}
export const FAB_MENU_SIZE = 64;
/** Floating primary action with a safe, anchored overflow surface on native and web. */
export function FabMenu({
  bottom,
  label,
  actions,
  material = 'solid',
  menuMaterial = 'auto',
  glassStyle,
  tintColor,
  fallbackColor,
  interactive = true,
}: FabMenuProps) {
  const [open, setOpen] = React.useState(false);
  const anchor = React.useRef<React.ComponentRef<typeof View>>(null);
  const labels = useLabels();
  const { impactHaptic } = useHaptics();
  const ios = useIsolinePlatform() === 'ios';
  if (Platform.OS !== 'web' && (!ios || material === 'solid'))
    return <LegacyFabMenu bottom={bottom} label={label} actions={actions} />;
  return (
    <>
      <View
        ref={anchor}
        collapsable={false}
        style={{ position: 'absolute', right: 16, bottom }}
      >
        <FloatingActionButton
          icon={Plus}
          accessibilityLabel={open ? labels.close : label}
          size={FAB_MENU_SIZE}
          material={material}
          glassStyle={glassStyle}
          tintColor={tintColor}
          fallbackColor={fallbackColor}
          interactive={interactive}
          onPress={() => {
            impactHaptic('light');
            setOpen((value) => !value);
          }}
        />
      </View>
      <Popover
        visible={open}
        onClose={() => setOpen(false)}
        anchorRef={anchor}
        placement="top"
        accessibilityLabel={label}
        material={menuMaterial}
        glassStyle={glassStyle}
        tintColor={tintColor}
        fallbackColor={fallbackColor}
        interactive={interactive}
      >
        <ContextMenuRows
          items={actions.map(({ run, ...action }) => ({ ...action, onPress: run }))}
          onClose={() => setOpen(false)}
        />
      </Popover>
    </>
  );
}
