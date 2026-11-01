import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Text as RNText } from 'react-native';

import { useIsolinePlatform, useIsolineTheme } from '../provider.tsx';
import { cn } from '../utils.ts';
import type { TextVariant } from '../theme.ts';

const textVariants = cva('text-foreground', {
  variants: {
    variant: {
      default: 'text-base leading-6',
      display: 'text-[40px] leading-[46px] font-extrabold tracking-[-0.02em]',
      title: 'text-[32px] leading-9 font-extrabold tracking-[-0.015em]',
      heading: 'text-[22px] leading-7 font-bold tracking-tight',
      subject: 'text-base font-semibold tracking-tight',
      body: 'text-base leading-6',
      reader: 'text-[18px] leading-[30px]',
      muted: 'text-sm text-muted-foreground',
      caption: 'text-sm text-muted-foreground',
      labelLarge: 'text-[15px] font-semibold tracking-[0.01em]',
      label: 'text-sm font-semibold tracking-[0.01em] text-muted-foreground',
      mono: 'font-mono text-sm text-muted-foreground',
      value: 'font-mono text-[15px] leading-[22px]',
      valueLarge: 'font-mono text-[22px] leading-7 font-bold',
      meta: 'text-[13px] leading-[18px] text-muted-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
});

export type TextProps = React.ComponentProps<typeof RNText> & VariantProps<typeof textVariants>;
export function Text({ className, variant, style, ...props }: TextProps) {
  const theme = useIsolineTheme();
  const ios = useIsolinePlatform() === 'ios';
  const role = variant ?? 'default';
  const iosType = {
    default: { fontSize: 17, lineHeight: 22 },
    body: { fontSize: 17, lineHeight: 22 },
    display: { fontSize: 34, lineHeight: 41, fontWeight: '700' as const },
    title: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
    heading: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const },
    caption: { fontSize: 13, lineHeight: 18 },
    label: { fontSize: 13, lineHeight: 18 },
  };
  return (
    <RNText
      className={cn(textVariants({ variant }), className)}
      style={[
        ios && iosType[role as keyof typeof iosType],
        theme.typography?.[(variant ?? 'default') as TextVariant],
        style,
      ]}
      {...props}
    />
  );
}
export { textVariants };
