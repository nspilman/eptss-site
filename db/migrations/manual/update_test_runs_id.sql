-- Drop the existing table
DROP TABLE IF EXISTS test_runs;

-- Recreate with serial id
CREATE TABLE test_runs (
  id SERIAL PRIMARY KEY,
  test_name TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  duration INTEGER,
  started_at TIMESTAMP DEFAULT NOW(),
  environment TEXT NOT NULL
);
