CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE industry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(255),
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE plant (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    industry_id UUID REFERENCES industry(id),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE emission_record (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plant_id UUID REFERENCES plant(id),
    scope1 DOUBLE PRECISION,
    scope2 DOUBLE PRECISION,
    scope3 DOUBLE PRECISION,
    total_emission DOUBLE PRECISION,
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emission_recorded_at ON emission_record(recorded_at);
CREATE INDEX idx_emission_plant_id ON emission_record(plant_id);
