-- Add Submission Form Configuration to Project Configs
-- This migration adds submissionForm configuration to both projects
-- Cover project: audio required, lyrics disabled
-- Originals project: audio OR lyrics required (using requiredGroup)

-- ============================================================================
-- COVER PROJECT (Everyone Plays the Same Song)
-- ============================================================================

-- Add Submission Form config for Cover Project
UPDATE "projects"
SET "config" = jsonb_set(
  "config",
  '{submissionForm}',
  '{
    "fields": {
      "audioFile": {
        "enabled": true,
        "required": true,
        "maxSizeMB": 50,
        "acceptedFormats": ["audio/*"]
      },
      "coverImage": {
        "enabled": true,
        "required": false,
        "maxSizeMB": 5,
        "enableCrop": true,
        "description": "Upload cover art for your submission (will use your profile picture if not provided)"
      },
      "lyrics": {
        "enabled": false,
        "required": false
      },
      "coolThingsLearned": {
        "enabled": true,
        "required": false
      },
      "toolsUsed": {
        "enabled": true,
        "required": false
      },
      "happyAccidents": {
        "enabled": true,
        "required": false
      },
      "didntWork": {
        "enabled": true,
        "required": false
      }
    }
  }'::jsonb
)
WHERE "id" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

--> statement-breakpoint

-- ============================================================================
-- MONTHLY ORIGINAL PROJECT
-- ============================================================================

-- Add Submission Form config for Monthly Original Project
-- Uses requiredGroup to allow either audio OR lyrics (or both)
UPDATE "projects"
SET "config" = jsonb_set(
  "config",
  '{submissionForm}',
  '{
    "fields": {
      "audioFile": {
        "enabled": true,
        "required": false,
        "requiredGroup": "submission-content",
        "maxSizeMB": 50,
        "acceptedFormats": ["audio/*"],
        "label": "Audio File",
        "description": "Upload your song recording"
      },
      "coverImage": {
        "enabled": true,
        "required": false,
        "maxSizeMB": 5,
        "enableCrop": true,
        "description": "Upload cover art for your submission (will use your profile picture if not provided)"
      },
      "lyrics": {
        "enabled": true,
        "required": false,
        "requiredGroup": "submission-content",
        "label": "Original Lyrics",
        "placeholder": "Enter your original song lyrics...",
        "description": "Share the lyrics of your original song"
      },
      "coolThingsLearned": {
        "enabled": true,
        "required": false,
        "label": "Cool Things Learned",
        "placeholder": "What did you learn while making this song?"
      },
      "toolsUsed": {
        "enabled": true,
        "required": false,
        "label": "Tools Used",
        "placeholder": "What tools did you use to make this song?"
      },
      "happyAccidents": {
        "enabled": true,
        "required": false,
        "label": "Happy Accidents",
        "placeholder": "What happy accidents occurred while making this song?"
      },
      "didntWork": {
        "enabled": true,
        "required": false,
        "label": "What Didn''t Work",
        "placeholder": "What didn''t work out as planned?"
      }
    }
  }'::jsonb
)
WHERE "id" = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
