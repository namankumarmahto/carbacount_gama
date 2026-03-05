-- V4: Add tracking columns to production_data and status workflow
-- The production_data table exists from V1 but lacks created_by and status columns
-- needed for the data-entry → verify workflow.

ALTER TABLE production_data
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Index for quick status queries
CREATE INDEX IF NOT EXISTS idx_production_status ON production_data(status);

-- Trigger so updated_at is maintained automatically
CREATE TRIGGER set_timestamp_production
    BEFORE UPDATE ON production_data
    FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
