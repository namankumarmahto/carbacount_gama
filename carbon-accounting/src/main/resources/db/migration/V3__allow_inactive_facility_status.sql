-- V3: Allow INACTIVE as a valid facility status
-- The original CHECK constraint only allowed 'ACTIVE' and 'ARCHIVED',
-- but the application needs to support 'INACTIVE' for the toggle feature.

ALTER TABLE facilities DROP CONSTRAINT IF EXISTS facilities_status_check;

ALTER TABLE facilities
    ADD CONSTRAINT facilities_status_check
    CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED'));
