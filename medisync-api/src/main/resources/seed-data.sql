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
ALTER SEQUENCE dev.notifications_notification_id_seq RESTART WITH 1;
ALTER SEQUENCE dev.admin_activity_logs_log_id_seq RESTART WITH 1;
ALTER SEQUENCE dev.inventory_logs_log_id_seq RESTART WITH 1;
ALTER SEQUENCE dev.password_resets_reset_id_seq RESTART WITH 1;

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
INSERT INTO dev.nurse_services (service_name, description, base_price) VALUES
('General Health Checkup', 'Basic health monitoring including BP, sugar, temperature', 500.00),
('Wound Dressing', 'Cleaning and dressing of wounds', 300.00),
('Injection Administration', 'Intramuscular or subcutaneous injections', 200.00),
('IV Drip Setup', 'Intravenous drip setup and monitoring', 800.00),
('Post-Surgery Care', 'Post-operative monitoring and wound care', 1200.00),
('Elder Care', 'Daily assistance and health monitoring for elderly patients', 1500.00),
('Physiotherapy Assistance', 'Basic physiotherapy exercises and monitoring', 700.00),
('Blood Sample Collection', 'Drawing blood for lab tests at home', 250.00);

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
(2, 1, 1, '15/A Ballygunge Circular Road, Kolkata', 'Regular health checkup needed', '2026-07-05', '10:00 AM', 'completed', NOW() - INTERVAL '30 days', NOW() - INTERVAL '28 days'),
(3, 1, 3, '42 New Town Action Area I, Kolkata', 'Need insulin injection daily', '2026-07-06', '08:00 AM', 'completed', NOW() - INTERVAL '25 days', NOW() - INTERVAL '23 days'),
(2, 2, 6, '15/A Ballygunge Circular Road, Kolkata', 'Elderly father needs daily monitoring', '2026-07-10', '09:00 AM', 'accepted', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days'),
(4, 1, 5, '7 Jadavpur University Campus Road, Kolkata', 'Post knee surgery care needed', '2026-07-08', '11:00 AM', 'in_progress', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days'),
(5, 2, 2, '33 Dum Dum Cantonment, Kolkata', 'Wound dressing after accident', '2026-07-12', '02:00 PM', 'pending', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
(3, 3, 4, '42 New Town Action Area I, Kolkata', 'IV drip for dehydration', '2026-07-15', '06:00 PM', 'pending', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

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
INSERT INTO dev.notifications (user_id, type, title, message, is_read, created_at) VALUES
(2, 'REQUEST_UPDATE', 'Nurse Request Accepted', 'Your nurse request #3 has been accepted by Anubhab Roy.', false, NOW() - INTERVAL '8 days'),
(2, 'SYSTEM', 'Welcome to MediSync', 'Thank you for joining MediSync! Explore medicines and book nurses.', true, NOW() - INTERVAL '60 days'),
(2, 'REQUEST_UPDATE', 'Request Completed', 'Your nurse request #1 has been marked as completed.', true, NOW() - INTERVAL '28 days'),
(3, 'REQUEST_UPDATE', 'Request Completed', 'Your nurse request #2 has been marked as completed.', true, NOW() - INTERVAL '23 days'),
(3, 'SYSTEM', 'Rate Your Experience', 'Please rate your recent nurse visit with Muskan Sharma.', false, NOW() - INTERVAL '22 days'),
(4, 'REQUEST_UPDATE', 'Nurse Request In Progress', 'Muskan Sharma is on the way for your post-surgery care.', false, NOW() - INTERVAL '5 days'),
(5, 'REQUEST_UPDATE', 'Nurse Request Submitted', 'Your nurse request #5 has been submitted. Waiting for nurse confirmation.', false, NOW() - INTERVAL '3 days'),
(1, 'ADMIN', 'New Pharmacy Registration', 'Aditya Apollo Pharmacy has submitted registration for approval.', false, NOW() - INTERVAL '10 days'),
(1, 'ADMIN', 'New Nurse Registration', 'Subhajit Sen has submitted nurse registration for approval.', false, NOW() - INTERVAL '5 days');

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
