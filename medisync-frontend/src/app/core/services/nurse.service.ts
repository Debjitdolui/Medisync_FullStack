import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Nurse, NurseService } from '../models';
import { MOCK_NURSES, MOCK_NURSE_SERVICES } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class NurseApiService {
  private apiUrl = `${environment.apiUrl}/nurses`;

  constructor(private http: HttpClient) {}

  getAvailableNurses(): Observable<Nurse[]> {
    // TODO: return this.http.get<Nurse[]>(`${this.apiUrl}/available`);
    return of(MOCK_NURSES.filter(n => n.availabilityStatus === 'online' && n.approvalStatus === 'approved')).pipe(delay(300));
  }

  getAllNurses(): Observable<Nurse[]> {
    // TODO: return this.http.get<Nurse[]>(`${environment.apiUrl}/admin/nurses`);
    return of([...MOCK_NURSES]).pipe(delay(300));
  }

  getNurseById(id: number): Observable<Nurse> {
    // TODO: return this.http.get<Nurse>(`${this.apiUrl}/${id}`);
    const nurse = MOCK_NURSES.find(n => n.nurseId === id) || MOCK_NURSES[0];
    return of(nurse).pipe(delay(200));
  }

  getServices(): Observable<NurseService[]> {
    // TODO: return this.http.get<NurseService[]>(`${this.apiUrl}/services`);
    return of([...MOCK_NURSE_SERVICES]).pipe(delay(200));
  }

  updateAvailability(status: 'online' | 'offline'): Observable<Nurse> {
    // TODO: return this.http.put<Nurse>(`${this.apiUrl}/availability?status=${status}`, {});
    const nurse = { ...MOCK_NURSES[0], availabilityStatus: status };
    return of(nurse as Nurse).pipe(delay(300));
  }
}
