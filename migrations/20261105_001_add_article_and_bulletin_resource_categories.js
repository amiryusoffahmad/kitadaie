/** @param { import("knex").Knex } knex */
exports.up = async function (knex) {
  const categories = [
    { name: "Articles", slug: "articles" },
    { name: "Bulletin", slug: "bulletin" },
  ];

  for (const category of categories) {
    const existing = await knex("resource_categories")
      .where({ slug: category.slug })
      .first("id");

    if (!existing) {
      await knex("resource_categories").insert(category);
    }
  }
};

/** @param { import("knex").Knex } knex */
exports.down = async function (knex) {
  for (const slug of ["articles", "bulletin"]) {
    const category = await knex("resource_categories")
      .where({ slug })
      .first("id");

    if (!category) continue;

    const resource = await knex("resources")
      .where({ category_id: category.id })
      .first("id");

    if (!resource) {
      await knex("resource_categories")
        .where({ id: category.id })
        .delete();
    }
  }
};
