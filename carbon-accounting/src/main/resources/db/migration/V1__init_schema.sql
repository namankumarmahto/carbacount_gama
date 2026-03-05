-- Enterprise-grade Schema for CarbaCount (Carbon Accounting & Management System)
-- Version 2.0: Optimized for Multi-tenant RBAC, Organization Management, and Reporting.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Reference Data (Geography)
CREATE TABLE country (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(10)
);

CREATE TABLE state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country_id UUID NOT NULL REFERENCES country(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10)
);

CREATE TABLE industry_type (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE emission_category (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    industry_type_id UUID REFERENCES industry_type(id) ON DELETE CASCADE,
    scope VARCHAR(50) NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. RBAC Roles (Strictly 4 Roles)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- 3. Users Table (Normalized Person Information)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('PENDING', 'ACTIVE', 'INACTIVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Organizations (Multi-tenant Company Information)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    industry_type VARCHAR(255) NOT NULL,
    gst_number VARCHAR(50),
    cin_number VARCHAR(50),
    pan_number VARCHAR(50),
    registered_address TEXT,
    country VARCHAR(255) NOT NULL,
    state VARCHAR(255),
    city VARCHAR(255),
    postal_code VARCHAR(20),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    net_zero_target_year INTEGER,
    reporting_standard VARCHAR(100),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Organization-User Mapping (RBAC Bridge)
CREATE TABLE organization_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- STRICT CONSTRAINT: Exactly one OWNER per Organization
-- Since role_id=1 is OWNER (seeded below), we can use it in the index
CREATE UNIQUE INDEX idx_single_owner_per_org ON organization_users (organization_id) WHERE role_id = 1;

-- 6. Facilities Management
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(255),
    state VARCHAR(255),
    city VARCHAR(255),
    production_capacity NUMERIC,
    product_type VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Restriction for DATA_ENTRY users
CREATE TABLE facility_user_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Reporting Timeline
CREATE TABLE reporting_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    year_label VARCHAR(50) NOT NULL, -- e.g., "FY 2024-25"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Master Data: Emission Factors
CREATE TABLE emission_factors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    country VARCHAR(255) NOT NULL,
    state VARCHAR(255),
    fuel_type VARCHAR(255),
    electricity_source VARCHAR(255),
    unit VARCHAR(50) NOT NULL,
    factor_value NUMERIC NOT NULL,
    factor_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Activity Data (Emissions Input)

-- Scope 1
CREATE TABLE scope1 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    reporting_year_id UUID NOT NULL REFERENCES reporting_years(id) ON DELETE CASCADE,
    fuel_type VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    quantity NUMERIC NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scope 2
CREATE TABLE scope2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    reporting_year_id UUID NOT NULL REFERENCES reporting_years(id) ON DELETE CASCADE,
    electricity_source VARCHAR(255) NOT NULL,
    unit VARCHAR(50) DEFAULT 'kWh',
    quantity NUMERIC NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    updated_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scope 3: Value Chain Activities
CREATE TABLE scope3_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    reporting_year_id UUID NOT NULL REFERENCES reporting_years(id) ON DELETE CASCADE,
    category VARCHAR(255) NOT NULL,
    sub_category VARCHAR(255),
    unit VARCHAR(50) NOT NULL,
    quantity NUMERIC NOT NULL,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Production Metrics (for Intensity calculations)
CREATE TABLE production_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    reporting_year_id UUID NOT NULL REFERENCES reporting_years(id) ON DELETE CASCADE,
    total_production NUMERIC NOT NULL,
    unit VARCHAR(50) DEFAULT 'ton',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. System-Calculated Results (Protected: Never manually edited)
CREATE TABLE emission_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    reporting_year_id UUID NOT NULL REFERENCES reporting_years(id) ON DELETE CASCADE,
    scope VARCHAR(20) NOT NULL CHECK (scope IN ('SCOPE1', 'SCOPE2', 'SCOPE3')),
    total_emission NUMERIC NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Security & Lifecycle
CREATE TABLE invitation_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token UUID UNIQUE NOT NULL,
    expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    module VARCHAR(255) NOT NULL,
    reference_id UUID,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- SEED DATA
INSERT INTO roles (id, name) VALUES 
(1, 'OWNER'), 
(2, 'ADMIN'), 
(3, 'DATA_ENTRY'), 
(4, 'VIEWER') 
ON CONFLICT (id) DO NOTHING;

INSERT INTO country (id, name, code) VALUES 
('11111111-1111-1111-1111-111111111111', 'India', 'IN') 
ON CONFLICT (id) DO NOTHING;

INSERT INTO industry_type (id, name) VALUES 
('11111111-1111-1111-1111-111111111111', 'Steel'),
('22222222-2222-2222-2222-222222222222', 'Cement'),
('33333333-3333-3333-3333-333333333333', 'Power'),
('44444444-4444-4444-4444-444444444444', 'Chemicals'),
('00000000-0000-0000-0000-000000000000', 'Other') 
ON CONFLICT (id) DO NOTHING;

-- Seed Indian States
INSERT INTO state (country_id, name) 
SELECT id, sname FROM country, (VALUES 
('Andhra Pradesh'), ('Arunachal Pradesh'), ('Assam'), ('Bihar'), ('Chhattisgarh'), 
('Goa'), ('Gujarat'), ('Haryana'), ('Himachal Pradesh'), ('Jharkhand'), 
('Karnataka'), ('Kerala'), ('Madhya Pradesh'), ('Maharashtra'), ('Manipur'), 
('Meghalaya'), ('Mizoram'), ('Nagaland'), ('Odisha'), ('Punjab'), 
('Rajasthan'), ('Sikkim'), ('Tamil Nadu'), ('Telangana'), ('Tripura'), 
('Uttar Pradesh'), ('Uttarakhand'), ('West Bengal'), ('Delhi'), 
('Jammu & Kashmir'), ('Ladakh'), ('Andaman & Nicobar'), ('Chandigarh'), 
('Dadra & Nagar Haveli'), ('Daman & Diu'), ('Lakshadweep'), ('Puducherry')
) AS t(sname) WHERE name = 'India' ON CONFLICT DO NOTHING;

-- Triggers for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_organizations BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_facilities BEFORE UPDATE ON facilities FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_fuel BEFORE UPDATE ON scope1 FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_electricity BEFORE UPDATE ON scope2 FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
