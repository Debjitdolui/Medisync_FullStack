import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Nurse, NurseService } from '../models';

@Injectable({ providedIn: 'root' })
export class NurseApiService {
  private apiUrl = `${environment.apiUrl}/nurses`;

  constructor(private http: HttpClient) {}

  getAvailableNurses(serviceId?: number): Observable<Nurse[]> {
    const url = serviceId
      ? `${this.apiUrl}/available?serviceId=${serviceId}`
      : `${this.apiUrl}/available`;
    return this.http.get<Nurse[]>(url);
  }

  getNurseById(id: number): Observable<Nurse> {
    return this.http.get<Nurse>(`${this.apiUrl}/${id}`);
  }

  getServices(): Observable<NurseService[]> {
    return this.http.get<NurseService[]>(`${this.apiUrl}/services`);
  }

  updateAvailability(status: 'online' | 'offline'): Observable<Nurse> {
    return this.http.put<Nurse>(`${this.apiUrl}/availability?status=${status}`, {});
  }

  getMyProfile(): Observable<Nurse> {
    return this.http.get<Nurse>(`${this.apiUrl}/me`);
  }

  updateProfile(data: { fullName?: string; phone?: string; qualification?: string; specialization?: string }): Observable<Nurse> {
    return this.http.put<Nurse>(`${this.apiUrl}/profile`, data);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/change-password`, { currentPassword, newPassword });
  }
}
