export interface PrescriptionSearchRequest {
  medicineNames: string[];
  latitude?: number;
  longitude?: number;
  maxDistanceKm?: number;
}

export interface PrescriptionSearchResult {
  pharmacyId: number;
  pharmacyName: string;
  address: string;
  city: string;
  phone: string;
  latitude: number;
  longitude: number;
  totalPrice: number;
  distanceKm: number;
  medicinesFound: number;
  totalSearched: number;
  hasAllMedicines: boolean;
  medicines: MedicineItem[];
}

export interface MedicineItem {
  medicineId: number;
  medicineName: string;
  manufacturer: string;
  price: number;
  stockQuantity: number;
  categoryName: string;
}
