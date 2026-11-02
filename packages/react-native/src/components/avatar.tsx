import * as React from 'react';
import {
  Image,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Text } from './text.tsx';
import { useThemeColors } from '../provider.tsx';

export interface AvatarProps {
  accessibilityLabel: string;
  initials?: string;
  source?: ImageSourcePropType;
  size?: number;
  color?: string;
  foregroundColor?: string;
  accent?: string;
  badge?: React.ReactNode;
  renderImage?: (size: number, onError: () => void) => React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
}
/** Image rendering and initials only: no address book, network lookup or app preference. */
export function Avatar({
  accessibilityLabel,
  initials,
  source,
  size = 44,
  color,
  foregroundColor,
  accent,
  badge,
  renderImage,
  style,
  className,
}: AvatarProps) {
  const colors = useThemeColors();
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => setFailed(false), [source, renderImage]);
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={[{ width: size, height: size }, style]}
    >
      <View
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          overflow: 'hidden',
          backgroundColor: color ?? colors.secondaryContainer,
          borderWidth: accent ? 2 : 0,
          borderColor: accent,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          accessible={false}
          style={{
            fontSize: size * 0.36,
            lineHeight: size * 0.5,
            color: foregroundColor ?? colors.onSecondaryContainer,
            fontWeight: '600',
          }}
        >
          {initials}
        </Text>
        {!failed && renderImage ? (
          renderImage(size, () => setFailed(true))
        ) : !failed && source ? (
          <Image
            source={source}
            accessible={false}
            onError={() => setFailed(true)}
            resizeMode="cover"
            style={{ position: 'absolute', width: size, height: size }}
          />
        ) : null}
      </View>
      {badge ? (
        <View style={{ position: 'absolute', right: -3, bottom: -3 }}>{badge}</View>
      ) : null}
    </View>
  );
}
