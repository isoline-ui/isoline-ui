import * as React from 'react';
import { ScrollView, View } from 'react-native';
import {
  Button,
  IconButton,
  ButtonGroup,
  SearchField,
  SelectField,
  TabBar,
  ContextMenu,
  Popover,
  SurfaceGroup,
  FloatingActionButton,
  FabMenu,
  SplitButton,
  Toolbar,
  TopBar,
  NavigationBar,
  Dialog,
  DialogActions,
  BottomSheet,
  PanelSheet,
  Snackbar,
  Text,
  Switch,
  useThemeColors,
  BackIcon,
  type MaterialOptions,
} from '@isoline-ui/react-native';
import { Plus, Search, X } from '../../packages/react-native/src/components/icons';

function Stage({ children }: { children: React.ReactNode }) {
  const colors = useThemeColors();
  return (
    <View
      style={{
        minHeight: 150,
        padding: 16,
        gap: 12,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: colors.primaryContainer,
      }}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 55,
          left: -20,
          right: -20,
          height: 68,
          backgroundColor: colors.tertiary,
          transform: [{ rotate: '-14deg' }],
        }}
      />
      {children}
    </View>
  );
}
export function MaterialExamples({
  kind = 'materials',
  de = false,
}: {
  kind?: string;
  de?: boolean;
}) {
  const colors = useThemeColors();
  const [solid, setSolid] = React.useState(false);
  const [glassStyle, setGlassStyle] = React.useState<'regular' | 'clear'>('regular');
  const [query, setQuery] = React.useState('');
  const [tab, setTab] = React.useState('home');
  const [segment, setSegment] = React.useState('all');
  const [collection, setCollection] = React.useState('recent');
  const [status, setStatus] = React.useState('');
  const [overlay, setOverlay] = React.useState('');
  const [joined, setJoined] = React.useState(false);
  const anchor = React.useRef<React.ComponentRef<typeof View>>(null);
  const material: MaterialOptions = { material: solid ? 'solid' : 'auto', glassStyle };
  const show = (name: string) => kind === 'materials' || kind === name;
  const say = (label: string) => () => setStatus(label);
  const heading = (en: string, german: string) => (de ? german : en);
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentContainerStyle={{ padding: 16, gap: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Text variant="caption">{heading('Solid material', 'Solides Material')}</Text>
        <Switch
          value={solid}
          onValueChange={setSolid}
          accessibilityLabel={heading('Solid material', 'Solides Material')}
        />
      </View>
      <ButtonGroup
        value={glassStyle}
        onChange={setGlassStyle}
        items={[
          { id: 'regular', label: heading('Regular', 'Regulär') },
          { id: 'clear', label: heading('Clear', 'Klar') },
        ]}
      />
      {show('material-controls') && (
        <>
          <Text variant="heading">{heading('Actions and search', 'Aktionen und Suche')}</Text>
          <Stage>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Button
                {...material}
                label={heading('Glass action', 'Glasaktion')}
                size="s"
                onPress={say(heading('Action selected', 'Aktion ausgewählt'))}
              />
              <IconButton
                {...material}
                icon={Plus}
                size={48}
                accessibilityLabel={heading('Add item', 'Eintrag hinzufügen')}
                onPress={say(heading('Item added', 'Eintrag hinzugefügt'))}
              />
            </View>
            <Button
              {...material}
              label={heading('Disabled action', 'Deaktivierte Aktion')}
              disabled
              onPress={say('ERROR disabled action')}
            />
            <SearchField
              {...material}
              value={query}
              onChangeText={setQuery}
              placeholder={heading('Search', 'Suchen')}
              accessibilityLabel={heading('Material search', 'Materialsuche')}
              clearAccessibilityLabel={heading('Clear material search', 'Materialsuche leeren')}
            />
            <SelectField
              {...material}
              value={collection}
              onChange={setCollection}
              accessibilityLabel={heading('Choose collection', 'Sammlung wählen')}
              options={[
                { id: 'recent', label: heading('Recent', 'Zuletzt') },
                {
                  id: 'locked',
                  label: heading('Unavailable collection', 'Nicht verfügbare Sammlung'),
                  disabled: true,
                },
                ...Array.from({ length: 12 }, (_, index) => ({
                  id: String(index + 1),
                  label: `${heading('Collection', 'Sammlung')} ${index + 1}`,
                })),
              ]}
            />
            <ButtonGroup
              {...material}
              value={segment}
              onChange={setSegment}
              items={[
                { id: 'all', label: heading('All', 'Alle') },
                { id: 'saved', label: heading('Saved', 'Gesichert') },
                { id: 'locked', label: heading('Locked', 'Gesperrt'), disabled: true },
              ]}
            />
          </Stage>
        </>
      )}
      {show('tab-bar') && (
        <>
          <Text variant="heading">{heading('Tab navigation', 'Tab-Navigation')}</Text>
          <Stage>
            <Text>
              {tab === 'home'
                ? heading('Home content', 'Startinhalt')
                : heading('Search content', 'Suchinhalt')}
            </Text>
            <TabBar
              {...material}
              value={tab}
              onChange={setTab}
              accessibilityLabel={heading('Main tabs', 'Hauptbereiche')}
              items={[
                { id: 'home', label: heading('Home', 'Start'), icon: BackIcon },
                {
                  id: 'search',
                  label: heading('Search tab', 'Suchbereich'),
                  icon: Search,
                  badge: 2,
                },
                {
                  id: 'locked',
                  label: heading('Locked tab', 'Gesperrter Bereich'),
                  icon: X,
                  disabled: true,
                },
              ]}
            />
          </Stage>
        </>
      )}
      {show('surface-group') && (
        <>
          <Text variant="heading">{heading('Grouped surfaces', 'Gruppierte Flächen')}</Text>
          <Stage>
            <SurfaceGroup
              spacing={28}
              gap={joined ? 4 : 24}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Button
                {...material}
                label={heading('First', 'Erste')}
                size="s"
                onPress={say(heading('First selected', 'Erste ausgewählt'))}
              />
              <IconButton
                {...material}
                icon={Plus}
                size={48}
                accessibilityLabel={heading('Grouped action', 'Gruppierte Aktion')}
                onPress={say(heading('Group action selected', 'Gruppenaktion ausgewählt'))}
              />
            </SurfaceGroup>
            <Button
              size="s"
              label={
                joined
                  ? heading('Separate surfaces', 'Flächen trennen')
                  : heading('Bring surfaces together', 'Flächen zusammenführen')
              }
              onPress={() => setJoined((value) => !value)}
            />
            <Text variant="caption">
              {heading(
                'Native glass blends where supported; web preserves separate surfaces.',
                'Natives Glas verbindet sich, sofern unterstützt; im Web bleiben die Flächen getrennt.',
              )}
            </Text>
          </Stage>
        </>
      )}
      {show('popover') && (
        <>
          <Text variant="heading">{heading('Anchored surfaces', 'Verankerte Flächen')}</Text>
          <Stage>
            <View ref={anchor} collapsable={false}>
              <Button
                label={heading('Open popover', 'Popover öffnen')}
                size="s"
                onPress={() => setOverlay('popover')}
              />
            </View>
            <ContextMenu
              {...material}
              accessibilityLabel={heading('Context actions', 'Kontextaktionen')}
              items={[
                {
                  id: 'rename',
                  label: heading('Rename', 'Umbenennen'),
                  icon: Plus,
                  onPress: say(heading('Rename selected', 'Umbenennen ausgewählt')),
                },
                {
                  id: 'selected',
                  label: heading('Selected action', 'Ausgewählte Aktion'),
                  selected: true,
                  onPress: say('Selected'),
                },
                {
                  id: 'locked',
                  label: heading('Unavailable action', 'Nicht verfügbare Aktion'),
                  disabled: true,
                  onPress: say('ERROR disabled menu'),
                },
                {
                  id: 'delete',
                  label: heading('Delete', 'Löschen'),
                  destructive: true,
                  icon: X,
                  onPress: say(heading('Delete selected', 'Löschen ausgewählt')),
                },
              ]}
            >
              <View
                style={{
                  minHeight: 44,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: colors.surfaceContainerLowest,
                }}
              >
                <Text>{heading('Open context menu', 'Kontextmenü öffnen')}</Text>
              </View>
            </ContextMenu>
          </Stage>
        </>
      )}
      {show('floating-actions') && (
        <>
          <Text variant="heading">
            {heading('Floating and split actions', 'Schwebende und geteilte Aktionen')}
          </Text>
          <Stage>
            <FloatingActionButton
              {...material}
              icon={Plus}
              label={heading('New item', 'Neuer Eintrag')}
              accessibilityLabel={heading('Create item', 'Eintrag erstellen')}
              onPress={say(heading('Item created', 'Eintrag erstellt'))}
            />
            <SplitButton
              {...material}
              icon={Plus}
              label={heading('Create', 'Erstellen')}
              optionsLabel={heading('Create options', 'Erstelloptionen')}
              onPress={say(heading('Primary action selected', 'Hauptaktion ausgewählt'))}
              actions={[
                {
                  id: 'draft',
                  label: heading('Create draft', 'Entwurf erstellen'),
                  icon: Plus,
                  onPress: say(heading('Draft created', 'Entwurf erstellt')),
                },
                {
                  id: 'locked',
                  label: heading('Unavailable format', 'Nicht verfügbares Format'),
                  icon: X,
                  disabled: true,
                  onPress: say('ERROR disabled split'),
                },
              ]}
            />
            <View style={{ height: 100 }}>
              <FabMenu
                {...material}
                menuMaterial={material.material}
                bottom={8}
                label={heading('Capture menu', 'Erfassungsmenü')}
                actions={[
                  {
                    id: 'note',
                    icon: Plus,
                    label: heading('Capture note', 'Notiz erfassen'),
                    run: say(heading('Note captured', 'Notiz erfasst')),
                  },
                ]}
              />
            </View>
          </Stage>
        </>
      )}
      {show('navigation') && (
        <>
          <Text variant="heading">
            {heading('Navigation and toolbar', 'Navigation und Toolbar')}
          </Text>
          <Stage>
            <NavigationBar {...material} title={heading('Your library', 'Deine Bibliothek')} />
            <TopBar
              {...material}
              onBack={say(heading('Back selected', 'Zurück ausgewählt'))}
              center={<Text>{heading('Collection', 'Sammlung')}</Text>}
            />
            <Toolbar
              {...material}
              items={[
                {
                  id: 'back',
                  icon: BackIcon,
                  label: heading('Toolbar back', 'Toolbar zurück'),
                  onPress: say('Back'),
                },
                {
                  id: 'add',
                  icon: Plus,
                  label: heading('Toolbar add', 'Toolbar hinzufügen'),
                  onPress: say(heading('Toolbar action selected', 'Toolbar-Aktion ausgewählt')),
                  prominent: true,
                },
              ]}
            />
          </Stage>
        </>
      )}
      {show('material-overlays') && (
        <>
          <Text variant="heading">
            {heading('Explicit overlay materials', 'Explizite Overlay-Materialien')}
          </Text>
          <Stage>
            <Button
              label={heading('Open material dialog', 'Materialdialog öffnen')}
              size="s"
              onPress={() => setOverlay('dialog')}
            />
            <Button
              label={heading('Open material sheet', 'Material-Sheet öffnen')}
              size="s"
              onPress={() => setOverlay('sheet')}
            />
            <Button
              label={heading('Open material panel', 'Material-Panel öffnen')}
              size="s"
              onPress={() => setOverlay('panel')}
            />
            <View style={{ height: 80 }}>
              <Snackbar
                {...material}
                message={heading('Changes saved', 'Änderungen gespeichert')}
                actionLabel={heading('Undo', 'Rückgängig')}
                onAction={say(heading('Undo selected', 'Rückgängig ausgewählt'))}
              />
            </View>
          </Stage>
        </>
      )}
      <Text accessibilityLiveRegion="polite" variant="caption">
        {status}
      </Text>
      <Popover
        {...material}
        visible={overlay === 'popover'}
        onClose={() => setOverlay('')}
        anchorRef={anchor}
        accessibilityLabel={heading('Example popover', 'Beispiel-Popover')}
      >
        <Text variant="heading">{heading('Popover content', 'Popover-Inhalt')}</Text>
        <Button
          label={heading('Close popover', 'Popover schließen')}
          size="s"
          onPress={() => setOverlay('')}
        />
      </Popover>
      <Dialog {...material} visible={overlay === 'dialog'} onClose={() => setOverlay('')}>
        <Text variant="heading">{heading('Material dialog', 'Materialdialog')}</Text>
        <Text>
          {heading(
            'The solid default is unchanged.',
            'Der solide Standard bleibt unverändert.',
          )}
        </Text>
        <DialogActions>
          <Button
            label={heading('Close dialog', 'Dialog schließen')}
            size="s"
            onPress={() => setOverlay('')}
          />
        </DialogActions>
      </Dialog>
      <BottomSheet {...material} visible={overlay === 'sheet'} onClose={() => setOverlay('')}>
        <Text variant="heading">{heading('Material sheet', 'Material-Sheet')}</Text>
        <Button
          label={heading('Close sheet', 'Sheet schließen')}
          size="s"
          onPress={() => setOverlay('')}
        />
      </BottomSheet>
      <PanelSheet {...material} visible={overlay === 'panel'} onClose={() => setOverlay('')}>
        <Text variant="heading">{heading('Material panel', 'Material-Panel')}</Text>
        <Button
          label={heading('Close panel', 'Panel schließen')}
          size="s"
          onPress={() => setOverlay('')}
        />
      </PanelSheet>
    </ScrollView>
  );
}
