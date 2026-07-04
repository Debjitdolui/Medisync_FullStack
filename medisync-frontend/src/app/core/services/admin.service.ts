import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, Pharmacy, Nurse, AdminDashboard, AdminReport, AdminActivityLog } from '../models';
import { MOCK_USERS, MOCK_PHARMACIES, MOCK_NURSES, MOCK_ADMIN_DASHBOARD, MOCK_ADMIN_LOGS } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getDashboard(): Observable<AdminDashboard> {
    // TODO: return this.http.get<AdminDashboard>(`${this.apiUrl}/dashboard`);
    return of(MOCK_ADMIN_DASHBOARD).pipe(delay(300));
  }

  getReports(): Observable<AdminReport> {
    // TODO: return this.http.get<AdminReport>(`${this.apiUrl}/reports`);
    return of({ ...MOCK_ADMIN_DASHBOARD, rejectedPharmacies: 0, approvedNurses: 28, pendingNurses: 6 } as AdminReport).pipe(delay(300));
  }

  getLogs(): Observable<AdminActivityLog[]> {
    // TODO: return this.http.get<AdminActivityLog[]>(`${this.apiUrl}/logs`);
    return of([...MOCK_ADMIN_LOGS]).pipe(delay(300));
  }

  getAllUsers(): Observable<User[]> {
    // TODO: return this.http.get<User[]>(`${this.apiUrl}/users`);
    return of([...MOCK_USERS]).pipe(delay(300));
  }

  blockUser(id: number): Observable<User> {
    // TODO: return this.http.put<User>(`${this.apiUrl}/users/${id}/block`, {});
    const user = MOCK_USERS.find(u => u.userId === id);
    if (user) { user.status = 'blocked'; user.isActive = false; }
    return of(user as User).pipe(delay(400));
  }

  unblockUser(id: number): Observable<User> {
    // TODO: return this.http.put<User>(`${this.apiUrl}/users/${id}/unblock`, {});
    const user = MOCK_USERS.find(u => u.userId === id);
    if (user) { user.status = 'active'; user.isActive = true; }
    return of(user as User).pipe(delay(400));
  }

  approvePharmacy(id: number, status: 'approved' | 'rejected'): Observable<Pharmacy> {
    // TODO: return this.http.put<Pharmacy>(`${this.apiUrl}/pharmacies/${id}/approve?status=${status}`, {});
    const pharmacy = MOCK_PHARMACIES.find(p => p.pharmacyId === id);
    if (pharmacy) pharmacy.approvalStatus = status;
    return of(pharmacy as Pharmacy).pipe(delay(400));
  }

  approveNurse(id: number, status: 'approved' | 'rejected'): Observable<Nurse> {
    // TODO: return this.http.put<Nurse>(`${this.apiUrl}/nurses/${id}/approve?status=${status}`, {});
    const nurse = MOCK_NURSES.find(n => n.nurseId === id);
    if (nurse) nurse.approvalStatus = status;
    return of(nurse as Nurse).pipe(delay(400));
  }
}
