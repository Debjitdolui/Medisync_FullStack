# MediSync API Documentation

**Base URL:** `http://localhost:8080`  
**Authentication:** Disabled (JWT will be added later)  
**Content-Type:** `application/json`

## How User Identity Works (No JWT)

Since JWT is disabled, endpoints that need to know "who is calling" use a custom header:

```
X-User-Email: john@example.com
```

**Endpoints requiring this header:**
- All `/api/users/*` endpoints (except `/reactivate`)
- All `/api/addresses/*` endpoints
- `PUT /api/nurses/availability`
- All `/api/nurse-requests/*` (POST, GET /my, GET /nurse)
- `POST /api/reviews/pharmacy` and `POST /api/reviews/nurse`
- All `/api/admin/*` state-change endpoints (approve, block, unblock)
- `GET /api/pharmacies/me/dashboard`
- `GET /api/notifications`

**Endpoints that DON'T need this header:**
- All `/api/auth/*` endpoints
- `POST/GET /api/pharmacies/register`, `/login`, `/{id}`, `/`
- `POST/GET /api/nurses/register`, `/login`, `/available`, `/{id}`, `/services`
- All `/api/medicines/*` endpoints
- All `/api/search/*` endpoints
- `GET /api/reviews/pharmacy/{id}`, `GET /api/reviews/nurse/{id}`
- `GET /api/admin/users`, `/dashboard`, `/logs`, `/reports`

---

## Table of Contents

1. [Auth](#1-auth)
2. [User](#2-user)
3. [Addresses](#3-addresses)
4. [Pharmacy](#4-pharmacy)
5. [Medicine](#5-medicine)
6. [Prescription Search](#6-prescription-search)
7. [Nurse](#7-nurse)
8. [Nurse Requests](#8-nurse-requests)
9. [Reviews](#9-reviews)
10. [Admin](#10-admin)
11. [Notifications](#11-notifications)

---

## 1. Auth

### 1.1 Register

**Endpoint:** `POST /api/auth/register`

**Description:** Register a new user account.

**Request Body:**

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "+919876543210"
}
```

| Field | Type | Constraints | Required |
|-------|------|-------------|----------|
| username | String | @NotBlank | Yes |
| email | String | @NotBlank, @Email | Yes |
| password | String | @NotBlank | Yes |
| phone | String | — | No |

**Response Body (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6ImN1c3RvbWVyIiwidXNlcklkIjoxLCJpYXQiOjE3MTkxNTAwMDAsImV4cCI6MTcxOTE1MzYwMH0.abc123",
  "role": "customer"
}
```

**Notes:**
- Email and username must be unique.
- Default role is `customer`.
- Returns JWT token on successful registration.

---

### 1.2 Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate an existing user.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

| Field | Type | Constraints | Required |
|-------|------|-------------|----------|
| email | String | @NotBlank | Yes |
| password | String | @NotBlank | Yes |

**Response Body (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIiwicm9sZSI6ImN1c3RvbWVyIiwidXNlcklkIjoxLCJpYXQiOjE3MTkxNTAwMDAsImV4cCI6MTcxOTE1MzYwMH0.abc123",
  "role": "customer"
}
```

**Notes:**
- Throws error if account is deactivated.
- Throws error if credentials are invalid.

---

### 1.3 Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Description:** Request OTP for password reset.

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

| Field | Type | Constraints | Required |
|-------|------|-------------|----------|
| email | String | @NotBlank, @Email | Yes |

**Response Body (200 OK):**

```json
{
  "message": "OTP sent to john@example.com (OTP: 482917)"
}
```

**Notes:**
- OTP is valid for 10 minutes.
- In development mode, OTP is returned in the response message.
- In production, OTP would be sent via email/SMS only.

---

### 1.4 Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Description:** Reset password using OTP.

**Request Body:**

```json
{
  "email": "john@example.com",
  "otp": "482917",
  "newPassword": "NewSecurePass456"
}
```

| Field | Type | Constraints | Required |
|-------|------|-------------|----------|
| email | String | @NotBlank, @Email | Yes |
| otp | String | @NotBlank | Yes |
| newPassword | String | @NotBlank | Yes |

**Response Body (200 OK):**

```json
{
  "message": "Password reset successful"
}
```

**Notes:**
- OTP must match and not be expired (10 min validity).
- OTP is single-use; marked as used after successful reset.

---

## 2. User

### 2.1 Get Profile

**Endpoint:** `GET /api/users/me`

**Description:** Get the authenticated user's profile.

**Request Body:** None

**Response Body (200 OK):**

```json
{
  "userId": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "passwordHash": "$2a$10$...",
  "phone": "+919876543210",
  "role": "customer",
  "status": "active",
  "isActive": true,
  "createdAt": "2024-06-20T10:30:00",
  "updatedAt": "2024-06-20T10:30:00"
}
```

**Notes:**
- Uses authenticated user's email from SecurityContext.

---

### 2.2 Update Profile

**Endpoint:** `PUT /api/users/profile`

**Description:** Update the authenticated user's profile.

**Request Body:**

```json
{
  "username": "john_updated",
  "phone": "+919876543211"
}
```

| Field | Type | Constraints | Required |
|-------|------|-------------|----------|
| username | String | — | No |
| phone | String | — | No |

**Response Body (200 OK):**

```json
{
  "userId": 1,
  "username": "john_updated",
  "email": "john@example.com",
  "passwordHash": "$2a$10$...",
  "phone": "+919876543211",
  "role": "customer",
  "status": "active",
  "isActive": true,
  "createdAt": "2024-06-20T10:30:00",
  "updatedAt": "2024-06-23T14:15:00"
}
```

**Notes:**
- Only provided fields are updated (null fields are ignored).
- Username must be unique if changed.

---

### 2.3 Deactivate Account

**Endpoint:** `POST /api/users/deactivate`

**Description:** Deactivate the authenticated user's account.

**Request Body:** None

**Response Body (200 OK):**

```json
{
  "message": "Account deactivated"
}
```

**Notes:**
- Sets `isActive` to `false` and `status` to `inactive`.
- Deactivated users cannot log in.

---

### 2.4 Reactivate Account

**Endpoint:** `POST /api/users/reactivate`

**Description:** Reactivate a deactivated user account.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

| Field | Type | Constraints | Required |
|-------|------|-------------|----------|
| email | String | — | Yes |
| password | String | — | Yes |

**Response Body (200 OK):**

```json
{
  "message": "Account reactivated"
}
```

**Notes:**
- Requires correct password to reactivate.
- Sets `isActive` to `true` and `status` to `active`.

---

## 3. Addresses

### 3.1 List Addresses

**Endpoint:** `GET /api/addresses`

**Description:** Get all addresses for the authenticated user.

**Request Body:** None

**Response Body (200 OK):**

```json
[
  {
    "addressId": 1,
    "user": {
      "userId": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "phone": "+919876543210",
      "role": "customer",
      "status": "active",
      "isActive": true,
      "createdAt": "2024-06-20T10:30:00",
      "updatedAt": "2024-06-20T10:30:00"
    },
    "addressLine": "123, MG Road, Sector 5",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "isDefault": true
  }
]
```

**Notes:**
- Returns all addresses belonging to the authenticated user.

---

### 3.2 Add Address

**Endpoint:** `POST /api/addresses`

**Description:** Add a new address for the authenticated user.

**Request Body:**

```json
{
  "addressLine": "456, Park Street, Block B",
  "city": "Kolkata",
  "state": "West Bengal",
  "pincode": "700016",
  "latitude": 22.5726,
  "longitude": 88.3639,
  "isDefault": false
}
```

| Field | Type | Constraints | Required |
|-------|------|-------------|----------|
| addressLine | String | — | No |
| city | String | — | No |
| state | String | — | No |
| pincode | String | — | No |
| latitude | BigDecimal | — | No |
| longitude | BigDecimal | — | No |
| isDefault | Boolean | — | No |

**Response Body (200 OK):**

```json
{
  "addressId": 2,
  "user": {
    "userId": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "role": "customer",
    "status": "active",
    "isActive": true,
    "createdAt": "2024-06-20T10:30:00",
    "updatedAt": "2024-06-20T10:30:00"
  },
  "addressLine": "456, Park Street, Block B",
  "city": "Kolkata",
  "state": "West Bengal",
  "pincode": "700016",
  "latitude": 22.5726,
  "longitude": 88.3639,
  "isDefault": false
}
```

---

### 3.3 Update Address

**Endpoint:** `PUT /api/addresses/{id}`

**Description:** Update an existing address.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | Long | Address ID |

**Request Body:**

```json
{
  "addressLine": "456, Park Street, Block C",
  "city": "Kolkata",
  "state": "West Bengal",
  "pincode": "700017",
  "latitude": 22.5730,
  "longitude": 88.3640,
  "isDefault": true
}
```

**Response Body (200 OK):**

```json
{
  "addressId": 2,
  "user": {
    "userId": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "role": "customer",
    "status": "active",
    "isActive": true,
    "createdAt": "2024-06-20T10:30:00",
    "updatedAt": "2024-06-20T10:30:00"
  },
  "addressLine": "456, Park Street, Block C",
  "city": "Kolkata",
  "state": "West Bengal",
  "pincode": "700017",
  "latitude": 22.5730,
  "longitude": 88.3640,
  "isDefault": true
}
```

**Notes:**
- User can only update their own addresses.

---

### 3.4 Delete Address

**Endpoint:** `DELETE /api/addresses/{id}`

**Description:** Delete an address.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | Long | Address ID |

**Request Body:** None

**Response:** `204 No Content`

**Notes:**
- User can only delete their own addresses.



---

## 4. Pharmacy

### 4.1 Register Pharmacy

**Endpoint:** `POST /api/pharmacies/register`

**Description:** Register a new pharmacy.

**Request Body:**

```json
{
  "ownerName": "Rajesh Kumar",
  "email": "rajesh@pharmacy.com",
  "password": "PharmPass123",
  "pharmacyName": "HealthPlus Pharmacy",
  "licenseNumber": "PH-KA-2024-00123",
  "address": "78, Hospital Road",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560001",
  "phone": "+919876543210",
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

| Field | Type | Constraints | Required |
|-------|------|-------------|----------|
| ownerName | String | @NotBlank | Yes |
| email | String | @NotBlank | Yes |
| password | String | @NotBlank | Yes |
| pharmacyName | String | @NotBlank | Yes |
| licenseNumber | String | @NotBlank | Yes |
| address | String | @NotBlank | Yes |
| city | String | @NotBlank | Yes |
| state | String | @NotBlank | Yes |
| pincode | String | @NotBlank | Yes |
| phone | String | @NotBlank | Yes |
| latitude | BigDecimal | — | No |
| longitude | BigDecimal | — | No |

**Response Body (200 OK):**

```json
{
  "pharmacyId": 1,
  "ownerName": "Rajesh Kumar",
  "email": "rajesh@pharmacy.com",
  "passwordHash": "$2a$10$...",
  "pharmacyName": "HealthPlus Pharmacy",
  "licenseNumber": "PH-KA-2024-00123",
  "address": "78, Hospital Road",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560001",
  "phone": "+919876543210",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "approvalStatus": "pending",
  "createdAt": "2024-06-20T10:30:00",
  "updatedAt": "2024-06-20T10:30:00"
}
```

**Notes:**
- Email and license number must be unique.
- New pharmacies start with `approvalStatus: "pending"` — admin must approve.

---

### 4.2 Pharmacy Login

**Endpoint:** `POST /api/pharmacies/login`

**Description:** Authenticate a pharmacy owner.

**Request Body:**

```json
{
  "email": "rajesh@pharmacy.com",
  "password": "PharmPass123"
}
```

| Field | Type | Constraints | Required |
|-------|------|-------------|----------|
| email | String | @NotBlank | Yes |
| password | String | @NotBlank | Yes |

**Response Body (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJyYWplc2hAcGhhcm1hY3kuY29tIiwicm9sZSI6InBoYXJtYWN5IiwidXNlcklkIjoxLCJpYXQiOjE3MTkxNTAwMDAsImV4cCI6MTcxOTE1MzYwMH0.xyz789",
  "role": "pharmacy"
}
```

**Notes:**
- Returns a JWT token with role `pharmacy`.

---

### 4.3 Get Pharmacy by ID

**Endpoint:** `GET /api/pharmacies/{id}`

**Description:** Get pharmacy details by ID.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | Long | Pharmacy ID |

**Request Body:** None

**Response Body (200 OK):**

```json
{
  "pharmacyId": 1,
  "ownerName": "Rajesh Kumar",
  "email": "rajesh@pharmacy.com",
  "passwordHash": "$2a$10$...",
  "pharmacyName": "HealthPlus Pharmacy",
  "licenseNumber": "PH-KA-2024-00123",
  "address": "78, Hospital Road",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560001",
  "phone": "+919876543210",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "approvalStatus": "approved",
  "createdAt": "2024-06-20T10:30:00",
  "updatedAt": "2024-06-21T09:00:00"
}
```

---

### 4.4 Update Pharmacy

**Endpoint:** `PUT /api/pharmacies/{id}`

**Description:** Update pharmacy details.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | Long | Pharmacy ID |

**Request Body:**

```json
{
  "ownerName": "Rajesh Kumar",
  "email": "rajesh@pharmacy.com",
  "password": "PharmPass123",
  "pharmacyName": "HealthPlus Pharmacy Updated",
  "licenseNumber": "PH-KA-2024-00123",
  "address": "80, Hospital Road",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560002",
  "phone": "+919876543211",
  "latitude": 12.9720,
  "longitude": 77.5950
}
```

**Response Body (200 OK):**

```json
{
  "pharmacyId": 1,
  "ownerName": "Rajesh Kumar",
  "email": "rajesh@pharmacy.com",
  "passwordHash": "$2a$10$...",
  "pharmacyName": "HealthPlus Pharmacy Updated",
  "licenseNumber": "PH-KA-2024-00123",
  "address": "80, Hospital Road",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560002",
  "phone": "+919876543211",
  "latitude": 12.9720,
  "longitude": 77.5950,
  "approvalStatus": "approved",
  "createdAt": "2024-06-20T10:30:00",
  "updatedAt": "2024-06-23T14:00:00"
}
```

**Notes:**
- Does not update email or password fields.

---

### 4.5 Pharmacy Dashboard

**Endpoint:** `GET /api/pharmacies/me/dashboard`

**Description:** Get dashboard data for the authenticated pharmacy.

**Request Body:** None

**Response Body (200 OK):**

```json
{
  "pharmacy": {
    "pharmacyId": 1,
    "ownerName": "Rajesh Kumar",
    "email": "rajesh@pharmacy.com",
    "pharmacyName": "HealthPlus Pharmacy",
    "licenseNumber": "PH-KA-2024-00123",
    "address": "78, Hospital Road",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001",
    "phone": "+919876543210",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "approvalStatus": "approved",
    "createdAt": "2024-06-20T10:30:00",
    "updatedAt": "2024-06-21T09:00:00"
  },
  "medicineCount": 42
}
```

**Notes:**
- Uses authenticated pharmacy's email from Authentication context.

---

### 4.6 List Approved Pharmacies

**Endpoint:** `GET /api/pharmacies`

**Description:** Get all approved pharmacies.

**Request Body:** None

**Response Body (200 OK):**

```json
[
  {
    "pharmacyId": 1,
    "ownerName": "Rajesh Kumar",
    "email": "rajesh@pharmacy.com",
    "passwordHash": "$2a$10$...",
    "pharmacyName": "HealthPlus Pharmacy",
    "licenseNumber": "PH-KA-2024-00123",
    "address": "78, Hospital Road",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001",
    "phone": "+919876543210",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "approvalStatus": "approved",
    "createdAt": "2024-06-20T10:30:00",
    "updatedAt": "2024-06-21T09:00:00"
  }
]
```

**Notes:**
- Only returns pharmacies with `approvalStatus: "approved"`.



---

## 5. Medicine

### 5.1 Add Medicine

**Endpoint:** `POST /api/medicines`

**Description:** Add a new medicine to a pharmacy's inventory.

**Request Body:**

```json
{
  "pharmacyId": 1,
  "categoryId": 2,
  "medicineName": "Paracetamol 500mg",
  "manufacturer": "Cipla Ltd",
  "price": 25.50,
  "stockQuantity": 100,
  "expiryDate": "2025-12-31",
  "description": "Used for fever and mild pain relief"
}
```

| Field | Type | Constraints | Required |
|-------|------|-------------|----------|
| pharmacyId | Long | @NotNull | Yes |
| categoryId | Long | @NotNull | Yes |
| medicineName | String | @NotBlank | Yes |
| manufacturer | String | — | No |
| price | BigDecimal | @NotNull | Yes |
| stockQuantity | int | — | No |
| expiryDate | LocalDate (yyyy-MM-dd) | — | No |
| description | String | — | No |

**Response Body (200 OK):**

```json
{
  "medicineId": 1,
  "pharmacy": {
    "pharmacyId": 1,
    "ownerName": "Rajesh Kumar",
    "email": "rajesh@pharmacy.com",
    "pharmacyName": "HealthPlus Pharmacy",
    "licenseNumber": "PH-KA-2024-00123",
    "address": "78, Hospital Road",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001",
    "phone": "+919876543210",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "approvalStatus": "approved",
    "createdAt": "2024-06-20T10:30:00",
    "updatedAt": "2024-06-21T09:00:00"
  },
  "category": {
    "categoryId": 2,
    "categoryName": "Analgesics",
    "description": "Pain relief medications"
  },
  "medicineName": "Paracetamol 500mg",
  "manufacturer": "Cipla Ltd",
  "price": 25.50,
  "stockQuantity": 100,
  "expiryDate": "2025-12-31",
  "description": "Used for fever and mild pain relief",
  "createdAt": "2024-06-23T10:00:00",
  "updatedAt": "2024-06-23T10:00:00"
}
```

**Notes:**
- An inventory log entry with action `"add"` is automatically created.
- Medicine name must be unique per pharmacy (unique constraint on `pharmacy_id` + `medicine_name`).

---

### 5.2 Update Medicine

**Endpoint:** `PUT /api/medicines/{id}`

**Description:** Update medicine details.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | Long | Medicine ID |

**Request Body:**

```json
{
  "pharmacyId": 1,
  "categoryId": 2,
  "medicineName": "Paracetamol 650mg",
  "manufacturer": "Cipla Ltd",
  "price": 30.00,
  "stockQuantity": 150,
  "expiryDate": "2026-06-30",
  "description": "Used for fever, headache, and mild pain relief"
}
```

**Response Body (200 OK):**

```json
{
  "medicineId": 1,
  "pharmacy": {
    "pharmacyId": 1,
    "pharmacyName": "HealthPlus Pharmacy",
    "...": "..."
  },
  "category": {
    "categoryId": 2,
    "categoryName": "Analgesics",
    "description": "Pain relief medications"
  },
  "medicineName": "Paracetamol 650mg",
  "manufacturer": "Cipla Ltd",
  "price": 30.00,
  "stockQuantity": 150,
  "expiryDate": "2026-06-30",
  "description": "Used for fever, headache, and mild pain relief",
  "createdAt": "2024-06-23T10:00:00",
  "updatedAt": "2024-06-23T15:30:00"
}
```

---

### 5.3 Delete Medicine

**Endpoint:** `DELETE /api/medicines/{id}`

**Description:** Delete a medicine from inventory.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | Long | Medicine ID |

**Request Body:** None

**Response:** `200 OK` (empty body)

---

### 5.4 List Medicines by Pharmacy

**Endpoint:** `GET /api/medicines?pharmacyId={pharmacyId}`

**Description:** Get all medicines for a specific pharmacy.

**Query Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| pharmacyId | Long | Pharmacy ID | Yes |

**Request Body:** None

**Response Body (200 OK):**

```json
[
  {
    "medicineId": 1,
    "pharmacy": {
      "pharmacyId": 1,
      "pharmacyName": "HealthPlus Pharmacy",
      "city": "Bangalore",
      "state": "Karnataka",
      "...": "..."
    },
    "category": {
      "categoryId": 2,
      "categoryName": "Analgesics",
      "description": "Pain relief medications"
    },
    "medicineName": "Paracetamol 500mg",
    "manufacturer": "Cipla Ltd",
    "price": 25.50,
    "stockQuantity": 100,
    "expiryDate": "2025-12-31",
    "description": "Used for fever and mild pain relief",
    "createdAt": "2024-06-23T10:00:00",
    "updatedAt": "2024-06-23T10:00:00"
  },
  {
    "medicineId": 2,
    "pharmacy": {
      "pharmacyId": 1,
      "pharmacyName": "HealthPlus Pharmacy",
      "...": "..."
    },
    "category": {
      "categoryId": 3,
      "categoryName": "Antibiotics",
      "description": "Anti-bacterial medications"
    },
    "medicineName": "Amoxicillin 250mg",
    "manufacturer": "Sun Pharma",
    "price": 85.00,
    "stockQuantity": 50,
    "expiryDate": "2025-09-15",
    "description": "Broad-spectrum antibiotic",
    "createdAt": "2024-06-23T10:05:00",
    "updatedAt": "2024-06-23T10:05:00"
  }
]
```

---

### 5.5 Update Stock

**Endpoint:** `PUT /api/medicines/{id}/stock`

**Description:** Add or remove stock for a medicine.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | Long | Medicine ID |

**Request Body:**

```json
{
  "quantity": 50,
  "action": "add"
}
```

| Field | Type | Constraints | Required |
|-------|------|-------------|----------|
| quantity | int | @Min(1) | Yes |
| action | String | @NotBlank, @Pattern("add\|remove") | Yes |

**Response Body (200 OK):**

```json
{
  "medicineId": 1,
  "pharmacy": {
    "pharmacyId": 1,
    "pharmacyName": "HealthPlus Pharmacy",
    "...": "..."
  },
  "category": {
    "categoryId": 2,
    "categoryName": "Analgesics",
    "description": "Pain relief medications"
  },
  "medicineName": "Paracetamol 500mg",
  "manufacturer": "Cipla Ltd",
  "price": 25.50,
  "stockQuantity": 150,
  "expiryDate": "2025-12-31",
  "description": "Used for fever and mild pain relief",
  "createdAt": "2024-06-23T10:00:00",
  "updatedAt": "2024-06-23T16:00:00"
}
```

**Notes:**
- `action: "add"` increases stock by quantity.
- `action: "remove"` decreases stock by quantity.
- An inventory log entry is created for each stock update.

---

### 5.6 Get Categories

**Endpoint:** `GET /api/medicines/categories`

**Description:** Get all medicine categories.

**Request Body:** None

**Response Body (200 OK):**

```json
[
  {
    "categoryId": 1,
    "categoryName": "Antipyretics",
    "description": "Fever-reducing medications"
  },
  {
    "categoryId": 2,
    "categoryName": "Analgesics",
    "description": "Pain relief medications"
  },
  {
    "categoryId": 3,
    "categoryName": "Antibiotics",
    "description": "Anti-bacterial medications"
  }
]
```



---

## 6. Prescription Search

### 6.1 Search Prescription

**Endpoint:** `POST /api/search/prescription`

**Description:** Search for pharmacies that have the prescribed medicines in stock, optionally filtered by distance.

**Request Body:**

```json
{
  "medicineNames": ["Paracetamol 500mg", "Amoxicillin 250mg", "Cetirizine 10mg"],
  "latitude": 12.9716,
  "longitude": 77.5946,
  "maxDistanceKm": 10.0
}
```

| Field | Type | Constraints | Required |
|-------|------|-------------|----------|
| medicineNames | List\<String\> | @NotEmpty | Yes |
| latitude | BigDecimal | — | No |
| longitude | BigDecimal | — | No |
| maxDistanceKm | BigDecimal | — | No |

**Response Body (200 OK):**

```json
[
  {
    "pharmacyId": 1,
    "pharmacyName": "HealthPlus Pharmacy",
    "totalPrice": 135.50,
    "distanceKm": 2.3,
    "medicinesFound": 3,
    "totalSearched": 3,
    "hasAllMedicines": true
  },
  {
    "pharmacyId": 3,
    "pharmacyName": "MedCare Pharmacy",
    "totalPrice": 110.00,
    "distanceKm": 5.7,
    "medicinesFound": 2,
    "totalSearched": 3,
    "hasAllMedicines": false
  }
]
```

**Notes:**
- Results are sorted: pharmacies with all medicines first, then by distance.
- Only medicines with `stockQuantity > 0` are considered.
- Distance is calculated using the Haversine formula.
- If `latitude`/`longitude` are not provided, distance will be 0.
- If `maxDistanceKm` is provided, pharmacies beyond that distance are excluded.

---

### 6.2 Search Medicines by Name

**Endpoint:** `GET /api/search/medicines?name={name}`

**Description:** Search medicines by name (partial match).

**Query Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| name | String | Medicine name to search | Yes |

**Request Body:** None

**Response Body (200 OK):**

```json
[
  {
    "medicineId": 1,
    "pharmacy": {
      "pharmacyId": 1,
      "pharmacyName": "HealthPlus Pharmacy",
      "city": "Bangalore",
      "state": "Karnataka",
      "...": "..."
    },
    "category": {
      "categoryId": 2,
      "categoryName": "Analgesics",
      "description": "Pain relief medications"
    },
    "medicineName": "Paracetamol 500mg",
    "manufacturer": "Cipla Ltd",
    "price": 25.50,
    "stockQuantity": 100,
    "expiryDate": "2025-12-31",
    "description": "Used for fever and mild pain relief",
    "createdAt": "2024-06-23T10:00:00",
    "updatedAt": "2024-06-23T10:00:00"
  }
]
```

**Notes:**
- Performs case-insensitive partial match on medicine name.
- Returns medicines from all pharmacies.

---

## 7. Nurse

### 7.1 Register Nurse

**Endpoint:** `POST /api/nurses/register`

**Description:** Register a new nurse.

**Request Body:**

```json
{
  "fullName": "Priya Sharma",
  "email": "priya.nurse@example.com",
  "password": "NursePass123",
  "phone": "+919876543210",
  "qualification": "BSc Nursing",
  "licenseNumber": "NR-KA-2024-00456",
  "specialization": "Home Care"
}
```

| Field | Type | Constraints | Required |
|-------|------|-------------|----------|
| fullName | String | @NotBlank | Yes |
| email | String | @NotBlank | Yes |
| password | String | @NotBlank | Yes |
| phone | String | @NotBlank | Yes |
| qualification | String | @NotBlank | Yes |
| licenseNumber | String | @NotBlank | Yes |
| specialization | String | @NotBlank | Yes |

**Response Body (200 OK):**

```json
{
  "nurseId": 1,
  "fullName": "Priya Sharma",
  "email": "priya.nurse@example.com",
  "passwordHash": "$2a$10$...",
  "phone": "+919876543210",
  "qualification": "BSc Nursing",
  "licenseNumber": "NR-KA-2024-00456",
  "specialization": "Home Care",
  "availabilityStatus": "offline",
  "approvalStatus": "pending",
  "createdAt": "2024-06-23T10:00:00",
  "updatedAt": "2024-06-23T10:00:00"
}
```

**Notes:**
- Email and license number must be unique.
- New nurses start with `approvalStatus: "pending"` and `availabilityStatus: "offline"`.

---

### 7.2 Nurse Login

**Endpoint:** `POST /api/nurses/login`

**Description:** Authenticate a nurse.

**Request Body:**

```json
{
  "email": "priya.nurse@example.com",
  "password": "NursePass123"
}
```

| Field | Type | Constraints | Required |
|-------|------|-------------|----------|
| email | String | @NotBlank | Yes |
| password | String | @NotBlank | Yes |

**Response Body (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJwcml5YS5udXJzZUBleGFtcGxlLmNvbSIsInJvbGUiOiJudXJzZSIsInVzZXJJZCI6MSwiaWF0IjoxNzE5MTUwMDAwLCJleHAiOjE3MTkxNTM2MDB9.def456",
  "role": "nurse"
}
```

---

### 7.3 Update Availability

**Endpoint:** `PUT /api/nurses/availability?status={status}`

**Description:** Update the nurse's availability status.

**Query Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| status | String | Availability status (`online`, `offline`, `busy`) | Yes |

**Request Body:** None

**Response Body (200 OK):**

```json
{
  "nurseId": 1,
  "fullName": "Priya Sharma",
  "email": "priya.nurse@example.com",
  "passwordHash": "$2a$10$...",
  "phone": "+919876543210",
  "qualification": "BSc Nursing",
  "licenseNumber": "NR-KA-2024-00456",
  "specialization": "Home Care",
  "availabilityStatus": "online",
  "approvalStatus": "approved",
  "createdAt": "2024-06-23T10:00:00",
  "updatedAt": "2024-06-23T14:30:00"
}
```

**Notes:**
- Uses authenticated nurse's email from SecurityContext.

---

### 7.4 Get Available Nurses

**Endpoint:** `GET /api/nurses/available`

**Description:** Get all nurses that are online and approved.

**Request Body:** None

**Response Body (200 OK):**

```json
[
  {
    "nurseId": 1,
    "fullName": "Priya Sharma",
    "email": "priya.nurse@example.com",
    "passwordHash": "$2a$10$...",
    "phone": "+919876543210",
    "qualification": "BSc Nursing",
    "licenseNumber": "NR-KA-2024-00456",
    "specialization": "Home Care",
    "availabilityStatus": "online",
    "approvalStatus": "approved",
    "createdAt": "2024-06-23T10:00:00",
    "updatedAt": "2024-06-23T14:30:00"
  }
]
```

**Notes:**
- Only returns nurses with `availabilityStatus: "online"` AND `approvalStatus: "approved"`.

---

### 7.5 Get Nurse by ID

**Endpoint:** `GET /api/nurses/{id}`

**Description:** Get nurse details by ID.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | Long | Nurse ID |

**Request Body:** None

**Response Body (200 OK):**

```json
{
  "nurseId": 1,
  "fullName": "Priya Sharma",
  "email": "priya.nurse@example.com",
  "passwordHash": "$2a$10$...",
  "phone": "+919876543210",
  "qualification": "BSc Nursing",
  "licenseNumber": "NR-KA-2024-00456",
  "specialization": "Home Care",
  "availabilityStatus": "online",
  "approvalStatus": "approved",
  "createdAt": "2024-06-23T10:00:00",
  "updatedAt": "2024-06-23T14:30:00"
}
```

---

### 7.6 Get Nurse Services

**Endpoint:** `GET /api/nurses/services`

**Description:** Get all available nurse services.

**Request Body:** None

**Response Body (200 OK):**

```json
[
  {
    "serviceId": 1,
    "serviceName": "Home Injection",
    "description": "Administering injections at home",
    "basePrice": 200.00
  },
  {
    "serviceId": 2,
    "serviceName": "Wound Dressing",
    "description": "Professional wound care and dressing",
    "basePrice": 350.00
  },
  {
    "serviceId": 3,
    "serviceName": "Physiotherapy Session",
    "description": "Physical therapy at home",
    "basePrice": 500.00
  }
]
```



---

## 8. Nurse Requests

### 8.1 Create Nurse Request

**Endpoint:** `POST /api/nurse-requests`

**Description:** Create a new nursing service request (patient side).

**Request Body:**

```json
{
  "nurseId": 1,
  "serviceId": 2,
  "address": "123, MG Road, Sector 5, Bangalore",
  "healthIssue": "Post-surgical wound care needed for 5 days",
  "requestDate": "2024-06-25",
  "preferredTime": "10:00 AM - 12:00 PM"
}
```

| Field | Type | Constraints | Required |
|-------|------|-------------|----------|
| nurseId | Long | — | Yes |
| serviceId | Long | — | Yes |
| address | String | — | No |
| healthIssue | String | — | No |
| requestDate | LocalDate (yyyy-MM-dd) | — | No |
| preferredTime | String | — | No |

**Response Body (200 OK):**

```json
{
  "requestId": 1,
  "patient": {
    "userId": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "role": "customer",
    "status": "active",
    "isActive": true,
    "createdAt": "2024-06-20T10:30:00",
    "updatedAt": "2024-06-20T10:30:00"
  },
  "nurse": {
    "nurseId": 1,
    "fullName": "Priya Sharma",
    "email": "priya.nurse@example.com",
    "phone": "+919876543210",
    "qualification": "BSc Nursing",
    "licenseNumber": "NR-KA-2024-00456",
    "specialization": "Home Care",
    "availabilityStatus": "online",
    "approvalStatus": "approved",
    "createdAt": "2024-06-23T10:00:00",
    "updatedAt": "2024-06-23T14:30:00"
  },
  "service": {
    "serviceId": 2,
    "serviceName": "Wound Dressing",
    "description": "Professional wound care and dressing",
    "basePrice": 350.00
  },
  "address": "123, MG Road, Sector 5, Bangalore",
  "healthIssue": "Post-surgical wound care needed for 5 days",
  "requestDate": "2024-06-25",
  "preferredTime": "10:00 AM - 12:00 PM",
  "requestStatus": "pending",
  "createdAt": "2024-06-23T15:00:00",
  "updatedAt": "2024-06-23T15:00:00"
}
```

**Notes:**
- Patient is identified from the authenticated user's email.
- Default `requestStatus` is `"pending"`.

---

### 8.2 Get Patient's Requests

**Endpoint:** `GET /api/nurse-requests/my`

**Description:** Get all nursing requests for the authenticated patient.

**Request Body:** None

**Response Body (200 OK):**

```json
[
  {
    "requestId": 1,
    "patient": {
      "userId": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "...": "..."
    },
    "nurse": {
      "nurseId": 1,
      "fullName": "Priya Sharma",
      "...": "..."
    },
    "service": {
      "serviceId": 2,
      "serviceName": "Wound Dressing",
      "description": "Professional wound care and dressing",
      "basePrice": 350.00
    },
    "address": "123, MG Road, Sector 5, Bangalore",
    "healthIssue": "Post-surgical wound care needed for 5 days",
    "requestDate": "2024-06-25",
    "preferredTime": "10:00 AM - 12:00 PM",
    "requestStatus": "pending",
    "createdAt": "2024-06-23T15:00:00",
    "updatedAt": "2024-06-23T15:00:00"
  }
]
```

**Notes:**
- Uses authenticated user's email to find requests where user is the patient.

---

### 8.3 Get Nurse's Requests

**Endpoint:** `GET /api/nurse-requests/nurse`

**Description:** Get all nursing requests assigned to the authenticated nurse.

**Request Body:** None

**Response Body (200 OK):**

```json
[
  {
    "requestId": 1,
    "patient": {
      "userId": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "...": "..."
    },
    "nurse": {
      "nurseId": 1,
      "fullName": "Priya Sharma",
      "...": "..."
    },
    "service": {
      "serviceId": 2,
      "serviceName": "Wound Dressing",
      "description": "Professional wound care and dressing",
      "basePrice": 350.00
    },
    "address": "123, MG Road, Sector 5, Bangalore",
    "healthIssue": "Post-surgical wound care needed for 5 days",
    "requestDate": "2024-06-25",
    "preferredTime": "10:00 AM - 12:00 PM",
    "requestStatus": "accepted",
    "createdAt": "2024-06-23T15:00:00",
    "updatedAt": "2024-06-23T16:00:00"
  }
]
```

**Notes:**
- Uses authenticated nurse's email to find assigned requests.

---

### 8.4 Update Request Status

**Endpoint:** `PUT /api/nurse-requests/{id}/status?status={status}`

**Description:** Update the status of a nurse request.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | Long | Request ID |

**Query Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| status | String | New status (`accepted`, `rejected`, `completed`, `cancelled`) | Yes |

**Request Body:** None

**Response Body (200 OK):**

```json
{
  "requestId": 1,
  "patient": {
    "userId": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "...": "..."
  },
  "nurse": {
    "nurseId": 1,
    "fullName": "Priya Sharma",
    "...": "..."
  },
  "service": {
    "serviceId": 2,
    "serviceName": "Wound Dressing",
    "description": "Professional wound care and dressing",
    "basePrice": 350.00
  },
  "address": "123, MG Road, Sector 5, Bangalore",
  "healthIssue": "Post-surgical wound care needed for 5 days",
  "requestDate": "2024-06-25",
  "preferredTime": "10:00 AM - 12:00 PM",
  "requestStatus": "accepted",
  "createdAt": "2024-06-23T15:00:00",
  "updatedAt": "2024-06-23T16:30:00"
}
```

**Notes:**
- Typical status flow: `pending` → `accepted` → `completed` or `pending` → `rejected`/`cancelled`.

---

## 9. Reviews

### 9.1 Add Pharmacy Review

**Endpoint:** `POST /api/reviews/pharmacy`

**Description:** Add a review for a pharmacy.

**Request Body:**

```json
{
  "pharmacyId": 1,
  "rating": 4,
  "reviewText": "Great pharmacy with excellent service and wide variety of medicines."
}
```

| Field | Type | Constraints | Required |
|-------|------|-------------|----------|
| pharmacyId | Long | @NotNull | Yes |
| rating | int | @Min(1), @Max(5) | Yes |
| reviewText | String | — | No |

**Response Body (200 OK):**

```json
{
  "reviewId": 1,
  "user": {
    "userId": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "role": "customer",
    "status": "active",
    "isActive": true,
    "createdAt": "2024-06-20T10:30:00",
    "updatedAt": "2024-06-20T10:30:00"
  },
  "pharmacy": {
    "pharmacyId": 1,
    "ownerName": "Rajesh Kumar",
    "email": "rajesh@pharmacy.com",
    "pharmacyName": "HealthPlus Pharmacy",
    "licenseNumber": "PH-KA-2024-00123",
    "address": "78, Hospital Road",
    "city": "Bangalore",
    "state": "Karnataka",
    "pincode": "560001",
    "phone": "+919876543210",
    "latitude": 12.9716,
    "longitude": 77.5946,
    "approvalStatus": "approved",
    "createdAt": "2024-06-20T10:30:00",
    "updatedAt": "2024-06-21T09:00:00"
  },
  "rating": 4,
  "reviewText": "Great pharmacy with excellent service and wide variety of medicines.",
  "createdAt": "2024-06-23T17:00:00"
}
```

**Notes:**
- A user can only leave one review per pharmacy (unique constraint on `user_id` + `pharmacy_id`).
- Rating must be between 1 and 5.

---

### 9.2 Get Pharmacy Reviews

**Endpoint:** `GET /api/reviews/pharmacy/{pharmacyId}`

**Description:** Get all reviews for a specific pharmacy.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| pharmacyId | Long | Pharmacy ID |

**Request Body:** None

**Response Body (200 OK):**

```json
[
  {
    "reviewId": 1,
    "user": {
      "userId": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "...": "..."
    },
    "pharmacy": {
      "pharmacyId": 1,
      "pharmacyName": "HealthPlus Pharmacy",
      "...": "..."
    },
    "rating": 4,
    "reviewText": "Great pharmacy with excellent service and wide variety of medicines.",
    "createdAt": "2024-06-23T17:00:00"
  }
]
```

---

### 9.3 Add Nurse Review

**Endpoint:** `POST /api/reviews/nurse`

**Description:** Add a review for a nurse after a completed service request.

**Request Body:**

```json
{
  "nurseId": 1,
  "requestId": 1,
  "rating": 5,
  "reviewText": "Very professional and caring. Wound dressing was done perfectly."
}
```

| Field | Type | Constraints | Required |
|-------|------|-------------|----------|
| nurseId | Long | @NotNull | Yes |
| requestId | Long | @NotNull | Yes |
| rating | int | @Min(1), @Max(5) | Yes |
| reviewText | String | — | No |

**Response Body (200 OK):**

```json
{
  "reviewId": 1,
  "user": {
    "userId": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "role": "customer",
    "status": "active",
    "isActive": true,
    "createdAt": "2024-06-20T10:30:00",
    "updatedAt": "2024-06-20T10:30:00"
  },
  "nurse": {
    "nurseId": 1,
    "fullName": "Priya Sharma",
    "email": "priya.nurse@example.com",
    "phone": "+919876543210",
    "qualification": "BSc Nursing",
    "licenseNumber": "NR-KA-2024-00456",
    "specialization": "Home Care",
    "availabilityStatus": "online",
    "approvalStatus": "approved",
    "createdAt": "2024-06-23T10:00:00",
    "updatedAt": "2024-06-23T14:30:00"
  },
  "request": {
    "requestId": 1,
    "address": "123, MG Road, Sector 5, Bangalore",
    "healthIssue": "Post-surgical wound care needed for 5 days",
    "requestDate": "2024-06-25",
    "preferredTime": "10:00 AM - 12:00 PM",
    "requestStatus": "completed",
    "...": "..."
  },
  "rating": 5,
  "reviewText": "Very professional and caring. Wound dressing was done perfectly.",
  "createdAt": "2024-06-26T10:00:00"
}
```

**Notes:**
- A user can only leave one review per nurse per request (unique constraint on `user_id` + `nurse_id` + `request_id`).
- Rating must be between 1 and 5.

---

### 9.4 Get Nurse Reviews

**Endpoint:** `GET /api/reviews/nurse/{nurseId}`

**Description:** Get all reviews for a specific nurse.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| nurseId | Long | Nurse ID |

**Request Body:** None

**Response Body (200 OK):**

```json
[
  {
    "reviewId": 1,
    "user": {
      "userId": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "...": "..."
    },
    "nurse": {
      "nurseId": 1,
      "fullName": "Priya Sharma",
      "...": "..."
    },
    "request": {
      "requestId": 1,
      "...": "..."
    },
    "rating": 5,
    "reviewText": "Very professional and caring. Wound dressing was done perfectly.",
    "createdAt": "2024-06-26T10:00:00"
  }
]
```



---

## 10. Admin

### 10.1 Approve Pharmacy

**Endpoint:** `PUT /api/admin/pharmacies/{id}/approve?status={status}`

**Description:** Approve or reject a pharmacy registration.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | Long | Pharmacy ID |

**Query Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| status | String | Approval status (`approved`, `rejected`) | Yes |

**Request Body:** None

**Response Body (200 OK):**

```json
{
  "pharmacyId": 1,
  "ownerName": "Rajesh Kumar",
  "email": "rajesh@pharmacy.com",
  "passwordHash": "$2a$10$...",
  "pharmacyName": "HealthPlus Pharmacy",
  "licenseNumber": "PH-KA-2024-00123",
  "address": "78, Hospital Road",
  "city": "Bangalore",
  "state": "Karnataka",
  "pincode": "560001",
  "phone": "+919876543210",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "approvalStatus": "approved",
  "createdAt": "2024-06-20T10:30:00",
  "updatedAt": "2024-06-23T18:00:00"
}
```

**Notes:**
- Logs admin activity (action: `PHARMACY_APPROVED` or `PHARMACY_REJECTED`).
- Admin is identified from SecurityContext.

---

### 10.2 Approve Nurse

**Endpoint:** `PUT /api/admin/nurses/{id}/approve?status={status}`

**Description:** Approve or reject a nurse registration.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | Long | Nurse ID |

**Query Parameters:**

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| status | String | Approval status (`approved`, `rejected`) | Yes |

**Request Body:** None

**Response Body (200 OK):**

```json
{
  "nurseId": 1,
  "fullName": "Priya Sharma",
  "email": "priya.nurse@example.com",
  "passwordHash": "$2a$10$...",
  "phone": "+919876543210",
  "qualification": "BSc Nursing",
  "licenseNumber": "NR-KA-2024-00456",
  "specialization": "Home Care",
  "availabilityStatus": "offline",
  "approvalStatus": "approved",
  "createdAt": "2024-06-23T10:00:00",
  "updatedAt": "2024-06-23T18:00:00"
}
```

**Notes:**
- Logs admin activity (action: `NURSE_APPROVED` or `NURSE_REJECTED`).

---

### 10.3 Get All Users

**Endpoint:** `GET /api/admin/users`

**Description:** Get all registered users.

**Request Body:** None

**Response Body (200 OK):**

```json
[
  {
    "userId": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "passwordHash": "$2a$10$...",
    "phone": "+919876543210",
    "role": "customer",
    "status": "active",
    "isActive": true,
    "createdAt": "2024-06-20T10:30:00",
    "updatedAt": "2024-06-20T10:30:00"
  },
  {
    "userId": 2,
    "username": "admin_user",
    "email": "admin@medisync.com",
    "passwordHash": "$2a$10$...",
    "phone": "+919876543211",
    "role": "admin",
    "status": "active",
    "isActive": true,
    "createdAt": "2024-06-18T08:00:00",
    "updatedAt": "2024-06-18T08:00:00"
  }
]
```

---

### 10.4 Block User

**Endpoint:** `PUT /api/admin/users/{id}/block`

**Description:** Block a user account.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | Long | User ID |

**Request Body:** None

**Response Body (200 OK):**

```json
{
  "userId": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "passwordHash": "$2a$10$...",
  "phone": "+919876543210",
  "role": "customer",
  "status": "blocked",
  "isActive": false,
  "createdAt": "2024-06-20T10:30:00",
  "updatedAt": "2024-06-23T18:30:00"
}
```

**Notes:**
- Sets `status` to `"blocked"` and `isActive` to `false`.
- Logs admin activity (action: `BLOCK_USER`).

---

### 10.5 Unblock User

**Endpoint:** `PUT /api/admin/users/{id}/unblock`

**Description:** Unblock a blocked user account.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | Long | User ID |

**Request Body:** None

**Response Body (200 OK):**

```json
{
  "userId": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "passwordHash": "$2a$10$...",
  "phone": "+919876543210",
  "role": "customer",
  "status": "active",
  "isActive": true,
  "createdAt": "2024-06-20T10:30:00",
  "updatedAt": "2024-06-23T19:00:00"
}
```

**Notes:**
- Sets `status` to `"active"` and `isActive` to `true`.
- Logs admin activity (action: `UNBLOCK_USER`).

---

### 10.6 Admin Dashboard

**Endpoint:** `GET /api/admin/dashboard`

**Description:** Get admin dashboard with summary statistics.

**Request Body:** None

**Response Body (200 OK):**

```json
{
  "totalUsers": 150,
  "totalPharmacies": 25,
  "approvedPharmacies": 18,
  "pendingPharmacies": 7,
  "totalNurses": 30,
  "totalMedicines": 520
}
```

---

### 10.7 Admin Activity Logs

**Endpoint:** `GET /api/admin/logs`

**Description:** Get all admin activity logs, ordered by most recent first.

**Request Body:** None

**Response Body (200 OK):**

```json
[
  {
    "logId": 1,
    "admin": {
      "userId": 2,
      "username": "admin_user",
      "email": "admin@medisync.com",
      "phone": "+919876543211",
      "role": "admin",
      "status": "active",
      "isActive": true,
      "createdAt": "2024-06-18T08:00:00",
      "updatedAt": "2024-06-18T08:00:00"
    },
    "action": "PHARMACY_APPROVED",
    "entityType": "Pharmacy",
    "entityId": 1,
    "details": "Pharmacy HealthPlus Pharmacy approved",
    "createdAt": "2024-06-23T18:00:00"
  },
  {
    "logId": 2,
    "admin": {
      "userId": 2,
      "username": "admin_user",
      "email": "admin@medisync.com",
      "...": "..."
    },
    "action": "BLOCK_USER",
    "entityType": "User",
    "entityId": 5,
    "details": "Blocked user suspicious@example.com",
    "createdAt": "2024-06-23T18:30:00"
  }
]
```

---

### 10.8 Reports

**Endpoint:** `GET /api/admin/reports`

**Description:** Get platform-wide reports and statistics.

**Request Body:** None

**Response Body (200 OK):**

```json
{
  "totalUsers": 150,
  "totalPharmacies": 25,
  "approvedPharmacies": 18,
  "pendingPharmacies": 7,
  "rejectedPharmacies": 0,
  "totalNurses": 30,
  "approvedNurses": 22,
  "pendingNurses": 8,
  "totalMedicines": 520
}
```

**Notes:**
- Similar to dashboard but includes rejected pharmacy and nurse breakdown.

---

## 11. Notifications

### 11.1 Get User Notifications

**Endpoint:** `GET /api/notifications`

**Description:** Get all notifications for the authenticated user, ordered by most recent first.

**Request Body:** None

**Response Body (200 OK):**

```json
[
  {
    "notificationId": 1,
    "user": {
      "userId": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "phone": "+919876543210",
      "role": "customer",
      "status": "active",
      "isActive": true,
      "createdAt": "2024-06-20T10:30:00",
      "updatedAt": "2024-06-20T10:30:00"
    },
    "type": "NURSE_REQUEST",
    "title": "Request Accepted",
    "message": "Your nursing request has been accepted by Priya Sharma.",
    "isRead": false,
    "createdAt": "2024-06-23T16:30:00"
  },
  {
    "notificationId": 2,
    "user": {
      "userId": 1,
      "username": "john_doe",
      "...": "..."
    },
    "type": "SYSTEM",
    "title": "Welcome to MediSync",
    "message": "Thank you for registering. Explore pharmacies and nursing services near you.",
    "isRead": true,
    "createdAt": "2024-06-20T10:30:00"
  }
]
```

---

### 11.2 Mark Notification as Read

**Endpoint:** `PUT /api/notifications/{id}/read`

**Description:** Mark a specific notification as read.

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | Long | Notification ID |

**Request Body:** None

**Response Body (200 OK):**

```json
{
  "notificationId": 1,
  "user": {
    "userId": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "role": "customer",
    "status": "active",
    "isActive": true,
    "createdAt": "2024-06-20T10:30:00",
    "updatedAt": "2024-06-20T10:30:00"
  },
  "type": "NURSE_REQUEST",
  "title": "Request Accepted",
  "message": "Your nursing request has been accepted by Priya Sharma.",
  "isRead": true,
  "createdAt": "2024-06-23T16:30:00"
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common HTTP Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Success |
| 204 | No Content (successful deletion) |
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Internal Server Error |

**Validation Error Response (400):**

```json
{
  "username": "must not be blank",
  "email": "must be a well-formed email address"
}
```

---

## API Summary

| # | Module | Endpoint | Method |
|---|--------|----------|--------|
| 1 | Auth | `/api/auth/register` | POST |
| 2 | Auth | `/api/auth/login` | POST |
| 3 | Auth | `/api/auth/forgot-password` | POST |
| 4 | Auth | `/api/auth/reset-password` | POST |
| 5 | User | `/api/users/me` | GET |
| 6 | User | `/api/users/profile` | PUT |
| 7 | User | `/api/users/deactivate` | POST |
| 8 | User | `/api/users/reactivate` | POST |
| 9 | Addresses | `/api/addresses` | GET |
| 10 | Addresses | `/api/addresses` | POST |
| 11 | Addresses | `/api/addresses/{id}` | PUT |
| 12 | Addresses | `/api/addresses/{id}` | DELETE |
| 13 | Pharmacy | `/api/pharmacies/register` | POST |
| 14 | Pharmacy | `/api/pharmacies/login` | POST |
| 15 | Pharmacy | `/api/pharmacies/{id}` | GET |
| 16 | Pharmacy | `/api/pharmacies/{id}` | PUT |
| 17 | Pharmacy | `/api/pharmacies/me/dashboard` | GET |
| 18 | Pharmacy | `/api/pharmacies` | GET |
| 19 | Medicine | `/api/medicines` | POST |
| 20 | Medicine | `/api/medicines/{id}` | PUT |
| 21 | Medicine | `/api/medicines/{id}` | DELETE |
| 22 | Medicine | `/api/medicines?pharmacyId={id}` | GET |
| 23 | Medicine | `/api/medicines/{id}/stock` | PUT |
| 24 | Medicine | `/api/medicines/categories` | GET |
| 25 | Search | `/api/search/prescription` | POST |
| 26 | Search | `/api/search/medicines?name={name}` | GET |
| 27 | Nurse | `/api/nurses/register` | POST |
| 28 | Nurse | `/api/nurses/login` | POST |
| 29 | Nurse | `/api/nurses/availability?status={s}` | PUT |
| 30 | Nurse | `/api/nurses/available` | GET |
| 31 | Nurse | `/api/nurses/{id}` | GET |
| 32 | Nurse | `/api/nurses/services` | GET |
| 33 | Nurse Requests | `/api/nurse-requests` | POST |
| 34 | Nurse Requests | `/api/nurse-requests/my` | GET |
| 35 | Nurse Requests | `/api/nurse-requests/nurse` | GET |
| 36 | Nurse Requests | `/api/nurse-requests/{id}/status?status={s}` | PUT |
| 37 | Reviews | `/api/reviews/pharmacy` | POST |
| 38 | Reviews | `/api/reviews/pharmacy/{pharmacyId}` | GET |
| 39 | Reviews | `/api/reviews/nurse` | POST |
| 40 | Reviews | `/api/reviews/nurse/{nurseId}` | GET |
| 41 | Admin | `/api/admin/pharmacies/{id}/approve?status={s}` | PUT |
| 42 | Admin | `/api/admin/nurses/{id}/approve?status={s}` | PUT |
| 43 | Admin | `/api/admin/users` | GET |
| 44 | Admin | `/api/admin/users/{id}/block` | PUT |
| 45 | Admin | `/api/admin/users/{id}/unblock` | PUT |
| 46 | Admin | `/api/admin/dashboard` | GET |
| 47 | Admin | `/api/admin/logs` | GET |
| 48 | Admin | `/api/admin/reports` | GET |
| 49 | Notifications | `/api/notifications` | GET |
| 50 | Notifications | `/api/notifications/{id}/read` | PUT |

---

*Generated on 2024-06-23 | MediSync API v1.0*
