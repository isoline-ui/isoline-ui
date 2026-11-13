import * as React from 'react';
import { View, ScrollView } from 'react-native';
import * as UI from '@isoline-ui/react-native';

type StoryProps = { de?: boolean };
// Each story is also the complete, typechecked documentation example.
export function CheckboxExample({ de = false }: StoryProps) {
  const [checked, setChecked] = React.useState(false);
  const [mixed, setMixed] = React.useState<boolean | 'mixed'>('mixed');
  const t = (en: string, german: string) => (de ? german : en);
  return (
    <View style={{ gap: 12 }}>
      <UI.Checkbox
        checked={checked}
        onCheckedChange={setChecked}
        accessibilityLabel={t('Select item', 'Eintrag auswählen')}
        label={t('Select item', 'Eintrag auswählen')}
      />
      <UI.Checkbox
        checked={mixed}
        onCheckedChange={setMixed}
        accessibilityLabel={t('Mixed selection', 'Teilweise ausgewählt')}
        label={t('Mixed selection', 'Teilweise ausgewählt')}
      />
      <UI.Checkbox
        checked
        disabled
        onCheckedChange={() => {}}
        accessibilityLabel={t('Unavailable selection', 'Nicht verfügbare Auswahl')}
        label={t('Unavailable selection', 'Nicht verfügbare Auswahl')}
      />
      <UI.Text>
        {checked ? t('Selected', 'Ausgewählt') : t('Not selected', 'Nicht ausgewählt')}
      </UI.Text>
    </View>
  );
}
export function AvatarExample({ de = false }: StoryProps) {
  const [fallback, setFallback] = React.useState(false);
  const image =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABICAIAAACGBWc0AAAAk0lEQVR4nO3QQQ3AIAAEQbxgow7qAGF9IwJXmKiJe10mWQM7Yz0n0tw70v3eSKmvAQgQIECAAAECBAgQIECAAAECBAgQIECAAAECBKgCqHUs9QUIECBAgAABAgQIECBAgAABAgQIECBAgAABAgSoA6h1LPUFCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEqALoByp/Q1kKfgjjAAAAAElFTkSuQmCC';
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 24 }}>
      <UI.Avatar
        initials="AL"
        source={{ uri: fallback ? 'data:image/png;base64,invalid' : image }}
        accessibilityLabel="Alex Lee"
      />
      <UI.Avatar
        initials="JS"
        accessibilityLabel="Jamie Smith"
        size={64}
        accent="#8161c3"
        badge={<UI.Badge label="3" />}
      />
      <UI.Avatar initials="RK" accessibilityLabel="Robin Kim" size={80} />
      <UI.Text>
        {de
          ? 'Bild, Initialen und Badge kommen aus der App.'
          : 'The app supplies images, initials and badges.'}
      </UI.Text>
      <UI.Button
        size="s"
        variant="ghost"
        label={de ? 'Bild wechseln' : 'Toggle image'}
        onPress={() => setFallback((value) => !value)}
      />
    </View>
  );
}
export function SliderExample({ de = false }: StoryProps) {
  const [value, setValue] = React.useState(40);
  const t = (en: string, german: string) => (de ? german : en);
  return (
    <View style={{ gap: 20 }}>
      <UI.Slider
        value={value}
        onValueChange={setValue}
        minimumValue={0}
        maximumValue={100}
        step={5}
        accessibilityLabel={t('Intensity', 'Intensität')}
        valueLabel={`${value}%`}
        leadingLabel="0%"
        trailingLabel="100%"
      />
      <UI.Text>{value}%</UI.Text>
      <UI.Slider
        value={25}
        onValueChange={() => {}}
        disabled
        accessibilityLabel={t('Unavailable slider', 'Nicht verfügbarer Regler')}
        minimumValue={0}
        maximumValue={100}
      />
    </View>
  );
}
export function ActionChipExample({ de = false }: StoryProps) {
  const [status, setStatus] = React.useState('');
  const t = (en: string, german: string) => (de ? german : en);
  return (
    <View style={{ gap: 12 }}>
      <UI.ActionChip
        label={t('Add action', 'Aktion hinzufügen')}
        icon={UI.BackIcon}
        tone="primary"
        onPress={() => setStatus(t('Action selected', 'Aktion ausgewählt'))}
      />
      <UI.ActionChip
        label={t('Secondary action', 'Zweite Aktion')}
        tone="tertiary"
        onPress={() => setStatus(t('Secondary selected', 'Zweite ausgewählt'))}
      />
      <UI.ActionChip
        label={t('Disabled action', 'Deaktivierte Aktion')}
        disabled
        onPress={() => {}}
      />
      <UI.Text accessibilityLiveRegion="polite">{status}</UI.Text>
    </View>
  );
}
export function DatePickerExample({ de = false }: StoryProps) {
  const [date, setDate] = React.useState<string | null>('2026-11-18');
  const [month, setMonth] = React.useState('2026-11');
  const t = (en: string, german: string) => (de ? german : en);
  const labels = {
    previousMonth: t('Previous month', 'Vorheriger Monat'),
    nextMonth: t('Next month', 'Nächster Monat'),
  };
  return (
    <View style={{ gap: 16 }}>
      <UI.DateField
        label={t('Choose date', 'Datum wählen')}
        emptyLabel={t('No date', 'Kein Datum')}
        value={date}
        onChange={setDate}
        today="2026-11-18"
        locale={de ? 'de-DE' : 'en-US'}
        labels={labels}
        clearLabel={t('Clear date', 'Datum entfernen')}
      />
      <UI.MonthCalendar
        value={date}
        onChange={setDate}
        today="2026-11-18"
        month={month}
        onMonthChange={setMonth}
        minDate="2026-11-01"
        maxDate="2027-02-28"
        disabledDates={['2026-11-19']}
        locale={de ? 'de-DE' : 'en-US'}
        labels={labels}
        marks={{ '2026-11-20': { label: t('Two events', 'Zwei Termine'), count: 2 } }}
      />
      <UI.WeekStrip
        startDate="2026-11-16"
        value={date}
        onChange={setDate}
        today="2026-11-18"
        locale={de ? 'de-DE' : 'en-US'}
      />
      <UI.Text accessibilityLiveRegion="polite">{date ?? t('No date', 'Kein Datum')}</UI.Text>
    </View>
  );
}
export function TimePickerExample({ de = false }: StoryProps) {
  const [time, setTime] = React.useState<string | null>('09:00');
  const t = (en: string, german: string) => (de ? german : en);
  return (
    <View style={{ gap: 16 }}>
      <UI.TimeField
        label={t('Choose time', 'Uhrzeit wählen')}
        emptyLabel={t('No time', 'Keine Uhrzeit')}
        value={time}
        onChange={setTime}
        hourLabel={t('Hour', 'Stunde')}
        minuteLabel={t('Minute', 'Minute')}
        confirmLabel={t('Done', 'Fertig')}
        clearLabel={t('Clear time', 'Uhrzeit entfernen')}
      />
      <UI.TimeGrid
        value={time}
        onChange={setTime}
        hourLabel={t('Hour', 'Stunde')}
        minuteLabel={t('Minute', 'Minute')}
        minuteStep={15}
      />
      <UI.TimeChips
        value={time}
        onChange={setTime}
        options={[
          { value: '09:00', label: t('Morning', 'Morgens') },
          { value: '19:00', label: t('Evening', 'Abends') },
        ]}
      />
      <UI.Text accessibilityLiveRegion="polite">{time ?? '—'}</UI.Text>
    </View>
  );
}
export function ColorPickerExample({ de = false }: StoryProps) {
  const [color, setColor] = React.useState<string | null>('#7c4ab1');
  const [open, setOpen] = React.useState(false);
  const t = (en: string, german: string) => (de ? german : en);
  const swatches = [
    { value: '#7c4ab1', label: t('Violet', 'Violett') },
    { value: '#008577', label: t('Teal', 'Türkis') },
    { value: '#dc8045', label: t('Orange', 'Orange') },
    {
      value: '#777777',
      label: t('Unavailable color', 'Nicht verfügbare Farbe'),
      disabled: true,
    },
  ];
  return (
    <View style={{ gap: 20 }}>
      <UI.ColorSwatchPicker
        value={color}
        onChange={setColor}
        swatches={swatches}
        accessibilityLabel={t('Colors', 'Farben')}
      />
      <UI.Button
        label={t('Open color picker', 'Farbauswahl öffnen')}
        onPress={() => setOpen(true)}
      />
      <UI.Text accessibilityLiveRegion="polite">{color}</UI.Text>
      <UI.ColorPickerSheet
        visible={open}
        onClose={() => setOpen(false)}
        title={t('Choose color', 'Farbe wählen')}
        value={color}
        onChange={setColor}
        swatches={swatches}
        accessibilityLabel={t('Sheet colors', 'Farben im Sheet')}
      />
    </View>
  );
}
export function AmountFieldExample({ de = false }: StoryProps) {
  const [value, setValue] = React.useState(de ? '12,90' : '12.90');
  const [amount, setAmount] = React.useState<number | null>(12.9);
  return (
    <View style={{ gap: 12 }}>
      <UI.AmountField
        label={de ? 'Betrag' : 'Amount'}
        accessibilityLabel={de ? 'Betrag' : 'Amount'}
        value={value}
        onChangeText={setValue}
        onAmountChange={setAmount}
        locale={de ? 'de-DE' : 'en-US'}
        currency="EUR"
      />
      <UI.Text accessibilityLiveRegion="polite">
        {amount === null
          ? de
            ? 'Unvollständiger Betrag'
            : 'Incomplete amount'
          : String(amount)}
      </UI.Text>
    </View>
  );
}
export function BannerExample({ de = false }: StoryProps) {
  const [show, setShow] = React.useState(true),
    [status, setStatus] = React.useState('');
  const t = (en: string, german: string) => (de ? german : en);
  return (
    <View style={{ gap: 16 }}>
      <UI.Banner
        message={t(
          'You are offline. Your work stays on this device.',
          'Du bist offline. Deine Arbeit bleibt auf diesem Gerät.',
        )}
      />
      {show ? (
        <UI.Banner
          title={t('Connection failed', 'Verbindung fehlgeschlagen')}
          message={t('Try connecting again.', 'Versuche die Verbindung erneut.')}
          tone="error"
          actionLabel={t('Retry', 'Erneut versuchen')}
          onAction={() => setStatus(t('Retry selected', 'Erneut versuchen ausgewählt'))}
          onDismiss={() => setShow(false)}
          dismissLabel={t('Dismiss notice', 'Hinweis schließen')}
        />
      ) : (
        <UI.Button label={t('Show notice', 'Hinweis anzeigen')} onPress={() => setShow(true)} />
      )}
      <UI.InlineNotice
        tone="info"
        message={t('An informational notice.', 'Ein informativer Hinweis.')}
      />
      <UI.Text accessibilityLiveRegion="polite">{status}</UI.Text>
    </View>
  );
}
export function UndoBarExample({ de = false }: StoryProps) {
  const [remaining, setRemaining] = React.useState(10000),
    [paused, setPaused] = React.useState(false),
    [collapsed, setCollapsed] = React.useState(false),
    [visible, setVisible] = React.useState(true),
    [status, setStatus] = React.useState('');
  const t = (en: string, german: string) => (de ? german : en);
  React.useEffect(() => {
    if (!visible || paused) return;
    const timer = setInterval(() => setRemaining((value) => Math.max(0, value - 100)), 100);
    return () => clearInterval(timer);
  }, [visible, paused]);
  React.useEffect(() => {
    if (remaining === 0) {
      setVisible(false);
      setStatus(t('Expired', 'Abgelaufen'));
    }
  }, [remaining]);
  return (
    <View style={{ gap: 12 }}>
      {visible ? (
        <UI.UndoBar
          message={t('Item removed', 'Eintrag entfernt')}
          actionLabel={t('Undo', 'Rückgängig')}
          dismissLabel={t('Dismiss undo', 'Rückgängig schließen')}
          remainingMs={remaining}
          totalMs={10000}
          paused={paused}
          onPause={() => setPaused(true)}
          onResume={() => setPaused(false)}
          collapsed={collapsed}
          onExpand={() => setCollapsed(false)}
          onUndo={() => {
            setVisible(false);
            setStatus(t('Restored', 'Wiederhergestellt'));
          }}
          onDismiss={() => {
            setVisible(false);
            setStatus(t('Dismissed', 'Geschlossen'));
          }}
        />
      ) : null}
      <UI.Button
        label={
          paused
            ? t('Resume countdown', 'Countdown fortsetzen')
            : t('Pause countdown', 'Countdown pausieren')
        }
        variant="tonal"
        onPress={() => setPaused((value) => !value)}
      />
      <UI.Button
        label={t('Collapse undo', 'Rückgängig einklappen')}
        variant="tonal"
        onPress={() => setCollapsed(true)}
      />
      <UI.Button
        label={t('Restart example', 'Beispiel neu starten')}
        variant="ghost"
        onPress={() => {
          setRemaining(10000);
          setVisible(true);
          setPaused(false);
          setCollapsed(false);
          setStatus('');
        }}
      />
      <UI.Text accessibilityLiveRegion="polite">{status}</UI.Text>
    </View>
  );
}
export function ListControlsExample({ de = false }: StoryProps) {
  const [count, setCount] = React.useState(2),
    [status, setStatus] = React.useState('');
  const t = (en: string, german: string) => (de ? german : en);
  return (
    <View style={{ gap: 16 }}>
      <UI.SelectionHeader
        count={count}
        countLabel={t(`${count} selected`, `${count} ausgewählt`)}
        allSelected={count === 4}
        onClear={() => setCount(0)}
        onToggleAll={() => setCount((value) => (value === 4 ? 0 : 4))}
        clearLabel={t('Clear selection', 'Auswahl aufheben')}
        selectAllLabel={t('Select all', 'Alle auswählen')}
        deselectAllLabel={t('Select none', 'Keine auswählen')}
      />
      <UI.ListSectionHeader
        title={t('Recent items', 'Letzte Einträge')}
        first
        trailing={<UI.Badge label="4" />}
      />
      <UI.Text>
        {t('The app supplies the list and selection.', 'Die App liefert Liste und Auswahl.')}
      </UI.Text>
      <UI.JumpToTopPill
        label={t('Back to top', 'Nach oben')}
        count={3}
        onPress={() => setStatus(t('Top requested', 'Nach oben angefordert'))}
      />
      <UI.Text accessibilityLiveRegion="polite">{status}</UI.Text>
    </View>
  );
}
export function SwipeableRowExample({ de = false }: StoryProps) {
  const [status, setStatus] = React.useState('');
  const t = (en: string, german: string) => (de ? german : en);
  return (
    <View style={{ gap: 16 }}>
      <UI.SwipeableRow
        accessibilityLabel={t('Example row', 'Beispielzeile')}
        actionsLabel={t('Show row actions', 'Zeilenaktionen anzeigen')}
        startActions={[
          {
            id: 'done',
            label: t('Mark done', 'Erledigen'),
            onPress: () => setStatus(t('Done selected', 'Erledigen ausgewählt')),
          },
        ]}
        endActions={[
          {
            id: 'delete',
            label: t('Delete row', 'Zeile löschen'),
            destructive: true,
            onPress: () => setStatus(t('Delete selected', 'Löschen ausgewählt')),
          },
          {
            id: 'locked',
            label: t('Unavailable action', 'Nicht verfügbare Aktion'),
            disabled: true,
            onPress: () => {},
          },
        ]}
      >
        <UI.Text>
          {t(
            'Swipe on native or open the visible action control.',
            'Nativ wischen oder die sichtbaren Aktionen öffnen.',
          )}
        </UI.Text>
      </UI.SwipeableRow>
      <UI.Text accessibilityLiveRegion="polite">{status}</UI.Text>
    </View>
  );
}
export function SettingsLayoutExample({ de = false }: StoryProps) {
  const [enabled, setEnabled] = React.useState(true),
    [status, setStatus] = React.useState('');
  const t = (en: string, german: string) => (de ? german : en);
  return (
    <View style={{ minHeight: 360 }}>
      <UI.SettingsScreenLayout
        title={t('Settings', 'Einstellungen')}
        caption={t('A router-free screen layout.', 'Ein Bildschirmrahmen ohne Router.')}
        backLabel={t('Back to examples', 'Zurück zu Beispielen')}
        onBack={() => setStatus(t('Back selected', 'Zurück ausgewählt'))}
      >
        <UI.SettingsSection title={t('Appearance', 'Darstellung')}>
          <UI.SettingsRow
            label={t('Enable option', 'Option aktivieren')}
            value={enabled}
            onValueChange={setEnabled}
            first
          />
          <UI.SettingsRow
            label={t('Details', 'Details')}
            onPress={() => setStatus(t('Details selected', 'Details ausgewählt'))}
          />
        </UI.SettingsSection>
        <UI.Text accessibilityLiveRegion="polite">{status}</UI.Text>
      </UI.SettingsScreenLayout>
    </View>
  );
}
export function MenusExample({ de = false }: StoryProps) {
  const [open, setOpen] = React.useState(false),
    [choice, setChoice] = React.useState('comfortable'),
    [status, setStatus] = React.useState('');
  const t = (en: string, german: string) => (de ? german : en);
  return (
    <View style={{ gap: 16 }}>
      <UI.SelectField
        value={choice}
        onChange={setChoice}
        accessibilityLabel={t('Density', 'Dichte')}
        options={[
          { id: 'comfortable', label: t('Comfortable', 'Komfortabel') },
          { id: 'compact', label: t('Compact', 'Kompakt') },
          {
            id: 'locked',
            label: t('Unavailable density', 'Nicht verfügbare Dichte'),
            disabled: true,
          },
        ]}
      />
      <UI.Button
        label={t('Open action sheet', 'Aktions-Sheet öffnen')}
        onPress={() => setOpen(true)}
      />
      <UI.Text>{choice}</UI.Text>
      <UI.MenuSheet
        visible={open}
        onClose={() => setOpen(false)}
        title={t('Actions', 'Aktionen')}
        items={[
          {
            id: 'example',
            label: t('Run action', 'Aktion ausführen'),
            icon: UI.BackIcon,
            onPress: () => setStatus(t('Action selected', 'Aktion ausgewählt')),
          },
        ]}
      />
      <UI.Text accessibilityLiveRegion="polite">{status}</UI.Text>
    </View>
  );
}
export function PressableExample({ de = false }: StoryProps) {
  const [count, setCount] = React.useState(0);
  const t = (en: string, german: string) => (de ? german : en);
  return (
    <View style={{ gap: 16 }}>
      <UI.Pressable
        accessibilityRole="button"
        accessibilityLabel={t('Press example', 'Beispiel drücken')}
        onPress={() => setCount((value) => value + 1)}
        style={{ minHeight: 48, borderRadius: 16, padding: 12 }}
      >
        <UI.Text>
          {t(
            'Press, focus or activate with the keyboard',
            'Drücken, fokussieren oder per Tastatur aktivieren',
          )}
        </UI.Text>
      </UI.Pressable>
      <UI.IconButton
        icon={UI.BackIcon}
        accessibilityLabel={t('Icon action', 'Symbolaktion')}
        onPress={() => setCount((value) => value + 1)}
      />
      <UI.Text accessibilityLiveRegion="polite">{count}</UI.Text>
    </View>
  );
}
export function FeedbackExample({ de = false }: StoryProps) {
  const [status, setStatus] = React.useState('');
  const t = (en: string, german: string) => (de ? german : en);
  return (
    <View style={{ gap: 16 }}>
      <UI.NavigationBar
        title={t('Library', 'Bibliothek')}
        leading={
          <UI.BackButton
            label={t('Back', 'Zurück')}
            onPress={() => setStatus(t('Back selected', 'Zurück ausgewählt'))}
          />
        }
      />
      <UI.ScreenTitle title={t('Overview', 'Übersicht')} />
      <UI.TopBar
        onBack={() => setStatus(t('Back selected', 'Zurück ausgewählt'))}
        center={<UI.Text>{t('Collection', 'Sammlung')}</UI.Text>}
      />
      <UI.Toolbar>
        <UI.Button
          size="s"
          label={t('Create', 'Erstellen')}
          onPress={() => setStatus(t('Create selected', 'Erstellen ausgewählt'))}
        />
      </UI.Toolbar>
      <View style={{ minHeight: 90 }}>
        <UI.Snackbar
          message={t('Changes saved', 'Änderungen gespeichert')}
          actionLabel={t('Undo', 'Rückgängig')}
          onAction={() => setStatus(t('Undo selected', 'Rückgängig ausgewählt'))}
        />
      </View>
      <UI.Text accessibilityLiveRegion="polite">{status}</UI.Text>
    </View>
  );
}
export function AdvancedSheetExample({ de = false }: StoryProps) {
  const [open, setOpen] = React.useState(false),
    [text, setText] = React.useState('');
  const t = (en: string, german: string) => (de ? german : en);
  return (
    <View style={{ gap: 12 }}>
      <UI.Button
        label={t('Open typing panel', 'Eingabepanel öffnen')}
        onPress={() => setOpen(true)}
      />
      <UI.Text>{text}</UI.Text>
      <UI.PanelSheet visible={open} onClose={() => setOpen(false)}>
        <UI.SheetScrollView contentContainerStyle={{ gap: 12 }}>
          <UI.Text variant="heading">{t('Edit details', 'Details bearbeiten')}</UI.Text>
          <UI.TextField label={t('Name', 'Name')} value={text} onChangeText={setText} />
          <UI.Button
            label={t('Close panel', 'Panel schließen')}
            onPress={() => setOpen(false)}
          />
        </UI.SheetScrollView>
      </UI.PanelSheet>
    </View>
  );
}
export function LayoutExample({ de = false }: StoryProps) {
  const [expanded, setExpanded] = React.useState(false),
    [value, setValue] = React.useState('');
  const t = (en: string, german: string) => (de ? german : en);
  return (
    <UI.KeyboardInsetView>
      <View style={{ gap: 16 }}>
        <View>
          <UI.Text>{t('First row', 'Erste Zeile')}</UI.Text>
          <UI.RowGap />
          <UI.Text>{t('Second row', 'Zweite Zeile')}</UI.Text>
        </View>
        <UI.Button
          label={t('Expand details', 'Details aufklappen')}
          onPress={() => setExpanded((value) => !value)}
        />
        <UI.ExpandIndicator expanded={expanded} />
        <UI.Badge label="3" />
        <UI.Input
          accessibilityLabel={t('Example input', 'Beispieleingabe')}
          value={value}
          onChangeText={setValue}
        />
        <UI.EmptyState
          icon={UI.BackIcon}
          shape="cookie"
          title={t('Nothing here yet', 'Noch keine Einträge')}
          body={t(
            'An empty state keeps the next action clear.',
            'Ein leerer Zustand zeigt die nächste Aktion.',
          )}
        />
      </View>
    </UI.KeyboardInsetView>
  );
}
export function ImageViewerExample({ de = false }: StoryProps) {
  const [status, setStatus] = React.useState('');
  const [solid, setSolid] = React.useState(false);
  const t = (en: string, german: string) => (de ? german : en);
  const uri =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABICAIAAACGBWc0AAAAk0lEQVR4nO3QQQ3AIAAEQbxgow7qAGF9IwJXmKiJe10mWQM7Yz0n0tw70v3eSKmvAQgQIECAAAECBAgQIECAAAECBAgQIECAAAECBKgCqHUs9QUIECBAgAABAgQIECBAgAABAgQIECBAgAABAgSoA6h1LPUFCBAgQIAAAQIECBAgQIAAAQIECBAgQIAAAQIEqALoByp/Q1kKfgjjAAAAAElFTkSuQmCC';
  return (
    <View style={{ height: 440, gap: 12 }}>
      <UI.Switch
        value={solid}
        onValueChange={setSolid}
        accessibilityLabel={t('Solid image controls', 'Solide Bildsteuerung')}
      />
      <UI.ZoomableImage
        material={solid ? 'solid' : 'auto'}
        glassStyle="clear"
        uri={uri}
        accessibilityLabel={t('Color study', 'Farbstudie')}
        onTap={() => setStatus(t('Image tapped', 'Bild angetippt'))}
        onDismiss={() => setStatus(t('Dismiss requested', 'Schließen angefordert'))}
        labels={{
          zoomIn: t('Zoom in', 'Vergrößern'),
          zoomOut: t('Zoom out', 'Verkleinern'),
          reset: t('Reset zoom', 'Zoom zurücksetzen'),
          error: t('Image unavailable', 'Bild nicht verfügbar'),
        }}
      />
      <UI.Text>{status}</UI.Text>
    </View>
  );
}
export function SettingsListExample({ de = false }: StoryProps) {
  const [enabled, setEnabled] = React.useState(true),
    [selected, setSelected] = React.useState(false),
    [density, setDensity] = React.useState('comfortable'),
    [status, setStatus] = React.useState('');
  const t = (en: string, german: string) => (de ? german : en);
  return (
    <View style={{ gap: 16 }}>
      <UI.SettingsSection title={t('Preferences', 'Voreinstellungen')}>
        <UI.SettingsGroup>
          <UI.SettingsNavRow
            label={t('Open details', 'Details öffnen')}
            onPress={() => setStatus(t('Details selected', 'Details ausgewählt'))}
          />
          <UI.SettingsChoiceRow
            label={t('Use this option', 'Diese Option verwenden')}
            selected={selected}
            onPress={() => setSelected((value) => !value)}
          />
          <UI.SettingsSwitchRow
            label={t('Enable notifications', 'Benachrichtigungen aktivieren')}
            value={enabled}
            onValueChange={setEnabled}
          />
          <UI.SettingsSelectRow
            label={t('Density', 'Dichte')}
            value={density}
            onChange={setDensity}
            options={[
              { id: 'comfortable', label: t('Comfortable', 'Komfortabel') },
              { id: 'compact', label: t('Compact', 'Kompakt') },
            ]}
          />
        </UI.SettingsGroup>
      </UI.SettingsSection>
      <UI.SettingsCard>
        <UI.Text>
          {t(
            'Custom content can use the same card surface.',
            'Eigene Inhalte können dieselbe Kartenfläche verwenden.',
          )}
        </UI.Text>
      </UI.SettingsCard>
      <UI.Text accessibilityLiveRegion="polite">{status}</UI.Text>
    </View>
  );
}
export function RefreshExample({ de = false }: StoryProps) {
  const [refreshing, setRefreshing] = React.useState(false),
    [count, setCount] = React.useState(0);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const refresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    timer.current = setTimeout(() => {
      setCount((value) => value + 1);
      setRefreshing(false);
    }, 500);
  };
  return (
    <ScrollView
      style={{ minHeight: 240 }}
      refreshControl={<UI.RefreshControl refreshing={refreshing} onRefresh={refresh} />}
    >
      <UI.Button
        label={de ? 'Aktualisieren' : 'Refresh'}
        disabled={refreshing}
        onPress={refresh}
      />
      <UI.Text accessibilityLiveRegion="polite">
        {de ? `Aktualisierungen: ${count}` : `Refreshes: ${count}`}
      </UI.Text>
      <UI.Text>
        {de
          ? 'Nativ zum Aktualisieren ziehen. Im Browser denselben Callback per Button auslösen.'
          : 'Pull to refresh on native. The browser button runs the same callback.'}
      </UI.Text>
    </ScrollView>
  );
}
export function PasswordExample({ de = false }: StoryProps) {
  const [password, setPassword] = React.useState('');
  const [confirmation, setConfirmation] = React.useState('');
  const theme = UI.useIsolineTheme();
  const t = (en: string, german: string) => (de ? german : en);
  return (
    <UI.IsolineProvider
      theme={theme}
      style={{ flex: 0 }}
      labels={{
        showPassword: t('Show password', 'Passwort anzeigen'),
        hidePassword: t('Hide password', 'Passwort verbergen'),
      }}
    >
      <View style={{ gap: 20 }}>
        <View testID="password-text-field">
          <UI.TextField
            label={t('New password', 'Neues Passwort')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            notchClassName="bg-background"
            autoComplete="new-password"
            textContentType="newPassword"
            error={
              password.length > 0 && password.length < 8
                ? t(
                    'Example: use at least 8 characters.',
                    'Beispiel: mindestens 8 Zeichen verwenden.',
                  )
                : undefined
            }
          />
        </View>
        <View testID="password-basic-input">
          <UI.Input
            label={t('Account password', 'Kontopasswort')}
            value={confirmation}
            onChangeText={setConfirmation}
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
            hint={t(
              'Use the eye button to show or hide the text.',
              'Mit dem Auge den Text anzeigen oder verbergen.',
            )}
          />
        </View>
        <UI.Text>
          {t(
            'Both input styles keep their value when visibility changes. Password fields remain solid form content.',
            'Beide Eingabestile behalten ihren Wert beim Umschalten. Passwortfelder bleiben solide Formularinhalte.',
          )}
        </UI.Text>
      </View>
    </UI.IsolineProvider>
  );
}
export function OverlayMaterialsExample({ de = false }: StoryProps) {
  const colors = UI.useThemeColors();
  const [solid, setSolid] = React.useState(false);
  const [glassStyle, setGlassStyle] = React.useState<'regular' | 'clear'>('regular');
  const [date, setDate] = React.useState<string | null>('2026-11-18');
  const [time, setTime] = React.useState<string | null>('09:00');
  const [color, setColor] = React.useState<string | null>('#7c4ab1');
  const [open, setOpen] = React.useState('');
  const [density, setDensity] = React.useState('comfortable');
  const [password, setPassword] = React.useState('');
  const [status, setStatus] = React.useState('');
  const theme = UI.useIsolineTheme();
  const t = (en: string, german: string) => (de ? german : en);
  const material: UI.MaterialOptions = { material: solid ? 'solid' : 'auto', glassStyle };
  return (
    <UI.IsolineProvider
      theme={theme}
      style={{ flex: 0 }}
      labels={{
        close: t('Close', 'Schließen'),
        showPassword: t('Show password', 'Passwort anzeigen'),
        hidePassword: t('Hide password', 'Passwort verbergen'),
      }}
    >
      <View style={{ gap: 12 }}>
        <UI.Switch
          value={solid}
          onValueChange={setSolid}
          accessibilityLabel={t('Solid overlays', 'Solide Overlays')}
        />
        <UI.ButtonGroup
          value={glassStyle}
          onChange={setGlassStyle}
          items={[
            { id: 'regular', label: t('Regular', 'Regulär') },
            { id: 'clear', label: t('Clear', 'Klar') },
          ]}
        />
        <View
          testID="overlay-material-stage"
          style={{
            minHeight: 420,
            gap: 12,
            padding: 16,
            borderRadius: 24,
            overflow: 'hidden',
            backgroundColor: colors.primaryContainer,
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 100,
              left: -40,
              right: -40,
              height: 180,
              backgroundColor: colors.tertiary,
              transform: [{ rotate: '-16deg' }],
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              bottom: 60,
              left: -30,
              right: -30,
              height: 150,
              backgroundColor: colors.primary,
              transform: [{ rotate: '12deg' }],
            }}
          />
          <UI.Text variant="heading">
            {t('Content behind the glass', 'Inhalt hinter dem Glas')}
          </UI.Text>
          <UI.DateField
            {...material}
            label={t('Overlay date', 'Overlay-Datum')}
            emptyLabel="—"
            value={date}
            onChange={setDate}
            today="2026-11-18"
            locale={de ? 'de-DE' : 'en-US'}
            labels={{
              previousMonth: t('Previous month', 'Vorheriger Monat'),
              nextMonth: t('Next month', 'Nächster Monat'),
            }}
          />
          <UI.TimeField
            {...material}
            label={t('Overlay time', 'Overlay-Uhrzeit')}
            emptyLabel="—"
            value={time}
            onChange={setTime}
            hourLabel={t('Hour', 'Stunde')}
            minuteLabel={t('Minute', 'Minute')}
            confirmLabel={t('Done', 'Fertig')}
          />
          <UI.Button
            label={t('Overlay color', 'Overlay-Farbe')}
            onPress={() => setOpen('color')}
          />
          <UI.Button
            label={t('Password sheet', 'Passwort-Sheet')}
            onPress={() => setOpen('password')}
          />
          <View testID="overlay-settings-picker">
            <UI.SettingsSelectRow
              menuMaterial={material.material}
              glassStyle={glassStyle}
              label={t('Display density', 'Anzeigedichte')}
              value={density}
              onChange={setDensity}
              options={[
                { id: 'comfortable', label: t('Comfortable', 'Komfortabel') },
                { id: 'compact', label: t('Compact', 'Kompakt') },
              ]}
            />
          </View>
          <View testID="overlay-jump">
            <UI.JumpToTopPill
              {...material}
              label={t('Back to top', 'Nach oben')}
              onPress={() => setStatus(t('Top requested', 'Nach oben angefordert'))}
            />
          </View>
          <View testID="overlay-undo">
            <UI.UndoBar
              {...material}
              message={t('Example item removed', 'Beispieleintrag entfernt')}
              remainingMs={8000}
              totalMs={10000}
              actionLabel={t('Undo', 'Rückgängig')}
              dismissLabel={t('Dismiss', 'Schließen')}
              onUndo={() => setStatus(t('Restored', 'Wiederhergestellt'))}
              onDismiss={() => setStatus(t('Dismissed', 'Geschlossen'))}
            />
          </View>
        </View>
        <UI.Text accessibilityLiveRegion="polite">{status}</UI.Text>
        <UI.ColorPickerSheet
          {...material}
          visible={open === 'color'}
          onClose={() => setOpen('')}
          title={t('Overlay color', 'Overlay-Farbe')}
          value={color}
          onChange={setColor}
          accessibilityLabel={t('Overlay palette', 'Overlay-Palette')}
          swatches={[
            { value: '#7c4ab1', label: t('Violet', 'Violett') },
            { value: '#008577', label: t('Teal', 'Türkis') },
          ]}
        />
        <UI.PanelSheet {...material} visible={open === 'password'} onClose={() => setOpen('')}>
          <UI.TextField
            label={t('Sheet password', 'Sheet-Passwort')}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoComplete="current-password"
            textContentType="password"
          />
          <UI.Button label={t('Done', 'Fertig')} onPress={() => setOpen('')} />
        </UI.PanelSheet>
      </View>
    </UI.IsolineProvider>
  );
}

export function InputExample({ de = false }: StoryProps) {
  const [name, setName] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  return (
    <View style={{ gap: 16 }}>
      <UI.Input
        label={de ? 'Name' : 'Name'}
        hint={de ? 'Dein öffentlicher Name' : 'Your public name'}
        value={name}
        onChangeText={setName}
        error={submitted && !name.trim() ? (de ? 'Name fehlt.' : 'Enter your name.') : null}
        autoCapitalize="words"
      />
      <UI.Input
        label={de ? 'Nicht bearbeitbar' : 'Read only'}
        value="Isoline"
        editable={false}
      />
      <UI.Button label={de ? 'Prüfen' : 'Validate'} onPress={() => setSubmitted(true)} />
    </View>
  );
}
export function RadioExample({ de = false }: StoryProps) {
  const [value, setValue] = React.useState<string | null>('standard');
  return (
    <UI.RadioGroup
      value={value}
      onValueChange={setValue}
      accessibilityLabel={de ? 'Versandart' : 'Delivery'}
    >
      <UI.RadioItem
        value="standard"
        label={de ? 'Standardversand' : 'Standard delivery'}
        description={de ? 'Drei bis fünf Tage' : 'Three to five days'}
      />
      <UI.RadioItem value="express" label="Express" />
      <UI.RadioItem
        value="unavailable"
        label={de ? 'Nicht verfügbar' : 'Unavailable'}
        disabled
      />
    </UI.RadioGroup>
  );
}
export function CardExample({ de = false }: StoryProps) {
  const [status, setStatus] = React.useState('');
  return (
    <View style={{ gap: 16 }}>
      <UI.Card
        header={<UI.Text variant="heading">{de ? 'Sammlung' : 'Collection'}</UI.Text>}
        footer={
          <UI.Button
            label={de ? 'Öffnen' : 'Open'}
            onPress={() => setStatus(de ? 'Geöffnet' : 'Opened')}
          />
        }
      >
        <UI.Text>
          {de ? 'Inhalt mit eigener Aktion.' : 'Content with a separate action.'}
        </UI.Text>
      </UI.Card>
      <UI.Card
        onPress={() => setStatus(de ? 'Karte ausgewählt' : 'Card selected')}
        accessibilityLabel={de ? 'Sammlung auswählen' : 'Select collection'}
      >
        <UI.Text>
          {de ? 'Die ganze Karte ist eine Aktion.' : 'The whole card is one action.'}
        </UI.Text>
      </UI.Card>
      <UI.Text accessibilityLiveRegion="polite">{status}</UI.Text>
    </View>
  );
}
export function ListItemExample({ de = false }: StoryProps) {
  const [selected, setSelected] = React.useState(false);
  return (
    <View>
      <UI.ListItem
        title={de ? 'Projekt' : 'Project'}
        description={de ? 'Zuletzt bearbeitet' : 'Recently edited'}
        leading={<UI.Avatar initials="IS" accessibilityLabel="Isoline" />}
        trailing={<UI.Badge label="3" />}
        selected={selected}
        onPress={() => setSelected(!selected)}
      />
      <UI.ListItem title={de ? 'Nicht verfügbar' : 'Unavailable'} disabled onPress={() => {}} />
    </View>
  );
}
export function SkeletonExample({ de = false }: StoryProps) {
  const [loading, setLoading] = React.useState(true);
  return (
    <View style={{ gap: 16 }}>
      <UI.Button
        label={de ? 'Ladezustand wechseln' : 'Toggle loading'}
        onPress={() => setLoading(!loading)}
      />
      <View accessibilityState={{ busy: loading }}>
        {loading ? (
          <View style={{ gap: 12 }}>
            <UI.Text accessibilityLiveRegion="polite">
              {de ? 'Inhalt wird geladen' : 'Loading content'}
            </UI.Text>
            <UI.Skeleton width={64} height={64} radius={32} />
            <UI.Skeleton />
            <UI.Skeleton width="60%" />
          </View>
        ) : (
          <UI.ListItem title={de ? 'Inhalt geladen' : 'Content loaded'} />
        )}
      </View>
    </View>
  );
}
export function AccordionExample({ de = false }: StoryProps) {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <UI.Accordion
      title={de ? 'Weitere Informationen' : 'More information'}
      expanded={expanded}
      onExpandedChange={setExpanded}
    >
      <UI.Text>
        {de ? 'Dieser Inhalt wird auf Wunsch sichtbar.' : 'This content appears on request.'}
      </UI.Text>
      <UI.Button label={de ? 'Schließen' : 'Collapse'} onPress={() => setExpanded(false)} />
    </UI.Accordion>
  );
}
export function FormFieldExample({ de = false }: StoryProps) {
  const [checked, setChecked] = React.useState(false);
  const label = de ? 'Einwilligung' : 'Consent';
  const hint = de ? 'Du kannst die Auswahl ändern.' : 'You can change this choice.';
  return (
    <UI.FormField
      label={label}
      requiredLabel={de ? '(erforderlich)' : '(required)'}
      hint={hint}
    >
      <UI.Checkbox
        checked={checked}
        onCheckedChange={setChecked}
        accessibilityLabel={`${label}, ${hint}`}
        label={de ? 'Ich stimme zu' : 'I agree'}
      />
    </UI.FormField>
  );
}
export function ComboboxExample({ de = false }: StoryProps) {
  const [value, setValue] = React.useState<string | null>(null);
  return (
    <UI.Combobox
      value={value}
      onChange={setValue}
      label={de ? 'Land' : 'Country'}
      accessibilityLabel={de ? 'Land auswählen' : 'Choose country'}
      placeholder={de ? 'Bitte auswählen' : 'Select a country'}
      searchLabel={de ? 'Länder suchen' : 'Search countries'}
      emptyLabel={de ? 'Keine Treffer' : 'No results'}
      options={[
        { id: 'de', label: de ? 'Deutschland' : 'Germany' },
        { id: 'fr', label: de ? 'Frankreich' : 'France' },
        { id: 'it', label: de ? 'Italien' : 'Italy' },
        { id: 'unavailable', label: de ? 'Nicht verfügbar' : 'Unavailable', disabled: true },
      ]}
    />
  );
}
export function FormScreenExample({ de = false }: StoryProps) {
  const [name, setName] = React.useState('');
  const [country, setCountry] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [saved, setSaved] = React.useState(false);
  const [simulateFailure, setSimulateFailure] = React.useState(false);
  const [editing, setEditing] = React.useState(false);
  const [sheetEditing, setSheetEditing] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const emailRef =
    React.useRef<React.ComponentRef<typeof import('react-native').TextInput>>(null);
  const [email, setEmail] = React.useState('');
  async function submit() {
    if (saving) return;
    setSubmitted(true);
    setSaved(false);
    if (!name.trim() || !email.includes('@') || !country) return;
    setSaving(true);
    setError('');
    try {
      // Replace with the app's request; the switch makes the failure path reproducible.
      await new Promise<void>((resolve, reject) =>
        setTimeout(() => (simulateFailure ? reject(new Error('demo')) : resolve()), 500),
      );
      setSaved(true);
      setEditing(false);
    } catch {
      setError(
        de
          ? 'Speichern fehlgeschlagen. Erneut versuchen.'
          : 'Could not save. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  }
  return (
    <UI.KeyboardInsetView>
      <View style={{ gap: 16 }}>
        <UI.Text variant="heading">{de ? 'Profil bearbeiten' : 'Edit profile'}</UI.Text>
        <UI.Input
          label="Name"
          value={name}
          onChangeText={(value) => {
            setName(value);
            setSaved(false);
          }}
          editable={!saving}
          autoCapitalize="words"
          error={submitted && !name.trim() ? (de ? 'Name fehlt.' : 'Enter your name.') : null}
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <UI.TextField
          ref={emailRef}
          label="Email"
          value={email}
          onChangeText={setEmail}
          editable={!saving}
          autoCapitalize="none"
          keyboardType="email-address"
          error={
            submitted && !email.includes('@')
              ? de
                ? 'E-Mail prüfen.'
                : 'Check your email.'
              : null
          }
          returnKeyType="done"
          onSubmitEditing={() => void submit()}
          notchClassName="bg-background"
        />
        <UI.SelectField
          value={country}
          onChange={setCountry}
          disabled={saving}
          label={de ? 'Land' : 'Country'}
          accessibilityLabel={de ? 'Land' : 'Country'}
          placeholder={de ? 'Bitte auswählen' : 'Choose a country'}
          error={submitted && !country ? (de ? 'Land fehlt.' : 'Choose a country.') : null}
          options={[
            { id: 'de', label: de ? 'Deutschland' : 'Germany' },
            { id: 'fr', label: de ? 'Frankreich' : 'France' },
          ]}
        />
        <UI.Checkbox
          checked={simulateFailure}
          onCheckedChange={setSimulateFailure}
          disabled={saving}
          label={de ? 'Serverfehler simulieren' : 'Simulate server error'}
          accessibilityLabel={de ? 'Serverfehler simulieren' : 'Simulate server error'}
        />
        {error ? <UI.Text accessibilityLiveRegion="polite">{error}</UI.Text> : null}
        <UI.Button
          label={de ? 'Profil speichern' : 'Save profile'}
          loading={saving}
          loadingLabel={de ? 'Wird gespeichert' : 'Saving profile'}
          onPress={() => void submit()}
        />
        {saved ? (
          <UI.Text accessibilityLiveRegion="polite">
            {de ? 'Profil gespeichert' : 'Profile saved'}
          </UI.Text>
        ) : null}
        <UI.Button
          variant="outline"
          label={de ? 'Geschütztes Formular öffnen' : 'Open protected form'}
          onPress={() => setEditing(true)}
        />
        <UI.Button
          label={de ? 'Geschütztes Sheet öffnen' : 'Open protected sheet'}
          variant="outline"
          onPress={() => setSheetEditing(true)}
        />
        <UI.BottomSheet
          visible={sheetEditing}
          dismissible={false}
          onClose={() => setSheetEditing(false)}
        >
          <UI.TextField
            label={de ? 'Sheet-Entwurf' : 'Sheet draft'}
            value={draft}
            onChangeText={setDraft}
          />
          <UI.Button
            label={de ? 'Sheet schließen' : 'Close protected sheet'}
            onPress={() => setSheetEditing(false)}
          />
        </UI.BottomSheet>
        <UI.Dialog visible={editing} dismissible={false} onClose={() => setEditing(false)}>
          <UI.Text>
            {de
              ? 'Nur die expliziten Aktionen schließen diesen Dialog.'
              : 'Only explicit actions close this dialog.'}
          </UI.Text>
          <UI.TextField
            label={de ? 'Entwurf' : 'Draft name'}
            value={draft}
            onChangeText={setDraft}
          />
          <UI.Button
            label={de ? 'Änderungen verwerfen' : 'Discard changes'}
            onPress={() => setEditing(false)}
          />
        </UI.Dialog>
      </View>
    </UI.KeyboardInsetView>
  );
}
export function DataListScreenExample({ de = false }: StoryProps) {
  const [state, setState] = React.useState<'loading' | 'error' | 'empty' | 'ready'>('ready');
  const [query, setQuery] = React.useState('');
  const rows = ['Isoline', 'Studio', 'Garden'].filter((row) =>
    row.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <View style={{ gap: 16 }}>
      <UI.Text variant="heading">{de ? 'Sammlungen' : 'Collections'}</UI.Text>
      <UI.ButtonGroup
        items={[
          { id: 'ready', label: de ? 'Inhalt' : 'Content' },
          { id: 'loading', label: de ? 'Laden' : 'Loading' },
          { id: 'error', label: de ? 'Fehler' : 'Error' },
          { id: 'empty', label: de ? 'Leer' : 'Empty' },
        ]}
        value={state}
        onChange={(value) => setState(value as typeof state)}
      />
      <UI.SearchField
        value={query}
        onChangeText={setQuery}
        placeholder={de ? 'Sammlungen suchen' : 'Search collections'}
        accessibilityLabel={de ? 'Sammlungen suchen' : 'Search collections'}
        clearAccessibilityLabel={de ? 'Suche leeren' : 'Clear search'}
      />
      <View accessibilityState={{ busy: state === 'loading' }}>
        {state === 'loading' ? (
          <View style={{ gap: 12 }}>
            <UI.Text accessibilityLiveRegion="polite">{de ? 'Lädt' : 'Loading'}</UI.Text>
            <UI.Skeleton height={56} />
            <UI.Skeleton height={56} />
          </View>
        ) : state === 'error' ? (
          <UI.Card>
            <UI.Text accessibilityLiveRegion="polite">
              {de ? 'Laden fehlgeschlagen' : 'Could not load collections'}
            </UI.Text>
            <UI.Button
              label={de ? 'Erneut versuchen' : 'Retry'}
              onPress={() => setState('ready')}
            />
          </UI.Card>
        ) : state === 'empty' || !rows.length ? (
          <UI.EmptyState
            shape="cookie"
            icon={UI.BackIcon}
            title={de ? 'Keine Sammlungen' : 'No collections'}
            body={
              de
                ? 'Passe die Suche an oder lege eine Sammlung an.'
                : 'Change your search or create a collection.'
            }
          />
        ) : (
          rows.map((row) => (
            <UI.ListItem
              key={row}
              title={row}
              description={de ? 'Sammlung' : 'Collection'}
              leading={<UI.Avatar initials={row.slice(0, 2)} accessibilityLabel={row} />}
            />
          ))
        )}
      </View>
    </View>
  );
}
export function SettingsScreenExample({ de = false }: StoryProps) {
  const [enabled, setEnabled] = React.useState(true);
  const [language, setLanguage] = React.useState<string | null>('de');
  const [expanded, setExpanded] = React.useState(false);
  return (
    <View style={{ gap: 16 }}>
      <UI.Text variant="heading">{de ? 'Einstellungen' : 'Settings'}</UI.Text>
      <UI.SettingsSection title={de ? 'Benachrichtigungen' : 'Notifications'}>
        <UI.SettingsGroup>
          <UI.SettingsSwitchRow
            label={de ? 'Erinnerungen' : 'Reminders'}
            value={enabled}
            onValueChange={setEnabled}
            description={
              de ? 'Werte bleiben in dieser Vorschau.' : 'Values stay in this preview.'
            }
          />
        </UI.SettingsGroup>
      </UI.SettingsSection>
      <UI.FormField
        label={de ? 'Sprache' : 'Language'}
        hint={de ? 'Auswahl ohne App-Neustart.' : 'Choose without restarting the app.'}
      >
        <UI.RadioGroup
          value={language}
          onValueChange={setLanguage}
          accessibilityLabel={de ? 'Sprache' : 'Language'}
        >
          <UI.RadioItem value="de" label="Deutsch" />
          <UI.RadioItem value="en" label="English" />
        </UI.RadioGroup>
      </UI.FormField>
      <UI.Accordion
        title={de ? 'Über diese App' : 'About this app'}
        expanded={expanded}
        onExpandedChange={setExpanded}
      >
        <UI.Text>Isoline UI</UI.Text>
      </UI.Accordion>
    </View>
  );
}

export const catalogStories = {
  input: InputExample,
  radio: RadioExample,
  card: CardExample,
  'list-item': ListItemExample,
  skeleton: SkeletonExample,
  accordion: AccordionExample,
  'form-field': FormFieldExample,
  combobox: ComboboxExample,
  'form-screen': FormScreenExample,
  'data-list-screen': DataListScreenExample,
  'settings-screen': SettingsScreenExample,
  password: PasswordExample,
  'overlay-materials': OverlayMaterialsExample,
  'settings-list': SettingsListExample,
  refresh: RefreshExample,
  'image-viewer': ImageViewerExample,
  checkbox: CheckboxExample,
  avatar: AvatarExample,
  slider: SliderExample,
  'action-chip': ActionChipExample,
  'date-picker': DatePickerExample,
  'time-picker': TimePickerExample,
  'color-picker': ColorPickerExample,
  'amount-field': AmountFieldExample,
  banner: BannerExample,
  'undo-bar': UndoBarExample,
  'list-controls': ListControlsExample,
  'swipeable-row': SwipeableRowExample,
  'settings-layout': SettingsLayoutExample,
  menus: MenusExample,
  pressable: PressableExample,
  feedback: FeedbackExample,
  'advanced-sheet': AdvancedSheetExample,
  layout: LayoutExample,
};
export function CatalogExamples({ kind, de = false }: { kind: string; de?: boolean }) {
  const slug = kind.replace(/^catalog-/, '');
  const Story = catalogStories[slug as keyof typeof catalogStories];
  if (!Story) throw new Error(`Missing component story: ${kind}`);
  const colors = UI.useThemeColors();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface }}
      contentContainerStyle={{ padding: 16, gap: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <Story de={de} />
    </ScrollView>
  );
}
