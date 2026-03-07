ALTER TABLE data_entry_submissions
    ADD COLUMN IF NOT EXISTS review_status VARCHAR(30);

UPDATE data_entry_submissions
SET review_status = CASE
    WHEN status = 'VERIFIED' THEN 'VERIFIED'
    WHEN status = 'REJECTED' THEN 'REJECTED'
    ELSE 'PENDING_REVIEW'
END
WHERE review_status IS NULL;

ALTER TABLE data_entry_submissions
    ALTER COLUMN review_status SET DEFAULT 'PENDING_REVIEW';

CREATE INDEX IF NOT EXISTS idx_data_entry_submissions_review_status
    ON data_entry_submissions(review_status);
