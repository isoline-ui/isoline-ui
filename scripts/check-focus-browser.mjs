import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

export async function checkFocus({ browser, origin, base, name, eventually }) {
  const page = await browser.newPage({
    hasTouch: true,
    viewport: { width: 375, height: 1000 },
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const outline = (control) =>
    control.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        width: style.outlineWidth,
        style: style.outlineStyle,
        offset: style.outlineOffset,
        color: style.outlineColor,
        visible: el.matches(':focus-visible'),
      };
    });
  try {
    for (const platform of ['android', 'ios']) {
      await page.goto(`${origin}${base}/en/`, { waitUntil: 'domcontentloaded' });
      const preview = page.locator('.component-preview').first();
      const frame = page.frameLocator('.component-preview iframe').first();
      await frame.getByTestId('preview-root').waitFor();
      await preview
        .getByRole('button', { name: platform === 'ios' ? 'iOS' : 'Android', exact: true })
        .click();
      await frame.locator(`#preview-root-${platform}`).waitFor();
      const saved = frame.getByRole('button', { name: 'Saved', exact: true }).first();
      const recent = frame.getByRole('button', { name: 'Recent', exact: true }).first();
      await saved.tap();
      await eventually(() => saved.getAttribute('aria-selected'), 'true');
      assert.equal((await outline(saved)).width, '0px', `${platform}: tap has no focus ring`);

      // A focused touch target must gain a visible ring once keyboard navigation starts.
      await saved.press('Tab');
      assert.equal(await recent.evaluate((el) => el === document.activeElement), true);
      await eventually(async () => (await outline(recent)).width, '2px');
      assert.equal((await outline(recent)).visible, true);
      await recent.press('Shift+Tab');
      const focused = await outline(saved);
      assert.equal(focused.width, '2px');
      assert.equal(focused.style, 'solid');
      assert.equal(focused.visible, true);
      assert.ok(Number.parseFloat(focused.offset) <= -2, 'ring fits inside clipped groups');
      assert.notEqual(focused.color, 'rgba(0, 0, 0, 0)');
      await page.emulateMedia({ forcedColors: 'active' });
      assert.equal((await outline(saved)).width, '2px');
      assert.notEqual((await outline(saved)).color, 'rgba(0, 0, 0, 0)');
      await page.emulateMedia({ forcedColors: 'none' });

      if (process.env.ISOLINE_PREVIEW_SCREENSHOTS) {
        await mkdir(process.env.ISOLINE_PREVIEW_SCREENSHOTS, { recursive: true });
        await preview.screenshot({
          path: path.join(
            process.env.ISOLINE_PREVIEW_SCREENSHOTS,
            `${name}-${platform}-focus.png`,
          ),
        });
      }
      await recent.tap();
      await eventually(() => recent.getAttribute('aria-selected'), 'true');
      await eventually(async () => (await outline(recent)).width, '0px');
      // Mouse activation follows the same modality rule; selection is not focus.
      await saved.click();
      await eventually(() => saved.getAttribute('aria-selected'), 'true');
      assert.equal((await outline(saved)).width, '0px');
    }
    assert.deepEqual(errors, [], `${name}: focus preview runtime errors`);
    console.log(
      `${name}: touch/mouse selection, keyboard focus and unclipped rings passed (iOS/Android).`,
    );
  } finally {
    await page.close();
  }
}
