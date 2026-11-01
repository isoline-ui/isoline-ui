import * as React from 'react';
import { ScrollView, View } from 'react-native';
import {
  IsolineProvider,
  themes,
  Text,
  Button,
  Pressable,
  ButtonGroup,
  FilterChip,
  TextField,
  SearchField,
  Switch,
  LoadingIndicator,
  WavyProgress,
  ExpressiveShape,
  Dialog,
  DialogActions,
  BottomSheet,
  MenuSheet,
  Toolbar,
  NavigationBar,
  IconButton,
  BackIcon,
  SelectField,
  useThemeColors,
  type IsolinePlatform,
} from '@isoline-ui/react-native';
import { MaterialSurface } from '@isoline-ui/native';

type Config = { platform: IsolinePlatform; theme: 'violet' | 'teal' | 'cyan'; dark: boolean };
/** Same components as native; only the host and material implementation differ. */
export function BrowserPreview() {
  const params = new URLSearchParams(window.location.search);
  const kind = params.get('kind') ?? 'default';
  const de = params.get('locale') === 'de';
  const [config, setConfig] = React.useState<Config>({
    platform: 'ios',
    theme: 'violet',
    dark: false,
  });
  React.useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== window.parent ||
        event.data?.type !== 'isoline-preview-config'
      )
        return;
      const { platform, theme, dark } = event.data;
      if (
        (platform !== 'ios' && platform !== 'android') ||
        !['violet', 'teal', 'cyan'].includes(theme) ||
        typeof dark !== 'boolean'
      )
        return;
      setConfig({ platform, theme, dark });
    };
    window.addEventListener('message', receive);
    window.parent.postMessage({ type: 'isoline-preview-ready' }, window.location.origin);
    return () => window.removeEventListener('message', receive);
  }, []);
  return (
    <IsolineProvider
      theme={themes[config.theme][config.dark ? 'dark' : 'light']}
      platform={config.platform}
      surfaceComponent={MaterialSurface}
      labels={{ close: de ? 'Schließen' : 'Close' }}
    >
      <PreviewContent kind={kind} de={de} />
    </IsolineProvider>
  );
}
function PreviewContent({ kind, de }: { kind: string; de: boolean }) {
  const colors = useThemeColors();
  const [value, setValue] = React.useState('');
  const [selected, setSelected] = React.useState('all');
  const [enabled, setEnabled] = React.useState(true);
  const [overlay, setOverlay] = React.useState('');
  const [status, setStatus] = React.useState('');
  const say = (label: string) => () =>
    setStatus(de ? `${label} ausgewählt` : `${label} selected`);
  const items = [
    { id: 'all', label: de ? 'Alle' : 'All' },
    { id: 'saved', label: de ? 'Gespeichert' : 'Saved' },
    { id: 'recent', label: de ? 'Zuletzt' : 'Recent' },
  ];
  const actions = (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {(['default', 'tonal', 'outline', 'ghost'] as const).map((variant, i) => (
        <Button
          key={variant}
          variant={variant}
          size="s"
          label={
            [
              de ? 'Speichern' : 'Save',
              de ? 'Entwurf' : 'Draft',
              de ? 'Abbrechen' : 'Cancel',
              de ? 'Mehr' : 'More',
            ][i]
          }
          onPress={say(variant)}
        />
      ))}
      <Button label={de ? 'Deaktiviert' : 'Disabled'} size="s" disabled />
    </View>
  );
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentContainerStyle={{ padding: 20, gap: 18 }}
      keyboardShouldPersistTaps="handled"
    >
      {kind === 'default' && (
        <>
          <NavigationBar
            title={de ? 'Übersicht' : 'Overview'}
            leading={
              <IconButton
                icon={BackIcon}
                accessibilityLabel={de ? 'Zurück' : 'Back'}
                onPress={say('Back')}
              />
            }
          />
          <Text variant="display">{de ? 'Dein Bereich' : 'Your space'}</Text>
          <Text variant="caption">
            {de ? 'Platz für deine Ideen.' : 'Room for your ideas.'}
          </Text>
          <ButtonGroup value={selected} onChange={setSelected} items={items} />
          <View
            style={{
              backgroundColor: colors.surfaceContainerLowest,
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            {items.slice(0, 2).map((item, i) => (
              <View
                key={item.id}
                style={{
                  padding: 14,
                  borderBottomWidth: i === 0 ? 1 : 0,
                  borderBottomColor: colors.outlineVariant,
                }}
              >
                <Pressable
                  accessibilityRole="button"
                  onPress={say(item.label)}
                  style={{
                    minHeight: 44,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <Text style={{ color: colors.onSurface }}>{item.label}</Text>
                  <Text variant="caption">{i ? 6 : 12} ›</Text>
                </Pressable>
              </View>
            ))}
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <Text>{de ? 'Benachrichtigungen' : 'Notifications'}</Text>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              accessibilityLabel={de ? 'Benachrichtigungen' : 'Notifications'}
            />
          </View>
          <Toolbar>
            <Text variant="caption">{de ? 'Neue Ideen' : 'New ideas'}</Text>
            <Button
              label={de ? 'Hinzufügen' : 'Add'}
              size="s"
              onPress={say(de ? 'Hinzufügen' : 'Add')}
            />
          </Toolbar>
        </>
      )}
      {kind === 'button' && actions}
      {kind === 'group' && (
        <ButtonGroup value={selected} onChange={setSelected} items={items} />
      )}
      {kind === 'filters' && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {['Design', 'React Native', 'Expo'].map((label) => (
            <FilterChip
              key={label}
              label={label}
              selected={selected === label}
              onPress={() => setSelected(selected === label ? '' : label)}
            />
          ))}
        </View>
      )}
      {kind === 'fields' && (
        <>
          <TextField
            label={de ? 'Projektname' : 'Project name'}
            value={value}
            onChangeText={setValue}
            placeholder={de ? 'Eine neue Idee' : 'A new idea'}
          />
          <SearchField
            value={value}
            onChangeText={setValue}
            placeholder={de ? 'Suchen…' : 'Search…'}
            accessibilityLabel={de ? 'Vorschau durchsuchen' : 'Search preview'}
            clearAccessibilityLabel={de ? 'Suche leeren' : 'Clear search'}
          />
          <SelectField
            value={selected}
            onChange={setSelected}
            options={items}
            accessibilityLabel={de ? 'Ansicht' : 'View'}
          />
        </>
      )}
      {kind === 'switch' && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text>{de ? 'Benachrichtigungen' : 'Notifications'}</Text>
          <Switch
            value={enabled}
            onValueChange={setEnabled}
            accessibilityLabel={de ? 'Benachrichtigungen' : 'Notifications'}
          />
        </View>
      )}
      {kind === 'text' && (
        <>
          <Text variant="display">{de ? 'Worte mit Gewicht.' : 'Words with presence.'}</Text>
          <Text>
            {de
              ? 'Lesbare Texte und klare Hierarchie.'
              : 'Readable text and a clear hierarchy.'}
          </Text>
          <Text variant="value">42.00</Text>
        </>
      )}
      {kind === 'loading' && (
        <>
          <LoadingIndicator size={40} />
          <WavyProgress progress={0.62} />
          <Text variant="caption">{de ? 'Wird geladen…' : 'Loading…'}</Text>
        </>
      )}
      {kind === 'shapes' && (
        <View style={{ flexDirection: 'row', gap: 16 }}>
          {(['clover', 'cookie', 'flower'] as const).map((shape) => (
            <ExpressiveShape key={shape} shape={shape} size={64} color={colors.primary} />
          ))}
        </View>
      )}
      {kind === 'surface' && (
        <View
          style={{
            padding: 24,
            backgroundColor: colors.primaryContainer,
            borderRadius: 20,
            gap: 24,
          }}
        >
          <Text variant="title">{de ? 'In deinem Element' : 'In your element'}</Text>
          <Toolbar>
            <IconButton
              icon={BackIcon}
              accessibilityLabel={de ? 'Zurück' : 'Back'}
              onPress={say('Back')}
            />
            <Text>{de ? 'Dein Projekt' : 'Your project'}</Text>
            <Button label={de ? 'Neu' : 'New'} size="s" onPress={say('New')} />
          </Toolbar>
          <Text variant="caption">
            {de
              ? 'Web: CSS-Glas mit solider Alternative.'
              : 'Web: CSS glass with a solid fallback.'}
          </Text>
        </View>
      )}
      {kind === 'overlays' && (
        <>
          <Button
            label={de ? 'Dialog öffnen' : 'Open dialog'}
            onPress={() => setOverlay('dialog')}
          />
          <Button
            label={de ? 'Sheet öffnen' : 'Open sheet'}
            variant="tonal"
            onPress={() => setOverlay('sheet')}
          />
          <Button
            label={de ? 'Menü öffnen' : 'Open menu'}
            variant="ghost"
            onPress={() => setOverlay('menu')}
          />
        </>
      )}
      <Text variant="caption" accessibilityLiveRegion="polite">
        {status}
      </Text>
      <Dialog visible={overlay === 'dialog'} onClose={() => setOverlay('')}>
        <Text variant="heading">{de ? 'Eine neue Idee' : 'A new idea'}</Text>
        <TextField
          label={de ? 'Projektname' : 'Project name'}
          value={value}
          onChangeText={setValue}
        />
        <DialogActions>
          <Button
            label={de ? 'Abbrechen' : 'Cancel'}
            size="s"
            variant="ghost"
            onPress={() => setOverlay('')}
          />
          <Button label={de ? 'Speichern' : 'Save'} size="s" onPress={() => setOverlay('')} />
        </DialogActions>
      </Dialog>
      <BottomSheet visible={overlay === 'sheet'} onClose={() => setOverlay('')}>
        <Text variant="heading">{de ? 'Deine Auswahl' : 'Your selection'}</Text>
        <ButtonGroup value={selected} onChange={setSelected} items={items} />
      </BottomSheet>
      <MenuSheet
        visible={overlay === 'menu'}
        title={de ? 'Aktionen' : 'Actions'}
        onClose={() => setOverlay('')}
        items={[
          { id: 'back', icon: BackIcon, label: de ? 'Zurück' : 'Back', onPress: say('Back') },
        ]}
      />
    </ScrollView>
  );
}
