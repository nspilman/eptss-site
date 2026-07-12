# Multi-Project Platform Migration Plan

**Project:** EPTSS Website - Cover Project → Multi-Project Platform
**Goal:** Support multiple project types (Cover Songs + Original Songs) with independent timelines and simultaneous user participation
**Date:** December 6, 2025

---

## Executive Summary

Transform the EPTSS platform from a single-project system (Cover Project) to a multi-project platform supporting both Cover Songs and Original Songs projects. Users will be able to participate in both projects simultaneously, each with independent timelines. The system will maintain shared user infrastructure (profiles, permissions, notifications) while providing composable workflows that allow each project to enable/disable phases as needed.

### Key Requirements (from user consultation)
- ✅ Users can participate in both projects simultaneously
- ✅ Independent timelines per project
- ✅ Shared: user profiles, referral codes, mailing list, notifications, admin permissions
- ✅ Composable workflows: Original project starts without voting, but can add it later
- ✅ Admin sets prompts for Original project; users submit creations

---

## Current State Analysis

### Database Schema
- **ORM:** Drizzle ORM with PostgreSQL
- **39+ migrations** already in place
- **Core tables:** `roundMetadata`, `signUps`, `submissions`, `songSelectionVotes`, `userContent`, `notifications`, `emailRemindersSent`
- **Current assumption:** All data belongs to one implicit "Cover Project"
- **No project scoping:** All queries filter by `roundId` only

### Terminology
- **"Cover"** is used throughout as both:
  - The product users create (verb: "submit your cover")
  - The phase name ("Covering Phase")
- **Phase system:** 4 phases (Sign Up → Vote → Cover → Listen)
- **Hardcoded references:** Found in UI labels, email templates, notification types, phase names

### Key Files Requiring Changes
- **Database schema:** `packages/data-access/src/db/schema.ts`
- **Round service:** `packages/data-access/src/services/roundService.ts`
- **Participation services:** `signupService.ts`, `submissionService.ts`, `votesService.ts`
- **Phase UI:** `PhaseStatusPanel.tsx`, `ActionPanelWrapper.tsx`, `SubmitPage.tsx`
- **Cron jobs:** `assign-round-song`, `create-future-rounds`, `send-reminder-emails`
- **Email templates:** `CoveringOneMonthLeft.tsx`, `CoveringHalfway.tsx`, etc.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     User Layer (Shared)                      │
│  - Profile, Bio, Social Links                                │
│  - Privacy Settings, Email Preferences                       │
│  - Notifications (combined feed with project filters)        │
│  - Referral Codes, Mailing List                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Project Layer (NEW)                       │
│  - Project Config (workflow, phases, terminology)            │
│  - Independent Timelines                                     │
│  - Composable Features                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
┌───────────────────────────┐ ┌───────────────────────────┐
│   Cover Project           │ │   Original Songs Project  │
├───────────────────────────┤ ├───────────────────────────┤
│ Workflow:                 │ │ Workflow:                 │
│ • Sign up ✓               │ │ • Sign up ✗               │
│ • Vote ✓                  │ │ • Vote ✗                  │
│ • Create (cover) ✓        │ │ • Create (original) ✓     │
│ • Celebrate ✓             │ │ • Celebrate ✓             │
├───────────────────────────┤ ├───────────────────────────┤
│ Schedule: Quarterly       │ │ Schedule: Monthly         │
│ Rounds: Song selection    │ │ Rounds: Admin sets prompt │
└───────────────────────────┘ └───────────────────────────┘
```

---

## Phase 1: Database Schema & Data Model

### 1.1 Create Projects Table

**New table: `projects`**

```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL, -- 'cover', 'original', etc.
  config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_is_active ON projects(is_active);
```

**Project Config Schema (JSONB):**

```json
{
  "workflow": {
    "signups_enabled": true,
    "voting_enabled": true,
    "creation_enabled": true,
    "celebration_enabled": true
  },
  "terminology": {
    "creation_phase_name": "Covering",
    "submission_cta": "Submit Cover",
    "submission_noun": "cover",
    "submission_field_label": "SoundCloud URL"
  },
  "scheduling": {
    "cadence": "quarterly",
    "custom_schedule": null
  },
  "submission_requirements": {
    "soundcloud_url": { "required": true, "label": "SoundCloud URL" },
    "additional_comments": { "required": false, "label": "Cool Things Learned" }
  },
  "email_templates": {
    "creation_reminder_days": [30, 14, 7, 1]
  }
}
```

### 1.2 Add `projectId` Foreign Key to Tables

**Tables requiring `projectId` column:**

```sql
-- Core round table
ALTER TABLE round_metadata
  ADD COLUMN project_id UUID REFERENCES projects(id);

-- Participation tables
ALTER TABLE sign_ups
  ADD COLUMN project_id UUID REFERENCES projects(id);

ALTER TABLE submissions
  ADD COLUMN project_id UUID REFERENCES projects(id);

ALTER TABLE song_selection_votes
  ADD COLUMN project_id UUID REFERENCES projects(id);

-- Round-specific tables
ALTER TABLE round_voting_candidate_overrides
  ADD COLUMN project_id UUID REFERENCES projects(id);

-- User content
ALTER TABLE user_content
  ADD COLUMN project_id UUID REFERENCES projects(id);

-- Email tracking
ALTER TABLE email_reminders_sent
  ADD COLUMN project_id UUID REFERENCES projects(id);
```

**Create composite indexes:**

```sql
CREATE INDEX idx_round_metadata_project_slug ON round_metadata(project_id, slug);
CREATE INDEX idx_sign_ups_project_round ON sign_ups(project_id, round_id);
CREATE INDEX idx_submissions_project_round ON submissions(project_id, round_id);
CREATE INDEX idx_votes_project_round ON song_selection_votes(project_id, round_id);
CREATE INDEX idx_user_content_project ON user_content(project_id, user_id);
```

### 1.3 Update Drizzle Schema

**File:** `packages/data-access/src/db/schema.ts`

```typescript
// Add projects table
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  type: varchar('type', { length: 50 }).notNull(),
  config: jsonb('config').notNull().default('{}'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// Update existing tables - example for roundMetadata
export const roundMetadata = pgTable('round_metadata', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id').references(() => projects.id).notNull(), // NEW
  slug: varchar('slug', { length: 255 }),
  playlistUrl: varchar('playlistUrl'),
  songId: uuid('songId').references(() => songs.id),
  // ... existing fields
});

// Similar updates for signUps, submissions, songSelectionVotes, etc.
```

### 1.4 Data Migration Strategy

**Migration file:** `packages/data-access/src/db/migrations/0040_add_projects.sql`

```sql
-- Step 1: Create projects table
CREATE TABLE projects ( ... );

-- Step 2: Seed Cover project
INSERT INTO projects (id, name, slug, type, config, is_active)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- Fixed UUID for cover project
  'EPTSS Cover Project',
  'cover',
  'cover',
  '{
    "workflow": {"signups_enabled": true, "voting_enabled": true, "creation_enabled": true, "celebration_enabled": true},
    "terminology": {"creation_phase_name": "Covering", "submission_cta": "Submit Cover", "submission_noun": "cover"},
    "scheduling": {"cadence": "quarterly"}
  }',
  true
);

-- Step 3: Add projectId columns (nullable initially)
ALTER TABLE round_metadata ADD COLUMN project_id UUID REFERENCES projects(id);
ALTER TABLE sign_ups ADD COLUMN project_id UUID REFERENCES projects(id);
-- ... repeat for all tables

-- Step 4: Backfill existing data with Cover project ID
UPDATE round_metadata SET project_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
UPDATE sign_ups SET project_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
UPDATE submissions SET project_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
-- ... repeat for all tables

-- Step 5: Add NOT NULL constraints
ALTER TABLE round_metadata ALTER COLUMN project_id SET NOT NULL;
ALTER TABLE sign_ups ALTER COLUMN project_id SET NOT NULL;
-- ... repeat for all tables

-- Step 6: Create indexes
CREATE INDEX idx_round_metadata_project_slug ON round_metadata(project_id, slug);
-- ... all indexes from section 1.2
```

### 1.5 Seed Original Songs Project

**Migration file:** `packages/data-access/src/db/migrations/0041_seed_original_project.sql`

```sql
INSERT INTO projects (id, name, slug, type, config, is_active)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', -- Fixed UUID for original project
  'Original Songs Project',
  'originals',
  'original',
  '{
    "workflow": {"signups_enabled": false, "voting_enabled": false, "creation_enabled": true, "celebration_enabled": true},
    "terminology": {"creation_phase_name": "Creating", "submission_cta": "Submit Original", "submission_noun": "original song"},
    "scheduling": {"cadence": "monthly"}
  }',
  true
);
```

---

## Phase 2: Core Business Logic Updates

### 2.1 Project Service Layer (NEW)

**File:** `packages/data-access/src/services/projectService.ts`

```typescript
import { db } from '../db';
import { projects } from '../db/schema';
import { eq } from 'drizzle-orm';

export type ProjectConfig = {
  workflow: {
    signups_enabled: boolean;
    voting_enabled: boolean;
    creation_enabled: boolean;
    celebration_enabled: boolean;
  };
  terminology: {
    creation_phase_name: string;
    submission_cta: string;
    submission_noun: string;
  };
  scheduling: {
    cadence: 'quarterly' | 'monthly' | 'custom';
    custom_schedule?: string;
  };
  submission_requirements: Record<string, { required: boolean; label: string }>;
  email_templates: {
    creation_reminder_days: number[];
  };
};

export type Project = {
  id: string;
  name: string;
  slug: string;
  type: string;
  config: ProjectConfig;
  isActive: boolean;
};

/**
 * Get all active projects
 */
export async function getActiveProjects(): Promise<Project[]> {
  return await db
    .select()
    .from(projects)
    .where(eq(projects.isActive, true));
}

/**
 * Get project by slug
 */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, slug))
    .limit(1);

  return result[0] || null;
}

/**
 * Get project configuration
 */
export async function getProjectConfig(projectId: string): Promise<ProjectConfig> {
  const project = await db
    .select({ config: projects.config })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  return project[0]?.config as ProjectConfig;
}

/**
 * Validate if a workflow phase is enabled for a project
 */
export async function isPhaseEnabled(
  projectId: string,
  phase: 'signups' | 'voting' | 'creation' | 'celebration'
): Promise<boolean> {
  const config = await getProjectConfig(projectId);
  return config.workflow[`${phase}_enabled`] || false;
}

/**
 * Get enabled phases for a project
 */
export async function getEnabledPhases(projectId: string): Promise<string[]> {
  const config = await getProjectConfig(projectId);
  const enabledPhases: string[] = [];

  if (config.workflow.signups_enabled) enabledPhases.push('signups');
  if (config.workflow.voting_enabled) enabledPhases.push('voting');
  if (config.workflow.creation_enabled) enabledPhases.push('creation');
  if (config.workflow.celebration_enabled) enabledPhases.push('celebration');

  return enabledPhases;
}
```

### 2.2 Round Service Updates

**File:** `packages/data-access/src/services/roundService.ts`

**Before:**
```typescript
export async function getCurrentRound() {
  return await db
    .select()
    .from(roundMetadata)
    .where(/* date filters */)
    .limit(1);
}
```

**After:**
```typescript
export async function getCurrentRound(projectId: string) {
  return await db
    .select()
    .from(roundMetadata)
    .where(
      and(
        eq(roundMetadata.projectId, projectId),
        /* existing date filters */
      )
    )
    .limit(1);
}

export async function getRoundBySlug(projectId: string, roundSlug: string) {
  return await db
    .select()
    .from(roundMetadata)
    .where(
      and(
        eq(roundMetadata.projectId, projectId),
        eq(roundMetadata.slug, roundSlug)
      )
    )
    .limit(1);
}

export async function getRoundsByProject(projectId: string) {
  return await db
    .select()
    .from(roundMetadata)
    .where(eq(roundMetadata.projectId, projectId))
    .orderBy(desc(roundMetadata.createdAt));
}
```

### 2.3 Round Provider Updates

**File:** `packages/data-access/src/providers/roundProvider/roundProvider.ts`

**Before:**
```typescript
export const roundProvider = async (slug?: string) => {
  const round = slug
    ? await getRoundBySlug(slug)
    : await getCurrentRound();
  // ...
};
```

**After:**
```typescript
export const roundProvider = async (params: {
  projectSlug: string;
  roundSlug?: string;
}) => {
  const { projectSlug, roundSlug } = params;

  // Get project
  const project = await getProjectBySlug(projectSlug);
  if (!project) {
    throw new Error(`Project not found: ${projectSlug}`);
  }

  // Get round
  const round = roundSlug
    ? await getRoundBySlug(project.id, roundSlug)
    : await getCurrentRound(project.id);

  if (!round) {
    return null;
  }

  // Add project config to response
  return {
    ...round,
    project,
    projectConfig: project.config,
  };
};
```

### 2.4 Participation Services Updates

**File:** `packages/data-access/src/services/signupService.ts`

```typescript
// Add projectId to all queries
export async function getSignupsByRound(projectId: string, roundId: string) {
  return await db
    .select()
    .from(signUps)
    .where(
      and(
        eq(signUps.projectId, projectId),
        eq(signUps.roundId, roundId)
      )
    );
}

export async function getUserSignupForRound(
  userId: string,
  projectId: string,
  roundId: string
) {
  return await db
    .select()
    .from(signUps)
    .where(
      and(
        eq(signUps.userId, userId),
        eq(signUps.projectId, projectId),
        eq(signUps.roundId, roundId)
      )
    )
    .limit(1);
}

// Validate project workflow before signup
export async function signupWithOTP(data: SignupData) {
  const { projectId, roundId, userId, ...rest } = data;

  // Check if signups are enabled for this project
  const signupsEnabled = await isPhaseEnabled(projectId, 'signups');
  if (!signupsEnabled) {
    throw new Error('Signups are not enabled for this project');
  }

  // Create signup
  return await db.insert(signUps).values({
    projectId,
    roundId,
    userId,
    ...rest,
  });
}
```

**File:** `packages/data-access/src/services/submissionService.ts`

```typescript
export async function getSubmissions(projectId: string, roundId: string) {
  return await db
    .select()
    .from(submissions)
    .where(
      and(
        eq(submissions.projectId, projectId),
        eq(submissions.roundId, roundId)
      )
    );
}

export async function submitCover(data: SubmissionData) {
  const { projectId, roundId, userId, ...rest } = data;

  // Validate user is signed up for this project/round
  const signup = await getUserSignupForRound(userId, projectId, roundId);
  if (!signup) {
    throw new Error('You must be signed up for this round to submit');
  }

  // Create submission
  return await db.insert(submissions).values({
    projectId,
    roundId,
    userId,
    ...rest,
  });
}
```

**File:** `packages/data-access/src/services/votesService.ts`

```typescript
export async function getVoteResults(projectId: string, roundId: string) {
  // Check if voting is enabled
  const votingEnabled = await isPhaseEnabled(projectId, 'voting');
  if (!votingEnabled) {
    return { enabled: false, results: [] };
  }

  return await db
    .select()
    .from(songSelectionVotes)
    .where(
      and(
        eq(songSelectionVotes.projectId, projectId),
        eq(songSelectionVotes.roundId, roundId)
      )
    );
}
```

### 2.5 Workflow Composability System

**File:** `packages/data-access/src/services/workflowService.ts`

```typescript
import { getProjectConfig } from './projectService';

export type Phase = 'signups' | 'voting' | 'creation' | 'celebration';

export type PhaseConfig = {
  enabled: boolean;
  displayName: string;
  progressLabel: string;
  icon: string;
};

/**
 * Get phase configuration for display
 */
export async function getPhaseDisplayConfig(
  projectId: string,
  phase: Phase
): Promise<PhaseConfig> {
  const config = await getProjectConfig(projectId);
  const enabled = config.workflow[`${phase}_enabled`];

  // Map phases to display configs
  const displayConfigs: Record<Phase, Omit<PhaseConfig, 'enabled'>> = {
    signups: {
      displayName: 'Signups',
      progressLabel: 'Sign Up',
      icon: '✍️',
    },
    voting: {
      displayName: 'Voting',
      progressLabel: 'Vote',
      icon: '🗳️',
    },
    creation: {
      displayName: config.terminology.creation_phase_name,
      progressLabel: config.terminology.creation_phase_name.split(' ')[0], // "Covering" → "Cover"
      icon: '⏰',
    },
    celebration: {
      displayName: 'Celebration',
      progressLabel: 'Listen',
      icon: '🎉',
    },
  };

  return {
    enabled,
    ...displayConfigs[phase],
  };
}

/**
 * Get all enabled phases with their configs
 */
export async function getWorkflowPhases(projectId: string): Promise<PhaseConfig[]> {
  const phases: Phase[] = ['signups', 'voting', 'creation', 'celebration'];
  const configs = await Promise.all(
    phases.map(phase => getPhaseDisplayConfig(projectId, phase))
  );

  return configs.filter(config => config.enabled);
}
```

---

## Phase 3: API Routes & Middleware

### 3.1 Project Context Middleware

**File:** `apps/web/lib/middleware/projectContext.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getProjectBySlug } from '@eptss/data-access/services/projectService';

export async function withProjectContext(
  request: NextRequest,
  handler: (req: NextRequest, context: { project: Project }) => Promise<Response>
) {
  // Extract project slug from URL
  // Pattern: /api/projects/{slug}/... or /projects/{slug}/...
  const urlParts = request.nextUrl.pathname.split('/');
  const projectsIndex = urlParts.indexOf('projects');

  if (projectsIndex === -1 || projectsIndex + 1 >= urlParts.length) {
    // Backwards compatibility: default to Cover project
    const project = await getProjectBySlug('cover');
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    return handler(request, { project });
  }

  const projectSlug = urlParts[projectsIndex + 1];
  const project = await getProjectBySlug(projectSlug);

  if (!project || !project.isActive) {
    return NextResponse.json(
      { error: 'Project not found or inactive' },
      { status: 404 }
    );
  }

  return handler(request, { project });
}
```

### 3.2 Update API Routes

**Example: Current Round API**

**File:** `apps/web/app/api/projects/[slug]/round/current/route.ts` (NEW)

```typescript
import { NextRequest } from 'next/server';
import { withProjectContext } from '@/lib/middleware/projectContext';
import { getCurrentRound } from '@eptss/data-access/services/roundService';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  return withProjectContext(request, async (req, { project }) => {
    const round = await getCurrentRound(project.id);

    return Response.json({
      round,
      project: {
        id: project.id,
        name: project.name,
        slug: project.slug,
      },
    });
  });
}
```

**Backwards Compatibility Route:**

**File:** `apps/web/app/api/round/current/route.ts` (EXISTING - UPDATE)

```typescript
import { NextRequest } from 'next/server';
import { getProjectBySlug } from '@eptss/data-access/services/projectService';
import { getCurrentRound } from '@eptss/data-access/services/roundService';

export async function GET(request: NextRequest) {
  // Default to Cover project for backwards compat
  const project = await getProjectBySlug('cover');

  if (!project) {
    return Response.json({ error: 'Project not found' }, { status: 404 });
  }

  const round = await getCurrentRound(project.id);

  // Add deprecation warning
  return Response.json(
    {
      round,
      project: { id: project.id, name: project.name, slug: project.slug },
      _deprecated: 'This endpoint is deprecated. Use /api/projects/{slug}/round/current instead.',
    },
    {
      headers: {
        'X-Deprecation-Warning': 'Use /api/projects/{slug}/round/current',
      },
    }
  );
}
```

### 3.3 Route Migration Map

| Old Route (Deprecated) | New Route | Notes |
|------------------------|-----------|-------|
| `/api/round/current` | `/api/projects/{slug}/round/current` | Defaults to 'cover' |
| `/api/rounds` | `/api/projects/{slug}/rounds` | List rounds by project |
| `/api/round-info` | `/api/projects/{slug}/round-info` | Round details |
| `/api/submit` | `/api/projects/{slug}/submit` | Project-scoped submission |
| `/api/voting` | `/api/projects/{slug}/voting` | Project-scoped voting |

### 3.4 Cron Jobs - Multi-Project Support

**File:** `apps/web/app/api/cron/assign-round-song/route.ts`

**Before:**
```typescript
export async function GET() {
  const round = await getCurrentRound();
  // Process single round
}
```

**After:**
```typescript
export async function GET() {
  const projects = await getActiveProjects();
  const results = [];

  for (const project of projects) {
    try {
      // Check if voting is enabled for this project
      const votingEnabled = await isPhaseEnabled(project.id, 'voting');
      if (!votingEnabled) {
        results.push({
          projectId: project.id,
          skipped: true,
          reason: 'Voting not enabled',
        });
        continue;
      }

      const round = await getCurrentRound(project.id);
      if (!round) {
        results.push({
          projectId: project.id,
          skipped: true,
          reason: 'No current round',
        });
        continue;
      }

      // Process vote tallying and song assignment
      const result = await assignWinningSong(project.id, round.id);
      results.push({
        projectId: project.id,
        success: true,
        result,
      });
    } catch (error) {
      // Error in one project doesn't break others
      results.push({
        projectId: project.id,
        success: false,
        error: error.message,
      });
    }
  }

  return Response.json({ results });
}
```

**File:** `apps/web/app/api/cron/create-future-rounds/route.ts`

```typescript
export async function GET() {
  const projects = await getActiveProjects();
  const results = [];

  for (const project of projects) {
    try {
      const config = await getProjectConfig(project.id);

      // Get project-specific scheduling
      let roundsToCreate;
      switch (config.scheduling.cadence) {
        case 'quarterly':
          roundsToCreate = getNextQuarterlyRounds(project.id);
          break;
        case 'monthly':
          roundsToCreate = getNextMonthlyRounds(project.id);
          break;
        case 'custom':
          roundsToCreate = getCustomScheduleRounds(project.id, config.scheduling.custom_schedule);
          break;
      }

      // Create rounds for this project
      const created = await createRounds(project.id, roundsToCreate);
      results.push({
        projectId: project.id,
        success: true,
        created: created.length,
      });
    } catch (error) {
      results.push({
        projectId: project.id,
        success: false,
        error: error.message,
      });
    }
  }

  return Response.json({ results });
}
```

**File:** `apps/web/app/api/cron/send-reminder-emails/route.ts`

```typescript
export async function GET() {
  const projects = await getActiveProjects();
  const results = [];

  for (const project of projects) {
    try {
      const round = await getCurrentRound(project.id);
      if (!round) continue;

      const config = await getProjectConfig(project.id);
      const reminderDays = config.email_templates.creation_reminder_days;

      // Send reminders based on project config
      const sent = await sendProjectReminders(project, round, reminderDays);
      results.push({
        projectId: project.id,
        success: true,
        emailsSent: sent,
      });
    } catch (error) {
      results.push({
        projectId: project.id,
        success: false,
        error: error.message,
      });
    }
  }

  return Response.json({ results });
}
```

---

## Phase 4: Frontend/UI Experience

### 4.1 Project Switcher & Navigation

**File:** `apps/web/components/ProjectSwitcher.tsx` (NEW)

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function ProjectSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentProject, setCurrentProject] = useState<string>('cover');

  useEffect(() => {
    // Extract project from URL
    const match = pathname.match(/\/projects\/([^\/]+)/);
    if (match) {
      setCurrentProject(match[1]);
    } else {
      // Save preference
      const saved = localStorage.getItem('preferredProject') || 'cover';
      setCurrentProject(saved);
    }
  }, [pathname]);

  const handleProjectChange = (projectSlug: string) => {
    // Save preference
    localStorage.setItem('preferredProject', projectSlug);
    setCurrentProject(projectSlug);

    // Navigate to project dashboard
    router.push(`/projects/${projectSlug}/dashboard`);
  };

  return (
    <div className="project-switcher">
      <select
        value={currentProject}
        onChange={(e) => handleProjectChange(e.target.value)}
        className="project-select"
      >
        <option value="cover">Cover Project</option>
        <option value="originals">Original Songs</option>
      </select>
    </div>
  );
}
```

**File:** `apps/web/components/Navigation.tsx` (UPDATE)

```tsx
import { ProjectSwitcher } from './ProjectSwitcher';

export function Navigation() {
  return (
    <nav>
      <Logo />
      <ProjectSwitcher />
      <NavLinks />
      <UserMenu />
    </nav>
  );
}
```

### 4.2 URL Structure

**New route patterns:**

```
Public routes:
/                                    - Homepage (shows all projects)
/projects/cover                      - Cover project landing
/projects/originals                  - Original Songs landing
/faq                                 - General FAQ

Project-specific routes:
/projects/{slug}/rounds              - All rounds for project
/projects/{slug}/round/{roundSlug}   - Round details
/projects/{slug}/submit              - Submit form
/projects/{slug}/voting              - Voting page (if enabled)

Shared authenticated routes:
/dashboard                           - Multi-project dashboard
/profile                             - User profile (shared)
/profile/activity                    - Activity with project filters
/profile/settings                    - Settings (shared)

Admin routes:
/admin                               - Admin home
/admin/projects                      - Manage project configs
/admin/rounds?project={slug}         - Manage rounds (filtered)
/admin/users                         - User management
```

**File structure:**

```
apps/web/app/
├── projects/
│   └── [projectSlug]/
│       ├── layout.tsx               # Project-aware layout
│       ├── page.tsx                 # Project landing
│       ├── rounds/
│       │   └── page.tsx
│       ├── round/
│       │   └── [roundSlug]/
│       │       └── page.tsx
│       ├── submit/
│       │   └── page.tsx
│       └── voting/
│           └── page.tsx
├── dashboard/
│   └── page.tsx                     # Multi-project dashboard
└── profile/
    ├── page.tsx
    └── activity/
        └── page.tsx
```

### 4.3 Project-Aware Layout

**File:** `apps/web/app/projects/[projectSlug]/layout.tsx`

```tsx
import { getProjectBySlug } from '@eptss/data-access/services/projectService';
import { notFound } from 'next/navigation';

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { projectSlug: string };
}) {
  const project = await getProjectBySlug(params.projectSlug);

  if (!project || !project.isActive) {
    notFound();
  }

  return (
    <div className="project-layout" data-project={project.slug}>
      <ProjectBreadcrumb project={project} />
      {children}
    </div>
  );
}
```

### 4.4 Phase Status Panel - Dynamic Phases

**File:** `packages/dashboard/src/panels/PhaseStatusPanel.tsx`

**Before:**
```tsx
const phases = [
  { id: 'signups', label: 'Sign Up' },
  { id: 'voting', label: 'Vote' },
  { id: 'covering', label: 'Cover' },
  { id: 'celebration', label: 'Listen' },
];
```

**After:**
```tsx
import { getWorkflowPhases } from '@eptss/data-access/services/workflowService';

export async function PhaseStatusPanel({ projectId, currentPhase }: Props) {
  const phases = await getWorkflowPhases(projectId);

  return (
    <div className="phase-status">
      {phases.map((phase, index) => (
        <PhaseStep
          key={phase.progressLabel}
          label={phase.progressLabel}
          icon={phase.icon}
          active={currentPhase === phase.progressLabel.toLowerCase()}
          completed={index < phases.findIndex(p => p.progressLabel.toLowerCase() === currentPhase)}
        />
      ))}
    </div>
  );
}
```

### 4.5 Submit Page - Dynamic Terminology

**File:** `apps/web/app/projects/[projectSlug]/submit/page.tsx`

**Before:**
```tsx
<h1>Submit your cover of {song.title} by {song.artist}</h1>
<button>Submit Cover</button>
```

**After:**
```tsx
import { getProjectConfig } from '@eptss/data-access/services/projectService';

export default async function SubmitPage({ params }: { params: { projectSlug: string } }) {
  const project = await getProjectBySlug(params.projectSlug);
  const config = project.config;
  const round = await getCurrentRound(project.id);

  return (
    <div>
      <h1>
        {config.terminology.submission_cta}
        {round.song && ` of ${round.song.title} by ${round.song.artist}`}
      </h1>

      <SubmitForm
        projectId={project.id}
        roundId={round.id}
        submitButtonText={config.terminology.submission_cta}
        fieldLabel={config.submission_requirements.soundcloud_url.label}
      />
    </div>
  );
}
```

### 4.6 Multi-Project Dashboard

**File:** `apps/web/app/dashboard/page.tsx`

```tsx
import { getActiveProjects } from '@eptss/data-access/services/projectService';
import { getCurrentRound } from '@eptss/data-access/services/roundService';
import { getUserParticipationStatus } from '@eptss/data-access/services/userService';

export default async function Dashboard() {
  const projects = await getActiveProjects();
  const user = await getCurrentUser();

  return (
    <div className="dashboard">
      <h1>Your Dashboard</h1>

      <div className="project-cards">
        {projects.map(async (project) => {
          const round = await getCurrentRound(project.id);
          const participation = await getUserParticipationStatus(user.id, project.id, round?.id);

          return (
            <ProjectCard
              key={project.id}
              project={project}
              round={round}
              participation={participation}
            />
          );
        })}
      </div>

      <RecentActivity userId={user.id} />
    </div>
  );
}
```

**Component:** `ProjectCard.tsx`

```tsx
export function ProjectCard({ project, round, participation }: Props) {
  const config = project.config;

  return (
    <div className="project-card">
      <h2>{project.name}</h2>

      {round ? (
        <>
          <h3>Round {round.slug}</h3>

          <PhaseStatusPanel
            projectId={project.id}
            currentPhase={round.currentPhase}
          />

          <div className="participation-status">
            {participation.signedUp && <Badge>✓ Signed Up</Badge>}
            {participation.voted && <Badge>✓ Voted</Badge>}
            {participation.submitted && <Badge>✓ Submitted</Badge>}
          </div>

          <TimeRemaining deadline={round.nextDeadline} />

          <PrimaryActionButton
            projectSlug={project.slug}
            roundId={round.id}
            phase={round.currentPhase}
            participation={participation}
            terminology={config.terminology}
          />
        </>
      ) : (
        <p>No active round</p>
      )}

      <Link href={`/projects/${project.slug}/rounds`}>
        View All Rounds →
      </Link>
    </div>
  );
}
```

### 4.7 Voting Page - Conditional Rendering

**File:** `apps/web/app/projects/[projectSlug]/voting/page.tsx`

```tsx
import { isPhaseEnabled } from '@eptss/data-access/services/projectService';

export default async function VotingPage({ params }: { params: { projectSlug: string } }) {
  const project = await getProjectBySlug(params.projectSlug);
  const votingEnabled = await isPhaseEnabled(project.id, 'voting');

  if (!votingEnabled) {
    return (
      <div>
        <h1>Voting Not Available</h1>
        <p>This project does not use a voting system.</p>
        <Link href={`/projects/${project.slug}/rounds`}>
          View Rounds →
        </Link>
      </div>
    );
  }

  // Render voting interface
  return <VotingInterface projectId={project.id} />;
}
```

---

## Phase 5: User Experience - Shared Infrastructure

### 5.1 Unified Notifications

**File:** `packages/data-access/src/services/notificationService.ts`

**Update notification creation to include project metadata:**

```typescript
export async function createNotification(data: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  projectId?: string; // NEW - optional for backwards compat
  metadata?: Record<string, any>;
}) {
  const { projectId, ...rest } = data;

  // Add project info to metadata
  const metadata = { ...rest.metadata };
  if (projectId) {
    const project = await getProjectBySlug(projectId);
    metadata.projectId = projectId;
    metadata.projectName = project?.name;
    metadata.projectSlug = project?.slug;
  }

  return await db.insert(notifications).values({
    ...rest,
    metadata,
  });
}
```

**File:** `apps/web/components/NotificationCenter.tsx`

```tsx
'use client';

import { useState } from 'react';

export function NotificationCenter({ userId }: Props) {
  const [filter, setFilter] = useState<'all' | 'cover' | 'originals'>('all');
  const notifications = useNotifications(userId);

  const filtered = notifications.filter(notif => {
    if (filter === 'all') return true;
    return notif.metadata?.projectSlug === filter;
  });

  return (
    <div className="notification-center">
      <div className="notification-header">
        <h3>Notifications</h3>
        <FilterDropdown value={filter} onChange={setFilter}>
          <option value="all">All Projects</option>
          <option value="cover">Cover Project</option>
          <option value="originals">Original Songs</option>
        </FilterDropdown>
      </div>

      <NotificationList notifications={filtered} />
    </div>
  );
}
```

### 5.2 Email Preferences (Shared)

**File:** `apps/web/app/profile/settings/email-preferences/page.tsx`

```tsx
export default function EmailPreferences() {
  return (
    <form>
      <h2>Email Preferences</h2>

      <div className="preference-section">
        <h3>Notification Emails</h3>
        <Checkbox name="notificationsEnabled">
          Send me notification digest emails
        </Checkbox>
      </div>

      <div className="preference-section">
        <h3>Project Updates</h3>
        <p>Choose which projects you want to receive emails about:</p>

        <Checkbox name="coverProjectEmails">
          Cover Project Updates
        </Checkbox>

        <Checkbox name="originalsProjectEmails">
          Original Songs Updates
        </Checkbox>
      </div>

      <div className="preference-section">
        <h3>Reminder Emails</h3>
        <Checkbox name="reminderEmails">
          Send me deadline reminders
        </Checkbox>

        <Select name="reminderFrequency">
          <option value="all">All reminders</option>
          <option value="important">Important only</option>
          <option value="none">No reminders</option>
        </Select>
      </div>

      <SaveButton />
    </form>
  );
}
```

**Update schema:**

```sql
ALTER TABLE user_privacy_settings
  ADD COLUMN email_preferences JSONB DEFAULT '{
    "notificationsEnabled": true,
    "projects": {
      "cover": true,
      "originals": true
    },
    "reminderEmails": true,
    "reminderFrequency": "all"
  }';
```

### 5.3 Profile Activity (Filtered by Project)

**File:** `apps/web/app/profile/activity/page.tsx`

```tsx
'use client';

import { useState } from 'react';
import { Tabs } from '@/components/Tabs';

export default function ActivityPage() {
  const [activeTab, setActiveTab] = useState('all');
  const user = useCurrentUser();

  return (
    <div>
      <h1>Your Activity</h1>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tab value="all">All Projects</Tab>
        <Tab value="cover">Cover Project</Tab>
        <Tab value="originals">Original Songs</Tab>
      </Tabs>

      <ActivityFeed userId={user.id} projectFilter={activeTab} />

      <div className="activity-stats">
        <h2>Stats</h2>
        <StatCard
          title="Total Submissions"
          value={user.stats.totalSubmissions}
          breakdown={[
            { label: 'Covers', value: user.stats.coverSubmissions },
            { label: 'Originals', value: user.stats.originalSubmissions },
          ]}
        />
      </div>
    </div>
  );
}
```

### 5.4 Shared Referral System

**No changes needed** - referrals remain project-agnostic, referring users to the platform as a whole.

**File:** `apps/web/app/profile/referrals/page.tsx`

```tsx
// Existing referral page works as-is
// Referred users can choose which project to join after signing up
```

---

## Phase 6: Admin Experience

### 6.1 Admin Dashboard Structure

**File:** `apps/web/app/admin/page.tsx`

```tsx
import { getActiveProjects } from '@eptss/data-access/services/projectService';

export default async function AdminDashboard() {
  const projects = await getActiveProjects();

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="admin-nav">
        <Link href="/admin/projects">Manage Projects</Link>
        <Link href="/admin/rounds">Manage Rounds</Link>
        <Link href="/admin/users">Manage Users</Link>
        <Link href="/admin/notifications">Send Notifications</Link>
      </div>

      <div className="project-overview">
        {projects.map(project => (
          <ProjectOverviewCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
```

### 6.2 Project Configuration UI (NEW)

**File:** `apps/web/app/admin/projects/page.tsx`

```tsx
export default async function ProjectsAdmin() {
  const projects = await getActiveProjects();

  return (
    <div>
      <h1>Manage Projects</h1>

      <div className="projects-list">
        {projects.map(project => (
          <ProjectConfigCard key={project.id} project={project} />
        ))}
      </div>

      <CreateProjectButton />
    </div>
  );
}
```

**File:** `apps/web/app/admin/projects/[id]/edit/page.tsx`

```tsx
import { getProjectById } from '@eptss/data-access/services/projectService';

export default async function EditProject({ params }: { params: { id: string } }) {
  const project = await getProjectById(params.id);

  return (
    <form action="/api/admin/projects/update">
      <input type="hidden" name="projectId" value={project.id} />

      <h1>Edit Project: {project.name}</h1>

      <Section title="Basic Info">
        <Input label="Name" name="name" defaultValue={project.name} />
        <Input label="Slug" name="slug" defaultValue={project.slug} />
        <Input label="Type" name="type" defaultValue={project.type} />
      </Section>

      <Section title="Workflow Configuration">
        <h3>Enable/Disable Phases</h3>
        <Checkbox
          name="workflow.signups_enabled"
          defaultChecked={project.config.workflow.signups_enabled}
        >
          Signups Phase
        </Checkbox>

        <Checkbox
          name="workflow.voting_enabled"
          defaultChecked={project.config.workflow.voting_enabled}
        >
          Voting Phase
        </Checkbox>

        <Checkbox
          name="workflow.creation_enabled"
          defaultChecked={project.config.workflow.creation_enabled}
        >
          Creation Phase
        </Checkbox>

        <Checkbox
          name="workflow.celebration_enabled"
          defaultChecked={project.config.workflow.celebration_enabled}
        >
          Celebration Phase
        </Checkbox>
      </Section>

      <Section title="Terminology">
        <Input
          label="Creation Phase Name"
          name="terminology.creation_phase_name"
          defaultValue={project.config.terminology.creation_phase_name}
          helperText="e.g., 'Covering', 'Creating', 'Recording'"
        />

        <Input
          label="Submission CTA"
          name="terminology.submission_cta"
          defaultValue={project.config.terminology.submission_cta}
          helperText="e.g., 'Submit Cover', 'Submit Original'"
        />

        <Input
          label="Submission Noun"
          name="terminology.submission_noun"
          defaultValue={project.config.terminology.submission_noun}
          helperText="e.g., 'cover', 'original song'"
        />
      </Section>

      <Section title="Scheduling">
        <Select
          label="Cadence"
          name="scheduling.cadence"
          defaultValue={project.config.scheduling.cadence}
        >
          <option value="quarterly">Quarterly</option>
          <option value="monthly">Monthly</option>
          <option value="custom">Custom</option>
        </Select>

        {/* Show custom schedule input if cadence === 'custom' */}
      </Section>

      <Section title="Email Reminders">
        <p>Days before deadline to send reminders (comma-separated):</p>
        <Input
          name="email_templates.creation_reminder_days"
          defaultValue={project.config.email_templates.creation_reminder_days.join(', ')}
          placeholder="30, 14, 7, 1"
        />
      </Section>

      <SaveButton />
    </form>
  );
}
```

### 6.3 Round Management (Project-Filtered)

**File:** `apps/web/app/admin/rounds/page.tsx`

```tsx
'use client';

import { useSearchParams } from 'next/navigation';

export default function RoundsAdmin() {
  const searchParams = useSearchParams();
  const projectFilter = searchParams.get('project') || 'all';

  return (
    <div>
      <h1>Manage Rounds</h1>

      <FilterBar>
        <Select value={projectFilter} onChange={handleFilterChange}>
          <option value="all">All Projects</option>
          <option value="cover">Cover Project</option>
          <option value="originals">Original Songs</option>
        </Select>
      </FilterBar>

      <RoundsTable projectFilter={projectFilter} />

      <CreateRoundButton />
    </div>
  );
}
```

**File:** `apps/web/app/admin/rounds/create/page.tsx`

```tsx
export default function CreateRound() {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [projectConfig, setProjectConfig] = useState<ProjectConfig | null>(null);

  const handleProjectChange = async (projectId: string) => {
    setSelectedProject(projectId);
    const config = await fetchProjectConfig(projectId);
    setProjectConfig(config);
  };

  return (
    <form action="/api/admin/rounds/create">
      <h1>Create New Round</h1>

      <Select
        label="Project"
        name="projectId"
        value={selectedProject}
        onChange={handleProjectChange}
        required
      >
        <option value="">Select a project...</option>
        <option value="cover-project-id">Cover Project</option>
        <option value="originals-project-id">Original Songs</option>
      </Select>

      {projectConfig && (
        <>
          <Input label="Slug" name="slug" required />

          <DatePicker
            label="Signups Open"
            name="signupOpens"
            disabled={!projectConfig.workflow.signups_enabled}
          />

          <DatePicker
            label="Voting Opens"
            name="votingOpens"
            disabled={!projectConfig.workflow.voting_enabled}
          />

          <DatePicker
            label={`${projectConfig.terminology.creation_phase_name} Begins`}
            name="creationBegins"
            required
          />

          <DatePicker
            label={`${projectConfig.terminology.submission_noun}s Due`}
            name="creationDue"
            required
          />

          <DatePicker
            label="Listening Party"
            name="listeningParty"
            required
          />

          {projectConfig.workflow.voting_enabled ? (
            <SongSelectionField />
          ) : (
            <TextArea
              label="Prompt/Theme"
              name="prompt"
              helperText="Describe the theme or prompt for this round"
            />
          )}
        </>
      )}

      <CreateButton />
    </form>
  );
}
```

### 6.4 Shared Admin Permissions

**No schema changes needed** - existing `admin_level` in `users` table works globally.

Admins can manage all projects from a single dashboard with project filters.

---

## Phase 7: Email & Notification Templates

### 7.1 Project-Aware Email Templates

**Base template structure:**

**File:** `packages/email/src/templates/base/PhaseReminderBase.tsx`

```tsx
import { ProjectConfig } from '@eptss/data-access/services/projectService';

type Props = {
  userName: string;
  roundSlug: string;
  deadline: Date;
  projectName: string;
  projectConfig: ProjectConfig;
  daysRemaining: number;
};

export function PhaseReminderBase({
  userName,
  roundSlug,
  deadline,
  projectName,
  projectConfig,
  daysRemaining,
}: Props) {
  const submissionNoun = projectConfig.terminology.submission_noun;
  const phaseName = projectConfig.terminology.creation_phase_name;

  return (
    <EmailLayout>
      <Header projectName={projectName} />

      <h1>Your {submissionNoun} is due in {daysRemaining} days!</h1>

      <p>Hi {userName},</p>

      <p>
        This is a friendly reminder that the {phaseNoun} phase for Round {roundSlug}
        ends on {formatDate(deadline)}.
      </p>

      <p>
        Don't forget to submit your {submissionNoun} before the deadline!
      </p>

      <CallToAction
        href={`/projects/${projectConfig.slug}/submit`}
        text={projectConfig.terminology.submission_cta}
      />

      <Footer />
    </EmailLayout>
  );
}
```

**Project-specific customization:**

**File:** `packages/email/src/templates/CoverProjectReminder.tsx`

```tsx
import { PhaseReminderBase } from './base/PhaseReminderBase';

export function CoverProjectReminder(props: Props) {
  return (
    <PhaseReminderBase {...props}>
      {/* Cover-specific content */}
      <AdditionalSection>
        <h3>Tips for a great cover:</h3>
        <ul>
          <li>Put your own spin on it</li>
          <li>Have fun with the arrangement</li>
          <li>Don't worry about perfection</li>
        </ul>
      </AdditionalSection>
    </PhaseReminderBase>
  );
}
```

**File:** `packages/email/src/templates/OriginalsProjectReminder.tsx`

```tsx
import { PhaseReminderBase } from './base/PhaseReminderBase';

export function OriginalsProjectReminder(props: Props) {
  return (
    <PhaseReminderBase {...props}>
      {/* Originals-specific content */}
      <AdditionalSection>
        <h3>Remember the prompt:</h3>
        <blockquote>{props.round.prompt}</blockquote>

        <h3>Tips for your original:</h3>
        <ul>
          <li>Let the prompt inspire, not limit you</li>
          <li>Experiment with new sounds</li>
          <li>Share your creative process</li>
        </ul>
      </AdditionalSection>
    </PhaseReminderBase>
  );
}
```

### 7.2 Email Sending Service Update

**File:** `packages/email/src/services/emailService.ts`

```typescript
import { getProjectConfig } from '@eptss/data-access/services/projectService';
import { CoverProjectReminder } from '../templates/CoverProjectReminder';
import { OriginalsProjectReminder } from '../templates/OriginalsProjectReminder';

export async function sendPhaseReminder(params: {
  userId: string;
  projectId: string;
  roundId: string;
  daysRemaining: number;
}) {
  const { userId, projectId, roundId, daysRemaining } = params;

  const user = await getUser(userId);
  const project = await getProjectById(projectId);
  const round = await getRoundById(roundId);
  const config = await getProjectConfig(projectId);

  // Check user email preferences
  const preferences = user.privacySettings.email_preferences;
  if (!preferences.projects[project.slug]) {
    return; // User opted out of emails for this project
  }

  // Select template based on project type
  let EmailTemplate;
  switch (project.type) {
    case 'cover':
      EmailTemplate = CoverProjectReminder;
      break;
    case 'original':
      EmailTemplate = OriginalsProjectReminder;
      break;
    default:
      EmailTemplate = PhaseReminderBase;
  }

  // Send email
  await sendEmail({
    to: user.email,
    subject: `${project.name} - ${config.terminology.submission_noun} due in ${daysRemaining} days`,
    template: (
      <EmailTemplate
        userName={user.username}
        roundSlug={round.slug}
        deadline={round.creationDue}
        projectName={project.name}
        projectConfig={config}
        daysRemaining={daysRemaining}
      />
    ),
  });

  // Record sent email
  await recordEmailSent({
    userId,
    projectId,
    roundId,
    emailType: `creation_reminder_${daysRemaining}d`,
  });
}
```

### 7.3 Notification Creation Updates

**File:** `packages/data-access/src/services/notificationService.ts`

```typescript
export async function notifyPhaseBegins(params: {
  userId: string;
  projectId: string;
  roundId: string;
  phase: string;
}) {
  const { userId, projectId, roundId, phase } = params;

  const project = await getProjectById(projectId);
  const round = await getRoundById(roundId);
  const config = await getProjectConfig(projectId);

  // Get phase display name
  const phaseConfig = await getPhaseDisplayConfig(projectId, phase);

  await createNotification({
    userId,
    projectId,
    type: 'round_phase_begins',
    title: `${project.name} - ${phaseConfig.displayName} Phase Begins`,
    message: `Round ${round.slug} ${phaseConfig.displayName.toLowerCase()} phase has started!`,
    metadata: {
      roundId,
      phase,
      projectSlug: project.slug,
    },
  });
}
```

---

## Phase 8: Testing & Migration

### 8.1 Database Migration Execution Plan

**Step-by-step migration:**

1. **Backup database**
   ```bash
   pg_dump eptss_db > backup_pre_multiproject_$(date +%Y%m%d).sql
   ```

2. **Run migration 0040 (add projects table + columns)**
   ```bash
   npm run db:migrate
   ```

3. **Verify migration success**
   ```bash
   npm run db:verify
   ```

4. **Seed projects**
   ```bash
   npm run db:seed:projects
   ```

5. **Run migration 0041 (create Original Songs project)**
   ```bash
   npm run db:migrate
   ```

6. **Verify data integrity**
   ```sql
   -- Check all records have projectId
   SELECT COUNT(*) FROM round_metadata WHERE project_id IS NULL;
   SELECT COUNT(*) FROM sign_ups WHERE project_id IS NULL;
   -- Should return 0 for all
   ```

### 8.2 Testing Strategy

**Unit Tests:**

```typescript
// packages/data-access/src/services/__tests__/roundService.test.ts

describe('roundService with multi-project support', () => {
  it('should get current round for specific project', async () => {
    const coverProject = await getProjectBySlug('cover');
    const round = await getCurrentRound(coverProject.id);

    expect(round).toBeDefined();
    expect(round.projectId).toBe(coverProject.id);
  });

  it('should not return rounds from other projects', async () => {
    const coverProject = await getProjectBySlug('cover');
    const originalsProject = await getProjectBySlug('originals');

    const coverRound = await getCurrentRound(coverProject.id);
    const originalsRound = await getCurrentRound(originalsProject.id);

    expect(coverRound?.id).not.toBe(originalsRound?.id);
  });

  it('should filter signups by project and round', async () => {
    const signups = await getSignupsByRound(projectId, roundId);

    signups.forEach(signup => {
      expect(signup.projectId).toBe(projectId);
      expect(signup.roundId).toBe(roundId);
    });
  });
});
```

**Integration Tests:**

```typescript
// apps/web/__tests__/integration/multiproject.test.ts

describe('Multi-Project User Flow', () => {
  it('should allow user to participate in both projects simultaneously', async () => {
    const user = await createTestUser();

    // Sign up for Cover project
    await signUpForRound({
      userId: user.id,
      projectId: coverProjectId,
      roundId: coverRoundId,
    });

    // Sign up for Originals project
    await signUpForRound({
      userId: user.id,
      projectId: originalsProjectId,
      roundId: originalsRoundId,
    });

    // Verify both signups exist
    const coverSignup = await getUserSignupForRound(user.id, coverProjectId, coverRoundId);
    const originalsSignup = await getUserSignupForRound(user.id, originalsProjectId, originalsRoundId);

    expect(coverSignup).toBeDefined();
    expect(originalsSignup).toBeDefined();
  });

  it('should show correct workflow phases per project', async () => {
    const coverPhases = await getEnabledPhases(coverProjectId);
    const originalsPhases = await getEnabledPhases(originalsProjectId);

    expect(coverPhases).toContain('voting');
    expect(originalsPhases).not.toContain('voting');
  });
});
```

**E2E Tests:**

```typescript
// apps/web/__tests__/e2e/project-navigation.test.ts

describe('Project Navigation', () => {
  it('should switch between projects using project switcher', async () => {
    await page.goto('/dashboard');

    // Should default to Cover project
    expect(page.url()).toContain('/projects/cover');

    // Switch to Originals
    await page.selectOption('[data-testid="project-switcher"]', 'originals');

    // Should navigate to Originals project
    await page.waitForURL(/\/projects\/originals/);
    expect(page.url()).toContain('/projects/originals');
  });

  it('should show different submit forms per project', async () => {
    // Cover project submit page
    await page.goto('/projects/cover/submit');
    expect(await page.textContent('h1')).toContain('Submit Cover');

    // Originals project submit page
    await page.goto('/projects/originals/submit');
    expect(await page.textContent('h1')).toContain('Submit Original');
  });
});
```

### 8.3 Feature Flag Implementation

**File:** `apps/web/lib/featureFlags.ts`

```typescript
export const FeatureFlags = {
  MULTI_PROJECT: process.env.NEXT_PUBLIC_ENABLE_MULTI_PROJECT === 'true',
} as const;

export function isFeatureEnabled(flag: keyof typeof FeatureFlags): boolean {
  return FeatureFlags[flag];
}
```

**Usage in components:**

```tsx
import { isFeatureEnabled } from '@/lib/featureFlags';

export function Navigation() {
  const showProjectSwitcher = isFeatureEnabled('MULTI_PROJECT');

  return (
    <nav>
      <Logo />
      {showProjectSwitcher && <ProjectSwitcher />}
      <NavLinks />
    </nav>
  );
}
```

### 8.4 Rollout Plan

**Phase 1: Internal Testing (Week 1)**
- Deploy to staging with `ENABLE_MULTI_PROJECT=true`
- Admin team tests all functionality
- Fix critical bugs

**Phase 2: Admin-Only (Week 2)**
- Deploy to production with feature flag OFF
- Enable for admin users only
- Create first Original Songs round manually
- Test round lifecycle

**Phase 3: Beta Users (Week 3)**
- Invite 10-20 beta users
- Collect feedback
- Monitor error rates and performance

**Phase 4: Full Rollout (Week 4)**
- Enable feature flag for all users
- Send announcement email
- Monitor support requests

**Phase 5: Deprecation (Week 12)**
- Remove backwards-compatible routes
- Clean up feature flags
- Update documentation

---

## Phase 9: Content & Communication

### 9.1 User Announcement Email

**File:** `packages/email/src/templates/MultiProjectAnnouncement.tsx`

```tsx
export function MultiProjectAnnouncement({ userName }: Props) {
  return (
    <EmailLayout>
      <h1>Exciting News: Introducing Original Songs Project!</h1>

      <p>Hi {userName},</p>

      <p>
        We're thrilled to announce a new way to participate in EPTSS:
        the <strong>Original Songs Project</strong>!
      </p>

      <h2>What's New?</h2>

      <ul>
        <li>
          <strong>Cover Project</strong> - Our beloved quarterly rounds where
          we all cover the same song (unchanged!)
        </li>
        <li>
          <strong>Original Songs Project</strong> - NEW monthly rounds where
          you create original music based on a theme or prompt
        </li>
      </ul>

      <h2>Can I participate in both?</h2>

      <p>
        Absolutely! You can participate in both projects simultaneously.
        Your dashboard will show both projects and your progress in each.
      </p>

      <h2>How do I get started?</h2>

      <ol>
        <li>Log in to your dashboard</li>
        <li>Use the project switcher to browse both projects</li>
        <li>Sign up for the rounds you want to join</li>
      </ol>

      <CallToAction
        href="/dashboard"
        text="Explore the New Projects"
      />

      <p>
        We can't wait to hear what you create!
      </p>

      <p>
        - The EPTSS Team
      </p>
    </EmailLayout>
  );
}
```

### 9.2 FAQ Updates

**File:** `apps/web/content/faq.md`

Add new FAQ items:

```markdown
### Can I participate in both Cover and Original Songs projects?

Yes! You can participate in both projects simultaneously. Each project has
its own independent timeline and rounds.

### What's the difference between the projects?

**Cover Project:**
- Quarterly rounds
- Community votes on which song to cover
- Everyone records a version of the same song
- Focus on interpretation and arrangement

**Original Songs Project:**
- Monthly rounds
- Admin provides a theme or prompt
- You create an original song inspired by the prompt
- Focus on songwriting and composition

### Do I need separate accounts?

No! Your single EPTSS account works for both projects. Your profile, stats,
and activity history are shared across projects.

### Will notifications get overwhelming with two projects?

You're in control! In your email preferences, you can choose which projects
you want to receive notifications about.
```

### 9.3 Homepage Updates

**File:** `apps/web/app/index/Homepage/HomePage.tsx`

```tsx
export function HomePage() {
  return (
    <>
      <Hero />

      <ProjectsSection>
        <h2>Choose Your Musical Journey</h2>

        <ProjectCard
          title="Cover Project"
          description="Quarterly rounds where we all cover the same song"
          features={[
            'Vote on song selection',
            'Record your unique version',
            'Connect with fellow musicians',
          ]}
          cta="Explore Cover Project"
          href="/projects/cover"
        />

        <ProjectCard
          title="Original Songs"
          description="Monthly rounds to create original music from prompts"
          features={[
            'Monthly creative challenges',
            'Theme-based composition',
            'Showcase your songwriting',
          ]}
          cta="Explore Originals"
          href="/projects/originals"
        />
      </ProjectsSection>

      <HowItWorks />
      <Testimonials />
      <FAQ />
    </>
  );
}
```

---

## Migration Risks & Mitigations

### Risk 1: Breaking Changes for Existing Users

**Risk:** URL structure changes could break bookmarks and external links

**Mitigation:**
- Implement backwards-compatible routes that redirect to new structure
- Add permanent redirects (301) from old URLs to new URLs
- Maintain backwards compat for 6 months minimum
- Add deprecation warnings to old API endpoints

### Risk 2: Complex Dashboard Overwhelming Users

**Risk:** Showing multiple projects could confuse existing users

**Mitigation:**
- Default to Cover project for existing users
- Add onboarding tour explaining new features
- Use progressive disclosure (collapse non-active projects)
- A/B test different dashboard layouts

### Risk 3: Data Migration Errors

**Risk:** Backfilling projectId could fail or corrupt data

**Mitigation:**
- Run migration in transaction (can rollback if fails)
- Dry-run migration on staging first
- Keep database backup before migration
- Add validation queries to verify data integrity post-migration
- Test rollback procedure

### Risk 4: Cron Jobs Failing

**Risk:** One project's cron failure could break other projects

**Mitigation:**
- Wrap each project iteration in try/catch
- Log errors per project separately
- Continue processing other projects if one fails
- Add monitoring alerts for cron failures
- Manual override capability for admins

### Risk 5: Performance Degradation

**Risk:** Additional queries for projectId filtering could slow down app

**Mitigation:**
- Add composite indexes: (projectId, roundId), (projectId, userId)
- Monitor query performance with explain plans
- Add caching layer for project configs
- Load test with realistic multi-project data

### Risk 6: Email Spam with Two Projects

**Risk:** Users receive double the emails, leading to unsubscribes

**Mitigation:**
- Combine notifications into digest emails
- Add granular email preferences per project
- Default to "important only" for new projects
- Monitor unsubscribe rates closely

---

## Estimated Timeline

### Detailed Breakdown

**Phase 1: Database Schema & Data Model (2 weeks)**
- Week 1: Create migrations, test locally
- Week 2: Test on staging, dry-run backfill, execute production migration

**Phase 2: Core Business Logic (2 weeks)**
- Week 1: Project service, round service updates
- Week 2: Participation services, workflow composability

**Phase 3: API Routes & Middleware (1 week)**
- Update all API routes with project context
- Implement backwards compatibility
- Update cron jobs

**Phase 4: Frontend/UI (3 weeks)**
- Week 1: Project switcher, URL structure, layouts
- Week 2: Phase displays, dynamic terminology, submit pages
- Week 3: Multi-project dashboard, polish

**Phase 5: User Experience (1 week)**
- Notifications, email preferences, profile activity

**Phase 6: Admin Experience (1 week)**
- Admin dashboard, project config UI, round management

**Phase 7: Email & Notifications (1 week)**
- Template system, email service updates

**Phase 8: Testing & Migration (2 weeks)**
- Week 1: Unit tests, integration tests, E2E tests
- Week 2: Staging deployment, QA, bug fixes

**Phase 9: Content & Communication (1 week)**
- Announcement emails, FAQ updates, documentation

**Total: 14 weeks (3.5 months)**

### Fast-Track Option (MVP in 3 weeks)

For quicker time-to-value:

**Week 1:**
- Create projects table
- Add projectId to roundMetadata only
- Seed both projects

**Week 2:**
- Basic project switcher UI
- Update round queries with projectId
- Create first Original Songs round manually

**Week 3:**
- Simple dashboard showing both projects
- Basic email notifications
- Launch as beta

Then iterate on full implementation over following months.

---

## Success Metrics

**Technical Metrics:**
- Zero data loss during migration
- < 5% increase in API response times
- 99.9% cron job success rate
- < 1% error rate on project-filtered queries

**User Experience Metrics:**
- > 80% of existing users understand new project structure
- > 30% of users participate in both projects within first month
- < 5% increase in support requests
- Email unsubscribe rate remains < 2%

**Business Metrics:**
- Original Songs project achieves > 50 signups in first round
- > 70% submission rate for Original Songs rounds
- Retention rate remains stable or improves

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Prioritize features** - decide between full implementation or MVP
3. **Set timeline** - allocate development resources
4. **Create Jira/GitHub issues** from each phase
5. **Start Phase 1** - database schema design
6. **Schedule regular check-ins** to track progress

---

## Appendix: Key File Changes Summary

### Database
- `packages/data-access/src/db/schema.ts` - Add projects table, projectId columns
- `packages/data-access/src/db/migrations/0040_add_projects.sql` - Migration
- `packages/data-access/src/db/migrations/0041_seed_original_project.sql` - Seed

### Services
- `packages/data-access/src/services/projectService.ts` - NEW
- `packages/data-access/src/services/workflowService.ts` - NEW
- `packages/data-access/src/services/roundService.ts` - UPDATE
- `packages/data-access/src/services/signupService.ts` - UPDATE
- `packages/data-access/src/services/submissionService.ts` - UPDATE
- `packages/data-access/src/services/votesService.ts` - UPDATE
- `packages/data-access/src/services/notificationService.ts` - UPDATE

### API Routes
- `apps/web/app/api/projects/[slug]/*/route.ts` - NEW structure
- `apps/web/app/api/cron/*/route.ts` - UPDATE for multi-project
- `apps/web/lib/middleware/projectContext.ts` - NEW

### Frontend
- `apps/web/components/ProjectSwitcher.tsx` - NEW
- `apps/web/app/projects/[projectSlug]/layout.tsx` - NEW
- `apps/web/app/dashboard/page.tsx` - UPDATE
- `packages/dashboard/src/panels/PhaseStatusPanel.tsx` - UPDATE
- `apps/web/app/projects/[projectSlug]/submit/page.tsx` - UPDATE

### Email
- `packages/email/src/templates/base/PhaseReminderBase.tsx` - NEW
- `packages/email/src/services/emailService.ts` - UPDATE

### Admin
- `apps/web/app/admin/projects/page.tsx` - NEW
- `apps/web/app/admin/projects/[id]/edit/page.tsx` - NEW
- `apps/web/app/admin/rounds/page.tsx` - UPDATE

---

**End of Migration Plan**
