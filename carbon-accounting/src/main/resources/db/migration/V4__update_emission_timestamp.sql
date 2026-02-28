-- Drop existing table if needed or alter it. Since we are in development, altering is fine.
-- But the previous migration had recorded_at as TIMESTAMP (which maps to LocalDateTime).
-- We want to ensure it handles UTC properly (TIMESTAMP WITH TIME ZONE or just ensuring Instant mapping).

ALTER TABLE emission_record 
ALTER COLUMN recorded_at TYPE TIMESTAMPTZ,
ALTER COLUMN created_at TYPE TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_emission_recorded_at 
ON emission_record(recorded_at);
