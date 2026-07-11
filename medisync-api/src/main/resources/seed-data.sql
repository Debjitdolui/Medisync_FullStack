-- ═══════════════════════════════════════════════════════════════════
-- MediSync Database Seed Data
-- Run this script against PostgreSQL database: healthdb, schema: dev
-- 
-- This script:
--   1. Clears ALL existing data from tables (in correct FK order)
--   2. Resets sequences (auto-increment IDs start fresh)
--   3. Inserts comprehensive mock data for testing
--
-- All passwords are: "password123" (BCrypt hashed)
-- ═══════════════════════════════════════════════════════════════════

-- ─── STEP 1: CLEAR ALL TABLES (respecting FK constraints) ────────
TRUNCATE TABLE dev.inventory_logs CASCADE;
TRUNCATE TABLE dev.admin_activity_logs CASCADE;
TRUNCATE TABLE dev.nurse_reviews CASCADE;
TRUNCATE TABLE dev.pharmacy_reviews CASCADE;
TRUNCATE TABLE dev.nurse_requests CASCADE;
TRUNCATE TABLE dev.notifications CASCADE;
TRUNCATE TABLE dev.password_resets CASCADE;
-- Drop and recreate password_resets to remove old user_id column
DROP TABLE IF EXISTS dev.password_resets CASCADE;
CREATE TABLE dev.password_resets (
    reset_id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255),
    entity_type VARCHAR(255),
    otp_code VARCHAR(255),
    expires_at TIMESTAMP,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
TRUNCATE TABLE dev.medicines CASCADE;
TRUNCATE TABLE dev.medicine_categories CASCADE;
TRUNCATE TABLE dev.nurse_services CASCADE;
TRUNCATE TABLE dev.user_addresses CASCADE;
TRUNCATE TABLE dev.nurses CASCADE;
TRUNCATE TABLE dev.pharmacies CASCADE;
TRUNCATE TABLE dev.users CASCADE;

-- ─── STEP 2: RESET SEQUENCES ────────────────────────────────────
ALTER SEQUENCE dev.users_user_id_seq RESTART WITH 1;
ALTER SEQUENCE dev.pharmacies_pharmacy_id_seq RESTART WITH 1;
ALTER SEQUENCE dev.nurses_nurse_id_seq RESTART WITH 1;
ALTER SEQUENCE dev.medicine_categories_category_id_seq RESTART WITH 1;
ALTER SEQUENCE dev.medicines_medicine_id_seq RESTART WITH 1;
ALTER SEQUENCE dev.nurse_services_service_id_seq RESTART WITH 1;
ALTER SEQUENCE dev.user_addresses_address_id_seq RESTART WITH 1;
ALTER SEQUENCE dev.nurse_requests_request_id_seq RESTART WITH 1;
ALTER SEQUENCE dev.pharmacy_reviews_review_id_seq RESTART WITH 1;
ALTER SEQUENCE dev.nurse_reviews_review_id_seq RESTART WITH 1;
ALTER SEQUENCE dev.admin_activity_logs_log_id_seq RESTART WITH 1;
ALTER SEQUENCE dev.inventory_logs_log_id_seq RESTART WITH 1;

-- ─── STEP 3: INSERT MOCK DATA ───────────────────────────────────

-- BCrypt hash of "password123"
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

-- ═══════════════════════════════════════════════════════════════════
-- USERS (1 admin, 5 customers)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO dev.users (username, email, password_hash, phone, role, status, is_active, created_at, updated_at) VALUES
('debjit', 'debjit@admin.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9876543210', 'admin', 'active', true, NOW() - INTERVAL '90 days', NOW()),
('muskan', 'muskan@user.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9876543211', 'customer', 'active', true, NOW() - INTERVAL '60 days', NOW()),
('aditya', 'aditya@user.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9876543212', 'customer', 'active', true, NOW() - INTERVAL '45 days', NOW()),
('anubhab', 'anubhab@user.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9876543213', 'customer', 'active', true, NOW() - INTERVAL '30 days', NOW()),
('abhijit', 'abhijit@user.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9876543214', 'customer', 'active', true, NOW() - INTERVAL '20 days', NOW()),
('omkar', 'omkar@user.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9876543215', 'customer', 'blocked', false, NOW() - INTERVAL '15 days', NOW());

-- ═══════════════════════════════════════════════════════════════════
-- PHARMACIES (4 pharmacies: 2 approved, 1 pending, 1 rejected)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO dev.pharmacies (owner_name, email, password_hash, pharmacy_name, license_number, address, city, state, pincode, phone, latitude, longitude, approval_status, created_at, updated_at) VALUES
('Kaniska', 'kaniska@pharmacy.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Kaniska MedPlus', 'PH-KOL-2024-001', '45 Park Street', 'Kolkata', 'West Bengal', '700016', '9800000001', 22.5170, 88.3630, 'approved', NOW() - INTERVAL '80 days', NOW()),
('Subhajit', 'subhajit@pharmacy.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Subhajit HealthKart', 'PH-KOL-2024-002', '12 Salt Lake Sector V', 'Kolkata', 'West Bengal', '700091', '9800000002', 22.5726, 88.4313, 'approved', NOW() - INTERVAL '70 days', NOW()),
('Aditya', 'aditya@pharmacy.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Aditya Apollo Pharmacy', 'PH-HWH-2024-003', '78 GT Road', 'Howrah', 'West Bengal', '711101', '9800000003', 22.5958, 88.2636, 'pending', NOW() - INTERVAL '10 days', NOW()),
('Omkar', 'omkar@pharmacy.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Omkar LifeCare', 'PH-KOL-2024-004', '23 Gariahat Road', 'Kolkata', 'West Bengal', '700029', '9800000004', 22.5087, 88.3671, 'rejected', NOW() - INTERVAL '40 days', NOW());

-- ═══════════════════════════════════════════════════════════════════
-- NURSES (4 nurses: 2 approved/online, 1 approved/offline, 1 pending)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO dev.nurses (full_name, email, password_hash, phone, qualification, license_number, specialization, availability_status, approval_status, created_at, updated_at) VALUES
('Muskan Sharma', 'muskan@nurse.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9800100001', 'B.Sc Nursing', 'NR-WB-2024-001', 'General Care', 'online', 'approved', NOW() - INTERVAL '75 days', NOW()),
('Anubhab Roy', 'anubhab@nurse.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9800100002', 'GNM', 'NR-WB-2024-002', 'Elder Care', 'online', 'approved', NOW() - INTERVAL '60 days', NOW()),
('Abhijit Das', 'abhijit@nurse.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9800100003', 'B.Sc Nursing', 'NR-WB-2024-003', 'Post-Surgery Care', 'offline', 'approved', NOW() - INTERVAL '50 days', NOW()),
('Subhajit Sen', 'subhajit@nurse.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '9800100004', 'M.Sc Nursing', 'NR-WB-2024-004', 'Critical Care', 'offline', 'pending', NOW() - INTERVAL '5 days', NOW());


-- ═══════════════════════════════════════════════════════════════════
-- MEDICINE CATEGORIES
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO dev.medicine_categories (category_name, description) VALUES
('Antibiotics', 'Medicines that fight bacterial infections'),
('Pain Relief', 'Analgesics and anti-inflammatory medicines'),
('Cardiovascular', 'Heart and blood pressure medications'),
('Diabetes', 'Insulin and oral hypoglycemics'),
('Respiratory', 'Medicines for asthma, cough, and cold'),
('Gastrointestinal', 'Medicines for stomach and digestive issues'),
('Vitamins & Supplements', 'Nutritional supplements and vitamins'),
('Dermatology', 'Skin care and treatment medicines');

-- ═══════════════════════════════════════════════════════════════════
-- NURSE SERVICES
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO dev.nurse_services (service_name, description, base_price, duration_minutes) VALUES
('IV Drip', 'Intravenous drip setup, monitoring, and removal at home', 800.00, 240),
('Home Nursing', 'Complete home nursing care including health monitoring, medication management, and daily assistance', 1500.00, 480),
('Injection', 'Intramuscular or subcutaneous injection administration at home', 200.00, 30);

-- ═══════════════════════════════════════════════════════════════════
-- NURSE OFFERED SERVICES (link nurses to their services)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO dev.nurse_offered_services (nurse_id, service_id) VALUES
(1, 1), (1, 3),       -- Muskan: IV Drip, Injection
(2, 1), (2, 2),       -- Anubhab: IV Drip, Home Nursing
(3, 1), (3, 2), (3, 3), -- Abhijit: IV Drip, Home Nursing, Injection
(4, 3);               -- Subhajit: Injection

-- ═══════════════════════════════════════════════════════════════════
-- USER ADDRESSES
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO dev.user_addresses (user_id, address_line, city, state, pincode, latitude, longitude, is_default) VALUES
(2, '15/A Ballygunge Circular Road', 'Kolkata', 'West Bengal', '700019', 22.5268, 88.3639, true),
(2, '89 Behala Chowrasta', 'Kolkata', 'West Bengal', '700034', 22.4968, 88.3167, false),
(3, '42 New Town Action Area I', 'Kolkata', 'West Bengal', '700156', 22.5800, 88.4800, true),
(4, '7 Jadavpur University Campus Road', 'Kolkata', 'West Bengal', '700032', 22.4966, 88.3715, true),
(5, '33 Dum Dum Cantonment', 'Kolkata', 'West Bengal', '700028', 22.6400, 88.4200, true);

-- ═══════════════════════════════════════════════════════════════════
-- MEDICINES - Kaniska MedPlus (pharmacy_id: 1)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO dev.medicines (pharmacy_id, category_id, medicine_name, manufacturer, price, stock_quantity, expiry_date, description, created_at, updated_at) VALUES
(1, 1, 'Amoxicillin 500mg', 'Cipla', 85.00, 150, '2027-06-15', 'Broad-spectrum antibiotic for bacterial infections', NOW() - INTERVAL '60 days', NOW()),
(1, 1, 'Azithromycin 250mg', 'Sun Pharma', 120.00, 80, '2027-08-20', 'Macrolide antibiotic for respiratory infections', NOW() - INTERVAL '55 days', NOW()),
(1, 2, 'Paracetamol 500mg', 'GSK', 25.00, 500, '2028-01-10', 'Fever and mild pain relief', NOW() - INTERVAL '60 days', NOW()),
(1, 2, 'Ibuprofen 400mg', 'Mankind', 45.00, 200, '2027-11-30', 'Anti-inflammatory and pain relief', NOW() - INTERVAL '50 days', NOW()),
(1, 3, 'Amlodipine 5mg', 'Torrent', 35.00, 300, '2027-09-25', 'Calcium channel blocker for hypertension', NOW() - INTERVAL '45 days', NOW()),
(1, 4, 'Metformin 500mg', 'USV', 30.00, 250, '2027-12-15', 'Oral hypoglycemic for Type 2 diabetes', NOW() - INTERVAL '40 days', NOW()),
(1, 5, 'Cetirizine 10mg', 'Dr. Reddys', 20.00, 400, '2027-10-05', 'Antihistamine for allergies', NOW() - INTERVAL '35 days', NOW()),
(1, 6, 'Pantoprazole 40mg', 'Alkem', 55.00, 180, '2027-07-20', 'Proton pump inhibitor for acidity', NOW() - INTERVAL '30 days', NOW()),
(1, 7, 'Vitamin D3 1000IU', 'HealthVit', 180.00, 100, '2028-03-15', 'Vitamin D supplement for bone health', NOW() - INTERVAL '25 days', NOW()),
(1, 5, 'Montelukast 10mg', 'Zydus', 95.00, 120, '2027-11-10', 'Leukotriene inhibitor for asthma', NOW() - INTERVAL '20 days', NOW());

-- ═══════════════════════════════════════════════════════════════════
-- MEDICINES - Subhajit HealthKart (pharmacy_id: 2)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO dev.medicines (pharmacy_id, category_id, medicine_name, manufacturer, price, stock_quantity, expiry_date, description, created_at, updated_at) VALUES
(2, 1, 'Ciprofloxacin 500mg', 'Ranbaxy', 65.00, 100, '2027-05-20', 'Fluoroquinolone antibiotic', NOW() - INTERVAL '50 days', NOW()),
(2, 2, 'Diclofenac 50mg', 'Novartis', 40.00, 220, '2027-09-10', 'NSAID for pain and inflammation', NOW() - INTERVAL '45 days', NOW()),
(2, 2, 'Paracetamol 500mg', 'Micro Labs', 22.00, 600, '2028-02-28', 'Fever and pain relief', NOW() - INTERVAL '40 days', NOW()),
(2, 3, 'Atenolol 50mg', 'Ipca', 28.00, 180, '2027-08-15', 'Beta blocker for hypertension', NOW() - INTERVAL '35 days', NOW()),
(2, 4, 'Glimepiride 2mg', 'Sanofi', 75.00, 90, '2027-07-30', 'Sulfonylurea for Type 2 diabetes', NOW() - INTERVAL '30 days', NOW()),
(2, 6, 'Omeprazole 20mg', 'Hetero', 42.00, 250, '2027-10-20', 'Proton pump inhibitor for GERD', NOW() - INTERVAL '25 days', NOW()),
(2, 7, 'Multivitamin Tablets', 'Revital', 250.00, 150, '2028-05-10', 'Daily multivitamin and mineral supplement', NOW() - INTERVAL '20 days', NOW()),
(2, 8, 'Clotrimazole Cream', 'Glenmark', 85.00, 70, '2027-06-25', 'Antifungal cream for skin infections', NOW() - INTERVAL '15 days', NOW()),
(2, 5, 'Salbutamol Inhaler', 'Cipla', 130.00, 60, '2027-12-01', 'Bronchodilator for asthma relief', NOW() - INTERVAL '10 days', NOW()),
(2, 1, 'Amoxicillin 500mg', 'Sun Pharma', 90.00, 120, '2027-07-15', 'Penicillin antibiotic', NOW() - INTERVAL '5 days', NOW());


-- ═══════════════════════════════════════════════════════════════════
-- NURSE REQUESTS
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO dev.nurse_requests (patient_id, nurse_id, service_id, address, health_issue, request_date, preferred_time, request_status, created_at, updated_at) VALUES
(2, 1, 3, '15/A Ballygunge Circular Road, Kolkata', 'Need injection for vitamin deficiency', '2026-07-05', '10:00 AM', 'completed', NOW() - INTERVAL '30 days', NOW() - INTERVAL '28 days'),
(3, 1, 3, '42 New Town Action Area I, Kolkata', 'Need insulin injection daily', '2026-07-06', '08:00 AM', 'completed', NOW() - INTERVAL '25 days', NOW() - INTERVAL '23 days'),
(2, 2, 2, '15/A Ballygunge Circular Road, Kolkata', 'Elderly father needs daily monitoring', '2026-07-10', '09:00 AM', 'accepted', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days'),
(4, 1, 2, '7 Jadavpur University Campus Road, Kolkata', 'Post knee surgery home nursing needed', '2026-07-08', '11:00 AM', 'in_progress', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days'),
(5, 2, 1, '33 Dum Dum Cantonment, Kolkata', 'IV drip for dehydration after fever', '2026-07-12', '02:00 PM', 'pending', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(3, 3, 1, '42 New Town Action Area I, Kolkata', 'IV drip for weakness', '2026-07-15', '06:00 PM', 'pending', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- ═══════════════════════════════════════════════════════════════════
-- PHARMACY REVIEWS
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO dev.pharmacy_reviews (user_id, pharmacy_id, rating, review_text, created_at) VALUES
(2, 1, 5, 'Excellent service! Always have medicines in stock and prices are reasonable.', NOW() - INTERVAL '20 days'),
(3, 1, 4, 'Good pharmacy, quick delivery. Slightly expensive but reliable.', NOW() - INTERVAL '15 days'),
(4, 1, 4, 'Very professional staff. Clean and well-organized store.', NOW() - INTERVAL '10 days'),
(2, 2, 5, 'Best pharmacy in Salt Lake area. Great discounts on regular medicines.', NOW() - INTERVAL '18 days'),
(3, 2, 3, 'Decent pharmacy but sometimes out of stock for rare medicines.', NOW() - INTERVAL '12 days'),
(5, 2, 4, 'Good range of medicines. Home delivery is convenient.', NOW() - INTERVAL '8 days'),
(4, 2, 5, 'Highly recommend! Pharmacist is very helpful with advice.', NOW() - INTERVAL '5 days');

-- ═══════════════════════════════════════════════════════════════════
-- NURSE REVIEWS (only for completed requests)
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO dev.nurse_reviews (user_id, nurse_id, request_id, rating, review_text, created_at) VALUES
(2, 1, 1, 5, 'Muskan is very professional and caring. Thorough checkup done.', NOW() - INTERVAL '27 days'),
(3, 1, 2, 4, 'Good service, punctual and gentle with injections.', NOW() - INTERVAL '22 days'),
(4, 2, 3, 5, 'Anubhab is amazing with elderly patients. Very patient and kind.', NOW() - INTERVAL '7 days');

-- ═══════════════════════════════════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════════
-- Drop and recreate notifications table with new schema
DROP TABLE IF EXISTS dev.notifications CASCADE;
CREATE TABLE dev.notifications (
    notification_id BIGSERIAL PRIMARY KEY,
    recipient_email VARCHAR(255),
    recipient_type VARCHAR(255),
    type VARCHAR(255),
    title VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO dev.notifications (recipient_email, recipient_type, type, title, message, is_read, created_at) VALUES
-- User notifications
('muskan@user.com', 'user', 'REQUEST_UPDATE', 'Nurse Request Accepted', 'Your nurse request #3 has been accepted by Anubhab Roy.', false, NOW() - INTERVAL '8 days'),
('muskan@user.com', 'user', 'SYSTEM', 'Welcome to MediSync', 'Thank you for joining MediSync! Explore medicines and book nurses.', true, NOW() - INTERVAL '60 days'),
('muskan@user.com', 'user', 'REQUEST_UPDATE', 'Request Completed', 'Your nurse request #1 has been marked as completed.', true, NOW() - INTERVAL '28 days'),
('aditya@user.com', 'user', 'REQUEST_UPDATE', 'Request Completed', 'Your nurse request #2 has been marked as completed.', true, NOW() - INTERVAL '23 days'),
('aditya@user.com', 'user', 'SYSTEM', 'Rate Your Experience', 'Please rate your recent nurse visit with Muskan Sharma.', false, NOW() - INTERVAL '22 days'),
('anubhab@user.com', 'user', 'REQUEST_UPDATE', 'Nurse Request In Progress', 'Muskan Sharma is on the way for your post-surgery care.', false, NOW() - INTERVAL '5 days'),
('abhijit@user.com', 'user', 'REQUEST_UPDATE', 'Nurse Request Submitted', 'Your nurse request #5 has been submitted. Waiting for nurse confirmation.', false, NOW() - INTERVAL '3 days'),
-- Nurse notifications
('muskan@nurse.com', 'nurse', 'NEW_REQUEST', 'New Booking Request', 'You have a new Post-Surgery Care request from anubhab for 2026-07-08', false, NOW() - INTERVAL '7 days'),
('muskan@nurse.com', 'nurse', 'NEW_REVIEW', 'New Review Received (5★)', 'muskan left a 5-star review for your service.', false, NOW() - INTERVAL '27 days'),
('muskan@nurse.com', 'nurse', 'APPROVAL_UPDATE', 'Nurse Profile Approved!', 'Congratulations! Your nurse profile has been approved. You can now set your availability and accept requests.', true, NOW() - INTERVAL '74 days'),
('anubhab@nurse.com', 'nurse', 'NEW_REQUEST', 'New Booking Request', 'You have a new Wound Dressing request from abhijit for 2026-07-12', false, NOW() - INTERVAL '3 days'),
('anubhab@nurse.com', 'nurse', 'NEW_REVIEW', 'New Review Received (5★)', 'anubhab left a 5-star review for your service.', true, NOW() - INTERVAL '7 days'),
('anubhab@nurse.com', 'nurse', 'APPROVAL_UPDATE', 'Nurse Profile Approved!', 'Congratulations! Your nurse profile has been approved.', true, NOW() - INTERVAL '59 days'),
-- Pharmacy notifications
('kaniska@pharmacy.com', 'pharmacy', 'APPROVAL_UPDATE', 'Pharmacy Approved!', 'Congratulations! Your pharmacy Kaniska MedPlus has been approved. You can now manage your inventory.', true, NOW() - INTERVAL '79 days'),
('kaniska@pharmacy.com', 'pharmacy', 'NEW_REVIEW', 'New Review Received (5★)', 'muskan left a 5-star review for Kaniska MedPlus', false, NOW() - INTERVAL '20 days'),
('kaniska@pharmacy.com', 'pharmacy', 'NEW_REVIEW', 'New Review Received (4★)', 'aditya left a 4-star review for Kaniska MedPlus', false, NOW() - INTERVAL '15 days'),
('subhajit@pharmacy.com', 'pharmacy', 'APPROVAL_UPDATE', 'Pharmacy Approved!', 'Congratulations! Your pharmacy Subhajit HealthKart has been approved.', true, NOW() - INTERVAL '69 days'),
('subhajit@pharmacy.com', 'pharmacy', 'NEW_REVIEW', 'New Review Received (5★)', 'muskan left a 5-star review for Subhajit HealthKart', false, NOW() - INTERVAL '18 days'),
('aditya@pharmacy.com', 'pharmacy', 'SYSTEM', 'Registration Submitted', 'Your pharmacy registration is under review. We will notify you once approved.', true, NOW() - INTERVAL '10 days');

-- ═══════════════════════════════════════════════════════════════════
-- ADMIN ACTIVITY LOGS
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO dev.admin_activity_logs (admin_id, action, entity_type, entity_id, details, created_at) VALUES
(1, 'PHARMACY_APPROVED', 'Pharmacy', 1, 'Pharmacy Kaniska MedPlus approved', NOW() - INTERVAL '79 days'),
(1, 'PHARMACY_APPROVED', 'Pharmacy', 2, 'Pharmacy Subhajit HealthKart approved', NOW() - INTERVAL '69 days'),
(1, 'PHARMACY_REJECTED', 'Pharmacy', 4, 'Pharmacy Omkar LifeCare rejected - invalid license', NOW() - INTERVAL '38 days'),
(1, 'NURSE_APPROVED', 'Nurse', 1, 'Nurse Muskan Sharma approved', NOW() - INTERVAL '74 days'),
(1, 'NURSE_APPROVED', 'Nurse', 2, 'Nurse Anubhab Roy approved', NOW() - INTERVAL '59 days'),
(1, 'NURSE_APPROVED', 'Nurse', 3, 'Nurse Abhijit Das approved', NOW() - INTERVAL '49 days'),
(1, 'BLOCK_USER', 'User', 6, 'Blocked user omkar@user.com - suspicious activity', NOW() - INTERVAL '10 days');

-- ═══════════════════════════════════════════════════════════════════
-- INVENTORY LOGS
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO dev.inventory_logs (medicine_id, action, quantity_change, stock_after, created_at) VALUES
(1, 'add', 200, 150, NOW() - INTERVAL '60 days'),
(1, 'remove', -50, 150, NOW() - INTERVAL '30 days'),
(3, 'add', 500, 500, NOW() - INTERVAL '60 days'),
(11, 'add', 100, 100, NOW() - INTERVAL '50 days'),
(13, 'add', 600, 600, NOW() - INTERVAL '40 days');

-- ═══════════════════════════════════════════════════════════════════
-- DONE! Summary of test accounts:
-- ═══════════════════════════════════════════════════════════════════
-- 
-- ┌──────────────────────────────────────────────────────────────────┐
-- │ ROLE       │ EMAIL                    │ PASSWORD     │ NOTES     │
-- ├──────────────────────────────────────────────────────────────────┤
-- │ Admin      │ debjit@admin.com         │ password123  │           │
-- │ Customer   │ muskan@user.com          │ password123  │           │
-- │ Customer   │ aditya@user.com          │ password123  │           │
-- │ Customer   │ anubhab@user.com         │ password123  │           │
-- │ Customer   │ abhijit@user.com         │ password123  │           │
-- │ Customer   │ omkar@user.com           │ password123  │ BLOCKED   │
-- │ Pharmacy   │ kaniska@pharmacy.com     │ password123  │ APPROVED  │
-- │ Pharmacy   │ subhajit@pharmacy.com    │ password123  │ APPROVED  │
-- │ Pharmacy   │ aditya@pharmacy.com      │ password123  │ PENDING   │
-- │ Pharmacy   │ omkar@pharmacy.com       │ password123  │ REJECTED  │
-- │ Nurse      │ muskan@nurse.com         │ password123  │ ONLINE    │
-- │ Nurse      │ anubhab@nurse.com        │ password123  │ ONLINE    │
-- │ Nurse      │ abhijit@nurse.com        │ password123  │ OFFLINE   │
-- │ Nurse      │ subhajit@nurse.com       │ password123  │ PENDING   │
-- └──────────────────────────────────────────────────────────────────┘
--
-- All passwords: password123
-- ═══════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════
-- MIGRATION: Master Medicines System
-- This section sets up the centralized medicine management
-- ═══════════════════════════════════════════════════════════════════

-- Step 1: Clean old medicine data
TRUNCATE TABLE dev.inventory_logs CASCADE;
TRUNCATE TABLE dev.medicines CASCADE;
ALTER SEQUENCE dev.medicines_medicine_id_seq RESTART WITH 1;
ALTER SEQUENCE dev.inventory_logs_log_id_seq RESTART WITH 1;

-- Step 2: Create master_medicines table
DROP TABLE IF EXISTS dev.master_medicines CASCADE;
CREATE TABLE dev.master_medicines (
    master_medicine_id BIGSERIAL PRIMARY KEY,
    medicine_name VARCHAR(255) UNIQUE NOT NULL,
    category_id BIGINT REFERENCES dev.medicine_categories(category_id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Step 3: Alter medicines table for new structure
ALTER TABLE dev.medicines DROP COLUMN IF EXISTS expiry_date;
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='dev' AND table_name='medicines' AND column_name='manufacturer') THEN
        ALTER TABLE dev.medicines RENAME COLUMN manufacturer TO brand;
    END IF;
END $$;
ALTER TABLE dev.medicines ADD COLUMN IF NOT EXISTS master_medicine_id BIGINT REFERENCES dev.master_medicines(master_medicine_id);
ALTER TABLE dev.medicines DROP CONSTRAINT IF EXISTS medicines_pharmacy_id_medicine_name_key;

-- Step 4: Insert Master Medicines (admin-managed centralized list)
INSERT INTO dev.master_medicines (medicine_name, category_id) VALUES
-- Antibiotics (category_id: 1)
('Amoxicillin 500mg', 1),
('Azithromycin 250mg', 1),
('Azithromycin 500mg', 1),
('Ciprofloxacin 500mg', 1),
('Cefixime 200mg', 1),
('Doxycycline 100mg', 1),
('Metronidazole 400mg', 1),
-- Pain Relief (category_id: 2)
('Paracetamol 500mg', 2),
('Ibuprofen 400mg', 2),
('Diclofenac 50mg', 2),
('Aceclofenac 100mg', 2),
('Tramadol 50mg', 2),
-- Cardiovascular (category_id: 3)
('Amlodipine 5mg', 3),
('Atenolol 50mg', 3),
('Losartan 50mg', 3),
('Telmisartan 40mg', 3),
('Enalapril 5mg', 3),
-- Diabetes (category_id: 4)
('Metformin 500mg', 4),
('Glimepiride 2mg', 4),
('Sitagliptin 100mg', 4),
('Insulin Glargine', 4),
-- Respiratory (category_id: 5)
('Cetirizine 10mg', 5),
('Montelukast 10mg', 5),
('Salbutamol Inhaler', 5),
('Levocetrizine 5mg', 5),
('Budesonide Inhaler', 5),
-- Gastrointestinal (category_id: 6)
('Pantoprazole 40mg', 6),
('Omeprazole 20mg', 6),
('Ranitidine 150mg', 6),
('Domperidone 10mg', 6),
('Ondansetron 4mg', 6),
-- Vitamins & Supplements (category_id: 7)
('Vitamin D3 1000IU', 7),
('Vitamin B12 1500mcg', 7),
('Calcium + Vitamin D3', 7),
('Multivitamin Tablets', 7),
('Iron + Folic Acid', 7),
('Omega-3 Fish Oil', 7),
-- Dermatology (category_id: 8)
('Clotrimazole Cream', 8),
('Betamethasone Cream', 8),
('Ketoconazole Shampoo', 8),
('Mupirocin Ointment', 8);

-- Step 5: Insert fresh Pharmacy Medicines (linked to master)
-- Kaniska MedPlus (pharmacy_id: 1)
INSERT INTO dev.medicines (pharmacy_id, category_id, medicine_name, master_medicine_id, brand, price, stock_quantity, description, created_at, updated_at) VALUES
(1, 1, 'Amoxicillin 500mg', 1, 'Cipla', 85.00, 150, 'Broad-spectrum antibiotic', NOW() - INTERVAL '60 days', NOW()),
(1, 1, 'Azithromycin 250mg', 2, 'Sun Pharma', 120.00, 80, 'Macrolide antibiotic for respiratory infections', NOW() - INTERVAL '55 days', NOW()),
(1, 2, 'Paracetamol 500mg', 8, 'Crocin', 25.00, 500, 'Fever and mild pain relief', NOW() - INTERVAL '60 days', NOW()),
(1, 2, 'Ibuprofen 400mg', 9, 'Brufen', 45.00, 200, 'Anti-inflammatory and pain relief', NOW() - INTERVAL '50 days', NOW()),
(1, 3, 'Amlodipine 5mg', 13, 'Amlong', 35.00, 300, 'Calcium channel blocker for hypertension', NOW() - INTERVAL '45 days', NOW()),
(1, 4, 'Metformin 500mg', 18, 'Glycomet', 30.00, 250, 'Oral hypoglycemic for Type 2 diabetes', NOW() - INTERVAL '40 days', NOW()),
(1, 5, 'Cetirizine 10mg', 22, 'Alerid', 20.00, 400, 'Antihistamine for allergies', NOW() - INTERVAL '35 days', NOW()),
(1, 6, 'Pantoprazole 40mg', 27, 'Pan-D', 55.00, 180, 'Proton pump inhibitor for acidity', NOW() - INTERVAL '30 days', NOW()),
(1, 7, 'Vitamin D3 1000IU', 32, 'HealthVit', 180.00, 100, 'Vitamin D supplement for bone health', NOW() - INTERVAL '25 days', NOW()),
(1, 5, 'Montelukast 10mg', 23, 'Montair', 95.00, 120, 'Leukotriene inhibitor for asthma', NOW() - INTERVAL '20 days', NOW());

-- Subhajit HealthKart (pharmacy_id: 2)
INSERT INTO dev.medicines (pharmacy_id, category_id, medicine_name, master_medicine_id, brand, price, stock_quantity, description, created_at, updated_at) VALUES
(2, 1, 'Ciprofloxacin 500mg', 4, 'Ciplox', 65.00, 100, 'Fluoroquinolone antibiotic', NOW() - INTERVAL '50 days', NOW()),
(2, 2, 'Diclofenac 50mg', 10, 'Voveran', 40.00, 220, 'NSAID for pain and inflammation', NOW() - INTERVAL '45 days', NOW()),
(2, 2, 'Paracetamol 500mg', 8, 'Dolo', 22.00, 600, 'Fever and pain relief', NOW() - INTERVAL '40 days', NOW()),
(2, 3, 'Atenolol 50mg', 14, 'Tenormin', 28.00, 180, 'Beta blocker for hypertension', NOW() - INTERVAL '35 days', NOW()),
(2, 4, 'Glimepiride 2mg', 19, 'Amaryl', 75.00, 90, 'Sulfonylurea for Type 2 diabetes', NOW() - INTERVAL '30 days', NOW()),
(2, 6, 'Omeprazole 20mg', 28, 'Omez', 42.00, 250, 'Proton pump inhibitor for GERD', NOW() - INTERVAL '25 days', NOW()),
(2, 7, 'Multivitamin Tablets', 35, 'Revital', 250.00, 150, 'Daily multivitamin and mineral supplement', NOW() - INTERVAL '20 days', NOW()),
(2, 8, 'Clotrimazole Cream', 37, 'Candid', 85.00, 70, 'Antifungal cream for skin infections', NOW() - INTERVAL '15 days', NOW()),
(2, 5, 'Salbutamol Inhaler', 24, 'Asthalin', 130.00, 60, 'Bronchodilator for asthma relief', NOW() - INTERVAL '10 days', NOW()),
(2, 1, 'Amoxicillin 500mg', 1, 'Mox', 90.00, 120, 'Penicillin antibiotic', NOW() - INTERVAL '5 days', NOW());

-- Step 6: Fresh inventory logs
INSERT INTO dev.inventory_logs (medicine_id, action, quantity_change, stock_after, created_at) VALUES
(1, 'add', 150, 150, NOW() - INTERVAL '60 days'),
(3, 'add', 500, 500, NOW() - INTERVAL '60 days'),
(11, 'add', 100, 100, NOW() - INTERVAL '50 days'),
(13, 'add', 600, 600, NOW() - INTERVAL '40 days');
