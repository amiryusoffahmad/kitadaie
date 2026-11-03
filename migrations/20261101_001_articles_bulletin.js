const catalogue = require('../src/features/content/catalogue.cjs');
// MySQL DDL commits implicitly; only the catalogue inserts use a transaction.
exports.config = { transaction: false };

exports.up = async function (knex) {
  await knex.schema.createTable('art_categories', (t) => {
    t.increments('id');
    t.string('slug', 120).notNullable().unique();
    t.string('name', 160).notNullable();
    t.integer('sort_order').notNullable().defaultTo(0);
    t.boolean('active').notNullable().defaultTo(true);
  });
  await knex.schema.createTable('art_series', (t) => {
    t.increments('id');
    t.integer('category_id').unsigned().notNullable().references('id').inTable('art_categories');
    t.string('slug', 120).notNullable().unique();
    t.string('title', 240).notNullable();
    t.integer('sort_order').notNullable().defaultTo(0);
    t.boolean('active').notNullable().defaultTo(true);
  });
  await knex.schema.createTable('art_items', (t) => {
    t.increments('id');
    t.enum('kind', ['article', 'bulletin']).notNullable();
    t.integer('category_id').unsigned().nullable().references('id').inTable('art_categories');
    t.integer('series_id').unsigned().nullable().references('id').inTable('art_series');
    t.string('title', 240).notNullable();
    t.text('excerpt').notNullable();
    t.json('body_blocks').notNullable();
    t.integer('reading_minutes').unsigned().notNullable().defaultTo(1);
    t.boolean('featured').notNullable().defaultTo(false);
    t.enum('status', ['draft', 'scheduled', 'published', 'archived']).notNullable().defaultTo('draft');
    t.dateTime('publish_at').nullable();
    t.integer('sort_order').notNullable().defaultTo(0);
    t.string('created_by', 36).nullable();
    t.string('updated_by', 36).nullable();
    t.timestamps(true, true);
    t.index(['kind', 'status', 'publish_at']);
    t.index(['series_id', 'sort_order']);
  });
  await knex.schema.createTable('art_reads', (t) => {
    t.increments('id');
    t.string('user_id', 36).notNullable();
    t.integer('item_id').unsigned().notNullable().references('id').inTable('art_items');
    t.dateTime('read_at').notNullable();
    t.unique(['user_id', 'item_id']);
  });
  await knex.schema.createTable('art_audit_logs', (t) => {
    t.increments('id');
    t.string('actor_user_id', 36).nullable();
    t.string('action', 40).notNullable();
    t.string('entity_type', 30).notNullable();
    t.integer('entity_id').unsigned().notNullable();
    t.json('metadata').notNullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
  await knex.transaction(async (trx) => {
    await trx('art_categories').insert(catalogue.categories);
    await trx('art_series').insert(catalogue.series);
    await trx('art_items').insert(catalogue.items);
  });
};

exports.down = async function (knex) {
  for (const table of ['art_audit_logs', 'art_reads', 'art_items', 'art_series', 'art_categories']) {
    await knex.schema.dropTableIfExists(table);
  }
};
