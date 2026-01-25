-- Create user_privacy_settings table
-- This should have been created by migration 0030 but wasn't

CREATE TABLE IF NOT EXISTS user_privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id UUID NOT NULL UNIQUE,
  show_stats BOOLEAN DEFAULT true NOT NULL,
  show_signups BOOLEAN DEFAULT true NOT NULL,
  show_submissions BOOLEAN DEFAULT true NOT NULL,
  show_votes BOOLEAN DEFAULT false NOT NULL,
  show_email BOOLEAN DEFAULT false NOT NULL,
  public_display_name TEXT,
  profile_bio TEXT,
  created_at TIMESTAMP DEFAULT now() NOT NULL,
  updated_at TIMESTAMP DEFAULT now() NOT NULL,
  CONSTRAINT user_privacy_settings_user_id_unique UNIQUE(user_id)
);

-- Add foreign key constraint
ALTER TABLE user_privacy_settings
ADD CONSTRAINT user_privacy_settings_user_id_users_userid_fk
FOREIGN KEY (user_id)
REFERENCES users(userid)
ON DELETE CASCADE
ON UPDATE NO ACTION;

-- Create default privacy settings for all existing users
INSERT INTO user_privacy_settings (user_id, show_stats, show_signups, show_submissions, show_votes, show_email)
SELECT
  userid,
  true,  -- show_stats
  true,  -- show_signups
  true,  -- show_submissions
  false, -- show_votes (hidden by default)
  false  -- show_email (hidden by default)
FROM users
ON CONFLICT (user_id) DO NOTHING;

-- Verify the table was created
SELECT COUNT(*) as user_privacy_settings_count FROM user_privacy_settings;
