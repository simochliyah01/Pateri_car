-- V2: Sample vehicle fleet for PATERI CAR – Taza agency (Fès-Meknès region)
-- 8 vehicles typical of the Moroccan car rental market

INSERT INTO vehicles (
    brand, model, year, license_plate, color, category, transmission, fuel_type,
    seats, doors, power_hp, engine_cc, consumption_per_100km,
    price_per_day, price_per_week, price_per_month, deposit,
    km_included_per_day, price_per_extra_km,
    insurance_expiry, registration_expiry, technical_visit_expiry,
    current_mileage, last_oil_change_km,
    status, description
) VALUES

-- 1. Dacia Logan 2023 – Économique flagship
('Dacia', 'Logan', 2023, '12345-A-6', 'Blanc', 'ECONOMIQUE', 'MANUAL', 'ESSENCE',
 5, 4, 90, 999, 6.5,
 200.00, 1200.00, 4500.00, 2000.00,
 200, 2.00,
 '2027-03-31', '2027-03-31', '2026-09-15',
 24500, 20000,
 'AVAILABLE', 'Économique et fiable, idéale pour les petits budgets.'),

-- 2. Dacia Sandero 2024 – Économique moderne
('Dacia', 'Sandero Stepway', 2024, '23456-B-6', 'Gris', 'ECONOMIQUE', 'MANUAL', 'ESSENCE',
 5, 4, 90, 999, 6.2,
 220.00, 1320.00, 5000.00, 2000.00,
 200, 2.00,
 '2027-06-30', '2028-01-15', '2026-12-01',
 8200, 5000,
 'AVAILABLE', 'Nouvelle génération Sandero, confort amélioré et style moderne.'),

-- 3. Renault Clio V 2023 – Compacte populaire
('Renault', 'Clio V', 2023, '34567-C-6', 'Rouge', 'COMPACTE', 'MANUAL', 'ESSENCE',
 5, 4, 100, 1000, 5.8,
 280.00, 1680.00, 6300.00, 3000.00,
 200, 2.50,
 '2027-01-31', '2027-06-30', '2026-07-20',
 32000, 30000,
 'AVAILABLE', 'Citadine élégante avec équipements modernes et faible consommation.'),

-- 4. Peugeot 208 2024 – Compacte premium
('Peugeot', '208', 2024, '45678-D-6', 'Bleu', 'COMPACTE', 'MANUAL', 'ESSENCE',
 5, 4, 100, 1199, 5.5,
 300.00, 1800.00, 6800.00, 3000.00,
 200, 2.50,
 '2027-09-30', '2028-03-01', '2027-03-10',
 5500, 5000,
 'AVAILABLE', 'Design i-Cockpit, tableau de bord digital, très agréable à conduire.'),

-- 5. Hyundai i20 2023 – Compacte coréenne
('Hyundai', 'i20', 2023, '56789-E-6', 'Blanc Perle', 'COMPACTE', 'MANUAL', 'ESSENCE',
 5, 4, 100, 1197, 5.9,
 270.00, 1620.00, 6000.00, 2500.00,
 200, 2.50,
 '2026-12-31', '2027-09-30', '2026-08-05',
 41000, 40000,
 'AVAILABLE', 'Fiabilité Hyundai, garantie étendue, très bien équipée.'),

-- 6. Dacia Duster 2024 – SUV abordable
('Dacia', 'Duster', 2024, '67890-F-6', 'Gris Foncé', 'SUV', 'MANUAL', 'DIESEL',
 5, 5, 115, 1461, 5.8,
 450.00, 2700.00, 10000.00, 5000.00,
 250, 3.00,
 '2027-08-31', '2028-06-15', '2027-06-20',
 12000, 10000,
 'AVAILABLE', 'SUV robuste et polyvalent, idéal pour les routes de montagne autour de Taza.'),

-- 7. Toyota Yaris Hybrid 2024 – Hybride économique
('Toyota', 'Yaris Hybrid', 2024, '78901-G-6', 'Argent', 'COMPACTE', 'AUTO', 'HYBRIDE',
 5, 4, 116, 1490, 3.8,
 320.00, 1920.00, 7200.00, 3500.00,
 200, 2.50,
 '2027-11-30', '2028-09-01', '2027-09-15',
 9800, 5000,
 'AVAILABLE', 'Hybride Toyota éprouvé, boîte automatique, consommation ultra-faible.'),

-- 8. Renault Captur 2023 – SUV compact
('Renault', 'Captur', 2023, '89012-H-6', 'Orange', 'SUV', 'MANUAL', 'DIESEL',
 5, 5, 115, 1461, 5.4,
 400.00, 2400.00, 9000.00, 4500.00,
 250, 3.00,
 '2026-11-30', '2027-12-01', '2026-10-08',
 28000, 25000,
 'AVAILABLE', 'SUV urbain élégant, grand coffre, parfait pour les familles.');
