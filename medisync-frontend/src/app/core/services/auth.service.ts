import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, ForgotPasswordRequest, ResetPasswordRequest } from '../models';
import { PharmacyRegisterRequest } from '../models';
import { NurseRegisterRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentRoleSubject = new BehaviorSubject<string | null>(this.getStoredRole());
  currentRole$ = this.currentRoleSubject.asObservable();

  constructor(private http: HttpClient) {}

  // ─── LOGIN ────────────────────────────────────────────────────────────────────

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, request).pipe(
      tap(res => this.storeAuth(res))
    );
  }

  loginPharmacy(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/pharmacies/login`, request).pipe(
      tap(res => this.storeAuth(res))
    );
  }

  loginNurse(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/nurses/login`, request).pipe(
      tap(res => this.storeAuth(res))
    );
  }

  // ─── REGISTRATION ─────────────────────────────────────────────────────────────

  registerUser(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, request).pipe(
      tap(res => this.storeAuth(res))
    );
  }

  registerPharmacy(request: PharmacyRegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/pharmacies/register`, request);
  }

  registerNurse(request: NurseRegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/nurses/register`, request);
  }

  // ─── PASSWORD RESET ───────────────────────────────────────────────────────────

  forgotPassword(request: ForgotPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/reset-password`, request);
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

  private storeAuth(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('userEmail', res.email);
    localStorage.setItem('userRole', res.role);
    localStorage.setItem('userName', res.username);
    this.currentRoleSubject.next(res.role);
  }

  private getStoredRole(): string | null {
    return localStorage.getItem('userRole');
  }
}
