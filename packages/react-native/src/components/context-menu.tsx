import * as React from 'react';
import { Platform, View } from 'react-native';
import { useThemeColors, useHaptics } from '../provider.tsx';
import type { MaterialOptions } from '../material.ts';
import { Popover } from './popover.tsx';
import { Pressable } from './pressable.tsx';
import { Text } from './text.tsx';
import { Check, type IconProps } from './icons.tsx';
export interface ContextMenuItem {
  id: string;
  label: string;
  onPress: () => void;
  icon?: React.ComponentType<IconProps>;
  disabled?: boolean;
  destructive?: boolean;
  selected?: boolean;
}
export interface ContextMenuProps extends MaterialOptions {
  children: React.ReactNode;
  accessibilityLabel: string;
  items: ContextMenuItem[];
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: 'top' | 'bottom';
}
/** Shared anchored menu, not a UIKit context-menu controller or an application router. */
export function ContextMenu({
  children,
  accessibilityLabel,
  items,
  disabled,
  onOpenChange,
  placement,
  ...material
}: ContextMenuProps) {
  const [open, setOpen] = React.useState(false);
  const anchor = React.useRef<React.ComponentRef<typeof View>>(null);
  const set = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };
  return (
    <View ref={anchor} collapsable={false}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ expanded: open, disabled }}
        disabled={disabled}
        onPress={() => set(true)}
        onLongPress={() => set(true)}
        style={{ minHeight: 44, justifyContent: 'center' }}
      >
        {children}
      </Pressable>
      <Popover
        {...material}
        visible={open}
        onClose={() => set(false)}
        anchorRef={anchor}
        placement={placement}
        accessibilityLabel={accessibilityLabel}
      >
        <ContextMenuRows items={items} onClose={() => set(false)} />
      </Popover>
    </View>
  );
}
export function ContextMenuRows({
  items,
  onClose,
}: {
  items: ContextMenuItem[];
  onClose: () => void;
}) {
  const colors = useThemeColors();
  const refs = React.useRef<Record<string, React.ComponentRef<typeof Pressable> | null>>({});
  const initial =
    items.find((item) => item.selected && !item.disabled) ??
    items.find((item) => !item.disabled);
  React.useEffect(() => {
    if (Platform.OS === 'web' && initial) refs.current[initial.id]?.focus();
  }, []);
  const { selectionHaptic } = useHaptics();
  return (
    <View accessibilityRole="menu">
      {items.map((item) => {
        const Icon = item.icon;
        const color = item.destructive ? colors.error : colors.onSurface;
        return (
          <Pressable
            key={item.id}
            ref={(node) => {
              refs.current[item.id] = node;
            }}
            tabIndex={item.id === initial?.id ? 0 : -1}
            {...(Platform.OS === 'web'
              ? {
                  onKeyDown: (
                    event: Parameters<
                      NonNullable<React.ComponentProps<typeof Pressable>['onKeyDown']>
                    >[0],
                  ) => {
                    const key = event.nativeEvent.key;
                    if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(key)) return;
                    event.preventDefault();
                    const enabled = items.filter((action) => !action.disabled);
                    if (!enabled.length) return;
                    const index = enabled.findIndex((action) => action.id === item.id);
                    const next =
                      key === 'Home'
                        ? enabled[0]
                        : key === 'End'
                          ? enabled[enabled.length - 1]
                          : enabled[
                              (index + (key === 'ArrowDown' ? 1 : -1) + enabled.length) %
                                enabled.length
                            ];
                    refs.current[next.id]?.focus();
                  },
                }
              : {})}
            disabled={item.disabled}
            accessibilityRole={item.selected === undefined ? 'menuitem' : 'menuitemradio'}
            accessibilityLabel={item.label}
            accessibilityState={{ disabled: item.disabled, checked: item.selected }}
            onPress={() => {
              selectionHaptic();
              onClose();
              item.onPress();
            }}
            style={{
              minHeight: 44,
              padding: 10,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              opacity: item.disabled ? 0.4 : 1,
              borderRadius: 10,
            }}
          >
            {Icon ? <Icon size={20} color={color} /> : null}
            <Text style={{ flex: 1, color, fontSize: 16 }}>{item.label}</Text>
            {item.selected ? <Check size={18} color={colors.primary} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
