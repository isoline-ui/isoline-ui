import * as React from 'react';
import { ScrollView, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from './text.tsx';
import { Button } from './button.tsx';
import { IconButton } from './icon-button.tsx';
import { BackButton } from './back-button.tsx';
import { X } from './icons.tsx';
import type { MaterialOptions } from '../provider.tsx';

export interface SelectionHeaderProps {
  count: number;
  countLabel: string;
  allSelected: boolean;
  onClear: () => void;
  onToggleAll: () => void;
  clearLabel: string;
  selectAllLabel: string;
  deselectAllLabel: string;
}
export function SelectionHeader({
  count,
  countLabel,
  allSelected,
  onClear,
  onToggleAll,
  clearLabel,
  selectAllLabel,
  deselectAllLabel,
}: SelectionHeaderProps) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
      <IconButton icon={X} accessibilityLabel={clearLabel} onPress={onClear} />
      <Text accessibilityLiveRegion="polite" style={{ flex: 1, fontWeight: '600' }}>
        {countLabel}
      </Text>
      <Button
        size="s"
        variant="ghost"
        label={allSelected ? deselectAllLabel : selectAllLabel}
        onPress={onToggleAll}
      />
    </View>
  );
}
export interface ListSectionHeaderProps {
  title: string;
  first?: boolean;
  trailing?: React.ReactNode;
}
export function ListSectionHeader({ title, first, trailing }: ListSectionHeaderProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingTop: first ? 0 : 16,
        paddingBottom: 4,
      }}
    >
      <Text accessibilityRole="header" variant="label" style={{ flex: 1 }}>
        {title}
      </Text>
      {trailing}
    </View>
  );
}
export interface JumpToTopPillProps extends MaterialOptions {
  label: string;
  onPress: () => void;
  count?: number;
  accessibilityLabel?: string;
}
export function JumpToTopPill({
  label,
  onPress,
  count = 0,
  accessibilityLabel,
  ...materialOptions
}: JumpToTopPillProps) {
  return (
    <Button
      {...materialOptions}
      label={label}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onPress}
      variant={count > 0 ? 'default' : 'tonal'}
      size="s"
    />
  );
}
export interface SettingsScreenLayoutProps {
  title: string;
  caption?: string;
  onBack: () => void;
  backLabel: string;
  children: React.ReactNode;
  overlay?: React.ReactNode;
  scrollProps?: Omit<ScrollViewProps, 'children'>;
}
/** Screen geometry without a router dependency. Overlays stay outside the scrolling content. */
export function SettingsScreenLayout({
  title,
  caption,
  onBack,
  backLabel,
  children,
  overlay,
  scrollProps,
}: SettingsScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}>
        <BackButton onPress={onBack} label={backLabel} />
        <Text variant="title" accessibilityRole="header">
          {title}
        </Text>
        {caption ? <Text variant="caption">{caption}</Text> : null}
      </View>
      <ScrollView
        {...scrollProps}
        contentContainerStyle={[
          { padding: 16, paddingBottom: insets.bottom + 24, gap: 20 },
          scrollProps?.contentContainerStyle,
        ]}
      >
        {children}
      </ScrollView>
      {overlay}
    </View>
  );
}
