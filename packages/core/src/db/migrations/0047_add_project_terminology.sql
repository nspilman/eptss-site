-- Add Terminology Configuration for Projects
-- Sets project-specific naming for rounds and phases

-- Update Cover Project with default cover-project terminology
UPDATE "projects"
SET "config" = "config" || '{"terminology": {
  "roundPrefix": "Round",
  "useRoundNumber": true,
  "roundFormat": "number",
  "phases": {
    "signups": "Song Selection & Signups",
    "voting": "Voting Phase",
    "covering": "Covering Phase",
    "celebration": "Listening Party"
  },
  "phaseShortNames": {
    "signups": "Sign Up",
    "voting": "Vote",
    "covering": "Cover",
    "celebration": "Listen"
  },
  "phaseDescriptions": {
    "signups": "Suggest a song and sign up to participate",
    "voting": "Vote on which song should be covered this round",
    "covering": "Record and submit your cover of the selected song",
    "celebration": "Join us for the listening party event!"
  }
}}'::jsonb
WHERE "id" = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

--> statement-breakpoint

-- Update Monthly Originals Project with originals-specific terminology
UPDATE "projects"
SET "config" = "config" || '{"terminology": {
  "roundPrefix": "",
  "useRoundNumber": false,
  "roundFormat": "month",
  "phases": {
    "signups": "Signups Open",
    "voting": "Preparation Phase",
    "covering": "Creation Phase",
    "celebration": "Listening Party"
  },
  "phaseShortNames": {
    "signups": "Sign Up",
    "voting": "Prepare",
    "covering": "Create",
    "celebration": "Listen"
  },
  "phaseDescriptions": {
    "signups": "Sign up to participate in this month''s original music round",
    "voting": "The prompt will be revealed soon. Get ready to create!",
    "covering": "Create and submit your original music based on the prompt",
    "celebration": "Join us for the listening party event!"
  }
}}'::jsonb
WHERE "id" = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
