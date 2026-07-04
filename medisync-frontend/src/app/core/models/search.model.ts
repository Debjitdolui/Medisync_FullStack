export interface PrescriptionSearchRequest {
  medicineNames: string[];
  latitude?: number;
  longitude?: number;
  maxDistanceKm?: number;
}

export interface PrescriptionSearchResult {
  pharmacyId: number;
  pharmacyName: string;
  totalPrice: number;
  distanceKm: number;
  medicinesFound: number;
  totalSearched: number;
  hasAllMedicines: boolean;
}
