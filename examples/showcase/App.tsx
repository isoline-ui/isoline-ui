import './global.css';
import * as React from 'react';
import { ScrollView, View, Text as NativeText } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import {
  JetBrainsMono_500Medium,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import {
  IsolineProvider,
  themes,
  Text,
  Button,
  ButtonGroup,
  Switch,
  SearchField,
  TextField,
  SelectField,
  FilterChip,
  LoadingIndicator,
  BottomSheet,
  Dialog,
  DialogActions,
  MenuSheet,
  BackIcon,
  type ColorScheme,
} from '@isoline-ui/react-native';

import { MaterialSurface, useSystemTheme } from '@isoline-ui/native';

type Brand = keyof typeof themes;
export default function App() {
  const [ready] = useFonts({
    SpaceGrotesk_700Bold,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
  });
  if (!ready)
    return (
      <View>
        <NativeText>Loading showcase fonts…</NativeText>
      </View>
    );
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Showcase />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Showcase() {
  const insets = useSafeAreaInsets();
  const [brand, setBrand] = React.useState<Brand>('violet');
  const [scheme, setScheme] = React.useState<ColorScheme>('light');
  const [query, setQuery] = React.useState('');
  const [value, setValue] = React.useState('');
  const [enabled, setEnabled] = React.useState(true);
  const [sheet, setSheet] = React.useState(false);
  const [dialog, setDialog] = React.useState(false);
  const [menu, setMenu] = React.useState(false);
  const [status, setStatus] = React.useState('Choose a theme and try the controls.');
  const [systemColors, setSystemColors] = React.useState(true);
  const theme = useSystemTheme(themes[brand][scheme], systemColors);
  return (
    <IsolineProvider theme={theme} labels={{ close: 'Close' }}>
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{
          padding: 24,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 32,
          gap: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="display">Isoline UI</Text>
        <Text variant="body">
          One component system. Three identities. Platform-aware interaction.
        </Text>
        <SelectField<Brand>
          value={brand}
          onChange={setBrand}
          accessibilityLabel="Theme"
          options={[
            { id: 'violet', label: 'Violet' },
            { id: 'teal', label: 'Teal' },
            { id: 'cyan', label: 'Cyan' },
          ]}
        />
        <ButtonGroup<ColorScheme>
          value={scheme}
          onChange={setScheme}
          items={[
            { id: 'light', label: 'Light' },
            { id: 'dark', label: 'Dark' },
          ]}
        />
        <View className="flex-row items-center justify-between">
          <Text>Android system colors</Text>
          <Switch
            value={systemColors}
            onValueChange={setSystemColors}
            accessibilityLabel="Use Android system colors"
          />
        </View>
        <MaterialSurface style={{ padding: 20, borderRadius: 24, gap: 12 }}>
          <Text variant="heading">Platform material</Text>
          <Text>Native Liquid Glass on supported iOS; a themed surface elsewhere.</Text>
          <Button
            label="Material action"
            onPress={() => setStatus('Material action pressed.')}
          />
        </MaterialSurface>
        <Text variant="heading">Actions</Text>
        <Button label="Primary action" onPress={() => setStatus('Primary action pressed.')} />
        <Button
          label="Tonal action"
          variant="tonal"
          onPress={() => setStatus('Tonal action pressed.')}
        />
        <Button label="Disabled action" disabled />
        <View className="flex-row items-center justify-between">
          <Text>Native switch</Text>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            accessibilityLabel="Example preference"
          />
        </View>
        <FilterChip
          label="Selected chip"
          selected={enabled}
          onPress={() => setEnabled(!enabled)}
        />
        <Text variant="heading">Input</Text>
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Search components"
          accessibilityLabel="Search components"
          clearAccessibilityLabel="Clear search"
        />
        <TextField
          label="Example field"
          value={value}
          onChangeText={setValue}
          notchClassName="bg-background"
        />
        <Text variant="value">42.00</Text>
        <Text variant="caption">{status}</Text>
        <View className="flex-row items-center gap-4">
          <BackIcon />
          <LoadingIndicator size={40} contained />
        </View>
        <Text variant="heading">Overlays</Text>
        <Button label="Open sheet" variant="secondary" onPress={() => setSheet(true)} />
        <Button label="Open dialog" variant="outline" onPress={() => setDialog(true)} />
        <Button label="Open menu" variant="ghost" onPress={() => setMenu(true)} />
      </ScrollView>
      <BottomSheet visible={sheet} onClose={() => setSheet(false)}>
        <View className="gap-4">
          <Text variant="heading">Shared sheet</Text>
          <Text>Drag the handle, use Close with a screen reader, or tap outside.</Text>
          <TextField
            label="Type with the keyboard open"
            value={value}
            onChangeText={setValue}
          />
          <Button label="Done" onPress={() => setSheet(false)} />
        </View>
      </BottomSheet>
      <Dialog visible={dialog} onClose={() => setDialog(false)}>
        <Text variant="heading">Shared dialog</Text>
        <TextField label="Example input" value={value} onChangeText={setValue} />
        <DialogActions>
          <Button label="Cancel" variant="ghost" size="s" onPress={() => setDialog(false)} />
          <Button label="Done" size="s" onPress={() => setDialog(false)} />
        </DialogActions>
      </Dialog>
      <MenuSheet
        visible={menu}
        onClose={() => setMenu(false)}
        title="Shared menu"
        items={[
          {
            id: 'back',
            label: 'Example action',
            icon: BackIcon,
            onPress: () => setStatus('Menu action pressed.'),
          },
        ]}
      />
    </IsolineProvider>
  );
}
