import * as React from 'react';
import { I18nManager, Platform } from 'react-native';
import { Pressable } from './pressable.tsx';

/** Native accessibility supplies radio actions; web adds roving focus and selection. */
export function useRadioNavigation(
  items: { id: string; disabled?: boolean }[],
  value: string | null,
  onChange: (id: string) => void,
) {
  const refs = React.useRef<Record<string, React.ComponentRef<typeof Pressable> | null>>({});
  const enabled = items.filter((item) => !item.disabled);
  const first = enabled.find((item) => item.id === value)?.id ?? enabled[0]?.id;
  return (id: string) => ({
    ref: (node: React.ComponentRef<typeof Pressable> | null) => {
      refs.current[id] = node;
    },
    tabIndex: (id === first ? 0 : -1) as 0 | -1,
    ...(Platform.OS === 'web'
      ? {
          onKeyDown: (
            event: Parameters<
              NonNullable<React.ComponentProps<typeof Pressable>['onKeyDown']>
            >[0],
          ) => {
            const key = event.nativeEvent.key;
            if (
              !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(
                key,
              ) ||
              !enabled.length
            )
              return;
            event.preventDefault();
            const index = enabled.findIndex((item) => item.id === id);
            const horizontal = key === 'ArrowLeft' || key === 'ArrowRight';
            const delta =
              (key === 'ArrowLeft' || key === 'ArrowUp' ? -1 : 1) *
              (horizontal && I18nManager.isRTL ? -1 : 1);
            const next =
              key === 'Home'
                ? enabled[0]
                : key === 'End'
                  ? enabled[enabled.length - 1]
                  : enabled[(index + delta + enabled.length) % enabled.length];
            onChange(next.id);
            refs.current[next.id]?.focus();
          },
        }
      : {}),
  });
}
