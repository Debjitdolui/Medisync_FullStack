import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MasterMedicine, MedicineCategory } from '../models';

@Injectable({ providedIn: 'root' })
export class MasterMedicineService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Public endpoints (for pharmacy + user)
  getAll(): Observable<MasterMedicine[]> {
    return this.http.get<MasterMedicine[]>(`${this.apiUrl}/master-medicines`);
  }

  getNames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/master-medicines/names`);
  }

  search(query: string): Observable<MasterMedicine[]> {
    return this.http.get<MasterMedicine[]>(`${this.apiUrl}/master-medicines/search`, { params: { query } });
  }

  // Admin endpoints
  getAllAdmin(): Observable<MasterMedicine[]> {
    return this.http.get<MasterMedicine[]>(`${this.apiUrl}/admin/master-medicines`);
  }

  create(medicineName: string, categoryId: number): Observable<MasterMedicine> {
    return this.http.post<MasterMedicine>(`${this.apiUrl}/admin/master-medicines`, { medicineName, categoryId });
  }

  update(id: number, medicineName: string, categoryId: number): Observable<MasterMedicine> {
    return this.http.put<MasterMedicine>(`${this.apiUrl}/admin/master-medicines/${id}`, { medicineName, categoryId });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/master-medicines/${id}`);
  }
}
