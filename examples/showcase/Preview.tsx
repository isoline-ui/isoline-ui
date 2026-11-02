import * as React from 'react';
import { CatalogExamples } from './CatalogExamples';
import { MaterialExamples } from './MaterialExamples';
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
  useIsolinePlatform,
  type IsolinePlatform,
} from '@isoline-ui/react-native';
import { MaterialSurface, MaterialGroup } from '@isoline-ui/native';

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
      surfaceGroupComponent={MaterialGroup}
      labels={{ close: de ? 'Schließen' : 'Close' }}
    >
      <View
        testID="preview-root"
        nativeID={`preview-root-${config.platform}`}
        style={{ flex: 1 }}
      >
        <PreviewContent kind={kind} de={de} />
      </View>
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
  if (kind.startsWith('catalog-')) return <CatalogExamples kind={kind} de={de} />;
  if (
    [
      'materials',
      'material-controls',
      'tab-bar',
      'surface-group',
      'popover',
      'floating-actions',
      'navigation',
      'material-overlays',
    ].includes(kind)
  )
    return <MaterialExamples kind={kind} de={de} />;
  if (kind === 'surface') return <GlassSurfacePreview de={de} />;
  if (kind === 'toolbar') return <FloatingToolbarPreview de={de} />;
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

function FloatingToolbarPreview({ de }: { de: boolean }) {
  const colors = useThemeColors();
  const [solid, setSolid] = React.useState(false);
  const [menu, setMenu] = React.useState(false);
  const [status, setStatus] = React.useState('');
  return (
    <View style={{ flex: 1, padding: 16, gap: 12, backgroundColor: colors.surface }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <Text variant="caption">{de ? 'Solide Darstellung' : 'Solid surface'}</Text>
        <Switch
          value={solid}
          onValueChange={setSolid}
          accessibilityLabel={de ? 'Solide Darstellung' : 'Solid surface'}
        />
      </View>
      <View
        testID="toolbar-scene"
        style={{
          flex: 1,
          minHeight: 260,
          borderRadius: 16,
          overflow: 'hidden',
          backgroundColor: colors.surfaceContainer,
        }}
      >
        <ScrollView
          testID="toolbar-scroll"
          contentContainerStyle={{ padding: 12, paddingBottom: 104, gap: 12 }}
        >
          <Text variant="title">{de ? 'Deine Sammlung' : 'Your collection'}</Text>
          {Array.from({ length: 6 }, (_, index) => (
            <View
              key={index}
              style={{
                minHeight: 96,
                padding: 16,
                borderRadius: 16,
                backgroundColor: index % 2 ? colors.tertiaryContainer : colors.primaryContainer,
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <Text variant="subject">
                {de ? 'Projekt' : 'Project'} {index + 1}
              </Text>
              <Text variant="caption">
                {de
                  ? 'Scrolle den Inhalt – die Toolbar bleibt erreichbar.'
                  : 'Scroll the content — the toolbar stays within reach.'}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[colors.primary, colors.tertiary, colors.onPrimaryContainer].map((color) => (
                  <View
                    key={color}
                    style={{ flex: 1, height: 20, borderRadius: 6, backgroundColor: color }}
                  />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
        <Toolbar
          testID="floating-toolbar"
          material={solid ? 'solid' : 'auto'}
          style={{ position: 'absolute', left: 12, right: 12, bottom: 12 }}
        >
          <IconButton
            icon={BackIcon}
            accessibilityLabel={de ? 'Zurück' : 'Back'}
            onPress={() => setStatus(de ? 'Zurück ausgewählt' : 'Back selected')}
          />
          <Button
            label={de ? 'Neu' : 'New'}
            size="s"
            onPress={() => setStatus(de ? 'Eintrag hinzugefügt' : 'Item added')}
          />
          <Button
            label={de ? 'Mehr' : 'More'}
            variant="ghost"
            size="s"
            onPress={() => setMenu(true)}
          />
        </Toolbar>
      </View>
      <Text variant="caption" accessibilityLiveRegion="polite">
        {status ||
          (de
            ? 'Scrolle die Sammlung und probiere die Aktionen aus.'
            : 'Scroll the collection and try the actions.')}
      </Text>
      <MenuSheet
        visible={menu}
        onClose={() => setMenu(false)}
        title={de ? 'Weitere Aktionen' : 'More actions'}
        items={[
          {
            id: 'example',
            icon: BackIcon,
            label: de ? 'Zur Übersicht' : 'Go to overview',
            onPress: () => setStatus(de ? 'Übersicht ausgewählt' : 'Overview selected'),
          },
        ]}
      />
    </View>
  );
}

function GlassSurfacePreview({ de }: { de: boolean }) {
  const colors = useThemeColors();
  const ios = useIsolinePlatform() === 'ios';
  const [solid, setSolid] = React.useState(false);
  const [glassStyle, setGlassStyle] = React.useState<'regular' | 'clear'>('clear');
  const [status, setStatus] = React.useState('');
  return (
    <View style={{ flex: 1, padding: 16, gap: 12, backgroundColor: colors.surface }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <Text variant="caption">{de ? 'Solide Darstellung' : 'Solid surface'}</Text>
        <Switch
          value={solid}
          onValueChange={setSolid}
          accessibilityLabel={de ? 'Solide Darstellung' : 'Solid surface'}
        />
      </View>
      <ButtonGroup
        value={glassStyle}
        onChange={setGlassStyle}
        items={[
          { id: 'regular', label: de ? 'Regulär' : 'Regular' },
          { id: 'clear', label: de ? 'Klar' : 'Clear' },
        ]}
      />
      <View
        testID="glass-scene"
        style={{
          flex: 1,
          minHeight: 220,
          borderRadius: 20,
          overflow: 'hidden',
          backgroundColor: colors.primaryContainer,
        }}
      >
        <View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <View
            testID="glass-backdrop-color"
            style={{
              position: 'absolute',
              left: -32,
              right: -32,
              top: 64,
              height: 104,
              backgroundColor: colors.primary,
              transform: [{ rotate: '-16deg' }],
            }}
          />
          <View
            style={{
              position: 'absolute',
              left: '45%',
              right: -24,
              top: 0,
              bottom: -32,
              backgroundColor: colors.tertiary,
              transform: [{ rotate: '24deg' }],
            }}
          />
          <Text
            style={{
              position: 'absolute',
              left: 16,
              top: 12,
              fontSize: 94,
              lineHeight: 110,
              fontWeight: '700',
              color: colors.onPrimaryContainer,
            }}
          >
            Aa
          </Text>
          <Text
            style={{
              position: 'absolute',
              right: 12,
              bottom: 12,
              fontSize: 76,
              lineHeight: 90,
              fontWeight: '700',
              color: colors.onTertiary,
            }}
          >
            42
          </Text>
        </View>
        <MaterialSurface
          testID="glass-example-surface"
          material={ios && !solid ? 'auto' : 'solid'}
          glassStyle={glassStyle}
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 24,
            borderRadius: 24,
            padding: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Text variant="subject" style={{ flex: 1 }}>
              {de ? 'Dein Projekt' : 'Your project'}
            </Text>
            <Button
              label={de ? 'Neu' : 'New'}
              size="s"
              onPress={() => setStatus(de ? 'Eintrag hinzugefügt' : 'Item added')}
            />
          </View>
        </MaterialSurface>
      </View>
      <Text variant="caption" accessibilityLiveRegion="polite">
        {status ||
          (de
            ? 'Vergleiche Glas und solide Fläche über demselben Hintergrund.'
            : 'Compare glass and a solid surface over the same backdrop.')}
      </Text>
    </View>
  );
}
