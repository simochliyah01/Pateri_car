-- V4: Seed a test client for development & API testing
INSERT INTO clients (first_name, last_name, cin_passport, phone, email, city, status, is_blacklisted, created_at, updated_at)
VALUES ('Mohamed', 'Alami', 'BJ123456', '0661234567', 'mohammed.alami@gmail.com', 'Taza', 'ACTIVE', false, NOW(), NOW());
