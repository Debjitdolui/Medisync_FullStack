import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Medicine, PrescriptionSearchRequest, PrescriptionSearchResult, Page, PageRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private apiUrl = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient) {}

  searchMedicinesByName(name: string, pageRequest?: PageRequest): Observable<Page<Medicine>> {
    const pr = pageRequest || { page: 0, size: 20 };
    let params = new HttpParams()
      .set('name', name)
      .set('page', pr.page.toString())
      .set('size', pr.size.toString());
    if (pr.sort) params = params.set('sort', pr.sort);
    return this.http.get<Page<Medicine>>(`${this.apiUrl}/medicines`, { params });
  }

  searchPrescription(request: PrescriptionSearchRequest): Observable<PrescriptionSearchResult[]> {
    return this.http.post<PrescriptionSearchResult[]>(`${this.apiUrl}/prescription`, request);
  }
}
