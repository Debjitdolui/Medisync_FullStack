import { User } from '../models/user.model';
import { Pharmacy, PharmacyDashboard } from '../models/pharmacy.model';
import { Medicine, MedicineCategory } from '../models/medicine.model';
import { Nurse, NurseService } from '../models/nurse.model';
import { NurseRequest } from '../models/nurse-request.model';
import { PharmacyReview, NurseReview } from '../models/review.model';
import { Notification } from '../models/notification.model';
import { UserAddress } from '../models/address.model';
import { PrescriptionSearchResult } from '../models/search.model';
import { AdminDashboard, AdminActivityLog } from '../models/admin.model';

// ============ USERS ============
export const MOCK_CURRENT_USER: User = {
  userId: 1,
  username: 'Debjit',
  email: 'debjit@mail.com',
  phone: '+919876543210',
  role: 'customer',
  status: 'active',
  isActive: true,
  createdAt: '2026-06-01T10:00:00',
  updatedAt: '2026-06-01T10:00:00'
};

export const MOCK_USERS: User[] = [
  MOCK_CURRENT_USER,
  { userId: 2, username: 'admin_user', email: 'admin@medisync.com', phone: '+919876543211', role: 'admin', status: 'active', isActive: true, createdAt: '2026-05-15T08:00:00', updatedAt: '2026-05-15T08:00:00' },
  { userId: 3, username: 'rohit_sharma', email: 'rohit@mail.com', phone: '+919123456780', role: 'customer', status: 'active', isActive: true, createdAt: '2026-06-10T09:00:00', updatedAt: '2026-06-10T09:00:00' },
  { userId: 4, username: 'pooja_das', email: 'pooja@mail.com', phone: '+919123456781', role: 'customer', status: 'active', isActive: true, createdAt: '2026-06-12T11:00:00', updatedAt: '2026-06-12T11:00:00' },
  { userId: 5, username: 'blocked_user', email: 'blocked@mail.com', phone: '+919000000000', role: 'customer', status: 'blocked', isActive: false, createdAt: '2026-06-05T10:00:00', updatedAt: '2026-06-20T14:00:00' },
];

// ============ ADDRESSES ============
export const MOCK_ADDRESSES: UserAddress[] = [
  {
    addressId: 1,
    user: MOCK_CURRENT_USER,
    addressLine: '45, Lake Gardens, Gariahat',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700029',
    latitude: 22.5726,
    longitude: 88.3639,
    isDefault: true
  },
  {
    addressId: 2,
    user: MOCK_CURRENT_USER,
    addressLine: '12, Salt Lake, Sector V',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700091',
    latitude: 22.5744,
    longitude: 88.4315,
    isDefault: false
  }
];

// ============ PHARMACIES ============
export const MOCK_PHARMACIES: Pharmacy[] = [
  {
    pharmacyId: 1,
    ownerName: 'Rajesh Kumar',
    email: 'rajesh@mail.com',
    pharmacyName: 'HealthPlus Pharmacy',
    licenseNumber: 'LIC-001',
    address: '45 MG Road',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700001',
    phone: '9876543210',
    latitude: 22.5726,
    longitude: 88.3639,
    approvalStatus: 'approved',
    createdAt: '2026-05-01T10:00:00',
    updatedAt: '2026-05-02T09:00:00'
  },
  {
    pharmacyId: 2,
    ownerName: 'Amit Patel',
    email: 'amit@mail.com',
    pharmacyName: 'CareLife Pharmacy',
    licenseNumber: 'LIC-002',
    address: '12 Park Street',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700016',
    phone: '9123456789',
    latitude: 22.5550,
    longitude: 88.3520,
    approvalStatus: 'approved',
    createdAt: '2026-05-10T10:00:00',
    updatedAt: '2026-05-11T09:00:00'
  },
  {
    pharmacyId: 3,
    ownerName: 'Sanjay Gupta',
    email: 'sanjay@mail.com',
    pharmacyName: 'MediWell Pharmacy',
    licenseNumber: 'LIC-003',
    address: '78 Gariahat Road',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700019',
    phone: '9876501234',
    latitude: 22.5180,
    longitude: 88.3660,
    approvalStatus: 'approved',
    createdAt: '2026-05-15T10:00:00',
    updatedAt: '2026-05-16T09:00:00'
  },
  {
    pharmacyId: 4,
    ownerName: 'Neha Singh',
    email: 'neha@mail.com',
    pharmacyName: 'QuickMed Pharmacy',
    licenseNumber: 'LIC-004',
    address: '34 Ballygunge',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700020',
    phone: '9871234560',
    latitude: 22.5300,
    longitude: 88.3580,
    approvalStatus: 'pending',
    createdAt: '2026-06-25T10:00:00',
    updatedAt: '2026-06-25T10:00:00'
  }
];

// ============ MEDICINE CATEGORIES ============
export const MOCK_CATEGORIES: MedicineCategory[] = [
  { categoryId: 1, categoryName: 'Tablets', description: 'Oral solid dosage medicines' },
  { categoryId: 2, categoryName: 'Syrups', description: 'Liquid oral medicines' },
  { categoryId: 3, categoryName: 'Injections', description: 'Injectable medicines' },
  { categoryId: 4, categoryName: 'Capsules', description: 'Oral capsule medicines' },
  { categoryId: 5, categoryName: 'Ointments', description: 'Topical application medicines' },
  { categoryId: 6, categoryName: 'Medical Equipment', description: 'Medical devices and equipment' }
];

// ============ MEDICINES ============
export const MOCK_MEDICINES: Medicine[] = [
  {
    medicineId: 1,
    pharmacy: MOCK_PHARMACIES[0],
    category: MOCK_CATEGORIES[0],
    medicineName: 'Paracetamol 650mg',
    manufacturer: 'Cipla',
    price: 25,
    mrp: 30,
    stockQuantity: 100,
    expiryDate: '2027-12-31',
    description: 'Fever and pain relief',
    createdAt: '2026-06-01T10:00:00',
    updatedAt: '2026-06-01T10:00:00'
  },
  {
    medicineId: 2,
    pharmacy: MOCK_PHARMACIES[0],
    category: MOCK_CATEGORIES[0],
    medicineName: 'Amoxicillin 250mg',
    manufacturer: 'Sun Pharma',
    price: 45,
    mrp: 55,
    stockQuantity: 50,
    expiryDate: '2027-06-30',
    description: 'Antibiotic',
    createdAt: '2026-06-01T10:00:00',
    updatedAt: '2026-06-01T10:00:00'
  },
  {
    medicineId: 3,
    pharmacy: MOCK_PHARMACIES[1],
    category: MOCK_CATEGORIES[0],
    medicineName: 'Paracetamol 650mg',
    manufacturer: 'Mankind',
    price: 26.5,
    mrp: 30,
    stockQuantity: 200,
    expiryDate: '2027-12-31',
    description: 'Fever and pain relief',
    createdAt: '2026-06-01T10:00:00',
    updatedAt: '2026-06-01T10:00:00'
  },
  {
    medicineId: 4,
    pharmacy: MOCK_PHARMACIES[2],
    category: MOCK_CATEGORIES[0],
    medicineName: 'Paracetamol 650mg',
    manufacturer: 'Dr Reddys',
    price: 27,
    mrp: 30,
    stockQuantity: 150,
    expiryDate: '2027-12-31',
    description: 'Fever and pain relief',
    createdAt: '2026-06-01T10:00:00',
    updatedAt: '2026-06-01T10:00:00'
  },
  {
    medicineId: 5,
    pharmacy: MOCK_PHARMACIES[0],
    category: MOCK_CATEGORIES[3],
    medicineName: 'Pantoprazole 40mg',
    manufacturer: 'Dr Reddys',
    price: 80,
    mrp: 95,
    stockQuantity: 30,
    expiryDate: '2028-03-15',
    description: 'Acidity and gastric relief',
    createdAt: '2026-06-01T10:00:00',
    updatedAt: '2026-06-01T10:00:00'
  },
  {
    medicineId: 6,
    pharmacy: MOCK_PHARMACIES[1],
    category: MOCK_CATEGORIES[0],
    medicineName: 'Cetirizine 10mg',
    manufacturer: 'Cipla',
    price: 35,
    mrp: 42,
    stockQuantity: 80,
    expiryDate: '2027-09-30',
    description: 'Antihistamine for allergies',
    createdAt: '2026-06-01T10:00:00',
    updatedAt: '2026-06-01T10:00:00'
  },
  {
    medicineId: 7,
    pharmacy: MOCK_PHARMACIES[0],
    category: MOCK_CATEGORIES[4],
    medicineName: 'Betadine Ointment',
    manufacturer: 'Win Medicare',
    price: 65,
    mrp: 75,
    stockQuantity: 5,
    expiryDate: '2027-06-30',
    description: 'Antiseptic ointment for wounds',
    createdAt: '2026-06-01T10:00:00',
    updatedAt: '2026-06-01T10:00:00'
  }
];

// ============ NURSES ============
export const MOCK_NURSES: Nurse[] = [
  {
    nurseId: 1,
    fullName: 'Priya Sharma',
    email: 'priya@mail.com',
    phone: '9123456780',
    qualification: 'B.Sc Nursing',
    licenseNumber: 'NUR-001',
    specialization: 'Home Care',
    availabilityStatus: 'online',
    approvalStatus: 'approved',
    createdAt: '2026-05-20T10:00:00',
    updatedAt: '2026-06-01T14:00:00'
  },
  {
    nurseId: 2,
    fullName: 'Anita Verma',
    email: 'anita@mail.com',
    phone: '9123456781',
    qualification: 'GNM Nursing',
    licenseNumber: 'NUR-002',
    specialization: 'Elderly Care',
    availabilityStatus: 'online',
    approvalStatus: 'approved',
    createdAt: '2026-05-22T10:00:00',
    updatedAt: '2026-06-01T14:00:00'
  },
  {
    nurseId: 3,
    fullName: 'Neha Reddy',
    email: 'neha.nurse@mail.com',
    phone: '9123456782',
    qualification: 'B.Sc Nursing',
    licenseNumber: 'NUR-003',
    specialization: 'IV Therapy',
    availabilityStatus: 'online',
    approvalStatus: 'approved',
    createdAt: '2026-05-25T10:00:00',
    updatedAt: '2026-06-01T14:00:00'
  },
  {
    nurseId: 4,
    fullName: 'Sunita Devi',
    email: 'sunita@mail.com',
    phone: '9123456783',
    qualification: 'ANM',
    licenseNumber: 'NUR-004',
    specialization: 'Wound Care',
    availabilityStatus: 'offline',
    approvalStatus: 'pending',
    createdAt: '2026-06-28T10:00:00',
    updatedAt: '2026-06-28T10:00:00'
  }
];

// ============ NURSE SERVICES ============
export const MOCK_NURSE_SERVICES: NurseService[] = [
  { serviceId: 1, serviceName: 'Home Injection', description: 'Injection administration at patient home', basePrice: 200 },
  { serviceId: 2, serviceName: 'Wound Dressing', description: 'Professional wound cleaning and dressing', basePrice: 300 },
  { serviceId: 3, serviceName: 'Vital Monitoring', description: 'Blood pressure, sugar, and vital signs check', basePrice: 150 }
];

// ============ NURSE REQUESTS ============
export const MOCK_NURSE_REQUESTS: NurseRequest[] = [
  {
    requestId: 1,
    patient: MOCK_CURRENT_USER,
    nurse: MOCK_NURSES[0],
    service: MOCK_NURSE_SERVICES[0],
    address: '45, Lake Gardens, Gariahat, Kolkata',
    healthIssue: 'Need insulin injection daily',
    requestDate: '2026-07-02',
    preferredTime: '10:00 AM - 12:00 PM',
    requestStatus: 'completed',
    createdAt: '2026-06-28T15:00:00',
    updatedAt: '2026-06-29T12:00:00'
  },
  {
    requestId: 2,
    patient: MOCK_CURRENT_USER,
    nurse: MOCK_NURSES[1],
    service: MOCK_NURSE_SERVICES[2],
    address: '45, Lake Gardens, Gariahat, Kolkata',
    healthIssue: 'Regular BP and sugar monitoring for elderly parent',
    requestDate: '2026-07-05',
    preferredTime: '9:00 AM - 10:00 AM',
    requestStatus: 'accepted',
    createdAt: '2026-07-01T10:00:00',
    updatedAt: '2026-07-01T11:00:00'
  },
  {
    requestId: 3,
    patient: MOCK_CURRENT_USER,
    nurse: MOCK_NURSES[2],
    service: MOCK_NURSE_SERVICES[1],
    address: '12, Salt Lake, Sector V, Kolkata',
    healthIssue: 'Post-surgery wound dressing',
    requestDate: '2026-07-03',
    preferredTime: '2:00 PM - 4:00 PM',
    requestStatus: 'pending',
    createdAt: '2026-07-01T16:00:00',
    updatedAt: '2026-07-01T16:00:00'
  }
];

// ============ PHARMACY REVIEWS ============
export const MOCK_PHARMACY_REVIEWS: PharmacyReview[] = [
  {
    reviewId: 1,
    user: MOCK_USERS[2],
    pharmacy: MOCK_PHARMACIES[0],
    rating: 5,
    reviewText: 'Very useful healthcare platform. Always has medicines in stock.',
    createdAt: '2026-06-20T10:00:00'
  },
  {
    reviewId: 2,
    user: MOCK_USERS[3],
    pharmacy: MOCK_PHARMACIES[0],
    rating: 4,
    reviewText: 'Easy to use and reliable. Quick service.',
    createdAt: '2026-06-22T14:00:00'
  },
  {
    reviewId: 3,
    user: MOCK_CURRENT_USER,
    pharmacy: MOCK_PHARMACIES[1],
    rating: 4,
    reviewText: 'Good prices and decent stock availability.',
    createdAt: '2026-06-25T09:00:00'
  }
];

// ============ NOTIFICATIONS ============
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    notificationId: 1,
    recipientEmail: 'muskan@user.com',
    recipientType: 'user',
    type: 'NURSE_REQUEST',
    title: 'Nurse booking confirmed',
    message: 'Your booking with Priya Sharma is confirmed for 15 May, 10:00 AM.',
    isRead: false,
    createdAt: '2026-07-01T20:00:00'
  },
  {
    notificationId: 2,
    recipientEmail: 'muskan@user.com',
    recipientType: 'user',
    type: 'SYSTEM',
    title: 'Payment successful',
    message: 'Your payment of ₹499.00 was successful.',
    isRead: false,
    createdAt: '2026-07-01T19:00:00'
  },
  {
    notificationId: 3,
    recipientEmail: 'muskan@user.com',
    recipientType: 'user',
    type: 'SYSTEM',
    title: 'Welcome to MediSync',
    message: 'Thank you for registering. Explore pharmacies and nursing services near you.',
    isRead: true,
    createdAt: '2026-06-01T10:00:00'
  }
];

// ============ SEARCH RESULTS ============
export const MOCK_SEARCH_RESULTS: PrescriptionSearchResult[] = [
  { pharmacyId: 1, pharmacyName: 'HealthPlus Pharmacy', totalPrice: 135.50, distanceKm: 1.2, medicinesFound: 3, totalSearched: 3, hasAllMedicines: true },
  { pharmacyId: 2, pharmacyName: 'CareLife Pharmacy', totalPrice: 110.00, distanceKm: 1.8, medicinesFound: 2, totalSearched: 3, hasAllMedicines: false },
  { pharmacyId: 3, pharmacyName: 'MediWell Pharmacy', totalPrice: 142.00, distanceKm: 2.5, medicinesFound: 3, totalSearched: 3, hasAllMedicines: true },
];

// ============ ADMIN DASHBOARD ============
export const MOCK_ADMIN_DASHBOARD: AdminDashboard = {
  totalUsers: 156,
  totalPharmacies: 28,
  approvedPharmacies: 22,
  pendingPharmacies: 6,
  totalNurses: 34,
  totalMedicines: 520
};

// ============ ADMIN ACTIVITY LOGS ============
export const MOCK_ADMIN_LOGS: AdminActivityLog[] = [
  { logId: 1, admin: MOCK_USERS[1], action: 'PHARMACY_APPROVED', entityType: 'Pharmacy', entityId: 1, details: 'Approved HealthPlus Pharmacy', createdAt: '2026-06-30T18:00:00' },
  { logId: 2, admin: MOCK_USERS[1], action: 'NURSE_APPROVED', entityType: 'Nurse', entityId: 1, details: 'Approved nurse Priya Sharma', createdAt: '2026-06-30T17:00:00' },
  { logId: 3, admin: MOCK_USERS[1], action: 'BLOCK_USER', entityType: 'User', entityId: 5, details: 'Blocked user blocked@mail.com for suspicious activity', createdAt: '2026-06-29T14:00:00' },
];

// ============ PHARMACY DASHBOARD ============
export const MOCK_PHARMACY_DASHBOARD: PharmacyDashboard = {
  pharmacy: MOCK_PHARMACIES[0],
  medicineCount: 42
};

// ============ MOCK RATINGS (computed) ============
export const MOCK_PHARMACY_RATINGS: { [pharmacyId: number]: { average: number; total: number } } = {
  1: { average: 4.5, total: 120 },
  2: { average: 4.2, total: 85 },
  3: { average: 4.6, total: 200 },
};

export const MOCK_NURSE_RATINGS: { [nurseId: number]: { average: number; total: number } } = {
  1: { average: 4.8, total: 56 },
  2: { average: 4.6, total: 38 },
  3: { average: 4.7, total: 42 },
};
