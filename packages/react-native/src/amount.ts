/** Parse a locale-formatted editing value; invalid/partial input stays null. */
export function parseLocalizedAmount(input: string, locale = 'en-US'): number | null {
  const parts = new Intl.NumberFormat(locale).formatToParts(-12345.6);
  const group = parts.find((part) => part.type === 'group')?.value;
  const decimal = parts.find((part) => part.type === 'decimal')?.value ?? '.';
  const minus = parts.find((part) => part.type === 'minusSign')?.value ?? '-';
  let value = input.trim().replace(/[\u200e\u200f\u061c]/g, '');
  for (let digit = 0; digit <= 9; digit++) {
    const local = new Intl.NumberFormat(locale, { useGrouping: false }).format(digit);
    if (local !== String(digit)) value = value.split(local).join(String(digit));
  }
  if (group && /\s/u.test(group)) value = value.replace(/[ \u00a0\u202f]/g, group);
  if (group && value.includes(group)) {
    const [integer, fraction] = value.split(decimal);
    if (fraction?.includes(group)) return null;
    const groups = integer
      .replace(minus, '')
      .replace(/^\u2212/, '')
      .split(group);
    const example = new Intl.NumberFormat(locale)
      .formatToParts(123456789)
      .filter((part) => part.type === 'integer');
    const primary = example.at(-1)?.value.length ?? 3;
    const secondary = example.at(-2)?.value.length ?? primary;
    if (
      groups.some((part) => !/^\d+$/.test(part)) ||
      groups.at(-1)!.length !== primary ||
      groups.slice(1, -1).some((part) => part.length !== secondary) ||
      groups[0].length > secondary
    )
      return null;
    value = value.split(group).join('');
  }
  value = value
    .split(decimal)
    .join('.')
    .split(minus)
    .join('-')
    .replace(/\u2212/g, '-');
  if (!/^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(value)) return null;
  const result = Number(value);
  return Number.isFinite(result) ? result : null;
}
export function formatLocalizedAmount(
  value: number,
  locale = 'en-US',
  fractionDigits = 2,
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
