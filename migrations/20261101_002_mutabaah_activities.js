const activities = ['Tahajud', 'Dhuha', 'Istighfar', 'Mathurat', 'Tilawah', 'Subuh'];

exports.up = async function (knex) {
  for (const name of activities) {
    const existing = await knex('mutabaah_activities').where('name', name).first();
    if (!existing) await knex('mutabaah_activities').insert({ name });
  }
};

exports.down = async function () {
  // Keep catalogue entries: deleting them cascades to users' tracking history.
};
