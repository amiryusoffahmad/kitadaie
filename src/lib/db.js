import "server-only";
import knex from "knex";

const config = {
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  pool: {
    min: 2,
    max: 10,
  },
};

// Global cache prevents connection pool leaks on Next.js hot-reload
const g = global;
export const db = g._knex ?? knex(config);
if (process.env.NODE_ENV !== "production") g._knex = db;

/**
 * Execute a query with parameters
 * @param {string} sql - SQL query to execute
 * @param {Array} params - Parameters to pass to the query
 * @returns {Promise<Array>} - Query results
 */
export async function query(sql, params) {
  try {
    const results = await db.raw(sql, params);
    return results.rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

/**
 * Get a single row from a query
 * @param {string} sql - SQL query to execute
 * @param {Array} params - Parameters to pass to the query
 * @returns {Promise<Object|null>} - First row or null if no rows
 */
export async function queryOne(sql, params) {
  const results = await query(sql, params);
  return results.length > 0 ? results[0] : null;
}
