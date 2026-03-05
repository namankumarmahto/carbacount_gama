-- V7: Allow NULL password_hash for invited (PENDING) users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
