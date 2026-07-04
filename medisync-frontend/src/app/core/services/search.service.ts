import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Medicine, PrescriptionSearchRequest, PrescriptionSearchResult } from '../models';
import { MOCK_MEDICINES, MOCK_SEARCH_RESULTS } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private apiUrl = `${environment.apiUrl}/search`;

  constructor(private http: HttpClient) {}

  searchMedicinesByName(name: string): Observable<Medicine[]> {
    // TODO: return this.http.get<Medicine[]>(`${this.apiUrl}/medicines?name=${encodeURIComponent(name)}`);
    const results = MOCK_MEDICINES.filter(m =>
      m.medicineName.toLowerCase().includes(name.toLowerCase())
    );
    return of(results).pipe(delay(400));
  }

  searchPrescription(request: PrescriptionSearchRequest): Observable<PrescriptionSearchResult[]> {
    // TODO: return this.http.post<PrescriptionSearchResult[]>(`${this.apiUrl}/prescription`, request);
    return of([...MOCK_SEARCH_RESULTS]).pipe(delay(600));
  }
}
