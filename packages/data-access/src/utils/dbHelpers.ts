import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * Database helper utilities for common operations
 */

/**
 * Get the next available ID for a table
 *
 * This function safely retrieves the next ID by finding the maximum ID
 * and incrementing it. Note: This should be used within a transaction
 * for production use to avoid race conditions.
 *
 * @param table - The Drizzle table schema
 * @param idColumn - The ID column from the table
 * @returns The next available ID
 *
 * @example
 * ```typescript
 * const nextId = await getNextId(signUps, signUps.id);
 * ```
 */
export async function getNextId<T extends { id: any }>(
  table: any,
  idColumn: any
): Promise<number> {
  const result = await db
    .select({ id: idColumn })
    .from(table)
    .orderBy(sql`${idColumn} desc`)
    .limit(1);

  return (result[0]?.id || 0) + 1;
}

/**
 * Get the next available ID using raw SQL (more reliable for concurrent writes)
 *
 * This uses COALESCE(MAX(id), 0) + 1 which is the pattern used in some
 * parts of the codebase. Consider using transactions for production.
 *
 * @param tableName - The name of the table (e.g., 'sign_ups')
 * @returns The next available ID
 *
 * @example
 * ```typescript
 * const nextId = await getNextIdRaw('sign_ups');
 * ```
 */
export async function getNextIdRaw(tableName: string): Promise<number> {
  const result = await db.execute<{ next_id: number }>(
    sql`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM ${sql.raw(tableName)}`
  );

  // Handle different return formats from different drivers
  const rows = Array.isArray(result) ? result : [result];
  return rows[0]?.next_id || 1;
}
