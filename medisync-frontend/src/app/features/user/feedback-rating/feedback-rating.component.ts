import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StarRatingComponent } from '../../../shared/components/star-rating/star-rating.component';
import { ReviewService } from '../../../core/services/review.service';
import { PharmacyService } from '../../../core/services/pharmacy.service';
import { NurseRequestService } from '../../../core/services/nurse-request.service';
import { Pharmacy, PharmacyReview, NurseRequest } from '../../../core/models';

@Component({
  selector: 'app-feedback-rating',
  standalone: true,
  imports: [CommonModule, FormsModule, StarRatingComponent],
  templateUrl: './feedback-rating.component.html',
  styleUrl: './feedback-rating.component.scss'
})
export class FeedbackRatingComponent implements OnInit {
  selectedType: 'platform' | 'pharmacy' | 'nurse' = 'pharmacy';
  rating = 0;
  feedbackText = '';
  isSubmitting = false;
  submitted = false;

  // Pharmacy
  pharmacies: Pharmacy[] = [];
  selectedPharmacyId: number | null = null;

  // Nurse - only completed bookings
  completedBookings: NurseRequest[] = [];
  selectedBooking: NurseRequest | null = null;

  // Reviews
  recentReviews: PharmacyReview[] = [];
  allReviews: PharmacyReview[] = [];
  showAllReviews = false;

  constructor(
    private reviewService: ReviewService,
    private pharmacyService: PharmacyService,
    private nurseRequestService: NurseRequestService
  ) {}

  ngOnInit(): void {
    this.pharmacyService.getApprovedPharmacies().subscribe(p => {
      this.pharmacies = p;
      this.loadReviews();
    });
    this.loadCompletedBookings();
  }

  private loadCompletedBookings(): void {
    this.nurseRequestService.getMyRequests().subscribe(requests => {
      this.completedBookings = requests.filter(r => r.requestStatus === 'completed');
    });
  }

  private loadReviews(): void {
    // Load reviews from the first pharmacy by default
    if (this.pharmacies.length > 0) {
      this.reviewService.getPharmacyReviews(this.pharmacies[0].pharmacyId, { page: 0, size: 20 }).subscribe(page => {
        this.allReviews = page.content;
        this.recentReviews = this.allReviews.slice(0, 3);
      });
    }
  }

  selectType(type: 'platform' | 'pharmacy' | 'nurse'): void {
    this.selectedType = type;
    this.resetForm();

    // Load relevant reviews
    if (type === 'pharmacy' && this.selectedPharmacyId) {
      this.onPharmacySelected();
    } else {
      this.recentReviews = this.allReviews.slice(0, 3);
    }
  }

  // Pharmacy selection
  onPharmacySelected(): void {
    if (this.selectedPharmacyId) {
      this.reviewService.getPharmacyReviews(this.selectedPharmacyId).subscribe(page => {
        this.recentReviews = page.content.slice(0, this.showAllReviews ? 20 : 3);
      });
    }
  }

  // Nurse booking selection
  selectBooking(booking: NurseRequest): void {
    this.selectedBooking = booking;
  }

  // Can show rating form?
  canShowRating(): boolean {
    if (this.selectedType === 'platform') return true;
    if (this.selectedType === 'pharmacy') return this.selectedPharmacyId !== null;
    if (this.selectedType === 'nurse') return this.selectedBooking !== null;
    return false;
  }

  onRatingChange(value: number): void {
    this.rating = value;
  }

  getRatingLabel(): string {
    switch (this.rating) {
      case 1: return 'Poor';
      case 2: return 'Below Average';
      case 3: return 'Average';
      case 4: return 'Good';
      case 5: return 'Excellent!';
      default: return '';
    }
  }

  submitReview(): void {
    if (this.rating === 0) return;
    this.isSubmitting = true;

    if (this.selectedType === 'pharmacy' && this.selectedPharmacyId) {
      this.reviewService.addPharmacyReview({
        pharmacyId: this.selectedPharmacyId,
        rating: this.rating,
        reviewText: this.feedbackText
      }).subscribe(() => {
        this.isSubmitting = false;
        this.submitted = true;
      });
    } else if (this.selectedType === 'nurse' && this.selectedBooking) {
      this.reviewService.addNurseReview({
        nurseId: this.selectedBooking.nurse.nurseId,
        requestId: this.selectedBooking.requestId,
        rating: this.rating,
        reviewText: this.feedbackText
      }).subscribe(() => {
        this.isSubmitting = false;
        this.submitted = true;
      });
    } else {
      // Platform review (mock)
      setTimeout(() => {
        this.isSubmitting = false;
        this.submitted = true;
      }, 500);
    }
  }

  toggleAllReviews(): void {
    this.showAllReviews = !this.showAllReviews;
    if (this.showAllReviews) {
      this.recentReviews = this.allReviews;
    } else {
      this.recentReviews = this.allReviews.slice(0, 3);
    }
  }

  resetForm(): void {
    this.rating = 0;
    this.feedbackText = '';
    this.submitted = false;
    this.selectedBooking = null;
  }
}
