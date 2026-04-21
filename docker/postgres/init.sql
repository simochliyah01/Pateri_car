-- PATERI CAR – initial database setup
-- Tables will be created and managed by Flyway migrations (backend/src/main/resources/db/migration/)

-- Ensure the database exists (PostgreSQL creates it via POSTGRES_DB env var,
-- but keeping this here as documentation of intent)
-- CREATE DATABASE patericar_db;

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";
