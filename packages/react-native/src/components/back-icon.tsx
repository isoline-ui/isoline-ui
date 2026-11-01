import { I18nManager, Platform } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { useIsolinePlatform } from '../provider.tsx';
import { ArrowLeft, type IconProps } from './icons.tsx';

/** Navigation uses the iOS chevron; directional/content arrows stay unchanged. */
export function BackIcon({ size = 24, color = '#000000', style, ...props }: IconProps) {
  if (useIsolinePlatform() !== 'ios') {
    return <ArrowLeft size={size} color={color} style={style} {...props} />;
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessible={false}>
      <Path
        d={I18nManager.isRTL ? 'm9 5 7 7-7 7' : 'm15 5-7 7 7 7'}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
