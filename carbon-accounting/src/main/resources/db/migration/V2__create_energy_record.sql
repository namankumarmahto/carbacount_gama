CREATE TABLE energy_record (
    id UUID PRIMARY KEY,
    plant_id UUID REFERENCES plant(id),
    electricity_kwh DOUBLE PRECISION,
    fuel_used DOUBLE PRECISION,
    fuel_type VARCHAR(100),
    recorded_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_energy_recorded_at ON energy_record(recorded_at);
CREATE INDEX idx_energy_plant_id ON energy_record(plant_id);
