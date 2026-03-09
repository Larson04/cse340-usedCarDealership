-- Database seed file for dealership inventory system
-- This file creates tables and inserts initial data

BEGIN;

-- Drop existing tables (reverse dependency order)
DROP TABLE IF EXISTS vehicle_images CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS service_requests CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;

----------------------------------------------------
-- USERS TABLE
----------------------------------------------------

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

----------------------------------------------------
-- CATEGORIES TABLE
----------------------------------------------------

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

----------------------------------------------------
-- VEHICLES TABLE
----------------------------------------------------

CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    mileage INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

----------------------------------------------------
-- VEHICLE IMAGES TABLE
----------------------------------------------------

CREATE TABLE vehicle_images (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

----------------------------------------------------
-- REVIEWS TABLE
----------------------------------------------------

CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

----------------------------------------------------
-- SERVICE REQUESTS TABLE
----------------------------------------------------

CREATE TABLE service_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    vehicle_id INTEGER,
    service_type VARCHAR(150),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

----------------------------------------------------
-- CONTACT MESSAGES TABLE
----------------------------------------------------

CREATE TABLE contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150),
    subject VARCHAR(200),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

----------------------------------------------------
-- INSERT CATEGORIES
----------------------------------------------------

INSERT INTO categories (name, description) VALUES
('Sedan', 'Standard passenger cars'),
('SUV', 'Sport utility vehicles'),
('Truck', 'Pickup trucks'),
('Economy', 'Affordable and fuel efficient vehicles'),
('Hatchback/Coupe', 'Compact hatchbacks and sporty coupes');

----------------------------------------------------
-- INSERT VEHICLES
----------------------------------------------------

INSERT INTO vehicles (category_id, make, model, year, price, mileage, description) VALUES
-- Sedans
(1, 'Toyota', 'Camry LE', 2016, 13995, 92300, 'Backup camera, Bluetooth'),
(1, 'Honda', 'Civic EX', 2018, 15750, 78400, 'Sunroof, Apple CarPlay'),
(1, 'Nissan', 'Altima SV', 2015, 11900, 105000, 'Remote start'),
(1, 'Hyundai', 'Sonata Sport', 2017, 12600, 89800, 'Heated seats'),
(1, 'Chevrolet', 'Malibu LT', 2014, 9995, 120500, 'Great commuter'),

-- SUVs
(2, 'Ford', 'Escape SE', 2017, 12950, 101200, 'Heated seats'),
(2, 'Toyota', 'RAV4 XLE', 2015, 14995, 110500, 'AWD'),
(2, 'Honda', 'CR-V EX', 2016, 16800, 98300, 'Reliable SUV'),
(2, 'Jeep', 'Cherokee Latitude', 2014, 11700, 127000, '4x4'),
(2, 'Subaru', 'Forester Premium', 2016, 15300, 102600, 'Great in snow'),

-- Trucks
(3, 'Ford', 'F-150 XLT', 2014, 18900, 125000, 'Tow package'),
(3, 'Chevrolet', 'Silverado 1500 LT', 2013, 17250, 138000, 'Bedliner'),
(3, 'Ram', '1500 Big Horn', 2015, 20800, 120400, '5.7L Hemi'),
(3, 'Toyota', 'Tacoma SR5', 2016, 23900, 109000, 'Reliable truck'),
(3, 'GMC', 'Sierra 1500 SLE', 2012, 16400, 145600, 'Well maintained'),

-- Economy
(4, 'Hyundai', 'Elantra SE', 2017, 11400, 88900, 'Great MPG'),
(4, 'Nissan', 'Versa Note', 2015, 7995, 104000, 'Affordable commuter'),
(4, 'Kia', 'Rio LX', 2016, 8450, 92300, 'Low maintenance'),
(4, 'Toyota', 'Corolla L', 2014, 10250, 118000, 'Reliable'),
(4, 'Ford', 'Focus SE', 2013, 7500, 126000, 'Clean interior'),

-- Hatchbacks/Coupes
(5, 'Subaru', 'Impreza Hatchback', 2016, 13200, 98000, 'AWD hatchback'),
(5, 'Dodge', 'Challenger SXT', 2014, 16600, 102700, 'Sport coupe'),
(5, 'Mazda', 'Mazda3 Hatchback Touring', 2017, 14800, 87900, 'Sporty'),
(5, 'Ford', 'Fiesta ST', 2015, 12400, 99500, 'Turbo hot hatch'),
(5, 'Volkswagen', 'Golf TSI', 2016, 13900, 105200, 'Turbo hatchback');

----------------------------------------------------
-- INSERT SAMPLE VEHICLE IMAGES
----------------------------------------------------

INSERT INTO vehicle_images (vehicle_id, image_url, alt_text, is_primary) VALUES
(1, '/images/2016_ToyotaCamryLE_1.webp', 'Toyota Camry Front View', TRUE),
(2, '/images/2018_HondaCivic_1.webp', 'Honda Civic Exterior', TRUE),
(4, '/images/2017_HyundaiSonataSport_1.webp', 'Hyundai Sonata Sport', TRUE),
(6, '/images/2017_FordEscapeSE_1.webp', 'Ford Escape Front', TRUE);

COMMIT;
