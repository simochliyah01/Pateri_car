-- Allow self-registered web clients to have null CIN and phone initially.
-- Staff-created clients still should have these, but web registration only
-- collects email, name, and optionally phone.
ALTER TABLE clients ALTER COLUMN cin_passport DROP NOT NULL;
ALTER TABLE clients ALTER COLUMN phone       DROP NOT NULL;
