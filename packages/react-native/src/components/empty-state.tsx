import type * as React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { ExpressiveShape, type ExpressiveShapeName } from './expressive-shape.tsx';
import type { IconProps } from './icons.tsx';
import { Text } from './text.tsx';
import { useThemeColors } from '../provider.tsx';

/**
 * An empty list's one thing to look at: a large Expressive shape with the
 * symbol of what would be here, a line saying so, and a line saying how to
 * change it.
 */
export function EmptyState({
  icon: Icon,
  shape,
  title,
  body,
  tone = 'primary',
}: {
  icon: React.ComponentType<IconProps>;
  shape: ExpressiveShapeName;
  title: string;
  body?: string;
  tone?: 'primary' | 'tertiary';
}) {
  const colors = useThemeColors();
  const fill = tone === 'primary' ? colors.primaryContainer : colors.tertiaryContainer;
  const ink = tone === 'primary' ? colors.onPrimaryContainer : colors.onTertiaryContainer;

  return (
    <Animated.View entering={FadeIn.duration(220)} className="items-center gap-5 px-8 py-12">
      <ExpressiveShape shape={shape} size={132} color={fill}>
        <Icon size={56} color={ink} />
      </ExpressiveShape>
      <View className="items-center gap-2">
        <Text variant="heading" className="text-center">
          {title}
        </Text>
        {body ? (
          <Text variant="muted" className="text-center leading-5">
            {body}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
}
