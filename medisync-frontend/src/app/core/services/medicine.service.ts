import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Medicine, MedicineCategory, MedicineRequest, StockUpdateRequest } from '../models';
import { MOCK_MEDICINES, MOCK_CATEGORIES } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class MedicineService {
  private apiUrl = `${environment.apiUrl}/medicines`;
  private mockMedicines = [...MOCK_MEDICINES];

  constructor(private http: HttpClient) {}

  getMedicinesByPharmacy(pharmacyId: number): Observable<Medicine[]> {
    // TODO: return this.http.get<Medicine[]>(`${this.apiUrl}?pharmacyId=${pharmacyId}`);
    return of(this.mockMedicines.filter(m => m.pharmacy.pharmacyId === pharmacyId)).pipe(delay(300));
  }

  addMedicine(request: MedicineRequest): Observable<Medicine> {
    // TODO: return this.http.post<Medicine>(this.apiUrl, request);
    const newMed: any = { medicineId: Date.now(), ...request, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.mockMedicines.push(newMed);
    return of(newMed).pipe(delay(400));
  }

  updateMedicine(id: number, request: MedicineRequest): Observable<Medicine> {
    // TODO: return this.http.put<Medicine>(`${this.apiUrl}/${id}`, request);
    const idx = this.mockMedicines.findIndex(m => m.medicineId === id);
    if (idx > -1) Object.assign(this.mockMedicines[idx], request);
    return of(this.mockMedicines[idx]).pipe(delay(400));
  }

  deleteMedicine(id: number): Observable<void> {
    // TODO: return this.http.delete<void>(`${this.apiUrl}/${id}`);
    this.mockMedicines = this.mockMedicines.filter(m => m.medicineId !== id);
    return of(undefined).pipe(delay(300));
  }

  updateStock(id: number, request: StockUpdateRequest): Observable<Medicine> {
    // TODO: return this.http.put<Medicine>(`${this.apiUrl}/${id}/stock`, request);
    const med = this.mockMedicines.find(m => m.medicineId === id);
    if (med) {
      med.stockQuantity = request.action === 'add'
        ? med.stockQuantity + request.quantity
        : med.stockQuantity - request.quantity;
    }
    return of(med as Medicine).pipe(delay(300));
  }

  getCategories(): Observable<MedicineCategory[]> {
    // TODO: return this.http.get<MedicineCategory[]>(`${this.apiUrl}/categories`);
    return of([...MOCK_CATEGORIES]).pipe(delay(200));
  }
}
