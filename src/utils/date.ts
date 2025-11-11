/**
 * Utilities to standardize date <-> input conversions across the app.
 * - HTML date inputs use YYYY-MM-DD
 * - datetime-local inputs use YYYY-MM-DDTHH:mm (local time)
 * - We store timestamps as ISO strings (UTC) when sending to backend
 */

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export function isoToInputDate(value?: string | Date | null): string {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  // use local date components so the input shows the user's local day
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function inputDateToISO(input: string): string {
  // input is YYYY-MM-DD
  if (!input) return '';
  const [y, m, d] = input.split('-').map(Number);
  // construct Date using local timezone midnight for consistency
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return dt.toISOString();
}

export function isoToLocalDateTime(value?: string | Date | null): string {
  if (!value) return '';
  const d = value instanceof Date ? value : new Date(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function localDateTimeToISO(local: string): string {
  if (!local) return '';
  // local is YYYY-MM-DDTHH:mm (no timezone) - new Date(local) treats it as local
  const dt = new Date(local);
  return dt.toISOString();
}

export default {
  isoToInputDate,
  inputDateToISO,
  isoToLocalDateTime,
  localDateTimeToISO,
};
