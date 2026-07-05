export interface Pharmacy {
  pharmacyId: number;
  ownerName: string;
  email: string;
  pharmacyName: string;
  licenseNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isBlocked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PharmacyRegisterRequest {
  ownerName: string;
  email: string;
  password: string;
  pharmacyName: string;
  licenseNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  latitude?: number;
  longitude?: number;
}

export interface PharmacyDashboard {
  pharmacy: Pharmacy;
  medicineCount: number;
}

export interface PharmacyImage {
  imageId: number;
  pharmacy: Pharmacy;
  imageUrl: string;
  displayOrder: number;
  createdAt: string;
}
