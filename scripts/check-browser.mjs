import assert from 'node:assert/strict';
import { checkMaterials } from './check-material-browser.mjs';
import http from 'node:http';
import { mkdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';
const root = path.resolve(import.meta.dirname, '../apps/docs/out');
const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '/isoline-ui';
if (process.env.ISOLINE_PREVIEW_SCREENSHOTS)
  await mkdir(process.env.ISOLINE_PREVIEW_SCREENSHOTS, { recursive: true });
async function eventually(read, expected) {
  const until = Date.now() + 5000;
  let value;
  do {
    value = await read();
    if (value === expected) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  } while (Date.now() < until);
  assert.equal(value, expected);
}
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.ttf': 'font/ttf',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (!pathname.startsWith(base + '/')) {
      res.writeHead(404).end();
      return;
    }
    let file = path.resolve(root, '.' + pathname.slice(base.length));
    if (!file.startsWith(root + path.sep)) throw Error('Invalid path');
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    res.setHeader('Content-Type', mime[path.extname(file)] ?? 'application/octet-stream');
    res.end(await readFile(file));
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
async function checkForcedColors(page) {
  await page.goto(`${origin}${base}/en/docs/native/liquid-glass/`, {
    waitUntil: 'networkidle',
  });
  await page
    .locator('.component-preview iframe')
    .first()
    .evaluate((el) => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
  await page.emulateMedia({ forcedColors: 'active' });
  await eventually(
    () =>
      page
        .frameLocator('.component-preview iframe')
        .first()
        .getByTestId('glass-example-surface')
        .evaluate(
          (el) =>
            getComputedStyle(el).getPropertyValue('backdrop-filter') ||
            getComputedStyle(el).getPropertyValue('-webkit-backdrop-filter'),
        ),
    'none',
  );
}
const engines = { chromium, firefox, webkit };
const selected = process.env.ISOLINE_BROWSER
  ? { [process.env.ISOLINE_BROWSER]: engines[process.env.ISOLINE_BROWSER] }
  : engines;
try {
  for (const [name, engine] of Object.entries(selected)) {
    const browser = await engine.launch({
      headless: true,
      ...(name === 'webkit' && process.env.ISOLINE_WEBKIT_EXECUTABLE
        ? { executablePath: process.env.ISOLINE_WEBKIT_EXECUTABLE }
        : {}),
    });
    try {
      const page = await browser.newPage();
      const errors = [];
      page.on('pageerror', (error) => {
        errors.push(error.message);
        if (process.env.ISOLINE_BROWSER) console.error(error.stack);
      });
      if (process.env.ISOLINE_MATERIAL_ONLY) {
        await checkMaterials({ page, origin, base, name, eventually });
        assert.deepEqual(errors, [], `${name}: material browser runtime errors`);
        continue;
      }
      if (process.env.ISOLINE_FORCED_COLORS_ONLY) {
        await checkForcedColors(page);
        assert.deepEqual(errors, [], `${name}: forced-colors runtime errors`);
        console.log(`${name}: forced-colors glass fallback passed.`);
        continue;
      }
      // Fresh documents must be correct before any platform toggle or press.
      for (const width of [375, 1280])
        for (const platform of ['ios', 'android']) {
          await page.setViewportSize({ width, height: 1000 });
          await page.goto(`${origin}${base}/en/docs/components/dialog/`, {
            waitUntil: 'networkidle',
          });
          await page.evaluate(
            (platform) => localStorage.setItem('isoline-preview-platform', platform),
            platform,
          );
          await page.reload({ waitUntil: 'networkidle' });
          const frame = page.frameLocator('.component-preview iframe').first();
          const open = frame.getByRole('button', { name: 'Open dialog', exact: true });
          await eventually(
            () => open.evaluate((el) => getComputedStyle(el).borderRadius),
            platform === 'ios' ? '12px' : '28px',
          );
          await open.click();
          const panel = frame.getByTestId('isoline-dialog-panel');
          await panel.waitFor();
          const layout = await panel.evaluate((el) => {
            const box = el.getBoundingClientRect();
            const style = getComputedStyle(el);
            return {
              x: box.x,
              y: box.y,
              width: box.width,
              height: box.height,
              viewportWidth: innerWidth,
              viewportHeight: innerHeight,
              background: style.backgroundColor,
              text: getComputedStyle(el.querySelector('[dir=auto]')).color,
            };
          });
          assert.ok(
            Math.abs(layout.x + layout.width / 2 - layout.viewportWidth / 2) < 2,
            'dialog must be horizontally centered',
          );
          assert.ok(
            Math.abs(layout.y + layout.height / 2 - layout.viewportHeight / 2) < 2,
            'dialog must be vertically centered',
          );
          assert.notEqual(
            layout.background,
            'rgba(0, 0, 0, 0)',
            'portal panel must have a themed background',
          );
          assert.notEqual(
            layout.background,
            layout.text,
            'portal text must contrast with the surface',
          );
          if (platform === 'ios')
            assert.notEqual(
              await frame
                .getByRole('textbox', { name: 'Project name', exact: true })
                .evaluate((el) => getComputedStyle(el).backgroundColor),
              layout.background,
              'filled input must remain distinguishable from its panel',
            );
          const sheetTrigger = frame.getByRole('button', { name: 'Open sheet', exact: true });
          const blocked = await sheetTrigger.click({ trial: true, timeout: 500 }).then(
            () => false,
            () => true,
          );
          assert.ok(blocked, 'dialog backdrop must intercept clicks on underlying controls');
          await page.locator('.component-preview').first().locator('.preview-mode').click();
          await eventually(
            () =>
              panel.evaluate(
                (el, original) => getComputedStyle(el).backgroundColor !== original,
                layout.background,
              ),
            true,
          );
          assert.notEqual(
            await panel
              .locator('[dir=auto]')
              .first()
              .evaluate((el) => getComputedStyle(el).color),
            layout.text,
            'portal text must update with dark mode',
          );
          await frame.getByRole('textbox', { name: 'Project name', exact: true }).focus();
          await page.keyboard.press('Escape');
          await panel.waitFor({ state: 'hidden' });
          await frame.getByRole('button', { name: 'Open sheet', exact: true }).click();
          const sheet = frame.getByTestId('isoline-sheet-panel');
          await sheet.waitFor();
          const bounds = await sheet.evaluate((el) => {
            const b = el.getBoundingClientRect();
            return {
              bottom: b.bottom,
              width: b.width,
              viewportWidth: innerWidth,
              viewportHeight: innerHeight,
              background: getComputedStyle(el).backgroundColor,
            };
          });
          assert.ok(
            Math.abs(bounds.bottom - bounds.viewportHeight) < 2,
            'sheet must be anchored to the viewport bottom',
          );
          assert.ok(
            Math.abs(bounds.width - bounds.viewportWidth) < 2,
            'sheet must fill the viewport width',
          );
          assert.notEqual(bounds.background, 'rgba(0, 0, 0, 0)');
          if (process.env.ISOLINE_PREVIEW_SCREENSHOTS)
            await page.locator('.component-preview').screenshot({
              path: path.join(
                process.env.ISOLINE_PREVIEW_SCREENSHOTS,
                `${name}-${platform}-${width}-sheet.png`,
              ),
            });
          await frame.getByRole('button', { name: 'Close', exact: true }).last().click();
        }
      await page.evaluate(() => localStorage.setItem('isoline-preview-platform', 'ios'));
      for (const locale of ['en', 'de'])
        for (const width of [375, 1280]) {
          await page.setViewportSize({ width, height: 1000 });
          await page.goto(`${origin}${base}/${locale}/`, { waitUntil: 'networkidle' });
          const preview = page.locator('.component-preview').first();
          const frame = page.frameLocator('.component-preview iframe').first();
          await frame
            .getByText(locale === 'de' ? 'Dein Bereich' : 'Your space', { exact: true })
            .waitFor();
          const toggle = frame.getByRole('switch');
          await toggle.click();
          assert.equal(await toggle.isChecked(), false);
          for (const theme of ['Teal', 'Cyan', 'Violet']) {
            await preview.getByRole('button', { name: theme, exact: true }).click();
            for (const platform of ['Android', 'iOS']) {
              await preview.getByRole('button', { name: platform, exact: true }).click();
              const action = frame.getByRole('button', {
                name: locale === 'de' ? 'Hinzufügen' : 'Add',
                exact: true,
              });
              await eventually(
                () => action.evaluate((el) => getComputedStyle(el).borderRadius),
                platform === 'iOS' ? '12px' : '20px',
              );
              assert.equal(await toggle.isChecked(), false);
              assert.equal(
                await preview.evaluate((el) => el.scrollWidth <= el.clientWidth),
                true,
              );
            }
          }
          const add = frame.getByRole('button', {
            name: locale === 'de' ? 'Hinzufügen' : 'Add',
            exact: true,
          });
          await add.focus();
          await page.keyboard.press('Enter');
          await frame
            .getByText(locale === 'de' ? 'Hinzufügen ausgewählt' : 'Add selected', {
              exact: true,
            })
            .waitFor();
          await preview.locator('.preview-mode').click();
          assert.equal(
            await frame.locator('html').evaluate((el) => el.scrollWidth <= el.clientWidth),
            true,
          );
          if (process.env.ISOLINE_PREVIEW_SCREENSHOTS && locale === 'de' && width === 375)
            await preview.screenshot({
              path: path.join(process.env.ISOLINE_PREVIEW_SCREENSHOTS, name + '.png'),
            });
          await page.goto(`${origin}${base}/${locale}/docs/components/text-field/`, {
            waitUntil: 'networkidle',
          });
          assert.equal(
            await page.locator('.component-preview').first().getAttribute('data-platform'),
            'ios',
          );
          const fields = page.frameLocator('.component-preview iframe').first();
          await fields
            .getByRole('textbox', {
              name: locale === 'de' ? 'Projektname' : 'Project name',
              exact: true,
            })
            .fill('Browser project');
          assert.equal(
            await fields
              .getByRole('textbox', {
                name: locale === 'de' ? 'Vorschau durchsuchen' : 'Search preview',
                exact: true,
              })
              .inputValue(),
            'Browser project',
          );
        }
      await page.goto(`${origin}${base}/en/docs/components/dialog/`, {
        waitUntil: 'networkidle',
      });
      const overlays = page.frameLocator('.component-preview iframe').first();
      await overlays.getByRole('button', { name: 'Open dialog', exact: true }).click();
      await overlays
        .getByRole('textbox', { name: 'Project name', exact: true })
        .fill('A project');
      await overlays.getByRole('button', { name: 'Save', exact: true }).click();
      await overlays
        .getByRole('textbox', { name: 'Project name', exact: true })
        .waitFor({ state: 'hidden' });
      await overlays.getByRole('button', { name: 'Open sheet', exact: true }).click();
      await overlays.getByText('Your selection', { exact: true }).waitFor();
      await overlays.getByRole('button', { name: 'Close', exact: true }).last().click();
      await overlays.getByText('Your selection', { exact: true }).waitFor({ state: 'hidden' });
      await overlays.getByRole('button', { name: 'Open menu', exact: true }).click();
      await overlays.getByText('Actions', { exact: true }).waitFor();
      await overlays.getByText('Back', { exact: true }).click();
      await overlays.getByText('Actions', { exact: true }).waitFor({ state: 'hidden' });
      for (const locale of ['en', 'de'])
        for (const width of [375, 1280]) {
          await page.setViewportSize({ width, height: 1000 });
          await page.goto(`${origin}${base}/${locale}/docs/components/floating-toolbar/`, {
            waitUntil: 'networkidle',
          });
          const preview = page.locator('.component-preview').first();
          const frame = page.frameLocator('.component-preview iframe').first();
          const toolbar = frame.getByTestId('floating-toolbar');
          await toolbar.waitFor();
          for (const platform of ['iOS', 'Android']) {
            await preview.getByRole('button', { name: platform, exact: true }).click();
            await eventually(
              () => toolbar.evaluate((el) => getComputedStyle(el).borderRadius),
              platform === 'iOS' ? '28px' : '20px',
            );
            const before = await toolbar.boundingBox();
            const scroll = frame.getByTestId('toolbar-scroll');
            const position = await scroll.evaluate((el) => {
              el.scrollTop = 200;
              return el.scrollTop;
            });
            assert.ok(position > 0, 'collection must scroll independently');
            const after = await toolbar.boundingBox();
            assert.ok(
              Math.abs(after.y - before.y) < 1,
              'floating toolbar must stay in place while content scrolls',
            );
            const gap = await toolbar.evaluate((el) => {
              const scene = el.closest('[data-testid=toolbar-scene]');
              return scene.getBoundingClientRect().bottom - el.getBoundingClientRect().bottom;
            });
            assert.ok(Math.abs(gap - 12) < 1, 'toolbar must retain its bottom inset');
            await frame
              .getByRole('button', { name: locale === 'de' ? 'Neu' : 'New', exact: true })
              .click();
            await frame
              .getByText(locale === 'de' ? 'Eintrag hinzugefügt' : 'Item added', {
                exact: true,
              })
              .waitFor();
            await frame
              .getByRole('button', { name: locale === 'de' ? 'Mehr' : 'More', exact: true })
              .click();
            await frame
              .getByText(locale === 'de' ? 'Weitere Aktionen' : 'More actions', { exact: true })
              .waitFor();
            await frame
              .getByRole('button', {
                name: locale === 'de' ? 'Schließen' : 'Close',
                exact: true,
              })
              .last()
              .click();
            await frame
              .getByRole('switch', {
                name: locale === 'de' ? 'Solide Darstellung' : 'Solid surface',
                exact: true,
              })
              .check();
            assert.equal(
              await toolbar.evaluate(
                (el) =>
                  getComputedStyle(el).getPropertyValue('backdrop-filter') ||
                  getComputedStyle(el).getPropertyValue('-webkit-backdrop-filter'),
              ),
              'none',
            );
            await frame.getByRole('switch').uncheck();
          }
          await preview.getByRole('button', { name: 'iOS', exact: true }).click();
          await eventually(
            () => toolbar.evaluate((el) => getComputedStyle(el).borderRadius),
            '28px',
          );
          if (process.env.ISOLINE_PREVIEW_SCREENSHOTS && locale === 'de' && width === 375)
            await preview.screenshot({
              path: path.join(
                process.env.ISOLINE_PREVIEW_SCREENSHOTS,
                `${name}-floating-toolbar.png`,
              ),
            });
        }
      for (const locale of ['en', 'de'])
        for (const width of [375, 1280]) {
          await page.setViewportSize({ width, height: 1000 });
          await page.goto(`${origin}${base}/${locale}/docs/native/liquid-glass/`, {
            waitUntil: 'networkidle',
          });
          const preview = page.locator('.component-preview').first();
          const glassFrame = page.frameLocator('.component-preview iframe').first();
          const glass = glassFrame.getByTestId('glass-example-surface');
          await glass.waitFor();
          const filter = () =>
            glass.evaluate(
              (el) =>
                getComputedStyle(el).getPropertyValue('backdrop-filter') ||
                getComputedStyle(el).getPropertyValue('-webkit-backdrop-filter'),
            );
          await eventually(async () => (await filter()) !== 'none', true);
          const backdrop = await glassFrame.getByTestId('glass-backdrop-color').boundingBox();
          const surface = await glass.boundingBox();
          assert.ok(
            Math.min(backdrop.y + backdrop.height, surface.y + surface.height) >
              Math.max(backdrop.y, surface.y),
            'colored background must actually intersect the glass surface',
          );
          const clear = await glass.evaluate((el) => getComputedStyle(el).backgroundColor);
          await glassFrame
            .getByRole('button', { name: locale === 'de' ? 'Regulär' : 'Regular', exact: true })
            .click();
          await eventually(
            () =>
              glass.evaluate(
                (el, clear) => getComputedStyle(el).backgroundColor !== clear,
                clear,
              ),
            true,
          );
          const solid = glassFrame.getByRole('switch', {
            name: locale === 'de' ? 'Solide Darstellung' : 'Solid surface',
            exact: true,
          });
          await solid.check();
          await eventually(filter, 'none');
          await solid.uncheck();
          await eventually(async () => (await filter()) !== 'none', true);
          await glassFrame
            .getByRole('button', { name: locale === 'de' ? 'Klar' : 'Clear', exact: true })
            .click();
          assert.equal(
            await glassFrame.locator('html').evaluate((el) => el.scrollWidth <= el.clientWidth),
            true,
          );
          if (process.env.ISOLINE_PREVIEW_SCREENSHOTS && locale === 'de' && width === 375)
            await preview.screenshot({
              path: path.join(
                process.env.ISOLINE_PREVIEW_SCREENSHOTS,
                `${name}-glass-backdrop.png`,
              ),
            });
        }
      await checkMaterials({ page, origin, base, name, eventually });
      await checkForcedColors(page);
      assert.deepEqual(errors, [], `${name}: browser runtime errors`);
      console.log(
        `${name}: EN/DE, mobile/desktop, themes, platform state, forms, dialog/sheet/menu, floating toolbar and glass fallback passed.`,
      );
    } finally {
      await browser.close();
    }
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
}
