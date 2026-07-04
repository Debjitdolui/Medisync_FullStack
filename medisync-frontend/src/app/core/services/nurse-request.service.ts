import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NurseRequest, CreateNurseRequestDto } from '../models';

@Injectable({ providedIn: 'root' })
export class NurseRequestService {
  private apiUrl = `${environment.apiUrl}/nurse-requests`;

  constructor(private http: HttpClient) {}

  createRequest(request: CreateNurseRequestDto): Observable<NurseRequest> {
    return this.http.post<NurseRequest>(this.apiUrl, request);
  }

  getMyRequests(): Observable<NurseRequest[]> {
    return this.http.get<NurseRequest[]>(`${this.apiUrl}/my`);
  }

  getNurseRequests(): Observable<NurseRequest[]> {
    return this.http.get<NurseRequest[]>(`${this.apiUrl}/nurse`);
  }

  updateRequestStatus(id: number, status: string): Observable<NurseRequest> {
    return this.http.put<NurseRequest>(`${this.apiUrl}/${id}/status?status=${status}`, {});
  }
}
