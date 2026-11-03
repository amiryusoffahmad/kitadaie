import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { validateItem, validateBlocks, validateTaxonomy, countsAsUnread, isPublished, readingMinutes, positiveId, sqlDateIso } from '../src/features/content/rules.mjs';
const require = createRequire(import.meta.url);
const catalogue = require('../src/features/content/catalogue.cjs');
const now = new Date('2026-11-01T12:00:00Z');
const draft = { kind: 'article', title: 'Tajuk', status: 'draft', body_blocks: [], featured: false };
const body = [{ type: 'paragraph', text: 'Isi sebenar.' }];

test('catalogue has precisely four named categories, three series and thirteen empty drafts', () => {
  assert.equal(catalogue.categories.length, 4);
  assert.equal(catalogue.series.length, 3);
  assert.equal(catalogue.items.length, 13);
  assert.equal(new Set(catalogue.items.map((item) => item.title)).size, 13);
  for (const item of catalogue.items) {
    assert.equal(item.status, 'draft');
    assert.deepEqual(JSON.parse(item.body_blocks), []);
    assert.equal(item.excerpt, '');
    assert.equal(item.kind, 'article');
    assert.ok(!/truncated|…|\.\.\.|Practical Tips|How Much|Month of Reflection|Soul’s Greatest/.test(item.title));
    assert.ok(catalogue.series.some((series) => series.id === item.series_id && series.category_id === item.category_id));
  }
  assert.equal(catalogue.series.filter((series) => series.category_id === 4).length, 0);
});
test('empty drafts are allowed, publication and scheduling require real content', () => {
  assert.equal(validateItem(draft, now).status, 'draft');
  for (const status of ['published', 'scheduled']) assert.throws(() => validateItem({ ...draft, status }, now), /Isi kandungan/);
  assert.throws(() => validateBlocks([{ type: 'paragraph', text: '   ' }]), /Teks blok/);
});
test('future publication requires scheduling and an explicit timezone', () => {
  assert.throws(() => validateItem({ ...draft, body_blocks: body, status: 'scheduled' }, now), /masa hadapan/);
  assert.throws(() => validateItem({ ...draft, body_blocks: body, status: 'scheduled', publish_at: '2026-11-02T10:00:00' }, now), /zon waktu/);
  assert.throws(() => validateItem({ ...draft, body_blocks: body, status: 'published', publish_at: '2026-11-02T10:00:00+08:00' }, now), /scheduled/);
  assert.equal(validateItem({ ...draft, body_blocks: body, status: 'scheduled', publish_at: '2026-11-02T10:00:00+08:00' }, now).publish_at, '2026-11-02 02:00:00');
  assert.equal(validateItem({ ...draft, body_blocks: body, status: 'published' }, now).publish_at, '2026-11-01 12:00:00');
});
test('drafts, archived, scheduled and future published items are never visible', () => {
  for (const status of ['draft', 'archived', 'scheduled']) assert.equal(isPublished({ status, publish_at: '2026-10-01 00:00:00' }, now), false);
  assert.equal(isPublished({ status: 'published', publish_at: '2026-11-02 00:00:00' }, now), false);
  assert.equal(isPublished({ status: 'published', publish_at: null }, now), false);
  assert.equal(isPublished({ status: 'published', publish_at: '2026-11-01 12:00:00' }, now), true);
});
test('unread excludes old, read, future and non-bulletin content', () => {
  const item = { kind: 'bulletin', status: 'published', publish_at: '2026-11-01 11:00:00' };
  const account = '2026-11-01T10:00:00Z';
  assert.equal(countsAsUnread(item, account, false, now), true);
  assert.equal(countsAsUnread(item, account, true, now), false);
  assert.equal(countsAsUnread({ ...item, publish_at: '2026-11-01 10:00:00' }, account, false, now), false);
  assert.equal(countsAsUnread({ ...item, publish_at: '2026-11-01 09:00:00' }, account, false, now), false);
  assert.equal(countsAsUnread({ ...item, kind: 'article' }, account, false, now), false);
  assert.equal(countsAsUnread({ ...item, status: 'archived' }, account, false, now), false);
});
test('Arabic verse requires a translation and reference; text is retained without HTML parsing', () => {
  const verse = { type: 'verse', text: 'نص عربي', translation: 'Terjemahan', reference: 'Rujukan' };
  assert.deepEqual(validateBlocks([verse])[0], verse);
  assert.throws(() => validateBlocks([{ ...verse, reference: '' }]), /Rujukan/);
  assert.throws(() => validateBlocks([{ ...verse, translation: '' }]), /Terjemahan/);
  assert.equal(validateBlocks([{ type: 'paragraph', text: '<script>alert(1)</script>' }])[0].text, '<script>alert(1)</script>');
});
test('file, download and raw HTML blocks are rejected', () => {
  for (const type of ['pdf', 'download', 'file', 'image', 'html']) assert.throws(() => validateBlocks([{ type, text: 'Test' }]), /tidak disokong/);
});
test('invalid identifiers, statuses, Featured values and excessive content are rejected', () => {
  for (const id of [0, -1, '1 OR 1=1', 'abc', 1.1]) assert.throws(() => positiveId(id));
  assert.throws(() => validateItem({ ...draft, status: 'review' }, now));
  assert.throws(() => validateItem({ ...draft, featured: 'false' }, now));
  assert.throws(() => validateItem({ ...draft, sort_order: -1 }, now));
  assert.throws(() => validateBlocks(Array(201).fill(body[0])), /200/);
  assert.throws(() => validateItem({ ...draft, title: 'x'.repeat(241) }, now));
});
test('bulletins never acquire article categories, series or Featured', () => {
  const item = validateItem({ ...draft, kind: 'bulletin', category_id: 1, series_id: 1, featured: true }, now);
  assert.equal(item.category_id, null); assert.equal(item.series_id, null); assert.equal(item.featured, false);
});
test('reading time accounts for translations and has a one-minute minimum', () => {
  assert.equal(readingMinutes([]), 1);
  assert.equal(readingMinutes([{ text: 'word '.repeat(201), translation: 'other '.repeat(200) }]), 3);
});
test('taxonomy validates slugs, active state and category references', () => {
  assert.equal(validateTaxonomy({ name: 'Quran', slug: 'quran', active: true }, 'category').name, 'Quran');
  assert.throws(() => validateTaxonomy({ name: 'Quran', slug: 'Quran!', active: true }, 'category'));
  assert.throws(() => validateTaxonomy({ title: 'Series', slug: 'series', active: true }, 'series'));
});
test('UTC SQL timestamps are interpreted without local timezone drift', () => {
  assert.equal(sqlDateIso('2026-11-01 10:00:00'), '2026-11-01T10:00:00.000Z');
  assert.equal(sqlDateIso('2026-11-01T18:00:00+08:00'), '2026-11-01T10:00:00.000Z');
});
