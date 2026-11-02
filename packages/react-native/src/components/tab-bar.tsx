import * as React from 'react';
import { I18nManager, Platform, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {
  Surface,
  useIsolinePlatform,
  useThemeColors,
  useHaptics,
  type MaterialOptions,
} from '../provider.tsx';
import { spatial } from '../motion.ts';
import { Pressable } from './pressable.tsx';
import { Text } from './text.tsx';
import type { IconProps } from './icons.tsx';
export interface TabBarItem<T extends string> {
  id: T;
  label: string;
  icon?: React.ComponentType<IconProps>;
  disabled?: boolean;
  badge?: string | number;
}
export interface TabBarProps<T extends string> extends MaterialOptions {
  items: TabBarItem<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}
/** Controlled navigation UI: route handling belongs to the consuming app. */
export function TabBar<T extends string>({
  items,
  value,
  onChange,
  accessibilityLabel,
  style,
  material = 'auto',
  glassStyle,
  tintColor,
  fallbackColor,
  interactive = false,
}: TabBarProps<T>) {
  const colors = useThemeColors();
  const ios = useIsolinePlatform() === 'ios';
  const { selectionHaptic } = useHaptics();
  const refs = React.useRef<Record<string, React.ComponentRef<typeof Pressable> | null>>({});
  const [width, setWidth] = React.useState(0);
  const index = items.findIndex((item) => item.id === value);
  const focusId =
    items.find((item) => item.id === value && !item.disabled)?.id ??
    items.find((item) => !item.disabled)?.id;
  const visualIndex = I18nManager.isRTL
    ? items.length - 1 - Math.max(0, index)
    : Math.max(0, index);
  const position = useSharedValue(visualIndex);
  React.useEffect(() => {
    position.value = withSpring(visualIndex, spatial.default);
  }, [visualIndex, position]);
  const segment = items.length ? Math.max(0, width - 8) / items.length : 0;
  const motion = useAnimatedStyle(() => ({
    transform: [{ translateX: position.value * segment }],
  }));
  const Marker = (Platform.OS === 'web' ? View : Animated.View) as typeof Animated.View;
  return (
    <Surface
      material={ios ? material : 'solid'}
      glassStyle={glassStyle}
      tintColor={tintColor}
      fallbackColor={fallbackColor}
      interactive={interactive}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[
        { padding: 4, borderRadius: ios ? 32 : 24, flexDirection: 'row', minHeight: 64 },
        style,
      ]}
    >
      {index >= 0 && width > 0 ? (
        <Marker
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              left: 4,
              top: 4,
              bottom: 4,
              width: segment,
              borderRadius: ios ? 28 : 20,
              backgroundColor: colors.secondaryContainer,
            },
            Platform.OS === 'web'
              ? { transform: [{ translateX: visualIndex * segment }] }
              : motion,
          ]}
        />
      ) : null}
      {items.map((item) => {
        const selected = item.id === value;
        const Icon = item.icon;
        return (
          <Pressable
            key={item.id}
            ref={(node) => {
              refs.current[item.id] = node;
            }}
            tabIndex={item.id === focusId ? 0 : -1}
            {...(Platform.OS === 'web'
              ? {
                  onKeyDown: (
                    event: Parameters<
                      NonNullable<React.ComponentProps<typeof Pressable>['onKeyDown']>
                    >[0],
                  ) => {
                    const key = event.nativeEvent.key;
                    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(key)) return;
                    event.preventDefault();
                    const enabled = items.filter((tab) => !tab.disabled);
                    if (!enabled.length) return;
                    const current = enabled.findIndex((tab) => tab.id === item.id);
                    const delta =
                      (key === 'ArrowRight' ? 1 : -1) * (I18nManager.isRTL ? -1 : 1);
                    const next =
                      key === 'Home'
                        ? enabled[0]
                        : key === 'End'
                          ? enabled[enabled.length - 1]
                          : enabled[(current + delta + enabled.length) % enabled.length];
                    onChange(next.id);
                    refs.current[next.id]?.focus();
                  },
                }
              : {})}
            disabled={item.disabled}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected, disabled: item.disabled }}
            onPress={() => {
              if (!selected) {
                selectionHaptic();
                onChange(item.id);
              }
            }}
            style={{
              flex: 1,
              minWidth: 0,
              minHeight: 56,
              padding: 6,
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              borderRadius: 28,
              opacity: item.disabled ? 0.4 : 1,
            }}
          >
            {Icon ? (
              <Icon size={22} color={selected ? colors.primary : colors.onSurfaceVariant} />
            ) : null}
            <Text
              numberOfLines={1}
              style={{
                fontSize: 12,
                lineHeight: 16,
                fontWeight: selected ? '700' : '500',
                color: selected ? colors.primary : colors.onSurfaceVariant,
              }}
            >
              {item.label}
            </Text>
            {item.badge !== undefined ? (
              <View
                style={{
                  position: 'absolute',
                  right: 6,
                  top: 2,
                  paddingHorizontal: 4,
                  minWidth: 16,
                  borderRadius: 8,
                  backgroundColor: colors.error,
                }}
              >
                <Text style={{ color: colors.onError, fontSize: 10, lineHeight: 14 }}>
                  {item.badge}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </Surface>
  );
}
