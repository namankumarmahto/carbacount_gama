-- V2: Add verification workflow status to emission data tables
-- DATA_ENTRY users submit records with status=PENDING
-- VIEWER users verify them (APPROVED / REJECTED)
-- Only APPROVED data appears in dashboards and reports

ALTER TABLE scope1 
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE scope2 
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE scope3_activities 
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Index to quickly find all pending records for a facility/org
CREATE INDEX IF NOT EXISTS idx_fuel_status ON scope1(status);
CREATE INDEX IF NOT EXISTS idx_electricity_status ON scope2(status);
CREATE INDEX IF NOT EXISTS idx_scope3_status ON scope3_activities(status);
