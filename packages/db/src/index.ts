/**
 * @eptss/db - Database Layer
 *
 * This package contains the database schema, connection, and migrations.
 * It is the single source of truth for all database-related code.
 *
 * Usage:
 * - Import `db` for database queries
 * - Import from `@eptss/db/schema` for table definitions and types
 * - Import from `@eptss/db/connection` for the raw db instance
 */

// Re-export the database connection
export { db } from "./connection";

// Re-export all schema tables and types
export * from "./schema";

// Re-export commonly used drizzle-orm operators
export { eq, and, or, desc, asc, sql, isNull, ne, gt, gte, lt, lte, like, ilike, inArray, notInArray } from "drizzle-orm";
