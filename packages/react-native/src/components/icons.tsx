import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
  fill?: string;
  ruleColor?: string;
  style?: StyleProp<ViewStyle>;
}
/** Small functional glyphs, drawn for Isoline. Consumer icons use IconProps. */
function glyph(path: string) {
  return function Glyph({ size = 24, color = '#000000', style }: IconProps) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" style={style} accessible={false}>
        <Path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  };
}
export const ArrowLeft = glyph('M20 12H4m7-7-7 7 7 7');
export const Check = glyph('m5 12 4 4L19 6');
export const ChevronDown = glyph('m6 9 6 6 6-6');
export const Search = glyph('M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0');
export const X = glyph('m6 6 12 12M18 6 6 18');

export const ChevronUp = glyph('m6 15 6-6 6 6');
export const ChevronRight = glyph('m9 6 6 6-6 6');
export const Eye = glyph(
  'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
);
export const EyeOff = glyph(
  'm3 3 18 18M9 5.5a12 12 0 0 1 3-.5c6 0 10 7 10 7a20 20 0 0 1-4 4M6 6a21 21 0 0 0-4 6s4 7 10 7a12 12 0 0 0 5-1M10 10a3 3 0 0 0 4 4',
);

export const Plus = glyph('M12 5v14M5 12h14');
