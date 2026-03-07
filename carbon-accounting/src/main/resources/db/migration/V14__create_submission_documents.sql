-- Create table for storing supporting documents metadata
CREATE TABLE IF NOT EXISTS submission_documents (
    id UUID PRIMARY KEY,
    submission_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add index for submission_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_submission_documents_submission_id ON submission_documents(submission_id);
