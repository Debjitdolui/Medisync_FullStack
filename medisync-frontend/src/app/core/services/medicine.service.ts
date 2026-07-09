import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Medicine, MedicineCategory, MedicineRequest, StockUpdateRequest, Page, PageRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class MedicineService {
  private apiUrl = `${environment.apiUrl}/medicines`;

  constructor(private http: HttpClient) {}

  getMedicinesByPharmacy(pharmacyId: number, pageRequest?: PageRequest): Observable<Page<Medicine>> {
    let params = new HttpParams().set('pharmacyId', pharmacyId.toString());
    const pr = pageRequest || { page: 0, size: 20 };
    params = params.set('page', pr.page.toString()).set('size', pr.size.toString());
    if (pr.sort) params = params.set('sort', pr.sort);
    return this.http.get<Page<Medicine>>(this.apiUrl, { params });
  }

  addMedicine(request: MedicineRequest): Observable<Medicine> {
    return this.http.post<Medicine>(this.apiUrl, request);
  }

  updateMedicine(id: number, request: MedicineRequest): Observable<Medicine> {
    return this.http.put<Medicine>(`${this.apiUrl}/${id}`, request);
  }

  deleteMedicine(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateStock(id: number, request: StockUpdateRequest): Observable<Medicine> {
    return this.http.put<Medicine>(`${this.apiUrl}/${id}/stock`, request);
  }

  getCategories(): Observable<MedicineCategory[]> {
    return this.http.get<MedicineCategory[]>(`${this.apiUrl}/categories`);
  }

  // Pharmacy Bulk Upload
  downloadTemplate(): void {
    this.http.get(`${this.apiUrl}/template`, { responseType: 'blob' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pharmacy_medicine_template.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  bulkUpload(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/bulk-upload`, formData);
  }
}
