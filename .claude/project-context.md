# EPTSS Platform - Project Context

This platform hosts **two distinct music community projects** with different creative focuses and workflows. Understanding these differences is critical for making appropriate decisions when working with the codebase.

---

## Project 1: Cover Project (slug: `cover`)

**Full Name:** Everyone Plays the Same Song
**Tagline:** "Quarterly Cover Project"
**Core Concept:** Community members vote on which song to cover, then everyone creates their own version of the winning song.

### Key Characteristics:
- **Frequency:** Quarterly rounds
- **Creative Focus:** Cover songs chosen by community voting
- **Workflow:** Song Selection → Voting → Covering → Listening Party
- **Song Selection:** Required on signup - participants suggest songs they hope the community will cover
- **Voting:** Enabled - community votes to select which song to cover
- **Round Format:** Numbered rounds (e.g., "Round 32")

### Business Rules:
```json
{
  "requireSongOnSignup": true,
  "enableVoting": true,
  "allowLateSubmissions": false,
  "maxVotesPerUser": 3
}
```

### Phase Names:
- **Signups:** "Song Selection & Signups"
- **Voting:** "Voting Phase"
- **Covering:** "Covering Phase"
- **Celebration:** "Listening Party"

### Signup Experience:
- **Logged-in welcome text:** "You're all set! Sign up with the song you hope we cover this round."
- **Intent:** Users suggest songs and participate in democratic song selection
- **User Journey:** Suggest song → Vote on options → Cover winning song → Share at listening party

### Typical Round Timeline:
1. Signups open with song suggestions
2. Voting period (3-14 days)
3. Covering phase (~3 months)
4. Listening party celebration

---

## Project 2: Monthly Original (slug: `monthly-original`)

**Full Name:** Monthly Original Song Challenge
**Tagline:** "Monthly Songwriting Challenge"
**Core Concept:** Songwriters create original music based on a creative prompt provided each month.

### Key Characteristics:
- **Frequency:** Monthly rounds
- **Creative Focus:** Original compositions from prompts
- **Workflow:** Signup → Prompt Reveal → Creation → Listening Party
- **Song Selection:** Not required on signup - participants write originals based on prompts
- **Voting:** Disabled - no voting, just a shared creative prompt
- **Round Format:** Month-based (e.g., "January 2025")

### Business Rules:
```json
{
  "requireSongOnSignup": false,
  "enableVoting": false,
  "allowLateSubmissions": true,
  "maxVotesPerUser": 3
}
```

### Phase Names:
- **Signups:** "Signups Open"
- **Voting:** "Preparation Phase" (prompt not yet revealed)
- **Covering:** "Creation Phase"
- **Celebration:** "Listening Party"

### Signup Experience:
- **Logged-in welcome text:** "Ready to write your next original song? Just sign up below to join this month's songwriting challenge."
- **Intent:** Simple signup - no song selection needed, prompt comes later
- **User Journey:** Sign up → Receive prompt → Write & record original → Share at listening party

### Typical Round Timeline:
1. Signups open (no song selection needed)
2. Prompt revealed at round start
3. Creation phase (~1 month)
4. Listening party celebration

### Key Quote from Organizer:
> "I want to write original music, but require a deadline and social obligation to actually sit down and do it. This project is invaluable." - Nate S, songwriter/organizer

---

## Critical Differences Summary

| Aspect | Cover Project | Monthly Original |
|--------|---------------|------------------|
| **Frequency** | Quarterly | Monthly |
| **Creative Output** | Cover songs | Original songs |
| **Song on Signup** | ✅ Required | ❌ Not required |
| **Voting** | ✅ Enabled | ❌ Disabled |
| **Prompt/Theme** | Community-voted song | Creative prompt (revealed at start) |
| **Timeline** | ~3 months | ~1 month |
| **Late Submissions** | Not allowed | Allowed |
| **Round Naming** | Numbered (Round 32) | Month-based (January 2025) |

---

## Design & Content Implications

When working on features, content, or UI:

### For Cover Project:
- Emphasize **song suggestion** and **voting** features
- Language should reference "covering," "your version," "interpretation"
- Signup requires song selection (artist, title, YouTube link)
- Focus on democratic process and community choice
- Longer timeline = more preparation emphasis

### For Monthly Original:
- Emphasize **creative freedom** and **songwriting practice**
- Language should reference "writing," "original," "from prompt"
- Signup is simple - no song needed upfront
- Focus on creative prompts and consistent practice
- Shorter timeline = momentum and habit-building

### Configuration-Driven Development:
Always check project config when:
- Adding or modifying signup flows
- Implementing voting features
- Writing user-facing copy
- Setting phase timelines
- Configuring email templates

Use `getProjectConfig()` or `getPageContent()` to fetch project-specific settings rather than hardcoding assumptions.

---

## Database Schema

Both projects share the same database schema but use configuration to enable/disable features:

```typescript
// Fetch project-specific config
import { getProjectConfig, getPageContent } from "@eptss/project-config";

const config = await getProjectConfig("cover"); // or "monthly-original"
const signupContent = await getPageContent("cover", "signup");

// Check if voting should be shown
if (config.features.enableVoting) {
  // Show voting UI
}

// Check if song is required on signup
if (config.businessRules.requireSongOnSignup) {
  // Require song fields
}
```

---

## When Making Changes

**Always ask yourself:**
1. Does this change apply to both projects or just one?
2. Should this be configurable per project?
3. Does the copy/UX make sense for both cover songs AND original songwriting?
4. Am I respecting the `requireSongOnSignup` flag?
5. Am I checking `enableVoting` before showing voting features?

**Default Assumption:**
If a feature/text could differ between projects, it should be in the project config, not hardcoded.

---

## Quick Reference: Key Config Paths

```typescript
// Signup page content
config.content.pages.signup.loggedInWelcomeText

// Feature flags
config.features.enableVoting
config.features.enableSubmissions

// Business rules
config.businessRules.requireSongOnSignup
config.businessRules.allowLateSubmissions

// Phase terminology
config.terminology.phases.signups
config.terminology.phases.voting
config.terminology.phases.covering
config.terminology.phases.celebration

// Round info labels
config.content.pages.home.roundInfo.signups.badge
```

---

## Historical Context

The platform was originally built for the "Everyone Plays the Same Song" cover project. The "Monthly Original" project was added later to support a different creative workflow within the same community. This is why some legacy code may assume voting and song selection are always present - these assumptions should be replaced with config-driven logic.

---

*This document should be referenced whenever working on user-facing features, content, or workflows to ensure both projects are properly supported.*
