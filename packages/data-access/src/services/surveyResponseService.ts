"use server";

import { db } from "../db";
import { surveyResponses, users, surveyInstances, surveyTemplates } from "../db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { AsyncResult, createSuccessResult, createEmptyResult, createErrorResult } from '../types/asyncResult';
import {
  SaveSurveyResponseInput,
  SurveyAnswer,
  QuestionAnalytics,
  SurveyAnalytics,
  SurveyQuestion,
  validateAnswersAgainstTemplate,
} from '../types/survey';
import { sanitizeHtml } from "../utils/sanitize";

// Serializable version of survey response
export interface SerializableSurveyResponse {
  id: string;
  instanceId: string;
  userId: string;
  roundId: number;
  answers: SurveyAnswer[];
  isComplete: boolean;
  startedAt: string;
  submittedAt: string | null;
  updatedAt: string;
  // Optional joined data
  user?: {
    userid: string;
    username: string;
    publicDisplayName: string | null;
    profilePictureUrl: string | null;
  };
}

/**
 * Map database result to serializable survey response
 */
const mapToSerializableResponse = (dbResponse: any): SerializableSurveyResponse => {
  return {
    id: dbResponse.id,
    instanceId: dbResponse.instanceId,
    userId: dbResponse.userId,
    roundId: dbResponse.roundId,
    answers: dbResponse.answers as SurveyAnswer[],
    isComplete: dbResponse.isComplete,
    startedAt: dbResponse.startedAt instanceof Date ?
      dbResponse.startedAt.toISOString() :
      new Date(dbResponse.startedAt).toISOString(),
    submittedAt: dbResponse.submittedAt ?
      (dbResponse.submittedAt instanceof Date ?
        dbResponse.submittedAt.toISOString() :
        new Date(dbResponse.submittedAt).toISOString()) :
      null,
    updatedAt: dbResponse.updatedAt instanceof Date ?
      dbResponse.updatedAt.toISOString() :
      new Date(dbResponse.updatedAt).toISOString(),
    user: dbResponse.user ? {
      userid: dbResponse.user.userid,
      username: dbResponse.user.username,
      publicDisplayName: dbResponse.user.publicDisplayName,
      profilePictureUrl: dbResponse.user.profilePictureUrl,
    } : undefined,
  };
};

/**
 * Sanitize text answers to prevent XSS
 */
const sanitizeAnswers = (answers: SurveyAnswer[]): SurveyAnswer[] => {
  return answers.map(answer => {
    if (answer.type === 'text' || answer.type === 'textarea') {
      return {
        ...answer,
        value: sanitizeHtml(answer.value),
      };
    }
    if ((answer.type === 'multiple_choice' || answer.type === 'checkboxes') && answer.otherValue) {
      return {
        ...answer,
        otherValue: sanitizeHtml(answer.otherValue),
      };
    }
    return answer;
  });
};

/**
 * Get survey response by instance and user
 */
export const getSurveyResponseByInstanceAndUser = async (
  instanceId: string,
  userId: string
): Promise<AsyncResult<SerializableSurveyResponse>> => {
  try {
    if (!instanceId || !userId) {
      return createErrorResult(new Error('Instance ID and user ID are required'));
    }

    const result = await db
      .select({
        response: surveyResponses,
        user: users,
      })
      .from(surveyResponses)
      .leftJoin(users, eq(surveyResponses.userId, users.userid))
      .where(
        and(
          eq(surveyResponses.instanceId, instanceId),
          eq(surveyResponses.userId, userId)
        )
      );

    if (!result.length) {
      return createEmptyResult('No response found');
    }

    const response = mapToSerializableResponse({
      ...result[0].response,
      user: result[0].user,
    });

    return createSuccessResult(response);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get survey response'));
  }
};

/**
 * Get all responses for a survey instance
 */
export const getResponsesByInstanceId = async (
  instanceId: string,
  options?: {
    includeIncomplete?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<AsyncResult<SerializableSurveyResponse[]>> => {
  try {
    if (!instanceId) {
      return createErrorResult(new Error('Invalid instance ID'));
    }

    const { includeIncomplete = true, limit = 100, offset = 0 } = options || {};

    const conditions = [eq(surveyResponses.instanceId, instanceId)];

    if (!includeIncomplete) {
      conditions.push(eq(surveyResponses.isComplete, true));
    }

    const result = await db
      .select({
        response: surveyResponses,
        user: users,
      })
      .from(surveyResponses)
      .leftJoin(users, eq(surveyResponses.userId, users.userid))
      .where(and(...conditions))
      .orderBy(desc(surveyResponses.submittedAt))
      .limit(limit)
      .offset(offset);

    if (!result.length) {
      return createEmptyResult('No responses found');
    }

    const responses = result.map(row =>
      mapToSerializableResponse({
        ...row.response,
        user: row.user,
      })
    );

    return createSuccessResult(responses);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get responses'));
  }
};

/**
 * Get all responses by a specific user
 */
export const getResponsesByUserId = async (
  userId: string,
  options?: {
    includeIncomplete?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<AsyncResult<SerializableSurveyResponse[]>> => {
  try {
    if (!userId) {
      return createErrorResult(new Error('Invalid user ID'));
    }

    const { includeIncomplete = true, limit = 50, offset = 0 } = options || {};

    const conditions = [eq(surveyResponses.userId, userId)];

    if (!includeIncomplete) {
      conditions.push(eq(surveyResponses.isComplete, true));
    }

    const result = await db
      .select({
        response: surveyResponses,
        user: users,
      })
      .from(surveyResponses)
      .leftJoin(users, eq(surveyResponses.userId, users.userid))
      .where(and(...conditions))
      .orderBy(desc(surveyResponses.updatedAt))
      .limit(limit)
      .offset(offset);

    if (!result.length) {
      return createEmptyResult('No responses found');
    }

    const responses = result.map(row =>
      mapToSerializableResponse({
        ...row.response,
        user: row.user,
      })
    );

    return createSuccessResult(responses);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get user responses'));
  }
};

/**
 * Save or update survey response (for partial saves and final submission)
 */
export const saveSurveyResponse = async (
  input: SaveSurveyResponseInput
): Promise<AsyncResult<SerializableSurveyResponse>> => {
  try {
    // Validate input
    if (!input.instanceId || !input.userId || !input.roundId) {
      return createErrorResult(new Error('Instance ID, user ID, and round ID are required'));
    }

    // Sanitize text answers
    const sanitizedAnswers = sanitizeAnswers(input.answers);

    // If completing, validate answers against template
    if (input.isComplete) {
      // Get template to validate against
      const instanceResult = await db
        .select({
          template: surveyTemplates,
        })
        .from(surveyInstances)
        .leftJoin(surveyTemplates, eq(surveyInstances.templateId, surveyTemplates.id))
        .where(eq(surveyInstances.id, input.instanceId));

      if (!instanceResult.length || !instanceResult[0].template) {
        return createErrorResult(new Error('Survey template not found'));
      }

      const questions = instanceResult[0].template.questions as SurveyQuestion[];
      const validation = validateAnswersAgainstTemplate(sanitizedAnswers, questions);

      if (!validation.valid) {
        return createErrorResult(new Error(`Validation failed: ${validation.errors.join(', ')}`));
      }
    }

    // Check if response already exists
    const existingResult = await getSurveyResponseByInstanceAndUser(input.instanceId, input.userId);

    let result;

    if (existingResult.success && existingResult.data) {
      // Update existing response
      const updateData: any = {
        answers: sanitizedAnswers as any,
        isComplete: input.isComplete,
        updatedAt: new Date(),
      };

      // Set submittedAt timestamp when completing
      if (input.isComplete && !existingResult.data.isComplete) {
        updateData.submittedAt = new Date();
      }

      result = await db
        .update(surveyResponses)
        .set(updateData)
        .where(eq(surveyResponses.id, existingResult.data.id))
        .returning();
    } else {
      // Create new response
      result = await db.insert(surveyResponses).values({
        instanceId: input.instanceId,
        userId: input.userId,
        roundId: input.roundId,
        answers: sanitizedAnswers as any,
        isComplete: input.isComplete,
        submittedAt: input.isComplete ? new Date() : null,
      }).returning();
    }

    if (!result.length) {
      return createErrorResult(new Error('Failed to save survey response'));
    }

    const savedResponse = mapToSerializableResponse(result[0]);
    return createSuccessResult(savedResponse);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to save survey response'));
  }
};

/**
 * Delete survey response
 */
export const deleteSurveyResponse = async (id: string): Promise<AsyncResult<boolean>> => {
  try {
    if (!id) {
      return createErrorResult(new Error('Invalid response ID'));
    }

    const result = await db
      .delete(surveyResponses)
      .where(eq(surveyResponses.id, id))
      .returning({ id: surveyResponses.id });

    if (!result.length) {
      return createEmptyResult(`No response found with ID ${id}`);
    }

    return createSuccessResult(true);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to delete survey response'));
  }
};

/**
 * Get analytics for a survey instance
 */
export const getSurveyAnalytics = async (instanceId: string): Promise<AsyncResult<SurveyAnalytics>> => {
  try {
    if (!instanceId) {
      return createErrorResult(new Error('Invalid instance ID'));
    }

    // Get all complete responses
    const responsesResult = await getResponsesByInstanceId(instanceId, {
      includeIncomplete: false,
    });

    if (!responsesResult.success || !responsesResult.data) {
      return createSuccessResult({
        totalResponses: 0,
        completeResponses: 0,
        partialResponses: 0,
        responseRate: 0,
        questionAnalytics: [],
      });
    }

    const responses = responsesResult.data;

    // Get template to analyze questions
    const instanceResult = await db
      .select({
        template: surveyTemplates,
      })
      .from(surveyInstances)
      .leftJoin(surveyTemplates, eq(surveyInstances.templateId, surveyTemplates.id))
      .where(eq(surveyInstances.id, instanceId));

    if (!instanceResult.length || !instanceResult[0].template) {
      return createErrorResult(new Error('Survey template not found'));
    }

    const questions = instanceResult[0].template.questions as SurveyQuestion[];

    // Get response counts
    const stats = await db.execute(sql`
      SELECT
        COUNT(*) as total_responses,
        COUNT(CASE WHEN is_complete = true THEN 1 END) as complete_responses,
        COUNT(CASE WHEN is_complete = false THEN 1 END) as partial_responses
      FROM survey_responses
      WHERE instance_id = ${instanceId}
    `);

    const row = stats.rows[0] as any;
    const totalResponses = parseInt(row.total_responses) || 0;
    const completeResponses = parseInt(row.complete_responses) || 0;
    const partialResponses = parseInt(row.partial_responses) || 0;

    // Analyze each question
    const questionAnalytics: QuestionAnalytics[] = questions.map(question => {
      const answers = responses
        .flatMap(r => r.answers)
        .filter(a => a.questionId === question.id);

      const analytics: QuestionAnalytics = {
        questionId: question.id,
        question: question.question,
        type: question.type,
        totalAnswers: answers.length,
      };

      // Type-specific analytics
      if (question.type === 'text' || question.type === 'textarea') {
        analytics.textAnswers = answers
          .filter(a => a.type === question.type)
          .map(a => (a as any).value);
      } else if (question.type === 'rating') {
        const values = answers
          .filter(a => a.type === 'rating')
          .map(a => (a as any).value);

        if (values.length > 0) {
          const sum = values.reduce((acc, val) => acc + val, 0);
          const average = sum / values.length;
          const sortedValues = [...values].sort((a, b) => a - b);
          const median = sortedValues[Math.floor(sortedValues.length / 2)];

          const distribution: Record<number, number> = {};
          values.forEach(val => {
            distribution[val] = (distribution[val] || 0) + 1;
          });

          analytics.ratingStats = {
            average: Math.round(average * 100) / 100,
            median,
            distribution,
          };
        }
      } else if (question.type === 'multiple_choice' || question.type === 'checkboxes') {
        const questionDef = question as any;
        const optionCounts: Record<string, number> = {};
        const otherAnswers: string[] = [];

        answers.forEach(answer => {
          if (answer.type === 'multiple_choice') {
            const mcAnswer = answer as any;
            optionCounts[mcAnswer.selectedOptionId] = (optionCounts[mcAnswer.selectedOptionId] || 0) + 1;
            if (mcAnswer.otherValue) {
              otherAnswers.push(mcAnswer.otherValue);
            }
          } else if (answer.type === 'checkboxes') {
            const cbAnswer = answer as any;
            cbAnswer.selectedOptionIds.forEach((optionId: string) => {
              optionCounts[optionId] = (optionCounts[optionId] || 0) + 1;
            });
            if (cbAnswer.otherValue) {
              otherAnswers.push(cbAnswer.otherValue);
            }
          }
        });

        analytics.optionStats = questionDef.options.map((option: any) => ({
          optionId: option.id,
          label: option.label,
          count: optionCounts[option.id] || 0,
          percentage: answers.length > 0 ? Math.round(((optionCounts[option.id] || 0) / answers.length) * 10000) / 100 : 0,
        }));

        if (otherAnswers.length > 0) {
          analytics.otherAnswers = otherAnswers;
        }
      }

      return analytics;
    });

    return createSuccessResult({
      totalResponses,
      completeResponses,
      partialResponses,
      responseRate: 0, // Calculate externally with eligible users count
      questionAnalytics,
    });
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to get survey analytics'));
  }
};

/**
 * Export survey responses to CSV format
 */
export const exportSurveyResponsesToCSV = async (instanceId: string): Promise<AsyncResult<string>> => {
  try {
    if (!instanceId) {
      return createErrorResult(new Error('Invalid instance ID'));
    }

    // Get all complete responses
    const responsesResult = await getResponsesByInstanceId(instanceId, {
      includeIncomplete: false,
    });

    if (!responsesResult.success || !responsesResult.data || responsesResult.data.length === 0) {
      return createEmptyResult('No responses to export');
    }

    const responses = responsesResult.data;

    // Get template to get question text
    const instanceResult = await db
      .select({
        template: surveyTemplates,
      })
      .from(surveyInstances)
      .leftJoin(surveyTemplates, eq(surveyInstances.templateId, surveyTemplates.id))
      .where(eq(surveyInstances.id, instanceId));

    if (!instanceResult.length || !instanceResult[0].template) {
      return createErrorResult(new Error('Survey template not found'));
    }

    const questions = instanceResult[0].template.questions as SurveyQuestion[];

    // Build CSV header
    const headers = ['User ID', 'Username', 'Submitted At', ...questions.map(q => q.question)];
    const csvRows = [headers];

    // Build CSV rows
    responses.forEach(response => {
      const row = [
        response.userId,
        response.user?.username || '',
        response.submittedAt || '',
      ];

      // Add answer for each question
      questions.forEach(question => {
        const answer = response.answers.find(a => a.questionId === question.id);
        if (!answer) {
          row.push('');
          return;
        }

        let value = '';
        if (answer.type === 'text' || answer.type === 'textarea') {
          value = (answer as any).value;
        } else if (answer.type === 'rating') {
          value = String((answer as any).value);
        } else if (answer.type === 'multiple_choice') {
          const mcAnswer = answer as any;
          const option = (question as any).options.find((o: any) => o.id === mcAnswer.selectedOptionId);
          value = option ? option.label : mcAnswer.otherValue || '';
        } else if (answer.type === 'checkboxes') {
          const cbAnswer = answer as any;
          const selectedLabels = (question as any).options
            .filter((o: any) => cbAnswer.selectedOptionIds.includes(o.id))
            .map((o: any) => o.label);
          if (cbAnswer.otherValue) {
            selectedLabels.push(cbAnswer.otherValue);
          }
          value = selectedLabels.join('; ');
        }

        row.push(value);
      });

      csvRows.push(row);
    });

    // Convert to CSV string
    const csvContent = csvRows
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return createSuccessResult(csvContent);
  } catch (error) {
    return createErrorResult(error instanceof Error ? error : new Error('Failed to export survey responses'));
  }
};
