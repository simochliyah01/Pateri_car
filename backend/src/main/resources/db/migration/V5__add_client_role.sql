-- Add CLIENT role for self-registration from the public-facing website
INSERT INTO roles (name, description)
VALUES ('CLIENT', 'End customer — can browse vehicles and manage own reservations')
ON CONFLICT (name) DO NOTHING;
