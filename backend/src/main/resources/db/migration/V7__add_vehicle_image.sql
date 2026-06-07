ALTER TABLE vehicles
    ADD COLUMN image_data            BYTEA,
    ADD COLUMN image_content_type    VARCHAR(100),
    ADD COLUMN image_uploaded_at     TIMESTAMP;

CREATE INDEX idx_vehicles_has_image ON vehicles ((image_data IS NOT NULL));
