import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { randomUUID, createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
require('@next/env').loadEnvConfig(process.cwd());
const origin = process.env.MUTABAAH_TEST_URL || 'http://127.0.0.1:3106';
if (!['localhost', '127.0.0.1', '::1'].includes(process.env.DB_HOST) || !['localhost', '127.0.0.1'].includes(new URL(origin).hostname)) throw Error('A local app and database are required.');
const db = require('knex')(require('../knexfile').development);
const manifest = JSON.parse(readFileSync('.next/server/server-reference-manifest.json', 'utf8'));
const userId = randomUUID(), token = randomUUID();
const signature = createHmac('sha256', process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET).update(token).digest('base64');
const signed = encodeURIComponent(`${token}.${signature}`);
const cookie = `__Secure-kitadaie.session_token=${signed}; kitadaie.session_token=${signed}`;
let activityId;
let checks = 0;
function check(name, fn) { fn(); checks++; console.log(`PASS ${name}`); }
async function action(name, args = [], authenticated = true) {
  const id = Object.entries(manifest.node).find(([, record]) => record.exportedName === name)?.[0];
  if (!id) throw Error(`Missing server action: ${name}. Run a production build first.`);
  const response = await fetch(`${origin}/mutabaah`, {
    method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8', 'Next-Action': id, Accept: 'text/x-component', origin, ...(authenticated ? { cookie } : {}) },
    body: JSON.stringify(args),
  });
  const text = await response.text();
  assert.equal(response.status, 200, text.slice(-400));
  const result = text.split('\n').find((line) => line.startsWith('1:'));
  if (!result) throw Error(`Unexpected server action response: ${text.slice(-400)}`);
  return JSON.parse(result.slice(2));
}
try {
  const now = new Date();
  await db('user').insert({ id: userId, name: 'Mutabaah integration test', email: `${userId}@example.invalid`, emailVerified: 1, createdAt: now, updatedAt: now });
  await db('session').insert({ id: randomUUID(), userId, token, expiresAt: new Date(Date.now() + 3600000), createdAt: now, updatedAt: now });
  const unauthenticated = await action('getMutabaahActivities', [], false);
  check('activity access requires a session', () => assert.equal(unauthenticated.success, false));
  const initial = await action('getMutabaahActivities');
  if (initial.activities.length === 0) {
    const emptyWeek = await action('getWeeklyMutabaahResults', ['2026-10-26', '2026-11-01']);
    check('an empty catalogue never reports PASS', () => assert.equal(emptyWeek.isPassed, false));
  }
  [activityId] = await db('mutabaah_activities').insert({ name: `Mutabaah test ${userId}`, description: 'Preserve this activity description' });
  const invalid = await action('toggleMutabaahEntry', [activityId, '2026-02-30', true]);
  check('invalid dates cannot be saved', () => assert.equal(invalid.success, false));
  const invalidCompleted = await action('toggleMutabaahEntry', [activityId, '2026-11-01', 'false']);
  check('completion requires a boolean', () => assert.equal(invalidCompleted.success, false));
  const toggles = await Promise.all(Array.from({ length: 5 }, () => action('toggleMutabaahEntry', [activityId, '2026-11-01', true])));
  check('concurrent completion saves succeed', () => assert.ok(toggles.every((row) => row.success)));
  const saved = await db('mutabaah_entries').where({ user_id: userId, activity_id: activityId, date: '2026-11-01' });
  check('repeated saves retain one entry', () => assert.equal(saved.length, 1));
  const entries = await action('getMutabaahEntries', ['2026-11-01']);
  check('saved completion is returned for the same day', () => assert.equal(entries.entries[0].completed, 1));
  await action('toggleMutabaahEntry', [activityId, '2026-11-01', false]);
  const unchecked = await action('getMutabaahEntries', ['2026-11-01']);
  check('unchecking persists', () => assert.equal(unchecked.entries[0].completed, 0));
  for (const date of ['2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-11-01', '2024-02-01', '2024-02-29']) await action('toggleMutabaahEntry', [activityId, date, true]);
  const week = await action('getWeeklyMutabaahResults', ['2026-10-26', '2026-11-01']);
  check('weekly results include the first and last day', () => { assert.equal(week.activityResults[activityId].completedDays, 5); assert.equal(week.activityResults[activityId].isPassed, true); });
  const month = await action('getMonthlyMutabaahResults', [2024, 2]);
  check('leap-month results include both calendar boundaries', () => { assert.equal(month.totalDays, 29); assert.equal(month.activityResults[activityId].completedDays, 2); });
  const savedDays = [];
  for (const day of [0, 3, 6]) {
    assert.equal((await action('updateMutabaahSettings', [day])).success, true);
    savedDays.push((await action('getMutabaahSettings')).settings.end_of_week);
  }
  check('halaqah settings persist across reloads', () => assert.deepEqual(savedDays, [0, 3, 6]));
  assert.equal((await action('updateMutabaahSettings', [3])).success, true);
  const summary = await action('getWeeklySummaries');
  check('both summary weeks end on the configured halaqah day', () => {
    for (const week of [summary.week1, summary.week2]) assert.equal(new Date(`${week.endDate}T00:00:00Z`).getUTCDay(), 3);
  });
  const invalidSetting = await action('updateMutabaahSettings', [7]);
  check('invalid settings are rejected', () => assert.equal(invalidSetting.success, false));
  const description = await db('mutabaah_activities').where('id', activityId).first();
  check('activity descriptions remain intact', () => assert.equal(description.description, 'Preserve this activity description'));
  console.log(`Mutabaah integration: ${checks} checks passed.`);
} finally {
  await db('mutabaah_entries').where('user_id', userId).del();
  await db('mutabaah_settings').where('user_id', userId).del();
  await db('session').where('userId', userId).del();
  await db('user').where('id', userId).del();
  if (activityId) await db('mutabaah_activities').where('id', activityId).del();
  await db.destroy();
}
