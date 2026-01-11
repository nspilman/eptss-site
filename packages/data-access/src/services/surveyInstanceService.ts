"use server";

import { db } from "../db";
import { surveyInstances, surveyTemplates, roundMetadata, signUps, submissions, users } from "../db/schema";
import { eq, desc, and, or, sql, lte, gte, inArray } from "drizzle-orm";
import { AsyncResult, createSuccessResult, createEmptyResult, createErrorResult } from '../types/asyncResult';
import {
  CreateSurveyInstanceInput,
  UpdateSurveyInstanceInput,
  SurveyInstanceStatus,
  SurveyTargetAudience,
} from '../types/survey';
import { SerializableSurveyTemplate } from './surveyTemplateService';

// Serializable version of survey instance
export interface SerializableSurveyInstance {
  id: string;
  templateId: string;
  roundId: number;
  projectId: string;
  status: SurveyInstanceStatus;
  targetAudience: SurveyTargetAudience;
  triggerDate: string;
  expiresAt: string | null;
  notificationsSent: boolean;
  notificationsSentAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Optional joined data
  template?: SerializableSurveyTemplate;
  round?: {
    id: number;
    slug: string | null;
    listeningParty: string | null;
  };
}

/**
 * Map database result to serializable survey instance
 */
const mapToSerializableInstance = (dbInstance: any): SerializableSurveyInstance => {
  return {
    id: dbInstance.id,
    templateId: dbInstance.templateId,
    roundId: dbInstance.roundId,
    projectId: dbInstance.projectId,
    status: dbInstance.status,
    targetAudience: dbInstance.targetAudience,
    triggerDate: dbInstance.triggerDate instanceof Date ?
      dbInstance.triggerDate.toISOString() :
      new Date(dbInstance.triggerDate).toISOString(),
    expiresAt: dbInstance.expiresAt ?
      (dbInstance.expiresAt instanceof Date ?
        dbInstance.expiresAt.toISOString() :
        new Date(dbInstance.expiresAt).toISOString()) :
      null,
    notificationsSent: dbInstance.notificationsSent,
    notificationsSentAt: dbInstance.notificationsSentAt ?
      (dbInstance.notificationsSentAt instanceof Date ?
        dbInstance.notificationsSentAt.toISOString() :
        new Date(dbInstance.notificationsSentAt).toISOString()) :
      null,
    createdAt: dbInstance.createdAt instanceof Date ?
      dbInstance.createdAt.toISOString() :
      new Date(dbInstance.createdAt).toISOString(),
    updatedAt: dbInstance.updatedAt instanceof Date ?
      dbInstance.updatedAt.toISOString() :
      new Date(dbInstance.updatedAt).toISOString(),
    template: dbInstance.template ? {
      id: dbInstance.template.id,
      name: dbInstance.template.name,
      description: dbInstance.template.description,
      projectId: dbInstance.template.projectId,
      createdBy: dbInstance.template.createdBy,
      questions: dbInstance.template.questions,
      isActive: dbInstance.template.isActive,
      isDeleted: dbInstance.template.isDeleted,
      createdAt: dbInstance.template.createdAt instanceof Date ?
        dbInstance.template.createdAt.toISOString() :
        new Date(dbInstance.template.createdAt).toISOString(),
      updatedAt: dbInstance.template.updatedAt instanceof Date ?
        dbInstance.template.updatedAt.toISOString() :
        new Date(dbInstance.template.updatedAt).toISOString(),
    } : undefined,
    round: dbInstance.round ? {
      id: dbInstance.round.id,
      slug: dbInstance.round.slug,
      listeningParty: dbInstance.round.listeningParty ?
        (dbInstance.round.listeningParty instanceof Date ?
          dbInstance.round.listeningParty.toISOString() :
          new Date(dbInstance.round.listeningParty).toISOString()) :
        null,
    } : undefined,
  };
};

/**
 * Get all survey instances with optional filters
 */
export const getAllSurveyInstances = async (
  options?: {
    projectId?: string;
    roundId?: number;
    templateId?: string;
    status?: SurveyInstanceStatus;
    limit?: number;
    offset?: number;
  }
): Promise<AsyncResult<SerializableSurveyInstance[]>> => {
  try {
    const {
      projectId,
      roundId,
      templateId,
      status,
      limit = 50,
      offset = 0,
    } = options || {};

    // Build where conditions
    const conditions = [];

    if (projectId) conditions.push(eq(surveyInstances.projectId, projectId));
    if (roundId) conditions.push(eq(surveyInstances.roundId, roundId));
    if (templateId) conditions.push(eq(surveyInstances.templateId, templateId));
    if (status) conditions.push(eq(surveyInstances.status, status));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select({
        instance: surveyInstances,
        template: surveyTemplates,
        round: roundMetadata,
      })
      .from(surveyInstances)
      .leftJoin(surveyTemplates, eq(surveyInstances.templateId, surveyTemplates.id))
      .leftJoin(roundMetadata, eq(surveyInstances.roundId, roundMetadata.id))
      .where(whereClause)
      .orderBy(desc(surveyInstances.createdAt))
      .limit(limit)
      .offset(offset);

    if (!result.length) {
      return createEmptyResult('No survey instances found');
    }

    const instances = result.map(row =>
      mapToSerializableInstance({
        ...row.instance,
        template: row.template,
        round: row.round,
      })
    );

    return createSuccessResult(instances);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get survey instances'));
  }
};

/**
 * Get survey instance by ID
 */
export const getSurveyInstanceById = async (id: string): Promise<AsyncResult<SerializableSurveyInstance>> => {
  try {
    if (!id) {
      return createErrorResult(new Error('Invalid instance ID'));
    }

    const result = await db
      .select({
        instance: surveyInstances,
        template: surveyTemplates,
        round: roundMetadata,
      })
      .from(surveyInstances)
      .leftJoin(surveyTemplates, eq(surveyInstances.templateId, surveyTemplates.id))
      .leftJoin(roundMetadata, eq(surveyInstances.roundId, roundMetadata.id))
      .where(eq(surveyInstances.id, id));

    if (!result.length) {
      return createEmptyResult(`No survey instance found with ID ${id}`);
    }

    const instance = mapToSerializableInstance({
      ...result[0].instance,
      template: result[0].template,
      round: result[0].round,
    });

    return createSuccessResult(instance);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error(`Failed to get survey instance with ID ${id}`));
  }
};

/**
 * Get survey instances for a specific round
 */
export const getSurveyInstancesByRoundId = async (
  roundId: number
): Promise<AsyncResult<SerializableSurveyInstance[]>> => {
  return await getAllSurveyInstances({ roundId });
};

/**
 * Get active survey instances that need notification sending
 */
export const getSurveyInstancesNeedingNotifications = async (): Promise<AsyncResult<SerializableSurveyInstance[]>> => {
  try {
    const now = new Date();

    const result = await db
      .select({
        instance: surveyInstances,
        template: surveyTemplates,
        round: roundMetadata,
      })
      .from(surveyInstances)
      .leftJoin(surveyTemplates, eq(surveyInstances.templateId, surveyTemplates.id))
      .leftJoin(roundMetadata, eq(surveyInstances.roundId, roundMetadata.id))
      .where(
        and(
          or(
            eq(surveyInstances.status, 'scheduled'),
            eq(surveyInstances.status, 'active')
          ),
          lte(surveyInstances.triggerDate, now),
          eq(surveyInstances.notificationsSent, false)
        )
      )
      .orderBy(surveyInstances.triggerDate);

    if (!result.length) {
      return createEmptyResult('No survey instances need notifications');
    }

    const instances = result.map(row =>
      mapToSerializableInstance({
        ...row.instance,
        template: row.template,
        round: row.round,
      })
    );

    return createSuccessResult(instances);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get survey instances needing notifications'));
  }
};

/**
 * Create new survey instance
 */
export const createSurveyInstance = async (
  input: CreateSurveyInstanceInput
): Promise<AsyncResult<SerializableSurveyInstance>> => {
  try {
    // Validate input
    if (!input.templateId || !input.roundId || !input.projectId || !input.targetAudience) {
      return createErrorResult(new Error('Template ID, round ID, project ID, and target audience are required'));
    }

    const result = await db.insert(surveyInstances).values({
      templateId: input.templateId,
      roundId: input.roundId,
      projectId: input.projectId,
      status: input.status || 'scheduled',
      targetAudience: input.targetAudience,
      triggerDate: input.triggerDate,
      expiresAt: input.expiresAt || null,
    }).returning();

    if (!result.length) {
      return createErrorResult(new Error('Failed to create survey instance'));
    }

    const createdInstance = mapToSerializableInstance(result[0]);
    return createSuccessResult(createdInstance);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to create survey instance'));
  }
};

/**
 * Update survey instance
 */
export const updateSurveyInstance = async (
  input: UpdateSurveyInstanceInput
): Promise<AsyncResult<SerializableSurveyInstance>> => {
  try {
    if (!input.id) {
      return createErrorResult(new Error('Instance ID is required'));
    }

    // Build update object
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (input.status !== undefined) updateData.status = input.status;
    if (input.targetAudience !== undefined) updateData.targetAudience = input.targetAudience;
    if (input.triggerDate !== undefined) updateData.triggerDate = input.triggerDate;
    if (input.expiresAt !== undefined) updateData.expiresAt = input.expiresAt;
    if (input.notificationsSent !== undefined) {
      updateData.notificationsSent = input.notificationsSent;
      if (input.notificationsSent) {
        updateData.notificationsSentAt = new Date();
      }
    }

    const result = await db
      .update(surveyInstances)
      .set(updateData)
      .where(eq(surveyInstances.id, input.id))
      .returning();

    if (!result.length) {
      return createEmptyResult(`No survey instance found with ID ${input.id}`);
    }

    const updatedInstance = mapToSerializableInstance(result[0]);
    return createSuccessResult(updatedInstance);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error(`Failed to update survey instance`));
  }
};

/**
 * Mark survey instance notifications as sent
 */
export const markSurveyNotificationsSent = async (
  instanceId: string
): Promise<AsyncResult<boolean>> => {
  try {
    if (!instanceId) {
      return createErrorResult(new Error('Invalid instance ID'));
    }

    const result = await db
      .update(surveyInstances)
      .set({
        notificationsSent: true,
        notificationsSentAt: new Date(),
        status: 'active', // Move to active when notifications are sent
        updatedAt: new Date(),
      })
      .where(eq(surveyInstances.id, instanceId))
      .returning({ id: surveyInstances.id });

    if (!result.length) {
      return createEmptyResult(`No survey instance found with ID ${instanceId}`);
    }

    return createSuccessResult(true);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to mark survey notifications as sent'));
  }
};

/**
 * Cancel survey instance
 */
export const cancelSurveyInstance = async (id: string): Promise<AsyncResult<boolean>> => {
  try {
    if (!id) {
      return createErrorResult(new Error('Invalid instance ID'));
    }

    const result = await db
      .update(surveyInstances)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(surveyInstances.id, id))
      .returning({ id: surveyInstances.id });

    if (!result.length) {
      return createEmptyResult(`No survey instance found with ID ${id}`);
    }

    return createSuccessResult(true);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error(`Failed to cancel survey instance`));
  }
};

/**
 * Complete survey instance (manually or automatically)
 */
export const completeSurveyInstance = async (id: string): Promise<AsyncResult<boolean>> => {
  try {
    if (!id) {
      return createErrorResult(new Error('Invalid instance ID'));
    }

    const result = await db
      .update(surveyInstances)
      .set({
        status: 'completed',
        updatedAt: new Date(),
      })
      .where(eq(surveyInstances.id, id))
      .returning({ id: surveyInstances.id });

    if (!result.length) {
      return createEmptyResult(`No survey instance found with ID ${id}`);
    }

    return createSuccessResult(true);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error(`Failed to complete survey instance`));
  }
};

/**
 * Delete survey instance (and all associated responses)
 */
export const deleteSurveyInstance = async (id: string): Promise<AsyncResult<boolean>> => {
  try {
    if (!id) {
      return createErrorResult(new Error('Invalid instance ID'));
    }

    // Note: Responses will be automatically deleted due to CASCADE
    const result = await db
      .delete(surveyInstances)
      .where(eq(surveyInstances.id, id))
      .returning({ id: surveyInstances.id });

    if (!result.length) {
      return createEmptyResult(`No survey instance found with ID ${id}`);
    }

    return createSuccessResult(true);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error(`Failed to delete survey instance`));
  }
};

/**
 * Get eligible users for a survey instance based on target audience
 */
export const getEligibleUsersForSurvey = async (
  instanceId: string
): Promise<AsyncResult<Array<{ userid: string; email: string; username: string }>>> => {
  try {
    if (!instanceId) {
      return createErrorResult(new Error('Invalid instance ID'));
    }

    // Get the instance to determine target audience
    const instanceResult = await getSurveyInstanceById(instanceId);
    if (!instanceResult.success || !instanceResult.data) {
      return createErrorResult(new Error('Survey instance not found'));
    }

    const instance = instanceResult.data;
    const { roundId, targetAudience } = instance;

    let eligibleUsers: Array<{ userid: string; email: string; username: string }> = [];

    if (targetAudience === 'submitters') {
      // Users who submitted for this round
      const result = await db
        .select({
          userid: users.userid,
          email: users.email,
          username: users.username,
        })
        .from(submissions)
        .innerJoin(users, eq(submissions.userId, users.userid))
        .where(eq(submissions.roundId, roundId))
        .groupBy(users.userid, users.email, users.username);

      eligibleUsers = result;
    } else if (targetAudience === 'signups') {
      // Users who signed up for this round
      const result = await db
        .select({
          userid: users.userid,
          email: users.email,
          username: users.username,
        })
        .from(signUps)
        .innerJoin(users, eq(signUps.userId, users.userid))
        .where(eq(signUps.roundId, roundId))
        .groupBy(users.userid, users.email, users.username);

      eligibleUsers = result;
    } else if (targetAudience === 'all_project_members') {
      // All users who have any activity in this project (signups or submissions)
      const result = await db
        .select({
          userid: users.userid,
          email: users.email,
          username: users.username,
        })
        .from(users)
        .where(
          or(
            sql`${users.userid} IN (SELECT DISTINCT user_id FROM sign_ups WHERE project_id = ${instance.projectId})`,
            sql`${users.userid} IN (SELECT DISTINCT user_id FROM submissions WHERE project_id = ${instance.projectId})`
          )
        )
        .groupBy(users.userid, users.email, users.username);

      eligibleUsers = result;
    }

    if (!eligibleUsers.length) {
      return createEmptyResult('No eligible users found for this survey');
    }

    return createSuccessResult(eligibleUsers);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get eligible users for survey'));
  }
};

/**
 * Check if a specific user is eligible for a survey instance
 */
export const isUserEligibleForSurvey = async (
  instanceId: string,
  userId: string
): Promise<AsyncResult<boolean>> => {
  try {
    if (!instanceId || !userId) {
      return createErrorResult(new Error('Instance ID and user ID are required'));
    }

    const eligibleUsersResult = await getEligibleUsersForSurvey(instanceId);
    if (!eligibleUsersResult.success || !eligibleUsersResult.data) {
      return createSuccessResult(false);
    }

    const isEligible = eligibleUsersResult.data.some(user => user.userid === userId);
    return createSuccessResult(isEligible);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to check user eligibility'));
  }
};

/**
 * Get survey instance statistics
 */
export const getSurveyInstanceStats = async (instanceId: string): Promise<AsyncResult<{
  totalEligible: number;
  totalResponses: number;
  completeResponses: number;
  partialResponses: number;
  responseRate: number;
}>> => {
  try {
    if (!instanceId) {
      return createErrorResult(new Error('Invalid instance ID'));
    }

    // Get eligible users count
    const eligibleResult = await getEligibleUsersForSurvey(instanceId);
    const totalEligible = eligibleResult.success && eligibleResult.data ? eligibleResult.data.length : 0;

    // Get response statistics
    const stats = await db.execute(sql`
      SELECT
        COUNT(*) as total_responses,
        COUNT(CASE WHEN is_complete = true THEN 1 END) as complete_responses,
        COUNT(CASE WHEN is_complete = false THEN 1 END) as partial_responses
      FROM survey_responses
      WHERE instance_id = ${instanceId}
    `);

    if (!stats.rows.length) {
      return createSuccessResult({
        totalEligible,
        totalResponses: 0,
        completeResponses: 0,
        partialResponses: 0,
        responseRate: 0,
      });
    }

    const row = stats.rows[0] as any;
    const totalResponses = parseInt(row.total_responses) || 0;
    const completeResponses = parseInt(row.complete_responses) || 0;
    const partialResponses = parseInt(row.partial_responses) || 0;
    const responseRate = totalEligible > 0 ? (completeResponses / totalEligible) * 100 : 0;

    return createSuccessResult({
      totalEligible,
      totalResponses,
      completeResponses,
      partialResponses,
      responseRate: Math.round(responseRate * 100) / 100, // Round to 2 decimal places
    });
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get survey instance stats'));
  }
};
