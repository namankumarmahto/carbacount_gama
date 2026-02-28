-- 1. Create tenants table
CREATE TABLE tenants (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    industry_type VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2. Add tenant_id to existing tables
ALTER TABLE industry ADD COLUMN tenant_id UUID;
ALTER TABLE plant ADD COLUMN tenant_id UUID;
ALTER TABLE emission_record ADD COLUMN tenant_id UUID;
ALTER TABLE energy_record ADD COLUMN tenant_id UUID;
ALTER TABLE users ADD COLUMN tenant_id UUID;

-- 3. Add foreign key constraints (optional but recommended for data integrity)
-- Note: We might want to allow nulls temporarily or seed a default tenant for existing data.
-- For this phase, we'll implement it as nullable initially to avoid breaking existing data.

-- 4. Create indexes for tenant-based filtering
CREATE INDEX idx_industry_tenant ON industry(tenant_id);
CREATE INDEX idx_plant_tenant ON plant(tenant_id);
CREATE INDEX idx_emission_tenant ON emission_record(tenant_id);
CREATE INDEX idx_energy_tenant ON energy_record(tenant_id);
CREATE INDEX idx_users_tenant ON users(tenant_id);
