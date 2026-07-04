import { Pharmacy } from './pharmacy.model';

export interface MedicineCategory {
  categoryId: number;
  categoryName: string;
  description?: string;
}

export interface Medicine {
  medicineId: number;
  pharmacy: Pharmacy;
  category: MedicineCategory;
  medicineName: string;
  manufacturer?: string;
  price: number;
  mrp?: number;
  stockQuantity: number;
  expiryDate: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicineRequest {
  pharmacyId: number;
  categoryId: number;
  medicineName: string;
  manufacturer?: string;
  price: number;
  stockQuantity: number;
  expiryDate: string;
  description?: string;
}

export interface StockUpdateRequest {
  quantity: number;
  action: 'add' | 'remove';
}
