import { z } from "zod";

// ============================================================================
// SURVEY QUESTION TYPES
// ============================================================================

export const SurveyQuestionTypeEnum = z.enum([
  "text",          // Short text input
  "textarea",      // Long text input
  "rating",        // Numeric rating (e.g., 1-5, 1-10)
  "multiple_choice", // Select one option
  "checkboxes"     // Select multiple options
]);

export type SurveyQuestionType = z.infer<typeof SurveyQuestionTypeEnum>;

// Base question schema
const BaseSurveyQuestionSchema = z.object({
  id: z.string(), // Unique identifier for the question (UUID or short ID)
  type: SurveyQuestionTypeEnum,
  question: z.string().min(1, "Question text is required"),
  description: z.string().optional(), // Optional helper text
  required: z.boolean().default(true),
  order: z.number().int().min(0), // Display order
});

// Text question (short answer)
const TextQuestionSchema = BaseSurveyQuestionSchema.extend({
  type: z.literal("text"),
  placeholder: z.string().optional(),
  maxLength: z.number().int().positive().optional(),
});

// Textarea question (long answer)
const TextareaQuestionSchema = BaseSurveyQuestionSchema.extend({
  type: z.literal("textarea"),
  placeholder: z.string().optional(),
  maxLength: z.number().int().positive().optional(),
  rows: z.number().int().min(2).max(20).default(4),
});

// Rating question
const RatingQuestionSchema = BaseSurveyQuestionSchema.extend({
  type: z.literal("rating"),
  minValue: z.number().int().default(1),
  maxValue: z.number().int().default(5),
  minLabel: z.string().optional(), // Label for minimum value (e.g., "Poor")
  maxLabel: z.string().optional(), // Label for maximum value (e.g., "Excellent")
});

// Multiple choice question (single select)
const MultipleChoiceQuestionSchema = BaseSurveyQuestionSchema.extend({
  type: z.literal("multiple_choice"),
  options: z.array(z.object({
    id: z.string(), // Option ID
    label: z.string().min(1, "Option label is required"),
  })).min(2, "At least 2 options required"),
  allowOther: z.boolean().default(false), // Allow "Other" with text input
});

// Checkboxes question (multi-select)
const CheckboxesQuestionSchema = BaseSurveyQuestionSchema.extend({
  type: z.literal("checkboxes"),
  options: z.array(z.object({
    id: z.string(),
    label: z.string().min(1, "Option label is required"),
  })).min(2, "At least 2 options required"),
  allowOther: z.boolean().default(false),
  minSelections: z.number().int().min(0).optional(),
  maxSelections: z.number().int().positive().optional(),
});

// Union of all question types
export const SurveyQuestionSchema = z.discriminatedUnion("type", [
  TextQuestionSchema,
  TextareaQuestionSchema,
  RatingQuestionSchema,
  MultipleChoiceQuestionSchema,
  CheckboxesQuestionSchema,
]);

export type SurveyQuestion = z.infer<typeof SurveyQuestionSchema>;
export type TextQuestion = z.infer<typeof TextQuestionSchema>;
export type TextareaQuestion = z.infer<typeof TextareaQuestionSchema>;
export type RatingQuestion = z.infer<typeof RatingQuestionSchema>;
export type MultipleChoiceQuestion = z.infer<typeof MultipleChoiceQuestionSchema>;
export type CheckboxesQuestion = z.infer<typeof CheckboxesQuestionSchema>;

// ============================================================================
// SURVEY ANSWER TYPES
// ============================================================================

const TextAnswerSchema = z.object({
  questionId: z.string(),
  type: z.literal("text"),
  value: z.string(),
});

const TextareaAnswerSchema = z.object({
  questionId: z.string(),
  type: z.literal("textarea"),
  value: z.string(),
});

const RatingAnswerSchema = z.object({
  questionId: z.string(),
  type: z.literal("rating"),
  value: z.number().int(),
});

const MultipleChoiceAnswerSchema = z.object({
  questionId: z.string(),
  type: z.literal("multiple_choice"),
  selectedOptionId: z.string(),
  otherValue: z.string().optional(), // If "Other" is selected
});

const CheckboxesAnswerSchema = z.object({
  questionId: z.string(),
  type: z.literal("checkboxes"),
  selectedOptionIds: z.array(z.string()),
  otherValue: z.string().optional(),
});

export const SurveyAnswerSchema = z.discriminatedUnion("type", [
  TextAnswerSchema,
  TextareaAnswerSchema,
  RatingAnswerSchema,
  MultipleChoiceAnswerSchema,
  CheckboxesAnswerSchema,
]);

export type SurveyAnswer = z.infer<typeof SurveyAnswerSchema>;

// ============================================================================
// SURVEY TEMPLATE TYPES
// ============================================================================

export const SurveyTemplateSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Survey name is required").max(200),
  description: z.string().max(1000).optional(),
  projectId: z.string().uuid().nullable().optional(),
  createdBy: z.string().uuid().nullable().optional(),
  questions: z.array(SurveyQuestionSchema).min(1, "At least one question is required"),
  isActive: z.boolean().default(true),
  isDeleted: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type SurveyTemplateInput = z.infer<typeof SurveyTemplateSchema>;

// Create template input (for forms)
export const CreateSurveyTemplateSchema = SurveyTemplateSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isDeleted: true,
});

export type CreateSurveyTemplateInput = z.infer<typeof CreateSurveyTemplateSchema>;

// Update template input
export const UpdateSurveyTemplateSchema = CreateSurveyTemplateSchema.partial().extend({
  id: z.string().uuid(),
});

export type UpdateSurveyTemplateInput = z.infer<typeof UpdateSurveyTemplateSchema>;

// ============================================================================
// SURVEY INSTANCE TYPES
// ============================================================================

export const SurveyTargetAudienceEnum = z.enum([
  "submitters",           // Users who submitted for this round
  "signups",             // Users who signed up for this round
  "all_project_members"  // All users with any activity in the project
]);

export type SurveyTargetAudience = z.infer<typeof SurveyTargetAudienceEnum>;

export const SurveyInstanceStatusEnum = z.enum([
  "scheduled",  // Not yet active
  "active",     // Currently available to users
  "completed",  // Finished (manual or automatic)
  "cancelled"   // Cancelled by admin
]);

export type SurveyInstanceStatus = z.infer<typeof SurveyInstanceStatusEnum>;

export const SurveyInstanceSchema = z.object({
  id: z.string().uuid().optional(),
  templateId: z.string().uuid(),
  roundId: z.number().int().positive(),
  projectId: z.string().uuid(),
  status: SurveyInstanceStatusEnum.default("scheduled"),
  targetAudience: SurveyTargetAudienceEnum,
  triggerDate: z.date(),
  expiresAt: z.date().nullable().optional(),
  notificationsSent: z.boolean().default(false),
  notificationsSentAt: z.date().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type SurveyInstanceInput = z.infer<typeof SurveyInstanceSchema>;

// Create instance input
export const CreateSurveyInstanceSchema = SurveyInstanceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  notificationsSent: true,
  notificationsSentAt: true,
});

export type CreateSurveyInstanceInput = z.infer<typeof CreateSurveyInstanceSchema>;

// Update instance input
export const UpdateSurveyInstanceSchema = SurveyInstanceSchema.partial().extend({
  id: z.string().uuid(),
});

export type UpdateSurveyInstanceInput = z.infer<typeof UpdateSurveyInstanceSchema>;

// ============================================================================
// SURVEY RESPONSE TYPES
// ============================================================================

export const SurveyResponseSchema = z.object({
  id: z.string().uuid().optional(),
  instanceId: z.string().uuid(),
  userId: z.string().uuid(),
  roundId: z.number().int().positive(),
  answers: z.array(SurveyAnswerSchema),
  isComplete: z.boolean().default(false),
  startedAt: z.date().optional(),
  submittedAt: z.date().nullable().optional(),
  updatedAt: z.date().optional(),
});

export type SurveyResponseInput = z.infer<typeof SurveyResponseSchema>;

// Save response input (for partial saves and final submission)
export const SaveSurveyResponseSchema = z.object({
  instanceId: z.string().uuid(),
  userId: z.string().uuid(),
  roundId: z.number().int().positive(),
  answers: z.array(SurveyAnswerSchema),
  isComplete: z.boolean(),
});

export type SaveSurveyResponseInput = z.infer<typeof SaveSurveyResponseSchema>;

// ============================================================================
// HELPER TYPES FOR API RESPONSES
// ============================================================================

// Survey template with full details
export type SurveyTemplateWithDetails = SurveyTemplateInput & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  projectId: string | null;
};

// Survey instance with template and round info
export type SurveyInstanceWithDetails = SurveyInstanceInput & {
  id: string;
  template: SurveyTemplateWithDetails;
  round?: {
    id: number;
    slug: string | null;
    listeningParty: Date | null;
  };
};

// Survey response with user info
export type SurveyResponseWithUser = SurveyResponseInput & {
  id: string;
  user: {
    userid: string;
    username: string;
    publicDisplayName: string | null;
    profilePictureUrl: string | null;
  };
};

// Analytics aggregation types
export type SurveyAnalytics = {
  totalResponses: number;
  completeResponses: number;
  partialResponses: number;
  responseRate: number; // Percentage
  questionAnalytics: QuestionAnalytics[];
};

export type QuestionAnalytics = {
  questionId: string;
  question: string;
  type: SurveyQuestionType;
  totalAnswers: number;
  // Type-specific analytics
  textAnswers?: string[]; // For text/textarea
  ratingStats?: {
    average: number;
    median: number;
    distribution: Record<number, number>; // value -> count
  };
  optionStats?: {
    optionId: string;
    label: string;
    count: number;
    percentage: number;
  }[];
  otherAnswers?: string[]; // For "Other" responses
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

// Validate that answers match template questions
export function validateAnswersAgainstTemplate(
  answers: SurveyAnswer[],
  questions: SurveyQuestion[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const questionMap = new Map(questions.map(q => [q.id, q]));
  const answeredQuestionIds = new Set(answers.map(a => a.questionId));

  // Check required questions are answered
  for (const question of questions) {
    if (question.required && !answeredQuestionIds.has(question.id)) {
      errors.push(`Required question "${question.question}" is not answered`);
    }
  }

  // Validate each answer
  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) {
      errors.push(`Answer provided for unknown question ID: ${answer.questionId}`);
      continue;
    }

    // Type mismatch check
    if (answer.type !== question.type) {
      errors.push(
        `Answer type "${answer.type}" does not match question type "${question.type}" for question: ${question.question}`
      );
      continue;
    }

    // Type-specific validation
    switch (question.type) {
      case "rating": {
        const ratingAnswer = answer as z.infer<typeof RatingAnswerSchema>;
        const ratingQuestion = question as RatingQuestion;
        if (
          ratingAnswer.value < ratingQuestion.minValue ||
          ratingAnswer.value > ratingQuestion.maxValue
        ) {
          errors.push(
            `Rating value ${ratingAnswer.value} is out of range [${ratingQuestion.minValue}, ${ratingQuestion.maxValue}] for question: ${question.question}`
          );
        }
        break;
      }

      case "multiple_choice": {
        const mcAnswer = answer as z.infer<typeof MultipleChoiceAnswerSchema>;
        const mcQuestion = question as MultipleChoiceQuestion;
        const validOptionIds = new Set(mcQuestion.options.map(o => o.id));
        if (!validOptionIds.has(mcAnswer.selectedOptionId) && !mcQuestion.allowOther) {
          errors.push(
            `Invalid option ID "${mcAnswer.selectedOptionId}" for question: ${question.question}`
          );
        }
        break;
      }

      case "checkboxes": {
        const cbAnswer = answer as z.infer<typeof CheckboxesAnswerSchema>;
        const cbQuestion = question as CheckboxesQuestion;
        const validOptionIds = new Set(cbQuestion.options.map(o => o.id));

        for (const optionId of cbAnswer.selectedOptionIds) {
          if (!validOptionIds.has(optionId)) {
            errors.push(
              `Invalid option ID "${optionId}" for question: ${question.question}`
            );
          }
        }

        if (cbQuestion.minSelections && cbAnswer.selectedOptionIds.length < cbQuestion.minSelections) {
          errors.push(
            `At least ${cbQuestion.minSelections} options must be selected for question: ${question.question}`
          );
        }

        if (cbQuestion.maxSelections && cbAnswer.selectedOptionIds.length > cbQuestion.maxSelections) {
          errors.push(
            `At most ${cbQuestion.maxSelections} options can be selected for question: ${question.question}`
          );
        }
        break;
      }

      case "text":
      case "textarea": {
        const textAnswer = answer as z.infer<typeof TextAnswerSchema | typeof TextareaAnswerSchema>;
        const textQuestion = question as TextQuestion | TextareaQuestion;
        if (textQuestion.maxLength && textAnswer.value.length > textQuestion.maxLength) {
          errors.push(
            `Answer exceeds maximum length of ${textQuestion.maxLength} for question: ${question.question}`
          );
        }
        break;
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
