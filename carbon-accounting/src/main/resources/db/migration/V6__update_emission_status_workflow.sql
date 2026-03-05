-- V6: Update emission workflow statuses
-- Replace PENDING/APPROVED with DRAFT/SUBMITTED/VERIFIED/REJECTED
-- AUDITOR users will VERIFY (approve) or REJECT records submitted by DATA_ENTRY

-- ── scope1 ──────────────────────────────────────────────────────────────────
-- Step 1: Drop old CHECK constraint
ALTER TABLE scope1 DROP CONSTRAINT IF EXISTS scope1_status_check;

-- Step 2: Rename existing PENDING → DRAFT, APPROVED → VERIFIED
UPDATE scope1 SET status = 'DRAFT'    WHERE status = 'PENDING';
UPDATE scope1 SET status = 'VERIFIED' WHERE status = 'APPROVED';

-- Step 3: Add submitted_at column
ALTER TABLE scope1 ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;

-- Step 4: Add new CHECK with full workflow statuses
ALTER TABLE scope1 ADD CONSTRAINT scope1_status_check
    CHECK (status IN ('DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED'));

-- ── scope2 ──────────────────────────────────────────────────────────────────
ALTER TABLE scope2 DROP CONSTRAINT IF EXISTS scope2_status_check;

UPDATE scope2 SET status = 'DRAFT'    WHERE status = 'PENDING';
UPDATE scope2 SET status = 'VERIFIED' WHERE status = 'APPROVED';

ALTER TABLE scope2 ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE scope2 ADD CONSTRAINT scope2_status_check
    CHECK (status IN ('DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED'));

-- ── scope3_activities ────────────────────────────────────────────────────────
ALTER TABLE scope3_activities DROP CONSTRAINT IF EXISTS scope3_activities_status_check;

UPDATE scope3_activities SET status = 'DRAFT'    WHERE status = 'PENDING';
UPDATE scope3_activities SET status = 'VERIFIED' WHERE status = 'APPROVED';

ALTER TABLE scope3_activities ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE scope3_activities ADD CONSTRAINT scope3_activities_status_check
    CHECK (status IN ('DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED'));

-- ── production_data ──────────────────────────────────────────────────────────
ALTER TABLE production_data DROP CONSTRAINT IF EXISTS production_data_status_check;

UPDATE production_data SET status = 'DRAFT'    WHERE status = 'PENDING';
UPDATE production_data SET status = 'VERIFIED' WHERE status = 'APPROVED';

ALTER TABLE production_data ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE production_data ADD CONSTRAINT production_data_status_check
    CHECK (status IN ('DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED'));
