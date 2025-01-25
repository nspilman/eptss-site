-- Drop the table if it exists
DROP TABLE IF EXISTS test_runs;

-- Create the test_runs table
CREATE TABLE test_runs (
    id BIGSERIAL PRIMARY KEY,
    test_name TEXT NOT NULL,
    status TEXT NOT NULL,
    error_message TEXT,
    duration INTEGER,
    started_at TIMESTAMP DEFAULT now(),
    environment TEXT NOT NULL
);
