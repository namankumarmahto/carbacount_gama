CREATE TABLE emission_summary_daily (
    id UUID PRIMARY KEY,
    plant_id UUID NOT NULL,
    total_emission DOUBLE PRECISION NOT NULL,
    summary_date DATE NOT NULL,
    CONSTRAINT fk_summary_plant FOREIGN KEY (plant_id) REFERENCES plant(id)
);

CREATE INDEX idx_summary_daily_date ON emission_summary_daily(summary_date);
CREATE INDEX idx_summary_daily_plant ON emission_summary_daily(plant_id);
