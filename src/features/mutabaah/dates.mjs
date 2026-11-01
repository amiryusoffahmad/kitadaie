// Date-only values are calendar days, not local-midnight timestamps.
export function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function todayDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function addDays(value, amount) {
  if (!validDate(value)) throw new Error('Invalid date.');
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
}

export function weekRange(value, endDay) {
  if (!validDate(value) || !Number.isInteger(endDay) || endDay < 0 || endDay > 6) throw new Error('Invalid week settings.');
  const day = new Date(`${value}T00:00:00Z`).getUTCDay();
  const end = addDays(value, (endDay - day + 7) % 7);
  return { start: addDays(end, -6), end };
}

export function monthRange(year, month) {
  if (!Number.isInteger(year) || year < 1900 || year > 9999 || !Number.isInteger(month) || month < 1 || month > 12) throw new Error('Invalid month.');
  return { start: new Date(Date.UTC(year, month - 1, 1)).toISOString().slice(0, 10), end: new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10) };
}

export function summaryCycle(value, endDay) {
  const anchor = weekRange('2024-01-01', endDay).start;
  const days = Math.floor((new Date(`${value}T00:00:00Z`) - new Date(`${anchor}T00:00:00Z`)) / 86400000);
  const start = addDays(anchor, Math.floor(days / 14) * 14);
  return { start, end: addDays(start, 13), week1End: addDays(start, 6), week2Start: addDays(start, 7) };
}
