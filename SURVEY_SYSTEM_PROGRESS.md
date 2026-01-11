# Survey System Implementation Progress

## Overview
Building a comprehensive survey system for collecting feedback from end users at the end of rounds (or at configurable times). The system supports flexible question types, configurable targeting, and admin management.

---

## ✅ Completed (Backend Foundation - Phase 1)

### 1. Database Schema (`packages/data-access/src/db/schema.ts`)
**Added 3 new tables:**

#### `survey_templates`
- Stores reusable survey definitions
- Fields: id, name, description, projectId, createdBy, questions (JSONB), isActive, isDeleted, timestamps
- Supports project-specific or global templates
- Questions stored as flexible JSONB array

#### `survey_instances`
- Links surveys to specific rounds
- Fields: id, templateId, roundId, projectId, status, targetAudience, triggerDate, expiresAt, notificationsSent, timestamps
- Statuses: 'scheduled', 'active', 'completed', 'cancelled'
- Target audiences: 'submitters', 'signups', 'all_project_members'

#### `survey_responses`
- Stores user submissions with auto-save support
- Fields: id, instanceId, userId, roundId, answers (JSONB), isComplete, startedAt, submittedAt, updatedAt
- Unique constraint: one response per (instanceId, userId)
- Supports partial saves (draft mode)

**Enums Added:**
- `survey_target_audience`: submitters | signups | all_project_members
- `survey_instance_status`: scheduled | active | completed | cancelled
- `notification_type`: Added 'survey_available'

**Indexes Added:**
- Composite indexes for fast lookups (instance+user, round, project)
- Performance indexes for filtering and sorting

### 2. Database Migration (`migrations/0056_eager_silverclaw.sql`)
- ✅ **Migration generated using `bunx drizzle-kit generate`**
- ✅ **Migration applied using `bunx drizzle-kit migrate`**
- Creates all tables, enums, indexes, and constraints
- Handles cascade deletions appropriately
- Status: **APPLIED TO DATABASE**

### 3. TypeScript Types & Validation (`packages/data-access/src/types/survey.ts`)

**Question Types Supported:**
- **Text**: Short text input with optional maxLength
- **Textarea**: Long text input with configurable rows
- **Rating**: Numeric rating (1-5, 1-10, etc.) with optional labels
- **Multiple Choice**: Single selection with optional "Other" field
- **Checkboxes**: Multi-selection with min/max constraints and optional "Other"

**Zod Schemas:**
- `SurveyQuestionSchema`: Discriminated union for all question types
- `SurveyAnswerSchema`: Type-safe answer validation
- `SurveyTemplateSchema`: Template creation/update validation
- `SurveyInstanceSchema`: Instance creation/update validation
- `SurveyResponseSchema`: Response save/submit validation

**Helper Functions:**
- `validateAnswersAgainstTemplate()`: Validates user responses match template requirements

**Analytics Types:**
- `SurveyAnalytics`: Aggregated statistics
- `QuestionAnalytics`: Per-question breakdown with type-specific metrics

### 4. Services Layer

#### Survey Template Service (`services/surveyTemplateService.ts`)
**CRUD Operations:**
- `getAllSurveyTemplates()`: List with filters (project, active status, pagination)
- `getSurveyTemplateById()`: Get single template with creator info
- `getActiveSurveyTemplatesForProject()`: Get available templates for project (includes global)
- `createSurveyTemplate()`: Create new template with validation
- `updateSurveyTemplate()`: Update existing template
- `deleteSurveyTemplate()`: Soft delete
- `permanentlyDeleteSurveyTemplate()`: Hard delete (use with caution)
- `toggleSurveyTemplateStatus()`: Enable/disable template
- `duplicateSurveyTemplate()`: Clone template with new name
- `getSurveyTemplateStats()`: Usage statistics (instances, responses)

**Features:**
- XSS sanitization of text content
- Joins with users table for creator info
- Serializable outputs for client components
- Comprehensive error handling with AsyncResult pattern

#### Survey Instance Service (`services/surveyInstanceService.ts`)
**Core Operations:**
- `getAllSurveyInstances()`: List with filters (project, round, template, status)
- `getSurveyInstanceById()`: Get single instance with template & round info
- `getSurveyInstancesByRoundId()`: All surveys for a round
- `getSurveyInstancesNeedingNotifications()`: Surveys ready to trigger
- `createSurveyInstance()`: Create new instance
- `updateSurveyInstance()`: Update instance properties
- `markSurveyNotificationsSent()`: Mark notifications sent & activate
- `cancelSurveyInstance()`: Cancel survey
- `completeSurveyInstance()`: Mark survey completed
- `deleteSurveyInstance()`: Delete (cascades to responses)

**Targeting & Eligibility:**
- `getEligibleUsersForSurvey()`: Get all eligible users based on target audience
- `isUserEligibleForSurvey()`: Check if specific user is eligible
- `getSurveyInstanceStats()`: Response rates and completion statistics

**Smart Audience Targeting:**
- **Submitters**: Users who uploaded submissions for the round
- **Signups**: Users who signed up for the round
- **All Project Members**: Anyone with activity in the project

#### Survey Response Service (`services/surveyResponseService.ts`)
**Response Management:**
- `getSurveyResponseByInstanceAndUser()`: Get user's response to survey
- `getResponsesByInstanceId()`: All responses for a survey
- `getResponsesByUserId()`: User's response history
- `saveSurveyResponse()`: Save/update with auto-save support (partial or complete)
- `deleteSurveyResponse()`: Delete response

**Analytics & Reporting:**
- `getSurveyAnalytics()`: Comprehensive analytics with per-question breakdown
  - Text/textarea: All responses listed
  - Rating: Average, median, distribution
  - Multiple choice/checkboxes: Option counts and percentages
- `exportSurveyResponsesToCSV()`: Export all responses to CSV format

**Features:**
- XSS sanitization of all text inputs
- Answer validation against template questions
- Upsert logic (create or update existing response)
- Tracks `startedAt`, `submittedAt` timestamps
- Supports draft mode (`isComplete: false`)

---

## 🔄 In Progress / Next Steps

### Phase 2: Server Actions & API Routes ✅ **COMPLETE**
- [x] Created `packages/actions/src/surveyActions.ts` ✅
  - 22 server actions wrapping all service functions
  - Authorization checks (getUser() for authenticated actions)
  - Logging for all operations
  - Path revalidation after mutations
  - Consistent error handling with ActionResponse type

### Phase 3: Admin UI ✅ **COMPLETE (Core)**
- [x] Survey template list page (`/admin/surveys`) ✅
  - View all templates with status badges
  - Activate/deactivate templates
  - Duplicate templates
  - Delete templates (with confirmation)
- [x] Survey builder/editor (`/admin/surveys/new`) ✅
  - All 5 question types supported
  - Drag/reorder questions (up/down buttons)
  - Live preview mode
  - Add/remove options for multiple choice
  - Required/optional toggle
  - Type-specific settings (rating scales, text length, etc.)
- [ ] Survey analytics dashboard (`/admin/surveys/[id]/responses`) - TODO
  - Response charts and graphs
  - Export to CSV button
  - Filter by completion status
- [ ] Round settings integration - TODO
  - Attach survey to round
  - Configure trigger timing
  - Select target audience

### Phase 4: User-Facing UI ✅ **COMPLETE**
- [x] Survey taking page (`/surveys/[instanceId]`) ✅
  - Responsive form rendering for all question types
  - Auto-save draft every 30 seconds
  - Progress indicator (X of Y questions)
  - Validation for required questions
  - Error messages
  - Thank you page after submission
  - Check eligibility and completion status
- [ ] Dashboard integration - TODO
  - "Complete this survey" prompts
  - Survey completion status

### Phase 5: Automation & Notifications
- [ ] Cron job (`/api/cron/trigger-surveys/route.ts`)
  - Check for surveys past trigger date
  - Create notifications for eligible users
  - Send emails
  - Mark notifications as sent
- [ ] Email templates
  - Survey available email
  - Survey reminder email (optional)
- [ ] In-app notifications
  - "New survey available" notification
  - Dashboard banners

### Phase 6: Project Configuration
- [ ] Extend `/packages/project-config/src/schemas/projectConfig.ts`
  - `surveys.enabled: boolean`
  - `surveys.defaultTriggerDaysAfterListeningParty: number`
  - `surveys.defaultTargetAudience: string`
  - `surveys.defaultTemplateId: string | null`
- [ ] Admin UI for project survey settings

---

## 🗂️ File Structure Created

```
/packages/data-access/src/
  ├── db/
  │   ├── schema.ts (✅ Updated with survey tables)
  │   └── migrations/
  │       └── 0056_eager_silverclaw.sql (✅ Generated & Applied)
  ├── types/
  │   └── survey.ts (✅ Created - comprehensive types & validation)
  └── services/
      ├── surveyTemplateService.ts (✅ Created - 11 functions)
      ├── surveyInstanceService.ts (✅ Created - 13 functions)
      └── surveyResponseService.ts (✅ Created - 7 functions)

/packages/actions/src/
  ├── surveyActions.ts (✅ Created - 22 server actions)
  └── index.ts (✅ Updated to export survey actions)
```

---

## 🎯 Key Design Decisions

1. **JSONB Storage**: Questions and answers stored as JSONB for maximum flexibility
2. **Upsert Pattern**: Responses support partial saves (auto-save drafts)
3. **Soft Deletes**: Templates use soft delete (isDeleted flag)
4. **Cascade Deletes**: Instances and responses cascade on template/round deletion
5. **Unique Constraint**: One response per user per survey instance
6. **AsyncResult Pattern**: All services return `AsyncResult<T>` for consistent error handling
7. **XSS Protection**: All text inputs sanitized via existing `sanitizeHtml()` utility
8. **Target Audience Flexibility**: Project config can override per round
9. **Status Tracking**: Instances have lifecycle (scheduled → active → completed/cancelled)
10. **Notification Tracking**: Separate flag to track if notifications sent

---

## 📊 Analytics Capabilities

The system supports rich analytics out of the box:

- **Overall Metrics**: Total responses, completion rate, response rate
- **Text Questions**: All responses listed
- **Rating Questions**: Average, median, value distribution
- **Multiple Choice**: Option counts and percentages
- **Checkboxes**: Selected option counts and percentages
- **Other Responses**: Collected separately for qualitative analysis
- **CSV Export**: Full response export with all questions as columns

---

## 🔐 Security Features

- **XSS Protection**: All user text inputs sanitized
- **SQL Injection**: Protected via Drizzle ORM parameterized queries
- **Answer Validation**: Responses validated against template schema
- **Authorization**: (To be added in server actions layer)
- **Rate Limiting**: (To be added for response submissions)

---

## 🎨 Question Type Capabilities

| Type | Features |
|------|----------|
| **Text** | maxLength validation, placeholder |
| **Textarea** | maxLength, configurable rows, placeholder |
| **Rating** | Configurable min/max (e.g., 1-5, 1-10), optional labels |
| **Multiple Choice** | 2-20 options, optional "Other" with text input |
| **Checkboxes** | 2-20 options, min/max selections, optional "Other" |

All question types support:
- Required/optional flag
- Description (helper text)
- Sequential ordering

---

## 📝 Example Question JSON Structure

```json
{
  "id": "q1",
  "type": "rating",
  "question": "How would you rate your experience this round?",
  "description": "1 = Poor, 5 = Excellent",
  "required": true,
  "order": 0,
  "minValue": 1,
  "maxValue": 5,
  "minLabel": "Poor",
  "maxLabel": "Excellent"
}
```

---

## 🧪 Testing Checklist

- [x] Run migration: `0056_eager_silverclaw.sql` ✅ **COMPLETE**
- [ ] Test template CRUD operations
- [ ] Test instance creation and targeting
- [ ] Test response save/update (partial & complete)
- [ ] Test eligibility calculations
- [ ] Test analytics aggregation
- [ ] Test CSV export
- [ ] Test validation (required questions, answer formats)
- [ ] Test XSS sanitization
- [ ] Test cascade deletes

---

## 📦 Dependencies

**Existing packages used:**
- `drizzle-orm`: Database ORM
- `zod`: Schema validation
- `sanitizeHtml`: XSS protection (from `packages/data-access/src/utils/sanitize.ts`)
- `AsyncResult`: Error handling pattern (from `packages/data-access/src/types/asyncResult.ts`)

**No new external dependencies required for backend.**

---

## 🚀 Deployment Steps

1. **Database Migration** ✅ **COMPLETE**
   ```bash
   cd packages/data-access
   bunx drizzle-kit generate  # ✅ Done: Generated 0056_eager_silverclaw.sql
   bunx drizzle-kit migrate   # ✅ Done: Applied to database
   ```

2. **Type Generation** (if needed)
   ```bash
   # Regenerate Drizzle types if needed
   cd packages/data-access
   bunx drizzle-kit generate
   ```

3. **Test Services** (TODO)
   ```bash
   # Run service tests (to be created)
   bun test
   ```

4. **Build & Deploy** (when UI is ready)
   ```bash
   # Standard deployment process
   bun run build
   ```

---

## 💡 Future Enhancements (Post-MVP)

- [ ] **Survey Templates Library**: Pre-built common survey templates
- [ ] **Conditional Logic**: Skip/show questions based on previous answers
- [ ] **Piping**: Reference previous answers in question text
- [ ] **Randomization**: Randomize question/option order
- [ ] **Survey Themes**: Custom styling per project
- [ ] **Anonymous Surveys**: Option for anonymous responses
- [ ] **Response Quotas**: Auto-close after N responses
- [ ] **Survey Scheduling**: Recurring surveys (e.g., every round)
- [ ] **Advanced Analytics**: Sentiment analysis, word clouds
- [ ] **Integration**: Export to Google Sheets, Airtable, etc.

---

## 📞 Questions to Consider

1. **Permission Model**: Who can create/edit survey templates? (Admins only? Project leads?)
2. **Survey Expiration**: Should surveys auto-expire after X days?
3. **Response Editing**: Can users edit completed responses?
4. **Anonymous Option**: Should we support anonymous surveys?
5. **Notification Frequency**: Send reminders if not completed?
6. **Response Quotas**: Auto-close surveys after N responses?

---

## 🏁 Next Immediate Steps

1. **Apply Migration**: Run `0056_create_survey_system.sql` on database
2. **Create Server Actions**: Wrap services for client components
3. **Build Admin List Page**: Start with simple template listing
4. **Create Basic Survey Builder**: Simple form to create template
5. **Build Survey Taking Page**: Render questions and collect responses

---

## 📚 Related Documentation

- **Project Config**: `/packages/project-config/README.md`
- **Database Schema**: `/apps/web/schema.sql`
- **Notification System**: `/packages/data-access/src/services/notificationService.ts`
- **Email System**: `/packages/email/`

---

*Last Updated: 2025-01-10*
*Status: Backend foundation complete, ready for UI implementation*
