import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PharmacyReview, NurseReview, PharmacyReviewRequest, NurseReviewRequest } from '../models';
import { MOCK_PHARMACY_REVIEWS, MOCK_PHARMACY_RATINGS, MOCK_NURSE_RATINGS } from '../mock/mock-data';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  addPharmacyReview(request: PharmacyReviewRequest): Observable<PharmacyReview> {
    // TODO: return this.http.post<PharmacyReview>(`${this.apiUrl}/pharmacy`, request);
    const newReview: any = { reviewId: Date.now(), ...request, createdAt: new Date().toISOString() };
    return of(newReview).pipe(delay(400));
  }

  getPharmacyReviews(pharmacyId: number): Observable<PharmacyReview[]> {
    // TODO: return this.http.get<PharmacyReview[]>(`${this.apiUrl}/pharmacy/${pharmacyId}`);
    const reviews = MOCK_PHARMACY_REVIEWS.filter(r => r.pharmacy.pharmacyId === pharmacyId);
    return of(reviews).pipe(delay(300));
  }

  addNurseReview(request: NurseReviewRequest): Observable<NurseReview> {
    // TODO: return this.http.post<NurseReview>(`${this.apiUrl}/nurse`, request);
    const newReview: any = { reviewId: Date.now(), ...request, createdAt: new Date().toISOString() };
    return of(newReview).pipe(delay(400));
  }

  getNurseReviews(nurseId: number): Observable<NurseReview[]> {
    // TODO: return this.http.get<NurseReview[]>(`${this.apiUrl}/nurse/${nurseId}`);
    return of([]).pipe(delay(300));
  }

  // Helper: Get average rating for a pharmacy (computed from reviews or mock)
  getPharmacyRating(pharmacyId: number): { average: number; total: number } {
    return MOCK_PHARMACY_RATINGS[pharmacyId] || { average: 0, total: 0 };
  }

  // Helper: Get average rating for a nurse
  getNurseRating(nurseId: number): { average: number; total: number } {
    return MOCK_NURSE_RATINGS[nurseId] || { average: 0, total: 0 };
  }
}
