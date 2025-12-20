---
description: Update landing page content for a project using the API
---

# Update Landing Page Content

This command helps you update the landing page content for a project (e.g., monthly-original).

## Common Updates

### 1. Fix the testimonial on the Originals landing page

To update the testimonial quote and author:

```bash
curl -X PATCH "http://localhost:3000/api/admin/project-config?slug=monthly-original" \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "pages": {
        "home": {
          "howItWorks": {
            "testimonial": {
              "quote": "Your new testimonial quote here",
              "author": "Real Author Name"
            }
          }
        }
      }
    }
  }'
```

### 2. Fix the "Vote for This Month's Theme" text

The round info labels are shown in the RoundInfoCard component. To update the voting phase labels:

```bash
curl -X PATCH "http://localhost:3000/api/admin/project-config?slug=monthly-original" \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "pages": {
        "home": {
          "roundInfo": {
            "voting": {
              "badge": "Theme Selection",
              "title": "Prompt Drops at Round Start",
              "subtitle": "Songwriting prompt announced when round begins",
              "closesPrefix": "Round starts"
            }
          }
        }
      }
    }
  }'
```

Or if you want to update the signups phase (since signups are open):

```bash
curl -X PATCH "http://localhost:3000/api/admin/project-config?slug=monthly-original" \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "pages": {
        "home": {
          "roundInfo": {
            "signups": {
              "badge": "Signups Open",
              "title": "Join This Month'\''s Challenge",
              "subtitle": "Sign up now - prompt drops at round start",
              "closesPrefix": "Signups close"
            }
          }
        }
      }
    }
  }'
```

### 3. Update multiple fields at once

You can update multiple sections in a single request:

```bash
curl -X PATCH "http://localhost:3000/api/admin/project-config?slug=monthly-original" \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "pages": {
        "home": {
          "howItWorks": {
            "testimonial": {
              "quote": "EPTSS Originals helped me develop a consistent songwriting practice. The monthly challenges keep me creative and accountable!",
              "author": "Sarah Chen, Singer-Songwriter"
            }
          },
          "roundInfo": {
            "signups": {
              "badge": "Signups Open",
              "title": "Join This Month'\''s Challenge",
              "subtitle": "Sign up now - prompt drops at round start",
              "closesPrefix": "Signups close"
            }
          }
        }
      }
    }
  }'
```

## Available API Endpoints

### GET - Retrieve current config
```bash
curl "http://localhost:3000/api/admin/project-config?slug=monthly-original"
```

### PATCH - Update specific fields (recommended)
Use this to update specific fields while keeping everything else unchanged.

### PUT - Replace entire config
Use this to replace the entire configuration (be careful!).

## Config Structure Reference

The project config structure for landing page content:

```typescript
{
  content: {
    pages: {
      home: {
        hero: {
          tagline: string,
          title: string,
          subtitle: string,
          description: string,
          ctaPrimary: string,
          ctaSecondary: string,
          benefits: string
        },
        howItWorks: {
          sectionTitle: string,
          sectionSubtitle: string,
          steps: {
            step1: { icon, title, description },
            step2: { icon, title, description },
            step3: { icon, title, description }
          },
          benefits: {
            benefitsTitle: string,
            benefit1: { icon, title, description },
            benefit2: { icon, title, description },
            benefit3: { icon, title, description }
          },
          testimonial: {
            quote: string,
            author: string
          },
          ctaButton: string,
          ctaLinks: { faq, pastRounds }
        },
        roundInfo: {
          signups: { badge, title, subtitle, closesPrefix },
          voting: { badge, title, subtitle, closesPrefix },
          covering: { badge, titleFallback, subtitle, closesPrefix },
          celebration: { badge, titleFallback, subtitle, closesPrefix },
          loading: { badge, title, subtitle }
        },
        submissionsGallery: {
          title: string,
          subtitle: string,
          emptyStateTitle: string,
          emptyStateMessage: string,
          viewAllLink: string
        }
      }
    }
  }
}
```

## Tips

1. **Always use PATCH** for partial updates - it's safer than PUT
2. **Test locally first** before deploying changes
3. **View current config** using GET before making changes
4. **The API validates** the config structure using Zod schemas
5. **Pages are auto-revalidated** after updates

## Implementation Steps

When asked to update landing page content:

1. First, GET the current config to see what's there
2. Identify which fields need to be updated
3. Use PATCH to update only those specific fields
4. Verify the changes by visiting the page or GET-ing the config again

## Example: Complete workflow to fix the bugs

```bash
# 1. Get current config
curl "http://localhost:3000/api/admin/project-config?slug=monthly-original" | jq

# 2. Update both issues
curl -X PATCH "http://localhost:3000/api/admin/project-config?slug=monthly-original" \
  -H "Content-Type: application/json" \
  -d '{
    "content": {
      "pages": {
        "home": {
          "howItWorks": {
            "testimonial": {
              "quote": "The monthly songwriting challenges have been incredible for my creative growth. Love being part of this community!",
              "author": "Alex Rivera, Producer"
            }
          },
          "roundInfo": {
            "signups": {
              "badge": "Signups Open",
              "title": "Join This Month'\''s Challenge",
              "subtitle": "Sign up now - songwriting prompt drops at round start",
              "closesPrefix": "Signups close"
            }
          }
        }
      }
    }
  }'

# 3. Verify the changes
curl "http://localhost:3000/api/admin/project-config?slug=monthly-original" | jq '.config.content.pages.home'
```
