# MediSync API - cURL Commands
# Base URL: http://localhost:8080
# Run these in PowerShell or Git Bash

# ============================================================
# 1. AUTH
# ============================================================

# 1.1 Register User
curl -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d "{\"username\":\"debjit\",\"email\":\"debjit@mail.com\",\"password\":\"Pass@123\",\"phone\":\"9876543210\"}"

# 1.2 Login User
curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"debjit@mail.com\",\"password\":\"Pass@123\"}"

# 1.3 Forgot Password
curl -X POST http://localhost:8080/api/auth/forgot-password -H "Content-Type: application/json" -d "{\"email\":\"debjit@mail.com\"}"

# 1.4 Reset Password
curl -X POST http://localhost:8080/api/auth/reset-password -H "Content-Type: application/json" -d "{\"email\":\"debjit@mail.com\",\"otp\":\"123456\",\"newPassword\":\"NewPass@123\"}"

# ============================================================
# 2. USER PROFILE
# ============================================================

# 2.1 Get Profile
curl -X GET http://localhost:8080/api/users/me -H "X-User-Email: debjit@mail.com"

# 2.2 Update Profile
curl -X PUT http://localhost:8080/api/users/profile -H "X-User-Email: debjit@mail.com" -H "Content-Type: application/json" -d "{\"username\":\"debjit_updated\",\"phone\":\"9999999999\"}"

# 2.3 Deactivate Account
curl -X POST http://localhost:8080/api/users/deactivate -H "X-User-Email: debjit@mail.com"

# 2.4 Reactivate Account
curl -X POST http://localhost:8080/api/users/reactivate -H "Content-Type: application/json" -d "{\"email\":\"debjit@mail.com\",\"password\":\"Pass@123\"}"

# ============================================================
# 3. ADDRESSES
# ============================================================

# 3.1 Add Address
curl -X POST http://localhost:8080/api/addresses -H "X-User-Email: debjit@mail.com" -H "Content-Type: application/json" -d "{\"addressLine\":\"123 Main Street\",\"city\":\"Kolkata\",\"state\":\"West Bengal\",\"pincode\":\"700001\",\"latitude\":22.5726,\"longitude\":88.3639,\"isDefault\":true}"

# 3.2 Get All Addresses
curl -X GET http://localhost:8080/api/addresses -H "X-User-Email: debjit@mail.com"

# 3.3 Update Address (replace 1 with actual address ID)
curl -X PUT http://localhost:8080/api/addresses/1 -H "X-User-Email: debjit@mail.com" -H "Content-Type: application/json" -d "{\"addressLine\":\"456 Park Road\",\"city\":\"Kolkata\",\"state\":\"West Bengal\",\"pincode\":\"700016\",\"latitude\":22.5550,\"longitude\":88.3520,\"isDefault\":true}"

# 3.4 Delete Address
curl -X DELETE http://localhost:8080/api/addresses/1 -H "X-User-Email: debjit@mail.com"

# ============================================================
# 4. PHARMACY
# ============================================================

# 4.1 Register Pharmacy
curl -X POST http://localhost:8080/api/pharmacies/register -H "Content-Type: application/json" -d "{\"ownerName\":\"Rajesh Kumar\",\"email\":\"rajesh@mail.com\",\"password\":\"Pharm@123\",\"pharmacyName\":\"HealthPlus Pharmacy\",\"licenseNumber\":\"LIC-001\",\"address\":\"45 MG Road\",\"city\":\"Kolkata\",\"state\":\"West Bengal\",\"pincode\":\"700001\",\"phone\":\"9876543210\",\"latitude\":22.5726,\"longitude\":88.3639}"

# 4.2 Login Pharmacy
curl -X POST http://localhost:8080/api/pharmacies/login -H "Content-Type: application/json" -d "{\"email\":\"rajesh@mail.com\",\"password\":\"Pharm@123\"}"

# 4.3 Get Pharmacy by ID
curl -X GET http://localhost:8080/api/pharmacies/1

# 4.4 Update Pharmacy
curl -X PUT http://localhost:8080/api/pharmacies/1 -H "Content-Type: application/json" -d "{\"ownerName\":\"Rajesh Kumar\",\"pharmacyName\":\"HealthPlus Pharmacy Updated\",\"licenseNumber\":\"LIC-001\",\"address\":\"45 MG Road\",\"city\":\"Kolkata\",\"state\":\"West Bengal\",\"pincode\":\"700001\",\"phone\":\"9876543210\",\"latitude\":22.5726,\"longitude\":88.3639}"

# 4.5 Pharmacy Dashboard
curl -X GET http://localhost:8080/api/pharmacies/me/dashboard -H "X-User-Email: rajesh@mail.com"

# 4.6 List All Approved Pharmacies
curl -X GET http://localhost:8080/api/pharmacies

# ============================================================
# 5. MEDICINE & INVENTORY
# ============================================================

# 5.1 Add Medicine
curl -X POST http://localhost:8080/api/medicines -H "Content-Type: application/json" -d "{\"pharmacyId\":1,\"categoryId\":1,\"medicineName\":\"Paracetamol 500mg\",\"manufacturer\":\"Cipla\",\"price\":25.50,\"stockQuantity\":100,\"expiryDate\":\"2027-12-31\",\"description\":\"Fever and pain relief\"}"

# 5.2 Update Medicine
curl -X PUT http://localhost:8080/api/medicines/1 -H "Content-Type: application/json" -d "{\"pharmacyId\":1,\"categoryId\":1,\"medicineName\":\"Paracetamol 500mg\",\"manufacturer\":\"Cipla\",\"price\":30.00,\"stockQuantity\":150,\"expiryDate\":\"2027-12-31\",\"description\":\"Fever and pain relief - updated\"}"

# 5.3 Delete Medicine
curl -X DELETE http://localhost:8080/api/medicines/1

# 5.4 Get Medicines by Pharmacy
curl -X GET "http://localhost:8080/api/medicines?pharmacyId=1"

# 5.5 Update Stock
curl -X PUT http://localhost:8080/api/medicines/1/stock -H "Content-Type: application/json" -d "{\"quantity\":50,\"action\":\"add\"}"

# 5.6 Get All Categories
curl -X GET http://localhost:8080/api/medicines/categories

# ============================================================
# 6. PRESCRIPTION SEARCH (CORE FEATURE)
# ============================================================

# 6.1 Search Prescription - Find pharmacies with ALL medicines
curl -X POST http://localhost:8080/api/search/prescription -H "Content-Type: application/json" -d "{\"medicineNames\":[\"Paracetamol 500mg\",\"Amoxicillin 250mg\"],\"latitude\":22.5726,\"longitude\":88.3639,\"maxDistanceKm\":10.0}"

# 6.2 Search Medicines by Name
curl -X GET "http://localhost:8080/api/search/medicines?name=paracetamol"

# ============================================================
# 7. NURSE
# ============================================================

# 7.1 Register Nurse
curl -X POST http://localhost:8080/api/nurses/register -H "Content-Type: application/json" -d "{\"fullName\":\"Priya Sharma\",\"email\":\"priya@mail.com\",\"password\":\"Nurse@123\",\"phone\":\"9123456780\",\"qualification\":\"B.Sc Nursing\",\"licenseNumber\":\"NUR-001\",\"specialization\":\"Home Care\"}"

# 7.2 Login Nurse
curl -X POST http://localhost:8080/api/nurses/login -H "Content-Type: application/json" -d "{\"email\":\"priya@mail.com\",\"password\":\"Nurse@123\"}"

# 7.3 Update Availability
curl -X PUT "http://localhost:8080/api/nurses/availability?status=online" -H "X-User-Email: priya@mail.com"

# 7.4 Get Available Nurses
curl -X GET http://localhost:8080/api/nurses/available

# 7.5 Get Nurse by ID
curl -X GET http://localhost:8080/api/nurses/1

# 7.6 Get Nurse Services (3 fixed services)
curl -X GET http://localhost:8080/api/nurses/services

# ============================================================
# 8. NURSE REQUESTS
# ============================================================

# 8.1 Create Nurse Request (as patient)
curl -X POST http://localhost:8080/api/nurse-requests -H "X-User-Email: debjit@mail.com" -H "Content-Type: application/json" -d "{\"nurseId\":1,\"serviceId\":1,\"address\":\"123 Main Street, Kolkata\",\"healthIssue\":\"Need insulin injection\",\"requestDate\":\"2026-06-25\",\"preferredTime\":\"10:00 AM\"}"

# 8.2 Get My Requests (as patient)
curl -X GET http://localhost:8080/api/nurse-requests/my -H "X-User-Email: debjit@mail.com"

# 8.3 Get Incoming Requests (as nurse)
curl -X GET http://localhost:8080/api/nurse-requests/nurse -H "X-User-Email: priya@mail.com"

# 8.4 Update Request Status (accept/in_progress/completed/cancelled)
curl -X PUT "http://localhost:8080/api/nurse-requests/1/status?status=accepted"

# ============================================================
# 9. REVIEWS & RATINGS
# ============================================================

# 9.1 Add Pharmacy Review
curl -X POST http://localhost:8080/api/reviews/pharmacy -H "X-User-Email: debjit@mail.com" -H "Content-Type: application/json" -d "{\"pharmacyId\":1,\"rating\":5,\"reviewText\":\"Excellent service, had all my medicines!\"}"

# 9.2 Get Pharmacy Reviews
curl -X GET http://localhost:8080/api/reviews/pharmacy/1

# 9.3 Add Nurse Review
curl -X POST http://localhost:8080/api/reviews/nurse -H "X-User-Email: debjit@mail.com" -H "Content-Type: application/json" -d "{\"nurseId\":1,\"requestId\":1,\"rating\":4,\"reviewText\":\"Very professional and caring\"}"

# 9.4 Get Nurse Reviews
curl -X GET http://localhost:8080/api/reviews/nurse/1

# ============================================================
# 10. ADMIN
# ============================================================

# 10.1 Approve Pharmacy (status: approved/rejected)
curl -X PUT "http://localhost:8080/api/admin/pharmacies/1/approve?status=approved" -H "X-User-Email: admin@mail.com"

# 10.2 Approve Nurse (status: approved/rejected)
curl -X PUT "http://localhost:8080/api/admin/nurses/1/approve?status=approved" -H "X-User-Email: admin@mail.com"

# 10.3 Get All Users
curl -X GET http://localhost:8080/api/admin/users

# 10.4 Block User
curl -X PUT http://localhost:8080/api/admin/users/1/block -H "X-User-Email: admin@mail.com"

# 10.5 Unblock User
curl -X PUT http://localhost:8080/api/admin/users/1/unblock -H "X-User-Email: admin@mail.com"

# 10.6 Admin Dashboard
curl -X GET http://localhost:8080/api/admin/dashboard

# 10.7 Activity Logs
curl -X GET http://localhost:8080/api/admin/logs

# 10.8 Reports
curl -X GET http://localhost:8080/api/admin/reports

# ============================================================
# 11. NOTIFICATIONS
# ============================================================

# 11.1 Get My Notifications
curl -X GET http://localhost:8080/api/notifications -H "X-User-Email: debjit@mail.com"

# 11.2 Mark Notification as Read
curl -X PUT http://localhost:8080/api/notifications/1/read
