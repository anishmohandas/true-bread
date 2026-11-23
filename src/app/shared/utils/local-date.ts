/**
 * Today's date as YYYY-MM-DD in the browser's local time zone.
 * (new Date().toISOString() is UTC, which is already "tomorrow" on
 * North American evenings.)
 */
export function localDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse a date for display. A plain "YYYY-MM-DD" is read as that calendar day
 * in local time; new Date("YYYY-MM-DD") would read it as UTC midnight, which is
 * the previous day in North America.
 */
export function parseLocalDate(value: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(value);
}
