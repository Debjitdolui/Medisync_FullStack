import { Pharmacy } from './pharmacy.model';

export interface MedicineCategory {
  categoryId: number;
  categoryName: string;
  description?: string;
}

export interface MasterMedicine {
  masterMedicineId: number;
  medicineName: string;
  category: MedicineCategory;
  createdAt?: string;
}

export interface Medicine {
  medicineId: number;
  pharmacy: Pharmacy;
  masterMedicine?: MasterMedicine;
  category: MedicineCategory;
  medicineName: string;
  brand?: string;
  price: number;
  mrp?: number;
  stockQuantity: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineRequest {
  pharmacyId: number;
  masterMedicineId: number;
  brand?: string;
  price: number;
  stockQuantity: number;
  description?: string;
}

export interface StockUpdateRequest {
  quantity: number;
  action: 'add' | 'remove';
}
