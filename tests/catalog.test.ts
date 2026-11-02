import assert from 'node:assert/strict';
import test from 'node:test';
import {
  addDays,
  addMonths,
  monthDays,
  validDate,
  validTime,
  formatCalendarDate,
} from '../packages/react-native/src/calendar.ts';
import {
  parseLocalizedAmount,
  formatLocalizedAmount,
} from '../packages/react-native/src/amount.ts';
import { sliderValue } from '../packages/react-native/src/selection.ts';
import {
  imagePanBounds,
  clampZoom,
  imageDimensions,
} from '../packages/react-native/src/media.ts';
import { keyboardOcclusion } from '../packages/react-native/src/keyboard.ts';

test('Gregorian date validation rejects rollover, malformed dates and non-leap days', () => {
  for (const date of ['2026-02-29', '2026-04-31', '2026-1-01', 'invalid'])
    assert.equal(validDate(date), false);
  assert.equal(validDate('2028-02-29'), true);
});
test('calendar arithmetic stays correct across DST and year boundaries', () => {
  assert.equal(addDays('2026-03-28', 2), '2026-03-30');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addMonths('2026-12', 1), '2027-01');
  assert.equal(addMonths('2026-01', -1), '2025-12');
  assert.throws(() => addDays('not-a-date', 1), RangeError);
});
test('six-week calendar grids honor week starts and contain the full leap month', () => {
  const monday = monthDays('2028-02', 1),
    sunday = monthDays('2028-02', 0);
  assert.equal(monday.length, 42);
  assert.equal(new Date(`${monday[0]}T12:00:00Z`).getUTCDay(), 1);
  assert.equal(new Date(`${sunday[0]}T12:00:00Z`).getUTCDay(), 0);
  assert.ok(monday.includes('2028-02-29'));
  assert.equal(new Set(monday).size, 42);
});
test('date formatting keeps the selected Gregorian day in distant locales', () => {
  assert.match(formatCalendarDate('2026-11-18', 'en-US'), /18/);
  assert.match(formatCalendarDate('2026-11-18', 'de-DE'), /18/);
  assert.equal(validTime('23:59'), true);
  for (const time of ['24:00', '9:00', '12:60', '']) assert.equal(validTime(time), false);
});
test('locale amounts roundtrip without mixing decimal and grouping separators', () => {
  for (const locale of ['de-DE', 'en-US', 'fr-FR', 'hi-IN', 'ar-EG']) {
    for (const amount of [-12345.67, 0, 123456.78])
      assert.equal(
        parseLocalizedAmount(formatLocalizedAmount(amount, locale), locale),
        amount,
        locale,
      );
  }
  assert.equal(parseLocalizedAmount('12,90', 'de-DE'), 12.9);
  for (const input of ['', '-', '12.', 'a12', '1e3', 'Infinity'])
    assert.equal(parseLocalizedAmount(input), null);
  for (const input of ['1,,234', '12,34', '1,23,456'])
    assert.equal(parseLocalizedAmount(input), null);
  assert.equal(parseLocalizedAmount('1.23.456,78', 'de-DE'), null);
});
test('sliders quantize fractional steps, clamp and fail closed for invalid ranges', () => {
  assert.equal(sliderValue(0.31, 0, 1, 0.1), 0.3);
  assert.equal(sliderValue(200, 0, 100, 5), 100);
  assert.equal(sliderValue(-1, 0, 100, 5), 0);
  assert.equal(sliderValue(NaN, 2, 10), 2);
  assert.equal(sliderValue(4, 2, 2), 2);
});
test('contained image pan limits avoid exposing empty space for wide and tall images', () => {
  assert.deepEqual(imagePanBounds(300, 300, 2, 1), { x: 0, y: 0 });
  assert.deepEqual(imagePanBounds(300, 300, 2, 2), { x: 150, y: 0 });
  assert.deepEqual(imagePanBounds(300, 300, 0.5, 2), { x: 0, y: 150 });
  assert.equal(clampZoom(8, 5), 5);
  assert.equal(clampZoom(-1), 1);
});
test('browser keyboard insets avoid zoom and layout-resize double padding', () => {
  assert.equal(keyboardOcclusion(800, 500, 0, 1, true), 300);
  assert.equal(keyboardOcclusion(500, 500, 0, 1, true), 0);
  assert.equal(keyboardOcclusion(800, 400, 0, 2, true), 0);
  assert.equal(keyboardOcclusion(800, 500, 0, 1, false), 0);
  assert.equal(keyboardOcclusion(800, 500, 20, 1, true), 280);
});
test('image loading reads both native source and web DOM dimensions', () => {
  assert.deepEqual(imageDimensions({ nativeEvent: { source: { width: 120, height: 80 } } }), {
    width: 120,
    height: 80,
  });
  assert.deepEqual(
    imageDimensions({ nativeEvent: { target: { naturalWidth: 96, naturalHeight: 72 } } }),
    { width: 96, height: 72 },
  );
  for (const event of [
    null,
    {},
    { nativeEvent: {} },
    { nativeEvent: { source: { width: 0, height: 20 } } },
  ])
    assert.equal(imageDimensions(event), null);
});
