import assert from 'node:assert/strict';
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
      await page.goto(`${origin}${base}/en/docs/native/liquid-glass/`, {
        waitUntil: 'networkidle',
      });
      const glassFrame = page.frameLocator('.component-preview iframe').first();
      await glassFrame.getByText('Your project', { exact: true }).waitFor();
      const glass = glassFrame.locator('[style*="backdrop-filter"]').first();
      await glass.waitFor();
      assert.notEqual(
        await glass.evaluate(
          (el) =>
            getComputedStyle(el).getPropertyValue('backdrop-filter') ||
            getComputedStyle(el).getPropertyValue('-webkit-backdrop-filter'),
        ),
        'none',
      );
      await page.emulateMedia({ forcedColors: 'active' });
      await glass.waitFor({ state: 'hidden' });
      assert.deepEqual(errors, [], `${name}: browser runtime errors`);
      console.log(
        `${name}: EN/DE, mobile/desktop, themes, platform state, forms, dialog/sheet/menu and glass fallback passed.`,
      );
    } finally {
      await browser.close();
    }
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
}
