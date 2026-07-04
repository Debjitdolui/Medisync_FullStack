import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserAddress, AddressRequest } from '../models';
import { MOCK_ADDRESSES } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class AddressService {
  private apiUrl = `${environment.apiUrl}/addresses`;
  private mockAddresses = [...MOCK_ADDRESSES];

  constructor(private http: HttpClient) {}

  getAddresses(): Observable<UserAddress[]> {
    // TODO: return this.http.get<UserAddress[]>(this.apiUrl);
    return of([...this.mockAddresses]).pipe(delay(300));
  }

  addAddress(request: AddressRequest): Observable<UserAddress> {
    // TODO: return this.http.post<UserAddress>(this.apiUrl, request);
    const newAddr: any = { addressId: Date.now(), ...request, user: this.mockAddresses[0]?.user };
    this.mockAddresses.push(newAddr);
    return of(newAddr).pipe(delay(400));
  }

  updateAddress(id: number, request: AddressRequest): Observable<UserAddress> {
    // TODO: return this.http.put<UserAddress>(`${this.apiUrl}/${id}`, request);
    const idx = this.mockAddresses.findIndex(a => a.addressId === id);
    if (idx > -1) Object.assign(this.mockAddresses[idx], request);
    return of(this.mockAddresses[idx]).pipe(delay(400));
  }

  deleteAddress(id: number): Observable<void> {
    // TODO: return this.http.delete<void>(`${this.apiUrl}/${id}`);
    this.mockAddresses = this.mockAddresses.filter(a => a.addressId !== id);
    return of(undefined).pipe(delay(300));
  }
}
