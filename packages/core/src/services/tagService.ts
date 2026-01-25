"use server";

import { db } from "../db";
import { tags, Tag, NewTag } from "../db/schema";
import { eq, desc, like, or, sql } from "drizzle-orm";
import { AsyncResult, createSuccessResult, createErrorResult } from '../types/asyncResult';

/**
 * Create or get an existing tag by name
 * If tag exists, returns it. If not, creates a new one.
 */
export const createOrGetTag = async (
  name: string,
  slug: string,
  category?: string,
  isSystemTag = false
): Promise<AsyncResult<Tag>> => {
  try {
    // First try to find existing tag
    const existing = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1);

    if (existing.length > 0) {
      return createSuccessResult(existing[0]);
    }

    // Create new tag
    const [newTag] = await db
      .insert(tags)
      .values({
        name,
        slug,
        category,
        isSystemTag,
        useCount: 0,
      })
      .returning();

    return createSuccessResult(newTag);
  } catch (error) {
    console.error("Error in createOrGetTag:", error);
    return createErrorResult(new Error(`Failed to create or get tag: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
};

/**
 * Get a tag by slug
 */
export const getTagBySlug = async (slug: string): Promise<AsyncResult<Tag | null>> => {
  try {
    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1);

    return createSuccessResult(tag || null);
  } catch (error) {
    console.error("Error in getTagBySlug:", error);
    return createErrorResult(new Error(`Failed to get tag: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
};

/**
 * Get all tags, optionally filtered by category
 */
export const getAllTags = async (category?: string): Promise<AsyncResult<Tag[]>> => {
  try {
    let query = db.select().from(tags).orderBy(desc(tags.useCount));

    if (category) {
      query = query.where(eq(tags.category, category)) as any;
    }

    const result = await query;
    return createSuccessResult(result);
  } catch (error) {
    console.error("Error in getAllTags:", error);
    return createErrorResult(new Error(`Failed to get tags: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
};

/**
 * Increment the use count for a tag
 */
export const incrementTagUseCount = async (tagId: number): Promise<AsyncResult<void>> => {
  try {
    await db
      .update(tags)
      .set({ useCount: sql`${tags.useCount} + 1` })
      .where(eq(tags.id, tagId));

    return createSuccessResult(undefined);
  } catch (error) {
    console.error("Error in incrementTagUseCount:", error);
    return createErrorResult(new Error(`Failed to increment tag use count: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
};

/**
 * Search tags by name (for autocomplete)
 */
export const searchTags = async (searchTerm: string, limit = 10): Promise<AsyncResult<Tag[]>> => {
  try {
    const result = await db
      .select()
      .from(tags)
      .where(
        or(
          like(tags.name, `%${searchTerm}%`),
          like(tags.slug, `%${searchTerm}%`)
        )
      )
      .orderBy(desc(tags.useCount))
      .limit(limit);

    return createSuccessResult(result);
  } catch (error) {
    console.error("Error in searchTags:", error);
    return createErrorResult(new Error(`Failed to search tags: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
};

/**
 * Delete a tag (only if it's not a system tag and has no associations)
 */
export const deleteTag = async (tagId: number): Promise<AsyncResult<void>> => {
  try {
    // First check if it's a system tag
    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.id, tagId))
      .limit(1);

    if (!tag) {
      return createErrorResult(new Error('Tag not found'));
    }

    if (tag.isSystemTag) {
      return createErrorResult(new Error('Cannot delete system tags'));
    }

    await db.delete(tags).where(eq(tags.id, tagId));
    return createSuccessResult(undefined);
  } catch (error) {
    console.error("Error in deleteTag:", error);
    return createErrorResult(new Error(`Failed to delete tag: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
};
