-- Create bot_attempts table for tracking failed CAPTCHA attempts and bot activity
CREATE TABLE IF NOT EXISTS bot_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT,
  user_agent TEXT,
  captcha_score DECIMAL(3, 2), -- reCAPTCHA score from 0.0 to 1.0
  attempt_type TEXT NOT NULL, -- 'signup', 'login', 'vote', etc.
  metadata JSONB, -- Additional context (email, form data, etc.)
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Index for querying by IP address
CREATE INDEX IF NOT EXISTS bot_attempts_ip_address_idx ON bot_attempts(ip_address);

-- Index for querying by timestamp (for cleanup/analysis)
CREATE INDEX IF NOT EXISTS bot_attempts_created_at_idx ON bot_attempts(created_at DESC);

-- Index for querying by attempt type
CREATE INDEX IF NOT EXISTS bot_attempts_attempt_type_idx ON bot_attempts(attempt_type);
