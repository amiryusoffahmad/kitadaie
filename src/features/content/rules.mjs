export class ContentError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}

export function positiveId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) throw new ContentError('ID tidak sah.');
  return id;
}

export function parseBlocks(value) {
  try {
    const blocks = typeof value === 'string' ? JSON.parse(value) : value;
    if (!Array.isArray(blocks)) throw new Error();
    return blocks;
  } catch { throw new ContentError('Format kandungan tidak sah.'); }
}

function text(value, max, label, required = true) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) {
    throw new ContentError(`${label} tidak sah (maksimum ${max} aksara).`);
  }
  return value.trim();
}

export function validateBlocks(value) {
  const blocks = parseBlocks(value);
  if (blocks.length > 200) throw new ContentError('Maksimum 200 blok kandungan.');
  return blocks.map((block) => {
    if (!block || !['paragraph', 'heading', 'quote', 'verse'].includes(block.type)) {
      throw new ContentError('Jenis blok kandungan tidak disokong.');
    }
    const result = { type: block.type, text: text(block.text, 10000, 'Teks blok') };
    if (block.type === 'verse') {
      result.translation = text(block.translation, 10000, 'Terjemahan');
      result.reference = text(block.reference, 240, 'Rujukan');
    }
    return result;
  });
}

// MySQL DATETIME stores these content timestamps in UTC, independent of the host timezone.
export function utcSqlDate(date) { return new Date(date).toISOString().slice(0, 19).replace('T', ' '); }
export function sqlDateIso(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return new Date(/[zZ]|[+-]\d\d:\d\d$/.test(value) ? value : value.replace(' ', 'T') + 'Z').toISOString();
}
export function readingMinutes(blocks) {
  const words = blocks.map((b) => `${b.text || ''} ${b.translation || ''}`).join(' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
export function isPublished(item, now = new Date()) {
  return item.status === 'published' && Boolean(item.publish_at) && new Date(sqlDateIso(item.publish_at)) <= now;
}
export function countsAsUnread(item, accountCreatedAt, read, now = new Date()) {
  return item.kind === 'bulletin' && isPublished(item, now) && !read &&
    new Date(sqlDateIso(item.publish_at)) > new Date(accountCreatedAt);
}

export function validateItem(body, now = new Date()) {
  if (!['article', 'bulletin'].includes(body.kind)) throw new ContentError('Jenis kandungan tidak sah.');
  if (!['draft', 'scheduled', 'published', 'archived'].includes(body.status)) throw new ContentError('Status tidak sah.');
  const blocks = validateBlocks(body.body_blocks);
  if (['scheduled', 'published'].includes(body.status) && !blocks.length) {
    throw new ContentError('Isi kandungan diperlukan sebelum penerbitan.');
  }
  let publishAt = null;
  if (body.publish_at) {
    if (typeof body.publish_at !== 'string' || !/T.*(?:Z|[+-]\d{2}:\d{2})$/i.test(body.publish_at) || Number.isNaN(Date.parse(body.publish_at))) {
      throw new ContentError('Waktu terbit mesti mempunyai zon waktu yang sah.');
    }
    publishAt = new Date(body.publish_at);
  }
  if (body.status === 'scheduled' && (!publishAt || publishAt <= now)) {
    throw new ContentError('Pilih waktu terbit pada masa hadapan.');
  }
  if (body.status === 'published') {
    publishAt ||= now;
    if (publishAt > now) throw new ContentError('Gunakan status scheduled untuk waktu masa hadapan.');
  }
  const sortOrder = Number(body.sort_order ?? 0);
  if (!Number.isInteger(sortOrder) || sortOrder < 0 || sortOrder > 100000) throw new ContentError('Susunan tidak sah.');
  if (typeof body.featured !== 'boolean') throw new ContentError('Nilai Featured tidak sah.');
  return {
    kind: body.kind, title: text(body.title, 240, 'Tajuk'), excerpt: text(body.excerpt ?? '', 1000, 'Ringkasan', false),
    body_blocks: JSON.stringify(blocks), reading_minutes: readingMinutes(blocks), status: body.status, sort_order: sortOrder,
    featured: body.kind === 'article' && body.featured,
    category_id: body.kind === 'article' && body.category_id ? positiveId(body.category_id) : null,
    series_id: body.kind === 'article' && body.series_id ? positiveId(body.series_id) : null,
    publish_at: publishAt ? utcSqlDate(publishAt) : null,
  };
}

export function validateTaxonomy(body, entity) {
  if (!['category', 'series'].includes(entity)) throw new ContentError('Jenis rekod tidak sah.');
  const slug = text(body.slug, 120, 'Slug');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new ContentError('Slug hanya menerima huruf kecil, nombor dan sengkang.');
  const order = Number(body.sort_order ?? 0);
  if (!Number.isInteger(order) || order < 0 || order > 100000) throw new ContentError('Susunan tidak sah.');
  if (typeof body.active !== 'boolean') throw new ContentError('Nilai aktif tidak sah.');
  const result = { slug, sort_order: order, active: body.active };
  if (entity === 'category') result.name = text(body.name, 160, 'Nama');
  else { result.title = text(body.title, 240, 'Tajuk'); result.category_id = positiveId(body.category_id); }
  return result;
}
