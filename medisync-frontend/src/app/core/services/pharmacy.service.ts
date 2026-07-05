import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pharmacy, PharmacyDashboard, PharmacyRegisterRequest, PharmacyImage } from '../models';

@Injectable({ providedIn: 'root' })
export class PharmacyService {
  private apiUrl = `${environment.apiUrl}/pharmacies`;

  constructor(private http: HttpClient) {}

  getApprovedPharmacies(): Observable<Pharmacy[]> {
    return this.http.get<Pharmacy[]>(this.apiUrl);
  }

  getPharmacyById(id: number): Observable<Pharmacy> {
    return this.http.get<Pharmacy>(`${this.apiUrl}/${id}`);
  }

  updatePharmacy(id: number, request: PharmacyRegisterRequest): Observable<Pharmacy> {
    return this.http.put<Pharmacy>(`${this.apiUrl}/${id}`, request);
  }

  getDashboard(): Observable<PharmacyDashboard> {
    return this.http.get<PharmacyDashboard>(`${this.apiUrl}/me/dashboard`);
  }

  // ─── Image Management ────────────────────────────────────────────────────────

  getImages(pharmacyId: number): Observable<PharmacyImage[]> {
    return this.http.get<PharmacyImage[]>(`${this.apiUrl}/${pharmacyId}/images`);
  }

  uploadImage(pharmacyId: number, file: File): Observable<PharmacyImage> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<PharmacyImage>(`${this.apiUrl}/${pharmacyId}/images`, formData);
  }

  deleteImage(imageId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/images/${imageId}`);
  }
}
