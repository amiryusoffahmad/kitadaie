import "server-only";
import knex from "knex";

// Knex configuration
const config = {
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "kitadaie",
  },
  pool: {
    min: 2,
    max: 10,
  },
};

// Export db instance
export const db = knex(config);

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
