-- Create referral_codes table for storing referral links
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  created_by_user_id UUID NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
  max_uses INTEGER, -- NULL means unlimited uses
  uses_count INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create user_referrals table to track who referred whom
CREATE TABLE IF NOT EXISTS user_referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referred_user_id UUID NOT NULL REFERENCES users(userid) ON DELETE CASCADE UNIQUE,
  referrer_user_id UUID NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add referral_code to unverified_signups for tracking
ALTER TABLE unverified_signups ADD COLUMN IF NOT EXISTS referral_code TEXT;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS referral_codes_created_by_user_id_idx ON referral_codes(created_by_user_id);
CREATE INDEX IF NOT EXISTS referral_codes_code_idx ON referral_codes(code);
CREATE INDEX IF NOT EXISTS referral_codes_is_active_idx ON referral_codes(is_active);
CREATE INDEX IF NOT EXISTS user_referrals_referred_user_id_idx ON user_referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS user_referrals_referrer_user_id_idx ON user_referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS user_referrals_referral_code_id_idx ON user_referrals(referral_code_id);
