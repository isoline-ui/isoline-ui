import assert from 'node:assert/strict';
/** Task-level regressions: keyboard choices, controlled state, search and async forms. */
export async function checkAdoption({ page, origin, base, name, eventually }) {
  for (const platform of ['ios', 'android']) {
    const visit = async (section, slug) => {
      await page.goto(`${origin}${base}/en/docs/${section}/${slug}/`, {
        waitUntil: 'domcontentloaded',
      });
      const preview = page.locator('.component-preview').first();
      await preview
        .getByRole('button', { name: platform === 'ios' ? 'iOS' : 'Android', exact: true })
        .click();
      const frame = page.frameLocator('.component-preview iframe').first();
      await frame.locator(`#preview-root-${platform}`).waitFor();
      await preview.scrollIntoViewIfNeeded();
      return frame;
    };
    let frame = await visit('components', 'radio-group');
    const standard = frame.getByRole('radio', {
      name: 'Standard delivery, Three to five days',
      exact: true,
    });
    const express = frame.getByRole('radio', { name: 'Express', exact: true });
    assert.equal(await standard.isChecked(), true);
    await standard.press('ArrowDown');
    assert.equal(await express.isChecked(), true);
    await express.press('ArrowDown');
    assert.equal(
      await standard.isChecked(),
      true,
      'disabled radio is skipped and selection wraps',
    );
    await standard.press('End');
    assert.equal(await express.isChecked(), true);
    assert.equal(
      await frame.getByRole('radio', { name: 'Unavailable', exact: true }).isDisabled(),
      true,
    );

    frame = await visit('components', 'accordion');
    const trigger = frame.getByRole('button', { name: 'More information', exact: true });
    await trigger.click();
    assert.equal(await trigger.getAttribute('aria-expanded'), 'true');
    await frame.getByRole('button', { name: 'Collapse', exact: true }).click();
    assert.equal(await trigger.getAttribute('aria-expanded'), 'false');
    assert.equal(await frame.getByRole('button', { name: 'Collapse', exact: true }).count(), 0);

    frame = await visit('components', 'combobox');
    await frame.getByRole('button', { name: 'Choose country', exact: true }).click();
    const search = frame.getByRole('textbox', { name: 'Search countries', exact: true });
    await search.fill('not a country');
    await frame.getByText('No results', { exact: true }).waitFor();
    await search.fill('fran');
    await frame.getByRole('button', { name: 'France', exact: true }).click();
    await search.waitFor({ state: 'hidden' });
    await frame.getByText('France', { exact: true }).waitFor();
    await frame.getByRole('button', { name: 'Choose country', exact: true }).click();
    assert.equal(await search.inputValue(), '', 'local query resets on reopening');
    assert.equal(
      await frame.getByRole('button', { name: 'Unavailable', exact: true }).isDisabled(),
      true,
    );
    await search.press('Escape');
    await search.waitFor({ state: 'hidden' });

    frame = await visit('guides', 'form-screen');
    const save = frame.getByRole('button', { name: 'Save profile', exact: true });
    await save.click();
    await frame.getByText('Enter your name.', { exact: true }).waitFor();
    const input = frame.getByRole('textbox', { name: 'Name', exact: true });
    const email = frame.getByRole('textbox', { name: 'Email', exact: true });
    await input.fill('Ada');
    await input.press('Enter');
    assert.equal(await email.evaluate((el) => el === document.activeElement), true);
    await email.fill('ada@example.test');
    await frame.getByRole('button', { name: 'Country', exact: true }).click();
    await frame.getByRole('menuitemradio', { name: 'Germany', exact: true }).click();
    const failure = frame.getByRole('checkbox', { name: 'Simulate server error', exact: true });
    await failure.check();
    await save.click();
    const pending = frame.getByRole('button', { name: 'Saving profile', exact: true });
    await pending.waitFor();
    assert.equal(await pending.isDisabled(), true);
    assert.equal(await pending.getAttribute('aria-busy'), 'true');
    await frame.getByText('Could not save. Please try again.', { exact: true }).waitFor();
    assert.equal(await input.inputValue(), 'Ada', 'failed submission retains edits');
    await failure.uncheck();
    await save.click();
    await frame.getByText('Profile saved', { exact: true }).waitFor();
    await frame.getByRole('button', { name: 'Open protected form', exact: true }).click();
    const discard = frame.getByRole('button', { name: 'Discard changes', exact: true });
    await discard.waitFor();
    await discard.press('Escape');
    assert.equal(await discard.isVisible(), true, 'Escape cannot dismiss protected dialog');
    await frame
      .getByTestId('isoline-dialog-backdrop')
      .click({ position: { x: 4, y: 4 }, force: true });
    assert.equal(await discard.isVisible(), true, 'backdrop cannot dismiss protected dialog');
    await frame
      .getByRole('textbox', { name: 'Draft name', exact: true })
      .fill('Keep this draft');
    await discard.click();
    await discard.waitFor({ state: 'hidden' });
    await frame.getByRole('button', { name: 'Open protected sheet', exact: true }).click();
    const sheetDraft = frame.getByRole('textbox', { name: 'Sheet draft', exact: true });
    await sheetDraft.waitFor();
    await sheetDraft.press('Escape');
    assert.equal(await sheetDraft.isVisible(), true, 'protected sheet ignores Escape');
    await frame
      .getByTestId('isoline-sheet-backdrop')
      .click({ position: { x: 4, y: 4 }, force: true });
    assert.equal(await sheetDraft.isVisible(), true, 'protected sheet ignores backdrop');
    await frame.getByRole('button', { name: 'Close protected sheet', exact: true }).click();
    await sheetDraft.waitFor({ state: 'hidden' });

    frame = await visit('guides', 'data-list-screen');
    await frame.getByRole('button', { name: 'Loading', exact: true }).click();
    await frame.getByText('Loading', { exact: true }).last().waitFor();
    await frame.getByRole('button', { name: 'Error', exact: true }).click();
    await frame.getByRole('button', { name: 'Retry', exact: true }).click();
    await frame.getByText('Isoline', { exact: true }).waitFor();
    await frame.getByRole('button', { name: 'Empty', exact: true }).click();
    await frame.getByText('No collections', { exact: true }).waitFor();
    await frame.getByRole('button', { name: 'Content', exact: true }).click();
    await frame
      .getByRole('textbox', { name: 'Search collections', exact: true })
      .fill('Garden');
    assert.equal(await frame.getByText('Isoline', { exact: true }).count(), 0);
    await frame.getByText('Garden', { exact: true }).waitFor();
  }
  console.log(
    `${name}: radio keyboard, accordion, searchable selection, validation, async failure/retry, protected dismissal and data-list states passed (iOS/Android).`,
  );
}
