import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UpdateProfileRequest } from '../models';
import { MOCK_CURRENT_USER } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<User> {
    // TODO: return this.http.get<User>(`${this.apiUrl}/me`);
    return of({ ...MOCK_CURRENT_USER }).pipe(delay(300));
  }

  updateProfile(request: UpdateProfileRequest): Observable<User> {
    // TODO: return this.http.put<User>(`${this.apiUrl}/profile`, request);
    const updated = { ...MOCK_CURRENT_USER, ...request };
    return of(updated).pipe(delay(400));
  }

  deactivateAccount(): Observable<{ message: string }> {
    // TODO: return this.http.post<{ message: string }>(`${this.apiUrl}/deactivate`, {});
    return of({ message: 'Account deactivated' }).pipe(delay(400));
  }

  reactivateAccount(email: string, password: string): Observable<{ message: string }> {
    // TODO: return this.http.post<{ message: string }>(`${this.apiUrl}/reactivate`, { email, password });
    return of({ message: 'Account reactivated' }).pipe(delay(400));
  }
}
