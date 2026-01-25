-- Add critical indexes for performance optimization
-- These indexes will dramatically speed up common queries

-- Sign-ups table indexes
CREATE INDEX IF NOT EXISTS idx_sign_ups_user_id ON sign_ups(user_id);
CREATE INDEX IF NOT EXISTS idx_sign_ups_round_id ON sign_ups(round_id);
CREATE INDEX IF NOT EXISTS idx_sign_ups_song_id ON sign_ups(song_id);
CREATE INDEX IF NOT EXISTS idx_sign_ups_round_user ON sign_ups(round_id, user_id);
CREATE INDEX IF NOT EXISTS idx_sign_ups_created_at ON sign_ups(created_at DESC);

-- Submissions table indexes
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_round_id ON submissions(round_id);
CREATE INDEX IF NOT EXISTS idx_submissions_round_user ON submissions(round_id, user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);

-- Song selection votes indexes
CREATE INDEX IF NOT EXISTS idx_song_selection_votes_user_id ON song_selection_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_song_selection_votes_round_id ON song_selection_votes(round_id);
CREATE INDEX IF NOT EXISTS idx_song_selection_votes_song_id ON song_selection_votes(song_id);
CREATE INDEX IF NOT EXISTS idx_song_selection_votes_round_song ON song_selection_votes(round_id, song_id);

-- Round metadata indexes
CREATE INDEX IF NOT EXISTS idx_round_metadata_slug ON round_metadata(slug);
CREATE INDEX IF NOT EXISTS idx_round_metadata_song_id ON round_metadata(song_id);
CREATE INDEX IF NOT EXISTS idx_round_metadata_signup_opens ON round_metadata(signup_opens);
CREATE INDEX IF NOT EXISTS idx_round_metadata_voting_opens ON round_metadata(voting_opens);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Songs table indexes
CREATE INDEX IF NOT EXISTS idx_songs_title_artist ON songs(title, artist);

-- Feedback table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
