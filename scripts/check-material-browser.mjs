import assert from 'node:assert/strict';
import path from 'node:path';

export async function checkMaterials({ page, origin, base, name, eventually }) {
  if (page.url() === 'about:blank')
    await page.goto(`${origin}${base}/en/docs/`, { waitUntil: 'networkidle' });
  const panel = () => page.frameLocator('.component-preview iframe').first();
  async function visit(slug, locale, platform, width) {
    await page.emulateMedia({ forcedColors: 'none', reducedMotion: 'no-preference' });
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate((p) => localStorage.setItem('isoline-preview-platform', p), platform);
    await page.goto(`${origin}${base}/${locale}/docs/${slug}/`, { waitUntil: 'networkidle' });
    await page
      .locator('.component-preview iframe')
      .first()
      .evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    return panel();
  }
  async function bounds(frame) {
    const read = () =>
      frame.getByTestId('isoline-popover-panel').evaluate((el) => {
        const b = el.getBoundingClientRect();
        return {
          x: b.x,
          y: b.y,
          right: b.right,
          bottom: b.bottom,
          width: b.width,
          height: b.height,
          vw: innerWidth,
          vh: innerHeight,
        };
      });
    await eventually(async () => {
      const box = await read();
      return (
        box.width > 100 &&
        box.height > 20 &&
        box.x >= 0 &&
        box.y >= 0 &&
        box.right <= box.vw + 1 &&
        box.bottom <= box.vh + 1
      );
    }, true);
    const box = await read();
    assert.ok(box.width > 100 && box.height > 20, `${name}: popover must have content`);
    assert.ok(
      box.x >= 0 && box.y >= 0 && box.right <= box.vw + 1 && box.bottom <= box.vh + 1,
      `${name}: popover must fit viewport ${JSON.stringify(box)}`,
    );
  }
  for (const locale of process.env.ISOLINE_OVERLAY_ONLY ? [] : ['en', 'de'])
    for (const width of [375, 1280])
      for (const platform of ['ios', 'android']) {
        console.log(`${name}: ${locale} ${width} ${platform}`);
        const de = locale === 'de';
        const t = (en, german) => (de ? german : en);
        let frame = await visit('components/material-controls', locale, platform, width);
        const action = frame.getByRole('button', {
          name: t('Glass action', 'Glasaktion'),
          exact: true,
        });
        await action.click();
        await frame
          .getByText(t('Action selected', 'Aktion ausgewählt'), { exact: true })
          .waitFor();
        assert.equal(
          await frame
            .getByRole('button', {
              name: t('Disabled action', 'Deaktivierte Aktion'),
              exact: true,
            })
            .isDisabled(),
          true,
        );
        await frame
          .getByRole('textbox', { name: t('Material search', 'Materialsuche') })
          .fill('Liquid Glass');
        await frame
          .getByRole('button', { name: t('Clear material search', 'Materialsuche leeren') })
          .click();
        assert.equal(
          await frame
            .getByRole('textbox', { name: t('Material search', 'Materialsuche') })
            .inputValue(),
          '',
        );
        await frame.getByRole('button', { name: t('Saved', 'Gesichert'), exact: true }).click();
        assert.equal(
          await frame
            .getByRole('button', { name: t('Locked', 'Gesperrt'), exact: true })
            .isDisabled(),
          true,
        );
        await frame
          .getByRole('button', { name: t('Choose collection', 'Sammlung wählen'), exact: true })
          .click();
        await bounds(frame);
        assert.equal(
          await frame
            .getByRole('menuitemradio', {
              name: t('Unavailable collection', 'Nicht verfügbare Sammlung'),
              exact: true,
            })
            .isDisabled(),
          true,
        );
        const lastChoice = frame.getByRole('menuitemradio', {
          name: t('Collection 12', 'Sammlung 12'),
          exact: true,
        });
        await lastChoice.click();
        await frame
          .getByRole('button', { name: t('Choose collection', 'Sammlung wählen'), exact: true })
          .getByText(t('Collection 12', 'Sammlung 12'), { exact: true })
          .waitFor();
        const blurCount = () =>
          frame
            .locator('div')
            .evaluateAll(
              (els) =>
                els.filter((el) =>
                  /blur\(/.test(
                    getComputedStyle(el).backdropFilter ||
                      getComputedStyle(el).getPropertyValue('-webkit-backdrop-filter'),
                  ),
                ).length,
            );
        await eventually(async () => (await blurCount()) > 0, platform === 'ios');
        await frame
          .getByRole('switch', { name: t('Solid material', 'Solides Material') })
          .check();
        await eventually(blurCount, 0);
        assert.equal(
          await frame.locator('html').evaluate((el) => el.scrollWidth <= el.clientWidth),
          true,
        );

        frame = await visit('components/tab-bar', locale, platform, width);
        const home = frame.getByRole('tab', { name: t('Home', 'Start'), exact: true });
        const search = frame.getByRole('tab', {
          name: t('Search tab', 'Suchbereich'),
          exact: true,
        });
        await search.click();
        await eventually(() => search.getAttribute('aria-selected'), 'true');
        assert.equal(
          await frame
            .getByRole('tab', { name: t('Locked tab', 'Gesperrter Bereich') })
            .isDisabled(),
          true,
        );
        await search.press('ArrowRight');
        await eventually(() => home.getAttribute('aria-selected'), 'true');
        await home.press('End');
        await eventually(() => search.getAttribute('aria-selected'), 'true');
        await search.press('Home');
        await eventually(() => home.getAttribute('aria-selected'), 'true');

        frame = await visit('components/popover', locale, platform, width);
        await frame
          .getByRole('button', { name: t('Open popover', 'Popover öffnen'), exact: true })
          .click();
        await frame
          .getByRole('button', { name: t('Close popover', 'Popover schließen'), exact: true })
          .waitFor();
        await bounds(frame);
        await page.keyboard.press('Escape');
        await frame.getByTestId('isoline-popover-panel').waitFor({ state: 'hidden' });
        await frame
          .getByRole('button', { name: t('Context actions', 'Kontextaktionen') })
          .click();
        const unavailable = frame.getByRole('menuitem', {
          name: t('Unavailable action', 'Nicht verfügbare Aktion'),
        });
        assert.equal(await unavailable.isDisabled(), true);
        await bounds(frame);
        const remove = frame.getByRole('menuitem', {
          name: t('Delete', 'Löschen'),
          exact: true,
        });
        const normal = frame.getByRole('menuitem', {
          name: t('Rename', 'Umbenennen'),
          exact: true,
        });
        assert.notEqual(
          await remove
            .locator('[dir=auto]')
            .first()
            .evaluate((el) => getComputedStyle(el).color),
          await normal
            .locator('[dir=auto]')
            .first()
            .evaluate((el) => getComputedStyle(el).color),
        );
        await normal.press('End');
        assert.equal(await remove.evaluate((el) => el === document.activeElement), true);
        await remove.press('Home');
        assert.equal(await normal.evaluate((el) => el === document.activeElement), true);
        await normal.press('ArrowUp');
        assert.equal(await remove.evaluate((el) => el === document.activeElement), true);
        await remove.press('Enter');
        await frame
          .getByText(t('Delete selected', 'Löschen ausgewählt'), { exact: true })
          .waitFor();

        frame = await visit('components/floating-actions', locale, platform, width);
        await frame
          .getByRole('button', { name: t('Create item', 'Eintrag erstellen'), exact: true })
          .click();
        await frame.getByText(t('Item created', 'Eintrag erstellt'), { exact: true }).waitFor();
        await frame
          .getByRole('button', { name: t('Create options', 'Erstelloptionen'), exact: true })
          .click();
        await bounds(frame);
        assert.equal(
          await frame
            .getByRole('menuitem', {
              name: t('Unavailable format', 'Nicht verfügbares Format'),
            })
            .isDisabled(),
          true,
        );
        await frame
          .getByRole('menuitem', { name: t('Create draft', 'Entwurf erstellen'), exact: true })
          .click();
        await frame
          .getByText(t('Draft created', 'Entwurf erstellt'), { exact: true })
          .waitFor();
        await frame
          .getByRole('button', { name: t('Capture menu', 'Erfassungsmenü'), exact: true })
          .click();
        await bounds(frame);
        await frame
          .getByRole('menuitem', { name: t('Capture note', 'Notiz erfassen'), exact: true })
          .click();
        await frame.getByText(t('Note captured', 'Notiz erfasst'), { exact: true }).waitFor();
        if (
          process.env.ISOLINE_PREVIEW_SCREENSHOTS &&
          de &&
          width === 375 &&
          platform === 'ios'
        )
          await page
            .locator('.component-preview')
            .first()
            .screenshot({
              path: path.join(
                process.env.ISOLINE_PREVIEW_SCREENSHOTS,
                `${name}-material-actions.png`,
              ),
            });

        frame = await visit('components/surface-group', locale, platform, width);
        const first = frame.getByRole('button', { name: t('First', 'Erste'), exact: true });
        const groupGap = () =>
          first.evaluate((el) => {
            let node = el;
            while (
              node &&
              getComputedStyle(node).gap !== '24px' &&
              getComputedStyle(node).gap !== '4px'
            )
              node = node.parentElement;
            return node && getComputedStyle(node).gap;
          });
        await eventually(groupGap, '24px');
        await frame
          .getByRole('button', { name: t('Bring surfaces together', 'Flächen zusammenführen') })
          .click();
        await eventually(groupGap, '4px');
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await frame
          .getByRole('button', { name: t('Separate surfaces', 'Flächen trennen') })
          .click();
        await eventually(groupGap, '24px');
      }
  // Overlay options share the same material contract; verify their public examples too.
  const frame = await visit('foundations/materials', 'en', 'ios', 375);
  // Reuse the same exported runtime with the compact overlay scene. This avoids
  // WebKit's offscreen iframe scroll limitations in the full component catalogue.
  await page
    .locator('.component-preview iframe')
    .first()
    .evaluate((el) => {
      const url = new URL(el.src);
      url.searchParams.set('kind', 'material-overlays');
      el.src = url.href;
    });
  // Pointer dismissal and placement are covered by the existing overlay suite;
  // exercise keyboard activation with the explicit material option here.
  for (const kind of ['dialog', 'sheet', 'panel']) {
    await frame
      .getByRole('button', { name: `Open material ${kind}`, exact: true })
      .press('Enter');
    await frame.getByRole('button', { name: `Close ${kind}`, exact: true }).press('Enter');
  }
  await frame.getByRole('button', { name: 'Undo', exact: true }).press('Enter');
  await frame.getByText('Undo selected', { exact: true }).waitFor();
  console.log(
    `${name}: material controls, tabs/keyboard, anchored context/split/FAB menus, grouping, solid fallback and overlay materials passed (EN/DE, mobile/desktop, iOS/Android).`,
  );
}
