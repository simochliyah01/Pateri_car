-- =============================================================================
-- PATERI CAR – V1 Initial Schema
-- PostgreSQL 15 · snake_case · BIGSERIAL PKs · TIMESTAMPTZ
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- GROUP 1 · Users & Auth
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE roles (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(50)  UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO roles (name, description) VALUES
    ('ADMIN',       'Full system access'),
    ('GERANT',      'Agency manager — full operational access'),
    ('COMMERCIAL',  'Sales agent — reservations and clients'),
    ('COMPTABLE',   'Accountant — payments and invoices');

CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    phone         VARCHAR(30),
    role_id       BIGINT NOT NULL REFERENCES roles(id),
    active        BOOLEAN DEFAULT TRUE,
    last_login    TIMESTAMP WITH TIME ZONE,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);

-- ─────────────────────────────────────────────────────────────────────────────
-- GROUP 2 · Clients
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE clients (
    id                BIGSERIAL PRIMARY KEY,
    first_name        VARCHAR(100) NOT NULL,
    last_name         VARCHAR(100) NOT NULL,
    cin_passport      VARCHAR(50)  UNIQUE NOT NULL,
    date_of_birth     DATE,
    phone             VARCHAR(30)  NOT NULL,
    email             VARCHAR(255),
    address           TEXT,
    city              VARCHAR(100),
    status            VARCHAR(20)  DEFAULT 'ACTIVE'
                          CHECK (status IN ('ACTIVE', 'BLOCKED', 'VIP')),
    is_blacklisted    BOOLEAN DEFAULT FALSE,
    blacklist_reason  TEXT,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at        TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_clients_cin_passport ON clients(cin_passport);
CREATE INDEX idx_clients_phone        ON clients(phone);
CREATE INDEX idx_clients_email        ON clients(email);

CREATE TABLE client_documents (
    id          BIGSERIAL PRIMARY KEY,
    client_id   BIGINT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    doc_type    VARCHAR(20) NOT NULL
                    CHECK (doc_type IN ('PERMIS', 'CIN', 'PASSPORT')),
    file_path   VARCHAR(500) NOT NULL,
    expiry_date DATE,
    verified    BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_client_documents_client_id ON client_documents(client_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- GROUP 3 · Vehicles
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE vehicles (
    id                      BIGSERIAL PRIMARY KEY,
    brand                   VARCHAR(50)     NOT NULL,
    model                   VARCHAR(100)    NOT NULL,
    year                    INTEGER         NOT NULL,
    license_plate           VARCHAR(20)     UNIQUE NOT NULL,
    vin                     VARCHAR(50)     UNIQUE,
    color                   VARCHAR(30),
    category                VARCHAR(20)     NOT NULL
                                CHECK (category IN (
                                    'ECONOMIQUE', 'COMPACTE', 'BERLINE',
                                    'SUV', 'PREMIUM', 'UTILITAIRE')),
    transmission            VARCHAR(10)     NOT NULL
                                CHECK (transmission IN ('MANUAL', 'AUTO')),
    fuel_type               VARCHAR(15)     NOT NULL
                                CHECK (fuel_type IN (
                                    'ESSENCE', 'DIESEL', 'HYBRIDE', 'ELECTRIQUE')),
    seats                   INTEGER         NOT NULL,
    doors                   INTEGER         DEFAULT 4,
    power_hp                INTEGER,
    engine_cc               INTEGER,
    consumption_per_100km   DECIMAL(4,2),
    price_per_day           DECIMAL(10,2)   NOT NULL,
    price_per_week          DECIMAL(10,2),
    price_per_month         DECIMAL(10,2),
    deposit                 DECIMAL(10,2)   NOT NULL,
    km_included_per_day     INTEGER         DEFAULT 200,
    price_per_extra_km      DECIMAL(6,2)    DEFAULT 2.00,
    insurance_expiry        DATE,
    registration_expiry     DATE,
    technical_visit_expiry  DATE,
    current_mileage         INTEGER         DEFAULT 0,
    last_oil_change_km      INTEGER,
    status                  VARCHAR(15)     DEFAULT 'AVAILABLE'
                                CHECK (status IN (
                                    'AVAILABLE', 'RENTED', 'MAINTENANCE', 'INACTIVE')),
    description             TEXT,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vehicles_status        ON vehicles(status);
CREATE INDEX idx_vehicles_category      ON vehicles(category);
CREATE INDEX idx_vehicles_license_plate ON vehicles(license_plate);

CREATE TABLE vehicle_photos (
    id            BIGSERIAL PRIMARY KEY,
    vehicle_id    BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    file_path     VARCHAR(500) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_main       BOOLEAN DEFAULT FALSE,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vehicle_photos_vehicle_id ON vehicle_photos(vehicle_id);

CREATE TABLE equipments (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50)
);

INSERT INTO equipments (name) VALUES
    ('Climatisation'),
    ('GPS'),
    ('Bluetooth'),
    ('USB'),
    ('Régulateur de vitesse'),
    ('Caméra de recul'),
    ('ABS'),
    ('Airbags'),
    ('ESP'),
    ('Toit ouvrant'),
    ('Sièges cuir'),
    ('Vitres électriques');

CREATE TABLE vehicle_equipments (
    vehicle_id   BIGINT REFERENCES vehicles(id)   ON DELETE CASCADE,
    equipment_id BIGINT REFERENCES equipments(id) ON DELETE CASCADE,
    PRIMARY KEY (vehicle_id, equipment_id)
);

CREATE TABLE maintenance_records (
    id           BIGSERIAL PRIMARY KEY,
    vehicle_id   BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    type         VARCHAR(30) NOT NULL
                     CHECK (type IN (
                         'VIDANGE', 'REPARATION', 'VISITE_TECHNIQUE',
                         'ASSURANCE', 'AUTRE')),
    service_date DATE        NOT NULL,
    mileage      INTEGER,
    cost         DECIMAL(10,2),
    garage_name  VARCHAR(255),
    description  TEXT,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_maintenance_vehicle_id   ON maintenance_records(vehicle_id);
CREATE INDEX idx_maintenance_service_date ON maintenance_records(service_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- GROUP 4 · Promotions
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE promotions (
    id             BIGSERIAL PRIMARY KEY,
    code           VARCHAR(50)  UNIQUE NOT NULL,
    discount_type  VARCHAR(20)  NOT NULL
                       CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
    discount_value DECIMAL(10,2) NOT NULL,
    start_date     DATE NOT NULL,
    end_date       DATE NOT NULL,
    max_uses       INTEGER,
    current_uses   INTEGER DEFAULT 0,
    active         BOOLEAN DEFAULT TRUE,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- GROUP 5 · Reservations
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE reservations (
    id                   BIGSERIAL PRIMARY KEY,
    reservation_number   VARCHAR(20)   UNIQUE NOT NULL,
    client_id            BIGINT        NOT NULL REFERENCES clients(id),
    vehicle_id           BIGINT        NOT NULL REFERENCES vehicles(id),
    commercial_id        BIGINT        REFERENCES users(id),
    promotion_id         BIGINT        REFERENCES promotions(id),
    start_date           DATE          NOT NULL,
    end_date             DATE          NOT NULL,
    duration_days        INTEGER       NOT NULL,
    pickup_location      VARCHAR(20)   NOT NULL
                             CHECK (pickup_location IN ('AGENCE', 'GARE', 'DOMICILE')),
    pickup_address       TEXT,
    return_location      VARCHAR(20)   NOT NULL
                             CHECK (return_location IN ('AGENCE', 'GARE', 'DOMICILE')),
    base_price           DECIMAL(10,2) NOT NULL,
    options_price        DECIMAL(10,2) DEFAULT 0,
    delivery_fee         DECIMAL(10,2) DEFAULT 0,
    discount_amount      DECIMAL(10,2) DEFAULT 0,
    total_price          DECIMAL(10,2) NOT NULL,
    status               VARCHAR(15)   DEFAULT 'PENDING'
                             CHECK (status IN (
                                 'PENDING', 'CONFIRMED', 'IN_PROGRESS',
                                 'COMPLETED', 'CANCELLED', 'DISPUTE')),
    departure_mileage    INTEGER,
    return_mileage       INTEGER,
    departure_fuel_level DECIMAL(3,2),
    return_fuel_level    DECIMAL(3,2),
    internal_notes       TEXT,
    contract_pdf_path    VARCHAR(500),
    created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at         TIMESTAMP WITH TIME ZONE,
    updated_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reservations_status             ON reservations(status);
CREATE INDEX idx_reservations_client_id          ON reservations(client_id);
CREATE INDEX idx_reservations_vehicle_id         ON reservations(vehicle_id);
CREATE INDEX idx_reservations_start_date         ON reservations(start_date);
CREATE INDEX idx_reservations_reservation_number ON reservations(reservation_number);

CREATE TABLE reservation_options (
    id             BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT        NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    option_type    VARCHAR(30)   NOT NULL
                       CHECK (option_type IN (
                           'GPS', 'CHILD_SEAT', 'ADDITIONAL_DRIVER', 'FULL_INSURANCE')),
    price_per_day  DECIMAL(8,2)  NOT NULL,
    total_price    DECIMAL(10,2) NOT NULL
);

CREATE INDEX idx_reservation_options_reservation_id ON reservation_options(reservation_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- GROUP 6 · Payments & Invoices
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE payments (
    id                   BIGSERIAL PRIMARY KEY,
    reservation_id       BIGINT        NOT NULL REFERENCES reservations(id),
    amount               DECIMAL(10,2) NOT NULL,
    payment_method       VARCHAR(20)   NOT NULL
                             CHECK (payment_method IN ('CASH', 'BANK_TRANSFER', 'CHECK')),
    status               VARCHAR(15)   DEFAULT 'PENDING'
                             CHECK (status IN ('PENDING', 'CONFIRMED', 'REJECTED')),
    payment_date         DATE          NOT NULL,
    -- Cash
    cash_received        DECIMAL(10,2),
    change_returned      DECIMAL(10,2),
    -- Bank transfer
    bank_name            VARCHAR(100),
    transfer_reference   VARCHAR(100),
    receipt_file_path    VARCHAR(500),
    -- Check
    check_number         VARCHAR(50),
    check_issue_date     DATE,
    check_holder_name    VARCHAR(200),
    check_status         VARCHAR(20)
                             CHECK (check_status IN (
                                 'RECEIVED', 'DEPOSITED', 'CASHED', 'REJECTED')),
    check_photo_path     VARCHAR(500),
    -- Common
    processed_by_user_id BIGINT REFERENCES users(id),
    notes                TEXT,
    created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Business-rule constraints per payment method
    CONSTRAINT chk_payment_cash
        CHECK (payment_method <> 'CASH'          OR cash_received IS NOT NULL),
    CONSTRAINT chk_payment_transfer
        CHECK (payment_method <> 'BANK_TRANSFER' OR (
            bank_name            IS NOT NULL AND
            transfer_reference   IS NOT NULL AND
            receipt_file_path    IS NOT NULL)),
    CONSTRAINT chk_payment_check
        CHECK (payment_method <> 'CHECK'         OR (
            check_number IS NOT NULL AND
            bank_name    IS NOT NULL))
);

CREATE INDEX idx_payments_reservation_id  ON payments(reservation_id);
CREATE INDEX idx_payments_payment_method  ON payments(payment_method);
CREATE INDEX idx_payments_status          ON payments(status);

CREATE TABLE invoices (
    id             BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT        NOT NULL UNIQUE REFERENCES reservations(id),
    invoice_number VARCHAR(30)   UNIQUE NOT NULL,
    invoice_date   DATE          NOT NULL,
    amount_ht      DECIMAL(10,2) NOT NULL,
    tva_rate       DECIMAL(5,2)  DEFAULT 20.00,
    tva_amount     DECIMAL(10,2) NOT NULL,
    amount_ttc     DECIMAL(10,2) NOT NULL,
    pdf_file_path  VARCHAR(500),
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_invoice_date   ON invoices(invoice_date);

-- ─────────────────────────────────────────────────────────────────────────────
-- GROUP 7 · Reviews
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE reviews (
    id             BIGSERIAL PRIMARY KEY,
    client_id      BIGINT  NOT NULL REFERENCES clients(id),
    vehicle_id     BIGINT  NOT NULL REFERENCES vehicles(id),
    reservation_id BIGINT  REFERENCES reservations(id),
    rating         INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment        TEXT,
    status         VARCHAR(15) DEFAULT 'PENDING'
                       CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_vehicle_id ON reviews(vehicle_id);
CREATE INDEX idx_reviews_status     ON reviews(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGERS · auto-update updated_at
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_reservations_updated_at
    BEFORE UPDATE ON reservations
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
