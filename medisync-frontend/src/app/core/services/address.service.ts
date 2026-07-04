import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserAddress, AddressRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private apiUrl = `${environment.apiUrl}/addresses`;

  constructor(private http: HttpClient) {}

  getAddresses(): Observable<UserAddress[]> {
    return this.http.get<UserAddress[]>(this.apiUrl);
  }

  addAddress(request: AddressRequest): Observable<UserAddress> {
    return this.http.post<UserAddress>(this.apiUrl, request);
  }

  updateAddress(id: number, request: AddressRequest): Observable<UserAddress> {
    return this.http.put<UserAddress>(`${this.apiUrl}/${id}`, request);
  }

  deleteAddress(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
