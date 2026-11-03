import 'server-only';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { ContentError, positiveId, parseBlocks, validateItem, validateTaxonomy, readingMinutes, utcSqlDate } from '@/features/content/rules.mjs';

/** Authenticate every content request; mutation permissions are checked on the server. */
export async function contentSession(admin = false) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new ContentError('Sila log masuk.', 401);
  if (admin && !await db('user_roles').where({ user_id: session.user.id, role: 'admin' }).first()) {
    throw new ContentError('Akses admin diperlukan.', 403);
  }
  return session.user;
}

/** Keep personalized content out of browser/shared caches, including errors. */
export async function contentResponse(action) {
  try {
    return NextResponse.json({ success: true, ...await action() }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    const known = error instanceof ContentError;
    if (!known) console.error('[CONTENT]', error);
    const duplicate = error.code === 'ER_DUP_ENTRY';
    return NextResponse.json({ success: false, error: known ? error.message : duplicate ? 'Slug ini sudah digunakan.' : 'Kandungan tidak dapat dimuatkan. Sila cuba semula.' }, {
      status: known ? error.status : duplicate ? 409 : 500,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  }
}

export async function contentBody(request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) throw new ContentError('Permintaan tidak dibenarkan.', 403);
  const raw = await request.text();
  if (raw.length > 1000000) throw new ContentError('Kandungan terlalu besar.', 413);
  try {
    const body = raw ? JSON.parse(raw) : {};
    if (!body || Array.isArray(body) || typeof body !== 'object') throw new Error();
    return body;
  } catch { throw new ContentError('JSON tidak sah.'); }
}

const summaryFields = ['i.id', 'i.kind', 'i.category_id', 'i.series_id', 'i.title', 'i.excerpt', 'i.reading_minutes', 'i.featured', 'i.status', 'i.sort_order', 'c.name as category_name', 's.title as series_title'];

function itemsQuery(database = db) {
  return database('art_items as i')
    .leftJoin('art_categories as c', 'i.category_id', 'c.id')
    .leftJoin('art_series as s', 'i.series_id', 's.id');
}

function published(query) {
  return query.where('i.status', 'published').where('i.publish_at', '<=', utcSqlDate(new Date()))
    .where((q) => q.whereNull('i.category_id').orWhere('c.active', true))
    .where((q) => q.whereNull('i.series_id').orWhere('s.active', true));
}

function selectSummary(query, body = false) {
  query.select(...summaryFields, db.raw("DATE_FORMAT(i.publish_at, '%Y-%m-%dT%H:%i:%sZ') as publish_at"));
  if (body) query.select('i.body_blocks');
  return query;
}

function formatItem(row) {
  const result = { ...row, featured: Boolean(row.featured), unread: Boolean(row.unread) };
  if (row.body_blocks !== undefined) {
    result.body_blocks = parseBlocks(row.body_blocks);
    result.reading_minutes = readingMinutes(result.body_blocks);
  }
  return result;
}

async function accountCreatedAt(userId) {
  // Better Auth uses mysql2 Date values; normalize the account timestamp through
  // that same connection timezone before comparing with content's UTC DATETIME.
  const user = await db('user').where('id', userId).select('createdAt').first();
  if (!user) throw new ContentError('Akaun tidak ditemui.', 401);
  return utcSqlDate(user.createdAt);
}

async function addUnread(query, userId) {
  const createdAt = await accountCreatedAt(userId);
  query.leftJoin('art_reads as r', (join) => join.on('r.item_id', '=', 'i.id').andOn('r.user_id', '=', db.raw('?', [userId])))
    .select(db.raw("(i.kind = 'bulletin' AND i.publish_at > ? AND r.id IS NULL) as unread", [createdAt]));
}

export async function listContent(searchParams, user) {
  const kind = searchParams.get('kind') || 'article';
  if (!['article', 'bulletin'].includes(kind)) throw new ContentError('Jenis kandungan tidak sah.');
  const page = positiveId(searchParams.get('page') || 1);
  const limit = 12;
  let query = published(itemsQuery()).where('i.kind', kind);
  if (searchParams.get('mode') === 'featured') query.where('i.featured', true);
  if (searchParams.get('category')) query.where('i.category_id', positiveId(searchParams.get('category')));
  if (searchParams.get('series')) query.where('i.series_id', positiveId(searchParams.get('series')));
  query = selectSummary(query);
  if (kind === 'bulletin') await addUnread(query, user.id);
  if (searchParams.get('series')) query.orderBy('i.sort_order').orderBy('i.id');
  else query.orderBy('i.publish_at', 'desc').orderBy('i.id', 'desc');
  const rows = await query.limit(limit + 1).offset((page - 1) * limit);
  return { data: rows.slice(0, limit).map((row) => {
    const { body_blocks, ...item } = formatItem(row);
    return item;
  }), page, hasMore: rows.length > limit };
}

export async function getTaxonomy(admin = false) {
  const categoriesQuery = db('art_categories').orderBy('sort_order').orderBy('id');
  const seriesQuery = db('art_series as s').join('art_categories as c', 'c.id', 's.category_id')
    .select('s.*', 'c.name as category_name').orderBy('s.sort_order').orderBy('s.id');
  if (!admin) { categoriesQuery.where('active', true); seriesQuery.where('s.active', true).where('c.active', true); }
  const [categories, series] = await Promise.all([categoriesQuery, seriesQuery]);
  return { categories, series };
}

export async function getContentItem(id, kind, user, preview = false) {
  let query = itemsQuery().where('i.id', positiveId(id));
  if (kind) query.where('i.kind', kind);
  if (!preview) query = published(query);
  const row = await selectSummary(query, true).first();
  if (!row) throw new ContentError('Kandungan tidak ditemui atau belum diterbitkan.', 404);
  return { data: formatItem(row) };
}

export async function unreadCount(user) {
  const createdAt = await accountCreatedAt(user.id);
  const row = await published(itemsQuery()).where('i.kind', 'bulletin').where('i.publish_at', '>', createdAt)
    .whereNotExists(db('art_reads as r').select('r.id').whereRaw('r.item_id = i.id').where('r.user_id', user.id))
    .count('i.id as total').first();
  return { count: Number(row.total) };
}

export async function recordRead(id, user) {
  const itemId = positiveId(id);
  // Check visibility again when marking read, including archive races.
  await db.transaction(async (trx) => {
    const item = await published(itemsQuery(trx)).where('i.id', itemId).where('i.kind', 'bulletin').select('i.id').forUpdate().first();
    if (!item) throw new ContentError('Buletin tidak ditemui.', 404);
    await trx('art_reads').insert({ item_id: itemId, user_id: user.id, read_at: utcSqlDate(new Date()) })
      .onConflict(['user_id', 'item_id']).ignore();
  });
  return unreadCount(user);
}

async function audit(trx, actor, entity, id, action, metadata) {
  await trx('art_audit_logs').insert({ actor_user_id: actor, entity_type: entity, entity_id: id, action, metadata: JSON.stringify(metadata) });
}

export async function adminContent(searchParams) {
  const page = positiveId(searchParams.get('page') || 1);
  let query = selectSummary(itemsQuery(), true);
  if (searchParams.get('kind')) query.where('i.kind', searchParams.get('kind'));
  const rows = await query.orderBy('i.updated_at', 'desc').orderBy('i.id', 'desc').limit(51).offset((page - 1) * 50);
  return { ...await getTaxonomy(true), data: rows.slice(0, 50).map(formatItem), page, hasMore: rows.length > 50 };
}

export async function saveContent(body, user) {
  const entity = body.entity || 'item';
  const id = body.id ? positiveId(body.id) : null;
  const tables = { item: 'art_items', category: 'art_categories', series: 'art_series' };
  if (!tables[entity]) throw new ContentError('Jenis rekod tidak sah.');
  const table = tables[entity];
  const values = entity === 'item' ? validateItem(body) : validateTaxonomy(body, entity);
  const savedId = await db.transaction(async (trx) => {
    const previous = id ? await trx(table).where('id', id).forUpdate().first() : null;
    if (id && !previous) throw new ContentError('Rekod tidak ditemui.', 404);
    if (values.category_id && !await trx('art_categories').where('id', values.category_id).first()) throw new ContentError('Kategori tidak ditemui.');
    if (entity === 'item' && values.series_id) {
      const series = await trx('art_series').where('id', values.series_id).first();
      if (!series) throw new ContentError('Siri tidak ditemui.');
      values.category_id = series.category_id;
    }
    if (entity === 'item') {
      // Preserve the original publication date and read records when editing/archiving.
      if (previous?.publish_at && !body.publish_at && body.status !== 'scheduled') values.publish_at = previous.publish_at;
      values.updated_by = user.id;
      values.updated_at = trx.fn.now();
      if (!id) values.created_by = user.id;
    }
    let resultId = id;
    if (id) await trx(table).where('id', id).update(values);
    else [resultId] = await trx(table).insert(values);
    if (entity === 'series' && previous && previous.category_id !== values.category_id) {
      await trx('art_items').where('series_id', id).update({ category_id: values.category_id, updated_at: trx.fn.now() });
    }
    await audit(trx, user.id, entity, resultId, id ? 'update' : 'create', { previous_status: previous?.status || null, status: values.status || null, title: values.title || values.name });
    return resultId;
  });
  return { id: savedId };
}

export async function publishScheduled() {
  const count = await db.transaction(async (trx) => {
    const due = await trx('art_items').where('status', 'scheduled').where('publish_at', '<=', utcSqlDate(new Date())).forUpdate();
    for (const item of due) {
      await trx('art_items').where('id', item.id).update({ status: 'published', updated_at: trx.fn.now() });
      await audit(trx, null, 'item', item.id, 'scheduled_publish', { status: 'published' });
    }
    return due.length;
  });
  return { published: count };
}
