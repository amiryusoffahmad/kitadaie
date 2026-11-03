// Only confirmed, complete titles from the agreed catalogue. Bodies remain empty drafts.
const categories = [
  { id: 1, slug: 'al-aqsa', name: 'Al-Aqsa', sort_order: 0 },
  { id: 2, slug: 'quran', name: 'Quran', sort_order: 1 },
  { id: 3, slug: 'knowing-allah', name: 'Knowing Allah', sort_order: 2 },
  { id: 4, slug: 'umrah', name: '’Umrah', sort_order: 3 },
];
const series = [
  { id: 1, category_id: 1, slug: 'virtues-of-al-aqsa', title: 'Virtues of al-Aqsa', sort_order: 0 },
  { id: 2, category_id: 2, slug: 'quran-your-best-friend', title: 'The Qur’an: Your Best Friend', sort_order: 1 },
  { id: 3, category_id: 3, slug: 'knowing-allah', title: 'Knowing Allah', sort_order: 2 },
];
const titles = [
  [1, 'The Virtues of al-Aqsa & the Blessed Land: Part 1', true],
  [2, 'Tadabbur: Reflecting Upon the Qur’an', true],
  [2, 'Recite Qur’an Slowly & Beautifully'],
  [2, '20 Quranic Qualities'],
  [2, 'The Qur’an & Its Virtues'],
  [2, 'Ramadan: The Month of the Qur’an'],
  [3, 'Who is Allah'],
  [3, 'Allahu Akbar: A Magnificent Phrase'],
  [3, 'Fearing Allah'],
  [3, 'Hoping in Allah'],
  [3, 'In the Company of Angels'],
  [3, 'Loving Allah – Part 1'],
  [3, 'Loving Allah – Part 2'],
];
const items = titles.map(([seriesId, title, featured], index) => ({
  kind: 'article', series_id: seriesId, category_id: seriesId, title,
  excerpt: '', body_blocks: JSON.stringify([]), featured: Boolean(featured),
  status: 'draft', sort_order: index,
}));
module.exports = { categories, series, items };
