ALTER TABLE scope1
    ADD COLUMN IF NOT EXISTS emission_factor NUMERIC,
    ADD COLUMN IF NOT EXISTS calculated_emission NUMERIC;

ALTER TABLE scope2
    ADD COLUMN IF NOT EXISTS emission_factor NUMERIC,
    ADD COLUMN IF NOT EXISTS calculated_emission NUMERIC;

ALTER TABLE scope3_activities
    ADD COLUMN IF NOT EXISTS emission_factor NUMERIC,
    ADD COLUMN IF NOT EXISTS calculated_emission NUMERIC;

ALTER TABLE data_entry_submissions
    ADD COLUMN IF NOT EXISTS total_emission NUMERIC;
