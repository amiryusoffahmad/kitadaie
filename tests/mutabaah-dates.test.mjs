import test from 'node:test';
import assert from 'node:assert/strict';
import { validDate, todayDate, addDays, weekRange, monthRange, summaryCycle } from '../src/features/mutabaah/dates.mjs';

test('calendar dates reject empty values and impossible days', () => {
  for (const value of ['', undefined, '2026-02-29', '2026-04-31', '2026-13-01']) assert.equal(validDate(value), false);
  assert.equal(validDate('2024-02-29'), true);
});
test('today follows Kuala Lumpur across the UTC midnight boundary', () => {
  assert.equal(todayDate(new Date('2026-10-31T16:30:00Z')), '2026-11-01');
  assert.equal(todayDate(new Date('2026-10-31T15:30:00Z')), '2026-10-31');
});
test('previous/next day crosses month, year and leap-day boundaries', () => {
  assert.equal(addDays('2026-01-01', -1), '2025-12-31');
  assert.equal(addDays('2024-02-28', 1), '2024-02-29');
  assert.equal(addDays('2026-02-28', 1), '2026-03-01');
});
test('all seven halaqah settings produce a seven-day week containing the selected day', () => {
  for (let endDay = 0; endDay < 7; endDay++) {
    const range = weekRange('2026-11-01', endDay);
    assert.equal(addDays(range.start, 6), range.end);
    assert.equal(new Date(`${range.end}T00:00:00Z`).getUTCDay(), endDay);
    assert.ok(range.start <= '2026-11-01' && range.end >= '2026-11-01');
  }
  assert.deepEqual(weekRange('2026-11-01', 0), { start: '2026-10-26', end: '2026-11-01' });
});
test('monthly ranges include the actual first and last day', () => {
  assert.deepEqual(monthRange(2024, 2), { start: '2024-02-01', end: '2024-02-29' });
  assert.deepEqual(monthRange(2026, 11), { start: '2026-11-01', end: '2026-11-30' });
  assert.throws(() => monthRange(2026, 0));
});
test('two-week summaries respect the configured halaqah day and change every fourteen days', () => {
  for (let endDay = 0; endDay < 7; endDay++) {
    const cycle = summaryCycle('2026-11-01', endDay);
    assert.ok(cycle.start <= '2026-11-01' && cycle.end >= '2026-11-01');
    assert.equal(addDays(cycle.start, 13), cycle.end);
    assert.equal(addDays(cycle.week1End, 1), cycle.week2Start);
    assert.equal(new Date(`${cycle.week1End}T00:00:00Z`).getUTCDay(), endDay);
    assert.equal(new Date(`${cycle.end}T00:00:00Z`).getUTCDay(), endDay);
    assert.equal(summaryCycle(addDays(cycle.end, 1), endDay).start, addDays(cycle.start, 14));
  }
});
