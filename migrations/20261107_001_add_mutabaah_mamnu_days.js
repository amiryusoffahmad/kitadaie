exports.up = async function (knex) {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS \`mutabaah_mamnu_days\` (
      \`id\` int NOT NULL AUTO_INCREMENT,
      \`user_id\` varchar(36) COLLATE utf8mb4_general_ci NOT NULL,
      \`date\` date NOT NULL,
      \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_mutabaah_mamnu_user_date\` (\`user_id\`, \`date\`),
      CONSTRAINT \`fk_mutabaah_mamnu_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `)
}

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("mutabaah_mamnu_days")
}
