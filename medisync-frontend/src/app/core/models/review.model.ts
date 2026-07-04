import { User } from './user.model';
import { Pharmacy } from './pharmacy.model';
import { Nurse } from './nurse.model';
import { NurseRequest } from './nurse-request.model';

export interface PharmacyReview {
  reviewId: number;
  user: User;
  pharmacy: Pharmacy;
  rating: number;
  reviewText?: string;
  createdAt: string;
}

export interface NurseReview {
  reviewId: number;
  user: User;
  nurse: Nurse;
  request: NurseRequest;
  rating: number;
  reviewText?: string;
  createdAt: string;
}

export interface PharmacyReviewRequest {
  pharmacyId: number;
  rating: number;
  reviewText?: string;
}

export interface NurseReviewRequest {
  nurseId: number;
  requestId: number;
  rating: number;
  reviewText?: string;
}
