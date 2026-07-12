# Multi-Project User Experience Implementation Plan

## Overview

Now that we've completed the database work for multi-project support, it's time to extend the user experience to match. The goal is to create a clean, intuitive interface that lets users participate in multiple projects (Cover Project and Original Songs) while keeping each project's unique workflows clear and accessible.

## The Core Challenge

Right now, the application assumes everything is about the Cover Project. Routes like `/sign-up`, `/voting`, and `/submit` all implicitly work with covers. We need to make the project context explicit while keeping the experience simple and not overwhelming users with complexity they don't need.

## URL Structure: Making Projects Explicit

We're moving to a project-scoped URL pattern: `/project/[slug]/action`

For example:
- `/project/cover/sign-up` - Sign up for Cover Project
- `/project/original/sign-up` - Sign up for Original Songs Project
- `/project/cover/voting` - Vote on covers
- `/project/cover/round/42` - View Cover Project round 42

This achieves several things:
- **Clarity**: Users always know which project they're working with
- **Scalability**: Adding new projects in the future is straightforward
- **Flexibility**: Each project can have different features (Original Songs won't have voting, for instance)
- **Good SEO**: Clean, descriptive URLs that search engines understand

### Backwards Compatibility

We're not abandoning existing URLs. Old routes will redirect to the Cover Project to maintain backwards compatibility:
- `/sign-up` → `/project/cover/sign-up`
- `/voting` → `/project/cover/voting`
- `/submit` → `/project/cover/submit`

This protects existing bookmarks, external links, and user muscle memory while gradually moving everyone to the new structure.

## Dashboard Strategy: Hybrid Approach

After considering several options, we're recommending a hybrid dashboard system that adapts to the user's context.

### The Mental Model

Each project has its own dashboard because each project has distinct workflows:
- **Cover Project**: Sign up for rounds → Vote on song selections → Cover the chosen song → Listen at the party
- **Original Songs Project**: Sign up → Create an original song → Submit → Celebrate

Mixing these workflows in a single dashboard creates cognitive overhead and cluttered UI. Instead, we give each project its own dedicated space.

### How It Works

**For users in one project:**
They go directly to that project's dashboard when they visit the site. Clean and simple - no project selection needed.

**For users in multiple projects:**
They see a multi-project overview page that shows:
- A card for each project they're participating in
- Current round information for each project
- Quick links to the most relevant actions (vote, submit, etc.)
- Activity feed showing recent updates across all their projects

**For users in zero projects:**
They land on a project selection page that introduces both available projects and encourages them to join one (or both).

### Project-Scoped Dashboards

Each project gets its own dashboard at `/project/[slug]/dashboard` that shows:
- Current phase of the current round
- Relevant calls-to-action based on phase (sign up, vote, submit)
- Round timeline and important dates
- User's participation status
- Project-specific information and community content

The dashboard reuses the existing component structure we've built for Cover Project, but now it's explicitly project-aware.

## Navigation and Project Switching

### Header Navigation

The site header will include:
- Project indicator showing which project you're currently viewing
- Project switcher (dropdown or modal) to move between projects
- User menu and authentication controls

### Project Context in Layouts

We're using Next.js layouts to establish project context at the route level. When you're at any `/project/cover/*` route, the entire layout knows you're in the Cover Project context. This means:
- Navigation links automatically point to cover routes
- Project branding and colors can be applied
- Feature flags can show/hide project-specific functionality

## Page Migrations: Moving to Project-Scoped Routes

We need to migrate four main user-facing sections to the new structure:

### 1. Sign-Up Flow

**Old**: `/sign-up`
**New**: `/project/[slug]/sign-up`

The sign-up page needs to become project-aware. For Cover Project, it shows the upcoming round's song candidates and lets users vote. For Original Songs, it's simpler - just confirming participation in the upcoming round.

The page dynamically loads the round data for the specific project and renders the appropriate form.

### 2. Submission Flow

**Old**: `/submit`
**New**: `/project/[slug]/submit`

The submission form changes based on project:
- **Cover Project**: SoundCloud URL, reflections on what you learned, tools used, etc.
- **Original Songs**: SoundCloud URL, song details, creative process notes

The backend already has the projectId column, so it's ready to handle submissions for different projects.

### 3. Voting Flow

**Old**: `/voting`
**New**: `/project/[slug]/voting`

Voting only exists for Cover Project (Original Songs doesn't have voting). The new structure makes this clear:
- `/project/cover/voting` - exists and works
- `/project/original/voting` - shows a message explaining that Original Songs doesn't use voting

This is much clearer than trying to conditionally hide voting in a shared interface.

### 4. Round Details

**Old**: `/round/[slug]`
**New**: `/project/[slug]/round/[roundSlug]`

Round pages need to be project-scoped because each project has independent rounds. Round 42 for Cover Project is completely different from Round 42 for Original Songs.

The round detail page shows:
- Phase timeline and current status
- Song information (chosen song for Cover, original creations for Original Songs)
- Playlist of submissions
- Voting results (Cover Project only)
- User reflections and community content

## Personalized Landing Experience

When someone visits the root `/` homepage, we intelligently route them based on their participation:

**Not Logged In:**
- Show the public homepage with information about EPTSS
- Prominent call-to-action to sign up
- Overview of available projects

**Logged In, Zero Projects:**
- Redirect to project selection page
- Explain both projects and encourage joining

**Logged In, One Project:**
- Redirect directly to that project's dashboard
- Fast path to get them where they need to be

**Logged In, Multiple Projects:**
- Show multi-project overview dashboard
- Let them see activity across all their projects at once

This minimizes clicks for the common case (users in one project) while providing a clear experience for all scenarios.

## Project Discovery and Selection

We're building a dedicated `/projects` page where users can:
- Browse all available projects
- See descriptions, timelines, and requirements for each
- View whether they're already participating
- Sign up for projects they're not yet part of
- Compare project differences (voting vs. no voting, covers vs. originals)

This becomes the central hub for multi-project management.

## Implementation Timeline

We're breaking this into a manageable 3-week implementation:

### Week 1: Core Routing and Layouts
- Set up the new `/project/[slug]` route structure
- Create project layout components that establish context
- Build the project switcher UI
- Implement redirects for backwards compatibility
- Create the multi-project overview dashboard

### Week 2: Page Migrations
- Migrate sign-up page to project-scoped routes
- Migrate submission page to project-scoped routes
- Migrate voting page to project-scoped routes
- Migrate round detail pages to project-scoped routes
- Update all internal links to use new URL structure

### Week 3: UX Polish and Testing
- Build the project selection/discovery page
- Implement personalized landing page routing
- Add project indicators and branding throughout the UI
- Test all user flows for both projects
- Handle edge cases and error states
- Update documentation and help content

## Data Fetching Pattern

All page-level data fetching now includes the project context. When you're on a project-scoped route, the server components extract the project slug from the URL and use it to query the appropriate data.

For example, fetching rounds for a project:
- Extract the project slug from the route parameters
- Look up the project ID from the slug
- Query rounds where `projectId` matches
- Return only data relevant to that project

This ensures complete data isolation between projects while sharing the same database and application infrastructure.

## Feature Flags and Project Capabilities

Not all projects have the same features:
- Cover Project: Has voting, song selection, candidate overrides
- Original Songs: No voting, no song selection (just submissions)

We're handling this through project-aware feature rendering. When you're viewing the Original Songs project, voting-related UI simply doesn't appear. The UI adapts to the project's capabilities rather than trying to force a one-size-fits-all interface.

## User Communication and Education

As we roll this out, we need to help existing users understand the changes:
- **Announcement**: Email explaining multi-project support and URL changes
- **Toast Messages**: Friendly notices when users are redirected from old URLs
- **Help Content**: Updated FAQ and documentation
- **Onboarding**: New users get a brief tour of available projects

## Success Metrics

We'll know this is working well when:
- Users can easily navigate between projects
- The mental model of "each project has its own space" is intuitive
- No confusion about which project they're interacting with
- New users can discover and join projects without assistance
- Multi-project participants can efficiently manage their involvement in both

## What This Unlocks

This UX foundation enables:
- Adding new projects in the future without restructuring the application
- Project-specific branding, themes, and customization
- Different timelines and workflows per project
- Specialized features that only make sense for certain projects
- Clear analytics and insights per project
- Better community building within each project

## Next Steps

Once this plan is approved, we'll:
1. Create detailed component specifications for Week 1 tasks
2. Set up the routing structure and layouts
3. Begin systematic migration of existing pages
4. Continuously test with real user scenarios
5. Gather feedback and iterate on the UX

The goal is to ship this incrementally, testing each piece thoroughly before moving to the next, so we never break the existing user experience while building toward the multi-project future.
