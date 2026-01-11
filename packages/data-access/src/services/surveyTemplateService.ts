"use server";

import { db } from "../db";
import { surveyTemplates, users } from "../db/schema";
import { eq, desc, and, isNull, or, sql } from "drizzle-orm";
import { AsyncResult, createSuccessResult, createEmptyResult, createErrorResult } from '../types/asyncResult';
import {
  SurveyQuestion,
  CreateSurveyTemplateInput,
  UpdateSurveyTemplateInput,
  SurveyTemplateWithDetails
} from '../types/survey';

// Serializable version of survey template for client components
export interface SerializableSurveyTemplate {
  id: string;
  name: string;
  description: string | null;
  projectId: string | null;
  createdBy: string | null;
  questions: SurveyQuestion[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  // Optional user info
  creator?: {
    userid: string;
    username: string;
    publicDisplayName: string | null;
  };
}

/**
 * Map database result to serializable survey template
 */
const mapToSerializableTemplate = (dbTemplate: any): SerializableSurveyTemplate => {
  return {
    id: dbTemplate.id,
    name: dbTemplate.name,
    description: dbTemplate.description,
    projectId: dbTemplate.projectId,
    createdBy: dbTemplate.createdBy,
    questions: dbTemplate.questions as SurveyQuestion[],
    isActive: dbTemplate.isActive,
    isDeleted: dbTemplate.isDeleted,
    createdAt: dbTemplate.createdAt instanceof Date ?
      dbTemplate.createdAt.toISOString() :
      new Date(dbTemplate.createdAt).toISOString(),
    updatedAt: dbTemplate.updatedAt instanceof Date ?
      dbTemplate.updatedAt.toISOString() :
      new Date(dbTemplate.updatedAt).toISOString(),
    creator: dbTemplate.creator ? {
      userid: dbTemplate.creator.userid,
      username: dbTemplate.creator.username,
      publicDisplayName: dbTemplate.creator.publicDisplayName,
    } : undefined,
  };
};

/**
 * Get all survey templates with optional filters
 */
export const getAllSurveyTemplates = async (
  options?: {
    projectId?: string | null;
    includeInactive?: boolean;
    includeDeleted?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<AsyncResult<SerializableSurveyTemplate[]>> => {
  try {
    const {
      projectId,
      includeInactive = false,
      includeDeleted = false,
      limit = 50,
      offset = 0,
    } = options || {};

    // Build where conditions
    const conditions = [];

    if (!includeDeleted) {
      conditions.push(eq(surveyTemplates.isDeleted, false));
    }

    if (!includeInactive) {
      conditions.push(eq(surveyTemplates.isActive, true));
    }

    // Filter by project (including null for global templates)
    if (projectId !== undefined) {
      if (projectId === null) {
        conditions.push(isNull(surveyTemplates.projectId));
      } else {
        conditions.push(eq(surveyTemplates.projectId, projectId));
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select({
        template: surveyTemplates,
        creator: users,
      })
      .from(surveyTemplates)
      .leftJoin(users, eq(surveyTemplates.createdBy, users.userid))
      .where(whereClause)
      .orderBy(desc(surveyTemplates.createdAt))
      .limit(limit)
      .offset(offset);

    if (!result.length) {
      return createEmptyResult('No survey templates found');
    }

    const templates = result.map(row =>
      mapToSerializableTemplate({ ...row.template, creator: row.creator })
    );

    return createSuccessResult(templates);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get survey templates'));
  }
};

/**
 * Get survey template by ID
 */
export const getSurveyTemplateById = async (id: string): Promise<AsyncResult<SerializableSurveyTemplate>> => {
  try {
    if (!id) {
      return createErrorResult(new Error('Invalid template ID'));
    }

    const result = await db
      .select({
        template: surveyTemplates,
        creator: users,
      })
      .from(surveyTemplates)
      .leftJoin(users, eq(surveyTemplates.createdBy, users.userid))
      .where(eq(surveyTemplates.id, id));

    if (!result.length) {
      return createEmptyResult(`No survey template found with ID ${id}`);
    }

    const template = mapToSerializableTemplate({
      ...result[0].template,
      creator: result[0].creator
    });

    return createSuccessResult(template);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error(`Failed to get survey template with ID ${id}`));
  }
};

/**
 * Get active survey templates for a project (including global templates)
 */
export const getActiveSurveyTemplatesForProject = async (
  projectId: string
): Promise<AsyncResult<SerializableSurveyTemplate[]>> => {
  try {
    if (!projectId) {
      return createErrorResult(new Error('Invalid project ID'));
    }

    const result = await db
      .select({
        template: surveyTemplates,
        creator: users,
      })
      .from(surveyTemplates)
      .leftJoin(users, eq(surveyTemplates.createdBy, users.userid))
      .where(
        and(
          eq(surveyTemplates.isActive, true),
          eq(surveyTemplates.isDeleted, false),
          or(
            eq(surveyTemplates.projectId, projectId),
            isNull(surveyTemplates.projectId) // Include global templates
          )
        )
      )
      .orderBy(desc(surveyTemplates.createdAt));

    if (!result.length) {
      return createEmptyResult('No active survey templates found for this project');
    }

    const templates = result.map(row =>
      mapToSerializableTemplate({ ...row.template, creator: row.creator })
    );

    return createSuccessResult(templates);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get active survey templates for project'));
  }
};

/**
 * Create new survey template
 */
export const createSurveyTemplate = async (
  input: CreateSurveyTemplateInput
): Promise<AsyncResult<SerializableSurveyTemplate>> => {
  try {
    // Validate input
    if (!input.name || !input.questions || input.questions.length === 0) {
      return createErrorResult(new Error('Name and at least one question are required'));
    }

    // Ensure questions have unique IDs and sequential order
    const processedQuestions = input.questions.map((q, index) => ({
      ...q,
      order: index,
    }));

    const result = await db.insert(surveyTemplates).values({
      name: input.name,
      description: input.description || null,
      projectId: input.projectId || null,
      createdBy: input.createdBy || null,
      questions: processedQuestions as any, // Cast to any for JSONB
      isActive: input.isActive ?? true,
    }).returning();

    if (!result.length) {
      return createErrorResult(new Error('Failed to create survey template'));
    }

    const createdTemplate = mapToSerializableTemplate(result[0]);
    return createSuccessResult(createdTemplate);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to create survey template'));
  }
};

/**
 * Update survey template
 */
export const updateSurveyTemplate = async (
  input: UpdateSurveyTemplateInput
): Promise<AsyncResult<SerializableSurveyTemplate>> => {
  try {
    if (!input.id) {
      return createErrorResult(new Error('Template ID is required'));
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.projectId !== undefined) updateData.projectId = input.projectId;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    if (input.questions !== undefined) {
      // Ensure questions have sequential order
      const processedQuestions = input.questions.map((q, index) => ({
        ...q,
        order: index,
      }));
      updateData.questions = processedQuestions;
    }

    const result = await db
      .update(surveyTemplates)
      .set(updateData)
      .where(eq(surveyTemplates.id, input.id))
      .returning();

    if (!result.length) {
      return createEmptyResult(`No survey template found with ID ${input.id}`);
    }

    const updatedTemplate = mapToSerializableTemplate(result[0]);
    return createSuccessResult(updatedTemplate);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error(`Failed to update survey template`));
  }
};

/**
 * Soft delete survey template
 */
export const deleteSurveyTemplate = async (id: string): Promise<AsyncResult<boolean>> => {
  try {
    if (!id) {
      return createErrorResult(new Error('Invalid template ID'));
    }

    const result = await db
      .update(surveyTemplates)
      .set({
        isDeleted: true,
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(surveyTemplates.id, id))
      .returning({ id: surveyTemplates.id });

    if (!result.length) {
      return createEmptyResult(`No survey template found with ID ${id}`);
    }

    return createSuccessResult(true);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error(`Failed to delete survey template with ID ${id}`));
  }
};

/**
 * Permanently delete survey template (hard delete)
 * Use with caution - this cannot be undone
 */
export const permanentlyDeleteSurveyTemplate = async (id: string): Promise<AsyncResult<boolean>> => {
  try {
    if (!id) {
      return createErrorResult(new Error('Invalid template ID'));
    }

    const result = await db
      .delete(surveyTemplates)
      .where(eq(surveyTemplates.id, id))
      .returning({ id: surveyTemplates.id });

    if (!result.length) {
      return createEmptyResult(`No survey template found with ID ${id}`);
    }

    return createSuccessResult(true);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error(`Failed to permanently delete survey template with ID ${id}`));
  }
};

/**
 * Toggle template active status
 */
export const toggleSurveyTemplateStatus = async (
  id: string,
  isActive: boolean
): Promise<AsyncResult<SerializableSurveyTemplate>> => {
  try {
    if (!id) {
      return createErrorResult(new Error('Invalid template ID'));
    }

    const result = await db
      .update(surveyTemplates)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(surveyTemplates.id, id))
      .returning();

    if (!result.length) {
      return createEmptyResult(`No survey template found with ID ${id}`);
    }

    const updatedTemplate = mapToSerializableTemplate(result[0]);
    return createSuccessResult(updatedTemplate);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error(`Failed to toggle survey template status`));
  }
};

/**
 * Duplicate survey template
 */
export const duplicateSurveyTemplate = async (
  id: string,
  newName?: string,
  createdBy?: string
): Promise<AsyncResult<SerializableSurveyTemplate>> => {
  try {
    if (!id) {
      return createErrorResult(new Error('Invalid template ID'));
    }

    // Get original template
    const originalResult = await getSurveyTemplateById(id);
    if (!originalResult.success || !originalResult.data) {
      return createErrorResult(new Error('Original template not found'));
    }

    const original = originalResult.data;

    // Create duplicate
    const duplicateInput: CreateSurveyTemplateInput = {
      name: newName || `${original.name} (Copy)`,
      description: original.description || undefined,
      projectId: original.projectId || undefined,
      createdBy: createdBy || undefined,
      questions: original.questions,
      isActive: false, // Start as inactive
    };

    return await createSurveyTemplate(duplicateInput);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to duplicate survey template'));
  }
};

/**
 * Get survey template usage statistics
 */
export const getSurveyTemplateStats = async (id: string): Promise<AsyncResult<{
  totalInstances: number;
  activeInstances: number;
  totalResponses: number;
  completeResponses: number;
}>> => {
  try {
    if (!id) {
      return createErrorResult(new Error('Invalid template ID'));
    }

    const stats = await db.execute(sql`
      SELECT
        COUNT(DISTINCT si.id) as total_instances,
        COUNT(DISTINCT CASE WHEN si.status = 'active' THEN si.id END) as active_instances,
        COUNT(DISTINCT sr.id) as total_responses,
        COUNT(DISTINCT CASE WHEN sr.is_complete = true THEN sr.id END) as complete_responses
      FROM survey_templates st
      LEFT JOIN survey_instances si ON st.id = si.template_id
      LEFT JOIN survey_responses sr ON si.id = sr.instance_id
      WHERE st.id = ${id}
      GROUP BY st.id
    `);

    if (!stats.rows.length) {
      return createSuccessResult({
        totalInstances: 0,
        activeInstances: 0,
        totalResponses: 0,
        completeResponses: 0,
      });
    }

    const row = stats.rows[0] as any;
    return createSuccessResult({
      totalInstances: parseInt(row.total_instances) || 0,
      activeInstances: parseInt(row.active_instances) || 0,
      totalResponses: parseInt(row.total_responses) || 0,
      completeResponses: parseInt(row.complete_responses) || 0,
    });
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get survey template stats'));
  }
};
