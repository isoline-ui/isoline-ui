/** Gregorian local-date values. UTC arithmetic avoids DST changes and host time zones. */
export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}
export function addDays(value: string, amount: number): string {
  if (!validDate(value)) throw new RangeError('Expected a Gregorian date in YYYY-MM-DD format');
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}
export function addMonths(month: string, amount: number): string {
  const first = month.slice(0, 7) + '-01';
  if (!validDate(first)) throw new RangeError('Expected a Gregorian month');
  const date = new Date(`${first}T12:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() + amount);
  return date.toISOString().slice(0, 7);
}
export function monthDays(month: string, firstDayOfWeek = 1): string[] {
  const first = `${month.slice(0, 7)}-01`;
  if (!validDate(first)) throw new RangeError('Expected a Gregorian month');
  const weekday = new Date(`${first}T12:00:00Z`).getUTCDay();
  const offset = (weekday - (((firstDayOfWeek % 7) + 7) % 7) + 7) % 7;
  return Array.from({ length: 42 }, (_, index) => addDays(first, index - offset));
}
export function formatCalendarDate(
  date: string,
  locale?: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string {
  return validDate(date)
    ? new Intl.DateTimeFormat(locale, {
        ...options,
        calendar: 'gregory',
        timeZone: 'UTC',
      }).format(new Date(`${date}T12:00:00Z`))
    : date;
}
export function validTime(value: string): boolean {
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}
