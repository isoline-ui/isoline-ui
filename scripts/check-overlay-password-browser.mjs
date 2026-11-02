import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

/** Test rendered surfaces and password behavior, not just wrapper prop declarations. */
export async function checkOverlayPasswords({ browser, origin, base, name, eventually }) {
  const page = await browser.newPage({ viewport: { width: 390, height: 1000 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const screenshot = async (label) => {
    if (!process.env.ISOLINE_PREVIEW_SCREENSHOTS) return;
    await mkdir(process.env.ISOLINE_PREVIEW_SCREENSHOTS, { recursive: true });
    await page
      .locator('.component-preview')
      .first()
      .screenshot({
        path: path.join(process.env.ISOLINE_PREVIEW_SCREENSHOTS, `${name}-${label}.png`),
      });
  };
  const material = (locator) =>
    locator.evaluate((root) => {
      const surfaces = [root, ...root.querySelectorAll('*')];
      const glass = surfaces.find((node) => {
        const css = getComputedStyle(node);
        const filter =
          css.getPropertyValue('backdrop-filter') ||
          css.getPropertyValue('-webkit-backdrop-filter');
        return filter && filter !== 'none';
      });
      return {
        glass: !!glass,
        background: glass ? getComputedStyle(glass).backgroundColor : '',
      };
    });
  async function visit(slug, locale, platform) {
    await page.emulateMedia({ forcedColors: 'none' });
    if (page.url() === 'about:blank')
      await page.goto(`${origin}${base}/en/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(
      (value) => localStorage.setItem('isoline-preview-platform', value),
      platform,
    );
    await page.goto(`${origin}${base}/${locale}/docs/components/${slug}/`, {
      waitUntil: 'domcontentloaded',
    });
    const iframe = page.locator('.component-preview iframe').first();
    await iframe.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    const frame = page.frameLocator('.component-preview iframe').first();
    await frame.locator(`#preview-root-${platform}`).waitFor();
    return frame;
  }
  try {
    for (const locale of ['en', 'de'])
      for (const platform of ['ios', 'android']) {
        const t = (en, de) => (locale === 'de' ? de : en);
        const frame = await visit('overlay-materials', locale, platform);
        const expected = platform === 'ios';
        for (const id of ['overlay-undo', 'overlay-jump'])
          await eventually(async () => (await material(frame.getByTestId(id))).glass, expected);
        const sheet = frame.getByTestId('isoline-sheet-panel');
        const openers = [
          t('Overlay date', 'Overlay-Datum'),
          t('Overlay time', 'Overlay-Uhrzeit'),
          t('Overlay color', 'Overlay-Farbe'),
        ];
        const regular = [];
        for (const label of openers) {
          await frame.getByRole('button', { name: label, exact: true }).click();
          await sheet.waitFor();
          await eventually(async () => (await material(sheet)).glass, expected);
          regular.push((await material(sheet)).background);
          await frame
            .getByRole('button', { name: t('Close', 'Schließen'), exact: true })
            .last()
            .click();
          await sheet.waitFor({ state: 'hidden' });
        }
        await frame.getByRole('button', { name: t('Clear', 'Klar'), exact: true }).click();
        for (const [index, label] of openers.entries()) {
          await frame.getByRole('button', { name: label, exact: true }).click();
          await sheet.waitFor();
          await eventually(async () => (await material(sheet)).glass, expected);
          if (expected)
            assert.notEqual(
              (await material(sheet)).background,
              regular[index],
              `${label}: clear style reaches sheet`,
            );
          if (expected && index === 0) await screenshot(`${locale}-${platform}-picker-glass`);
          await frame
            .getByRole('button', { name: t('Close', 'Schließen'), exact: true })
            .last()
            .click();
          await sheet.waitFor({ state: 'hidden' });
        }
        await frame
          .getByRole('button', { name: t('Display density', 'Anzeigedichte'), exact: true })
          .click();
        const menu = frame.getByTestId('isoline-popover-panel');
        await menu.waitFor();
        await eventually(async () => (await material(menu)).glass, expected);
        await frame
          .getByRole('menuitemradio', { name: t('Compact', 'Kompakt'), exact: true })
          .click();
        await menu.waitFor({ state: 'hidden' });

        await frame
          .getByRole('button', { name: t('Password sheet', 'Passwort-Sheet'), exact: true })
          .click();
        await sheet.waitFor();
        await eventually(async () => (await material(sheet)).glass, expected);
        const password = frame.getByLabel(t('Sheet password', 'Sheet-Passwort'), {
          exact: true,
        });
        await password.fill('Example-Passphrase42!');
        assert.equal(await password.evaluate((el) => el.type), 'password');
        await frame
          .getByRole('button', { name: t('Show password', 'Passwort anzeigen'), exact: true })
          .click();
        assert.equal(await password.evaluate((el) => el.type), 'text');
        assert.equal(await password.inputValue(), 'Example-Passphrase42!');
        await frame.getByRole('button', { name: t('Done', 'Fertig'), exact: true }).click();
        await sheet.waitFor({ state: 'hidden' });

        // Explicit solid requests and browser accessibility preferences both remove blur.
        await frame
          .getByRole('switch', { name: t('Solid overlays', 'Solide Overlays'), exact: true })
          .check();
        for (const id of ['overlay-undo', 'overlay-jump'])
          await eventually(async () => (await material(frame.getByTestId(id))).glass, false);
        for (const label of openers) {
          await frame.getByRole('button', { name: label, exact: true }).click();
          await sheet.waitFor();
          assert.equal((await material(sheet)).glass, false);
          await frame
            .getByRole('button', { name: t('Close', 'Schließen'), exact: true })
            .last()
            .click();
          await sheet.waitFor({ state: 'hidden' });
        }
        await frame
          .getByRole('switch', { name: t('Solid overlays', 'Solide Overlays'), exact: true })
          .uncheck();
        await page.emulateMedia({ forcedColors: 'active' });
        await eventually(
          async () => (await material(frame.getByTestId('overlay-undo'))).glass,
          false,
        );
        await frame.getByRole('button', { name: openers[0], exact: true }).click();
        await sheet.waitFor();
        assert.equal((await material(sheet)).glass, false);
        await frame
          .getByRole('button', { name: t('Close', 'Schließen'), exact: true })
          .last()
          .click();
        await sheet.waitFor({ state: 'hidden' });

        const image = await visit('image-viewer', locale, platform);
        await eventually(
          async () => (await material(image.getByTestId('isoline-image-controls'))).glass,
          expected,
        );
        // Use the rendered DOM image dimensions, independent of the component's
        // shared values, to verify the toolbar stays over actual photo pixels.
        let photoLayout;
        await eventually(async () => {
          const viewport = await image.getByTestId('isoline-image-viewport').boundingBox();
          const controls = await image.getByTestId('isoline-image-controls').boundingBox();
          const pixels = await image
            .getByTestId('isoline-image-viewport')
            .locator('img')
            .evaluate((el) => ({ width: el.naturalWidth, height: el.naturalHeight }));
          if (!pixels.width || !pixels.height) return false;
          const paintedHeight = Math.min(
            viewport.height,
            (viewport.width * pixels.height) / pixels.width,
          );
          const top = viewport.y + (viewport.height - paintedHeight) / 2;
          photoLayout = { viewport, controls, pixels, top, paintedHeight };
          return (
            controls.y >= top - 1 && controls.y + controls.height <= top + paintedHeight + 1
          );
        }, true).catch(async (error) => {
          console.error({
            name,
            locale,
            platform,
            photoLayout,
            parent: await image
              .getByTestId('isoline-image-controls')
              .evaluate((el) => ({
                style: el.parentElement.getAttribute('style'),
                box: el.parentElement.getBoundingClientRect().toJSON(),
                bottom: getComputedStyle(el.parentElement).bottom,
              })),
          });
          throw error;
        });
        await screenshot(`${locale}-${platform}-image-controls`);
        await image
          .getByRole('button', { name: t('Zoom in', 'Vergrößern'), exact: true })
          .click();
        await image
          .getByRole('switch', {
            name: t('Solid image controls', 'Solide Bildsteuerung'),
            exact: true,
          })
          .check();
        await eventually(
          async () => (await material(image.getByTestId('isoline-image-controls'))).glass,
          false,
        );

        const floating = await visit('floating-actions', locale, platform);
        const solidMenu = floating.getByRole('switch', {
          name: t('Solid material', 'Solides Material'),
          exact: true,
        });
        for (const solid of [true, false]) {
          if (solid) await solidMenu.check();
          else await solidMenu.uncheck();
          await floating
            .getByRole('button', { name: t('Capture menu', 'Erfassungsmenü'), exact: true })
            .click();
          const menu = floating.getByTestId('isoline-popover-panel');
          await menu.waitFor();
          await eventually(async () => (await material(menu)).glass, !solid && expected);
          await floating
            .getByRole('menuitem', { name: t('Capture note', 'Notiz erfassen'), exact: true })
            .click();
          await menu.waitFor({ state: 'hidden' });
        }

        const fields = await visit('password-input', locale, platform);
        for (const [id, label, autocomplete] of [
          ['password-text-field', t('New password', 'Neues Passwort'), 'new-password'],
          ['password-basic-input', t('Account password', 'Kontopasswort'), 'current-password'],
        ]) {
          const group = fields.getByTestId(id);
          const input = group.getByLabel(label, { exact: true });
          assert.equal(await input.evaluate((el) => el.type), 'password');
          assert.equal(await input.getAttribute('autocomplete'), autocomplete);
          assert.equal(await input.getAttribute('autocapitalize'), 'none');
          assert.equal(await input.getAttribute('autocorrect'), 'off');
          assert.equal(await input.getAttribute('spellcheck'), 'false');
          await input.fill('Example-Passphrase42!');
          await group
            .getByRole('button', { name: t('Show password', 'Passwort anzeigen'), exact: true })
            .click();
          assert.equal(await input.evaluate((el) => el.type), 'text');
          assert.equal(await input.inputValue(), 'Example-Passphrase42!');
          await group
            .getByRole('button', {
              name: t('Hide password', 'Passwort verbergen'),
              exact: true,
            })
            .press('Enter');
          assert.equal(await input.evaluate((el) => el.type), 'password');
          assert.equal(await input.inputValue(), 'Example-Passphrase42!');
          assert.equal((await material(group)).glass, false, 'password fields remain solid');
        }
        await screenshot(`${locale}-${platform}-passwords`);
      }
    assert.deepEqual(errors, [], `${name}: overlay/password runtime errors`);
    console.log(
      `${name}: picker/floating materials, clear/solid/contrast fallbacks and password reveal passed (EN/DE, iOS/Android).`,
    );
  } finally {
    await page.close();
  }
}
