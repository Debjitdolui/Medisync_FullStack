import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NurseRequest, CreateNurseRequestDto, AvailableSlotsResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class NurseRequestService {
  private apiUrl = `${environment.apiUrl}/nurse-requests`;

  constructor(private http: HttpClient) {}

  // ─── Booking ───────────────────────────────────────────────────────────────────

  createRequest(request: CreateNurseRequestDto): Observable<NurseRequest> {
    return this.http.post<NurseRequest>(this.apiUrl, request);
  }

  createMultiDayBooking(request: CreateNurseRequestDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/multi-day`, request);
  }

  // ─── Available Slots ───────────────────────────────────────────────────────────

  getAvailableSlots(nurseId: number, date: string): Observable<AvailableSlotsResponse> {
    return this.http.get<AvailableSlotsResponse>(`${this.apiUrl}/slots`, {
      params: { nurseId: nurseId.toString(), date }
    });
  }

  // ─── My Requests ───────────────────────────────────────────────────────────────

  getMyRequests(): Observable<NurseRequest[]> {
    return this.http.get<NurseRequest[]>(`${this.apiUrl}/my`);
  }

  getNurseRequests(): Observable<NurseRequest[]> {
    return this.http.get<NurseRequest[]>(`${this.apiUrl}/nurse`);
  }

  // ─── Status Updates ────────────────────────────────────────────────────────────

  updateRequestStatus(id: number, status: string): Observable<NurseRequest> {
    return this.http.put<NurseRequest>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }

  cancelRequest(id: number): Observable<NurseRequest> {
    return this.http.put<NurseRequest>(`${this.apiUrl}/${id}/cancel`, {});
  }

  // ─── Booking Group ─────────────────────────────────────────────────────────────

  getBookingGroup(groupId: string): Observable<NurseRequest[]> {
    return this.http.get<NurseRequest[]>(`${this.apiUrl}/group/${groupId}`);
  }
}
