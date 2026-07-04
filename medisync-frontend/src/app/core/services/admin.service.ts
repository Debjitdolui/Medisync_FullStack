import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, Pharmacy, Nurse, AdminDashboard, AdminReport, AdminActivityLog, Page, PageRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<AdminDashboard> {
    return this.http.get<AdminDashboard>(`${this.apiUrl}/dashboard`);
  }

  getReports(): Observable<AdminReport> {
    return this.http.get<AdminReport>(`${this.apiUrl}/reports`);
  }

  getLogs(pageRequest?: PageRequest): Observable<Page<AdminActivityLog>> {
    const params = this.buildPageParams(pageRequest || { page: 0, size: 20, sort: 'createdAt,desc' });
    return this.http.get<Page<AdminActivityLog>>(`${this.apiUrl}/logs`, { params });
  }

  getAllUsers(pageRequest?: PageRequest): Observable<Page<User>> {
    const params = this.buildPageParams(pageRequest || { page: 0, size: 20 });
    return this.http.get<Page<User>>(`${this.apiUrl}/users`, { params });
  }

  blockUser(id: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}/block`, {});
  }

  unblockUser(id: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${id}/unblock`, {});
  }

  getAllPharmacies(pageRequest?: PageRequest): Observable<Page<Pharmacy>> {
    const params = this.buildPageParams(pageRequest || { page: 0, size: 20 });
    return this.http.get<Page<Pharmacy>>(`${this.apiUrl}/pharmacies`, { params });
  }

  approvePharmacy(id: number, status: 'approved' | 'rejected'): Observable<Pharmacy> {
    return this.http.put<Pharmacy>(`${this.apiUrl}/pharmacies/${id}/approve?status=${status}`, {});
  }

  blockPharmacy(id: number): Observable<Pharmacy> {
    return this.http.put<Pharmacy>(`${this.apiUrl}/pharmacies/${id}/block`, {});
  }

  unblockPharmacy(id: number): Observable<Pharmacy> {
    return this.http.put<Pharmacy>(`${this.apiUrl}/pharmacies/${id}/unblock`, {});
  }

  getAllNurses(pageRequest?: PageRequest): Observable<Page<Nurse>> {
    const params = this.buildPageParams(pageRequest || { page: 0, size: 20 });
    return this.http.get<Page<Nurse>>(`${this.apiUrl}/nurses`, { params });
  }

  approveNurse(id: number, status: 'approved' | 'rejected'): Observable<Nurse> {
    return this.http.put<Nurse>(`${this.apiUrl}/nurses/${id}/approve?status=${status}`, {});
  }

  blockNurse(id: number): Observable<Nurse> {
    return this.http.put<Nurse>(`${this.apiUrl}/nurses/${id}/block`, {});
  }

  unblockNurse(id: number): Observable<Nurse> {
    return this.http.put<Nurse>(`${this.apiUrl}/nurses/${id}/unblock`, {});
  }

  private buildPageParams(pageRequest: PageRequest): HttpParams {
    let params = new HttpParams()
      .set('page', pageRequest.page.toString())
      .set('size', pageRequest.size.toString());
    if (pageRequest.sort) {
      params = params.set('sort', pageRequest.sort);
    }
    return params;
  }
}
