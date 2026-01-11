"use server";

import {
  getAllSurveyTemplates,
  getSurveyTemplateById,
  getActiveSurveyTemplatesForProject,
  createSurveyTemplate,
  updateSurveyTemplate,
  deleteSurveyTemplate,
  toggleSurveyTemplateStatus,
  duplicateSurveyTemplate,
  getSurveyTemplateStats,
  type SerializableSurveyTemplate,
} from "@eptss/data-access/services/surveyTemplateService";

import {
  getAllSurveyInstances,
  getSurveyInstanceById,
  getSurveyInstancesByRoundId,
  createSurveyInstance,
  updateSurveyInstance,
  cancelSurveyInstance,
  completeSurveyInstance,
  deleteSurveyInstance,
  getEligibleUsersForSurvey,
  isUserEligibleForSurvey,
  getSurveyInstanceStats,
  type SerializableSurveyInstance,
} from "@eptss/data-access/services/surveyInstanceService";

import {
  getSurveyResponseByInstanceAndUser,
  getResponsesByInstanceId,
  saveSurveyResponse,
  deleteSurveyResponse,
  getSurveyAnalytics,
  exportSurveyResponsesToCSV,
  type SerializableSurveyResponse,
} from "@eptss/data-access/services/surveyResponseService";

import type {
  CreateSurveyTemplateInput,
  UpdateSurveyTemplateInput,
  CreateSurveyInstanceInput,
  UpdateSurveyInstanceInput,
  SaveSurveyResponseInput,
  SurveyAnalytics,
} from "@eptss/data-access/types/survey";

import { revalidatePath } from "next/cache";
import { logger } from "@eptss/logger/server";
import { getUser } from "@eptss/auth";

// ============================================================================
// RESPONSE TYPES
// ============================================================================

type ActionResponse<T> = {
  status: 'success' | 'error' | 'empty';
  data?: T | null;
  errorMessage?: string;
};

// ============================================================================
// SURVEY TEMPLATE ACTIONS
// ============================================================================

export async function fetchAllSurveyTemplates(options?: {
  projectId?: string | null;
  includeInactive?: boolean;
  includeDeleted?: boolean;
  limit?: number;
  offset?: number;
}): Promise<ActionResponse<SerializableSurveyTemplate[]>> {
  logger.action('fetchAllSurveyTemplates', 'started', options);

  try {
    const result = await getAllSurveyTemplates(options);

    if (result.status === 'success') {
      logger.action('fetchAllSurveyTemplates', 'completed', {
        count: result.data.length,
      });
      return {
        status: 'success',
        data: result.data,
      };
    } else if (result.status === 'empty') {
      return {
        status: 'empty',
        data: [],
      };
    } else {
      logger.warn('fetchAllSurveyTemplates returned error', {
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to fetch survey templates',
      };
    }
  } catch (error) {
    logger.action('fetchAllSurveyTemplates', 'failed', {
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to fetch survey templates',
    };
  }
}

export async function fetchSurveyTemplateById(
  id: string
): Promise<ActionResponse<SerializableSurveyTemplate>> {
  logger.action('fetchSurveyTemplateById', 'started', { id });

  try {
    const result = await getSurveyTemplateById(id);

    if (result.status === 'success') {
      logger.action('fetchSurveyTemplateById', 'completed', { id });
      return {
        status: 'success',
        data: result.data,
      };
    } else if (result.status === 'empty') {
      return {
        status: 'empty',
        data: null,
        errorMessage: 'Survey template not found',
      };
    } else {
      logger.warn('fetchSurveyTemplateById returned error', {
        id,
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to fetch survey template',
      };
    }
  } catch (error) {
    logger.action('fetchSurveyTemplateById', 'failed', {
      id,
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to fetch survey template',
    };
  }
}

export async function fetchActiveSurveyTemplatesForProject(
  projectId: string
): Promise<ActionResponse<SerializableSurveyTemplate[]>> {
  logger.action('fetchActiveSurveyTemplatesForProject', 'started', { projectId });

  try {
    const result = await getActiveSurveyTemplatesForProject(projectId);

    if (result.status === 'success') {
      logger.action('fetchActiveSurveyTemplatesForProject', 'completed', {
        projectId,
        count: result.data.length,
      });
      return {
        status: 'success',
        data: result.data,
      };
    } else if (result.status === 'empty') {
      return {
        status: 'empty',
        data: [],
      };
    } else {
      logger.warn('fetchActiveSurveyTemplatesForProject returned error', {
        projectId,
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to fetch active templates',
      };
    }
  } catch (error) {
    logger.action('fetchActiveSurveyTemplatesForProject', 'failed', {
      projectId,
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to fetch active templates',
    };
  }
}

export async function createSurveyTemplateAction(
  input: CreateSurveyTemplateInput
): Promise<ActionResponse<SerializableSurveyTemplate>> {
  logger.action('createSurveyTemplateAction', 'started', {
    name: input.name,
    projectId: input.projectId,
  });

  try {
    // Get current user for createdBy
    const user = await getUser();
    if (!user) {
      return {
        status: 'error',
        data: null,
        errorMessage: 'User not authenticated',
      };
    }

    // Add createdBy to input
    const inputWithUser = {
      ...input,
      createdBy: user.id,
    };

    const result = await createSurveyTemplate(inputWithUser);

    // Revalidate admin pages
    revalidatePath('/admin/surveys');
    if (input.projectId) {
      revalidatePath(`/admin/projects/${input.projectId}`);
    }

    if (result.status === 'success') {
      logger.action('createSurveyTemplateAction', 'completed', {
        templateId: result.data.id,
        name: input.name,
      });
      return {
        status: 'success',
        data: result.data,
      };
    } else {
      logger.warn('createSurveyTemplateAction returned error', {
        name: input.name,
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to create survey template',
      };
    }
  } catch (error) {
    logger.action('createSurveyTemplateAction', 'failed', {
      name: input.name,
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to create survey template',
    };
  }
}

export async function updateSurveyTemplateAction(
  input: UpdateSurveyTemplateInput
): Promise<ActionResponse<SerializableSurveyTemplate>> {
  logger.action('updateSurveyTemplateAction', 'started', { id: input.id });

  try {
    const result = await updateSurveyTemplate(input);

    // Revalidate admin pages
    revalidatePath('/admin/surveys');
    revalidatePath(`/admin/surveys/${input.id}`);

    if (result.status === 'success') {
      logger.action('updateSurveyTemplateAction', 'completed', {
        templateId: input.id,
      });
      return {
        status: 'success',
        data: result.data,
      };
    } else if (result.status === 'empty') {
      return {
        status: 'empty',
        data: null,
        errorMessage: 'Survey template not found',
      };
    } else {
      logger.warn('updateSurveyTemplateAction returned error', {
        id: input.id,
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to update survey template',
      };
    }
  } catch (error) {
    logger.action('updateSurveyTemplateAction', 'failed', {
      id: input.id,
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to update survey template',
    };
  }
}

export async function deleteSurveyTemplateAction(
  id: string
): Promise<ActionResponse<boolean>> {
  logger.action('deleteSurveyTemplateAction', 'started', { id });

  try {
    const result = await deleteSurveyTemplate(id);

    // Revalidate admin pages
    revalidatePath('/admin/surveys');

    if (result.status === 'success') {
      logger.action('deleteSurveyTemplateAction', 'completed', { id });
      return {
        status: 'success',
        data: true,
      };
    } else if (result.status === 'empty') {
      return {
        status: 'empty',
        data: null,
        errorMessage: 'Survey template not found',
      };
    } else {
      logger.warn('deleteSurveyTemplateAction returned error', {
        id,
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to delete survey template',
      };
    }
  } catch (error) {
    logger.action('deleteSurveyTemplateAction', 'failed', {
      id,
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to delete survey template',
    };
  }
}

export async function toggleSurveyTemplateStatusAction(
  id: string,
  isActive: boolean
): Promise<ActionResponse<SerializableSurveyTemplate>> {
  logger.action('toggleSurveyTemplateStatusAction', 'started', { id, isActive });

  try {
    const result = await toggleSurveyTemplateStatus(id, isActive);

    // Revalidate admin pages
    revalidatePath('/admin/surveys');

    if (result.status === 'success') {
      logger.action('toggleSurveyTemplateStatusAction', 'completed', {
        id,
        isActive,
      });
      return {
        status: 'success',
        data: result.data,
      };
    } else if (result.status === 'empty') {
      return {
        status: 'empty',
        data: null,
        errorMessage: 'Survey template not found',
      };
    } else {
      logger.warn('toggleSurveyTemplateStatusAction returned error', {
        id,
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to toggle template status',
      };
    }
  } catch (error) {
    logger.action('toggleSurveyTemplateStatusAction', 'failed', {
      id,
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to toggle template status',
    };
  }
}

export async function duplicateSurveyTemplateAction(
  id: string,
  newName?: string
): Promise<ActionResponse<SerializableSurveyTemplate>> {
  logger.action('duplicateSurveyTemplateAction', 'started', { id, newName });

  try {
    // Get current user
    const user = await getUser();
    if (!user) {
      return {
        status: 'error',
        data: null,
        errorMessage: 'User not authenticated',
      };
    }

    const result = await duplicateSurveyTemplate(id, newName, user.id);

    // Revalidate admin pages
    revalidatePath('/admin/surveys');

    if (result.status === 'success') {
      logger.action('duplicateSurveyTemplateAction', 'completed', {
        originalId: id,
        newId: result.data.id,
      });
      return {
        status: 'success',
        data: result.data,
      };
    } else {
      logger.warn('duplicateSurveyTemplateAction returned error', {
        id,
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to duplicate template',
      };
    }
  } catch (error) {
    logger.action('duplicateSurveyTemplateAction', 'failed', {
      id,
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to duplicate template',
    };
  }
}

export async function fetchSurveyTemplateStats(
  id: string
): Promise<ActionResponse<{
  totalInstances: number;
  activeInstances: number;
  totalResponses: number;
  completeResponses: number;
}>> {
  logger.action('fetchSurveyTemplateStats', 'started', { id });

  try {
    const result = await getSurveyTemplateStats(id);

    if (result.status === 'success') {
      logger.action('fetchSurveyTemplateStats', 'completed', { id });
      return {
        status: 'success',
        data: result.data,
      };
    } else {
      logger.warn('fetchSurveyTemplateStats returned error', {
        id,
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to fetch template stats',
      };
    }
  } catch (error) {
    logger.action('fetchSurveyTemplateStats', 'failed', {
      id,
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to fetch template stats',
    };
  }
}

// ============================================================================
// SURVEY INSTANCE ACTIONS
// ============================================================================

export async function fetchAllSurveyInstances(options?: {
  projectId?: string;
  roundId?: number;
  templateId?: string;
  status?: 'scheduled' | 'active' | 'completed' | 'cancelled';
  limit?: number;
  offset?: number;
}): Promise<ActionResponse<SerializableSurveyInstance[]>> {
  logger.action('fetchAllSurveyInstances', 'started', options);

  try {
    const result = await getAllSurveyInstances(options);

    if (result.status === 'success') {
      logger.action('fetchAllSurveyInstances', 'completed', {
        count: result.data.length,
      });
      return {
        status: 'success',
        data: result.data,
      };
    } else if (result.status === 'empty') {
      return {
        status: 'empty',
        data: [],
      };
    } else {
      logger.warn('fetchAllSurveyInstances returned error', {
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to fetch survey instances',
      };
    }
  } catch (error) {
    logger.action('fetchAllSurveyInstances', 'failed', {
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to fetch survey instances',
    };
  }
}

export async function fetchSurveyInstanceById(
  id: string
): Promise<ActionResponse<SerializableSurveyInstance>> {
  logger.action('fetchSurveyInstanceById', 'started', { id });

  try {
    const result = await getSurveyInstanceById(id);

    if (result.status === 'success') {
      logger.action('fetchSurveyInstanceById', 'completed', { id });
      return {
        status: 'success',
        data: result.data,
      };
    } else if (result.status === 'empty') {
      return {
        status: 'empty',
        data: null,
        errorMessage: 'Survey instance not found',
      };
    } else {
      logger.warn('fetchSurveyInstanceById returned error', {
        id,
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to fetch survey instance',
      };
    }
  } catch (error) {
    logger.action('fetchSurveyInstanceById', 'failed', {
      id,
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to fetch survey instance',
    };
  }
}

export async function fetchSurveyInstancesByRoundId(
  roundId: number
): Promise<ActionResponse<SerializableSurveyInstance[]>> {
  logger.action('fetchSurveyInstancesByRoundId', 'started', { roundId });

  try {
    const result = await getSurveyInstancesByRoundId(roundId);

    if (result.status === 'success') {
      logger.action('fetchSurveyInstancesByRoundId', 'completed', {
        roundId,
        count: result.data.length,
      });
      return {
        status: 'success',
        data: result.data,
      };
    } else if (result.status === 'empty') {
      return {
        status: 'empty',
        data: [],
      };
    } else {
      logger.warn('fetchSurveyInstancesByRoundId returned error', {
        roundId,
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to fetch round surveys',
      };
    }
  } catch (error) {
    logger.action('fetchSurveyInstancesByRoundId', 'failed', {
      roundId,
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to fetch round surveys',
    };
  }
}

export async function createSurveyInstanceAction(
  input: CreateSurveyInstanceInput
): Promise<ActionResponse<SerializableSurveyInstance>> {
  logger.action('createSurveyInstanceAction', 'started', {
    templateId: input.templateId,
    roundId: input.roundId,
  });

  try {
    const result = await createSurveyInstance(input);

    // Revalidate relevant pages
    revalidatePath('/admin/surveys');
    revalidatePath(`/admin/rounds/${input.roundId}`);

    if (result.status === 'success') {
      logger.action('createSurveyInstanceAction', 'completed', {
        instanceId: result.data.id,
      });
      return {
        status: 'success',
        data: result.data,
      };
    } else {
      logger.warn('createSurveyInstanceAction returned error', {
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to create survey instance',
      };
    }
  } catch (error) {
    logger.action('createSurveyInstanceAction', 'failed', {
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to create survey instance',
    };
  }
}

export async function updateSurveyInstanceAction(
  input: UpdateSurveyInstanceInput
): Promise<ActionResponse<SerializableSurveyInstance>> {
  logger.action('updateSurveyInstanceAction', 'started', { id: input.id });

  try {
    const result = await updateSurveyInstance(input);

    // Revalidate relevant pages
    revalidatePath('/admin/surveys');
    revalidatePath(`/admin/surveys/instances/${input.id}`);

    if (result.status === 'success') {
      logger.action('updateSurveyInstanceAction', 'completed', {
        instanceId: input.id,
      });
      return {
        status: 'success',
        data: result.data,
      };
    } else if (result.status === 'empty') {
      return {
        status: 'empty',
        data: null,
        errorMessage: 'Survey instance not found',
      };
    } else {
      logger.warn('updateSurveyInstanceAction returned error', {
        id: input.id,
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to update survey instance',
      };
    }
  } catch (error) {
    logger.action('updateSurveyInstanceAction', 'failed', {
      id: input.id,
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to update survey instance',
    };
  }
}

export async function cancelSurveyInstanceAction(
  id: string
): Promise<ActionResponse<boolean>> {
  logger.action('cancelSurveyInstanceAction', 'started', { id });

  try {
    const result = await cancelSurveyInstance(id);

    // Revalidate relevant pages
    revalidatePath('/admin/surveys');

    if (result.status === 'success') {
      logger.action('cancelSurveyInstanceAction', 'completed', { id });
      return {
        status: 'success',
        data: true,
      };
    } else if (result.status === 'empty') {
      return {
        status: 'empty',
        data: null,
        errorMessage: 'Survey instance not found',
      };
    } else {
      logger.warn('cancelSurveyInstanceAction returned error', {
        id,
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to cancel survey instance',
      };
    }
  } catch (error) {
    logger.action('cancelSurveyInstanceAction', 'failed', {
      id,
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to cancel survey instance',
    };
  }
}

export async function completeSurveyInstanceAction(
  id: string
): Promise<ActionResponse<boolean>> {
  logger.action('completeSurveyInstanceAction', 'started', { id });

  try {
    const result = await completeSurveyInstance(id);

    // Revalidate relevant pages
    revalidatePath('/admin/surveys');

    if (result.status === 'success') {
      logger.action('completeSurveyInstanceAction', 'completed', { id });
      return {
        status: 'success',
        data: true,
      };
    } else if (result.status === 'empty') {
      return {
        status: 'empty',
        data: null,
        errorMessage: 'Survey instance not found',
      };
    } else {
      logger.warn('completeSurveyInstanceAction returned error', {
        id,
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to complete survey instance',
      };
    }
  } catch (error) {
    logger.action('completeSurveyInstanceAction', 'failed', {
      id,
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to complete survey instance',
    };
  }
}

export async function deleteSurveyInstanceAction(
  id: string
): Promise<ActionResponse<boolean>> {
  logger.action('deleteSurveyInstanceAction', 'started', { id });

  try {
    const result = await deleteSurveyInstance(id);

    // Revalidate relevant pages
    revalidatePath('/admin/surveys');

    if (result.status === 'success') {
      logger.action('deleteSurveyInstanceAction', 'completed', { id });
      return {
        status: 'success',
        data: true,
      };
    } else if (result.status === 'empty') {
      return {
        status: 'empty',
        data: null,
        errorMessage: 'Survey instance not found',
      };
    } else {
      logger.warn('deleteSurveyInstanceAction returned error', {
        id,
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to delete survey instance',
      };
    }
  } catch (error) {
    logger.action('deleteSurveyInstanceAction', 'failed', {
      id,
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to delete survey instance',
    };
  }
}

export async function checkUserEligibilityForSurvey(
  instanceId: string,
  userId: string
): Promise<ActionResponse<boolean>> {
  logger.action('checkUserEligibilityForSurvey', 'started', {
    instanceId,
    userId,
  });

  try {
    const result = await isUserEligibleForSurvey(instanceId, userId);

    if (result.status === 'success') {
      logger.action('checkUserEligibilityForSurvey', 'completed', {
        instanceId,
        userId,
        eligible: result.data,
      });
      return {
        status: 'success',
        data: result.data,
      };
    } else {
      logger.warn('checkUserEligibilityForSurvey returned error', {
        instanceId,
        userId,
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to check eligibility',
      };
    }
  } catch (error) {
    logger.action('checkUserEligibilityForSurvey', 'failed', {
      instanceId,
      userId,
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to check eligibility',
    };
  }
}

export async function fetchSurveyInstanceStats(
  instanceId: string
): Promise<ActionResponse<{
  totalEligible: number;
  totalResponses: number;
  completeResponses: number;
  partialResponses: number;
  responseRate: number;
}>> {
  logger.action('fetchSurveyInstanceStats', 'started', { instanceId });

  try {
    const result = await getSurveyInstanceStats(instanceId);

    if (result.status === 'success') {
      logger.action('fetchSurveyInstanceStats', 'completed', { instanceId });
      return {
        status: 'success',
        data: result.data,
      };
    } else {
      logger.warn('fetchSurveyInstanceStats returned error', {
        instanceId,
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to fetch instance stats',
      };
    }
  } catch (error) {
    logger.action('fetchSurveyInstanceStats', 'failed', {
      instanceId,
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to fetch instance stats',
    };
  }
}

// ============================================================================
// SURVEY RESPONSE ACTIONS
// ============================================================================

export async function fetchUserSurveyResponse(
  instanceId: string,
  userId: string
): Promise<ActionResponse<SerializableSurveyResponse>> {
  logger.action('fetchUserSurveyResponse', 'started', { instanceId, userId });

  try {
    const result = await getSurveyResponseByInstanceAndUser(instanceId, userId);

    if (result.status === 'success') {
      logger.action('fetchUserSurveyResponse', 'completed', {
        instanceId,
        userId,
      });
      return {
        status: 'success',
        data: result.data,
      };
    } else if (result.status === 'empty') {
      return {
        status: 'empty',
        data: null,
      };
    } else {
      logger.warn('fetchUserSurveyResponse returned error', {
        instanceId,
        userId,
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to fetch response',
      };
    }
  } catch (error) {
    logger.action('fetchUserSurveyResponse', 'failed', {
      instanceId,
      userId,
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to fetch response',
    };
  }
}

export async function fetchResponsesByInstance(
  instanceId: string,
  options?: {
    includeIncomplete?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<ActionResponse<SerializableSurveyResponse[]>> {
  logger.action('fetchResponsesByInstance', 'started', { instanceId, options });

  try {
    const result = await getResponsesByInstanceId(instanceId, options);

    if (result.status === 'success') {
      logger.action('fetchResponsesByInstance', 'completed', {
        instanceId,
        count: result.data.length,
      });
      return {
        status: 'success',
        data: result.data,
      };
    } else if (result.status === 'empty') {
      return {
        status: 'empty',
        data: [],
      };
    } else {
      logger.warn('fetchResponsesByInstance returned error', {
        instanceId,
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to fetch responses',
      };
    }
  } catch (error) {
    logger.action('fetchResponsesByInstance', 'failed', {
      instanceId,
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to fetch responses',
    };
  }
}

export async function saveSurveyResponseAction(
  input: SaveSurveyResponseInput
): Promise<ActionResponse<SerializableSurveyResponse>> {
  logger.action('saveSurveyResponseAction', 'started', {
    instanceId: input.instanceId,
    userId: input.userId,
    isComplete: input.isComplete,
  });

  try {
    const result = await saveSurveyResponse(input);

    // Revalidate survey page
    revalidatePath(`/surveys/${input.instanceId}`);
    revalidatePath(`/dashboard`);

    if (result.status === 'success') {
      logger.action('saveSurveyResponseAction', 'completed', {
        responseId: result.data.id,
        instanceId: input.instanceId,
        userId: input.userId,
        isComplete: input.isComplete,
      });
      return {
        status: 'success',
        data: result.data,
      };
    } else {
      logger.warn('saveSurveyResponseAction returned error', {
        instanceId: input.instanceId,
        userId: input.userId,
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to save response',
      };
    }
  } catch (error) {
    logger.action('saveSurveyResponseAction', 'failed', {
      instanceId: input.instanceId,
      userId: input.userId,
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to save response',
    };
  }
}

export async function deleteSurveyResponseAction(
  id: string
): Promise<ActionResponse<boolean>> {
  logger.action('deleteSurveyResponseAction', 'started', { id });

  try {
    const result = await deleteSurveyResponse(id);

    // Revalidate admin pages
    revalidatePath('/admin/surveys');

    if (result.status === 'success') {
      logger.action('deleteSurveyResponseAction', 'completed', { id });
      return {
        status: 'success',
        data: true,
      };
    } else if (result.status === 'empty') {
      return {
        status: 'empty',
        data: null,
        errorMessage: 'Response not found',
      };
    } else {
      logger.warn('deleteSurveyResponseAction returned error', {
        id,
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to delete response',
      };
    }
  } catch (error) {
    logger.action('deleteSurveyResponseAction', 'failed', {
      id,
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to delete response',
    };
  }
}

export async function fetchSurveyAnalytics(
  instanceId: string
): Promise<ActionResponse<SurveyAnalytics>> {
  logger.action('fetchSurveyAnalytics', 'started', { instanceId });

  try {
    const result = await getSurveyAnalytics(instanceId);

    if (result.status === 'success') {
      logger.action('fetchSurveyAnalytics', 'completed', { instanceId });
      return {
        status: 'success',
        data: result.data,
      };
    } else {
      logger.warn('fetchSurveyAnalytics returned error', {
        instanceId,
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to fetch analytics',
      };
    }
  } catch (error) {
    logger.action('fetchSurveyAnalytics', 'failed', {
      instanceId,
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to fetch analytics',
    };
  }
}

export async function exportSurveyResponses(
  instanceId: string
): Promise<ActionResponse<string>> {
  logger.action('exportSurveyResponses', 'started', { instanceId });

  try {
    const result = await exportSurveyResponsesToCSV(instanceId);

    if (result.status === 'success') {
      logger.action('exportSurveyResponses', 'completed', { instanceId });
      return {
        status: 'success',
        data: result.data,
      };
    } else if (result.status === 'empty') {
      return {
        status: 'empty',
        data: null,
        errorMessage: 'No responses to export',
      };
    } else {
      logger.warn('exportSurveyResponses returned error', {
        instanceId,
        error: result.error?.message,
      });
      return {
        status: 'error',
        data: null,
        errorMessage: result.error?.message || 'Failed to export responses',
      };
    }
  } catch (error) {
    logger.action('exportSurveyResponses', 'failed', {
      instanceId,
      error: error instanceof Error ? error : undefined,
    });
    return {
      status: 'error',
      data: null,
      errorMessage: error instanceof Error ? error.message : 'Failed to export responses',
    };
  }
}
