// Bun automatically loads .env.local before running scripts.
// For other runtimes, set DB_* env vars before calling knex CLI.

/** @type {import("knex").Knex.Config} */
const base = {
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  migrations: {
    directory: "./migrations",
  },
};

module.exports = {
  development: base,
  production: {
    ...base,
    pool: { min: 2, max: 10 },
  },
};
