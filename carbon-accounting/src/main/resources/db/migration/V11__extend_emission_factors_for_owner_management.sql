ALTER TABLE emission_factors
    ADD COLUMN IF NOT EXISTS scope_type VARCHAR(20),
    ADD COLUMN IF NOT EXISTS activity_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS source_name VARCHAR(255),
    ADD COLUMN IF NOT EXISTS unit_of_factor VARCHAR(100);

UPDATE emission_factors
SET scope_type = CASE
        WHEN fuel_type IS NOT NULL THEN 'SCOPE1'
        WHEN electricity_source IS NOT NULL THEN 'SCOPE2'
        ELSE scope_type
    END
WHERE scope_type IS NULL;

UPDATE emission_factors
SET source_name = COALESCE(source_name, fuel_type, electricity_source)
WHERE source_name IS NULL;

UPDATE emission_factors
SET activity_type = CASE
        WHEN scope_type = 'SCOPE1' THEN COALESCE(activity_type, 'Fuel')
        WHEN scope_type = 'SCOPE2' THEN COALESCE(activity_type, 'Electricity')
        WHEN scope_type = 'SCOPE3' THEN COALESCE(activity_type, 'Indirect')
        ELSE COALESCE(activity_type, 'General')
    END
WHERE activity_type IS NULL;

UPDATE emission_factors
SET unit_of_factor = COALESCE(unit_of_factor, 'kg CO2e per unit')
WHERE unit_of_factor IS NULL;

CREATE INDEX IF NOT EXISTS idx_emission_factors_scope_source_unit_year
    ON emission_factors(scope_type, source_name, unit, factor_year);
