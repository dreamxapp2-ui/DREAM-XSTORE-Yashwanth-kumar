/**
 * Shared database helpers — single source of truth for Postgres/Mongo availability,
 * connection pooling, and ID type detection.
 *
 * Every repository must use these instead of reimplementing the same checks.
 */

const mongoose = require('mongoose');
const { Pool } = require('@neondatabase/serverless');

// ── Singleton Neon pool ────────────────────────────────────────────────────────

let pool;

function getPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }

  return pool;
}

// ── Availability checks ────────────────────────────────────────────────────────

function canUsePostgres() {
  return Boolean(process.env.DATABASE_URL);
}

function canUseMongoFallback() {
  return mongoose.connection.readyState === 1;
}

// ── ID helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns true when `value` looks like a 24-hex-char MongoDB ObjectId.
 * Use this exclusively — never duplicate the check in individual files.
 */
function isMongoObjectId(value) {
  return typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);
}

/**
 * Shorthand: true when the user ID is a Postgres (cuid/uuid) ID and PG is available.
 */
function canUsePostgresForUser(userId) {
  return canUsePostgres() && !isMongoObjectId(userId);
}

// ── Postgres query runner ──────────────────────────────────────────────────────

/**
 * Execute a Postgres operation with consistent error handling.
 * Returns `null` on failure or when PG is unavailable, so callers can fall back.
 *
 * @param {string} tag        - short label for log messages (e.g. "addressRepo.getAll")
 * @param {() => Promise<*>} operation - async function that performs the PG work
 * @returns {Promise<*|null>}
 */
async function runPostgres(tag, operation) {
  if (!canUsePostgres()) {
    return null;
  }

  try {
    return await operation();
  } catch (error) {
    console.warn(`[${tag}] PostgreSQL failed, falling back to MongoDB: ${error.message}`);
    return null;
  }
}

/**
 * Convenience: run a raw SQL query via the shared Neon pool.
 * Returns the rows array, or `null` when PG is unavailable / on error.
 */
async function queryPostgres(tag, queryText, values = []) {
  return runPostgres(tag, async () => {
    const client = getPool();
    if (!client) return null;
    const result = await client.query(queryText, values);
    return result.rows;
  });
}

module.exports = {
  canUseMongoFallback,
  canUsePostgres,
  canUsePostgresForUser,
  getPool,
  isMongoObjectId,
  queryPostgres,
  runPostgres,
};
