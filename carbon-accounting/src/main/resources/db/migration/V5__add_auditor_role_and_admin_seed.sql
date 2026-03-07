-- V5: Add AUDITOR role and seed platform ADMIN user
-- The AUDITOR role is added between DATA_ENTRY and VIEWER
-- The platform ADMIN user is seeded directly (never via API)

-- 1. Add AUDITOR role
-- Sync sequence first because V1 seeded roles with explicit IDs
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));

INSERT INTO roles (name) 
VALUES ('AUDITOR')
ON CONFLICT (name) DO NOTHING;

-- 2. Seed the platform ADMIN user
-- Password: Admin@12345 (BCrypt cost-10 hash)
-- This user is the platform super-admin. Never create via API.
-- The user has NO entry in organization_users — this is how CustomUserDetailsService
-- detects it as the platform ADMIN and assigns ROLE_ADMIN automatically.
INSERT INTO users (id, full_name, email, password_hash, status)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Platform Administrator',
    'admin@carbacount.com',
    '$2a$10$slYQmyNdgTY18LREe68mguAAjjyV/2bFobwi7E7V3.7PonCUcLNZy',
    'ACTIVE'
) ON CONFLICT (id) DO NOTHING;
-- Default password: Admin@12345
-- IMPORTANT: Change this password via forgot-password flow after first setup.
-- To verify hash:  BCrypt.matches("Admin@12345", "$2a$10$slYQmyNdgTY18LREe68mguAAjjyV/2bFobwi7E7V3.7PonCUcLNZy") == true
