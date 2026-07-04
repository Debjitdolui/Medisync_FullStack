import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PharmacyReview, NurseReview, PharmacyReviewRequest, NurseReviewRequest, Page, PageRequest } from '../models';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  addPharmacyReview(request: PharmacyReviewRequest): Observable<PharmacyReview> {
    return this.http.post<PharmacyReview>(`${this.apiUrl}/pharmacy`, request);
  }

  getPharmacyReviews(pharmacyId: number, pageRequest?: PageRequest): Observable<Page<PharmacyReview>> {
    const pr = pageRequest || { page: 0, size: 20 };
    let params = new HttpParams()
      .set('page', pr.page.toString())
      .set('size', pr.size.toString());
    if (pr.sort) params = params.set('sort', pr.sort);
    return this.http.get<Page<PharmacyReview>>(`${this.apiUrl}/pharmacy/${pharmacyId}`, { params });
  }

  addNurseReview(request: NurseReviewRequest): Observable<NurseReview> {
    return this.http.post<NurseReview>(`${this.apiUrl}/nurse`, request);
  }

  getNurseReviews(nurseId: number, pageRequest?: PageRequest): Observable<Page<NurseReview>> {
    const pr = pageRequest || { page: 0, size: 20 };
    let params = new HttpParams()
      .set('page', pr.page.toString())
      .set('size', pr.size.toString());
    if (pr.sort) params = params.set('sort', pr.sort);
    return this.http.get<Page<NurseReview>>(`${this.apiUrl}/nurse/${nurseId}`, { params });
  }
}
