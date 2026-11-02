import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
export async function checkCatalog({ page, origin, base, name, eventually }) {
  const pages = fs
    .readdirSync(new URL('../apps/docs/content/docs/components/', import.meta.url))
    .filter((f) => f.endsWith('.mdx') && !f.endsWith('.de.mdx'))
    .map((f) => f.slice(0, -4));
  if (page.url() === 'about:blank')
    await page.goto(`${origin}${base}/en/`, { waitUntil: 'networkidle' });
  const frame = () => page.frameLocator('.component-preview iframe').first();
  async function visit(slug, locale = 'en', platform = 'ios', width = 375) {
    await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'no-preference' });
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate((p) => localStorage.setItem('isoline-preview-platform', p), platform);
    await page.goto(`${origin}${base}/${locale}/docs/components/${slug}/`, {
      waitUntil: 'networkidle',
    });
    const iframe = page.locator('.component-preview iframe').first();
    await iframe.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    const f = frame();
    await f.locator(`#preview-root-${platform}`).waitFor();
    await eventually(
      () =>
        f
          .getByTestId('preview-root')
          .evaluate((el) => el.children.length > 0 && el.getBoundingClientRect().height > 100),
      true,
    );
    return f;
  }
  for (const locale of ['en', 'de'])
    for (const slug of pages) {
      const f = await visit(
        slug,
        locale,
        locale === 'de' ? 'ios' : 'android',
        locale === 'de' ? 375 : 1280,
      );
      assert.equal(
        await f.locator('html').evaluate((el) => el.scrollWidth <= el.clientWidth),
        true,
        `${name}/${locale}/${slug}: horizontal preview overflow`,
      );
      assert.equal(
        await f
          .getByTestId('preview-root')
          .evaluate((el) =>
            Boolean(
              el.innerText.trim() ||
              el.querySelector('svg, img, canvas, input, textarea, [role=progressbar]'),
            ),
          ),
        true,
        `${slug}: empty preview`,
      );
      if (
        process.env.ISOLINE_PREVIEW_SCREENSHOTS &&
        locale === 'de' &&
        ['date-picker', 'time-picker', 'settings-list', 'layout-motion', 'avatar'].includes(
          slug,
        )
      )
        await page
          .locator('.component-preview')
          .first()
          .screenshot({
            path: path.join(
              process.env.ISOLINE_PREVIEW_SCREENSHOTS,
              `${name}-catalog-${slug}.png`,
            ),
          });
    }
  for (const locale of ['en', 'de'])
    for (const platform of ['ios', 'android']) {
      const de = locale === 'de',
        t = (en, german) => (de ? german : en);
      let f = await visit('checkbox', locale, platform);
      const checkbox = f.getByRole('checkbox', {
        name: t('Select item', 'Eintrag auswählen'),
        exact: true,
      });
      await checkbox.press('Space');
      assert.equal(await checkbox.isChecked(), true);
      const mixed = f.getByRole('checkbox', {
        name: t('Mixed selection', 'Teilweise ausgewählt'),
        exact: true,
      });
      assert.equal(await mixed.getAttribute('aria-checked'), 'mixed');
      assert.equal(
        await f
          .getByRole('checkbox', {
            name: t('Unavailable selection', 'Nicht verfügbare Auswahl'),
          })
          .isDisabled(),
        true,
      );
      const mixedToggle = f.getByRole('checkbox', {
        name: t('Mixed selection', 'Teilweise ausgewählt'),
        exact: true,
      });
      f = await visit('switch', locale, platform);
      const toggle = f.getByRole('switch').first();
      const original = await toggle.isChecked();
      await toggle.press('Space');
      await eventually(() => toggle.isChecked(), !original);
      await toggle.press('Enter');
      await eventually(() => toggle.isChecked(), original);
      f = await visit('slider', locale, platform);
      const slider = f.getByRole('slider', { name: t('Intensity', 'Intensität'), exact: true });
      await slider.press('End');
      await eventually(() => slider.getAttribute('aria-valuenow'), '100');
      await slider.press('Home');
      await eventually(() => slider.getAttribute('aria-valuenow'), '0');
      await slider.press('ArrowRight');
      await eventually(() => slider.getAttribute('aria-valuenow'), '5');
      await slider.click({ position: { x: 100, y: 22 } });
      assert.ok(Number(await slider.getAttribute('aria-valuenow')) > 5);
      f = await visit('color-picker', locale, platform);
      const teal = f.getByRole('radio', { name: t('Teal', 'Türkis'), exact: true });
      await teal.click();
      assert.equal(await teal.isChecked(), true);
      await teal.press('End');
      await eventually(
        () =>
          f.getByRole('radio', { name: 'Orange', exact: true }).getAttribute('aria-checked'),
        'true',
      );
      await f
        .getByRole('button', { name: t('Open color picker', 'Farbauswahl öffnen') })
        .click();
      await f
        .getByTestId('isoline-sheet-panel')
        .getByRole('radio', { name: t('Violet', 'Violett'), exact: true })
        .click();
      await f.getByText('#7c4ab1', { exact: true }).waitFor();
      f = await visit('date-picker', locale, platform);
      const next = f.getByRole('button', {
        name: t('Next month', 'Nächster Monat'),
        exact: true,
      });
      await next.click();
      await f.getByText(de ? 'Dezember 2026' : 'December 2026', { exact: true }).waitFor();
      await f
        .getByRole('button', { name: t('Previous month', 'Vorheriger Monat'), exact: true })
        .click();
      const disabled = f
        .getByRole('button', {
          name: de ? 'Donnerstag, 19. November 2026' : 'Thursday, November 19, 2026',
          exact: true,
        })
        .first();
      assert.equal(await disabled.isDisabled(), true);
      const day = f.getByRole('button', {
        name: de
          ? 'Freitag, 20. November 2026, Zwei Termine'
          : 'Friday, November 20, 2026, Two events',
        exact: true,
      });
      await day.click();
      await f.getByText('2026-11-20', { exact: true }).waitFor();
      await day.press('ArrowLeft');
      assert.equal(
        await f
          .getByRole('button', {
            name: de ? 'Mittwoch, 18. November 2026' : 'Wednesday, November 18, 2026',
            exact: true,
          })
          .first()
          .evaluate((el) => el === document.activeElement),
        true,
      );
      await f
        .getByRole('button', { name: t('Choose date', 'Datum wählen'), exact: true })
        .click();
      await f
        .getByTestId('isoline-sheet-panel')
        .getByRole('button', { name: t('Clear date', 'Datum entfernen'), exact: true })
        .click();
      await f.getByText(t('No date', 'Kein Datum'), { exact: true }).last().waitFor();
      f = await visit('time-picker', locale, platform);
      await f.getByRole('radio', { name: t('Hour 10', 'Stunde 10'), exact: true }).click();
      await f.getByRole('radio', { name: 'Minute 45', exact: true }).click();
      await f.getByText('10:45', { exact: true }).last().waitFor();
      await f
        .getByRole('button', { name: t('Choose time', 'Uhrzeit wählen'), exact: true })
        .click();
      await f
        .getByTestId('isoline-sheet-panel')
        .getByRole('radio', { name: t('Hour 11', 'Stunde 11'), exact: true })
        .click();
      await page.keyboard.press('Escape');
      await f.getByText('10:45', { exact: true }).last().waitFor();
      await f
        .getByRole('button', { name: t('Choose time', 'Uhrzeit wählen'), exact: true })
        .click();
      await f
        .getByTestId('isoline-sheet-panel')
        .getByRole('radio', { name: t('Hour 11', 'Stunde 11'), exact: true })
        .click();
      await f
        .getByTestId('isoline-sheet-panel')
        .getByRole('button', { name: t('Done', 'Fertig'), exact: true })
        .click();
      await f.getByText('11:45', { exact: true }).last().waitFor();
      f = await visit('amount-field', locale, platform);
      await f
        .getByRole('textbox', { name: t('Amount', 'Betrag'), exact: true })
        .fill(de ? '1.234,56' : '1,234.56');
      await f.getByText('1234.56', { exact: true }).waitFor();
      f = await visit('action-chip', locale, platform);
      await f
        .getByRole('button', { name: t('Add action', 'Aktion hinzufügen'), exact: true })
        .click();
      await f.getByText(t('Action selected', 'Aktion ausgewählt'), { exact: true }).waitFor();
      f = await visit('banner', locale, platform);
      await f
        .getByRole('button', { name: t('Retry', 'Erneut versuchen'), exact: true })
        .click();
      await f
        .getByText(t('Retry selected', 'Erneut versuchen ausgewählt'), { exact: true })
        .waitFor();
      await f.getByRole('button', { name: t('Dismiss notice', 'Hinweis schließen') }).click();
      await f.getByRole('button', { name: t('Show notice', 'Hinweis anzeigen') }).waitFor();
      f = await visit('undo-bar', locale, platform);
      await f
        .getByRole('button', { name: t('Pause countdown', 'Countdown pausieren') })
        .click();
      await f
        .getByRole('button', { name: t('Resume countdown', 'Countdown fortsetzen') })
        .waitFor();
      await f
        .getByRole('button', {
          name: t('Undo: Item removed', 'Rückgängig: Eintrag entfernt'),
          exact: true,
        })
        .click();
      await f.getByText(t('Restored', 'Wiederhergestellt'), { exact: true }).waitFor();
      f = await visit('swipeable-row', locale, platform);
      await f
        .getByRole('button', { name: t('Show row actions', 'Zeilenaktionen anzeigen') })
        .click();
      assert.equal(
        await f
          .getByRole('button', { name: t('Unavailable action', 'Nicht verfügbare Aktion') })
          .isDisabled(),
        true,
      );
      await f.getByRole('button', { name: t('Mark done', 'Erledigen'), exact: true }).click();
      await f.getByText(t('Done selected', 'Erledigen ausgewählt'), { exact: true }).waitFor();
      f = await visit('image-viewer', locale, platform);
      await f.getByRole('button', { name: t('Zoom in', 'Vergrößern'), exact: true }).click();
      assert.equal(
        await f
          .getByRole('button', { name: t('Zoom out', 'Verkleinern'), exact: true })
          .isDisabled(),
        false,
      );
      await f.getByRole('button', { name: t('Reset zoom', 'Zoom zurücksetzen') }).click();
      assert.equal(
        await f
          .getByRole('button', { name: t('Zoom out', 'Verkleinern'), exact: true })
          .isDisabled(),
        true,
      );
      if (process.env.ISOLINE_PREVIEW_SCREENSHOTS && de && platform === 'ios')
        await page
          .locator('.component-preview')
          .first()
          .screenshot({
            path: path.join(
              process.env.ISOLINE_PREVIEW_SCREENSHOTS,
              `${name}-catalog-image.png`,
            ),
          });
    }
  console.log(
    `${name}: all ${pages.length} component guides have rendered EN/DE previews; new controls, keyboard, picker cancellation/confirmation, undo and image zoom passed in both platform styles.`,
  );
}
