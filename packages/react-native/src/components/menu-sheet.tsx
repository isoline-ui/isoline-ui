import * as React from 'react';
import { View } from 'react-native';

import { BottomSheet } from './bottom-sheet.tsx';
import type { IconProps } from './icons.tsx';
import { Pressable } from './pressable.tsx';
import { Text } from './text.tsx';
import { useIsolinePlatform, useRipple, useThemeColors } from '../provider.tsx';

export interface MenuSheetItem {
  id: string;
  icon: React.ComponentType<IconProps>;
  label: string;
  onPress: () => void;
  /** Overrides the icon colour, for a state like "starred". */
  color?: string;
  /** Filled icons read as "on" for toggles. */
  fill?: string;
}

export interface MenuSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** A line under the title saying what the actions would act on. */
  subject?: string;
  items: MenuSheetItem[];
}

/**
 * A sheet of actions, each with its symbol and its name.
 *
 * The overflow half of a toolbar: what does not fit on the pill — or what an
 * icon on its own would not explain — is listed here instead, where there is
 * room for the word that says what it does. Rows are the same size and shape
 * as the pickers' (`SnoozeSheet`, `MoveSheet`), so an action list and a value
 * list do not read as two different kinds of sheet.
 */
export function MenuSheet({ visible, onClose, title, subject, items }: MenuSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View className="mb-2 gap-1 px-2">
        <Text variant="heading">{title}</Text>
        {subject ? (
          <Text variant="caption" numberOfLines={1}>
            {subject}
          </Text>
        ) : null}
      </View>

      <MenuSheetRows items={items} onClose={onClose} />
    </BottomSheet>
  );
}

/** A menu sheet's rows on their own, for a sheet that shows more above its actions. */
export function MenuSheetRows({
  items,
  onClose,
}: {
  items: MenuSheetItem[];
  onClose: () => void;
}) {
  const ios = useIsolinePlatform() === 'ios';
  const colors = useThemeColors();
  const ripple = useRipple();

  return (
    <View
      className="gap-1"
      style={
        ios
          ? {
              borderRadius: 14,
              overflow: 'hidden',
              backgroundColor: colors.surfaceContainerLowest,
            }
          : undefined
      }
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <View key={item.id} className="overflow-hidden rounded-2xl">
            <Pressable
              onPress={() => {
                // Closed first, so the sheet is gone by the time an action
                // that leaves selection mode takes the toolbar with it.
                onClose();
                item.onPress();
              }}
              android_ripple={{ color: ripple.onNeutral }}
              style={
                ios
                  ? {
                      borderRadius: 0,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.outlineVariant,
                    }
                  : undefined
              }
              accessibilityRole="button"
              className="flex-row items-center gap-3 rounded-2xl px-4 py-4 active:bg-accent"
            >
              <Icon
                size={22}
                color={item.color ?? colors.onSurfaceVariant}
                {...(item.fill ? { fill: item.fill } : null)}
              />
              <Text className="flex-1 text-base font-medium">{item.label}</Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
