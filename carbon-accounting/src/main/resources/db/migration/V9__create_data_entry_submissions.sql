CREATE TABLE IF NOT EXISTS data_entry_submissions (
    id UUID PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    scope_type VARCHAR(20) NOT NULL CHECK (scope_type IN ('SCOPE1', 'SCOPE2', 'SCOPE3', 'PRODUCTION')),
    reporting_year_id UUID NOT NULL REFERENCES reporting_years(id) ON DELETE CASCADE,
    submitted_by UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED'
        CHECK (status IN ('DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED')),
    submitted_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_data_entry_submissions_org ON data_entry_submissions(organization_id);
CREATE INDEX IF NOT EXISTS idx_data_entry_submissions_status ON data_entry_submissions(status);
CREATE INDEX IF NOT EXISTS idx_data_entry_submissions_facility ON data_entry_submissions(facility_id);
CREATE INDEX IF NOT EXISTS idx_data_entry_submissions_submitter ON data_entry_submissions(submitted_by);

-- Backfill existing grouped submissions from activity tables.
INSERT INTO data_entry_submissions (
    id, organization_id, facility_id, scope_type, reporting_year_id,
    submitted_by, status, submitted_at, verified_by, verified_at, rejection_reason
)
SELECT
    s.submission_id,
    f.organization_id,
    s.facility_id,
    'SCOPE1',
    s.reporting_year_id,
    s.created_by,
    COALESCE(s.status, 'SUBMITTED'),
    MIN(s.submitted_at),
    MAX(s.verified_by),
    MAX(s.verified_at),
    MAX(s.rejection_reason)
FROM scope1 s
JOIN facilities f ON f.id = s.facility_id
WHERE s.submission_id IS NOT NULL
GROUP BY s.submission_id, f.organization_id, s.facility_id, s.reporting_year_id, s.created_by
ON CONFLICT (id) DO NOTHING;

INSERT INTO data_entry_submissions (
    id, organization_id, facility_id, scope_type, reporting_year_id,
    submitted_by, status, submitted_at, verified_by, verified_at, rejection_reason
)
SELECT
    s.submission_id,
    f.organization_id,
    s.facility_id,
    'SCOPE2',
    s.reporting_year_id,
    s.created_by,
    COALESCE(s.status, 'SUBMITTED'),
    MIN(s.submitted_at),
    MAX(s.verified_by),
    MAX(s.verified_at),
    MAX(s.rejection_reason)
FROM scope2 s
JOIN facilities f ON f.id = s.facility_id
WHERE s.submission_id IS NOT NULL
GROUP BY s.submission_id, f.organization_id, s.facility_id, s.reporting_year_id, s.created_by
ON CONFLICT (id) DO NOTHING;

INSERT INTO data_entry_submissions (
    id, organization_id, facility_id, scope_type, reporting_year_id,
    submitted_by, status, submitted_at, verified_by, verified_at, rejection_reason
)
SELECT
    s.submission_id,
    f.organization_id,
    s.facility_id,
    'SCOPE3',
    s.reporting_year_id,
    s.created_by,
    COALESCE(s.status, 'SUBMITTED'),
    MIN(s.submitted_at),
    MAX(s.verified_by),
    MAX(s.verified_at),
    MAX(s.rejection_reason)
FROM scope3_activities s
JOIN facilities f ON f.id = s.facility_id
WHERE s.submission_id IS NOT NULL
GROUP BY s.submission_id, f.organization_id, s.facility_id, s.reporting_year_id, s.created_by
ON CONFLICT (id) DO NOTHING;

INSERT INTO data_entry_submissions (
    id, organization_id, facility_id, scope_type, reporting_year_id,
    submitted_by, status, submitted_at, verified_by, verified_at, rejection_reason
)
SELECT
    p.submission_id,
    f.organization_id,
    p.facility_id,
    'PRODUCTION',
    p.reporting_year_id,
    p.created_by,
    COALESCE(p.status, 'SUBMITTED'),
    MIN(p.submitted_at),
    MAX(p.verified_by),
    MAX(p.verified_at),
    MAX(p.rejection_reason)
FROM production_data p
JOIN facilities f ON f.id = p.facility_id
WHERE p.submission_id IS NOT NULL
GROUP BY p.submission_id, f.organization_id, p.facility_id, p.reporting_year_id, p.created_by
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_scope1_submission_id') THEN
        ALTER TABLE scope1
            ADD CONSTRAINT fk_scope1_submission_id
            FOREIGN KEY (submission_id) REFERENCES data_entry_submissions(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_scope2_submission_id') THEN
        ALTER TABLE scope2
            ADD CONSTRAINT fk_scope2_submission_id
            FOREIGN KEY (submission_id) REFERENCES data_entry_submissions(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_scope3_submission_id') THEN
        ALTER TABLE scope3_activities
            ADD CONSTRAINT fk_scope3_submission_id
            FOREIGN KEY (submission_id) REFERENCES data_entry_submissions(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_production_submission_id') THEN
        ALTER TABLE production_data
            ADD CONSTRAINT fk_production_submission_id
            FOREIGN KEY (submission_id) REFERENCES data_entry_submissions(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_scope1_submission_id ON scope1(submission_id);
CREATE INDEX IF NOT EXISTS idx_scope2_submission_id ON scope2(submission_id);
CREATE INDEX IF NOT EXISTS idx_scope3_submission_id ON scope3_activities(submission_id);
CREATE INDEX IF NOT EXISTS idx_production_submission_id ON production_data(submission_id);
