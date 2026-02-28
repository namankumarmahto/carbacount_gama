CREATE INDEX IF NOT EXISTS idx_emission_plant_id ON emission_record(plant_id);

-- Adding tenant_id or industry_id path indexing if needed. 
-- For now, our queries often traverse Plant -> Industry.
