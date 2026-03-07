ALTER TABLE emission_factors
    ADD COLUMN IF NOT EXISTS industry_type VARCHAR(255);

UPDATE emission_factors
SET industry_type = COALESCE(industry_type, 'ALL')
WHERE industry_type IS NULL;

CREATE INDEX IF NOT EXISTS idx_emission_factors_scope_industry_source_unit_year
    ON emission_factors(scope_type, industry_type, source_name, unit, factor_year);
