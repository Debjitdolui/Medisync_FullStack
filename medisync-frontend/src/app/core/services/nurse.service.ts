import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Nurse, NurseService } from '../models';
import { NurseSchedule, NurseBlockedDate } from '../models/nurse-request.model';

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

  // ─── Schedule Management ─────────────────────────────────────────────────────

  getMySchedule(): Observable<NurseSchedule[]> {
    return this.http.get<NurseSchedule[]>(`${this.apiUrl}/schedule`);
  }

  saveSchedule(slots: { dayOfWeek: string; startTime: string; endTime: string; isActive: boolean }[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/schedule`, slots);
  }

  addSlot(dayOfWeek: string, startTime: string, endTime: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/schedule/slot`, { dayOfWeek, startTime, endTime });
  }

  toggleScheduleSlot(scheduleId: number): Observable<NurseSchedule> {
    return this.http.put<NurseSchedule>(`${this.apiUrl}/schedule/${scheduleId}/toggle`, {});
  }

  deleteScheduleSlot(scheduleId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/schedule/${scheduleId}`);
  }

  // Public - get nurse schedule for booking
  getNurseSchedule(nurseId: number): Observable<NurseSchedule[]> {
    return this.http.get<NurseSchedule[]>(`${this.apiUrl}/schedule/${nurseId}`);
  }

  // ─── Blocked Dates ─────────────────────────────────────────────────────────────

  getBlockedDates(): Observable<NurseBlockedDate[]> {
    return this.http.get<NurseBlockedDate[]>(`${this.apiUrl}/schedule/blocked-dates`);
  }

  addBlockedDate(date: string, reason?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/schedule/blocked-dates`, { date, reason });
  }

  removeBlockedDate(blockedId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/schedule/blocked-dates/${blockedId}`);
  }
}
