import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pharmacy, PharmacyDashboard, PharmacyRegisterRequest } from '../models';
import { MOCK_PHARMACIES, MOCK_PHARMACY_DASHBOARD } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class PharmacyService {
  private apiUrl = `${environment.apiUrl}/pharmacies`;

  constructor(private http: HttpClient) {}

  getApprovedPharmacies(): Observable<Pharmacy[]> {
    // TODO: return this.http.get<Pharmacy[]>(this.apiUrl);
    return of(MOCK_PHARMACIES.filter(p => p.approvalStatus === 'approved')).pipe(delay(300));
  }

  getAllPharmacies(): Observable<Pharmacy[]> {
    // TODO: return this.http.get<Pharmacy[]>(`${environment.apiUrl}/admin/pharmacies`);
    return of([...MOCK_PHARMACIES]).pipe(delay(300));
  }

  getPharmacyById(id: number): Observable<Pharmacy> {
    // TODO: return this.http.get<Pharmacy>(`${this.apiUrl}/${id}`);
    const pharmacy = MOCK_PHARMACIES.find(p => p.pharmacyId === id) || MOCK_PHARMACIES[0];
    return of(pharmacy).pipe(delay(200));
  }

  updatePharmacy(id: number, request: PharmacyRegisterRequest): Observable<Pharmacy> {
    // TODO: return this.http.put<Pharmacy>(`${this.apiUrl}/${id}`, request);
    return of({ ...MOCK_PHARMACIES[0], ...request } as Pharmacy).pipe(delay(400));
  }

  getDashboard(): Observable<PharmacyDashboard> {
    // TODO: return this.http.get<PharmacyDashboard>(`${this.apiUrl}/me/dashboard`);
    return of(MOCK_PHARMACY_DASHBOARD).pipe(delay(300));
  }
}
