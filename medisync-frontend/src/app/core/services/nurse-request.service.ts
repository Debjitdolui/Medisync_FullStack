import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NurseRequest, CreateNurseRequestDto } from '../models';
import { MOCK_NURSE_REQUESTS } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class NurseRequestService {
  private apiUrl = `${environment.apiUrl}/nurse-requests`;
  private mockRequests = [...MOCK_NURSE_REQUESTS];

  constructor(private http: HttpClient) {}

  createRequest(request: CreateNurseRequestDto): Observable<NurseRequest> {
    // TODO: return this.http.post<NurseRequest>(this.apiUrl, request);
    const newReq: any = { requestId: Date.now(), ...request, requestStatus: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    this.mockRequests.push(newReq);
    return of(newReq).pipe(delay(500));
  }

  getMyRequests(): Observable<NurseRequest[]> {
    // TODO: return this.http.get<NurseRequest[]>(`${this.apiUrl}/my`);
    return of([...this.mockRequests]).pipe(delay(300));
  }

  getNurseRequests(): Observable<NurseRequest[]> {
    // TODO: return this.http.get<NurseRequest[]>(`${this.apiUrl}/nurse`);
    return of([...this.mockRequests]).pipe(delay(300));
  }

  updateRequestStatus(id: number, status: string): Observable<NurseRequest> {
    // TODO: return this.http.put<NurseRequest>(`${this.apiUrl}/${id}/status?status=${status}`, {});
    const req = this.mockRequests.find(r => r.requestId === id);
    if (req) (req as any).requestStatus = status;
    return of(req as NurseRequest).pipe(delay(400));
  }
}
