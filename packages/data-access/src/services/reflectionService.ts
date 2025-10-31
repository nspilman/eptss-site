"use server";

import { db } from "../db";
import { userContent, contentTags, tags, roundMetadata, users, UserContent, NewUserContent } from "../db/schema";
import { eq, desc, and, inArray, sql } from "drizzle-orm";
import { AsyncResult, createSuccessResult, createErrorResult, createEmptyResult } from '../types/asyncResult';
import { createOrGetTag } from './tagService';

export interface Reflection extends Omit<UserContent, 'createdAt' | 'updatedAt' | 'publishedAt'> {
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  tags?: string[]; // Tag slugs
  authorName?: string; // Full name or username as fallback
}

export type ReflectionType = 'initial' | 'checkin';

export type CreateReflectionInput = {
  userId: string;
  roundId: number;
  title: string;
  markdownContent: string;
  isPublic?: boolean;
  reflectionType?: ReflectionType; // Defaults to 'initial'
};

export type UpdateReflectionInput = {
  title?: string;
  markdownContent?: string;
  isPublic?: boolean;
};

/**
 * Generate a URL-safe slug from a title
 */
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

/**
 * Ensure slug is unique by appending a random string if needed
 */
const ensureUniqueSlug = async (baseSlug: string): Promise<string> => {
  let slug = baseSlug;
  let counter = 0;

  while (true) {
    const existing = await db
      .select()
      .from(userContent)
      .where(eq(userContent.slug, slug))
      .limit(1);

    if (existing.length === 0) {
      return slug;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
};

/**
 * Auto-tag content with system tags
 * Creates tags: 'type:reflection', 'round:{roundSlug}', and 'reflection-type:{type}'
 */
const autoTagReflection = async (
  contentId: string,
  roundId: number,
  reflectionType: ReflectionType = 'initial'
): Promise<void> => {
  console.log('[autoTagReflection] Starting for contentId:', contentId, 'roundId:', roundId, 'reflectionType:', reflectionType);

  // Get round slug for tagging
  const [roundResult] = await db
    .select({ slug: roundMetadata.slug })
    .from(roundMetadata)
    .where(eq(roundMetadata.id, roundId))
    .limit(1);

  console.log('[autoTagReflection] Round result:', roundResult);

  if (!roundResult) {
    throw new Error('Round not found');
  }

  const roundSlug = roundResult.slug;
  console.log('[autoTagReflection] Round slug:', roundSlug);

  // Create/get type:reflection tag
  console.log('[autoTagReflection] Creating type:reflection tag...');
  const typeTagResult = await createOrGetTag(
    'Reflection',
    'type:reflection',
    'system',
    true
  );
  console.log('[autoTagReflection] Type tag result:', typeTagResult);

  if (typeTagResult.status !== 'success' || !typeTagResult.data) {
    const errorMsg = typeTagResult.status === 'error' ? typeTagResult.error.message : 'Unknown error';
    throw new Error(`Failed to create type tag: ${errorMsg}`);
  }

  // Create/get round-specific tag
  console.log('[autoTagReflection] Creating round tag...');
  const roundTagResult = await createOrGetTag(
    `Round: ${roundSlug}`,
    `round:${roundSlug}`,
    'system',
    true
  );
  console.log('[autoTagReflection] Round tag result:', roundTagResult);

  if (roundTagResult.status !== 'success' || !roundTagResult.data) {
    const errorMsg = roundTagResult.status === 'error' ? roundTagResult.error.message : 'Unknown error';
    throw new Error(`Failed to create round tag: ${errorMsg}`);
  }

  // Create/get reflection-type tag (initial or checkin)
  console.log('[autoTagReflection] Creating reflection-type tag...');
  const reflectionTypeTagResult = await createOrGetTag(
    reflectionType === 'initial' ? 'Initial Reflection' : 'Check-in',
    `reflection-type:${reflectionType}`,
    'system',
    true
  );
  console.log('[autoTagReflection] Reflection type tag result:', reflectionTypeTagResult);

  if (reflectionTypeTagResult.status !== 'success' || !reflectionTypeTagResult.data) {
    const errorMsg = reflectionTypeTagResult.status === 'error' ? reflectionTypeTagResult.error.message : 'Unknown error';
    throw new Error(`Failed to create reflection type tag: ${errorMsg}`);
  }

  // Associate tags with content
  console.log('[autoTagReflection] Inserting content tags associations...');
  await db.insert(contentTags).values([
    {
      contentId,
      tagId: typeTagResult.data.id,
      addedBy: 'system',
    },
    {
      contentId,
      tagId: roundTagResult.data.id,
      addedBy: 'system',
    },
    {
      contentId,
      tagId: reflectionTypeTagResult.data.id,
      addedBy: 'system',
    },
  ]);
  console.log('[autoTagReflection] Successfully completed tagging');
};

/**
 * Map database result to Reflection interface
 */
const mapToReflection = (dbContent: any, tagSlugs?: string[], authorName?: string): Reflection => {
  return {
    ...dbContent,
    createdAt: dbContent.createdAt instanceof Date ?
      dbContent.createdAt.toISOString() :
      new Date(dbContent.createdAt).toISOString(),
    updatedAt: dbContent.updatedAt instanceof Date ?
      dbContent.updatedAt.toISOString() :
      new Date(dbContent.updatedAt).toISOString(),
    publishedAt: dbContent.publishedAt ?
      (dbContent.publishedAt instanceof Date ?
        dbContent.publishedAt.toISOString() :
        new Date(dbContent.publishedAt).toISOString()) : null,
    tags: tagSlugs,
    authorName,
  };
};

/**
 * Create a new reflection
 */
export const createReflection = async (
  input: CreateReflectionInput
): Promise<AsyncResult<Reflection>> => {
  try {
    // Generate unique slug
    const baseSlug = generateSlug(input.title);
    const slug = await ensureUniqueSlug(baseSlug);

    // Create reflection
    const [newContent] = await db
      .insert(userContent)
      .values({
        userId: input.userId,
        roundId: input.roundId,
        title: input.title,
        slug,
        markdownContent: input.markdownContent,
        isPublic: input.isPublic ?? false,
        publishedAt: input.isPublic ? new Date() : null,
      })
      .returning();

    // Auto-tag with system tags
    const reflectionType = input.reflectionType ?? 'initial';
    await autoTagReflection(newContent.id, input.roundId, reflectionType);

    return createSuccessResult(mapToReflection(newContent, ['type:reflection', `round:${slug}`, `reflection-type:${reflectionType}`]));
  } catch (error) {
    console.error("Error in createReflection:", error);
    return createErrorResult(new Error(`Failed to create reflection: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
};

/**
 * Get a reflection by slug
 */
export const getReflectionBySlug = async (slug: string): Promise<AsyncResult<Reflection | null>> => {
  try {
    const result = await db
      .select({
        content: userContent,
        fullName: users.fullName,
        username: users.username,
      })
      .from(userContent)
      .innerJoin(users, eq(userContent.userId, users.userid))
      .where(eq(userContent.slug, slug))
      .limit(1);

    if (result.length === 0) {
      return createSuccessResult(null);
    }

    const { content, fullName, username } = result[0];

    // Get associated tags
    const tagResults = await db
      .select({ slug: tags.slug })
      .from(contentTags)
      .innerJoin(tags, eq(contentTags.tagId, tags.id))
      .where(eq(contentTags.contentId, content.id));

    const tagSlugs = tagResults.map(t => t.slug);

    // Use fullName if available, otherwise fallback to username
    const authorName = fullName || username || undefined;

    return createSuccessResult(mapToReflection(content, tagSlugs, authorName));
  } catch (error) {
    console.error("Error in getReflectionBySlug:", error);
    return createErrorResult(new Error(`Failed to get reflection: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
};

/**
 * Get all reflections for a round
 */
export const getReflectionsByRound = async (
  roundId: number,
  publicOnly = true
): Promise<AsyncResult<Reflection[]>> => {
  try {
    const whereCondition = publicOnly
      ? and(
          eq(userContent.roundId, roundId),
          eq(userContent.isPublic, true)
        )
      : eq(userContent.roundId, roundId);

    const results = await db
      .select()
      .from(userContent)
      .where(whereCondition)
      .orderBy(desc(userContent.createdAt));
    const reflections = results.map(r => mapToReflection(r));

    return createSuccessResult(reflections);
  } catch (error) {
    console.error("Error in getReflectionsByRound:", error);
    return createErrorResult(new Error(`Failed to get reflections: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
};

/**
 * Get all reflections by a user
 */
export const getReflectionsByUser = async (
  userId: string,
  publicOnly = true
): Promise<AsyncResult<Reflection[]>> => {
  try {
    const whereCondition = publicOnly
      ? and(
          eq(userContent.userId, userId),
          eq(userContent.isPublic, true)
        )
      : eq(userContent.userId, userId);

    const results = await db
      .select()
      .from(userContent)
      .where(whereCondition)
      .orderBy(desc(userContent.createdAt));
    const reflections = results.map(r => mapToReflection(r));

    return createSuccessResult(reflections);
  } catch (error) {
    console.error("Error in getReflectionsByUser:", error);
    return createErrorResult(new Error(`Failed to get user reflections: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
};

/**
 * Update a reflection
 */
export const updateReflection = async (
  id: string,
  updates: UpdateReflectionInput
): Promise<AsyncResult<Reflection>> => {
  try {
    const updateData: any = {
      ...updates,
      updatedAt: new Date(),
    };

    // If making public for first time, set publishedAt
    if (updates.isPublic === true) {
      const [existing] = await db
        .select()
        .from(userContent)
        .where(eq(userContent.id, id))
        .limit(1);

      if (existing && !existing.isPublic && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const [updated] = await db
      .update(userContent)
      .set(updateData)
      .where(eq(userContent.id, id))
      .returning();

    if (!updated) {
      return createErrorResult(new Error('Reflection not found'));
    }

    return createSuccessResult(mapToReflection(updated));
  } catch (error) {
    console.error("Error in updateReflection:", error);
    return createErrorResult(new Error(`Failed to update reflection: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
};

/**
 * Delete a reflection
 */
export const deleteReflection = async (id: string): Promise<AsyncResult<void>> => {
  try {
    await db.delete(userContent).where(eq(userContent.id, id));
    return createSuccessResult(undefined);
  } catch (error) {
    console.error("Error in deleteReflection:", error);
    return createErrorResult(new Error(`Failed to delete reflection: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
};

/**
 * Check if a user has an initial reflection for a specific round
 * Returns the reflection if found, null otherwise
 */
export const getUserInitialReflectionForRound = async (
  userId: string,
  roundId: number
): Promise<AsyncResult<Reflection | null>> => {
  try {
    // Get the reflection-type:initial tag
    const initialTagResult = await db
      .select()
      .from(tags)
      .where(eq(tags.slug, 'reflection-type:initial'))
      .limit(1);

    if (initialTagResult.length === 0) {
      // Tag doesn't exist yet, so no initial reflections exist
      return createSuccessResult(null);
    }

    const initialTagId = initialTagResult[0].id;

    // Find user content for this round with the initial tag
    const result = await db
      .select({
        content: userContent,
      })
      .from(userContent)
      .innerJoin(contentTags, eq(userContent.id, contentTags.contentId))
      .where(and(
        eq(userContent.userId, userId),
        eq(userContent.roundId, roundId),
        eq(contentTags.tagId, initialTagId)
      ))
      .limit(1);

    if (result.length === 0) {
      return createSuccessResult(null);
    }

    return createSuccessResult(mapToReflection(result[0].content));
  } catch (error) {
    console.error("Error in getUserInitialReflectionForRound:", error);
    return createErrorResult(new Error(`Failed to check for initial reflection: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
};

/**
 * Get all reflections by a user for a specific round
 */
export const getUserReflectionsForRound = async (
  userId: string,
  roundId: number
): Promise<AsyncResult<Reflection[]>> => {
  try {
    const results = await db
      .select()
      .from(userContent)
      .where(and(
        eq(userContent.userId, userId),
        eq(userContent.roundId, roundId)
      ))
      .orderBy(desc(userContent.createdAt));

    const reflections = results.map(r => mapToReflection(r));

    return createSuccessResult(reflections);
  } catch (error) {
    console.error("Error in getUserReflectionsForRound:", error);
    return createErrorResult(new Error(`Failed to get user reflections for round: ${error instanceof Error ? error.message : 'Unknown error'}`));
  }
};
