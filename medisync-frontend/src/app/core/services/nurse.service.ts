import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Nurse, NurseService } from '../models';

@Injectable({ providedIn: 'root' })
export class NurseApiService {
  private apiUrl = `${environment.apiUrl}/nurses`;

  constructor(private http: HttpClient) {}

  getAvailableNurses(): Observable<Nurse[]> {
    return this.http.get<Nurse[]>(`${this.apiUrl}/available`);
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
}
