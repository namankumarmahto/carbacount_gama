CREATE TABLE industry_type (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE emission_category (
    id UUID PRIMARY KEY,
    industry_type_id UUID NOT NULL,
    scope VARCHAR(50) NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_category_industry_type FOREIGN KEY (industry_type_id) REFERENCES industry_type(id) ON DELETE CASCADE
);

-- Seed Industry Types
INSERT INTO industry_type (id, name) VALUES 
('11111111-1111-1111-1111-111111111111', 'Steel'),
('22222222-2222-2222-2222-222222222222', 'Cement'),
('33333333-3333-3333-3333-333333333333', 'Power'),
('44444444-4444-4444-4444-444444444444', 'Chemical'),
('55555555-5555-5555-5555-555555555555', 'Mining'),
('00000000-0000-0000-0000-000000000000', 'Other');

-- Seed Categories for Steel
INSERT INTO emission_category (id, industry_type_id, scope, category_name) VALUES
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'SCOPE1', 'Blast Furnace'),
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'SCOPE1', 'Coke Oven'),
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'SCOPE2', 'Purchased Electricity'),
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', 'SCOPE3', 'Transportation');

-- Seed Categories for Cement
INSERT INTO emission_category (id, industry_type_id, scope, category_name) VALUES
(uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'SCOPE1', 'Clinker Production'),
(uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'SCOPE1', 'Limestone Calcination'),
(uuid_generate_v4(), '22222222-2222-2222-2222-222222222222', 'SCOPE2', 'Grid Electricity');

-- Update User Table to hold Industry Type
ALTER TABLE users ADD COLUMN industry_type_id UUID;
ALTER TABLE users ADD CONSTRAINT fk_user_industry_type FOREIGN KEY (industry_type_id) REFERENCES industry_type(id);

-- Update Industry Table to hold Industry Type
ALTER TABLE industry ADD COLUMN industry_type_id UUID;
ALTER TABLE industry ADD CONSTRAINT fk_industry_industry_type FOREIGN KEY (industry_type_id) REFERENCES industry_type(id);

-- Alter Emission Record Table
ALTER TABLE emission_record ADD COLUMN scope VARCHAR(50);
ALTER TABLE emission_record ADD COLUMN category_id UUID;
ALTER TABLE emission_record ADD COLUMN custom_category_name VARCHAR(255);

ALTER TABLE emission_record ADD CONSTRAINT fk_emission_category FOREIGN KEY (category_id) REFERENCES emission_category(id);

-- Drop old individual scope columns since we're pivoting to a normalized scope/category structure
ALTER TABLE emission_record DROP COLUMN scope1;
ALTER TABLE emission_record DROP COLUMN scope2;
ALTER TABLE emission_record DROP COLUMN scope3;

-- Indexing for performance
CREATE INDEX idx_emission_category ON emission_record(category_id);
CREATE INDEX idx_emission_scope ON emission_record(scope);
CREATE INDEX idx_category_industry_type_scope ON emission_category(industry_type_id, scope);
