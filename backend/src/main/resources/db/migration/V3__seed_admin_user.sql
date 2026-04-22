-- V3: Seed initial admin user for PATERI CAR
-- Password: Admin@2026 (BCrypt strength 10)

INSERT INTO users (email, password_hash, first_name, last_name, role_id, active, created_at, updated_at)
VALUES (
    'admin@patericar.ma',
    '$2a$10$vHYgTrRH5hmMxahj2m5H6u675Hkt/AEmlzAVH3MSsq/9oKQxXhYIG',
    'Super',
    'Admin',
    (SELECT id FROM roles WHERE name = 'ADMIN'),
    true,
    NOW(),
    NOW()
);
