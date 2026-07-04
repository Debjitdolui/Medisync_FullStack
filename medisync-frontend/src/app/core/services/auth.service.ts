import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, tap, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../models';
import { PharmacyRegisterRequest } from '../models';
import { NurseRegisterRequest } from '../models';
import { MOCK_CURRENT_USER } from '../mock/mock-data';

/**
 * AuthService
 *
 * CURRENT STATE: Uses mock data (no backend calls)
 * TO SWITCH TO REAL API:
 *   1. Remove all `of(...)` mock returns
 *   2. Uncomment the `this.http.post(...)` lines
 *   3. Remove MOCK_CURRENT_USER import
 *
 * AUTH STRATEGY:
 *   - Currently uses X-User-Email header (set in auth.interceptor.ts)
 *   - When JWT is enabled: token from login response will be stored
 *     and sent via Authorization: Bearer header
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentRoleSubject = new BehaviorSubject<string | null>(this.getStoredRole());
  currentRole$ = this.currentRoleSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ─── LOGIN ────────────────────────────────────────────────────────────────────

  login(request: LoginRequest): Observable<AuthResponse> {
    // TODO: Replace with real API call when backend is connected
    // return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, request).pipe(
    //   tap(res => this.storeAuth(res, request.email))
    // );

    // MOCK: Simulate login based on email
    const mockResponse: AuthResponse = { token: 'mock-jwt-token-123', role: 'customer' };
    if (request.email.includes('admin')) mockResponse.role = 'admin';
    if (request.email.includes('pharm') || request.email.includes('rajesh')) mockResponse.role = 'pharmacy';
    if (request.email.includes('nurse') || request.email.includes('priya')) mockResponse.role = 'nurse';

    return of(mockResponse).pipe(
      delay(500),
      tap(res => {
        this.storeAuth(res, request.email);
        localStorage.setItem('userName', MOCK_CURRENT_USER.username);
      })
    );
  }

  loginPharmacy(request: LoginRequest): Observable<AuthResponse> {
    // TODO: return this.http.post<AuthResponse>(`${this.apiUrl}/pharmacies/login`, request).pipe(tap(res => this.storeAuth(res, request.email)));
    const mockResponse: AuthResponse = { token: 'mock-pharmacy-token', role: 'pharmacy' };
    return of(mockResponse).pipe(delay(500), tap(res => {
      this.storeAuth(res, request.email);
      localStorage.setItem('userName', 'Rajesh Kumar');
    }));
  }

  loginNurse(request: LoginRequest): Observable<AuthResponse> {
    // TODO: return this.http.post<AuthResponse>(`${this.apiUrl}/nurses/login`, request).pipe(tap(res => this.storeAuth(res, request.email)));
    const mockResponse: AuthResponse = { token: 'mock-nurse-token', role: 'nurse' };
    return of(mockResponse).pipe(delay(500), tap(res => {
      this.storeAuth(res, request.email);
      localStorage.setItem('userName', 'Priya Sharma');
    }));
  }

  // ─── REGISTRATION ─────────────────────────────────────────────────────────────

  registerUser(request: RegisterRequest): Observable<AuthResponse> {
    // TODO: return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, request).pipe(tap(res => this.storeAuth(res, request.email)));
    const mockResponse: AuthResponse = { token: 'mock-new-user-token', role: 'customer' };
    return of(mockResponse).pipe(delay(800), tap(res => {
      this.storeAuth(res, request.email);
      localStorage.setItem('userName', request.username);
    }));
  }

  registerPharmacy(request: PharmacyRegisterRequest): Observable<any> {
    // TODO: return this.http.post(`${this.apiUrl}/pharmacies/register`, request);
    return of({ message: 'Pharmacy registration submitted for admin approval' }).pipe(delay(800));
  }

  registerNurse(request: NurseRegisterRequest): Observable<any> {
    // TODO: return this.http.post(`${this.apiUrl}/nurses/register`, request);
    return of({ message: 'Nurse registration submitted for admin approval' }).pipe(delay(800));
  }

  // ─── PASSWORD RESET ───────────────────────────────────────────────────────────

  forgotPassword(request: ForgotPasswordRequest): Observable<{ message: string }> {
    // TODO: return this.http.post<{ message: string }>(`${this.apiUrl}/auth/forgot-password`, request);
    return of({ message: `OTP sent to ${request.email} (OTP: 123456)` }).pipe(delay(500));
  }

  resetPassword(request: ResetPasswordRequest): Observable<{ message: string }> {
    // TODO: return this.http.post<{ message: string }>(`${this.apiUrl}/auth/reset-password`, request);
    return of({ message: 'Password reset successful' }).pipe(delay(500));
  }

  // ─── SESSION MANAGEMENT ───────────────────────────────────────────────────────

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    this.currentRoleSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

  getRole(): string | null {
    return localStorage.getItem('userRole');
  }

  getUserName(): string | null {
    return localStorage.getItem('userName');
  }

  // ─── PRIVATE ──────────────────────────────────────────────────────────────────

  private storeAuth(res: AuthResponse, email: string): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', res.role);
    this.currentRoleSubject.next(res.role);
  }

  private getStoredRole(): string | null {
    return localStorage.getItem('userRole');
  }
}
