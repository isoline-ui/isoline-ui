import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { Pressable } from './pressable.tsx';
import { Text } from './text.tsx';
import { ChevronDown } from './icons.tsx';
import { useThemeColors } from '../provider.tsx';

export interface AccordionProps extends ViewProps {
  title: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  disabled?: boolean;
  /** Keep expensive content mounted while collapsed; hidden content cannot receive focus. */
  keepMounted?: boolean;
  children: React.ReactNode;
}
export function Accordion({
  title,
  expanded,
  onExpandedChange,
  disabled,
  keepMounted = false,
  children,
  style,
  ...props
}: AccordionProps) {
  const colors = useThemeColors();
  const id = React.useId();
  return (
    <View {...props} style={[{ gap: 8 }, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ expanded, disabled }}
        aria-controls={id}
        disabled={disabled}
        onPress={() => onExpandedChange(!expanded)}
        style={{
          minHeight: 48,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          opacity: disabled ? 0.4 : 1,
        }}
      >
        <Text style={{ flex: 1 }}>{title}</Text>
        <View style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}>
          <ChevronDown size={20} color={colors.onSurface} />
        </View>
      </Pressable>
      {expanded || keepMounted ? (
        <View
          nativeID={id}
          style={expanded ? undefined : { display: 'none' }}
          accessibilityElementsHidden={!expanded}
          importantForAccessibility={expanded ? 'auto' : 'no-hide-descendants'}
        >
          {children}
        </View>
      ) : null}
    </View>
  );
}
